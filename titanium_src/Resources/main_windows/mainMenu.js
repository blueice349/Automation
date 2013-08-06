
Ti.include('/lib/functions.js');

var ImageFactory = null;

if (Ti.App.isIOS) {
    Ti.include('/lib/iOS/backgroundLocation.js');
    ImageFactory = require('ti.imagefactory');
}

// var cameraAndroid;
// 
// if (Ti.App.isAndroid) {
    // cameraAndroid = require('com.omadi.newcamera');
// }

/*jslint eqeq:true, plusplus: true, nomen: true*/

var curWin = Ti.UI.currentWindow;
curWin.isTopWindow = true;
curWin.backgroundColor = '#eee';
curWin.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);

var version = 'Omadi Inc';
var alertQueue = [];
var currentAlertIndex = 0;
var useAlertQueue = true;

var databaseStatusView = Titanium.UI.createView({
    backgroundColor : '#333',
    height : 45,
    width : '100%',
    bottom : 0,
    layout : 'horizontal',
    zIndex : 100
});

Omadi.data.setUpdating(false);
Omadi.service.setSendingData(false);

var listView;

var jsonLogin = JSON.parse(Ti.App.Properties.getString("Omadi_session_details"));

Ti.API.debug(jsonLogin);

var name = jsonLogin.user.realname;
var roles = jsonLogin.user.roles;

Ti.App.Properties.setObject('userRoles', roles);
Ti.App.addEventListener("syncInstallComplete", displayBundleList);

var loggedView = Titanium.UI.createView({
    top : 40,
    backgroundColor : '#333',
    height : 45,
    width : '100%',
    opacity : 1
});

var headerListView = Ti.UI.createView({
    top: -40,
    bottom: 0,
    left: 0,
    right: 0
});

var networkStatusView = Ti.UI.createView({
    zIndex : 1000,
    top : 0,
    height : 40,
    width : '100%',
    backgroundColor : '#111',
    visible : true
});

var networkStatusLabel = Ti.UI.createLabel({
    text : 'Testing...',
    color : '#fff',
    font : {
        fontSize : 16
    },
    width : '100%',
    height : 45,
    textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
});

var uploadingProgressBar = Ti.UI.createProgressBar({
    color : '#fff',
    font : {
        fontSize : 16
    },
    width : '100%',
    height : 45,
    message : "",
    style : (Ti.App.isIOS) ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : '',
    min: 0,
    max: 1,
    value: 0,
    visible: false
});

var label_top = Titanium.UI.createLabel({
    color : '#FFFFFF',
    text : name + ''.toString(),
    textAlign : 'left',
    width : '70%',
    left : '5%',
    horizontalAlign : 'left',
    height : Ti.UI.SIZE,
    font : {
        fontSize : 16
    }
});

var offImage = Titanium.UI.createLabel({
    text : 'Log Out',
    width : 70,
    horizontalAlign : 'right',
    textAlign : 'center',
    right : 50,
    height : 30,
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
            color : '#ccc',
            offset : 0.0
        }, {
            color : '#ddd',
            offset : 0.25
        }, {
            color : '#aaa',
            offset : 1.0
        }]
    },
    font : {
        fontSize : 14,
        fontWeight : 'bold'
    },
    borderRadius : 5,
    color : '#000',
    style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
});

var actionsButton = Ti.UI.createLabel({
    text : 'Actions',
    width : 70,
    horizontalAlign : 'right',
    textAlign : 'center',
    right : 130,
    height : 30,
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
            color : '#468',
            offset : 0.0
        }, {
            color : '#68a',
            offset : 0.25
        }, {
            color : '#246',
            offset : 1.0
        }]
    },
    font : {
        fontSize : 14,
        fontWeight: 'bold'
    },
    borderRadius : 5,
    color : '#eee',
    style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
});

var refresh_image = Ti.UI.createImageView({
    image : '/images/refresh.png',
    right : 9,
    width : 32,
    height : 32
});

var a = Titanium.UI.createAlertDialog({
    title : 'Omadi',
    buttonNames : ['OK']
});

var lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp();

var networkStatusAnimation = Titanium.UI.createAnimation();


function displayBundleList() {"use strict";
    var db, result, dataRows, name_table, i, j, k, display, description, row_t, icon, titleLabel, plusButton, can_view, can_create;

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT * FROM bundles');

    dataRows = [];

    while (result.isValidRow()) {

        name_table = result.fieldByName("bundle_name");
        display = result.fieldByName("display_name").toUpperCase();
        description = result.fieldByName("description");
        can_view = result.fieldByName("can_view", Ti.Database.FIELD_TYPE_INT);
        can_create = result.fieldByName("can_create", Ti.Database.FIELD_TYPE_INT);

        if (can_view === 1) {

            row_t = Ti.UI.createTableViewRow({
                height : 45,
                display : display,
                name : display,
                desc : description,
                name_table : name_table,
                show_plus : (can_create === 1 ? true : false)
            });

            icon = Titanium.UI.createImageView({
                width : 32,
                height : 32,
                top : 6,
                left : 5,
                image : Omadi.display.getNodeTypeImagePath(name_table),
                desc : description
            });

            titleLabel = Titanium.UI.createLabel({
                text : display,
                font : {
                    fontSize : 20
                },
                width : '82%',
                textAlign : 'left',
                left : 42,
                height : Ti.UI.SIZE,
                color : '#000',
                desc : description
            });

            row_t.add(icon);
            row_t.add(titleLabel);

            if (can_create === 1) {
                plusButton = Titanium.UI.createButton({
                    backgroundImage : '/images/plus_btn.png',
                    backgroundSelectedImage : '/images/plus_btn_selected.png',
                    width : 54,
                    height : 38,
                    right : 1,
                    is_plus : true
                });
                row_t.add(plusButton);
            }

            dataRows.push(row_t);

        }
        result.next();
    }
    result.close();

    db.close();

    dataRows.sort(Omadi.utils.sortByName);
    listView.setData(dataRows);
}

function setupAndroidMenu() {"use strict";

    var activity = Ti.Android.currentActivity;

    activity.onCreateOptionsMenu = function(e) {

        var menu, menuItem, menu_draft, menu_about, menu_settings;

        menu = e.menu;

        // menuItem = menu.add({
            // title : 'Sync Data',
            // order : 0
        // });
        // menuItem.setIcon('/images/item1.png');
        
        menu_draft = menu.add({
            title : 'Display drafts',
            order : 1
        });
        menu_draft.setIcon("/images/drafts_android.png");

        menu_about = menu.add({
            title : 'About',
            order : 2
        });
        menu_about.setIcon("/images/about.png");
        
        menu_settings = menu.add({
           title: 'Settings',
           order: 3 
        });
        menu_settings.setIcon("/images/gear.png");

        menu_about.addEventListener("click", function(e) {
            Omadi.display.openAboutWindow();
        });

        // menuItem.addEventListener("click", function(e) {
            // Omadi.service.checkUpdate('from_menu');
        // });

        menu_draft.addEventListener('click', function() {
            Omadi.display.openDraftsWindow();
        });
        
        menu_settings.addEventListener("click", function(e) {
            Omadi.display.openSettingsWindow();
        });
    };
}

function setupBottomButtons() {"use strict";
    var alertsView, alertsImg, alertsLabel, 
        draftsView, draftsImg, draftsLabel, 
        actionsView, actionsImg, actionsLabel, 
        jobsView, jobsImg, jobsLabel, dispatchBundle, 
        recentView, recentLabel, recentImg,
        tagsReadyView, tagsReadyImg, tagsReadyLabel, tagBundle,
        numButtons, widthPercent;
    
    numButtons = 0;
    
    try{
        curWin.remove(databaseStatusView);
    }
    catch(ex){
        // Do nothing
    }

    databaseStatusView = Titanium.UI.createView({
        backgroundColor : '#333',
        height : 45,
        width : '100%',
        bottom : 0,
        layout : 'horizontal',
        zIndex : 100
    });

    alertsView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '50%',
        height : 45,
        layout : 'vertical',
        color : '#fff'
    });
    databaseStatusView.add(alertsView);

    alertsImg = Ti.UI.createImageView({
        image : '/images/msg3.png',
        height : 22,
        width : 22,
        top : 2
    });
    alertsLabel = Ti.UI.createLabel({
        text : 'Alerts',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0,
        color : '#fff',
        width : Ti.UI.SIZE,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
    });

    alertsView.add(alertsImg);
    alertsView.add(alertsLabel);
    alertsView.addEventListener('click', function() {
        var alertsWindow, locationEnabled;
        
        locationEnabled = Omadi.location.isLocationEnabled();
        
        if(locationEnabled){
            
            alertsWindow = Ti.UI.createWindow({
                navBarHidden : true,
                url : '/main_windows/message_center.js'
            });
    
            Omadi.display.loading();
    
            alertsWindow.addEventListener('open', Omadi.display.doneLoading);
            alertsWindow.open();
        }
    });
    
    numButtons ++;
    
    if(Omadi.bundles.dispatch.showJobsScreen()){
        
        jobsView = Ti.UI.createView({
            backgroundSelectedColor : 'orange',
            focusable : true,
            width : '50%',
            height : 45,
            layout : 'vertical',
            color : '#fff'
        });
    
        databaseStatusView.add(jobsView);
    
        jobsImg = Ti.UI.createImageView({
            image : '/images/jobs.png',
            height : 22,
            width : 22,
            top : 2
        });
    
        jobsLabel = Ti.UI.createLabel({
            text : 'Jobs',
            font : {
                fontSize : 14
            },
            height : Ti.UI.SIZE,
            bottom : 0,
            color : '#fff',
            width : Ti.UI.SIZE,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
        });
    
        jobsView.add(jobsImg);
        jobsView.add(jobsLabel);
        jobsView.addEventListener('click', function() {
            Omadi.display.openJobsWindow();
        });
        
        numButtons ++;
    }
    
    recentView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '50%',
        height : 45,
        layout : 'vertical',
        color : '#fff'
    });
    databaseStatusView.add(recentView);

    recentImg = Ti.UI.createImageView({
        image : '/images/clock.png',
        height : 22,
        width : 22,
        top : 2
    });
    recentLabel = Ti.UI.createLabel({
        text : 'Recent',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0,
        color : '#fff',
        width : Ti.UI.SIZE,
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
    });

    recentView.add(recentImg);
    recentView.add(recentLabel);
    recentView.addEventListener('click', function() {
        var recentWindow;

        recentWindow = Ti.UI.createWindow({
            navBarHidden : true,
            url : '/main_windows/recent.js'
        });

        Omadi.display.loading();

        recentWindow.addEventListener('open', Omadi.display.doneLoading);
        recentWindow.open();
    });
    
    numButtons ++;
    
    if(Omadi.bundles.tag.hasSavedTags()){
        
        tagsReadyView = Ti.UI.createView({
            backgroundSelectedColor : 'orange',
            focusable : true,
            width : '50%',
            height : 45,
            layout : 'vertical',
            color : '#fff'
        });
        databaseStatusView.add(tagsReadyView);
    
        tagsReadyImg = Ti.UI.createImageView({
            image : '/images/tags_ready.png',
            height : 22,
            width : 22,
            top : 2
        });
        tagsReadyLabel = Ti.UI.createLabel({
            text : 'Expired',
            font : {
                fontSize : 14
            },
            height : Ti.UI.SIZE,
            bottom : 0,
            color : '#fff',
            width : Ti.UI.SIZE,
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
        });
    
        tagsReadyView.add(tagsReadyImg);
        tagsReadyView.add(tagsReadyLabel);
        tagsReadyView.addEventListener('click', function() {
            var tagsReadyWindow;
    
            tagsReadyWindow = Ti.UI.createWindow({
                navBarHidden : true,
                url : '/main_windows/tags_ready.js'
            });
    
            Omadi.display.loading();
    
            tagsReadyWindow.addEventListener('open', Omadi.display.doneLoading);
            tagsReadyWindow.open();
        });
        
        numButtons ++;
    }
    
    if(numButtons > 2){
        if(numButtons == 3){
            widthPercent = '33%';
        }
        else if(numButtons == 4){
            widthPercent = '25%';
        }   
        
        if(typeof alertsView !== 'undefined'){
            alertsView.setWidth(widthPercent);
        }
        if(typeof jobsView !== 'undefined'){
            jobsView.setWidth(widthPercent);
        }
        if(typeof recentView !== 'undefined'){
            recentView.setWidth(widthPercent);
        }
        if(typeof tagsReadyView !== 'undefined'){
            tagsReadyView.setWidth(widthPercent);
        }
    }
    
    curWin.add(databaseStatusView);
}

function showNextAlertInQueue(e) {"use strict";
    
    if (alertQueue.length) {
        // Add a small break for the OS to catch up with things
        // If the break isn't there, the UI doesn't finish updates every time on iOS
        setTimeout(function(){
            var alert = alertQueue.shift();
            if(alert){
                alert.show();
            }
        }, 250);
    }
    else{
        useAlertQueue = false;
    }
}

function showNetworkStatusHandler(){"use strict";
    headerListView.top = 0;
}

function showNetworkStatus(){"use strict";
    networkStatusAnimation.duration = 500;
    networkStatusAnimation.top = 0;
    networkStatusAnimation.addEventListener('complete', showNetworkStatusHandler);
    
    headerListView.animate(networkStatusAnimation);
}

function hideNetworkStatusHandler(){"use strict";
    headerListView.top = -40;
}

function hideNetworkStatus(){"use strict";
    
    networkStatusAnimation.duration = 1000;
    networkStatusAnimation.top = -40;
    networkStatusAnimation.addEventListener('complete', hideNetworkStatusHandler);
    
    headerListView.animate(networkStatusAnimation);
}

function doneSendingDataMainMenu(e){"use strict";
    Ti.API.debug("Done Sending data event received");
    
    // Allow background updates again
    Ti.App.allowBackgroundUpdate = true;
    
    hideNetworkStatus();
    Omadi.service.uploadFile();
}

function doneSendingPhotosMainMenu(e){"use strict";
    hideNetworkStatus();
}

function sendingDataMainMenu(e){"use strict";
    // the progress bar set by onsendstream does not currently work with Android
    // Only allow iOS apps to show the progress bar for uploads
    if(Ti.App.isAndroid || typeof e.progress === 'undefined'){
        networkStatusLabel.setText(e.message);
        uploadingProgressBar.setVisible(false);
        networkStatusLabel.setVisible(true);
    }
    else{
        uploadingProgressBar.setValue(0.01);
        uploadingProgressBar.setMessage(e.message);
        uploadingProgressBar.uploadingBytes = e.uploadingBytes;
        uploadingProgressBar.filesize = e.filesize;
        uploadingProgressBar.bytesUploaded = e.bytesUploaded;
        
        networkStatusLabel.setVisible(false);
        uploadingProgressBar.setVisible(true);
        
    }
    
    showNetworkStatus();
}

function loggingOutMainMenu(e){"use strict";
    var lastUploadStartTimestamp;
    
    lastUploadStartTimestamp = Omadi.service.getLastUploadStartTimestamp();
                
    if(lastUploadStartTimestamp === null){
        // Not currently uploading anything, so the window can close immediately
        Ti.API.debug("Closing Main Menu Window Immediately");
        Ti.UI.currentWindow.close();
    }
    else{
        Ti.UI.currentWindow.hide();
        Ti.App.closeWindowAfterUpload = true;
        Ti.App.addEventListener('doneSendingPhotos', function(){
            Ti.API.debug("Closing Main Menu Window");
            Ti.App.closeWindowAfterUpload = false;
            Ti.UI.currentWindow.close(); 
        });
    }
}

function networkChangedMainMenu(e){"use strict";
    var isOnline = e.online;
    if (isOnline) {
        Omadi.service.checkUpdate();
    }
}

function normalUpdateFromMenu(e){"use strict";
    Omadi.service.checkUpdate('from_menu');
}

function fullUpdateFromMenu(e){"use strict";
    var dbFile, db, result;
    
    Ti.App.Properties.setBool("doingFullReset", true);
    
    Omadi.data.setUpdating(true);

    Omadi.data.setLastUpdateTimestamp(0);
    //If delete_all is present, delete all contents:

    if (!Ti.Network.online) {
        alert("You do not have an Internet connection right now, so new data will not be downloaded until you connect.");
    }

    db = Omadi.utils.openMainDatabase();

    result = db.execute("SELECT id FROM _files");
    if (result.rowCount > 0) {
        alert("One or more photos were not uploaded to the server, so they will be stored on this device now.");

        while (result.isValidRow()) {

            Omadi.data.saveFailedUpload(result.fieldByName('id', Ti.Database.FIELD_TYPE_INT), false);

            result.next();
        }
    }
    result.close();
    db.close();

    if (Ti.App.isAndroid) {
        //Remove the database
        db.remove();
        db.close();
    }
    else {
        dbFile = db.getFile();
        db.close();
        //phisically removes the file
        dbFile.deleteFile();
    }

    // Install database with an empty version
    db = Omadi.utils.openMainDatabase();
    db.close();

    // Clear out the GPS database alerts
    db = Omadi.utils.openGPSDatabase();
    db.execute('DELETE FROM alerts');
    db.close();

    listView.setData([]);
    
    setupBottomButtons();

    Omadi.data.setUpdating(false);
    Omadi.service.checkUpdate('from_menu');
}

function openFormCallback(e){"use strict";
    Ti.API.debug(e);
    
    Omadi.display.openFormWindow(e.node_type, e.nid, e.form_part);
}

function backgroundCheckForUpdates(){"use strict";
    
    // allowBackground update is set to true at the beginning of the main menu opening.
    // It is set to false from just before the node is saved on the phone and just after
    //    the time it is saved to the web server or an error occurs.
    if(Ti.App.allowBackgroundUpdate){
        Omadi.service.checkUpdate();
    }
    else{
        Ti.API.debug("Background updates are not allowed right now.");
    }
}

function showContinuousSavedNode(){"use strict";
    var db, result, continuousSave;
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT nid, table_name, form_part FROM node WHERE flag_is_updated = 4 ORDER BY changed DESC");
    continuousSave = null;
    
    if(result.isValidRow()){
        continuousSave = {
            node_type: result.fieldByName('table_name'),
            nid: result.fieldByName('nid'),
            form_part: result.fieldByName('form_part')
        };
    }
    result.close();
    db.close();
    
    if(continuousSave !== null){
        Omadi.display.openFormWindow(continuousSave.node_type, continuousSave.nid, continuousSave.form_part);
    }
}

( function() {"use strict";
    var db, result, formWindow, time_format, askAboutInspection, dialog, i, showingAlert, firstAlert, nowTimestamp;
    
    // Initialize the global scope variable to map deleted nids to saved positive nids
    Ti.App.deletedNegatives = {};
    Ti.App.allowBackgroundUpdate = true;
    Ti.App.allowBackgroundLogout = true;
    Ti.App.closingApp = false;
    
    listView = Titanium.UI.createTableView({
        data : [],
        top : 85,
        bottom : 45,
        scrollable : true,
        separatorColor : '#BDBDBD'
    });

    if (Ti.App.isIOS) {
        listView.footerView = Ti.UI.createView({
            height : 45,
            width : '100%'
        });
    }
    
    // Don't show an alert immediately after the user logs in
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    Ti.App.Properties.setString("last_alert_popup", nowTimestamp);

    //curWin.add(listView);

    networkStatusView.add(networkStatusLabel);
    networkStatusView.add(uploadingProgressBar);

    displayBundleList();
    
    
    loggedView.add(refresh_image);

    loggedView.add(label_top);
    loggedView.add(offImage);
    
    loggedView.add(actionsButton);
    
    actionsButton.addEventListener('click', function(){
       Omadi.display.openActionsWindow();
    });

    //curWin.add(loggedView);
    
    headerListView.add(networkStatusView);
    headerListView.add(loggedView);
    headerListView.add(listView);

    curWin.add(headerListView);
    

    if (lastSyncTimestamp == 0) {
        db = Omadi.utils.openMainDatabase();
        db.execute("INSERT INTO updated (timestamp, updating) VALUES (0, 0)");
        db.close();
        
        Ti.App.Properties.setBool("doingFullReset", true);
    }

    if (Ti.App.isAndroid) {
        setupAndroidMenu();
    }

    setupBottomButtons();

    Ti.App.addEventListener("doneSendingData", doneSendingDataMainMenu);
    Ti.App.addEventListener("doneSendingPhotos", doneSendingPhotosMainMenu);
    Ti.App.addEventListener("sendingData", sendingDataMainMenu);
    Ti.App.addEventListener('loggingOut', loggingOutMainMenu);
    Ti.App.addEventListener('openForm', openFormCallback);
    
    Ti.App.addEventListener('sendUpdates', Omadi.service.sendUpdates);
    
    Ti.Network.addEventListener('change', networkChangedMainMenu);

    listView.addEventListener('click', function(e) {
        var nextWindow;

        Omadi.data.setUpdating(true);

        if (e.source.is_plus) {
            Omadi.display.openFormWindow(e.row.name_table, 'new', 0);
        }
        else {
            Omadi.display.openListWindow(e.row.name_table, e.row.show_plus, [], [], false);
        }

        Omadi.data.setUpdating(false);
    });
    
    refresh_image.addEventListener('click', Omadi.service.checkUpdate);
    
    offImage.addEventListener('click', function(e) {
        
        Omadi.display.logoutButtonPressed();
    });

    // When back button on the phone is pressed, it alerts the user (pop up box)
    // that he needs to log out in order to go back to the root window
    curWin.addEventListener('android:back', function() {
        
        Omadi.display.logoutButtonPressed();
    });
    
    Ti.App.syncInterval = setInterval(backgroundCheckForUpdates, 300000);
  
    Ti.App.photoUploadCheck = setInterval(Omadi.service.uploadFile, 60000);

    Ti.App.addEventListener('full_update_from_menu', fullUpdateFromMenu);
    Ti.App.addEventListener('finishedDataSync', setupBottomButtons);
    Ti.App.addEventListener('normal_update_from_menu', normalUpdateFromMenu);

    if ( typeof curWin.fromSavedCookie !== 'undefined' && !curWin.fromSavedCookie) {
        
        // The option dialog should go after clock in, but some of the options
        // are blocked because of the alert dialog being show in askclockin
        
        Omadi.bundles.timecard.askClockIn();
        
        Omadi.bundles.companyVehicle.askAboutVehicle();
        
        Omadi.bundles.inspection.askToReviewLastInspection();
    }
    
    //Omadi.utils.checkVolumeLevel();
    
    Omadi.location.isLocationEnabled();

    if (alertQueue.length) {
        firstAlert = alertQueue.shift();
        firstAlert.show();
    }
    else{
        useAlertQueue = false;
    }

    Ti.App.addEventListener('showNextAlertInQueue', showNextAlertInQueue);
    
    Ti.API.debug("before init");
    Omadi.push_notifications.init();
    
    if(Ti.App.isIOS){
        Ti.App.addEventListener('resume', Omadi.service.checkUpdate);
    }
    
    Ti.UI.currentWindow.addEventListener('close', function() {
        Ti.API.info('Closing main menu');
        
        clearInterval(Ti.App.syncInterval);
        clearInterval(Ti.App.photoUploadCheck);
        
        if(Ti.App.isIOS){
            Ti.App.removeEventListener('resume', Omadi.service.checkUpdate);
        }
        
        Ti.App.removeEventListener('openForm', openFormCallback);
        Ti.App.removeEventListener('showNextAlertInQueue', showNextAlertInQueue);
        Ti.App.removeEventListener("syncInstallComplete", displayBundleList);
        Ti.App.removeEventListener("doneSendingData", doneSendingDataMainMenu);
        Ti.App.removeEventListener("doneSendingPhotos", doneSendingPhotosMainMenu);
        Ti.App.removeEventListener("sendingData", sendingDataMainMenu);
        Ti.App.removeEventListener('loggingOut', loggingOutMainMenu);
        Ti.Network.removeEventListener('change', networkChangedMainMenu);
        
        Ti.App.removeEventListener('finishedDataSync', setupBottomButtons);
        Ti.App.removeEventListener('normal_update_from_menu', normalUpdateFromMenu);
        Ti.App.removeEventListener('full_update_from_menu', fullUpdateFromMenu);
        
        // Release memory
        
        Ti.UI.currentWindow.remove(loggedView);
        Ti.UI.currentWindow.remove(networkStatusView);
        Ti.UI.currentWindow.remove(databaseStatusView);
        Ti.UI.currentWindow.remove(listView);
        
        loggedView = null;
        networkStatusView = null;
        databaseStatusView = null;
        listView = null;
        curWin = null;
        
        networkStatusLabel = null;
        uploadingProgressBar = null;
        refresh_image = null;
        label_top = null;
        offImage = null;
        actionsButton = null;
        a = null;
    });
    
    Ti.API.debug("About to check for updates.");
    
    Omadi.service.checkUpdate('from_menu');
    
    showContinuousSavedNode();
    
}());

