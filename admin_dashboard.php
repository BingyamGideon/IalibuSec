<?php
require_once 'config/database.php';
requireAdmin();

$current_user = getCurrentUser();

// Get dashboard statistics
try {
    // Total students
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM students");
    $total_students = $stmt->fetch()['total'];
    
    // Average grade
    $stmt = $pdo->query("SELECT AVG(percentage) as avg_grade FROM grades");
    $avg_grade = round($stmt->fetch()['avg_grade'] ?? 0, 1);
    
    // Total revenue (paid only)
    $stmt = $pdo->query("SELECT SUM(amount) as total_revenue FROM finance WHERE status = 'Paid'");
    $total_revenue = $stmt->fetch()['total_revenue'] ?? 0;
    
    // Attendance rate
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
        FROM attendance");
    $attendance_data = $stmt->fetch();
    $attendance_rate = $attendance_data['total_records'] > 0 
        ? round(($attendance_data['present_count'] / $attendance_data['total_records']) * 100, 1) 
        : 0;
    
    // Total staff
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM staff");
    $total_staff = $stmt->fetch()['total'];
    
    // Pending payments
    $stmt = $pdo->query("SELECT COUNT(*) as pending FROM finance WHERE status = 'Pending'");
    $pending_payments = $stmt->fetch()['pending'];
    
} catch (PDOException $e) {
    $error = "Error loading dashboard data: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Ialibu Secondary School</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="dashboard">
        <!-- Header -->
        <header class="dashboard-header">
            <h1>Ialibu Secondary School - Admin Dashboard</h1>
            <div class="user-info">
                <span class="badge badge-secondary">Administrator: <?php echo htmlspecialchars($current_user['full_name']); ?></span>
                <a href="logout.php" class="btn btn-outline btn-sm">Logout</a>
            </div>
        </header>

        <div class="dashboard-content">
            <!-- Sidebar -->
            <nav class="sidebar">
                <ul class="sidebar-menu">
                    <li class="nav-item active" id="nav-dashboard" data-section="dashboard-section">
                        <i class="fas fa-home"></i> Dashboard
                    </li>
                    <li class="nav-item" id="nav-students" data-section="students-section">
                        <i class="fas fa-user-graduate"></i> Students
                    </li>
                    <li class="nav-item" id="nav-attendance" data-section="attendance-section">
                        <i class="fas fa-calendar-check"></i> Attendance
                    </li>
                    <li class="nav-item" id="nav-grades" data-section="grades-section">
                        <i class="fas fa-chart-line"></i> Grades
                    </li>
                    <li class="nav-item" id="nav-finance" data-section="finance-section">
                        <i class="fas fa-money-bill-wave"></i> Finance
                    </li>
                    <li class="nav-item" id="nav-staff" data-section="staff-section">
                        <i class="fas fa-users"></i> Staff
                    </li>
                    <li class="nav-item" id="nav-reports" data-section="reports-section">
                        <i class="fas fa-file-alt"></i> Reports
                    </li>
                </ul>
            </nav>

            <!-- Main Content -->
            <main class="main-content">
                <!-- Dashboard Section -->
                <div id="dashboard-section" class="dashboard-section" style="display: block;">
                    <h2>Admin Dashboard Overview</h2>
                    
                    <!-- Statistics Cards -->
                    <div class="stats-container">
                        <div class="stat-card">
                            <h3><i class="fas fa-users"></i> Total Students</h3>
                            <div class="number" id="total-students"><?php echo $total_students; ?></div>
                            <div class="subtitle">Across all grades</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-chart-line"></i> Average Grade</h3>
                            <div class="number" id="avg-grade"><?php echo $avg_grade; ?>%</div>
                            <div class="subtitle">School-wide average</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-money-bill-wave"></i> Total Revenue</h3>
                            <div class="number" id="total-revenue">K<?php echo number_format($total_revenue, 2); ?></div>
                            <div class="subtitle">This academic year</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-calendar-check"></i> Attendance Rate</h3>
                            <div class="number" id="attendance-rate"><?php echo $attendance_rate; ?>%</div>
                            <div class="subtitle">This month</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-user-tie"></i> Total Staff</h3>
                            <div class="number" id="total-staff"><?php echo $total_staff; ?></div>
                            <div class="subtitle">Active staff members</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-exclamation-triangle"></i> Pending Payments</h3>
                            <div class="number" id="pending-payments"><?php echo $pending_payments; ?></div>
                            <div class="subtitle">Require attention</div>
                        </div>
                    </div>

                    <!-- Quick Access Cards -->
                    <div class="stats-container">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-user-graduate"></i> Student Management</h3>
                            </div>
                            <div class="card-body">
                                <p>Manage student records, enrollments, and academic information.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('students-section'); setActiveNavItem('nav-students');">
                                    Manage Students
                                </button>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-money-bill-wave"></i> Financial Management</h3>
                            </div>
                            <div class="card-body">
                                <p>Track payments, fees, and financial records for all students.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('finance-section'); setActiveNavItem('nav-finance');">
                                    Manage Finances
                                </button>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-users"></i> Staff Management</h3>
                            </div>
                            <div class="card-body">
                                <p>Manage staff records, roles, and administrative functions.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('staff-section'); setActiveNavItem('nav-staff');">
                                    Manage Staff
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Students Section -->
                <div id="students-section" class="dashboard-section" style="display: none;">
                    <div class="d-flex justify-between align-center mb-4">
                        <h2>Student Management</h2>
                        <button class="btn" onclick="openModal('student-modal')">
                            <i class="fas fa-plus"></i> Add Student
                        </button>
                    </div>

                    <!-- Search Bar -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="student-search" class="search-input" placeholder="Search students by name, grade, or class..." data-table="students-table">
                    </div>

                    <!-- Students Table -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table" id="students-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Grade</th>
                                            <th>Class</th>
                                            <th>Date of Birth</th>
                                            <th>Gender</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        try {
                                            $stmt = $pdo->query("SELECT * FROM students ORDER BY grade, class, student_name");
                                            while ($student = $stmt->fetch()): ?>
                                                <tr>
                                                    <td><?php echo $student['id']; ?></td>
                                                    <td><?php echo htmlspecialchars($student['student_name']); ?></td>
                                                    <td><?php echo $student['grade']; ?></td>
                                                    <td><?php echo $student['class']; ?></td>
                                                    <td><?php echo $student['date_of_birth']; ?></td>
                                                    <td><?php echo $student['gender']; ?></td>
                                                    <td class="action-buttons">
                                                        <button class="action-btn edit-btn" onclick="editStudent(<?php echo $student['id']; ?>)">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="action-btn delete-btn" data-url="actions/delete_student.php?id=<?php echo $student['id']; ?>" data-item="student">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            <?php endwhile;
                                        } catch (PDOException $e) {
                                            echo "<tr><td colspan='7'>Error loading students: " . $e->getMessage() . "</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Attendance Section -->
                <div id="attendance-section" class="dashboard-section" style="display: none;">
                    <div class="d-flex justify-between align-center mb-4">
                        <h2>Attendance Records</h2>
                        <button class="btn" onclick="openModal('attendance-modal')">
                            <i class="fas fa-calendar-plus"></i> Record Attendance
                        </button>
                    </div>

                    <!-- Search Bar -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="attendance-search" class="search-input" placeholder="Search by student name, date, or status..." data-table="attendance-table">
                    </div>

                    <!-- Attendance Table -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table" id="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Student Name</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        try {
                                            $stmt = $pdo->query("
                                                SELECT a.*, s.student_name 
                                                FROM attendance a 
                                                JOIN students s ON a.student_id = s.id 
                                                ORDER BY a.attendance_date DESC, s.student_name
                                            ");
                                            while ($record = $stmt->fetch()): ?>
                                                <tr>
                                                    <td><?php echo $record['attendance_date']; ?></td>
                                                    <td><?php echo htmlspecialchars($record['student_name']); ?></td>
                                                    <td><?php echo htmlspecialchars($record['subject']); ?></td>
                                                    <td>
                                                        <span class="badge badge-<?php echo $record['status'] === 'Present' ? 'success' : ($record['status'] === 'Absent' ? 'danger' : 'warning'); ?>">
                                                            <?php echo $record['status']; ?>
                                                        </span>
                                                    </td>
                                                    <td><?php echo htmlspecialchars($record['notes'] ?? ''); ?></td>
                                                    <td class="action-buttons">
                                                        <button class="action-btn edit-btn" onclick="editAttendance(<?php echo $record['id']; ?>)">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="action-btn delete-btn" data-url="actions/delete_attendance.php?id=<?php echo $record['id']; ?>" data-item="attendance record">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            <?php endwhile;
                                        } catch (PDOException $e) {
                                            echo "<tr><td colspan='6'>Error loading attendance: " . $e->getMessage() . "</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Grades Section -->
                <div id="grades-section" class="dashboard-section" style="display: none;">
                    <div class="d-flex justify-between align-center mb-4">
                        <h2>Academic Performance</h2>
                        <button class="btn" onclick="openModal('grade-modal')">
                            <i class="fas fa-plus"></i> Add Grade
                        </button>
                    </div>

                    <!-- Search Bar -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="grade-search" class="search-input" placeholder="Search by student name, subject, or assignment..." data-table="grades-table">
                    </div>

                    <!-- Grades Table -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table" id="grades-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Subject</th>
                                            <th>Assignment</th>
                                            <th>Score</th>
                                            <th>Percentage</th>
                                            <th>Term</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        try {
                                            $stmt = $pdo->query("
                                                SELECT g.*, s.student_name 
                                                FROM grades g 
                                                JOIN students s ON g.student_id = s.id 
                                                ORDER BY s.student_name, g.subject
                                            ");
                                            while ($grade = $stmt->fetch()): ?>
                                                <tr>
                                                    <td><?php echo htmlspecialchars($grade['student_name']); ?></td>
                                                    <td><?php echo htmlspecialchars($grade['subject']); ?></td>
                                                    <td><?php echo htmlspecialchars($grade['assignment_name']); ?></td>
                                                    <td><?php echo $grade['letter_grade']; ?></td>
                                                    <td><?php echo $grade['percentage']; ?>%</td>
                                                    <td><?php echo $grade['term']; ?></td>
                                                    <td class="action-buttons">
                                                        <button class="action-btn edit-btn" onclick="editGrade(<?php echo $grade['id']; ?>)">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="action-btn delete-btn" data-url="actions/delete_grade.php?id=<?php echo $grade['id']; ?>" data-item="grade">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            <?php endwhile;
                                        } catch (PDOException $e) {
                                            echo "<tr><td colspan='7'>Error loading grades: " . $e->getMessage() . "</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Finance Section -->
                <div id="finance-section" class="dashboard-section" style="display: none;">
                    <div class="d-flex justify-between align-center mb-4">
                        <h2>Financial Records</h2>
                        <button class="btn" onclick="openModal('finance-modal')">
                            <i class="fas fa-plus"></i> Add Payment
                        </button>
                    </div>

                    <!-- Search Bar -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="finance-search" class="search-input" placeholder="Search by student name, description, or status..." data-table="finance-table">
                    </div>

                    <!-- Finance Table -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table" id="finance-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        try {
                                            $stmt = $pdo->query("
                                                SELECT f.*, s.student_name 
                                                FROM finance f 
                                                JOIN students s ON f.student_id = s.id 
                                                ORDER BY f.payment_date DESC
                                            ");
                                            while ($payment = $stmt->fetch()): ?>
                                                <tr>
                                                    <td><?php echo htmlspecialchars($payment['student_name']); ?></td>
                                                    <td><?php echo htmlspecialchars($payment['description']); ?></td>
                                                    <td>K<?php echo number_format($payment['amount'], 2); ?></td>
                                                    <td><?php echo $payment['payment_date']; ?></td>
                                                    <td>
                                                        <span class="badge badge-<?php echo $payment['status'] === 'Paid' ? 'success' : 'warning'; ?>">
                                                            <?php echo $payment['status']; ?>
                                                        </span>
                                                    </td>
                                                    <td class="action-buttons">
                                                        <button class="action-btn edit-btn" onclick="editFinance(<?php echo $payment['id']; ?>)">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="action-btn delete-btn" data-url="actions/delete_finance.php?id=<?php echo $payment['id']; ?>" data-item="payment record">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            <?php endwhile;
                                        } catch (PDOException $e) {
                                            echo "<tr><td colspan='6'>Error loading finance records: " . $e->getMessage() . "</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Staff Section -->
                <div id="staff-section" class="dashboard-section" style="display: none;">
                    <div class="d-flex justify-between align-center mb-4">
                        <h2>Staff Management</h2>
                        <button class="btn" onclick="openModal('staff-modal')">
                            <i class="fas fa-plus"></i> Add Staff
                        </button>
                    </div>

                    <!-- Search Bar -->
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="staff-search" class="search-input" placeholder="Search by name, position, or department..." data-table="staff-table">
                    </div>

                    <!-- Staff Table -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table" id="staff-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Position</th>
                                            <th>Department</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        try {
                                            $stmt = $pdo->query("SELECT * FROM staff ORDER BY staff_name");
                                            while ($member = $stmt->fetch()): ?>
                                                <tr>
                                                    <td><?php echo $member['id']; ?></td>
                                                    <td><?php echo htmlspecialchars($member['staff_name']); ?></td>
                                                    <td><?php echo htmlspecialchars($member['position']); ?></td>
                                                    <td><?php echo $member['department']; ?></td>
                                                    <td><?php echo htmlspecialchars($member['email']); ?></td>
                                                    <td><?php echo htmlspecialchars($member['phone']); ?></td>
                                                    <td class="action-buttons">
                                                        <button class="action-btn edit-btn" onclick="editStaff(<?php echo $member['id']; ?>)">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="action-btn delete-btn" data-url="actions/delete_staff.php?id=<?php echo $member['id']; ?>" data-item="staff member">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            <?php endwhile;
                                        } catch (PDOException $e) {
                                            echo "<tr><td colspan='7'>Error loading staff: " . $e->getMessage() . "</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reports Section -->
                <div id="reports-section" class="dashboard-section" style="display: none;">
                    <h2>Student Reports</h2>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Generate Reports</h3>
                        </div>
                        <div class="card-body">
                            <p>Generate comprehensive reports for students, attendance, grades, and financial records.</p>
                            <div class="stats-container">
                                <button class="btn btn-outline" onclick="exportTableToCSV('students-table', 'students_report.csv')">
                                    <i class="fas fa-download"></i> Student Performance Report
                                </button>
                                <button class="btn btn-outline" onclick="exportTableToCSV('attendance-table', 'attendance_report.csv')">
                                    <i class="fas fa-download"></i> Attendance Summary
                                </button>
                                <button class="btn btn-outline" onclick="exportTableToCSV('finance-table', 'financial_report.csv')">
                                    <i class="fas fa-download"></i> Financial Report
                                </button>
                                <button class="btn btn-outline" onclick="exportTableToCSV('staff-table', 'staff_report.csv')">
                                    <i class="fas fa-download"></i> Staff Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Include modal files here -->
    <?php include 'modals/student_modal.php'; ?>
    <?php include 'modals/attendance_modal.php'; ?>
    <?php include 'modals/grade_modal.php'; ?>
    <?php include 'modals/finance_modal.php'; ?>
    <?php include 'modals/staff_modal.php'; ?>

    <!-- Notification -->
    <div id="notification" class="notification"></div>

    <script src="assets/js/main.js"></script>
    <script src="assets/js/admin.js"></script>
</body>
</html>
