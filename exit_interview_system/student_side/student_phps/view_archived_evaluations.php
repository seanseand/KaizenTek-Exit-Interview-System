<?php
session_start();
include('../../database/db.php');

// check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo "Access denied.";
    exit();
}

// get student's program ID from the session
$programID = $_SESSION['program_id'];

$query = "
    SELECT EvaluationID, EvaluationName, Semester, StartDate, EndDate, Status 
    FROM EVALUATION 
    WHERE Status = 'Finished' AND ProgramID = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $programID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "<div class='evaluation-card-item'>
            <div>
                <h2 id='evaluationID-{$row['EvaluationID']}'>{$row['EvaluationName']}</h2>
                <p id='semester-{$row['EvaluationID']}'>{$row['Semester']} Semester</p>
                <p>
                    <span id='startDate-{$row['EvaluationID']}'>{$row['StartDate']}</span> - 
                    <span id='endDate-{$row['EvaluationID']}'>{$row['EndDate']}</span>
                </p>
            </div>
        </div>";
    }
} else {
    echo "<p>No archived evaluations available.</p>";
}
?>