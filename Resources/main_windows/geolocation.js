
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

// state vars used by resume/pause
var headingAdded = false;
var locationAdded = false;
var howManyInputs = 10;
var currentInputs = 0;
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
				message:'You have disallowed Omadi from running geolocation services.'
			}).show();
		}
		else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
			Ti.UI.createAlertDialog({
				title:'Omadi',
				message:'Your system has disallowed Omadi from running geolocation services.'
			}).show();
		}
	}

	//
	//  SET ACCURACY - THE FOLLOwin2G VALUES ARE SUPPORTED
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
		//var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		//Ti.API.info('speed ' + speed);
		
		var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

		if ( (accuracy <= 50) && (currentInputs <= 5)){
			currentInputs++;
			db.execute('INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES (?,?,?,?)', longitude, latitude, Math.round(timestamp/1000), "notUploaded");
		}
		
		db.close();
	});

	//
	// EVENT LISTENER FOR GEO EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON DISTANCE FILTER)
	//
	var locationCallback = function(e)
	{
		if (!e.success || e.error)
		{
			Ti.API.info("Code translation: "+translateErrorCode(e.code));
			Ti.API.info('Error was retrieved !');
			return;
		}

		var longitude = e.coords.longitude;
		var latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		//var speed = e.coords.speed;
		var timestamp = e.coords.timestamp;
		var altitudeAccuracy = e.coords.altitudeAccuracy;

		//Titanium.Geolocation.distanceFilter = 100; //changed after first location event

		/*
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
				Ti.API.info("Code translation: "+translateErrorCode(e.code));
			}
		});
		*/
		var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

		if ( (accuracy <= 50) && (currentInputs <= 5)){
			currentInputs++;
			db.execute('INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES (?,?,?,?)', longitude, latitude, Math.round(timestamp/1000), "notUploaded");
		}
		
		db.close();		
	};
	
	Titanium.Geolocation.addEventListener('location', locationCallback);
	locationAdded = true;
}

if (Titanium.Platform.name == 'android')
{
	//  as the destroy handler will remove the listener, only set the pause handler to remove if you need battery savings
	/*
	Ti.Android.currentActivity.addEventListener('pause', function(e) {
		Ti.API.info("pause event received");
		if (locationAdded) {
			Ti.API.info("removing location callback on pause");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}
	});
	*/
	
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
<<<<<<< HEAD
	if ( !isUpdating() ){
	
		setUse();
		var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

=======
	if ( !Titanium.App.Properties.getBool("UpRunning") ){
	
		var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

		Titanium.App.Properties.setBool("UpRunning", true);
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
		var result = db.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ");
		if (result.rowCount > 0){
			//Build JSON structure
			var json = "{ \"data\": [";
			for(var i = 0; i < result.rowCount ; i++) {
			    (i == result.rowCount-1) ?  
			    					json += " {\"lat\" : \""+ result.fieldByName('latitude') +"\", \"lng\" : \"" + result.fieldByName('longitude')  + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" :
			    					json += " {\"lat\" : \""+ result.fieldByName('latitude') +"\", \"lng\" : \"" + result.fieldByName('longitude')  + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";	 
				result.next();		
			}
			json += "], \"current_time\": \" "+ Math.round(new Date().getTime() / 1000)+"\" }";
	
			result.close();
			
			//alert ("Before open connection");
			var objectsCheck = win2.log;
			//Timeout until error:
			objectsCheck.setTimeout(10000);
			
			//Opens address to retrieve contact list
			objectsCheck.open('POST', win2.picked + '/js-location/mobile_location.json');
			
			//Header parameters
			objectsCheck.setRequestHeader("Content-Type", "application/json");
			
			//When connected
			objectsCheck.onload = function(e) {
				unsetUse();
				//Parses response into strings

				var resultReq = JSON.parse(this.responseText);
				
				if ( resultReq.inserted ){
					if (resultReq.success)
						Ti.API.info(resultReq.success+"GPS coordinates sucefully inserted: ");
					else
		 				Ti.API.info("GPS coordinates not inserted, we had "+ resultReq.errors+" errors");
				}
				db.execute('DELETE FROM user_location WHERE status="notUploaded"');
				db.close();
		
			}
			//Connection error:
			objectsCheck.onerror = function(e) {
<<<<<<< HEAD
				unsetUse();
=======
				Titanium.App.Properties.setBool("UpRunning", false);
>>>>>>> 2696447049ef095bd171249c415a58c543975f20
				db.close();
			}
			
			//Sending information and try to connect
			objectsCheck.send(json);
		}
		else{
			unsetUse();
		}
	} 
}, 120000);


//Sets back to 0 the current number of gathered GPS coordinates
//Time interval is one minute
setInterval(function (){
	currentInputs = 0;
}, 60000);