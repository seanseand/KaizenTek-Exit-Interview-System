<?php
session_start();
include('../../database/db.php');

// check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo json_encode(["error" => "Access denied."]);
    exit();
}

$evaluationID = $_GET['evaluationID'] ?? null;

if (!$evaluationID) {
    echo json_encode(['error' => 'Evaluation ID is required.']);
    exit();
}

// fetch questions based on EvaluationID
$query = "
    SELECT q.QuestionID, q.questionDesc 
    FROM QUESTION q
    JOIN LINK l ON q.QuestionID = l.QuestionID
    WHERE l.EvaluationID = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $evaluationID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    echo json_encode(['evaluation_id' => $evaluationID, 'questions' => $questions]);
} else {
    echo json_encode(['error' => 'No questions found for this Evaluation ID.']);
}
?>