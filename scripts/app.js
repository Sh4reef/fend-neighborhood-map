
/* I've putted the whole code inside app() callback because performence is better as I noticed. */
function app() {

	/* Create new map instance to be used withing the app */
	var map = new google.maps.Map(document.getElementById("map"), {});
	/* Create new infoWindow instance just once */
	var infoWindow = new google.maps.InfoWindow({
		maxWidth: 200
	});

	/* Marker model */
	var Marker = function(data) {
		this.name = data.location.name;
		this.location = data.location;
		this.marker = data.marker;
		this.infoWindow = data.infoWindow;
	};

	/* ViewModel */
	var AppViewModel = function() {
		var self = this;
		this.searchInput = ko.observable("");
		this.markersArray = ko.observableArray([]);
		this.currentMarkersArray = ko.observableArray([]);
		this.currentTitle = ko.observable("Neighborhood Map");
		this.updateTitle = ko.computed(function() {
			return self.currentTitle();
		}, this);


		/* Filtering if textInput is being used */
		this.filtering = ko.computed(function() {
			var textInput = this.searchInput().toLowerCase();
			var filteredArray;
			var checkString = function(str, input) {
				// Using substring for search is very strict as I noticed
				/* return str.substring(0, input.length) === input ? true : false; */
				// Using indexOf is much better 
				return str.indexOf(input, 0) !== -1 ? true : false;
			};
			/* Using Ternary Operator to set new filtered array to filteredArray variable */
			filteredArray = !textInput
				? this.markersArray()
				: ko.utils.arrayFilter(this.markersArray(), function(item) {
						return checkString(item.name.toLowerCase(), textInput);
					});

			/* Hide all markers from the map */
			for (var i = 0, len = this.markersArray().length; i < len; i++) {
				this.markersArray()[i].marker.setMap(null);
			}

			/* Show only the filtered markers within the map */ 
			for (var i = 0, len = filteredArray.length; i < len; i++) {
				filteredArray[i].marker.setMap(map);
			}

			return this.currentMarkersArray(filteredArray);
		}, this);

		/* Initial 5 locations array */
		var initialLocations = [
			{
				name: "Madame Tussauds Hollywood",
				location: {
					lat: 34.10173964915283,
					lng: -118.34151327610016
				}
			},
			{
				name: "Dodger Stadium",
				location: {
					lat: 34.07292776671805,
					lng: -118.24086718929605

				}
			},
			{
				name: "Tsujita LA Artisan Noodle",
				location: {
					lat: 34.03964660254267,
					lng: -118.44261595222942
				}
			},
			{
				name: "The Wizarding World of Harry Potter",
				location: {
					lat: 34.138443,
					lng: -118.354056
				}
			},
			{
				name: "Natural History Museum of Los Angeles County",
				location: {
					lat: 34.016828819509556,
					lng: -118.28882932662964
				}
			},
			{
				name: "Laemmle's Royal Theater",
				location: {
					lat: 34.04561239986859,
					lng: -118.4529514332816
				}
			}
		];


		var locations = [];
		var markers = [];
		/* Make a marker */
		var makeMarker = function(location) {
			var marker = new google.maps.Marker({
				position: location.location,
				animation: google.maps.Animation.DROP,
				icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
				map: map
			});
			/* Add the name of location to the marker object just in case */
			marker.locationName = location.name;
			/* Call a fuction to add listeners for the marker */
			addListenersForMarker(location, marker);
			markers.push({
				location: location,
				marker: marker
			});
			map.panTo(location.location);
			map.setZoom(10);
		};

		var addListenersForMarker = function(location, marker) {
			marker.addListener("click", function() {
				getMoreDetails(location, marker);
			});
			marker.addListener("mouseover", function() {
				marker.setIcon("https://maps.google.com/mapfiles/ms/icons/green-dot.png");
				marker.addListener("mouseout", function() {
					marker.setIcon("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
				});
			});
		};

		/* Set new info to infoWindow instance if a marker instance has been clicked */
		var makeInfoWindow = function(finalizedData) {
			infoWindow.setContent(
				`<h4 style="color: black;">${finalizedData.location.name}</h4>` +
				`<hr>` +
				`<img src="${finalizedData.photoUrl || ''}" alt="Featured Photo">` +
				`<p style="color: black;">${finalizedData.venueFormattedAddress || finalizedData.errorMessage} </p>` +
				`<hr>` +
				`<p style="color: black;">${finalizedData.location.location.lat}, ${finalizedData.location.location.lng}</p>`
			);
			map.panTo(finalizedData.location.location);
			clearMarkersAnimation(finalizedData.marker);
			infoWindow.open(map, finalizedData.marker);
		};


		/* Make markers using the initial locations array */
		for (var i = 0, len = initialLocations.length; i < len; i++) {
			makeMarker(initialLocations[i]);
		}


		/* IIFE to create markers on side navigation  */
		var createMarkersList = function() {
			markers.forEach(function(marker) {
				self.markersArray.push(new Marker(marker));
			});
			for (var i = 0, markerObj, len = self.markersArray().length; i < len; i++) {
				markerObj = self.markersArray()[i];
				markerObj.marker.addListener("click", function() {
					self.currentTitle(this.locationName);
				});
			}
		}();

		/* Clear all markers animation and animate the clicked marker only */
		var clearMarkersAnimation = function(marker) {
			for (var i = 0, len = self.markersArray().length; i < len; i++) {
				self.markersArray()[i].marker.setAnimation(null);
			}
			marker.setAnimation(google.maps.Animation.BOUNCE);
		};

		/* Get more details about the clicked marker */
		var getMoreDetails = function(location, marker) {
			var finalizedData;
			$.ajax({
				url: 'https://api.foursquare.com/v2/venues/explore',
				data: {
					client_id: 'EQHSJRH1EAUERANR5BGSHXPDOFAXWCE0YDDVF0T2UOWR00Q3',
					client_secret: 'OSRMJEFTWUNJN4GPQYKZBWLIUKPIT4TEMI1ZPFO1LCJLHPLL',
					ll: `${location.location.lat},${location.location.lng}`,
					query: location.name,
					venuePhotos: 1,
					v: '20120609'
				},
				success: function(data) {
					var foursquareVenue = data.response.groups[0].items[0].venue;
					var venueFormattedAddress = foursquareVenue.location.formattedAddress;
					var venuePhoto = foursquareVenue.photos.groups[0].items[0];
					var photoUrl = `${venuePhoto.prefix}200x150${venuePhoto.suffix}`;
					finalizedData = {location: location, marker: marker, venueFormattedAddress: venueFormattedAddress, photoUrl: photoUrl};
					makeInfoWindow(finalizedData);
					// map.panTo(location.location);
					// clearMarkersAnimation(marker);
					// infoWindow.open(map, marker);
				},
				error: function(errResults) {
					finalizedData = {errorMessage: `Unable to get data from foursquare server error response`, location: location, marker: marker};
					makeInfoWindow(finalizedData);
				} 
			})

			// return finalizedData;
		};

		/* Do stuff if any of the markers list has been clicked */
		this.clickedMarker = function(clicked) {
			self.currentTitle(clicked.name);
			self.toggler();
			getMoreDetails(clicked.location, clicked.marker);
		};

		this.mouseOverMarker = function(obj) {
			obj.marker.setIcon(
				"https://maps.google.com/mapfiles/ms/icons/green-dot.png"
			);
			infoWindow.close();
			map.panTo(obj.location.location);
		};

		this.mouseOutMarker = function(obj) {
			obj.marker.setIcon("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
		};


		
		this.toggleStatus = ko.observable(0);

		this.sideNavContainer = ko.observable('');
		this.topNavContainer = ko.observable('');
		this.mapContainer = ko.observable('');

		this.toggler = function() {
			if (this.toggleStatus() === 0) {
				this.sideNavContainer('side-nav-container-toggle');
				this.topNavContainer('top-nav-container-toggle');
				this.mapContainer('map-container-toggle');
				this.toggleStatus(1)
			} else {
				this.sideNavContainer('');
				this.topNavContainer('');
				this.mapContainer('');
				this.toggleStatus(0)
			}
		}

	};

	ko.applyBindings(new AppViewModel());
};

function appError() {
	var errorMessage = 'Error loading the map, Please try again.';
	document.getElementById('map').appendChild(`<h3 id="error-message">${errorMessage}</h3>`);
	alert(errorMessage);
}
