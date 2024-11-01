<?php
include('db.php');

$question_desc = $_POST['questionDesc'];
$creator_id = 1; // Placeholder for admin ID

$query = "INSERT INTO QUESTION (questionDesc, QuestionType, CreatorID) VALUES (?, 'Text', ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("si", $question_desc, $creator_id);
$stmt->execute();

echo "Question added successfully!";
?>