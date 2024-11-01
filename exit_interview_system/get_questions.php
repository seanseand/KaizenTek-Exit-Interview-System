<?php
include('db.php');

$query = "SELECT * FROM QUESTION";
$result = $conn->query($query);
$questions = [];

while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

echo json_encode(["questions" => $questions]);
?>