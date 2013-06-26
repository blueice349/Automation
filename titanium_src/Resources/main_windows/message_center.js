//Common used functions
Ti.include('/lib/functions.js');

/*global  Omadi*/
/*jslint eqeq: true, plusplus: true*/

var domainName = Titanium.App.Properties.getString("domainName");
var message_center = {};
var curWin = Ti.UI.currentWindow;
var wrapperView;
var empty = null;

curWin.setBackgroundColor("#eee");
Ti.UI.currentWindow.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
wrapperView = Ti.UI.createView({
   layout: 'vertical',
   bottom: 0,
   top: 0,
   right: 0,
   left: 0 
});

curWin.is_opened = false;
var listTableView;

var accountMessage = {};
var accountWindow = {};
var accountWrapperView;

accountMessage.listView = null;
accountWindow.isOpened = false;

var refreshImg;
var toolbar; 

function loadAccAlertData() {"use strict";
    var db, result, ch_color, ch, n_data, t_lb, n_lb, full_msg, rowWrapper;

    /*global notifyIOS*/
    
    db = Omadi.utils.openGPSDatabase();

    result = db.execute('SELECT * FROM alerts WHERE location_nid=' + accountWindow.nid + ' ORDER BY timestamp DESC');

    if (result.rowCount > 0) {
        n_data = [];
        ch = 0;
        while (result.isValidRow()) {
            if (ch % 2 != 0) {
                ch_color = '#FFFFFF';
            }
            else {
                ch_color = '#ECF2F3';
            }
            ch++;
            
            full_msg = result.fieldByName('message');

            t_lb = Titanium.UI.createLabel({
                text : result.fieldByName('subject'),
                height :  Ti.UI.SIZE,
                
                font : {
                    fontSize : 16,
                    fontWeight : 'bold'
                },
                left : "2%",
                right : "2%",
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                color : '#0B0B61'
            });

            n_lb = Titanium.UI.createLabel({
                text : full_msg,
                height : Ti.UI.SIZE,
                
                font : {
                    fontSize : 16
                },
                left : "2%",
                right : "2%",
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                color : '#000'
            });

            rowWrapper = Ti.UI.createTableViewRow({
                height : Ti.UI.SIZE,
                width: '100%',
                hasChild : false,
                //color : ch_color,
                layout : 'vertical',
                backgroundColor : ch_color,
                className : "sorted",
                nid : result.fieldByName('ref_nid')
                //title : result.fieldByName('subject')
            });
            //Ti.API.info("NID: " + result.fieldByName('ref_nid'));
            rowWrapper.add(Ti.UI.createView({
                height: 10,
                width: '100%'
            }));
            rowWrapper.add(t_lb);
            rowWrapper.add(n_lb);
            rowWrapper.add(Ti.UI.createView({
                height: 10,
                width: '100%'
            }));

            //Populates the array
            n_data.push(rowWrapper);
            result.next();
        }

        accountMessage.listView.setData(n_data);
        //Search bar definition
    }
    else {
        notifyIOS('There are no messages for this item');

    }

    db.close();
}

function alertNavButtons(currentWin, currentWinWrapper, type) {"use strict";
    var backButton, space, label, items;
    
    backButton = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    backButton.addEventListener('click', function() {
        currentWin.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });

    label = Titanium.UI.createButton({
        title : type,
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
        focusable : false,
        touchEnabled : false,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });
    
    if (type != null) {
        label.title = type;
    }
    else {
        label.title = 'Location Alerts';
    }

    refreshImg = Ti.UI.createImageView({
        image : '/images/refresh.png',
        right : 9,
        width : 32,
        height : Ti.UI.SIZE
    });

    refreshImg.addEventListener('click', function(e) {
        
        Omadi.display.loading("Refreshing...");
        Omadi.location.uploadGPSCoordinates();
    });
    
    items = [backButton, space, label, space];
    
    if(!currentWin.isChild){
        items.push(refreshImg);
    }
    
    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : items,
        top : 0,
        borderTop : false,
        borderBottom : false,
        height: Ti.UI.SIZE
    });

    currentWinWrapper.add(toolbar);
}

function alertNavButtons_android(lv_listTableView, currentWindow, currentWindowWrapper, type) {"use strict";
    var headerView, label;
    
    // if (lv_listTableView) {
        // lv_listTableView.top = 40;
        // lv_listTableView.bottom = 0;
    // }
    
    headerView = Ti.UI.createView({
        top : 0,
        height : 40,
        width: '100%',
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
        }
    });

    label = Titanium.UI.createLabel({
        color : '#666',
        ellipsize : true,
        wordwrap : false,
        left : 0,
        right : 41,
        font : {
            fontSize : 16,
            fontWeight : 'bold'
        },
        textAlign : 'center'
    });

    if (type != null) {
        label.text = type;
    }
    else {
        label.text = 'Location Alerts';
    }

    refreshImg = Ti.UI.createImageView({
        image : '/images/refresh.png',
        right : 9,
        width : 32,
        height : 32
    });

    refreshImg.addEventListener('click', function(e) {
        Omadi.display.loading("Refreshing...");
        
        Omadi.location.uploadGPSCoordinates();
    });

    headerView.add(label);
    
    if(!currentWindow.isChild){
        headerView.add(refreshImg);
    }
    currentWindowWrapper.add(headerView);
}

function loadData() {"use strict";
    var db, result, obj_cnt, insert_it, i, data, fullName, row;

    db = Omadi.utils.openGPSDatabase();
    result = db.execute('SELECT location_label, location_nid, COUNT(*) term_count FROM alerts GROUP BY location_nid ORDER BY timestamp DESC');

    obj_cnt = [];

    while (result.isValidRow()) {
        obj_cnt.push({
            label : result.fieldByName('location_label'),
            nid : result.fieldByName('location_nid'),
            count : result.fieldByName('term_count')
        });
        result.next();
    }
    result.close();

    result = db.execute('SELECT * FROM alert_names');
    while (result.isValidRow()) {
        insert_it = true;
        for ( i = 0; i < obj_cnt.length; i++) {
            if (obj_cnt[i].nid == result.fieldByName('location_nid')) {
                insert_it = false;
            }
        }

        if (insert_it === true) {
            obj_cnt.push({
                label : result.fieldByName('location_label'),
                nid : result.fieldByName('location_nid'),
                count : 0
            });
        }
        result.next();
    }
    result.close();
    db.close();

    data = [];
    //Check if the list is empty or not
    if (obj_cnt.length > 0) {
        for ( i = 0; i < obj_cnt.length; i++) {
            fullName = obj_cnt[i].label + " (" + obj_cnt[i].count + ")";
            row = Ti.UI.createTableViewRow({
                height : Ti.UI.SIZE,
                hasChild : true,
                title : fullName,
                nid : obj_cnt[i].nid,
                color : '#000',
                counter : obj_cnt[i].count,
                lbl : obj_cnt[i].label
            });
            //Parameters added to each row
            row.name = fullName;
            //Populates the array
            data.push(row);
        }
        //listTableView.show();

        //Adds contact list container to the UI
        //search.blur();
        // curWin.addEventListener('focus', function(){
        // setTimeout(function(){
        // search.blur();
        // }, 110 );
        // });
    }
    
    if (data.length > 0) {
        listTableView.setData(data);
        listTableView.setHeight(Ti.UI.FILL);
        listTableView.show();
        
        if(empty !== null){
            empty.setHeight(0);
            empty.hide();
        }
    }
    else {
        listTableView.hide();
        listTableView.height = 0;
        
        if(empty === null){
            empty = Titanium.UI.createLabel({
                height : Ti.UI.FILL,
                width : Ti.UI.SIZE,
                color : '#999',
                font : {
                    fontWeight : 'bold',
                    fontSize : 22
                },
                text : 'No location alerts were found'
            });
            wrapperView.add(empty);
        }
        empty.setHeight(Ti.UI.FILL);
        empty.show();
    }
    db.close();

}

function opnAccountAlertsList(e) {"use strict";
    
    accountWindow = Ti.UI.createWindow({
        navBarHidden : true,
        title : e.row.lbl,
        nid : e.row.nid,
        isOpened : true,
        isChild: true
    });
    
    accountWrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    accountWindow.add(accountWrapperView);
    
    if (Ti.App.isAndroid) {
        alertNavButtons_android(accountMessage.listView, accountWindow, accountWrapperView, accountWindow.title);
    }
    else {
        alertNavButtons(accountWindow, accountWrapperView, accountWindow.title);
    }

    accountMessage.listView = Titanium.UI.createTableView({
        top : 0,
        bottom : 0,
        separatorColor : '#BDBDBD',
        backgroundColor : '#fff',
        footerView: Ti.UI.createView({
            height: 50,
            width: '100%'
        })
    });
    
    accountWrapperView.add(accountMessage.listView);
    
    accountMessage.listView.addEventListener('click', function(row_e) {
        var db, result, n_nid, type_vl, region_f, name_s, dialog;
        //accountMessage.search.blur();
        db = Omadi.utils.openMainDatabase();

        result = db.execute("SELECT * FROM node WHERE nid=" + row_e.row.nid);
        
        n_nid = row_e.row.nid;
        type_vl = result.fieldByName('table_name');
        region_f = result.fieldByName('form_part');
        name_s = result.fieldByName('title');
        result.close();
        db.close();

        dialog = Titanium.UI.createAlertDialog({
            title : 'Omadi - ' + type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
            buttonNames : ['Cancel', 'View Form Data'],
            cancel : 0,
            message : "What would you like to do?"
        });
        dialog.show();
        
        dialog.addEventListener('click', function(dialog_e) {
            
            if (dialog_e.index != dialog_e.source.cancel) {
                
                Omadi.display.openViewWindow(type_vl, n_nid);
            }
        });
    });
    
    accountWindow.addEventListener('android:back', function() {
        accountWindow.close();
    });

    accountWindow.addEventListener('close', function(e) {
        accountWindow.isOpened = false;
    });

  
    accountWindow.open();
    if (Ti.App.isAndroid) {
        Ti.UI.Android.hideSoftKeyboard();
    }
    
    loadAccAlertData();
}

function logginOutMessageCenter(){"use strict";
    Ti.UI.currentWindow.close();
}

function savedNodeMessageCenter(){"use strict";

    if(Ti.App.isAndroid){
        
        if(accountWindow.isOpened){
            accountWindow.close();
        }
        
        Ti.UI.currentWindow.close();
    }
    else{
        
        if(accountWindow.isOpened){
            accountWindow.close();
        }
        
        Ti.UI.currentWindow.hide();
        // Close the window after the maximum timeout for a node save
        setTimeout(Ti.UI.currentWindow.close, 65000);
    }
}

function refreshUIAlertsMessageCenter(e){"use strict";

    Omadi.display.doneLoading();      
    loadData();
}


( function() {"use strict";

    
    Ti.App.addEventListener('loggingOut', logginOutMessageCenter);
    Ti.App.addEventListener("savedNode", savedNodeMessageCenter);
    
    if (Ti.App.isAndroid) {
        alertNavButtons_android(listTableView, curWin, wrapperView);
    }
    else {
        alertNavButtons(curWin, wrapperView);
    }
    
    listTableView = Titanium.UI.createTableView({
        height: Ti.UI.FILL,
        separatorColor : '#BDBDBD',
        backgroundColor : '#fff'
    });
    
    if(Ti.App.isIOS){
        listTableView.footerView = Ti.UI.createView({
            height: 50,
            width: '100%'
        });
    }
    
    wrapperView.add(listTableView);
    
    //When back button on the phone is pressed, it opens mainMenu.js and close the current window
    curWin.addEventListener('android:back', function() {
        //Enable background updates
        curWin.is_opened = false;
        //Omadi.data.setUpdating(false);
        curWin.close();
    });
    
    curWin.addEventListener('close', function() {
        curWin.is_opened = false;
    });
   
    
    // listTableView.addEventListener('focus', function(e) {
    // search.blur();
    // });
    
    // search.addEventListener('return', function(e) {
    // search.blur();
    // });
    
    // search.addEventListener('cancel', function(e) {
    // search.blur();
    // });
    
    //When the user clicks on a certain contact, it opens individual_contact.js
    listTableView.addEventListener('click', function(e) {
        if (e.row != null) {
            opnAccountAlertsList(e);
        }
    });
    
    
    
    curWin.is_opened = true;
    loadData();

    Ti.App.addEventListener('refresh_UI_Alerts', refreshUIAlertsMessageCenter);
    
    curWin.add(wrapperView);
    
    curWin.is_opened = true;
    Omadi.display.loading("Refreshing...");
    Omadi.location.uploadGPSCoordinates();
    
    Ti.UI.currentWindow.addEventListener('close', function(){
        Ti.App.removeEventListener('loggingOut', logginOutMessageCenter);
        Ti.App.removeEventListener("savedNode", savedNodeMessageCenter);
        Ti.App.removeEventListener('refresh_UI_Alerts', refreshUIAlertsMessageCenter);
        
        // Clean up memory
        
        Ti.UI.currentWindow.remove(wrapperView);
        wrapperView = null;
        curWin = null;
    });
    
}());



