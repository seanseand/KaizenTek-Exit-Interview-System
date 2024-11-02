<?php
session_start();
include('db.php');

if (!isset($_SESSION['user_id'])) {
    echo "You must be logged in to set an evaluation.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['evaluationName'], $_POST['programID'], $_POST['semester'], $_POST['startDate'], $_POST['endDate'], $_POST['questionIDs'])) {
        $evaluation_name = $_POST['evaluationName'];
        $programID = $_POST['programID'];
        $semester = $_POST['semester'];
        $start_date = $_POST['startDate'];
        $end_date = $_POST['endDate'];
        $questionIDs = explode(',', $_POST['questionIDs']); // Expecting comma-separated list of question IDs

        // Insert the evaluation
        $query = "INSERT INTO EVALUATION (EvaluationName, ProgramID, Semester, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?, 'Draft')";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sisss", $evaluation_name, $programID, $semester, $start_date, $end_date);

        if ($stmt->execute()) {
            $evaluationID = $stmt->insert_id; // Get the ID of the newly created evaluation

            // Link questions to the evaluation
            $linkQuery = "INSERT INTO LINK (EvaluationID, QuestionID) VALUES (?, ?)";
            $linkStmt = $conn->prepare($linkQuery);

            foreach ($questionIDs as $questionID) {
                $questionID = trim($questionID);
                if (!empty($questionID)) {
                    $linkStmt->bind_param("ii", $evaluationID, $questionID);
                    $linkStmt->execute();
                }
            }

            echo "Evaluation set successfully with selected questions!";
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