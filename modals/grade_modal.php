<!-- Grade Modal -->
<div id="grade-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="grade-modal-title">Add Grade</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="grade-form" action="actions/save_grade.php" method="POST" data-ajax="true">
                <input type="hidden" id="grade-id" name="grade_id">
                
                <div class="form-group">
                    <label for="grade-student">Student</label>
                    <select id="grade-student" name="student_id" class="form-control" required>
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
                    <label for="grade-subject">Subject</label>
                    <select id="grade-subject" name="subject" class="form-control" required>
                        <option value="">Select Subject</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Geography">Geography</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="grade-assignment">Assignment/Exam</label>
                    <input type="text" id="grade-assignment" name="assignment_name" class="form-control" placeholder="e.g., Midterm Exam, Quiz 1, Final Project" required>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="grade-letter">Letter Grade</label>
                            <select id="grade-letter" name="letter_grade" class="form-control" required>
                                <option value="">Select Grade</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="B-">B-</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="C-">C-</option>
                                <option value="D">D</option>
                                <option value="F">F</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="grade-percentage">Percentage</label>
                            <input type="number" id="grade-percentage" name="percentage" class="form-control" min="0" max="100" step="0.01" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="grade-term">Term</label>
                    <select id="grade-term" name="term" class="form-control" required>
                        <option value="">Select Term</option>
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="closeModal('grade-modal')">Cancel</button>
            <button type="submit" form="grade-form" class="btn btn-success">Save Grade</button>
        </div>
    </div>
</div>
