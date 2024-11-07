<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in.']);
    exit();
}

// Check if the username is set in the session
if (!isset($_SESSION['username'])) {
    echo json_encode(['error' => 'Username not found in session.']);
    exit();
}

// Return the username as a JSON response
echo json_encode(['username' => $_SESSION['username']]);
?>