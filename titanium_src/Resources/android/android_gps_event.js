/*jslint eqeq: true*/

Ti.include("/lib/functions.js");



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



function saveGPS(){"use strict";
	
	var stopGPS = Ti.App.Properties.getBool('stopGPS', false);
	
	/*global updateCurrentLocation, Omadi*/
	
	//Ti.API.info("stopGPS: " + stopGPS);
	
	if(stopGPS && false){
		Ti.API.info("TRYING TO STOP GPS NOW!!!");
		try{
			if(movement){
				movement.stopGPSTracking();
			}
			//clearInterval(interval);
			Titanium.Android.currentService.stop();
			
			//Omadi.display.removeNotifications();
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

function updateCurrentLocation(e) {"use strict";
	
	var timestamp, time_passed, db;
	
	/*global notifyIOS*/

	timestamp = Omadi.utils.getUTCTimestamp();

	if(e.latitude != 0 && e.longitude != 0) {
		if(e.accuracy > 200) {
			time_passed = timestamp - Ti.App.Properties.getString("last_alert_popup");
			if(time_passed > 300) {
				notifyIOS('Your GPS is getting inaccurate data. Please make sure the sky is visible. Current GPS accuracy is ' + Math.round(e.accuracy) + ' meters.', true);
			}
		}
		
		db = Omadi.utils.openGPSDatabase();
		db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + e.longitude + "','" + e.latitude + "'," + timestamp + ", 'notUploaded')");
		db.close();
		
	}
	//setTimeout(s, 5000);
}

//interval = setInterval(saveGPS, 5000);
saveGPS();
