/*global Omadi*/
/*jslint eqeq:true,plusplus:true*/

Ti.include("/lib/functions.js");
Ti.include("/lib/form_functions.js");

var tabs, dispatchTab, workTab;
var dispatchNode, workNode;
var dispatchWindow, workWindow;
var dispatchWindowOpen, workWindowOpen;
var iOSTabbedBar;
var NO_JOB_TYPE_LABEL = "No Job Type";
var dispatchSavedInfo, workSavedInfo, continuousDispatchInfo, continuousWorkInfo;
var setSendingData = false;

function exitView(){"use strict";
    
    if (dispatchWindowOpen) {
        dispatchWindow.close();
    }

    if (workWindowOpen) {
        workWindow.close();
    }
    
    Ti.UI.currentWindow.close();
}

var androidMenuItemData = [];
function openAndroidMenuItem(e){"use strict";
    var itemIndex, itemData;
    
    itemIndex = e.source.getOrder();
    itemData = androidMenuItemData[itemIndex];
    
    Omadi.display.openFormWindow(itemData.type, itemData.nid, itemData.form_part);
}

function createAndroidToolbar(workNodeTypeLabel, openDispatch) {"use strict";
    var selectedTab;
    
    if(openDispatch){
        selectedTab = 'dispatch';
    }
    else{
        selectedTab = 'work';
    }

    if (Ti.App.isAndroid) {
        
        Ti.Android.currentActivity.onCreateOptionsMenu = function(e) {
            var db, result, bundle, menu_zero, form_part, menu_edit, 
                customCopy, to_type, to_bundle, order, iconFile, menu_print;
            
            order = 0;
            bundle = Omadi.data.getBundle(workNode.type);
           
            if(workNode != null && workNode.perm_edit == true){
                
                db = Omadi.utils.openMainDatabase();
    
                result = db.execute('SELECT form_part FROM node WHERE nid=' + workNode.nid);
                form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
                
                result.close();
                db.close();
            
                if (bundle.data.form_parts != null && bundle.data.form_parts != "" && (bundle.data.form_parts.parts.length >= form_part + 2)) {
        
                    menu_zero = e.menu.add({
                        title : bundle.data.form_parts.parts[form_part + 1].label,
                        order : order
                    });
                    
                    androidMenuItemData[order] = {
                        type: workNode.type,
                        nid: workNode.nid,
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
                    type: workNode.type,
                    nid: workNode.nid,
                    form_part: form_part
                };
                
                menu_edit.setIcon("/images/edit_white.png");
                menu_edit.addEventListener("click", openAndroidMenuItem);
                
                order++;
            }
            
            if(Omadi.print.canPrintReceipt(workNode.nid)){
                menu_print = e.menu.add({
                    title : 'Print',
                    order : order 
                });
                
                menu_print.setIcon("/images/printer_white.png");
                
                menu_print.addEventListener('click', function(){
                    try{
                        Omadi.print.printReceipt(workNode.nid);
                    }
                    catch(ex){
                        Omadi.service.sendErrorReport("exception with menu_print click in dispatch view: " + ex);
                    }
                });
                
                order ++;
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
                            
                            androidMenuItemData[order] = {
                                type: workNode.type,
                                nid: workNode.nid,
                                form_part: to_type 
                            };
                
                            customCopy.addEventListener("click", openAndroidMenuItem);
                            order ++;
                        }
                    }
                }
            }
        };
        
        dispatchTab = Ti.UI.createLabel({
           text: 'DISPATCH',
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
           font: {
               fontSize: 16,
               fontWeight: 'bold'               
           },
           backgroundColor: (selectedTab == 'dispatch' ? '#00AEEE' : '#444'),
           color: '#fff',
           width: '49%',
           height: 40,
           borderColor: '#444',
           borderWidth: 1,
           borderRadius: 3,
           left: 0,
           top: 0
        });
        
        dispatchTab.addEventListener('click', function(e){
            try{
                if(selectedTab != 'dispatch'){
                    selectedTab = 'dispatch';
                    dispatchTab.setBackgroundColor('#00AEEE');
                    workTab.setBackgroundColor('#444');
                    
                    if (!dispatchWindowOpen) {
                        if(dispatchNode !== null){
                            dispatchWindowOpen = true;
                            dispatchWindow.open();
                        }
                        else{
                            alert("You do not have access to the dispatch section.");
                            selectedTab = 'work';
                            dispatchTab.setBackgroundColor('#444');
                            workTab.setBackgroundColor('#00AEEE');
                        }
                    }
                    else {
                        dispatchWindow.show();
                        if (workWindowOpen) {
                            workWindow.hide();
                        }
                    }
                }
            }
            catch(ex){
                Omadi.service.sendErrorReport("exception in dispatchtab click: " + ex);
            }
        });
        
        workTab = Ti.UI.createLabel({
           text: workNodeTypeLabel,
           textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
           font: {
               fontSize: 16,
               fontWeight: 'bold'               
           },
           backgroundColor: (selectedTab == 'work' ? '#00AEEE' : '#444'),
           color: '#fff',
           width: '49%',
           height: 40,
           borderColor: '#444',
           borderWidth: 1,
           borderRadius: 3,
           right: 0,
           top: 0
        });
        
        workTab.addEventListener('click', function(e){
            try{
                if(selectedTab != 'work'){
                    if (e.source.text != NO_JOB_TYPE_LABEL) {
                        
                        selectedTab = 'work';
                        workTab.setBackgroundColor('#00AEEE');
                        dispatchTab.setBackgroundColor('#444');
                        
                        if (!workWindowOpen) {
                            if(workNode !== null){
                                workWindowOpen = true;
                                workWindow.open();
                            }
                            else{
                                alert("You do not have access to the work form section.");
                                selectedTab = 'dispatch';
                                dispatchTab.setBackgroundColor('#00AEEE');
                                workTab.setBackgroundColor('#444');
                            }
                        }
                        else {
    
                            workWindow.show();
                            if (dispatchWindowOpen) {
                                dispatchWindow.hide();
                            }
                        }
                    }
                }  
            }
            catch(ex){
                Omadi.service.sendErrorReport("exception with worktab click in dispatch view: " + ex);
            }
        });
        
        // create and add toolbar
        tabs = Ti.UI.createView({
            width: '100%',
            height: 40,
            backgroundColor: '#000',
            top: 0
        });
        
        tabs.add(dispatchTab);
        tabs.add(workTab);
        
        Ti.UI.currentWindow.add(tabs);
    }
}

function createiOSToolbar(workNodeTypeLabel, openDispatch) {"use strict";
    var back, space, toolbar, items, buttonBar, actions;

    if (Ti.App.isIOS) {

        back = Ti.UI.createButton({
            title : 'Back',
            style : Ti.UI.iPhone.SystemButtonStyle.BORDERED
        });

        back.addEventListener('click', exitView);

        space = Ti.UI.createButton({
            systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
        });

        iOSTabbedBar = Titanium.UI.iOS.createTabbedBar({
            labels : ['DISPATCH', workNodeTypeLabel],
            backgroundColor : '#336699',
            style : Titanium.UI.iPhone.SystemButtonStyle.BAR,
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            index : ( openDispatch ? 0 : 1)
        });

        iOSTabbedBar.addEventListener('click', function(e) {
            try{
                var workLabel = e.source.labels[1];
    
                if (e.index == 0) {
                    if (!dispatchWindowOpen) {
                        if(dispatchNode !== null){
                            dispatchWindowOpen = true;
                            dispatchWindow.open();
                        }
                        else{
                            alert("You do not have access to the dispatch section.");
                            e.source.setIndex(1);
                        }
                    }
                    else {
                        dispatchWindow.show();
                        if (workWindowOpen) {
                            workWindow.hide();
                        }
                    }
                }
                else {
    
                    if (workLabel == NO_JOB_TYPE_LABEL) {
                        e.source.setIndex(0);
                    }
                    else {
                        if (!workWindowOpen) {
                            if(workNode !== null){
                                workWindowOpen = true;
                                workWindow.open();
                            }
                            else{
                                alert("You do not have access to the work form section.");
                                e.source.setIndex(0);
                            }
                        }
                        else {
    
                            workWindow.show();
                            if (dispatchWindowOpen) {
                                dispatchWindow.hide();
                            }
                        }
                    }
                }
            }
            catch(ex){
                Omadi.service.sendErrorReport("exception with ios tab click in dispatch view: " + ex);
            }
        });

        actions = Ti.UI.createButton({
            title : 'Actions',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });

        actions.addEventListener('click', function(e) {
            var db, result, bundle, btn_tt, btn_id, form_part, postDialog, to_type, to_bundle;
            try{
                bundle = Omadi.data.getBundle(workNode.type);
                
                db = Omadi.utils.openMainDatabase();
                result = db.execute('SELECT form_part FROM node WHERE nid=' + workNode.nid);
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
                postDialog.show();
        
                postDialog.addEventListener('click', function(ev) {
                    try{
                        if (ev.index == btn_tt.length - 1) {
                            Ti.API.info("Fix this logic");
                        }
                        else if (ev.index != -1) {
                            Omadi.display.openFormWindow(workNode.type, workNode.nid, btn_id[ev.index]);
                        }
                    }
                    catch(ex){
                        Omadi.service.sendErrorReport("exception with post dialog in actions dispatch view: " + ex);
                    }
                });
            }
            catch(ex){
                Omadi.service.sendErrorReport("exception clicking actions on dispatch view: " + ex);
            }
        });

        items = [back, space, iOSTabbedBar, space, actions];

        // create and add toolbar
        toolbar = Ti.UI.iOS.createToolbar({
            items : items,
            top : 0,
            borderTop : false,
            borderBottom : false,
            zIndex : 1
        });
        
        if(Ti.App.isIOS7){
            toolbar.top = 20;
        }

        Ti.UI.currentWindow.add(toolbar);
    }
}

function getWindowTopPixels(orientation){"use strict";
    var top;
    
    // ipad = 43 portrait and landscape
    // iphone = 43 for portrait
    // iphone = 30 for landscape
    
    if(Ti.App.isAndroid){
        top = 40;
    }
    else{
        if ( typeof orientation === 'undefined') {
            orientation = Ti.Gesture.orientation;
        }
        
        if(Ti.App.isIOS7){
            switch(orientation) {
                case Ti.UI.PORTRAIT:
                case Ti.UI.UPSIDE_PORTRAIT:
                    top = 63;
                    break;
        
                case Ti.UI.LANDSCAPE_LEFT:
                case Ti.UI.LANDSCAPE_RIGHT:
                    if (Ti.App.isIOS && Ti.Platform.osname == 'iphone') {
                        top = 50;
                    }
                    else {
                        top = 63;
                    }
                    break;
        
                default:
                    top = 63;
                    break;
            }
        }
        else{
            switch(orientation) {
                case Ti.UI.PORTRAIT:
                case Ti.UI.UPSIDE_PORTRAIT:
                    top = 43;
                    break;
        
                case Ti.UI.LANDSCAPE_LEFT:
                case Ti.UI.LANDSCAPE_RIGHT:
                    if (Ti.App.isIOS && Ti.Platform.osname == 'iphone') {
                        top = 30;
                    }
                    else {
                        top = 43;
                    }
                    break;
        
                default:
                    top = 43;
                    break;
            }
        }
    }
    
    return top;
}

function setFormWindowTop(e) {"use strict";
    var top;

    if(typeof e !== 'undefined' && typeof e.orientation !== 'undefined'){
        top = getWindowTopPixels(e.orientation);
    }
    else{
        top = getWindowTopPixels();
    }
    
    if(typeof dispatchWindow !== 'undefined'){
        dispatchWindow.top = top;
    }
    if(typeof workWindow !== 'undefined'){
        workWindow.top = top;
    }
}

function savedDispatchNode(e) {"use strict";
    var workNid, dispatchNid, sendUpdates, db, localOnly, singleSaveNid, isFinalSave, setFlag;

    localOnly = (e.isContinuous || e.isDraft);

    if (!localOnly) {
        setSendingData = true;
        // Don't allow a background job to send data before everything is ready
        Omadi.service.setSendingData(true);
    }
    
    // We have two sets of Info from the 'e' variable. The continuous saves need to stay linked
    // When the final save comes through, we don't want to mix up nids as 4 different negative nids
    // will be floating around for this one dispatch form
    if(e.isContinuous){
        // Don't get continuous and real nids mixed up
        if (e.nodeType == 'dispatch') {
            continuousDispatchInfo = e;
        }
        else {
            continuousWorkInfo = e;
        }
    }
    else{
        // Don't get continuous and real nids mixed up
        if (e.nodeType == 'dispatch') {
            dispatchSavedInfo = e;
        }
        else {
            workSavedInfo = e;
        }
    }

    if (e.nodeNid < 0) {

        // Only change dispatch_nids when both are new
        if ((workSavedInfo !== null && dispatchSavedInfo !== null) || (continuousDispatchInfo !== null && continuousWorkInfo !== null)) {
            
            if(dispatchSavedInfo !== null && workSavedInfo !== null){
                workNid = parseInt(workSavedInfo.nodeNid, 10);
                dispatchNid = parseInt(dispatchSavedInfo.nodeNid, 10);
                isFinalSave = true;
            }
            else{
                workNid = parseInt(continuousWorkInfo.nodeNid, 10);
                dispatchNid = parseInt(continuousDispatchInfo.nodeNid, 10);
                isFinalSave = false;
            }
            

            if (isNaN(workNid) || isNaN(dispatchNid)) {
                if(isFinalSave){
                    Omadi.service.sendErrorReport("Bad dispatch nids: " + JSON.stringify(workSavedInfo) + " " + JSON.stringify(dispatchSavedInfo));
                    alert("There was a problem saving this dispatch, and it will not be sent out properly. Please try again.");
                }
            }
            else {
                
                db = Omadi.utils.openMainDatabase();
                db.execute("BEGIN IMMEDIATE TRANSACTION");
                db.execute("UPDATE node SET dispatch_nid = " + workNid + " WHERE nid = " + dispatchNid);
                db.execute("UPDATE node SET dispatch_nid = " + dispatchNid + " WHERE nid = " + workNid);
                
                if(isFinalSave){
                    
                    if(workSavedInfo.saveType == 'draft'){
                        setFlag = 3;    
                    }
                    else{
                        setFlag = 1;   
                    }
                    
                    db.execute("UPDATE node SET flag_is_updated = " + setFlag + " WHERE nid IN (" + dispatchNid + "," + workNid + ")");
                }
                
                db.execute("COMMIT TRANSACTION");
                db.close();
            }
        }
    }

    // Only send the updates to the server if all the information is present
    sendUpdates = false;
    if (dispatchWindowOpen && workWindowOpen) {
        if (workSavedInfo !== null && dispatchSavedInfo !== null) {
            sendUpdates = true;
        }
        else if(e.nodeNid < 0 && !e.isContinuous){
            // If the node is only local (negative nid), then set flag_is_updated to 5
            // If the form is closed, removed those nodes with flag_is_updated == 5
            // This scenario can happen when one of the two nodes saves correctly, but the other does not
            // If this weren't, here that saved dispatch or work node would not be attached with dispatch_nid
            
            if(workSavedInfo !== null){
                singleSaveNid = parseInt(workSavedInfo.nodeNid, 10);
            }
            else if(dispatchSavedInfo !== null){
                singleSaveNid = parseInt(dispatchSavedInfo.nodeNid, 10);
            }
            
            if(!isNaN(singleSaveNid)){
            
                db = Omadi.utils.openMainDatabase();
                db.execute("BEGIN IMMEDIATE TRANSACTION");
                db.execute("UPDATE node SET flag_is_updated = 5 WHERE nid = " + singleSaveNid);
                db.execute("COMMIT TRANSACTION");
                db.close();
            }
        }
    }
    else if (dispatchWindowOpen && !workWindowOpen) {
        if (dispatchSavedInfo !== null) {
            sendUpdates = true;
        }
    }
    else if (workWindowOpen && !dispatchWindowOpen) {
        if (workSavedInfo !== null) {
            sendUpdates = true;
        }
    }

    if (sendUpdates) {
        // Both nodes are saved, so we can close the window

        if (!localOnly) {
            setSendingData = false;
            // Allow the updates to go through now that all the data is present
            Omadi.service.setSendingData(false);
            Ti.App.fireEvent('sendUpdates');
        }

        if (!e.isContinuous) {
            
            if(dispatchWindowOpen){
                dispatchWindow.close();    
            }
            if(workWindowOpen){
                workWindow.close();
            }
            
            Ti.App.removeEventListener("omadi:dispatch:towTypeChanged", towTypeChanged);
            Ti.App.removeEventListener("omadi:dispatch:savedDispatchNode", savedDispatchNode);
            
            Ti.UI.currentWindow.close();
        }
    }
}

( function() {"use strict";
    var workBundle, openDispatch, workLabel, dialog, allowRecover, windowTop;

    // Initialize vars

    dispatchWindowOpen = false;
    workWindowOpen = false;

    dispatchSavedInfo = null;
    workSavedInfo = null;
    continuousDispatchInfo = null;
    continuousWorkInfo = null;

    Ti.Gesture.addEventListener("orientationchange", setFormWindowTop);
    
    if (Ti.UI.currentWindow.nid == 'new') {

        if (Ti.UI.currentWindow.type != 'dispatch') {
            workNode = {
                type : Ti.UI.currentWindow.type,
                nid : 'new',
                form_part : -1
            };
        }
        else {
            workNode = {
                type : null,
                nid : 'new',
                form_part : -1
            };
        }

        dispatchNode = {
            type : "dispatch",
            nid : 'new',
            form_part : 0
        };

        Ti.UI.currentWindow.form_part = -1;

        openDispatch = true;
    }
    else {
        
        workNode = Omadi.data.nodeLoad(Ti.UI.currentWindow.nid);
        allowRecover = true;
        if(workNode.nid > 0){
            allowRecover = false;
        }

        if (workNode.type == 'dispatch') {
            dispatchNode = workNode;
            workNode = Omadi.data.nodeLoad(dispatchNode.dispatch_nid);
            openDispatch = true;
        }
        else {
            dispatchNode = Omadi.data.nodeLoad(workNode.dispatch_nid);
            openDispatch = false;
        }
        
        // Recover from a crash with the correct work node if the work node was never looked at
        if(allowRecover){   
            if((workNode === null || typeof workNode.nid === 'undefined') && 
                typeof dispatchNode.field_tow_type !== 'undefined' &&
                typeof dispatchNode.field_tow_type.dbValues !== 'undefined' && 
                typeof dispatchNode.field_tow_type.dbValues[0] !== 'undefined'){
                    workNode = {
                        type: dispatchNode.field_tow_type.dbValues[0],
                        nid: 'new',
                        form_part: -1
                    };
            }
        }
        
        if (workNode !== null){
            if(Ti.UI.currentWindow.nid != workNode.nid) {
                Ti.UI.currentWindow.nid = workNode.nid;
                Ti.UI.currentWindow.form_part = workNode.form_part;
            }
        }
        else if(dispatchNode !== null){
            Ti.UI.currentWindow.nid = dispatchNode.nid;
            Ti.UI.currentWindow.form_part = dispatchNode.form_part;
        }
    }
    
    workLabel = NO_JOB_TYPE_LABEL;
    
    if(workNode !== null){
        workBundle = Omadi.data.getBundle(workNode.type);
       
        if (workBundle) {
            workLabel = workBundle.label;
        }
    }

    if (Ti.App.isAndroid) {
        createAndroidToolbar(workLabel, openDispatch);
        Ti.UI.currentWindow.addEventListener("android:back", exitView);
    }
    else {
        createiOSToolbar(workLabel, openDispatch);
    }

    windowTop = getWindowTopPixels();
    
    if(dispatchNode !== null){
        dispatchWindow = Ti.UI.createWindow({
            url : '/main_windows/individual_object.js',
            type : 'dispatch',
            nid : dispatchNode.nid,
            form_part : 0,
            bottom : 0,
            right : 0,
            left : 0,
            top: windowTop,
            usingDispatch : true,
            field_tow_type : workNode.type,
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
        });
    }

    if(workNode !== null){
        workWindow = Ti.UI.createWindow({
            url : '/main_windows/individual_object.js',
            type : workNode.type,
            nid : workNode.nid,
            form_part : Ti.UI.currentWindow.form_part,
            bottom : 0,
            right : 0,
            left : 0,
            top: windowTop,
            usingDispatch : true,
            orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
        });
    }

    if (openDispatch && dispatchNode !== null) {
        dispatchWindowOpen = true;
        dispatchWindow.open();
    }
    else if(workNode !== null){
        workWindowOpen = true;
        workWindow.open();
    }
}());
