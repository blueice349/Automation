/*jslint eqeq: true*/
/*global Omadi,PLATFORM*/

// this sets the background color of every
Titanium.UI.setBackgroundColor('#EEEEEE');

//Common used functions
Ti.include('/lib/encoder_base_64.js');
Ti.include('/lib/functions.js');
Ti.include('/main_windows/ios_geolocation.js');

Ti.API.info("Starting App.");

var iOSGPS, scrollView, scrollPositionY = 0, portal;

function setProperties(domainName, jsonString) {"use strict";
    var json;
    
    Ti.App.Properties.setString("domainName", domainName);
    Ti.App.Properties.setString('Omadi_session_details', jsonString);
    
    json = JSON.parse(jsonString);
    Ti.App.Properties.setString('Omadi_time_format', (json.user.time_format != null && json.user.time_format != "") ? json.user.time_format : 'g:iA');
}

function openMainMenu() {"use strict";

    var newWin = Titanium.UI.createWindow({
        fullscreen : false,
        title : 'Omadi CRM',
        url : 'main_windows/mainMenu.js',
        navBarHidden : true,
        zIndex : 100
    });

    newWin.open();
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
   

    if (PLATFORM != "android") {
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

        //intent.putExtra('interval', 5000);

        intent.putExtra('interval', 5000);
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

function createAndroidNotifications(){"use strict";
    var intent, intent2, registerState, registerCreate, registerStart, registerPause, activity, ostate;
    
    if (PLATFORM === "android") {
        intent = Titanium.Android.createServiceIntent({
            url : 'android_gps_event.js'
        });
        Titanium.Android.stopService(intent);
    
        intent2 = Titanium.Android.createServiceIntent({
            url : 'android_gps_upload.js'
        });
        Titanium.Android.stopService(intent2);
    
        //createNotification("Omadi is running ...");
        ostate = null;
        //MANAGE APP LIFECYCLE
        registerState = function(state) {
            if (ostate == "start" && state == "pause") {
                //BLANK SCREEN!!!
                Ti.API.error('BLANK SCREEN');
                alert('BLANK SCREEN');
            }
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
            if (ostate == "start") {
                //BLANK SCREEN!!!
                Ti.API.error('BLANK SCREEN');
                alert('BLANK SCREEN');
                //createNotification("BLANK SCREEN ...");
                //Omadi.display.removeNotifications();
            }
            
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

function scrollBoxesToTop(){"use strict";
    var calculatedTop;
    
    if (Ti.Platform.osname !== 'ipad') {
        if(typeof scrollView !== 'undefined'){
            calculatedTop = portal.convertPointToView({x:0,y:0}, scrollView);
            scrollView.scrollTo(0, calculatedTop.y + scrollPositionY - 10);
        }
    }
}

(function(){"use strict";
    
    var termsView, termsIAgreeLabel, termsOfServiceLabel, underlineView, termsWrapper, loginButton, block_i, db, result, 
        label_error, messageView, passwordField, usernameField, version_label, logo, savedPortal, 
        savedUsername, loginWin, domainName;
    /*global clearCache*/
    
    
    
    Omadi.location.unset_GPS_uploading();
    
    if (PLATFORM !== 'android') {
        clearCache();
        iOSGPS = require('com.omadi.ios_gps');
        Ti.App.Properties.setBool('deviceHasFlash', iOSGPS.isFlashAvailableInCamera());
    }
    
    loginWin = Titanium.UI.createWindow({
        title : 'Omadi CRM',
        fullscreen : false,
        zIndex : -100,
        backgroundColor : '#EEEEEE',
        navBarHidden : true
    });
    
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
    
            if (PLATFORM === 'android') {
    
                Ti.API.info("in stop gps");
                if (typeof Ti.App.service1 !== 'undefined') {
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
    
                if (typeof Ti.App.service2 !== 'undefined') {
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
    loginWin.add(version_label);
    
    scrollView = Titanium.UI.createScrollView({
        contentWidth : 'auto',
        contentHeight : 'auto',
        showVerticalScrollIndicator : true,
        showHorizontalScrollIndicator : false,
        scrollType : 'vertical',
        width : '100%',
        contentOffset : {
            x : 0,
            y : 0
        },
        top : 0,
        left : 0,
        height : Ti.UI.SIZE,
        layout : 'vertical',
        zIndex : 0
    });
    loginWin.add(scrollView);
    
    //Web site picker
    logo = Titanium.UI.createImageView({
        width : 200,
        top : 25,
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
        softKeyboardOnFocus : (PLATFORM == 'android') ? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS : '',
        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization : Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect : false,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#999',
        borderWidth: 1
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
        softKeyboardOnFocus : (PLATFORM == 'android') ? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS : '',
        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization : Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect : false,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#999',
        borderWidth: 1
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
        softKeyboardOnFocus : (PLATFORM == 'android') ? Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS : '',
        borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization : Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect : false,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#999',
        borderWidth: 1
    });
    
    scrollView.add(passwordField);
    
    
    scrollView.addEventListener('scroll', function(e){
        scrollPositionY = e.y;
    });
    
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
    

    loginWin.addEventListener('focus', function() {
        var db, result, new_color;
        
        db = Omadi.utils.openMainDatabase();
        result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
    
        new_color = "#000000";
        if (result.fieldByName('timestamp') != 0) {
            //  locked_field = false;
            new_color = "#999999";
            termsView.selected = true;
            termsView.backgroundImage = '/images/selected_test.png';
        }
        else {
            termsView.selected = false;
            termsView.backgroundImage = null;
        }
    
        result.close();
        db.close();
    
        portal.color = new_color;
        usernameField.color = new_color;
        passwordField.value = "";
    
        //iOS only
        if (PLATFORM != 'android') {
            scrollView.setContentOffset({
                x : scrollView.getContentOffset().x,
                y : 25
            }, {
                animated : true
            });
        }
    });
    
    messageView = Titanium.UI.createView({
        bottom : 0,
        height : Ti.UI.SIZE,
        width : '100%',
        borderRadius : 0,
        backgroundGradient : {
            type : 'linear',
            colors : [{
                color : '#FFF',
                offset : 0.0
            }, {
                color : '#AAA',
                offset : 1.0
            }],
            startPoint : {
                x : 0,
                y : 0
            },
            endPoint : {
                x : 0,
                y : 100
            },
            backFillStart : false
        }
    });

    //Decides wether logStatus is set or not
    // If it is set, print: Inform your credentials
    // Otherwise, print the content of logStatus
    if ((Ti.App.Properties.getString('logStatus') == null) || (Ti.App.Properties.getString('logStatus') == "")) {
        label_error = Titanium.UI.createLabel({
            color : '#4B5C8C',
            //text:'Please login - Version '+Titanium.App.version,
            text : 'Please login',
            font : {
                fontWeight : 'bold'
            },
            height : 'auto',
            width : 'auto',
            textAlign : 'center'
        });
    }
    else {
        label_error = Titanium.UI.createLabel({
            color : '#4B5C8C',
            font : {
                fontWeight : 'bold'
            },
            text : Ti.App.Properties.getString('logStatus'),
            height : 'auto',
            width : 'auto',
            textAlign : 'center'
        });
    }
    label_error.backgroundColor = "transparent";
    // Adds label_error to the messageView
    messageView.add(label_error);
    
    //Adds messageView to root window
    loginWin.add(messageView);

    
    if (Ti.Platform.osname == 'ipad') {
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
            color : '#495A8B',
            left : 5,
            height : 30,
            font : {
                fontSize : 14
            },
            width : 85
        });
    
        termsOfServiceLabel = Ti.UI.createLabel({
            text : ' Terms of Service',
            color : '#495A8B',
            font : {
                fontSize : 14
            },
            height : 30,
            width : 120
        });
    
        underlineView = Ti.UI.createView({
            height : 1,
            backgroundColor : '#495A8B',
            width : 109,
            left : 370
        });
    
        termsWrapper = Ti.UI.createView({
            layout : 'horizontal',
            height : 30,
            top : 15,
            width : Ti.UI.SIZE,
            left : '33%',
            right : '33%'
        });
    
    }
    else {
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
            left: 10,
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
            right: 0
        });
    
        underlineView = Ti.UI.createView({
            height : 1,
            backgroundColor : '#495A8B',
            width : 0,
            visible: false
        });
    
        termsWrapper = Ti.UI.createView({
            layout : 'horizontal',
            height : 26,
            top : 15,
            width : Ti.UI.SIZE
        });
    
    }
    
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
        var win, webView, backButton;
        
        win = Ti.UI.createWindow();
        webView = Ti.UI.createWebView({
            url : 'https://omadi.com/terms.txt'
        });
    
        backButton = Ti.UI.createButton({
            title : 'Back',
            bottom : 0,
            right : 0,
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });
        backButton.addEventListener('click', function() {
            win.close();
        });
    
        webView.add(backButton);
        win.add(webView);
        win.open();
    });
    
    termsWrapper.add(termsView);
    termsWrapper.add(termsIAgreeLabel);
    termsWrapper.add(termsOfServiceLabel);
    scrollView.add(termsWrapper);
    //scrollView.add(underlineView);
    
    loginButton = Titanium.UI.createButton({
        title : 'Log In',
        width : 200,
        height : 45,
        top : 10,
        style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
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
        color: '#fff',
        font: {
            fontWeight: 'bold',
            fontSize: 20,
            fontFamily: 'Arial'
        },
        borderRadius: 10
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
    
        if (portal.value == ""){
            alert("You must enter a valid client account in the top box.");
        }
        else if(usernameField.value == ""){
            alert("A valid username is required.");
        }
        else if(passwordField.value == "") {
            alert("A valid password is required.");
        }
        //No internet connection
        else if (!(Titanium.Network.online)) {
            alert("You do not have a network connection. You cannot login until you connect to the Internet.");
        }
        else if (termsView.selected === false) {
            alert("You must to agree to the Terms of Service before using the app.");
        }
        //Everything ok, so let's login:
        else {
    
            Omadi.display.showLoadingIndicator('Logging you in...');
            //Create internet connection
            var xhr = Ti.Network.createHTTPClient();
            // var parms = {
            // username: usernameField.value,
            // password: passwordField.value,
            // device_id: Titanium.Platform.getId(),
            // app_version: Titanium.App.version,
            // //device_data: '{ "model": "'+Titanium.Platform.model+'", "version": "'+Titanium.Platform.version+'", "architecture": "'+Titanium.Platform.architecture+'", "platform": "'+Titanium.Platform.name+'", "os_type": "'+Titanium.Platform.ostype+'" }'
            // device_data: { "model": Titanium.Platform.model, "version": Titanium.Platform.version, "architecture": Titanium.Platform.architecture, "platform": Titanium.Platform.name, "os_type": Titanium.Platform.ostype, "screen_density":Titanium.Platform.displayCaps.density, "primary_language": Titanium.Platform.locale, "processor_count": Titanium.Platform.processorCount }
            // };
    
            //10 seconds till die
            xhr.setTimeout(10000);
    
            xhr.open('POST', 'https://' + portal.value + '.omadi.com/js-sync/sync/login.json');
            xhr.setRequestHeader("Content-Type", "application/json");
    
            //Send info
            //xhr.send('{"username":"' + parms.username + '","password":"'+parms["password"] +'","device_id":"'+parms["device_id"] +'","app_version":"'+parms["app_version"] +'","device_data": '+JSON.stringify(parms["device_data"]) +' }');
    
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
    
            //Ti.API.info('{"username":"'+parms["username"]+'","password":"'+parms["password"] +'","device_id":"'+parms["device_id"] +'","app_version":"'+parms["app_version"] +'","device_data":'+JSON.stringify(parms["device_data"]) +' }');
            //Ti.API.info('"model": '+ Titanium.Platform.model +', "version": '+Titanium.Platform.version+', "architecture": '+Titanium.Platform.architecture+', "platform": '+Titanium.Platform.name+', "os_type": '+Titanium.Platform.ostype+', "screen_density": '+Titanium.Platform.displayCaps.density+', "primary_language": '+Titanium.Platform.locale+', "processor_count": '+Titanium.Platform.processorCount );
    
            // When infos are retrieved:
            xhr.onload = function(e) {
                var db_list, list_result, cookie, dialog, loginJSON;
    
                db_list = Omadi.utils.openListDatabase();
    
                list_result = db_list.execute('SELECT domain FROM domains WHERE domain=\'' + portal.value + '\'');
    
                if (list_result.rowCount > 0) {
                    //Exists
                    Ti.API.info('database exists');
                }
                else {
                    db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                    //Create another database
                    Ti.API.info('database does not exist, creating a new one');
                    db_list.execute('INSERT INTO domains (domain, db_name) VALUES ("' + portal.value + '", "db_' + portal.value + '_' + usernameField.value + '" )');
                    db_list.execute("COMMIT TRANSACTION");
                }
    
                list_result.close();
    
                //Ti.API.info('DB NAME_APP: db_' + portal.value + '_' + usernameField.value + ' ');
    
                db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                db_list.execute('UPDATE history SET domain = "' + portal.value + '", username = "' + usernameField.value + '", password = "' + passwordField.value + '", db_name="db_' + portal.value + '_' + usernameField.value + '" WHERE "id_hist"=1');
                db_list.execute("COMMIT TRANSACTION");
    
                //Passes parameter to the second window:
                domainName = 'https://' + portal.value + '.omadi.com';
    
                setProperties(domainName, this.responseText);
    
                openMainMenu();
    
                //Ti.API.info(this.responseText);
    
                //var loginJSON = JSON.parse(this.responseText);
    
                cookie = this.getResponseHeader('Set-Cookie');
    
                list_result = db_list.execute('SELECT COUNT(*) AS count FROM login WHERE id_log=1');
                if (list_result.fieldByName('count') > 0) {
                    db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                    db_list.execute('UPDATE login SET picked = "' + domainName + '", login_json = "' + Ti.Utils.base64encode(this.responseText) + '", is_logged = "true", cookie = "' + cookie + '", logged_time = "' + Omadi.utils.getUTCTimestamp() + '" WHERE "id_log"=1');
                    db_list.execute("COMMIT TRANSACTION");
                }
                else {
                    db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                    db_list.execute('INSERT INTO login SET picked = "' + domainName + '", login_json = "' + Ti.Utils.base64encode(this.responseText) + '", is_logged = "true", cookie = "' + cookie + '", logged_time = "' + Omadi.utils.getUTCTimestamp() + '", id_log=1');
                    db_list.execute("COMMIT TRANSACTION");
                }
    
                db_list.close();
                passwordField.value = "";
                loginWin.touchEnabled = false;
    
                Omadi.display.hideLoadingIndicator();
                startGPSService();
    
                loginJSON = JSON.parse(this.responseText);
                if ( typeof loginJSON.new_app !== 'undefined' && loginJSON.new_app.length > 0) {
                    dialog = Ti.UI.createAlertDialog({
                        message : loginJSON.new_app,
                        ok : 'OK',
                        title : 'Updated App'
                    }).show();
                }
            };
    
            //If username and pass wrong:
            xhr.onerror = function(e) {
                //Ti.API.info("status is: " + this.status);
                Omadi.display.hideLoadingIndicator();
                
                if (this.status == 401) {
                    label_error.text = "Check your username and password. Then try again.";
                    alert("Make sure your client account, username, and password are correct. Then try logging in again.");
                }
                else {
                    label_error.text = "An error has occurred, please try again";
                }
            };
        }
    });
    
    // Always show the window in portrait orientation
    loginWin.orientationModes = [Titanium.UI.PORTRAIT];
    
    //When back button on the phone is pressed, it informs the user (message at the bottom)
    // that he is already in the first menu
    loginWin.addEventListener('android:back', function() {
        Ti.API.info("Shouldn't go back");
        label_error.text = "You can't go back, this is the first menu";
    });
    
    Ti.App.Properties.removeProperty('logStatus');
    
    loginWin.open();
    
    if ((PLATFORM !== 'android') && (Ti.Platform.displayCaps.platformHeight > 500)) {
        scrollView.top = 200;
    }
    
    Ti.App.addEventListener('loggingOut', function() {
        loginWin.touchEnabled = true;
        Ti.API.debug("logged out");
        scrollView.scrollTo(0, 0);
        
        //setTimeout(Omadi.display.removeNotifications, 30000);
    });
    
    if (Omadi.utils.isLoggedIn() === true) {
        //Already logged in
        db = Omadi.utils.openListDatabase();
        result = db.execute('SELECT * FROM login WHERE "id_log"=1');
        domainName = result.fieldByName("picked");
        setProperties(domainName, Ti.Utils.base64decode(result.fieldByName("login_json")));
        db.close();
    
        loginWin.touchEnabled = false;
        openMainMenu();
    
        startGPSService();
    }
    
}());






