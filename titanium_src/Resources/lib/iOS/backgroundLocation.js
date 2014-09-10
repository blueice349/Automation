/*jslint eqeq:true*/

//Create our class with all of the availability information
var available = require('bencoding.basicgeo').createAvailability();

var saveCoordinate = function(e){"use strict";
    var timestamp, longitude, latitude, accuracy, speed, altitude, timePassed, db, result, 
        uploadToServer, numCoordinates, lastBackgroundGPSTimestamp, now;
    /*global Omadi*/
    
    JSON.stringify(e);
    
    if(typeof e.coords !== 'undefined'){
        
        longitude = e.coords.longitude;
        latitude = e.coords.latitude;
        accuracy = e.coords.accuracy;
        speed = e.coords.speed;
        altitude = e.coords.altitude;
        
        Ti.App.fireEvent('locationChanged', {
			lat: e.coords.latitude,
			lng: e.coords.longitude
		});
        
        Ti.API.info('BACKGROUND LOCATION: ' + latitude + ', ' + longitude + ': ' + accuracy);
    
        if(latitude !== 0 && longitude !== 0) {
            timestamp = Omadi.utils.getUTCTimestamp();
            
            
            // TODO: Don't insert a coordinate unless it's been at least 15 seconds from the last one
            // TODO: Add in the accuracy of the coordinates to the database to send to server for analysis
            
            now = timestamp;
            
            lastBackgroundGPSTimestamp = Ti.App.Properties.getDouble("lastTimestamp", 0);
            
            if(now - 15 > lastBackgroundGPSTimestamp){
                
                if(!Ti.App.Properties.getBool("insertingGPS", false)){
                    Ti.App.Properties.setBool("insertingGPS", true);
                    
                    Ti.App.Properties.setDouble("lastTimestamp", now);
                    
                    db = Omadi.utils.openGPSDatabase();
                    db.execute("INSERT INTO user_location (longitude, latitude, timestamp, status) VALUES ('" + longitude + "','" + latitude + "'," + timestamp + ", 'notUploaded')");
                    
                    result = db.execute("SELECT COUNT(*) FROM user_location WHERE status = 'notUploaded' AND timestamp < " + (now - 120));
                    
                    uploadToServer = false;
                    if(result.isValidRow() && result.field(0, Ti.Database.FIELD_TYPE_INT) > 0){
                        uploadToServer = true;
                        numCoordinates = result.field(0, Ti.Database.FIELD_TYPE_INT);
                    }
                    
                    db.close();
                    
                    Ti.App.Properties.setBool("insertingGPS", false);
                    
                    if(uploadToServer){
                        Ti.API.info('Uploading in background: ' + numCoordinates);
                        Omadi.location.uploadGPSCoordinates();
                    }
                }
            }
        }
    }
};

//Define our location monitor object
var significantChange = {
    module : null,
    errorEvt : function(e){"use strict";
        Ti.API.info("significantChange Error " + JSON.stringify(e));
    },
    changeEvt : function(e){"use strict";
        Ti.API.info("significantChange Change " + JSON.stringify(e));  
        saveCoordinate(e);
    },
    startEvt : function (e){"use strict";
        Ti.API.info("significantChange Start " + JSON.stringify(e)); 
    },
    stopEvt : function(e){"use strict";
        Ti.API.info("significantChange Stop " + JSON.stringify(e));             
    },              
    start : function(){"use strict";
        //First we start everything up
        if(significantChange.module==null){
            significantChange.module = require("bencoding.basicgeo").createSignificantChange();
            significantChange.module.addEventListener('error', significantChange.errorEvt);
            significantChange.module.addEventListener('start', significantChange.startEvt);
            significantChange.module.addEventListener('stop', significantChange.stopEvt);
            significantChange.module.addEventListener('change',significantChange.changeEvt);    
            Ti.API.info('significantChange Listeners Added');                                   
        }
        //Add our configuration parameters
        significantChange.module.purpose = "demo";  
        significantChange.module.staleLimit = 5;
                            
        //Start monitoring for changes
        significantChange.module.startSignificantChange();
     },
     stop : function(){"use strict";
        if(significantChange.module!=null){
            significantChange.module.stopSignificantChange();
            Ti.API.info('significantChange Stopped');                   
            significantChange.module.removeEventListener('error', significantChange.errorEvt);
            significantChange.module.removeEventListener('start', significantChange.startEvt);
            significantChange.module.removeEventListener('stop',  significantChange.stopEvt);
            significantChange.module.removeEventListener('change',significantChange.changeEvt);
            Ti.API.info('significantChange Listeners Removed');                     
            significantChange.module=null;
        }       
    }   
};


Ti.App.addEventListener('resumed',function(e){"use strict";
    //Stop location monitoring
    significantChange.stop();
    
    Omadi.location.uploadGPSCoordinates();
});

Ti.App.addEventListener('pause',function(e){"use strict";
    //Does this device support background actions?
    if(available.allowBackgrounding()){
        //Check that the device can use Significant Location Change Monitoring
        if(available.significantLocationChangeMonitoringAvailable()){
            //Start location monitoring
            significantChange.start();
        }
    }
});