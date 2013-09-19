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

function exitForm(){"use strict";
    var dialog, photoNids;

    dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Exit', 'Cancel'],
        title : 'Really Exit Form?',
        message : 'Any unsaved changes will be lost.'
    });

    dialog.addEventListener('click', function(e) {
        var db, result, numPhotos, secondDialog, negativeNid, query, continuousId, photoNids, types, dialogTitle, dialogMessage, messageParts, windowNid;

        if (e.index == 0) {
            
            Ti.App.removeEventListener("omadi:dispatch:towTypeChanged", towTypeChanged);
            Ti.App.removeEventListener("omadi:dispatch:savedDispatchNode", savedDispatchNode);
            
            windowNid = parseInt(Ti.UI.currentWindow.nid, 10);
            if (isNaN(windowNid)) {
                windowNid = 0;
            }

            if (dispatchWindowOpen) {
                Omadi.form.adjustFileTable(dispatchNode, dispatchNode.nid);
                dispatchWindow.close();
            }

            if (workWindowOpen) {
                Omadi.form.adjustFileTable(workNode, workNode.nid);
                workWindow.close();
            }
            
            // Remove any fully-saved nodes that may not have been linked
            db = Omadi.utils.openMainDatabase();
            db.execute("BEGIN IMMEDIATE TRANSACTION");
            db.execute("DELETE FROM node WHERE flag_is_updated = 5");
            db.execute("COMMIT TRANSACTION");
            db.close();
            
            if(setSendingData){
                // This screen set sending data to true, so free it up in case it's still set
                // which would be the case for one node validating and the other not validating
                Omadi.service.setSendingData(false);
            }
        }
    });

    dialog.show();
}

function savedWorkNowSaveDispatch(){"use strict";
    Ti.App.removeEventListener("omadi:dispatch:savedDispatchNode", savedWorkNowSaveDispatch);
    
    if (dispatchWindowOpen) {
        dispatchWindow.fireEvent("omadi:saveForm", {
            saveType : "normal"
        });
    }
}

function dispatchSaveForms(saveType){"use strict";
    if(workWindowOpen && dispatchWindowOpen){
        // When both forms are open, save one at a time to avoid negative nid conflicts
        
        Ti.App.removeEventListener("omadi:dispatch:savedDispatchNode", savedWorkNowSaveDispatch);
        Ti.App.addEventListener("omadi:dispatch:savedDispatchNode", savedWorkNowSaveDispatch);
        
        workWindow.fireEvent("omadi:saveForm", {
            saveType : saveType
        });
    }
    else if (workWindowOpen) {
        workWindow.fireEvent("omadi:saveForm", {
            saveType : saveType
        });
    }
    else if (dispatchWindowOpen) {
        // The savetype on a dispatch will always be normal since we do not want it to have more parts
        dispatchWindow.fireEvent("omadi:saveForm", {
            saveType : "normal"
        });
    }
}

function saveForAndroid(saveType){"use strict";
    var dialog, workLabel = workTab.text;

    if (workLabel == NO_JOB_TYPE_LABEL) {
        dialog = Ti.UI.createAlertDialog({
            buttonNames : ['OK'],
            title : 'Cannot Save',
            message : 'You must set the job type first.'
        }).show();
    }
    else if ((workNode.nid == 'new' || workNode.nid < 0) && workNode.flag_is_updated != 3 && !workWindowOpen) {
        dialog = Ti.UI.createAlertDialog({
            buttonNames : ['OK'],
            title : 'Cannot Save',
            message : 'Fill out the job tab first.'
        }).show();
    }
    else{
        dispatchSaveForms(saveType);
    }
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
        
        Ti.UI.currentWindow.activity.onCreateOptionsMenu = function(e) {
            var db, result, menu_zero, bundle, btn_tt, btn_id, 
                menu_first, menu_second, menu_third, menu_save_new, iconFile, menu;
            
            btn_tt = [];
            btn_id = [];
        
            menu = e.menu;
            menu.clear();
            
            bundle = Omadi.data.getBundle(workNode.type);
            
            // Do not allow going to the next part on dispatch create
            // The problem is that the dispatch_id won't be on the screen
            // and the dispatch_form.js won't be called, but only form.js
            if (workNode.nid > 0 && bundle.data.form_parts != null && bundle.data.form_parts != "") {
                
                if (bundle.data.form_parts.parts.length >= workNode.form_part + 2) {
                    menu_zero = menu.add({
                        title : "Save + " + bundle.data.form_parts.parts[workNode.form_part + 1].label,
                        order : 0
                    });
                    menu_zero.setIcon("/images/save_arrow_white.png");
                    menu_zero.addEventListener("click", function(ev) {
                        saveForAndroid("next_part");
                    });
                }
            }
        
            btn_tt.push('Save');
            
            btn_tt.push('Save as Draft');
            btn_tt.push('Cancel');
        
            menu_first = menu.add({
                title : 'Save',
                order : 1
            });
            menu_first.setIcon("/images/save_white.png");
        
            menu_second = menu.add({
                title : 'Save as Draft',
                order : 2
            });
            menu_second.setIcon("/images/display_drafts_white.png");
        
            menu_first.addEventListener("click", function(e) {
                saveForAndroid("normal");
            });
        
            menu_second.addEventListener("click", function(e) {
                saveForAndroid("draft");
            });
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
            if(selectedTab != 'dispatch'){
                selectedTab = 'dispatch';
                dispatchTab.setBackgroundColor('#00AEEE');
                workTab.setBackgroundColor('#444');
                
                if (!dispatchWindowOpen) {
                    dispatchWindowOpen = true;
                    dispatchWindow.open();
                }
                else {
                    dispatchWindow.show();
                    if (workWindowOpen) {
                        workWindow.hide();
                    }
                }
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
            if(selectedTab != 'work'){
                if (e.source.text != NO_JOB_TYPE_LABEL) {
                    
                    selectedTab = 'work';
                    workTab.setBackgroundColor('#00AEEE');
                    dispatchTab.setBackgroundColor('#444');
                    
                    if (!workWindowOpen) {
                        workWindowOpen = true;
                        workWindow.open();
                    }
                    else {

                        workWindow.show();
                        if (dispatchWindowOpen) {
                            dispatchWindow.hide();
                        }
                    }
                }
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

        back.addEventListener('click', exitForm);

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
            var workLabel = e.source.labels[1];

            if (e.index == 0) {
                if (!dispatchWindowOpen) {
                    dispatchWindowOpen = true;
                    dispatchWindow.open();
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
                        workWindowOpen = true;
                        workWindow.open();
                    }
                    else {

                        workWindow.show();
                        if (dispatchWindowOpen) {
                            dispatchWindow.hide();
                        }
                    }
                }
            }
        });

        actions = Ti.UI.createButton({
            title : 'Actions',
            style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
        });

        actions.addEventListener('click', function(e) {
            var bundle, btn_tt, btn_id, postDialog, workLabel;

            workLabel = iOSTabbedBar.labels[1];

            if (workLabel == NO_JOB_TYPE_LABEL) {
                postDialog = Ti.UI.createAlertDialog({
                    buttonNames : ['OK'],
                    title : 'No Actions',
                    message : 'You must set the job type first.'
                }).show();
            }
            else if ((workNode.nid == 'new' || workNode.nid < 0) && workNode.flag_is_updated != 3 && !workWindowOpen) {
                postDialog = Ti.UI.createAlertDialog({
                    buttonNames : ['OK'],
                    title : 'No Actions',
                    message : 'Fill out the job tab first.'
                }).show();
            }
            else {
                bundle = Omadi.data.getBundle(workNode.type);
                btn_tt = [];
                btn_id = [];

                btn_tt.push('Save');
                btn_id.push('normal');

                // Do not allow going to the next part on dispatch create
                // The problem is that the dispatch_id won't be on the screen
                // and the dispatch_form.js won't be called, but only form.js
                if (workNode.nid > 0 && bundle.data.form_parts != null && bundle.data.form_parts != "") {

                    if (bundle.data.form_parts.parts.length >= workNode.form_part + 2) {

                        btn_tt.push("Save + " + bundle.data.form_parts.parts[workNode.form_part + 1].label);
                        btn_id.push('next');
                    }
                }

                //Currently do not allow saving drafts with dispatch
                btn_tt.push('Save as Draft');
                btn_id.push('draft');

                btn_tt.push('Cancel');
                btn_id.push('cancel');

                postDialog = Titanium.UI.createOptionDialog();
                postDialog.options = btn_tt;
                postDialog.show();

                postDialog.addEventListener('click', function(ev) {

                    //if(Ti.UI.currentWindow.nodeSaved === false){
                    if (ev.index != -1) {
                        if (btn_id[ev.index] == 'next') {
                            dispatchSaveForms("next_part");
                        }
                        else if (btn_id[ev.index] == 'draft') {
                            dispatchSaveForms("draft");
                        }
                        else if (btn_id[ev.index] == 'normal') {
                            dispatchSaveForms("normal");
                        }
                    }
                    //}
                    //else{
                    //    alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely. Please report what you did to get this screen.");
                    //}
                });
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

        Ti.UI.currentWindow.add(toolbar);
    }
}

function setFormWindowTop(e) {"use strict";
    var top, orientation;

    // ipad = 43 portrait and landscape
    // iphone = 43 for portrait
    // iphone = 30 for landscape
    
    if(Ti.App.isAndroid){
        top = 40;
    }
    else{
        if ( typeof e !== 'undefined') {
            orientation = e.orientation;
        }
        else {
            orientation = Ti.Gesture.orientation;
        }
        
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
    
    if(typeof dispatchWindow !== 'undefined'){
        dispatchWindow.top = top;
    }
    if(typeof workWindow !== 'undefined'){
        workWindow.top = top;
    }
}

function towTypeChanged(e) {"use strict";
    var newNodeType, newBundle;

    newNodeType = e.dbValue;

    newBundle = Omadi.data.getBundle(newNodeType);
    if (newBundle) {
        if(Ti.App.isAndroid){
            workTab.setText(newBundle.label);
        }
        else{
            iOSTabbedBar.setLabels(["DISPATCH", newBundle.label]);
        }
        
        workNode = {
            type : newNodeType,
            nid : 'new',
            form_part : -1
        };

        if (workWindowOpen) {
            workWindow.close();
        }

        workWindow = Ti.UI.createWindow({
            url : '/main_windows/form.js',
            type : workNode.type,
            nid : workNode.nid,
            form_part : -1,
            bottom : 0,
            right : 0,
            left : 0,
            zIndex : 1,
            usingDispatch : true
        });

        workWindowOpen = false;

        setFormWindowTop();
    }
    else {
        alert("There was a problem with the " + newNodeType + " selection. Please select a different option.");
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
    var workBundle, openDispatch, workLabel, dialog, allowRecover;

    // Initialize vars

    dispatchWindowOpen = false;
    workWindowOpen = false;

    dispatchSavedInfo = null;
    workSavedInfo = null;
    continuousDispatchInfo = null;
    continuousWorkInfo = null;

    Ti.Gesture.addEventListener("orientationchange", setFormWindowTop);
    
    Ti.App.removeEventListener("omadi:dispatch:towTypeChanged", towTypeChanged);
    Ti.App.addEventListener("omadi:dispatch:towTypeChanged", towTypeChanged);
    
    Ti.App.removeEventListener("omadi:dispatch:savedDispatchNode", savedDispatchNode);
    Ti.App.addEventListener("omadi:dispatch:savedDispatchNode", savedDispatchNode);

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
            
        if (dispatchNode == null || workNode == null) {
            dialog = Ti.UI.createAlertDialog({
                buttonNames : ["OK"],
                title : "Cannot Open Dispatch",
                message : "An error occurred when opening this dispatch."
            });

            dialog.addEventListener("click", function() {
                Ti.UI.currentWindow.close();
            });

            dialog.show();

            Omadi.service.sendErrorReport("Could not open dispatch screen: " + JSON.stringify(dispatchNode) + " " + JSON.stringify(workNode));
            return;
        }
        else if (Ti.UI.currentWindow.nid != workNode.nid) {
            Ti.UI.currentWindow.nid = workNode.nid;
            Ti.UI.currentWindow.form_part = workNode.form_part;
        }
    }

    workBundle = Omadi.data.getBundle(workNode.type);

    workLabel = NO_JOB_TYPE_LABEL;
    if (workBundle) {
        workLabel = workBundle.label;
    }

    if (Ti.App.isAndroid) {
        createAndroidToolbar(workLabel, openDispatch);
        Ti.UI.currentWindow.addEventListener("android:back", exitForm);
    }
    else {
        createiOSToolbar(workLabel, openDispatch);
    }

    dispatchWindow = Ti.UI.createWindow({
        url : '/main_windows/form.js',
        type : 'dispatch',
        nid : dispatchNode.nid,
        form_part : 0,
        bottom : 0,
        right : 0,
        left : 0,
        usingDispatch : true,
        field_tow_type : workNode.type
    });

    workWindow = Ti.UI.createWindow({
        url : '/main_windows/form.js',
        type : workNode.type,
        nid : workNode.nid,
        form_part : Ti.UI.currentWindow.form_part,
        bottom : 0,
        right : 0,
        left : 0,
        usingDispatch : true
    });

    setFormWindowTop();

    if (openDispatch) {
        dispatchWindowOpen = true;
        dispatchWindow.open();
    }
    else {
        workWindowOpen = true;
        workWindow.open();
    }
}());
