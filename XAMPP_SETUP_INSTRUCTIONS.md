# 🚀 XAMPP Setup Instructions for Ialibu Secondary School Management System

## 📋 **Quick Setup Guide**

Follow these simple steps to get the school management system running on XAMPP:

---

## **Step 1: Install XAMPP**

1. **Download XAMPP** from: https://www.apachefriends.org/
2. **Install XAMPP** on your computer
3. **Start XAMPP Control Panel**

---

## **Step 2: Start Required Services**

In XAMPP Control Panel, click **"Start"** for:
- ✅ **Apache** (Web server)
- ✅ **MySQL** (Database server)

![XAMPP Control Panel](https://via.placeholder.com/400x200/4CAF50/white?text=Apache+%26+MySQL+Started)

---

## **Step 3: Import the Database**

### **Method A: Using phpMyAdmin (Recommended)**

1. **Open phpMyAdmin**:
   - Click **"Admin"** button next to MySQL in XAMPP
   - OR go to: `http://localhost/phpmyadmin`

2. **Import Database**:
   - Click **"Import"** tab at the top
   - Click **"Choose File"** button
   - Select the file: `xampp_database_import.sql`
   - Click **"Go"** button at the bottom

3. **Success!** You should see:
   ```
   Import has been successfully finished
   Database Setup Complete!
   Total Students: 12
   Total Users: 2
   Total Staff: 8
   ```

### **Method B: Using MySQL Command Line**

1. **Open Command Prompt** in the folder containing `xampp_database_import.sql`
2. **Run this command**:
   ```bash
   "C:\xampp\mysql\bin\mysql.exe" -u root -p < xampp_database_import.sql
   ```
3. **Press Enter** when asked for password (leave blank for default XAMPP)

---

## **Step 4: Verify Database Creation**

1. **In phpMyAdmin**, you should see a new database called: `ialibu_school`
2. **Click on the database** to see 8 tables:
   - ✅ `attendance` - Student attendance records
   - ✅ `audit_log` - System activity tracking  
   - ✅ `finance` - School fees and payments
   - ✅ `grades` - Student grades and assessments
   - ✅ `staff` - Staff member information
   - ✅ `student_reports` - Generated report cards
   - ✅ `students` - Student information
   - ✅ `users` - System login accounts

---

## **Step 5: Access the System**

### **🔑 Default Login Credentials**

The database comes with pre-configured accounts:

#### **👨‍💼 Admin Access**
- **Username**: `admin`
- **Password**: `admin123`
- **Access Level**: Full system control

#### **👨‍🏫 Staff Access**
- **Username**: `staff`  
- **Password**: `staff123`
- **Access Level**: Teaching functions

---

## **📊 Sample Data Included**

The database comes pre-loaded with realistic sample data:

### **👥 Students (12 total)**
- **Grade 9**: 5 students across classes 9A, 9B, 9C
- **Grade 10**: 3 students in classes 10A, 10B
- **Grade 11**: 2 students in classes 11A, 11B  
- **Grade 12**: 2 students in class 12A

### **👨‍🏫 Staff (8 total)**
- Principal, Vice Principal
- Mathematics, English, Science Teachers
- Social Science, Business Studies, Arts Teachers

### **📅 Attendance Records**
- Recent attendance data for demonstration
- Multiple subjects and dates

### **📝 Grade Records**  
- PNG Education Standards grading (D, C, UP, P, F)
- Multiple assessment components per subject
- Weighted scoring system

### **💰 Finance Records**
- School fee payments (Paid/Pending status)
- Different payment methods
- Receipt numbers for tracking

---

## **🔧 Configuration (Optional)**

### **Database Connection Settings**

If you need to modify database settings, update these values:

```env
# Default XAMPP MySQL Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=            # Leave empty for default XAMPP
DB_NAME=ialibu_school
```

### **Change MySQL Password (Security)**

For production use, secure your MySQL installation:

1. **In phpMyAdmin**, go to **User accounts**
2. **Click "Edit privileges"** for `root` user  
3. **Change password** tab
4. **Set a strong password**
5. **Update your application config** with the new password

---

## **📱 Access the Web Application**

Once your web application is set up:

1. **Place your web files** in: `C:\xampp\htdocs\school-management\`
2. **Access via browser**: `http://localhost/school-management/`
3. **Login** with the credentials above

---

## **🛠️ Troubleshooting**

### **❌ Port 80 or 3306 Already in Use**
- **Change Apache port**: XAMPP Config → Apache → Config → httpd.conf (change 80 to 8080)
- **Change MySQL port**: XAMPP Config → MySQL → Config → my.ini (change 3306 to 3307)

### **❌ Import Failed**
- **Check file path**: Ensure `xampp_database_import.sql` is accessible
- **Check file size**: Large files may need `upload_max_filesize` increase in php.ini
- **Try command line method** if phpMyAdmin fails

### **❌ Access Denied for User 'root'**
- **Default XAMPP**: Username `root` with **no password**
- **If password set**: Use the password you configured

### **❌ Database Connection Failed**
- **Verify MySQL is running** in XAMPP Control Panel
- **Check port settings** (default: 3306)
- **Verify database name**: `ialibu_school`

---

## **📚 Database Features**

### **🔄 Real-Time Synchronization**
- Changes in Admin Dashboard → Instantly visible in Staff Dashboard
- Changes in Staff Dashboard → Instantly visible in Admin Dashboard

### **🏫 PNG Education Standards**
- **Grade Levels**: 9, 10, 11, 12
- **Class Sections**: A, B, C, D, E, F, G, H per grade
- **Grading Scale**: D (85-100), C (70-84), UP (55-69), P (40-54), F (<40)

### **📊 Assessment Components**
- **Weekly Tests** (20% weight)
- **Projects** (25% weight)
- **Assignments** (20% weight)  
- **Take-Home Tests** (15% weight)
- **Open-Book Tests** (10% weight)
- **End-of-Term Tests** (10% weight)

### **💼 Comprehensive Management**
- **Student Records**: Complete profiles with guardian information
- **Attendance Tracking**: Daily attendance with notes
- **Financial Management**: Fee tracking with payment status
- **Staff Management**: Complete staff records and system access
- **Report Generation**: Automated report cards
- **Audit Trail**: Complete system activity logging

---

## **🔒 Security Features**

- **Role-Based Access**: Admin vs Staff permissions
- **Password Hashing**: Secure password storage
- **Audit Logging**: Track all system changes
- **Data Validation**: Prevent invalid data entry
- **Foreign Key Constraints**: Maintain data integrity

---

## **🚀 Ready to Use!**

After completing these steps, your Ialibu Secondary School Management System will be:

✅ **Fully functional** with sample data  
✅ **Ready for testing** with both admin and staff accounts  
✅ **Connected to MySQL database** via XAMPP  
✅ **Configured with PNG education standards**  
✅ **Set up for real-time synchronization**  

---

## **📞 Support**

If you encounter any issues:

1. **Check XAMPP logs**: Look for error messages in XAMPP Control Panel
2. **Verify services**: Ensure Apache and MySQL are running
3. **Review setup steps**: Follow instructions carefully
4. **Check file permissions**: Ensure files are accessible

---

**🎉 You're all set! The Ialibu Secondary School Management System is ready to use with XAMPP!**
