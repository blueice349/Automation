/*jslint eqeq:true,plusplus:true*/


var FormObj, Omadi;

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
        
        var regionView;
        e.source.expanded = !e.source.expanded;
        regionView = e.source.regionView;
        
        if (e.source.expanded === true) {
            
            e.source.collapsedView.hide();
            e.source.collapsedView.setBorderWidth(0);

            regionView.show();
            //regionView.setHeight(Ti.UI.SIZE);
            
            e.source.arrow.setImage("/images/light_arrow_down.png");
            
            regionView.setHeight(Ti.UI.SIZE);
            
            // For iOS, just make sure the region is expanded as layout doesn't always happen
            if(Ti.App.isIOS){
                setTimeout(function(){
                    regionView.setHeight(Ti.UI.SIZE);
                }, 100);
            }
        }
        else {
          
            e.source.collapsedView.show();
            e.source.collapsedView.setBorderWidth(1);
            
            regionView.hide();
            
            regionView.setHeight(0);
           
            e.source.arrow.setImage("/images/light_arrow_left.png");
        }
    });
    
    regionHeaderWrapper.add(regionHeader);
    regionHeaderWrapper.add(arrow_img);
    regionHeaderWrapper.add(collapsedView);
    
    return regionHeaderWrapper;
}

function loggingOut(){"use strict";

    if(FormObj.saveInterval){
        clearInterval(FormObj.saveInterval);
    }
    
    FormObj.win.close();
}

function photoUploaded(e){"use strict";
    
    var nid, delta, fid, field_name, dbValues;
    
    nid = parseInt(e.nid, 10);
    delta = parseInt(e.delta, 10);
    field_name = e.field_name;
    fid = parseInt(e.fid, 10);
    
    // TODO: make this work
    // if(Ti.UI.currentWindow.nid == nid){
        // if(typeof fieldWrappers[field_name] !== 'undefined'){
            // //alert("Just saved delta " + delta);
            // Omadi.widgets.setValueWidgetProperty(field_name, 'dbValue', fid, delta);
            // Omadi.widgets.setValueWidgetProperty(field_name, 'fid', fid, delta);
        // }
    // }
}

function formWindowOnClose(){"use strict";
    var regionWrappers_i, regionView_i, field_i, regionWrapperChild_i;
    
    if(FormObj.saveInterval){
        clearInterval(FormObj.saveInterval);
    }
    
    Ti.App.removeEventListener('loggingOut', loggingOut);
    Ti.App.removeEventListener('photoUploaded', photoUploaded);
    // TODO: finish saveDispatch form
    //Ti.UI.currentWindow.removeEventListener("omadi:saveForm", saveDispatchForm);
}





function sort_by_weight(a, b) {"use strict";
    if (a.weight != null && a.weight != "" && b.weight != null && b.weight != "") {
        return a.weight > b.weight;
    }
    return 0;
}

function setConditionallyRequiredLabelForInstance(node, instance) {"use strict";
    
    /*jslint nomen: true*/
    /*global search_criteria_search_order, labelViews*/
   
    //var entityArr = createEntityMultiple();
    
    var search_criteria, row_matches, row_idx, criteria_row, field_name, 
        search_operator, search_value, search_values, values, i, makeRequired,
        and_groups, and_group_index, and_group, and_group_match, j, or_match;
    
    try {
    
        row_matches = [];
        
        // instance = instances[check_field_name];
         //Ti.API.debug("In Conditional for " + instance.field_name);
         //Ti.API.debug(instance);
        
        if (instance.settings.criteria != null && instance.settings.criteria.search_criteria != null) {
            //instance.settings.criteria.search_criteria.sort(search_criteria_search_order);
            
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
                    
                    //Ti.API.debug(field_name);
                    if(typeof node[field_name] !== 'undefined'){
                       values = node[field_name].dbValues;
                    }
                    
                    if(typeof this.instances[field_name] !== 'undefined' && typeof this.instances[field_name].type !== 'undefined'){
                    
                        //Ti.API.debug(JSON.stringify(values));
                        switch(instances[field_name].type) {
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
                                
                            //case 'location':
                                
                                // Ti.API.debug(instances[field_name]);
                                
                                // if (search_operator == '__filled') {
                                    // for (i = 0; i < values.length; i++) {
                                        // if (values[i] != null && values[i] != "") {
                                            // row_matches[row_idx] = true;
                                        // }
                                    // }
                                // }
                                // else {
                                    // if (values.length == 0) {
                                        // row_matches[row_idx] = true;
                                    // }
                                    // else {
                                        // for (i = 0; i < values.length; i ++){
                                            // if (values[i] == null || values[i] == "") {
                                                // row_matches[row_idx] = true;
                                            // }
                                        // }
                                    // }
                                // }
                                //break;
                                
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
            
            //Ti.API.error(JSON.stringify(row_matches));
            
            if (row_matches.length == 1) {
                makeRequired = row_matches[0];
            }
            else {
                // Group each criteria row into groups of ors with the matching result of each or
                and_groups = [];
                and_group_index = 0;
                and_groups[and_group_index] = [];
                //print_r($criteria['search_criteria']);
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
            
            if(typeof labelViews[instance.field_name] !== 'undefined'){
            
                if (makeRequired) {
                    if (!instance.isConditionallyRequired) {
                        if(labelViews[instance.field_name].text.substring(0,1) != '*'){
                            labelViews[instance.field_name].text = '*' + labelViews[instance.field_name].text;
                        }
                        labelViews[instance.field_name].color = 'red';
                        //instance.required = true;
                    }
                    instance.isConditionallyRequired = true;
                }
                else {
                    if (instance.isConditionallyRequired) {
                        labelViews[instance.field_name].text = labelViews[instance.field_name].text.substring(1, labelViews[instance.field_name].text.length);
                        labelViews[instance.field_name].color = Omadi.widgets.label.color;
                        ///instance.required = false;
                    }
                    instance.isConditionallyRequired = false;
                }
            }
        }
    }
    catch(ex){
        // TODO: make this work
        Omadi.service.sendErrorReport("Changing conditional value: " + ex);
    }
}






function FormModule(type, nid, form_part, usingDispatch) {"use strict";
    var tempNid, tempFormPart, origNid;
    
    Ti.API.debug("Instantiating new form module");
    
    this.node = {};
    this.nid = nid;
    this.type = type;
    this.form_part = form_part;
    this.usingDispatch = usingDispatch;
    this.instances = {};
    this.regions = {};
    this.hasViolationField = false;
    this.regionViews = {};
    this.fieldWrappers = {};
    this.win = null;
    this.saveInterval = null;
    this.nodeSaved = false;
    this.trySaveNodeTries = 0;
    this.continuous_nid = 0;
    
    Ti.App.saveContinually = true;
    
    try{
        if(this.nid == 'new'){
            this.initNewNode();
            this.continuous_nid = Omadi.data.getNewNodeNid();
        }
        else{
            
            this.node = Omadi.data.nodeLoad(this.nid);
            
            if(this.node.continuous_nid != null && this.node.continuous_nid != 0){
                tempNid = this.node.nid;
                this.node.nid = this.node.continuous_nid;
                this.node.continuous_nid = tempNid;
            }
            else{
                this.node.continuous_nid = Omadi.data.getNewNodeNid();
            }
            
            // Make sure the window nid is updated to the real nid, as it could have changed in nodeLoad
            this.nid = this.node.nid;
            this.continuous_nid = this.node.continuous_nid;
            
            Ti.API.debug("continuous nid: " + this.continuous_nid);
            Ti.API.debug("window nid: " + this.nid);
        }
        
        tempFormPart = parseInt(this.form_part, 10);
        if(this.form_part == tempFormPart){
            this.node.form_part = this.form_part;
        }
        else{
            // This is a copy to form, the form_part passed in is which type to copy to
            Ti.API.info("This is a custom copy to " + this.form_part);
            
            this.node = loadCustomCopyNode(this.node, this.type, this.form_part);
            
            origNid = this.node.origNid;
            this.node.custom_copy_orig_nid = this.node.origNid;
            
            this.type = this.node.type;
            this.nid = 'new';
            
            this.form_part = 0;
        }
        Ti.API.debug("initialized");
    }
    catch(ex){
        Ti.API.error("Exception initializing the FormModule");
    }
}

FormModule.prototype.trySaveNode = function(saveType){"use strict";
    var dialog, closeAfterSave;
    /*jslint nomen: true*/
    
    if(typeof saveType === 'undefined'){
        saveType = 'regular';
    }
    
    closeAfterSave = true;
    
    // Allow instant saving of drafts and continuous saves
    // Do not allow drafts or continuous saves to happen while an update is happening as it can cause problems
    if(Omadi.data.isUpdating()){
        if(saveType != 'continuous'){
            if(this.trySaveNodeTries == 0){
                // Only show waiting once and not everytime it passes through here
                Omadi.display.loading("Waiting...");   
            }
            setTimeout(function(){
                FormObj.trySaveNode(saveType);
            }, 1000);
            
            this.trySaveNodeTries ++;
            
            if(this.trySaveNodeTries > 10){
                Omadi.data.setUpdating(false);
            }
        }
    }
    else{
        this.trySaveNodeTries = 0;
        Omadi.display.doneLoading();
        
        if(saveType != 'continuous'){
            Omadi.display.loading("Saving...");
        }
        
        try{
            
            // Do not allow the web server's data in a background update
            // to overwrite the local data just being saved
            Ti.App.allowBackgroundUpdate = false;
            
            this.node = Omadi.data.nodeSave(this.node);
            
            // Now that the node is saved on the phone or a big error occurred, allow background logouts
            Ti.App.allowBackgroundLogout = true;
            
            if(this.node._saved === true){
                // Don't set the node as saved on a continuous save, as that can mess up windows closing, etc.
                if(!this.node._isContinuous){
                    this.nodeSaved = true;
                }
            }
            
            // Setup the current node and nid in the window so a duplicate won't be made for this window
            this.nid = this.node.nid;
            
            if(this.node._saved === true){
                
                if(this.usingDispatch){
                    // Let the dispatch_form.js window take care of the rest once the data is in the database
                    Ti.App.fireEvent("omadi:dispatch:savedDispatchNode",{
                        nodeNid: this.node._saveNid,
                        nodeType: this.node.type,
                        isContinuous: this.node._isContinuous,
                        isDraft: this.node._isDraft,
                        saveType: saveType
                    });
                    
                    // if in dispatch, the dispatch_form.js will take care of closing the window
                    closeAfterSave = false;
                }
                
                if(this.node._isContinuous === true){
                    // Keep the window open, do not sync
                    Omadi.display.doneLoading();
                }
                else{
                    
                    Ti.App.fireEvent("savedNode");
                    // Delete the continuous node if one exists
                    Omadi.data.deleteContinuousNodes();
                    
                    if(typeof this.node._deleteNid !== 'undefined' && this.node._deleteNid < 0){
                        Omadi.data.deleteNode(this.node._deleteNid);
                    }
                    
                    if(this.node._isDraft === true){
                        
                        if(closeAfterSave){
                            this.win.close();
                        }
                    }
                    else if(Ti.Network.online){
                        
                        if (saveType === "next_part") {    
                            
                            Ti.App.fireEvent('openForm', {
                                node_type: this.node.type,
                                nid: this.node.nid,
                                form_part: this.node.form_part + 1
                            });                       
                        }
                        else if(saveType == 'new'){
                            
                            Ti.App.fireEvent('openForm', {
                                node_type: this.node.type,
                                nid: this.node.nid,
                                form_part: this.node.type
                            });
                        }
                        
                        if(!this.usingDispatch){
                            // Send updates immediately only when not using dispatch
                            // When using dispatch, the dispatch_form.js window will initialize this
                            Ti.App.fireEvent('sendUpdates');
                        }
                        
                        if(closeAfterSave){
                            this.win.close();
                        }
                    }
                    else{
                       
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Form Validation',
                            buttonNames : ['OK'],
                            message: 'Alert management of this ' + this.node.type.toUpperCase() + ' immediately. You do not have an Internet connection right now.  Your data was saved and will be synched when you connect to the Internet.'
                        });
                        
                        dialog.show();
                        
                        dialog.addEventListener('click', function(ev) {
                            
                            if (saveType === "next_part") {
                                // Omadi.display.openFormWindow(node.type, node.nid, node.form_part + 1);
                                Ti.App.fireEvent('openForm', {
                                    node_type: this.node.type,
                                    nid: this.node.nid,
                                    form_part: this.node.form_part + 1
                                });
                            }
                            else if(saveType == 'new'){
                                //Omadi.display.openFormWindow(node.type, node.nid, node.type);
                                
                                Ti.App.fireEvent('openForm', {
                                    node_type: this.node.type,
                                    nid: this.node.nid,
                                    form_part: this.node.type
                                });
                            }
                            
                            Omadi.display.loading();
                            
                            if(closeAfterSave){
                                this.win.close();
                            }
                        });
                    }
                }
            }
            else{
                
                // Allow background updates again
                Ti.App.allowBackgroundUpdate = true;
                Omadi.service.sendErrorReport("Node failed to save on the phone");
            }
        }
        catch(ex){
            Omadi.display.doneLoading();
            Omadi.service.sendErrorReport("Exception in trysavenode: " + ex);
        }
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
        Ti.API.error("No bundle found for " + from_type);
        Omadi.service.sendErrorReport("No bundle found for " + from_type);
    }
    
    return newNode;
};

FormModule.prototype.formToNode = function(){"use strict";
    /*global fieldViews*/
   
   var field_name, fieldWrapper, instance;
   
   this.initNewNode();
   this.node.no_data = "";
   
   try{
       Ti.API.info("CONVERTING TO NODE");
       
       for(field_name in this.fieldWrappers){
           if(this.fieldWrappers.hasOwnProperty(field_name)){
               fieldWrapper = this.fieldWrappers[field_name];
               
               instance = fieldWrapper.instance;
               
               this.node[instance.field_name] = {};
               this.node[instance.field_name].dbValues = Omadi.widgets.getDBValues(fieldWrapper);
               this.node[instance.field_name].textValues = Omadi.widgets.getTextValues(fieldWrapper);
           }
       }
   }
   catch(ex){
       this.sendError("Bundling node from form: " + ex);
       alert("There was a problem bundling the submitted data. The cause of the error was sent to support.");
   }
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
                
                //this.regionWrappers[regionName] = regionWrapperView;
                this.regionViews[regionName] = regionView;
            }
        }
    }
    
    return regionWrappers;
};

FormModule.prototype.setupMenu = function(){"use strict";
    /*jslint eqeq: true */
    //var bundle = Omadi.data.getBundle(this.type);
    
    if(Ti.App.isAndroid){
        
        this.win.activity.onCreateOptionsMenu = function(e) {
            var db, result, menu_zero, btn_tt, btn_id, 
                menu_first, menu_second, menu_third, menu_save_new, 
                iconFile, windowFormPart, bundle;
                
            btn_tt = [];
            btn_id = [];
            
            Ti.API.debug("Creating options menu");
            
            try{
                bundle = Omadi.data.getBundle(FormObj.node.type);
                
                e.menu.clear();
                   
                if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
                    
                    windowFormPart = FormObj.form_part;
                    
                    if (bundle.data.form_parts.parts.length >= windowFormPart + 2) {
                        menu_zero = e.menu.add({
                            title : "Save + " + bundle.data.form_parts.parts[windowFormPart + 1].label,
                            order : 0
                        });
                        menu_zero.setIcon("/images/save_arrow_white.png");
                        menu_zero.addEventListener("click", function(ev) {
                            FormObj.saveForm('next_part');
                        });
                    }
                }
                
                btn_tt.push('Save');
                
                btn_tt.push('Save as Draft');
                btn_tt.push('Cancel');
            
                menu_first = e.menu.add({
                    title : 'Save',
                    order : 1
                });
                menu_first.setIcon("/images/save_light_blue.png");
                
                menu_save_new = e.menu.add({
                    title : 'Save + New',
                    order : 2
                });
                menu_save_new.setIcon("/images/save_plus_white.png");
            
                menu_second = e.menu.add({
                    title : 'Save as Draft',
                    order : 3
                });
                menu_second.setIcon("/images/display_drafts_white.png");
            
                //======================================
                // MENU - EVENTS
                //======================================
                menu_first.addEventListener("click", function(e) {
                    FormObj.saveForm('normal');
                });
                
                menu_save_new.addEventListener("click", function(e) {
                    Ti.API.debug("SAVING + NEW");
                    FormObj.saveForm('new');
                });
            
                menu_second.addEventListener("click", function(e) {
                    FormObj.saveForm('draft');
                });
            }
            catch(ex){
                this.sendError("Could not init the Android menu: " + ex);
            }
        };
        
    }
    else{
        //TODO: setup the iOS menu bar
    }
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
                
                //Ti.API.error(query);
                
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
                  // Ti.API.info(JSON.stringify(restrictions[i]));
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
        this.sendError("Exception in validate restriction: " + ex);
        
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
                        this.sendError("Missing field type def in validate_form_data for field_name " + instance.field_name);
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
        this.sendError("Exception in validate required: " + ex);
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
        this.sendError("Exception in validate min length: " + ex);
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
        this.sendError("Exception in validate max length: " + ex);
    }
};

FormModule.prototype.validateMinValue = function(instance){"use strict";
    var minValue, absoluteMinValue, i;
    
    try{
        absoluteMinValue = (instance.type == 'number_integer') ? -2147483648 : -99999999;
        
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
                
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
        this.sendError("Exception in validate min value: " + ex);
    }
};

FormModule.prototype.validateMaxValue = function(instance){"use strict";
    var maxValue, absoluteMaxValue, i;
    
    try{
        absoluteMaxValue = (instance.type == 'number_integer') ? 2147483647 : 99999999;
        
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
                
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
        this.sendError("Exception in validate max value: " + ex);
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
        Omadi.service.sendErrorReport("Exception in form validation: " + ex);
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
        this.sendError("Exception in validate email: " + ex);
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
        this.sendError("Exception in validate phone: " + ex);
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
        Omadi.service.sendErrorReport("Exception in validate max length: " + ex);
    }
};

FormModule.prototype.saveForm = function(saveType){"use strict";
    /*jslint nomen: true*/
    var dialog;
    
    Ti.API.info("Saving with type: " + saveType);
    
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

            //TODO: fix the below
            /*else if (pass_it === false && Ti.App.Properties.getString("timestamp_offset") > OFF_BY) {
        
                var actual_time = Math.round(new Date().getTime() / 1000);
                actual_time = parseInt(actual_time) + parseInt(Ti.App.Properties.getString("timestamp_offset"));
        
                var server_time = new Date(actual_time);
        
            }*/
            
            this.trySaveNode(saveType);
        }
        catch(ex){
            alert("Saving to mobile database: " + ex);
        }
        
        Omadi.display.doneLoading();
    }
};

FormModule.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Omadi.service.sendErrorReport(message);
};

FormModule.prototype.initNewNode = function(){"use strict";

    var uid, now;
    uid = Omadi.utils.getUid();
    now = Omadi.utils.getUTCTimestamp();
    
    this.node = {};
    this.node.created = now;
    this.node.author_uid = uid;
    this.node.form_part = 0;
    this.node.dispatch_nid = 0;
    
    this.node.nid = this.nid;
    this.node.type = this.type;
    
    this.node.changed = now;
    this.node.changed_uid = uid;
    this.node.flag_is_updated = 0;
};

FormModule.prototype.adjustFileTable = function(){"use strict";
    var fileNids, db, query, numPhotos, result, types, dialogTitle,
        dialogMessage, messageParts, secondDialog, continuousId;
    
    continuousId = this.continuous_nid;
    
    if(typeof continuousId !== 'undefined'){
        continuousId = parseInt(continuousId, 10);
        if(isNaN(continuousId)){
            continuousId = 0;
        }
    }
    else{
        continuousId = 0;
    }
    
    if(this.node.flag_is_updated == 3){
        // The original node is a draft
        if(this.nid != 0){
            // Add any newly created/removed photos to the draft so they aren't lost
            fileNids = [0];
            if(continuousId != 0){
                fileNids.push(continuousId);
            }
            
            db = Omadi.utils.openListDatabase();
            db.execute("UPDATE _files SET nid = " + this.nid + " WHERE nid IN (" + fileNids.join(",") + ")");
            db.close();
        }
        
        Omadi.data.deleteContinuousNodes();
        FormObj.win.close();
    }
    else if(Omadi.utils.getPhotoWidget() == 'choose'){
        // This is not a draft, and we don't care about the taken photos
        // Nothing to delete with the choose widget
        // Photos should be managed externally except when uploaded successfully
        
        Omadi.data.deleteContinuousNodes();
        FormObj.win.close();
    }
    else{
        
        if(this.nid > 0){
            // On an update
            fileNids = [0];
        }
        else{
            // When not a draft (above)
            // When continuous
            // When new
            
            fileNids = [0];
            if(continuousId < 0){
                // Don't do anything with the photos with a positive nid
                fileNids.push(continuousId);
            }
        }
        
        query = "SELECT COUNT(*) FROM _files WHERE nid IN (" + fileNids.join(',') + ")";
        
        numPhotos = 0;

        db = Omadi.utils.openListDatabase();
        
        result = db.execute(query);
        if(result.isValidRow()){
            numPhotos = result.field(0, Ti.Database.FIELD_TYPE_INT);
        }
        result.close();
        
        types = {};
        
        if(numPhotos > 0){
            
            result = db.execute("SELECT type FROM _files WHERE nid IN (" + fileNids.join(',') + ")");
            while(result.isValidRow()){
                
                if(typeof types[result.fieldByName('type')] === 'undefined'){
                    types[result.fieldByName('type')] = 1;
                }
                else{
                    types[result.fieldByName('type')] ++;
                }
                
                result.next();
            }
            result.close();
            
            if(Omadi.utils.count(types) > 1){
                dialogTitle = 'Delete ' + numPhotos + ' Files';
                dialogMessage = 'Do you want to delete the ';
                messageParts = [];
                
                if(typeof types.image !== 'undefined'){
                    if(types.image == 1){
                        messageParts.push('photo');
                    }
                    else{
                        messageParts.push(types.image + ' photos');
                    }
                }
                if(typeof types.video !== 'undefined'){
                    if(types.video == 1){
                        messageParts.push('video');
                    }
                    else{
                        messageParts.push(types.video + ' videos');
                    }
                }
                if(typeof types.signature !== 'undefined'){
                    if(types.signature == 1){
                        messageParts.push('signature');
                    }
                    else{
                        messageParts.push(types.signature + ' signature');
                    }
                }
                if(typeof types.file !== 'undefined'){
                    if(types.file == 1){
                        messageParts.push('1 file');
                    }
                    else{
                        messageParts.push(types.file + ' files');
                    }
                }
                
                dialogMessage += messageParts.join(' and ') + "?";
            }
            else{
                if(numPhotos == 1){
                    dialogTitle = 'Delete 1 ';
                    dialogMessage = 'Do you want to delete the ';
                    if(typeof types.image !== 'undefined'){
                        dialogTitle += 'Photo';
                        dialogMessage += 'photo you just took?';
                    }
                    else if(typeof types.video !== 'undefined'){
                        dialogTitle += 'Video';
                        dialogMessage += 'video you just attached?';
                    }
                    else if(typeof types.signature !== 'undefined'){
                        dialogTitle += 'Signature';
                        dialogMessage += 'signature?';
                    }
                    else{
                        dialogTitle += 'File';
                        dialogMessage += 'file just selected?';
                    }
                }
                else{
                    dialogTitle = 'Delete ' + numPhotos + ' ';
                    dialogMessage = 'Do you want to delete the ' + numPhotos + ' ';
                    if(typeof types.image !== 'undefined'){
                        dialogTitle += 'Photos';
                        dialogMessage += 'photos you just took?';
                    }
                    else if(typeof types.video !== 'undefined'){
                        dialogTitle += 'Videos';
                        dialogMessage += 'videos you just attached?';
                    }
                    else if(typeof types.signature !== 'undefined'){
                        dialogTitle += 'Signatures';
                        dialogMessage += 'signatures?';
                    }
                    else{
                        dialogTitle += 'Files';
                        dialogMessage += 'files just selected?';
                    }
                }
            }
        }
            
        db.close();
        
        if(numPhotos > 0){
            secondDialog = Ti.UI.createAlertDialog({
                cancel : 1,
                buttonNames : ['Delete', 'Keep', 'Cancel'],
                message : dialogMessage,
                title : dialogTitle,
                continuousId : continuousId
            });

            secondDialog.addEventListener('click', function(e) {
                var db_toDeleteImage, deleteResult, file, fileNids, 
                continuousId, thumbFile, thumbPath;
                
                continuousId = e.source.continuousId;
                
                fileNids = [0];
                if(continuousId != 0){
                    fileNids.push(continuousId);
                }
                
                if(e.index === 0 || e.index === 1){
                    
                    db_toDeleteImage = Omadi.utils.openListDatabase();
                    
                    if (e.index === 0) {
                        
                        deleteResult = db_toDeleteImage.execute("SELECT file_path, thumb_path FROM _files WHERE nid IN (" + fileNids.join(',') + ")");
                        
                        while(deleteResult.isValidRow()){
                            
                            // Delete the regular photo file
                            file = Ti.Filesystem.getFile(deleteResult.fieldByName("file_path"));
                            if(file.exists()){
                                file.deleteFile();
                            }
                            
                            // Delete the thumbnail file
                            thumbPath = deleteResult.fieldByName("thumb_path");
                            if(thumbPath){
                                thumbFile = Ti.Filesystem.getFile(thumbPath);
                                if(thumbFile.exists()){
                                    thumbFile.deleteFile();
                                }
                            }
                            
                            deleteResult.next();
                        }
                        
                        deleteResult.close();
                        
                        db_toDeleteImage.execute("DELETE FROM _files WHERE nid IN (" + fileNids.join(",") + ")");
                        
                    }
                    else if(e.index === 1){
                        // Set the nid of the photos to save to -1000000, so they won't be deleted by deletion of other photos, 
                        // and so it isn't automatically used by other new nodes
                        db_toDeleteImage.execute("UPDATE _files SET nid = -1000000 WHERE nid IN (" + fileNids.join(",") + ")");
                    }
                    
                    db_toDeleteImage.close();
                    
                    Omadi.data.deleteContinuousNodes();
                    FormObj.win.close();
                }
            });
            
            secondDialog.show();
        }
        else{
            
            Omadi.data.deleteContinuousNodes();
            FormObj.win.close();
        }
    }
};

FormModule.prototype.cancelOpt = function(e){"use strict";
    var dialog, photoNids;
    
    dialog = Ti.UI.createAlertDialog({
        cancel : 1,
        buttonNames : ['Exit', 'Cancel'],
        title : 'Really Exit Form?',
        message: 'Any unsaved changes will be lost.'
    });

    dialog.addEventListener('click', function(e) {
        var windowNid;
        
        if (e.index == 0) {
            
            windowNid = parseInt(FormObj.nid, 10);
            if(isNaN(windowNid)){
              windowNid = 0;   
            }
            
            FormObj.adjustFileTable();
        }
    });

    dialog.show(); 
};

FormModule.prototype.getWindow = function(){"use strict";
    
    var i, wrapperView, scrollView, regionWrappers, field_name, widgetView, 
        fieldWrapper, fieldView, omadi_session_details, roles, showField, instance, 
        regionName, widget, resetFields, resetRegions, doneButton, doneButtonWrapper;
    
    this.win = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee'
    });
    
    try{
        // Do not let the app log this user out while on the form screen
        // Allow again when the node is saved
        Ti.App.allowBackgroundLogout = false;
        
        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;

    //     
        // if(typeof this.node.custom_copy_orig_nid === 'undefined'){
            // this.node.custom_copy_orig_nid = 0;
        // }
    //     
        // Ti.UI.currentWindow.this.node = this.node;
        
        // Ti.API.debug("LOADED this.node: " + JSON.stringify(this.node));
    //     
        // if(win.nid < 0){
            // Ti.API.error("WIN NID: " + win.nid);
    //         
            // Ti.App.removeEventListener('switchedItUp', switchedthis.nodeIdForm);
            // Ti.App.addEventListener('switchedItUp', switchedthis.nodeIdForm);
    //         
            // Ti.UI.currentWindow.addEventListener('close', function(){
               // Ti.App.removeEventListener('switchedItUp', switchedthis.nodeIdForm); 
            // });
        // }
    //     
        Ti.App.removeEventListener('photoUploaded', photoUploaded);
        Ti.App.addEventListener('photoUploaded', photoUploaded);
        
        Ti.App.removeEventListener('loggingOut', loggingOut);
        Ti.App.addEventListener('loggingOut', loggingOut); 
    
        wrapperView = Ti.UI.createView({
           layout: 'vertical',
           bottom: 0,
           top: 0,
           right: 0,
           left: 0 
        });
        
        if(Ti.App.isIOS7){
            if(!this.usingDispatch){
                wrapperView.top = 20;   
            }
        }
        
        scrollView = Ti.UI.createScrollView({
            contentHeight : 'auto',
            showHorizontalScrollIndicator : false,
            showVerticalScrollIndicator : true,
            scrollType : 'vertical',
            layout: 'vertical',
            height: Ti.UI.FILL,
            width: '100%'
        });
        
        this.instances = Omadi.data.getFields(this.type);
        this.regions = Omadi.data.getRegions(this.type);
        
        this.setupMenu();
        this.win.addEventListener('close', formWindowOnClose);
        
        try{
            regionWrappers = this.getRegionWrappers();
            
            for(i = 0; i < regionWrappers.length; i ++){
                scrollView.add(regionWrappers[i]);
                      
                scrollView.add(Ti.UI.createView({
                    height: 10,
                    width: '100%'
                }));
            }
        }
        catch(regionEx){
            this.sendError("Error setting up form regions: " + regionEx);
        }
        
        try{
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
                                            //fieldView.wrapper = fieldWrapper;
                                            
                                            //fieldView = widget.getFieldView();
                                            
                                            fieldWrapper.add(fieldView);
                                            this.fieldWrappers[instance.field_name] = fieldWrapper;
                                            
                                            this.regionViews[instance.region].add(fieldWrapper);
                                           
                                            if(instance.widget.type == 'violation_select'){
                                                this.hasViolationField = true;
                                            }
                                        }
                                        else{
                                            this.sendError("Could not create field: " + JSON.stringify(instance));
                                        }
                                    }
                                    catch(elementEx){
                                        this.sendError("Error adding field: " + elementEx + " " + JSON.stringify(instance));
                                    }
                                }
                            }
                        }
                    }
                }
            }  
        }
        catch(fieldEx){
            this.sendError("Error setting up fields: " + fieldEx);
        }
    
        // Remove empty regions
        for(regionName in this.regionViews){
            if(this.regionViews.hasOwnProperty(regionName)){
                if(this.regionViews[regionName].getChildren().length == 0){
                    if(regionWrappers[regionName] != null){
                        scrollView.remove(regionWrappers[regionName]);
                        regionWrappers[regionName] = null;
                    }
                }
            }
        }
            
        
            
        wrapperView.add(scrollView);
        
        //scrollView.addEventListener('scroll', function(e){
            //scrollPositionY = e.y;
        //});
        
        this.win.add(wrapperView);
        
        // TODO: get this working with the omadi reference widget module
        //Ti.UI.currentWindow.fireEvent("customCopy");
        
        // TODO: uncomment and get working
        // for(field_name in instances){
            // if(instances.hasOwnProperty(field_name)){
                // widgetView = Omadi.widgets.getValueWidget(field_name);
//                 
                // if(widgetView && typeof widgetView.check_conditional_fields !== 'undefined'){
                    // // TODO: do the below
                    // //setConditionallyRequiredLabels(instances[field_name], widgetView.check_conditional_fields);
                // }
            // }
        // }
        
        this.saveInterval = setInterval(this.continuousSave, 15000);
   
        if(!this.usingDispatch){
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
            
            doneButton.addEventListener('click', FormObj.showActionsOptions);
            doneButtonWrapper.add(doneButton);
            scrollView.add(doneButtonWrapper);
        }
        
        this.win.addEventListener("android:back", this.cancelOpt);
    }
    catch(ex){
        this.sendError("Could not get form window: " + ex);
    }
    
    return this.win;
};

FormModule.prototype.showActionsOptions = function(e){"use strict";
    var bundle, btn_tt, btn_id, postDialog, windowFormPart;
    
    Omadi.widgets.unfocusField();
    
    bundle = Omadi.data.getBundle(FormObj.node.type);
    btn_tt = [];
    btn_id = [];

    btn_tt.push('Save');
    btn_id.push('normal');

    //Ti.API.info('BUNDLE: ' + JSON.stringify(bundle));
    if(bundle.can_create == 1){
        btn_tt.push("Save + New");
        btn_id.push("new");
    }
    
    if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
        
        windowFormPart = FormObj.form_part;
        
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
        
        if(FormObj.nodeSaved === false){
            if(ev.index != -1){
                if(btn_id[ev.index] == 'next'){
                    FormObj.saveForm('next_part');
                }
                else if(btn_id[ev.index] == 'draft'){
                    FormObj.saveForm('draft');
                }
                else if(btn_id[ev.index] == 'new'){
                    FormObj.saveForm('new');
                }
                else if(btn_id[ev.index] == 'normal'){
                    FormObj.saveForm('normal');
                }
            }
        }
        else{
            alert("The form data was saved correctly, but this screen didn't close for some reason. You can exit safely.");
        }
    });
};

FormModule.prototype.continuousSave = function(){"use strict";
    if(Ti.App.saveContinually){
        FormObj.saveForm('continuous');
    }
    else if(FormObj.saveInterval){
        clearInterval(FormObj.saveInterval);
    }
};

FormModule.prototype.getFieldView = function(instance, fieldViewWrapper){"use strict";
    var fieldView, Module;
    
    fieldView = null;
    Module = null;
    
    switch(instance.type){
        case 'text':
            Module = require('ui/widget/Text');
        break;
    }
    
    if(Module){
       fieldView = Module.getFieldView(Omadi, this, instance, fieldViewWrapper);
    }
    
    return fieldView;
};





exports.getWindow = function(OmadiObj, type, nid, form_part, usingDispatch){"use strict";
    Omadi = OmadiObj;
    FormObj = new FormModule(type, nid, form_part, usingDispatch);
    
    return FormObj.getWindow();
};

exports.getNode = function(){"use strict";
    return FormObj.node;  
};
