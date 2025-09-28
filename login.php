<?php
require_once 'config/database.php';

// If user is already logged in, redirect to appropriate dashboard
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['user_type'] === 'admin') {
        header('Location: admin_dashboard.php');
    } else {
        header('Location: staff_dashboard.php');
    }
    exit();
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['login'])) {
        // Login logic
        $username = trim($_POST['username']);
        $password = $_POST['password'];
        
        if (empty($username) || empty($password)) {
            $error = 'Please fill in all fields';
        } else {
            try {
                $stmt = $pdo->prepare("SELECT id, username, password, user_type, full_name, email FROM users WHERE username = ?");
                $stmt->execute([$username]);
                $user = $stmt->fetch();
                
                if ($user && password_verify($password, $user['password'])) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['user_type'] = $user['user_type'];
                    $_SESSION['full_name'] = $user['full_name'];
                    $_SESSION['email'] = $user['email'];
                    
                    if ($user['user_type'] === 'admin') {
                        header('Location: admin_dashboard.php');
                    } else {
                        header('Location: staff_dashboard.php');
                    }
                    exit();
                } else {
                    $error = 'Invalid username or password';
                }
            } catch (PDOException $e) {
                $error = 'Database error occurred';
            }
        }
    } elseif (isset($_POST['register'])) {
        // Registration logic
        $username = trim($_POST['username']);
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];
        $full_name = trim($_POST['full_name']);
        $email = trim($_POST['email']);
        $user_type = $_POST['user_type'];
        
        if (empty($username) || empty($password) || empty($confirm_password) || empty($full_name)) {
            $error = 'Please fill in all required fields';
        } elseif ($password !== $confirm_password) {
            $error = 'Passwords do not match';
        } elseif (strlen($password) < 6) {
            $error = 'Password must be at least 6 characters long';
        } else {
            try {
                // Check if username already exists
                $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                $stmt->execute([$username]);
                
                if ($stmt->fetch()) {
                    $error = 'Username already exists';
                } else {
                    // Create new user
                    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                    $stmt = $pdo->prepare("INSERT INTO users (username, password, user_type, full_name, email) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$username, $hashed_password, $user_type, $full_name, $email]);
                    
                    $success = 'Account created successfully! You can now login.';
                }
            } catch (PDOException $e) {
                $error = 'Database error occurred';
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ialibu Secondary School - Login</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <!-- Welcome Section -->
            <div class="auth-welcome">
                <h1>Ialibu Secondary School</h1>
                <h2>Student & Staff Information System</h2>
                <p>Welcome to our comprehensive student information system. Manage students, track attendance, monitor grades, and handle financial records efficiently.</p>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <h4>Admin Access:</h4>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Students, Attendance, Grades</li>
                        <li>Finance Management</li>
                        <li>Staff Administration</li>
                        <li>Comprehensive Reports</li>
                    </ul>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px;">
                    <h4>Staff Access:</h4>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Students (assigned classes)</li>
                        <li>Attendance Tracking</li>
                        <li>Grade Management</li>
                        <li>Student Reports</li>
                    </ul>
                </div>
            </div>

            <!-- Auth Form Section -->
            <div class="auth-form">
                <h2 id="form-title">School Login</h2>
                <p id="form-subtitle">Sign in to access your dashboard</p>

                <?php if ($error): ?>
                    <div style="background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div style="background: #dcfce7; color: #16a34a; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                        <?php echo htmlspecialchars($success); ?>
                    </div>
                <?php endif; ?>

                <!-- Login Form -->
                <form id="login-form" method="POST" style="display: block;">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" class="form-control" required>
                    </div>

                    <button type="submit" name="login" class="btn w-100">Login</button>
                </form>

                <!-- Registration Form -->
                <form id="register-form" method="POST" style="display: none;">
                    <div class="form-group">
                        <label for="reg_username">Username</label>
                        <input type="text" id="reg_username" name="username" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="full_name">Full Name</label>
                        <input type="text" id="full_name" name="full_name" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" class="form-control">
                    </div>

                    <div class="form-group">
                        <label for="reg_password">Password</label>
                        <input type="password" id="reg_password" name="password" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="confirm_password">Confirm Password</label>
                        <input type="password" id="confirm_password" name="confirm_password" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="user_type">User Type</label>
                        <select id="user_type" name="user_type" class="form-control" required>
                            <option value="staff">Staff Member</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <button type="submit" name="register" class="btn w-100">Register</button>
                </form>

                  <!-- Demo Credentials -->
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="margin-bottom: 10px; color: #374151;">Demo Credentials:</h4>
                    <div style="font-size: 14px; color: #6b7280;">
                        <div><strong>Admin:</strong> admin / admin123</div>
                        <div><strong>Staff:</strong> staff / staff123</div>
                    </div>
                </div>

                <!-- Switch Form -->
                <div class="text-center mt-4">
                    <span id="switch-text">Don't have an account?</span>
                    <a href="#" id="switch-link" style="color: var(--primary); font-weight: 600; text-decoration: none;">Register here</a>
                </div>
            </div>
        </div>
    </div>

              

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const switchLink = document.getElementById('switch-link');
            const switchText = document.getElementById('switch-text');
            const formTitle = document.getElementById('form-title');
            const formSubtitle = document.getElementById('form-subtitle');
            
            let isLogin = true;

            switchLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (isLogin) {
                    // Switch to register
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                    formTitle.textContent = 'Create Account';
                    formSubtitle.textContent = 'Fill in your details to register';
                    switchText.textContent = 'Already have an account?';
                    switchLink.textContent = 'Login here';
                    isLogin = false;
                } else {
                    // Switch to login
                    registerForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    formTitle.textContent = 'School Login';
                    formSubtitle.textContent = 'Sign in to access your dashboard';
                    switchText.textContent = "Don't have an account?";
                    switchLink.textContent = 'Register here';
                    isLogin = true;
                }
            });
        });
    </script>
</body>
</html>
