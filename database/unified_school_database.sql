-- Ialibu Secondary School Management System - Unified Database
-- Single database that captures ALL data for both Admin and Staff dashboards
-- Optimized for performance and comprehensive functionality

-- Create unified database
CREATE DATABASE IF NOT EXISTS ialibu_school_unified;
USE ialibu_school_unified;

-- ============================================================================
-- CORE TABLES - Foundation for all system functionality
-- ============================================================================

-- Users table - Central authentication and authorization for both dashboards
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_user_type (user_type),
    INDEX idx_active (is_active)
);

-- Students table - Core student information for both dashboards
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    grade ENUM('Grade 9', 'Grade 10', 'Grade 11', 'Grade 12') NOT NULL,
    class VARCHAR(10) NOT NULL,
    subjects JSON NOT NULL, -- Array of subjects
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_grade_class (grade, class),
    INDEX idx_active (is_active),
    INDEX idx_name (name),
    INDEX idx_student_id (student_id)
);

-- ============================================================================
-- ACADEMIC RECORDS - Used by both Admin and Staff dashboards
-- ============================================================================

-- Attendance records - Real-time synchronization between dashboards
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
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_date_student (date, student_id),
    INDEX idx_student_status (student_id, status),
    INDEX idx_date_status (date, status),
    UNIQUE KEY unique_attendance (date, student_id, subject)
);

-- Grades table - PNG Education Standards with array-based assessments
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    class VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    weekly_tests JSON, -- Array of test scores [0-6 tests]
    projects JSON, -- Array of project scores [0-6 projects]
    assignments JSON, -- Array of assignment scores [0-6 assignments]
    take_home_tests JSON, -- Array of take-home test scores [0-6 tests]
    open_book_tests JSON, -- Array of open-book test scores [0-6 tests]
    end_of_term_tests JSON, -- Array of end-of-term scores [0-6 tests]
    total_marks DECIMAL(5,2) NOT NULL,
    letter_grade ENUM('D', 'C', 'UP', 'P', 'F') NOT NULL,
    term ENUM('Term 1', 'Term 2', 'Term 3', 'Term 4') NOT NULL,
    academic_year VARCHAR(9) NOT NULL DEFAULT '2024',
    recorded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_student_subject_term (student_id, subject, term, academic_year),
    INDEX idx_class_subject (class, subject),
    INDEX idx_letter_grade (letter_grade),
    UNIQUE KEY unique_grade (student_id, subject, term, academic_year)
);

-- ============================================================================
-- FINANCIAL MANAGEMENT - Admin dashboard primary, Staff dashboard view-only
-- ============================================================================

-- Finance records - School fees and payments
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
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_student_status (student_id, status),
    INDEX idx_date_status (date, status),
    INDEX idx_amount (amount),
    INDEX idx_receipt (receipt_number)
);

-- ============================================================================
-- STAFF MANAGEMENT - Admin dashboard functionality
-- ============================================================================

-- Staff members table
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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_department (department),
    INDEX idx_active (is_active),
    INDEX idx_email (email)
);

-- ============================================================================
-- REPORTS SYSTEM - Comprehensive student reports for both dashboards
-- ============================================================================

-- Student reports - Complete report cards with automatic calculations
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
    
    -- Financial Status (auto-calculated from finance table)
    financial_status ENUM('Clear', 'Not Cleared') DEFAULT 'Not Cleared',
    outstanding_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Academic Performance (auto-calculated from grades table)
    gpa DECIMAL(3,2) DEFAULT 0,
    class_rank INT,
    grade_rank INT,
    total_subjects INT DEFAULT 0,
    
    -- Attendance Record (auto-calculated from attendance table)
    total_school_days INT DEFAULT 0,
    days_absent INT DEFAULT 0,
    days_present INT DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Comments and Signatures
    teacher_comments TEXT,
    class_teacher_signature VARCHAR(100),
    principal_signature VARCHAR(100),
    school_stamp BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_student_term_year (student_id, term, academic_year),
    INDEX idx_grade_class_term (grade, class, term, academic_year),
    INDEX idx_gpa (gpa),
    UNIQUE KEY unique_report (student_id, term, academic_year)
);

-- ============================================================================
-- SYSTEM MONITORING - Audit trail for both dashboards
-- ============================================================================

-- Audit log - Complete system activity tracking
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
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_action (user_id, action),
    INDEX idx_user_type_action (user_type, action),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- VIEWS - Optimized queries for dashboard performance
-- ============================================================================

-- Active students view - Primary data for both dashboards
CREATE VIEW v_active_students AS
SELECT 
    s.*,
    COUNT(DISTINCT g.subject) as enrolled_subjects,
    AVG(g.total_marks) as average_score,
    COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as days_present,
    COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as days_absent,
    ROUND(
        (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(a.id), 0), 2
    ) as attendance_rate
FROM students s
LEFT JOIN grades g ON s.id = g.student_id
LEFT JOIN attendance a ON s.id = a.student_id
WHERE s.is_active = TRUE
GROUP BY s.id;

-- Current term performance - Used by both dashboards
CREATE VIEW v_current_performance AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.grade,
    s.class,
    COUNT(g.id) as subjects_count,
    AVG(g.total_marks) as average_marks,
    COUNT(CASE WHEN g.letter_grade = 'D' THEN 1 END) as distinctions,
    COUNT(CASE WHEN g.letter_grade = 'C' THEN 1 END) as credits,
    COUNT(CASE WHEN g.letter_grade = 'F' THEN 1 END) as failures
FROM students s
LEFT JOIN grades g ON s.id = g.student_id AND g.term = 'Term 1' AND g.academic_year = '2024'
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.grade, s.class;

-- Financial overview - Primary for Admin, summary for Staff
CREATE VIEW v_financial_overview AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.grade,
    s.class,
    COALESCE(SUM(CASE WHEN f.status = 'Paid' THEN f.amount END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN f.status = 'Pending' THEN f.amount END), 0) as total_pending,
    COALESCE(SUM(f.amount), 0) as total_fees,
    CASE 
        WHEN COALESCE(SUM(CASE WHEN f.status = 'Pending' THEN f.amount END), 0) = 0 
        THEN 'Clear' 
        ELSE 'Not Cleared' 
    END as financial_status
FROM students s
LEFT JOIN finance f ON s.id = f.student_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.name, s.grade, s.class;

-- ============================================================================
-- STORED PROCEDURES - Business logic for both dashboards
-- ============================================================================

-- Calculate student GPA automatically
DELIMITER //
CREATE PROCEDURE sp_CalculateGPA(
    IN p_student_id INT, 
    IN p_term VARCHAR(10), 
    IN p_academic_year VARCHAR(9)
)
BEGIN
    DECLARE v_total_points DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_subjects INT DEFAULT 0;
    DECLARE v_gpa DECIMAL(3,2) DEFAULT 0;
    
    -- Calculate GPA based on PNG standards
    SELECT 
        SUM(CASE 
            WHEN letter_grade = 'D' THEN 4.0
            WHEN letter_grade = 'C' THEN 3.0
            WHEN letter_grade = 'UP' THEN 2.0
            WHEN letter_grade = 'P' THEN 1.0
            ELSE 0
        END),
        COUNT(*)
    INTO v_total_points, v_total_subjects
    FROM grades 
    WHERE student_id = p_student_id 
    AND term = p_term 
    AND academic_year = p_academic_year;
    
    IF v_total_subjects > 0 THEN
        SET v_gpa = v_total_points / v_total_subjects;
    END IF;
    
    SELECT v_gpa as calculated_gpa, v_total_subjects as total_subjects;
END //
DELIMITER ;

-- Calculate attendance percentage
DELIMITER //
CREATE PROCEDURE sp_CalculateAttendance(
    IN p_student_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    DECLARE v_total_days INT DEFAULT 0;
    DECLARE v_present_days INT DEFAULT 0;
    DECLARE v_percentage DECIMAL(5,2) DEFAULT 0;
    
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) as present
    INTO v_total_days, v_present_days
    FROM attendance 
    WHERE student_id = p_student_id 
    AND date BETWEEN p_start_date AND p_end_date;
    
    IF v_total_days > 0 THEN
        SET v_percentage = (v_present_days * 100.0) / v_total_days;
    END IF;
    
    SELECT 
        v_total_days as total_days,
        v_present_days as present_days,
        v_total_days - v_present_days as absent_days,
        v_percentage as attendance_percentage;
END //
DELIMITER ;

-- Update financial status automatically
DELIMITER //
CREATE PROCEDURE sp_UpdateFinancialStatus(IN p_student_id INT)
BEGIN
    DECLARE v_outstanding DECIMAL(10,2) DEFAULT 0;
    DECLARE v_status ENUM('Clear', 'Not Cleared');
    
    -- Calculate outstanding amount
    SELECT COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount END), 0)
    INTO v_outstanding
    FROM finance 
    WHERE student_id = p_student_id;
    
    -- Determine status
    IF v_outstanding = 0 THEN
        SET v_status = 'Clear';
    ELSE
        SET v_status = 'Not Cleared';
    END IF;
    
    -- Update all reports for this student
    UPDATE student_reports 
    SET 
        financial_status = v_status,
        outstanding_amount = v_outstanding,
        last_modified = CURRENT_TIMESTAMP
    WHERE student_id = p_student_id;
    
    SELECT v_outstanding as outstanding_amount, v_status as financial_status;
END //
DELIMITER ;

-- ============================================================================
-- FUNCTIONS - Utility functions for grade calculations
-- ============================================================================

-- Convert percentage to PNG letter grade
DELIMITER //
CREATE FUNCTION fn_GetLetterGrade(percentage DECIMAL(5,2)) 
RETURNS ENUM('D', 'C', 'UP', 'P', 'F')
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE grade ENUM('D', 'C', 'UP', 'P', 'F');
    
    IF percentage >= 85 THEN
        SET grade = 'D';    -- Distinction
    ELSEIF percentage >= 70 THEN
        SET grade = 'C';    -- Credit
    ELSEIF percentage >= 55 THEN
        SET grade = 'UP';   -- Ungraded Pass
    ELSEIF percentage >= 40 THEN
        SET grade = 'P';    -- Pass
    ELSE
        SET grade = 'F';    -- Fail
    END IF;
    
    RETURN grade;
END //
DELIMITER ;

-- Calculate weighted assessment score
DELIMITER //
CREATE FUNCTION fn_CalculateWeightedScore(
    weekly_avg DECIMAL(5,2),
    projects_avg DECIMAL(5,2),
    assignments_avg DECIMAL(5,2),
    takehome_avg DECIMAL(5,2),
    openbook_avg DECIMAL(5,2),
    endterm_avg DECIMAL(5,2)
) 
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE weighted_score DECIMAL(5,2);
    
    -- PNG Assessment weightings
    SET weighted_score = (
        (COALESCE(weekly_avg, 0) * 0.20) +      -- 20%
        (COALESCE(projects_avg, 0) * 0.25) +    -- 25%
        (COALESCE(assignments_avg, 0) * 0.20) + -- 20%
        (COALESCE(takehome_avg, 0) * 0.15) +    -- 15%
        (COALESCE(openbook_avg, 0) * 0.10) +    -- 10%
        (COALESCE(endterm_avg, 0) * 0.10)       -- 10%
    );
    
    RETURN ROUND(weighted_score, 2);
END //
DELIMITER ;

-- ============================================================================
-- TRIGGERS - Automatic data synchronization
-- ============================================================================

-- Auto-update grades when assessments change
DELIMITER //
CREATE TRIGGER tr_grades_before_update
BEFORE UPDATE ON grades
FOR EACH ROW
BEGIN
    DECLARE weekly_avg, projects_avg, assignments_avg DECIMAL(5,2) DEFAULT 0;
    DECLARE takehome_avg, openbook_avg, endterm_avg DECIMAL(5,2) DEFAULT 0;
    
    -- Calculate averages from JSON arrays (simplified - would need JSON functions in real implementation)
    SET NEW.total_marks = fn_CalculateWeightedScore(
        weekly_avg, projects_avg, assignments_avg,
        takehome_avg, openbook_avg, endterm_avg
    );
    
    SET NEW.letter_grade = fn_GetLetterGrade(NEW.total_marks);
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Log all changes for audit trail
DELIMITER //
CREATE TRIGGER tr_audit_students_insert
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, username, user_type, action, table_name, record_id, new_values)
    VALUES (1, 'system', 'admin', 'CREATE', 'students', NEW.id, JSON_OBJECT('name', NEW.name, 'grade', NEW.grade, 'class', NEW.class));
END //
DELIMITER ;

-- ============================================================================
-- SAMPLE DATA - Initial data for both dashboards
-- ============================================================================

-- Insert default users
INSERT INTO users (username, password_hash, email, first_name, last_name, user_type, department, position, permissions) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@ialibu.edu.pg', 'System', 'Administrator', 'admin', 'Administration', 'System Administrator', '["all"]'),
('staff', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff@ialibu.edu.pg', 'Demo', 'Teacher', 'staff', 'Academic', 'Teacher', '["students", "attendance", "grades", "reports"]');

-- Insert sample students (representing all grades and classes)
INSERT INTO students (name, grade, class, subjects, date_of_birth, gender, address, email, phone, guardian_name, guardian_phone, student_id) VALUES
('John Doe', 'Grade 9', '9A', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Religious Education", "Arts"]', '2007-05-15', 'Male', '123 Main St, Ialibu', 'john.doe@example.com', '123-456-7890', 'Robert Doe', '+675-234-5678', 'ISS2024001'),
('Jane Smith', 'Grade 9', '9A', '["Mathematics", "English", "Science", "Social Science", "Information Technology", "Personal Development", "Arts", "Family and Consumer Studies"]', '2008-03-22', 'Female', '456 Oak Ave, Ialibu', 'jane.smith@example.com', '123-456-7891', 'Mary Smith', '+675-345-6789', 'ISS2024002'),
('Michael Johnson', 'Grade 9', '9B', '["Mathematics", "English", "Science", "Business Studies", "Technology & Industrial Arts", "Personal Development", "Arts"]', '2006-11-08', 'Male', '789 Pine Rd, Ialibu', 'michael.johnson@example.com', '123-456-7892', 'James Johnson', '+675-456-7890', 'ISS2024003'),
('Sarah Wilson', 'Grade 10', '10A', '["Mathematics", "English", "Science", "Social Science", "Business Studies", "Personal Development", "Arts", "Information Technology"]', '2006-08-14', 'Female', '321 Elm St, Ialibu', 'sarah.wilson@example.com', '123-456-7893', 'David Wilson', '+675-567-8901', 'ISS2024004'),
('Peter Brown', 'Grade 10', '10B', '["Mathematics", "English", "Science", "Social Science", "Technology & Industrial Arts", "Personal Development", "Arts"]', '2006-12-03', 'Male', '654 Maple Ave, Ialibu', 'peter.brown@example.com', '123-456-7894', 'Linda Brown', '+675-678-9012', 'ISS2024005');

-- Insert sample staff
INSERT INTO staff (name, position, department, email, phone, salary, hire_date) VALUES
('James Anderson', 'Principal', 'Administration', 'j.anderson@ialibu.edu.pg', '+675-123-4567', 80000.00, '2020-01-15'),
('Mary Taylor', 'Vice Principal', 'Administration', 'm.taylor@ialibu.edu.pg', '+675-123-4568', 70000.00, '2020-02-01'),
('Robert Thomas', 'Mathematics Teacher', 'Science & Mathematics', 'r.thomas@ialibu.edu.pg', '+675-123-4569', 50000.00, '2021-01-10'),
('Susan Davis', 'English Teacher', 'Languages', 's.davis@ialibu.edu.pg', '+675-123-4570', 48000.00, '2021-03-15'),
('Michael Lee', 'Science Teacher', 'Science & Mathematics', 'm.lee@ialibu.edu.pg', '+675-123-4571', 52000.00, '2020-08-01');

-- Insert sample attendance records
INSERT INTO attendance (date, student_id, student_name, status, subject, notes, recorded_by) VALUES
('2024-01-15', 1, 'John Doe', 'Present', 'Mathematics', '', 2),
('2024-01-15', 2, 'Jane Smith', 'Present', 'Mathematics', '', 2),
('2024-01-15', 3, 'Michael Johnson', 'Absent', 'Mathematics', 'Sick', 2),
('2024-01-15', 4, 'Sarah Wilson', 'Present', 'Mathematics', '', 2),
('2024-01-15', 5, 'Peter Brown', 'Late', 'Mathematics', 'Transport delay', 2);

-- Insert sample grades
INSERT INTO grades (student_id, student_name, class, subject, weekly_tests, projects, assignments, take_home_tests, open_book_tests, end_of_term_tests, total_marks, letter_grade, term, academic_year, recorded_by) VALUES
(1, 'John Doe', '9A', 'Mathematics', '[85, 78, 92, 0, 0, 0]', '[88, 91, 0, 0, 0, 0]', '[82, 87, 90, 0, 0, 0]', '[85, 89, 0, 0, 0, 0]', '[87, 0, 0, 0, 0, 0]', '[84, 0, 0, 0, 0, 0]', 86.25, 'D', 'Term 1', '2024', 2),
(2, 'Jane Smith', '9A', 'Mathematics', '[78, 82, 85, 0, 0, 0]', '[85, 88, 0, 0, 0, 0]', '[80, 85, 87, 0, 0, 0]', '[82, 86, 0, 0, 0, 0]', '[84, 0, 0, 0, 0, 0]', '[81, 0, 0, 0, 0, 0]', 83.15, 'C', 'Term 1', '2024', 2),
(4, 'Sarah Wilson', '10A', 'Mathematics', '[92, 88, 95, 0, 0, 0]', '[94, 97, 0, 0, 0, 0]', '[89, 92, 95, 0, 0, 0]', '[91, 94, 0, 0, 0, 0]', '[93, 0, 0, 0, 0, 0]', '[90, 0, 0, 0, 0, 0]', 92.40, 'D', 'Term 1', '2024', 2);

-- Insert sample finance records
INSERT INTO finance (student_id, student_name, amount, date, status, description, payment_method, receipt_number, recorded_by) VALUES
(1, 'John Doe', 500.00, '2024-01-10', 'Paid', 'Term 1 School Fees', 'Cash', 'RCP2024001', 1),
(2, 'Jane Smith', 500.00, '2024-01-12', 'Paid', 'Term 1 School Fees', 'Bank Transfer', 'RCP2024002', 1),
(3, 'Michael Johnson', 500.00, '2024-01-15', 'Pending', 'Term 1 School Fees', NULL, NULL, 1),
(4, 'Sarah Wilson', 550.00, '2024-01-08', 'Paid', 'Term 1 School Fees', 'Cash', 'RCP2024003', 1),
(5, 'Peter Brown', 550.00, '2024-01-20', 'Pending', 'Term 1 School Fees', NULL, NULL, 1);

-- ============================================================================
-- INDEXES FOR PERFORMANCE - Optimized for both dashboard queries
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_student_grade_class_active ON students(grade, class, is_active);
CREATE INDEX idx_attendance_date_student_status ON attendance(date, student_id, status);
CREATE INDEX idx_grades_student_term_year ON grades(student_id, term, academic_year);
CREATE INDEX idx_finance_student_status_date ON finance(student_id, status, date);
CREATE INDEX idx_reports_grade_class_term_year ON student_reports(grade, class, term, academic_year);

-- Performance indexes for dashboard queries
CREATE INDEX idx_attendance_student_date_range ON attendance(student_id, date);
CREATE INDEX idx_grades_class_subject_term ON grades(class, subject, term, academic_year);
CREATE INDEX idx_finance_date_status_amount ON finance(date, status, amount);

-- ============================================================================
-- FINAL SETUP
-- ============================================================================

-- Set proper permissions and constraints
ALTER TABLE students AUTO_INCREMENT = 1001;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE grades AUTO_INCREMENT = 1;
ALTER TABLE finance AUTO_INCREMENT = 1;
ALTER TABLE staff AUTO_INCREMENT = 1;
ALTER TABLE student_reports AUTO_INCREMENT = 1;

-- Create admin user session for testing
INSERT INTO audit_log (user_id, username, user_type, action, table_name, record_id, new_values, ip_address) 
VALUES (1, 'admin', 'admin', 'LOGIN', 'users', 1, '{"login_time": "2024-01-01 00:00:00"}', '127.0.0.1');

-- Database setup complete
SELECT 'Unified Ialibu Secondary School Database Created Successfully!' as message,
       (SELECT COUNT(*) FROM students WHERE is_active = TRUE) as total_students,
       (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
       (SELECT COUNT(*) FROM staff WHERE is_active = TRUE) as total_staff,
       '2024' as academic_year;
