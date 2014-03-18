/*jslint eqeq:true,plusplus:true*/
var Dispatch, Omadi;


function DispatchForm(type, nid, form_part){"use strict";
    //create module instance
    
    this.type = type;
    this.nid = nid;
    this.form_part = form_part;
    
    this.dispatchNode = null;
    this.workNode = null;
    
    this.workTab = null;
    this.dispatchTab = null;
    
    this.tabGroup = null;
    
    this.FormModule = null;
    this.dispatchObj = null;
    this.workObj = null;
    
    this.setSendingData = false;
    
    this.dispatchSavedInfo = null;
    this.workSavedInfo = null;
    
    this.continuousDispatchInfo = null;
    this.continuousWorkInfo = null;
    
    this.currentWorkFormPart = -1;
}

DispatchForm.prototype.showActionsOptions = function(e){"use strict";
    var bundle, btn_tt, btn_id, postDialog, windowFormPart;
    
    bundle = Omadi.data.getBundle(Dispatch.workObj.type);
    btn_tt = [];
    btn_id = [];

    btn_tt.push('Save');
    btn_id.push('normal');

    // //Ti.API.info('BUNDLE: ' + JSON.stringify(bundle));
    // if(bundle.can_create == 1){
        // btn_tt.push("Save + New");
        // btn_id.push("new");
    // }
//     
    // if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
//         
        // windowFormPart = this.workObj.form_part;
//         
        // if (bundle.data.form_parts.parts.length >= windowFormPart + 2) {
// 
            // btn_tt.push("Save + " + bundle.data.form_parts.parts[windowFormPart + 1].label);
            // btn_id.push('next');
        // }
    // }
//     
    // btn_tt.push('Save as Draft');
    // btn_id.push('draft');
//     
    btn_tt.push('Cancel');
    btn_id.push('cancel');

    postDialog = Titanium.UI.createOptionDialog();
    postDialog.options = btn_tt;
    postDialog.cancel = btn_tt.length - 1;
    postDialog.show();

    postDialog.addEventListener('click', function(ev) {
        var form_errors, dialog, i;
        try{
            if(ev.index >= 0 && ev.index != ev.source.cancel){
                if(Dispatch.workObj.nodeSaved === false){
                    
                    Dispatch.workObj.formToNode();
                    Dispatch.dispatchObj.formToNode();
                    
                    Dispatch.workObj.validate_form_data(btn_id[ev.index]);
                    Dispatch.dispatchObj.validate_form_data(btn_id[ev.index]);
                    
                    form_errors = Dispatch.workObj.form_errors;
                    for(i = 0; i < Dispatch.dispatchObj.form_errors.length; i ++){
                        form_errors.push(Dispatch.dispatchObj.form_errors[i] + " (dispatch Tab)");
                    }
                    
                    if(form_errors.length > 0){
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Dispatch Validation',
                            buttonNames : ['OK'],
                            message: form_errors.join("\n")
                        });
                        
                        dialog.show();
                    }
                    else{
                    
                        // if(btn_id[ev.index] == 'next'){
                            // ActiveFormObj.saveForm('next_part');
                        // }
                        // else if(btn_id[ev.index] == 'draft'){
                            // ActiveFormObj.saveForm('draft');
                        // }
                        // else if(btn_id[ev.index] == 'new'){
                            // ActiveFormObj.saveForm('new');
                        // }
                        // else if(btn_id[ev.index] == 'normal'){
                            // ActiveFormObj.saveForm('normal');
                        // }
                        
                        Dispatch.dispatchObj.saveForm('normal');
                        Dispatch.workObj.saveForm('normal');
                    }
                }
                else{
                    alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
                }
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception in dispatch form dispatch post dialog click: " + ex);
        }
    });
};

DispatchForm.prototype.doDispatchSave = function(){"use strict";
    var form_errors, dialog, i;
    try{
        if(Dispatch.workObj === null){
            alert("You must first select a job type.");
        }
        else if(Dispatch.workObj.nodeSaved === false){
            
            if(Ti.App.isAndroid){
                // Android doesn't like adding anything to tab groups
                Omadi.display.loading("Saving...");
            }
            else{
                // iOS won't show the loading screen unless it's on the tabgroup
                Omadi.display.loading("Saving...", Dispatch.tabGroup);
            }
            
            Dispatch.workObj.formToNode();
            Dispatch.dispatchObj.formToNode();
            
            Dispatch.workObj.validate_form_data('normal');
            Dispatch.dispatchObj.validate_form_data('normal');
            
            form_errors = Dispatch.workObj.form_errors;
            for(i = 0; i < Dispatch.dispatchObj.form_errors.length; i ++){
                form_errors.push(Dispatch.dispatchObj.form_errors[i] + " (dispatch Tab)");
            }
            
            if(form_errors.length > 0){
                
                Omadi.display.doneLoading();
                
                dialog = Titanium.UI.createAlertDialog({
                    title : 'Dispatch Validation',
                    buttonNames : ['OK'],
                    message: form_errors.join("\n")
                });
                
                dialog.show();
            }
            else{
                Dispatch.dispatchObj.saveForm('normal');
                Dispatch.workObj.saveForm('normal');
            }
        }
        else{
            alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
            Omadi.service.sendErrorReport("User got the dispatch screen did not close alert.");
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Could not dodispatchsave: " + ex);
    }
};

DispatchForm.prototype.getWindow = function(){"use strict";
    var dispatchWin, workWin, allowRecover, openDispatch, workBundle, db, result, tempDispatchNid, iconFile;
    
    try{
        openDispatch = false;
        this.tabGroup = Ti.UI.createTabGroup({
            navBarHidden: true,
            tabsBackgroundImage: '/images/black_button1.png',
            activeTabBackgroundImage: '/images/blue_button1.png',
            tabsTintColor: '#fff',
            activeTabIconTint: '#fff'
        });
        
        this.FormModule = require('ui/FormModule');
        this.FormModule.reset();
        
        if (this.nid == 'new') {
    
            if (this.type != 'dispatch') {
                this.workNode = {
                    type : this.type,
                    nid : 'new',
                    form_part : -1
                };
            }
            else {
                this.workNode = {
                    type : null,
                    nid : 'new',
                    form_part : -1
                };
            }
    
            this.dispatchNode = {
                type : "dispatch",
                nid : 'new',
                form_part : 0
            };
    
            this.form_part = -1;
            
            openDispatch = true;
        }
        else {
            this.workNode = Omadi.data.nodeLoad(this.nid);
            this.currentWorkFormPart = this.workNode.form_part;
            
            allowRecover = true;
            
            Ti.API.debug(JSON.stringify(this.workNode));
            
            if(this.workNode){
                if(this.workNode.nid > 0){
                    allowRecover = false;
                }
            
                if (this.workNode.type == 'dispatch') {
                    this.dispatchNode = this.workNode;
                    this.workNode = Omadi.data.nodeLoad(this.dispatchNode.dispatch_nid);
                    this.currentWorkFormPart = this.workNode.form_part;
                    openDispatch = true;
                }
                else {
                    
                    if(this.nid < 0 && this.workNode.dispatch_nid > 0){
                        // Load the corresponding negative id for the dispatch
                        try{
                            db = Omadi.utils.openMainDatabase();
                            result = db.execute("SELECT nid FROM node WHERE dispatch_nid = " + this.workNode.dispatch_nid);
                            tempDispatchNid = 0;
                            if(result.isValidRow()){
                                tempDispatchNid = result.field(0);
                            }
                            result.close();
                            db.close();
                            
                            this.dispatchNode = Omadi.data.nodeLoad(tempDispatchNid);
                            openDispatch = false;
                        }
                        catch(exDB){
                            Ti.API.debug("exception when loading a continuously saved disaptch: " + exDB);
                        }
                    }
                    else{
                    
                        this.dispatchNode = Omadi.data.nodeLoad(this.workNode.dispatch_nid);
                        openDispatch = false;
                    }
                }
                
                this.workNode.form_part = this.form_part;
                
                // Recover from a crash with the correct work node if the work node was never looked at
                if(allowRecover){   
                    if((this.workNode === null || typeof this.workNode.nid === 'undefined') && 
                        this.dispatchNode !== null && 
                        typeof this.dispatchNode.field_tow_type !== 'undefined' &&
                        typeof this.dispatchNode.field_tow_type.dbValues !== 'undefined' && 
                        typeof this.dispatchNode.field_tow_type.dbValues[0] !== 'undefined'){
                            this.workNode = {
                                type: this.dispatchNode.field_tow_type.dbValues[0],
                                nid: 'new',
                                form_part: -1
                            };
                    }
                }
            }
            else{
                alert("A problem occurred loading this dispatch. Please contact support.");
                Omadi.service.sendErrorReport("The work node passed into the dispatch form is invalid: " + this.nid);   
            }
        }
        
        // Make sure at least a new dispatch will be created
        if(this.dispatchNode === null){
            this.dispatchNode = {
                type : "dispatch",
                nid : 'new',
                form_part : 0
            };
            
            openDispatch = true;
        }
        
        if(this.workNode !== null){
            if(typeof this.workNode.type !== 'undefined' && this.workNode.type !== null){
                if(typeof this.dispatchNode.field_tow_type === 'undefined' ||
                    typeof this.dispatchNode.field_tow_type.dbValues === 'undefined' ||
                    typeof this.dispatchNode.field_tow_type.dbValues[0] === 'undefined'){
                        
                        this.dispatchNode.field_tow_type = {
                          dbValues: [this.workNode.type]
                        };
                 }
            }
        }
        
        //create app tabs
        this.dispatchObj = this.FormModule.getDispatchObject(Omadi, 'dispatch', this.dispatchNode.nid, 0, this);
        
        this.dispatchTab = Ti.UI.createTab({
            title: 'Dispatch',
            window: this.dispatchObj.win,
            icon: '/images/icon_dispatch_white.png'
        });
        
        this.dispatchObj.win.dispatchTabGroup = this.tabGroup;
        
        if(this.workNode.type === null){
            // Get the current state of the dispatch form, and if the tow type is selected, default the second tab to that type
            this.dispatchObj.formToNode();
            if(typeof this.dispatchObj.node.field_tow_type !== 'undefined' && this.dispatchObj.node.field_tow_type != null){
                if(typeof this.dispatchObj.node.field_tow_type.dbValues !== 'undefined' && this.dispatchObj.node.field_tow_type.dbValues != null){
                    if(typeof this.dispatchObj.node.field_tow_type.dbValues[0] !== 'undefined'){
                        this.workNode = {
                            type: this.dispatchObj.node.field_tow_type.dbValues[0],
                            nid: 'new',
                            form_part: -1
                        };
                    }
                }
            }
        }
        else{
            this.dispatchObj.formToNode();
            if(typeof this.dispatchObj.node.field_tow_type !== 'undefined' && this.dispatchObj.node.field_tow_type != null){
                if(typeof this.dispatchObj.node.field_tow_type.dbValues !== 'undefined' && this.dispatchObj.node.field_tow_type.dbValues != null){
                    if(typeof this.dispatchObj.node.field_tow_type.dbValues[0] !== 'undefined'){
                        workBundle = Omadi.data.getBundle(this.workNode.type);
                        this.dispatchObj.setValues('field_tow_type', {
                            dbValues: [this.workNode.type],
                            textValues: [workBundle.label]
                        });
                    }
                }
            }
        }
        
        if(this.workNode.type !== null){
            this.workObj = this.FormModule.getDispatchObject(Omadi, this.workNode.type, this.workNode.nid, this.workNode.form_part, this);
       
            workBundle = Omadi.data.getBundle(this.workNode.type);
            this.workTab = Ti.UI.createTab({
                title: workBundle.label,
                window: this.workObj.win,
                icon: '/images/icon_truck_white.png'
            });
            
            this.workObj.win.dispatchTabGroup = this.tabGroup;
        }
        
        if(openDispatch){
            this.tabGroup.addTab(this.dispatchTab);
            if(this.workTab){
                this.tabGroup.addTab(this.workTab);
            }
        }
        else{
           if(this.workTab){
               this.tabGroup.addTab(this.workTab);
           }
           this.tabGroup.addTab(this.dispatchTab);
        }
        
        this.tabGroup.addEventListener("omadi:dispatch:towTypeChanged", Dispatch.towTypeChanged);
        this.tabGroup.addEventListener("omadi:dispatch:savedDispatchNode", Dispatch.savedDispatchNode);
        this.tabGroup.addEventListener("android:back", this.exitForm);
        
        if(Ti.App.isAndroid){
            this.tabGroup.addEventListener("open", function(e) {
                Dispatch.tabGroup.activity.onCreateOptionsMenu = function(e) {
                    var menuItem = e.menu.add({
                        title : "Save",
                        icon : "/images/save_light_blue.png"
                    });
                    menuItem.addEventListener("click", Dispatch.doDispatchSave);
                };
            });
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Could not open dispatch window: " + ex);
        alert("There was a problem loading this dispatch. Please contact support.");
    }
    
    this.updateDispatchStatus();
  
    return this.tabGroup;
};

DispatchForm.prototype.exitForm = function(){"use strict";
    var dialog, photoNids;

    dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Exit', 'Cancel'],
        title : 'Really Exit Form?',
        message : 'All changes will be lost.'
    });

    dialog.addEventListener('click', function(e) {
        var db, result, numPhotos, secondDialog, negativeNid, query, continuousId, photoNids, types, dialogTitle, dialogMessage, messageParts, windowNid;
        try{
            if (e.index == 0) {
                
                windowNid = parseInt(Ti.UI.currentWindow.nid, 10);
                if (isNaN(windowNid)) {
                    windowNid = 0;
                }
                
                if(Dispatch.dispatchObj !== null){
                    Dispatch.dispatchObj.closeWindow();
                }
                
                if(Dispatch.workObj !== null){
                    Dispatch.workObj.closeWindow();
                }
                
                // Remove any fully-saved nodes that may not have been linked
                db = Omadi.utils.openMainDatabase();
                db.execute("BEGIN IMMEDIATE TRANSACTION");
                db.execute("DELETE FROM node WHERE flag_is_updated = 5");
                db.execute("COMMIT TRANSACTION");
                db.close();
                
                if(this.setSendingData){
                    // This screen set sending data to true, so free it up in case it's still set
                    // which would be the case for one node validating and the other not validating
                    Omadi.service.setSendingData(false);
                }
                
                Omadi.data.deleteContinuousNodes();
                
                Dispatch.tabGroup.close();
            }
        }
        catch(ex){
            Omadi.service.sendErrorReport("Exception in really exit dialog form?: " + ex);
        }
    });

    dialog.show();
};

DispatchForm.prototype.updateDispatchStatus = function(){"use strict";
    var savedFormPart, windowFormPart, updateToStatus, workBundle;
    
    try{
        if(this.workNode !== null){
            savedFormPart = this.currentWorkFormPart;
            windowFormPart = this.form_part;
            
            Ti.API.debug("About to update dispatch status: " + savedFormPart + " " + windowFormPart);
            
            if(!isNaN(windowFormPart)){
            
                if(windowFormPart > savedFormPart){
                    // We're doing a next part
                    workBundle = Omadi.data.getBundle(this.workNode.type);
                    
                    if(typeof workBundle.data.dispatch !== 'undefined' && typeof workBundle.data.dispatch.dispatch_parts !== 'undefined'){
                        if(typeof workBundle.data.dispatch.dispatch_parts[windowFormPart] !== 'undefined'){
                            
                            // Update the actual status
                            updateToStatus = workBundle.data.dispatch.dispatch_parts[windowFormPart];
                            
                            Ti.API.debug("Updating status to " + updateToStatus);
                            
                            Omadi.bundles.dispatch.updateStatus(this.workNode.nid, updateToStatus, true);
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception updating dispatch status in form: " + ex);
    }
};

DispatchForm.prototype.savedDispatchNode = function(e){"use strict";
    var workNid, dispatchNid, sendUpdates, db, localOnly, singleSaveNid, isFinalSave, setFlag;
    
    Ti.API.debug("in saved dispatchnode");
    
    localOnly = (e.isContinuous || e.isDraft);

    if (!localOnly) {
        Dispatch.setSendingData = true;
        // Don't allow a background job to send data before everything is ready
        Omadi.service.setSendingData(true);
    }
    
    // We have two sets of Info from the 'e' variable. The continuous saves need to stay linked
    // When the final save comes through, we don't want to mix up nids as 4 different negative nids
    // will be floating around for this one dispatch form
    if(e.isContinuous){
        // Don't get continuous and real nids mixed up
        if (e.nodeType == 'dispatch') {
            Dispatch.continuousDispatchInfo = e;
        }
        else {
            Dispatch.continuousWorkInfo = e;
        }
    }
    else{
        // Don't get continuous and real nids mixed up
        if (e.nodeType == 'dispatch') {
            Dispatch.dispatchSavedInfo = e;
        }
        else {
            Dispatch.workSavedInfo = e;
        }
    }

    if (Dispatch.workSavedInfo !== null && Dispatch.dispatchSavedInfo !== null) {
        // Both nodes are saved, so we can close the window
        
        Dispatch.setSendingData = false;
        // Allow the updates to go through now that all the data is present
        Omadi.service.setSendingData(false);
        
        Ti.App.fireEvent('sendUpdates');
        
        Omadi.data.deleteContinuousNodes();
        
        if(Ti.App.isAndroid){
            // This cannot be done on iOS
            // Also, don't close the tabs because that will cause some flashing of screens on iOS... simply close the tabgroup
            if(Dispatch.dispatchObj !== null){
                Dispatch.dispatchObj.closeWindow();
            }
            
            if(Dispatch.workObj !== null){
                Dispatch.workObj.closeWindow();
            }
        }
        
        Dispatch.tabGroup.close();
    }
};

DispatchForm.prototype.towTypeChanged = function(e) {"use strict";
    var newNodeType, newBundle, windowTop, workNode;
    
    try{
        newNodeType = e.dbValue;
    
        newBundle = Omadi.data.getBundle(newNodeType);
        
        if (newBundle) {
            
            if(Dispatch.workTab !== null){
                Dispatch.workTab.setTitle(newBundle.label);
                Dispatch.workObj.initNewNodeTypeForDispatch(newNodeType);   
            }
            else{
                Dispatch.workObj = Dispatch.FormModule.getDispatchObject(Omadi, newNodeType, 'new', -1, Dispatch);
                
                Dispatch.workTab = Ti.UI.createTab({
                    title: newBundle.label,
                    window: Dispatch.workObj.win,
                    icon: '/images/icon_truck_white.png'
                });
                
                Dispatch.tabGroup.addTab(Dispatch.workTab);
                Dispatch.workObj.win.dispatchTabGroup = Dispatch.tabGroup;
                
                if(Ti.App.isIOS){
                    setTimeout(function(){
                        Dispatch.workTab.setActiveTab(Dispatch.dispatchTab);
                    }, 500);
                    //Dispatch.dispatchTab.setActive(true);
                }
            }
        }
        else {
            Dispatch.sendError("There was a problem with the " + newNodeType + " selection. Please select a different option.");
            alert("There was a problem with the " + newNodeType + " selection. Please select a different option.");
        }
    }
    catch(ex){
        Dispatch.sendError("There was an exception with the " + newNodeType + " dispatch selection: " + ex);
        alert("An error occurred with your selection. Please contact support.");
    }
};

DispatchForm.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Omadi.service.sendErrorReport(message);
};

exports.getNode = function(){"use strict";
    var node = {};
    if(Dispatch.workObj !== null){
        node = Dispatch.workObj.node;
    }
    
    return node;
};

exports.getWindow = function(OmadiObj, type, nid, form_part){"use strict";
    Omadi = OmadiObj;
    
    Dispatch = new DispatchForm(type, nid, form_part);
    
    return Dispatch.getWindow();
};
