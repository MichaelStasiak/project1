<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	// $url = 'http://api.geonames.org/weatherIcaoJSON?ICAO=' . $_REQUEST['station'] . '&username=mikesss';
	// $url = "https://api.openweathermap.org/data/2.5/weather?lat={$_GET['Lat']}&lon={$_GET['Lng']}&appid=56c55e9964f7d03830817873684446de&units=metric";
	$url = "https://api.openweathermap.org/data/2.5/forecast?lat={$_GET['Lat']}&lon={$_GET['Lng']}&appid=56c55e9964f7d03830817873684446de&units=metric";

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
	$output['data'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
