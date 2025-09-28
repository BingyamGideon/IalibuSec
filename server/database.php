<?php
// Database connection for XAMPP MySQL
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class Database {
    private $host = 'localhost';
    private $port = '3306';
    private $dbname = 'ialibu_school';  // Use the database name from XAMPP import
    private $username = 'root';         // Default XAMPP MySQL username
    private $password = '';             // Default XAMPP MySQL password (empty)
    private $pdo;

    public function __construct() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            $this->ensureLatestSchema();
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection failed',
                'message' => $e->getMessage(),
                'details' => [
                    'host' => $this->host,
                    'port' => $this->port,
                    'database' => $this->dbname,
                    'suggestion' => 'Make sure XAMPP MySQL is running and database exists'
                ]
            ]);
            exit;
        }
    }

    private function ensureLatestSchema() {
        try {
            $stmts = [
                // Users table columns used by new features
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSON",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_classes JSON",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_subjects JSON",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS allow_cross_class BOOLEAN DEFAULT FALSE",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_token VARCHAR(64) NULL",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_expires TIMESTAMP NULL",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS must_set_password BOOLEAN DEFAULT FALSE",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL"
            ];
            foreach ($stmts as $sql) {
                try { $this->pdo->exec($sql); } catch (Throwable $ignore) { /* ignore if not supported or already exists */ }
            }
        } catch (Throwable $e) {
            // Silent fail to avoid breaking the app if ALTER privileges are missing
        }
    }

    public function getConnection() {
        return $this->pdo;
    }

    // Test database connection
    public function testConnection() {
        try {
            $stmt = $this->pdo->query("SELECT 1");
            return [
                'success' => true,
                'message' => 'Database connected successfully',
                'database' => $this->dbname
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Database connection test failed',
                'error' => $e->getMessage()
            ];
        }
    }

    // Get database statistics
    public function getStats() {
        try {
            $stats = [];
            
            // Get table counts
            $tables = ['students', 'users', 'staff', 'attendance', 'grades', 'finance'];
            foreach ($tables as $table) {
                $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM {$table}");
                $result = $stmt->fetch();
                $stats[$table] = $result['count'];
            }
            
            return [
                'success' => true,
                'stats' => $stats,
                'database' => $this->dbname
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

// Handle API requests
$database = new Database();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'test':
        echo json_encode($database->testConnection());
        break;
        
    case 'stats':
        echo json_encode($database->getStats());
        break;
        
    default:
        echo json_encode([
            'message' => 'Ialibu School Management API',
            'database' => 'Connected to XAMPP MySQL',
            'available_actions' => ['test', 'stats'],
            'usage' => [
                'test' => '?action=test',
                'stats' => '?action=stats'
            ]
        ]);
}
?>
