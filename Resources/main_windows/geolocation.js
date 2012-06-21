
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
var db_coord_name	= "5";
var headingAdded	= false;
var locationAdded 	= false;
var is_module_ready = false;
var location_obj 	= [];
var dist_filter		= 5;
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
	Titanium.Geolocation.distanceFilter = dist_filter;

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
		
		Ti.API.info( 'INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('+longitude+','+latitude+','+Math.round(timestamp/1000)+', "notUploaded")');
		if ( accuracy <= 200){
			location_obj.push({
				no_accurated_location	: false,
				accurated_location		: 'INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('+longitude+','+latitude+','+Math.round(timestamp/1000)+', "notUploaded")',
				accuracy				: accuracy,
				longitude				: longitude,
				latitude				: latitude,
				timestamp				: timestamp
				
			});
		}
		else{
			Ti.UI.createNotification({
					message  : 'Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is '+accuracy+' meters',
					duration : Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		}
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

		Titanium.Geolocation.distanceFilter = dist_filter; //changed after first location event

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
		
		Ti.API.info( 'INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('+longitude+','+latitude+','+Math.round(timestamp/1000)+', "notUploaded")');
		
		if ( accuracy <= 200){
			location_obj.push ({
				no_accurated_location	: false,
				accurated_location		: 'INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('+longitude+','+latitude+','+Math.round(timestamp/1000)+', "notUploaded")',
				accuracy				: accuracy,
				longitude				: longitude,
				latitude				: latitude,
				timestamp				: timestamp
				
			});
		}
		else{
			Ti.UI.createNotification({
					message  : 'Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is '+accuracy+' meters',
					duration : Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		}
	};
	
	Titanium.Geolocation.addEventListener('location', locationCallback);
	locationAdded = true;
}

if (Titanium.Platform.name == 'android')
{
	//  as the destroy handler will remove the listener, only set the pause handler to remove if you need battery savings
	
	Ti.Android.currentActivity.addEventListener('pause', function(e) {
		Ti.API.info("pause event received");
		/*
		if (locationAdded) {
			Ti.API.info("removing location callback on pause");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}
		*/
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
		/*
		if (!locationAdded) {
			Ti.API.info("adding location callback on resume");
			Titanium.Geolocation.addEventListener('location', locationCallback);
			locationAdded = true;
		}
		*/
	});
	
}

//Sets flag_accept to true each 5 seconds in order to get a new location every 5 seconds
setInterval(function (){
		if (!isUpdating() ){
			var aux_location = location_obj;
			location_obj = [];
			
			var db_coord_pp = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name );
			for (var ind_local in aux_location){
				db_coord_pp.execute(aux_location[ind_local].accurated_location);	
			}
			db_coord_pp.close();
		}
}, 5000);

setInterval(function (){
	if ( !isUpdating() ){
		setUse();
		Ti.API.info('GPS');
		var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name );
		var result = db_coord.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ORDER BY timestamp DESC");

		if (result.rowCount > 0){
			Ti.API.info(result.rowCount+' gps locations were found ');
			//Build JSON structure
			var json_coord = "{ \"data\": [";
			for(var i = 0; i < result.rowCount ; i++) {
				db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid="+result.fieldByName('ulid'));
			    (i == result.rowCount-1) ?  
			    					json_coord += " {\"lat\" : \""+ result.fieldByName('latitude') +"\", \"lng\" : \"" + result.fieldByName('longitude')  + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" :
			    					json_coord += " {\"lat\" : \""+ result.fieldByName('latitude') +"\", \"lng\" : \"" + result.fieldByName('longitude')  + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";	 
				result.next();		
			}
			json_coord += "], \"current_time\": \" "+ Math.round(new Date().getTime() / 1000)+"\" }";
	
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
				//Parses response into strings
				Ti.API.info('onLoad for GPS coordiates reached! Here is the reply: ');
				Ti.API.info(this.responseText);
				Ti.API.info('Requested: ');
				Ti.API.info(json_coord);
				
				var resultReq = JSON.parse(this.responseText);
				
				if (isJsonString(resultReq) === true){
					if ( resultReq.inserted ){
						if (resultReq.success){
							Ti.API.info(resultReq.success+" GPS coordinates successfully inserted ");
						}
					}
					var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name );
					db_coord.execute('DELETE FROM user_location WHERE status="json"');
					var _arr_content = new Array ();
					if (resultReq.alert){
						for(var _i in resultReq.alert){
							for (var _j in resultReq.alert[_i]){
								var tmstp = new Date();
								_arr_content.push('INSERT OR REPLACE INTO alerts (ref_nid, alert_id, subject, message, timestamp) VALUES ( '+resultReq.alert[_i][_j].reference_nid+', '+resultReq.alert[_i][_j].alert_id+', "'+resultReq.alert[_i][_j].subject+'", "'+resultReq.alert[_i][_j].message+'" , "'+tmstp.getTime()+'" )');
							}
						}
					}
					db_coord.execute("BEGIN IMMEDIATE TRANSACTION");
					for (var _k in _arr_content){
						db_coord.execute(_arr_content[_k]);
					}
					db_coord.execute("COMMIT TRANSACTION");
					db_coord.close();
				}
				unsetUse();	
			}
			//Connection error:
			objectsCheck.onerror = function(e) {
				Ti.API.info("Error found for GPS uploading ");
				db_coord.close();
				unsetUse();
			}
			
			//Sending information and try to connect
			objectsCheck.send(json_coord);
		}
		else{
			Ti.API.info('No GPS coordinates found');
			result.close();
			db_coord.close();
			unsetUse();
		}
	} 
}, 120000);
