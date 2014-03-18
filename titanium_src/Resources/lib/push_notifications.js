/*jslint eqeq:true*/
/*global dbEsc, alertQueue, useAlertQueue*/

Omadi.push_notifications = {};

var Cloud = require('ti.cloud');

var CloudPush;

if(Ti.App.isAndroid){
    CloudPush = require('ti.cloudpush');
}
//Cloud.debug = true;

Omadi.push_notifications.setUserDeviceToken = function(token){"use strict";
    var db = Omadi.utils.openListDatabase();
    db.execute("UPDATE history SET device_token='" + dbEsc(token) + "' WHERE id_hist=1");
    db.close();
};

Omadi.push_notifications.getUserDeviceToken = function(){"use strict";
    var db = Omadi.utils.openListDatabase(), result, token = null;
    result = db.execute("SELECT device_token FROM history WHERE id_hist=1");
    if(result.isValidRow()){
        token = result.field(0);
    }
    result.close();
    db.close();
    
    return token;
};

Omadi.push_notifications.registerAndroid = function() {"use strict";
    
    try{
    // Clear status will clear the cache and allow the switch to gcm
        //CloudPush.clearStatus();
    }
    catch(ex){
        Ti.API.error("Could not clear cloudpush status: " + ex);
        Omadi.service.sendErrorReport("Could not clear cloudpush status: " + ex);
    }
    
    CloudPush.retrieveDeviceToken({
        success: function(e){
            Omadi.push_notifications.setUserDeviceToken(e.deviceToken);
            CloudPush.focusAppOnPush = true;
            CloudPush.enabled = true;
            CloudPush.singleCallback = true;
            CloudPush.showTrayNotification = false;
            CloudPush.showTrayNotificationsWhenFocused = false;
            CloudPush.showAppOnTrayClick = false;
            
            Omadi.push_notifications.loginUser();
        },
        error: function(e){
            var dialog = Ti.UI.createAlertDialog({
                message : "There was a problem enabling push notifications."
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            //alert("There was a problem enabling push notifications.");
            Omadi.service.sendErrorReport('onAndroidRegister' + JSON.stringify(e));
        }
    });
    
    CloudPush.addEventListener('callback', Omadi.push_notifications.androidPushCallback);
};

Omadi.push_notifications.androidPushCallback = function(e){"use strict";
    var sound, dialog, payload;
    
    Ti.API.debug(JSON.stringify(e));
    
    sound = Ti.Media.createSound({
        url : Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "sounds/notificationBeep.wav"),
        volume : 1.0
    });

    sound.play();
    
    payload = JSON.parse(e.payload);
    
    if (payload.fetchUpdates == 1) {
        Omadi.service.fetchUpdates(true, true);
    }

    if (payload.showAlert == 1) {
        dialog = Ti.UI.createAlertDialog({
            message : payload.alert,
            title : payload.title
        });

        if ( typeof alertQueue !== 'undefined' && useAlertQueue) {
            alertQueue.push(dialog);
        }
        else {
            dialog.show();
        }
    }
};

Omadi.push_notifications.registeriOS = function() {"use strict";

    Titanium.Network.registerForPushNotifications({
        types : [Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT, Titanium.Network.NOTIFICATION_TYPE_SOUND],
        success : function(e) {
            Omadi.push_notifications.setUserDeviceToken(e.deviceToken);
            Omadi.push_notifications.loginUser();
        },
        error : function(e) {

            var dialog = Ti.UI.createAlertDialog({
                message : "There was a problem enabling push notifications."
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            //alert("There was a problem enabling push notifications.");
            Omadi.service.sendErrorReport('onIOSRegister' + JSON.stringify(e));
        },
        callback : function(e) {
            var sound, dialog;

            sound = Ti.Media.createSound({
                url : Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, "sounds/notificationBeep.wav"),
                volume : 1.0
            });

            sound.play();

            if (e.data.fetchUpdates == 1) {
                Omadi.service.fetchUpdates(true, true);
            }

            if (e.data.showAlert == 1) {
                dialog = Ti.UI.createAlertDialog({
                    message : e.data.alert,
                    title : e.data.title
                });

                if ( typeof alertQueue !== 'undefined' && useAlertQueue) {
                    alertQueue.push(dialog);
                }
                else {
                    dialog.show();
                }
            }
        }
    });
};

Omadi.push_notifications.getUserName = function() {"use strict";
    
    var uid = 0, clientAccount = "";
    
    try{
        uid = Omadi.utils.getUid();
        clientAccount = Omadi.utils.getClientAccount();
    }
    catch(ex){
        Omadi.service.sendErrorReport('error getting push username' + JSON.stringify(ex));
    }

    return clientAccount + '_' + uid;
};

Omadi.push_notifications.getPassword = function() {"use strict";
    var md5, password = "";
    
    try{
        md5 = Ti.Utils.md5HexDigest(Omadi.push_notifications.getUserName() + "OmadiCRMMRCidamO");
        password = md5.substring(0, 20);
    }
    catch(ex){
        Omadi.service.sendErrorReport('error getting push password' + JSON.stringify(ex));
    }

    return password;
};

Omadi.push_notifications.logoutUser = function() {"use strict";
    
    Ti.App.registeredPushListener = false;
    
    Omadi.push_notifications.unsubscribeACSPush();
    
    Cloud.Users.logout(function(e) {
        if (e.success) {
            Ti.API.info("ACS User logged out successfully");
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : "There was a problem disabling push notifications. You may still receive push notifications even though you are logged out."
            });
           
            dialog.show();
           
            Omadi.service.sendErrorReport('onACSLogout ' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.unsubscribeACSPush = function(){"use strict";
    
    if(Ti.App.isAndroid){
        CloudPush.removeEventListener('callback', Omadi.push_notifications.androidPushCallback);
    }
    
    Cloud.PushNotifications.unsubscribeToken({
        device_token: Omadi.push_notifications.getUserDeviceToken()
    }, function(e){
        if(e.success){
            Ti.API.debug("Successfully unsubscribed from push.");    
        }
        else{
            
            if(e.message == 'Subscription not found'){
                // do nothing
                Ti.API.debug("Not subscribed, so unsubscribe was not needed.");
            }
            else{
                var dialog = Ti.UI.createAlertDialog({
                    message : "There was a problem disabling push notifications. You may still receive push notifications even though you are logged out."
                });
                
                dialog.show();
                
                Omadi.service.sendErrorReport('onACSUnsubscribe ' + JSON.stringify(e));
            }
        }
    });
};

Omadi.push_notifications.setupACSPush = function() {"use strict";

    var type, userDeviceToken = Omadi.push_notifications.getUserDeviceToken();
    if(Ti.App.isAndroid){
        type = 'android';
    }
    else{
        type = 'ios';
    }
    
    Cloud.PushNotifications.subscribe({
        channel : Omadi.utils.getClientAccount(),
        device_token : userDeviceToken,
        type: type
    }, function(e) {
        if (e.success) {
            Ti.API.info("ACS Push notification subscription successful");
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                title : 'Push Notifications',
                message : 'There was a problem setting up push notifications. Please try again by logging back in.',
                buttonNames: ['Ok']
            });
            
            if ( typeof alertQueue !== 'undefined' && useAlertQueue) {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }

            Omadi.service.sendErrorReport('onACSSubscribe' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.loginUser = function() {"use strict";
    
    Cloud.Users.login({
        login : Omadi.push_notifications.getUserName(),
        password : Omadi.push_notifications.getPassword()
    }, function(e) {
        if (e.success) {
            Ti.API.info("User logged into ACS successfully");
            Omadi.push_notifications.setupACSPush();

            if (Omadi.push_notifications.needToLinkUser()) {
                Omadi.push_notifications.linkACSUserId();
            }
        }
        else {
            if (e.code == 401) {
                Omadi.push_notifications.createUser();
            }
            else {
                var dialog = Ti.UI.createAlertDialog({
                    title: 'Error Starting Push Notifications',
                    message : 'There was a problem setting up push notifications. Do you want to retry?',
                    buttonNames: ['Yes', 'No', 'Cancel'],
                    cancel: 2
                });
                
                dialog.addEventListener('click', function(e){
                    try{
                        if(e.index == 0){
                            Omadi.push_notifications.init();
                        }
                    }
                    catch(ex){
                        Omadi.service.sendErrorReport("exception in second try init push notifications: " + ex);
                    }
                });
                
                if ( typeof alertQueue !== 'undefined') {
                    alertQueue.push(dialog);
                }
                else {
                    dialog.show();
                }

                Omadi.service.sendErrorReport('onACSLoginUser' + JSON.stringify(e));
            }
        }
    });
};

Omadi.push_notifications.createUser = function() {"use strict";

    Cloud.Users.create({
        username : Omadi.push_notifications.getUserName(),
        password : Omadi.push_notifications.getPassword(),
        password_confirmation : Omadi.push_notifications.getPassword()
    }, function(e) {

        if (e.success) {
            Ti.API.info("ACS User created successfully");
            Omadi.push_notifications.setupACSPush();
            Omadi.push_notifications.linkACSUserId();
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : 'There was a problem setting up push notifications. Please try again by logging back in.'
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            Omadi.service.sendErrorReport('onACSCreateUser' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.init = function() {"use strict";
    
    if(Ti.App.isAndroid){
        Omadi.push_notifications.registerAndroid();
    }
    else {
        
        Omadi.push_notifications.registeriOS();
    }
};

Omadi.push_notifications.needToLinkUser = function() {"use strict";
    var retval, loginJson;
    
    retval = false;
    try{
        loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        if ( typeof loginJson.user.acs_user_id === 'undefined' || loginJson.user.acs_user_id == null || loginJson.user.acs_user_id == '') {
            retval = true;
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in needtolinkuser: " + ex);
    }
    
    return retval;
};

Omadi.push_notifications.linkACSUserId = function() {"use strict";

    Cloud.Users.showMe(function(e) {

        //alert(JSON.stringify(e));
        if (e.success) {
            if ( typeof e.users !== 'undefined' && typeof e.users[0] !== 'undefined' && typeof e.users[0].id !== 'undefined') {
                Omadi.push_notifications.sendACSUserId(e.users[0].id);
            }
        }
        else {
            var dialog = Ti.UI.createAlertDialog({
                message : 'There was a problem setting up push notifications. Please try again by logging back in.'
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            Omadi.service.sendErrorReport('onACSShowMe' + JSON.stringify(e));
        }
    });
};

Omadi.push_notifications.sendACSUserId = function(acsUserID) {"use strict";

    var http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false
    });
    http.setTimeout(15000);
    http.open('POST', Omadi.DOMAIN_NAME + '/js-notifications/push_notifications.json');

    http.setRequestHeader("Content-Type", "application/json");
    Omadi.utils.setCookieHeader(http);

    http.onload = function(e) {

    };

    http.onerror = function(e) {
        try{
            var dialog = Ti.UI.createAlertDialog({
                message : 'There was a problem setting up push notifications. Please try again by logging back in.'
            });
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            Omadi.service.sendErrorReport('onACSLink' + JSON.stringify(e));
        }
        catch(ex){
            Omadi.service.sendErrorReport('onACSLink Exception' + JSON.stringify(ex));
        }
    };

    http.send(JSON.stringify({
        acs_user_id : acsUserID
    }));
};

