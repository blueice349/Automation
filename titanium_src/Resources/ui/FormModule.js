/*jslint eqeq:true, plusplus:true, vars:true, nomen:true*/

var FormObj, Omadi, ActiveFormObj, popupWin, popupWinListView, popupWinFieldObject, popupWinDescriptionLabel;
FormObj = {};
popupWin = null;

var Utils = require('lib/Utils');

function rules_field_passed_time_check(time_rule, timestamp) {"use strict";
    var retval, timestamp_day, timestamp_midnight, days, day_rule, values, start_time, end_time, i;

    retval = false;

    timestamp_day = Number(Omadi.utils.PHPFormatDate('w', Number(timestamp)));

    Ti.API.debug(timestamp_day);

    if (time_rule != '' && time_rule != null) {

        timestamp_midnight = Omadi.utils.mktime(0, 0, 0, Omadi.utils.PHPFormatDate('n', Number(timestamp)), Omadi.utils.PHPFormatDate('j', Number(timestamp)), Omadi.utils.PHPFormatDate('Y', Number(timestamp)));

        days = time_rule.split(';');

        day_rule = days[timestamp_day];

        values = day_rule.split('|');
        
        Ti.API.info(JSON.stringify(values));

        if (values[0] == '1' || values[0] == 1) {
            if (values[1] == '1' || values[1] == 1) {
                retval = true;
            }
            else {
                for(i = 2; i < values.length; i += 2){
                    start_time = Number(timestamp_midnight) + Number(values[i]);
                    
                    // Make sure the end value exists
                    if(typeof values[i+1] !== 'undefined'){
                        
                        // Get the end minute and add 59 seconds to go to the end of the minute
                        end_time = Number(timestamp_midnight) + Number(values[i+1]) + Number(59);
        
                        // For times like 8:00PM - 5:00AM
                        if (start_time > end_time) {
                            end_time = Number(end_time) + Number((3600 * 24));
                        }
        
                        if (Number(timestamp) >= Number(start_time) && Number(timestamp) <= Number(end_time)) {
                            retval = true;
                        }
                    }
                }
            }
        }

        if (retval == false) {
            // Check the previous day in case there was a bleedover time from the previous day
            if (timestamp_day == 0) {
                timestamp_day = 6;
            }
            else {
                timestamp_day--;
            }
            day_rule = days[timestamp_day];

            values = day_rule.split('|');
            if (values[0] == '1' && values[0] == 1) {
                if (values[1] == '1' && values[1] == 1) {
                    // Do nothing, since we're not on this previous day
                    // Do not return true
                    Ti.API.debug("");
                }
                else {
                    for(i = 2; i < values.length; i += 2){
                        start_time = Number(timestamp_midnight) + Number(values[i]);
                        
                        // Make sure the end time exists in the array
                        if(typeof values[i+1] !== 'undefined'){
                            
                            end_time = Number(timestamp_midnight) + Number(values[i+1]) + Number(59);
                            
                            // For times like 8:00PM - 5:00AM
                            if (start_time > end_time) {
                                start_time = Number(start_time) - (3600 * 24);
                                // Only do the check if we're in a multi-day time span since we moved to the day before
                                if (Number(timestamp) >= Number(start_time) && Number(timestamp) <= Number(end_time)) {
                                    retval = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        retval = true;
    }
    return retval;
}

function getRegionHeaderView(regionView, region, expanded){"use strict";
    
    var arrow_img, regionHeader, regionHeaderWrapper, collapsedView;
    
    arrow_img = Ti.UI.createImageView({
        image : '/images/light_arrow_left.png',
        width : 29,
        height : 29,
        top: 5,
        right: 5,
        zIndex : 999,
        touchEnabled: false
    });
    
    if(expanded){
        arrow_img.image = '/images/light_arrow_down.png';
    }
    
    regionHeaderWrapper = Ti.UI.createView({
        height: Ti.UI.SIZE,
        width: '100%'
    });

    regionHeader = Ti.UI.createLabel({
        text : region.label.toUpperCase(),
        color : '#ddd',
        font : {
            fontSize : 18,
            fontWeight : 'bold'
        },
        textAlign : 'center',
        width : '100%',
        top: 0,
        height : 40,
        ellipsize : true,
        wordWrap : false,
        zIndex : 998,
        expanded: expanded,
        backgroundGradient : Omadi.display.backgroundGradientGray
    });
    
    collapsedView = Ti.UI.createLabel({
        top: 40,
        width: '100%',
        height: Ti.UI.SIZE,
        text: region.label + ' is Collapsed',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#666',
        font: {
            fontSize: 13
        },
        backgroundColor: '#ddd'
    });
    
    if(expanded){
        collapsedView.visible = false;
        collapsedView.borderWidth = 0;
    }
    
    regionHeader.arrow = arrow_img;
    regionHeader.collapsedView = collapsedView;
    regionHeader.regionView = regionView;
    
    regionHeader.addEventListener('click', function(e) {
        try{
            var regionView;
            e.source.expanded = !e.source.expanded;
            regionView = e.source.regionView;
            
            // unfocus the field so the screen doesn't jump around everywhere
            ActiveFormObj.unfocusField();
            
            if (e.source.expanded === true) {
                
                e.source.collapsedView.hide();
                e.source.collapsedView.setBorderWidth(0);
    
                regionView.show();
                
                e.source.arrow.setImage("/images/light_arrow_down.png");
                
                regionView.setHeight(Ti.UI.SIZE);
                
                ActiveFormObj.unfocusField();
                
                // For iOS, just make sure the region is expanded as layout doesn't always happen
                if(Ti.App.isIOS){
                    setTimeout(function(){
                        regionView.setHeight(Ti.UI.SIZE);
                    }, 100);
                }
                
                setTimeout(function(){
                    ActiveFormObj.unfocusField();
                }, 250);
            }
            else {
              
                e.source.collapsedView.show();
                e.source.collapsedView.setBorderWidth(1);
                
                regionView.hide();
                
                regionView.setHeight(0);
               
                e.source.arrow.setImage("/images/light_arrow_left.png");
            }
        }
        catch(ex){
            Utils.sendErrorReport("Exception in region click: " + ex);
        }
    });
    
    regionHeaderWrapper.add(regionHeader);
    regionHeaderWrapper.add(arrow_img);
    regionHeaderWrapper.add(collapsedView);
    
    return regionHeaderWrapper;
}

function sort_by_weight(a, b) {"use strict";
    if (a.weight != null && a.weight != "" && b.weight != null && b.weight != "") {
        return a.weight > b.weight;
    }
    return 0;
}

function FormModule(type, nid, form_part, usingDispatch) {"use strict";
    var tempNid, tempFormPart, origNid;
    
    Ti.API.debug("Instantiating new form module");
    
    if(typeof form_part === 'undefined'){
        Ti.API.error("form part is undefined at init !!!: " + type);
    }
    
    this.win = null;
    
    this.alertQueue = [];
    this.node = {};
    this.nid = nid;
    this.origNid = 0;
    this.type = type;
    this.form_part = form_part;
    this.dispatch_nid = 0;
    this.usingDispatch = usingDispatch;
    this.instances = {};
    this.regions = {};
    this.hasViolationField = false;
    this.hasExtraPriceField = [];
    this.saveInterval = null;
    this.nodeSaved = false;
    this.trySaveNodeTries = 0;
    this.continuous_nid = 0;
    this.checkConditionalFieldNames = {};
    this.scrollPositionY = 0;
    this.flag_is_updated = 0;
    
    // items that must be removed and nulled for GC to work properly
    this.regionViews = {};
    this.fieldWrappers = {};
    this.fieldRegionWrappers = {};
    this.labelViews = {};
    this.currentlyFocusedField = null;
    this.scrollView = null;
    this.fieldObjects = {};
    
    this.parentTabObj = null;
    
    this.win = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    });
    
    Ti.App.saveContinually = true;
    
    try{
        if(this.nid == 'new'){
            this.initNewNode();
            
            if(this.usingDispatch){
                if(this.type == 'dispatch'){
                    this.node.dispatch_nid = this.dispatch_nid = this.continuous_nid + 1;
                }
                else{
                    this.node.dispatch_nid = this.dispatch_nid = this.continuous_nid - 1;
                }
            }
        }
        else{
            this.node = Omadi.data.nodeLoad(this.nid);
            
            if(this.node.continuous_nid == null || this.node.continuous_nid == 0){
                this.node.continuous_nid = Omadi.data.getNewNodeNid();
                if(this.type == 'dispatch'){
                    // For dispatch nodes, decrement the save id so it's not the same as the one for the work node
                    this.node.continuous_nid --;
                }
            }
            else if(this.node.continuous_nid > 0){
                // this is something saved on the server.
                // Make the original regular nid the positive server nid
                // Make the continuous a new one
                origNid = this.node.nid;
                
                this.origNid = this.node.origNid = this.node.continuous_nid;
                this.nid = this.node.nid = this.origNid;
                
                if(origNid < 0){
                    // This will be for drafts or from continuous saves
                    this.node.continuous_nid = origNid;
                }
                else{
                    this.node.continuous_nid = Omadi.data.getNewNodeNid();
                    if(this.type == 'dispatch'){
                        // For dispatch nodes, decrement the save id so it's not the same as the one for the work node
                        this.node.continuous_nid --;
                    }
                }
            }
            
            // Make sure origNid is setup correctly, as it is needed for the images to show properly
            // The origNid should be the positive id
            if(this.origNid == 0){
                if(this.continouous_nid > 0){
                    this.origNid = this.node.origNid = this.continuous_nid;
                }
                else{
                    this.origNid = this.node.origNid = this.nid;
                }
            }
            
            // Make sure the window nid is updated to the real nid, as it could have changed in nodeLoad
            this.nid = this.node.nid;
            this.continuous_nid = this.node.continuous_nid;
            this.dispatch_nid = this.node.dispatch_nid;
            
            // Make sure this is set for deleting drafts properly
            this.flag_is_updated = this.node.flag_is_updated;
            
            Ti.API.debug("continuous nid: " + this.continuous_nid);
            Ti.API.debug("window nid: " + this.nid);
            Ti.API.debug("window dispatch_nid: " + this.dispatch_nid);
        }
        
        
        tempFormPart = parseInt(this.form_part, 10);
        if(this.form_part == tempFormPart){
            this.node.form_part = this.form_part;
        }
        else{
            // This is a copy to form, the form_part passed in is which type to copy to
            Ti.API.info("This is a custom copy to " + this.form_part);
            
            this.node = this.loadCustomCopyNode(this.node, this.type, this.form_part);
            
            origNid = this.node.origNid;
            this.custom_copy_orig_nid = this.node.custom_copy_orig_nid = this.node.origNid;
            
            this.type = this.node.type;
            this.nid = 'new';
            
            this.form_part = 0;
            
            if(this.usingDispatch){
                if(this.type == 'dispatch'){
                    this.node.dispatch_nid = this.dispatch_nid = this.continuous_nid + 1;
                }
                else{
                    this.node.dispatch_nid = this.dispatch_nid = this.continuous_nid - 1;
                }
            }
        }
        
        if(this.node !== null && typeof this.node.custom_copy_orig_nid === 'undefined'){
            this.custom_copy_orig_nid = this.node.custom_copy_orig_nid = 0;
        }
    }
    catch(ex){
        Ti.API.error("Exception initializing the FormModule");
    }
}

FormModule.prototype.initNewWindowFromCurrentData = function(form_part){"use strict";
    var imageNids, field_name, listDB, result, fid, i, found;
    
    this.nodeSaved = false;
    
    if(isNaN(form_part)){
        // This is a save + new
        if(form_part == this.node.type){
            
            this.node = this.loadCustomCopyNode(this.node, this.type, this.type);
            
            this.node.continuous_nid = this.continuous_nid = Omadi.data.getNewNodeNid();
            this.nid = this.node.nid = 'new';
            this.type = this.node.type;
            this.form_part = this.node.form_part = 0;
            this.dispatch_nid = this.node.dispatch_nid = 0;
            this.origNid = this.node.origNid = 0;
            this.flag_is_updated = this.node.flag_is_updated = 0;
            
            ActiveFormObj = this;
            
            this.win.remove(this.wrapperView);
            this.wrapperView = null;
            
            this.getWindow();
        }
        else{
            Utils.sendErrorReport("Trying to do a save + new from form window with type:  " + form_part);
        }
    }
    else{
        // This is a save + next
        
        this.node.form_part = this.form_part = form_part;
        
        try{
            
            // Permenantely fix this later - this is to get it out
            // This simply adds in the correct images that were just taken
            imageNids = [0, this.node.continuous_nid];
            if(this.node.nid != 'new'){
                imageNids.push(this.node.nid);
            }
            
            if(this.node.origNid != 'new'){
                imageNids.push(this.node.origNid);
            }
            
            listDB = Omadi.utils.openListDatabase();
            for(field_name in this.instances){
                if(this.instances.hasOwnProperty(field_name)){
                    if(this.instances[field_name].type == 'image'){
                        result = listDB.execute('SELECT * FROM _files WHERE nid IN(' + imageNids.join(',') + ') AND field_name ="' + field_name + '" ORDER BY delta ASC');
                        
                        if (result.rowCount > 0) {
                            
                            this.node[field_name].imageData = [];
                            this.node[field_name].deltas = [];
                            this.node[field_name].degrees = [];
                            this.node[field_name].thumbData = [];
                        
                            while (result.isValidRow()) {
                                
                                Ti.API.debug("Has an image...");
                                
                                fid = parseInt(result.fieldByName('fid'), 10);
                                
                                Ti.API.debug("Image fid: " + fid);
                            
                                if(fid > 0){
                                    // This image has successfully uploaded
                                    
                                    if(typeof this.node[field_name].dbValues !== 'undefined'){
                                        found = false;
                                        for(i = 0; i < this.node[field_name].dbValues.length; i ++){
                                            if(this.node[field_name].dbValues[i] == fid){
                                                found = true;
                                            }
                                        }
                                        
                                        if(!found){
                                            this.node[field_name].dbValues.push(fid);
                                        }
                                    }
                                    else{
                                        this.node[field_name].dbValues = [];
                                        this.node[field_name].push(fid);
                                    }
                                }
                                else{
                                    this.node[field_name].imageData.push(result.fieldByName('file_path'));
                                    this.node[field_name].deltas.push(result.fieldByName('delta'));
                                    this.node[field_name].degrees.push(result.fieldByName('degrees', Ti.Database.FIELD_TYPE_INT));
                                    this.node[field_name].thumbData.push(result.fieldByName('thumb_path'));
                                }
                                
                                result.next();
                            }
                        }
                        result.close();
                    }
                }
            }
            listDB.close();
        }
        catch(ex){
            Utils.sendErrorReport("Exception setting up the imagedata for a form + next part: " + ex);
            try{
                listDB.close();
            }
            catch(ex1){}
        }
        ActiveFormObj = this;
        
        this.win.remove(this.wrapperView);
        this.wrapperView = null;
        
        this.getWindow();
    }
};

FormModule.prototype.initNewNodeTypeForDispatch = function(newNodeType){"use strict";
    
    var origDispatchNid, i, FormTabsObj;
    
    origDispatchNid = this.node.dispatch_nid;
    
    this.nid = 'new';
    this.type = newNodeType;
    this.form_part = -1;
    this.currentlyFocusedField = null;
    this.labelViews = {};
    this.fieldWrappers = {};
    this.regionViews = {};
    this.instances = {};
    this.regions = {};
    this.checkConditionalFieldNames = {};
    
    this.initNewNode();
    
    this.node.dispatch_nid = origDispatchNid;
    
    // Reset all but the dispatch section of the global formobj
    FormTabsObj = null;
    for(i in FormObj){
        if(FormObj.hasOwnProperty(i)){
            if(i == 'dispatch'){
                FormTabsObj = FormObj[i];
            }
        }
    }
    
    FormObj = {};
    
    if(FormTabsObj !== null){
        FormObj.dispatch = FormTabsObj;
    }
    
    FormObj[newNodeType] = this;
    ActiveFormObj = this;
    
    this.win.remove(this.wrapperView);
    this.wrapperView = null;
    
    this.getWindow();
};

FormModule.prototype.scrollToField = function(e) {"use strict";
    var calculatedTop, amountToScrollUp;

    if ( typeof this.scrollView !== 'undefined' && this.scrollView !== null) {
        calculatedTop = e.source.convertPointToView({
            x : 0,
            y : 0
        }, this.scrollView);
        
        amountToScrollUp = 187; // (4*38) + 35;
        
        if(calculatedTop.y < 210){ // 187 + 23
            amountToScrollUp -= (210 - calculatedTop.y);
        }
        
        if(amountToScrollUp > 0){
            this.scrollView.scrollTo(0, this.scrollPositionY + amountToScrollUp);
        }
    }
};

FormModule.prototype.closeWindow = function(){"use strict";
     var i, j, k;
     
     try{
         if(this.saveInterval !== null){
            clearInterval(this.saveInterval); 
            this.saveInterval = null;
         } 
     }
     catch(ex1){}
     
     try{
        this.win.remove(this.scrollView);
        this.win.close();
     }
     catch(ex3){} 
     
     try{
          Omadi.data.deleteContinuousNodes();
     }
     catch(ex4){
         Utils.sendErrorReport("Exception deleting continuous: " + ex4);
     }
     
     try{
         Ti.API.debug("in closewindow");
         
         try{
             for(j in this.regionViews){
                 if(this.regionViews.hasOwnProperty(j)){
                     if(typeof this.fieldRegionWrappers[j] !== 'undefined'){
                         for(k = 0; k < this.fieldRegionWrappers[j].length; k ++){
                             this.regionViews[j].remove(this.fieldRegionWrappers[j][k]);
                             this.fieldRegionWrappers[j][k] = null;
                         }
                         this.fieldRegionWrappers[j] = null;
                     }
                     this.scrollView.remove(this.regionViews[j]);
                     this.regionViews[j] = null;
                 }
             }
         }
         catch(exRegion){
             Utils.sendErrorReport("Exception removing region views: " + exRegion);
         }
         
         this.regionViews = {};
         this.fieldRegionWrappers = {};
         
         this.scrollView = null;
         
         
         for(j in this.fieldObjects){
            if(this.fieldObjects.hasOwnProperty(j)){
                try{
                    this.fieldObjects[j].cleanUp();
                }
                catch(ex2){
                    Utils.sendErrorReport("Failed to cleanup object: " + ex2);
                }
                
                this.fieldObjects[j] = null;
            }
         }
         this.fieldObjects = {};
             
         for(j in this.fieldWrappers){
             if(this.fieldWrappers.hasOwnProperty(j)){
                 this.fieldWrappers[j] = null;
             }
         }
         this.fieldWrappers = {};
          
         for(j in this.labelViews){
             if(this.labelViews.hasOwnProperty(j)){
                 this.labelViews[j] = null;
             }
         }
         this.labelViews = {};
         
         this.currentlyFocusedField = null;
         
         Ti.API.debug("end of closewindow");
     }
     catch(ex){
         Ti.API.error("Exception in close window: " + ex);
     }
};

FormModule.prototype.trySaveNode = function(saveType){"use strict";
    /*jslint nomen: true*/
    
    saveType = saveType || 'regular';
    
    try {
		// If an updating is happening try again later.
		if(Omadi.data.isUpdating() && saveType != 'continuous' && saveType != 'draft'){
			Ti.API.info("Trying to save node while updating");
			
			if (this.trySaveNodeTries == 0) {
				Omadi.display.loading('Waiting...');
			}
			
			var self = this;
			
			setTimeout(function() {
				self.trySaveNode(saveType);
			}, 1000);
			
			// After 10 tries ignore the update and save anyway.
			this.trySaveNodeTries++;
			if (this.trySaveNodeTries > 10) {
				Omadi.data.setUpdating(false);
			}
			return;
		}
		
		this.saveNode(saveType);
		
	} catch (e) {
		Utils.sendErrorReport("Exception in trysavenode: " + e);
	} finally {
		this.trySaveNodeTries = 0;
		Omadi.display.doneLoading();
	}
};

FormModule.prototype.saveNode = function(saveType) {"use strict";
    var origNode = this.node;
    
	this.node._isContinuous = (saveType == 'continuous');
	this.node._isDraft = (saveType == 'draft');
    
    try {
	    // Do not allow the web server's data in a background update
	    // to overwrite the local data just being saved
	    Ti.App.allowBackgroundUpdate = false;
	    this.node = Omadi.data.nodeSave(this.node);
	    
	    if(this.node._saved){
            // Now that the node is saved on the phone or a big error occurred, allow background logouts
            Ti.App.allowBackgroundLogout = true;
            
            // Setup the current node and nid in the window so a duplicate won't be made for this window
            this.nid = this.node.nid;
            
            if (!this.node._isContinuous) {
                if (!this.node._saved) {
                    Utils.sendErrorReport("Node failed to save on the phone: " + JSON.stringify(this.node));
                    alert("There is a problem with the form data, and it cannot not be saved. Please fix the data or close the form.");
                    return;
                }
                
                this.nodeSaved = true;
            }
            
            var eventData = {
                nodeNid: this.node._saveNid,
                nodeType: this.node.type,
                saveType: saveType
            };
            
            // Notify the user if there is no network
            if (Ti.Network.online || this.node._isContinuous || this.node._isDraft) {
                this.win.dispatchTabGroup.fireEvent('omadi:dispatch:savedDispatchNode', eventData);
                Ti.App.fireEvent('savedNode', eventData);
            } else {
                var self = this;
                var dialog = Titanium.UI.createAlertDialog({
                    title : 'No Internet Connection',
                    buttonNames : ['OK'],
                    message: 'Alert management of this ' + this.node.type.toUpperCase() + ' immediately. You do not have an Internet connection right now.  Your data was saved and will be synched when you connect to the Internet.'
                });
                dialog.addEventListener('click', function(e) {
                self.win.dispatchTabGroup.fireEvent('omadi:dispatch:savedDispatchNode', eventData);
                    Ti.App.fireEvent('savedNode', eventData);
                });
                dialog.show();
            }
        }
        else{
            alert("A problem occurred saving the form. Please fix any form problems and try again.");
            Utils.sendErrorReport("Error saving the node: " + JSON.stringify(origNode) + " " + JSON.stringify(this.node));
        }
	} catch (e) {
		Utils.sendErrorReport("Exception in saveNode: " + e);
	}
};

//******** loadCustomCopyNode ****************************************************
// Pass in original node, from node type, and to node type
// Return a modified node with the new type initialized with correct data transfer
//********************************************************************************
FormModule.prototype.loadCustomCopyNode = function(originalNode, from_type, to_type){"use strict";
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
        Utils.sendErrorReport("No bundle found for " + from_type);
    }
    
    return newNode;
};

FormModule.prototype.formToNode = function(addDispatch){"use strict";
    /*global fieldViews*/
   
   var field_name, fieldWrapper, instance, origNode;
   
   if(typeof addDispatch === 'undefined'){
       addDispatch = false;
   }
   
   this.initNewNode();
   this.node.no_data = "";
   
   try{
       Ti.API.info("CONVERTING TO NODE");
       
       for(field_name in this.fieldWrappers){
           if(this.fieldWrappers.hasOwnProperty(field_name)){
               fieldWrapper = this.fieldWrappers[field_name];
               
               instance = fieldWrapper.instance;
               
               this.node[instance.field_name] = {};
               this.node[instance.field_name].dbValues = this.getDBValues(fieldWrapper);
               this.node[instance.field_name].textValues = this.getTextValues(fieldWrapper);
           }
       }
       
       try{
           if(addDispatch === true && this.usingDispatch){
               if(typeof FormObj.dispatch !== 'undefined'){
                   for(field_name in FormObj.dispatch.fieldWrappers){
                        if(FormObj.dispatch.fieldWrappers.hasOwnProperty(field_name)){
                           fieldWrapper = FormObj.dispatch.fieldWrappers[field_name];
                   
                           instance = fieldWrapper.instance;
                           
                           this.node[instance.field_name] = {};
                           this.node[instance.field_name].dbValues = FormObj.dispatch.getDBValues(fieldWrapper);
                           this.node[instance.field_name].textValues = FormObj.dispatch.getTextValues(fieldWrapper);
                        }
                   }
               }
           }
       }
       catch(dispatchEx){
           Utils.sendErrorReport("Exception adding dispatch info to node: " + dispatchEx);
       }
   }
   catch(ex){
       Utils.sendErrorReport("Bundling node from form: " + ex);
       alert("There was a problem bundling the submitted data. The cause of the error was sent to support.");
   }
   
   //Ti.API.info(JSON.stringify(this.node));
};

FormModule.prototype.getDBValues = function(fieldWrapper){"use strict";
    var dbValues = [], i, j, k, m, children, subChildren, subSubChildren, subSubSubChildren;
    
    if(typeof fieldWrapper !== 'undefined'){
        children = fieldWrapper.getChildren();
        
        // Find the dbValue up to 4 levels deep in the UI elements
        // The only one going 4 levels deep is the image field with widget signature
        for(i = 0; i < children.length; i ++){
            if(typeof children[i].dbValue !== 'undefined'){
                if(typeof children[i].dbValue === 'object' && children[i].dbValue instanceof Array){
                    dbValues = children[i].dbValue;
                }
                else{
                    dbValues.push(Omadi.utils.trimWhiteSpace(children[i].dbValue));
                }
            }
            else if(children[i].getChildren().length > 0){
                subChildren = children[i].getChildren();
                for(j = 0; j < subChildren.length; j ++){
                    if(typeof subChildren[j].dbValue !== 'undefined'){
                        
                        if(typeof subChildren[j].dbValue === 'object' && subChildren[j].dbValue instanceof Array){
                            //Ti.API.debug(JSON.stringify(subChildren[j].dbValue));
                            dbValues = subChildren[j].dbValue;
                        }
                        else{
                            dbValues.push(Omadi.utils.trimWhiteSpace(subChildren[j].dbValue));
                        }
                    }
                    else if(subChildren[j].getChildren().length > 0){
                        subSubChildren = subChildren[j].getChildren();
                        for(k = 0; k < subSubChildren.length; k ++){
                            if(typeof subSubChildren[k].dbValue !== 'undefined'){
                                if(typeof subSubChildren[k].dbValue === 'object' && subSubChildren[k].dbValue instanceof Array){
                                    dbValues = subSubChildren[k].dbValue;
                                }
                                else{
                                    dbValues.push(Omadi.utils.trimWhiteSpace(subSubChildren[k].dbValue));
                                }
                            }
                            else if(subSubChildren[k].getChildren().length > 0){
                                subSubSubChildren = subSubChildren[k].getChildren();
                                for(m = 0; m < subSubSubChildren.length; m ++){
                                    if(typeof subSubSubChildren[m].dbValue !== 'undefined'){
                                        if(typeof subSubSubChildren[m].dbValue === 'object' && subSubSubChildren[m].dbValue instanceof Array){
                                            dbValues = subSubSubChildren[m].dbValue;
                                        }
                                        else{
                                            dbValues.push(Omadi.utils.trimWhiteSpace(subSubSubChildren[m].dbValue));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return dbValues;
};

FormModule.prototype.getTextValues = function(fieldWrapper){"use strict";
    var textValues = [], i, j, k, m, children, subChildren, subSubChildren, subSubSubChildren;
    
    children = fieldWrapper.getChildren();
    
    // Find the textValue up to 3 levels deep in the UI elements
    for(i = 0; i < children.length; i ++){
        if(typeof children[i].textValue !== 'undefined'){
            textValues.push(children[i].textValue);
        }
        else if(children[i].getChildren().length > 0){
            subChildren = children[i].getChildren();
            for(j = 0; j < subChildren.length; j ++){
                if(typeof subChildren[j].textValue !== 'undefined'){
                    textValues.push(subChildren[j].textValue);
                }
                else if(subChildren[j].getChildren().length > 0){
                    subSubChildren = subChildren[j].getChildren();
                    for(k = 0; k < subSubChildren.length; k ++){
                        if(typeof subSubChildren[k].textValue !== 'undefined'){
                            textValues.push(subSubChildren[k].textValue);
                        }
                        else if(subSubChildren[k].getChildren().length > 0){
                            subSubSubChildren = subSubChildren[k].getChildren();
                            for(m = 0; m < subSubSubChildren.length; m ++){
                                if(typeof subSubSubChildren[m].textValue !== 'undefined'){
                                    textValues.push(subSubSubChildren[m].textValue);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return textValues;
};

// *** getRegionWrappers ***************************
// Takes the original form object and the node type
// Returns views for each region
//**************************************************
FormModule.prototype.getRegionWrappers = function(){"use strict";
    
    var regions, region, regionName, expanded, regionFormPart, regionView, regionWrapperView, regionWrappers;
    
    regionFormPart = 0;
    regionView = null;
    regionWrapperView = null;
    regionWrappers = [];
    
    for(regionName in this.regions){
        if(this.regions.hasOwnProperty(regionName)){
            region = this.regions[regionName];
            
            if(typeof region.settings !== 'undefined' && region.settings != null && typeof region.settings.form_part !== 'undefined'){
                regionFormPart = parseInt(region.settings.form_part, 10);
            }
            else{
                regionFormPart = 0;
            }
           
            if(regionFormPart <= this.node.form_part || (this.node.form_part == -1 && regionFormPart == 0)){
                
                expanded = true;
                if(typeof region.settings !== 'undefined' && 
                    region.settings != null &&
                    typeof region.settings.always_expanded !== 'undefined' && 
                    region.settings.always_expanded == 1){
                        
                        expanded = true;
                }
                else if(typeof region.settings !== 'undefined' && 
                    region.settings != null &&
                    typeof region.settings.always_collapsed !== 'undefined' && 
                    region.settings.always_collapsed == 1){
                        
                        expanded = false;
                }
                else if(regionFormPart < this.node.form_part){
                    expanded = false;
                }
                
                regionWrapperView = Ti.UI.createView({
                    height: Ti.UI.SIZE,
                    width: '100%',
                    layout: 'vertical'
                });
                
                // Setup the full region view that will contain the fields
                regionView = Ti.UI.createView({
                    width : '100%',
                    backgroundColor : '#eee',
                    height: Ti.UI.SIZE,
                    layout: 'vertical'
                });
                
                if(expanded === false){
                    regionView.visible = false;
                    regionView.height = 5;
                }
                
                // Add the region header that is clickable for expanding, collapsing
                regionWrapperView.add(getRegionHeaderView(regionView, region, expanded));
                
                // Add a little space below the header
                regionWrapperView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
                  
                regionWrapperView.add(regionView);
                regionWrappers.push(regionWrapperView);
                 
                Ti.API.debug("Added region " + regionName);
                
                this.regionViews[regionName] = regionView;
            }
        }
    }
    
    return regionWrappers;
};



FormModule.prototype.validateRestrictions = function(){"use strict";
    var instances, query, db = null, result, timestamp, field_name, vin, license_plate, nid, restrictions, i, account;
    
    restrictions = [];
    
    try{
        // Only check on creation
        if(this.node.nid === 'new' || this.node.nid < 0){
        
            nid = null;
            vin = null;
            account = null;
            license_plate = null;
            
            if(typeof this.node.vin !== 'undefined' && 
                typeof this.node.vin.dbValues !== 'undefined' && 
                this.node.vin.dbValues !== null && 
                this.node.vin.dbValues.length > 0 && 
                this.node.vin.dbValues[0] != null && 
                this.node.vin.dbValues[0] != ""){
                    vin = this.node.vin.dbValues[0].toUpperCase();
            }
            
            if(typeof this.node.license_plate___plate !== 'undefined' && 
                typeof this.node.license_plate___plate.dbValues !== 'undefined' && 
                this.node.license_plate___plate.dbValues !== null && 
                this.node.license_plate___plate.dbValues.length > 0 && 
                this.node.license_plate___plate.dbValues[0] != null && 
                this.node.license_plate___plate.dbValues[0] != ""){
                    license_plate = this.node.license_plate___plate.dbValues[0].toUpperCase();
            }
            
            if(typeof this.node.enforcement_account !== 'undefined' && 
                typeof this.node.enforcement_account.dbValues !== 'undefined' && 
                this.node.enforcement_account.dbValue !== null && 
                this.node.enforcement_account.dbValues.length > 0 && 
                this.node.enforcement_account.dbValues[0] != null){
                    nid = this.node.enforcement_account.dbValues[0];
                    account = this.node.enforcement_account.textValues[0];
            }
            
            if(nid !== null && nid > 0){
                timestamp = Omadi.utils.getUTCTimestamp();
                
                query = 'SELECT restriction_license_plate___plate, vin, restrict_entire_account, restriction_start_date, restriction_end_date ';
                query += ' FROM restriction WHERE restriction_account="' + nid + '"';
                query += ' AND ((restriction_start_date < ' + timestamp + ' OR restriction_start_date IS NULL) ';
                query += ' AND (restriction_end_date > ' + timestamp + ' OR restriction_end_date IS NULL))';
                
                db = Omadi.utils.openMainDatabase();
                result = db.execute(query);
            
                while (result.isValidRow()) {
                    
                    restrictions.push({
                        license_plate : result.fieldByName('restriction_license_plate___plate'),
                        restrict_entire_account : result.fieldByName('restrict_entire_account'),
                        startTime: result.fieldByName('restriction_start_date'),
                        endTime: result.fieldByName('restriction_end_date'),
                        vin : result.fieldByName('vin')
                    });
                    result.next();
                }
                result.close();
                    
                for(i = 0; i < restrictions.length; i ++){
                    if(restrictions[i].restrict_entire_account == 1){
                        this.form_errors.push("No parking enforcement is allowed for \"" + account + "\" right now due to a restriction.");
                    }
                    else if(restrictions[i].license_plate != null && license_plate == restrictions[i].license_plate.toUpperCase()){
                        this.form_errors.push("The license plate \"" + license_plate + "\" is currently restricted for \"" + account + "\".");
                    }
                    else if(restrictions[i].vin != null && vin == restrictions[i].vin.toUpperCase()){
                        this.form_errors.push("The VIN \"" + vin + "\" is currently restricted for \"" + account + "\".");
                    }
                }
                db.close();
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate restriction: " + ex);
        
        if(db != null){
            try{
                db.close();
            }
            catch(nothing){
                
            }
        }
    }
};

FormModule.prototype.validateRequired = function(instance){"use strict";
    var isEmpty, dbValues = [], i;
    
    isEmpty = true;
    
    try{ 
        if(typeof this.node[instance.field_name].dbValues !== 'undefined' && 
            this.node[instance.field_name].dbValues !== null && 
            this.node[instance.field_name].dbValues.length > 0){
                
            dbValues = this.node[instance.field_name].dbValues;
            for(i = 0; i < dbValues.length; i ++){
                
                switch(instance.type){
                    case 'text':
                    case 'text_long':
                    case 'phone':
                    case 'email':
                    case 'link_field':
                    case 'location':
                    case 'vehicle_fields':
                    case 'license_plate':
                    case 'rules_field':
                    case 'list_text':
                        if(dbValues[i] > ""){
                            isEmpty = false;
                        }
                        break;
                        
                    case 'number_integer':
                    case 'number_decimal':
                    case 'image':
                    case 'datestamp':
                    case 'omadi_time':
                    case 'extra_price':
                    
                        if(!Omadi.utils.isEmpty(dbValues[i])){
                            isEmpty = false;
                        }
                        break;
                    
                    case 'omadi_reference':
                    case 'taxonomy_term_reference':
                    case 'user_reference':
                    case 'file':
                    case 'auto_increment':
                    case 'list_boolean': 
                        if(!Omadi.utils.isEmpty(dbValues[i]) && dbValues[i] != 0){
                            isEmpty = false;
                        }
                        break;
                        
                    case 'calculation_field':
                        isEmpty = false;
                        break;
                    
                    default: 
                        Utils.sendErrorReport("Missing field type def in validate_form_data for field_name " + instance.field_name);
                        break;
                }
            }
        }
        
        if (((instance.is_title === true) || (instance.isRequired) || instance.isConditionallyRequired) && instance.can_view == true){
            
             if(isEmpty){
                 if(instance.type == 'location'){
                     
                     if(instance.part == 'postal_code'){
                         if(typeof instance.settings.require_zip !== 'undefined' && instance.settings.require_zip == 1){
                             this.form_errors.push(instance.label + " " + instance.partLabel + " is required");
                         }
                     }
                     else{
                         this.form_errors.push(instance.label + " " + instance.partLabel + " is required");
                     }
                 }
                 else{
                            
                     if(instance.partLabel === null){
                         this.form_errors.push(instance.label + " is required");
                     }
                     else{
                         this.form_errors.push(instance.label + " " + instance.partLabel + " is required");
                     }
                 }
             }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate required: " + ex);
    }
};

FormModule.prototype.validateMinLength = function(instance){"use strict";
    var minLength, i;
    
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
                if (instance.settings.min_length != null) {
                    minLength = parseInt(instance.settings.min_length, 10);
                    if(minLength >= 0){
                        for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                            if(this.node[instance.field_name].dbValues[i] !== null && this.node[instance.field_name].dbValues[i] > ''){
                                if (this.node[instance.field_name].dbValues[i].length < minLength) {
                                    this.form_errors.push(instance.label + " requires at least " + minLength + " characters");
                                }  
                            }
                        }
                    }
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate min length: " + ex);
    }
};

FormModule.prototype.validateMaxLength = function(instance){"use strict";
    var maxLength, i;
    
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
                if (instance.settings.max_length != null) {
                    maxLength = parseInt(instance.settings.max_length, 10);
                    if(maxLength > 0){
                        for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                            if (this.node[instance.field_name].dbValues[i].length > maxLength) {
                                this.form_errors.push(instance.label + " cannot have more than " + maxLength + " characters.");
                            }  
                        }
                    }
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate max length: " + ex);
    }
};

FormModule.prototype.validateMinValue = function(instance){"use strict";
    var minValue, absoluteMinValue, i;
    
    try{
        absoluteMinValue = (instance.type == 'number_integer') ? -2147483648 : -99999999;
        
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0 &&
            this.node[instance.field_name].dbValues[0] !== null) {
                
                if (instance.settings.min != null && instance.settings.min.length > 0) {
                    minValue = parseFloat(instance.settings.min);
                    if(minValue < absoluteMinValue){
                        minValue = absoluteMinValue;
                    }
                }
                else{
                    minValue = absoluteMinValue;
                }
                
                for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                    if (this.node[instance.field_name].dbValues[i] !== null && this.node[instance.field_name].dbValues[i] < minValue) {
                        this.form_errors.push(instance.label + " cannot be less than " + minValue + ".");
                    }  
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate min value: " + ex);
    }
};

FormModule.prototype.validateMaxValue = function(instance){"use strict";
    var maxValue, absoluteMaxValue, i;
    
    try{
        absoluteMaxValue = (instance.type == 'number_integer') ? 2147483647 : 99999999;
        
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0 &&
            this.node[instance.field_name].dbValues[0] !== null) {
                
                if (instance.settings.max != null && instance.settings.max.length > 0) {
                    maxValue = parseFloat(instance.settings.max);
                    if(maxValue > absoluteMaxValue){
                        maxValue = absoluteMaxValue;
                    }
                }
                else{
                    maxValue = absoluteMaxValue;
                }
                
                Ti.API.debug("Max value : " + maxValue);
                
                for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                    if (this.node[instance.field_name].dbValues[i] !== null && this.node[instance.field_name].dbValues[i] > maxValue) {
                        this.form_errors.push(instance.label + " cannot be greater than " + maxValue + ".");
                    }  
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate max value: " + ex);
    }
};


FormModule.prototype.validate_form_data = function(saveType){"use strict";
    
    var field_name, instance, values, isEmpty, i, region_name;
    
    this.form_errors = [];
    
    try{
        
        if(saveType == 'draft'){
            this.validateRestrictions();
        }
        else if(saveType != 'continuous'){
        
            this.validateRestrictions();

            // Only show restriction error if one exists
            if(this.form_errors !== null && this.form_errors.length == 0){
                
                for(field_name in this.instances){
                    if(this.instances.hasOwnProperty(field_name)){
                        
                        instance = this.instances[field_name];
                        
                        region_name = instance.region;
                        
                        if(instance.disabled == 0 && typeof this.regionViews[region_name] !== 'undefined'){                
                            if(typeof this.node[field_name] !== 'undefined'){
                            
                                /*** REQUIRED FIELD VALIDATION / CONDITIONALLY REQUIRED ***/
                                this.validateRequired(instance);
                                
                                /*** MIN_LENGTH VALIDATION ***/
                                switch(instance.type){
                                    case 'text_long':
                                    case 'text':
                                        this.validateMinLength(instance);
                                        break;
                                }
                                
                                /*** MAX_LENGTH VALIDATION ***/
                                switch(instance.type){
                                    case 'text':
                                        this.validateMaxLength(instance);
                                        break;
                                }
                                
                                /*** MIN/MAX VALUE VALIDATION ***/
                                switch(instance.type){
                                    case 'number_integer':
                                    case 'number_decimal':
                                        this.validateMinValue(instance);
                                        this.validateMaxValue(instance);
                                        break;
                                }
                                
                                if(instance.type === 'phone'){
                                    this.validatePhone(instance);
                                }
                                
                                if(instance.type === 'email'){
                                    this.validateEmail(instance);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in form validation: " + ex);
    }
};

FormModule.prototype.validateEmail = function(instance){"use strict";
    
    var i, regExp;
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
            
                for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                    if (!Omadi.utils.isEmpty(this.node[instance.field_name].dbValues[i]) && !this.node[instance.field_name].dbValues[i].match(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i)) {
                        this.form_errors.push(instance.label + " is not a valid email address.");
                    }  
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate email: " + ex);
    }
};

FormModule.prototype.validatePhone = function(instance){"use strict";
    var i, regExp;
    
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
            
                for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                    if (!Omadi.utils.isEmpty(this.node[instance.field_name].dbValues[i]) && !this.node[instance.field_name].dbValues[i].match(/\D*(\d*)\D*[2-9][0-8]\d\D*[2-9]\d{2}\D*\d{4}\D*\d*\D*/g)) {
                        this.form_errors.push(instance.label + " is not a valid North American phone number. 10 digits are required.");
                    }  
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate phone: " + ex);
    }
};

FormModule.prototype.validateMaxLength = function(instance){"use strict";
    var maxLength, i;
    
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
                if (instance.settings.max_length != null) {
                    maxLength = parseInt(instance.settings.max_length, 10);
                    if(maxLength > 0){
                        for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                            if (this.node[instance.field_name].dbValues[i].length > maxLength) {
                                this.form_errors.push(instance.label + " cannot have more than " + maxLength + " characters.");
                            }  
                        }
                    }
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate max length: " + ex);
    }
};

FormModule.prototype.saveForm = function(saveType){"use strict";
    /*jslint nomen: true*/
    var dialog, showingDuplicates;
    
    Ti.API.info("Saving with type: " + saveType);
    
    try{
        this.formToNode();
        
        if(saveType == 'draft'){
            this.node._isDraft = true;
        }
        else{
            this.node._isDraft = false;
        }
        
        if(saveType == 'continuous'){
            this.node._isContinuous = true;
        }
        else{
            this.node._isContinuous = false;
        }
        
        this.node.viewed = Omadi.utils.getUTCTimestamp();
        
        this.form_errors = [];
        Ti.API.debug("About to validate");
        
        if(this.node._isContinuous === false){
            this.validate_form_data(saveType);
        }
        
        if(this.form_errors && this.form_errors.length > 0){
            dialog = Titanium.UI.createAlertDialog({
                title : 'Form Validation',
                buttonNames : ['OK'],
                message: this.form_errors.join("\n")
            });
            
            dialog.show();
        }
        else{
            
            try{
                showingDuplicates = false;
                
                if(this.node._isContinuous === false){
                    // Only check duplicates on regular saves
                    showingDuplicates = this.showDuplicateWarnings(saveType);
                }
                
                if(!showingDuplicates){
                    this.trySaveNode(saveType);
                }
            }
            catch(ex){
                alert("Saving to mobile database: " + ex);
            }
            
            Omadi.display.doneLoading();
        }
    }
    catch(ex1){
        Utils.sendErrorReport("Exception saving form: " + ex1);
    }
};

function duplicateWarningCompleteCallback(e){"use strict";
    var json, fieldName, value, saveType, doSave;
    
    try{
        ActiveFormObj.win.removeEventListener('duplicateWarningComplete', duplicateWarningCompleteCallback);
    }
    catch(ex4){}
    
    try{
        if(typeof ActiveFormObj.duplicateWaitingAlert !== 'undefined'){
            if(ActiveFormObj.duplicateWaitingAlert !== null){
                ActiveFormObj.duplicateWaitingAlert.hide();
            }
        }
    }
    catch(ex3){
        Utils.sendErrorReport("Exception in closing waiting dialog for duplicatewarningcomplete: " + ex3);
    }
    
    try{
        
        json = e.json;
        fieldName = e.field_name;
        value = e.value;
        saveType = e.saveType;
        
        doSave = false;
        
        
        if(typeof json.matches !== 'undefined'){
            if(json.matches.length > 0){
                ActiveFormObj.displayDuplicateWarnings(json, value, saveType);
            }
            else{
                if(saveType != null){
                    doSave = true;
                }
                else{
                    alert("No previous matches found.");
                }
            }
        }
        else{
            if(saveType != null){
                doSave = true;
            }
            else{
                alert("No previous matches found.");
            }
        }
        
        if(doSave){
            // Actually finish the saving process
            if(ActiveFormObj.usingDispatch){
                ActiveFormObj.trySaveNode(saveType);
                FormObj.dispatch.trySaveNode(saveType);
            }
            else{
                ActiveFormObj.trySaveNode(saveType);
            } 
        }
    }
    catch(ex1){
        Utils.sendErrorReport("Exception in duplicatewarningcomplete: " + ex1);
    }
}

FormModule.prototype.showDuplicateWarnings = function(saveType){"use strict";
    var i, fieldObject, nodeValue, showingDuplicates, alertDialog, alertMessage;
    // If duplicate warnings are being shown, this function will take care of the node save after the dialog
    // Returns a boolean: true if duplicates were shown, falst otherwise
    
    showingDuplicates = false;
    
    for(i in this.fieldObjects){
        if(this.fieldObjects.hasOwnProperty(i)){
            fieldObject = this.fieldObjects[i];
            
            if(typeof fieldObject.duplicateWarnings !== 'undefined'){
                if(typeof this.node[fieldObject.instance.field_name] !== 'undefined'){
                    if(typeof this.node[fieldObject.instance.field_name].dbValues !== 'undefined'){
                        if(typeof this.node[fieldObject.instance.field_name].dbValues[0] !== 'undefined'){
                            
                            nodeValue = "".toString() + this.node[fieldObject.instance.field_name].dbValues[0];
                            nodeValue = nodeValue.trim();
                            
                            if(nodeValue.length > 0){
                                if(typeof fieldObject.duplicateWarnings[nodeValue] !== 'undefined'){
                                    if(typeof fieldObject.duplicateWarnings[nodeValue].matches !== 'undefined'){
                                       if(fieldObject.duplicateWarnings[nodeValue].matches.length > 0){
                                           showingDuplicates = true;
                                           
                                           this.displayDuplicateWarnings(fieldObject.duplicateWarnings[nodeValue], nodeValue, saveType);
                                       } 
                                       else if(saveType === null){
                                           alert("No previous matches found.");
                                       }
                                    }
                                    else if(saveType === null){
                                        alert("No previous matches found.");
                                    }
                                }
                                else{
                                    showingDuplicates = true;
                                    
                                    if(Ti.Network.online){
                                        Ti.API.info("We must fetch the duplicate warnings...");
                                    
                                        this.win.addEventListener('duplicateWarningComplete', duplicateWarningCompleteCallback);
                                        
                                        fieldObject.setDuplicateWarnings(fieldObject.instance.field_name, nodeValue, saveType);
                                        
                                        if(saveType === null){
                                            this.duplicateWaitingAlert = Ti.UI.createAlertDialog({
                                                title: 'Waiting for previous matches',
                                                message: 'Please wait for previous matches to be generated.',
                                                buttonNames: ['Cancel']
                                            });
                                        }
                                        else{
                                            this.duplicateWaitingAlert = Ti.UI.createAlertDialog({
                                                title: 'Waiting for previous matches',
                                                message: 'Please wait for previous matches to be generated.',
                                                buttonNames: ['Abort/Save Now', 'Cancel']
                                            });
                                            
                                            this.duplicateWaitingAlert.addEventListener('click', function(e){
                                                if(e.index === 0){
                                                    ActiveFormObj.trySaveNode(saveType);
                                                }
                                                
                                                ActiveFormObj.duplicateWaitingAlert = null;
                                            });
                                        }
                                        
                                        this.duplicateWaitingAlert.show();
                                    }
                                    else{
                                        
                                        if(saveType === null){
                                            alert("Please try again when you have an Internet connection.");
                                        }
                                        else{
                                            // Alert the user with the disclaimer
                                            try{
                                                Ti.Media.vibrate();
                                            }
                                            catch(ex2){}
                                            
                                            alertDialog = Ti.UI.createAlertDialog({
                                                title: 'No Network Connection',
                                                message: "Unable to fetch previous duplicates because you do not have an Internet connection. \n\nIf you save now, be sure you lookup previous matches manually.",
                                                buttonNames: ['Save Anyway', 'Cancel'] 
                                            });
                                            
                                            alertDialog.addEventListener('click', function(e){
                                                if(e.index === 0){
                                                    ActiveFormObj.trySaveNode(saveType);
                                                }
                                            });
                                            
                                            alertDialog.show();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }    
    }
    
    return showingDuplicates;
};

FormModule.prototype.displayDuplicateWarnings = function(warningJSON, value, saveType){"use strict";
    var wrapper, headerView, buttonsView, buttonWrapper, scrollView, saveButton, cancelButton, 
        headerText, warningCount, db, nids, i, result, localNids, title, matches, row, tableData, 
        textView, rowImg, titleLabel, timeLabel, tableView, now, showWindow;
    
    
    showWindow = true;
    now = (new Date()).getTime();
    
    // Don't show the window on top of itself
    if(typeof this.duplicateWarningTimestamp !== 'undefined' && this.duplicateWarningTimestamp > 0){
        if(now - this.duplicateWarningTimestamp < 4000){
            showWindow = false;
        }
    }
    
    if(showWindow){
        
        this.duplicateWarningTimestamp = now;
        
        try{
            try{
                
                if(Ti.App.isAndroid){
                    Ti.UI.Android.hideSoftKeyboard();
                }
                
                if(saveType !== null){
                    Ti.Media.vibrate();
                }
            }
            catch(exVib){}
            
            matches = warningJSON.matches;
            warningCount = matches.length;
            
            headerText = warningCount + " Previous Match" + (warningCount == 1 ? '' : 'es') + " for \"" + value + "\"";
            
            wrapper = Ti.UI.createView({
               backgroundColor: '#000',
               height: Ti.UI.FILL,
               width: Ti.UI.FILL,
               top: 0,
               bottom: 0,
               left: 0,
               right: 0
            });

			if(Ti.App.isIOS7){
			    wrapper.top = 20;
			}
            
            scrollView = Ti.UI.createScrollView({
               top: 40,
               bottom: 50,
               left: 0,
               right: 0,
               backgroundColor: '#fc7'
            });
            
            nids = [];
            localNids = {};
            tableData = [];
            
            // Disabled the below for now
            for(i = 0; i < matches.length; i ++){
                nids.push(matches[i].nid);
            }
            
            try{
                if(nids.length > 0){
                    db = Omadi.utils.openMainDatabase();
                
                    result = db.execute("SELECT nid FROM node WHERE nid IN (" + nids.join(',') + ")");
                    while(result.isValidRow()){
                        localNids[result.field(0)] = result.field(0);
                        
                        result.next();
                    }
                    db.close();
                }
            }
            catch(exDB){
                Utils.sendErrorReport("Exception in database section of display duplicate: " + exDB);
            }
            
            for(i = 0; i < matches.length; i ++){
                title = Omadi.utils.trimWhiteSpace(matches[i].title);
    
                if (title.length == 0) {
                    title = '- No Title -';
                }
    
                row = Ti.UI.createTableViewRow({
                    width: '100%',
                    height: Ti.UI.SIZE,
                    nid: matches[i].nid,
                    backgroundColor: '#fc9',
                    localNid: (typeof localNids[matches[i].nid] === 'undefined') ? false : true,
                    nodeType: matches[i].type
                });
                
                textView = Ti.UI.createView({
                    right: 1,
                    left: 50,
                    top: 0,
                    height: Ti.UI.SIZE,
                    layout: 'vertical'
                });            
                
                rowImg = Ti.UI.createImageView({
                    image: Omadi.display.getNodeTypeImagePath(matches[i].type),
                    top: 5,
                    left: 5,
                    width: 35,
                    height: 35,
                    bottom: 5
                });
                
                titleLabel = Ti.UI.createLabel({
                    width: '100%',
                    text: matches[i].title,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                    height: Ti.UI.SIZE,
                    font: {
                        fontSize: 16
                    },
                    color: '#000'
                });
                
                timeLabel = Ti.UI.createLabel({
                    text: 'Saved ' + Omadi.utils.getTimeAgoStr(matches[i].created),
                    height: Ti.UI.SIZE,
                    width: '100%',
                    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                    color: '#999',
                    font: {
                        fontSize: 14
                    }
                });
                
                row.add(rowImg);
                textView.add(titleLabel);
                textView.add(timeLabel);
                row.add(textView);
                
                tableData.push(row);
            }
            
            tableView = Ti.UI.createTableView({
                width: '100%',
                bottom: 0,
                scrollable: true,
                top: 0,
                separatorColor : '#ccc',
                data: tableData
            });
            
            tableView.addEventListener('click', function(e){
                try{
                    if(e.row.localNid){
                        Omadi.display.openViewWindow(e.row.nodeType, e.row.nid);
                    }
                    else{
                        Omadi.display.openWebView(e.row.nid);
                    }
                }
                catch(ex){
                    Utils.sendErrorReport("Exception in duplicate warning table view click: " + ex);
                }
            });
            
            scrollView.add(tableView);
            
            headerView = Ti.UI.createLabel({
                top: 0,
                height: 40,
                width: Ti.UI.FILL,
                text: headerText,
                textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                font: {
                    fontWeight: 'bold',
                    fontSize: 18
                },
                color: '#eee',
                backgroundGradient: Omadi.display.backgroundGradientGray
            });
            
            buttonsView = Ti.UI.createView({
               bottom: 0,
               width: Ti.UI.FILL,
               height: 50,
               backgroundColor: '#999'
            });
            
            buttonWrapper = Ti.UI.createView({
                layout: 'horizontal',
                width: Ti.UI.SIZE,
                top: 5
            });
            
            // If saveType === null, then no save button should be displayed, as this is coming from the widget instead of the save button
            if(saveType !== null){
                saveButton = Ti.UI.createLabel({
                    text: 'Continue Saving',
                    color: '#eee',
                    backgroundGradient: Omadi.display.backgroundGradientBlue,
                    height: 40,
                    width: 150,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    left: 5,
                    font : {
                        fontSize: 18,
                        fontWeight: 'bold'
                    },
                    borderRadius: 5
                });
                
                saveButton.addEventListener('click', function(e){
                    var i;
                    
                    // Allow another save to happen immediately
                    ActiveFormObj.duplicateWarningTimestamp = 0;
                    // Hide the window
                    ActiveFormObj.win.remove(wrapper);
                    
                    // Actually finish the saving process
                    if(ActiveFormObj.usingDispatch){
                        Ti.API.info("about to save node from continue saving button with type: " + saveType);
                        // For dispatch, there are no other options for save type besides normal
                        ActiveFormObj.trySaveNode(saveType);
                        Ti.API.info("about to save dispatch node");
                        FormObj.dispatch.trySaveNode(saveType);
                        Ti.API.info("done saving dispatch node");
                    }
                    else{
                        ActiveFormObj.trySaveNode(saveType);
                    } 
                });
                
                cancelButton = Ti.UI.createLabel({
                    text: 'Cancel',
                    color: '#eee',
                    backgroundGradient: Omadi.display.backgroundGradientGray,
                    height: 40,
                    width: 150,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    right: 5,
                    font : {
                        fontSize: 18,
                        fontWeight: 'bold'
                    },
                    borderRadius: 5
                });
                
                cancelButton.addEventListener('click', function(e){
                    // Allow another save to happen immediately
                    ActiveFormObj.duplicateWarningTimestamp = 0;
                    
                    // Hide the window
                    ActiveFormObj.win.remove(wrapper);
                    wrapper = null;
                });
                
                buttonWrapper.add(cancelButton);
                buttonWrapper.add(saveButton);
            }
            else{
                cancelButton = Ti.UI.createLabel({
                    text: 'Done',
                    color: '#eee',
                    backgroundGradient: Omadi.display.backgroundGradientBlue,
                    height: 40,
                    width: 150,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    right: 5,
                    font : {
                        fontSize: 18,
                        fontWeight: 'bold'
                    },
                    borderRadius: 5
                });
                
                cancelButton.addEventListener('click', function(e){
                    // Allow another save to happen immediately
                    ActiveFormObj.duplicateWarningTimestamp = 0;
                    
                    // Hide the window
                    ActiveFormObj.win.remove(wrapper);
                    wrapper = null;
                });
                
                buttonWrapper.add(cancelButton);
            }
            
            buttonsView.add(buttonWrapper);
            
            wrapper.add(headerView);
            wrapper.add(scrollView);
            wrapper.add(buttonsView);
            
            this.win.add(wrapper);
        }
        catch(ex){
            Utils.sendErrorReport("Exception showing duplicate warnings: " + ex);
        }
    }
};

FormModule.prototype.initNewNode = function(){"use strict";

    var uid, now;
    try{
        uid = Omadi.utils.getUid();
        now = Omadi.utils.getUTCTimestampServerCorrected();
        
        if(typeof this.form_part === 'undefined'){
            Ti.API.error("form part is undefined!!!: " + this.type);
        }
        
        this.node = {};
        this.node.created = now;
        this.node.author_uid = uid;
       
        // Set the original values passed in
        this.node.nid = this.nid;
        this.node.type = this.type;
        this.node.form_part = this.form_part;
        this.node.dispatch_nid = this.dispatch_nid;
        this.node.origNid = this.origNid;
        this.node.flag_is_updated = this.flag_is_updated;
        this.node.custom_copy_orig_nid = this.custom_copy_orig_nid;
        
        this.node.changed = now;
        this.node.changed_uid = uid;
        
        if(!this.continuous_nid){
            this.node.continuous_nid = this.continuous_nid = Omadi.data.getNewNodeNid();
            
            if(this.type == 'dispatch'){
                // For dispatch nodes, decrement the save id so it's not the same as the one for the work node
                this.continuous_nid --;
                this.node.continuous_nid --;
            }
        }
        else{
            this.node.continuous_nid = this.continuous_nid;
        }
        
        if(this.origNid == 0){
            if(this.continuous_nid > 0 || this.nid == 'new'){
                this.origNid = this.node.origNid = this.continuous_nid;
            }
            else{
                this.origNid = this.node.origNid = this.nid;
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception initializing a new node: " + ex);
    }
};
FormModule.prototype.getFormFieldValues = function(field_name){"use strict";
    var retval = {};
    
    if(typeof this.fieldWrappers[field_name] !== 'undefined'){
        retval.dbValues = this.getDBValues(this.fieldWrappers[field_name]);
        retval.textValues = this.getTextValues(this.fieldWrappers[field_name]);
    }
    
    return retval;
};

FormModule.prototype.setValues = function(field_name, defaultValues){"use strict";
    try{
        if(typeof defaultValues.dbValues[0] !== 'undefined'){
            this.setValueWidgetProperty(field_name, ['dbValue'], defaultValues.dbValues[0]);    
        }
        
        if(typeof defaultValues.textValues[0] !== 'undefined'){
            this.setValueWidgetProperty(field_name, ['textValue'], defaultValues.textValues[0]);
        
            if(this.instances[field_name].type == 'taxonomy_term_reference' || 
                this.instances[field_name].type == 'list_text' || 
                (this.instances[field_name].type == 'omadi_reference' && this.instances[field_name].widget.type == 'omadi_reference_select')){
                this.setValueWidgetProperty(field_name, ['text'], defaultValues.textValues[0]);
            }
            else{
                this.setValueWidgetProperty(field_name, ['value'], defaultValues.textValues[0]);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in setValues: " + ex);
    }
};

FormModule.prototype.setValueWidgetProperty = function(field_name, property, value, setIndex){"use strict";
    var i, j, k, m, children, subChildren, subSubChildren, subSubSubChildren;
    
    //TODO: currently, this does not support 4 levels deep, which is required for the signature fields
    
    if(typeof setIndex === 'undefined'){
        // setIndex == -1 means that the value should be set for all elements, even when there are multiples
        setIndex = -1;
    }
    
    if(typeof property === 'string'){
        property = [property];
    }
    
    // Android has a problem with an integer being set for a value or text... cast it to a string
    if(property[0] == 'value' || property[0] == 'text'){
        value = value + "".toString();
    }
    
    if(typeof this.fieldWrappers[field_name] !== 'undefined'){
        children = this.fieldWrappers[field_name].getChildren();
        
        if(setIndex == -1){
            for(i = 0; i < children.length; i ++){
                if(typeof children[i].dbValue !== 'undefined'){
                   
                    if(property.length == 1){
                        this.fieldWrappers[field_name].children[i][property[0]] = value;
                    }
                    else if(property.length == 2){
                        this.fieldWrappers[field_name].children[i][property[0]][property[1]] = value;
                    }
                }
                
                if(children[i].getChildren().length > 0){
                    subChildren = children[i].getChildren();
                    for(j = 0; j < subChildren.length; j ++){
                        if(typeof subChildren[j].dbValue !== 'undefined'){
                            if(property.length == 1){
                                this.fieldWrappers[field_name].children[i].children[j][property[0]] = value;
                            }
                            else if(property.length == 2){
                                this.fieldWrappers[field_name].children[i].children[j][property[0]][property[1]] = value;
                            }
                        }
                        
                        if(subChildren[j].getChildren().length > 0){
                            subSubChildren = subChildren[j].getChildren();
                            for(k = 0; k < subSubChildren.length; k ++){
                                if(typeof subSubChildren[k].dbValue !== 'undefined'){
                                    if(property.length == 1){
                                        this.fieldWrappers[field_name].children[i].children[j].children[k][property[0]] = value;
                                    }
                                    else if(property.length == 2){
                                        this.fieldWrappers[field_name].children[i].children[j].children[k][property[0]][property[1]] = value;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        else{
            for(i = 0; i < children.length; i ++){
                if(typeof children[i].dbValue !== 'undefined'){
                    if(i == setIndex){
                        if(property.length == 1){
                            this.fieldWrappers[field_name].children[i][property[0]] = value;
                        }
                        else if(property.length == 2){
                            this.fieldWrappers[field_name].children[i][property[0]][property[1]] = value;
                        }
                    }
                }
                
                if(children[i].getChildren().length > 0){
                    subChildren = children[i].getChildren();
                    for(j = 0; j < subChildren.length; j ++){
                        if(typeof subChildren[j].dbValue !== 'undefined'){
                            if(j == setIndex){
                                if(property.length == 1){
                                    this.fieldWrappers[field_name].children[i].children[j][property[0]] = value;
                                }
                                else if(property.length == 2){
                                    this.fieldWrappers[field_name].children[i].children[j][property[0]][property[1]] = value;
                                }
                            }
                        }
                        
                        if(subChildren[j].getChildren().length > 0){
                            subSubChildren = subChildren[j].getChildren();
                            for(k = 0; k < subSubChildren.length; k ++){
                                if(typeof subSubChildren[k].dbValue !== 'undefined'){
                                    if(k == setIndex){
                                        if(property.length == 1){
                                            this.fieldWrappers[field_name].children[i].children[j].children[k][property[0]] = value;
                                        }
                                        else if(property.length == 2){
                                            this.fieldWrappers[field_name].children[i].children[j].children[k][property[0]][property[1]] = value;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};


FormModule.prototype.getMultipleSelector = function(fieldObject, options, dbValues){"use strict";
    var opacView, numItemsSelected, wrapperView, descriptionView, 
        i, j, color_set, color_unset, cancelButton, itemLabel, itemRow, topButtonsView, okButton, data, 
        descriptionText, selectedIndexes, screenHeight, listHeight, label, labelView, instance, nodeType;
    
    try{
        
        if(popupWin === null){
            
            instance = fieldObject.instance;
            nodeType = instance.bundle;
            
            Ti.API.debug("in multi selector");
            
            if(instance.widget.type == 'violation_select' && options.length == 0){
                alert("No violations are enforceable for a " + this.type + " at the selected account and time.");
            }
            else{
                popupWin = Ti.UI.createWindow({
                    orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
                    modal: true,
                    navBarHidden: true
                });
                
                screenHeight = Ti.Platform.displayCaps.platformHeight;
                
                if (Ti.App.isAndroid) {
                    Ti.UI.Android.hideSoftKeyboard();
                    Ti.API.debug("hide keyboard in open_mult_selector");
                }
                
                color_set = "#246";
                color_unset = "#fff";
                
                if(Ti.App.isIOS){
                    popupWin.top = 20;
                }
                
                popupWin.instance = instance;
                popupWinFieldObject = fieldObject;
                
                opacView = Ti.UI.createView({
                    left : 0,
                    right : 0,
                    top : 0,
                    bottom : 0
                });
                
                numItemsSelected = 0;
                popupWin.add(opacView);
            
                wrapperView = Ti.UI.createView({
                    backgroundColor : '#fff',
                    left : '5%',
                    right : '5%',
                    height: Ti.UI.SIZE,
                    borderRadius : 10,
                    borderWidth : 2,
                    borderColor : '#fff',
                    layout: 'vertical'
                });
                popupWin.add(wrapperView);
                
                listHeight = options.length * 32;
                
                if(listHeight > screenHeight - 65){
                
                    listHeight = screenHeight - 65;
                }
                
                popupWinListView = Titanium.UI.createTableView({
                    data : [],
                    scrollable : true,
                    height: listHeight,
                    options: options
                });
                
                for(i = 0; i < options.length; i ++){
                    if(typeof options[i] !== 'undefined' && options[i]){
                        options[i].isSelected = false;
                    
                        for(j = 0; j < dbValues.length; j ++){
                            if(dbValues[j] == options[i].dbValue){
                                options[i].isSelected = true;
                            }
                        }
                    }
                }
                
                data = [];
                selectedIndexes = [];
                
                for(i = 0; i < options.length; i ++){
                    if(typeof options[i] !== 'undefined' && options[i]){
                        // This label must be added for the Android label color to change
                        // Otherwise, setcolor is not defined for the row
                        label = Ti.UI.createLabel({
                            text: options[i].title,
                            width: '100%',
                            height: Ti.UI.FILL,
                            color: (options[i].isSelected ? '#fff' : '#000'),
                            left: 10,
                            font: {
                                fontSize: 16,
                                fontWeight: 'bold'
                            }
                        });
                        
                        itemRow = Ti.UI.createTableViewRow({
                            height : 30,
                            isSelected : options[i].isSelected,
                            dbValue : options[i].dbValue,
                            textValue: options[i].title,
                            description : options[i].description,
                            backgroundColor : (options[i].isSelected ? color_set : color_unset),
                            label: label
                        });
                        
                        itemRow.add(label);
                
                        if (options[i].isSelected) {
                            numItemsSelected++;
                            selectedIndexes.push(i);
                        }
                        data.push(itemRow);
                    }
                }
                
                popupWinListView.setData(data);
                
                popupWinListView.addEventListener('click', function(e) {
                    try{
                        if (!e.row.isSelected) {
                            popupWinListView.data[0].rows[e.index].isSelected = true;
                            e.row.label.setColor('#fff');
                            e.row.setBackgroundColor(color_set);
                            
                            numItemsSelected++;
                            selectedIndexes.push(e.index);
                        }
                        else {
                            popupWinListView.data[0].rows[e.index].isSelected = false;
                            e.row.setBackgroundColor(color_unset);
                            e.row.label.setColor('#000');
                            numItemsSelected--;
                            selectedIndexes.splice(selectedIndexes.indexOf(e.index), 1);
                        }
                        
                        if(popupWinDescriptionLabel != null){
                            if(numItemsSelected == 1){
                             
                                if(options[selectedIndexes[0]].description > ""){
                                    
                                    descriptionText = options[selectedIndexes[0]].description;
                                }
                                else{
                                    descriptionText = "";
                                }
                                
                            }
                            else if(numItemsSelected == 0){
                                descriptionText = "";
                            }
                            else{
                                descriptionText = "";
                            }
                            
                            popupWinDescriptionLabel.setText(descriptionText);
                        }
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception in form list view click: " + ex);
                    }
                });
                
                topButtonsView = Ti.UI.createView({
                    bottom: 0,
                    height : 44,
                    width : '100%',
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
                            color : '#999',
                            offset : 1.0
                        }]
                    }
                });
                
                labelView = Ti.UI.createLabel({
                   text: instance.label,
                   width: '100%',
                   textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                   color: '#333',
                   font: {
                       fontWeight: 'bold',
                       fontSize: 14
                   },
                   zIndex: 0
                });
                
                topButtonsView.add(labelView);
                
                descriptionView = Ti.UI.createView({
                    width: '100%',
                    height: Ti.UI.SIZE,
                    backgroundColor: '#eee',
                    borderColor: '#999',
                    borderWidth: 1
                });
                    
                if(instance.widget.type == 'violation_select'){
                    
                    if(numItemsSelected == 1){
                        
                        if(options[selectedIndexes[0]].description > ""){
                                
                            descriptionText = options[selectedIndexes[0]].description;
                        }
                        else{
                            descriptionText = "";
                        }
                    }
                    else if(numItemsSelected == 0){
                        descriptionText = "";
                    }
                    else{
                        descriptionText = "";
                    }
                    
                    popupWinDescriptionLabel = Titanium.UI.createLabel({
                        ellipsize : false,
                        wordWrap : true,
                        font : {
                            fontSize : 14
                        },
                        color : '#000',
                        height : Ti.UI.SIZE,
                        width: '96%',
                        text: descriptionText,
                        left: '2%',
                        right: '2%'
                    });
                    
                    descriptionView.add(popupWinDescriptionLabel);
                }
                else{
                    popupWinDescriptionLabel = null;
                }
                
                okButton = Ti.UI.createLabel({
                    text : 'Done',
                    right : 10,
                    width: 80,
                    height: 35,
                    style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                    color: '#fff',
                    borderRadius: 5,
                    font: {
                        fontSize: 14,
                        fontWeight: 'bold'
                    },
                    borderWidth: 1,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    borderColor: '#555',
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
                            color : '#999',
                            offset : 0.0
                        }, {
                            color : '#444',
                            offset : 1.0
                        }]
                    },
                    instance: instance,
                    zIndex: 1
                });
                topButtonsView.add(okButton);
                
                okButton.addEventListener('click', function(e) {
                    var i, aux_ret, valid_return, data, dbValues, textValue, textValues;
                    aux_ret = [];
                    valid_return = [];
                    dbValues = [];
                    textValue = "";
                    textValues = [];
                    
                    try{
    
                        for (i = 0; i < popupWinListView.data[0].rows.length; i++) {
                            if (popupWinListView.data[0].rows[i].isSelected) {
                                
                                textValues.push(popupWinListView.data[0].rows[i].textValue);
                                dbValues.push(popupWinListView.data[0].rows[i].dbValue);   
                            }
                        }
                        
                        if(textValues.length > 0){
                            textValue = textValues.join(', ');
                        }
                            
                        popupWinFieldObject.elements[0].dbValue = dbValues;
                        popupWinFieldObject.elements[0].textValue = textValue;
                        popupWinFieldObject.elements[0].setText(textValue);
                        
                        if(popupWinDescriptionLabel != null){                
                            popupWinFieldObject.descriptionLabel.setText(popupWinDescriptionLabel.text);
                        }
                        
                        if(popupWinFieldObject.elements[0].check_conditional_fields.length > 0){
                            FormObj[nodeType].setConditionallyRequiredLabels(e.source.instance, popupWinFieldObject.elements[0].check_conditional_fields);
                        }
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception in form ok button pressed for multi select: " + ex);
                    }
                    
                    try{
                        popupWinListView = null;
                        popupWinDescriptionLabel = null;
                        popupWinFieldObject = null;
                        
                        popupWin.close();
                        popupWin = null;
                    }
                    catch(ex1){
                        Utils.sendErrorReport("Exception closing out the multi-select from ok button: " + ex1);
                    }
                });
            
                cancelButton = Ti.UI.createLabel({
                    text : 'Cancel',
                    width: 80,
                    left : 10,
                    height: 35,
                    style: Ti.UI.iPhone.SystemButtonStyle.PLAIN,
                    color: '#fff',
                    borderRadius: 5,
                    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                    font: {
                        fontSize: 14,
                        fontWeight: 'bold'
                    },
                    borderWidth: 1,
                    borderColor: '#555',
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
                            color : '#999',
                            offset : 0.0
                        }, {
                            color : '#444',
                            offset : 1.0
                        }]
                    },
                    zIndex: 1
                });
                
                topButtonsView.add(cancelButton);
                cancelButton.addEventListener('click', function() {
                    try{
                        popupWinListView = null;
                        popupWinDescriptionLabel = null;
                        popupWinFieldObject = null;
                        popupWin.close();
                        popupWin = null;
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception in multi-view cancel button: " + ex);
                    }
                });
                
                wrapperView.add(topButtonsView);
                wrapperView.add(descriptionView);
                wrapperView.add(popupWinListView);
                
                popupWin.addEventListener('android:back', function(e){
                    popupWinListView = null;
                    popupWinDescriptionLabel = null;
                    popupWinFieldObject = null;
                    popupWin.close();
                    popupWin = null;
                });
                
                popupWin.open();
            }
        }
   }
   catch(ex){
       popupWin = null;
       Utils.sendErrorReport("Could not open multi-selector: " + instance.label + " " + ex);
   }
};

FormModule.prototype.setupIOSToolbar = function(){"use strict";
    var back, space, bundle, labelScrollView, label, actions, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    back.addEventListener('click', function() {
        try{
            ActiveFormObj.parentTabObj.close();
        }
        catch(ex){
            Utils.sendErrorReport("Exception in back click for form: " + ex);
        }
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    bundle = Omadi.data.getBundle(this.type);
    
    labelScrollView = Ti.UI.createScrollView({
        layout: 'horizontal',
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE
    });
    
    label = Titanium.UI.createLabel({
        text : (this.node.nid == 'new' ? 'New ' : 'Update ') + bundle.label,
        right: 5,
        font: {
            fontWeight: 'bold'
        },
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });
    
    labelScrollView.add(label);
    
    label.color = '#333';
    
    actions = Ti.UI.createButton({
        title : 'Actions',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    if(ActiveFormObj.parentTabObj.dispatchTab !== null || this.type == 'dispatch'){
        actions.title = 'Save';
        actions.addEventListener('click', function() {
            ActiveFormObj.parentTabObj.doDispatchSave('normal');
        });
    }
    else{
        actions.addEventListener('click', ActiveFormObj.showActionsOptions);
    }

    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : [back, space, labelScrollView, space, actions],
        top : 0,
        borderTop : false,
        borderBottom : false,
        height: Ti.UI.SIZE
    });
    
    this.wrapperView.add(toolbar);  
};

FormModule.prototype.getWindow = function(){"use strict";
    
    var i, regionWrappers, field_name, widgetView, 
        fieldWrapper, fieldView, omadi_session_details, roles, showField, instance, 
        regionName, widget, resetFields, resetRegions, doneButton, doneButtonWrapper, doContSave;
    
    try{
        this.wrapperView = Ti.UI.createView({
           bottom: 0,
           top: 0,
           right: 0,
           left: 0 
        });
        
        // Do not let the app log this user out while on the form screen
        // Allow again when the node is saved
        Ti.App.allowBackgroundLogout = false;
        
        this.scrollView = Ti.UI.createScrollView({
            contentHeight : 'auto',
            showHorizontalScrollIndicator : false,
            showVerticalScrollIndicator : true,
            scrollType : 'vertical',
            layout: 'vertical',
            height: Ti.UI.FILL,
            width: '100%'
        });
        
        if(Ti.App.isIOS){
            this.wrapperView.top = 20;
            // Setup the menu early in case something crashes, at least iOS will have a back button
            this.setupIOSToolbar();   
            this.scrollView.top = 40;
        }
        
        // Setup roles for use in displaying fields
        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;
        
        this.instances = Omadi.data.getFields(this.type);
        this.regions = Omadi.data.getRegions(this.type);
        
        // Reset the conditionally required selection that might have been set previously as this.instances could be cached
        for(field_name in this.instances){
            this.instances[field_name].isConditionallyRequired = false;
        }
        
        try{
            regionWrappers = this.getRegionWrappers();
            
            for(i = 0; i < regionWrappers.length; i ++){
                this.scrollView.add(regionWrappers[i]);
                      
                this.scrollView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
            }
        }
        catch(regionEx){
            Utils.sendErrorReport("Error setting up form regions: " + regionEx);
        }
        
        try{
            this.wrapperView.add(this.scrollView);
            this.win.add(this.wrapperView);
            
            for(field_name in this.instances){
                if(this.instances.hasOwnProperty(field_name)){
                    
                    showField = true;
                    
                    if(this.instances.hasOwnProperty(field_name)){
                        
                        instance = this.instances[field_name];
                        
                        if(this.node.form_part == -1){
                            instance.isRequired = false;
                        }
                        else if(instance.required == 1){
                            instance.isRequired = true;
                        }
                        else{
                            instance.isRequired = false;
                        }
                        
                        // Make sure the region is visible
                        if(typeof this.regionViews[instance.region] !== 'undefined'){
                            
                            if (instance.disabled == 0 && instance.can_view) {
                                
                                // Specialty section just for dispatch nodes
                                if(this.usingDispatch){
                                    if(this.node.form_part == -1){
                                        if(typeof instance.settings.dispatch === 'undefined' || typeof instance.settings.dispatch.dispatch_show === 'undefined' || instance.settings.dispatch.dispatch_show == 0){
                                            // We do not use this field for dispatch, so hide it
                                            showField = false;                        
                                        }  
                                        else if(typeof instance.settings.dispatch !== 'undefined' && 
                                                typeof instance.settings.dispatch.dispatch_show !== 'undefined' && 
                                                instance.settings.dispatch.dispatch_show == 1 &&
                                                typeof instance.settings.dispatch.dispatch_require !== 'undefined' && 
                                                instance.settings.dispatch.dispatch_require == 1){
                                                    instance.isRequired = true;
                                                    this.instances[field_name].isRequired = true;
                                                }
                                    }
                                }
                                
                                if(showField){
                                    fieldWrapper = Ti.UI.createView({
                                       width: '100%',
                                       height: Ti.UI.SIZE,
                                       instance: instance
                                    });
                                    
                                    try{
                                        fieldView = this.getFieldView(instance, fieldWrapper);
                                        
                                        if(fieldView){
                                            
                                            fieldWrapper.add(fieldView);
                                            this.fieldWrappers[instance.field_name] = fieldWrapper;
                                            
                                            if(typeof this.fieldRegionWrappers[instance.region] === 'undefined'){
                                                this.fieldRegionWrappers[instance.region] = [];
                                            }
                                            
                                            this.fieldRegionWrappers[instance.region].push(fieldWrapper);
                                            
                                            this.regionViews[instance.region].add(fieldWrapper);
                                           
                                            if(instance.widget.type == 'violation_select'){
                                                // Make sure we know which field is the violations field
                                                this.hasViolationField = instance.field_name;
                                            }
                                            else if(instance.type == 'extra_price'){
                                                if(instance.field_name != 'total_credits' && instance.field_name != 'total_amount_paid'){
                                                    // Add any field names to the extra price field list
                                                    this.hasExtraPriceField.push(instance.field_name);   
                                                }
                                            }
                                        }
                                        else{
                                            Utils.sendErrorReport("Could not create field: " + JSON.stringify(instance));
                                        }
                                    }
                                    catch(elementEx){
                                        Utils.sendErrorReport("Error adding field: " + elementEx + " " + JSON.stringify(instance));
                                    }
                                }
                            }
                        }
                    }
                }
            }  
        }
        catch(fieldEx){
            Utils.sendErrorReport("Error setting up fields: " + fieldEx);
        }
        
        try{
            // Remove empty regions
            for(regionName in this.regionViews){
                if(this.regionViews.hasOwnProperty(regionName)){
                    if(this.regionViews[regionName].getChildren().length == 0){
                        if(regionWrappers[regionName] != null){
                            this.scrollView.remove(regionWrappers[regionName]);
                            regionWrappers[regionName] = null;
                        }
                    }
                }
            }
                
            this.scrollView.addEventListener('scroll', function(e){
                ActiveFormObj.scrollPositionY = e.y;
            });
            
    
            // Setup only one interval where all forms will be saved together
            // This is best done by only continuously saving when creating the work node form
            // This is also best because the dispatch_nids are generated off of a negative ID, that can be interfered with if 
            //  a continuous node is saved between creating a new dispatch node and creating the work node
            // Any other way to start the saving may break dispatch
            if(this.type != 'dispatch'){
                doContSave = true;
                if(typeof this.node.flag_is_updated !== 'undefined'){
                    if(this.node.flag_is_updated == 3){
                        // Don't continuously save the drafts
                        doContSave = false;
                    }
                }
                
                if(this.saveInterval != null){
                    doContSave = false;
                }
                
                if(doContSave){
                    this.saveInterval = setInterval(this.continuousSave, 15000);
                }
            }
       
            doneButtonWrapper = Ti.UI.createView({
                width: '100%',
                height: 55,
                top: 10,
                backgroundGradient: Omadi.display.backgroundGradientGray
            });
            
            doneButton = Ti.UI.createLabel({
                text: 'DONE',
                backgroundGradient: Omadi.display.backgroundGradientBlue,
                font: {
                    fontSize: 18,
                    fontWeight: 'bold'
                },
                borderRadius: 10,
                width: '90%',
                height: 35,
                textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
                color: '#fff',
                bottom: 30,
                top: 10
            });
            
            if(this.usingDispatch){
                doneButton.text = 'SAVE';
                
                doneButton.addEventListener('click', function(e){
                    var saveButton = e.source;
                    saveButton.setText('SAVING...');
                    saveButton.setBackgroundGradient(Omadi.display.backgroundGradientGray);
                    
                    setTimeout(function(){
                        try{
                            saveButton.setText("SAVE");
                            saveButton.setBackgroundGradient(Omadi.display.backgroundGradientBlue);
                        }
                        catch(ex){}
                    }, 2000);
                });
                
                doneButton.addEventListener('click', function() {
                    ActiveFormObj.parentTabObj.doDispatchSave('normal');
		        });
                
            }
            else{
                doneButton.addEventListener('click', ActiveFormObj.showActionsOptions);   
            }    
            
            doneButtonWrapper.add(doneButton);
            this.scrollView.add(doneButtonWrapper);
            
            if(Omadi.utils.count(this.checkConditionalFieldNames) > 0){
                this.formToNode();
                for(i in this.checkConditionalFieldNames){
                    if(this.checkConditionalFieldNames.hasOwnProperty(i)){
                        Ti.API.debug("checking conditional for " + this.checkConditionalFieldNames[i]);
                        this.setConditionallyRequiredLabelForInstance(this.instances[this.checkConditionalFieldNames[i]]);
                    }
                }
            }
            
            if(this.hasViolationField !== false){
                this.setupViolationFields(this.hasViolationField);
            }
            
            if(this.hasExtraPriceField.length > 0){
                this.setupExtraPriceFields(this.hasExtraPriceField);
            }
            
            // Give the window a second to popup before recalculating
            this.recalculateCalculationFields();
        }
        catch(exBottom){
            Utils.sendErrorReport("Exception in creating the bottom part of the form: " + exBottom);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Could not get form window: " + ex);
    }
    
    return this.win;
};

FormModule.prototype.recalculateCalculationFields = function(){"use strict";
    var field_name, isHidden, count;
    
    count = 0;
    
    try{
        for(field_name in this.instances){
            if(this.instances.hasOwnProperty(field_name)){
                if(this.instances[field_name].type == 'calculation_field'){
                    if(typeof this.fieldWrappers[field_name] !== 'undefined'){
                        
                        if(count == 0){
                            // Reset the cache for calculation fields on recalc
                            this.fieldObjects[field_name].resetCache();
                        }
                        
                        count ++;
                        
                        isHidden = false;
                        if(typeof this.instances[field_name].settings.hidden !== 'undefined'){
                            if(this.instances[field_name].settings.hidden == 1){
                                isHidden = true;
                            }
                        }
                        
                        if(!isHidden){
                            Ti.API.debug("redrawing a calc field: " + field_name);
                            // There's no need to redraw for an instance that is not visible
                            this.fieldObjects[field_name].redraw();
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception calculating form calc fields: " + ex);
    }
};

FormModule.prototype.setupViolationFields = function(field_name){"use strict";
    var instance, valueWidget, widget, referenceWidget, datestampWidget, i;
    // NOTE: this will not work with time fields with multiple cardinality
    
    if(typeof this.instances[field_name] !== 'undefined'){
        instance = this.instances[field_name];
        
        if(typeof instance.widget !== 'undefined' && instance.widget.type == 'violation_select'){
            
            widget = instance.widget;
            
            if(typeof this.fieldWrappers[field_name] !== 'undefined'){
                
                if(typeof this.node !== 'undefined' && typeof this.node[field_name] !== 'undefined' && typeof this.node[field_name].dbValues !== 'undefined'){
                    this.origViolations = this.node[field_name].dbValues;
                }
                
                if (widget.rules_field_name != null && widget.rules_field_name != "") {
                    
                    this.addChangeCallback(widget.rules_field_name, 'changeViolationFieldOptions', [field_name]);
                    
                    if (widget.rules_violation_time_field_name != null && widget.rules_violation_time_field_name != "") {    
                        this.addChangeCallback(widget.rules_violation_time_field_name, 'changeViolationFieldOptions', [field_name]);    
                    }
                }
                
                // Initialize the field for default values
                this.changeViolationFieldOptions([field_name]);
            }
        }
    }
};

FormModule.prototype.setupExtraPriceFields = function(fieldNames){"use strict";
    var instance, valueWidget, widget, referenceWidget, datestampWidget, i, field_name, 
        categoryFieldName, referenceFieldName, modifierFieldName;
    // NOTE: this will not work with time fields with multiple cardinality
    
    for(i = 0; i < fieldNames.length; i ++){
        field_name = fieldNames[i];
        
        if(typeof this.instances[field_name] !== 'undefined'){
            instance = this.instances[field_name];
            
            if(typeof this.fieldWrappers[field_name] !== 'undefined'){
                // This field is actually showing on the form.
                Ti.API.debug("Setting up extra price fields post render...");
                if(typeof this.instances[field_name].settings.category_field_name !== 'undefined'){
                    if(this.instances[field_name].settings.category_field_name > ''){
                        
                        categoryFieldName = this.instances[field_name].settings.category_field_name;
                        
                        this.addChangeCallback(categoryFieldName, 'changeExtraPriceData', [field_name]);
                    }
                }
                
                if(typeof this.instances[field_name].settings.reference_field_name !== 'undefined'){
                    if(this.instances[field_name].settings.reference_field_name > ''){
                        
                        referenceFieldName = this.instances[field_name].settings.reference_field_name;
                        
                        this.addChangeCallback(referenceFieldName, 'changeExtraPriceData', [field_name]);
                    }
                }
                
                if(typeof this.instances[field_name].settings.modifier_field_name !== 'undefined'){
                    if(this.instances[field_name].settings.modifier_field_name > ''){
                        
                        modifierFieldName = this.instances[field_name].settings.modifier_field_name;
                        
                        this.addChangeCallback(modifierFieldName, 'changeExtraPriceData', [field_name]);
                    }
                }
            }   
        }
    }
};

FormModule.prototype.changeExtraPriceData = function(args){"use strict";
    var fieldName, fieldObj;
    
    fieldName = args[0];
    
    if(typeof this.fieldObjects[fieldName] !== 'undefined'){
        this.fieldObjects[fieldName].itemChange();
    }
};

FormModule.prototype.addChangeCallback = function(fieldName, functionName, args){"use strict";
    Ti.API.debug("In addchangecallback: " + fieldName + " " + functionName + " " + JSON.stringify(args));
    
    if(typeof this.fieldObjects[fieldName] !== 'undefined'){
        
        if(typeof this.fieldObjects[fieldName].onChangeCallbacks !== 'undefined'){
            Ti.API.debug("About to push callback");
            
            if(!Omadi.utils.isArray(this.fieldObjects[fieldName].onChangeCallbacks)){
                Ti.API.debug("Not an array");
                this.fieldObjects[fieldName].onChangeCallbacks = [];
            }
            else{
                Ti.API.debug("Is an array");
            }
            
            var length = this.fieldObjects[fieldName].onChangeCallbacks.length;
            
            Ti.API.debug("Array Length: " + length);
            
            this.fieldObjects[fieldName].onChangeCallbacks.push({
                callback: functionName,
                args: args
            });
            
            Ti.API.debug(JSON.stringify(this.fieldObjects[fieldName].onChangeCallbacks));
        }
    }
};

FormModule.prototype.changeViolationFieldOptions = function(args){"use strict";
    var db, result, options, textOptions, i, j, violation_instance, parentNid, parentNidDBValues, reference_field_name, 
        rules_parent_field_name, parentNodeType, rulesData, dataRow, node_type, tids, used_tids, all_others_row,
        rules_violation_time_field_name, violationTimestampValues, violation_timestamp, violationTerms, violation_term, 
        descriptions, violationDBValues, isViolationValid, textValues, violationTextValues, origRulesData, violation_field_name, found;
    /*global rules_field_passed_time_check*/
    Ti.API.debug("In changeviolationfield options");
    try{
        
        violation_field_name = args[0];
        
        try{
            node_type = this.type;
            
            violation_instance = this.instances[violation_field_name];
            
            options = this.getTaxonomyOptions(violation_instance, false);
            
            violationTerms = [];
            for(i = 0; i < options.length; i ++){
                violationTerms[options[i].dbValue] = options[i];
            }
            
            reference_field_name = violation_instance.widget.rules_field_name;
            rules_parent_field_name = violation_instance.widget.rules_parent_field_name;
            rules_violation_time_field_name = violation_instance.widget.rules_violation_time_field_name;
            
            parentNidDBValues = this.getDBValues(this.fieldWrappers[reference_field_name]);
         
            violationTimestampValues = this.getDBValues(this.fieldWrappers[rules_violation_time_field_name]);
            
            violation_timestamp = null;
            if(violationTimestampValues.length > 0){
                violation_timestamp = violationTimestampValues[0];
            }
            
            descriptions = [];
        }
        catch(extop){
            Utils.sendErrorReport("Exception in changeviolationfieldoptions top: " + extop);
        }
        
        if(parentNidDBValues.length > 0){
            parentNid = parentNidDBValues[0];
            if(parentNid > 0){

                try{
                    db = Omadi.utils.openMainDatabase();
                    result = db.execute('SELECT table_name FROM node WHERE nid = ' + parentNid);
                    parentNodeType = result.fieldByName('table_name');
                    result.close();
                    
                    result = db.execute('SELECT ' + rules_parent_field_name + ' FROM ' + parentNodeType + ' WHERE nid = ' + parentNid);
                    origRulesData = result.fieldByName(rules_parent_field_name);
                    result.close();
                    db.close();
                }
                catch(exDB){
                    Utils.sendErrorReport("Exception getting violation data: " + exDB);
                    try{
                        db.close();
                    }
                    catch(exdb){}
                }
                
                if(origRulesData){
                    try{
                        rulesData = JSON.parse(origRulesData);
                    }
                    catch(exJSON){
                        Utils.sendErrorReport("Exception parsing violation JSON: " + exJSON + " " + origRulesData);
                    }
                    
                    Ti.API.debug("Rules data: ");
                    Ti.API.debug(JSON.stringify(rulesData));
                    
                    if (rulesData != false && rulesData != null && rulesData != "" && rulesData.length > 0) {
                        tids = {};
                        used_tids = [];
                        all_others_row = [];
                
                        for (i in rulesData) {
                            if(rulesData.hasOwnProperty(i)){
                                dataRow = rulesData[i];
                                
                                if (!isNaN(dataRow.tid)) {
                                    if (dataRow.node_types[node_type] != null && dataRow.node_types[node_type] != "") {
                                        if (rules_field_passed_time_check(dataRow.time_rules, violation_timestamp)) {
                    
                                            tids[dataRow.tid] = true;
                                        }
                                    }
        
                                    used_tids[dataRow.tid] = true;
                                }
                                else if (dataRow.tid == 'ALL') {
                                    all_others_row.push(dataRow);
                                }
                                
                                if (typeof dataRow.description !== 'undefined' && dataRow.description != null) {
                                    descriptions[dataRow.tid] = dataRow.description;
                                }
                            }
                        }
                
                        if (all_others_row.length > 0) {
                            if (all_others_row[0].node_types[node_type] != null && all_others_row[0].node_types[node_type] != "") {
                                if (rules_field_passed_time_check(all_others_row[0].time_rules, violation_timestamp)) {
                                    for (i in violationTerms) {
                                        if(violationTerms.hasOwnProperty(i)){
                                            violation_term = violationTerms[i].dbValue;
                                            if (typeof used_tids[violation_term] === 'undefined') {
                                                tids[violation_term] = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        options = [];
                        
                        for(i in tids){
                            if(tids.hasOwnProperty(i)){
                                if(typeof descriptions[i] !== 'undefined'){
                                    if(typeof violationTerms[i] !== 'undefined'){
                                        violationTerms[i].description = descriptions[i];
                                    }
                                }
                                
                                options.push(violationTerms[i]);
                            }
                        }  

                        /**** START SETTING CURRENT FORM DEFAULT VALUES *****/
                        violationDBValues = this.getDBValues(this.fieldWrappers[violation_field_name]);
                        
                        violationTextValues = [];
                        for(i = 0; i < violationDBValues.length; i ++){
                            for(j in violationTerms){
                                if(violationTerms.hasOwnProperty(j)){
                                    
                                    if(violationTerms[j].dbValue == violationDBValues[i]){
                                        violationTextValues[i] = violationTerms[j].title;
                                    }
                                }
                            }
                        }
                        
                        // If any previous violations were already saved in this node, allow those violations to be present
                        if(typeof this.origViolations !== 'undefined' && typeof this.origViolations.length !== 'undefined'){
                            
                            for(i = 0; i < this.origViolations.length; i ++){
                                
                                found = false;
                                for(j = 0; j < options.length; j ++){
                                    if(this.origViolations[i] == options[j].dbValue){
                                        found = true;
                                        break;
                                    }
                                }
                                
                                if(!found){
                                    if(typeof violationTerms[this.origViolations[i]] !== 'undefined'){
                                        options.push(violationTerms[this.origViolations[i]]);
                                    }
                                }
                            }
                        }
                        
                        // Get rid of any violations that don't apply to this property
                        if(violationDBValues.length > 0){
                            for(i = violationDBValues.length - 1; i >= 0; i --){
                                isViolationValid = false;
                                for(j = 0; j < options.length; j ++){
                                    if(violationDBValues[i] == options[j].dbValue){
                                        isViolationValid = true;
                                        break;
                                    }
                                }
                                if(!isViolationValid){
                                    violationDBValues.splice(i, 1);
                                    violationTextValues.splice(i, 1);
                                }
                            }
                        }
                        
                        // Set the violations to possibly fewer violations
                        this.setValueWidgetProperty(violation_field_name, ['dbValue'], violationDBValues);
                        
                        // Set the textValues for the widget
                        violationTextValues = violationTextValues.join(', ');
                        this.setValueWidgetProperty(violation_field_name, ['textValue'], violationTextValues);
                        this.setValueWidgetProperty(violation_field_name, ['text'], violationTextValues);
                        
                        // Set the description for the selected violation if one exists
                        if(violationDBValues.length == 1){
                            if(typeof violationTerms[violationDBValues[0]] !== 'undefined' && typeof violationTerms[violationDBValues[0]].description !== 'undefined'){
                                if(violationTerms[violationDBValues[0]].description && violationTerms[violationDBValues[0]].description.length > 0){
                                    this.setValueWidgetProperty(violation_field_name, ['descriptionLabel', 'text'], violationTerms[violationDBValues[0]].description);
                                }
                                else{
                                    this.setValueWidgetProperty(violation_field_name, ['descriptionLabel', 'text'], "");
                                }
                            }
                        }
                        else{
                            this.setValueWidgetProperty(violation_field_name, ['descriptionLabel', 'text'], "");
                        }
                        /**** END SETTING CURRENT FORM DEFAULT VALUES *****/
                    }
                }
            }
        }
        
        try{
            Ti.API.debug("Options");
            Ti.API.debug(JSON.stringify(options));
            /*** FINALLY SET THE ALLOWABLE VIOLATION OPTIONS FOR THE WIDGET ***/
            this.setValueWidgetProperty(violation_field_name, ['options'], options);
        }
        catch(ex1){
            Utils.sendErrorReport("Exception setting violation options: " + ex1);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Could not change the violation options: " + ex);
    }
};

FormModule.prototype.showActionsOptions = function(e){"use strict";
    var bundle, btn_tt, btn_id, postDialog, windowFormPart;
    try{
        ActiveFormObj.unfocusField();
        
        bundle = Omadi.data.getBundle(ActiveFormObj.node.type);
        btn_tt = [];
        btn_id = [];
    
        btn_tt.push('Save');
        btn_id.push('normal');

        if(bundle.can_create == 1){
            btn_tt.push("Save + New");
            btn_id.push("new");
        }
        
        if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
            
            windowFormPart = ActiveFormObj.form_part;
            
            if (bundle.data.form_parts.parts.length >= windowFormPart + 2) {
    
                btn_tt.push("Save + " + bundle.data.form_parts.parts[windowFormPart + 1].label);
                btn_id.push('next');
            }
        }
        
        btn_tt.push('Save as Draft');
        btn_id.push('draft');
        
        btn_tt.push('Cancel');
        btn_id.push('cancel');
    
        postDialog = Titanium.UI.createOptionDialog();
        postDialog.options = btn_tt;
        postDialog.cancel = btn_tt.length - 1;
        postDialog.show();
    
        postDialog.addEventListener('click', function(ev) {
            try{
                if(ActiveFormObj.nodeSaved === false){
                    if(ev.index != -1){
                        if(btn_id[ev.index] == 'next'){
                            ActiveFormObj.saveForm('next_part');
                        }
                        else if(btn_id[ev.index] == 'draft'){
                            ActiveFormObj.saveForm('draft');
                        }
                        else if(btn_id[ev.index] == 'new'){
                            ActiveFormObj.saveForm('new');
                        }
                        else if(btn_id[ev.index] == 'normal'){
                            ActiveFormObj.saveForm('normal');
                        }
                    }
                }
                else{
                    alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
                    Utils.sendErrorReport("User got the alert about the screen not closing.");
                }
            }
            catch(ex){
                Utils.sendErrorReport("Exception in post dialog after save in form: " + ex);
            }
        });
    }
    catch(ex){
        Utils.sendErrorReport("Exception in form show actions options: " + ex);
    }
};

FormModule.prototype.continuousSave = function(){"use strict";
    var i;
    for(i in FormObj){
        if(FormObj.hasOwnProperty(i)){
            if(Ti.App.saveContinually){
                FormObj[i].saveForm('continuous');
            }
            else if(FormObj[i].saveInterval){
                clearInterval(FormObj[i].saveInterval);
            }       
        }
    }
};

FormModule.prototype.getFieldView = function(instance, fieldViewWrapper){"use strict";
    /*jslint nomen:true*/
    var fieldView, Module, fieldObject;
    
    fieldView = null;
    Module = null;
    
    try{
        switch(instance.type){
            case 'auto_increment': Module = require('ui/widget/AutoIncrement'); break;
            case 'calculation_field': Module = require('ui/widget/CalculationField'); break;
            case 'datestamp': Module = require('ui/widget/Datestamp'); break;
            case 'email': Module = require('ui/widget/Email'); break;
            case 'extra_price': Module = require('ui/widget/ExtraPrice'); break;
            case 'file': 
                if(typeof instance.settings._display !== 'undefined' && instance.settings._display['default'].type == 'omadi_file_video'){
                    Module = require('ui/widget/Video');
                }
                else{
                    Module = require('ui/widget/File'); 
                }
                break;
                
            case 'image': 
                if(instance.widget.type == 'omadi_image_signature'){
                    Module = require('ui/widget/Signature');    
                }
                else{
                    Module = require('ui/widget/Image'); 
                }
                break;
                
            case 'license_plate': Module = require('ui/widget/LicensePlate'); break;
            case 'link_field': Module = require('ui/widget/LinkField'); break;
            case 'list_boolean': Module = require('ui/widget/ListBoolean'); break;
            case 'list_text': Module = require('ui/widget/ListText'); break;
            case 'location': Module = require('ui/widget/Location'); break;
            case 'number_decimal': Module = require('ui/widget/NumberDecimal'); break;
            case 'number_integer': Module = require('ui/widget/NumberInteger'); break;
            case 'omadi_reference': Module = require('ui/widget/OmadiReference'); break;
            case 'omadi_time': Module = require('ui/widget/OmadiTime'); break;
            case 'phone': Module = require('ui/widget/Phone'); break;
            case 'rules_field': Module = require('ui/widget/RulesField'); break;
            case 'taxonomy_term_reference': Module = require('ui/widget/TaxonomyTermReference'); break;
            case 'text': Module = require('ui/widget/Text'); break;
            case 'text_long': Module = require('ui/widget/TextLong'); break;
            case 'user_reference': Module = require('ui/widget/UserReference'); break;
            case 'vehicle_fields': Module = require('ui/widget/VehicleFields'); break;
        }
        
        if(Module){
           this.fieldObjects[instance.field_name] = Module.getFieldObject(this, instance, fieldViewWrapper);
           fieldView = this.fieldObjects[instance.field_name].getFieldView(); 
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in creating a field on a form: " + ex);
    }
    return fieldView;
};

FormModule.prototype.getRegularLabelView = function(instance){"use strict";
    var labelText, labelView, nameParts, part, isRequired;
    
    try{
        isRequired = (instance.isRequired || instance.isConditionallyRequired);
        
        if(typeof instance.label !== 'undefined'){
            labelText = instance.label;
        }
        else{
            labelText = "";
        }
        
        if(instance.field_name.indexOf('___') !== -1){
            nameParts = instance.field_name.split('___');
            part = nameParts[1];
            if(typeof instance.settings.parts !== 'undefined'){
                labelText += " " + instance.settings.parts[part];
            }
        }
        
        labelView = Ti.UI.createLabel({
            text : ( isRequired ? '*' : '') + labelText,
            color : isRequired ? 'red' : "#4C5A88",
            font : {
                fontSize : 16,
                fontWeight : 'bold'
            },
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            left: '4%',
            touchEnabled : false,
            height : Ti.UI.SIZE,
            width: '96%',
            ellipsize: true
        });
        
        this.labelViews[instance.field_name] = labelView;
    }
    catch(ex){
        Utils.sendErrorReport("Could not get regular label: " + ex);
    }
    
    return labelView;
};

FormModule.prototype.unfocusField = function(){"use strict";
    if(typeof this.currentlyFocusedField !== 'undefined'){
        if(this.currentlyFocusedField != null && typeof this.currentlyFocusedField.blur !== 'undefined'){
            this.currentlyFocusedField.blur();
        }
    }
};

FormModule.prototype.getSpacerView = function(){"use strict";
    return Ti.UI.createView({
        height: 10,
        width: '100%' 
    });  
};

FormModule.prototype.getLabelField = function(instance){"use strict";
    
    var labelView = Titanium.UI.createLabel({
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
                color : '#f3f3f3',
                offset : 0.0
            }, {
                color : '#f9f9f9',
                offset : 0.4
            }, {
                color : '#bbb',
                offset : 1.0
            }]
        },
        borderRadius : 10,
        borderColor : '#999',
        borderWidth : 1,
        color : '#000',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        font : {
            fontSize : 16
        },
        left: '4%',
        height: 35,
        width: '92%',
        
        // Android options
        ellipsize : true,
        wordWrap : false,
        
        // custom
        fieldName : instance.field_name,
        instance : instance
    });
    
    if (!instance.can_edit) {
        labelView.setBackgroundGradient(null);
        labelView.setBackgroundColor('#ccc');
        labelView.setColor('#666');
    }
    
    labelView.addEventListener('click', function(e){
        // Unfocus any fields when clicking a non-text field
        try{
            ActiveFormObj.unfocusField();
        }
        catch(ex){} 
    });
        
    return labelView;
};

FormModule.prototype.getTextField = function(instance){"use strict";
    
    var textField, now;
    
    now = new Date();
    
    textField = Ti.UI.createTextField({
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#999',
        borderWidth: 1,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        left: '4%',
        height: 35,
        width: '92%',
        color: '#000',
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        editable: instance.can_edit,
        enabled: instance.can_edit,
        font: {
            fontSize: 16,
            fontFamily: "Arial"
        },
        returnKeyType: Ti.UI.RETURNKEY_DONE,
        
        // Android options
        keepScreenOn: true,
        ellipsize: false,
        focusable: true,
        
        // iOS options
        leftButtonPadding: 8,
        suppressReturn: true,
        
        // Custom variables
        fieldName: instance.field_name,
        instance : instance,
        lastChange: now.getTime()
    });
    
    if(Ti.App.isAndroid){
        textField.setHeight(Ti.UI.SIZE);
    }
    else{
        textField.setHeight(35);
    }

    if (!instance.can_edit) {
        
        textField.setBackgroundColor('#ccc');
        textField.setColor('#666');
        
        if (Ti.App.isAndroid) {
            textField.setSoftKeyboardOnFocus(Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS);
        }
        else{
            textField.setBorderStyle(Ti.UI.INPUT_BORDERSTYLE_NONE);
            textField.setPaddingLeft(7);
            textField.setPaddingRight(7);
        }
    }
    
    textField.addEventListener('focus', function(e){
        try{
            e.source.setBackgroundColor('#def');
            ActiveFormObj.currentlyFocusedField = e.source;
        }
        catch(ex){}
    });
    
    textField.addEventListener('blur', function(e){
        textField.setBackgroundColor('#fff');
    });
    
    return textField;
};

FormModule.prototype.affectsAnotherConditionalField = function(check_instance){"use strict";
    
    var node, search_criteria, affectedFields, field_name, i, affectsAField, instance;
    
    affectedFields = [];
    
    for(field_name in this.instances){
        if(this.instances.hasOwnProperty(field_name)){
            instance = this.instances[field_name];
            if(instance.disabled == 0){
                if(typeof instance.settings.criteria !== 'undefined' && typeof instance.settings.criteria.search_criteria !== 'undefined'){
                    search_criteria = instance.settings.criteria.search_criteria;
                    
                    for (i in search_criteria) {
                        if(search_criteria.hasOwnProperty(i)){
                            
                            if(check_instance.field_name == search_criteria[i].field_name){
                                
                                Ti.API.debug(search_criteria[i].field_name + " -> " + field_name);
                                affectedFields.push(field_name);
                            }
                        }
                    }
                }
            }
        }
    }
    
    return affectedFields;
};

FormModule.prototype.setConditionallyRequiredLabels = function(check_instance, check_fields){"use strict";
    var node, search_criteria, affectedFields, field_name, i, instance;
    
    if(typeof check_fields !== 'undefined'){
        affectedFields = check_fields;
    }
    else{
        affectedFields = this.affectsAnotherConditionalField(check_instance);
    }
    
    Ti.API.debug("Affecting fields: " + JSON.stringify(affectedFields));
    
    if(affectedFields.length > 0){
        this.formToNode();
        for(i = 0; i < affectedFields.length; i ++){
            this.setConditionallyRequiredLabelForInstance(this.instances[affectedFields[i]]);
        }
    }
};

FormModule.prototype.getTaxonomyOptions = function(instance, useNone) {"use strict";
    var db, result, vid, options;
    
    if(typeof useNone === 'undefined'){
        useNone = true;
    }
    
    db = Omadi.utils.openMainDatabase();
    
    options = [];

    result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + instance.settings.vocabulary + "'");
    if(result.isValidRow()){
        vid = result.fieldByName('vid');
        result.close();

        result = db.execute("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

        if (instance.settings.cardinality != -1 && instance.required == 0 && useNone) {
            options.push({
                title : '- None -',
                dbValue : null
            });
        }

        while (result.isValidRow()) {
            options.push({
                title : result.fieldByName('name'),
                dbValue : result.fieldByName('tid'),
                description : result.fieldByName('description')
            });
            result.next();
        }
        result.close();
    }
    
    db.close();

    return options;
};

FormModule.prototype.setConditionallyRequiredLabelForInstance = function(instance) {"use strict";
    /*jslint nomen: true*/
    
    var search_criteria, row_matches, row_idx, criteria_row, field_name, 
        search_operator, search_value, search_values, values, i, makeRequired,
        and_groups, and_group_index, and_group, and_group_match, j, or_match;
    
    try {
    
        row_matches = [];
        
        if (instance.settings.criteria != null && instance.settings.criteria.search_criteria != null) {
            
            search_criteria = instance.settings.criteria.search_criteria;
            search_criteria.sort(sort_by_weight);
            
            for (row_idx in search_criteria) {
                if(search_criteria.hasOwnProperty(row_idx)){
                    
                    criteria_row = search_criteria[row_idx];
                    
                    row_matches[row_idx] = false;
                    
                    field_name = criteria_row.field_name;
                    search_operator = criteria_row.operator;
                    search_value = criteria_row.value;
                    values = [];
                    
                    if(typeof this.node[field_name] !== 'undefined'){
                       values = this.node[field_name].dbValues;
                    }
                    
                    if(typeof this.instances[field_name] !== 'undefined' && typeof this.instances[field_name].type !== 'undefined'){
                    
                        switch(this.instances[field_name].type) {
                            case 'text':
                            case 'text_long':
                            case 'link_field':
                            case 'phone':
                            case 'license_plate':
                            case 'vehicle_fields':
                            case 'number_integer':
                            case 'number_decimal':
                            case 'email':
                            case 'datestamp':
                            case 'omadi_reference':
                            case 'omadi_time':
                            case 'calculation_field':
                            case 'location':
                            case 'extra_price':
                            
                                if (search_operator == '__filled') {
                                    for (i = 0; i < values.length; i++) {
                                        if (values[i] != null && values[i] != "") {
                                            row_matches[row_idx] = true;
                                        }
                                    }
                                }
                                else {
                                    if (values.length == 0) {
                                        row_matches[row_idx] = true;
                                    }
                                    else {
                                        for (i = 0; i < values.length; i ++){
                                            if (values[i] == null || values[i] == "") {
                                                row_matches[row_idx] = true;
                                            }
                                        }
                                    }
                                }
                                break;
                            case 'taxonomy_term_reference':
                            case 'user_reference':
        
                                search_values = [];
                                if (!Omadi.utils.isArray(search_value)) {
                                    for (i in search_value) {
                                        if (search_value.hasOwnProperty(i)) {
                                            search_values.push(i);
                                        }
                                    }
                                    search_value = search_values;
                                }
                                else {
                                    if (search_value.length == 0) {
                                        row_matches[row_idx] = true;
                                        break;
                                    }
                                }
                                
                                
                                if (search_operator == '__blank') {
                                    row_matches[row_idx] = true;
                                    if(values.length > 0){
                                        for(i = 0; i < values.length; i ++){
                                            if(values[i] > 0){
                                                row_matches[row_idx] = false;
                                            }
                                        }
                                    }
                                }
                                else if (search_operator == '__filled') {
                                    row_matches[row_idx] = false;
                                    if(values.length > 0){
                                        for(i = 0; i < values.length; i ++){
                                            if(values[i] > 0){
                                                row_matches[row_idx] = true;
                                            }
                                        }
                                    }
                                }
                                else if (search_operator == '!=') {
                                    row_matches[row_idx] = true;
                                    if (search_value.__null == '__null' && (values.length === 0 || values[0] == null)) {
                                        row_matches[row_idx] = false;
                                    }
                                    else {
                                        for (i = 0; i < search_value.length; i ++){
                                            if(values.indexOf(search_value[i]) !== -1){
                                                row_matches[row_idx] = false;
                                            }
                                        }
        
                                    }
                                }
                                else if (search_operator == '=') {
                                    
                                    if (search_value.indexOf('__null') !== -1 && (values.length === 0 || values[0] == null)) {
                                        row_matches[row_idx] = true;
                                    }
                                    else {
                                        for (i = 0; i < search_value.length; i ++){
                                            for(j = 0; j < values.length; j ++){
                                                if (values[j] == search_value[i]){
                                                    row_matches[row_idx] = true;
                                                }   
                                            }
                                        }
                                    }
                                }
        
                                break;
        
                            case 'list_boolean':
                               
                                if (search_operator == '__filled') {
                                    for (i = 0; i < values.length; i++) {
                                        if (values[i] != null && values[i] == "1") {
                                            row_matches[row_idx] = true;
                                        }
                                    }
                                }
                                else {
                                    if (values.length == 0) {
                                        row_matches[row_idx] = true;
                                    }
                                    else {
                                        for (i = 0; i < values.length; i ++){
                                            if (values[i] == null || values[i] == "0") {
                                                row_matches[row_idx] = true;
                                            }
                                        }
                                    }
                                }
                                break;
                        }
                    }
                }
            }
    
            makeRequired = true;
            
            if (row_matches.length == 1) {
                makeRequired = row_matches[0];
            }
            else {
                // Group each criteria row into groups of ors with the matching result of each or
                and_groups = [];
                and_group_index = 0;
                and_groups[and_group_index] = [];
                for (i in search_criteria) {
                    if(search_criteria.hasOwnProperty(i)){
                        criteria_row = search_criteria[i];
                        if (i == 0) {
                            and_groups[and_group_index][0] = row_matches[i];
                        }
                        else {
                            if (criteria_row.row_operator == null || criteria_row.row_operator != 'or') {
                                and_group_index++;
                                and_groups[and_group_index] = [];
                            }
                            and_groups[and_group_index][0] = row_matches[i];
                        }
                    }
                }
    
                // Get the final result, making sure each and group is TRUE
                for (i in and_groups) {
                    if(and_groups.hasOwnProperty(i)){
                        and_group = and_groups[i];
                        and_group_match = false;
                        for (j in and_group) {
                            if(and_group.hasOwnProperty(j)){
                                // Make sure at least one item in an and group is true (or the only item is true)
                                if (and_group[j]) {
                                    and_group_match = true;
                                    break;
                                }
                            }
                        }
        
                        // If one and group doesn't match the whole return value of this function is false
                        if (!and_group_match) {
                            makeRequired = false;
                            break;
                        }
                    }
                }
            }
            
            if(typeof this.labelViews[instance.field_name] !== 'undefined'){
            
                if (makeRequired) {
                    if (!this.instances[instance.field_name].isConditionallyRequired) {
                        if(this.labelViews[instance.field_name].text.substring(0,1) != '*'){
                            this.labelViews[instance.field_name].text = '*' + this.labelViews[instance.field_name].text;
                        }
                        this.labelViews[instance.field_name].color = 'red';
                    }
                    this.instances[instance.field_name].isConditionallyRequired = true;
                }
                else {
                    if (this.instances[instance.field_name].isConditionallyRequired) {
                        this.labelViews[instance.field_name].text = this.labelViews[instance.field_name].text.substring(1, this.labelViews[instance.field_name].text.length);
                        this.labelViews[instance.field_name].color = "#4C5A88";
                    }
                    this.instances[instance.field_name].isConditionallyRequired = false;
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Changing conditional value: " + ex);
    }
};

FormModule.prototype.addCheckConditionalFields = function(fieldNames){"use strict";
    var i;
    for(i = 0; i < fieldNames.length; i ++){
        this.checkConditionalFieldNames[fieldNames[i]] = fieldNames[i];
    }
};

exports.reset = function(){"use strict";
    FormObj = {};
};

exports.resetAllButDispatch = function(){"use strict";
    var i, FormTabsObj = null;
    for(i in FormObj){
        if(FormObj.hasOwnProperty(i)){
            if(i == 'dispatch'){
                FormTabsObj = FormObj[i];
            }
        }
    }
    
    FormObj = {};
    
    if(FormTabsObj !== null){
        FormObj.dispatch = FormTabsObj;
    }
};

exports.getDispatchObject = function(OmadiObj, type, nid, form_part, usingDispatch){"use strict";
    Omadi = OmadiObj;
    
    FormObj[type] = new FormModule(type, nid, form_part, usingDispatch);
    
    return FormObj[type];
};

exports.setActiveFormObject = function(formObject, parentTabObj) {"use strict";
	ActiveFormObj = formObject;
    ActiveFormObj.parentTabObj = parentTabObj;
    ActiveFormObj.getWindow();
    
    return ActiveFormObj;
};

exports.getWindow = function(OmadiObj, type, nid, form_part, usingDispatch){"use strict";
    try{
        Omadi = OmadiObj;
        
        if(!usingDispatch){
            FormObj = {};
        }
        
        FormObj[type] = new FormModule(type, nid, form_part, usingDispatch);
        ActiveFormObj = FormObj[type];
        
        return FormObj[type].getWindow();
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting window for form: " + ex);
    }
};

exports.getNode = function(type){"use strict";
    return FormObj[type].node;
};