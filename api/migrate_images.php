<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config.php';

echo "<h3>Starting migration...</h3>";

// 1. Ensure target directory exists
$target_dir = "uploads/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
    echo "Created uploads directory.<br>";
}

// 2. Move existing files from ../uploads/ to uploads/
$source_dir = "../uploads/";
if (file_exists($source_dir)) {
    $files = scandir($source_dir);
    $moved_count = 0;
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $src_file = $source_dir . $file;
        $dest_file = $target_dir . $file;
        
        if (is_file($src_file)) {
            if (copy($src_file, $dest_file)) {
                $moved_count++;
            }
        }
    }
    echo "Copied $moved_count files from parent uploads to api/uploads.<br>";
} else {
    echo "Parent uploads directory does not exist or has no files.<br>";
}

// 3. Update database records in projects table
$sql = "SELECT id, image, gallery FROM projects";
$result = $conn->query($sql);
$updated_projects = 0;

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $id = $row['id'];
        $image = $row['image'];
        $gallery = $row['gallery'];
        
        $needs_update = false;
        
        // Update cover image
        if (strpos($image, 'anshdesignstudio.com/uploads/') !== false && strpos($image, 'api.anshdesignstudio.com/uploads/') === false) {
            $image = str_replace('anshdesignstudio.com/uploads/', 'api.anshdesignstudio.com/uploads/', $image);
            $needs_update = true;
        }
        
        // Update gallery images
        if (!empty($gallery)) {
            $gallery_arr = json_decode($gallery, true);
            if (is_array($gallery_arr)) {
                $gallery_updated = false;
                foreach ($gallery_arr as $key => $val) {
                    if (strpos($val, 'anshdesignstudio.com/uploads/') !== false && strpos($val, 'api.anshdesignstudio.com/uploads/') === false) {
                        $gallery_arr[$key] = str_replace('anshdesignstudio.com/uploads/', 'api.anshdesignstudio.com/uploads/', $val);
                        $gallery_updated = true;
                        $needs_update = true;
                    }
                }
                if ($gallery_updated) {
                    $gallery = json_encode($gallery_arr);
                }
            }
        }
        
        if ($needs_update) {
            $image_esc = $conn->real_escape_string($image);
            $gallery_esc = $conn->real_escape_string($gallery);
            $update_sql = "UPDATE projects SET image = '$image_esc', gallery = '$gallery_esc' WHERE id = '$id'";
            if ($conn->query($update_sql)) {
                $updated_projects++;
            } else {
                echo "Failed to update project ID $id: " . $conn->error . "<br>";
            }
        }
    }
    echo "Updated $updated_projects projects in database.<br>";
} else {
    echo "Error querying projects: " . $conn->error . "<br>";
}

// 4. Update team_members table
$sql_team = "SELECT id, image FROM team_members";
$result_team = $conn->query($sql_team);
$updated_members = 0;

if ($result_team) {
    while ($row = $result_team->fetch_assoc()) {
        $id = $row['id'];
        $image = $row['image'];
        
        $needs_update = false;
        if (strpos($image, 'anshdesignstudio.com/uploads/') !== false && strpos($image, 'api.anshdesignstudio.com/uploads/') === false) {
            $image = str_replace('anshdesignstudio.com/uploads/', 'api.anshdesignstudio.com/uploads/', $image);
            $needs_update = true;
        }
        
        if ($needs_update) {
            $image_esc = $conn->real_escape_string($image);
            $update_sql = "UPDATE team_members SET image = '$image_esc' WHERE id = '$id'";
            if ($conn->query($update_sql)) {
                $updated_members++;
            } else {
                echo "Failed to update team member ID $id: " . $conn->error . "<br>";
            }
        }
    }
    echo "Updated $updated_members team members in database.<br>";
} else {
    echo "Error querying team members: " . $conn->error . "<br>";
}

echo "<h3>Migration completed successfully!</h3>";
?>
