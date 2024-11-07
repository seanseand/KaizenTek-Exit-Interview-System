<?php
session_start();
include('../../database/db.php');

// Check if the user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Student') {
    echo "Access denied.";
    exit();
}

// Get student's program ID from the session 
$programID = $_SESSION['program_id'];
$studentID = $_SESSION['user_id']; // Get the student's ID

$query = "
    SELECT e.EvaluationID, e.EvaluationName, e.Semester, e.StartDate, e.EndDate, e.Status 
    FROM EVALUATION e
    INNER JOIN RESPONSE r ON e.EvaluationID = r.EvaluationID AND r.StudentID = ?
    WHERE e.Status = 'Published' AND e.ProgramID = ?
";
$stmt = $conn->prepare($query);
$stmt->bind_param("ii", $studentID, $programID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "<div class='answered-evaluation-card-item'>
            <div>
                <h2 id='evaluationName-{$row['EvaluationID']}'>{$row['EvaluationName']}</h2>
                <p id='semester-{$row['EvaluationID']}'>{$row['Semester']} Semester</p>
                <p>
                    <span id='startDate-{$row['EvaluationID']}'>{$row['StartDate']}</span> - 
                    <span id='endDate-{$row['EvaluationID']}'>{$row['EndDate']}</span>
                </p>
            </div>
        </div>";
    }
} else {
    echo "<p>You have not answered any evaluations yet.</p>";
}
?>