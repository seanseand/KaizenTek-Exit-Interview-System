<?php
session_start(); 
include('db.php');

// check if the user is logged in and retrieve the UserID from the session
if (!isset($_SESSION['user_id'])) {
    echo "You must be logged in to add a question.";
    exit();
}

// check if POST data is received
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['questionDesc']) && isset($_POST['questionType'])) {
        $question_desc = $_POST['questionDesc'];
        $question_type = $_POST['questionType'];
        $creator_id = $_SESSION['user_id']; // use the UserID from the session

        // prepare the SQL statement
        $query = "INSERT INTO QUESTION (QuestionDesc, QuestionType, CreatorID) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);

        // bind the parameters and execute the statement
        $stmt->bind_param("ssi", $question_desc, $question_type, $creator_id);

        if ($stmt->execute()) {
            echo "Question added successfully!";
            
        } else {
            echo "Error adding question: " . $stmt->error;
        }
    } else {
        echo "Required fields are missing.";
    }
} else {
    echo "Invalid request method.";
}
?>