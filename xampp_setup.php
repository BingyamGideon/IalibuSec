<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ialibu School Management - XAMPP Setup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #1e40af;
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .status {
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .step {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #1e40af;
            margin: 15px 0;
        }
        .code {
            background: #f1f3f4;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
        }
        button {
            background: #1e40af;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏫 Ialibu Secondary School Management System</h1>
            <p>XAMPP Database Setup & Connection Test</p>
        </div>

        <?php
        function testDatabaseConnection() {
            try {
                $host = 'localhost';
                $dbname = 'ialibu_school';
                $username = 'root';
                $password = '';
                
                $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                
                // Test query
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
                $result = $stmt->fetch();
                
                return [
                    'success' => true,
                    'message' => 'Database connected successfully!',
                    'user_count' => $result['count']
                ];
            } catch (PDOException $e) {
                return [
                    'success' => false,
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ];
            }
        }

        function getDatabaseStats() {
            try {
                $host = 'localhost';
                $dbname = 'ialibu_school';
                $username = 'root';
                $password = '';
                
                $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
                
                $stats = [];
                $tables = ['users', 'students', 'staff', 'attendance', 'grades', 'finance'];
                
                foreach ($tables as $table) {
                    try {
                        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
                        $result = $stmt->fetch();
                        $stats[$table] = $result['count'];
                    } catch (PDOException $e) {
                        $stats[$table] = 'Table not found';
                    }
                }
                
                return $stats;
            } catch (PDOException $e) {
                return [];
            }
        }

        // Test connection if requested
        $showTest = isset($_GET['test']);
        if ($showTest) {
            $connectionTest = testDatabaseConnection();
            $stats = getDatabaseStats();
        }
        ?>

        <h2>📋 Setup Instructions</h2>
        
        <div class="step">
            <h3>Step 1: Copy Files to XAMPP</h3>
            <p>Copy this entire project folder to your XAMPP htdocs directory:</p>
            <div class="code">C:\xampp\htdocs\school-management\</div>
        </div>

        <div class="step">
            <h3>Step 2: Import Database</h3>
            <p>Import the database using phpMyAdmin:</p>
            <ol>
                <li>Open <a href="http://localhost/phpmyadmin" target="_blank">phpMyAdmin</a></li>
                <li>Click "Import" tab</li>
                <li>Choose file: <code>xampp_database_import.sql</code></li>
                <li>Click "Go"</li>
            </ol>
        </div>

        <div class="step">
            <h3>Step 3: Test Connection</h3>
            <p>Click the button below to test your database connection:</p>
            <button onclick="window.location.href='?test=1'">Test Database Connection</button>
        </div>

        <?php if ($showTest): ?>
        <h2>🔍 Connection Test Results</h2>
        
        <?php if ($connectionTest['success']): ?>
            <div class="status success">
                <h3>✅ Database Connection Successful!</h3>
                <p><?php echo $connectionTest['message']; ?></p>
                <p>Users in database: <?php echo $connectionTest['user_count']; ?></p>
            </div>
            
            <h3>📊 Database Statistics</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Table</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Records</th>
                </tr>
                <?php foreach ($stats as $table => $count): ?>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><?php echo ucfirst($table); ?></td>
                    <td style="padding: 10px; border: 1px solid #ddd;"><?php echo $count; ?></td>
                </tr>
                <?php endforeach; ?>
            </table>
            
            <div class="status info">
                <h3>🎯 Next Steps</h3>
                <p>Your database is ready! You can now:</p>
                <ul>
                    <li>Access the application at: <a href="http://localhost/school-management/">http://localhost/school-management/</a></li>
                    <li>Login with: <strong>admin / admin123</strong> or <strong>staff / staff123</strong></li>
                    <li>Test the API endpoints in the <code>server/</code> folder</li>
                </ul>
            </div>
            
        <?php else: ?>
            <div class="status error">
                <h3>❌ Database Connection Failed</h3>
                <p><?php echo $connectionTest['message']; ?></p>
            </div>
            
            <div class="status warning">
                <h3>🔧 Troubleshooting</h3>
                <ul>
                    <li><strong>Check XAMPP:</strong> Make sure MySQL is running in XAMPP Control Panel</li>
                    <li><strong>Import Database:</strong> Make sure you've imported <code>xampp_database_import.sql</code></li>
                    <li><strong>Database Name:</strong> Verify the database name is <code>ialibu_school</code></li>
                    <li><strong>Permissions:</strong> Check if MySQL user 'root' has access</li>
                </ul>
            </div>
        <?php endif; ?>
        <?php endif; ?>

        <h2>🔑 Default Login Credentials</h2>
        <div class="status info">
            <h3>Admin Access</h3>
            <p><strong>Username:</strong> admin<br>
            <strong>Password:</strong> admin123</p>
            
            <h3>Staff Access</h3>
            <p><strong>Username:</strong> staff<br>
            <strong>Password:</strong> staff123</p>
        </div>

        <h2>📁 File Structure</h2>
        <div class="code">
school-management/
├── client/                 # React frontend application
���── server/                 # PHP backend API
│   ├── auth.php           # Authentication API
│   ├── database.php       # Database connection
│   └── students.php       # Student management API
├── database/              # Database files
│   └── unified_school_database.sql
├── xampp_database_import.sql    # XAMPP import file
└── xampp_setup.php       # This setup file
        </div>

        <h2>🌐 API Endpoints</h2>
        <div class="status info">
            <p>Once setup is complete, you can test these API endpoints:</p>
            <ul>
                <li><a href="server/database.php?action=test" target="_blank">Database Test</a></li>
                <li><a href="server/database.php?action=stats" target="_blank">Database Stats</a></li>
                <li><a href="server/auth.php" target="_blank">Authentication API Info</a></li>
            </ul>
        </div>

        <div class="status success" style="margin-top: 30px;">
            <h3>🚀 Ready to Use!</h3>
            <p>Once your database connection test passes, your Ialibu Secondary School Management System is ready to use with XAMPP!</p>
        </div>
    </div>
</body>
</html>
