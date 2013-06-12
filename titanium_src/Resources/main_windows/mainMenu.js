Ti.include('/lib/functions.js');

if (Ti.App.isIOS) {
    Ti.include('/lib/iOS/backgroundLocation.js');
}


var cameraAndroid;

if (Ti.App.isAndroid) {
    //cameraAndroid = require('com.omadi.camera');
    cameraAndroid = require('com.omadi.newcamera');
}

/*jslint eqeq:true, plusplus: true, nomen: true*/

var curWin = Ti.UI.currentWindow;
curWin.isTopWindow = true;
curWin.backgroundColor = '#eee';
curWin.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);

// var toolActInd = Ti.UI.createActivityIndicator();
// toolActInd.font = {
    // fontSize : 15,
    // fontWeight : 'bold'
// };
// toolActInd.color = 'white';
// toolActInd.message = 'Loading...';

var version = 'Omadi Inc';
var isFirstTime = false;
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
var ImageFactory = null;

var jsonLogin = JSON.parse(Ti.App.Properties.getString("Omadi_session_details"));

Ti.API.debug(jsonLogin);

var name = jsonLogin.user.realname;
var roles = jsonLogin.user.roles;

Ti.App.Properties.setObject('userRoles', roles);
Ti.App.addEventListener("syncInstallComplete", displayBundleList);

var loggedView = Titanium.UI.createView({
    top : 0,
    backgroundColor : '#333',
    height : 45,
    width : '100%',
    opacity : 1
});

var networkStatusView = Ti.UI.createView({
    zIndex : 1000,
    top : 0,
    height : 45,
    width : '100%',
    backgroundColor : '#111',
    visible : false
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

//function lock_screen() {"use strict";
//curWin.touchEnabled = false;
//databaseStatusView.touchEnabled = false;
//databaseStatusView.focusable = false;
//}

//function unlock_screen() {"use strict";
//curWin.touchEnabled = true;
//databaseStatusView.touchEnabled = true;
//databaseStatusView.focusable = true;
//}



function displayBundleList() {"use strict";
    var db, result, dataRows, name_table, i, j, k, display, description, row_t, icon, titleLabel, plusButton, can_view, can_create;
    /*global ROLE_ID_ADMIN*/

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

        var menu, menuItem, menu_draft, menu_about;

        menu = e.menu;

        menuItem = menu.add({
            title : 'Sync Data',
            order : 0
        });
        menuItem.setIcon('/images/item1.png');

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

        menu_about.addEventListener("click", function(e) {
            Omadi.display.openAboutWindow();
        });

        menuItem.addEventListener("click", function(e) {
            Omadi.service.checkUpdate('from_menu');
        });

        menu_draft.addEventListener('click', function() {
            Omadi.display.openDraftsWindow();
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

    // draftsView = Ti.UI.createView({
        // backgroundSelectedColor : 'orange',
        // focusable : true,
        // width : '33%',
        // height : 45,
        // layout : 'vertical',
        // color : '#fff'
    // });
// 
    // databaseStatusView.add(draftsView);
// 
    // draftsImg = Ti.UI.createImageView({
        // image : '/images/drafts.png',
        // height : 22,
        // width : 22,
        // top : 2
    // });
// 
    // draftsLabel = Ti.UI.createLabel({
        // text : 'Drafts',
        // font : {
            // fontSize : 14
        // },
        // height : Ti.UI.SIZE,
        // bottom : 0,
        // color : '#fff',
        // width : Ti.UI.SIZE,
        // textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
    // });
// 
    // draftsView.add(draftsImg);
    // draftsView.add(draftsLabel);
    // draftsView.addEventListener('click', function() {
        // Omadi.display.openDraftsWindow();
    // });
    
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

( function() {"use strict";
        var db, formWindow, time_format, askAboutInspection, dialog, i, showingAlert, firstAlert;

        if (Ti.App.isAndroid) {
            ImageFactory = require('ti.imagefactory');
        }
        
        listView = Titanium.UI.createTableView({
            data : [],
            top : 45,
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

        curWin.add(listView);

        networkStatusView.add(networkStatusLabel);

        displayBundleList();

        loggedView.add(refresh_image);

        loggedView.add(label_top);
        loggedView.add(offImage);
        
        loggedView.add(actionsButton);
        
        actionsButton.addEventListener('click', function(){
           
           Omadi.display.openActionsWindow();
           
           // if (Omadi.bundles.timecard.userShouldClockInOut()) {
               // if (Omadi.bundles.timecard.isUserClockedIn()){
                   // options.push('Clock Out');
               // }
               // else{
                   // options.push('Clock In');
               // }
           // }
        });

        curWin.add(loggedView);
        curWin.add(networkStatusView);

        if (lastSyncTimestamp == 0) {
            db = Omadi.utils.openMainDatabase();
            db.execute("INSERT INTO updated (timestamp, updating) VALUES (0, 0)");
            db.close();
            
            Ti.App.Properties.setBool("doingFullReset", true);
        }

        if (lastSyncTimestamp == 0) {
            isFirstTime = true;
            Omadi.service.checkUpdate('from_menu');
        }
        else {
            isFirstTime = false;
            Omadi.service.checkUpdate('from_menu');
        }

        if (Ti.App.isAndroid) {
            setupAndroidMenu();
        }

        setupBottomButtons();

        Ti.App.addEventListener("doneSendingData", function(e) {
            Ti.API.debug("Done Sending data event received");
            
            //Omadi.service.sendErrorReport('donesendingdata event received');
            networkStatusView.hide();
            Omadi.service.uploadFile();
        });

        Ti.App.addEventListener("doneSendingPhotos", function() {
            networkStatusView.hide();
        });

        Ti.App.addEventListener("sendingData", function(e) {
            networkStatusLabel.setText(e.message);
            networkStatusView.show();
            
            // setTimeout(function(){
                // networkStatusView.hide();
            // }, 15000);
        });

        Ti.App.addEventListener('loggingOut', function() {
            //if(Ti.App.isIOS){
                clearInterval(Ti.App.syncInterval);
                clearInterval(Ti.App.photoUploadCheck);
            //}
            Ti.UI.currentWindow.close();
        });

        Ti.Network.addEventListener('change', function(e) {
            var isOnline = e.online;
            if (isOnline) {
                Omadi.service.checkUpdate();
            }
        });

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

        curWin.addEventListener('close', function() {
            Ti.API.info('Closing main menu');
        });

        //When back button on the phone is pressed, it alerts the user (pop up box)
        // that he needs to log out in order to go back to the root window
        curWin.addEventListener('android:back', function() {
            
            Omadi.display.logoutButtonPressed();
        });

        //if(Ti.App.isAndroid){
        //    Omadi.background.android.startUpdateService();
        //}
        //else{
            Ti.App.syncInterval = setInterval(Omadi.service.checkUpdate, 300000);
        //}
        
        
        Ti.App.photoUploadCheck = setInterval(Omadi.service.uploadFile, 60000);

        Ti.App.addEventListener('full_update_from_menu', function() {
            var dbFile, db, result;
            
            Ti.App.Properties.setBool("doingFullReset", true);
            
            
            
            Omadi.data.setUpdating(true);

            Omadi.data.setLastUpdateTimestamp(0);
            //If delete_all is present, delete all contents:

            if (!Ti.Network.online) {
                alert("You do not have an Internet connection right now, so new data will not be downloaded until you connect.");
            }

            db = Omadi.utils.openMainDatabase();

            result = db.execute("SELECT id FROM _photos");
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
        });
        
        Ti.App.addEventListener('finishedDataSync', setupBottomButtons);

        Ti.App.addEventListener('normal_update_from_menu', function() {
            Omadi.service.checkUpdate('from_menu');
        });

        if ( typeof curWin.fromSavedCookie !== 'undefined' && !curWin.fromSavedCookie) {
            
            // The option dialog should go after clock in, but some of the options
            // are blocked because of the alert dialog being show in askclockin
            
            Omadi.bundles.timecard.askClockIn();
            
            Omadi.bundles.companyVehicle.askAboutVehicle();
            //Omadi.bundles.timecard.askClockIn();
            
            Omadi.bundles.inspection.askToReviewLastInspection();
        }
        
        Omadi.utils.checkVolumeLevel();
        
        Omadi.location.isLocationEnabled();

        if (alertQueue.length) {
            firstAlert = alertQueue.shift();
            firstAlert.show();
        }
        else{
            useAlertQueue = false;
        }

        Ti.App.addEventListener('showNextAlertInQueue', showNextAlertInQueue);

        // if(alertQueue.length > 0){
        // for(i = 0; i < alertQueue.length; i ++){
        //
        // if(i == 0){
        // alertQueue[i].show();
        // currentAlertIndex = 0;
        // }
        //
        // if(alertQueue.length > i + 1){
        // //alertQueue[i].queueIndex = i;
        // alertQueue[i].addEventListener('showNextAlertInQueue', showNextAlertInQueue);
        // }
        // }
        // }
        
        Ti.API.debug("before init");
        Omadi.push_notifications.init();
        
        if(Ti.App.isIOS){
            Ti.App.addEventListener('resume', function(){
                Omadi.service.checkUpdate(); 
            });
        }
      
    }());

