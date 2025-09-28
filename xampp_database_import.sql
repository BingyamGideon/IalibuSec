-- ============================================================================
-- IALIBU SECONDARY SCHOOL MANAGEMENT SYSTEM - XAMPP DATABASE IMPORT
-- ============================================================================
-- Easy import file for XAMPP users
-- Compatible with phpMyAdmin and MySQL command line
-- 
-- INSTRUCTIONS:
-- 1. Start XAMPP (Apache + MySQL)
-- 2. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 3. Click "Import" tab
-- 4. Choose this file and click "Go"
-- 
-- OR via MySQL command line:
-- mysql -u root -p < xampp_database_import.sql
-- ============================================================================

-- Create and use the database
DROP DATABASE IF EXISTS ialibu_school;
CREATE DATABASE ialibu_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ialibu_school;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table - Authentication and authorization
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_type ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSON,
    assigned_classes JSON,
    assigned_subjects JSON,
    allow_cross_class BOOLEAN DEFAULT FALSE,
    registration_token VARCHAR(64) NULL,
    registration_expires TIMESTAMP NULL,
    must_set_password BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Students table - Student information
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    grade ENUM('Grade 9', 'Grade 10', 'Grade 11', 'Grade 12') NOT NULL,
    class VARCHAR(10) NOT NULL,
    subjects JSON NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    student_id VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Attendance table - Daily attendance records
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    student_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    subject VARCHAR(100) NOT NULL,
    notes TEXT,
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Grades table - Academic performance
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    class VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    weekly_tests JSON,
    projects JSON,
    assignments JSON,
    take_home_tests JSON,
    open_book_tests JSON,
    end_of_term_tests JSON,
    total_marks DECIMAL(5,2) NOT NULL,
    letter_grade ENUM('D', 'C', 'UP', 'P', 'F') NOT NULL,
    term ENUM('Term 1', 'Term 2', 'Term 3', 'Term 4') NOT NULL,
    academic_year VARCHAR(9) NOT NULL DEFAULT '2024',
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Finance table - School fees and payments
CREATE TABLE finance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
    description TEXT NOT NULL,
    payment_method ENUM('Cash', 'Bank Transfer', 'Cheque', 'Other'),
    receipt_number VARCHAR(50),
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Staff table - Staff information
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    salary DECIMAL(10,2),
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Student reports table - Generated report cards
CREATE TABLE student_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    grade ENUM('Grade 9', 'Grade 10', 'Grade 11', 'Grade 12') NOT NULL,
    class VARCHAR(10) NOT NULL,
    student_number VARCHAR(20) NOT NULL,
    term ENUM('Term 1', 'Term 2', 'Term 3', 'Term 4') NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    financial_status ENUM('Clear', 'Not Cleared') DEFAULT 'Not Cleared',
    outstanding_amount DECIMAL(10,2) DEFAULT 0,
    gpa DECIMAL(3,2) DEFAULT 0,
    class_rank INT,
    grade_rank INT,
    total_subjects INT DEFAULT 0,
    total_school_days INT DEFAULT 0,
    days_absent INT DEFAULT 0,
    days_present INT DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    teacher_comments TEXT,
    class_teacher_signature VARCHAR(100),
    principal_signature VARCHAR(100),
    school_stamp BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Audit log table - System activity tracking
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    user_type ENUM('admin', 'staff') NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW') NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Students table indexes
CREATE INDEX idx_students_grade_class ON students(grade, class);
CREATE INDEX idx_students_active ON students(is_active);
CREATE INDEX idx_students_name ON students(name);

-- Attendance table indexes
CREATE INDEX idx_attendance_date_student ON attendance(date, student_id);
CREATE INDEX idx_attendance_student_status ON attendance(student_id, status);
CREATE INDEX idx_attendance_date_status ON attendance(date, status);

-- Grades table indexes
CREATE INDEX idx_grades_student_subject_term ON grades(student_id, subject, term, academic_year);
CREATE INDEX idx_grades_class_subject ON grades(class, subject);
CREATE INDEX idx_grades_letter_grade ON grades(letter_grade);

-- Finance table indexes
CREATE INDEX idx_finance_student_status ON finance(student_id, status);
CREATE INDEX idx_finance_date_status ON finance(date, status);
CREATE INDEX idx_finance_amount ON finance(amount);

-- Staff table indexes
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_active ON staff(is_active);

-- Student reports indexes
CREATE INDEX idx_reports_student_term_year ON student_reports(student_id, term, academic_year);
CREATE INDEX idx_reports_grade_class_term ON student_reports(grade, class, term, academic_year);

-- Audit log indexes
CREATE INDEX idx_audit_user_action ON audit_log(user_id, action);
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);

-- ============================================================================
-- SAMPLE DATA - Ready to use
-- ============================================================================

-- Insert default users (admin and staff)
INSERT INTO users (username, password_hash, email, first_name, last_name, user_type, department, position, permissions) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@ialibu.edu.pg', 'System', 'Administrator', 'admin', 'Administration', 'System Administrator', '["all"]'),
('staff', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff@ialibu.edu.pg', 'Demo', 'Teacher', 'staff', 'Academic', 'Teacher', '["students", "attendance", "grades", "reports"]');

-- Insert sample students from different grades and classes
INSERT INTO students (name, grade, class, subjects, date_of_birth, gender, address, email, phone, guardian_name, guardian_phone, student_id) VALUES
-- Grade 9 Students
('John Doe', 'Grade 9', '9A', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Religious Education", "Arts"]', '2007-05-15', 'Male', '123 Main St, Ialibu', 'john.doe@example.com', '123-456-7890', 'Robert Doe', '+675-234-5678', 'ISS2024001'),
('Jane Smith', 'Grade 9', '9A', '["Mathematics", "English", "Science", "Social Science", "Information Technology", "Personal Development", "Arts", "Family and Consumer Studies"]', '2008-03-22', 'Female', '456 Oak Ave, Ialibu', 'jane.smith@example.com', '123-456-7891', 'Mary Smith', '+675-345-6789', 'ISS2024002'),
('Michael Johnson', 'Grade 9', '9B', '["Mathematics", "English", "Science", "Business Studies", "Technology & Industrial Arts", "Personal Development", "Arts"]', '2006-11-08', 'Male', '789 Pine Rd, Ialibu', 'michael.johnson@example.com', '123-456-7892', 'James Johnson', '+675-456-7890', 'ISS2024003'),
('Lina Paul', 'Grade 9', '9B', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Arts"]', '2007-04-15', 'Female', '123 Valley St, Ialibu', 'lina.paul@example.com', '123-456-7811', 'Peter Paul', '+675-234-5611', 'ISS2024004'),
('Alex Sungi', 'Grade 9', '9C', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Arts"]', '2007-06-22', 'Male', '456 Hill Ave, Ialibu', 'alex.sungi@example.com', '123-456-7812', 'John Sungi', '+675-345-6712', 'ISS2024005'),

-- Grade 10 Students  
('Sarah Wilson', 'Grade 10', '10A', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Arts", "Information Technology"]', '2006-08-14', 'Female', '321 Elm St, Ialibu', 'sarah.wilson@example.com', '123-456-7893', 'David Wilson', '+675-567-8901', 'ISS2024006'),
('Peter Brown', 'Grade 10', '10B', '["Mathematics", "English", "Science", "Social Science", "Technology & Industrial Arts", "Personal Development", "Arts"]', '2006-12-03', 'Male', '654 Maple Ave, Ialibu', 'peter.brown@example.com', '123-456-7894', 'Linda Brown', '+675-678-9012', 'ISS2024007'),
('Mary Kora', 'Grade 10', '10A', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Arts"]', '2006-08-10', 'Female', '789 Ridge Rd, Ialibu', 'mary.kora@example.com', '123-456-7813', 'Grace Kora', '+675-456-7813', 'ISS2024008'),

-- Grade 11 Students
('David Kim', 'Grade 11', '11A', '["Mathematics", "English", "Biology", "Chemistry", "Physics", "Geography", "History"]', '2005-09-20', 'Male', '890 Forest Ave, Ialibu', 'david.kim@example.com', '123-456-7814', 'Susan Kim', '+675-567-8914', 'ISS2024009'),
('Grace Temu', 'Grade 11', '11B', '["Mathematics", "English", "Biology", "Business Studies", "Economics", "Geography", "ICT"]', '2005-10-05', 'Female', '123 River St, Ialibu', 'grace.temu@example.com', '123-456-7815', 'Joseph Temu', '+675-678-9015', 'ISS2024010'),

-- Grade 12 Students
('Samuel Mendi', 'Grade 12', '12A', '["Advanced Mathematics", "English", "Biology", "Chemistry", "Physics", "Geography"]', '2004-11-20', 'Male', '456 Mountain Rd, Ialibu', 'samuel.mendi@example.com', '123-456-7816', 'Ruth Mendi', '+675-789-0116', 'ISS2024011'),
('Rachel Tommy', 'Grade 12', '12A', '["Mathematics", "English", "Biology", "Business Studies", "Economics", "Legal Studies"]', '2004-12-15', 'Female', '789 Valley View, Ialibu', 'rachel.tommy@example.com', '123-456-7817', 'Paul Tommy', '+675-890-1217', 'ISS2024012');

-- Insert sample staff members
INSERT INTO staff (name, position, department, email, phone, salary, hire_date) VALUES
('James Anderson', 'Principal', 'Administration', 'j.anderson@ialibu.edu.pg', '+675-123-4567', 80000.00, '2020-01-15'),
('Mary Taylor', 'Vice Principal', 'Administration', 'm.taylor@ialibu.edu.pg', '+675-123-4568', 70000.00, '2020-02-01'),
('Robert Thomas', 'Mathematics Teacher', 'Science & Mathematics', 'r.thomas@ialibu.edu.pg', '+675-123-4569', 50000.00, '2021-01-10'),
('Susan Davis', 'English Teacher', 'Languages', 's.davis@ialibu.edu.pg', '+675-123-4570', 48000.00, '2021-03-15'),
('Michael Lee', 'Science Teacher', 'Science & Mathematics', 'm.lee@ialibu.edu.pg', '+675-123-4571', 52000.00, '2020-08-01'),
('Patricia Wong', 'Social Science Teacher', 'Social Studies', 'p.wong@ialibu.edu.pg', '+675-123-4572', 49000.00, '2021-06-01'),
('Kevin Murphy', 'Business Studies Teacher', 'Business Education', 'k.murphy@ialibu.edu.pg', '+675-123-4573', 51000.00, '2020-09-15'),
('Lisa Chen', 'Arts Teacher', 'Creative Arts', 'l.chen@ialibu.edu.pg', '+675-123-4574', 47000.00, '2022-01-20');

-- Insert sample attendance records for recent dates
INSERT INTO attendance (date, student_id, student_name, status, subject, notes, recorded_by) VALUES
-- Today's attendance
('2024-01-15', 1, 'John Doe', 'Present', 'Mathematics', '', 2),
('2024-01-15', 2, 'Jane Smith', 'Present', 'Mathematics', '', 2),
('2024-01-15', 3, 'Michael Johnson', 'Absent', 'Mathematics', 'Sick', 2),
('2024-01-15', 4, 'Lina Paul', 'Present', 'Mathematics', '', 2),
('2024-01-15', 5, 'Alex Sungi', 'Late', 'Mathematics', 'Transport delay', 2),
('2024-01-15', 6, 'Sarah Wilson', 'Present', 'Mathematics', '', 2),
('2024-01-15', 7, 'Peter Brown', 'Present', 'Mathematics', '', 2),
('2024-01-15', 8, 'Mary Kora', 'Present', 'Mathematics', '', 2),

-- Previous day attendance
('2024-01-14', 1, 'John Doe', 'Present', 'English', '', 2),
('2024-01-14', 2, 'Jane Smith', 'Present', 'English', '', 2),
('2024-01-14', 3, 'Michael Johnson', 'Present', 'English', '', 2),
('2024-01-14', 4, 'Lina Paul', 'Late', 'English', 'Family emergency', 2),
('2024-01-14', 5, 'Alex Sungi', 'Present', 'English', '', 2),
('2024-01-14', 6, 'Sarah Wilson', 'Present', 'English', '', 2),
('2024-01-14', 7, 'Peter Brown', 'Absent', 'English', 'Medical appointment', 2),
('2024-01-14', 8, 'Mary Kora', 'Present', 'English', '', 2);

-- Insert sample grades for Term 1 2024
INSERT INTO grades (student_id, student_name, class, subject, weekly_tests, projects, assignments, take_home_tests, open_book_tests, end_of_term_tests, total_marks, letter_grade, term, academic_year, recorded_by) VALUES
-- Grade 9 Mathematics
(1, 'John Doe', '9A', 'Mathematics', '[85, 78, 92, 0, 0, 0]', '[88, 91, 0, 0, 0, 0]', '[82, 87, 90, 0, 0, 0]', '[85, 89, 0, 0, 0, 0]', '[87, 0, 0, 0, 0, 0]', '[84, 0, 0, 0, 0, 0]', 86.25, 'D', 'Term 1', '2024', 2),
(2, 'Jane Smith', '9A', 'Mathematics', '[78, 82, 85, 0, 0, 0]', '[85, 88, 0, 0, 0, 0]', '[80, 85, 87, 0, 0, 0]', '[82, 86, 0, 0, 0, 0]', '[84, 0, 0, 0, 0, 0]', '[81, 0, 0, 0, 0, 0]', 83.15, 'C', 'Term 1', '2024', 2),
(3, 'Michael Johnson', '9B', 'Mathematics', '[65, 72, 78, 0, 0, 0]', '[70, 75, 0, 0, 0, 0]', '[68, 74, 77, 0, 0, 0]', '[71, 76, 0, 0, 0, 0]', '[73, 0, 0, 0, 0, 0]', '[69, 0, 0, 0, 0, 0]', 72.40, 'C', 'Term 1', '2024', 2),

-- Grade 9 English
(1, 'John Doe', '9A', 'English', '[80, 85, 88, 0, 0, 0]', '[82, 86, 0, 0, 0, 0]', '[79, 83, 87, 0, 0, 0]', '[81, 85, 0, 0, 0, 0]', '[84, 0, 0, 0, 0, 0]', '[80, 0, 0, 0, 0, 0]', 83.10, 'C', 'Term 1', '2024', 2),
(2, 'Jane Smith', '9A', 'English', '[88, 92, 95, 0, 0, 0]', '[90, 94, 0, 0, 0, 0]', '[87, 91, 93, 0, 0, 0]', '[89, 93, 0, 0, 0, 0]', '[92, 0, 0, 0, 0, 0]', '[88, 0, 0, 0, 0, 0]', 90.85, 'D', 'Term 1', '2024', 2),

-- Grade 10 Mathematics
(6, 'Sarah Wilson', '10A', 'Mathematics', '[92, 88, 95, 0, 0, 0]', '[94, 97, 0, 0, 0, 0]', '[89, 92, 95, 0, 0, 0]', '[91, 94, 0, 0, 0, 0]', '[93, 0, 0, 0, 0, 0]', '[90, 0, 0, 0, 0, 0]', 92.40, 'D', 'Term 1', '2024', 2),
(7, 'Peter Brown', '10B', 'Mathematics', '[75, 80, 83, 0, 0, 0]', '[78, 82, 0, 0, 0, 0]', '[76, 81, 84, 0, 0, 0]', '[77, 83, 0, 0, 0, 0]', '[80, 0, 0, 0, 0, 0]', '[75, 0, 0, 0, 0, 0]', 79.25, 'C', 'Term 1', '2024', 2);

-- Insert sample finance records
INSERT INTO finance (student_id, student_name, amount, date, status, description, payment_method, receipt_number, recorded_by) VALUES
-- Term 1 2024 School Fees
(1, 'John Doe', 500.00, '2024-01-10', 'Paid', 'Term 1 School Fees', 'Cash', 'RCP2024001', 1),
(2, 'Jane Smith', 500.00, '2024-01-12', 'Paid', 'Term 1 School Fees', 'Bank Transfer', 'RCP2024002', 1),
(3, 'Michael Johnson', 500.00, '2024-01-15', 'Pending', 'Term 1 School Fees', NULL, NULL, 1),
(4, 'Lina Paul', 500.00, '2024-01-08', 'Paid', 'Term 1 School Fees', 'Cash', 'RCP2024003', 1),
(5, 'Alex Sungi', 500.00, '2024-01-20', 'Pending', 'Term 1 School Fees', NULL, NULL, 1),
(6, 'Sarah Wilson', 550.00, '2024-01-05', 'Paid', 'Term 1 School Fees', 'Bank Transfer', 'RCP2024004', 1),
(7, 'Peter Brown', 550.00, '2024-01-18', 'Pending', 'Term 1 School Fees', NULL, NULL, 1),
(8, 'Mary Kora', 550.00, '2024-01-14', 'Paid', 'Term 1 School Fees', 'Cash', 'RCP2024005', 1),

-- Additional fees
(1, 'John Doe', 100.00, '2024-01-20', 'Paid', 'Activity Fee', 'Cash', 'RCP2024006', 1),
(2, 'Jane Smith', 100.00, '2024-01-22', 'Pending', 'Activity Fee', NULL, NULL, 1),
(6, 'Sarah Wilson', 150.00, '2024-01-15', 'Paid', 'Laboratory Fee', 'Bank Transfer', 'RCP2024007', 1);

-- Insert sample audit log entry
INSERT INTO audit_log (user_id, username, user_type, action, table_name, record_id, new_values, ip_address) VALUES
(1, 'admin', 'admin', 'LOGIN', 'users', 1, '{"login_time": "2024-01-01 00:00:00"}', '127.0.0.1'),
(2, 'staff', 'staff', 'LOGIN', 'users', 2, '{"login_time": "2024-01-01 08:00:00"}', '127.0.0.1');

-- ============================================================================
-- SETUP COMPLETE MESSAGE
-- ============================================================================
SELECT 
    'Database Setup Complete!' as message,
    (SELECT COUNT(*) FROM students WHERE is_active = TRUE) as total_students,
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
    (SELECT COUNT(*) FROM staff WHERE is_active = TRUE) as total_staff,
    (SELECT COUNT(*) FROM attendance) as attendance_records,
    (SELECT COUNT(*) FROM grades) as grade_records,
    (SELECT COUNT(*) FROM finance) as finance_records,
    '2024' as academic_year;

-- ============================================================================
-- DEFAULT LOGIN CREDENTIALS
-- ============================================================================
-- 
-- ADMIN ACCESS:
-- Username: admin
-- Password: admin123
-- 
-- STAFF ACCESS:  
-- Username: staff
-- Password: staff123
--
-- ============================================================================
