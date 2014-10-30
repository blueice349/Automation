/*jslint node:true */
'use strict';

var Utils = require('lib/Utils'); 

exports.startGPSService = function() {
    var intent;

    Ti.API.info("Starting Android services.");

    Ti.App.Properties.setBool('stopGPS', false);

    //Initialize the GPS background service
    intent = Titanium.Android.createServiceIntent({
        url : 'android_gps_event.js',
        startMode: Titanium.Android.START_REDELIVER_INTENT
    });

    Ti.App.service1 = Titanium.Android.createService(intent);

    Ti.App.service1.start();
    Ti.App.service1.isStarted = true;

    Utils.createNotification("No coordinates uploaded so far");
};


exports.stopGPSService = function() {
    Ti.App.fireEvent("stopGPS"); 
};


exports.startUpdateServiceAlarm = function() {
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

exports.startUpdateService = function() {
    
    var intent;

    Ti.API.info("Starting Android sync service.");
   
    intent = Titanium.Android.createServiceIntent({
        url : 'syncService.js'
    });

    Ti.App.serviceUpdate = Titanium.Android.createService(intent);

    Ti.App.serviceUpdate.start();
    Ti.App.serviceUpdate.isStarted = true;
    
    exports.startUpdateServiceAlarm();
    
};

exports.stopUpdateService = function() {
    var alarmModule, alarmManager;
    
    Ti.App.fireEvent("stopUpdates"); 
    
    alarmModule = require('bencoding.alarmmanager');
    alarmManager = alarmModule.createAlarmManager();
    alarmManager.cancelAlarmNotification(48);
};
