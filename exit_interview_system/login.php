<?php
session_start();
include('db.php');

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
    
    // store user data in session
    $_SESSION['user_id'] = $user['UserID'];
    $_SESSION['user_type'] = $user['UserType'];
    
    // redirect based on user type
    if ($user['UserType'] === 'Admin') {
        header("Location: admin.html");
        exit();  // ensure script stops executing after redirect
    } else if ($user['UserType'] === 'Student') {
        header("Location: student.html");
        exit();  // ensure script stops executing after redirect
    }
} else {
    echo "Invalid login credentials. Please try again.";
}
?>