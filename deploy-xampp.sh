#!/bin/bash

echo "============================================================"
echo "   IALIBU SCHOOL MANAGEMENT - XAMPP DEPLOYMENT SCRIPT"
echo "============================================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Node.js detected..."
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "[2/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "[3/5] Building React application..."
npm run build:client
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build client application"
    exit 1
fi

echo
echo "[4/5] Preparing XAMPP deployment files..."

# Create deployment directory structure
if [ -d "xampp-deploy" ]; then
    rm -rf "xampp-deploy"
fi
mkdir -p "xampp-deploy"

# Copy built frontend files
echo "Copying frontend files..."
cp -r dist/spa/* xampp-deploy/

# Copy backend PHP files
echo "Copying backend files..."
mkdir -p "xampp-deploy/server"
cp server/*.php xampp-deploy/server/

# Copy database files
echo "Copying database files..."
cp xampp_database_import.sql xampp-deploy/
cp xampp_setup.php xampp-deploy/

# Copy configuration files
echo "Copying configuration files..."
cp .htaccess xampp-deploy/

# Copy documentation
echo "Copying documentation..."
cp README_XAMPP.md xampp-deploy/
cp XAMPP_SETUP_INSTRUCTIONS.md xampp-deploy/

# Set permissions
chmod -R 755 xampp-deploy/

echo
echo "[5/5] Deployment complete!"
echo
echo "============================================================"
echo "   DEPLOYMENT SUCCESSFUL!"
echo "============================================================"
echo
echo "Your XAMPP-ready files are in: xampp-deploy/"
echo
echo "NEXT STEPS:"
echo "1. Copy the 'xampp-deploy' folder to your XAMPP htdocs directory"
echo "2. Start XAMPP (Apache + MySQL)"
echo "3. Import database: xampp_database_import.sql"
echo "4. Visit: http://localhost/school-management/"
echo
echo "For detailed instructions, see: README_XAMPP.md"
echo "============================================================"
echo
