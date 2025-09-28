<?php
require_once 'database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class UsersAPI {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getAllUsers() {
        try {
            $stmt = $this->db->prepare("
                SELECT id, username, email, first_name, last_name, user_type, 
                       department, position, is_active, permissions, assigned_classes, assigned_subjects, allow_cross_class, registration_token, registration_expires, must_set_password, last_login,
                       created_at, updated_at
                FROM users 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll();

            // Parse permissions and assignments for each user
            foreach ($users as &$user) {
                if ($user['permissions']) {
                    $user['permissions'] = json_decode($user['permissions'], true);
                }
                if (isset($user['assigned_classes']) && $user['assigned_classes']) {
                    $user['assigned_classes'] = json_decode($user['assigned_classes'], true);
                } else {
                    $user['assigned_classes'] = [];
                }
                if (isset($user['assigned_subjects']) && $user['assigned_subjects']) {
                    $user['assigned_subjects'] = json_decode($user['assigned_subjects'], true);
                } else {
                    $user['assigned_subjects'] = [];
                }
                $user['allow_cross_class'] = isset($user['allow_cross_class']) ? (bool)$user['allow_cross_class'] : false;
            }

            return [
                'success' => true,
                'users' => $users
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error while fetching users',
                'error' => $e->getMessage()
            ];
        }
    }

    public function addUser($userData) {
        try {
            $username = $userData['username'] ?? '';
            $email = $userData['email'] ?? '';
            $password = $userData['password'] ?? '';
            $firstName = $userData['firstName'] ?? '';
            $lastName = $userData['lastName'] ?? '';
            $userType = $userData['userType'] ?? 'staff';
            $department = $userData['department'] ?? '';
            $position = $userData['position'] ?? '';
            $assignedClasses = $userData['assignedClasses'] ?? [];
            $assignedSubjects = $userData['assignedSubjects'] ?? [];
            $allowCrossClass = isset($userData['allowCrossClass']) ? (bool)$userData['allowCrossClass'] : false;

            // Validate required fields (password optional; token flow if omitted)
            if (empty($username) || empty($email) || empty($firstName) || empty($lastName)) {
                return [
                    'success' => false,
                    'message' => 'All required fields must be filled'
                ];
            }

            // Check if username or email already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Username or email already exists'
                ];
            }

            // Determine password and registration token
            $registrationToken = null;
            $registrationExpires = null;
            $mustSetPassword = 0;
            if (!empty($password)) {
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            } else {
                $passwordHash = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
                $registrationToken = bin2hex(random_bytes(16));
                $registrationExpires = date('Y-m-d H:i:s', strtotime('+7 days'));
                $mustSetPassword = 1;
            }

            // Set permissions based on user type
            $permissions = json_encode($userType === 'admin' ? ['all'] : ['students', 'attendance', 'grades', 'reports']);

            // Insert new user
            $stmt = $this->db->prepare("
                INSERT INTO users (username, email, password_hash, first_name, last_name,
                                 user_type, department, position, permissions, assigned_classes, assigned_subjects, allow_cross_class,
                                 registration_token, registration_expires, must_set_password)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $username, $email, $passwordHash, $firstName, $lastName,
                $userType, $department, $position, $permissions,
                json_encode($assignedClasses), json_encode($assignedSubjects), $allowCrossClass ? 1 : 0,
                $registrationToken, $registrationExpires, $mustSetPassword
            ]);

            $userId = $this->db->lastInsertId();

            return [
                'success' => true,
                'message' => 'User added successfully',
                'user_id' => $userId,
                'registrationToken' => $registrationToken
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error while adding user',
                'error' => $e->getMessage()
            ];
        }
    }

    public function inviteUser($userId) {
        try {
            // Ensure user exists and is active
            $stmt = $this->db->prepare("SELECT id FROM users WHERE id = ? AND is_active = 1");
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                return [ 'success' => false, 'message' => 'User not found or inactive' ];
            }
            $token = bin2hex(random_bytes(16));
            $expires = date('Y-m-d H:i:s', strtotime('+7 days'));
            $upd = $this->db->prepare("UPDATE users SET registration_token = ?, registration_expires = ?, must_set_password = 1 WHERE id = ?");
            $ok = $upd->execute([$token, $expires, $userId]);
            return [ 'success' => $ok, 'registrationToken' => $token, 'expires' => $expires ];
        } catch (PDOException $e) {
            return [ 'success' => false, 'message' => 'Database error while creating invite' ];
        }
    }

    public function updateUser($userId, $userData) {
        try {
            $username = $userData['username'] ?? '';
            $email = $userData['email'] ?? '';
            $firstName = $userData['firstName'] ?? '';
            $lastName = $userData['lastName'] ?? '';
            $userType = $userData['userType'] ?? 'staff';
            $department = $userData['department'] ?? '';
            $position = $userData['position'] ?? '';
            $isActive = isset($userData['isActive']) ? (bool)$userData['isActive'] : true;
            $assignedClasses = $userData['assignedClasses'] ?? null;
            $assignedSubjects = $userData['assignedSubjects'] ?? null;
            $allowCrossClass = isset($userData['allowCrossClass']) ? (bool)$userData['allowCrossClass'] : null;

            // Validate required fields
            if (empty($username) || empty($email) || empty($firstName) || empty($lastName)) {
                return [
                    'success' => false,
                    'message' => 'All required fields must be filled'
                ];
            }

            // Check if username or email already exists for other users
            $stmt = $this->db->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
            $stmt->execute([$username, $email, $userId]);
            if ($stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Username or email already exists for another user'
                ];
            }

            // Set permissions based on user type
            $permissions = json_encode($userType === 'admin' ? ['all'] : ['students', 'attendance', 'grades', 'reports']);

            // Update user
            $stmt = $this->db->prepare("
                UPDATE users 
                SET username = ?, email = ?, first_name = ?, last_name = ?, 
                    user_type = ?, department = ?, position = ?, permissions = ?,
                    assigned_classes = ?, assigned_subjects = ?, allow_cross_class = ?,
                    is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            $stmt->execute([
                $username, $email, $firstName, $lastName,
                $userType, $department, $position, $permissions,
                json_encode($assignedClasses ?? []), json_encode($assignedSubjects ?? []), ($allowCrossClass === null ? 0 : ($allowCrossClass ? 1 : 0)),
                $isActive, $userId
            ]);

            return [
                'success' => true,
                'message' => 'User updated successfully'
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error while updating user',
                'error' => $e->getMessage()
            ];
        }
    }

    public function deleteUser($userId) {
        try {
            // Check if user exists
            $stmt = $this->db->prepare("SELECT username FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }

            // Don't allow deletion of admin user
            if ($user['username'] === 'admin') {
                return [
                    'success' => false,
                    'message' => 'Cannot delete the admin user'
                ];
            }

            // Soft delete by setting is_active to false
            $stmt = $this->db->prepare("
                UPDATE users 
                SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$userId]);

            return [
                'success' => true,
                'message' => 'User deleted successfully'
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error while deleting user',
                'error' => $e->getMessage()
            ];
        }
    }

    public function changePassword($userId, $newPassword) {
        try {
            if (strlen($newPassword) < 6) {
                return [
                    'success' => false,
                    'message' => 'Password must be at least 6 characters long'
                ];
            }

            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

            $stmt = $this->db->prepare("
                UPDATE users 
                SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute([$passwordHash, $userId]);

            return [
                'success' => true,
                'message' => 'Password changed successfully'
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error while changing password',
                'error' => $e->getMessage()
            ];
        }
    }
}

// Handle API requests
$usersAPI = new UsersAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'list':
                echo json_encode($usersAPI->getAllUsers());
                break;
                
            default:
                echo json_encode([
                    'message' => 'Users API',
                    'available_endpoints' => [
                        'GET /users.php?action=list' => 'Get all users',
                        'POST /users.php?action=add' => 'Add new user',
                        'PUT /users.php?action=update&id=X' => 'Update user',
                        'DELETE /users.php?action=delete&id=X' => 'Delete user',
                        'PUT /users.php?action=change_password&id=X' => 'Change password'
                    ]
                ]);
        }
        break;
        
    case 'POST':
        switch ($action) {
            case 'add':
                echo json_encode($usersAPI->addUser($input));
                break;
            case 'invite':
                $userId = $_GET['id'] ?? '';
                if ($userId) {
                    echo json_encode($usersAPI->inviteUser($userId));
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'User ID required'
                    ]);
                }
                break;
                
            default:
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action for POST request'
                ]);
        }
        break;
        
    case 'PUT':
        switch ($action) {
            case 'update':
                $userId = $_GET['id'] ?? '';
                if ($userId) {
                    echo json_encode($usersAPI->updateUser($userId, $input));
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'User ID required'
                    ]);
                }
                break;
                
            case 'change_password':
                $userId = $_GET['id'] ?? '';
                $newPassword = $input['password'] ?? '';
                if ($userId && $newPassword) {
                    echo json_encode($usersAPI->changePassword($userId, $newPassword));
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'User ID and password required'
                    ]);
                }
                break;
                
            default:
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action for PUT request'
                ]);
        }
        break;
        
    case 'DELETE':
        switch ($action) {
            case 'delete':
                $userId = $_GET['id'] ?? '';
                if ($userId) {
                    echo json_encode($usersAPI->deleteUser($userId));
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'User ID required'
                    ]);
                }
                break;
                
            default:
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action for DELETE request'
                ]);
        }
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
}
?>
