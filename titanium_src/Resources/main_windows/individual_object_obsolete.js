
Ti.include("/lib/widgets.js");


/*jslint eqeq:true, plusplus: true*/

//Current window's instance
var curWin = Ti.UI.currentWindow;

Omadi.service.setNodeViewed(curWin.nid);

curWin.backgroundColor = "#EEEEEE";
var movement = curWin.movement;

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
curWin.addEventListener('android:back', function() {"use strict";
    Ti.API.info("Back to the step before");
    curWin.close();
});

function loggingOutIndividualObject(){"use strict";
    Ti.UI.currentWindow.close();
}

function savedNodeIndividualObject(){"use strict";
    Ti.UI.currentWindow.close();
}

Ti.App.removeEventListener('loggingOut', loggingOutIndividualObject);
Ti.App.addEventListener('loggingOut', loggingOutIndividualObject);

Ti.App.removeEventListener("savedNode", savedNodeIndividualObject);
Ti.App.addEventListener("savedNode", savedNodeIndividualObject);



var db = Omadi.utils.openMainDatabase();

//The view where the results are presented
var formWrapperView = Ti.UI.createView({
    top : 0,
    height : '100%',
    width : '100%',
    backgroundColor : '#EEEEEE'
});

curWin.add(formWrapperView);
var scrollView;

if (Ti.App.isAndroid) {
    scrollView = Ti.UI.createScrollView({
        contentHeight : 'auto',
        backgroundColor : '#EEEEEE',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        layout : 'vertical'
    });
}
else {
    
    var scrollViewTop;
    if(Ti.UI.currentWindow.usingDispatch){
        scrollViewTop = 0;
    }
    else{
        scrollViewTop = 45;
    }
    scrollView = Ti.UI.createScrollView({
        top : scrollViewTop,
        contentHeight : 'auto',
        backgroundColor : '#EEEEEE',
        showHorizontalScrollIndicator : false,
        showVerticalScrollIndicator : true,
        layout : 'vertical',
        bottom : '0'
    });
}

formWrapperView.add(scrollView);

//Populate array with field name and configs
var regions = {};
var unsorted_res = [];
var label = [];
var label_file = [];
var file_id = [];
var x = 0;
var content = [];
var border = [];
var cell = [];
var count = 0;
var file_upload_boolean = true;
var upload_boolean = true;
var data_boolean = true;
var heightValue = 60;
var height_label = 5;
var bug = [];
var node;

var fieldNames = [];
var nodeFormPart = 0;

var node_form = db.execute('SELECT form_part, perm_edit FROM node WHERE nid=' + curWin.nid);
var isEditEnabled = (node_form.fieldByName('perm_edit') == 1) ? true : false;

nodeFormPart = node_form.fieldByName('form_part');

omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
roles = omadi_session_details.user.roles;








( function() {"use strict";
        /*jslint vars: true */

        node = Omadi.data.nodeLoad(curWin.nid);

        var regionName;

        for (regionName in regions) {
            if (regions.hasOwnProperty(regionName)) {
                doRegionOutput(regions[regionName]);
            }
        }

        scrollView.add(Ti.UI.createLabel({
            text : 'METADATA',
            color : '#ddd',
            font : {
                fontSize : 16,
                fontWeight : 'bold'
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
            width : '100%',
            touchEnabled : false,
            height : 25,
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
                    color : '#888',
                    offset : 0.0
                }, {
                    color : '#999',
                    offset : 0.3
                }, {
                    color : '#666',
                    offset : 1.0
                }]
            },
            ellipsize : true,
            wordWrap : false
        }));

        var db = Omadi.utils.openMainDatabase();
        var result = db.execute("SELECT realname, uid FROM user WHERE uid IN (" + node.author_uid + "," + node.changed_uid + ")");
        var usernames = [];

        while (result.isValidRow()) {
            usernames[result.fieldByName("uid")] = result.fieldByName("realname");
            result.next();
        }
        result.close();
        db.close();

        var metaDataFields = [];

        metaDataFields.push({
            type : 'metadata',
            label : 'Created By',
            field_name : 'author_uid',
            textValue : usernames[node.author_uid],
            can_view: true
        });
        metaDataFields.push({
            type : 'metadata',
            label : 'Created Time',
            field_name : 'created',
            textValue : Omadi.utils.formatDate(node.created, true),
            can_view: true
        });

        if (node.created !== node.changed) {
            metaDataFields.push({
                type : 'metadata',
                label : 'Last Updated By',
                field_name : 'author_uid',
                textValue : usernames[node.author_uid],
                can_view: true
            });
            metaDataFields.push({
                type : 'metadata',
                label : 'Last Updated Time',
                field_name : 'changed',
                textValue : Omadi.utils.formatDate(node.changed, true),
                can_view: true
            });
        }

        var i;
        for ( i = 0; i < metaDataFields.length; i++) {
            doFieldOutput(metaDataFields[i]);
        }
        
        Ti.UI.currentWindow.addEventListener('close', function(){
            Ti.App.removeEventListener('loggingOut', loggingOutIndividualObject);
            Ti.App.removeEventListener("savedNode", savedNodeIndividualObject);
            
            // Clean up memory in the window
            Ti.UI.currentWindow.remove(formWrapperView);
            formWrapperView = null; 
        });

    }());


var androidMenuItemData = [];

function openAndroidMenuItem(e){"use strict";
    var itemIndex, itemData;
    
    itemIndex = e.source.getOrder();
    itemData = androidMenuItemData[itemIndex];
    
    Ti.App.fireEvent('openFormWindow', {
        node_type: itemData.type,
        nid: itemData.nid,
        form_part: itemData.form_part 
    });
}

if (Ti.App.isAndroid) {
   
    Ti.Android.currentActivity.onCreateOptionsMenu = function(e) {"use strict";
        var db, result, bundle, menu_zero, form_part, menu_edit, 
            customCopy, to_type, to_bundle, order, iconFile, menu_print, menu_charge;
        
        order = 0;
        bundle = Omadi.data.getBundle(curWin.type);
            
        if(isEditEnabled == true){
            
            db = Omadi.utils.openMainDatabase();

            result = db.execute('SELECT form_part FROM node WHERE nid=' + curWin.nid);
            form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
            
            result.close();
            db.close();
        
            if (bundle.data.form_parts != null && bundle.data.form_parts != "" && (bundle.data.form_parts.parts.length >= form_part + 2)) {
    
                menu_zero = e.menu.add({
                    title : bundle.data.form_parts.parts[form_part + 1].label,
                    order : order
                });
                
                androidMenuItemData[order] = {
                    type: curWin.type,
                    nid: curWin.nid,
                    form_part: form_part + 1  
                };
    
                menu_zero.setIcon("/images/save_arrow_white.png");
                menu_zero.addEventListener("click", openAndroidMenuItem);
                
                order++;
            }
    
            menu_edit = e.menu.add({
                title : 'Edit',
                order : order
            });
            
            androidMenuItemData[order] = {
                type: curWin.type,
                nid: curWin.nid,
                form_part: form_part
            };
            
            menu_edit.setIcon("/images/edit_white.png");
            menu_edit.addEventListener("click", openAndroidMenuItem);
            
            order++;
        }
        
        if(Omadi.print.canPrintReceipt(curWin.nid)){
            menu_print = e.menu.add({
                title : 'Print',
                order : order 
            });
            
            menu_print.setIcon("/images/printer_white.png");
            
            menu_print.addEventListener('click', function(){
                Omadi.print.printReceipt(curWin.nid);
            });
            
            order ++;
            
            // menu_charge = e.menu.add({
                // title : 'Charge',
                // order : order 
            // });
//             
            // //menu_charge.setIcon("/images/printer_white.png");
//             
            // menu_charge.addEventListener('click', function(){
                // Omadi.print.chargeCard(curWin.nid);
            // });
//             
            // order ++;
        }
        
        if(typeof bundle.data.custom_copy !== 'undefined'){
            for(to_type in bundle.data.custom_copy){
                if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                    to_bundle = Omadi.data.getBundle(to_type);
                    if(to_bundle && to_bundle.can_create == 1){
                        customCopy = e.menu.add({
                            title : "Copy to " + to_bundle.label,
                            order : order
                        });
                        //iconFile = Omadi.display.getIconFile(to_type);
                        //customCopy.setIcon(iconFile.nativePath);
                        
                        androidMenuItemData[order] = {
                            type: curWin.type,
                            nid: curWin.nid,
                            form_part: to_type 
                        };
            
                        customCopy.addEventListener("click", openAndroidMenuItem);
                        
                        order ++;
                    }
                }
            }
        }
    };
}

results.close();
fields_result.close();
db.close();

if (Ti.App.isIOS) {
    if(!Ti.UI.currentWindow.usingDispatch){
        iOSActionMenu(curWin);
    }
}

function iOSActionMenu(actualWindow) {"use strict";
    var back, space, label, edit, arr, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    back.addEventListener('click', function() {
        actualWindow.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    label = Titanium.UI.createButton({
        title : curWin.nameSelected,
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    edit = Ti.UI.createButton({
        title : 'Actions',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    edit.addEventListener('click', function() {
        var db, result, bundle, btn_tt, btn_id, form_part, postDialog, to_type, to_bundle;
        try{
            bundle = Omadi.data.getBundle(curWin.type);
            
            db = Omadi.utils.openMainDatabase();
            result = db.execute('SELECT form_part FROM node WHERE nid=' + curWin.nid);
            form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
            result.close();
            db.close();
    
    
            btn_tt = [];
            btn_id = [];
            
            if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
    
                if (bundle.data.form_parts.parts.length >= form_part + 2) {
                   
                    btn_tt.push(bundle.data.form_parts.parts[form_part + 1].label);
                    btn_id.push(form_part + 1);
                }
            }
    
            btn_tt.push('Edit');
            btn_id.push(form_part);
            
            if(Omadi.print.canPrintReceipt(curWin.nid)){
                
                btn_tt.push('Print');
                btn_id.push('_print');
            }
    
            if(typeof bundle.data.custom_copy !== 'undefined'){
                for(to_type in bundle.data.custom_copy){
                    if(bundle.data.custom_copy.hasOwnProperty(to_type)){
                        to_bundle = Omadi.data.getBundle(to_type);
                        if(to_bundle){
                            btn_tt.push("Copy to " + to_bundle.label);
                            btn_id.push(to_type);
                        }
                    }
                }
            }
            
    
            btn_tt.push('Cancel');
    
            postDialog = Titanium.UI.createOptionDialog();
            postDialog.options = btn_tt;
            postDialog.cancel = btn_tt.length - 1;
            postDialog.show();
    
            postDialog.addEventListener('click', function(ev) {
                var formPart;
                try{
                    if (ev.index == ev.source.cancel) {
                        Ti.API.info("Fix this logic");
                    }
                    else if (ev.index != -1) {
                        
                        formPart = btn_id[ev.index];
                        
                        if(formPart == '_print'){
                            Omadi.print.printReceipt(curWin.nid);
                        }
                        else{
                            
                            Ti.App.fireEvent('openFormWindow', {
                                node_type: curWin.type,
                                nid: curWin.nid,
                                form_part: formPart 
                            });
                        }
                    }
                }
                catch(ex){
                    Omadi.service.sendErrorReport("Exception with action click on view: " + ex);
                }
            });
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception with viewing actions on view: " + ex);
        }
    });

    //Check is node editable or not
    arr = (isEditEnabled == true) ? [back, space, label, space, edit] : ((Ti.Platform.osname == 'ipad') ? [back, space, label, space] : [back, label, space]);

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : arr,
        top : 20,
        borderTop : false,
        borderBottom : true
    });
    curWin.add(toolbar);

}

