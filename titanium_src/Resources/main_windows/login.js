/* jslint eqeq: true, plusplus: true */
/* global Omadi */

var Display = require('lib/Display');
var Utils = require('lib/Utils');
var RDNGeofenceListener = require('services/RDNGeofenceListener');
var Service = require('lib/Service');

Service.initActivityId();

Display.setCurrentWindow(Ti.UI.currentWindow, 'login');

// this sets the background color of every
Ti.UI.currentWindow.setBackgroundColor('#eee');

//Common used functions
Ti.include('/lib/functions.js');
Ti.include('/main_windows/ios_geolocation.js');


Ti.API.info("Starting App.");

var iOSGPS, scrollView, scrollPositionY = 0, portal;

var uploadBytesLeft = 0;
var mainMenuWindow;
var uploadView, uploadLabel;

var uploadAnimation = Ti.UI.createAnimation();

var ImageFactory;

if (Ti.App.isIOS) {
    Ti.include('/lib/iOS/backgroundLocation.js');
    ImageFactory = require('ti.imagefactory');
}

function clearCache() {"use strict";
    var path, cookies;

    path = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDirectory).getParent();
    cookies = Ti.Filesystem.getFile(path + '/Library/Cookies', 'Cookies.binarycookies');
    if (cookies.exists()) {
        cookies.deleteFile();
    }

}

function setProperties(domainName, jsonString) {"use strict";
    /*jslint regexp:true*/
    
    Ti.App.Properties.setString("domainName", domainName);
    Ti.App.Properties.setString('Omadi_session_details', jsonString);
}

function startGPSService() {"use strict";
    var start, loginJson;
    /*global iOSStartGPS*/
    
    try{
        start = true;
        
        loginJson = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        if(typeof loginJson.gps_track !== 'undefined'){
            start = loginJson.gps_track;
        }
        
        Ti.API.debug("loginjson: " + JSON.stringify(loginJson));
        
        // Only start the GPS service if not denied from the session return values
        if(start){
            if (Ti.App.isIOS) {
                iOSStartGPS();
            }
            else {
                Omadi.background.android.startGPSService();
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in startGPSService: " + ex);
    }
}

function createAndroidNotifications() {"use strict";
    var intent, intent2, registerState, registerCreate, registerStart, registerPause, activity, ostate;

    if (Ti.App.isAndroid) {
        intent = Titanium.Android.createServiceIntent({
            url : 'android_gps_event.js'
        });
        Titanium.Android.stopService(intent);

        intent2 = Titanium.Android.createServiceIntent({
            url : 'android_gps_upload.js'
        });
        Titanium.Android.stopService(intent2);

        
        ostate = null;
        //MANAGE APP LIFECYCLE
        registerState = function(state) {
            ostate = state;
        };

        registerCreate = function() {
            ostate = "create";
        };

        registerStart = function() {
            if (ostate == "create") {
                ostate = "created";
            }
            else {
                ostate = "start";
            }
        };

        registerPause = function() {
            ostate = "pause";
        };

        activity = Ti.Android.currentActivity;
        activity.addEventListener('create', registerCreate);
        activity.addEventListener('start', registerStart);
        activity.addEventListener('pause', registerPause);

        activity.addEventListener('destroy', function() {
            Omadi.display.removeNotifications();
        });
    }
}

function scrollBoxesToTop() {"use strict";
    if (Ti.Platform.osname !== 'ipad') {
        if (portal && scrollView) {
        	scrollView.scrollTo(0, portal.rect.y + scrollView.rect.y - (Ti.App.isIOS7 ? 30 : 10));
        }
    }
}

function setClientAccount(domainName, db){"use strict";
    /*jslint regexp: true*/
    var clientAccount, matches;
   
    clientAccount = '';
    matches = domainName.match(/https:\/\/(.+?)\.omadi\.com/);
    
    if(matches.length){
        clientAccount = matches[1];
    }
    
    db.execute("UPDATE history SET client_account='" + Utils.dbEsc(clientAccount) + "' WHERE id_hist=1");
}

function showUploadStatusHandler(){"use strict";
    if(Ti.App.isIOS7){
        scrollView.top = 20;
    }
    else{
        scrollView.top = 0;   
    }
    
    uploadView.show();
}

function hideUploadStatusHandler(){"use strict";
    if(Ti.App.isIOS7){
        scrollView.top = -20;
    }
    else{
        scrollView.top = -40;   
    }
    
    uploadView.hide();
}

function setFilesLeftLabel(filesLeft){"use strict";
    if(Service.doBackgroundUploads){
        uploadLabel.setText("Uploading files. " + filesLeft + " to go...");
    }
    else{
        uploadLabel.setText("Please login to continue file uploads.");
    }
}

function setBytesLeftLabel(bytesLeft){"use strict";
    
    if(Service.doBackgroundUploads){
        uploadLabel.setText("Uploading files. " + Omadi.utils.formatMegaBytes(bytesLeft) + "MB to go.");
    }
    else{
        uploadLabel.setText("Please login to continue file uploads.");
    }
}

function bytesStreamedLogin(e){"use strict";
    var bytesLeft = uploadBytesLeft - e.bytesStreamed;
    
    setBytesLeftLabel(bytesLeft);
}

function updateUploadBytes(){"use strict";
    var db, result, http, cookies, i, numFilesLeft;
    
    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT filesize, bytes_uploaded FROM _files WHERE nid > 0 AND finished = 0");
    uploadBytesLeft = 0;
    numFilesLeft = 0;
    
    while(result.isValidRow()){
        uploadBytesLeft += (result.fieldByName('filesize', Ti.Database.FIELD_TYPE_INT) - result.fieldByName('bytes_uploaded', Ti.Database.FIELD_TYPE_INT));
        numFilesLeft ++;
        result.next();
    }
    
    db.close();
    
    Ti.API.debug("BYTES LEFT: " + uploadBytesLeft);
    
    if(Ti.App.isAndroid){
        setFilesLeftLabel(numFilesLeft);
    }
    else{
        setBytesLeftLabel(uploadBytesLeft);
    }
    
    if(uploadBytesLeft == 0){
        // Stop the upload checks as there is nothing left to upload
        if(typeof Ti.App.backgroundPhotoUploadCheck !== 'undefined'){
            clearInterval(Ti.App.backgroundPhotoUploadCheck);
        }
        
        if(scrollView.top >= 0){
            uploadAnimation.duration = 1000;
            if(Ti.App.isIOS7){
                uploadAnimation.top = -20;
            }
            else{
                uploadAnimation.top = -40;   
            }
            
            uploadView.hide();
            
            uploadAnimation.addEventListener('complete', hideUploadStatusHandler);
            
            scrollView.animate(uploadAnimation);
        }
        
        Ti.App.removeEventListener('bytesStreamed', bytesStreamedLogin);
        
        cookies = [];
        db = Omadi.utils.openListDatabase();
        result = db.execute("SELECT token FROM background_files");
        if(result.isValidRow()){
            cookies.push(result.fieldByName('token'));
        }
        db.close();
        
        for(i = 0; i < cookies.length; i ++){
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 15000
            });
            
            http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/sync/logout.json');
            
            http.setRequestHeader("Content-Type", "application/json");
            
            if(cookies[i] > ""){
                http.setRequestHeader("Cookie", cookies[i]);
            }
        
            http.send(); 
        }
        
        db = Omadi.utils.openListDatabase();
        db.execute("DELETE FROM background_files");
        db.close();
    }
    else{
       
        if(scrollView.top < 0){
            uploadAnimation.duration = 500;
            uploadAnimation.top = 0;
            uploadAnimation.addEventListener('complete', showUploadStatusHandler);
            
            uploadView.show();
            
            scrollView.animate(uploadAnimation);
            
            Ti.App.removeEventListener('bytesStreamed', bytesStreamedLogin);
            Ti.App.addEventListener('bytesStreamed', bytesStreamedLogin);
        }
    }
}

function startBackgroundUploads(){"use strict";
    updateUploadBytes();
    Service.doBackgroundUploads = true;
    
    // Make sure we don't have multiple photoupload checks
    if(typeof Ti.App.backgroundPhotoUploadCheck !== 'undefined'){
        clearInterval(Ti.App.backgroundPhotoUploadCheck);
    }
    
    Ti.App.backgroundPhotoUploadCheck = setInterval(Omadi.service.uploadBackgroundFile, 60000);
    
    // Immediately try to upload the next file
    Omadi.service.uploadBackgroundFile();
}


function loggingOutLoginScreen(){"use strict";
    
    startBackgroundUploads();
}

var savedUsername = null;
var termsView;



function openMainScreen(loggedIn){"use strict";
    try{
        
        // Don't allow the upload checks anymore on the login screen
        if(typeof Ti.App.backgroundPhotoUploadCheck !== 'undefined' && Ti.App.backgroundPhotoUploadCheck !== null){
            clearInterval(Ti.App.backgroundPhotoUploadCheck);
        }
        
        Ti.App.removeEventListener('bytesStreamed', bytesStreamedLogin);
        
        // Stop uploading a background file, as the new login with invalidate the session
        Omadi.service.abortFileUpload();
        
        mainMenuWindow = Omadi.display.openMainMenuWindow({
            fromSavedCookie: loggedIn
        });
        
        // Right when the main menu window closes, check for additional files to upload
        mainMenuWindow.addEventListener('close', function(){
            updateUploadBytes();
            Omadi.service.uploadBackgroundFile(); 
        });
       
        startGPSService();
        RDNGeofenceListener.getInstance().createInitialGeofences();
    }
    catch(ex){
        Utils.sendErrorReport("Exception opening main menu screen: " + ex);
    }
}

Ti.App.addEventListener("sendUpdates", function() {"use strict";
	Service.sendUpdatesFromContext();
});

Ti.App.addEventListener("uploadFile", function(event) {"use strict";
	Service.uploadFileFromContext(event.isBackground);
});

( function() {"use strict";

		var loadNFCCollectionGame = Ti.App.Properties.getBool('loadNFCCollectionGame', true);
		if (loadNFCCollectionGame) {
			Ti.App.Properties.setBool('loadNFCCollectionGame', false);
			require('services/NFCCollectionGame');
			Ti.App.Properties.setBool('loadNFCCollectionGame', true);
		}

        var termsIAgreeLabel, termsOfServiceLabel, termsWrapper, loginButton, 
            block_i, db, result, passwordField, usernameField, version_label, 
            logo, savedPortal, domainName;

        Omadi.location.unset_GPS_uploading();
        Omadi.data.setNoFilesUploading();

        if (Ti.App.isIOS) {
            clearCache();
            iOSGPS = require('com.omadi.ios_gps');
            Ti.App.Properties.setBool('deviceHasFlash', iOSGPS.isFlashAvailableInCamera());
        }

        Ti.App.Properties.setBool('stopGPS', false);
        Ti.App.Properties.setBool('quitApp', false);
        Ti.App.Properties.setBool('insertingGPS', false);

        Omadi.data.setUpdating(false);
        
        Ti.App.removeEventListener('upload_gps_locations', Omadi.location.uploadGPSCoordinates);
        Ti.App.addEventListener('upload_gps_locations', Omadi.location.uploadGPSCoordinates);

        Ti.App.addEventListener('stop_gps', function() {

            Ti.App.Properties.setBool('stopGPS', true);

            Ti.API.info("STOP GPS EVENT CAUGHT!");

            if (Ti.App.Properties.getBool('stopGPS', false)) {

                if (Ti.App.isAndroid) {

                    Ti.API.info("in stop gps");
                    if ( typeof Ti.App.service1 !== 'undefined') {
                        setTimeout(function() {
                            if (!Omadi.utils.isLoggedIn()) {
                                try {
                                    if (Ti.App.service1.isStarted) {
                                        Ti.App.service1.stop();
                                        Ti.API.info("Stopped service 1.");
                                    }
                                    else {
                                        Ti.API.info("Service 1 was never started");
                                    }
                                }
                                catch(ex) {
                                    Ti.API.error("Could not stop service 1 or already stopped.");
                                }
                            }
                        }, 15000);
                    }
                }
            }
        });

        createAndroidNotifications();

        db = Omadi.utils.openListDatabase();
        result = db.execute('SELECT domain, username, password FROM history WHERE "id_hist"=1');
        savedUsername = result.fieldByName('username');
        savedPortal = result.fieldByName('domain');
        result.close();
        db.close();

        db = Omadi.utils.openMainDatabase();

        result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
        if (result.fieldByName('timestamp') != 0) {
            Ti.API.debug("timestamp != 0");
        }
        else {
            Ti.App.Properties.setString("timestamp_offset", 0);
        }

        result.close();
        db.close();

        version_label = Titanium.UI.createLabel({
            top : 0,
            height : 'auto',
            width : 'auto',
            right : 10,
            textAlign : 'right',
            text : Titanium.App.version,
            color : '#354350',
            font : {
                fontWeight : 'bold',
                fontSize: 14
            }
        });
        
        if(Ti.App.isIOS7){
            version_label.top = 20;
        }
        
        Ti.UI.currentWindow.add(version_label);

        if(Ti.Platform.osname === 'ipad'){
            // Get rid of the scrollview for ipad and just put all the elements on the window
            // The iPad does some stupid things with small content in a large screen
            // The logo gets hidden when in landscape mode and the keyboard is up

            scrollView = Ti.UI.createView({
               layout: 'vertical',
               width: '100%',
               top: -40,
               bottom: 0,
               left: 0,
               right: 0
            });
        }
        else{
            scrollView = Titanium.UI.createScrollView({
                showVerticalScrollIndicator : true,
                showHorizontalScrollIndicator : false,
                scrollType : 'vertical',
                width : '100%',
                top : -40,
                left : 0,
                bottom: 0,
                right: 0,
                layout : 'vertical',
                zIndex : 0
            });
            
            scrollView.addEventListener('scroll', function(e) {
                scrollPositionY = e.y;
            });
            
            Ti.App.addEventListener('loggingOut', function() {
                Ti.API.debug("logged out");
                scrollView.scrollTo(0, 0);
            });
        }
        
        Ti.App.removeEventListener('loggingOut', loggingOutLoginScreen);
        Ti.App.addEventListener('loggingOut', loggingOutLoginScreen);
        
        Ti.UI.currentWindow.add(scrollView);
        
        uploadView = Ti.UI.createView({
            width: Ti.UI.FILL,
            height: 40,
            backgroundColor: '#000'
        });
        
        uploadLabel = Ti.UI.createLabel({
            color: '#fff',
            font : {
                fontSize: 16
            },
            width: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        uploadView.add(uploadLabel);
        
        scrollView.add(uploadView);
       
        logo = Titanium.UI.createImageView({
            width : 180,
            top : 0,
            height : 180,
            image : '/images/logo.png'
        }); 
        
        scrollView.add(logo);

        portal = Titanium.UI.createTextField({
            width : 200,
            top : 0,
            height : Ti.UI.SIZE,
            hintText : 'Client Account',
            color : '#000',
            value : savedPortal,
            keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
            returnKeyType : Ti.UI.RETURNKEY_NEXT,
            softKeyboardOnFocus : (Ti.App.isAndroid) ? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS : '',
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            autocapitalization : Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
            autocorrect : false,
            backgroundColor : '#fff',
            borderRadius : 10,
            borderColor : '#999',
            borderWidth : 1,
            lastValue: savedPortal
        });
        //Adds picker to root window
        scrollView.add(portal);

        portal.addEventListener('return', function() {
            usernameField.focus();
        });
        
        portal.addEventListener('change', function(e) {
            if (e.source.lastValue != e.source.value) {
                var tempValue = "";
                if(e.source.value !== null){
                    tempValue = (e.source.value + "".toString()).replace(/[^0-9a-zA-Z_]/g, '');
                    tempValue = tempValue.toLowerCase();
                }
                
                if (tempValue != e.source.value) {
                    e.source.value = tempValue;
                    if (Ti.App.isAndroid) {
                        e.source.setSelection(e.source.value.length, e.source.value.length);
                    }
                }
                
                e.source.lastValue = e.source.value;
            }
        });

        //Text field for username
        usernameField = Titanium.UI.createTextField({
            hintText : 'Username',
            width : 200,
            top : 10,
            height : Ti.UI.SIZE,
            color : '#000',
            value : savedUsername,
            keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
            returnKeyType : Ti.UI.RETURNKEY_NEXT,
            softKeyboardOnFocus : (Ti.App.isAndroid) ? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS : '',
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            autocapitalization : Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
            autocorrect : false,
            backgroundColor : '#fff',
            borderRadius : 10,
            borderColor : '#999',
            borderWidth : 1
        });

        //Adds text field "username" to the interface
        scrollView.add(usernameField);

        passwordField = Titanium.UI.createTextField({
            hintText : 'Password',
            color : '#000',
            width : 200,
            height : Ti.UI.SIZE,
            top : 10,
            passwordMask : true,
            keyboardType : Titanium.UI.KEYBOARD_DEFAULT,
            returnKeyType : Ti.UI.RETURNKEY_DONE,
            softKeyboardOnFocus : (Ti.App.isAndroid) ? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS : '',
            borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
            autocapitalization : Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
            autocorrect : false,
            backgroundColor : '#fff',
            borderRadius : 10,
            borderColor : '#999',
            borderWidth : 1
        });

        scrollView.add(passwordField);

        usernameField.addEventListener('return', function() {
            passwordField.focus();
        });

        portal.addEventListener('focus', function() {
            scrollBoxesToTop();
            portal.backgroundColor = '#def';
        });
        
        portal.addEventListener('blur', function() {
            portal.backgroundColor = '#fff';
        });

        usernameField.addEventListener('focus', function() {
            scrollBoxesToTop();
            usernameField.backgroundColor = '#def';
        });
        
        usernameField.addEventListener('blur', function() {
            usernameField.backgroundColor = '#fff';
        });

        passwordField.addEventListener('focus', function() {
            scrollBoxesToTop();
            passwordField.backgroundColor = '#def';
        });
        
        passwordField.addEventListener('blur', function() {
            passwordField.backgroundColor = '#fff';
        });

        Ti.UI.currentWindow.addEventListener('focus', function() {
            passwordField.value = "";
        });
        
        var agreedToTerms = false;
        if(savedUsername && savedUsername.length > 1){
            agreedToTerms = true;
        }
        termsView = Ti.UI.createView({
            width : 24,
            height : 24,
            borderRadius : 5,
            borderWidth : 1,
            selected : agreedToTerms,
            borderColor : '#495A8B',
            backgroundColor : '#FFF'
        });
        
        if(agreedToTerms){
            termsView.backgroundImage = '/images/selected_test.png';
        }
        
        // Deselect the agree to terms if it's not the same user as the last user logged in
        usernameField.addEventListener('change', function(e){
            if(savedUsername == e.value){
                termsView.selected = true;
                termsView.backgroundImage = '/images/selected_test.png';
            }
            else{
                termsView.selected = false;
                termsView.backgroundImage = null;
            }
        });

        termsIAgreeLabel = Ti.UI.createLabel({
            text : 'I agree to the',
            color : '#666',
            height : 30,
            font : {
                fontSize : 13
            },
            left : 10,
            width : Ti.UI.SIZE
        });

        termsOfServiceLabel = Ti.UI.createLabel({
            text : ' Terms of Service',
            color : '#495A8B',
            font : {
                fontSize : 13
            },
            height : 30,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            width : Ti.UI.SIZE,
            right : 0
        });

        termsWrapper = Ti.UI.createView({
            layout : 'horizontal',
            height : 27,
            top : 15,
            width : Ti.UI.SIZE
        });
        
        termsView.addEventListener('click', function(e) {
            if (e.source.selected === false) {
                e.source.selected = true;
                e.source.backgroundImage = '/images/selected_test.png';
            }
            else {
                e.source.selected = false;
                e.source.backgroundImage = null;
            }
        });

        termsIAgreeLabel.addEventListener('click', function() {
            if (termsView.selected === false) {
                termsView.selected = true;
                termsView.backgroundImage = '/images/selected_test.png';
            }
            else {
                termsView.selected = false;
                termsView.backgroundImage = null;
            }
        });

        termsOfServiceLabel.addEventListener('click', function() {
            Omadi.display.openTermsOfService();
        });

        termsWrapper.add(termsView);
        termsWrapper.add(termsIAgreeLabel);
        termsWrapper.add(termsOfServiceLabel);
        scrollView.add(termsWrapper);

        loginButton = Titanium.UI.createButton({
            title : 'Log In',
            width : 200,
            height : Ti.UI.SIZE,
            top : 15,
            style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
            backgroundGradient : {
                type : 'linear',
                startPoint : {
                    x : '50%',
                    y : '0%'
                },
                endPoint : {
                    x : '50%',
                    y : '100%'
                },
                colors : [{
                    color : '#2BC4F3',
                    offset : 0.0
                }, {
                    color : '#00AEEE',
                    offset : 0.3
                }, {
                    color : '#0095DA',
                    offset : 1.0
                }]
            },
            color : '#fff',
            font : {
                fontWeight : 'bold',
                fontSize : 20,
                fontFamily : 'Arial'
            },
            borderRadius : 10,
            borderWidth: 1,
            borderColor: '#666'
        });

        //Adds button to the interface
        scrollView.add(loginButton);

        block_i = Ti.UI.createView({
            top : 20,
            height : 50
        });
        scrollView.add(block_i);

        loginButton.addEventListener('click', function() {
            try{
                //Onblur the text fields, remove keyboard from screen
                portal.blur();
                passwordField.blur();
                usernameField.blur();
    
                portal.setValue(portal.getValue().toString().toLowerCase());
    
                if (!Ti.Network.online) {
                    alert("You do not have a network connection. You cannot login until you connect to the Internet.");
                }
                else if (portal.value == "") {
                    alert("You must enter a valid client account in the top box.");
                }
                else if (usernameField.value == "") {
                    alert("A valid username is required.");
                }
                else if (passwordField.value == "") {
                    alert("A valid password is required.");
                }
                else if (termsView.selected === false) {
                    alert("You must to agree to the Terms of Service before using the app.");
                }
                else {
    
                    Omadi.display.loading("Logging you in...");
                    //Create internet connection
                    var xhr = Ti.Network.createHTTPClient({
                        enableKeepAlive: false,
                        validatesSecureCertificate: false,
                        timeout: 10000
                    });
    
                    xhr.open('POST', 'https://' + portal.value + '.omadi.com/js-sync/sync/login.json');
                    xhr.setRequestHeader("Content-Type", "application/json");
    
                    // When infos are retrieved:
                    xhr.onload = function() {
                        var db_list, list_result, cookie;
                        try{
                            db_list = Omadi.utils.openListDatabase();
        
                            list_result = db_list.execute("SELECT domain FROM domains WHERE domain='" + Utils.dbEsc(portal.value) + "'");
        
                            if (list_result.rowCount > 0) {
                                //Exists
                                Ti.API.info('database exists');
                            }
                            else {
                                //Create another database
                                Ti.API.info('database does not exist, creating a new one');
                                db_list.execute("INSERT INTO domains (domain, db_name) VALUES ('" + Utils.dbEsc(portal.value) + "','" + Utils.dbEsc(Omadi.utils.getUserDBName(portal.value, usernameField.value)) + "')");
                            }
        
                            list_result.close();
        
                            db_list.execute("UPDATE history SET domain = '" + Utils.dbEsc(portal.value) + "', username = '" + Utils.dbEsc(usernameField.value) + "', db_name='" + Utils.dbEsc("db_" + portal.value + '_' + usernameField.value) + "' WHERE id_hist=1");
        
                            //Passes parameter to the second window:
                            domainName = 'https://' + portal.value + '.omadi.com';
                            Ti.App.DOMAIN_NAME = domainName;
        
                            setProperties(domainName, this.responseText);
                            
                            setClientAccount(domainName, db_list);
                            
                            cookie = this.getResponseHeader('Set-Cookie');
                            Utils.setCookie(cookie);
        
                            list_result = db_list.execute('SELECT COUNT(*) AS count FROM login WHERE id_log=1');
                            if (list_result.fieldByName('count') > 0) {
                                db_list.execute("UPDATE login SET picked = '" + Utils.dbEsc(domainName) + "', login_json = '" + Utils.dbEsc(Ti.Utils.base64encode(this.responseText)) + "', is_logged = 'true', cookie = '" + Utils.dbEsc(cookie) + "', logged_time = '" + Omadi.utils.getUTCTimestamp() + "' WHERE id_log=1");
                            } else {
                                db_list.execute("INSERT INTO login SET picked = '" + Utils.dbEsc(domainName) + "', login_json = '" + Utils.dbEsc(Ti.Utils.base64encode(this.responseText)) + "', is_logged = 'true', cookie = '" + Utils.dbEsc(cookie) + "', logged_time = '" + Omadi.utils.getUTCTimestamp() + "', id_log=1");
                            }
                            
                            // Get rid of any background uploads as the cookie is updated
                            db_list.execute("DELETE FROM background_files WHERE client_account='" + Utils.dbEsc(portal.value) + "' AND username = '" + Utils.dbEsc(usernameField.value) + "'");
        
                            db_list.close();
                            passwordField.value = "";
                            
                            Omadi.display.doneLoading();
                            openMainScreen(false);
                        }
                        catch(ex){
                            Utils.sendErrorReport("Exception in onload callback in login: " + ex);
                        }
                    };
    
                    //If username and pass wrong:
                    xhr.onerror = function(e) {
                        try{
                            Omadi.display.doneLoading();
        
                            if(!Ti.Network.online){
                                alert("You do not have a connection to the Internet. Please connect and try again.");
                            }
                            else if (this.status == 401 || this.status == 404) {
                                alert("Make sure client account, username and password are correct.");
                            }
                            else if(this.error && this.error.indexOf("imeout") !== -1){
                                alert("There was a network error. Make sure you're connected to the Internet.");
                            }
                            else {
                                alert("There was a problem logging you in. Please try again. Details: " + e.error);
                                Utils.sendErrorReport("Error logging in: " + e.error);
                            }
                        }
                        catch(ex){
                            Utils.sendErrorReport("Exception in onerror handler in login: " + ex);
                        }
                    };
                    
                    xhr.send(JSON.stringify({
                        username : usernameField.value,
                        password : passwordField.value,
                        device_id : Ti.Platform.getId(),
                        app_version : Ti.App.version,
                        device_data : {
                            model : Ti.Platform.model,
                            version : Ti.Platform.version,
                            architecture : Ti.Platform.architecture,
                            platform : Ti.Platform.name,
                            os_type : Ti.Platform.ostype,
                            screen_density : Ti.Platform.displayCaps.density,
                            primary_language : Ti.Platform.locale,
                            processor_count : Ti.Platform.processorCount
                        }
                    }));
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception with login button clicked: " + ex);
            }
        });

        Ti.UI.currentWindow.addEventListener('android:back', function() {
            var dialog;
            try{
                if(Omadi.data.getNumFilesReadyToUpload() > 0){
                    dialog = Ti.UI.createAlertDialog({
                        title: 'Please Wait for Upload',
                        message: 'Files must upload before exiting the application. If you must close it now, please force stop the application in the Android Application Manager.',
                        buttonNames: ['OK', 'Close Anyway']
                    });  
                    
                    dialog.addEventListener('click', function(e){
                        var dialog2;
                        if(e.index == 1){
                            dialog2 = Ti.UI.createAlertDialog({
                                title: 'Nope',
                                message: 'No can do. Go to the Android Settings app, find the Application Manager, select the Omadi app, and press the "Force Close" button.',
                                buttonNames: ['OK'] 
                            }).show();
                        }
                    });
                    
                    dialog.show();
                }
                else{
                    Ti.UI.currentWindow.close();    
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception in android back in login screen: " + ex);
                Ti.UI.currentWindow.close();
            }
        });

        Ti.App.Properties.removeProperty('logStatus');

        if (Omadi.utils.isLoggedIn() === true) {
            //Already logged in
            try{
                Ti.App.Properties.setBool("sessionRefreshed", false);
                Omadi.service.refreshSession();
            
                db = Omadi.utils.openListDatabase();
                result = db.execute('SELECT * FROM login WHERE "id_log"=1');
                domainName = result.fieldByName("picked");
                Ti.App.DOMAIN_NAME = domainName;
                
                setProperties(domainName, Ti.Utils.base64decode(result.fieldByName("login_json")));
                setClientAccount(domainName, db);
                
                // Get rid of any background uploads as the cookie is updated
                db.execute("DELETE FROM background_files WHERE client_account='" + Utils.dbEsc(portal.value) + "' AND username = '" + Utils.dbEsc(usernameField.value) + "'");
                db.close();
                
                openMainScreen(true);
            }
            catch(ex){
                Utils.sendErrorReport("Exception getting to main screen already logged in: " + ex);
            }
        }
        else{
            startBackgroundUploads();
        }
        
        // closeApp is fired in case memory is getting low and a restart is necessary
        // TODO: plug all the memory leaks and conserve memory better
        Ti.App.addEventListener('closeApp', function(){
            Ti.UI.currentWindow.close();
        });
        
        Ti.App.addEventListener('photoUploaded', function(){
            if(!Omadi.utils.isLoggedIn()){
                Ti.API.debug("Photo was just uploaded: login");
                
                updateUploadBytes();
            } 
        });
        
    }());

