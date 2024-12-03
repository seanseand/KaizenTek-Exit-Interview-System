<?php
session_start();
include(__DIR__ . '/../config/db.php');

// Check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo json_encode(["error" => "Access denied."]);
    exit();
}

$evaluationID = $_GET['evaluationID'] ?? null;

if (!$evaluationID) {
    echo json_encode(['error' => 'Evaluation ID is required.']);
    exit();
}

// Fetch answers based on EvaluationID
$query = "
    SELECT a.AnswerID, a.QuestionID, q.questionDesc, a.Answer, a.DateAnswered
    FROM ANSWER a
    JOIN QUESTION q ON a.QuestionID = q.QuestionID
    WHERE a.EvaluationID = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $evaluationID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $answers = [];
    while ($row = $result->fetch_assoc()) {
        $answers[] = $row;
    }
    echo json_encode(['evaluation_id' => $evaluationID, 'answers' => $answers]);
} else {
    echo json_encode(['error' => 'No answers found for this Evaluation ID.']);
}
?>
