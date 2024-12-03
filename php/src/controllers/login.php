<?php
global $conn;
session_start();
include(__DIR__ . '/../config/db.php');

// collect the form data
$username = $_POST['username'];
$password = $_POST['password'];

// query to verify the user credentials
$query = "SELECT * FROM USER WHERE Username = ? AND Password = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // check if the user is an admin
    if ($user['UserType'] === 'Admin') {
        echo json_encode(["success" => false, "message" => "Only students can log in."]);
        exit();
    }

    // store user data in session
    $_SESSION['user_id'] = $user['UserID'];
    $_SESSION['user_type'] = $user['UserType'];
    $_SESSION['username'] = $user['Username'];

    // check if the user is a student and retrieve their ProgramID
    if ($user['UserType'] === 'Student') {
        // fetch ProgramID from the STUDENT table
        $programQuery = "SELECT ProgramID FROM STUDENT WHERE StudentID = ?";
        $stmt = $conn->prepare($programQuery);
        $stmt->bind_param("i", $user['UserID']);
        $stmt->execute();
        $programResult = $stmt->get_result();

        if ($programResult->num_rows > 0) {
            $student = $programResult->fetch_assoc();
            $_SESSION['program_id'] = $student['ProgramID'];
        } else {
            echo json_encode(["success" => false, "message" => "Error: ProgramID not found for this student."]);
            exit();
        }
        echo json_encode(["success" => true, "redirect" => "student-home"]);
        exit();
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid login credentials. Please try again."]);
}

$stmt->close();
$conn->close();
?>