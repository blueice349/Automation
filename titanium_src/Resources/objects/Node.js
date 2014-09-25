/*jslint node:true */
'use strict';

var Database = require('lib/Database');
var Utils = require('lib/Utils');

var Node = function() {
	
};

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
    var db, node, result, subResult, field_name, dbValue, tempDBValues, textValue, 
        subValue, decoded, i, real_field_name, part, field_parts, widget, instances, 
        tempValue, origDBValue, jsonValue, allowedValues, allowedKey, filePath, newNid,
        listDB, intNid;

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
                                        for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                            if (node[field_name].dbValues[i] === null) {
                                                node[field_name].textValues[i] = "";
                                            }
                                            else {
                                                node[field_name].textValues[i] = node[field_name].dbValues[i];
                                            }
                                        }
                                        
                                        
                                        break;
        
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

Node.cache = {};
Node.cache.fields = {};

Node.getFields = function(type) {
	var db, result, instances, field_name, nameParts;
    
    if (typeof Node.cache.fields[type] !== 'undefined') {
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
				instances[field_name.split('___')[0]].label += ' Start';
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



module.exports = Node;
