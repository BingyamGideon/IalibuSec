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

class StudentsAPI {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getAllStudents($filters = []) {
        try {
            $sql = "SELECT * FROM students WHERE is_active = 1";
            $params = [];

            // Add filters
            if (!empty($filters['grade'])) {
                $sql .= " AND grade = ?";
                $params[] = $filters['grade'];
            }

            if (!empty($filters['class'])) {
                $sql .= " AND class = ?";
                $params[] = $filters['class'];
            }

            if (!empty($filters['search'])) {
                $sql .= " AND (name LIKE ? OR student_id LIKE ?)";
                $searchTerm = "%{$filters['search']}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            $sql .= " ORDER BY grade, class, name";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $students = $stmt->fetchAll();

            // Parse JSON fields
            foreach ($students as &$student) {
                if ($student['subjects']) {
                    $student['subjects'] = json_decode($student['subjects'], true);
                }
            }

            return [
                'success' => true,
                'data' => $students,
                'count' => count($students)
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage()
            ];
        }
    }

    public function getStudent($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM students WHERE id = ? AND is_active = 1");
            $stmt->execute([$id]);
            $student = $stmt->fetch();

            if (!$student) {
                return [
                    'success' => false,
                    'message' => 'Student not found'
                ];
            }

            // Parse JSON fields
            if ($student['subjects']) {
                $student['subjects'] = json_decode($student['subjects'], true);
            }

            return [
                'success' => true,
                'data' => $student
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch student',
                'error' => $e->getMessage()
            ];
        }
    }

    public function addStudent($studentData) {
        try {
            // Validate required fields
            $required = ['name', 'grade', 'class', 'subjects', 'date_of_birth', 'gender', 'address'];
            foreach ($required as $field) {
                if (empty($studentData[$field])) {
                    return [
                        'success' => false,
                        'message' => "Field '{$field}' is required"
                    ];
                }
            }

            // Generate student ID if not provided
            if (empty($studentData['student_id'])) {
                $year = date('Y');
                $stmt = $this->db->query("SELECT COUNT(*) + 1 as next_num FROM students WHERE student_id LIKE 'ISS{$year}%'");
                $result = $stmt->fetch();
                $studentData['student_id'] = "ISS{$year}" . str_pad($result['next_num'], 3, '0', STR_PAD_LEFT);
            }

            // Prepare SQL
            $sql = "INSERT INTO students (
                name, grade, class, subjects, date_of_birth, gender, address,
                email, phone, guardian_name, guardian_phone, student_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $params = [
                $studentData['name'],
                $studentData['grade'],
                $studentData['class'],
                json_encode($studentData['subjects']),
                $studentData['date_of_birth'],
                $studentData['gender'],
                $studentData['address'],
                $studentData['email'] ?? null,
                $studentData['phone'] ?? null,
                $studentData['guardian_name'] ?? null,
                $studentData['guardian_phone'] ?? null,
                $studentData['student_id']
            ];

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $studentId = $this->db->lastInsertId();

            return [
                'success' => true,
                'message' => 'Student added successfully',
                'student_id' => $studentId,
                'data' => $this->getStudent($studentId)['data'] ?? null
            ];

        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                return [
                    'success' => false,
                    'message' => 'Student ID already exists'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to add student',
                'error' => $e->getMessage()
            ];
        }
    }

    public function updateStudent($id, $studentData) {
        try {
            // Check if student exists
            $student = $this->getStudent($id);
            if (!$student['success']) {
                return $student;
            }

            // Build update query dynamically
            $allowedFields = [
                'name', 'grade', 'class', 'subjects', 'date_of_birth', 'gender', 
                'address', 'email', 'phone', 'guardian_name', 'guardian_phone'
            ];

            $setClause = [];
            $params = [];

            foreach ($allowedFields as $field) {
                if (isset($studentData[$field])) {
                    $setClause[] = "{$field} = ?";
                    if ($field === 'subjects' && is_array($studentData[$field])) {
                        $params[] = json_encode($studentData[$field]);
                    } else {
                        $params[] = $studentData[$field];
                    }
                }
            }

            if (empty($setClause)) {
                return [
                    'success' => false,
                    'message' => 'No valid fields to update'
                ];
            }

            $setClause[] = "updated_at = CURRENT_TIMESTAMP";
            $params[] = $id;

            $sql = "UPDATE students SET " . implode(', ', $setClause) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return [
                'success' => true,
                'message' => 'Student updated successfully',
                'data' => $this->getStudent($id)['data'] ?? null
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ];
        }
    }

    public function deleteStudent($id) {
        try {
            // Soft delete - set is_active to false
            $stmt = $this->db->prepare("UPDATE students SET is_active = 0 WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Student not found'
                ];
            }

            return [
                'success' => true,
                'message' => 'Student deleted successfully'
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete student',
                'error' => $e->getMessage()
            ];
        }
    }

    public function getStudentStats() {
        try {
            $stats = [];

            // Total active students
            $stmt = $this->db->query("SELECT COUNT(*) as total FROM students WHERE is_active = 1");
            $stats['total_students'] = $stmt->fetch()['total'];

            // Students by grade
            $stmt = $this->db->query("
                SELECT grade, COUNT(*) as count 
                FROM students 
                WHERE is_active = 1 
                GROUP BY grade 
                ORDER BY grade
            ");
            $stats['by_grade'] = $stmt->fetchAll();

            // Students by gender
            $stmt = $this->db->query("
                SELECT gender, COUNT(*) as count 
                FROM students 
                WHERE is_active = 1 
                GROUP BY gender
            ");
            $stats['by_gender'] = $stmt->fetchAll();

            // Recent additions
            $stmt = $this->db->query("
                SELECT COUNT(*) as count 
                FROM students 
                WHERE is_active = 1 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            $stats['recent_additions'] = $stmt->fetch()['count'];

            return [
                'success' => true,
                'data' => $stats
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ];
        }
    }
}

// Handle API requests
$studentsAPI = new StudentsAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Get JSON input for POST/PUT requests
$input = [];
if (in_array($method, ['POST', 'PUT'])) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'list':
                $filters = array_filter([
                    'grade' => $_GET['grade'] ?? '',
                    'class' => $_GET['class'] ?? '',
                    'search' => $_GET['search'] ?? ''
                ]);
                echo json_encode($studentsAPI->getAllStudents($filters));
                break;

            case 'get':
                $id = $_GET['id'] ?? '';
                if ($id) {
                    echo json_encode($studentsAPI->getStudent($id));
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Student ID required'
                    ]);
                }
                break;

            case 'stats':
                echo json_encode($studentsAPI->getStudentStats());
                break;

            default:
                echo json_encode([
                    'message' => 'Ialibu School Management Students API',
                    'available_endpoints' => [
                        'GET /students.php?action=list' => 'Get all students (with optional filters)',
                        'GET /students.php?action=get&id=X' => 'Get single student',
                        'GET /students.php?action=stats' => 'Get student statistics',
                        'POST /students.php?action=add' => 'Add new student',
                        'PUT /students.php?action=update&id=X' => 'Update student',
                        'DELETE /students.php?action=delete&id=X' => 'Delete student'
                    ],
                    'filters' => [
                        'grade' => 'Filter by grade (Grade 9, Grade 10, etc.)',
                        'class' => 'Filter by class (9A, 10B, etc.)',
                        'search' => 'Search by name or student ID'
                    ]
                ]);
        }
        break;

    case 'POST':
        if ($action === 'add') {
            echo json_encode($studentsAPI->addStudent($input));
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action for POST request'
            ]);
        }
        break;

    case 'PUT':
        if ($action === 'update') {
            $id = $_GET['id'] ?? '';
            if ($id) {
                echo json_encode($studentsAPI->updateStudent($id, $input));
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Student ID required'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action for PUT request'
            ]);
        }
        break;

    case 'DELETE':
        if ($action === 'delete') {
            $id = $_GET['id'] ?? '';
            if ($id) {
                echo json_encode($studentsAPI->deleteStudent($id));
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Student ID required'
                ]);
            }
        } else {
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
