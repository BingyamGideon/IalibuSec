// Unified Database Configuration for Ialibu Secondary School Management System
// Single database configuration that serves both Admin and Staff dashboards

const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ialibu_school_unified',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Connection pool settings for performance
  connectionLimit: 100,
  queueLimit: 0,
  // Enable multiple statements for complex queries
  multipleStatements: true
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Promisify for async/await usage
const promisePool = pool.promise();

// Database utility functions
class UnifiedDatabase {
  constructor() {
    this.pool = promisePool;
  }

  // ============================================================================
  // STUDENT OPERATIONS - Used by both Admin and Staff dashboards
  // ============================================================================

  // Get all active students with performance metrics
  async getAllStudents() {
    const [rows] = await this.pool.execute(`
      SELECT s.*, 
             COUNT(DISTINCT g.subject) as enrolled_subjects,
             ROUND(AVG(g.total_marks), 2) as average_score,
             COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as days_present,
             COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as days_absent,
             ROUND(
               (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0) / 
               NULLIF(COUNT(a.id), 0), 2
             ) as attendance_rate
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id AND g.academic_year = '2024'
      LEFT JOIN attendance a ON s.id = a.student_id 
      WHERE s.is_active = TRUE
      GROUP BY s.id
      ORDER BY s.grade, s.class, s.name
    `);
    return rows;
  }

  // Get students by grade and class (for filtering)
  async getStudentsByGradeClass(grade = null, class_name = null) {
    let query = `
      SELECT s.*, 
             COUNT(DISTINCT g.subject) as enrolled_subjects,
             ROUND(AVG(g.total_marks), 2) as average_score
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id AND g.academic_year = '2024'
      WHERE s.is_active = TRUE
    `;
    
    const params = [];
    if (grade) {
      query += ' AND s.grade = ?';
      params.push(grade);
    }
    if (class_name) {
      query += ' AND s.class = ?';
      params.push(class_name);
    }
    
    query += ' GROUP BY s.id ORDER BY s.name';
    
    const [rows] = await this.pool.execute(query, params);
    return rows;
  }

  // Add new student
  async addStudent(studentData) {
    const [result] = await this.pool.execute(`
      INSERT INTO students (name, grade, class, subjects, date_of_birth, gender, 
                           address, email, phone, guardian_name, guardian_phone, student_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentData.name, studentData.grade, studentData.class,
      JSON.stringify(studentData.subjects), studentData.dateOfBirth,
      studentData.gender, studentData.address, studentData.email,
      studentData.phone, studentData.guardianName, studentData.guardianPhone,
      studentData.studentId
    ]);
    return result.insertId;
  }

  // Update student information
  async updateStudent(studentId, studentData) {
    const [result] = await this.pool.execute(`
      UPDATE students 
      SET name = ?, grade = ?, class = ?, subjects = ?, date_of_birth = ?, 
          gender = ?, address = ?, email = ?, phone = ?, guardian_name = ?, 
          guardian_phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = TRUE
    `, [
      studentData.name, studentData.grade, studentData.class,
      JSON.stringify(studentData.subjects), studentData.dateOfBirth,
      studentData.gender, studentData.address, studentData.email,
      studentData.phone, studentData.guardianName, studentData.guardianPhone,
      studentId
    ]);
    return result.affectedRows > 0;
  }

  // ============================================================================
  // ATTENDANCE OPERATIONS - Real-time sync between dashboards
  // ============================================================================

  // Get attendance records with filtering
  async getAttendance(filters = {}) {
    let query = `
      SELECT a.*, s.grade, s.class
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE s.is_active = TRUE
    `;
    
    const params = [];
    
    if (filters.startDate) {
      query += ' AND a.date >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND a.date <= ?';
      params.push(filters.endDate);
    }
    
    if (filters.grade) {
      query += ' AND s.grade = ?';
      params.push(filters.grade);
    }
    
    if (filters.class) {
      query += ' AND s.class = ?';
      params.push(filters.class);
    }
    
    query += ' ORDER BY a.date DESC, s.grade, s.class, s.name';
    
    const [rows] = await this.pool.execute(query, params);
    return rows;
  }

  // Record attendance for multiple students
  async recordAttendance(attendanceData, recordedBy) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const record of attendanceData) {
        await connection.execute(`
          INSERT INTO attendance (date, student_id, student_name, status, subject, notes, recorded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          status = VALUES(status), 
          notes = VALUES(notes), 
          updated_at = CURRENT_TIMESTAMP
        `, [
          record.date, record.studentId, record.studentName,
          record.status, record.subject, record.notes, recordedBy
        ]);
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get student attendance statistics
  async getStudentAttendanceStats(studentId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days,
        ROUND(
          (COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) * 100.0) / 
          COUNT(*), 2
        ) as attendance_percentage
      FROM attendance 
      WHERE student_id = ?
    `;
    
    const params = [studentId];
    
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    
    const [rows] = await this.pool.execute(query, params);
    return rows[0] || { total_days: 0, present_days: 0, absent_days: 0, attendance_percentage: 0 };
  }

  // ============================================================================
  // GRADES OPERATIONS - Advanced assessment system
  // ============================================================================

  // Get grades with filtering
  async getGrades(filters = {}) {
    let query = `
      SELECT g.*, s.grade as student_grade
      FROM grades g
      JOIN students s ON g.student_id = s.id
      WHERE s.is_active = TRUE
    `;
    
    const params = [];
    
    if (filters.grade) {
      query += ' AND s.grade = ?';
      params.push(filters.grade);
    }
    
    if (filters.class) {
      query += ' AND g.class = ?';
      params.push(filters.class);
    }
    
    if (filters.subject) {
      query += ' AND g.subject = ?';
      params.push(filters.subject);
    }
    
    if (filters.term) {
      query += ' AND g.term = ?';
      params.push(filters.term);
    }
    
    query += ' ORDER BY s.grade, g.class, g.subject, s.name';
    
    const [rows] = await this.pool.execute(query, params);
    return rows;
  }

  // Add or update grade record
  async saveGrade(gradeData, recordedBy) {
    const [result] = await this.pool.execute(`
      INSERT INTO grades (
        student_id, student_name, class, subject, weekly_tests, projects, 
        assignments, take_home_tests, open_book_tests, end_of_term_tests,
        total_marks, letter_grade, term, academic_year, recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      weekly_tests = VALUES(weekly_tests),
      projects = VALUES(projects),
      assignments = VALUES(assignments),
      take_home_tests = VALUES(take_home_tests),
      open_book_tests = VALUES(open_book_tests),
      end_of_term_tests = VALUES(end_of_term_tests),
      total_marks = VALUES(total_marks),
      letter_grade = VALUES(letter_grade),
      updated_at = CURRENT_TIMESTAMP
    `, [
      gradeData.studentId, gradeData.studentName, gradeData.class,
      gradeData.subject, JSON.stringify(gradeData.weeklyTests),
      JSON.stringify(gradeData.projects), JSON.stringify(gradeData.assignments),
      JSON.stringify(gradeData.takeHomeTests), JSON.stringify(gradeData.openBookTests),
      JSON.stringify(gradeData.endOfTermTests), gradeData.totalMarks,
      gradeData.letterGrade, gradeData.term, gradeData.academicYear, recordedBy
    ]);
    return result.insertId || result.affectedRows > 0;
  }

  // ============================================================================
  // FINANCE OPERATIONS - School fees management
  // ============================================================================

  // Get finance records with filtering
  async getFinanceRecords(filters = {}) {
    let query = `
      SELECT f.*, s.grade, s.class
      FROM finance f
      JOIN students s ON f.student_id = s.id
      WHERE s.is_active = TRUE
    `;
    
    const params = [];
    
    if (filters.grade) {
      query += ' AND s.grade = ?';
      params.push(filters.grade);
    }
    
    if (filters.class) {
      query += ' AND s.class = ?';
      params.push(filters.class);
    }
    
    if (filters.status) {
      query += ' AND f.status = ?';
      params.push(filters.status);
    }
    
    if (filters.startDate) {
      query += ' AND f.date >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND f.date <= ?';
      params.push(filters.endDate);
    }
    
    query += ' ORDER BY f.date DESC, s.grade, s.class, s.name';
    
    const [rows] = await this.pool.execute(query, params);
    return rows;
  }

  // Add finance record
  async addFinanceRecord(financeData, recordedBy) {
    const [result] = await this.pool.execute(`
      INSERT INTO finance (student_id, student_name, amount, date, status, 
                          description, payment_method, receipt_number, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      financeData.studentId, financeData.studentName, financeData.amount,
      financeData.date, financeData.status, financeData.description,
      financeData.paymentMethod, financeData.receiptNumber, recordedBy
    ]);
    return result.insertId;
  }

  // Update payment status
  async updatePaymentStatus(paymentId, status, paymentMethod = null, receiptNumber = null) {
    const [result] = await this.pool.execute(`
      UPDATE finance 
      SET status = ?, payment_method = ?, receipt_number = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, paymentMethod, receiptNumber, paymentId]);
    return result.affectedRows > 0;
  }

  // ============================================================================
  // STAFF OPERATIONS - Admin dashboard functionality
  // ============================================================================

  // Get all staff members
  async getAllStaff() {
    const [rows] = await this.pool.execute(`
      SELECT s.*, u.username, u.email as user_email, u.is_active as user_active
      FROM staff s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE
      ORDER BY s.department, s.position, s.name
    `);
    return rows;
  }

  // Add staff member
  async addStaff(staffData) {
    const [result] = await this.pool.execute(`
      INSERT INTO staff (name, position, department, email, phone, salary, hire_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      staffData.name, staffData.position, staffData.department,
      staffData.email, staffData.phone, staffData.salary, staffData.hireDate
    ]);
    return result.insertId;
  }

  // ============================================================================
  // REPORTS OPERATIONS - Comprehensive report generation
  // ============================================================================

  // Generate student report card
  async generateStudentReport(studentId, term, academicYear, createdBy) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get student information
      const [studentInfo] = await connection.execute(`
        SELECT * FROM students WHERE id = ? AND is_active = TRUE
      `, [studentId]);
      
      if (studentInfo.length === 0) {
        throw new Error('Student not found');
      }
      
      const student = studentInfo[0];
      
      // Calculate GPA and academic performance
      const [gradeResults] = await connection.execute(`
        CALL sp_CalculateGPA(?, ?, ?)
      `, [studentId, term, academicYear]);
      
      // Calculate attendance statistics
      const [attendanceResults] = await connection.execute(`
        CALL sp_CalculateAttendance(?, ?, ?)
      `, [studentId, `${academicYear}-01-01`, `${academicYear}-12-31`]);
      
      // Get financial status
      const [financeResults] = await connection.execute(`
        CALL sp_UpdateFinancialStatus(?)
      `, [studentId]);
      
      // Create or update report
      const [reportResult] = await connection.execute(`
        INSERT INTO student_reports (
          student_id, student_name, gender, grade, class, student_number,
          term, academic_year, gpa, total_school_days, days_absent, 
          days_present, attendance_percentage, financial_status, 
          outstanding_amount, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        gpa = VALUES(gpa),
        total_school_days = VALUES(total_school_days),
        days_absent = VALUES(days_absent),
        days_present = VALUES(days_present),
        attendance_percentage = VALUES(attendance_percentage),
        financial_status = VALUES(financial_status),
        outstanding_amount = VALUES(outstanding_amount),
        last_modified = CURRENT_TIMESTAMP
      `, [
        studentId, student.name, student.gender, student.grade, student.class,
        student.student_id, term, academicYear, gradeResults[0]?.calculated_gpa || 0,
        attendanceResults[0]?.total_days || 0, attendanceResults[0]?.absent_days || 0,
        attendanceResults[0]?.present_days || 0, attendanceResults[0]?.attendance_percentage || 0,
        financeResults[0]?.financial_status || 'Not Cleared',
        financeResults[0]?.outstanding_amount || 0, createdBy
      ]);
      
      await connection.commit();
      return reportResult.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ============================================================================
  // DASHBOARD STATISTICS - Real-time analytics for both dashboards
  // ============================================================================

  // Get comprehensive dashboard statistics
  async getDashboardStats() {
    const [stats] = await this.pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE is_active = TRUE) as total_students,
        (SELECT COUNT(*) FROM staff WHERE is_active = TRUE) as total_staff,
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM attendance WHERE date = CURDATE()) as today_attendance,
        (SELECT COUNT(*) FROM finance WHERE status = 'Pending') as pending_payments,
        (SELECT COALESCE(SUM(amount), 0) FROM finance WHERE status = 'Paid' AND YEAR(date) = YEAR(CURDATE())) as total_revenue_year,
        (SELECT COUNT(*) FROM grades WHERE term = 'Term 1' AND academic_year = '2024') as current_term_grades
    `);
    
    return stats[0];
  }

  // Get grade distribution for analytics
  async getGradeDistribution(term = 'Term 1', academicYear = '2024') {
    const [distribution] = await this.pool.execute(`
      SELECT 
        letter_grade,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM grades WHERE term = ? AND academic_year = ?), 2) as percentage
      FROM grades 
      WHERE term = ? AND academic_year = ?
      GROUP BY letter_grade
      ORDER BY 
        CASE letter_grade 
          WHEN 'D' THEN 1 
          WHEN 'C' THEN 2 
          WHEN 'UP' THEN 3 
          WHEN 'P' THEN 4 
          WHEN 'F' THEN 5 
        END
    `, [term, academicYear, term, academicYear]);
    
    return distribution;
  }

  // Close database connection
  async close() {
    await this.pool.end();
  }
}

module.exports = {
  UnifiedDatabase,
  dbConfig
};
