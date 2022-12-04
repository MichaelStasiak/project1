<?php
	$url = "http://api.geonames.org/countryInfoJSON?country={$_REQUEST['code']}&username=mikesss";

	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	$startTime = microtime(true);
	$result = curl_exec($curl);
	$decode = json_decode($result);
	curl_close($curl);

	$output['status']['code'] = "200";
	$output['status']['message'] = "OK";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $startTime) * 1000) . " ms";
	$output['data'] = $decode->geonames[0];

	header("Content-Type: application/json; charset=UTF-8");
	echo json_encode($output);