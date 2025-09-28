<!-- Student Modal -->
<div id="student-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="student-modal-title">Add Student</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="student-form" action="actions/save_student.php" method="POST" data-ajax="true">
                <input type="hidden" id="student-id" name="student_id">
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-name">Student Name</label>
                            <input type="text" id="student-name" name="student_name" class="form-control" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-grade">Grade</label>
                            <select id="student-grade" name="grade" class="form-control" required>
                                <option value="">Select Grade</option>
                                <option value="Grade 9">Grade 9</option>
                                <option value="Grade 10">Grade 10</option>
                                <option value="Grade 11">Grade 11</option>
                                <option value="Grade 12">Grade 12</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-class">Class</label>
                            <select id="student-class" name="class" class="form-control" required>
                                <option value="">Select Class</option>
                                <option value="A">Class A</option>
                                <option value="B">Class B</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-dob">Date of Birth</label>
                            <input type="date" id="student-dob" name="date_of_birth" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-gender">Gender</label>
                            <select id="student-gender" name="gender" class="form-control" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="student-address">Address</label>
                    <input type="text" id="student-address" name="address" class="form-control" required>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-email">Email (Optional)</label>
                            <input type="email" id="student-email" name="email" class="form-control">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="student-phone">Phone (Optional)</label>
                            <input type="text" id="student-phone" name="phone" class="form-control">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="student-parent-name">Parent/Guardian Name (Optional)</label>
                    <input type="text" id="student-parent-name" name="parent_name" class="form-control">
                </div>
                
                <div class="form-group">
                    <label for="student-parent-phone">Parent/Guardian Phone (Optional)</label>
                    <input type="text" id="student-parent-phone" name="parent_phone" class="form-control">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="closeModal('student-modal')">Cancel</button>
            <button type="submit" form="student-form" class="btn btn-success">Save Student</button>
        </div>
    </div>
</div>
