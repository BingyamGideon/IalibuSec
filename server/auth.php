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

class AuthAPI {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function login($credentials) {
        try {
            $username = $credentials['username'] ?? '';
            $password = $credentials['password'] ?? '';

            if (empty($username) || empty($password)) {
                return [
                    'success' => false,
                    'message' => 'Username and password are required'
                ];
            }

            // Query user from database
            $stmt = $this->db->prepare("
                SELECT id, username, email, first_name, last_name, user_type,
                       department, position, is_active, permissions, assigned_classes, assigned_subjects, allow_cross_class, password_hash, must_set_password
                FROM users 
                WHERE username = ? AND is_active = 1
            ");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Invalid username or password'
                ];
            }

            // Require completion of registration if flagged
            if (!empty($user['must_set_password'])) {
                return [
                    'success' => false,
                    'message' => 'Account not activated. Please complete registration with your code.'
                ];
            }

            // For demo purposes, check against default passwords
            // In production, use password_verify($password, $user['password_hash'])
            $validPassword = false;
            if ($username === 'admin' && $password === 'admin123') {
                $validPassword = true;
            } elseif ($username === 'staff' && $password === 'staff123') {
                $validPassword = true;
            } else {
                // Check hashed password (if implemented)
                $validPassword = password_verify($password, $user['password_hash']);
            }

            if (!$validPassword) {
                return [
                    'success' => false,
                    'message' => 'Invalid username or password'
                ];
            }

            // Update last login
            $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);

            // Remove password from response
            unset($user['password_hash']);

            // Parse JSON fields
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

            return [
                'success' => true,
                'message' => 'Login successful',
                'user' => $user,
                'token' => base64_encode($user['id'] . ':' . time()) // Simple token for demo
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error during login',
                'error' => $e->getMessage()
            ];
        }
    }

    public function register($userData) {
        try {
            $username = $userData['username'] ?? '';
            $email = $userData['email'] ?? '';
            $password = $userData['password'] ?? '';
            $firstName = $userData['firstName'] ?? '';
            $lastName = $userData['lastName'] ?? '';
            $userType = $userData['userType'] ?? 'staff';

            // Validate required fields
            if (empty($username) || empty($email) || empty($password) || empty($firstName) || empty($lastName)) {
                return [
                    'success' => false,
                    'message' => 'All fields are required'
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

            // Hash password
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);

            // Insert new user
            $stmt = $this->db->prepare("
                INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, permissions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $permissions = json_encode($userType === 'admin' ? ['all'] : ['students', 'attendance', 'grades', 'reports']);
            
            $stmt->execute([
                $username, $email, $passwordHash, $firstName, $lastName, $userType, $permissions
            ]);

            $userId = $this->db->lastInsertId();

            return [
                'success' => true,
                'message' => 'User registered successfully',
                'user_id' => $userId
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error during registration',
                'error' => $e->getMessage()
            ];
        }
    }

    public function getUserProfile($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, username, email, first_name, last_name, user_type,
                       department, position, is_active, permissions, assigned_classes, assigned_subjects, allow_cross_class
                FROM users
                WHERE id = ? AND is_active = 1
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found'
                ];
            }

            // Parse JSON fields
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

            return [
                'success' => true,
                'user' => $user
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database error',
                'error' => $e->getMessage()
            ];
        }
    }
}

// Handle API requests
$authAPI = new AuthAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'login':
                echo json_encode($authAPI->login($input));
                break;
                
            case 'register':
                echo json_encode($authAPI->register($input));
                break;
            case 'complete_registration':
                try {
                    $username = $input['username'] ?? '';
                    $token = $input['token'] ?? '';
                    $password = $input['password'] ?? '';
                    if (empty($username) || empty($token) || empty($password)) {
                        echo json_encode(['success' => false, 'message' => 'Username, token, and password are required']);
                        break;
                    }
                    $db = new Database();
                    $pdo = $db->getConnection();
                    $stmt = $pdo->prepare("SELECT id, registration_token, registration_expires FROM users WHERE username = ? AND is_active = 1");
                    $stmt->execute([$username]);
                    $u = $stmt->fetch();
                    if (!$u || empty($u['registration_token']) || $u['registration_token'] !== $token) {
                        echo json_encode(['success' => false, 'message' => 'Invalid registration token']);
                        break;
                    }
                    if (!empty($u['registration_expires']) && strtotime($u['registration_expires']) < time()) {
                        echo json_encode(['success' => false, 'message' => 'Registration token expired']);
                        break;
                    }
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $upd = $pdo->prepare("UPDATE users SET password_hash = ?, registration_token = NULL, registration_expires = NULL, must_set_password = 0 WHERE id = ?");
                    $ok = $upd->execute([$hash, $u['id']]);
                    echo json_encode(['success' => $ok, 'message' => $ok ? 'Registration completed' : 'Failed to complete registration']);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Server error completing registration']);
                }
                break;
                
            default:
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid action for POST request',
                    'available_actions' => ['login', 'register']
                ]);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'profile':
                $userId = $_GET['user_id'] ?? '';
                if ($userId) {
                    echo json_encode($authAPI->getUserProfile($userId));
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'User ID required'
                    ]);
                }
                break;
                
            default:
                echo json_encode([
                    'message' => 'Ialibu School Management Auth API',
                    'available_endpoints' => [
                        'POST /auth.php?action=login' => 'User login',
                        'POST /auth.php?action=register' => 'User registration',
                        'GET /auth.php?action=profile&user_id=X' => 'Get user profile'
                    ]
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
