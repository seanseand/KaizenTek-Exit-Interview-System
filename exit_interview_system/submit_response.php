<?php
session_start();
include('db.php');

$answers = $_POST['answers'];
$user_id = $_SESSION['user_id'];
$eval_id = 1; // placeholder for the evaluation ID

foreach ($answers as $question_id => $answer_text) {
    $query = "INSERT INTO ANSWER (EvaluationID, QuestionID, Answer, DateAnswered) VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iis", $eval_id, $question_id, $answer_text);
    $stmt->execute();
}

echo "Response submitted!";
?>