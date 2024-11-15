<?php
session_start();
include('../../database/db.php');

// check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo "Access denied.";
    exit();
}

$studentID = $_SESSION['user_id'];
$evaluationID = $_POST['evaluation_id'] ?? null;

if (!$evaluationID) {
    echo "Error: Evaluation ID is missing.";
    exit();
}

// check if the student has already responded to this evaluation
$responseCheck = "SELECT * FROM RESPONSE WHERE EvaluationID = ? AND StudentID = ?";
$stmt = $conn->prepare($responseCheck);
$stmt->bind_param("ii", $evaluationID, $studentID);
$stmt->execute();
$responseResult = $stmt->get_result();

if ($responseResult->num_rows > 0) {
    echo "You have already submitted answers for this evaluation.";
    exit();
}

// prepare to insert responses into the ANSWER table
$conn->begin_transaction();
try {
    foreach ($_POST as $key => $answer) {
        if (strpos($key, 'answer_') === 0) {
            $questionID = str_replace('answer_', '', $key);

            // validate that the EvaluationID and QuestionID pair exists in LINK
            $linkCheck = "SELECT * FROM LINK WHERE EvaluationID = ? AND QuestionID = ?";
            $stmt = $conn->prepare($linkCheck);
            $stmt->bind_param("ii", $evaluationID, $questionID);
            $stmt->execute();
            $linkResult = $stmt->get_result();

            if ($linkResult->num_rows === 0) {
                throw new Exception("Error: The question ID $questionID is not linked to this evaluation.");
            }

            // insert the answer into the ANSWER table
            $query = "INSERT INTO ANSWER (EvaluationID, QuestionID, Answer, DateAnswered) VALUES (?, ?, ?, NOW())";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("iis", $evaluationID, $questionID, $answer);
            if (!$stmt->execute()) {
                throw new Exception("Error submitting answer for Question ID: $questionID.");
            }
        }
    }

    // insert a record into RESPONSE to mark this evaluation as completed
    $insertResponse = "INSERT INTO RESPONSE (EvaluationID, StudentID) VALUES (?, ?)";
    $stmt = $conn->prepare($insertResponse);
    $stmt->bind_param("ii", $evaluationID, $studentID);
    if (!$stmt->execute()) {
        throw new Exception("Error marking evaluation as completed.");
    }

    $conn->commit();
    echo "Your answers have been submitted successfully!";
} catch (Exception $e) {
    $conn->rollback();
    echo $e->getMessage();
}
?>