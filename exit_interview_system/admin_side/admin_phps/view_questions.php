<?php
session_start();
include('../../database/db.php');

// verify if the user is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Admin') {
    echo "Access denied.";
    exit();
}

// set sorting order
$sortOption = isset($_GET['sortOption']) ? $_GET['sortOption'] : 'CreatorID';
$validSortOptions = ['CreatorID', 'QuestionType', 'QuestionID']; 
$orderBy = in_array($sortOption, $validSortOptions) ? $sortOption : 'CreatorID';

// fetch questions sorted by the chosen option
$query = "SELECT * FROM QUESTION ORDER BY $orderBy";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    echo "<table><tr><th>Question ID</th><th>Description</th><th>Type</th><th>Creator ID</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['QuestionID']}</td><td>{$row['QuestionDesc']}</td><td>{$row['QuestionType']}</td><td>{$row['CreatorID']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "No questions found.";
}
?>