/*jslint eqeq:true,plusplus:true*/
var Dispatch, Omadi;
var CommentList = null;

var Utils = require('lib/Utils');

function FormTabs(type, nid, form_part){"use strict";
    var tempFormPart, origNid;
    
    //create module instance
    
    this.type = type;
    this.nid = nid;
    this.form_part = form_part;
    
    this.dispatchNode = null;
    this.workNode = null;
    
    this.workTab = null;
    this.dispatchTab = null;
    this.commentsTab = null;
    
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

    this.lastSaveTime = 0;
}

FormTabs.prototype.showActionsOptions = function(e){"use strict";
    var bundle, btn_tt, btn_id, postDialog, windowFormPart;
    
    bundle = Omadi.data.getBundle(Dispatch.workObj.type);
    btn_tt = [];
    btn_id = [];

    btn_tt.push('Save');
    btn_id.push('normal');

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
                            title : 'Form Validation',
                            buttonNames : ['OK'],
                            message: form_errors.join("\n")
                        });
                        
                        dialog.show();
                    }
                    else{
                        Dispatch.doDispatchSave('normal');
                    }
                }
                else{
                    alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
                }
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in dispatch form dispatch post dialog click: " + ex);
        }
    });
};

FormTabs.prototype.doDispatchSave = function(saveType){"use strict";
    var form_errors, dialog, i, now;
    
    now = (new Date()).getTime();
    try{
        if(Dispatch.workObj === null){
            alert("You must first select a job type.");
        }
        else if(Dispatch.workObj.nodeSaved === false){
            // Only allow the button to work once per second
            if(now - Dispatch.lastSaveTime > 1000){
                Dispatch.lastSaveTime = now;
                
                if(Ti.App.isAndroid){
                    // Android doesn't like adding anything to tab groups
                    //Omadi.display.loading("Saving...");
                }
                else{
                    // iOS won't show the loading screen unless it's on the tabgroup
                    Omadi.display.loading("Saving...", Dispatch.tabGroup);
                }
                
                Dispatch.workObj.formToNode();
                if(Dispatch.dispatchTab){
                    Dispatch.dispatchObj.formToNode();
                }
                
                Dispatch.workObj.validate_form_data('normal');
                
                if(Dispatch.dispatchTab){
                    Dispatch.dispatchObj.validate_form_data('normal');
                }
                
                form_errors = Dispatch.workObj.form_errors;
                
                if(Dispatch.dispatchTab){
                    for(i = 0; i < Dispatch.dispatchObj.form_errors.length; i ++){
                        form_errors.push(Dispatch.dispatchObj.form_errors[i] + " (dispatch Tab)");
                    }
                }
                
                if(form_errors.length > 0){
                    
                    Omadi.display.doneLoading();
                    
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Form Validation',
                        buttonNames : ['OK'],
                        message: form_errors.join("\n")
                    });
                    
                    dialog.show();
                }
                else{
                	var missingFiles = Dispatch.getIdsOfMissingFiles(Dispatch.workObj);
                	
                	if (missingFiles.length > 0) {
						var db = Omadi.utils.openListDatabase();
						db.execute('DELETE FROM _files WHERE id IN (' + ids.join(',') + ')');
						db.close();
						
						alert(missingFiles.length + ' of the files you just added ' + (missingFiles.length > 1 ? 'were' : 'was') + ' lost. Please add ' + (missingFiles.length > 1 ? 'them' : 'it') + ' again and resave.');
					} else {
	                    // Save each form individually
	                    if(Dispatch.dispatchObj){
	                        Dispatch.dispatchObj.saveForm('normal');
	                    }
	                    
	                    // Save each form individually
	                    if(Dispatch.workObj){
	                        Dispatch.workObj.saveForm(saveType);
	                    }
	                    
	                    // As each form is saved, an event will be dispatched out to this module to let it know it saved correctly
	                    // Then this module will detect that everything saved correctly and close itself
                   }
                }
            }
        }
        else{
            alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
            Utils.sendErrorReport("User got the dispatch screen did not close alert.");
        }
    }
    catch(ex){
        Utils.sendErrorReport("Could not dodispatchsave: " + ex);
    }
};

FormTabs.prototype.getIdsOfMissingFiles = function(node) {
	var missingFiles = [];
	var db = Omadi.utils.openListDatabase();
	
	try {
		var ids = [node.continuous_nid || 0, 0];
		if (node.nid !== 'new') {
			ids.push(node.nid);
		}
		
		var count = db.execute('SELECT COUNT(*) AS count FROM _files WHERE nid IN (' + ids.join(',') + ')');
		var numMissingFiles = count.fieldByName('count');
		count.close();
		
		if (numMissingFiles > 0) {
			var result = db.execute('SELECT * FROM _files WHERE nid IN (' + ids.join(',') + ')');
			var i = 1;
			while (result.isValidRow()) {
				var filePath = result.fieldByName('file_path');
				if (filePath === null || !Ti.Filesystem.getFile(filePath).exists()) {
					var fileInfo = {
						nid : result.fieldByName('nid'),
						id : result.fieldByName('id'),
						file_path : result.fieldByName('file_path'),
						file_name : result.fieldByName('file_name'),
						field_name : result.fieldByName('field_name'),
						delta : result.fieldByName('delta'),
						timestamp : result.fieldByName('timestamp'),
						tries : result.fieldByName('tries'),
						latitude : result.fieldByName('latitude'),
						longitude : result.fieldByName('longitude'),
						accuracy : result.fieldByName('accuracy'),
						degrees : result.fieldByName('degrees'),
						thumb_path : result.fieldByName('thumb_path'),
						type : result.fieldByName('type'),
						filesize : result.fieldByName('filesize'),
						bytes_uploaded : result.fieldByName('bytes_uploaded'),
						fid : result.fieldByName('fid'),
						uid : result.fieldByName('uid'),
						client_account : result.fieldByName('client_account'),
						uploading : result.fieldByName('uploading'),
						finished : result.fieldByName('finished')
					};
		            
					Omadi.service.sendErrorReport('File ' + i + ' of ' + numMissingFiles + ' not found on node save: ' + JSON.stringify(fileInfo));
					missingFiles.push(fileInfo.id);
				}
				i++;
				result.next();
			}
			result.close();
		}
	} catch (e) {
		Utils.sendErrorReport("Error getting id's of missing files: " + e);
	}
	db.close();
	
	return missingFiles;
};

function incrementCommentTab(e){"use strict";
    var count, title;
    try{
        count = Dispatch.commentsTab.commentCount + 1;
        title = count + ' Comment' + (count == 1 ? '' : 's');
        Dispatch.commentsTab.setTitle(title);
        Dispatch.commentsTab.commentCount = count;  
    }
    catch(ex){
        Utils.sendErrorReport("Exception incrementing the comment count: " + ex);
    }
}

//******** loadCustomCopyNode ****************************************************
// Pass in original node, from node type, and to node type
// Return a modified node with the new type initialized with correct data transfer
//********************************************************************************
FormTabs.prototype.loadCustomCopyNode = function(originalNode, from_type, to_type){"use strict";
    var fromBundle, newNode, to_field_name, from_field_name, index;
    
    fromBundle = Omadi.data.getBundle(from_type);
    
    newNode = {
        created : Omadi.utils.getUTCTimestamp(),
        author_uid: Omadi.utils.getUid(),
        form_part: 0,
        nid: 'new',
        type: to_type,
        changed: Omadi.utils.getUTCTimestamp(),
        changed_uid: Omadi.utils.getUid(),
        origNid: originalNode.nid
    };
    
    if(fromBundle){
        if(originalNode){
            if(typeof fromBundle.data !== 'undefined'){
                if(typeof fromBundle.data.custom_copy !== 'undefined'){
                    if(typeof fromBundle.data.custom_copy[to_type] !== 'undefined'){
                        for(to_field_name in fromBundle.data.custom_copy[to_type]){
                            if(fromBundle.data.custom_copy[to_type].hasOwnProperty(to_field_name)){
                                from_field_name = fromBundle.data.custom_copy[to_type][to_field_name];
                                if(typeof originalNode[from_field_name] !== 'undefined'){
                                    newNode[to_field_name] = originalNode[from_field_name];
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // If there is also a child/parent relationship with the forms, add the parent reference to the child node
        if(typeof fromBundle.child_forms !== 'undefined' && fromBundle.child_forms.length){
            for(index in fromBundle.child_forms){
                if(fromBundle.child_forms.hasOwnProperty(index)){
                    
                    if(fromBundle.child_forms[index].child_node_type == to_type){
                        
                        newNode[fromBundle.child_forms[index].child_field_name] = {};
                        newNode[fromBundle.child_forms[index].child_field_name].dbValues = [];
                        newNode[fromBundle.child_forms[index].child_field_name].textValues = [];
                        newNode[fromBundle.child_forms[index].child_field_name].dbValues.push(originalNode.nid);
                        newNode[fromBundle.child_forms[index].child_field_name].textValues.push(originalNode.title);
                        break;
                    }
                }
            }
        }
    }
    else{
        Ti.API.error("No bundle found for " + from_type);
        Utils.sendErrorReport("No bundle found for " + from_type);
    }
    
    return newNode;
};

FormTabs.prototype.getWindow = function(initNewDispatch){"use strict";
    var dispatchWin, workWin, allowRecover, openDispatch, workBundle, db, result, 
        tempDispatchNid, iconFile, tempFormPart, origNid, copyToBundle, commentsCount, usingDispatch, title;
    
    usingDispatch = false;
    openDispatch = false;
    
    try{
        this.tabGroup = Ti.UI.createTabGroup({
            tabsBackgroundImage: '/images/black_button1.png',
            activeTabBackgroundImage: '/images/blue_button1.png',
            tabsTintColor: '#fff',
            activeTabIconTint: '#fff',
            navBarHidden: true     // IMPORTANT!!!: regardless of what the docs say, if this property does not exist, our autocompletes crash in 2.3.x - should be removed when upgrading to 3.3.0
        });
        
        title = '';
        
        this.restFormObjects();
        
        if (this.nid == 'new') {
    
            if (this.type != 'dispatch') {
                this.workNode = {
                    type : this.type,
                    nid : 'new',
                    form_part : 0
                };
            }
            else {
                this.workNode = {
                    type : null,
                    nid : 'new',
                    form_part : -1
                };
                
                usingDispatch = true;
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
            
            allowRecover = true;
            
            if(this.workNode){
                
                this.currentWorkFormPart = this.workNode.form_part;
                
                if(this.workNode.nid > 0){
                    allowRecover = false;
                }
            
                if (this.workNode.type == 'dispatch') {
                    this.dispatchNode = this.workNode;
                    this.workNode = Omadi.data.nodeLoad(this.dispatchNode.dispatch_nid);
                    if(this.workNode){
                        this.currentWorkFormPart = this.workNode.form_part;
                    }
                    else{
                        alert("A problem occurred with opening this dispatch, which may be due to permissions settings.");
                        return null;
                    }
                    
                    openDispatch = true;
                    usingDispatch = true;
                }
                else {
                    
                    if(this.nid < 0 && this.workNode.dispatch_nid > 0){
                        // Load the corresponding negative id for the dispatch
                        Ti.API.debug("Loading the corresponding negative id for the dispatch: " + JSON.stringify(this.workNode));
                        
                        try{
                            db = Omadi.utils.openMainDatabase();
                            // This is used only for recovering from a dispatch that was continuously saved and a crash happened
                            // This will bring up the correctly saved dispatch node
                            // The continuous_nid is the original nid of the already server-saved node, which will match up 
                            //  with the dispatch_nid of the node, which will never change - and it may be duplicated since there is 
                            //  a regular copy for the server-saved node, and a temporary copy for the continuous node
                            result = db.execute("SELECT nid FROM node WHERE continuous_nid = " + this.workNode.dispatch_nid);
                            tempDispatchNid = 0;
                            if(result.isValidRow()){
                                tempDispatchNid = parseInt(result.field(0), 10);
                            }
                            result.close();
                            db.close();
                            
                            if(!isNaN(tempDispatchNid) && tempDispatchNid < 0){
                                this.dispatchNode = Omadi.data.nodeLoad(tempDispatchNid);
                                openDispatch = false;
                                usingDispatch = true;
                            }
                        }
                        catch(exDB){
                            Ti.API.debug("exception when loading a continuously saved disaptch: " + exDB);
                        }
                    }
                    else{
                    
                        this.dispatchNode = Omadi.data.nodeLoad(this.workNode.dispatch_nid);
                        openDispatch = false;
                    }
                    
                    if(this.workNode.dispatch_nid != 0){
                        usingDispatch = true;
                    }
                }

                if(typeof this.form_part !== 'undefined'){
                    this.workNode.form_part = this.form_part;    
                }
                else{
                    this.form_part = this.workNode.form_part;
                }
                
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
                alert("A problem occurred loading this dispatch. Omadi support has been notified about this issue.");
                Utils.sendErrorReport("The work node passed into the dispatch form is invalid: " + this.nid);   
            }
        }
        
        
        // Make sure at least a new dispatch will be created
        if(this.dispatchNode === null && initNewDispatch){
            this.dispatchNode = {
                type : "dispatch",
                nid : 'new',
                form_part : 0
            };
            
            openDispatch = true;
        }
        
        if(this.workNode !== null){
            if(typeof this.workNode.type !== 'undefined' && this.workNode.type !== null){
                if(this.dispatchNode !== null && (typeof this.dispatchNode.field_tow_type === 'undefined' ||
                    typeof this.dispatchNode.field_tow_type.dbValues === 'undefined' ||
                    typeof this.dispatchNode.field_tow_type.dbValues[0] === 'undefined')){
                        
                        this.dispatchNode.field_tow_type = {
                          dbValues: [this.workNode.type]
                        };
                 }
            }
        }
        
        
        // Setup the title of the tabgroup
        title = '';
        if(usingDispatch && this.dispatchNode){
            if(this.dispatchNode.nid == 'new'){
                title = 'New Dispatch';
            }
            else{
                title = 'Update Dispatch';
            }
        }
        else{
            workBundle = Omadi.data.getBundle(this.workNode.type);
            if(this.workNode.nid == 'new'){
                title = 'New ' + workBundle.label;
            }
            else{
                title = 'Update ' + workBundle.label;   
            }
        }
        
        this.tabGroup.title = title;
        
        
        if(usingDispatch && this.dispatchNode){
            //create app tabs
            this.dispatchObj = this.FormModule.getDispatchObject(Omadi, 'dispatch', this.dispatchNode.nid, 0, this, usingDispatch);
            
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
        }
        
        if(this.workNode && this.workNode.type !== null){
            
            try{
                tempFormPart = parseInt(this.form_part, 10);
                if(this.form_part != tempFormPart){
                    Ti.API.info("This is a custom copy to " + this.form_part);
                    
                    this.workNode.form_part = this.form_part;
                }
            }
            catch(copyEx){
                Utils.sendErrorReport("Exception with custom copy in dispatch: " + copyEx);
            }
            
            this.workObj = this.FormModule.getDispatchObject(Omadi, this.workNode.type, this.workNode.nid, this.workNode.form_part, this, usingDispatch);
            
            this.workNode = this.workObj.node;
            
            workBundle = Omadi.data.getBundle(this.workNode.type);
            this.workTab = Ti.UI.createTab({
                title: workBundle.label,
                window: this.workObj.win,
                icon: '/images/icon_truck_white.png'
            });
            
            this.workObj.win.dispatchTabGroup = this.tabGroup;
        }
        
        // Add this in at the end so the regular work form can't mess with the tow_type on a copy function
        // This section is for form copies to make sure the tow type is set correctly
        try{
            tempFormPart = parseInt(this.form_part, 10);
            if(this.form_part !== tempFormPart){
                
                copyToBundle = Omadi.data.getBundle(this.form_part);
                
                if(copyToBundle && typeof copyToBundle.label !== 'undefined' && this.dispatchObj !== null){
                    this.dispatchObj.setValues('field_tow_type', {
                        dbValues: [this.form_part],
                        textValues: [copyToBundle.label]
                    });
                    
                    // Be sure to disable changing the tow type or there's no point to the copy as all data will be overwritten by blank data
                    this.dispatchObj.setValueWidgetProperty('field_tow_type', 'touchEnabled', false, 0);
                    this.dispatchObj.setValueWidgetProperty('field_tow_type', 'backgroundGradient', null, 0);
                    this.dispatchObj.setValueWidgetProperty('field_tow_type', 'backgroundColor', '#ccc', 0);
                }
            }
        }
        catch(copyEx1){
            Utils.sendErrorReport("Exception with custom copy in dispatch: " + copyEx1);
        }
        
        if(openDispatch){
            if(this.dispatchTab){
                this.tabGroup.addTab(this.dispatchTab);
            }
            if(this.workTab){
                this.tabGroup.addTab(this.workTab);
            }
        }
        else{
           if(this.workTab){
               this.tabGroup.addTab(this.workTab);
           }
           if(this.dispatchTab){
               this.tabGroup.addTab(this.dispatchTab);
           }
        }
        
        if(this.workTab && this.workNode && this.workNode.nid && this.workNode.nid > 0){
            // The node is already saved and on the server
            try{
                CommentList = require('ui/CommentList');
                
                CommentList.init(Omadi, this.workNode.nid);
                commentsCount = CommentList.getCommentCount();
                
                this.commentsTab = Ti.UI.createTab({
                    title: commentsCount + ' Comment' + (commentsCount == 1 ? '' : 's'),
                    window: CommentList.getListWindow(this),
                    commentCount: commentsCount,
                    icon: '/images/icon_comments_white.png'
                });
                
                Ti.App.removeEventListener('incrementCommentTab', incrementCommentTab);
                Ti.App.addEventListener('incrementCommentTab', incrementCommentTab);
                
                this.tabGroup.addTab(this.commentsTab);
            }
            catch(commentEx){
                this.sendError("Exception with comments: " + commentEx);
            }
        }
        
        if(usingDispatch){
            // This listener is not useful unless the dispatch tab is present
            this.tabGroup.addEventListener("omadi:dispatch:towTypeChanged", Dispatch.towTypeChanged);
        }
        
        this.tabGroup.addEventListener("omadi:dispatch:savedDispatchNode", Dispatch.savedDispatchNode);
        
        this.tabGroup.addEventListener("android:back", function(){
            Dispatch.close();
        });
        
        
        this.setupMenu();
        
        // if(Ti.App.isAndroid){
            // this.tabGroup.addEventListener("open", function(e) {
                // Dispatch.tabGroup.activity.onCreateOptionsMenu = function(e) {
                    // var menuItem = e.menu.add({
                        // title : "Save",
                        // icon : "/images/save_light_blue.png",
                        // showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
                    // });
                    // menuItem.addEventListener("click", Dispatch.doDispatchSave);
                // };
            // });
        // }
    }
    catch(ex){
        Utils.sendErrorReport("Could not open dispatch window: " + ex);
        alert("There was a problem loading this dispatch. Please contact support.");
    }
    
    this.updateDispatchStatus();
    
    return this.tabGroup;
};

FormTabs.prototype.setupMenu = function(){"use strict";
    
    Ti.API.debug("In Setup menu");
    
    try {
        if(Ti.App.isAndroid){
            
            this.tabGroup.addEventListener('open', function(){
                try{
                    // var actionBar = Dispatch.tabGroup.activity.actionBar;
                    // actionBar.setHomeAsUp = true;
                    // actionBar.onHomeIconItemSelected = function(){
                        // Dispatch.close();
                    // };
//                     
                    // if(Dispatch.dispatchTab === null && Dispatch.commentsTab === null){
                        // // When only the work tab is visible, do not show any tabs
                        // //actionBar.navigationMode = Ti.Android.NAVIGATION_MODE_STANDARD;
                    // }
                }
                catch(ex){}
            
                Dispatch.tabGroup.activity.onCreateOptionsMenu = function(e) {
                    var db, result, menu_zero, 
                        menu_first, menu_second, menu_third, menu_save_new, 
                        iconFile, windowFormPart, bundle;
                        
                   // btn_tt = [];
                    // btn_id = [];
                    
                    Ti.API.debug("Creating options menu");
                    
                    try{
                        
                        if(Dispatch.workNode === null){
                            Ti.API.error("Need to add the menu when no work node exists!!!");
                        }
                        else{
                        
                            bundle = Omadi.data.getBundle(Dispatch.workNode.type);
                            
                            e.menu.clear();
                            
                            if(Dispatch.dispatchTab === null){
                                if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
                                    
                                    windowFormPart = Dispatch.workNode.form_part;
                                    
                                    if (bundle.data.form_parts.parts.length >= windowFormPart + 2) {
                                        menu_zero = e.menu.add({
                                            title : "Save + " + bundle.data.form_parts.parts[windowFormPart + 1].label,
                                            order : 0,
                                            icon: "/images/save_arrow_white.png",
                                            showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
                                        });
                                        
                                        menu_zero.addEventListener("click", function(ev) {
                                            Dispatch.doDispatchSave('next_part');      
                                        });
                                    }
                                }
                            }
                        
                            menu_first = e.menu.add({
                                title : 'Save',
                                order : 1,
                                icon: "/images/save_light_blue.png",
                                showAsAction: (Ti.Android.SHOW_AS_ACTION_ALWAYS | Ti.Android.SHOW_AS_ACTION_WITH_TEXT)
                            });
                            
                            menu_first.addEventListener("click", function(e) {
                                Dispatch.doDispatchSave('normal');   
                            });
                            
                            if(Dispatch.dispatchTab === null){
                                
                                menu_save_new = e.menu.add({
                                    title : 'Save + New',
                                    order : 2,
                                    icon: "/images/save_plus_white.png",
                                    showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
                                });
                                
                                menu_save_new.addEventListener("click", function(e) {
                                    Ti.API.debug("SAVING + NEW");
                                    Dispatch.doDispatchSave('new');
                                });
                        
                            
                                menu_second = e.menu.add({
                                    title : 'Save as Draft',
                                    order : 3,
                                    icon: "/images/display_drafts_white.png",
                                    showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
                                });
                                
                                menu_second.addEventListener("click", function(e) {
                                    Dispatch.doDispatchSave('draft');
                                });
                            }    
                        }
                    }
                    catch(ex){
                        this.sendError("Could not init the Android menu: " + ex);
                    }
                };
            });
        }
        else{
            // iOS adds the toolbar within each window
        }
    }
    catch(evt) {
        this.sendError("Exception setting up form menu: " + evt);
    }
};

FormTabs.prototype.close = function(callback){"use strict";
    var self = this;

    var dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Exit', 'Cancel'],
        title : 'Really Exit Form?',
        message : 'All changes will be lost.'
    });

    dialog.addEventListener('click', function(e) {
        try{
            if (e.index == 0) {
                self.handleUnsavedAttachments(function(){
                	if(Dispatch.dispatchObj !== null){
	                    Dispatch.dispatchObj.closeWindow();
	                }
	                
	                if(Dispatch.workObj !== null){
	                    Dispatch.workObj.closeWindow();
	                }
	                
	                // Remove any fully-saved nodes that may not have been linked
	                var db = Omadi.utils.openMainDatabase();
	                db.execute("BEGIN IMMEDIATE TRANSACTION");
	                db.execute("DELETE FROM node WHERE flag_is_updated = 5");
	                db.execute("COMMIT TRANSACTION");
	                db.close();
	                
	                if(self.setSendingData){
	                    // This screen set sending data to true, so free it up in case it's still set
	                    // which would be the case for one node validating and the other not validating
	                    Omadi.service.setSendingData(false);
	                }
	                
	                Omadi.data.deleteContinuousNodes();
	                
	               	Dispatch.tabGroup.close();
                });
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in really exit dialog form?: " + ex);
        }
    });

    dialog.show();
};

FormTabs.prototype.handleUnsavedAttachments = function(callback){"use strict";
    Ti.API.debug("In handle unsaved attachments");
    
    try {
    	var attachmentNids = [0, parseInt(this.workObj.continuous_nid, 10) || 0];
        
        if (this.workObj.node.flag_is_updated == 3) { // 3 = Draft
            if(this.workObj.node.nid != 0) {
                // Add any newly created/removed attachments to the draft so they aren't lost
                var db = Omadi.utils.openListDatabase();
				db.execute("UPDATE _files SET nid = " + this.workObj.node.nid + " WHERE nid IN (" + attachmentNids.join(",") + ")");
				db.close();
            }
            callback();
        } else if (Omadi.utils.getPhotoWidget() == 'choose') {
            // This is not a draft, and we don't care about the taken photos
            // Nothing to delete with the choose widget
            // Photos should be managed externally except when uploaded successfully
			callback();
        } else {
            var db = Omadi.utils.openListDatabase();
            var result = db.execute("SELECT COUNT(*) FROM _files WHERE nid IN (" + attachmentNids.join(',') + ")");
            var numAttachments = result.isValidRow() ? result.field(0, Ti.Database.FIELD_TYPE_INT) : 0;
            result.close();
            
            if (numAttachments == 0) {
            	db.close();
            	callback();
            } else {
            	var attachmentTypes = {};
            	
                result = db.execute("SELECT type FROM _files WHERE nid IN (" + attachmentNids.join(',') + ")");
                while (result.isValidRow()) {
                	var type = result.fieldByName('type');
                	if (!attachmentTypes[type]) {
                		attachmentTypes[type] = 0;
                	}
                	attachmentTypes[type]++;
                    result.next();
                }
                result.close();
                db.close();
                
                // Build dialog title
                var attachmentType = '';
                if (Omadi.utils.count(attachmentTypes) > 1) {
                    attachmentType = ' Attachments';
                } else if (attachmentTypes.image){
                	attachmentType = attachmentTypes.image == 1 ? ' Photo' : ' Photos'; 
                } else if (attachmentTypes.video){
                	attachmentType = attachmentTypes.video == 1 ? ' Video' : ' Videos'; 
                } else if (attachmentTypes.signature){
                	attachmentType = attachmentTypes.signature == 1 ? ' Signature' : ' Signatures'; 
                } else if (attachmentTypes.file){
                	attachmentType = attachmentTypes.file == 1 ? ' File' : ' Files'; 
                }
                var dialogTitle = 'Delete ' + numAttachments + attachmentType;
                
                // Build dialog message
                var dialogMessage = 'You have ';
                var attachmentsList = [];
                if (attachmentTypes.image) {
                	attachmentsList.push(attachmentTypes.image + (attachmentTypes.image === 1 ? ' photo' : ' photos'));
                }
                if (attachmentTypes.video) {
                	attachmentsList.push(attachmentTypes.video + (attachmentTypes.video === 1 ? ' video' : ' videos'));
                }
                if (attachmentTypes.signature) {
                	attachmentsList.push(attachmentTypes.signature + (attachmentTypes.signature === 1 ? ' signature' : ' signatures'));
                }
                if (attachmentTypes.file) {
                	attachmentsList.push(attachmentTypes.file + (attachmentTypes.file === 1 ? ' file' : ' files'));
                }
                dialogMessage += Omadi.utils.joinAsSentence(attachmentsList);
                dialogMessage += ' that';
                dialogMessage += numAttachments == 1 ? ' is' : ' are';
                dialogMessage += ' unsaved. Would you like to delete them?';
                
                // Create dialog
                var dialog = Ti.UI.createAlertDialog({
                    cancel : 1,
                    buttonNames : ['Delete', 'Keep', 'Cancel'],
                    message : dialogMessage,
                    title : dialogTitle
                });
                
                dialog.addEventListener('click', function(e) {
                    try{
                    	if (e.index === 0) { // 0 = Delete
                    		// Get the file paths to images that need to be deleted 
                    		var db = Omadi.utils.openListDatabase();
                    		var result = db.execute("SELECT file_path, thumb_path FROM _files WHERE nid IN (" + attachmentNids.join(',') + ")");
                    		
                    		while(result.isValidRow()){
                                // Delete the regular photo file
                                var file = Ti.Filesystem.getFile(result.fieldByName("file_path"));
                                if(file.exists()){
                                    file.deleteFile();
                                }
                                
                                // Delete the thumbnail file if there is one
                                var thumbPath = result.fieldByName("thumb_path");
                                if(thumbPath){
                                    var thumbFile = Ti.Filesystem.getFile(thumbPath);
                                    if(thumbFile.exists()){
                                        thumbFile.deleteFile();
                                    }
                                }
                                
                                result.next();
                            }
                            
                            result.close();
                            
                            // Delete files from the database
                            db.execute("DELETE FROM _files WHERE nid IN (" + attachmentNids.join(',') + ")");
                            db.close();
                            callback();
                    	} else if (e.index === 1) { // 1 = Keep
                    		// Set the nid of the photos to save to -1000000, so they won't be deleted by deletion of other photos, 
                            // and so it isn't automatically used by other new nodes
                    		var db = Omadi.utils.openListDatabase();
                            db.execute("UPDATE _files SET nid = -1000000 WHERE nid IN (" + attachmentNids.join(",") + ")");
                            db.close();
                            callback();
                    	}
                    } catch(ex) {
                        Omadi.service.sendErrorReport("Exception in form second dialog click: " + ex);
                    	callback();
                    }
                });
                
                dialog.show();
            }
        }
    }
    catch(ex){
        this.workObj.sendError("Exception handling unsaved attachments: " + ex);
        callback();
    }
};


FormTabs.prototype.getTimestampFieldName = function(status){"use strict";

    switch(status){
        case 'call_received': return 'time_of_call_0';
        case 'dispatching_call': return 'job_dispatched_time';
        case 'job_accepted': return 'job_accepted_time';
        case 'driving_to_job': return 'started_driving_time';
        case 'arrived_at_job': return 'arrived_at_job_time';
        case 'towing_vehicle': return 'started_towing_time';
        case 'arrived_at_destination': return 'arrived_at_destination_time';
        case 'job_complete': return 'job_complete_time';
    }
    
    return null;
};

FormTabs.prototype.updateDispatchStatus = function(){"use strict";
    var savedFormPart, windowFormPart, updateToStatus, workBundle, textValue, i, timestampFieldName, sendStatusUpdate, origStatus;
    
    sendStatusUpdate = false;
    
    try{
        
        if(this.workNode !== null){
            savedFormPart = this.currentWorkFormPart;
            windowFormPart = this.form_part;
            
            if(!isNaN(windowFormPart)){
                if(windowFormPart > savedFormPart){
                    
                    // We're doing a next part
                    workBundle = Omadi.data.getBundle(this.workNode.type);
                    
                    if(typeof workBundle.data.dispatch !== 'undefined' && typeof workBundle.data.dispatch.dispatch_parts !== 'undefined'){
                        if(typeof workBundle.data.dispatch.dispatch_parts[windowFormPart] !== 'undefined'){
                            
                            // Update the actual status
                            updateToStatus = workBundle.data.dispatch.dispatch_parts[windowFormPart];
                            
                            if(updateToStatus != ""){
                                try{
                                    if(this.dispatchObj && typeof this.dispatchObj.fieldObjects !== 'undefined'){
                                        if(typeof this.dispatchObj.fieldObjects.field_dispatching_status !== 'undefined'){
                                            if(typeof this.dispatchObj.fieldObjects.field_dispatching_status.elements !== 'undefined'){
                                                if(typeof this.dispatchObj.fieldObjects.field_dispatching_status.elements[0] !== 'undefined'){
                                                    
                                                    origStatus = null;
                                                    if(typeof this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].dbValue !== 'undefined'){
                                                        origStatus = this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].dbValue;
                                                    }
                                                    
                                                    if(updateToStatus != origStatus){
                                                        // Send the status update since the original status is different
                                                        sendStatusUpdate = true;
                                                    }
                                                    
                                                    this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].dbValue = updateToStatus;
                                                    
                                                    try{
                                                        // Update the timestamp for the status update
                                                        timestampFieldName = FormTabs.prototype.getTimestampFieldName(updateToStatus);
                                                        if(typeof this.dispatchObj.fieldObjects[timestampFieldName] !== 'undefined'){
                                                            
                                                            // Only allow the timestamp update if one was not already saved
                                                            if(typeof this.dispatchObj.fieldObjects[timestampFieldName].elements[0].dbValue === 'undefined' || 
                                                                Omadi.utils.isEmpty(this.dispatchObj.fieldObjects[timestampFieldName].elements[0].dbValue)){
                                                                
                                                                this.dispatchObj.fieldObjects[timestampFieldName].elements[0].dbValue = Omadi.utils.getUTCTimestamp();
                                                                this.dispatchObj.fieldObjects[timestampFieldName].elements[0].jsTime = (new Date()).getTime();
                                                                
                                                                textValue = Omadi.utils.formatDate(this.dispatchObj.fieldObjects[timestampFieldName].elements[0].dbValue, false);
                                                            
                                                                this.dispatchObj.fieldObjects[timestampFieldName].elements[0].textValue = textValue; 
                                                                this.dispatchObj.fieldObjects[timestampFieldName].dateViews[0].setText(textValue);
                                                                
                                                                textValue = Omadi.utils.formatTime(this.dispatchObj.fieldObjects[timestampFieldName].elements[0].dbValue);
                                                                this.dispatchObj.fieldObjects[timestampFieldName].timeViews[0].setText(textValue);
                                                                
                                                                // Send the status update since a time is not already saved
                                                                sendStatusUpdate = true;
                                                            }
                                                        }   
                                                    }
                                                    catch(timestampEx){
                                                        Utils.sendErrorReport("Could not set timestamp for dispatch status: " + updateToStatus + " " + timestampEx);
                                                    }
                                                    
                                                    textValue = 'Updated Status';
                                                    for(i = 0; i < this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].options.length; i ++){
                                                        if(this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].options[i].dbValue == updateToStatus){
                                                            textValue = this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].options[i].title;
                                                            break;
                                                        }
                                                    }
                                                    
                                                    this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].textValue = textValue;
                                                    this.dispatchObj.fieldObjects.field_dispatching_status.elements[0].setText(textValue);
                                                }
                                            }
                                        }
                                    }
                                }
                                catch(ex1){
                                    Utils.sendErrorReport("Exception updating status on dispatch screen: " + ex1);
                                }
                                
                                if(sendStatusUpdate){
                                    Ti.API.debug("About to send new dispatch status to server: " + savedFormPart + " " + windowFormPart);
                                    Omadi.bundles.dispatch.updateStatus(this.workNode.nid, updateToStatus, true);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception updating dispatch status in form: " + ex);
    }
};

FormTabs.prototype.savedDispatchNode = function(e){"use strict";
    var workNid, dispatchNid, sendUpdates, db, singleSaveNid, isFinalSave, setFlag;

    if (e.saveType != 'continuous' && e.saveType != 'draft') {
        Dispatch.setSendingData = true;
        // Don't allow a background job to send data before everything is ready
        Omadi.service.setSendingData(true);
    }
    
	if (e.saveType != 'continuous') {
        if (e.nodeType == 'dispatch') {
            Dispatch.dispatchSavedInfo = e;
        } else {
            Dispatch.workSavedInfo = e;
        }
	}
    

    if (Dispatch.workSavedInfo && (Dispatch.dispatchSavedInfo || !Dispatch.dispatchTab)) {
        // Both nodes are saved, so we can close the window
        Dispatch.setSendingData = false;
        // Allow the updates to go through now that all the data is present
        Omadi.service.setSendingData(false);
        
        Ti.App.fireEvent('sendUpdates');
        
        Omadi.data.deleteContinuousNodes();

        Dispatch.dispatchSavedInfo = null;
        Dispatch.workSavedInfo = null;
        
        if (e.saveType == 'normal' || e.saveType == 'draft') {
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
        } else if (e.saveType == 'next_part') {
        	Dispatch.workObj.initNewWindowFromCurrentData(Dispatch.workObj.form_part + 1);
        } else if (e.saveType == 'new') {
        	Dispatch.workObj.initNewWindowFromCurrentData(Dispatch.workObj.type);
        }
    }
};

FormTabs.prototype.towTypeChanged = function(e) {"use strict";
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
                Dispatch.workObj = Dispatch.FormModule.getDispatchObject(Omadi, newNodeType, 'new', -1, Dispatch, true);
                
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

FormTabs.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Utils.sendErrorReport(message);
};

exports.getNode = function(){"use strict";
    var node = {};
    if(Dispatch.workObj !== null){
        node = Dispatch.workObj.node;
    }
    
    return node;
};

exports.getWindow = function(OmadiObj, type, nid, form_part, initNewDispatch){"use strict";
    Omadi = OmadiObj;
    
    Dispatch = new FormTabs(type, nid, form_part);
    return Dispatch.getWindow(initNewDispatch);
};

exports.loggingOut = function(){"use strict";
    if(Dispatch.dispatchObj !== null){
        Dispatch.dispatchObj.closeWindow();
    }
    
    if(Dispatch.workObj !== null){
        Dispatch.workObj.closeWindow();
    }
    
    if(self.setSendingData){
        // This screen set sending data to true, so free it up in case it's still set
        // which would be the case for one node validating and the other not validating
        Omadi.service.setSendingData(false);
    }
    
    Omadi.data.deleteContinuousNodes();
    
   	Dispatch.tabGroup.close();
};

exports.switchedNid = function(e){"use strict";
	// This is the callback from a successful form creation on the server to change any open forms that match the negative nid
    //   to the correct positive nid so duplicate forms will not be created
    
    
	if(Dispatch.dispatchObj !== null){
        switchNidForObject(Dispatch.dispatchObj, e);
    }
    
    if(Dispatch.workObj !== null){
        switchNidForObject(Dispatch.workObj, e);
    }
};

function switchNidForObject(obj, e) {
    Ti.API.info("In switched nid: " + JSON.stringify(e));
    
    try{
        if(e.negativeNid == obj.nid){
            obj.nid = e.positiveNid;
            obj.node.nid = e.positiveNid;
            obj.origNid = e.positiveNid;
            obj.node.origNid = e.positiveNid;
            Ti.API.info("Switched the negative nid to the positive nid correctly");
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception switching the nid in a form: " + ex);
    }	
};


exports.photoUploaded = function(e){"use strict";
    var i, nid, delta, fid, field_name, dbValues;
    Ti.API.info("In photo Uploaded: " + JSON.stringify(e));
    
    // Currently, only supporting images in the work node, so nothing should be done in the dispatch form until it's supported
    
    if (Dispatch.workObj !== null) {
	    try{
	        nid = parseInt(e.nid, 10);
	        delta = parseInt(e.delta, 10);
	        field_name = e.field_name;
	        fid = parseInt(e.fid, 10);
	        
	        if(Dispatch.workObj.nid == nid){
	            if(typeof Dispatch.workObj.fieldWrappers[field_name] !== 'undefined'){
	                
	                Ti.API.info("Just inserted a photo uploaded with delta: " + delta + ", fid: " + fid + ", field_name: " + field_name);
	                
	                Dispatch.workObj.setValueWidgetProperty(field_name, 'dbValue', fid, delta);
	                Dispatch.workObj.setValueWidgetProperty(field_name, 'fid', fid, delta);
	            }
	        }
	    }
	    catch(ex){
	        Omadi.service.sendErrorReport("Exception switching the photo id in a form: " + ex);
	    }
    }
};

FormTabs.prototype.restFormObjects = function() {
	this.FormModule = require('ui/FormModule');
    this.FormModule.reset();
    Dispatch.workObj = null;
    Dispatch.dispatchObj = null;
};
