
var map = new google.maps.Map(document.getElementById("map"), {});
var infoWindow = new google.maps.InfoWindow({
	maxWidth: 200
});

var Marker = function(data) {
	this.name = data.location.name;
	this.location = data.location;
	this.marker = data.marker;
	this.infoWindow = data.infoWindow;
};

var AppViewModel = function() {
	var self = this;
	this.searchInput = ko.observable("");
	this.markersArray = ko.observableArray([]);
	this.currentActiveMarker = ko.observable({});
	this.currentMarkersArray = ko.observableArray([]);
	this.currentTitle = ko.observable("Neighborhood Map");
	this.updateTitle = ko.computed(function() {
		return self.currentTitle();
	}, this);

	this.isActive = function(obj) {
		return "obj";
	};

	this.filtering = ko.computed(function() {
		var checkString = function(str, input) {
			return str.substring(0, input.length) === input ? true : false;
		};
		var textInput = this.searchInput().toLowerCase();
		var filteredArray;
		filteredArray = !textInput
			? this.markersArray()
			: ko.utils.arrayFilter(this.markersArray(), function(item) {
					return checkString(item.name.toLowerCase(), textInput);
				});

		for (var i = 0, len = this.markersArray().length; i < len; i++) {
			this.markersArray()[i].marker.setMap(null);
		}

		for (var i = 0, len = filteredArray.length; i < len; i++) {
			filteredArray[i].marker.setMap(map);
		}

		return this.currentMarkersArray(filteredArray);
	}, this);

	var initialLocations = [
		{
			formatted_address:
				"Al Masjid Al Haram Rd, Al Aziziyah, Mecca 24243, Saudi Arabia",
			name: "Al Baik Aziziya Makkah",
			location: {
				lat: 21.4169188,
				lng: 39.86129149999999
			}
		},
		{
			formatted_address:
				"Block #2443 3rd Ring Road, Arrusayfah District 24232-7384, Makkah, Saudi Arabia, Mecca Saudi Arabia",
			name: "Subway 3rd Ring Road",
			location: {
				lat: 21.407297,
				lng: 39.783555999999976
			}
		},
		{
			formatted_address: "Mecca Saudi Arabia",
			name: "Masjid al-Haram",
			location: {
				lat: 21.42287139999999,
				lng: 39.8257347
			}
		},
		{
			formatted_address:
				"Makkah Mall, King Abdullah Rd, Al Jamiah, Mecca 24246, Saudi Arabia",
			name: "Makkah Mall",
			location: {
				lat: 21.3910788,
				lng: 39.884588800000074
			}
		},
		{
			formatted_address: "Ash Shati, Jeddah 23417, Saudi Arabia",
			name: "Jeddah Waterfront",
			location: {
				lat: 21.5882449,
				lng: 39.10790959999997
			}
		},
		{
			formatted_address:
				"Al Kurnaysh Rd, Ash Shati, Jeddah 21312, Saudi Arabia",
			name: "AlShallal Theme Park",
			location: {
				lat: 21.5678998,
				lng: 39.11104309999996
			}
		}
	];
	var locations = [];
	var markers = [];

	var makeMarker = function(location) {
		var marker = new google.maps.Marker({
			position: location.location,
			animation: google.maps.Animation.DROP,
			icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
			map: map
		});
		marker.locationName = location.name;
		addListenersForMarker(location, marker);
		markers.push({
			location: location,
			marker: marker
		});
		map.setCenter(location.location);
		map.setZoom(10);
	};

	var addListenersForMarker = function(location, marker) {
		marker.addListener("click", function() {
			makeInfoWindow(location);
			infoWindow.open(map, marker);
			clearMarkersAnimation(marker);
		});
		marker.addListener("mouseover", function() {
			marker.setIcon("https://maps.google.com/mapfiles/ms/icons/green-dot.png");
			marker.addListener("mouseout", function() {
				marker.setIcon("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
			});
		});
	};

	var makeInfoWindow = function(location) {
		infoWindow.setContent(
			`<h4 style="color: black;margin:0;">${location.name}</h4>`
		);
		map.setCenter(location.location);
		return infoWindow;
	};

	for (var i = 0, len = initialLocations.length; i < len; i++) {
		makeMarker(initialLocations[i]);
	}

	var updateMarkersList = function() {
		markers.forEach(function(marker) {
			self.markersArray.push(new Marker(marker));
		});
		for (var i = 0, markerObj, len = self.markersArray().length; i < len; i++) {
			markerObj = self.markersArray()[i];
			markerObj.marker.addListener("click", function() {
				self.currentTitle(this.locationName);
			});
		}
	};

	var clearMarkersAnimation = function(marker) {
		for (var i = 0, len = self.markersArray().length; i < len; i++) {
			self.markersArray()[i].marker.setAnimation(null);
		}
		marker.setAnimation(google.maps.Animation.BOUNCE);
	};

	this.clickedMarker = function(clicked) {
		self.currentTitle(clicked.name);
		self.currentActiveMarker(clicked);
		toggleEffects();

		window.setTimeout(function() {
			infoWindow.setContent(
				`<h4 style="color: black;">${clicked.name}</h4>` +
					`<hr>` +
					`<p style="color: black;">${clicked.location.formatted_address}</p>` +
					`<p style="color: black;">${clicked.location.location.lat}, ${clicked
						.location.location.lng}</p>`
			);

			map.setCenter(clicked.location.location);
			clearMarkersAnimation(clicked.marker);
			infoWindow.open(map, clicked.marker);
		}, 300);
	};

	this.mouseOverMarker = function(obj) {
		obj.marker.setIcon(
			"https://maps.google.com/mapfiles/ms/icons/green-dot.png"
		);
		infoWindow.close();
		map.setCenter(obj.location.location);
	};

	this.mouseOutMarker = function(obj) {
		obj.marker.setIcon("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
	};

	updateMarkersList();
};

ko.applyBindings(new AppViewModel());



