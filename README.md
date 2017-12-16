FEND - Neighborhood Map
===============================
![Neighborhood Map](https://github.com/Sh4reef/fend-neighborhood-map/blob/master/screenshot/Neighborhood%20Map%20-%20Sh4reef.png)
### Description
Neighborhood Map which includes 5 markers of locations at least, And these markers and locations could be filtered easily.
### How to view
* If you familiar with python
```
git clone https://github.com/Sh4reef/fend-neighborhood-map.git
cd fend-neighborhood-map
sudo python -m SimpleHTTPServer 80 

```
* Or open the **index.html** file directly

### modifications #1
* Refactored the infoWindow
* Moved maps API to be the last script 
* Added third party API to retreive more data about the clicked marker
* Display retreived data into the infoWindow
* Removed formatted address and retreive it from third party API instead
* Retreive photo URL from third party API
* Added error handler for google map api
* Avoid cluttering the html

### New modifications #2
* Markers list filtering improved
* Error handler for google map api displays error message on the page