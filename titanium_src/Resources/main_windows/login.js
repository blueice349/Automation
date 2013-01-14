/*jslint eqeq: true, plusplus: true*/
/*global Omadi, dbEsc*/

// this sets the background color of every
Ti.UI.currentWindow.setBackgroundColor('#eee');
Ti.UI.currentWindow.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);

//Common used functions
Ti.include('/lib/encoder_base_64.js');
Ti.include('/lib/functions.js');
Ti.include('/main_windows/ios_geolocation.js');

Ti.API.info("Starting App.");

var iOSGPS, scrollView, scrollPositionY = 0, portal;

function setProperties(domainName, jsonString) {"use strict";

    Ti.App.Properties.setString("domainName", domainName);
    Ti.App.Properties.setString('Omadi_session_details', jsonString);
}

function is_first_time() {"use strict";
    var db, result, retval;

    db = Omadi.utils.openMainDatabase();

    result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');

    if (result.fieldByName('timestamp') != 0) {
        retval = false;
    }
    else {
        retval = true;
    }

    result.close();
    db.close();

    return retval;
}

function startGPSService() {"use strict";
    var intent, intent2;
    /*global iOSStartGPS, createNotification*/

    if (Ti.App.isIOS) {
        iOSStartGPS();
    }
    else {

        Ti.API.info("Starting Android services.");

        Ti.App.Properties.setBool('stopGPS', false);

        //movement.startGPSTracking();

        //Initialize the GPS background service
        intent = Titanium.Android.createServiceIntent({
            url : 'android_gps_event.js'
        });

        intent.putExtra('interval', 5000);

        //intent.putExtra('interval', 5000);
        Ti.App.service1 = Titanium.Android.createService(intent);

        Ti.App.service1.start();
        Ti.App.service1.isStarted = true;

        //Ti.App.Properties.setObject('AndroidGPSService1', service);

        intent2 = Titanium.Android.createServiceIntent({
            url : 'android_gps_upload.js'
        });

        intent2.putExtra('interval', 120000);

        Ti.App.service2 = Titanium.Android.createService(intent2);
        Ti.App.service2.isStarted = false;

        // Start the GPS upload 30 seconds after the program starts
        setTimeout(function() {
            if (!Ti.App.Properties.getBool('stopGPS', false)) {
                Ti.App.service2.start();
                Ti.App.service2.isStarted = true;
            }
            //Ti.App.Properties.setObject('AndroidGPSService2', service2);
        }, 30000);

        createNotification("No coordinates uploaded so far");

        //Titanium.Android.startService(intent);
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
            //createNotification("Create event called ...");
        };

        registerStart = function() {
            if (ostate == "create") {
                ostate = "created";
                //createNotification("First run event called ...");
            }
            else {
                ostate = "start";
                //createNotification("Start event called ...");
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

        activity.addEventListener('stop', function() {
            //createNotification("Stop event called ...");
        });

        //createNotification("No coordinates uploaded so far");
    }
}

function scrollBoxesToTop() {"use strict";
    var calculatedTop;

    if (Ti.Platform.osname !== 'ipad') {
        if ( typeof scrollView !== 'undefined') {
            calculatedTop = portal.convertPointToView({
                x : 0,
                y : 0
            }, scrollView);
            scrollView.scrollTo(0, calculatedTop.y + scrollPositionY - 10);
        }
    }
}

( function() {"use strict";

        var termsView, termsIAgreeLabel, termsOfServiceLabel, termsWrapper, loginButton, 
            block_i, db, result, passwordField, usernameField, version_label, 
            logo, savedPortal, savedUsername, domainName, elements, i;
        /*global clearCache*/

        Omadi.location.unset_GPS_uploading();

        if (Ti.App.isIOS) {
            clearCache();
            iOSGPS = require('com.omadi.ios_gps');
            Ti.App.Properties.setBool('deviceHasFlash', iOSGPS.isFlashAvailableInCamera());
        }

        Ti.App.Properties.setBool('stopGPS', false);
        Ti.App.Properties.setBool('quitApp', false);

        Omadi.data.setUpdating(false);

        Ti.App.addEventListener('upload_gps_locations', function(e) {
            Omadi.location.uploadGPSCoordinates();
        });

        Ti.App.addEventListener('stop_gps', function(e) {

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

                    if ( typeof Ti.App.service2 !== 'undefined') {
                        try {
                            if (Ti.App.service2.isStarted) {
                                Ti.App.service2.stop();
                                Ti.API.info("Stopped service 2.");
                            }
                            else {
                                Ti.API.info("Service 2 was never started");
                            }
                        }
                        catch(ex) {
                            Ti.API.error("Could not stop service 2 or already stopped.");
                        }
                    }

                    // try {
                    // movement.stopGPSTracking();
                    // }
                    // catch(ex2) {
                    // Ti.API.error("Exception caught when stopping gps: " + ex2);
                    // }
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

        //var locked_field = true;
        db = Omadi.utils.openMainDatabase();

        result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
        if (result.fieldByName('timestamp') != 0) {
            //  locked_field = false;
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
                fontWeight : 'bold'
            }
        });
        Ti.UI.currentWindow.add(version_label);

        if(Ti.Platform.osname === 'ipad'){
            // Get rid of the scrollview for ipad and just put all the elements on the window
            // The iPad does some stupid things with small content in a large screen
            // The logo gets hidden when in landscape mode and the keyboard is up

            scrollView = Ti.UI.createView({
               layout: 'vertical',
               width: '100%',
               top: 0,
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
                top : 0,
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
        
        Ti.UI.currentWindow.add(scrollView);

        //Web site picker
        logo = Titanium.UI.createImageView({
            width : 200,
            top : 20,
            height : 114,
            image : '/images/logo.png'
        });
        //Adds picker to root window
        scrollView.add(logo);

        portal = Titanium.UI.createTextField({
            width : 200,
            top : 20,
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
            borderWidth : 1
        });
        //Adds picker to root window
        scrollView.add(portal);

        portal.addEventListener('return', function() {
            usernameField.focus();
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

        passwordField.addEventListener('return', function() {
            //loginButton.fireEvent('click');
        });

        portal.addEventListener('focus', function(e) {
            scrollBoxesToTop();
        });

        usernameField.addEventListener('focus', function(e) {
            scrollBoxesToTop();
        });

        passwordField.addEventListener('focus', function(e) {
            scrollBoxesToTop();
        });

        Ti.UI.currentWindow.addEventListener('focus', function() {
            passwordField.value = "";
        });
        
        termsView = Ti.UI.createView({
            width : 24,
            height : 24,
            borderRadius : 5,
            borderWidth : 1,
            selected : false,
            borderColor : '#495A8B',
            backgroundColor : '#FFF'
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

        termsIAgreeLabel.addEventListener('click', function(e) {
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
            var win, webView, toolbar, space, titleLabel, backButton;

            win = Ti.UI.createWindow({
                layout: 'vertical',
                navBarHidden: true
            });
            
            webView = Ti.UI.createWebView({
                url : 'https://omadi.com/terms.txt',
                height : Ti.UI.FILL
            });
            
            if(Ti.App.isAndroid){
                win.addEventListener("android:back", function(e){
                    win.close();
                });
            }
            else{
                backButton = Ti.UI.createButton({
                    title : 'Back',
                    style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
                });
                
                backButton.addEventListener('click', function() {
                    win.close();
                });
                
                space = Titanium.UI.createButton({
                    systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
                });
                
                titleLabel = Titanium.UI.createButton({
                    title : "Terms of Service",
                    color : '#fff',
                    ellipsize : true,
                    wordwrap : false,
                    width : Ti.UI.SIZE,
                    focusable : false,
                    touchEnabled : false,
                    style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
                });
            
                toolbar = Titanium.UI.iOS.createToolbar({
                    items : [backButton, space, titleLabel, space],
                    top : 0,
                    borderTop : false,
                    borderBottom : false
                });
                win.add(toolbar);
            }
            
            win.add(webView);
            win.open();
        });

        termsWrapper.add(termsView);
        termsWrapper.add(termsIAgreeLabel);
        termsWrapper.add(termsOfServiceLabel);
        scrollView.add(termsWrapper);

        loginButton = Titanium.UI.createButton({
            title : 'Log In',
            width : 200,
            height : 45,
            top : 10,
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
                    color : '#777',
                    offset : 0.0
                }, {
                    color : '#999',
                    offset : 0.3
                }, {
                    color : '#555',
                    offset : 1.0
                }]
            },
            color : '#fff',
            font : {
                fontWeight : 'bold',
                fontSize : 20,
                fontFamily : 'Arial'
            },
            borderRadius : 10
        });

        //Adds button to the interface
        scrollView.add(loginButton);

        block_i = Ti.UI.createView({
            top : 20,
            height : 50
        });
        scrollView.add(block_i);

        loginButton.addEventListener('click', function() {

            //Onblur the text fields, remove keyboard from screen
            portal.blur();
            passwordField.blur();
            usernameField.blur();

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
                var xhr = Ti.Network.createHTTPClient();
               
                xhr.setTimeout(10000);

                xhr.open('POST', 'https://' + portal.value + '.omadi.com/js-sync/sync/login.json');
                xhr.setRequestHeader("Content-Type", "application/json");

                // When infos are retrieved:
                xhr.onload = function(e) {
                    var db_list, list_result, cookie, dialog, loginJSON;

                    db_list = Omadi.utils.openListDatabase();

                    list_result = db_list.execute("SELECT domain FROM domains WHERE domain='" + dbEsc(portal.value) + "'");

                    if (list_result.rowCount > 0) {
                        //Exists
                        Ti.API.info('database exists');
                    }
                    else {
                        db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                        //Create another database
                        Ti.API.info('database does not exist, creating a new one');
                        db_list.execute("INSERT INTO domains (domain, db_name) VALUES ('" + dbEsc(portal.value) + "','" + dbEsc("db_" + portal.value + '_' + usernameField.value) + "')");
                        db_list.execute("COMMIT TRANSACTION");
                    }

                    list_result.close();

                    db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                    db_list.execute("UPDATE history SET domain = '" + dbEsc(portal.value) + "', username = '" + dbEsc(usernameField.value) + "', db_name='" + dbEsc("db_" + portal.value + '_' + usernameField.value) + "' WHERE id_hist=1");
                    db_list.execute("COMMIT TRANSACTION");

                    //Passes parameter to the second window:
                    domainName = 'https://' + portal.value + '.omadi.com';

                    setProperties(domainName, this.responseText);

                    Omadi.display.doneLoading();
                    Omadi.display.openMainMenuWindow();

                    cookie = this.getResponseHeader('Set-Cookie');

                    list_result = db_list.execute('SELECT COUNT(*) AS count FROM login WHERE id_log=1');
                    if (list_result.fieldByName('count') > 0) {
                        db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                        db_list.execute("UPDATE login SET picked = '" + dbEsc(domainName) + "', login_json = '" + dbEsc(Ti.Utils.base64encode(this.responseText)) + "', is_logged = 'true', cookie = '" + dbEsc(cookie) + "', logged_time = '" + Omadi.utils.getUTCTimestamp() + "' WHERE id_log=1");
                        db_list.execute("COMMIT TRANSACTION");
                    }
                    else {
                        db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                        db_list.execute("INSERT INTO login SET picked = '" + dbEsc(domainName) + "', login_json = '" + dbEsc(Ti.Utils.base64encode(this.responseText)) + "', is_logged = 'true', cookie = '" + dbEsc(cookie) + "', logged_time = '" + Omadi.utils.getUTCTimestamp() + "', id_log=1");
                        db_list.execute("COMMIT TRANSACTION");
                    }

                    db_list.close();
                    passwordField.value = "";

                    startGPSService();
                };

                //If username and pass wrong:
                xhr.onerror = function(e) {
                    //Ti.API.info("status is: " + this.status);
                    Omadi.display.doneLoading();

                    if (this.status == 401 || this.status == 404) {
                        //label_error.text = "Check your username and password. Then try again.";
                        alert("Make sure client account, username and password are correct.");
                    }
                    else if(this.error.indexOf("imeout") !== -1){
                        alert("There was a network error. Make sure you're connected to the Internet.");
                        //label_error.text = "Network timeout. Please try again.";
                    }
                    else {
                        alert("There was a problem logging you in. Please try again.");
                        //label_error.text = "An error has occurred. Please try again.";
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
        });

        Ti.UI.currentWindow.addEventListener('android:back', function() {
            Ti.UI.currentWindow.close();
        });

        Ti.App.Properties.removeProperty('logStatus');

        if (Omadi.utils.isLoggedIn() === true) {
            //Already logged in
            Ti.App.Properties.setBool("sessionRefreshed", false);
            Omadi.service.refreshSession();
            
            db = Omadi.utils.openListDatabase();
            result = db.execute('SELECT * FROM login WHERE "id_log"=1');
            domainName = result.fieldByName("picked");
            setProperties(domainName, Ti.Utils.base64decode(result.fieldByName("login_json")));
            db.close();

            Omadi.display.openMainMenuWindow();

            startGPSService();
        }

    }());

