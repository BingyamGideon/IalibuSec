<?php
require_once '../config/database.php';
requireAdmin();

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $student_id = $_POST['student_id'] ?? null;
    $student_name = trim($_POST['student_name'] ?? '');
    $grade = $_POST['grade'] ?? '';
    $class = $_POST['class'] ?? '';
    $date_of_birth = $_POST['date_of_birth'] ?? '';
    $gender = $_POST['gender'] ?? '';
    $address = trim($_POST['address'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $parent_name = trim($_POST['parent_name'] ?? '');
    $parent_phone = trim($_POST['parent_phone'] ?? '');

    // Validation
    if (empty($student_name) || empty($grade) || empty($class) || empty($date_of_birth) || empty($gender) || empty($address)) {
        throw new Exception('Please fill in all required fields');
    }

    if (empty($student_id)) {
        // Create new student
        $stmt = $pdo->prepare("
            INSERT INTO students (student_name, grade, class, date_of_birth, gender, address, email, phone, parent_name, parent_phone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$student_name, $grade, $class, $date_of_birth, $gender, $address, $email, $phone, $parent_name, $parent_phone]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Student added successfully'
        ]);
    } else {
        // Update existing student
        $stmt = $pdo->prepare("
            UPDATE students 
            SET student_name = ?, grade = ?, class = ?, date_of_birth = ?, gender = ?, address = ?, email = ?, phone = ?, parent_name = ?, parent_phone = ?
            WHERE id = ?
        ");
        $stmt->execute([$student_name, $grade, $class, $date_of_birth, $gender, $address, $email, $phone, $parent_name, $parent_phone, $student_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Student updated successfully'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
