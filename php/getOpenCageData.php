<?php
	$url = "https://api.opencagedata.com/geocode/v1/json?q={$_GET['Lat']}+{$_GET['Lng']}&key=1b4732ddd4624b1fa61cf45b49878bea";

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
	$output['data'] = $decode->results[0];

	header("Content-Type: application/json; charset=UTF-8");
	echo json_encode($output);