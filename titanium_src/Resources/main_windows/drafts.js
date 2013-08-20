Ti.include('/lib/functions.js');

/*jslint eqeq: true, plusplus: true*/
/*global  Omadi*/

var curWin = Ti.UI.currentWindow;
curWin.setBackgroundColor('#eee');

var tableView = null;
var win_new;
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
    label = Titanium.UI.createButton({
        title : 'Drafts',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
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
        if(e.index == 0){
            Ti.API.debug("DELETING nid " + e.source.nid);
            Omadi.data.deleteNode(e.source.nid);
            Drafts.refreshDrafts();
        }
    });
    
    dialog.show();
};

Drafts.refreshDrafts = function(){"use strict";
    var db, count, result, row, textView, rowImg, titleLabel, timeLabel, 
        empty, search, dialog, children, i;

    db = Omadi.utils.openMainDatabase();

    count = 0;
    tableData = [];
    result = db.execute('SELECT * FROM node WHERE flag_is_updated IN (3,4) ORDER BY changed DESC');
    if (result.rowCount == 0) {
        result = null;
        //Ti.API.info('0 drafts');
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
                image: Omadi.display.getNodeTypeImagePath(result.fieldByName('table_name')),
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
            barColor : '#666',
            showCancel: true,
            color: '#000',
            backgroundColor: '#666'
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
        
        tableView.addEventListener('touchstart', function(e) {
            search.blur();
        });
        
        tableView.addEventListener('scroll', function(e) {
            search.blur();
        });

        search.addEventListener('return', function(e) {
            search.blur();
            //hides the keyboard
        });

        search.addEventListener('cancel', function(e) {
            search.blur();
            //hides the keyboard
        });

        //When the user clicks on a certain contact, it opens individual_contact.js
        tableView.addEventListener('click', function(e) {
            //Hide keyboard when returning
// 
            // if (e.row.nid != null) {
                // Omadi.display.openFormWindow(e.row.node_type, e.row.nid, e.row.form_part);
            // }
            
            if(e.row.nid != null){
                Omadi.display.showDialogFormOptions(e, [{
                    text: 'Delete Draft',
                    callback: Drafts.deleteDraft,
                    callbackArgs: [e.row.nid]
                }]);
            }
        });

        // tableView.addEventListener('longclick', function(e) {
// 
            // if (e.row.nid != null) {
//                 
                // Titanium.Media.vibrate();
// 
                // dialog = Titanium.UI.createAlertDialog({
                    // title : 'Omadi',
                    // buttonNames : ['Yes', 'No'],
                    // cancel : 1,
                    // click_index : e.index,
                    // sec_obj : e.section,
                    // row_obj : e.row
                // });
// 
                // dialog.message = 'Are you sure you want to delete the draft "' + e.row.searchValue + '" ?';
                // dialog.show();
// 
                // dialog.addEventListener('click', function(e) {
                    // if (e.cancel === false) {
//                        
                        // tableView.deleteRow(tableView.data[0][e.source.click_index]);
                        // var db = Omadi.utils.openMainDatabase();
                        // db.execute('UPDATE node SET flag_is_updated = 4 WHERE nid=' + e.source.row_obj.nid);
                        // db.close();
                    // }
                // });
            // }
        // });

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

(function() {"use strict";

    var db, result, i, count, section, fullName, row, 
        empty, search, formWindow, dialog, textView, titleLabel, rowImg, timeLabel;
    //Current window's instance

    curWin.setOrientationModes([Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]);
    
    wrapperView = Ti.UI.createView({
       layout: 'vertical',
       bottom: 0,
       top: 0,
       right: 0,
       left: 0 
    });
    
    //When back button on the phone is pressed, it opens mainMenu.js and close the current window
    curWin.addEventListener('android:back', function() {
        //Enable background updates
        //Omadi.data.setUpdating(false);
        curWin.close();
    });
    
    Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });
    
    Ti.App.addEventListener("savedNode", function(){
        
        if(Ti.App.isAndroid){
            Ti.UI.currentWindow.close();
        }
        else{
            Ti.UI.currentWindow.hide();
            // Close the window after the maximum timeout for a node save
            setTimeout(Ti.UI.currentWindow.close, 65000);
        }
    });
    
    Drafts.refreshDrafts();
    
    curWin.add(wrapperView);
    
}());

