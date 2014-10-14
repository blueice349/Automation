var Omadi;

var Display = require('lib/Display');
Display.setCurrentWindow(Ti.UI.currentWindow, 'mainMenu');

Ti.include("/lib/functions.js");

var Utils = require('lib/Utils');
var Node = require('objects/Node');


var Database = require('lib/Database');
// Make sure the database is reset so it's not using old data from another session
Database.reset();

var ImageFactory = null;

if (Ti.App.isIOS) {
    Ti.include('/lib/iOS/backgroundLocation.js');
    ImageFactory = require('ti.imagefactory');
}

var AndroidSysUtil = null;
if(Ti.App.isAndroid){
    AndroidSysUtil = require("uk.me.thepotters.atf.sys");
}

/*jslint eqeq:true, plusplus: true, nomen: true*/

var curWin = Ti.UI.currentWindow;
curWin.isTopWindow = true;
curWin.backgroundColor = '#eee';

var version = 'Omadi Inc';
var alertQueue = [];
var currentAlertIndex = 0;
var useAlertQueue = true;
var isInitialized = false;

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
var name = jsonLogin.user.realname;
var roles = jsonLogin.user.roles;

Ti.App.Properties.setObject('userRoles', roles);

var loggedView = Titanium.UI.createView({
    top : 40,
    backgroundColor : '#333',
    height : 45,
    width : '100%'
});

var headerListView = Ti.UI.createView({
    top: -40,
    bottom: 0,
    left: 0,
    right: 0
});

if(Ti.App.isIOS7){
    headerListView.top = -20;
}

var networkStatusView = Ti.UI.createView({
    zIndex : 1000,
    top : 0,
    height : 0,
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
            color : '#ddd',
            offset : 0.0
        }, {
            color : '#ccc',
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
            color : '#2BC4F3',
            offset : 0.0
        }, {
            color : '#00AEEE',
            offset : 0.25
        }, {
            color : '#0095DA',
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
    image : '/images/refresh_light_blue.png',
    right : 9,
    width : 32,
    height : 32
});

var a = Titanium.UI.createAlertDialog({
    title : 'Omadi',
    buttonNames : ['OK']
});

var watermarkImage = null;
var lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp();
var networkStatusAnimation = Titanium.UI.createAnimation();

function displayWatermark(){"use strict";
    var minWidth;
    
    minWidth = Math.min(Ti.Platform.displayCaps.platformHeight, Ti.Platform.displayCaps.platformWidth);
    
    if(watermarkImage === null){
        watermarkImage = Ti.UI.createImageView({
            image: '/images/logo.png',
            width: Math.round(minWidth * 0.75),
            height: Math.round(minWidth * 0.75)
        });
    }
    
    listView.setVisible(false);
    listView.setHeight(0);
    
    watermarkImage.setVisible(true);
    watermarkImage.setHeight(minWidth * 0.75);
}

function displayBundleList() {"use strict";
    var db, result, dataRows, name_table, i, j, k, display, 
        description, row_t, icon, titleLabel, plusButton, 
        can_view, can_create, data, colorGroups, item, 
        colors, iconFile, numBundles;

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT * FROM bundles ORDER BY display_name ASC');

    dataRows = [];
    
    colorGroups = {
      light_blue: [],
      green: [],
      dark_blue: [],
      purple: [],
      orange: [],
      red: [],
      gray: []  
    };
    
    numBundles = 0;
    
    while (result.isValidRow()) {
        
        item = {
            name_table : result.fieldByName("bundle_name"),
            display : result.fieldByName("display_name"),
            description : result.fieldByName("description"),
            can_view : result.fieldByName("can_view", Ti.Database.FIELD_TYPE_INT),
            can_create : result.fieldByName("can_create", Ti.Database.FIELD_TYPE_INT),
            data : JSON.parse(result.fieldByName('_data'))
        };
        
        if(typeof item.data.color !== 'undefined'){
            colorGroups[item.data.color].push(item);
        }
        else{
            colorGroups.gray.push(item);
        }
        
        numBundles ++;
        
        result.next();
    }
    result.close();
    db.close();
    
    Ti.API.info("Num Bundles: " + numBundles);
    
    if(numBundles == 0){
        
        displayWatermark();
    }
    else{
        colors = ["light_blue", "green", "dark_blue", "purple", "orange", "red", "gray"];
        
        for(i = 0; i < colors.length; i ++){
            if(colorGroups[colors[i]].length > 0){
                for(j = 0; j < colorGroups[colors[i]].length; j ++){
                    item = colorGroups[colors[i]][j];
                
                    if (item.can_view === 1 || item.can_create) {
            
                        row_t = Ti.UI.createTableViewRow({
                            height : 53,
                            display : item.display,
                            name : item.display,
                            desc : description,
                            name_table : item.name_table,
                            show_plus : (item.can_create === 1 ? true : false)
                        });
                        
                        icon = Titanium.UI.createImageView({
                            width : 42,
                            height : 42,
                            top : 6,
                            left : 5,
                            desc : description
                        });
                        
                        iconFile = Omadi.display.getIconFile(item.name_table);
                        
                        icon.image = iconFile;
                        
                        if(typeof iconFile.imageNotLoaded !== 'undefined' && iconFile.imageNotLoaded){
                            Omadi.display.insertBundleIcon(item.name_table, icon);
                        }
            
                        titleLabel = Titanium.UI.createLabel({
                            text : item.display,
                            font : {
                                fontSize : 23,
                                fontWeight: 'bold'
                            },
                            width : '82%',
                            textAlign : 'left',
                            left : 55,
                            height : Ti.UI.SIZE,
                            color : '#000',
                            desc : item.description
                        });
            
                        row_t.add(icon);
                        row_t.add(titleLabel);
            
                        if (item.can_create === 1) {
                            plusButton = Titanium.UI.createButton({
                                backgroundImage : '/images/plus_btn_light_gray.png',
                                backgroundSelectedImage : '/images/plus_btn_dark_gray.png',
                                width : 63,
                                height : 42,
                                right : 0,
                                is_plus : true
                            });
                            row_t.add(plusButton);
                        }
            
                        dataRows.push(row_t);
                    }
                    else{
                        iconFile = Omadi.display.getIconFile(item.name_table);
                        if(typeof iconFile.imageNotLoaded !== 'undefined' && iconFile.imageNotLoaded){
                            Omadi.display.insertBundleIcon(item.name_table);
                        }
                    }
                }
            }
        }
        
        listView.setData(dataRows);
        listView.setHeight(null);
        listView.setVisible(true);
        
        watermarkImage.setHeight(0);
        watermarkImage.setVisible(false);
    }
}

function setupAndroidMenu() {"use strict";

    Ti.Android.currentActivity.onCreateOptionsMenu = function(e) {

        var menu, menuItem, menu_draft, menu_about, menu_settings;

        menu = e.menu;
        
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
        image : '/images/alerts_white.png',
        height : 17,
        top : 5
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
        try{
            var alertsWindow, locationEnabled;
            
            locationEnabled = Omadi.location.isLocationEnabled(function() {
            	alertsWindow = Ti.UI.createWindow({
                    navBarHidden : true,
                    url : '/main_windows/message_center.js',
                    orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
                });
        
                Omadi.display.loading();
                
                alertsWindow.addEventListener('open', Omadi.display.doneLoading);
                alertsWindow.open();
            });
        }
        catch(ex){
            Utils.sendErrorReport("Exception alerts view clicked: " + ex);
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
            image : '/images/dispatch_white.png',
            height : 18,
            top : 5
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
        image : '/images/recent_white.png',
        height : 18,
        top : 5
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
        try{
            recentWindow = Ti.UI.createWindow({
                navBarHidden : true,
                url : '/main_windows/recent.js',
                orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
                backgroundColor: '#eee',
                windowSoftInputMode: Ti.UI.SOFT_INPUT_STATE_HIDDEN
            });
    
            Omadi.display.loading();
            
            recentWindow.addEventListener('open', Omadi.display.doneLoading);
            recentWindow.open();
        }
        catch(ex){
            Utils.sendErrorReport("Exception recent view clicked: " + ex);
        }
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
            image : '/images/tag_white.png',
            height : 18,
            top : 5
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
            try{
                tagsReadyWindow = Ti.UI.createWindow({
                    navBarHidden : false,
                    url : '/main_windows/tags_ready.js',
                    orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
                    title: 'Expired Tags'
                });
        
                Omadi.display.loading();
        
                tagsReadyWindow.addEventListener('open', Omadi.display.doneLoading);
                tagsReadyWindow.open();
            }
            catch(ex){
                Utils.sendErrorReport("Exception with tagsready view click: " + ex);
            }
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
    if(Ti.App.isIOS7){
        headerListView.top = 20;
    }
    else{
        headerListView.top = 0;   
    }
    
    networkStatusView.height = 45;
}

function showNetworkStatus(){"use strict";
    networkStatusAnimation.duration = 500;
    if(Ti.App.isIOS7){
        networkStatusAnimation.top = 20;
    }
    else{
        networkStatusAnimation.top = 0; 
    }
    
    networkStatusView.height = 45;
    
    networkStatusAnimation.addEventListener('complete', showNetworkStatusHandler);
    
    headerListView.animate(networkStatusAnimation);
}

function hideNetworkStatusHandler(){"use strict";
    if(Ti.App.isIOS7){
        headerListView.top = -20;
    }
    else{
        headerListView.top = -40;
    }
    
    networkStatusView.height = 0;
}

function hideNetworkStatus(){"use strict";
    
    networkStatusAnimation.duration = 1000;
    if(Ti.App.isIOS7){
        networkStatusAnimation.top = -20;
    }
    else{
        networkStatusAnimation.top = -40;    
    }
    
    networkStatusAnimation.addEventListener('complete', hideNetworkStatusHandler);
    
    headerListView.animate(networkStatusAnimation);
}

function showAndroidMemoryAlert(){"use strict";
    var dialog;
    
    dialog = Ti.UI.createAlertDialog({
        title: "Low Memory",
        message: "Your device is running low on memory. Restart the app?",
        buttonNames: ['Restart', 'Ignore', 'Info'] 
    });
    
    dialog.addEventListener('click', function(e){
        var dialog2;
        try{
            if(e.index == 0){
                Utils.sendErrorReport("User is restarting app");
                Ti.Android.currentActivity.finish();
                AndroidSysUtil.KillMyProcess();
            }
            else if(e.index == 2){
                dialog2 = Ti.UI.createAlertDialog({
                    title: "Low Memory Info",
                    message: "On the Android version of this app, memory is not being managed correctly due to a bug. This issue is estimated to be resolved in summer 2014 by our middleware provider, and you will receive that update as it becomes available. We understand this is a very annoying issue, and we are currently coming up with ways to mitigate this issue before summer 2014.",
                    buttonNames: ['OK', 'Restart', 'Ignore']
                });
                
                dialog2.addEventListener('click', function(e2){
                    try{
                        if(e2.index == 1){
                            Utils.sendErrorReport("User is restarting app after reading info.");
                            Ti.Android.currentActivity.finish();
                            AndroidSysUtil.KillMyProcess();
                        }
                    }
                    catch(ex2){
                        Utils.sendErrorReport("Exception in low memory alert after reading info: " + ex2);
                    }
                });
                
                dialog2.show();
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in low memory alert: " + ex);
        }
    });
    
    dialog.show();
}

var lastAvailableBytes = 0;
function checkAndroidMemoryAfterGC(){"use strict";
    var availableBytes;
    
    try{
        availableBytes = Ti.Platform.getAvailableMemory();
        
        if(availableBytes < 800000){
            Utils.sendErrorReport("Showing Android memory alert: " + availableBytes);
            showAndroidMemoryAlert();
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception checking android memory after GC: " + ex);
    }
}

function checkAndroidMemory(){"use strict";
    try{
        lastAvailableBytes = Ti.Platform.getAvailableMemory();
        
        if(lastAvailableBytes < 1800000){
            AndroidSysUtil.OptimiseMemory();            
            setTimeout(checkAndroidMemoryAfterGC, 1000);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception checking android memory: " + ex);
    }
}

function doneSendingDataMainMenu(e){"use strict";
    Ti.API.debug("Done Sending data event received");
    
    // Allow background updates again
    Ti.App.allowBackgroundUpdate = true;
    
    hideNetworkStatus();
    
    Omadi.service.uploadFile();
    
    if(Ti.App.isAndroid){
        checkAndroidMemory();
    }
}



function sendCommentsMainMenu(e){"use strict";
    var Comments;
    
    hideNetworkStatus();
    
    Comments = require('services/Comments');
    
    Comments.sendComments();
}

function openViewWindowMainMenu(e) {'use strict';
	Omadi.display.openViewWindow(e.type, e.nid, e.allowActions);
}

function doneSendingPhotosMainMenu(e){"use strict";
    hideNetworkStatus();
}

function sendingDataMainMenu(e){"use strict";
    // the progress bar set by onsendstream does not currently work with Android
    // Only allow iOS apps to show the progress bar for uploads
    if(Ti.App.isAndroid || typeof e.progress === 'undefined'){
        if(networkStatusLabel !== null){
            networkStatusLabel.setText(e.message);
            uploadingProgressBar.setVisible(false);
            networkStatusLabel.setVisible(true);
        }
    }
    else if(typeof uploadingProgressBar !== 'undefined' && uploadingProgressBar !== null){
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
    var lastUploadStartTimestamp, db;
    
    if(typeof Omadi.display.FormTabs !== 'undefined' && Omadi.display.FormTabs !== null){
        Omadi.display.FormTabs.loggingOut();
    }
    
    Omadi.service.abortFileUpload();
    
    Ti.UI.currentWindow.close();
}

function networkChangedMainMenu(e){"use strict";
    var isOnline = e.online;
    Ti.API.debug("Network changed to online: " + isOnline);
    if (isOnline && isInitialized) {
        Ti.API.debug("Checking for updates from network changed.");
        Omadi.service.checkUpdate();
    }
}

function normalUpdateFromMenu(e){"use strict";
    Omadi.service.checkUpdate('from_menu');
}

function fullUpdateFromMenu(e){"use strict";
    var dbFile, db, result, fileIds, i, listDB;
    
    Omadi.data.setUpdating(true);

    if (!Ti.Network.online) {
        alert("You do not have an Internet connection right now, so new data will not be downloaded until you connect.");
    }
    
    Omadi.data.resetDatabases();
    
    displayWatermark();
    
    setupBottomButtons();

    Omadi.data.setUpdating(false);
    
    Omadi.service.checkUpdate('from_menu');
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
    var db, result, continuousSave, listDB, dialog;
    try{
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT nid, table_name, form_part FROM node WHERE flag_is_updated = 4 AND table_name != 'dispatch' ORDER BY changed DESC");
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
        else{
            
            // Check to see if any photos are orphans
            listDB = Omadi.utils.openListDatabase();
            result = listDB.execute("SELECT COUNT(*) FROM _files WHERE nid = 0");
            if(result.isValidRow()){
                var count = result.field(0);
                if (count > 0){
                     // Let omadi know about the problem
                    Utils.sendErrorReport(count + " photo" + (count > 1 ? "s" : "") + " with a 0 nid was found without a node to load.");
                    Omadi.data.sendDebugData(false);
                    
                    // If no form pops up, that probably means the app crashed while taking a photo and something weird happened
                    listDB.execute("UPDATE _files SET nid = -1000000 WHERE nid = 0");
                    
                    // Let the user know about the problem
                    if (count > 1) {
                        alert(count + " recent photos were not attached to a form properly, but they were saved. To see them, go to Actions -> Photos Not Uploaded");
                    } else {
                        alert("A recent photo was not attached to a form properly, but it was saved. To see it, go to Actions -> Photos Not Uploaded");
                    }
                }
            }
            result.close();
            listDB.close();
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception opening continuous saved node: " + ex);
    }
}

function mainMenuFirstSyncInstallComplete(){"use strict";
    
    Ti.App.removeEventListener('omadi:finishedDataSync', mainMenuFirstSyncInstallComplete);
    
    // Show the first alert
    Ti.App.fireEvent('showNextAlertInQueue');
}

function userInitiatedUpdateCheck(){"use strict";
    Omadi.service.checkUpdate(true, true);
}

function switchedNodeIdMainMenu(e){"use strict";
    Ti.API.debug("Switched it up: " + JSON.stringify(e));
    
    if(typeof Omadi.display.FormTabs !== 'undefined' && Omadi.display.FormTabs !== null){
        Omadi.display.FormTabs.switchedNid(e);
    }
}

function addNewFilesMainMenu(e) {"use strict";
	Ti.API.debug("Added new files: " + JSON.stringify(e));
    
    if(typeof Omadi.display.FormTabs !== 'undefined' && Omadi.display.FormTabs !== null){
        Omadi.display.FormTabs.addNewFiles(e);
    }
}

function photoUploadedMainMenu(e){"use strict";
    Ti.API.info("Photo Uploaded main menu: " + JSON.stringify(e));
    
    if(Omadi.display.FormTabs !== null){
        Omadi.display.FormTabs.photoUploaded(e);
    }
}

function openFormWindow(e){"use strict";
    Omadi.display.openFormWindow(e.node_type, e.nid, e.form_part);
}

( function() {"use strict";
    // Make sure the field cache is reset if the user is logging into a separate account
    Node.resetFieldCache();
	var NFCListener = require('services/NFCListener');
    
    var db, result, formWindow, time_format, askAboutInspection, dialog, i, showingAlert, nowTimestamp;
    
    // Initialize the global scope variable to map deleted nids to saved positive nids
    Ti.App.deletedNegatives = {};
    Ti.App.allowBackgroundUpdate = true;
    Ti.App.allowBackgroundLogout = true;
    Ti.App.closingApp = false;
    
    Ti.UI.currentWindow.appStartMillis = (new Date()).getTime();
    Ti.App.Properties.setDouble("omadi:appStartMillis", Ti.UI.currentWindow.appStartMillis);
   
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
    
    displayWatermark();
    
    // Don't show an alert immediately after the user logs in
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    Ti.App.Properties.setString("last_alert_popup", nowTimestamp);

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
    
    headerListView.add(networkStatusView);
    
    headerListView.add(loggedView);
    headerListView.add(listView);
    headerListView.add(watermarkImage);

    curWin.add(headerListView);

    if (lastSyncTimestamp == 0) {
        db = Omadi.utils.openMainDatabase();
        db.execute("INSERT INTO updated (timestamp, updating) VALUES (0, 0)");
        db.close();
    }

    if (Ti.App.isAndroid) {
        setupAndroidMenu();
    }

    setupBottomButtons();
    
    // First try to remove the listener, as the app may have crashed, and the listeners aren't removed
    
    Ti.App.removeEventListener("doneSendingData", doneSendingDataMainMenu);
    Ti.App.addEventListener("doneSendingData", doneSendingDataMainMenu);
    
    Ti.App.removeEventListener("doneSendingPhotos", doneSendingPhotosMainMenu);
    Ti.App.addEventListener("doneSendingPhotos", doneSendingPhotosMainMenu);
    
    Ti.App.removeEventListener("sendingData", sendingDataMainMenu);
    Ti.App.addEventListener("sendingData", sendingDataMainMenu);
    
    Ti.App.removeEventListener('loggingOut', loggingOutMainMenu);
    Ti.App.addEventListener('loggingOut', loggingOutMainMenu);
    
    Ti.App.removeEventListener('full_update_from_menu', fullUpdateFromMenu);
    Ti.App.addEventListener('full_update_from_menu', fullUpdateFromMenu);
    
    Ti.App.removeEventListener('omadi:finishedDataSync', setupBottomButtons);
    Ti.App.addEventListener('omadi:finishedDataSync', setupBottomButtons);
    
    Ti.App.removeEventListener('normal_update_from_menu', normalUpdateFromMenu);
    Ti.App.addEventListener('normal_update_from_menu', normalUpdateFromMenu);
    
    Ti.App.removeEventListener('showNextAlertInQueue', showNextAlertInQueue);
    Ti.App.addEventListener('showNextAlertInQueue', showNextAlertInQueue);
    
    Ti.App.removeEventListener("omadi:syncInstallComplete", displayBundleList);
    Ti.App.addEventListener("omadi:syncInstallComplete", displayBundleList);
    
    Ti.App.removeEventListener('switchedItUp', switchedNodeIdMainMenu);
    Ti.App.addEventListener('switchedItUp', switchedNodeIdMainMenu);
    
    Ti.App.removeEventListener('newFilesAdded', addNewFilesMainMenu);
    Ti.App.addEventListener('newFilesAdded', addNewFilesMainMenu);
    
    Ti.App.removeEventListener('openFormWindow', openFormWindow);
    Ti.App.addEventListener('openFormWindow', openFormWindow);
    
    Ti.App.removeEventListener('sendUpdates', Omadi.service.sendUpdates);
    Ti.App.addEventListener('sendUpdates', Omadi.service.sendUpdates);
    
    Ti.App.removeEventListener('sendComments', sendCommentsMainMenu);
    Ti.App.addEventListener('sendComments', sendCommentsMainMenu);
    
    Ti.App.removeEventListener('openViewWindow', openViewWindowMainMenu);
    Ti.App.addEventListener('openViewWindow', openViewWindowMainMenu);
    
    if(Ti.App.isIOS){
        Ti.App.removeEventListener('resume', Omadi.service.checkUpdate);
        Ti.App.addEventListener('resume', Omadi.service.checkUpdate);
    }
    
    Ti.Network.removeEventListener('change', networkChangedMainMenu);
    Ti.Network.addEventListener('change', networkChangedMainMenu);

    listView.addEventListener('click', function(e) {
        var nextWindow, bundle;
        try{
            Omadi.data.setUpdating(true);
            
            bundle = Omadi.data.getBundle(e.row.name_table);
            
            if (e.source.is_plus || !bundle.can_view) {
                // A click anywhere when only create permissions are available will go to the new form
                Omadi.display.openFormWindow(e.row.name_table, 'new', 0);
            }
            else {
                Omadi.display.openListWindow(e.row.name_table, e.row.show_plus, [], [], false);
            }
    
            Omadi.data.setUpdating(false);
        }
        catch(ex){
            Utils.sendErrorReport("Exception swith listview clicked on main menu: " + ex);
        }
    });
    
    refresh_image.addEventListener('click', userInitiatedUpdateCheck);
    
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

	var callback;
    if ( typeof curWin.fromSavedCookie !== 'undefined' && !curWin.fromSavedCookie) {
        
        // The option dialog should go after clock in, but some of the options
        // are blocked because of the alert dialog being show in askclockin
        
        callback = Omadi.bundles.timecard.askClockIn;
        Omadi.bundles.companyVehicle.askAboutVehicle();
    }
    
    Omadi.location.isLocationEnabled(callback);
    
    Ti.API.debug("before init");
    Omadi.push_notifications.init();
    
    Ti.UI.currentWindow.addEventListener('close', function() {
        try{
            Ti.API.info('Closing main menu');
            
            clearInterval(Ti.App.syncInterval);
            clearInterval(Ti.App.photoUploadCheck);
            
            if(Ti.App.isIOS){
                Ti.App.removeEventListener('resume', Omadi.service.checkUpdate);
            }
            
            Ti.App.removeEventListener('showNextAlertInQueue', showNextAlertInQueue);
            Ti.App.removeEventListener("omadi:syncInstallComplete", displayBundleList);
            Ti.App.removeEventListener("doneSendingData", doneSendingDataMainMenu);
            Ti.App.removeEventListener("doneSendingPhotos", doneSendingPhotosMainMenu);
            Ti.App.removeEventListener("sendingData", sendingDataMainMenu);
            Ti.App.removeEventListener('loggingOut', loggingOutMainMenu);
            Ti.App.removeEventListener('sendUpdates', Omadi.service.sendUpdates);
            Ti.App.removeEventListener('sendComments', sendCommentsMainMenu);
            Ti.App.removeEventListener('openViewWindow', openViewWindowMainMenu);
            Ti.App.removeEventListener('omadi:finishedDataSync', setupBottomButtons);
            Ti.App.removeEventListener('normal_update_from_menu', normalUpdateFromMenu);
            Ti.App.removeEventListener('full_update_from_menu', fullUpdateFromMenu);
            Ti.App.removeEventListener('switchedItUp', switchedNodeIdMainMenu);
            Ti.App.removeEventListener('newFilesAdded', addNewFilesMainMenu);
            Ti.App.removeEventListener('openFormWindow', openFormWindow);
            
            Ti.Network.removeEventListener('change', networkChangedMainMenu);
            
            // Release memory
            try{
                Ti.UI.currentWindow.remove(loggedView);
                Ti.UI.currentWindow.remove(networkStatusView);
                Ti.UI.currentWindow.remove(databaseStatusView);
                Ti.UI.currentWindow.remove(listView);
            }
            catch(ex){
                Ti.API.debug("Could not remove a view from the main menu window");
            }
            
            loggedView = null;
            listView = null;
            curWin = null;
            
            refresh_image = null;
            label_top = null;
            offImage = null;
            actionsButton = null;
            a = null;
        }
        catch(ex1){
            Utils.sendErrorReport("In closing of main menu: " + ex1);
        }
    });
    
    // Only after the first sync after login
    Ti.App.addEventListener('omadi:finishedDataSync', mainMenuFirstSyncInstallComplete);
    
    Ti.API.debug("About to check for updates.");
    Omadi.service.checkUpdate('from_menu');
    
    // Allow the main menu to show up faster and on iOS, if that doesn't happen, the main menu will appear on top of the form screen
    // Wait some time before loading the continuous node
    setTimeout(showContinuousSavedNode, 1000);
    
    isInitialized = true;
}());

