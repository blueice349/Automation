Ti.include("/lib/functions.js");

Ti.App.Properties.setString("last_alert_popup", 0);
var time_interval_for_alerts = 120;

// state vars used by resume/pause
var db_coord_name = Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName() + "_GPS";
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

movement =  require('com.omadi.gps');

movement.startGPSTracking();

movement.currentMovement({
	"updateLatLng" : function(e) {
		updateCurrentLocation(e);
	}
});

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
	
	Ti.API.debug('LOCATION: ' + longitude + ', ' + latitude);
	//Ti.API.debug('LOCATION: Latitude ' + latitude);
	//Ti.API.debug('LOCATION: Accuracy ' + accuracy);
	Ti.API.debug('LOCATION: Timestamp ' + timestamp);

	if(latitude != 0 && longitude != 0) {
		if(accuracy > 200) {
			var time_now = Math.round(new Date().getTime() / 1000);
			var time_past = time_now - Ti.App.Properties.getString("last_alert_popup");
			if(time_past > time_interval_for_alerts) {
				notifyIOS('Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters', true);
			} else {
				Ti.API.info('NOT SHOWN - Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters');
			}
		}
		
		var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
		if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
		
		db_coord.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')");
		db_coord.close();
		
		//Ti.API.info("LOCATION SERVICE SAVE: location_obj.length before: " + location_obj.length);
		//var leng_before = location_obj.length;
		//var aux_location = location_obj.slice(0);
		//Ti.API.info("LOCATION SERVICE SAVE: aux_location.length = " + aux_location.length + " location_obj.length after = " + location_obj.length);
		
		
		// location_obj.push({
			// no_accurated_location : false,
			// accurated_location : "INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')",
			// accuracy : accuracy,
			// longitude : longitude,
			// latitude : latitude,
			// timestamp : timestamp
		// });
	}
	//setTimeout(s, 5000);
}


//  as the destroy handler will remove the listener, only set the pause handler to remove if you need battery savings
// Ti.Android.currentActivity.addEventListener('pause', function(e) {
	// Ti.API.info("pause event received");
// });
// 
// Ti.Android.currentActivity.addEventListener('destroy', function(e) {
	// Ti.API.info("destroy event received");
// });
// 
// Ti.Android.currentActivity.addEventListener('resume', function(e) {
	// Ti.API.info("resume event received");
// });


// var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
    // name: Ti.Geolocation.PROVIDER_GPS,
    // minUpdateTime: 5, 
    // minUpdateDistance: 10
// });
// //Ti.Geolocation.Android.setManualMode(true);
// Ti.Geolocation.Android.addLocationProvider(gpsProvider);
// 
// var gpsRule = Ti.Geolocation.Android.createLocationRule({
    // provider: Ti.Geolocation.PROVIDER_GPS,
    // // Updates should be no older than 30 seconds
    // maxAge: 30000,
    // // But  no more frequent than once per 4 seconds
    // minAge: 2000
// });
// Ti.Geolocation.Android.addLocationRule(gpsRule);

function s() {
	
	
	if (stop === false){
		
			//movement.currentMovement({
			//	"updateLatLng" : function(e) {
			//		updateCurrentLocation(e);
			//	}
			//});
			
			// Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
			// Ti.Geolocation.purpose = "Unit Finder";
			// Ti.Geolocation.distanceFilter = 10;
			// Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
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
			
		
	}else{
		//movement.stopGPSTracking();
	}
}

 //setInterval(s, 5000);
//var gpsInterval = setInterval(s, 5000);
//s();

//Ti.App.addEventListener('stop_gps', function(e){
//	stop = true;
	//clearInterval(gpsInterval);
///});

// var domainName =  Titanium.App.Properties.getString("domainName");
// //var domainName =  "https://test1.omadi.com";
// 
// var upload_gps_locations = function() {
// 	
	// Ti.API.info('################################## CALLED ANDROID UPDATE FUNCTION ################################## '+is_GPS_uploading());
	// if (is_GPS_uploading() == false){
		// set_GPS_uploading();
		// Ti.API.info('LOCATION SERVICE: UPLOAD GPS');
		// var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
		// if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
// 		
		// //Ti.API.info("LOCATION SERVICE SAVE: location_obj.length before: " + location_obj.length);
		// //var leng_before = location_obj.length;
		// //var aux_location = location_obj.slice(0);
		// //Ti.API.info("LOCATION SERVICE SAVE: aux_location.length = " + aux_location.length + " location_obj.length after = " + location_obj.length);
		// //location_obj = new Array();
// 	
		// //for (var ind_local in aux_location) {
			// //Ti.API.info("LOCATION SAVE: " + aux_location[ind_local].accurated_location);
		// //	db_coord.execute(aux_location[ind_local].accurated_location);
		// //}
		// //if (aux_location.length > 0) {
		// //	last_db_timestamp = aux_location.pop().timestamp;
		// //	Ti.API.info("Last timestamp = " + last_db_timestamp);
		// //}
		// var result = db_coord.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ORDER BY timestamp ASC");
// 	
		// if (result.rowCount > 0) {
			// Ti.API.info(result.rowCount + ' gps locations were found ');
			// if (Ti.Network.getOnline() === true) {
// 	
				// //Build JSON structure
				// var json_coord = "{ \"data\": [";
				// if (result.rowCount >= 50){
					// for (var i = 0; i < 50; i++) {
						// db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
						// (i == 49) ? json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
						// result.next();
					// }
				// }
				// else{
					// for (var i = 0; i < result.rowCount; i++) {
						// db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
// 		
						// (i == result.rowCount - 1) ? json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
						// result.next();
					// }
				// }
				// json_coord += "], \"current_time\": \" " + Math.round(new Date().getTime() / 1000) + "\" }";
// 	
				// result.close();
// 	
				// //alert ("Before open connection");
				// var objectsCheck = Ti.Network.createHTTPClient();
				// //Timeout until error:
				// objectsCheck.setTimeout(30000);
// 	
				// //Opens address to retrieve contact list
				// objectsCheck.open('POST', domainName + '/js-location/mobile_location.json');
// 	
				// //Header parameters
				// objectsCheck.setRequestHeader("Content-Type", "application/json");
				// objectsCheck.setRequestHeader("Cookie", getCookie());
// 	
				// //When connected
				// objectsCheck.onload = function(e) {
					// //Parses response into strings
					// Ti.API.info('onLoad for GPS coordiates reached! Here is the reply: ');
					// Ti.API.info(this.responseText);
					// Ti.API.info('Requested: ');
					// Ti.API.info(json_coord);
// 	
					// if (isJsonString(this.responseText) === true) {
						// var resultReq = JSON.parse(this.responseText);
						// if (resultReq.inserted) {
							// if (resultReq.success) {
								// Ti.API.info(resultReq.success + " GPS coordinates successfully inserted ");
							// }
						// }
						// var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
						// if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
						// db_coord.execute('DELETE FROM user_location WHERE status="json"');
						// var _arr_content = new Array();
						// var nids = new Array();
						// if (resultReq.alert) {
							// for (var _i in resultReq.alert) {
								// var tmstp = new Date();
								// Ti.API.info("====>>>>>>>>>>>> " + resultReq.alert[_i].location_nid);
								// if (nids.indexOf(resultReq.alert[_i].location_nid) == -1) {
									// nids.push(resultReq.alert[_i].location_nid);
								// }
								// _arr_content.push('INSERT OR REPLACE INTO alert_names (location_nid, location_label) VALUES ( ' + resultReq.alert[_i].location_nid + ', "' + resultReq.alert[_i].location_label + '" )');
// 	
								// for (var _y in resultReq.alert[_i].alerts) {
									// if (resultReq.alert[_i].alerts[_y]) {
										// Ti.API.info("Alert Message: " + resultReq.alert[_i].alerts[_y].message);
										// _arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "' + resultReq.alert[_i].alerts[_y].subject + '", ' + resultReq.alert[_i].alerts[_y].reference_id + ', ' + resultReq.alert[_i].alerts[_y].alert_id + ', ' + resultReq.alert[_i].alerts[_y].location_nid + ', "' + resultReq.alert[_i].alerts[_y].location_label + '", "' + resultReq.alert[_i].alerts[_y].message + '" , ' + tmstp.getTime() + ' )');
									// } else {
										// Ti.API.info("Alert Message: " + resultReq.alert[_i].alerts.message);
										// _arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "' + resultReq.alert[_i].alerts.subject + '", ' + resultReq.alert[_i].alerts.reference_id + ', ' + resultReq.alert[_i].alerts.alert_id + ', ' + resultReq.alert[_i].alerts.location_nid + ', "' + resultReq.alert[_i].alerts.location_label + '", "' + resultReq.alert[_i].alerts.message + '" , ' + tmstp.getTime() + ' )');
									// }
								// }
							// }
						// }
						// db_coord.execute("BEGIN IMMEDIATE TRANSACTION");
						// for (var _e in nids) {
							// db_coord.execute('DELETE FROM alerts WHERE location_nid=' + nids[_e]);
							// db_coord.execute('DELETE FROM alert_names WHERE location_nid=' + nids[_e]);
							// Ti.API.info('Deleted location nids: ' + nids[_e]);
						// }
// 	
						// for (var _k in _arr_content) {
							// Ti.API.info(_arr_content[_k]);
							// db_coord.execute(_arr_content[_k]);
						// }
						// db_coord.execute("COMMIT TRANSACTION");
						// Ti.API.info('Finished inserting');
						// db_coord.close();
						// Ti.App.fireEvent('refresh_UI_Alerts', {status: 'success'});
						// unset_GPS_uploading();
						// var __timestamp  = Math.round(new Date().getTime() / 1000);
// 						
						// createNotification("Uploaded GPS at "+date('g:i a', Number(__timestamp)));
// 						
					// }
				// }
				// //Connection error:
				// objectsCheck.onerror = function(e) {
					// var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
					// if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
					// db_coord.execute("UPDATE user_location SET status =\"notUploaded\"");
					// Ti.API.info("Error found for GPS uploading ");
					// db_coord.close();
					// Ti.App.fireEvent('refresh_UI_Alerts', {status: 'fail'});
					// unset_GPS_uploading();
				// }
				// //Sending information and try to connect
				// objectsCheck.send(json_coord);
			// } else {
				// unset_GPS_uploading();
				// Ti.API.info('We are offline');
			// }
		// } else {
			// unset_GPS_uploading();
			// Ti.API.info('No GPS coordinates found');
			// result.close();
			// db_coord.close();
			// createNotification("No coordinates saved... "+date('g:i a', Number(__timestamp)));
// 			
			// var objectsCheck = Ti.Network.createHTTPClient();
			// //Timeout until error:
			// objectsCheck.setTimeout(30000);
// 
			// //Opens address to retrieve contact list
			// objectsCheck.open('POST', domainName + '/js-location/mobile_location.json');
			// objectsCheck.setRequestHeader("Content-Type", "application/json");
			// objectsCheck.setRequestHeader("Cookie", getCookie());
			// //Sending information and try to connect
			// objectsCheck.send(json_coord);
		// }
	// }
	// else{
		// Ti.API.info("##### There are locations being updated already #####");
	// }
// 
// };
// 
// // setInterval(function() {
	// // upload_gps_locations();
// // }, 60000);	
// 
// upload_gps_locations();

//uploading = false;