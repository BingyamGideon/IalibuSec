// Ialibu Secondary School Management System JavaScript

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Modal management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Search functionality
function searchTable(searchInputId, tableId) {
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName('tr');
    
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        
        for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
            const row = rows[i];
            const cells = row.getElementsByTagName('td');
            let found = false;
            
            for (let j = 0; j < cells.length; j++) {
                const cellText = cells[j].textContent.toLowerCase();
                if (cellText.includes(searchTerm)) {
                    found = true;
                    break;
                }
            }
            
            row.style.display = found ? '' : 'none';
        }
    });
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#cbd5e1';
        }
    });
    
    return isValid;
}

// Confirm delete
function confirmDelete(message = 'Are you sure you want to delete this item?') {
    return confirm(message);
}

// Dashboard navigation
function setActiveNavItem(activeId) {
    const navItems = document.querySelectorAll('.sidebar-menu li');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.getElementById(activeId);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Show/hide sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}

// Format currency (Kina)
function formatCurrency(amount) {
    return 'K' + parseFloat(amount).toFixed(2);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// AJAX helper function
function makeAjaxRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error('Request failed: ' + xhr.status));
                }
            }
        };
        
        if (data) {
            const formData = new URLSearchParams(data);
            xhr.send(formData);
        } else {
            xhr.send();
        }
    });
}

// Form submission with AJAX
function submitForm(formId, successCallback = null, errorCallback = null) {
    const form = document.getElementById(formId);
    
    if (!validateForm(formId)) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    const formData = new FormData(form);
    const action = form.getAttribute('action');
    const method = form.getAttribute('method') || 'POST';
    
    // Convert FormData to URLSearchParams for AJAX
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    makeAjaxRequest(action, method, data)
        .then(response => {
            if (typeof response === 'object' && response.success) {
                showNotification(response.message || 'Operation completed successfully', 'success');
                if (successCallback) successCallback(response);
            } else if (typeof response === 'object' && response.error) {
                showNotification(response.message || 'Operation failed', 'error');
                if (errorCallback) errorCallback(response);
            } else {
                // Handle non-JSON response (redirect, etc.)
                window.location.reload();
            }
        })
        .catch(error => {
            showNotification('An error occurred: ' + error.message, 'error');
            if (errorCallback) errorCallback(error);
        });
    
    return false; // Prevent default form submission
}

// Delete confirmation with AJAX
function deleteItem(url, itemName = 'item') {
    if (confirmDelete(`Are you sure you want to delete this ${itemName}?`)) {
        makeAjaxRequest(url, 'POST', { action: 'delete' })
            .then(response => {
                if (response.success) {
                    showNotification(response.message || `${itemName} deleted successfully`, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(response.message || 'Delete operation failed', 'error');
                }
            })
            .catch(error => {
                showNotification('An error occurred while deleting', 'error');
            });
    }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search for all tables
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        const tableId = input.getAttribute('data-table');
        if (tableId) {
            searchTable(input.id, tableId);
        }
    });
    
    // Initialize navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const navId = this.getAttribute('id');
            
            if (sectionId) {
                showSection(sectionId);
                setActiveNavItem(navId);
            }
        });
    });
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Form submissions
    const forms = document.querySelectorAll('form[data-ajax="true"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm(this.id);
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('data-url');
            const itemName = this.getAttribute('data-item') || 'item';
            deleteItem(url, itemName);
        });
    });
});

// Utility functions for specific dashboard functionality

// Calculate and update statistics
function updateDashboardStats() {
    // This would typically fetch fresh data from the server
    // For now, we'll update based on visible table data
    
    const studentTable = document.getElementById('students-table');
    if (studentTable) {
        const studentCount = studentTable.querySelectorAll('tbody tr').length;
        const studentCountElement = document.getElementById('total-students');
        if (studentCountElement) {
            studentCountElement.textContent = studentCount;
        }
    }
}

// Auto-refresh dashboard data
function autoRefreshDashboard() {
    setInterval(() => {
        updateDashboardStats();
    }, 30000); // Refresh every 30 seconds
}

// Grade calculation helper
function calculateGradeStats(grades) {
    if (!grades.length) return { average: 0, total: 0 };
    
    const total = grades.reduce((sum, grade) => sum + parseFloat(grade.percentage), 0);
    const average = total / grades.length;
    
    return { average: average.toFixed(1), total: grades.length };
}

// Attendance calculation helper
function calculateAttendanceRate(attendance) {
    if (!attendance.length) return 0;
    
    const present = attendance.filter(record => record.status === 'Present').length;
    return ((present / attendance.length) * 100).toFixed(1);
}

// Export table data to CSV
function exportTableToCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    const csvContent = [];
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        
        cols.forEach(col => {
            // Skip action columns
            if (!col.classList.contains('action-buttons')) {
                rowData.push('"' + col.textContent.trim().replace(/"/g, '""') + '"');
            }
        });
        
        if (rowData.length > 0) {
            csvContent.push(rowData.join(','));
        }
    });
    
    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    window.URL.revokeObjectURL(url);
}

// Print functionality
function printSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Ialibu Secondary School - Print</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .no-print { display: none; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #1e3a8a; margin-bottom: 5px; }
                .header p { margin: 0; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Ialibu Secondary School</h1>
                <p>Student Information Management System</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            ${section.innerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}
