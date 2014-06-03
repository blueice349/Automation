/*jslint eqeq:true, plusplus: true*/

Omadi.location = Omadi.location || {};

Omadi.location.isLocationEnabled = function(){"use strict";
    /*global alertQueue */
    var dialog = null, locAuth, retval = true;
    
    if(Ti.App.isAndroid && !Ti.Geolocation.getLocationServicesEnabled()){
        
        dialog = Ti.UI.createAlertDialog({
           message: "Your GPS is turned off. Please turn it on in the Android settings screen.",
           title: 'Location Disabled',
           buttonNames: ['OK']
        });
        
        retval = false;
    }
    else if(Ti.App.isIOS){
        locAuth = Ti.Geolocation.getLocationServicesAuthorization();
        
        if(!Ti.Geolocation.getLocationServicesEnabled()){
            dialog = Ti.UI.createAlertDialog({
               message: "Your GPS is turned off for all apps. Please turn it on in the settings app under Privacy -> Location Services.",
               title: 'Location Disabled',
               buttonNames: ['OK']
            });
            retval = false;
        }
        else if(locAuth == Ti.Geolocation.AUTHORIZATION_DENIED || locAuth == Ti.Geolocation.AUTHORIZATION_RESTRICTED){
            dialog = Ti.UI.createAlertDialog({
               message: "Your GPS is turned off for the Omadi app. Please turn it on in the settings app under Privacy -> Location Services.",
               title: 'Location Disabled',
               buttonNames: ['OK']
            });
            retval = false;
        }
    }
    
    if(dialog !== null){
        dialog.show();
    }
    
    return retval;
};

Omadi.location.getLastLocation = function(){"use strict";
    var db, result, location = {};
    
    db = Omadi.utils.openGPSDatabase();
    
    result = db.execute("SELECT longitude, latitude, accuracy FROM user_location ORDER BY timestamp DESC LIMIT 1");
    
    if(result.isValidRow()){
        location.latitude = result.fieldByName('latitude');
        location.longitude = result.fieldByName('longitude');
        location.accuracy = result.fieldByName('accuracy');
    }
    else{
        location.latitude = 0;
        location.longitude = 0;
        location.accuracy = 0;
    }
    
    db.close();
    
    return location;
};

Omadi.location.currentPositionCallback = function(e) {"use strict";
    var coords = e.coords, db;

    if ( typeof coords !== 'undefined' && typeof coords.longitude !== 'undefined' && coords.longitude !== 0 && coords.latitude !== 0) {

        if (!Ti.App.Properties.getBool("insertingGPS", false)) {

            Ti.App.Properties.setBool("insertingGPS", true);
            
            db = Omadi.utils.openGPSDatabase();
            db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + coords.longitude + "', '" + coords.latitude + "', " + (coords.timestamp / 1000) + ", 'notUploaded')");
            db.close();
            
            Ti.App.Properties.setBool("insertingGPS", false);

            Omadi.location.uploadGPSCoordinates();
        }
    }
};

Omadi.location.uploadGPSCoordinates = function() {"use strict";
    var db, result, json, http, i, locationItems;

    /*global createNotification*/

    //Ti.API.debug("GPS Uploading: " + Omadi.location.is_GPS_uploading());

    if (!Omadi.location.is_GPS_uploading() && Omadi.utils.isLoggedIn()) {

        if (!Ti.Network.getOnline()) {
            Ti.API.info('We are offline');
            Ti.App.fireEvent('refresh_UI_Alerts', {
                status : 'success'
            });
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

            Ti.App.Properties.setBool("insertingGPS", true);
            if (result.rowCount > 0) {
                for ( i = 0; i < result.rowCount; i += 1) {
                    db.execute("UPDATE user_location SET status='sendingLocation' WHERE ulid=" + result.fieldByName('ulid'));

                    locationItems.unshift({
                        lat : result.fieldByName('latitude'),
                        lng : result.fieldByName('longitude'),
                        timestamp : result.fieldByName('timestamp')
                    });
                    // (i == result.rowCount - 1) ? json += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
                    result.next();
                }
            }
            Ti.App.Properties.setBool("insertingGPS", false);

            result.close();
            db.close();

            if (locationItems.length > 0) {

                json = "{ \"data\": [";

                for ( i = 0; i < locationItems.length; i += 1) {

                    json += " {\"lat\" : \"" + locationItems[i].lat + "\", \"lng\" : \"" + locationItems[i].lng + "\" , \"time\" : \"" + locationItems[i].timestamp + "\"}";

                    if (i < locationItems.length - 1) {
                        json += ',';
                    }
                }
                json += "], \"current_time\": \" " + Omadi.utils.getUTCTimestamp() + "\" }";

                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false
                });
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

                createNotification("No coordinates saved... " + Omadi.utils.PHPFormatDate('g:i a', Number(Omadi.utils.getUTCTimestamp())));
            }
        }
    }
    else {
        Ti.API.info("##### There are locations being updated already #####");
    }
};

Omadi.location.is_GPS_uploading = function() {"use strict";
    return Ti.App.Properties.getBool("isGPSUploading", false);
};

Omadi.location.set_GPS_uploading = function() {"use strict";
    Ti.App.Properties.setBool("isGPSUploading", true);
};

Omadi.location.unset_GPS_uploading = function() {"use strict";
    Ti.App.Properties.setBool("isGPSUploading", false);
};

Omadi.location.uploadSuccess = function(e) {"use strict";
    /*global isJsonString*/

    var i, j, responseObj, db, sqlArray, nids, now_timestamp, result;

    if (isJsonString(this.responseText) === true) {
        now_timestamp = Omadi.utils.getUTCTimestamp();

        responseObj = JSON.parse(this.responseText);
        if (responseObj.inserted) {
            if (responseObj.success) {
                Ti.API.info(responseObj.success + " GPS coordinates successfully inserted ");
            }
        }

        db = Omadi.utils.openGPSDatabase();
        db.execute("UPDATE user_location SET status='sent' WHERE status='sending'");
        
        // Delete any locations that are over 15 minutes old and the upload succeeded
        db.execute("DELETE FROM user_location WHERE timestamp < " + (now_timestamp - (60 * 15)));

        sqlArray = [];
        nids = [];

        //Ti.API.debug(responseObj);

        if (responseObj.alert) {
            for (i in responseObj.alert) {
                if (responseObj.alert.hasOwnProperty(i)) {
                    //Ti.API.info("====>>>>>>>>>>>> " + responseObj.alert[_i].location_nid);
                    if (nids.indexOf(responseObj.alert[i].location_nid) === -1) {
                        nids.push(responseObj.alert[i].location_nid);
                    }
                    sqlArray.push('INSERT OR REPLACE INTO alert_names (location_nid, location_label) VALUES ( ' + responseObj.alert[i].location_nid + ', "' + responseObj.alert[i].location_label + '" )');

                    for (j in responseObj.alert[i].alerts) {
                        if (responseObj.alert[i].alerts.hasOwnProperty(j)) {
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
        for ( i = 0; i < nids.length; i += 1) {
            db.execute('DELETE FROM alerts WHERE location_nid=' + nids[i]);
            db.execute('DELETE FROM alert_names WHERE location_nid=' + nids[i]);
            //Ti.API.info('Deleted location nids: ' + nids[_e]);
        }

        for ( i = 0; i < sqlArray.length; i += 1) {
            //Ti.API.info(sqlArray[_k]);
            db.execute(sqlArray[i]);
        }
        db.execute("COMMIT TRANSACTION");
        //Ti.API.info('Finished inserting');
        db.close();

        //if(!Ti.App.Properties.getBool('stopGPS', false) && Omadi.utils.isLoggedIn()){
        createNotification("Uploaded GPS at " + Omadi.utils.PHPFormatDate('g:i a', Number(Omadi.utils.getUTCTimestamp())));
        //}

    }

    Omadi.location.unset_GPS_uploading();

    Ti.App.fireEvent('refresh_UI_Alerts', {
        status : 'success'
    });
    // if(Ti.App.Properties.getBool('stopGPS', false) || !Omadi.utils.isLoggedIn()){
    // setTimeout(Omadi.display.removeNotifications, 1000);
    // }
};

Omadi.location.uploadError = function(e) {"use strict";
    var db = Omadi.utils.openGPSDatabase();
    db.execute("UPDATE user_location SET status =\"notUploaded\"");
    Ti.API.error("Error found for GPS uploading: " + e.error + " " + e.status);
    db.close();

    Omadi.location.unset_GPS_uploading();

    Ti.App.fireEvent('refresh_UI_Alerts', {
        status : 'fail'
    });
};
