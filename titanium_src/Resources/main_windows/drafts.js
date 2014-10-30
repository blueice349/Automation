Ti.include('/lib/functions.js');

/*jslint eqeq: true, plusplus: true*/
/*global  Omadi*/

var curWin = Ti.UI.currentWindow;
curWin.setBackgroundColor('#eee');

var Utils = require('lib/Utils');

var Display = require('lib/Display');
Display.setCurrentWindow(Ti.UI.currentWindow, 'drafts');

var tableView = null;
var tableData;
var wrapperView;

var Drafts = {};

function addiOSToolbar() {"use strict";
    var back, space, label, toolbar;
    
    if (tableView !== null) {
        tableView.top = 40;
    }
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    back.addEventListener('click', function() {
        //Omadi.data.setUpdating(false);
        curWin.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    label = Titanium.UI.createLabel({
        text : 'Drafts',
        color : '#333',
        ellipsize : true,
        wordwrap : false,
        width : Ti.UI.SIZE,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    // create and add toolbar
    toolbar = Titanium.UI.iOS.createToolbar({
        items : [back, space, label, space],
        top : 0,
        borderTop : false,
        borderBottom : false,
        height: Ti.UI.SIZE
    });
    
    wrapperView.add(toolbar);
}


Drafts.deleteDraft = function(nid){"use strict";

    var dialog;
    
    dialog = Ti.UI.createAlertDialog({
       title: 'Really Delete Draft?',
       buttonNames: ['Delete', 'Cancel'],
       cancel: 1,
       nid: nid
    });
    
    dialog.addEventListener('click', function(e){
        try{
            if(e.index == 0){
                Ti.API.debug("DELETING nid " + e.source.nid);
                Omadi.data.deleteNode(e.source.nid);
                Drafts.refreshDrafts();
            }
        }
        catch(ex){
            Utils.sendErrorReport("exception in click for draft delete: " + ex);
        }
    });
    
    dialog.show();
};

Drafts.refreshDrafts = function(){"use strict";
    var db, count, result, row, textView, rowImg, titleLabel, timeLabel, 
        empty, search, children, i;

    db = Omadi.utils.openMainDatabase();

    count = 0;
    tableData = [];
    result = db.execute('SELECT * FROM node WHERE flag_is_updated IN (3,4) ORDER BY changed DESC');
    if (result.rowCount == 0) {
        result = null;
    }
    else {

        while (result.isValidRow()) {

            row = Ti.UI.createTableViewRow({
                width: '100%',
                height: Ti.UI.SIZE,
                nid: result.fieldByName('nid'),
                form_part : result.fieldByName('form_part'),
                node_type : result.fieldByName('table_name'),
                backgroundColor: '#fff',
                searchValue: result.fieldByName('title')
            });
            
            textView = Ti.UI.createView({
                right: 1,
                left: 50,
                top: 0,
                height: Ti.UI.SIZE,
                layout: 'vertical'
            });
            
            rowImg = Ti.UI.createImageView({
                image: Omadi.display.getIconFile(result.fieldByName('table_name')),
                left: 5,
                top: 5,
                bottom: 5,
                width: 35,
                height: 35
            });
            
            titleLabel = Ti.UI.createLabel({
                width: '100%',
                text: result.fieldByName('title'),
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                height: Ti.UI.SIZE,
                font: {
                    fontSize: 16
                },
                color: '#000',
                left: 5
            });
            
            timeLabel = Ti.UI.createLabel({
                text: 'Saved ' + Omadi.utils.getTimeAgoStr(result.fieldByName('changed')),
                height: Ti.UI.SIZE,
                width: '100%',
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                color: '#999',
                font: {
                    fontSize: 14
                },
                left: 5
            });
            
            row.add(rowImg);
            textView.add(titleLabel);
            textView.add(timeLabel);
            row.add(textView);
            
            tableData.push(row);
            count++;
            result.next();
        }
    }
    
    children = wrapperView.getChildren();
    if(children.length){
        for(i = children.length - 1; i >= 0; i --){
            if(children.hasOwnProperty(i)){
                wrapperView.remove(children[i]);
            }
        }
    }
    
    if (Ti.App.isIOS) {
        addiOSToolbar();
    }

    //Check if the list is empty or not
    if (tableData.length < 1) {
        //Shows the empty list
        empty = Titanium.UI.createLabel({
            height : Ti.UI.FILL,
            width : '100%',
            text : 'No drafts have been saved',
            color : '#999',
            font : {
                fontSize : 22,
                fontWeight : 'bold'
            },
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });

        wrapperView.add(empty);
        
    }
    else {

        search = Ti.UI.createSearchBar({
            hintText : 'Search...',
            autocorrect : false,
            showCancel: true
        });
        
        if(Ti.App.isAndroid){
            search.height = 45;
        }
        else{
            search.height = 35;
        }
        
        search.addEventListener('change', function(e){
            var v, i, regex, filterData = [];
            
            v = e.source.value;
            v = v.replace(/([\(\)\[\]\:\-\?\.\^\$\\\*\+\|\{\}])/g, "\\" + "$1");
            regex = new RegExp(v, 'i');
            
            for(i = 0; i < tableData.length; i ++){
                
                if(tableData[i].searchValue.search(regex) != -1) {
                    filterData.push(tableData[i]);
                }
            }
            
            tableView.setData(filterData);
        });
        
        search.addEventListener('cancel', function(e){
            tableView.setData(tableData);
            e.source.setValue('');
            e.source.blur();
        });
        
        search.addEventListener('return', function(e){
            e.source.blur();
        });
        
        search.addEventListener('touchcancel', function(e){
            e.source.blur();
        });
        
        wrapperView.add(search);
        
        //Sort the array (A>B>C>...>Z):
        tableData.sort(Omadi.utils.sortByName);

        tableView = Titanium.UI.createTableView({
            data : tableData,
            top : 0,
            bottom: 0,
            separatorColor : '#ccc'
        });
        
        if(Ti.App.isIOS){
            tableView.footerView = Ti.UI.createView({
                height: 50,
                width: '100%'
            });
        }
        
        tableView.addEventListener('touchstart', function() {
            search.blur();
        });
        
        tableView.addEventListener('scroll', function() {
            search.blur();
        });

        search.addEventListener('return', function() {
            search.blur();
            //hides the keyboard
        });

        search.addEventListener('cancel', function() {
            search.blur();
            //hides the keyboard
        });

        //When the user clicks on a certain contact, it opens individual_contact.js
        tableView.addEventListener('click', function(e) {
            //Hide keyboard when returning
            try{            
                if(e.row.nid != null){
                    Omadi.display.showDialogFormOptions(e, [{
                        text: 'Delete Draft',
                        callback: Drafts.deleteDraft,
                        callbackArgs: [e.row.nid]
                    }]);
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception in drafts tableview click: " + ex);
            }
        });

        //Adds contact list container to the UI
        wrapperView.add(tableView);
        search.blur();
        
        setTimeout(function() {
            search.blur();
        }, 100);
    }

    if (result !== null) {
        result.close();
    }

    db.close();
};

function closeDraftsWindow(){"use strict";   
    Ti.UI.currentWindow.close();
}

(function() {"use strict";
    //Current window's instance
    wrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    if(Ti.App.isIOS7){
        wrapperView.top = 20;
    }
    
    //When back button on the phone is pressed, it opens mainMenu.js and close the current window
    curWin.addEventListener('android:back', function() {
        //Enable background updates
        curWin.close();
    });
    
    Ti.App.removeEventListener('loggingOut', closeDraftsWindow);
    Ti.App.addEventListener('loggingOut', closeDraftsWindow);
    
    Ti.App.removeEventListener("savedNode", closeDraftsWindow);
    Ti.App.addEventListener("savedNode", closeDraftsWindow);
    
    Drafts.refreshDrafts();
    
    curWin.add(wrapperView);
    
}());

