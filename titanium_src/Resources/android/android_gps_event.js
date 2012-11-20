Ti.include("/lib/functions.js");

var time_interval_for_alerts = 120;

// state vars used by resume/pause
var db_coord_name = Titanium.App.Properties.getString("databaseVersion") + "_" + Omadi.utils.getMainDBName() + "_GPS";
var location_obj = [];
var dist_filter = 50;
var last_db_timestamp = 0;
var curr;
//var stop = false;
//var uploading = false;
var latitude;
var longitude;
var accuracy;

 // Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
 // Ti.Geolocation.purpose = "Omadi GPS Tracking";
 // Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
// var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
    // name: Ti.Geolocation.PROVIDER_GPS,
    // minUpdateTime: 5, 
    // minUpdateDistance: 1
// });
// Ti.Geolocation.Android.addLocationProvider(gpsProvider);
// 
// Ti.Geolocation.getCurrentPosition( function(e) {
   // if (!e.success || e.error) {
    // //setTimeout(s, 5000);
     // return;
   // }
//   
   // updateCurrentLocation(e.coords);
//  
 // });

movement = require('com.omadi.gps');
// function updatePosition(e) {
    // if( ! e.success || e.error ) {
        // alert("Unable to get your location.");
        // Ti.API.debug(JSON.stringify(e));
        // Ti.API.debug(e);
        // return;
    // }
//  
    // Ti.App.fireEvent("app:got.location", {
        // "coords" : e.coords
    // });
// };


var interval;


function saveGPS(){
	
	var stopGPS = Ti.App.Properties.getBool('stopGPS', false);
	Ti.API.info("stopGPS: " + stopGPS);
	
	if(stopGPS){
		Ti.API.info("TRYING TO STOP GPS NOW!!!");
		try{
			if(movement){
				movement.stopGPSTracking();
			}
			//clearInterval(interval);
			Titanium.Android.currentService.stop();
		}
		catch(ex){
			Ti.API.error("Stopping gps service: " + ex);
		}
	}
	else{
		
		movement.startGPSTracking();
		
		movement.currentMovement({
			"updateLatLng" : function(e) {
				updateCurrentLocation(e);
			}
		});
		
		//Ti.App.movement = movement;
		
			// Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
		// Ti.Geolocation.purpose = "testing";
		// Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
		// Titanium.Geolocation.distanceFilter = 10;
		// if( Titanium.Geolocation.locationServicesEnabled === false ) {
		    // Ti.API.debug('Your device has GPS turned off. Please turn it on.');
		// }
		 
		
		 
		// Ti.App.addEventListener("app:got.location", function(d) {
		    // Ti.App.GeoApp.f_lng = d.longitude;
		    // Ti.App.GeoApp.f_lat = d.latitude;
		    // Ti.API.debug(JSON.stringify(d));
		    // // you need to remove this listener, see the blog post mentioned above
		    // Ti.Geolocation.removeEventListener('location', updatePosition);
		    // alert(JSON.stringify(d));
		// });
	
		//Titanium.Geolocation.getCurrentPosition( updateCurrentLocation );   
		//Titanium.Geolocation.addEventListener( 'location', updatePosition ); 
	
	}
}

function updateCurrentLocation(e) {
	curr = e;
	//if(PLATFORM == 'android'){
		longitude = curr.longitude;
		latitude = curr.latitude;
		accuracy = curr.accuracy;
	// }else{
		// longitude = curr.location.longitude;
		// latitude = curr.location.latitude;
		// accuracy = curr.location.longitude;
	// }
// 	
	var timestamp = new Date().getTime();
	timestamp = Math.round(timestamp / 1000);
	
	Ti.API.debug('LOCATION: ' + longitude + ', ' + latitude + ': ' + accuracy);
	//Ti.API.debug('LOCATION: Latitude ' + latitude);
	//Ti.API.debug('LOCATION: Accuracy ' + accuracy);
	//Ti.API.debug('LOCATION: Timestamp ' + timestamp);

	if(latitude != 0 && longitude != 0) {
		if(accuracy > 200) {
			var time_now = Math.round(new Date().getTime() / 1000);
			var time_past = time_now - Ti.App.Properties.getString("last_alert_popup");
			if(time_past > time_interval_for_alerts) {
				notifyIOS('Your GPS is getting inaccurate data. Please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters.', true);
			} else {
				Ti.API.info('NOT SHOWN - Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters');
			}
		}
		
		var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
		
		db_coord.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')");
		db_coord.close();
		
	}
	//setTimeout(s, 5000);
}

//interval = setInterval(saveGPS, 5000);
saveGPS();
