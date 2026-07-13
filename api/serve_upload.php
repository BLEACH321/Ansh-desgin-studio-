<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit();
}

$file = $_GET['file'] ?? '';
// Sanitize file name to prevent directory traversal
$file = basename($file);

if (empty($file)) {
    http_response_code(400);
    echo "No file specified.";
    exit();
}

$path1 = "uploads/" . $file;
$path2 = "../uploads/" . $file;

if (file_exists($path1)) {
    $path = $path1;
} elseif (file_exists($path2)) {
    $path = $path2;
} else {
    $path = null;
}

if ($path) {
    // Get mime type
    $mime = mime_content_type($path);
    if (!$mime) {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if ($ext === 'jpg' || $ext === 'jpeg') $mime = 'image/jpeg';
        elseif ($ext === 'png') $mime = 'image/png';
        elseif ($ext === 'gif') $mime = 'image/gif';
        elseif ($ext === 'webp') $mime = 'image/webp';
        else $mime = 'application/octet-stream';
    }
    
    header("Content-Type: $mime");
    header("Content-Length: " . filesize($path));
    readfile($path);
    exit();
} else {
    http_response_code(404);
    echo "File not found.";
}
?>
