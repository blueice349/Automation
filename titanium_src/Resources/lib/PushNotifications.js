/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var Database = require('lib/Database');
var AlertQueue = require('lib/AlertQueue');
var Cloud = require('ti.cloud');
var CloudPush;
if(Ti.Platform.name === 'android'){
    CloudPush = require('ti.cloudpush');
}

exports.logoutUser = function() {
    Ti.App.registeredPushListener = false;
    exports.unsubscribeACSPush(exports.logoutACSUser);  
};

exports.unsubscribeACSPush = function(callback) {
    if(Ti.App.isAndroid){
        CloudPush.removeEventListener('callback', exports.androidPushCallback);
    }
    
    if(typeof callback === 'undefined'){
        callback = null;
    }
    
    Cloud.PushNotifications.unsubscribe({
        device_token: exports.getUserDeviceToken()
    }, function(e){
        if(e.success){
            Ti.API.debug("Successfully unsubscribed from push.");    
        }
        else{
            
            if(e.message == 'Subscription not found'){
                // do nothing
                Ti.API.debug("Not subscribed, so unsubscribe was not needed.");
            }
            else if(callback === null){
                // Only show the alert if there is no callback
                // Callbacks are used to reset the push notifications before logging in again
                var dialog = Ti.UI.createAlertDialog({
                    message : "There was a problem disabling push notifications. You may still receive push notifications even though you are logged out."
                });
                
                dialog.show();
                Utils.sendErrorReport('onACSUnsubscribe ' + JSON.stringify(e));
            }
        }
        
        if(callback !== null){
            callback();
        }
    });
};

exports.androidPushCallback = function(e) {
	var Service = require('lib/Service');
    var sound, dialog, payload;
    
    Ti.API.debug(JSON.stringify(e));
    
    sound = Ti.Media.createSound({
        url : Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "sounds/notificationBeep.wav"),
        volume : 1.0
    });

    sound.play();
    
    payload = JSON.parse(e.payload);
    
    if (payload.fetchUpdates == 1) {
        Service.fetchUpdates(true, true);
    }

    if (payload.showAlert == 1) {
        dialog = Ti.UI.createAlertDialog({
            message : payload.alert,
            title : payload.title
        });

		AlertQueue.enqueue(dialog);
    }
};

exports.getUserDeviceToken = function() {
	var token = null;
    var result = Database.queryList("SELECT device_token FROM history WHERE id_hist=1");
    if(result.isValidRow()){
        token = result.field(0);
    }
    result.close();
    Database.close();
    
    return token;
};

exports.logoutACSUser = function() {
    Cloud.Users.logout(function(e) {
        if (e.success) {
            Ti.API.info("ACS User logged out successfully");
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : "There was a problem disabling push notifications. You may still receive push notifications even though you are logged out."
            });
           
            dialog.show();
           
            Utils.sendErrorReport('onACSLogout ' + JSON.stringify(e));
        }
    });
};