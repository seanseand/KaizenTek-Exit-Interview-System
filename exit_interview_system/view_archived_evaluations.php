<?php
session_start();
include('db.php');

// check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo "Access denied.";
    exit();
}

// get student's program ID from the session
$programID = $_SESSION['program_id'];

$query = "
    SELECT EvaluationID, Semester, StartDate, EndDate, Status 
    FROM EVALUATION 
    WHERE Status = 'Archived' AND ProgramID = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $programID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "<p>Evaluation ID: {$row['EvaluationID']}, Semester: {$row['Semester']}, Dates: {$row['StartDate']} - {$row['EndDate']}</p>";
    }
} else {
    echo "<p>No archived evaluations available.</p>";
}
?>
