Ti.App.Properties.setString("last_alert_popup", 0);
var time_interval_for_alerts = 120;

// state vars used by resume/pause
var db_coord_name = Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName() + "_GPS";
var location_obj = [];
var dist_filter = 50;
var last_db_timestamp = 0;
var curr;
var movement = require('com.omadi.ios_gps');
var stop = false;
var uploading = false;

Ti.API.info('Accuracy three: ' + movement.LOCATION_ACCURACY_THREE_KILOMETERS);
Ti.API.info('Accuracy best: ' + movement.LOCATION_ACCURACY_BEST);
Ti.API.info('Accuracy navig: ' + movement.LOCATION_ACCURACY_BEST_FOR_NAVIGATION);

movement.startMovementUpdates({
	location : true,
	locationAccuracy : movement.LOCATION_ACCURACY_BEST_FOR_NAVIGATION
});

function s() {
	if (stop === false){
		curr = movement.currentMovement;
		longitude = curr.location.longitude;
		latitude = curr.location.latitude;
		var accuracy = curr.location.longitude;
		var timestamp = new Date().getTime();
		timestamp = Math.round(timestamp / 1000);
		
		Ti.API.info('=====>>> Longitude ' + curr.location.longitude);
		Ti.API.info('=====>>> Latitude ' + curr.location.latitude);
		Ti.API.info('=====>>> Accuracy ' + curr.location.accuracy);
		Ti.API.info('=====>>> Timestamp ' + timestamp);

		if (latitude != 0 && longitude != 0){
			if (accuracy > 200 ){
				var time_now = Math.round(new Date().getTime() / 1000);
				var time_past = time_now - Ti.App.Properties.getString("last_alert_popup");
				if (time_past > time_interval_for_alerts) {
					notifyIOS('Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters', true);
				} else {
					Ti.API.info('NOT SHOWN - Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters');
				}
			}
	
			location_obj.push({
				no_accurated_location : false,
				accurated_location : "INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')",
				accuracy : accuracy,
				longitude : longitude,
				latitude : latitude,
				timestamp : timestamp
			});
		}

		setTimeout(s, 5000);
		return;
	}
	else{
		movement.stopMovementUpdates();
		return;
	}
}

setTimeout(s, 5000);

Ti.App.fireEvent('stop_gps', function(e){
	stop = true;
});


Ti.App.addEventListener('upload_gps_locations', function() {
	if (uploading === false){
		uploading = true;
		Ti.API.info('GPS');
		var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
		Ti.API.info("Length before: " + location_obj.length);
		var leng_before = location_obj.length;
		var aux_location = location_obj.slice(0);
		Ti.API.info(aux_location.length + " Length after: " + location_obj.length);
		location_obj = new Array();
	
		for (var ind_local in aux_location) {
			Ti.API.info(aux_location[ind_local].accurated_location);
			db_coord.execute(aux_location[ind_local].accurated_location);
		}
		if (aux_location.length > 0) {
			last_db_timestamp = aux_location.pop().timestamp;
			Ti.API.info("Last timestamp = " + last_db_timestamp);
		}
		var result = db_coord.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ORDER BY timestamp ASC");
	
		if (result.rowCount > 0) {
			Ti.API.info(result.rowCount + ' gps locations were found ');
			if (Ti.Network.getOnline() === true) {
	
				//Build JSON structure
				var json_coord = "{ \"data\": [";
				if (result.rowCount >= 50){
					for (var i = 0; i < 50; i++) {
						db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
						(i == 49) ? json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
						result.next();
					}
				}
				else{
					for (var i = 0; i < result.rowCount; i++) {
						db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
		
						(i == result.rowCount - 1) ? json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
						result.next();
					}
				}
				json_coord += "], \"current_time\": \" " + Math.round(new Date().getTime() / 1000) + "\" }";
	
				result.close();
	
				//alert ("Before open connection");
				var objectsCheck = Ti.Network.createHTTPClient();
				//Timeout until error:
				objectsCheck.setTimeout(30000);
	
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
	
					if (isJsonString(this.responseText) === true) {
						var resultReq = JSON.parse(this.responseText);
						if (resultReq.inserted) {
							if (resultReq.success) {
								Ti.API.info(resultReq.success + " GPS coordinates successfully inserted ");
							}
						}
						var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
						db_coord.execute('DELETE FROM user_location WHERE status="json"');
						var _arr_content = new Array();
						var nids = new Array();
						if (resultReq.alert) {
							for (var _i in resultReq.alert) {
								var tmstp = new Date();
								Ti.API.info("====>>>>>>>>>>>> " + resultReq.alert[_i].location_nid);
								if (nids.indexOf(resultReq.alert[_i].location_nid) == -1) {
									nids.push(resultReq.alert[_i].location_nid);
								}
								_arr_content.push('INSERT OR REPLACE INTO alert_names (location_nid, location_label) VALUES ( ' + resultReq.alert[_i].location_nid + ', "' + resultReq.alert[_i].location_label + '" )');
	
								for (var _y in resultReq.alert[_i].alerts) {
									if (resultReq.alert[_i].alerts[_y]) {
										Ti.API.info("Alert Message: " + resultReq.alert[_i].alerts[_y].message);
										_arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "' + resultReq.alert[_i].alerts[_y].subject + '", ' + resultReq.alert[_i].alerts[_y].reference_id + ', ' + resultReq.alert[_i].alerts[_y].alert_id + ', ' + resultReq.alert[_i].alerts[_y].location_nid + ', "' + resultReq.alert[_i].alerts[_y].location_label + '", "' + resultReq.alert[_i].alerts[_y].message + '" , ' + tmstp.getTime() + ' )');
									} else {
										Ti.API.info("Alert Message: " + resultReq.alert[_i].alerts.message);
										_arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "' + resultReq.alert[_i].alerts.subject + '", ' + resultReq.alert[_i].alerts.reference_id + ', ' + resultReq.alert[_i].alerts.alert_id + ', ' + resultReq.alert[_i].alerts.location_nid + ', "' + resultReq.alert[_i].alerts.location_label + '", "' + resultReq.alert[_i].alerts.message + '" , ' + tmstp.getTime() + ' )');
									}
								}
							}
						}
						db_coord.execute("BEGIN IMMEDIATE TRANSACTION");
						for (var _e in nids) {
							db_coord.execute('DELETE FROM alerts WHERE location_nid=' + nids[_e]);
							db_coord.execute('DELETE FROM alert_names WHERE location_nid=' + nids[_e]);
							Ti.API.info('Deleted location nids: ' + nids[_e]);
						}
	
						for (var _k in _arr_content) {
							Ti.API.info(_arr_content[_k]);
							db_coord.execute(_arr_content[_k]);
						}
						db_coord.execute("COMMIT TRANSACTION");
						Ti.API.info('Finished inserting');
						db_coord.close();
						Ti.App.fireEvent('refresh_UI_Alerts');
						uploading = false;
					}
				}
				//Connection error:
				objectsCheck.onerror = function(e) {
					var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
					db_coord.execute("UPDATE user_location SET status =\"notUploaded\"");
					Ti.API.info("Error found for GPS uploading ");
					db_coord.close();
					uploading = false;
				}
				//Sending information and try to connect
				objectsCheck.send(json_coord);
			} else {
				uploading = false;
				Ti.API.info('We are offline');
			}
		} else {
			uploading = false;
			Ti.API.info('No GPS coordinates found');
			result.close();
			db_coord.close();
		}
	}
	else{
		Ti.API.info("##### There are locations being updated already #####");
	}
});

setInterval(function() {
	Ti.App.fireEvent('upload_gps_locations');
}, 120000);