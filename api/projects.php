<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
ini_set('memory_limit', '256M');
ini_set('post_max_size', '64M');
ini_set('memory_limit', '512M');
ini_set('post_max_size', '128M');
ini_set('upload_max_filesize', '128M');
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'OPTIONS') exit();

switch($method) {
    case 'GET':
        $type = isset($_GET['type']) ? $conn->real_escape_string($_GET['type']) : null;
        $sql = $type ? "SELECT * FROM projects WHERE type = '$type' ORDER BY id DESC" : "SELECT * FROM projects ORDER BY id DESC";
        $result = $conn->query($sql);
        if (!$result) sendJSON(["error" => $conn->error], 500);
        
        $projects = [];
        while($row = $result->fetch_assoc()) {
            $row['gallery'] = json_decode($row['gallery'] ?? '[]');
            $projects[] = $row;
        }
        sendJSON($projects);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) sendJSON(["error" => "No data"], 400);

        $title = $conn->real_escape_string($data['title']);
        $category = $conn->real_escape_string($data['category']);
        $type = $conn->real_escape_string($data['type']);
        $image = $conn->real_escape_string($data['image']);
        $gallery = json_encode($data['gallery']);
        $description = $conn->real_escape_string($data['desc'] ?? '');
        $location = $conn->real_escape_string($data['location'] ?? '');
        $year = $conn->real_escape_string($data['year'] ?? '');
        $area = $conn->real_escape_string($data['area'] ?? '');
        $size = $conn->real_escape_string($data['size'] ?? '');

        $sql = "INSERT INTO projects (title, category, type, image, gallery, description, location, year, area, size) 
                VALUES ('$title', '$category', '$type', '$image', '$gallery', '$description', '$location', '$year', '$area', '$size')";
        
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
        if (isset($data['title'])) $updates[] = "title = '" . $conn->real_escape_string($data['title']) . "'";
        if (isset($data['category'])) $updates[] = "category = '" . $conn->real_escape_string($data['category']) . "'";
        if (isset($data['desc']) || isset($data['description'])) {
            $val = $data['desc'] ?? $data['description'];
            $updates[] = "description = '" . $conn->real_escape_string($val) . "'";
        }
        if (isset($data['type'])) $updates[] = "type = '" . $conn->real_escape_string($data['type']) . "'";
        if (isset($data['image'])) $updates[] = "image = '" . $conn->real_escape_string($data['image']) . "'";
        if (isset($data['gallery'])) $updates[] = "gallery = '" . json_encode($data['gallery']) . "'";
        if (isset($data['location'])) $updates[] = "location = '" . $conn->real_escape_string($data['location']) . "'";
        if (isset($data['year'])) $updates[] = "year = '" . $conn->real_escape_string($data['year']) . "'";
        if (isset($data['area'])) $updates[] = "area = '" . $conn->real_escape_string($data['area']) . "'";
        if (isset($data['size'])) $updates[] = "size = '" . $conn->real_escape_string($data['size']) . "'";

        if (empty($updates)) sendJSON(["error" => "No updates"], 400);

        $sql = "UPDATE projects SET " . implode(", ", $updates) . " WHERE id = $id";
        
        if ($conn->query($sql)) {
            sendJSON(["success" => true]);
        } else {
            sendJSON(["error" => $conn->error], 500);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $sql = "DELETE FROM projects WHERE id = $id";
        if ($conn->query($sql)) {
            sendJSON(["success" => true]);
        } else {
            sendJSON(["error" => $conn->error], 500);
        }
        break;
}
?>
