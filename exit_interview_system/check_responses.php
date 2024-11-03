<?php
session_start();
include('db.php');

// check if the user logged in is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Admin') {
    echo json_encode(["error" => "Access denied."]);
    exit();
}

// check if the evaluation id is null
$evaluationID = $_GET['evaluationID'] ?? null;
if (!$evaluationID) {
    echo json_encode(["error" => "Evaluation ID is required."]);
    exit();
}

// prepare the SQL statement
$query = "SELECT DISTINCT StudentID FROM RESPONSE WHERE EvaluationID = ?";
$stmt = $conn->prepare($query);
// bind the parameters and execute the statement
$stmt->bind_param("i", $evaluationID);
$stmt->execute();
$result = $stmt->get_result();

$responseData = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $responseData[] = $row['StudentID'];
    }
    echo json_encode(["status" => "success", "students" => $responseData]);
} else {
    echo json_encode(["status" => "no_responses", "message" => "No responses yet for this evaluation."]);
}
?>