/*jslint eqeq:true,nomen:true,plusplus:true*/

var _instance = null;

// Load the Database module
var Database = require('lib/Database');
var Utils = require('lib/Utils');
var Node = require('objects/Node');
var Field = require('objects/Field');


function Comment(){"use strict";
    this.comment = {};
}

function getInstance(){"use strict";
    if(_instance === null){
        _instance = new Comment();
    }
    
    return _instance;
}

Comment.prototype.load = function(cid) {"use strict";

    var db, comment, result, subResult, field_name, dbValue, tempDBValues, textValue, 
        subValue, decoded, i, real_field_name, part, field_parts, widget, instances, 
        tempValue, origDBValue, jsonValue, allowedValues, allowedKey, filePath, newCid,
        listDB, intCid, instances;

    this.comment = null;
    
    Ti.API.debug("Loading cid: " + cid);
    
    if(typeof cid !== 'undefined'){
        intCid = parseInt(cid, 10);
    
        if (!isNaN(intCid) && intCid != 0) {
            
            this.comment = {
                cid : cid
            };

            try{
                result = Database.query('SELECT cid, nid, uid, created, changed, subject, sync_status, status, name, node_type FROM comment WHERE cid = ' + cid);
                Ti.API.debug("Executed comment sql: " + cid);
                
                if (result.isValidRow()) {
                    Ti.API.info("Loaded a comment");
                    
                    this.comment.cid = result.fieldByName('cid', Ti.Database.FIELD_TYPE_INT);
                    this.comment.nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
                    this.comment.uid = result.fieldByName('uid', Ti.Database.FIELD_TYPE_INT);
                    
                    this.comment.subject = result.fieldByName('subject', Ti.Database.FIELD_TYPE_STRING);
                    this.comment.created = result.fieldByName('created', Ti.Database.FIELD_TYPE_INT);
                    this.comment.changed = result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT);
                    
                    this.comment.sync_status = result.fieldByName('sync_status', Ti.Database.FIELD_TYPE_INT);
                    this.comment.name = result.fieldByName('name', Ti.Database.FIELD_TYPE_STRING);
                    this.comment.node_type = result.fieldByName('node_type', Ti.Database.FIELD_TYPE_STRING);
                }
                
                result.close();
                
                if (typeof this.comment.nid !== 'undefined') {
                    
                    instances = Field.getFields(this.comment.node_type);
        
                    result = Database.query("SELECT * FROM " + this.comment.node_type + " WHERE cid = " + this.comment.cid);
                    
                    Ti.API.debug("loading comment");
                    
                    if (result.isValidRow()) {
                        for (field_name in instances) {
                            if (instances.hasOwnProperty(field_name)) {
        
                                origDBValue = result.fieldByName(field_name, Ti.Database.FIELD_TYPE_STRING);
        
                                this.comment[field_name] = {};
                                this.comment[field_name].textValues = [];
                                this.comment[field_name].dbValues = [];
        
                                /**
                                 * This takes care of all multi-part fields:
                                 * location
                                 * license_plate
                                 * vehicle_fields
                                 */
                                if (field_name.indexOf("___") !== -1) {
                                    dbValue = origDBValue;
                                    
                                    field_parts = field_name.split("___");
                                    real_field_name = field_parts[0];
                                    part = field_parts[1];
        
                                    if ( typeof this.comment[real_field_name] === 'undefined') {
                                        this.comment[real_field_name] = {};
                                        this.comment[real_field_name].label = instances[field_name].label;
                                        this.comment[real_field_name].parts = {};
                                        this.comment[real_field_name].dbValues = [];
                                        // Just make sure one and only one value gets saved to the expanded fieldname so it gets displayed once
                                        
                                    }
                                    
                                    if (dbValue === null) {
                                        dbValue = "";
                                    }
                                    else if(dbValue === false){
                                        dbValue = "";
                                    }
        
                                    this.comment[real_field_name].parts[part] = {
                                        label : instances[field_name].settings.parts[part],
                                        textValue : dbValue
                                    };
                                    
                                    //Ti.API.info('HERE HERE: ' + field_name + " " + real_field_name + " " + dbValue);
                                    this.comment[real_field_name].dbValues.push(dbValue);
                                    this.comment[field_name].dbValues.push(dbValue);
                                }
                                else {
        
                                    jsonValue = Utils.getParsedJSON(origDBValue);
                                    //Ti.API.info(origDBValue);
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
                                                        this.comment[field_name].dbValues.push(null);
                                                    }
                                                    else{
                                                        this.comment[field_name].dbValues.push(dbValue);   
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
                                                        this.comment[field_name].dbValues.push(null);   
                                                    }
                                                    else{
                                                        this.comment[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
        
                                            case 'number_decimal':
        
                                                if (!Utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                                    dbValue = parseFloat(dbValue);
                                                    if(isNaN(dbValue)){
                                                        this.comment[field_name].dbValues.push(null);
                                                    }
                                                    else{
                                                        this.comment[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
        
                                            case 'calculation_field':
        
                                                this.comment[field_name].origValues = [];
                                                if (!Utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                                    dbValue = parseFloat(dbValue);
                                                    if(isNaN(dbValue)){
                                                        this.comment[field_name].dbValues.push(null);
                                                    }
                                                    else{
                                                        this.comment[field_name].dbValues.push(dbValue);   
                                                    }
                                                }
                                                break;
                                                
                                            case 'rules_field':
                                                this.comment[field_name].dbValues.push(Utils.getParsedJSON(origDBValue));
                                                break;
        
                                            default:
                                                this.comment[field_name].dbValues.push(dbValue);
                                                break;
                                        }
                                    }
                                }
        
                                // Make sure textValues is set to something for each value
                                for ( i = 0; i < this.comment[field_name].dbValues.length; i += 1) {
                                    this.comment[field_name].textValues[i] = "";
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
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                            if (this.comment[field_name].dbValues[i] === null) {
                                                this.comment[field_name].textValues[i] = "";
                                            }
                                            else {
                                                this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i];
                                            }
                                        }
                                        
                                        
                                        break;
        
                                    case 'number_integer':
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                            if (this.comment[field_name].dbValues[i] === null) {
                                                this.comment[field_name].textValues[i] = "";
                                            }
                                            else {
                                                this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i];
                                            }
                                        }
                                        break;
        
                                    case 'number_decimal':
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                            if (this.comment[field_name].dbValues[i] === null) {
                                                this.comment[field_name].textValues[i] = "";
                                            }
                                            else {
                                                this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i].toFixed(2);
                                            }
                                        }
                                        break;
        
                                    case 'auto_increment':
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
        
                                            if (instances[field_name].settings.prefix > '') {
                                                this.comment[field_name].textValues[i] = instances[field_name].settings.prefix + this.comment[field_name].dbValues[i];
                                            }
                                            else {
                                                this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i] + ''.toString();
                                            }
                                        }
                                        break;
        
                                    case 'list_boolean':
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                            if (this.comment[field_name].dbValues[i] === null) {
                                                this.comment[field_name].textValues[i] = '';
                                            }
                                            else if (this.comment[field_name].dbValues[i] == 1) {
                                                this.comment[field_name].textValues[i] = 'Yes';
                                            }
                                            else {
                                                this.comment[field_name].textValues[i] = 'No';
                                            }
                                        }
                                        break;
        
                                    case 'user_reference':
        
                                        subResult = Database.query('SELECT uid, realname FROM user WHERE uid IN (' + this.comment[field_name].dbValues.join(',') + ')');
                                        while (subResult.isValidRow()) {
                                            textValue = subResult.fieldByName("realname");
                                            subValue = subResult.fieldByName("uid");
        
                                            for ( i = 0; i < this.comment[field_name].dbValues.length; i += 1) {
                                                if (this.comment[field_name].dbValues[i] == subValue) {
                                                    this.comment[field_name].textValues[i] = textValue;
                                                    break;
                                                }
                                            }
        
                                            subResult.next();
                                        }
                                        subResult.close();
                                        break;
        
                                    case 'taxonomy_term_reference':
        
                                        subResult = Database.query('SELECT name, tid FROM term_data WHERE tid IN(' + this.comment[field_name].dbValues.join(',') + ')');
                                        while (subResult.isValidRow()) {
                                            textValue = subResult.fieldByName("name");
                                            subValue = subResult.fieldByName("tid");
        
                                            for ( i = 0; i < this.comment[field_name].dbValues.length; i += 1) {
                                                if (this.comment[field_name].dbValues[i] == subValue) {
                                                    this.comment[field_name].textValues[i] = textValue;
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
                                            for ( i = 0; i < this.comment[field_name].dbValues.length; i += 1) {
                                                if(typeof allowedValues[this.comment[field_name].dbValues[i]] !== 'undefined'){
                                                     this.comment[field_name].textValues[i] = allowedValues[this.comment[field_name].dbValues[i]];
                                                }
                                                else{
                                                    this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i];
                                                }
                                            }
                                        }
                                        else{
                                            for ( i = 0; i < this.comment[field_name].dbValues.length; i += 1) {
                                                 this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i];
                                            }
                                        }
                                        break;
                                        
                                    case 'omadi_reference':
                                        subResult = Database.query('SELECT title, table_name, nid FROM node WHERE nid IN (' + this.comment[field_name].dbValues.join(',') + ')');
                                        this.comment[field_name].nodeTypes = [];
        
                                        while (subResult.isValidRow()) {
                                            textValue = subResult.fieldByName("title");
                                            subValue = subResult.fieldByName("nid");
        
                                            for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                                if (this.comment[field_name].dbValues[i] == subValue) {
                                                    this.comment[field_name].textValues[i] = textValue;
                                                    this.comment[field_name].nodeTypes[i] = subResult.fieldByName("table_name");
                                                    break;
                                                }
                                            }
        
                                            subResult.next();
                                        }
                                        subResult.close();
                                        break;
        
                                    case 'omadi_time':
        
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                            this.comment[field_name].textValues[i] = Utils.secondsToString(this.comment[field_name].dbValues[i]);
                                        }
                                        break;
        
                                    case 'datestamp':
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                            if (!Utils.isEmpty(this.comment[field_name].dbValues[i])) {
                                                this.comment[field_name].dbValues[i] = parseInt(this.comment[field_name].dbValues[i], 10);
                                                this.comment[field_name].textValues[i] = Utils.formatDate(this.comment[field_name].dbValues[i], 
                                                    (instances[field_name].settings.time == 1 || 
                                                        (typeof instances[field_name].settings.granularity !== 'undefined' && typeof instances[field_name].settings.granularity.hour !== 'undefined')));
                                            }
                                            else {
                                                this.comment[field_name].dbValues[i] = null;
                                            }
                                        }
        
                                        break;
                                    
                                    case 'extra_price':
                                        
                                        this.comment[field_name].tempData = result.fieldByName(field_name + "___data", Ti.Database.FIELD_TYPE_STRING);
                                        this.comment[field_name].finalValue = 0;
                                        if(this.comment[field_name].tempData){
                                            this.comment[field_name].jsonValue = JSON.parse(this.comment[field_name].tempData);
                                            if(Utils.isArray(this.comment[field_name].jsonValue)){
                                                for(i = 0; i < this.comment[field_name].jsonValue.length; i ++){
                                                    
                                                    // If we have a total amount, add that in there instead of the price as they may be different
                                                    if(typeof this.comment[field_name].jsonValue[i].total !== 'undefined'){
                                                        this.comment[field_name].dbValues[i] = this.comment[field_name].jsonValue[i].total;
                                                    }
                                                    else{
                                                        this.comment[field_name].dbValues[i] = this.comment[field_name].jsonValue[i].price;
                                                    }
                                                    
                                                    this.comment[field_name].textValues[i] = JSON.stringify(this.comment[field_name].jsonValue[i]);
                                                    
                                                    if(!isNaN(parseFloat(this.comment[field_name].dbValues[i]))){
                                                        this.comment[field_name].finalValue += parseFloat(this.comment[field_name].dbValues[i]);
                                                    }
                                                }
                                            }
                                        }
                                        
                                       
                                        break;
                                        
                                    case 'image':
                                    case 'file':
                                        // This includes signature and video fields
                                        
                                        subResult = Database.queryList('SELECT * FROM _files WHERE finished = 0 AND nid IN (' + this.comment.nid + ',0) AND field_name ="' + field_name + '" ORDER BY delta ASC');
        
                                        this.comment[field_name].imageData = [];
                                        this.comment[field_name].degrees = [];
                                        this.comment[field_name].deltas = [];
                                        this.comment[field_name].thumbData = [];
                                        
                                        if (subResult.rowCount > 0) {
                                            while (subResult.isValidRow()) {
                                                
                                                this.comment[field_name].imageData.push(subResult.fieldByName('file_path'));
                                                this.comment[field_name].deltas.push(subResult.fieldByName('delta'));
                                                this.comment[field_name].degrees.push(subResult.fieldByName('degrees', Ti.Database.FIELD_TYPE_INT));
                                                this.comment[field_name].thumbData.push(subResult.fieldByName('thumb_path'));
                                                
                                                //Ti.API.debug(JSON.stringify(node[field_name]));
                                                
                                                subResult.next();
                                            }
                                        }
                                        subResult.close();
                                        
                                        // Special case for only file-type fields
                                        if(instances[field_name].type == 'file'){
                                            
                                            subResult = Database.query("SELECT " + field_name + "___filename AS filename FROM " + this.comment.node_type + " WHERE nid=" + this.comment.nid);
                                            if (subResult.rowCount > 0) {
                                                textValue = [];
                                                origDBValue = subResult.fieldByName("filename");
                                                tempDBValues = Utils.getParsedJSON(origDBValue);
                                                //Ti.API.debug(tempDBValues);
                                                if(Utils.isArray(tempDBValues)){
                                                    textValue = tempDBValues;
                                                }
                                                else{
                                                    textValue.push(origDBValue);
                                                }
                                                //Ti.API.debug(textValue);
                                                
                                                for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
                                                    if (!Utils.isEmpty(this.comment[field_name].dbValues[i])) {
                                                        
                                                        if(typeof textValue[i] !== 'undefined'){
                                                            this.comment[field_name].textValues[i] = textValue[i];
                                                        }
                                                        else{
                                                            this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i];
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
                                        for ( i = 0; i < this.comment[field_name].dbValues.length; i++) {
        
                                            this.comment[field_name].textValues[i] = this.comment[field_name].dbValues[i];
                                        }
                                        break;
                                }
                            }
                        }
                    }
                }
                
                Database.close();
            }
            catch(ex){
                Utils.sendErrorReport("Exception with comment table query: " + ex);
            }
        }
    }
    
    Ti.API.debug("Comment load: " + JSON.stringify(this.comment));
    
    return this.comment;
};

Comment.prototype.save = function(comment){"use strict";
    var query, saved = false, nodeType, tableName, instances, fieldNames, field_name, 
        insertValues, value_to_insert, j, instance, has_data, priceTotal, priceData,
        k, priceIdx, jsonValue, nodeHasData;
    
    
    Ti.API.debug("saving comment in .save: " + JSON.stringify(comment));
    
    this.comment = comment;
    
    Ti.API.debug("About to save comment: " + JSON.stringify(this.comment));
    
    nodeType = Node.getNodeType(this.comment.nid);
    
    tableName = 'comment_node_' + nodeType;
    
    try{
        query = "INSERT OR REPLACE INTO comment (cid, nid, uid, subject, created, changed, status, name, node_type, sync_status) VALUES ";
        query += "(" + this.comment.cid + "," + this.comment.nid + "," + this.comment.uid + ",''," + this.comment.created + "," + this.comment.changed + ",1,'','" + Database.escape(tableName) + "',1)"; 
        
        Ti.API.debug(query);
        
        Database.query(query);
        
        instances = Field.getFields(tableName);
    
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
                            if ( typeof comment[field_name] !== 'undefined') {
                                fieldNames.push(field_name + "___data");
                            }
                        }
                    }
                }
            }
        }
        
        if(fieldNames.length > 0){
            query = "INSERT OR REPLACE INTO " + tableName + " (cid, `";
            query += fieldNames.join('`,`');
            query += '`) VALUES (' + comment.cid + ',';
    
            insertValues = [];
            
            for (j = 0; j < fieldNames.length; j++) {
                field_name = fieldNames[j];
                
                if (instances[field_name] != null) {
                    instance = instances[field_name];
    
                    value_to_insert = null;
                    if ( typeof comment[field_name] !== 'undefined') {
    
                        //Build cardinality for fields
                        if (instance.settings.cardinality == -1 || instance.settings.cardinality > 1) {
    
                            has_data = false;
    
                            for ( k = 0; k < comment[field_name].dbValues.length; k++) {
                                if (comment[field_name].dbValues[k] !== null) {
                                    has_data = true;
                                }
                            }
    
                            if (has_data) {
                                value_to_insert = JSON.stringify(comment[field_name].dbValues);
                            }
                        }
                        else if(instance.type == 'extra_price'){
                            priceTotal = 0;
                            priceData = [];
                            
                            // Add up all the prices and save the total amount
                            if(comment[field_name].dbValues.length > 0){
                                
                                for(priceIdx = 0; priceIdx < comment[field_name].dbValues.length; priceIdx ++){
                                    
                                    if(!isNaN(parseFloat(comment[field_name].dbValues[priceIdx]))){
                                        priceTotal += parseFloat(comment[field_name].dbValues[priceIdx]);
                                        
                                        try{
                                            if(typeof comment[field_name].textValues[priceIdx] !== 'undefined'){
                                                jsonValue = JSON.parse(comment[field_name].textValues[priceIdx]);
                                            }
                                            else{
                                                jsonValue = {};
                                            }
                                        }
                                        catch(exJSON){
                                            Utils.sendErrorReport("Could not parse JSON for extra_price: " + comment[field_name].textValues[priceIdx]);
                                        }
                                        if(jsonValue != null){
                                            priceData.push(jsonValue);
                                        }
                                    }
                                }
                            }
                            
                            Ti.API.error("In comment save...");
                            Ti.API.error(JSON.stringify(priceData));
                            
                            insertValues.push(priceTotal);
                            value_to_insert = JSON.stringify(priceData);
                            
                            if(priceTotal != 0){
                                nodeHasData = true;
                            }
                        }
                        else {
                            if (comment[field_name].dbValues.length == 1) {
                                value_to_insert = comment[field_name].dbValues[0];
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
    
                                insertValues.push("'" + Database.escape(value_to_insert) + "'");
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
                                    insertValues.push("'" + Database.escape(value_to_insert) + "'");
                                    nodeHasData = true;
                                }
                                break;
    
                            default:
                                
                                if(("".toString() + value_to_insert).length > 0){
                                    nodeHasData = true;    
                                }
                                
                                insertValues.push("'" + Database.escape(value_to_insert) + "'");
                                break;
                        }
                    }
                }
            }
    
            query += insertValues.join(',');
            query += ")";
            
            Ti.API.debug("QUERY: " + query);
        }
        
        Database.query(query);
        
        saved = true;
        
        Ti.API.info("Saved comment");
    }
    catch(ex){
        alert("An error occurred saving the comment. Please try again.");
        this.sendError("Exception saving the comment: " + ex);
    }
    
    Database.close();
    
    return saved;
};

Comment.prototype.viewText = function(cid){"use strict";
    var text = '';
    
    this.load(cid);
    
    if(typeof this.comment.comment_body !== 'undefined'){
        if(typeof this.comment.comment_body.dbValues !== 'undefined'){
            if(typeof this.comment.comment_body.dbValues[0] !== 'undefined'){
                text += this.comment.comment_body.dbValues[0];
            }
        }
    }
    
    return text;
};

Comment.prototype.remove = function(cid){"use strict";
    Database.query("DELETE FROM comment WHERE cid = " + cid);
    Database.close();
    
    Ti.API.debug("Deleted cid: " + cid);
};

exports.load = function(cid){"use strict";
    return getInstance().load(cid); 
};

exports.viewText = function(cid){"use strict";
    return getInstance().viewText(cid);
};

exports.save = function(comment){"use strict";
    return getInstance().save(comment);
};

exports.remove = function(cid){"use strict";
    return getInstance().remove(cid);  
};
