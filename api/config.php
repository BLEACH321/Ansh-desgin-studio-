<?php
// Database credentials
// You can find these in your GoDaddy cPanel -> MySQL Databases
define('DB_HOST', 'localhost');
define('DB_USER', 'ads_db');
define('DB_PASS', 'YOUR_PASSWORD_HERE');
define('DB_NAME', 'ads_db');

// Connect to MySQL
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");

// Helper function to handle JSON responses
function sendJSON($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data);
    exit();
}
?>
