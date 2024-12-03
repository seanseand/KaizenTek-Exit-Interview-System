<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "kaizentekmid";

// create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// TODO: for docker container
// $host = getenv('DB_HOST') ?: 'localhost';
// $port = getenv('DB_PORT') ?: '3306';
// $database = getenv('DB_DATABASE') ?: 'kaizentekmid';
// $username = getenv('DB_USERNAME') ?: 'root';
// $password = getenv('DB_PASSWORD') ?: '';
// try {
//     $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
//     $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//     echo "Connected to the database successfully!";
// } catch (PDOException $e) {
//     echo "Database connection failed: " . $e->getMessage();
// }
?>

