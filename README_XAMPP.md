# 🏫 Ialibu Secondary School Management System
## XAMPP Deployment Guide

### 📋 Complete Setup for Local Development with XAMPP

This school management system is designed to work seamlessly with XAMPP, providing a complete local development environment for managing student records, attendance, grades, and financial data.

---

## 🚀 Quick Start Guide

### **Step 1: Download & Extract**
1. Download this project as a ZIP file
2. Extract to your XAMPP `htdocs` directory:
   ```
   C:\xampp\htdocs\school-management\
   ```

### **Step 2: Start XAMPP Services**
1. Open XAMPP Control Panel
2. Start **Apache** ✅
3. Start **MySQL** ✅

### **Step 3: Import Database**
1. Open [phpMyAdmin](http://localhost/phpmyadmin)
2. Click **"Import"** tab
3. Choose file: `xampp_database_import.sql`
4. Click **"Go"**

### **Step 4: Verify Setup**
1. Open: [http://localhost/school-management/xampp_setup.php](http://localhost/school-management/xampp_setup.php)
2. Click **"Test Database Connection"**
3. Should show ✅ **"Database Connection Successful!"**

### **Step 5: Access Application**
- **Frontend**: [http://localhost/school-management/](http://localhost/school-management/)
- **Admin Login**: `admin` / `admin123`
- **Staff Login**: `staff` / `staff123`

---

## 🏗️ Architecture Overview

### **Frontend (React + TypeScript)**
```
client/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── AdminDashboard.tsx
│   ├── StaffDashboard.tsx
│   └── Index.tsx
├── lib/                # Utilities and services
│   ├── apiService.ts   # XAMPP API connection
│   ├── authStore.ts    # Authentication management
│   └── localAuthStore.ts  # Fallback storage
└── hooks/              # Custom React hooks
```

### **Backend (PHP + MySQL)**
```
server/
├── auth.php           # User authentication API
├── database.php       # Database connection & utilities
├── users.php          # User management API
└── students.php       # Student data API (ready for expansion)
```

### **Database (MySQL)**
```
database/
├── xampp_database_import.sql  # Complete database setup
└── full_schema.sql           # Detailed schema documentation
```

---

## 🗄️ Database Structure

### **Core Tables**
- **`users`** - Authentication and user management
- **`students`** - Student information and profiles
- **`staff`** - Staff member records
- **`attendance`** - Daily attendance tracking
- **`grades`** - Academic performance records
- **`finance`** - School fees and payments
- **`student_reports`** - Generated report cards
- **`audit_log`** - System activity tracking

### **Sample Data Included**
- ✅ **12 Students** across Grades 9-12
- ✅ **8 Staff Members** with different roles
- ✅ **2 System Users** (admin + staff accounts)
- ✅ **Attendance Records** for recent dates
- ✅ **Grade Records** with PNG education standards
- ✅ **Financial Records** with payment tracking

---

## 🔐 Security Features

### **Authentication**
- **Role-based access control** (Admin vs Staff)
- **Password hashing** using PHP's `password_hash()`
- **Session management** with secure tokens
- **Input validation** and SQL injection prevention

### **Default Credentials**
```
Admin Access:
Username: admin
Password: admin123
Access: Full system control

Staff Access:
Username: staff
Password: staff123
Access: Teaching functions only
```

---

## 🌐 API Endpoints

### **Authentication APIs**
```
POST /server/auth.php?action=login
POST /server/auth.php?action=register
GET  /server/auth.php?action=profile&user_id=X
```

### **Database APIs**
```
GET /server/database.php?action=test     # Test connection
GET /server/database.php?action=stats    # Get statistics
```

### **User Management APIs**
```
GET    /server/users.php?action=list
POST   /server/users.php?action=add
PUT    /server/users.php?action=update&id=X
DELETE /server/users.php?action=delete&id=X
PUT    /server/users.php?action=change_password&id=X
```

---

## 🛠️ Development Features

### **Frontend Technologies**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Router** for navigation
- **Vite** for fast development

### **Backend Technologies**
- **PHP 8+** with MySQLi/PDO
- **CORS enabled** for local development
- **JSON API responses**
- **Error handling** and logging

### **Smart Fallback System**
The application automatically detects the environment:
- **Local XAMPP**: Uses PHP backend APIs
- **Cloud/Remote**: Falls back to localStorage
- **Visual indicators** show current data source

---

## 📊 Key Features

### **🎓 Academic Management**
- **Student Profiles** with complete information
- **Grade Management** following PNG education standards
- **Report Card Generation** with weighted scoring
- **Class and Subject Organization**

### **📅 Attendance Tracking**
- **Daily attendance recording**
- **Absence reason tracking**
- **Attendance percentage calculations**
- **Real-time sync** between admin and staff views

### **💰 Financial Management**
- **School fee tracking**
- **Payment status monitoring**
- **Receipt number generation**
- **Outstanding balance calculations**

### **👥 Staff Management**
- **Staff directory** with contact information
- **Role-based permissions**
- **Department organization**
- **Salary and employment tracking**

### **📈 Dashboard Analytics**
- **Student enrollment statistics**
- **Attendance trend analysis**
- **Financial overview charts**
- **Grade distribution reports**

---

## 🔧 Customization Guide

### **Modifying Grade Levels**
Edit the database enum in `students` table:
```sql
ALTER TABLE students MODIFY COLUMN grade 
ENUM('Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13') NOT NULL;
```

### **Adding New Subjects**
Subjects are stored as JSON arrays in the `students.subjects` field:
```json
["Mathematics", "English", "Science", "Social Science", "Business Studies"]
```

### **Customizing Grading Scale**
PNG Education Standards (default):
- **D**: 85-100 (Distinction)
- **C**: 70-84 (Credit)
- **UP**: 55-69 (Upper Pass)
- **P**: 40-54 (Pass)
- **F**: <40 (Fail)

Modify in `grades` table enum and calculation logic.

### **Adding New User Roles**
1. Update `users.user_type` enum in database
2. Modify permission arrays in `auth.php`
3. Update frontend role checks in components

---

## 🚨 Troubleshooting

### **❌ Database Connection Failed**
**Symptoms**: "Database connection failed" error
**Solutions**:
1. Verify MySQL is running in XAMPP Control Panel
2. Check database name is `ialibu_school`
3. Ensure default MySQL credentials (root with no password)
4. Restart XAMPP services

### **❌ Import Failed**
**Symptoms**: SQL import errors in phpMyAdmin
**Solutions**:
1. Increase `upload_max_filesize` in `php.ini`
2. Use MySQL command line instead:
   ```bash
   mysql -u root -p < xampp_database_import.sql
   ```
3. Import in smaller chunks if file is too large

### **❌ API Not Working**
**Symptoms**: Frontend shows "API unavailable" message
**Solutions**:
1. Check Apache is running
2. Verify file permissions in `htdocs`
3. Check PHP error logs in XAMPP
4. Test API endpoints directly in browser

### **❌ Permission Denied**
**Symptoms**: 403 Forbidden errors
**Solutions**:
1. Check folder permissions in `htdocs`
2. Verify `.htaccess` file is present
3. Enable `mod_rewrite` in Apache
4. Check Apache configuration

### **❌ Login Not Working**
**Symptoms**: Invalid credentials error
**Solutions**:
1. Verify user exists in database
2. Check password hashing implementation
3. Try with default credentials
4. Clear browser cache and storage

---

## 📁 Complete File Structure

```
school-management/
├── 📄 README_XAMPP.md              # This file
├── 📄 XAMPP_SETUP_INSTRUCTIONS.md  # Detailed setup guide
├── 📄 xampp_database_import.sql    # Database import file
├── 📄 xampp_setup.php             # Setup verification page
├── 
├── 📁 client/                     # Frontend React application
│   ├── 📁 components/
│   │   ├── 📁 ui/                 # Reusable UI components
│   │   └── 📄 DatabaseStatus.tsx  # Connection status indicator
│   ├── 📁 pages/
│   │   ├─��� 📄 AdminDashboard.tsx  # Admin interface
│   │   ├── 📄 StaffDashboard.tsx  # Staff interface
│   │   └── 📄 Index.tsx           # Login page
│   ├── 📁 lib/
│   │   ├── 📄 apiService.ts       # XAMPP API client
│   │   ├── 📄 authStore.ts        # Authentication store
│   │   └── 📄 localAuthStore.ts   # Fallback storage
│   └── 📁 hooks/                  # Custom React hooks
│
├── 📁 server/                     # Backend PHP APIs
│   ├── 📄 auth.php               # Authentication API
│   ├── 📄 database.php           # Database utilities
│   ├── 📄 users.php              # User management API
│   └── 📄 students.php           # Student data API
│
├── 📁 database/                   # Database files
│   ├── 📄 full_schema.sql        # Complete schema
│   └── 📄 unified_school_database.sql
│
├── 📁 config/                     # Configuration files
│   └── 📄 unified_database_config.js
│
├── 📄 package.json               # Node.js dependencies
├── 📄 vite.config.ts             # Vite configuration
├── 📄 tailwind.config.ts         # Tailwind CSS config
└── 📄 index.html                 # Main HTML entry point
```

---

## 🎯 Production Deployment

### **For XAMPP Production**
1. **Secure MySQL**: Set root password and create dedicated user
2. **Update credentials** in `server/database.php`
3. **Enable HTTPS**: Configure SSL in Apache
4. **Restrict access**: Configure proper file permissions
5. **Backup strategy**: Regular database backups

### **Environment Variables**
Create `.env` file for production:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ialibu_school
DB_USER=school_user
DB_PASSWORD=secure_password
```

### **Security Recommendations**
- Change default admin password
- Enable Apache authentication for admin areas
- Regular security updates for XAMPP
- Database user with minimal required permissions
- Regular backup of database and files

---

## 📞 Support & Documentation

### **Built-in Help**
- **Setup Verification**: `xampp_setup.php`
- **API Documentation**: Visit `/server/` endpoints
- **Database Stats**: `database.php?action=stats`

### **Key Documentation Files**
- `XAMPP_SETUP_INSTRUCTIONS.md` - Step-by-step setup
- `DATABASE_UNIFIED.md` - Database schema documentation
- `AGENTS.md` - Development guidelines

### **Troubleshooting Resources**
1. **XAMPP Logs**: Check Apache and MySQL error logs
2. **PHP Errors**: Enable error reporting in development
3. **Browser Console**: Check for JavaScript errors
4. **Database Logs**: Monitor MySQL general query log

---

## 🎉 Ready to Use!

After following this guide, you'll have:

✅ **Complete school management system**  
✅ **Working XAMPP integration**  
✅ **Sample data for testing**  
✅ **Admin and staff interfaces**  
✅ **Automatic attendance recording**  
✅ **Real-time dashboard synchronization**  
✅ **Financial tracking system**  
✅ **Grade management with PNG standards**  

**🚀 Start managing your school with confidence!**

---

*Last updated: January 2024*  
*Compatible with: XAMPP 8.0+, PHP 8.0+, MySQL 8.0+*
