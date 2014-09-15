/*jslint eqeq:true,plusplus:true*/
var FormObj;

var Utils = require('lib/Utils');
var Display = require('lib/Display');
var Comment = require('objects/Comment');
var Node = require('objects/Node');
var Database = require('lib/Database');

function CommentForm(nid){"use strict";
    //create module instance
    
    this.formView = null;
    this.isFormShowing = false;
    this.isSaving = false;
    
    this.instances = {};
    this.nid = nid;
    this.fieldObjects = {};
    this.fieldWrappers = {};
    this.labelViews = {};
    this.regions = {};
    this.regionViews = {};
    this.fieldRegionWrappers = {};
    this.form_errors = [];

    this.node = Node.load(nid);
    
    if(this.node){
        this.instances = Node.getFields('comment_node_' + this.node.type);
        
        Ti.API.debug("Instances:   " + JSON.stringify(this.instances));
    }
}

function sort_by_weight(a, b) {"use strict";
    if (a.weight != null && a.weight != "" && b.weight != null && b.weight != "") {
        return a.weight > b.weight;
    }
    return 0;
}

CommentForm.prototype.cleanup = function(){"use strict";
    
};

CommentForm.prototype.affectsAnotherConditionalField = function(check_instance){"use strict";
    
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

CommentForm.prototype.setConditionallyRequiredLabels = function(check_instance, check_fields){"use strict";
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

CommentForm.prototype.getTaxonomyOptions = function(instance, useNone) {"use strict";
    var db, result, vid, options;
    
    if(typeof useNone === 'undefined'){
        useNone = true;
    }
    
    options = [];

    result = Database.query("SELECT vid FROM vocabulary WHERE machine_name = '" + instance.settings.vocabulary + "'");
    if(result.isValidRow()){
        vid = result.fieldByName('vid');
        result.close();

        result = Database.query("SELECT name, tid, description FROM term_data WHERE vid='" + vid + "' GROUP BY name ORDER BY CAST(`weight` AS INTEGER) ASC");

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
    
    Database.close();

    return options;
};

CommentForm.prototype.setConditionallyRequiredLabelForInstance = function(instance) {"use strict";
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
                                if (!Utils.isArray(search_value)) {
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

CommentForm.prototype.addCheckConditionalFields = function(fieldNames){"use strict";
    var i;
    for(i = 0; i < fieldNames.length; i ++){
        this.checkConditionalFieldNames[fieldNames[i]] = fieldNames[i];
    }
};

CommentForm.prototype.getFieldView = function(instance, fieldViewWrapper){"use strict";
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
        Utils.sendErrorReport("Exception in creating a field on a comment form: " + ex);
    }
    return fieldView;
};

CommentForm.prototype.getRegularLabelView = function(instance){"use strict";
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

CommentForm.prototype.initNewNode = function(){"use strict";

    var uid, now;
    try{
        uid = Utils.getUid();
        now = Utils.getUTCTimestampServerCorrected();
        
        this.node = {};
        this.node.created = now;
        this.node.uid = uid;
       
        // Set the original values passed in
        this.node.nid = this.nid;
        this.node.sync_status = this.sync_status;
        
        this.node.changed = now;
    }
    catch(ex){
        Utils.sendErrorReport("Exception initializing a new comment: " + ex);
    }
};

CommentForm.prototype.save = function(){"use strict";
    var db, sql, saved, cid, Comment;
    
    saved = false;
    
    this.formToNode();
    this.node.cid = this.getNewCommentCid();
    
    Ti.API.debug(JSON.stringify(this.node));
    
    saved = Comment.save(this.node);
    
    return saved;
};

CommentForm.prototype.formToNode = function(){"use strict";
   /*global fieldViews*/
   var field_name, fieldWrapper, instance, origNode;
   
   this.initNewNode();
   
   try{
       Ti.API.info("CONVERTING TO COMMENT");
       
       for(field_name in this.fieldWrappers){
           if(this.fieldWrappers.hasOwnProperty(field_name)){
               fieldWrapper = this.fieldWrappers[field_name];
               
               instance = fieldWrapper.instance;
               
               this.node[instance.field_name] = {};
               this.node[instance.field_name].dbValues = this.getDBValues(fieldWrapper);
               this.node[instance.field_name].textValues = this.getTextValues(fieldWrapper);
           }
       }
   }
   catch(ex){
       Utils.sendErrorReport("Bundling comment from form: " + ex);
       alert("There was a problem bundling the submitted comment. The cause of the error was sent to support.");
   }
};

CommentForm.prototype.getDBValues = function(fieldWrapper){"use strict";
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
                    dbValues.push(Utils.trimWhiteSpace(children[i].dbValue));
                }
            }
            else if(children[i].getChildren().length > 0){
                subChildren = children[i].getChildren();
                for(j = 0; j < subChildren.length; j ++){
                    if(typeof subChildren[j].dbValue !== 'undefined'){
                        
                        if(typeof subChildren[j].dbValue === 'object' && subChildren[j].dbValue instanceof Array){
                            dbValues = subChildren[j].dbValue;
                        }
                        else{
                            dbValues.push(Utils.trimWhiteSpace(subChildren[j].dbValue));
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
                                    dbValues.push(Utils.trimWhiteSpace(subSubChildren[k].dbValue));
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
                                            dbValues.push(Utils.trimWhiteSpace(subSubSubChildren[m].dbValue));
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

CommentForm.prototype.getTextValues = function(fieldWrapper){"use strict";
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

CommentForm.prototype.unfocusField = function(){"use strict";
    if(typeof this.currentlyFocusedField !== 'undefined'){
        if(this.currentlyFocusedField != null && typeof this.currentlyFocusedField.blur !== 'undefined'){
            this.currentlyFocusedField.blur();
        }
    }
};

CommentForm.prototype.getSpacerView = function(){"use strict";
    return Ti.UI.createView({
        height: 10,
        width: '100%' 
    });  
};

CommentForm.prototype.getNewCommentCid = function() {"use strict";
	return Comment.getNewCommentCid();
};

CommentForm.prototype.getTextField = function(instance){"use strict";
    
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
            FormObj.currentlyFocusedField = e.source;
        }
        catch(ex){}
    });
    
    textField.addEventListener('blur', function(e){
        try{
            e.source.setBackgroundColor('#fff');
        }
        catch(ex){
            try{
                Utils.sendErrorReport("exception in text field in form blur: " + ex);
            }catch(ex1){}
        }
    });
    
    return textField;
};

CommentForm.prototype.getLabelField = function(instance){"use strict";
    
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
            FormObj.unfocusField();
        }
        catch(ex){} 
    });
        
    return labelView;
};

CommentForm.prototype.validateRequired = function(instance){"use strict";
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
                    
                        if(!Utils.isEmpty(dbValues[i])){
                            isEmpty = false;
                        }
                        break;
                    
                    case 'omadi_reference':
                    case 'taxonomy_term_reference':
                    case 'user_reference':
                    case 'file':
                    case 'auto_increment':
                    case 'list_boolean': 
                        if(!Utils.isEmpty(dbValues[i]) && dbValues[i] != 0){
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

CommentForm.prototype.validate = function(){"use strict";
    
    var field_name, instance, values, isEmpty, i;
    
    this.form_errors = [];
    
    try{
        
        Ti.API.debug("In validate function.");
        
        this.formToNode();
        
        Ti.API.debug(JSON.stringify(this.instances));
        
        for(field_name in this.instances){
            if(this.instances.hasOwnProperty(field_name)){
                
                instance = this.instances[field_name];
                
                Ti.API.debug("Validating : " + JSON.stringify(instance));
                
                if(instance.disabled == 0){                
                    if(typeof this.node[field_name] !== 'undefined'){
                        
                        Ti.API.debug("has node value");
                        
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
    catch(ex){
        Utils.sendErrorReport("Exception in comment form validation: " + ex);
    }
};

CommentForm.prototype.validateEmail = function(instance){"use strict";
    
    var i, regExp;
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
            
                for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                    if (!Utils.isEmpty(this.node[instance.field_name].dbValues[i]) && !this.node[instance.field_name].dbValues[i].match(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i)) {
                        this.form_errors.push(instance.label + " is not a valid email address.");
                    }  
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate email: " + ex);
    }
};

CommentForm.prototype.validatePhone = function(instance){"use strict";
    var i, regExp;
    
    try{
        if (typeof this.node[instance.field_name] !== 'undefined' &&
            typeof this.node[instance.field_name].dbValues !== 'undefined' &&
            this.node[instance.field_name].dbValues !== null &&
            this.node[instance.field_name].dbValues.length > 0) {
            
                for(i = 0; i < this.node[instance.field_name].dbValues.length; i ++){
                    if (!Utils.isEmpty(this.node[instance.field_name].dbValues[i]) && !this.node[instance.field_name].dbValues[i].match(/\D*(\d*)\D*[2-9][0-8]\d\D*[2-9]\d{2}\D*\d{4}\D*\d*\D*/g)) {
                        this.form_errors.push(instance.label + " is not a valid North American phone number. 10 digits are required.");
                    }  
                }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in validate phone: " + ex);
    }
};

CommentForm.prototype.validateMinLength = function(instance){"use strict";
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

CommentForm.prototype.validateMaxLength = function(instance){"use strict";
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

CommentForm.prototype.validateMinValue = function(instance){"use strict";
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

CommentForm.prototype.validateMaxValue = function(instance){"use strict";
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

CommentForm.prototype.setupIOSToolbar = function(){"use strict";
    var back, space, label, save, toolbar;
    
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    back.addEventListener('click', function() {
        try{
            FormObj.close();
        }
        catch(ex){
            Utils.sendErrorReport("Exception in back click for comment form: " + ex);
        }
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    label = Titanium.UI.createLabel({
        text : 'New Comment',
        right: 5,
        font: {
            fontWeight: 'bold'
        },
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });
    
    label.color = '#333';
    
    save = Ti.UI.createButton({
        title : 'Save Comment',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    
    save.addEventListener('click', function(){
        FormObj.saveComment();
    });
    
    // create and add toolbar
    toolbar = Ti.UI.iOS.createToolbar({
        items : [back, space, label, space, save],
        top : 0,
        borderTop : false,
        borderBottom : false,
        height: Ti.UI.SIZE
    });
    
    this.formView.add(toolbar);  
};

CommentForm.prototype.saveComment = function(){"use strict";

    Ti.API.debug("saving comment");
    var saved = false, dialog;
    
    try{
        if(!this.isFormSaving){
            this.validate();
            
            if(this.form_errors && this.form_errors.length > 0){
                dialog = Titanium.UI.createAlertDialog({
                    title : 'Form Validation',
                    buttonNames : ['OK'],
                    message: FormObj.form_errors.join("\n")
                });
                
                dialog.show();
            }
            else{
                saved = this.save();
                
                if(saved){
                    
                    // Let the parent window know that the comments have changed, and that the list should be updated
                    this.formViewParent.fireEvent('updateView');
                    
                    Ti.App.fireEvent('incrementCommentTab');
                    
                    // Remove this view from the parent and set this view to null to deallocate memory
                    this.formViewParent.remove(this.formView);
                    this.formView = null;
                    this.isFormShowing = false;
                    this.unfocusField();
                    
                    Ti.App.fireEvent('sendComments');
                }
                else{
                    alert("Could not save the comment.");
                }
            }
            
            this.isFormSaving = false;
        }
    }
    catch(ex){
        alert("An error occurred while saving the comment. Please try again.");
        this.isFormSaving = false;
        Utils.sendErrorReport("Exception saving comment: " + ex);
    }
};

CommentForm.prototype.close = function(){"use strict";
    Ti.API.debug("closing comment view");
    
    this.formViewParent.remove(this.formView);
    this.formView = null;
    
    this.isFormShowing = false;
};

CommentForm.prototype.showFormWindow = function(parent){"use strict";
    var buttonView, saveButton, cancelButton, scrollView, instance, fieldWrapper, field_name, 
        fieldView, allowedValues, key;
    
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
        
        if(Ti.App.isIOS){
            this.setupIOSToolbar();
            scrollView.top = 40;
        }
        
        scrollView.add(this.getSpacerView());
        
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
                            switch(instance.field_name){
                                case 'comment_company_name':
                                case 'comment_posted_by_name':
                                    // These fields are hidden on the comment form
                                    continue;
                                    
                                case 'comment_update_type':
                                    // Only allow 3 options for the form, but allow the view to display any option
                                    if(typeof instance.settings.allowed_values !== 'undefined'){
                                        allowedValues = {};
                                        
                                        for(key in instance.settings.allowed_values){
                                            if(instance.settings.allowed_values.hasOwnProperty(key)){
                                                if(key == '36' || key == '45' || key == '87'){
                                                    allowedValues[key] = instance.settings.allowed_values[key];
                                                }
                                            }
                                        }
                                        
                                        instance.settings.allowed_values = allowedValues;
                                        this.instances[instance.field_name] = instance;
                                    }
                                    break;
                            }
                            
                            fieldView = this.getFieldView(instance, fieldWrapper);
                            
                            if(fieldView){
                                
                                fieldWrapper.add(fieldView);
                                this.fieldWrappers[instance.field_name] = fieldWrapper;
                                
                                scrollView.add(fieldWrapper);
                            }
                            else{
                                Utils.sendErrorReport("Could not create comment field: " + JSON.stringify(instance));
                            }
                        }
                        catch(elementEx){
                            Utils.sendErrorReport("Error adding field in comment form: " + elementEx + " " + JSON.stringify(instance));
                        }
                    }
                }
            }  
        }
        catch(fieldEx){
            Utils.sendErrorReport("Error setting up fields in comment form: " + fieldEx);
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
            backgroundGradient: Display.backgroundGradientBlue,
            width: '50%',
            font: {
                fontSize: 18,
                fontWeight: 'bold'
            },
            height: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        saveButton.addEventListener('click', function(){
            FormObj.saveComment();
        });
        
        cancelButton = Ti.UI.createLabel({
            text: 'Cancel',
            color: '#fff',
            backgroundGradient: Display.backgroundGradientGray,
            width: '50%',
            font: {
                fontSize: 18,
                fontWeight: 'bold'
            },
            height: Ti.UI.FILL,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        
        cancelButton.addEventListener('click', function(){
            FormObj.close();
        });
        
        buttonView.add(cancelButton);
        buttonView.add(saveButton);
        
        this.formView.add(scrollView);
        this.formView.add(buttonView);  
        
        this.formViewParent.add(this.formView);
        
        // After the for is loaded, focus the comment body so the keyboard comes up automatically
        if(typeof this.fieldObjects.comment_body !== 'undefined'){
            if(typeof this.fieldObjects.comment_body.elements !== 'undefined'){
                if(typeof this.fieldObjects.comment_body.elements[0] !== 'undefined'){
                    Ti.API.info("found comment body element");
                    if(Ti.App.isAndroid){
                        this.fieldObjects.comment_body.elements[0].softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
                    }
                    this.fieldObjects.comment_body.elements[0].focus();
                }
            }
        }
    }
};

CommentForm.showFormWindow = function(OmadiObj, nid, parent){"use strict";
    // Currently only creating new comments
    // TODO: pass in a null or new cid to create or edit
    FormObj = new CommentForm(nid);
    
    FormObj.showFormWindow(parent);
};

module.exports = CommentForm;

