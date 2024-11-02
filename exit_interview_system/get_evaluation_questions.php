<?php
session_start();
include('db.php');

// check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo json_encode(["error" => "Access denied."]);
    exit();
}

$evaluationName = $_GET['evaluationName'];

// fetch questions linked to the specified evaluation
$query = "
    SELECT q.QuestionID, q.QuestionDesc, q.QuestionType 
    FROM QUESTION q
    JOIN LINK l ON q.QuestionID = l.QuestionID
    JOIN EVALUATION e ON l.EvaluationID = e.EvaluationID
    WHERE e.EvaluationName = ? AND e.Status = 'Published'
";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $evaluationName);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $questions = [];
    while ($row = $result->fetch_assoc()) {
        $questions[] = $row;
    }
    echo json_encode(["questions" => $questions]);
} else {
    echo json_encode(["error" => "No questions found for this evaluation."]);
}
?>