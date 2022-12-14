<?php
	$startTime = microtime(true);
	$json = file_get_contents("../assets/countryBorders.geo.json")
		or die("Error: Geodata file reading problem!");
	$data = json_decode($json, true);
	// $country = $data["features"];

	$output['status']['code'] = "200";
	$output['status']['message'] = "OK";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $startTime) * 1000) . " ms";
	$output['data'] = $data;

	header("Content-Type: application/json; charset=UTF-8");
	echo json_encode($output);