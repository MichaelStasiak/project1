//Loader display ======================================================
$(window).on("load", function() {
    $(".loader-container").fadeOut(1500);
});

//	map setup:
let map = L.map("map").setView([49, 20], 4);

//let firstCountry;	//	pierwszy kraj na liście krajów
let geoJson;		//	zmienna z warstwą geograficzną
let countryCode;	//	przechowuje countyCode
let c;				//	współrzędne kliknięcia mapy
var run = true;	//	zmienna do oznaczania zakończenia poszukiwania pierwszego kraju

//	base layer setup:
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

//	set event's function:
map.on("click", onMapClick);

//	define the markers: ======================================================
const myIcon = L.icon({
	iconUrl:		"assets/imgs/LOGO4.svg",
	iconSize:		[38, 95],	// size of the icon
	iconAnchor:		[22, 50],	// point of the icon which will correspond to marker's location
	popupAnchor:	[-3, -16]	// point from which the popup should open relative to the iconAnchor
});

const myIconSmall = L.icon({
	iconUrl:		"assets/imgs/LOGO4.svg",
	iconSize:		[1, 1],	// size of the icon
	iconAnchor:		[1, 1],	// point of the icon which will correspond to marker's location
	popupAnchor:	[1, 1]	// point from which the popup should open relative to the iconAnchor
});

//	===========================================================================
function fillSelect() {
	//console.log("=== getCountries.php ===========================================================");
	$.get("php/getCountries.php",

		function(result) {
			// console.log(result);
			//console.log("data:");
			//console.log(result.data);

			//run = true;
			$.each(result.data, function(k, v) {
				// console.log(k, v);
				$('#selCountry').append(`<option value='${v}'>${k}</option>`);
				if (run) {
					countryCode = v;
					run = false;
					//console.log("countryCode: ", countryCode, run);
				}
			});
		}
	);
}

//	===========================================================================
function getCountryGeometry(code) {
	//console.log("=== getCountryGeometry.php ==========================================================");
	$.get("php/getCountryGeometry.php",
		{ code: code },

		function(result) {
			//console.log(result);
			//console.log("data:");
			//console.log(result.data);

			/// return result.data;	//	to nie ma sensu! - wywołanie asynchroniczne
		}
	);

	/// return, ale skąd??
}
//	===========================================================================
function showPosition(position) {
	c = position.coords;
	c.lat = c.latitude;
	c.lng = c.longitude;
	//console.log(c);

	//$('#lat').html(c.latitude);
	//$('#lng').html(c.longitude);
	//getCountryCode({lat: c.latitude, lng: c.longitude});
	getCountryCode(c);

	// let marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: myIcon}).addTo(map);
	let marker = L.marker([c.lat, c.lng], {icon: myIcon}).addTo(map);
	// let marker = L.marker(c, {icon: myIcon}).addTo(map);
	//marker.bindPopup('<b>Your current location</b>').openPopup();
}

//	===========================================================================
function getCountryCode(coords) {
	//console.log(coords);
	$.get("php/getCountryCode.php",
		{ Lat: coords.lat, Lng: coords.lng },

		function(result) {
			var rd = result.data;
			$('#status').text('status' in rd);		//	sprawdzenie obecności pola status
			if (result.status.code == 200)			//	tego i tak nikt nie sprawdzi gdy przyjdą niewłaściwe dane
				if ('status' in rd)
					$('#txtStatus')	.html(rd.status.message);
				else {
					//console.log(rd.countryCode);
					countryCode = rd.countryCode;
					/// getCountryGeometry(rd.conutryCode); to nie zadziała

					//console.log("=== getCountryGeometry.php ==========================================================");
					$.get("php/getCountryGeometry.php",
						{ code: rd.countryCode },
				
						function(result) {
							//console.log(result);
							//console.log("data:");
							//console.log(result.data);

							let rdp = result.data.properties;
							$('#txtCName').html(rdp.name);
							$('#txtCCode').html(rdp.iso_a2);

							geoJson.clearLayers();			//	kasowanie starej warstwy
							geoJson.addData(result.data);	//	dodanie nowej warstwy
							map.fitBounds(geoJson.getLayers()[0].getBounds());
						}
					);					
				}
		}
	);
}

//	===========================================================================
function round(val) {
	return Math.round(1000000*val)/1000000;
}

//	===========================================================================
function getCountryInfo(countryCode) {
	//console.log("=== getCountryInfo.php ==========================================================");
	$.get("php/getCountryInfo.php",
		{ code: countryCode },

		function(result) {
			var rd = result.data;
			let population = parseInt(rd.population);
			let populationTranformed = population.toLocaleString();
			//console.log(population.toLocaleString());
			//console.log(rd);
			if (result.status.code == 200) {
				$('#txtcountryName')  .html(rd.countryName);
				$('#txtcountryCode')  .html(rd.countryCode);
				$('#txtCapital')	  .html(rd.capital);
				$('#txtCurrency')	  .html(rd.currencyCode);
				$('#txtLanguages')	  .html(rd.languages);
				$('#txtPopulation')	  .html(populationTranformed);
				$('#txtArea')		  .html(rd.areaInSqKm + " km<sup>2</sup>");
				$('#txtcontinentName').html(rd.continentName);
			}
		}
	)
}

//	===========================================================================
function getOpenCageData(coords) {
	$.get("php/getOpenCageData.php",
		{ Lat: coords.lat, Lng: coords.lng },

		function(result) {
			var rd = result.data;
			//console.log(rd);
			$('#flag')	.html(rd.annotations.flag);
			$('#currencyName').html(rd.annotations.currency.name);
			$('#symbol').html(rd.annotations.currency.symbol);
			$('#currencyIso_code').html(rd.annotations.currency.iso_code);
			$('#subunit').html(rd.annotations.currency.subunit);
			$('#subunit_to_unit').html(rd.annotations.currency.subunit_to_unit);
			$('#callingcode').html(rd.annotations.callingcode);
			$('#drive_on').html(rd.annotations.roadinfo.drive_on);
			$('#speed_in').html(rd.annotations.roadinfo.speed_in);
			$('#timeZone').html(rd.annotations.timezone.name);
			//	dodanie markera na mapie:
			/* let marker = L.marker(coords, {icon: myIconSmall}).addTo(map);
			marker.bindPopup(rd.components.country + " " + rd.annotations.flag).openPopup(); */	
		}
	)
}

//	===========================================================================
function findNearbyWikipedia(coords) {
	$.get("php/findNearbyWikipedia.php",
		{ Lat: coords.lat, Lng: coords.lng },

		function(result) {
			var rd = result.data;
			//console.log(rd);
			//$('#txtWiki').html('<a href="http://' + rd.wikipediaUrl + '">Wiki info</a>'); //pojedynczy wpis
			let wiki = "";
			rd.forEach(function findNearbyWikipedia(item) {
				wiki += ("<h4><a href='" + item.wikipediaUrl + "'>" + item.title + "</a></h4>Category: " + item.feature + '<br>' + item.summary + '<br>');
				if ("thumbnailImg" in item) wiki += ("<img src='" + item.thumbnailImg + "'/>");
				wiki += "<hr>";
			});
			$('#txtWiki').html(wiki);
		}
	);
}

//	=========================================================================== 
function getWeatherInfo(coords) {
	$.get("php/getWeatherInfo.php",
		{ Lat: coords.lat, Lng: coords.lng },

		function(result) {
			var rd = result.data;
			//console.log(rd);
			$('#txtIcon')	.html("<img src='assets/weatherIcons/" + rd.weather[0].icon + ".png'></img>");
			if (rd.weather[0].icon[2] == 'd') console.log('day');
			else console.log('night');

			$('#txtTemperature').html(rd.main.temp + " &deg;C");
			$('#txtFeels_like').html(rd.main.feels_like + " &deg;C");
			$('#txtTemp_max').html(rd.main.temp_max + " &deg;C");
			$('#txtTemp_min ').html(rd.main.temp_min + " &deg;C");
			$('#txtPressure ').html(rd.main.pressure + " mmHg");
			$('#txtHumidity').html(rd.main.humidity + "%");
			$('#txtWindSpeed')	.html(rd.wind.speed + " m/s");
			$('#txtDirection')	.html(rd.wind.deg + " &deg;");
			$('#txtClouds')		.html(rd.weather[0].description);
			$('#txtVisibility')	.html(rd.visibility + " m");
		}
	)
}

//	===========================================================================
function getMarkers(countryCode) {
	//console.log("--- getMarkers() ---------");
	countryCode = countryCode.toLowerCase();
	if (countryCode == 'gb') countryCode = "uk";		//	GB is not accepted by API ;-)
	//console.log(countryCode);

	let cluster = L.markerClusterGroup();
	map.addLayer(cluster);		//	cluster display

	// Creates a marker for touristic POI
	let blueMarker = L.ExtraMarkers.icon({
		icon: 'fa-dollar-sign',
		icon: 'fa-landmark',
		markerColor: 'blue',
		shape: 'square',
		prefix: 'fa'
	});

	 // Creates a marker for cities
	let pinkMarker = L.ExtraMarkers.icon({
		icon: 'fa-city',
		markerColor: 'pink',
		shape: 'star',
		prefix: 'fa'
	});

	function addMarker1(item) {
		//console.log(item.name, item.coordinates.longitude, item.coordinates.latitude);
		//let marker = L.marker([item.coordinates.latitude, item.coordinates.longitude]).addTo(map).bindPopup("<b>" + item.name + "</b>" + "<br>" + item.snippet + "<br>");
		//let marker = L.marker([item.coordinates.latitude, item.coordinates.longitude]).bindPopup("<b>" + item.name + "</b>" + "<br>" + item.snippet + "<br>");
		let marker = L.marker([item.coordinates.latitude, item.coordinates.longitude], {icon: blueMarker}).bindPopup(
			"<b>" + item.name + "</b>" + "<br><br>" + item.snippet + "<br>" + "<b>Location: </b>" + item.location_id + "<br><br>"/*
			+ "images"      in item ? "<img src='" + item.images[0].sizes.thumbnail.url + "' alt='" + item.images[0].caption + "' style='width: 100%'><br><br>" :  ""
			+ "attribution" in item ? "<a href='" + item.attribution[1] + "'>Wikipedia info</a><br>" : ""*/);
		cluster.addLayer(marker);
	}

	function addMarker2(item) {
		let marker = L.marker([item.coordinates.latitude, item.coordinates.longitude], {icon: pinkMarker}).bindPopup(
			"<b>City name: " + item.name + "</b><br><br>" + item.snippet);
		cluster.addLayer(marker);
	}

	//	obiekty historyczne:
	fetch(`https://www.triposo.com/api/20220705/poi.json?countrycode=${countryCode}&count=51&account=6BHFQUHX&token=aneyzbmlp24indiz93ki4milmjewdtts`)
		.then(res => res.json())
		.then(data => {
				//console.log(data);
				let markers = data.results;
				//console.log(markers);

				markers.forEach(addMarker1);
			}
		)
		.catch(error => console.log('Feach error:', error));

	//	obiekty geograficzne:
	fetch(`https://www.triposo.com/api/20220104/location.json?countrycode=${countryCode}&tag_labels=city&count=50&fields=coordinates,snippet,name,score&account=6BHFQUHX&token=aneyzbmlp24indiz93ki4milmjewdtts`)
		.then(res => res.json())
		.then(data => {
				//console.log(data);
				let markers = data.results;
				console.log(markers);

				markers.forEach(addMarker2);
			}
		)
		.catch(error => console.log('Feach error:', error));
}

//	===========================================================================
$(document).ready(function() {
    //geoJson = L.geoJson({style: {color: 'red'}}).addTo(map);
    //geoJson = L.geoJson({style: {color: '#F00'}});
    geoJson = L.geoJSON(null, {style: {color: 'Green'}}).addTo(map);
	fillSelect();
	//while (run) ;				//	!oczekanie na zakończnie fillSelect()!
	//console.log(run);

	//	current position and setting up the marker:
	//console.log(navigator.geolocation);
	if (navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
	//else ...;
	//console.log("else: ", countryCode);

	setTimeout(() => {
		$.get("php/getCountryGeometry.php",
			{ code: countryCode },

			function(result) {
				let rdp = result.data.properties;
				$('#txtCName').html(rdp.name);
				$('#txtCCode').html(rdp.iso_a2);

				geoJson.clearLayers();			//	kasowanie starej warstwy
				geoJson.addData(result.data);	//	dodanie nowej warstwy
				map.fitBounds(geoJson.getLayers()[0].getBounds());
			}
		);

		//console.log(countryCode);
		$("#selCountry").val(countryCode);
		//console.log($("#selCountry").val());
	}, 3000);
	
	test();
});

//	===========================================================================
function onMapClick(e) {
	//console.log("=== map.onClick() ================================================================")
	//console.log(e.target);

	c = e.latlng;
	c.lat = round(c.lat);
	c.lng = round(c.lng);
	//$('#lat').html('Lat: ' + c.lat);
	//$('#lng').html('Lng: ' + c.lng);

	getCountryCode(c);
	setTimeout(() => {$("#selCountry").val(countryCode);}, 3000);
}

//	===========================================================================
$("#selCountry").change(function(e) {
	//console.log("=== #selCountry.change() ==========================================================");
	//console.log(e);

	//getCountryCode(c);

	console.log(this.value);
	countryCode = this.value;

	$.get("php/getCountryGeometry.php",
		{ code: this.value },

		function(result) {
			//console.log(result);
			//console.log("data:");
			console.log(result.data);

			let rdp = result.data.properties;
			$('#txtCName').html(rdp.name);
			$('#txtCCode').html(rdp.iso_a2);

			geoJson.clearLayers();			//	kasowanie starej warstwy
			geoJson.addData(result.data);	//	dodanie nowej warstwy
			map.fitBounds(geoJson.getLayers()[0].getBounds());
		}
	);

});

//	dodanie panelu Info: =====================================================
var info = L.control();		//	?co to robi?

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
	// console.log(props);
    this._div.innerHTML =	'<h4>Country Information:</h4>' +
							'Country: <span id="txtCName"></span><br/>' +
    						'Coundry Code: <span id="txtCCode"></span><br/>' +
							'<hr>2022 &copy; Mike Stasiak';
    						
};

info.addTo(map);

// Easy buttons ==============================================================
L.easyButton('<i class="fa-solid fa-circle-info" data-bs-toggle="modal" data-bs-target="#countryInfoModal"></i>', function(btn, map) {
	//$(btn).attr("data-bs-toggle", "modal");
	//$(btn).attr("data-bs-target", "#countryInfoModalLabel");
	$(btn).attr({"data-bs-toggle": "modal", "data-bs-target": "#countryInfoModal"});
	getCountryInfo(countryCode);

	//console.log(btn.getAttribute("data-bs-toggle"));
	//console.log("btn: ", $(btn).attr());
	//console.log(map);
	//console.log(btn);
	//alert('you just clicked the html entity \&starf;');
	console.log($('#countryInfoModal').attr());
	
}).addTo(map);

L.easyButton('<i class="fa-solid fa-cloud" data-bs-toggle="modal" data-bs-target="#weatherModal"></i>', function(btn, map) {
	getWeatherInfo(c);
}).addTo(map);

L.easyButton('<i class="fa-brands fa-wikipedia-w" data-bs-toggle="modal" data-bs-target="#wikiModal"></i>', function(btn, map){
	findNearbyWikipedia(c);
 }).addTo(map);

 L.easyButton('<i class="fa-solid fa-location-pin"></i>', function(btn, map) {
	// helloPopup.setLatLng(map.getCenter()).openOn(map);
	getMarkers(countryCode);
 }).addTo(map);


 L.easyButton('<i class="fa-solid fa-dollar-sign" data-bs-toggle="modal" data-bs-target="#supModal"></i>', function(btn, map) {
/** 	var currencyInfoPopup = L.popup().setContent("<b>Suplementary information:</b><br>" +
	"Currency name: <span id='currencyName'></span><br>" + 
	"Currency code: <span id='currencyIso_code'></span><br>" + 
	"Currency symbol: <span id='symbol'></span><br>" + 
	"Currency subunit: <span id='subunit'></span><br>" +
	"Subunit to unit: <span id='subunit_to_unit'></span><br>" +
	" Country flag: <span id='flag'></span><br>" + 
	" Calling code: <span id='callingcode'></span><br>" +
	" Drive on: <span id='drive_on'></span><br>" + 
	" Speed unit: <span id='speed_in'></span><br>" + 
	" Time zone: <span id='timeZone'></span><br>"  
	).setLatLng(map.getCenter()).addTo(map).openOn(map);*/
	getOpenCageData(c);
 }).addTo(map);

function test() {
}

//	===========================================================================
$(window).load(() => {

});	
