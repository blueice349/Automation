//Common used functions
Ti.include('/lib/functions.js');

/*global PLATFORM, Omadi*/
/*jslint eqeq: true, plusplus: true*/

var domainName = Titanium.App.Properties.getString("domainName");
var message_center = {};
var curWin = Ti.UI.currentWindow;
curWin.setBackgroundColor("#eee");


curWin.is_opened = false;
var listTableView;
//var search;

var accountMessage = {};
accountWindow = {};
//accountMessage.search = null;
accountMessage.listView = null;
accountWindow.isOpened = false;

var actIndAlert;
var refresh_image;
var toolbar; 

var showLoading = function() {"use strict";
    if (PLATFORM === 'android') {
        actIndAlert.show();
    }
    else {
        var items = toolbar.getItems();
        items.pop();
        items.push(actIndAlert);
        toolbar.setItems(items);
        actIndAlert.show();
        refresh_image.hide();
    }
};

var hideLoading = function() {"use strict";
    if (PLATFORM === 'android') {
        actIndAlert.hide();
    }
    else {
        var items = toolbar.getItems();
        items.pop();
        items.push(refresh_image);
        toolbar.setItems(items);
        actIndAlert.hide();
        refresh_image.show();

    }
};


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
            
            //Ti.API.info("======>>> " + result.fieldByName('message'));
            full_msg = result.fieldByName('message');

            t_lb = Titanium.UI.createLabel({
                text : result.fieldByName('subject'),
                height :  Ti.UI.SIZE,
                
                font : {
                    fontSize : '16dp',
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
                    fontSize : '16dp'
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
                height: '10dp',
                width: '100%'
            }));
            rowWrapper.add(t_lb);
            rowWrapper.add(n_lb);
            rowWrapper.add(Ti.UI.createView({
                height: '10dp',
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

function alertNavButtons(lv_listTableView, currentWin, type) {"use strict";
    var backButton, space, label;
    
    if (lv_listTableView) {
        lv_listTableView.top = '40';
        lv_listTableView.height = '97%';
    }
    backButton = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    backButton.addEventListener('click', function() {
        //Omadi.data.setUpdating(false);
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
        width : '200',
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

    refresh_image = Ti.UI.createImageView({
        image : '/images/refresh.png',
        right : '9dp',
        width : '32dp',
        height : 'auto'
    });

    refresh_image.addEventListener('click', function(e) {
        showLoading();
        //_upload_gps_locations();
        Omadi.location.uploadGPSCoordinates();
    });

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : [backButton, space, label, space, actIndAlert, refresh_image],
        top : 0,
        borderTop : false,
        borderBottom : true
    });

    currentWin.add(toolbar);
}

function alertNavButtons_android(lv_listTableView, win, type) {"use strict";
    var baseHeader, label;
    
    if (lv_listTableView) {
        lv_listTableView.top = '50';
        lv_listTableView.bottom = '6%';
    }
    baseHeader = Ti.UI.createView({
        top : 0,
        height : 50,
        backgroundImage : '/images/header.png'
    });

    label = Titanium.UI.createLabel({
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        left : 0,
        right : 41,
        font : {
            fontSize : '18sp',
            fontWeight : 'bold'
        },
        textAlign : 'center'
    });

    if (type != null) {
        label.text = type;
    }
    else {
        label.text = 'Alert List';
    }

    refresh_image = Ti.UI.createImageView({
        image : '/images/refresh.png',
        right : '9dp',
        width : '32dp',
        height : 'auto'
    });

    refresh_image.addEventListener('click', function(e) {
        showLoading();
        //_upload_gps_locations();
        Omadi.location.uploadGPSCoordinates();
    });

    baseHeader.add(label);
    baseHeader.add(refresh_image);
    curWin.add(baseHeader);
}

function loadData() {"use strict";
    var empty, db, result, obj_cnt, insert_it, i, data, fullName, row;

    db = Omadi.utils.openGPSDatabase();
    result = db.execute('SELECT *, COUNT(*) term_count FROM alerts GROUP BY location_nid ORDER BY timestamp DESC');

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
    }
    else {
        listTableView.hide();
        empty = Titanium.UI.createLabel({
            height : 'auto',
            width : 'auto',
            top : '50%',
            color : '#999',
            font : {
                fontWeight : 'bold',
                fontSize : '22dp'
            },
            text : 'No location alerts were found'
        });
        curWin.add(empty);
    }
    db.close();

}

function opnAccountAlertsList(e) {"use strict";
    
    accountWindow = Ti.UI.createWindow({
        navBarHidden : true,
        //title : e.row.lbl + " - Alert List",
        nid : e.row.nid,
        isOpened : false
    });
    accountWindow.isOpened = true;
    
    
    // accountMessage.search = Ti.UI.createSearchBar({
    // hintText : 'Search...',
    // autocorrect : false,
    // barColor : '#000'
    // });

    //Contat list container
    accountMessage.listView = Titanium.UI.createTableView({
        top : '0',
        bottom : '0',
        //search : accountMessage.search,
        separatorColor : '#BDBDBD',
        backgroundColor : '#fff',
        footerView: Ti.UI.createView({
            height: 50,
            width: '100%'
        })
    });
    
    accountWindow.add(accountMessage.listView);
    
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
                Ti.API.info('LOCATION ALERT: Opening node if it exists: ' + n_nid);
                //Next window to be opened
                var win_new = Titanium.UI.createWindow({
                    navBarHidden : true,
                    title : type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
                    type : type_vl,
                    url : 'individual_object.js',
                    nid: n_nid
                });

                win_new.open();
            }
        });
    });

    // accountMessage.listView.addEventListener('focus', function(e) {
    // accountMessage.search.blur();
    // });
    //
    // accountMessage.search.addEventListener('return', function(e) {
    // accountMessage.search.blur();
    // });
    //
    // accountMessage.search.addEventListener('cancel', function(e) {
    // accountMessage.search.blur();
    // });

    if (PLATFORM === 'android') {
        alertNavButtons_android(accountMessage.listView, accountWindow, accountWindow.title);
    }
    else {
        alertNavButtons(accountMessage.listView, accountWindow, accountWindow.title);
    }
    
    accountWindow.addEventListener('android:back', function() {
        accountWindow.close();
    });

    accountWindow.addEventListener('close', function(e) {
        accountWindow.isOpened = false;
    });

    // accountWindow.addEventListener('focus', function() {
    // setTimeout(function() {
    // accountMessage.search.blur();
    // }, 110);
    // });

    accountWindow.open();
    if (PLATFORM == 'android') {
        Ti.UI.Android.hideSoftKeyboard();
    }
    
    loadAccAlertData();
}


( function() {"use strict";

    //Sets only portrait mode
    curWin.orientationModes = [Titanium.UI.PORTRAIT];
    
    Ti.App.addEventListener('loggingOut', function() {
        Ti.UI.currentWindow.close();
    });
    
    //Search bar definition
    // search = Ti.UI.createSearchBar({
    // hintText : 'Search...',
    // autocorrect : false,
    // barColor : '#000'
    // });
    
    //Contat list container
    listTableView = Titanium.UI.createTableView({
        top : '0',
        bottom : '0',
        //search : search,
        separatorColor : '#BDBDBD',
        backgroundColor : '#fff',
        footerView: Ti.UI.createView({
            height: 50,
            width: '100%'
        })
    });
    curWin.add(listTableView);
    
    if (PLATFORM === 'android') {
        actIndAlert = Ti.UI.createActivityIndicator({
            message : 'Updating Alerts...',
            color : '#fff'
        });
        curWin.add(actIndAlert);
    }
    else {
        actIndAlert = Ti.UI.createActivityIndicator({
            height : '32dp',
            width : '32dp',
            style : Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
            right : '12dp'
        });
    }
    
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
    
    if (PLATFORM === 'android') {
        alertNavButtons_android(listTableView, curWin);
        //bottomBack_release(win, "Back", "enable");
    }
    else {
        alertNavButtons(listTableView, curWin);
    }
    
    curWin.is_opened = true;
    loadData();

    Ti.App.addEventListener('refresh_UI_Alerts', function(e) {
        hideLoading();
        //if (curWin && curWin.is_opened === true) {
        //    
        //    if (e.status == 'fail') {
        //        return;
       //     }
            //if (accountWindow.isOpened == true) {
            //    loadAccAlertData();
            //}
            //else {
                loadData();
           // }
       // }
    });
    
    curWin.is_opened = true;
    showLoading();
    Omadi.location.uploadGPSCoordinates();
    
}());



