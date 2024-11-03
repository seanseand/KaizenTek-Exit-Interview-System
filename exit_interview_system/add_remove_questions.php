<?php
session_start();
include('db.php');

if (!isset($_SESSION['user_id'])) {
    echo "You must be logged in to modify evaluation questions.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['evaluationID'], $_POST['action'], $_POST['questionIDs'])) {
        $evaluationID = $_POST['evaluationID'];
        $action = $_POST['action'];
        $questionIDs = explode(',', $_POST['questionIDs']); // expecting comma-separated list of question IDs

        // check if evaluation is in Draft status
        $checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
        $statusStmt = $conn->prepare($checkStatusQuery);
        $statusStmt->bind_param("i", $evaluationID);
        $statusStmt->execute();
        $statusResult = $statusStmt->get_result();
        $evaluation = $statusResult->fetch_assoc();

        if ($evaluation && $evaluation['Status'] === 'Draft') {
            if ($action === 'add') {
                // add questions to the draft evaluation
                $linkQuery = "INSERT INTO LINK (EvaluationID, QuestionID) VALUES (?, ?)";
                $linkStmt = $conn->prepare($linkQuery);

                foreach ($questionIDs as $questionID) {
                    $questionID = trim($questionID);
                    if (!empty($questionID)) {
                        $linkStmt->bind_param("ii", $evaluationID, $questionID);
                        $linkStmt->execute();
                    }
                }
                echo "Questions added to the evaluation successfully!";
            } elseif ($action === 'remove') {
                // remove questions from the draft evaluation
                $unlinkQuery = "DELETE FROM LINK WHERE EvaluationID = ? AND QuestionID = ?";
                $unlinkStmt = $conn->prepare($unlinkQuery);

                foreach ($questionIDs as $questionID) {
                    $questionID = trim($questionID);
                    if (!empty($questionID)) {
                        $unlinkStmt->bind_param("ii", $evaluationID, $questionID);
                        $unlinkStmt->execute();
                    }
                }
                echo "Questions removed from the evaluation successfully!";
            } else {
                echo "Invalid action specified.";
            }
        } else {
            echo "Evaluation not found or is not in Draft status.";
        }
    } else {
        echo "Required fields are missing.";
    }
} else {
    echo "Invalid request method.";
}
?>