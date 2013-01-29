/*jslint eqeq: true*/

Ti.include("/lib/functions.js");

//movement = require('com.omadi.gps');

Ti.API.info("STARTING android GPS Service");

Ti.Geolocation.Android.manualMode = true;
var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
    name: Ti.Geolocation.PROVIDER_GPS,
    minUpdateTime: 20, 
    minUpdateDistance: 10
});

Ti.Geolocation.Android.addLocationProvider(gpsProvider);

var gpsRuleGPS = Ti.Geolocation.Android.createLocationRule({
    provider: Ti.Geolocation.PROVIDER_GPS,
    // Updates should be accurate to 100m
    accuracy: 200,
    // Updates should be no older than 25s
    maxAge: 25000,
    // But  no more frequent than once per 10 seconds
    minAge: 10000
});

var gpsRuleNetword = Ti.Geolocation.Android.createLocationRule({
    provider: Ti.Geolocation.PROVIDER_NETWORK,
    // Updates should be accurate to 100m
    accuracy: 10000,
    // Updates should be no older than 25s
    maxAge: 25000,
    // But  no more frequent than once per 10 seconds
    minAge: 10000
});

Ti.Geolocation.Android.addLocationRule(gpsRuleGPS);
Ti.Geolocation.Android.addLocationRule(gpsRuleNetword);

Ti.Geolocation.addEventListener('location', updateCurrentLocation);

function saveGPS() {"use strict";

    var stopGPS = Ti.App.Properties.getBool('stopGPS', false);

    /*global updateCurrentLocation, Omadi*/

    //Ti.API.info("stopGPS: " + stopGPS);

    if (stopGPS) {
        Ti.API.info("TRYING TO STOP GPS NOW!!!");
        try {
            // if (movement) {
                // movement.stopGPSTracking();
            // }
            
            Titanium.Android.currentService.stop();

            //Omadi.display.removeNotifications();
        }
        catch(ex) {
            Ti.API.error("Stopping gps service: " + ex);
        }
    }
    else {

        // movement.startGPSTracking();
// 
        // movement.currentMovement({
            // "updateLatLng" : function(e) {
                // updateCurrentLocation(e);
            // }
        // });
    }
}

function updateCurrentLocation(e) {"use strict";

    var timestamp, time_passed, db;

    /*global notifyIOS*/
    
    Ti.API.debug(JSON.stringify(e));
    
    timestamp = Omadi.utils.getUTCTimestamp();

    if (typeof e.coords !== 'undefined' && e.coords.latitude != 0 && e.coords.longitude != 0) {
        
        //Ti.API.debug(e.coords.latitude);
        
        //Ti.API.debug(e.latitude + " " + e.longitude);
        if (e.coords.accuracy > 200) {
            time_passed = timestamp - Ti.App.Properties.getString("last_alert_popup");
            if (time_passed > 300) {
                notifyIOS('Your GPS is getting inaccurate data. Please make sure the sky is visible. Current GPS accuracy is ' + Math.round(e.coords.accuracy) + ' meters.', true);
            }
        }

        if (!Ti.App.Properties.getBool("insertingGPS", false)) {
            Ti.App.Properties.setBool("insertingGPS", true);

            db = Omadi.utils.openGPSDatabase();
            db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + e.coords.longitude + "','" + e.coords.latitude + "'," + timestamp + ", 'notUploaded')");
            db.close();

            Ti.App.Properties.setBool("insertingGPS", false);
            
            Omadi.location.uploadGPSCoordinates();
        }
    }
    
    //setTimeout(function(){
           // Ti.Geolocation.removeEventListener('location', updateCurrentLocation);
    //}, 24000);
}

//saveGPS();
