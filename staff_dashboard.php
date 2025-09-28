<?php
require_once 'config/database.php';
requireStaff();

$current_user = getCurrentUser();

// Get dashboard statistics for staff (limited view)
try {
    // Total students for staff view (simplified - could be filtered by assigned classes)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM students");
    $total_students = $stmt->fetch()['total'];
    
    // Average grade for staff classes
    $stmt = $pdo->query("SELECT AVG(percentage) as avg_grade FROM grades");
    $avg_grade = round($stmt->fetch()['avg_grade'] ?? 0, 1);
    
    // Attendance rate for staff
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
        FROM attendance");
    $attendance_data = $stmt->fetch();
    $attendance_rate = $attendance_data['total_records'] > 0 
        ? round(($attendance_data['present_count'] / $attendance_data['total_records']) * 100, 1) 
        : 0;
    
    // Number of assigned classes (simplified)
    $assigned_classes = 3;
    
} catch (PDOException $e) {
    $error = "Error loading dashboard data: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Dashboard - Ialibu Secondary School</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="dashboard">
        <!-- Header -->
        <header class="dashboard-header">
            <h1>Ialibu Secondary School - Staff Dashboard</h1>
            <div class="user-info">
                <span class="badge badge-secondary">Staff: <?php echo htmlspecialchars($current_user['full_name']); ?></span>
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
                        <i class="fas fa-user-graduate"></i> My Students
                    </li>
                    <li class="nav-item" id="nav-attendance" data-section="attendance-section">
                        <i class="fas fa-calendar-check"></i> Attendance
                    </li>
                    <li class="nav-item" id="nav-grades" data-section="grades-section">
                        <i class="fas fa-chart-line"></i> Grades
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
                    <h2>Staff Dashboard Overview</h2>
                    
                    <!-- Statistics Cards -->
                    <div class="stats-container">
                        <div class="stat-card">
                            <h3><i class="fas fa-users"></i> My Students</h3>
                            <div class="number" id="my-students"><?php echo $total_students; ?></div>
                            <div class="subtitle">Students assigned to you</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-chart-line"></i> Average Grade</h3>
                            <div class="number" id="avg-grade"><?php echo $avg_grade; ?>%</div>
                            <div class="subtitle">Your classes average</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-calendar-check"></i> Attendance Rate</h3>
                            <div class="number" id="attendance-rate"><?php echo $attendance_rate; ?>%</div>
                            <div class="subtitle">Your classes this month</div>
                        </div>
                        
                        <div class="stat-card">
                            <h3><i class="fas fa-chalkboard-teacher"></i> Assigned Classes</h3>
                            <div class="number" id="assigned-classes"><?php echo $assigned_classes; ?></div>
                            <div class="subtitle">Classes you teach</div>
                        </div>
                    </div>

                    <!-- Quick Access Cards -->
                    <div class="stats-container">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-user-graduate"></i> My Students</h3>
                            </div>
                            <div class="card-body">
                                <p>View and manage information for students in your assigned classes.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('students-section'); setActiveNavItem('nav-students');">
                                    View My Students
                                </button>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-calendar-check"></i> Attendance Management</h3>
                            </div>
                            <div class="card-body">
                                <p>Record and track attendance for your assigned classes.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('attendance-section'); setActiveNavItem('nav-attendance');">
                                    Manage Attendance
                                </button>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-chart-line"></i> Grade Management</h3>
                            </div>
                            <div class="card-body">
                                <p>Enter and update grades for students in your classes.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('grades-section'); setActiveNavItem('nav-grades');">
                                    Manage Grades
                                </button>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-file-alt"></i> Student Reports</h3>
                            </div>
                            <div class="card-body">
                                <p>Generate reports for your students and classes.</p>
                                <button class="btn w-100 mt-3" onclick="showSection('reports-section'); setActiveNavItem('nav-reports');">
                                    View Reports
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Access Section -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Quick Access</h3>
                        </div>
                        <div class="card-body">
                            <div class="stats-container">
                                <div class="text-center" style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <h4>Today's Schedule</h4>
                                    <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">
                                        Grade 10A - Mathematics<br>
                                        Grade 11B - Physics<br>
                                        Grade 9A - General Science
                                    </p>
                                </div>
                                <div class="text-center" style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <h4>Recent Activity</h4>
                                    <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">
                                        15 grades entered<br>
                                        3 attendance records updated<br>
                                        2 student reports generated
                                    </p>
                                </div>
                                <div class="text-center" style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <h4>Upcoming Tasks</h4>
                                    <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">
                                        Submit Term 2 grades<br>
                                        Parent-teacher meetings<br>
                                        Prepare exam materials
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Students Section -->
                <div id="students-section" class="dashboard-section" style="display: none;">
                    <div class="d-flex justify-between align-center mb-4">
                        <h2>My Students</h2>
                        <button class="btn" onclick="openModal('student-modal')">
                            <i class="fas fa-plus"></i> Add Student to Class
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
                                            <th>Email</th>
                                            <th>Phone</th>
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
                                                    <td><?php echo htmlspecialchars($student['email'] ?? ''); ?></td>
                                                    <td><?php echo htmlspecialchars($student['phone'] ?? ''); ?></td>
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
                        <h2>Grade Management</h2>
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

                <!-- Reports Section -->
                <div id="reports-section" class="dashboard-section" style="display: none;">
                    <h2>Student Reports</h2>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Generate Reports</h3>
                        </div>
                        <div class="card-body">
                            <p>Generate reports for your assigned students and classes.</p>
                            <div class="stats-container">
                                <button class="btn btn-outline" onclick="exportTableToCSV('students-table', 'my_students_report.csv')">
                                    <i class="fas fa-download"></i> My Students Performance
                                </button>
                                <button class="btn btn-outline" onclick="exportTableToCSV('attendance-table', 'class_attendance_report.csv')">
                                    <i class="fas fa-download"></i> Class Attendance Summary
                                </button>
                                <button class="btn btn-outline" onclick="exportTableToCSV('grades-table', 'grade_distribution_report.csv')">
                                    <i class="fas fa-download"></i> Grade Distribution
                                </button>
                                <button class="btn btn-outline" onclick="printSection('students-section')">
                                    <i class="fas fa-print"></i> Print Student Report
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

    <!-- Notification -->
    <div id="notification" class="notification"></div>

    <script src="assets/js/main.js"></script>
    <script src="assets/js/admin.js"></script>
</body>
</html>
