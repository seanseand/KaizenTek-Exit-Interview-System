<?php
session_start();
include('../../database/db.php');

// check if the user logged in is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'Admin') {
    echo "Access denied.";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['questionID'], $_POST['questionDesc'], $_POST['questionType'])) {
    $questionID = $_POST['questionID'];
    $questionDesc = $_POST['questionDesc'];
    $questionType = $_POST['questionType'];
    $creatorID = $_SESSION['user_id'];

    // check if the logged-in admin created this question
    $checkQuery = "SELECT * FROM QUESTION WHERE QuestionID = ? AND CreatorID = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("ii", $questionID, $creatorID);
    $stmt->execute();
    $checkResult = $stmt->get_result();

    if ($checkResult->num_rows > 0) {
        // proceed with updating the question
        $updateQuery = "UPDATE QUESTION SET QuestionDesc = ?, QuestionType = ? WHERE QuestionID = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("ssi", $questionDesc, $questionType, $questionID);

        if ($updateStmt->execute()) {
            echo "Question updated successfully.";
        } else {
            echo "Error updating question: " . $updateStmt->error;
        }
    } else {
        echo "You can only edit questions you created.";
    }
} else {
    echo "Invalid request.";
}
?>