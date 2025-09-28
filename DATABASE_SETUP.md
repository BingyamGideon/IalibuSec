# Ialibu Secondary School Management System - Database Documentation

## Overview

This is a comprehensive school management system with full authentication, user management, and dashboard functionality for Ialibu Secondary School. The system uses a **single unified database** that serves both admin and staff roles with different permissions and capabilities.

## 🎯 **Unified Database Architecture**

The system now uses **ONE DATABASE** for all functionality:
- **Database Name**: `ialibu_school_unified`
- **Database File**: `database/unified_school_database.sql`
- **Coverage**: Complete system for both Admin and Staff dashboards

## Features

### Authentication System
- **User Registration & Login**: Secure authentication with session management
- **Role-based Access Control**: Admin and Staff roles with different permissions
- **Session Management**: Automatic session expiry and security features
- **Password Security**: Ready for bcrypt hashing in production

### Admin Dashboard Features
- **User Management**: Create, edit, delete system users
- **Student Management**: Complete student records with grades 9-12, classes A-H
- **Attendance Tracking**: Record and manage student attendance
- **Grade Management**: Advanced grading system with multiple assessment components
- **Finance Management**: Track student payments and outstanding fees
- **Staff Management**: Manage school staff information
- **Comprehensive Reports**: Generate various administrative reports

### Staff Dashboard Features
- **Student Access**: View and manage assigned students
- **Attendance Recording**: Take daily attendance for classes
- **Grade Entry**: Enter grades with multiple assessment categories
- **Student Reports**: Generate student report cards

### Advanced Grading System
- **PNG Education Standards**: Implements Papua New Guinea grading scale (D: 85-100, C: 70-84, UP: 55-69, P: 40-54, F: below 40)
- **Multiple Assessment Components**:
  - Weekly Tests (20%)
  - Projects (25%)
  - Assignments (20%)
  - Take-Home Tests (15%)
  - Open-Book Tests (10%)
  - End-of-Term Tests (10%)
- **Array-based Scoring**: Support for multiple scores per assessment type
- **Automatic Calculations**: Real-time total and letter grade computation

## Database Schema

### Single Unified Database: `ialibu_school_unified`

The unified database contains all tables needed for complete system functionality:

1. **users** - System authentication and user management
2. **students** - Student records with grades 9-12, classes A-H
3. **attendance** - Daily attendance tracking
4. **grades** - Advanced grading with assessment arrays
5. **finance** - Financial records and payment tracking
6. **staff** - Staff member information
7. **student_reports** - Comprehensive report cards
8. **audit_log** - System activity tracking

## Setup Instructions

### 1. Database Setup (Production)
```sql
-- Import the unified database
mysql -u your_username -p < database/unified_school_database.sql
```

### 2. XAMPP Setup (Development)
```sql
-- Use the XAMPP-ready import file
Import: xampp_database_import.sql via phpMyAdmin
```

### 3. Environment Configuration
```bash
# Create .env file with database credentials
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=ialibu_school_unified
```

### 4. Application Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Default Credentials

### Admin Access
- **Username**: admin
- **Password**: admin123
- **Permissions**: Full system access

### Staff Access
- **Username**: staff
- **Password**: staff123
- **Permissions**: Students, Attendance, Grades, Reports

## User Roles & Permissions

### Administrator
- User management (create, edit, delete users)
- Full student management
- Attendance records (view all)
- Grade management (view all)
- Financial management
- Staff management
- System reports and analytics

### Staff Member
- Assigned student management
- Attendance recording for their classes
- Grade entry for their subjects
- Student report generation
- Profile management

## Data Structure

### Student Information
- Personal details (name, DOB, gender, address)
- Academic info (grade level, class section)
- Contact information (email, phone, guardian details)
- Subject enrollment (up to 10 subjects per student)

### Assessment System
Each subject grade contains arrays for:
- **Weekly Tests**: Up to 6 test scores
- **Projects**: Up to 6 project scores
- **Assignments**: Up to 6 assignment scores
- **Take-Home Tests**: Up to 6 test scores
- **Open-Book Tests**: Up to 6 test scores
- **End-of-Term Tests**: Up to 6 exam scores

### Grade Calculation
```
Total = (Weekly×20% + Projects×25% + Assignments×20% + 
         TakeHome×15% + OpenBook×10% + EndTerm×10%)

Letter Grade:
- D: 85-100 (Distinction)
- C: 70-84 (Credit)
- UP: 55-69 (Ungraded Pass)
- P: 40-54 (Pass)
- F: Below 40 (Fail)
```

## School Structure

### Grade Levels
- Grade 9 (Lower Secondary)
- Grade 10 (Lower Secondary)
- Grade 11 (Upper Secondary)
- Grade 12 (Upper Secondary)

### Class Sections
Each grade has 8 classes: A, B, C, D, E, F, G, H

### Subjects by Level

#### Lower Secondary (Grades 9-10)
- English, Mathematics, Science
- Social Science, Business Studies
- Personal Development, Religious Education
- Arts, Information Technology
- Technology & Industrial Arts
- Family and Consumer Studies

#### Upper Secondary (Grades 11-12)
- Language and Literature, General/Advanced Mathematics
- Biology, Chemistry, Physics, Geology
- Applied Science, Economics, Geography
- History, Environment, Political Science
- Legal Studies, Business Studies, Accounting
- Tourism Studies, ICT, Computer Studies
- Design and Technology, Construction
- Food Technology, Textile Technology

## Security Features

### Authentication
- Session-based authentication
- Automatic session expiry
- Password validation (minimum 6 characters)
- User account status management

### Authorization
- Role-based permissions
- Action-level access control
- User cannot delete their own account
- Audit logging for accountability

### Data Protection
- Input validation on all forms
- SQL injection prevention (prepared statements)
- XSS protection through proper escaping
- CSRF protection ready for implementation

## Database Files

### Current Structure (Simplified)
```
database/
├── unified_school_database.sql    # Main database (COMPLETE SYSTEM)
└── (legacy files removed)
```

### Additional Files
```
xampp_database_import.sql          # XAMPP-ready version
XAMPP_SETUP_INSTRUCTIONS.md       # XAMPP setup guide
DATABASE_UNIFIED.md               # Technical documentation
```

## Production Deployment

### Security Checklist
- [ ] Implement bcrypt password hashing
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure environment variables
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Configure proper CORS settings

### Performance Optimization
- [ ] Database indexing (already included in schema)
- [ ] Query optimization
- [ ] Caching strategy
- [ ] CDN for static assets
- [ ] Database connection pooling

## Support

For technical support or questions about the system:
1. Check the documentation
2. Review the database schema
3. Examine the code comments
4. Contact the development team

## Version History

- **v1.0** - Initial release with basic functionality
- **v1.1** - Added user management system
- **v1.2** - Enhanced grading system with arrays
- **v1.3** - Complete authentication and authorization
- **v2.0** - Full database integration ready
- **v3.0** - **UNIFIED DATABASE SYSTEM** - Single database for entire system

---

**Note**: This system now uses a single unified database that serves both Admin and Staff dashboards with complete real-time synchronization and follows Papua New Guinea education standards.
