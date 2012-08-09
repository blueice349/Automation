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
Ti.Geolocation.purpose = "Omadi tracking module";


// state vars used by resume/pause
var db_coord_name	=  Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS";
var headingAdded	= false;
var locationAdded 	= false;
var is_module_ready = false;
var location_obj 	= [];
var dist_filter		= 50;
var longitude = "";
var latitude = "";
var last_db_timestamp = 0;

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

	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
	Titanium.Geolocation.distanceFilter = dist_filter;

	//
	// EVENT LISTENER FOR GEO EVENTS - THIS WILL FIRE REPEATEDLY (BASED ON DISTANCE FILTER)
	//
	function locationCallback(e)
	{
		if (!e.success || e.error)
		{
			Ti.API.info("Code translation: "+translateErrorCode(e.code));
			Ti.API.info('Error was retrieved !');
			var str_err = "";
			for (var sim in e.error){
				str_err += sim+" = "+e.error[sim]+" \n ";
			}
			if (PLATFORM == 'android'){
				// Ti.UI.createNotification({
				//		message  : ' Omadi GPS Tracking for Android has found an error: '+str_err,
				//		duration : Ti.UI.NOTIFICATION_DURATION_LONG
				// }).show();
				Ti.API.info('Omadi GPS Tracking for Android has found an error: '+str_err);
			}
			else{
				notifyIOS('Omadi GPS Tracking for Android has found an error: '+str_err);				
			}
			return;
		}
		
		longitude = e.coords.longitude;
		latitude = e.coords.latitude;
		var altitude = e.coords.altitude;
		var heading = e.coords.heading;
		var accuracy = e.coords.accuracy;
		var timestamp = new Date().getTime();
		timestamp = Math.round(timestamp/1000);
		var altitudeAccuracy = e.coords.altitudeAccuracy;
		
		Titanium.Geolocation.distanceFilter = dist_filter; //changed after first location event

		if ( accuracy <= 200){
			if (last_db_timestamp == timestamp){
				Ti.API.info("Last DB timestamp is already the same, no adding a new one. Value = "+timestamp);
			}
			else if (location_obj.length > 0 && location_obj[location_obj.length-1].timestamp == timestamp){
				location_obj[location_obj.length-1].accurated_location = "INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('"+longitude+"','"+latitude+"',"+timestamp+", 'notUploaded') " ; 
			}
			else{
				location_obj.push ({
					no_accurated_location	: false,
					accurated_location		: "INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('"+longitude+"','"+latitude+"',"+timestamp+", 'notUploaded')",
					accuracy				: accuracy,
					longitude				: longitude,
					latitude				: latitude,
					timestamp				: timestamp
				});
			}
		}
		else{
			if (PLATFORM == 'android'){
				Ti.UI.createNotification({
						message  : 'Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is '+accuracy+' meters',
						duration : Ti.UI.NOTIFICATION_DURATION_LONG
				}).show();
			}
			else{
				notifyIOS('Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is '+accuracy+' meters');				
			}
		}
	};
	
	//
	// GET CURRENT POSITION - THIS FIRES ONCE
	//
	Titanium.Geolocation.getCurrentPosition(locationCallback);
	Titanium.Geolocation.addEventListener('location', locationCallback);
	locationAdded = true;
}

setInterval(function(){
	var _time = new Date().getTime();
	_time = Math.round(_time/1000);
	if (location_obj.length > 0 && (_time - location_obj[location_obj.length - 1].timestamp) >= 5){
		Ti.API.info('Repeated last postion because no fresh coordinates were found in the last 5 seconds');
		var aux_long = longitude;
		var aux_lat  = latitude;
		var aux_obj = {};
		aux_obj.timestamp = _time;
		aux_obj.accurated_location = "INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('"+aux_long+"','"+aux_lat+"',"+_time+", 'notUploaded')";
		//Ti.API.info("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('"+aux_long+"','"+aux_lat+"',"+_time+", 'notUploaded')");
		if (_time > location_obj[location_obj.length - 1].timestamp){
			location_obj.push(aux_obj);			
		}
	}
}, 5000);

if (Titanium.Platform.name == 'android')
{
	//  as the destroy handler will remove the listener, only set the pause handler to remove if you need battery savings
	
	Ti.Android.currentActivity.addEventListener('pause', function(e) {
		Ti.API.info("pause event received");
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
	});
	
	Ti.App.addEventListener('stop_gps', function(){
		if (locationAdded) {
			Ti.API.info("removing location callback on closing the app");
			Titanium.Geolocation.removeEventListener('location', locationCallback);
			locationAdded = false;
		}		
	});
	
}

Ti.App.addEventListener('upload_gps_locations', function(){
	Ti.API.info('GPS');
	var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name );
	Ti.API.info("Length before: "+location_obj.length);
	var aux_location = location_obj.slice(0);
	Ti.API.info(aux_location.length+" Length after: "+location_obj.length);
	location_obj = new Array();
	
	for (var ind_local in aux_location){
		Ti.API.info(aux_location[ind_local].accurated_location);
		db_coord.execute(aux_location[ind_local].accurated_location);	
	}
	if (aux_location.length > 0){
		last_db_timestamp = aux_location.pop().timestamp;
		
		Ti.API.info("Last timestamp = "+last_db_timestamp);
	}
	var result = db_coord.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ORDER BY timestamp ASC");

	if (result.rowCount > 0){
		Ti.API.info(result.rowCount+' gps locations were found ');
		if(Ti.Network.getOnline() === true){
			
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
			var objectsCheck = Ti.Network.createHTTPClient();
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
				
				if (isJsonString(this.responseText) === true){
					var resultReq = JSON.parse(this.responseText);
					if ( resultReq.inserted ){
						if (resultReq.success){
							Ti.API.info(resultReq.success+" GPS coordinates successfully inserted ");
						}
					}
					var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name );
					db_coord.execute('DELETE FROM user_location WHERE status="json"');
					var _arr_content = new Array ();
					var nids = new Array();
					if (resultReq.alert){
						for(var _i in resultReq.alert){
							var tmstp = new Date();
							Ti.API.info("====>>>>>>>>>>>> "+resultReq.alert[_i].location_nid);
							if (nids.indexOf(resultReq.alert[_i].location_nid) == -1){
								nids.push( resultReq.alert[_i].location_nid );
							}
							_arr_content.push('INSERT OR REPLACE INTO alert_names (location_nid, location_label) VALUES ( '+resultReq.alert[_i].location_nid+', "'+resultReq.alert[_i].location_label+'" )');
							
							for (var _y in resultReq.alert[_i].alerts){
								if (resultReq.alert[_i].alerts[_y]){
									Ti.API.info("Alert Message: "+resultReq.alert[_i].alerts[_y].message);
									_arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "'+resultReq.alert[_i].alerts[_y].subject+'", '+resultReq.alert[_i].alerts[_y].reference_id+', '+resultReq.alert[_i].alerts[_y].alert_id+', '+resultReq.alert[_i].alerts[_y].location_nid+', "'+resultReq.alert[_i].alerts[_y].location_label+'", "'+resultReq.alert[_i].alerts[_y].message+'" , '+tmstp.getTime()+' )');
								}
								else{
									Ti.API.info("Alert Message: "+resultReq.alert[_i].alerts.message);
									_arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "'+resultReq.alert[_i].alerts.subject+'", '+resultReq.alert[_i].alerts.reference_id+', '+resultReq.alert[_i].alerts.alert_id+', '+resultReq.alert[_i].alerts.location_nid+', "'+resultReq.alert[_i].alerts.location_label+'", "'+resultReq.alert[_i].alerts.message+'" , '+tmstp.getTime()+' )');
								}
							}
						}
					}
					db_coord.execute("BEGIN IMMEDIATE TRANSACTION");
					for(var _e in nids){
						db_coord.execute('DELETE FROM alerts WHERE location_nid='+nids[_e]);
						db_coord.execute('DELETE FROM alert_names WHERE location_nid='+nids[_e]);
						Ti.API.info('Deleted location nids: '+nids[_e]);
					}
					
					for (var _k in _arr_content){
						Ti.API.info(_arr_content[_k]);
						db_coord.execute(_arr_content[_k]);
					}
					db_coord.execute("COMMIT TRANSACTION");
					Ti.API.info('Finished inserting');
					db_coord.close();
					Ti.App.fireEvent('refresh_UI_Alerts');
				}
			}
			//Connection error:
			objectsCheck.onerror = function(e) {
				Ti.API.info("Error found for GPS uploading ");
				db_coord.close();
			}
			
			//Sending information and try to connect
			objectsCheck.send(json_coord);
		}
		else{
			Ti.API.info('We are offline');
		}
	}
	else{
		Ti.API.info('No GPS coordinates found');
		result.close();
		db_coord.close();
	}
});

setInterval(function (){
	Ti.App.fireEvent('upload_gps_locations');
}, 120000);
