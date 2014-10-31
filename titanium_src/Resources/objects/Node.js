/*jslint node:true */
'use strict';

var Database = require('lib/Database');
var Utils = require('lib/Utils');
var Location = require('lib/Location');
var Display = require('lib/Display');

var Node = function() {
	
};

Node.cache = {};
Node.cache.fields = {};
Node.cache.fakeFields = {};
Node.cache.regions = {};

Node.getNodeType = function(nid){
    var type, result;
    type = null;
    
    Ti.API.debug("NID: " + nid);
    
    try{
        result = Database.query("SELECT table_name FROM node WHERE nid = " + nid);
        
        if(result.isValidRow()){
            Ti.API.debug("is valid row");
            type = result.fieldByName('table_name');
        }
        
        result.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting node type: " + ex);
    }
    
    Database.close();
    
    return type;
};

Node.load = function(nid) {
    var node, result, subResult, field_name, dbValue, tempDBValues, textValue, 
        subValue, i, real_field_name, part, field_parts, instances, 
        origDBValue, jsonValue, allowedValues, newNid,
        intNid;

    node = null;
    
    try{
    
        if(typeof nid !== 'undefined'){
            intNid = parseInt(nid, 10);
        
            if (!isNaN(intNid) && intNid != 0) {
                
                node = {
                    form_part: 0,
                    nid : nid
                };
                
                try{
    
                    result = Database.query('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash, continuous_nid, dispatch_nid, copied_from_nid, latitude, longitude, accuracy FROM node WHERE  nid = ' + nid);
            
                    if (result.isValidRow()) {
            
                        node.nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
                        node.title = result.fieldByName('title', Ti.Database.FIELD_TYPE_STRING);
                        node.created = result.fieldByName('created', Ti.Database.FIELD_TYPE_INT);
                        node.changed = result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT);
                        node.author_uid = result.fieldByName('author_uid', Ti.Database.FIELD_TYPE_INT);
                        node.flag_is_updated = result.fieldByName('flag_is_updated', Ti.Database.FIELD_TYPE_INT);
                        node.table_name = node.type = result.fieldByName('table_name', Ti.Database.FIELD_TYPE_STRING);
                        node.form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
                        node.changed_uid = result.fieldByName('changed_uid', Ti.Database.FIELD_TYPE_INT);
                        node.no_data_fields = result.fieldByName('no_data_fields', Ti.Database.FIELD_TYPE_STRING);
                        node.perm_edit = result.fieldByName('perm_edit', Ti.Database.FIELD_TYPE_INT);
                        node.perm_delete = result.fieldByName('perm_delete', Ti.Database.FIELD_TYPE_INT);
                        node.viewed = result.fieldByName('viewed', Ti.Database.FIELD_TYPE_STRING);
                        node.sync_hash = result.fieldByName('sync_hash', Ti.Database.FIELD_TYPE_STRING);
                        node.continuous_nid = result.fieldByName('continuous_nid', Ti.Database.FIELD_TYPE_STRING);
                        node.dispatch_nid = result.fieldByName('dispatch_nid', Ti.Database.FIELD_TYPE_INT);
                        node.custom_copy_orig_nid = result.fieldByName('copied_from_nid', Ti.Database.FIELD_TYPE_INT);
                        
                        node.last_location = {
                            latitude : result.fieldByName('latitude'),
                            longitude : result.fieldByName('longitude'),
                            accuracy : result.fieldByName('accuracy')
                        };
                    }
                    else{
                        // If the nid doesn't exist, maybe it was deleted and a positive nid has replaced it
                        if(typeof Ti.App.deletedNegatives[nid] !== 'undefined' && Ti.App.deletedNegatives[nid] !== null && Ti.App.deletedNegatives[nid] != ""){
                            
                            newNid = Ti.App.deletedNegatives[nid];
    
                            Ti.API.debug("CAN RECOVER " + nid +  " > " + newNid);
                  
                            Ti.App.deletedNegatives[nid] = null;
                            
                            result = Database.query('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash, continuous_nid, dispatch_nid, copied_from_nid, latitude, longitude, accuracy FROM node WHERE  nid = ' + newNid);
            
                            if (result.isValidRow()) {
                    
                                node.nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
                                node.title = result.fieldByName('title', Ti.Database.FIELD_TYPE_STRING);
                                node.created = result.fieldByName('created', Ti.Database.FIELD_TYPE_INT);
                                node.changed = result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT);
                                node.author_uid = result.fieldByName('author_uid', Ti.Database.FIELD_TYPE_INT);
                                node.flag_is_updated = result.fieldByName('flag_is_updated', Ti.Database.FIELD_TYPE_INT);
                                node.table_name = node.type = result.fieldByName('table_name', Ti.Database.FIELD_TYPE_STRING);
                                node.form_part = result.fieldByName('form_part', Ti.Database.FIELD_TYPE_INT);
                                node.changed_uid = result.fieldByName('changed_uid', Ti.Database.FIELD_TYPE_INT);
                                node.no_data_fields = result.fieldByName('no_data_fields', Ti.Database.FIELD_TYPE_STRING);
                                node.perm_edit = result.fieldByName('perm_edit', Ti.Database.FIELD_TYPE_INT);
                                node.perm_delete = result.fieldByName('perm_delete', Ti.Database.FIELD_TYPE_INT);
                                node.viewed = result.fieldByName('viewed', Ti.Database.FIELD_TYPE_STRING);
                                node.sync_hash = result.fieldByName('sync_hash', Ti.Database.FIELD_TYPE_STRING);
                                node.continuous_nid = result.fieldByName('continuous_nid', Ti.Database.FIELD_TYPE_STRING);
                                node.dispatch_nid = result.fieldByName('dispatch_nid', Ti.Database.FIELD_TYPE_INT);
                                node.custom_copy_orig_nid = result.fieldByName('copied_from_nid', Ti.Database.FIELD_TYPE_INT);
                                
                                node.last_location = {
                                    latitude : result.fieldByName('latitude'),
                                    longitude : result.fieldByName('longitude'),
                                    accuracy : result.fieldByName('accuracy')
                                };
                            }
                            else{
                                 Utils.sendErrorReport("unrecoverable node load 1 for nid " + nid);
                                 node = null;
                            }
                        }
                        else{
                            
                            if(nid <= 0){
                                Utils.sendErrorReport("unrecoverable node load 2 for nid " + nid);
                            }
                            
                            node = null;
                        }
                    }
                    
                    result.close();
    
                }
                catch(ex){
                    Utils.sendErrorReport("Exception with node table query: " + ex);
                }
        
                if (node != null && typeof node.nid !== 'undefined') {
                    
                    instances = Node.getFields(node.table_name);
        
                    result = Database.query("SELECT * FROM " + node.table_name + " WHERE nid = " + node.nid);
                    if (result.isValidRow()) {
                        for (field_name in instances) {
                            if (instances.hasOwnProperty(field_name)) {
        
                                origDBValue = result.fieldByName(field_name, Ti.Database.FIELD_TYPE_STRING);
        
                                node[field_name] = {};
                                node[field_name].textValues = [];
                                node[field_name].dbValues = [];
        
                                /**
                                 * This takes care of all multi-part fields:
                                 * location
                                 * license_plate
                                 * vehicle_fields
                                 */
                                // Special case for datestamp fields with an end date, don't do the same thing as a regular field with parts
                                // They are just like a regular field
                                if (field_name.indexOf("___") !== -1 && field_name.indexOf("___end") === -1) {
                                    dbValue = origDBValue;
                                    
                                    field_parts = field_name.split("___");
                                    real_field_name = field_parts[0];
                                    part = field_parts[1];
        
                                    if ( typeof node[real_field_name] === 'undefined') {
                                        node[real_field_name] = {};
                                        node[real_field_name].label = instances[field_name].label;
                                        node[real_field_name].parts = {};
                                        node[real_field_name].dbValues = [];
                                    }
                                    
                                    if (dbValue === null) {
                                        dbValue = "";
                                    }
                                    else if(dbValue === false){
                                        dbValue = "";
                                    }
        
                                    node[real_field_name].parts[part] = {
                                        label : instances[field_name].settings.parts[part],
                                        textValue : dbValue
                                    };
                                    
                                    node[real_field_name].dbValues.push(dbValue);
                                    node[field_name].dbValues.push(dbValue);
                                }
                                else {
                                    jsonValue = Utils.getParsedJSON(origDBValue);
                                    tempDBValues = [];
        
                                    if (Utils.isArray(jsonValue)) {
                                        tempDBValues = jsonValue;
                                    }
                                    else {
                                        tempDBValues.push(origDBValue);
                                    }
        
                                    for ( i = 0; i < tempDBValues.length; i++) {
        
                                        dbValue = tempDBValues[i];
        
                                        switch(instances[field_name].type) {
                                            case 'image':
                                            case 'omadi_reference':
                                            case 'user_reference':
                                            case 'taxonomy_term_reference':
                                            case 'file':
                                            case 'datestamp':
                                            case 'omadi_time':
                                                
                                                if (!Utils.isEmpty(dbValue)) {
                                                    dbValue = parseInt(dbValue, 10);
                                                    if(isNaN(dbValue)){
                                                        node[field_name].dbValues.push(null);
                                                    }
                                                    else{
                                                        node[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
        
                                            case 'number_integer':
                                            case 'list_boolean':
                                            case 'auto_increment':
                                            case 'extra_price':
                                            
                                                if (!Utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                                    dbValue = parseInt(dbValue, 10);
                                                    if(isNaN(dbValue)){
                                                        node[field_name].dbValues.push(null);   
                                                    }
                                                    else{
                                                        node[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
        
                                            case 'number_decimal':
        
                                                if (!Utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                                    dbValue = parseFloat(dbValue);
                                                    if(isNaN(dbValue)){
                                                        node[field_name].dbValues.push(null);
                                                    }
                                                    else{
                                                        node[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
        
                                            case 'calculation_field':
        
                                                node[field_name].origValues = [];
                                                if (!Utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
													dbValue = parseFloat(dbValue);
                                                    if(isNaN(dbValue)){
                                                        node[field_name].dbValues.push(null);
                                                    }
                                                    else{
                                                        node[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
                                                
                                            case 'rules_field':
                                                node[field_name].dbValues.push(Utils.getParsedJSON(origDBValue));
                                                break;
        
                                            default:
                                                node[field_name].dbValues.push(dbValue);
                                                break;
                                        }
                                    }
                                }
        
                                // Make sure textValues is set to something for each value
                                for ( i = 0; i < node[field_name].dbValues.length; i += 1) {
                                    node[field_name].textValues[i] = "";
                                }
                                
                                switch(instances[field_name].type) {
                                    case 'text':
                                    case 'text_long':
                                    case 'phone':
                                    case 'email':
                                    case 'link_field':
                                    case 'location':
                                    case 'license_plate':
                                    case 'vehicle_fields':
                                    case 'number_integer':
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            if (node[field_name].dbValues[i] === null) {
                                                node[field_name].textValues[i] = "";
                                            }
                                            else {
                                                node[field_name].textValues[i] = node[field_name].dbValues[i];
                                            }
                                        }
                                        break;
                                        
                                    case 'nfc_field':
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            if (node[field_name].dbValues[i] === null) {
                                                node[field_name].textValues[i] = 'Not Linked';
                                            }
                                            else {
                                                node[field_name].textValues[i] = 'Linked';
                                            }
                                        }
                                        break;
        
                                    case 'number_decimal':
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            if (node[field_name].dbValues[i] === null) {
                                                node[field_name].textValues[i] = "";
                                            }
                                            else {
                                                node[field_name].textValues[i] = node[field_name].dbValues[i].toFixed(2);
                                            }
                                        }
                                        break;
        
                                    case 'auto_increment':
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
        
                                            if (instances[field_name].settings.prefix > '') {
                                                node[field_name].textValues[i] = instances[field_name].settings.prefix + node[field_name].dbValues[i];
                                            }
                                            else {
                                                node[field_name].textValues[i] = node[field_name].dbValues[i] + ''.toString();
                                            }
                                        }
                                        break;
        
                                    case 'list_boolean':
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            if (node[field_name].dbValues[i] === null) {
                                                node[field_name].textValues[i] = '';
                                            }
                                            else if (node[field_name].dbValues[i] == 1) {
                                                node[field_name].textValues[i] = 'Yes';
                                            }
                                            else {
                                                node[field_name].textValues[i] = 'No';
                                            }
                                        }
                                        break;
        
                                    case 'user_reference':
        
                                        subResult = Database.query('SELECT uid, realname FROM user WHERE uid IN(' + node[field_name].dbValues.join(',') + ')');
                                        while (subResult.isValidRow()) {
                                            textValue = subResult.fieldByName("realname");
                                            subValue = subResult.fieldByName("uid");
        
                                            for ( i = 0; i < node[field_name].dbValues.length; i += 1) {
                                                if (node[field_name].dbValues[i] == subValue) {
                                                    node[field_name].textValues[i] = textValue;
                                                    break;
                                                }
                                            }
        
                                            subResult.next();
                                        }
                                        subResult.close();
                                        break;
        
                                    case 'taxonomy_term_reference':
        
                                        subResult = Database.query('SELECT name, tid FROM term_data WHERE tid IN(' + node[field_name].dbValues.join(',') + ')');
                                        while (subResult.isValidRow()) {
                                            textValue = subResult.fieldByName("name");
                                            subValue = subResult.fieldByName("tid");
        
                                            for ( i = 0; i < node[field_name].dbValues.length; i += 1) {
                                                if (node[field_name].dbValues[i] == subValue) {
                                                    node[field_name].textValues[i] = textValue;
                                                    break;
                                                }
                                            }
        
                                            subResult.next();
                                        }
                                        subResult.close();
        
                                        break;
        
                                    case 'list_text':
        
                                        if(typeof instances[field_name].settings.allowed_values !== 'undefined'){
                                            allowedValues = instances[field_name].settings.allowed_values; 
                                            for ( i = 0; i < node[field_name].dbValues.length; i += 1) {
                                                if(typeof allowedValues[node[field_name].dbValues[i]] !== 'undefined'){
                                                     node[field_name].textValues[i] = allowedValues[node[field_name].dbValues[i]];
                                                }
                                                else{
                                                    node[field_name].textValues[i] = node[field_name].dbValues[i];
                                                }
                                            }
                                        }
                                        else{
                                            for ( i = 0; i < node[field_name].dbValues.length; i += 1) {
                                                 node[field_name].textValues[i] = node[field_name].dbValues[i];
                                            }
                                        }
        
                                        break;
                                        
                                    case 'omadi_reference':
                                        subResult = Database.query('SELECT title, table_name, nid FROM node WHERE nid IN (' + node[field_name].dbValues.join(',') + ')');
                                        node[field_name].nodeTypes = [];
        
                                        while (subResult.isValidRow()) {
                                            textValue = subResult.fieldByName("title");
                                            subValue = subResult.fieldByName("nid");
        
                                            for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                                if (node[field_name].dbValues[i] == subValue) {
                                                    node[field_name].textValues[i] = textValue;
                                                    node[field_name].nodeTypes[i] = subResult.fieldByName("table_name");
                                                    break;
                                                }
                                            }
        
                                            subResult.next();
                                        }
                                        subResult.close();
                                        break;
        
                                    case 'omadi_time':
        
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            node[field_name].textValues[i] = Utils.secondsToString(node[field_name].dbValues[i]);
                                        }
                                        break;
        
                                    case 'datestamp':
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            if (!Utils.isEmpty(node[field_name].dbValues[i])) {
                                                node[field_name].dbValues[i] = parseInt(node[field_name].dbValues[i], 10);
                                                node[field_name].textValues[i] = Utils.formatDate(node[field_name].dbValues[i], 
                                                    (instances[field_name].settings.time == 1 || 
                                                        (typeof instances[field_name].settings.granularity !== 'undefined' && typeof instances[field_name].settings.granularity.hour !== 'undefined')));
                                            }
                                            else {
                                                node[field_name].dbValues[i] = null;
                                            }
                                        }
        
                                        break;
                                    
                                    case 'extra_price':
                                        
                                        node[field_name].tempData = result.fieldByName(field_name + "___data", Ti.Database.FIELD_TYPE_STRING);
                                        node[field_name].finalValue = 0;
                                        if(node[field_name].tempData){
                                            
                                            node[field_name].jsonValue = Utils.getParsedJSON(node[field_name].tempData);
                                            if(Utils.isArray(node[field_name].jsonValue)){
                                                for(i = 0; i < node[field_name].jsonValue.length; i ++){
                                                    
                                                    // If we have a total amount, add that in there instead of the price as they may be different
                                                    if(typeof node[field_name].jsonValue[i].total !== 'undefined'){
                                                        node[field_name].dbValues[i] = node[field_name].jsonValue[i].total;
                                                    }
                                                    else{
                                                        node[field_name].dbValues[i] = node[field_name].jsonValue[i].price;
                                                    }
                                                    
                                                    node[field_name].textValues[i] = JSON.stringify(node[field_name].jsonValue[i]);
                                                    
                                                    if(!isNaN(parseFloat(node[field_name].dbValues[i]))){
                                                        node[field_name].finalValue += parseFloat(node[field_name].dbValues[i]);
                                                    }
                                                }
                                            }
                                            
                                        }
                                        
                                       // Ti.API.error(JSON.stringify(node[field_name]));
    
                                        break;
                                        
                                    case 'image':
                                        // This includes signature fields
                                        break;
                                        
                                    case 'file':
                                        // Special case for only file-type fields (includes videos)
                                        if(instances[field_name].type == 'file'){
                                            
                                            subResult = Database.query("SELECT " + field_name + "___filename AS filename FROM " + node.type + " WHERE nid=" + node.nid);
                                            if (subResult.rowCount > 0) {
                                                textValue = [];
                                                origDBValue = subResult.fieldByName("filename");
                                                tempDBValues = Utils.getParsedJSON(origDBValue);
                                                if(Utils.isArray(tempDBValues)){
                                                    textValue = tempDBValues;
                                                }
                                                else{
                                                    textValue.push(origDBValue);
                                                }
                                                
                                                for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                                    if (!Utils.isEmpty(node[field_name].dbValues[i])) {
                                                        
                                                        if(typeof textValue[i] !== 'undefined'){
                                                            node[field_name].textValues[i] = textValue[i];
                                                        }
                                                        else{
                                                            node[field_name].textValues[i] = node[field_name].dbValues[i];
                                                        }
                                                    }
                                                }
                                            }
                                            subResult.close();
                                        }
                                        
                                        break;
        
                                    case 'calculation_field':
                                        // The text value is used to store the original value for comparison
                                        // A little hackish, but there is no other use for a text value in calculation_fields
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
        
                                            node[field_name].textValues[i] = node[field_name].dbValues[i];
                                        }
                                        break;
                                }
                            }
                        }
                    }
                    result.close();
                }
                Database.close();
            }
        }
    }
    catch(ex1){
        Utils.sendErrorReport("Exception loading node " + nid + ": " + ex1);
    }
    
    return node;
};

Node.resetFieldCache = function(){
  Node.cache.fields = {};  
};

Node.resetFakeFieldCache = function(){
  Node.cache.fakeFields = {};  
};

Node.resetRegionCache = function(){
  Node.cache.regions = {};  
};

Node.getFields = function(type) {
	var result, instances, field_name, nameParts;
    
    if (Node.cache.fields[type]) {
        instances = Node.cache.fields[type];
    }
    else {
        
        instances = {};
        result = Database.query("SELECT type, field_name, label, description, bundle, weight, required, widget, settings, disabled, region, fid, can_view, can_edit FROM fields WHERE bundle = '" + type + "' and disabled = 0 ORDER BY weight");

        while (result.isValidRow()) {
            field_name = result.fieldByName('field_name');
            instances[field_name] = {
                type : result.fieldByName('type'),
                field_name : result.fieldByName('field_name'),
                label : result.fieldByName('label'),
                description : result.fieldByName('description'),
                bundle : result.fieldByName('bundle'),
                weight : result.fieldByName('weight'),
                required : result.fieldByName('required'),
                widget : result.fieldByName('widget'),
                settings : JSON.parse(result.fieldByName('settings')),
                disabled : result.fieldByName('disabled'),
                region : result.fieldByName('region'),
                fid : result.fieldByName('fid'),
                can_view : (result.fieldByName('can_view', Ti.Database.FIELD_TYPE_INT) === 1 ? true : false),
                can_edit : (result.fieldByName('can_edit', Ti.Database.FIELD_TYPE_INT) === 1 ? true : false)
            };

            if ( typeof instances[field_name].widget === 'string') {
                instances[field_name].widget = JSON.parse(instances[field_name].widget);
            }

			if (field_name.indexOf("___end") !== -1) {
			    if (instances[field_name.split('___')[0]]){
				    instances[field_name.split('___')[0]].label += ' Start';
				}
				
				instances[field_name].label += ' End';
				instances[field_name].part = null;
                instances[field_name].partLabel = null;
			}
            else if (field_name.indexOf("___") !== -1) {
                nameParts = field_name.split("___");
                instances[field_name].part = nameParts[1];
                instances[field_name].partLabel = instances[field_name].settings.parts[nameParts[1]];
            }
            else {
                instances[field_name].part = null;
                instances[field_name].partLabel = null;
            }

            result.next();
        }
        result.close();
        Database.close();

        Node.cache.fields[type] = instances;
    }

    return instances;
};

Node.getFirstStreetAddress = function(node) {
    if(node){
        var instances = Node.getFields(node.type);
        for (var field_name in instances) {
            if (instances[field_name].type == 'location' &&
            	instances[field_name].part == 'street' &&
            	node[field_name] &&
            	node[field_name].dbValues &&
            	node[field_name].dbValues[0]) {
            		return node[field_name].dbValues[0];
            }
        }   
    }
    return '';
};

var savingNode = false;
Node.save = function(node) {
    var query, field_name, fieldNames, instances, result, insertValues, j, k, 
        instance, value_to_insert, has_data, saveNid, photoNids, origNid,
        continuousId, trueWindowNid, priceIdx, priceTotal, priceData, 
        jsonValue, nodeHasData, lastLocation;
   
    // Only one save at a time
    if(savingNode){
        Ti.API.info("The node was not saved because another node is already being saved.");
        node._error = 'A timing error prevented the form save.';
        return node;    
    }
    
    // Set the lock to make sure no other asyncronous activities run this function simultaneously
    savingNode = true;
    
    try{
        node._saved = false;
    
        instances = Node.getFields(node.type);
    
        fieldNames = [];
    
        for (field_name in instances) {
            if (instances.hasOwnProperty(field_name)) {
                if (field_name != null && typeof instances[field_name] !== 'undefined') {
                    
                    // Don't save anything for rules_field, as they are read-only for mobile devices
                    if(instances[field_name].type != 'rules_field'){
                        fieldNames.push(field_name);
                        
                        if(instances[field_name].type == 'extra_price'){
                            // Must check if data exists in node to add the extra field since the same
                            // check is done later on to add the data.
                            // This this is wrong, the column vs value count could be off.
                            if ( typeof node[field_name] !== 'undefined') {
                                fieldNames.push(field_name + "___data");
                            }
                        }
                    }
                }
            }
        }
      
        // For autocomplete widgets
        node = Node.addNewTerms(node);
        
        node.title = Node.getTitle(node);
        
        // Setup the default for the saveNid
        saveNid = node.nid;
        
        if(node._isContinuous){
            
            Ti.API.debug("Saving continuous id: " + node.continuous_nid);
            
            // Start a new record if the continuous_nid isn't set
            if(!node.continuous_nid){
                node.continuous_nid = Node.getNewNid();
            }
            
            // Save the actual nid as the continuous negative NID
            saveNid = node.continuous_nid;
            origNid = node.nid;
            
            if(isNaN(origNid)){
                origNid = 0;
            }
            
            try{
                // A timing issue could come up where the continuous save interval happens after the regular save
                // This would overwrite the correctly saved node with a continuous save one, and it would be deleted after the window closes
                // This code should stay in place even after we change from intervals to saving after a value changes, as some kind of timeout will have to still be in place
                // The best way to get into this code is to turn off internet connection, save the node, and wait on the "No Internet Connection" alert
                var getNewNid = false;
                result = Database.query("SELECT COUNT(*) FROM node WHERE nid = " + saveNid + " AND flag_is_updated IN (0,1)");
                if(result.isValidRow()){
                    if(result.field(0, Ti.Database.FIELD_TYPE_INT) > 0){
                        getNewNid = true;
                    }
                }
                result.close();
                Database.close();
                
                if(getNewNid){
                    Ti.API.debug("Retrieving new save nid because the current one is already taken.");
                    saveNid = node.continuous_nid = Node.getNewNid();
                }
                
            } catch(ex){
                Utils.sendErrorReport("Exception checking the nid of a continuous save: " + ex);
            }
           
            // The continuous_nid will be saved as the current window's NID
        }
        else if (node.nid == 'new') {
            Ti.API.debug("Saving new node");
            if(!node.continuous_nid){
                node.continuous_nid = Node.getNewNid();
            }
            node.nid = saveNid = node.continuous_nid;
        }
        else if(node._isDraft){
            // This else if must come after the node.nid == 'new'
            
            // If the draft is already saved as a negative nid, then don't generate a new one
            // If this node has a positive nid, make sure we create a copy with a new negative nid
            if(node.nid > 0){
                node.origNid = node.nid;
                saveNid = node.continuous_nid;
            }
        }
        else if(node.flag_is_updated == 3 && node.continuous_nid < 0){
            // This was saved as a draft, and we are doing a regular save
            // Delete the draft version after a successful node save
            // as a continuous save is saved over the original draft
            // The logic elsewhere will not delete the node unless the node is correctly saved
            Ti.API.debug("Saving draft to normal: " + JSON.stringify(node));
            if(node.nid > 0){
                // Add any newly0 created/removed attachments to the draft so they aren't lost
				Database.queryList("UPDATE _files SET nid = " + node.nid + " WHERE nid=" + node.continuous_nid);
				Database.close();
				
                // Only do the delete when the original nid is greater than 0
                // ie. a draft should not be deleted if it's never been to the server, or the data moving to the server will be deleted
                node._deleteNid = node.continuous_nid;
            }
            
            saveNid = node.nid;
        }
        else{
            saveNid = node.nid;
        }
        
        node._saveNid = saveNid;
        
        if(typeof node.sync_hash === 'undefined' || node.sync_has == null){
            node.sync_hash = Ti.Utils.md5HexDigest(JSON.stringify(node) + (new Date()).getTime());
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in first part of node save: " + ex);
    }
    
    try {
        nodeHasData = false;
        
        if(fieldNames.length > 0){
            query = "INSERT OR REPLACE INTO " + node.type + " (nid, `";
            query += fieldNames.join('`,`');
            query += "`) VALUES (" + saveNid + ',';
    
            insertValues = [];
            
            for (j = 0; j < fieldNames.length; j++) {
                field_name = fieldNames[j];
                
                if (instances[field_name] != null) {
                    instance = instances[field_name];
    
                    value_to_insert = null;
    
                    if ( typeof node[field_name] !== 'undefined') {
    
                        //Build cardinality for fields
                        if (instance.settings.cardinality == -1 || instance.settings.cardinality > 1) {
    
                            has_data = false;
    
                            for ( k = 0; k < node[field_name].dbValues.length; k++) {
                                if (node[field_name].dbValues[k] !== null) {
                                    has_data = true;
                                }
                            }
    
                            if (has_data) {
                                value_to_insert = JSON.stringify(node[field_name].dbValues);
                            }
                        }
                        else if(instance.type == 'extra_price'){
                            priceTotal = 0;
                            priceData = [];
                            
                            // Add up all the prices and save the total amount
                            if(node[field_name].dbValues.length > 0){
                                
                                for(priceIdx = 0; priceIdx < node[field_name].dbValues.length; priceIdx ++){
                                    
                                    if(!isNaN(parseFloat(node[field_name].dbValues[priceIdx]))){
                                        priceTotal += parseFloat(node[field_name].dbValues[priceIdx]);
                                        
                                        try{
                                            if(typeof node[field_name].textValues[priceIdx] !== 'undefined'){
                                                jsonValue = JSON.parse(node[field_name].textValues[priceIdx]);
                                            }
                                            else{
                                                jsonValue = {};
                                            }
                                        }
                                        catch(exJSON){
                                            Utils.sendErrorReport("Could not parse JSON for extra_price: " + node[field_name].textValues[priceIdx]);
                                        }
                                        if(jsonValue != null){
                                            priceData.push(jsonValue);
                                        }
                                    }
                                }
                            }
                            
                            insertValues.push(priceTotal);
                            value_to_insert = JSON.stringify(priceData);
                            
                            if(priceTotal != 0){
                                nodeHasData = true;
                            }
                        }
                        else {
                            if (node[field_name].dbValues.length == 1) {
                                value_to_insert = node[field_name].dbValues[0];
                            }   
                        }
                    }
    
                    if (value_to_insert === null) {
                        insertValues.push('null');
                    }
                    else {
                        switch(instance.type) {
    
                            case 'user_reference':
                            case 'taxonomy_term_reference':
                            case 'omadi_reference':
                            case 'datestamp':
                            case 'omadi_time':
                            case 'auto_increment':
                            case 'image':
                            case 'file':
    
                                if (Utils.isEmpty(value_to_insert)) {
                                    value_to_insert = "null";
                                }
                                else{
                                    nodeHasData = true;
                                }
    
                                insertValues.push("'" + Utils.dbEsc(value_to_insert) + "'");
                                break;
    
                            case 'number_decimal':
                            case 'number_integer':
                            case 'list_boolean':
                            case 'calculation_field':
                            case 'extra_price':
    
                                if (Utils.isEmpty(value_to_insert) && value_to_insert != 0) {
                                    insertValues.push('null');
                                }
                                else {
                                    insertValues.push("'" + Utils.dbEsc(value_to_insert) + "'");
                                    nodeHasData = true;
                                }
                                break;
    
                            default:
                                
                                if(("".toString() + value_to_insert).length > 0){
                                    nodeHasData = true;    
                                }
                                
                                insertValues.push("'" + Utils.dbEsc(value_to_insert) + "'");
                                break;
                        }
                    }
                }
            }
    
            query += insertValues.join(',');
            query += ")";
            
        }
        
        // Only save if data exists or it's a continuously saved node in the background
        if(nodeHasData || node._isContinuous){
            
            try {
                Ti.API.debug(query);
                Database.query(query);
                
                // Make sure dispatch_nid is set for the save
                if(typeof node.dispatch_nid === 'undefined'){
                    node.dispatch_nid = 0;
                }
                
                if(typeof node.custom_copy_orig_nid === 'undefined'){
                    node.custom_copy_orig_nid = 0;
                }
                
                if(typeof node.viewed === 'undefined'){
                    node.viewed = 0;
                }
                
                if (node._isContinuous) {          
                    Ti.API.debug("SAVING TO CONTINUOUS: " + saveNid + " " + origNid + " " + node.dispatch_nid);    
                    
                    query = "INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid, dispatch_nid, copied_from_nid) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + Utils.dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",4,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1," + origNid + "," + node.dispatch_nid + "," + node.custom_copy_orig_nid + ")";
                }
                else if (node._isDraft) {
                    // Only save drafts as a negative nid
                    query = "INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid, dispatch_nid, copied_from_nid) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + Utils.dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",3,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1," + node.origNid + "," + node.dispatch_nid + "," + node.custom_copy_orig_nid + ")";
                }
                else{
                    // This is a save the will be sent to the server
                    
                    lastLocation = Location.getLastLocation();
                    
                    if (saveNid > 0) {
                        query = "UPDATE node SET changed=" + node.changed + 
                            ", changed_uid=" + node.changed_uid + 
                            ", title='" + Utils.dbEsc(node.title) + 
                            "', flag_is_updated=1, table_name='" + node.type + 
                            "', form_part=" + node.form_part + 
                            ", no_data_fields='" + node.no_data + 
                            "',viewed=" + node.viewed + 
                            ", latitude='" + lastLocation.latitude +
                            "', longitude='" + lastLocation.longitude +
                            "', accuracy=" + lastLocation.accuracy +
                            " WHERE nid=" + saveNid;
                    }
                    else {
                        // Give all permissions for this node. Once it comes back, the correct permissions will be there.  If it never gets uploaded, the user should be able to do whatever they want with that info.
                        query = "INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid, dispatch_nid, copied_from_nid, latitude, longitude, accuracy) VALUES (" + 
                            saveNid + "," + 
                            node.created + "," + 
                            node.changed + ",'" + 
                            Utils.dbEsc(node.title) + "'," + 
                            node.author_uid + "," + 
                            node.changed_uid + ",1,'" + 
                            node.type + "'," + 
                            node.form_part + ",'" + 
                            node.no_data + "'," + 
                            node.viewed + ",'" + 
                            node.sync_hash + "',1,1,0," + 
                            node.dispatch_nid + "," + 
                            node.custom_copy_orig_nid + ",'" +
                            lastLocation.latitude + "','" +
                            lastLocation.longitude + "'," +
                            lastLocation.accuracy + ")";
                    }
                }
                
                Ti.API.debug(query);
                Database.query(query);
                
                photoNids = [0];
                
                if(!node.continuous_nid){
                    continuousId = parseInt(node.continuous_nid, 10);
                    if(!isNaN(continuousId) && continuousId != 0){
                        photoNids.push(continuousId);
                    }
                }
                
                trueWindowNid = 'new';
                if(!node.nid){
                    trueWindowNid = parseInt(node.nid, 10);
                    if(!isNaN(trueWindowNid) && trueWindowNid != 0){
                        photoNids.push(trueWindowNid);
                    }
                }
                
                if(node.origNid){
                    photoNids.push(node.origNid);
                }
                
                // Do not save the photos to the continuous
                // Do not save photos to a dispatch node or a timecard node
                if(!node._isContinuous && node.type != 'dispatch' && node.type != 'timecard'){
                    Database.queryList('UPDATE _files SET nid=' + saveNid + ' WHERE nid IN (' + photoNids.join(',') + ') AND finished=0');
                    Database.close();
                }
    
                node._saved = true;
                Ti.API.debug("NODE SAVE WAS SUCCESSFUL");
            
            }
            catch(ex1) {
                Display.doneLoading();
                alert("Error saving to the node table: " + ex1);
                Database.query("DELETE FROM " + node.type + " WHERE nid = " + saveNid);
                Utils.sendErrorReport("Error saving to the node table: " + ex1);
            }
        }    
        else{
            // The node didn't have any data to save in fields, so do not save, and send a report
            Utils.sendErrorReport("Node has no data: " + JSON.stringify(node));
            node._saved = false;
        }

    }
    catch(ex2) {
        Display.doneLoading();
        alert("Error saving to " + node.type + " table: " + ex2 + " : " + query);
        Utils.sendErrorReport("Error saving to " + node.type + " table: " + ex2 + " : " + query);
    }
	Database.close();
    
    if(node._saved === true){
         if(typeof node._deleteNid !== 'undefined'){
              // This was setup with the drafts section above
              Node.deleteNode(node._deleteNid);  
         }
    }
    
    // Reset the lock to allow other nodes to save
    savingNode = false;
    
    return node;
};

Node.deleteNode = function(nid){
    var result, table_name, dispatchNid;
    try{
        // Currently, only delete negative nids, which are drafts or non-saved nodes
        // To delete positive nids, we need to sync that to the server, which is not yet supported
        if(nid < 0){
            dispatchNid = 0;
            
            result = Database.query("SELECT table_name, dispatch_nid FROM node WHERE nid = " + nid);
            
            if(result.isValidRow()){
                table_name = result.fieldByName("table_name");
                dispatchNid = result.fieldByName("dispatch_nid", Ti.Database.FIELD_TYPE_INT);
    
                Database.query("DELETE FROM node WHERE nid = " + nid);
                
                if(table_name){
                    Database.query("DELETE FROM " + table_name + " WHERE nid = " + nid);
                }
            }
            
            result.close();
            
            // Delete any photos from the DB where the nid matches
            Database.queryList("UPDATE _files SET nid = -1000000 WHERE nid = " + nid);
            Database.close();
            
            if(dispatchNid < 0){
                Node.deleteNode(dispatchNid);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception deleting node: " + ex);
    }
};

Node.addNewTerms = function(node){
    var instances, field_name, i;
    
    try{
        instances = Node.getFields(node.type);
        
        for(field_name in instances){
            if(instances.hasOwnProperty(field_name)){
                if(typeof instances[field_name].type !== 'undefined' && instances[field_name].type == 'taxonomy_term_reference' && instances[field_name].widget.type == 'taxonomy_autocomplete'){
                    
                    if(typeof node[field_name] !== 'undefined' && typeof node[field_name].dbValues !== 'undefined'){
                        for(i = 0; i < node[field_name].dbValues.length; i ++){
                            if(node[field_name].dbValues[i] == -1){
                                node[field_name].dbValues[i] = Node.insertNewTerm(instances[field_name].settings.vocabulary, node[field_name].textValues[i]);
                            }
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in addNewTerms: " + ex);
    }
    
    return node;
};

Node.insertNewTerm = function(machine_name, name){
    var result, tid = -2, vid = 0, retval = null;
    
    try{
        result = Database.query("SELECT MIN(tid) FROM term_data");
        if(result.isValidRow()){
            tid = result.field(0, Ti.Database.FIELD_TYPE_INT);
            tid -= 1; 
        }
        result.close();
        
        result = Database.query("SELECT vid FROM vocabulary WHERE machine_name='" + Utils.dbEsc(machine_name) + "'");
        if(result.isValidRow()){
            vid = result.fieldByName('vid');
            
            // -2 is the first negative tid to use because -1 is a place holder for a non-set new term
            tid = Math.min(tid, -2);
            
            Database.query("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES (" + tid + "," + vid + ",'" + Utils.dbEsc(name) + "','',0," + Utils.getUTCTimestamp() + ")");
            Ti.API.debug("tid: " + tid);
            retval = tid;
        }
        result.close();
        Database.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception in insertNewTerm: " + ex);
    }
    
    return retval;
};

Node.getTitle = function(node) {
    var title, bundle, index, field_name, titleValues = [], spacer = ' - ';

    title = "- No Title -";

    bundle = Node.getBundle(node.type);
    
    if (bundle && typeof bundle.data.title_fields !== 'undefined') {
        for (index in bundle.data.title_fields) {
            if (bundle.data.title_fields.hasOwnProperty(index)) {
                field_name = bundle.data.title_fields[index];

                if (field_name == 'uid') {
                    field_name = 'author_uid';
                }

                if ((field_name == 'author_uid' || field_name == 'changed_uid') && typeof node.changed_uid !== 'undefined') {
                    titleValues.push(Utils.getRealname(node[field_name]));
                }
                else if ((field_name == 'created' || field_name == 'changed') && typeof node[field_name] !== 'undefined') {
                    titleValues.push(Utils.formatDate(node[field_name], true));
                }
                else if ( typeof node[field_name] !== 'undefined' && typeof node[field_name].textValues !== 'undefined' && typeof node[field_name].textValues[0] !== 'undefined') {
                    titleValues.push(node[field_name].textValues[0]);
                }
            }
        }
    }

    if (titleValues.length > 0) {
        if ( typeof bundle.data.title_fields_separator !== 'undefined') {
            spacer = bundle.data.title_fields_separator;
        }

        title = titleValues.join(spacer);
    }

    return title;
};

var bundleCache = {};
Node.getBundle = function(type, reset) {
    if(!bundleCache[type] || reset) {
        var result = Database.query('SELECT _data, display_name, can_create, can_view, child_forms FROM bundles WHERE bundle_name="' + type + '"');
        if (result.isValidRow()) {
        	bundleCache[type] = {
                type : type,
                data : JSON.parse(result.fieldByName('_data')),
                child_forms : JSON.parse(result.fieldByName('child_forms')),
                label : result.fieldByName('display_name'),
                can_create : result.fieldByName('can_create', Ti.Database.FIELD_TYPE_INT),
                can_view : result.fieldByName('can_view', Ti.Database.FIELD_TYPE_INT)
            };
        } else {
            bundleCache[type] = null;
        }
    
        result.close();
        Database.close();
    }
    return bundleCache[type];
};

Node.getNewNid = function() {
    var result, smallestNid;
    //Get smallest nid
    try{
        result = Database.query("SELECT MIN(nid) FROM node");
    
        if (result.isValidRow()) {
            smallestNid = result.field(0);
            
            smallestNid = parseInt(smallestNid, 10);
            if (isNaN(smallestNid) || smallestNid > 0) {
                smallestNid = -1;
            }
            else {
                smallestNid--;
            }
        }
        else {
            smallestNid = -1;
        }
        
        result.close();
        Database.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception in getNewNodeNid: " + ex);   
        Database.close();
    }

    return smallestNid;
};

Node.getFakeFields = function(type) {
    var result, fakeFields, field_name;
    
    if ( typeof Node.cache.fakeFields[type] !== 'undefined') {
        fakeFields = Node.cache.fakeFields[type];
    } else {
        fakeFields = {};
        result = Database.query("SELECT field_name FROM fake_fields WHERE bundle = '" + type + "'");

        while (result.isValidRow()) {
            field_name = result.fieldByName('field_name');
            
            fakeFields[field_name] = field_name;

            result.next();
        }
        result.close();
        Database.close();

        Node.cache.fakeFields[type] = fakeFields;
    }

    return fakeFields;
};

Node.getRegions = function(type) {
    var result, regions, region_name, region_settings;
    
    if ( typeof Node.cache.regions[type] !== 'undefined') {
        regions = Node.cache.regions[type];
    }
    else {
        regions = {};
        result = Database.query("SELECT rid, node_type, label, region_name, weight, settings FROM regions WHERE node_type = '" + type + "' ORDER BY weight ASC");
        
        while (result.isValidRow()) {
            region_name = result.fieldByName('region_name');
            
            region_settings = result.fieldByName('settings');
            regions[region_name] = {
                rid : result.fieldByName('rid'),
                node_type : result.fieldByName('node_type'),
                label : result.fieldByName('label'),
                region_name : result.fieldByName('region_name'),
                weight : result.fieldByName('weight'),
                settings : JSON.parse(result.fieldByName('settings'))
            };
            result.next();
        }
        result.close();
        Database.close();
        
        Node.cache.regions[type] = regions;
    }

    return regions;
};

Node.setViewed = function(nid) {

    /** UPDATE the mobile mainDB **/
    /** SEND THE VIEWED TIMESTAMP TO THE SERVER FOR EVERY VIEW, EVEN IF IT WAS VIEWED BEFORE **/
    Database.query("UPDATE node SET viewed = '" + Utils.getUTCTimestamp() + "' WHERE nid = " + nid);
    Database.close();

    /** UPDATE the web server mainDB **/
    var http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false,
        timeout: 10000
    });
    
    http.open('POST', Ti.App.DOMAIN_NAME + '/js-forms/custom_forms/viewed.json?nid=' + nid);

    Utils.setCookieHeader(http);
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
    // We don't care about the response, as this is a very trivial thing
};

module.exports = Node;
