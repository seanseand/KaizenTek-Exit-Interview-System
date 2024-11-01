<?php
session_start();
include('db.php');

if (!isset($_SESSION['user_id'])) {
    echo "You must be logged in to set an evaluation.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['evaluationName'], $_POST['programID'], $_POST['semester'], $_POST['startDate'], $_POST['endDate'])) {
        $evaluation_name = $_POST['evaluationName'];
        $programID = $_POST['programID'];
        $semester = $_POST['semester'];
        $start_date = $_POST['startDate'];
        $end_date = $_POST['endDate'];

        $query = "INSERT INTO EVALUATION (EvaluationName, ProgramID, Semester, StartDate, EndDate) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sisss", $evaluation_name, $programID, $semester, $start_date, $end_date);

        if ($stmt->execute()) {
            echo "Evaluation set successfully!";
        } else {
            echo "Error setting evaluation: " . $stmt->error;
        }
    } else {
        echo "Required fields are missing.";
    }
} else {
    echo "Invalid request method.";
}
?>