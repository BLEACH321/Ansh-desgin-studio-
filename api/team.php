<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    exit();
}

switch($method) {
    case 'GET':
        $sql = "SELECT * FROM team_members ORDER BY id DESC";
        $result = $conn->query($sql);
        $members = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                // Decode socials if it's stored as JSON
                $row['socials'] = json_decode($row['socials']);
                $members[] = $row;
            }
        }
        sendJSON($members);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            sendJSON(["error" => "No data provided"], 400);
        }

        $name = $conn->real_escape_string($data['name']);
        $role = $conn->real_escape_string($data['role']);
        $image = $conn->real_escape_string($data['image']);
        $socials = json_encode($data['socials']);

        $sql = "INSERT INTO team_members (name, role, image, socials) VALUES ('$name', '$role', '$image', '$socials')";
        
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

        if (empty($updates)) {
            sendJSON(["error" => "Nothing to update"], 400);
        }

        $sql = "UPDATE team_members SET " . implode(", ", $updates) . " WHERE id = $id";
        
        if ($conn->query($sql)) {
            sendJSON(["success" => true]);
        } else {
            sendJSON(["error" => $conn->error], 500);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM team_members WHERE id = $id";
        if ($conn->query($sql)) {
            sendJSON(["success" => true]);
        } else {
            sendJSON(["error" => $conn->error], 500);
        }
        break;
}
?>
