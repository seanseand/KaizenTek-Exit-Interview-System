<?php
$servername = "localhost";
$username = "root"; // Default XAMPP/MAMP MySQL user
$password = ""; // Default password is empty in XAMPP
$dbname = "kaizentek-mid"; // Name of the database you created

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>