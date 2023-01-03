//Loader display ======================================================
$(window).on("load", function() {
	$(".loader-container").fadeOut(1500);
});

//	=== Map Setup: ============================================================
let map = L.map("map").setView([49, 20], 4);
let	geoJson = L.geoJSON(null, {style: {color: 'Green'}}).addTo(map);	//	zmienna z warstwą geograficzną (grupą warstw)
let countryCode;	//	przechowuje countyCode aktualnego kraju
let c;				//	współrzędne kliknięcia mapy

//	=== Tile Layers Setup: ====================================================
//	1. Open Street Map Layer:
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

//	2. Google Street Map Layer:
let gstrm = L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
	maxZoom: 20,
	subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

//	3. Google Satelite Map Layer:
let gsatm = L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
	maxZoom: 20,
	subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
 }).addTo(map);

 L.control.layers({
	"Google Street Map":	gstrm,
	"Google Satellite Map":	gsatm,
	"Open Street Map":		osm
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
	$.get("php/getCountries.php",

		function(result) {
			// console.log(result);
			//console.log("data:");
			//console.log(result.data);

			$.each(result.data, function(k, v) {
				// console.log(k, v);
				$('#selCountry').append(`<option value='${v}'>${k}</option>`);
				if (!countryCode) {
					countryCode = v;
					//console.log("countryCode:", countryCode);
				}
			});

			// perform another AJAX call with the navigator LatLngs to retrieve the country code and change the value of the select.
			// console.log(navigator.geolocation);
			if (navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
			else getCountryGeometry(countryCode);
			//console.log(countryCode);

			//$('#countrySelect').val(<iso_code>).change();
		}
	);
}

//	=== pobieranie danych o kraju i wyświetlanie ich na mapie: ================
function getCountryGeometry(code) {
	$.get("php/getCountryGeometry.php",
		{ code: code },

		function(result) {
			//console.log("code:", code);

			//console.log(result);
			//console.log("data:");
			//console.log(result.data);

			//let rdp = result.data.properties;
			//$('#txtCName').html(rdp.name);
			//$('#txtCCode').html(rdp.iso_a2);
			//console.log(rdp.name, rdp.iso_a2);

			geoJson.clearLayers();			//	kasowanie starej warstwy
			geoJson.addData(result.data);	//	dodanie nowej warstwy
			map.fitBounds(geoJson.getLayers()[0].getBounds());
		}
	);
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
			//$('#status').text('status' in rd);		//	sprawdzenie obecności pola status
			if (result.status.code == 200)			//	tego i tak nikt nie sprawdzi gdy przyjdą niewłaściwe dane
				if ('status' in rd)	console.log("Note:", rd.status.message);
				else {
					//console.log(rd.countryCode);
					countryCode = rd.countryCode;
					getCountryGeometry(countryCode);
					$("#selCountry").val(countryCode);
					//console.log($("#selCountry").val());
					getMarkers(countryCode);
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

/*			$('#txtIcon').html("<img src='assets/weatherIcons/" + rd.weather[0].icon + ".png'></img>");
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
*/
			$('#txtDate1').html(Date.parse(rd.list[0].dt_txt).toString("ddd dS"));
			//console.log(Date.parse(rd.list[0].dt_txt).toString("ddd dS"));
			$('#txtCity').html(rd.city.name);
			$('#txtIcon').html("<img src='assets/weatherIcons/" + rd.list[0].weather[0].icon + ".png'></img>");
			$('#txtDescription').html(rd.list[0].weather[0].description.toUpperCase(0));
			$('#txtTemperature1').html(rd.list[0].main.temp + " &deg;C");
			$('#txtTemperatureFeels1').html(rd.list[0].main.feels_like + " &deg;C");
			$('#txtWindSpeed').html(rd.list[0].wind.speed + " km/h");
			$('#txtWindDirection').html(rd.list[0].wind.deg + " &deg;");
			$('#txtDate2').html(Date.parse(rd.list[7].dt_txt).toString("ddd dS"));
			$('#txtDate3').html(Date.parse(rd.list[15].dt_txt).toString("ddd dS"));
			$('#txtDate4').html(Date.parse(rd.list[23].dt_txt).toString("ddd dS"));
			$('#txtDate5').html(Date.parse(rd.list[31].dt_txt).toString("ddd dS"));
			$('#txtTemperature2').html(rd.list[7].main.temp + " &deg;C");
			$('#txtTemperature3').html(rd.list[15].main.temp + " &deg;C");
			$('#txtTemperature4').html(rd.list[23].main.temp + " &deg;C");
			$('#txtTemperature5').html(rd.list[31].main.temp + " &deg;C");
			$('#txtTemperatureFeels2').html(rd.list[7].main.feels_like + " &deg;C");
			$('#txtTemperatureFeels3').html(rd.list[15].main.feels_like + " &deg;C");
			$('#txtTemperatureFeels4').html(rd.list[23].main.feels_like + " &deg;C");
			$('#txtTemperatureFeels5').html(rd.list[31].main.feels_like + " &deg;C");
			$('#txtIcon2').html("<img src='assets/weatherIcons/" + rd.list[7].weather[0].icon + ".png'></img>");
			$('#txtIcon3').html("<img src='assets/weatherIcons/" + rd.list[15].weather[0].icon + ".png'></img>");
			$('#txtIcon4').html("<img src='assets/weatherIcons/" + rd.list[23].weather[0].icon + ".png'></img>");
			$('#txtIcon5').html("<img src='assets/weatherIcons/" + rd.list[31].weather[0].icon + ".png'></img>");


			/*
			for (let i = 0; i < 40; i+=8) {		//	5x, co 24h
				console.log(rd.list[i].dt_txt, Date.parse(rd.list[i].dt_txt).toString("ddd dS"));
			} */
			//console.log(Date());
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
				//console.log(markers);

				markers.forEach(addMarker2);
			}
		)
		.catch(error => console.log('Feach error:', error));
}

//	===========================================================================
$(document).ready(function() {
	fillSelect();
	//console.log("countryCode:", countryCode);
});

//	===========================================================================
function onMapClick(e) {
	//console.log("--- map.onClick() ------------------------------------------")
	//console.log(e.target);

	c = e.latlng;
	c.lat = round(c.lat);
	c.lng = round(c.lng);

	getCountryCode(c);
}

//	===========================================================================
$("#selCountry").change(function(e) {
	//console.log("=== #selCountry.change() ===================================");
	//console.log(e);

	//console.log(this.value);
	countryCode = this.value;
	getCountryGeometry(countryCode);
	getMarkers(countryCode);
});

// Easy buttons ==============================================================
L.easyButton('<i class="fa-regular fa-file" data-bs-toggle="modal" data-bs-target="#aboutModal"></i>', () => {}).addTo(map);

L.easyButton('<i class="fa-solid fa-circle-info" data-bs-toggle="modal" data-bs-target="#countryInfoModal"></i>', function(btn, map) {
	//$(btn).attr("data-bs-toggle", "modal");
	//$(btn).attr("data-bs-target", "#countryInfoModalLabel");
	//$(btn).attr({"data-bs-toggle": "modal", "data-bs-target": "#countryInfoModal"});
	//getCountryInfo(countryCode);

	//console.log(btn.getAttribute("data-bs-toggle"));
	//console.log("btn: ", $(btn).attr());
	//console.log(map);
	//console.log(btn);
	//alert('you just clicked the html entity \&starf;');
	//console.log($('#countryInfoModal').attr());
	
}).addTo(map);


L.easyButton('<i class="fa-solid fa-cloud" data-bs-toggle="modal" data-bs-target="#weatherModal"></i>', function(btn, map) {
	//getWeatherInfo(c);
}).addTo(map);

L.easyButton('<i class="fa-brands fa-wikipedia-w" data-bs-toggle="modal" data-bs-target="#wikiModal"></i>', function(btn, map){
	//findNearbyWikipedia(c);
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
	//getOpenCageData(c);
}).addTo(map);

// Modal triggers ==============================================================
$("#aboutModal").on("show.bs.modal", function(e) {
	//console.log("aboutMOdal triggered");
});

$("#countryInfoModal").on("show.bs.modal", function(e) {
	getCountryInfo(countryCode);
});

$("#weatherModal").on("show.bs.modal", function(e) {
	getWeatherInfo(c);
});

$("#wikiModal").on("show.bs.modal", function(e) {
	findNearbyWikipedia(c);
});

$("#supModal").on("show.bs.modal", function(e) {
	getOpenCageData(c);
});
