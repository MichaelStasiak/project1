<?php
	$startTime = microtime(true);
	$json = file_get_contents("../assets/countryBorders.geo.json")
		or die("Error: Geodata file reading problem!");
	$data = json_decode($json, true);

	foreach ($data['features'] as $country) {
		if ($country['properties']['iso_a2'] == $_GET['code']) break;
	}

	$output['status']['code'] = "200";
	$output['status']['message'] = "OK";
	$output['status']['description'] = "Success";
	$output['status']['returnedIn'] = intval((microtime(true) - $startTime) * 1000) . " ms";
	$output['data'] = $country;
	// $output['data'] = $country['geometry'];

	header("Content-Type: application/json; charset=UTF-8");
	echo json_encode($output);
