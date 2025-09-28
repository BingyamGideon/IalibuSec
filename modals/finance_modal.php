<!-- Finance Modal -->
<div id="finance-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="finance-modal-title">Add Payment</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="finance-form" action="actions/save_finance.php" method="POST" data-ajax="true">
                <input type="hidden" id="finance-id" name="finance_id">
                
                <div class="form-group">
                    <label for="finance-student">Student</label>
                    <select id="finance-student" name="student_id" class="form-control" required>
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
                    <label for="finance-description">Description</label>
                    <input type="text" id="finance-description" name="description" class="form-control" placeholder="e.g., School Fees - Term 1, Book Fees" required>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="finance-amount">Amount (K)</label>
                            <input type="number" id="finance-amount" name="amount" class="form-control" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="finance-date">Payment Date</label>
                            <input type="date" id="finance-date" name="payment_date" class="form-control" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="finance-status">Status</label>
                            <select id="finance-status" name="status" class="form-control" required>
                                <option value="">Select Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="finance-method">Payment Method (Optional)</label>
                            <select id="finance-method" name="payment_method" class="form-control">
                                <option value="">Select Method</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Check">Check</option>
                                <option value="Mobile Money">Mobile Money</option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="closeModal('finance-modal')">Cancel</button>
            <button type="submit" form="finance-form" class="btn btn-success">Save Payment</button>
        </div>
    </div>
</div>
