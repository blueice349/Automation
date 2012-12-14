/*jslint eqeq:true, plusplus: true*/ 
Omadi.location = Omadi.location || {};

Omadi.location.currentPositionCallback = function(e) {
	"use strict";
	var coords = e.coords, db;
	
	if(typeof coords.longitude !== 'undefined' && coords.longitude !== 0 && coords.latitude !== 0){
		db = Omadi.utils.openGPSDatabase();//Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
		db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + coords.longitude + "', '" + coords.latitude + "', " + (coords.timestamp/1000) + ", 'notUploaded')");
		db.close();
		
		Omadi.location.uploadGPSCoordinates();
	}
};

Omadi.location.uploadGPSCoordinates = function(){
	"use strict";
	
	var db, result, json, http, i, locationItems;
	
	/*global createNotification*/
	
	//Ti.API.info('################################## CALLED ANDROID UPDATE FUNCTION ################################## '+ Omadi.location.is_GPS_uploading());
	
	if (!Omadi.location.is_GPS_uploading() && Omadi.utils.isLoggedIn()){
		
		if (!Ti.Network.getOnline()) {
			Ti.API.info('We are offline');
		}
		else {
			Omadi.location.set_GPS_uploading();
			//Ti.API.info('LOCATION SERVICE: UPLOAD GPS');
			db = Omadi.utils.openGPSDatabase();
			
			//Ti.API.info("LOCATION SERVICE SAVE: location_obj.length before: " + location_obj.length);
			//var leng_before = location_obj.length;
			//var aux_location = location_obj.slice(0);
			//Ti.API.info("LOCATION SERVICE SAVE: aux_location.length = " + aux_location.length + " location_obj.length after = " + location_obj.length);
			//location_obj = new Array();
		
			//for (var ind_local in aux_location) {
				//Ti.API.info("LOCATION SAVE: " + aux_location[ind_local].accurated_location);
			//	db.execute(aux_location[ind_local].accurated_location);
			//}
			//if (aux_location.length > 0) {
			//	last_db_timestamp = aux_location.pop().timestamp;
			//	Ti.API.info("Last timestamp = " + last_db_timestamp);
			//}
			result = db.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ORDER BY timestamp DESC LIMIT 50");
			
			locationItems = [];
			
			if (result.rowCount > 0) {
				for (i = 0; i < result.rowCount; i+=1) {
					db.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
					
					locationItems.unshift({
						lat: result.fieldByName('latitude'),
						lng: result.fieldByName('longitude'),
						timestamp: result.fieldByName('timestamp')
					});
					// (i == result.rowCount - 1) ? json += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
					result.next();
				}
			}
			
			result.close();
			db.close();
			
			
			if(locationItems.length > 0){
				
				json = "{ \"data\": [";
				
				for(i = 0; i < locationItems.length; i += 1){
					
					json += " {\"lat\" : \"" + locationItems[i].lat + "\", \"lng\" : \"" + locationItems[i].lng + "\" , \"time\" : \"" + locationItems[i].timestamp + "\"}";	
					
					if(i < locationItems.length - 1){
						json += ',';
					}
				}
				json += "], \"current_time\": \" " + Omadi.utils.getUTCTimestamp() + "\" }";
	

				http = Ti.Network.createHTTPClient();
				//Timeout until error:
				http.setTimeout(30000);
	
				//Opens address to retrieve contact list
				http.open('POST', Omadi.DOMAIN_NAME + '/js-location/mobile_location.json');
				
				//Header parameters
				http.setRequestHeader("Content-Type", "application/json");
				Omadi.utils.setCookieHeader(http);

				http.onload = Omadi.location.uploadSuccess;
				http.onerror = Omadi.location.uploadError;
				
				http.send(json);
			} 
			else {
				Omadi.location.unset_GPS_uploading();
				Ti.API.debug('No GPS coordinates found');
						
				Ti.Geolocation.purpose = "Location Alerts";
				Ti.Geolocation.getCurrentPosition(Omadi.location.currentPositionCallback);
				Ti.API.debug("FETCHING CURRENT POSITION");
				
				createNotification("No coordinates saved... " + Omadi.utils.PHPFormatDate(Number(Omadi.utils.getUTCTimestamp()), 'g:i a'));
				
			}
		} 
	}
	else{
		Ti.API.info("##### There are locations being updated already #####");
	}
};

Omadi.location.is_GPS_uploading = function(){
	"use strict";
	return Ti.App.Properties.getBool("isGPSUploading", false);
};

Omadi.location.set_GPS_uploading = function(){
	"use strict";	
	Ti.App.Properties.setBool("isGPSUploading", true);
};

Omadi.location.unset_GPS_uploading = function(){
	"use strict";
	Ti.App.Properties.setBool("isGPSUploading", false);
};

Omadi.location.uploadSuccess = function(e) {
	"use strict";
	/*global isJsonString*/
	
	var i, j, responseObj, db, sqlArray, nids, now_timestamp;
	
	//Parses response into strings
	//Ti.API.info('onLoad for GPS coordiates reached! Here is the reply: ');
	//Ti.API.info(this.responseText);
	//Ti.API.info('Requested: ');
	//Ti.API.info(json);

	if (isJsonString(this.responseText) === true) {
		now_timestamp = Omadi.utils.getUTCTimestamp();
		
		responseObj = JSON.parse(this.responseText);
		if (responseObj.inserted) {
			if (responseObj.success) {
				Ti.API.info(responseObj.success + " GPS coordinates successfully inserted ");
			}
		}
		
		db = Omadi.utils.openGPSDatabase();
		db.execute('DELETE FROM user_location WHERE status="json"');
		
		sqlArray = [];
		nids = [];
		
		//Ti.API.debug(responseObj);
		
		if (responseObj.alert) {
			for (i in responseObj.alert) {
				if(responseObj.alert.hasOwnProperty(i)){
					//Ti.API.info("====>>>>>>>>>>>> " + responseObj.alert[_i].location_nid);
					if (nids.indexOf(responseObj.alert[i].location_nid) === -1) {
						nids.push(responseObj.alert[i].location_nid);
					}
					sqlArray.push('INSERT OR REPLACE INTO alert_names (location_nid, location_label) VALUES ( ' + responseObj.alert[i].location_nid + ', "' + responseObj.alert[i].location_label + '" )');
					
					for (j in responseObj.alert[i].alerts) {
						if(responseObj.alert[i].alerts.hasOwnProperty(j)){
							if (responseObj.alert[i].alerts[j]) {
								//Ti.API.info("Alert Message: " + responseObj.alert[_i].alerts[_y].message);
								sqlArray.push("INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( '" + responseObj.alert[i].alerts[j].subject.replace(/[']/g, "''") + "', " + responseObj.alert[i].alerts[j].reference_id + ', ' + responseObj.alert[i].alerts[j].alert_id + ', ' + responseObj.alert[i].alerts[j].location_nid + ", '" + responseObj.alert[i].alerts[j].location_label.replace(/[']/g, "''") + "', '" + responseObj.alert[i].alerts[j].message.replace(/[']/g, "''") + "' , " + now_timestamp + ")");
							} 
						}
					}
				}
			}
		}
		
		db.execute("BEGIN IMMEDIATE TRANSACTION");
		for (i = 0; i < nids.length; i+=1) {
			db.execute('DELETE FROM alerts WHERE location_nid=' + nids[i]);
			db.execute('DELETE FROM alert_names WHERE location_nid=' + nids[i]);
			//Ti.API.info('Deleted location nids: ' + nids[_e]);
		}
		
		for (i = 0; i < sqlArray.length; i+=1) {
			//Ti.API.info(sqlArray[_k]);
			db.execute(sqlArray[i]);
		}
		db.execute("COMMIT TRANSACTION");
		//Ti.API.info('Finished inserting');
		db.close();
		Ti.App.fireEvent('refresh_UI_Alerts', {status: 'success'});
		
		Omadi.location.unset_GPS_uploading();
		
		//if(!Ti.App.Properties.getBool('stopGPS', false) && Omadi.utils.isLoggedIn()){
		      createNotification("Uploaded GPS at " + Omadi.utils.PHPFormatDate(Number(Omadi.utils.getUTCTimestamp()), 'g:i a'));
		//}
		
	}
	
	Omadi.location.unset_GPS_uploading();
	
	// if(Ti.App.Properties.getBool('stopGPS', false) || !Omadi.utils.isLoggedIn()){
        // setTimeout(Omadi.display.removeNotifications, 1000);
    // }
};

Omadi.location.uploadError = function(e) {"use strict";
	var db = Omadi.utils.openGPSDatabase();
	db.execute("UPDATE user_location SET status =\"notUploaded\"");
	Ti.API.error("Error found for GPS uploading: " + e.status);
	db.close();
	Ti.App.fireEvent('refresh_UI_Alerts', {status: 'fail'});
	Omadi.location.unset_GPS_uploading();
};
