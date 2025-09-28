@echo off
echo ============================================================
echo   IALIBU SCHOOL MANAGEMENT - XAMPP DEPLOYMENT SCRIPT
echo ============================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Node.js detected...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/5] Building React application...
call npm run build:client
if errorlevel 1 (
    echo ERROR: Failed to build client application
    pause
    exit /b 1
)

echo.
echo [4/5] Preparing XAMPP deployment files...

REM Create deployment directory structure
if exist "xampp-deploy" rmdir /s /q "xampp-deploy"
mkdir "xampp-deploy"

REM Copy built frontend files
echo Copying frontend files...
xcopy "dist\spa" "xampp-deploy\" /E /I /Y

REM Copy backend PHP files
echo Copying backend files...
xcopy "server\*.php" "xampp-deploy\server\" /I /Y

REM Copy database files
echo Copying database files...
xcopy "xampp_database_import.sql" "xampp-deploy\" /Y
xcopy "xampp_setup.php" "xampp-deploy\" /Y

REM Copy configuration files
echo Copying configuration files...
xcopy ".htaccess" "xampp-deploy\" /Y

REM Copy documentation
echo Copying documentation...
xcopy "README_XAMPP.md" "xampp-deploy\" /Y
xcopy "XAMPP_SETUP_INSTRUCTIONS.md" "xampp-deploy\" /Y

echo.
echo [5/5] Deployment complete!
echo.
echo ============================================================
echo   DEPLOYMENT SUCCESSFUL!
echo ============================================================
echo.
echo Your XAMPP-ready files are in: xampp-deploy\
echo.
echo NEXT STEPS:
echo 1. Copy the 'xampp-deploy' folder to: C:\xampp\htdocs\school-management\
echo 2. Start XAMPP (Apache + MySQL)
echo 3. Import database: xampp_database_import.sql
echo 4. Visit: http://localhost/school-management/
echo.
echo For detailed instructions, see: README_XAMPP.md
echo ============================================================
echo.
pause
