
Ti.include('/lib/functions.js');

/*jslint eqeq:true, plusplus: true, nomen: true*/

var curWin = Ti.UI.currentWindow;
curWin.isTopWindow = true;
curWin.backgroundColor = '#eee';

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
    zIndex: 1000,
    top: 0,
    height: 45,
    width: '100%',
    backgroundColor: '#111',
    visible: false
});

var networkStatusLabel = Ti.UI.createLabel({
   text: 'Testing...',
   color: '#fff',
   font: {
       fontSize: 16
   },
   width: '100%',
   height: 45,
   textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
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


function lock_screen() {"use strict";
    //curWin.touchEnabled = false;
    //databaseStatusView.touchEnabled = false;
    //databaseStatusView.focusable = false;
}

function unlock_screen() {"use strict";
    curWin.touchEnabled = true;
    databaseStatusView.touchEnabled = true;
    databaseStatusView.focusable = true;
}

function checkUpdate(useProgressBar) {"use strict";
    var db, result;
        
    if(typeof useProgressBar === 'undefined'){
        useProgressBar = false;
    }
    else{
        useProgressBar = true;
    }
    
    if(typeof curWin.isTopWindow !== 'undefined' && curWin.isTopWindow){
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
    
    Omadi.service.uploadFile();
}

function displayBundleList() {"use strict";
    var db, result, dataRows, name_table, i, j, k, display, description, flag_display, is_disabled, data, show_plus, 
        app_permissions, permissionsString, row_t, icon, titleLabel, plusButton;
    /*global ROLE_ID_ADMIN, PLATFORM*/
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT * FROM bundles');

    dataRows = [];

    while (result.isValidRow()) {
        
        name_table = result.fieldByName("bundle_name");
        display = result.fieldByName("display_name").toUpperCase();
        description = result.fieldByName("description");
        flag_display = result.fieldByName("display_on_menu");
        is_disabled = result.fieldByName("disabled");
        data = result.fieldByName("_data");
        show_plus = false;
        app_permissions = {
            "can_create" : false,
            "can_update" : false,
            "all_permissions" : false,
            "can_view" : false
        };

        data = JSON.parse(data);
        if (data.no_mobile_display != null && data.no_mobile_display == 1 && data.no_mobile_display == '1') {
            //result.next();
            Ti.API.info("Not displaying " + name_table);
        }
        else{

            if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                show_plus = true;
                app_permissions.can_create = true;
                app_permissions.all_permissions = true;
                app_permissions.can_update = true;
                app_permissions.can_view = true;
            }
            else {
                for (i in data.permissions) {
                    if(data.permissions.hasOwnProperty(i)){
                        for (j in roles) {
                            if(roles.hasOwnProperty(j)){
                                if (i == j) {
                                    //Ti.API.info("====>> " + i);
                                    permissionsString = JSON.stringify(data.permissions[i]);
                                    if (data.permissions[i]['can create'] || data.permissions[i].all_permissions) {
                                        show_plus = true;
                                        app_permissions.can_create = true;
                                    }
            
                                    if (data.permissions[i].all_permissions) {
                                        app_permissions.all_permissions = true;
                                        app_permissions.can_update = true;
                                        app_permissions.can_view = true;
                                        break;
                                    }
            
                                    if (permissionsString.indexOf('update') >= 0 || data.permissions[i].all_permissions) {
                                        app_permissions.can_update = true;
                                    }
            
                                    if (permissionsString.indexOf('view') >= 0 || data.permissions[i].all_permissions) {
                                        app_permissions.can_view = true;
                                    }
            
                                }
                            }
                        }
                    }
                }
            }
    
            if (flag_display == 'true' && (is_disabled != 1 && is_disabled != "1" && is_disabled != "true" && is_disabled != true)) {
    
                if (app_permissions.can_view == false && app_permissions.can_create == false) {
                    Ti.API.info("No permissions for " + name_table);
                }
                else{
                    
                    row_t = Ti.UI.createTableViewRow({
                        height : 45,
                        display : display,
                        name : display,
                        desc : description,
                        name_table : name_table,
                        show_plus : show_plus,
                        app_permissions : app_permissions,
                        selectionStyle : app_permissions.can_view ? 1 : 0,
                        backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
                    });
        
                    icon = Titanium.UI.createImageView({
                        width : 32,
                        height : 32,
                        top : 6,
                        left : 5,
                        image : '/images/icons/' + name_table.toLowerCase() + '.png',
                        desc : description
                    });
        
                    if (icon.toBlob() == null || icon.toBlob().length == 0) {
                        icon.image = '/images/icons/settings.png';
                    }
        
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
        
                    plusButton = Titanium.UI.createButton({
                        backgroundImage : '/images/plus_btn.png',
                        backgroundSelectedImage : '/images/plus_btn_selected.png',
                        width : 54,
                        height : 38,
                        right : 1,
                        is_plus : true
                    });
        
                    if (show_plus === false) {
                        if (PLATFORM === 'android') {
                            plusButton.visible = false;
                        }
                        else {
                            plusButton.hide();
                        }
                    }
        
                    row_t.add(icon);
                    row_t.add(titleLabel);
                    row_t.add(plusButton);
        
                    dataRows.push(row_t);
                    dataRows.sort(Omadi.utils.sortByName);
                    listView.setData(dataRows);
        
                    // if (PLATFORM == 'android') {
                        // row_t.addEventListener('longclick', function(e) {
                            // if (e.source.desc != null && e.source.desc != "") {
                                // alert(e.source.desc);
                            // }
                        // });
                    // }
                    // else {
                        // row_t.addEventListener('longpress', function(e) {
                            // if (e.source.desc != null && e.source.desc != "") {
                                // alert(e.source.desc);
                            // }
                        // });
                    // }
                }
            }
        }
        result.next();
    }
    result.close();

    db.close();
}

function openDraftWindow() {"use strict";
    
    var draftWindow, activityIndicator;
    
    lock_screen();
    activityIndicator = Ti.UI.createActivityIndicator();
    toolActInd.font = {
        fontFamily : 'Helvetica Neue',
        fontSize : 15,
        fontWeight : 'bold'
    };

    toolActInd.color = 'white';
    toolActInd.message = 'Loading...';
    toolActInd.show();

    Ti.API.info('Opening drafts');
    draftWindow = Titanium.UI.createWindow({
        title : 'Drafts',
        navBarHidden : true,
        url : 'drafts.js'
    });
    
    curWin.isTopWindow = false;
                
    draftWindow.addEventListener("close", function(){
       curWin.isTopWindow = true; 
    });

    draftWindow.addEventListener('open', function() {
        unlock_screen();
    });

    draftWindow.open();
    toolActInd.hide();
}


function setupAndroidMenu(){"use strict";

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
            
            var about_win = Ti.UI.createWindow({
                title : 'About',
                navBarHidden : true,
                fullscreen : false,
                backgroundColor : '#EEEEEE',
                url : 'about.js'
            });
           
            curWin.isTopWindow = false;
            
            about_win.addEventListener("close", function(){
               curWin.isTopWindow = true; 
            });
            
            about_win.open();
        });

        menuItem.addEventListener("click", function(e) {
            checkUpdate('from_menu');
        });

        menu_draft.addEventListener('click', function() {
            openDraftWindow();
        });
    };
}

function setupBottomButtons(){"use strict";
    var alertsView, alertsImg, alertsLabel, draftsView, draftsImg, draftsLabel, actionsView, actionsImg, actionsLabel;

    alertsView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '50%'
    });
    databaseStatusView.add(alertsView);
    
    alertsImg = Ti.UI.createImageView({
        image : '/images/msg3.png'
    });
    alertsLabel = Ti.UI.createLabel({
        text : 'Alerts',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0
    });
    
    alertsView.add(alertsImg);
    alertsView.add(alertsLabel);
    alertsView.addEventListener('click', function() {
        var alertsWindow;
        
        alertsWindow = Ti.UI.createWindow({
           navBarHidden: true,
           url: '/main_windows/message_center.js'
        });
    
        alertsWindow.open();
    });
    
    draftsView = Ti.UI.createView({
        backgroundSelectedColor : 'orange',
        focusable : true,
        width : '50%'
    });
    
    databaseStatusView.add(draftsView);
    
    draftsImg = Ti.UI.createImageView({
        image : '/images/drafts.png'
    });
    
    draftsLabel = Ti.UI.createLabel({
        text : 'Drafts',
        font : {
            fontSize : 14
        },
        height : Ti.UI.SIZE,
        bottom : 0
    });
    
    draftsView.add(draftsImg);
    draftsView.add(draftsLabel);
    draftsView.addEventListener('click', function() {
        openDraftWindow();
    });
    
    //View settings (Draft/ Alert/ Home)
    draftsView.height = alertsView.height = 45;
    draftsView.layout = alertsView.layout = 'vertical';
    
    //Label settings (Draft/ Alert/ Home)
    draftsLabel.color = alertsLabel.color = '#FFFFFF';
    draftsLabel.height = alertsLabel.height = 21;
    draftsLabel.width = alertsLabel.width = Ti.UI.SIZE;
    draftsLabel.textAlign = alertsLabel.textAlign = 'center';
    
    //Image view setting (Draft/ Alert/ Home)
    alertsImg.height = draftsImg.height = 22;
    alertsImg.width = draftsImg.width = 22;
    draftsImg.top = alertsImg.top = 2;
    
    
    
    if (PLATFORM !== 'android') {
        draftsView.width = alertsView.width = Ti.Platform.displayCaps.platformWidth / 3;
    
        actionsView = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : Ti.Platform.displayCaps.platformWidth / 3,
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
            postDialog.options = ['Sync Data', 'About', 'cancel'];
            postDialog.cancel = 4;
            postDialog.show();
    
            postDialog.addEventListener('click', function(ev) {
                if (ev.index == 0) {
                    checkUpdate('from_menu');
                }
                //
                //else
                // if (ev.index == 1) {
                // var nav_win = Ti.UI.createWindow({
                // title : 'Navigation',
                // //navBarHidden : false,
                // modal : true,
                // backgroundColor : 'black',
                // url : 'navigation.js'
                // });
                // nav_win.open();
                // }
                // else if (ev.index == 1) {
                    // openDraftWindow();
                // }
                else if (ev.index == 1) {
                    var about_win = Ti.UI.createWindow({
                        title : 'About',
                        navBarHidden : true,
                        fullscreen : false,
                        backgroundColor : 'black',
                        url : 'about.js'
                    });
                    
                    curWin.isTopWindow = false;
                    
                    about_win.addEventListener("close", function(){
                       curWin.isTopWindow = true; 
                    });
                    
                    about_win.open();
                }
            });
        });
    }
    
    
    
    curWin.add(databaseStatusView);
}


(function(){"use strict";
    var db, formWindow, time_format;
    
    /*global PLATFORM*/
   
    listView = Titanium.UI.createTableView({
        data : [],
        top : 45,
        bottom: 45,
        scrollable : true,
        separatorColor : '#BDBDBD'
    });
    
    if(PLATFORM !== 'android'){
        listView.footerView = Ti.UI.createView({
            height: 45,
            width: '100%'
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
    
    if(lastSyncTimestamp == 0){
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
    
    //Sets only portrait mode
    curWin.orientationModes = [Titanium.UI.PORTRAIT];
    
    if (PLATFORM === 'android') {
        setupAndroidMenu();
    }
    
    setupBottomButtons();

    Ti.App.addEventListener("doneSendingData", function(e){
        if(typeof e.contextWindow !== 'undefined'){
            e.contextWindow.close();
        }
        
        networkStatusView.hide();
        Omadi.service.uploadFile();
    });
    
    Ti.App.addEventListener("doneSendingPhotos", function(){
        networkStatusView.hide();
    });
    
    Ti.App.addEventListener("sendingData", function(e){
        networkStatusLabel.setText(e.message);
        networkStatusView.show();
    });
    
    Ti.App.addEventListener('loggingOut', function(){
        clearInterval(Ti.App.syncInterval);
        Ti.UI.currentWindow.close();
    });
    
    Ti.Network.addEventListener('change', function(e) {
        var isOnline = e.online;
        if(isOnline){
            checkUpdate();
        }
    });
    
    listView.addEventListener('click', function(e) {
        var nextWindow;
        
        lock_screen();
        Ti.API.info("row click on table view. index = " + e.index + ", row_desc = " + e.row.description + ", section = " + e.section + ", source_desc=" + e.source.description);
    
        if (e.row.app_permissions.can_view == false && e.source.is_plus != true) {
            alert("You don't have access to view the " + e.row.display + " list.");
            unlock_screen();
            //Omadi.data.setUpdating(false);
            return;
        }
    
        Omadi.data.setUpdating(true);
        
        if (e.source.is_plus) {
            formWindow = Ti.UI.createWindow({
                navBarHidden: true,
                title: "New " + e.row.display,
                type: e.row.name_table,
                nid: 'new',
                url: '/main_windows/form.js'
            });
            
            formWindow.addEventListener('open', function() {
                unlock_screen();
            });
    
            formWindow.open();
        }
        else {
            if (e.row.app_permissions.can_view == true) {
                nextWindow = Titanium.UI.createWindow({
                    navBarHidden : true,
                    title : e.row.display,
                    fullscreen : false,
                    url : 'objects.js',
                    type : e.row.name_table,
                    backgroundColor : '#EEEEEE',
                    show_plus: e.row.show_plus
                });
                
                curWin.isTopWindow = false;
                
                nextWindow.app_permissions = e.row.app_permissions;
                
                nextWindow.addEventListener('focus', function() {
                    unlock_screen();
                });
                
                unlock_screen();
                
                nextWindow.addEventListener('close', function(){
                   curWin.isTopWindow = true; 
                   unlock_screen();
                   Ti.API.debug("Closed");
                });
                
                Omadi.display.loading();
                
                nextWindow.addEventListener('open', function(){
                   Omadi.display.doneLoading();
                });
    
                nextWindow.open();
            }
            else {
                alert("You don't have access to view the " + e.row.display + " list.");
                unlock_screen();
                
            }
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
        var dbFile, db;
        
        Omadi.data.setUpdating(true);  
        
        Omadi.data.setLastUpdateTimestamp(0);
        //If delete_all is present, delete all contents:
        db = Omadi.utils.openMainDatabase();
        
        if(PLATFORM === "android") {
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









