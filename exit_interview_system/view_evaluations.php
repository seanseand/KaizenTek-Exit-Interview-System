<?php
session_start();
include('db.php');

// verify if the user is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Admin') {
    echo "Access denied.";
    exit();
}

// set sorting order for evaluations
$sortOption = isset($_GET['sortOption']) ? $_GET['sortOption'] : 'EvaluationID';
$validSortOptions = ['EvaluationID', 'ProgramID', 'StartDate', 'EndDate'];
$orderBy = in_array($sortOption, $validSortOptions) ? $sortOption : 'EvaluationID';

// fetch evaluations sorted by the chosen option
$query = "SELECT * FROM EVALUATION ORDER BY $orderBy";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    echo "<table><tr><th>Evaluation ID</th><th>Evaluation Name</th><th>Program ID</th><th>Semester</th><th>Start Date</th><th>End Date</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['EvaluationID']}</td><td>{$row['EvaluationName']}</td><td>{$row['ProgramID']}</td><td>{$row['Semester']}</td><td>{$row['StartDate']}</td><td>{$row['EndDate']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "No evaluations found.";
}
?>