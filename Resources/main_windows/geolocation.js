var win = Titanium.UI.currentWindow;

function translateErrorCode(code) {
	if (code == null) {
		return null;
	}
	switch (code) {
		case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
			return "Location unknown";
		case Ti.Geolocation.ERROR_DENIED:
			return "Access denied";
		case Ti.Geolocation.ERROR_NETWORK:
			return "Network error";
		case Ti.Geolocation.ERROR_HEADING_FAILURE:
			return "Failure to detect heading";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
			return "Region monitoring access denied";
		case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
			return "Region monitoring access failure";
		case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
			return "Region monitoring setup delayed";
	}
}



Ti.Geolocation.preferredProvider = Titanium.Geolocation.PROVIDER_GPS;
Ti.Geolocation.purpose = "User tracking";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;

// state vars used by resume/pause
var headingAdded = false;
var locationAdded = false;

//
//  SHOW CUSTOM ALERT IF DEVICE HAS GEO TURNED OFF
//
if (Titanium.Geolocation.locationServicesEnabled === false)
{
	Titanium.UI.createAlertDialog({title:'Omadi', message:'Your device has geo turned off - turn it on.'}).show();
}
else
{
	if (Titanium.Platform.name != 'android') {
		var authorization = Titanium.Geolocation.locationServicesAuthorization;
		Ti.API.info('Authorization: '+authorization);
		if (authorization == Titanium.Geolocation.AUTHORIZATION_DENIED) {
			Ti.UI.createAlertDialog({
				title:'Omadi',
				message:'You have disallowed Titanium from running geolocation services.'
			}).show();
		}
		else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
			Ti.UI.createAlertDialog({
				title:'Omadi',
				message:'Your system has disallowed Titanium from running geolocation services.'
			}).show();
		}
	}

	//
	//  SET ACCURACY - THE FOLLOWING VALUES ARE SUPPORTED
	//
	// Titanium.Geolocation.ACCURACY_BEST
	// Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS
	// Titanium.Geolocation.ACCURACY_HUNDRED_METERS
	// Titanium.Geolocation.ACCURACY_KILOMETER
	// Titanium.Geolocation.ACCURACY_THREE_KILOMETERS
	//
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;

	//
	//  SET DISTANCE FILTER.  THIS DICTATES HOW OFTEN AN EVENT FIRES BASED ON THE DISTANCE THE DEVICE MOVES
	//  THIS VALUE IS IN METERS
	//
	Titanium.Geolocation.distanceFilter = 10;

	//
	// GET CURRENT POSITION - THIS FIRES ONCE
	//
	Titanium.Geolocation.getCurrentPosition(function(e)
	{
		if (!e.success || e.error)
		{
			//currentLocation.text = 'error: ' + JSON.stringify(e.error);
			Ti.API.info("Code translation: "+translateErrorCode(e.code));
			//alert('error ' + JSON.stringify(e.error));
			return;
		}

		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		Ti.API.info('speed ' + speed);
		
		db.execute('INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES (?,?,?,?)', longitude, latitude, Math.round(timestamp/1000), "notUploaded");
		//alert("Geo inserted into database");

		Titanium.API.info('geo - current location: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
	});

	//
	// EVENT LISTENER FOR GEO EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON DISTANCE FILTER)
	//
	var locationCallback = function(e)
	{
		if (!e.success || e.error)
		{
			Ti.API.info("Code translation: "+translateErrorCode(e.code));
			return;
		}

		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;

		//Titanium.Geolocation.distanceFilter = 100; //changed after first location event


		// reverse geo
		Titanium.Geolocation.reverseGeocoder(latitude,longitude,function(evt)
		{
			if (evt.success) {
				var places = evt.places;
				if (places && places.length) {
					//reverseGeo.text = places[0].address;
				} else {
					//reverseGeo.text = "No address found";
				}
				Ti.API.debug("reverse geolocation result = "+JSON.stringify(evt));
			}
			else {
				//Ti.UI.createAlertDialog({
				//	title:'Reverse geo error',
				//	message:evt.error
				// }).show();
				Ti.API.info("Code translation: "+translateErrorCode(e.code));
			}
		});
		db.execute('INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES (?,?,?,?)', longitude, latitude, Math.round(timestamp/1000), "notUploaded");
		//alert("Geo inserted into database");
		
		Titanium.API.info('geo - location updated: ' + new Date(timestamp) + ' long ' + longitude + ' lat ' + latitude + ' accuracy ' + accuracy);
	};
	Titanium.Geolocation.addEventListener('location', locationCallback);
	locationAdded = true;
}

if (Titanium.Platform.name == 'android')
{
	//  as the destroy handler will remove the listener, only set the pause handler to remove if you need battery savings
	Ti.Android.currentActivity.addEventListener('pause', function(e) {
		Ti.API.info("pause event received");
		if (locationAdded) {
			Ti.API.info("removing location callback on pause");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}
	});
	Ti.Android.currentActivity.addEventListener('destroy', function(e) {
		Ti.API.info("destroy event received");
		if (locationAdded) {
			Ti.API.info("removing location callback on destroy");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}
	});
	Ti.Android.currentActivity.addEventListener('resume', function(e) {
		Ti.API.info("resume event received");
		if (!locationAdded) {
			Ti.API.info("adding location callback on resume");
			Titanium.Geolocation.addEventListener('location', locationCallback);
			locationAdded = true;
		}
	});
}

setInterval(function (){
	if ( !Titanium.App.Properties.getBool("UpRunning") ){	
		Ti.API.info("Geo in");
		Titanium.App.Properties.setBool("UpRunning", true);
		var result = db.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ");
		
		var json = "{ \"data\": [";
		for(var i = 0; i < result.rowCount ; i++) {
		    (i == result.rowCount-1) ?  
		    					json += " {\"lat\" : \""+ result.fieldByName('latitude') +"\", \"lng\" : \"" + result.fieldByName('longitude')  + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" :
		    					json += " {\"lat\" : \""+ result.fieldByName('latitude') +"\", \"lng\" : \"" + result.fieldByName('longitude')  + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";	 
			result.next();		
		}
		json += "], \"current_time\": \" "+ Math.round(new Date().getTime() / 1000)+"\" }";
		Ti.API.info(json);
		result.close();
		
		//alert ("Before open connection");
		var objectsCheck = win.log;
		//Timeout until error:
		objectsCheck.setTimeout(10000);
		
		//Opens address to retrieve contact list
		objectsCheck.open('POST', win.picked + '/js-location/mobile_location.json');
		
		
		//Header parameters
		objectsCheck.setRequestHeader("Content-Type", "application/json");
		
		//When connected
		objectsCheck.onload = function(e) {
			Titanium.App.Properties.setBool("UpRunning", false);
			//Parses response into strings
			var resultReq = JSON.parse(this.responseText);
			
			Ti.API.info("Inserted! ");
			
			//If Database is already last version 
			if ( resultReq.inserted ){
				//alert("Inserted: "+ resultReq.inserted);
				if (resultReq.success)
					Ti.API.info("Success: "+ resultReq.success);
				else
					Ti.API.info("Errors: "+ resultReq.errors);
			}
			db.execute('DELETE FROM user_location WHERE status="notUploaded"');
	
		}
		//Connection error:
		objectsCheck.onerror = function(e) {
			Titanium.App.Properties.setBool("UpRunning", false);
			//alert("Error checking if update is needed, not running");
		}
		
		//Sending information and try to connect
		objectsCheck.send(json);
	} 
}, 120000);
