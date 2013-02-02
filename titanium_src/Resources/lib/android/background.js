
Omadi.background = Omadi.background || {};

Omadi.background.android = {};


Omadi.background.android.startGPSServiceAlarm = function(){"use strict";
   var alarmModule, alarmManager;
   
    alarmModule = require('bencoding.alarmmanager');
    alarmManager = alarmModule.createAlarmManager();
    // alarmManager.addAlarmNotification({
        // requestCode : 41, //Request ID used to identify a specific alarm. Provide the same requestCode twice to update
        // //icon : Ti.Android.R.drawable.star_on, //Optional icon must be a resource id or url
        // second : 10, //Set the number of minutes until the alarm should go off
        // contentTitle : 'Alarm #1', //Set the title of the Notification that will appear
        // contentText : 'Alarm & Notify Basic', //Set the body of the notification that will apear
        // playSound : true, //On notification play the default sound ( by default off )
        // vibrate : true, //On notification vibrate device ( by default off )
        // showLights : true, //On notification show the device lights ( by default off )
        // repeat: 10000
    // });
    
    alarmManager.addAlarmService({
        //The full name for the service to be called. Find this in your AndroidManifest.xml Titanium creates
        requestCode : 47,
        service : 'com.omadi.crm.Android_gps_eventService',
        minute : 1, //Set the number of minutes until the alarm should go off
        repeat : 60000 // Create an interval service that runs each minute
    });
};

Omadi.background.android.startGPSService = function(){"use strict";
    /*global createNotification*/
   
    var intent;

    Ti.API.info("Starting Android services.");

    Ti.App.Properties.setBool('stopGPS', false);

    //movement.startGPSTracking();

    //Initialize the GPS background service
    intent = Titanium.Android.createServiceIntent({
        url : 'android_gps_event.js'
    });

    //intent.putExtra('interval', 20000);

    //intent.putExtra('interval', 5000);
    Ti.App.service1 = Titanium.Android.createService(intent);

    Ti.App.service1.start();
    Ti.App.service1.isStarted = true;

    //Ti.App.Properties.setObject('AndroidGPSService1', service);

    // intent2 = Titanium.Android.createServiceIntent({
        // url : 'android_gps_upload.js'
    // });
// 
    // intent2.putExtra('interval', 120000);
// 
    // Ti.App.service2 = Titanium.Android.createService(intent2);
    // Ti.App.service2.isStarted = false;
// 
    // // Start the GPS upload 30 seconds after the program starts
    // setTimeout(function() {
        // if (!Ti.App.Properties.getBool('stopGPS', false)) {
            // Ti.App.service2.start();
            // Ti.App.service2.isStarted = true;
        // }
        // //Ti.App.Properties.setObject('AndroidGPSService2', service2);
    // }, 30000);

    createNotification("No coordinates uploaded so far");
    
    Omadi.background.android.startGPSServiceAlarm();

    //Titanium.Android.startService(intent);
};


Omadi.background.android.stopGPSService = function(){"use strict";
    var alarmModule, alarmManager;
    
    Ti.App.fireEvent("stopGPS"); 
    
    alarmModule = require('bencoding.alarmmanager');
    alarmManager = alarmModule.createAlarmManager();
    alarmManager.cancelAlarmNotification(47);
};


Omadi.background.android.startUpdateServiceAlarm = function(){"use strict";
   var alarmModule, alarmManager;
   
    alarmModule = require('bencoding.alarmmanager');
    alarmManager = alarmModule.createAlarmManager();
    alarmManager.addAlarmService({
        //The full name for the service to be called. Find this in your AndroidManifest.xml Titanium creates
        requestCode : 48,
        service : 'com.omadi.crm.SyncServiceService',
        minute : 1, //Set the number of minutes until the alarm should go off
        repeat : 60000 // Create an interval service that runs each minute
    });
};

Omadi.background.android.startUpdateService = function(){"use strict";
    
    var intent;

    Ti.API.info("Starting Android sync service.");
   
    intent = Titanium.Android.createServiceIntent({
        url : 'syncService.js'
    });

    Ti.App.serviceUpdate = Titanium.Android.createService(intent);

    Ti.App.serviceUpdate.start();
    Ti.App.serviceUpdate.isStarted = true;
    
    Omadi.background.android.startUpdateServiceAlarm();
    
};

Omadi.background.android.stopUpdateService = function(){"use strict";
    var alarmModule, alarmManager;
    
    Ti.App.fireEvent("stopUpdates"); 
    
    alarmModule = require('bencoding.alarmmanager');
    alarmManager = alarmModule.createAlarmManager();
    alarmManager.cancelAlarmNotification(48);
};
