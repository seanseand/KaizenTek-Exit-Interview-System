<?php
session_start();
include('../../database/db.php');

// check if the user logged in is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Admin') {
    echo "Access denied.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['evaluationID'])) {
    $evaluationID = $_POST['evaluationID'];

    // check if the evaluation is in Draft status
    $checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
    $stmt = $conn->prepare($checkStatusQuery);
    $stmt->bind_param("i", $evaluationID);
    $stmt->execute();
    $stmt->bind_result($status);
    $stmt->fetch();
    $stmt->close();

    if ($status !== 'Draft') {
        echo "Only evaluations with a status of 'Draft' can be published.";
        exit();
    }

    // update the status to Published
    $publishQuery = "UPDATE EVALUATION SET Status = 'Published' WHERE EvaluationID = ?";
    $stmt = $conn->prepare($publishQuery);
    $stmt->bind_param("i", $evaluationID);

    if ($stmt->execute()) {
        echo "Evaluation published successfully.";
    } else {
        echo "Error publishing evaluation: " . $stmt->error;
    }

    $stmt->close();
} else {
    echo "Invalid request.";
}
?>