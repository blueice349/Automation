Ti.include('/lib/functions.js');

/*jslint eqeq:true, plusplus: true, nomen: true*/

var curWin = Ti.UI.currentWindow;
curWin.isTopWindow = true;
curWin.backgroundColor = '#eee';
curWin.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);

var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {
    fontSize : 15,
    fontWeight : 'bold'
};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';

var version = 'Omadi Inc';
var isFirstTime = false;

var databaseStatusView = Titanium.UI.createView({
    backgroundColor : '#000',
    height : 45,
    width : '100%',
    bottom : 0,
    layout : 'horizontal',
    zIndex : 100
});

//Common used functions
Omadi.data.setUpdating(false);
Ti.App.Properties.setBool("isSendingData", false);

var listView;

var jsonLogin = JSON.parse(Ti.App.Properties.getString("Omadi_session_details"));

Ti.API.debug(jsonLogin);

var name = jsonLogin.user.realname;
var roles = jsonLogin.user.roles;

Ti.App.Properties.setObject('userRoles', roles);
Ti.App.addEventListener("syncInstallComplete", displayBundleList);

var loggedView = Titanium.UI.createView({
    top : 0,
    backgroundColor : '#111',
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
    borderRadius : 5,
    color : '#000',
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

function checkUpdate(useProgressBar) {"use strict";
    var db, result;

    if ( typeof useProgressBar === 'undefined') {
        useProgressBar = false;
    }
    else {
        useProgressBar = true;
    }

    if ( typeof curWin.isTopWindow !== 'undefined' && curWin.isTopWindow) {
        useProgressBar = true;
    }

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT * FROM node WHERE flag_is_updated=1');

    if (result.rowCount > 0) {
        Omadi.service.sendUpdates();
    }
    result.close();
    db.close();

    Omadi.service.fetchUpdates(useProgressBar);
}

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
            checkUpdate('from_menu');
        });

        menu_draft.addEventListener('click', function() {
            Omadi.display.openDraftsWindow();
        });
    };
}

function setupBottomButtons() {"use strict";
    var alertsView, alertsImg, alertsLabel, draftsView, draftsImg, draftsLabel, 
        actionsView, actionsImg, actionsLabel, recentView, recentLabel, recentImg;

    alertsView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '33%',
        height: 45,
        layout: 'vertical',
        color: '#fff'
    });
    databaseStatusView.add(alertsView);

    alertsImg = Ti.UI.createImageView({
        image : '/images/msg3.png',
        height: 22,
        width: 22,
        top: 2
    });
    alertsLabel = Ti.UI.createLabel({
        text : 'Alerts',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0,
        color: '#fff',
        width: Ti.UI.SIZE,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });

    alertsView.add(alertsImg);
    alertsView.add(alertsLabel);
    alertsView.addEventListener('click', function() {
        var alertsWindow;

        alertsWindow = Ti.UI.createWindow({
            navBarHidden : true,
            url : '/main_windows/message_center.js'
        });

        Omadi.display.loading();

        alertsWindow.addEventListener('open', Omadi.display.doneLoading);
        alertsWindow.open();
    });

    draftsView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '33%',
        height: 45,
        layout: 'vertical',
        color: '#fff'
    });

    databaseStatusView.add(draftsView);

    draftsImg = Ti.UI.createImageView({
        image : '/images/drafts.png',
        height: 22,
        width: 22,
        top: 2
    });

    draftsLabel = Ti.UI.createLabel({
        text : 'Drafts',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0,
        color: '#fff',
        width: Ti.UI.SIZE,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
    });

    draftsView.add(draftsImg);
    draftsView.add(draftsLabel);
    draftsView.addEventListener('click', function() {
        Omadi.display.openDraftsWindow();
    });

    recentView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '33%',
        height: 45,
        layout: 'vertical',
        color: '#fff'
    });
    databaseStatusView.add(recentView);
    
    recentImg = Ti.UI.createImageView({
        image : '/images/clock.png',
        height: 22,
        width: 22,
        top: 2
    });
    recentLabel = Ti.UI.createLabel({
        text : 'Recent',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0,
        color: '#fff',
        width: Ti.UI.SIZE,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
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


    if (Ti.App.isIOS) {
        draftsView.width = alertsView.width = recentView.width = '25%';

        actionsView = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : '25%',
            layout : 'vertical'
        });
        databaseStatusView.add(actionsView);

        actionsImg = Ti.UI.createImageView({
            image : '/images/actions.png',
            width : 22,
            height : 22,
            top : 2
        });
        actionsLabel = Ti.UI.createLabel({
            text : 'Actions',
            color : '#FFFFFF',
            height : 21,
            width : Ti.UI.SIZE,
            textAlign : 'center',
            font : {
                fontSize : 14
            }
        });
        actionsView.add(actionsImg);
        actionsView.add(actionsLabel);

        actionsView.addEventListener('click', function() {
            var postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = ['Sync Data', 'About', 'Cancel'];
            //postDialog.cancel = 2;
            postDialog.show();

            postDialog.addEventListener('click', function(ev) {
                if (ev.index == 0) {
                    checkUpdate('from_menu');
                }
                else if (ev.index == 1) {
                    Omadi.display.openAboutWindow();
                }
            });
        });
    }

    curWin.add(databaseStatusView);
}

function askToDoInspection(){"use strict";
    var dialog, bundle;
    /*global roles, ROLE_ID_FIELD*/
    
    if(typeof curWin.fromSavedCookie !== 'undefined' && !curWin.fromSavedCookie){
        
        bundle = Omadi.data.getBundle('inspection');
        if(bundle && bundle.can_create == 1){
            if(typeof roles[ROLE_ID_FIELD] !== 'undefined' && roles[ROLE_ID_FIELD] > ''){
    
                dialog = Ti.UI.createAlertDialog({
                   title: 'Driver\'s Inspection Report',
                   message: 'Do you want to create an inspection report now?',
                   buttonNames: ['Yes', 'No'] 
                });
                
                dialog.addEventListener('click', function(e){
                   if(e.index == 0){
                       Omadi.display.openFormWindow('inspection', 'new', 0);
                   } 
                   else{
                       e.source.close();
                   }
                });
                
                dialog.show();
            }
        }
    }
}

( function() {"use strict";
        var db, formWindow, time_format, askAboutInspection;
        
        askToDoInspection();

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

        curWin.add(loggedView);
        curWin.add(networkStatusView);

        if (lastSyncTimestamp == 0) {
            db = Omadi.utils.openMainDatabase();
            db.execute("INSERT INTO updated (timestamp, updating) VALUES (0, 0)");
            db.close();
        }

        if (lastSyncTimestamp == 0) {
            isFirstTime = true;
            checkUpdate('from_menu');
        }
        else {
            isFirstTime = false;
            checkUpdate('from_menu');
        }

        if (Ti.App.isAndroid) {
            setupAndroidMenu();
        }

        setupBottomButtons();

        Ti.App.addEventListener("doneSendingData", function(e) {
            Ti.API.debug("Done Sending data event received");
            networkStatusView.hide();
            Omadi.service.uploadFile();
        });

        Ti.App.addEventListener("doneSendingPhotos", function() {
            networkStatusView.hide();
        });

        Ti.App.addEventListener("sendingData", function(e) {
            networkStatusLabel.setText(e.message);
            networkStatusView.show();
        });

        Ti.App.addEventListener('loggingOut', function() {
            clearInterval(Ti.App.syncInterval);
            Ti.UI.currentWindow.close();
        });

        Ti.Network.addEventListener('change', function(e) {
            var isOnline = e.online;
            if (isOnline) {
                checkUpdate();
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

        refresh_image.addEventListener('click', checkUpdate);

        offImage.addEventListener('click', function(e) {

            var verifyLogout = Titanium.UI.createAlertDialog({
                title : 'Logout?',
                message : 'Are you sure you want to logout?',
                buttonNames : ['Yes', 'No'],
                cancel : 1
            });

            verifyLogout.addEventListener('click', function(e) {
                if (e.index !== e.source.cancel) {
                    Omadi.service.logout();
                }
            });

            verifyLogout.show();
        });

        curWin.addEventListener('close', function() {
            Ti.API.info('Closing main menu');
        });

        //When back button on the phone is pressed, it alerts the user (pop up box)
        // that he needs to log out in order to go back to the root window
        curWin.addEventListener('android:back', function() {
            var verifyLogout = Titanium.UI.createAlertDialog({
                title : 'Logout?',
                message : 'Are you sure you want to logout?',
                buttonNames : ['Yes', 'No'],
                cancel : 1
            });

            verifyLogout.addEventListener('click', function(e) {
                if (e.index !== e.source.cancel) {
                    Ti.API.info('The yes button was clicked.');

                    Omadi.service.logout();
                }
            });

            verifyLogout.show();
        });

        Ti.App.syncInterval = setInterval(checkUpdate, 300000);

        Ti.App.addEventListener('full_update_from_menu', function() {
            var dbFile, db, result;
            
            Omadi.data.setUpdating(true);
            
            Omadi.data.setLastUpdateTimestamp(0);
            //If delete_all is present, delete all contents:
            
            if(!Ti.Network.online){
                alert("You do not have an Internet connection right now, so new data will not be downloaded until you connect.");
            }
            
            db = Omadi.utils.openMainDatabase();
    
            result = db.execute("SELECT id FROM _photos");
            if(result.rowCount > 0){
                alert("One or more photos were not uploaded to the server, so they will be stored on this device now.");
                
                while(result.isValidRow()){
                    
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

            Omadi.data.setUpdating(false);
            checkUpdate('from_menu');
        });

        Ti.App.addEventListener('normal_update_from_menu', function() {
            checkUpdate('from_menu');
        });

    }());

