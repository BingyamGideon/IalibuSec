<?php
// Main entry point for XAMPP deployment
// This file serves the React application and handles initial routing

// Check if we're accessing the setup page
if (isset($_GET['setup']) || strpos($_SERVER['REQUEST_URI'], 'xampp_setup.php') !== false) {
    include 'xampp_setup.php';
    exit;
}

// Check if this is an API request
if (strpos($_SERVER['REQUEST_URI'], '/server/') !== false || 
    strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
    
    // Extract the actual PHP file from the URL
    $path = $_SERVER['REQUEST_URI'];
    $path = parse_url($path, PHP_URL_PATH);
    
    // Remove leading slash and any base path
    $path = ltrim($path, '/');
    $path = preg_replace('/^[^\/]*\//', '', $path); // Remove first directory if present
    
    // Map API routes to server files
    if (strpos($path, 'server/') === 0) {
        $phpFile = substr($path, 7); // Remove 'server/' prefix
    } elseif (strpos($path, 'api/') === 0) {
        $phpFile = substr($path, 4); // Remove 'api/' prefix
    } else {
        $phpFile = $path;
    }
    
    $serverFile = __DIR__ . '/server/' . $phpFile;
    
    if (file_exists($serverFile) && pathinfo($serverFile, PATHINFO_EXTENSION) === 'php') {
        include $serverFile;
        exit;
    } else {
        header('HTTP/1.0 404 Not Found');
        echo json_encode([
            'error' => 'API endpoint not found',
            'requested' => $phpFile,
            'available' => [
                'auth.php',
                'database.php', 
                'users.php',
                'students.php'
            ]
        ]);
        exit;
    }
}

// For all other requests, serve the React application

// If a built SPA index exists, serve it directly
$rootIndex = __DIR__ . '/index.html';
$spaIndex = __DIR__ . '/dist/spa/index.html';
if (file_exists($rootIndex)) {
    readfile($rootIndex);
    exit;
} elseif (file_exists($spaIndex)) {
    header('Location: dist/spa/index.html');
    exit;
} else {
    // No SPA build found: fallback to classic PHP app for XAMPP
    include __DIR__ . '/login.php';
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ialibu Secondary School Management System</title>
    <meta name="description" content="Complete school management system for Ialibu Secondary School">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/public/placeholder.svg">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="assets/css/globals.css">
    <link rel="stylesheet" href="assets/css/style.css">
    
    <!-- Check if we have the built React app files -->
    <?php if (file_exists(__DIR__ . '/assets/index.css')): ?>
        <link rel="stylesheet" href="assets/index.css">
    <?php endif; ?>
    
    <style>
        /* Loading styles */
        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
        }
        
        .loading-content {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .error-container {
            background: #dc3545;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        
        .setup-link {
            background: #28a745;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin-top: 1rem;
            transition: background 0.3s;
        }
        
        .setup-link:hover {
            background: #218838;
            color: white;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading-container">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>🏫 Ialibu Secondary School</h2>
                <p>Management System Loading...</p>
                
                <div class="error-container" id="error-message" style="display: none;">
                    <h4>⚠️ Setup Required</h4>
                    <p>The React application files are not built yet.</p>
                    <a href="?setup" class="setup-link">🔧 Run Setup & Test</a>
                </div>
            </div>
        </div>
    </div>

    <!-- React Application Scripts -->
    <?php if (file_exists(__DIR__ . '/assets/index.js')): ?>
        <script type="module" src="assets/index.js"></script>
    <?php elseif (file_exists(__DIR__ . '/assets/main.js')): ?>
        <script type="module" src="assets/main.js"></script>
    <?php else: ?>
        <!-- Fallback: Show setup message if no built files found -->
        <script>
            setTimeout(() => {
                document.getElementById('error-message').style.display = 'block';
            }, 3000);
        </script>
    <?php endif; ?>
    
    <!-- Development Notice -->
    <?php if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false): ?>
        <script>
            // Development mode detection
            console.log('%c🏫 Ialibu School Management System', 'color: #1e40af; font-size: 18px; font-weight: bold;');
            console.log('%cRunning on XAMPP (Development Mode)', 'color: #059669; font-weight: bold;');
            console.log('API Base URL:', 'http://localhost/school-management/server/');
        </script>
    <?php endif; ?>
    
    <!-- Emergency fallback for direct PHP access -->
    <noscript>
        <div style="padding: 2rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 2rem;">
            <h3>⚠️ JavaScript Required</h3>
            <p>This application requires JavaScript to run. Please enable JavaScript in your browser.</p>
            <p><strong>Alternative:</strong> <a href="?setup">Visit Setup Page</a> to test the system configuration.</p>
        </div>
    </noscript>
</body>
</html>
