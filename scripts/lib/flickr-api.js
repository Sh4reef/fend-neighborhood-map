var flickr = function(key) {
	var self = this;
	var apiKey = key;
	var restApiUrl = 'https://api.flickr.com/services/rest/';
	var flickrMethods = {
		photosSearch: 'flickr.photos.search'
	}
	this.photosSearch = function(location) {
		// console.log(location);
		$.ajax({
			url: restApiUrl,
			data: {		
				method: flickrMethods.photosSearch,
				api_key: apiKey,
				format: 'json',
				nojsoncallback: 1,
				// accuracy: 16,
				text: location.name,
				lat: location.lat,
				lon: location.lng,
			},
			success: function(data) {
				location.photos = data.photos.photo;
				// console.log(location);
			},
			error: function(textStatus) {
				console.log('err');
			}
		})
		return location;
	}
};