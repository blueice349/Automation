/* jshint ignore:start */
Ti.include('/lib/util_functions.js');

var Display = require('lib/Display');
var Utils = require('lib/Utils');
Display.setCurrentWindow(Ti.UI.currentWindow, 'ios_geolocation');

Ti.App.Properties.setString("last_alert_popup", 0);
var time_interval_for_alerts = 120;

// state vars used by resume/pause

var gpsInterval;
var uploadInterval;

var movement;

if (Ti.App.isIOS) {
    movement = require('com.omadi.ios_gps');
}

function updateCurrentLocationiOS(e) {"use strict";
    var timestamp, longitude, latitude, accuracy, speed, altitude, timePassed, db;

    longitude = e.location.longitude;
    latitude = e.location.latitude;
    accuracy = e.location.accuracy;
    speed = e.location.speed;
    altitude = e.location.altitude;

    if (latitude !== 0 && longitude !== 0) {
        timestamp = Omadi.utils.getUTCTimestamp();

        if (accuracy > 200) {
            timePassed = timestamp - Ti.App.Properties.getString("last_alert_popup");
            if (timePassed > time_interval_for_alerts) {
                Utils.notifyIOS('Your GPS is getting inaccurate data. Please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters.', true);
            }
            else {
                Ti.API.info('NOT SHOWN - Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters');
            }
        }

        if (!Ti.App.Properties.getBool("insertingGPS", false)) {
            Ti.App.Properties.setBool("insertingGPS", true);

            db = Omadi.utils.openGPSDatabase();
            db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')");
            db.close();
            db = null;
            
            Ti.App.fireEvent('OmadiLocation', {
            	longitude: longitude,
            	latitude: latitude,
            	timestamp: timestamp
            });

            Ti.App.Properties.setBool("insertingGPS", false);
            
            Omadi.location.uploadGPSCoordinates();
        }
    }
}

function getGPSCoordinateiOS() {"use strict";
    updateCurrentLocationiOS(movement.currentMovement);
}

function iOSStartGPS() {"use strict";
    if (Ti.App.isIOS) {
        movement.startMovementUpdates({
            location : true,
            locationAccuracy : movement.LOCATION_ACCURACY_BEST_FOR_NAVIGATION
        });

        gpsInterval = setInterval(getGPSCoordinateiOS, 25000);

        Ti.App.addEventListener('stop_gps', function() {
            Ti.API.info("STOPPING IOS GPS INTERVALS");
            clearInterval(gpsInterval);
            clearInterval(uploadInterval);
            movement.stopMovementUpdates();
        });
    }
}
/* jshint ignore:end */
