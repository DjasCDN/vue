<?php
$settings = json_decode(file_get_contents('php://input'), true);
// file_put_contents(__DIR__ . '/test.log', print_r($GLOBALS["settings"], 1), FILE_APPEND);

switch ($settings["param"]) {
	case "htmlFilesName":
    $htmlFiles = glob("../../*.html");
    $htmlFilesName = array();
    foreach ($htmlFiles as $htmlFile) {
      array_push($htmlFilesName, basename($htmlFile));
    }
    header('Content-type: application/json');
    echo json_encode($htmlFilesName);
	break;
	case "htmlCreate":
    $newFile = "../../" . $settings["file_name_value"] . ".html";
    if(file_exists($newFile)) {
      $message =  "Фаил с таким именем уже существует";
      // header('HTTP/1.0 400 Bad Request');
			header('Content-type: application/json');
      echo json_encode($message);
    } else {
      fopen($newFile, "w");
      $message = "Фаил успешно создан";
      header('Content-type: application/json');
      echo json_encode($message);
    }
	break;
  case "htmlDelete":
    $newFile = "../../" . $settings["file_name_value"];
    if(file_exists($newFile)) {
      unlink($newFile);
      $message = "Фаил успешно удален";
      header('Content-type: application/json');
      echo json_encode($message);
    } else {
      $message =  "Фаил с таким именем не существует";
      // header('HTTP/1.0 400 Bad Request');
			header('Content-type: application/json');
      echo json_encode($message);
    }
	break;
}
