<?php
session_start();
include('db.php');

// check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo "Access denied.";
    exit();
}

$studentID = $_SESSION['user_id'];
$evaluationID = $_POST['evaluation_id'];

// check if the student has already responded to this evaluation
$responseCheck = "SELECT * FROM RESPONSE WHERE EvalID = ? AND StudentID = ?";
$stmt = $conn->prepare($responseCheck);
$stmt->bind_param("ii", $evaluationID, $studentID);
$stmt->execute();
$responseResult = $stmt->get_result();

if ($responseResult->num_rows > 0) {
    echo "You have already submitted answers for this evaluation.";
    exit();
}

// insert responses into the ANSWER table and a record in RESPONSE
foreach ($_POST as $key => $answer) {
    if (strpos($key, 'answer_') === 0) {
        $questionID = str_replace('answer_', '', $key);
        $query = "INSERT INTO ANSWER (EvaluationID, QuestionID, Answer, DateAnswered) VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iis", $evaluationID, $questionID, $answer);
        $stmt->execute();
    }
}

// insert into RESPONSE to mark this evaluation as completed
$insertResponse = "INSERT INTO RESPONSE (EvalID, StudentID) VALUES (?, ?)";
$stmt = $conn->prepare($insertResponse);
$stmt->bind_param("ii", $evaluationID, $studentID);
$stmt->execute();

echo "Your answers have been submitted successfully!";
?>