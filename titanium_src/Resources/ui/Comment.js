/*jslint eqeq:true,plusplus:true*/
var Omadi, CommentObj;

function Comment(nid){"use strict";
    //create module instance
    
    this.nid = nid;
    this.listWin = null;
    this.comments = null;
    this.isFormShowing = false;
    this.formView = null;
    this.fieldObjects = {};
    this.fieldWrappers = {};
    this.labelViews = {};
    this.node = {};
    this.regions = {};
    this.regionViews = {};
    this.fieldWrappers = {};
    this.fieldRegionWrappers = {};
    this.labelViews = {};
    this.fieldObjects = {};
}

Comment.prototype.back = function(){"use strict";
    Ti.API.debug("Pressed back button from comments...");
};

Comment.prototype.initComments = function(){"use strict";
    var db, result, comment;
    
    this.comments = [];
    try{
        if(this.nid > 0){
            db = Omadi.utils.openMainDatabase();
            
            result = db.execute("SELECT cid, created, changed, body, uid FROM comment WHERE nid = " + this.nid + " ORDER BY changed DESC");
            
            while(result.isValidRow()){
                
                comment = {};
                comment.body = result.fieldByName('body');
                comment.created = result.fieldByName('created');
                comment.changed = result.fieldByName('changed');
                comment.uid = result.fieldByName('uid');
                comment.nid = this.nid;
                comment.cid = result.fieldByName('cid');
                
                this.comments.push(comment);
                
                result.next();
            }
            
            result.close();
            db.close();  
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception loading comments: " + ex);
    }
};

Comment.prototype.getCommentCount = function(){"use strict";
    if(this.comments === null){
        this.initComments();
    }
    
    return this.comments.length;
};

Comment.prototype.showFormWindow = function(parent){"use strict";
    
    var buttonView, saveButton, cancelButton, scrollView, instance, fieldWrapper, field_name, fieldView;
    
    this.formViewParent = parent;
    
    if(!this.isFormShowing){
        this.isFormShowing = true;
        
        this.formView = Ti.UI.createView({
            backgroundColor:'#eee',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0
        });
        
        scrollView = Ti.UI.createScrollView({
            bottom: 40,
            top: 0,
            width: Ti.UI.FILL,
            layout: 'vertical' 
        });
        
        this.instances = {};
        this.instances.body = {};
        this.instances.body.isRequired = true;
        this.instances.body.type = 'text_long';
        this.instances.body.label = 'Comment';
        this.instances.body.field_name = 'body';
        this.instances.body.required = 1;
        this.instances.body.can_view = true;
        this.instances.body.can_edit = true;
        this.instances.body.settings = {
            cardinality: 1
        };
        
        try{
            for(field_name in this.instances){
                if(this.instances.hasOwnProperty(field_name)){
                    
                    if(this.instances.hasOwnProperty(field_name)){
                        
                        instance = this.instances[field_name];
                        
                        if(instance.required == 1){
                            instance.isRequired = true;
                        }
                        else{
                            instance.isRequired = false;
                        }
                         
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
                                
                                scrollView.add(fieldWrapper);
                            }
                            else{
                                Omadi.service.sendErrorReport("Could not create comment field: " + JSON.stringify(instance));
                            }
                        }
                        catch(elementEx){
                            Omadi.service.sendErrorReport("Error adding field in comment form: " + elementEx + " " + JSON.stringify(instance));
                        }
                    }
                }
            }  
        }
        catch(fieldEx){
            Omadi.service.sendErrorReport("Error setting up fields in comment form: " + fieldEx);
        }
        
        buttonView = Ti.UI.createView({
            bottom: 0,
            height: 40,
            width: Ti.UI.FILL,
            backgroundColor: '#ccc',
            layout: 'horizontal' 
        });
        
        saveButton = Ti.UI.createLabel({
            text: 'Save',
            color: '#fff',
            backgroundGradient: Omadi.display.backgroundGradientBlue,
            width: '50%',
            font: {
                fontSize: 18,
                fontWeight: 'bold'
            },
            height: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        saveButton.addEventListener('click', function(){
            Ti.API.debug("clicked save button");
            
            CommentObj.formToNode();
            
            Ti.API.debug(JSON.stringify(CommentObj.node));
            
            
            CommentObj.formViewParent.remove(CommentObj.formView);
            CommentObj.formView = null;
            
            CommentObj.isFormShowing = false;
        });
        
        cancelButton = Ti.UI.createLabel({
            text: 'Cancel',
            color: '#fff',
            backgroundGradient: Omadi.display.backgroundGradientGray,
            width: '50%',
            font: {
                fontSize: 18,
                fontWeight: 'bold'
            },
            height: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        cancelButton.addEventListener('click', function(){
            Ti.API.debug("clicked cancel button");
            CommentObj.formViewParent.remove(CommentObj.formView);
            CommentObj.formView = null;
            
            CommentObj.isFormShowing = false;
        });
        
        buttonView.add(cancelButton);
        buttonView.add(saveButton);
        
        this.formView.add(scrollView);
        this.formView.add(buttonView);  
        
        this.formViewParent.add(this.formView);
    }  
   
};

Comment.prototype.affectsAnotherConditionalField = function(check_instance){"use strict";
    
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

Comment.prototype.setConditionallyRequiredLabels = function(check_instance, check_fields){"use strict";
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

Comment.prototype.getTaxonomyOptions = function(instance, useNone) {"use strict";
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

Comment.prototype.setConditionallyRequiredLabelForInstance = function(instance) {"use strict";
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
                    
                    //Ti.API.debug(field_name);
                    if(typeof this.node[field_name] !== 'undefined'){
                       values = this.node[field_name].dbValues;
                    }
                    
                    if(typeof this.instances[field_name] !== 'undefined' && typeof this.instances[field_name].type !== 'undefined'){
                    
                        //Ti.API.debug(JSON.stringify(values));
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
        this.sendError("Changing conditional value: " + ex);
    }
};

Comment.prototype.addCheckConditionalFields = function(fieldNames){"use strict";
    var i;
    for(i = 0; i < fieldNames.length; i ++){
        this.checkConditionalFieldNames[fieldNames[i]] = fieldNames[i];
    }
};

Comment.prototype.getFieldView = function(instance, fieldViewWrapper){"use strict";
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
            Ti.API.debug("here 1");
           Ti.API.debug(JSON.stringify(instance));
           
           this.fieldObjects[instance.field_name] = Module.getFieldObject(Omadi, this, instance, fieldViewWrapper);
           
           Ti.API.debug("here 2");
           //fieldObject = Module.getFieldObject(Omadi, this, instance, fieldViewWrapper); 
           fieldView = this.fieldObjects[instance.field_name].getFieldView(); 
           
           Ti.API.debug("here 3");
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in creating a field on a comment form: " + ex);
    }
    return fieldView;
};

Comment.prototype.getRegularLabelView = function(instance){"use strict";
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
        this.sendError("Could not get regular label: " + ex);
    }
    
    return labelView;
};

Comment.prototype.sendError = function(message){"use strict";
    message += JSON.stringify(this.node);
    Ti.API.error(message);
    Omadi.service.sendErrorReport(message);
};

Comment.prototype.initNewNode = function(){"use strict";

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
        Ti.API.error("Exception initializing a new node: " + ex);
        Omadi.service.sendErrorReport("Exception initializing a new node: " + ex);
    }
};

Comment.prototype.formToNode = function(addDispatch){"use strict";
    /*global fieldViews*/
   
   var field_name, fieldWrapper, instance, origNode;
   
   //origNode = this.node;
   
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
           Omadi.service.sendErrorReport("Exception adding dispatch info to node: " + dispatchEx);
       }
   }
   catch(ex){
       this.sendError("Bundling node from form: " + ex);
       alert("There was a problem bundling the submitted data. The cause of the error was sent to support.");
   }
   
   //Ti.API.info(JSON.stringify(this.node));
};

Comment.prototype.getDBValues = function(fieldWrapper){"use strict";
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

Comment.prototype.getTextValues = function(fieldWrapper){"use strict";
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

Comment.prototype.unfocusField = function(){"use strict";
    if(typeof this.currentlyFocusedField !== 'undefined'){
        if(this.currentlyFocusedField != null && typeof this.currentlyFocusedField.blur !== 'undefined'){
            this.currentlyFocusedField.blur();
        }
    }
};

Comment.prototype.getSpacerView = function(){"use strict";
    return Ti.UI.createView({
        height: 10,
        width: '100%' 
    });  
};

Comment.prototype.getListWindow = function(){"use strict";
    
    var comment, comments, i, numCommentsLabel, headerView, scrollView, commentView, 
        commentHeaderView, commentDateLabel, bodyView, bodyLabel, newCommentButton, nameLabel;
    
    this.listWin = Ti.UI.createWindow({
        navBarHidden: true,
        backgroundColor:'#eee',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    });
    
    if(this.comments === null){
        this.initComments();
    }
    
    headerView = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: 45,
        backgroundColor: '#ccc',
        top: 0,
        left: 0
    });
    
    numCommentsLabel = Ti.UI.createLabel({
       text: this.comments.length + " comment" + (this.comments.length == 1 ? '' : 's'),
       color: '#000',
       font: {
           fontWeight: 'bold',
           fontSize: 18
       },
       height: Ti.UI.SIZE,
       width: Ti.UI.SIZE,
       textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
       top: 11,
       left: '3%'
    });
    
    newCommentButton = Ti.UI.createLabel({
        backgroundGradient: Omadi.display.backgroundGradientBlue,
        height: 35,
        top: 5,
        text: 'New Comment',
        width: 170,
        right: '3%',
        color: '#fff',
        font: {
            fontSize: 18,
            fontWeight: 'bold'
        },
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderRadius: 10
    });
    
    newCommentButton.addEventListener('click', function(){
        Ti.API.debug("Clicked new comment");
        
        try{
            CommentObj.showFormWindow(CommentObj.listWin);
        }
        catch(ex){
            Ti.API.error("Exception showing comment form: " + ex);
        }
    });
    
    headerView.add(numCommentsLabel);
    headerView.add(newCommentButton);
    
    scrollView = Ti.UI.createScrollView({
        top: 45,
        width: Ti.UI.FILL,
        bottom: 0,
        left: 0,
        layout: 'vertical'
    });
    
    if(this.comments.length > 0){
        for(i = 0; i < this.comments.length; i ++){
            
            comment = this.comments[i];
            
            commentView = Ti.UI.createView({
                layout: 'vertical',
                width: '94%',
                height: Ti.UI.SIZE,
                top: 10,
                bottom: 10,
                borderRadius: 10,
                borderColor: '#999',
                backgroundColor: '#fff'
            });
            
            commentHeaderView = Ti.UI.createView({
                backgroundColor: '#999',
                height: 25,
                width: Ti.UI.FILL 
            });
            
            commentDateLabel = Ti.UI.createLabel({
                text: Omadi.utils.formatDate(comment.changed, true),
                color: '#eee',
                font: {
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                width: Ti.UI.SIZE,
                left: '3%'
            });
            
            nameLabel = Ti.UI.createLabel({
                text: Omadi.utils.getRealname(comment.uid),
                color: '#eee',
                font: {
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                width: Ti.UI.SIZE,
                right: '3%'
            });
            
            commentHeaderView.add(commentDateLabel);
            commentHeaderView.add(nameLabel);
            
            bodyView = Ti.UI.createView({
                layout: 'vertical',
                height: Ti.UI.SIZE,
                width: '94%',
                top: 5,
                bottom: 5
            });
            
            bodyLabel = Ti.UI.createLabel({
                text: comment.body,
                height: Ti.UI.SIZE,
                width: '100%',
                textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
                font: {
                    fontSize: 14
                },
                color: '#333'
            });
            
            bodyView.add(bodyLabel);
            
            commentView.add(commentHeaderView);
            commentView.add(bodyView);
            
            scrollView.add(commentView);
        }
    }
    else{
        
        bodyLabel = Ti.UI.createLabel({
            text: 'No Comments',
            color: '#999',
            font: {
                fontWeight: 'bold',
                fontSize: 24
            },
            width: Ti.UI.FILL,
            height: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        scrollView.add(bodyLabel);
    }
    
    this.listWin.add(headerView);
    this.listWin.add(scrollView);
    
    //this.win.addEventListener("android:back", this.back);
    
    return this.listWin;
};

exports.init = function(OmadiObj, nid){"use strict";
    Omadi = OmadiObj;
    CommentObj = new Comment(nid);
};

exports.getCommentCount = function(){"use strict";
    return CommentObj.getCommentCount();
};

exports.getListWindow = function(){"use strict";
    return CommentObj.getListWindow();
};
