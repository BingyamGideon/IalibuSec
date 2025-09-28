// Admin Dashboard Specific JavaScript Functions

// Student Functions
function editStudent(studentId) {
    // Fetch student data and populate modal
    makeAjaxRequest(`actions/get_student.php?id=${studentId}`)
        .then(response => {
            if (response.success) {
                const student = response.data;
                
                // Populate form fields
                document.getElementById('student-id').value = student.id;
                document.getElementById('student-name').value = student.student_name;
                document.getElementById('student-grade').value = student.grade;
                document.getElementById('student-class').value = student.class;
                document.getElementById('student-dob').value = student.date_of_birth;
                document.getElementById('student-gender').value = student.gender;
                document.getElementById('student-address').value = student.address;
                document.getElementById('student-email').value = student.email || '';
                document.getElementById('student-phone').value = student.phone || '';
                document.getElementById('student-parent-name').value = student.parent_name || '';
                document.getElementById('student-parent-phone').value = student.parent_phone || '';
                
                // Update modal title
                document.getElementById('student-modal-title').textContent = 'Edit Student';
                
                // Open modal
                openModal('student-modal');
            } else {
                showNotification('Error loading student data', 'error');
            }
        })
        .catch(error => {
            showNotification('Error loading student data', 'error');
        });
}

function resetStudentModal() {
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('student-modal-title').textContent = 'Add Student';
}

// Attendance Functions
function editAttendance(attendanceId) {
    makeAjaxRequest(`actions/get_attendance.php?id=${attendanceId}`)
        .then(response => {
            if (response.success) {
                const attendance = response.data;
                
                document.getElementById('attendance-id').value = attendance.id;
                document.getElementById('attendance-date').value = attendance.attendance_date;
                document.getElementById('attendance-student').value = attendance.student_id;
                document.getElementById('attendance-subject').value = attendance.subject;
                document.getElementById('attendance-status').value = attendance.status;
                document.getElementById('attendance-notes').value = attendance.notes || '';
                
                document.getElementById('attendance-modal-title').textContent = 'Edit Attendance';
                openModal('attendance-modal');
            } else {
                showNotification('Error loading attendance data', 'error');
            }
        })
        .catch(error => {
            showNotification('Error loading attendance data', 'error');
        });
}

function resetAttendanceModal() {
    document.getElementById('attendance-form').reset();
    document.getElementById('attendance-id').value = '';
    document.getElementById('attendance-modal-title').textContent = 'Record Attendance';
    // Set today's date as default
    document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
}

// Grade Functions
function editGrade(gradeId) {
    makeAjaxRequest(`actions/get_grade.php?id=${gradeId}`)
        .then(response => {
            if (response.success) {
                const grade = response.data;
                
                document.getElementById('grade-id').value = grade.id;
                document.getElementById('grade-student').value = grade.student_id;
                document.getElementById('grade-subject').value = grade.subject;
                document.getElementById('grade-assignment').value = grade.assignment_name;
                document.getElementById('grade-letter').value = grade.letter_grade;
                document.getElementById('grade-percentage').value = grade.percentage;
                document.getElementById('grade-term').value = grade.term;
                
                document.getElementById('grade-modal-title').textContent = 'Edit Grade';
                openModal('grade-modal');
            } else {
                showNotification('Error loading grade data', 'error');
            }
        })
        .catch(error => {
            showNotification('Error loading grade data', 'error');
        });
}

function resetGradeModal() {
    document.getElementById('grade-form').reset();
    document.getElementById('grade-id').value = '';
    document.getElementById('grade-modal-title').textContent = 'Add Grade';
}

// Finance Functions
function editFinance(financeId) {
    makeAjaxRequest(`actions/get_finance.php?id=${financeId}`)
        .then(response => {
            if (response.success) {
                const finance = response.data;
                
                document.getElementById('finance-id').value = finance.id;
                document.getElementById('finance-student').value = finance.student_id;
                document.getElementById('finance-amount').value = finance.amount;
                document.getElementById('finance-date').value = finance.payment_date;
                document.getElementById('finance-description').value = finance.description;
                document.getElementById('finance-status').value = finance.status;
                document.getElementById('finance-method').value = finance.payment_method || '';
                
                document.getElementById('finance-modal-title').textContent = 'Edit Payment';
                openModal('finance-modal');
            } else {
                showNotification('Error loading payment data', 'error');
            }
        })
        .catch(error => {
            showNotification('Error loading payment data', 'error');
        });
}

function resetFinanceModal() {
    document.getElementById('finance-form').reset();
    document.getElementById('finance-id').value = '';
    document.getElementById('finance-modal-title').textContent = 'Add Payment';
    // Set today's date as default
    document.getElementById('finance-date').value = new Date().toISOString().split('T')[0];
}

// Staff Functions
function editStaff(staffId) {
    makeAjaxRequest(`actions/get_staff.php?id=${staffId}`)
        .then(response => {
            if (response.success) {
                const staff = response.data;
                
                document.getElementById('staff-id').value = staff.id;
                document.getElementById('staff-name').value = staff.staff_name;
                document.getElementById('staff-position').value = staff.position;
                document.getElementById('staff-department').value = staff.department;
                document.getElementById('staff-email').value = staff.email;
                document.getElementById('staff-phone').value = staff.phone;
                document.getElementById('staff-salary').value = staff.salary || '';
                document.getElementById('staff-hire-date').value = staff.hire_date || '';
                
                document.getElementById('staff-modal-title').textContent = 'Edit Staff Member';
                openModal('staff-modal');
            } else {
                showNotification('Error loading staff data', 'error');
            }
        })
        .catch(error => {
            showNotification('Error loading staff data', 'error');
        });
}

function resetStaffModal() {
    document.getElementById('staff-form').reset();
    document.getElementById('staff-id').value = '';
    document.getElementById('staff-modal-title').textContent = 'Add Staff Member';
}

// Override form submission for modals
document.addEventListener('DOMContentLoaded', function() {
    // Student form submission
    const studentForm = document.getElementById('student-form');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm('student-form')) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            makeAjaxRequest('actions/save_student.php', 'POST', data)
                .then(response => {
                    if (response.success) {
                        showNotification(response.message, 'success');
                        closeModal('student-modal');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        showNotification(response.message, 'error');
                    }
                })
                .catch(error => {
                    showNotification('An error occurred while saving', 'error');
                });
        });
    }

    // Similar event listeners for other forms would go here...
    
    // Modal reset when opening
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Reset modals when opening for add operations
    const addStudentBtn = document.querySelector('button[onclick="openModal(\'student-modal\')"]');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', resetStudentModal);
    }
});

// Dashboard specific functions
function refreshDashboardStats() {
    makeAjaxRequest('actions/get_dashboard_stats.php')
        .then(response => {
            if (response.success) {
                const stats = response.data;
                document.getElementById('total-students').textContent = stats.total_students;
                document.getElementById('avg-grade').textContent = stats.avg_grade + '%';
                document.getElementById('total-revenue').textContent = 'K' + parseFloat(stats.total_revenue).toFixed(2);
                document.getElementById('attendance-rate').textContent = stats.attendance_rate + '%';
                document.getElementById('total-staff').textContent = stats.total_staff;
                document.getElementById('pending-payments').textContent = stats.pending_payments;
            }
        })
        .catch(error => {
            console.error('Error refreshing dashboard stats:', error);
        });
}

// Auto-refresh stats every 30 seconds
setInterval(refreshDashboardStats, 30000);

// Print functions for reports
function printStudentReport() {
    printSection('students-section');
}

function printAttendanceReport() {
    printSection('attendance-section');
}

function printFinanceReport() {
    printSection('finance-section');
}

function printStaffReport() {
    printSection('staff-section');
}
