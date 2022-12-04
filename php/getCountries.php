<?php
	$startTime = microtime(true);
	$json = file_get_contents("../assets/countryBorders.geo.json")
		or die("Error: Geodata file reading problem!");
	$data = json_decode($json, true);
	//$country = $data['features'];

	//$a = array();
	foreach ($data['features'] as $country) {
		$cp = $country['properties'];
		// $a['name'] = $cp['name'];
		// $a['iso']  = $cp['iso_a2'];
		if ($cp['iso_a2'] != "-99")
			$a[$cp['name']] = $cp['iso_a2'];
			// $a[$cp['iso_a2']] = $cp['name'];
	}
	//sort($a);
	ksort($a);

	$output['status']['code'] = "200";
	$output['status']['message'] = "OK";
	$output['status']['description'] = "Success";
	$output['status']['returnedIn'] = intval((microtime(true) - $startTime) * 1000) . " ms";
	//$output['data'] = $data;
	$output['data'] = $a;

	header("Content-Type: application/json; charset=UTF-8");
	echo json_encode($output);