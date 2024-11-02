<?php
session_start();
include('db.php');

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Admin') {
    echo "Access denied.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['evaluationID'], $_POST['evaluationName'], $_POST['programID'], $_POST['startDate'], $_POST['endDate'])) {
    $evaluationID = $_POST['evaluationID'];
    $evaluationName = $_POST['evaluationName'];
    $programID = $_POST['programID'];
    $startDate = $_POST['startDate'];
    $endDate = $_POST['endDate'];

    // check if the evaluation status is "Draft" before updating
    $checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
    $stmt = $conn->prepare($checkStatusQuery);
    $stmt->bind_param("i", $evaluationID);
    $stmt->execute();
    $stmt->bind_result($status);
    $stmt->fetch();
    $stmt->close();

    if ($status !== 'Draft') {
        echo "Only evaluations with a status of 'Draft' can be edited.";
        exit();
    }

    // proceed with the update if the status is "Draft"
    $updateQuery = "UPDATE EVALUATION SET EvaluationName = ?, ProgramID = ?, StartDate = ?, EndDate = ? WHERE EvaluationID = ?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param("sissi", $evaluationName, $programID, $startDate, $endDate, $evaluationID);

    if ($stmt->execute()) {
        echo "Evaluation updated successfully.";
    } else {
        echo "Error updating evaluation: " . $stmt->error;
    }
} else {
    echo "Invalid request.";
}
?>