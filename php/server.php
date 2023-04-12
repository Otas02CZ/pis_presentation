<?php
$SERVER_NAME = "localhost";
$DB_NAME = "pis_db";
$USER_NAME = "root";
$PASSWORD = "";


if ($_SERVER['REQUEST_METHOD'] != "POST") {
    exit();
}

function connectSQL($SERVER_NAME, $DB_NAME, $USER_NAME, $PASSWORD) {
    try {
        $connection = new PDO("mysql:host=$SERVER_NAME;dbname=$DB_NAME", $USER_NAME, $PASSWORD);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch(PDOException $ERROR) {
        exit;
    }
    return $connection;
}

$receivedJSONData = file_get_contents('php://input');
$receivedData = json_decode($receivedJSONData, true);

switch ($receivedData["type"]) {
    case "getIp":
        $response = array();
        $response["type"] = "getIp";
        $response["data"] = $_SERVER["REMOTE_ADDR"];
        $response["msg"] = "";
        echo json_encode($response);
        break;
    case "getData":
        $connection = connectSQL($SERVER_NAME, $DB_NAME, $USER_NAME, $PASSWORD);
        $statement = $connection->prepare("SELECT * FROM study_results");
        $statement->execute();
        $data = $statement->fetchAll();
        $response = array();
        $response["type"] = "getData";
        $response["data"] = $data;
        $response["msg"] = "";
        echo json_encode($response);
        break;
    case "rmExam":
        $connection = connectSQL($SERVER_NAME, $DB_NAME, $USER_NAME, $PASSWORD);
        $statement = $connection->prepare("DELETE FROM study_results WHERE id=:id");
        $statement->bindParam(':id', $receivedData["data"]["id"]);
        $statement->execute();
        $statement = $connection->prepare("SELECT * FROM study_results");
        $statement->execute();
        $data = $statement->fetchAll();
        $response = array();
        $response["type"] = "rmExam";
        $response["data"] = $data;
        $response["msg"] = "";
        echo json_encode($response);
        break;
    case "addExam":
        $connection = connectSQL($SERVER_NAME, $DB_NAME, $USER_NAME, $PASSWORD);
        $statement = $connection->prepare("INSERT INTO study_results (name, date, grade) VALUES (:name, :date, :grade)");
        $statement->bindParam(':name', $receivedData["data"]["name"]);
        $statement->bindParam(':date', $receivedData["data"]["date"]);
        $statement->bindParam(':grade', $receivedData["data"]["grade"]);
        $statement->execute();
        $statement = $connection->prepare("SELECT * FROM study_results");
        $statement->execute();
        $data = $statement->fetchAll();
        $response = array();
        $response["type"] = "addExam";
        $response["data"] = $data;
        $response["msg"] = "";
        echo json_encode($response);
        break;
    default:
        break;
}




?>