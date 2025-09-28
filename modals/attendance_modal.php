<!-- Attendance Modal -->
<div id="attendance-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="attendance-modal-title">Record Attendance</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="attendance-form" action="actions/save_attendance.php" method="POST" data-ajax="true">
                <input type="hidden" id="attendance-id" name="attendance_id">
                
                <div class="form-group">
                    <label for="attendance-date">Date</label>
                    <input type="date" id="attendance-date" name="attendance_date" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="attendance-student">Student</label>
                    <select id="attendance-student" name="student_id" class="form-control" required>
                        <option value="">Select Student</option>
                        <?php
                        try {
                            $stmt = $pdo->query("SELECT id, student_name, grade, class FROM students ORDER BY student_name");
                            while ($student = $stmt->fetch()): ?>
                                <option value="<?php echo $student['id']; ?>">
                                    <?php echo htmlspecialchars($student['student_name']) . " (" . $student['grade'] . " " . $student['class'] . ")"; ?>
                                </option>
                            <?php endwhile;
                        } catch (PDOException $e) {
                            echo "<option disabled>Error loading students</option>";
                        }
                        ?>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="attendance-subject">Subject</label>
                    <select id="attendance-subject" name="subject" class="form-control" required>
                        <option value="">Select Subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Geography">Geography</option>
                        <option value="Physical Education">Physical Education</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="attendance-status">Status</label>
                    <select id="attendance-status" name="status" class="form-control" required>
                        <option value="">Select Status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="attendance-notes">Notes (Optional)</label>
                    <input type="text" id="attendance-notes" name="notes" class="form-control" placeholder="Additional notes...">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="closeModal('attendance-modal')">Cancel</button>
            <button type="submit" form="attendance-form" class="btn btn-success">Save Attendance</button>
        </div>
    </div>
</div>
