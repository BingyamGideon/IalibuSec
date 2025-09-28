<!-- Staff Modal -->
<div id="staff-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="staff-modal-title">Add Staff Member</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="staff-form" action="actions/save_staff.php" method="POST" data-ajax="true">
                <input type="hidden" id="staff-id" name="staff_id">
                
                <div class="form-group">
                    <label for="staff-name">Full Name</label>
                    <input type="text" id="staff-name" name="staff_name" class="form-control" required>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="staff-position">Position</label>
                            <input type="text" id="staff-position" name="position" class="form-control" placeholder="e.g., Math Teacher, Principal" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="staff-department">Department</label>
                            <select id="staff-department" name="department" class="form-control" required>
                                <option value="">Select Department</option>
                                <option value="Administration">Administration</option>
                                <option value="Academics">Academics</option>
                                <option value="Sports">Sports</option>
                                <option value="Library">Library</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="staff-email">Email</label>
                            <input type="email" id="staff-email" name="email" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="staff-phone">Phone</label>
                            <input type="text" id="staff-phone" name="phone" class="form-control" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="staff-salary">Salary (K) - Optional</label>
                            <input type="number" id="staff-salary" name="salary" class="form-control" min="0" step="0.01">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="staff-hire-date">Hire Date - Optional</label>
                            <input type="date" id="staff-hire-date" name="hire_date" class="form-control">
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="closeModal('staff-modal')">Cancel</button>
            <button type="submit" form="staff-form" class="btn btn-success">Save Staff Member</button>
        </div>
    </div>
</div>
