Ti.include('/lib/util_functions.js');

/*jslint eqeq:true, plusplus: true*/ 
/*global Omadi*/

Ti.App.Properties.setString("last_alert_popup", 0);
var time_interval_for_alerts = 120;

// state vars used by resume/pause

var location_obj = [];
var dist_filter = 50;
var last_db_timestamp = 0;
var uploading = false;
var gpsInterval;
var uploadInterval;

var movement;

if(Ti.App.isIOS){
    movement =  require('com.omadi.ios_gps');
}

//Ti.API.info('Accuracy three: ' + movement.LOCATION_ACCURACY_THREE_KILOMETERS);
//Ti.API.info('Accuracy best: ' + movement.LOCATION_ACCURACY_BEST);
//Ti.API.info('Accuracy navig: ' + movement.LOCATION_ACCURACY_BEST_FOR_NAVIGATION);

function updateCurrentLocationiOS(e) {
    "use strict";
    /*global notifyIOS*/
    var timestamp, longitude, latitude, accuracy, speed, altitude, timePassed, db;

	longitude = e.location.longitude;
	latitude = e.location.latitude;
	accuracy = e.location.accuracy;
	speed = e.location.speed;
	altitude = e.location.altitude;
	
	//Ti.API.info('=====>>> Speed ' + speed*2.23693629+' Miles/H');
	Ti.API.info('LOCATION: ' + latitude + ', ' + longitude + ': ' + accuracy);

	if(latitude !== 0 && longitude !== 0) {
	    timestamp = Omadi.utils.getUTCTimestamp();
		
		if(accuracy > 200) {
			timePassed = timestamp - Ti.App.Properties.getString("last_alert_popup");
			if(timePassed > time_interval_for_alerts) {
				notifyIOS('Your GPS is getting inaccurate data. Please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters.', true);
			} else {
				Ti.API.info('NOT SHOWN - Omadi GPS Tracking is not working, please make sure the sky is visible. Current GPS accuracy is ' + accuracy + ' meters');
			}
		}
		
		db = Omadi.utils.openGPSDatabase();
		db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')");
		db.close();
		
		//Ti.API.info("LOCATION SERVICE SAVE: location_obj.length before: " + location_obj.length);
		//var leng_before = location_obj.length;
		//var aux_location = location_obj.slice(0);
		//Ti.API.info("LOCATION SERVICE SAVE: aux_location.length = " + aux_location.length + " location_obj.length after = " + location_obj.length);	
	}
}

function getGPSCoordinateiOS() {
    "use strict";
    //var stop = Ti.App.Properties.getBool('stopGPS', false);
    //if (stop){
       // Ti.API.info("STOPPING MOVEMENT UPDATES");
        //movement.stopMovementUpdates();
    //}
    //else{
        updateCurrentLocationiOS(movement.currentMovement);
   // }
}


function iOSStartGPS(){"use strict";

    if(Ti.App.isIOS){
        movement.startMovementUpdates({
        location : true,
        locationAccuracy : movement.LOCATION_ACCURACY_BEST_FOR_NAVIGATION
        });
        
        gpsInterval = setInterval(getGPSCoordinateiOS, 5000);
        
        uploadInterval = setInterval(function() {
            Ti.App.fireEvent('upload_gps_locations');
        }, 120000); 
        
        Ti.App.addEventListener('stop_gps', function(e){
            Ti.API.info("STOPPING IOS GPS INTERVALS");
            clearInterval(gpsInterval);
            clearInterval(uploadInterval);
            movement.stopMovementUpdates();
        });
    }
}

