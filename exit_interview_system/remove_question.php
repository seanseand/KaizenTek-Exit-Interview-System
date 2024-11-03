<?php
session_start();
include('db.php');

// check if the user logged in is an admin
if (!isset($_SESSION['user_id'])) {
    echo "You must be logged in to remove a question.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['questionID'])) {
    $questionID = $_POST['questionID'];

    // prepare and execute delete query
    $query = "DELETE FROM QUESTION WHERE QuestionID = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $questionID);

    if ($stmt->execute()) {
        echo "Question successfully removed.";
    } else {
        echo "Error removing question: " . $stmt->error;
    }
} else {
    echo "Invalid request.";
}
?>