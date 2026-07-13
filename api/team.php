<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('memory_limit', '256M');
ini_set('post_max_size', '64M');
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    if (isset($_GET['action'])) {
        $action = strtoupper($_GET['action']);
        if ($action === 'PUT' || $action === 'UPDATE') {
            $method = 'PUT';
        } elseif ($action === 'DELETE') {
            $method = 'DELETE';
        }
    }
}
if ($method == 'OPTIONS') exit();

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM team_members ORDER BY id ASC";
        $result = $conn->query($sql);
        $members = [];
        while($row = $result->fetch_assoc()) {
            $row['socials'] = json_decode($row['socials'] ?? '[]');
            $members[] = $row;
        }
        sendJSON($members);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) sendJSON(["error" => "No data"], 400);

        $name = $conn->real_escape_string($data['name']);
        $role = $conn->real_escape_string($data['role']);
        $image = $conn->real_escape_string($data['image']);
        $socials = json_encode($data['socials'] ?? []);

        $sql = "INSERT INTO team_members (name, role, image, socials) 
                VALUES ('$name', '$role', '$image', '$socials')";
        
        if ($conn->query($sql)) {
            $data['id'] = $conn->insert_id;
            sendJSON($data, 201);
        } else {
            sendJSON(["error" => $conn->error], 500);
        }
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $updates = [];
        if (isset($data['name'])) $updates[] = "name = '" . $conn->real_escape_string($data['name']) . "'";
        if (isset($data['role'])) $updates[] = "role = '" . $conn->real_escape_string($data['role']) . "'";
        if (isset($data['image'])) $updates[] = "image = '" . $conn->real_escape_string($data['image']) . "'";
        if (isset($data['socials'])) $updates[] = "socials = '" . json_encode($data['socials']) . "'";

        if (empty($updates)) sendJSON(["error" => "No updates"], 400);
        $sql = "UPDATE team_members SET " . implode(", ", $updates) . " WHERE id = '$id'";
        if ($conn->query($sql)) sendJSON(["success" => true]);
        else sendJSON(["error" => $conn->error], 500);
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM team_members WHERE id = '$id'";
        if ($conn->query($sql)) sendJSON(["success" => true]);
        else sendJSON(["error" => $conn->error], 500);
        break;
}
?>
