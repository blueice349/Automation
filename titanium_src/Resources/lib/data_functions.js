Omadi.data = Omadi.data || {};

/*jslint plusplus: true, eqeq: true*/

Omadi.data.isUpdating = function(){ "use strict";
    
    return Ti.App.Properties.getBool("isUpdating", false);
    
    // var db = Omadi.utils.openMainDatabaseOmadi.utils.openMainDatabase();
    // var res_set = db_gu.execute('SELECT updating FROM updated WHERE rowid=1');
// 
    // if (res_set.fieldByName('updating') == 1) {
        // res_set.close();
        // db_gu.close();
        // Ti.API.info("App is updating");
        // return true;
    // } 
    // else {
        // res_set.close();
        // db_gu.close();
        // Ti.API.info("App is idle");
        // return false;
    // }
};

Omadi.data.setUpdating = function(updating){ "use strict";
    Ti.App.Properties.setBool("isUpdating", updating);
};

Omadi.data.setLastUpdateTimestamp = function(sync_timestamp){ "use strict";
    
    var db = Omadi.utils.openMainDatabase();
   
    db.execute('UPDATE updated SET timestamp =' + sync_timestamp + ' WHERE rowid=1');

    db.close();

    //Ti.App.Properties.setDouble("sync_timestamp", sync_timestamp);
};

Omadi.data.getLastUpdateTimestamp = function(){ "use strict";

    var result, timestamp = 0, db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
    if(result.isValidRow()){
        timestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
    }
    result.close();
    db.close();
    
    return timestamp;
    //return Ti.App.Properties.getDouble("sync_timestamp", 0);
};

Omadi.data.getBundle = function(type){
    "use strict";
    var db, result, bundle;
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT _data, display_name FROM bundles WHERE bundle_name="' + type + '"');
    
    if(result.isValidRow()){
        bundle = {
            type: type,
            data: JSON.parse(result.fieldByName('_data')),
            label: result.fieldByName('display_name')
        };
    }
    
    result.close();
    db.close();
    
    return bundle;
};

Omadi.data.getFields = function(type){
    "use strict";
    
    var db, result, instances, field_name, nameParts;
    
    instances = {};
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT type, field_name, label, description, bundle, weight, required, widget, settings, disabled, region, fid FROM fields WHERE bundle = '" + type + "' and disabled = 0 ORDER BY weight");
    
    while(result.isValidRow()){
        field_name = result.fieldByName('field_name'); 
        instances[field_name] = {
            type: result.fieldByName('type'),
            field_name: result.fieldByName('field_name'),
            label: result.fieldByName('label'),
            description: result.fieldByName('description'),
            bundle: result.fieldByName('bundle'),
            weight: result.fieldByName('weight'),
            required: result.fieldByName('required'),
            widget: result.fieldByName('widget'),
            settings: JSON.parse(result.fieldByName('settings')),
            disabled: result.fieldByName('disabled'),
            region: result.fieldByName('region'),
            fid: result.fieldByName('fid')
        };
        
        if(typeof instances[field_name].widget === 'string'){
            instances[field_name].widget = JSON.parse(instances[field_name].widget);
        }
        
        if(field_name.indexOf("___") !== -1){
            nameParts = field_name.split("___");
            instances[field_name].part = nameParts[1];
            instances[field_name].partLabel = instances[field_name].settings.parts[nameParts[1]];
        }
        else{
            instances[field_name].part = null;
            instances[field_name].partLabel = null;
        }
        
        result.next();   
    }
    result.close();
    db.close();
    
    return instances;
};

Omadi.data.getRegions = function(type){
    "use strict";
    
    var db, result, regions, region_name;
    
    regions = {};
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT rid, node_type, label, region_name, weight, settings FROM regions WHERE node_type = '" + type + "' ORDER BY weight ASC");
    
    while(result.isValidRow()){
        region_name = result.fieldByName('region_name'); 
        regions[region_name] = {
            rid: result.fieldByName('rid'),
            node_type: result.fieldByName('node_type'),
            label: result.fieldByName('label'),
            region_name: result.fieldByName('region_name'),
            weight: result.fieldByName('weight'),
            settings: JSON.parse(result.fieldByName('settings'))
        };
        result.next();   
    }
    result.close();
    db.close();
    
    return regions;
};

function getDecodedResults(db, nid, field_name) {"use strict";
    /*global Base64*/
    var result, decoded;
    result = db.execute("SELECT encoded_array FROM array_base WHERE node_id = " + nid + " AND field_name = '" + field_name + "'");

    if (result.isValidRow()) {
        decoded = result.fieldByName('encoded_array');

        if (decoded !== null && decoded !== 'undefined' && decoded !== '') {
            //Decode the stored array:
            decoded = Base64.decode(decoded);
        }
    }
    result.close();

    return decoded.toString().split("j8Oc2s1E");
}

Omadi.data.getNewNodeNid = function(){"use strict";
    var db, result, smallestNid;
    //Get smallest nid
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT MIN(nid) FROM node");
    
    if(result.isValidRow()){
        smallestNid = result.field(0, Ti.Database.FIELD_TYPE_INT);
    
        if (smallestNid > 0) {
            smallestNid = -1;
        }
        else {
            smallestNid --;
        }
    }
    else{
        smallestNid = -1;
    }
    result.close();
    db.close();
    
    return smallestNid;
};

Omadi.data.getNodeTitle = function(node){"use strict";
    var title, bundle, index, field_name, titleValues = [], spacer = ' - ';
    
    title = "- No Title -";
    
    bundle = Omadi.data.getBundle(node.type);
    
    if(typeof bundle.data.title_fields !== 'undefined'){
        for(index in bundle.data.title_fields){
            if(bundle.data.title_fields.hasOwnProperty(index)){
                field_name = bundle.data.title_fields[index];
                if(typeof node[field_name] !== 'undefined' && typeof node[field_name].textValues !== 'undefined' && typeof node[field_name].textValues[0] !== 'undefined'){
                    titleValues.push(node[field_name].textValues[0]);
                }
            }
        }
    }
    
    if(titleValues.length > 0){
        if(typeof bundle.data.title_fields_separator !== 'undefined'){
            spacer = bundle.data.title_fields_separator;
        }
        
        title = titleValues.join(spacer);
    }
    
    return title;
};

Omadi.data.saveNode = function(node){"use strict";
    var query, field_name, field_names, instances, result, db, smallestNid, insertValues, j, k, 
        instance, value_to_insert, has_data, content_s;
        
    /*global treatArray*/
   /*jslint nomen: true*/
    node._saved = false;
    
    Ti.API.debug("STARTED SAVING NODE: " + JSON.stringify(node));
    
    instances = Omadi.data.getFields(node.type);
    
    field_names = [];
   
    for (field_name in instances){
        if(instances.hasOwnProperty(field_name)){
            if(field_name != null && typeof instances[field_name] !== 'undefined'){
                //Ti.API.debug(field_name);
                field_names.push(field_name);
            }
        }
    }
    
    
    db = Omadi.utils.openMainDatabase();
    
    //Ti.API.error(node.nid);
    //Ti.API.error(Ti.UI.currentWindow.nid);
    
    if (node.nid == 'new') {
        node.nid = Omadi.data.getNewNodeNid();
    }
    
    //else if(node.nid < 0 && Ti.UI.currentWindow.nid > 0){
    //    node.nid = Ti.UI.currentWindow.nid;
   // }
    
    node.title = Omadi.data.getNodeTitle(node);
    
    try{
        
        query = "INSERT OR REPLACE INTO " + node.type + " (nid, ";
        query += field_names.join(',');
        query += ') VALUES (' + node.nid + ',';
    
        //Values
        //title_to_node = "";
        
        insertValues = [];
        
        for ( j = 0; j <= field_names.length; j++) {
            field_name = field_names[j];
            
            if(instances[field_names[j]] != null){
                instance = instances[field_name];
                //Ti.API.debug(JSON.stringify(instance));
                
                value_to_insert = null;
                //var is_no_data = false;
                //INSERTING NO DATA FIEDLS IN ARRAY
                // if (content[j].no_data_checkbox != null && content[j].no_data_checkbox != "" && content[j].no_data_checkbox) {
                    // is_no_data = true;
                    // if (content[j].noDataView != null) {
                        // var fieldName = content[j].field_name;
                        // if (content[j].partsArr != null && content[j].partsArr.length > 0) {
                            // fieldName = fieldName.split('___');
                            // fieldName = fieldName[0];
                        // }
                        // no_data_fields.push(fieldName);
                    // }
                // }
    
                //If it is a composed field, just insert the number
                
                
                if(typeof node[field_name] !== 'undefined'){
                
                    //Build cardinality for fields
                    if (instance.settings.cardinality == -1 || instance.settings.cardinality > 1) {
                        
                        has_data = false;
                        
                        for(k = 0; k < node[field_name].dbValues.length; k ++){
                            if(node[field_name].dbValues[k] > ""){
                                has_data = true;
                            }
                        }
                        
                        if(has_data){
                            //Treat the array
                            content_s = treatArray(node[field_name].dbValues, 6);
                            
                            //Ti.API.info("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + win.nid + ", \"" + content[j].field_name + "\",  \"" + content_s + "\" )");
                            db.execute("INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( " + node.nid + ", \"" + field_name + "\",  \"" + content_s + "\" )");
                          
                            // Code must to be a number since this database field accepts only integers numbers
                            // Token to indentify array of numbers is 7411317618171051229
                            value_to_insert = '7411317618171051229';
                        }
                        //}
                    }
                    else{ //} if (!is_no_data) {
                        //Ti.API.info("value: " + JSON.stringify(node[field_name].dbValues));
                        if(node[field_name].dbValues.length == 1){
                            
                            value_to_insert = node[field_name].dbValues.pop();
                        }
                       
                    }
                }
                
                 
                
                if(value_to_insert === null){
                    insertValues.push('null');
                }
                else{
                    //Ti.API.debug(value_to_insert);
                    switch(instance.type){
                        
                        case 'user_reference':
                        case 'taxonomy_term_reference':
                        case 'omadi_reference':
                        case 'datestamp':
                        case 'omadi_time':
                        case 'auto_increment':
                        case 'image':
                            
                            if(Omadi.utils.isEmpty(value_to_insert)){
                                value_to_insert = "null";
                            }
                            
                            insertValues.push(value_to_insert);
                            break;    
                        
                        case 'number_decimal':
                        case 'number_integer':
                        case 'list_boolean':
                        case 'calculation_field':
                        
                            if(Omadi.utils.isEmpty(value_to_insert) && value_to_insert != 0){
                                insertValues.push('null');
                            }
                            else{
                                //Ti.API.error(instance.field_name + ": " + value_to_insert);
                                insertValues.push('"' + value_to_insert + '"');
                            }
                            break;
                         
                        default:
                            
                            insertValues.push('"' + value_to_insert.replace('"', "'") + '"');
                            break;
                    }
                }
            }
        }
        
        //Ti.API.debug(JSON.stringify(node));
        
        query += insertValues.join(',');
        query += ")";  
    
    
        Ti.API.error(query);
        
        db.execute(query);
        
        try{
            if (node._isDraft) {
                if (node.nid > 0) {
                    db.execute('UPDATE node SET changed="' + node.changed + '", changed_uid=' + node.changed_uid + ', title="' + node.title + '" , flag_is_updated=3, table_name="' + node.type + '", form_part =' + node.form_part + ', no_data_fields=\'' + node.no_data + '\', viewed=\'1\' WHERE nid=' + node.nid);
                }
                else {
                    db.execute('INSERT INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name , form_part, no_data_fields, viewed ) VALUES (' + node.nid + ', ' + node.created + ', ' + node.changed + ', "' + node.title + '" , ' + node.author_uid + ',' + node.changed_uid + ', 3 , "' + node.type + '", ' + node.form_part + ', \'' + node.no_data + '\', \'1\')');
        
                }
            }
            else if (node.nid > 0) {
               // Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ', no_data_fields=\'' + no_data_fields_content + '\' WHERE nid=' + win.nid);
                db.execute('UPDATE node SET changed="' + node.changed + '", changed_uid=' + node.changed_uid + ', title="' + node.title + '" , flag_is_updated=1, table_name="' + node.type + '", form_part =' + node.form_part + ', no_data_fields=\'' + node.no_data + '\', viewed=\'1\' WHERE nid=' + node.nid);
            }
            else {
                //Ti.API.info('INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, no_data_fields ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '", ' + win.region_form + ', \'' + no_data_fields_content + '\')');
                db.execute('INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed) VALUES (' + node.nid + ', ' + node.created + ', ' + node.changed + ', "' + node.title + '" , ' + node.author_uid + ',' + node.changed_uid + ', 1 , "' + node.type + '"  , ' + node.form_part + ', \'' + node.no_data + '\', \'1\')');
            }
            
            db.execute('UPDATE _photos SET nid=' + node.nid + ' WHERE nid = 0');
            
            node._saved = true;
            Ti.API.debug("NODE SAVE WAS SUCCESSFUL");
        }
        catch(ex1){
            alert("Error saving to the node table: " + ex1);
            db.execute("DELETE FROM " + node.type + " WHERE nid = " + node.nid);
        }
        
    }
    catch(ex2){
        alert("Error saving to " + node.type + " table: " + ex2 + " : " + query);
        //TODO: send the error to the server for analysis
    }
    
    //if (title_to_node == "") {
    //    title_to_node = "No title";
    //}

    //No data fields JSON
    //no_data_fields_content = '';
    
    // for ( idx_k = 0; idx_k < no_data_fields.length; idx_k++) {
        // if (idx_k == no_data_fields.length - 1) {
            // no_data_fields_content += '\"' + no_data_fields[idx_k] + '\" : \"' + no_data_fields[idx_k] + '\"';
        // }
        // else {
            // no_data_fields_content += '\"' + no_data_fields[idx_k] + '\" : \"' + no_data_fields[idx_k] + '\",';
        // }
    // }
    // if (no_data_fields_content != null && no_data_fields_content != '') {
        // no_data_fields_content = "{" + no_data_fields_content + "}"

    
    db.close();
    
    return node;
};

Omadi.data.deletePhotoUpload = function(id){"use strict";
    var db = Omadi.utils.openMainDatabase();
    db.execute("DELETE FROM _photos WHERE id = " + id);s
    db.close();
};

function loadNode(nid) {"use strict";
    /*global display_omadi_time01,timeConverter*/

    var db, node, result, subResult, field_name, dbValue, tempDBValues, textValue, subValue, decoded, i, real_field_name, part, field_parts, widget, instances;
    
    node = {
        form_part: 0
    };
    
    if(parseInt(nid, 10) != 0){
        db = Omadi.utils.openMainDatabase();
        
    
        result = db.execute('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed FROM node WHERE  nid = ' + nid);
    
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
        }
        result.close();
        
        
        instances = Omadi.data.getFields(node.table_name);
    
        if ( typeof node.nid !== 'undefined') {
    
            result = db.execute("SELECT * FROM " + node.table_name + " WHERE nid = " + node.nid);
            if (result.isValidRow()) {
                for (field_name in instances) {
                    if (instances.hasOwnProperty(field_name)) {
    
                        dbValue = result.fieldByName(field_name, Ti.Database.FIELD_TYPE_STRING); 
                        
                        //Ti.API.error(field_name + ": " + dbValue);
    
                        //Ti.API.info("INPUT FIELD NAME: " + field_name);
    
                        node[field_name] = {};
                        node[field_name].textValues = [];
                        node[field_name].dbValues = [];
    
                        if (dbValue === '7411317618171051229' || dbValue === 7411317618171051229) {
    
                            node[field_name].dbValues = getDecodedResults(db, node.nid, field_name);
                            
                            switch(instances[field_name].type){
                                case 'image':
                                case 'omadi_reference':
                                case 'user_reference':
                                case 'taxonomy_term_reference':
                                case 'file':
                                case 'datestamp':
                                case 'omadi_time':
                                
                                    tempDBValues = [];
                                    for(i = 0; i < node[field_name].dbValues.length; i ++){
                                        if(!Omadi.utils.isEmpty(node[field_name].dbValues[i])){
                                            tempDBValues.push(parseInt(node[field_name].dbValues[i], 10));
                                        }
                                    }
                                    
                                    node[field_name].dbValues = tempDBValues;
                                    break;
                            }
                        }
                        else {
                            /**
                             * This takes care of all multi-part fields:
                             * location
                             * license_plate
                             * vehicle_fields
                             */
                            if (field_name.indexOf("___") !== -1) {
                                field_parts = field_name.split("___");
                                real_field_name = field_parts[0];
                                part = field_parts[1];
    
                                if ( typeof node[real_field_name] === 'undefined') {
                                    node[real_field_name] = {};
                                    node[real_field_name].label = instances[field_name].label;
                                    node[real_field_name].parts = {};
                                    node[real_field_name].dbValues = [];
                                    // Just make sure one and only one value gets saved to the expanded fieldname so it gets displayed once
                                    //node[field_name].dbValues.push("Parts Field");
                                }
    
                                if (dbValue === null) {
                                    dbValue = "";
                                }
    
                                node[real_field_name].parts[part] = {
                                    label : instances[field_name].settings.parts[part],
                                    textValue : dbValue
                                };
                                //Ti.API.info('HERE HERE: ' + field_name + " " + real_field_name + " " + dbValue);
                                node[real_field_name].dbValues.push(dbValue);
                                node[field_name].dbValues.push(dbValue);
                            }
                            else {
                                
                                switch(instances[field_name].type){
                                    case 'image':
                                    case 'omadi_reference':
                                    case 'user_reference':
                                    case 'taxonomy_term_reference':
                                    case 'file':
                                    case 'datestamp':
                                    case 'omadi_time':
                                        if(!Omadi.utils.isEmpty(dbValue)){
                                            dbValue = parseInt(dbValue, 10);
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                        
                                        break;
                                        
                                    case 'number_integer':
                                    case 'list_boolean':
                                    case 'auto_increment':
                                        if(!Omadi.utils.isEmpty(dbValue) || dbValue === "0"){
                                            dbValue = parseInt(dbValue, 10);
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                       
                                        break;
                                    
                                    
                                    case 'number_decimal':
                                    
                                        //Ti.API.error("CRAPPPPP: " + dbValue);
                                        
                                        if(!Omadi.utils.isEmpty(dbValue) || dbValue === "0"){
                                            dbValue = parseFloat(dbValue);
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                        
                                        
                                        break;
                                        
                                    case 'calculation_field':
                                        
                                        node[field_name].origValues = [];
                                        if(!Omadi.utils.isEmpty(dbValue) || dbValue === "0"){
                                            dbValue = parseFloat(dbValue);
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                        
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
    
                                subResult = db.execute('SELECT uid, realname FROM user WHERE uid IN(' + node[field_name].dbValues.join(',') + ')');
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
    
                                subResult = db.execute('SELECT name, tid FROM term_data WHERE tid IN(' + node[field_name].dbValues.join(',') + ')');
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
    
                            case 'omadi_reference':
                                subResult = db.execute('SELECT title, table_name, nid FROM node WHERE nid IN(' + node[field_name].dbValues.join(',') + ')');
                                node[field_name].nodeTypes = [];
    
                                while (subResult.isValidRow()) {
                                    textValue = subResult.fieldByName("title");
                                    subValue = subResult.fieldByName("nid");
    
                                    for ( i = 0; i < node[field_name].dbValues.length; i ++) {
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
    
                                for ( i = 0; i < node[field_name].dbValues.length; i ++) {
                                    node[field_name].textValues[i] = display_omadi_time01(node[field_name].dbValues[i]);
                                }
                                break;
    
                            case 'datestamp':
                                for ( i = 0; i < node[field_name].dbValues.length; i ++) {
                                    if (!Omadi.utils.isEmpty(node[field_name].dbValues[i])){
                                        node[field_name].dbValues[i] = parseInt(node[field_name].dbValues[i], 10);
                                        node[field_name].textValues[i] = Omadi.utils.formatDate(node[field_name].dbValues[i], instances[field_name].settings.time);
                                    }
                                    else{
                                        node[field_name].dbValues[i] = null;
                                    }
                                }
    
                                break;
    
                            case 'image':
                                subResult = db.execute('SELECT * FROM _photos WHERE nid=' + node.nid + ' AND field_name ="' + field_name + '" ORDER BY delta ASC');
    
                                node[field_name].imageData = [];
                                if (subResult.rowCount > 0) {
                                    while (subResult.isValidRow()) {
                                        //isUpdated[val.fieldByName('delta')] = true;
                                        node[field_name].imageData.push(Ti.Utils.base64decode(subResult.fieldByName('file_data')));
                                        subResult.next();
                                    }
                                }
                                subResult.close();
                                break;
                                
                            case 'calculation_field':
                                // The text value is used to store the original value for comparison
                                // A little hackish, but there is no other use for a text value in calculation_fields
                                for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                    
                                    node[field_name].textValues[i] = node[field_name].dbValues[i];
                                }
    
                        }
                    }
                }
            }
            result.close();
        }
    
        db.close();
    }

    return node;
}


Omadi.data.getNodeTableInsertStatement = function(node) {"use strict";

    var sql = 'INSERT OR REPLACE INTO node (nid, perm_edit, perm_delete, created, changed, title, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed) VALUES (';

    sql += node.nid;
    sql += ',' + node.perm_edit;
    sql += ',' + node.perm_delete;
    sql += ',' + node.created;
    sql += ',' + node.changed;
    sql += ',"' + node.title.replace(/"/g, "'") + '"';
    sql += ',' + node.author_uid;
    sql += ',' + node.flag_is_updated;
    sql += ',"' + node.table_name + '"';
    sql += ',' + node.form_part;
    sql += ',' + node.changed_uid;
    sql += ',\'' + node.no_data_fields + '\'';
    sql += ',\'' + node.viewed + '\'';

    sql += ')';


    // if (node.table_name == 'notification' && node.viewed == 0) {
        // Ti.API.debug("A notification was added");
        // //newNotificationCount++;
        // //newNotificationNid = node.nid;
    // }

    return sql;
    //json[obj].insert[i].nid + ', '+ json[obj].insert[i].perm_edit + ', '+ json[obj].insert[i].perm_delete + ', ' +
    //json[obj].insert[i].created + ' , ' + json[obj].insert[i].changed + ', "' + json[obj].insert[i].title.replace(/"/gi, "'") + '" , ' +
    //json[obj].insert[i].author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert[i].form_part + ',' + json[obj].insert[i].changed_uid + ',\'' + no_data + '\', \'' + json[obj].insert[i].viewed + '\') ';
};

Omadi.data.processVehicleJson = function(json, mainDB, progress){"use strict";
    try{
        if (json) {
            var queries = [], i;
         
            if ( json instanceof Array) {
                for (i in json) {
                    if(json.hasOwnProperty(i)){
                        queries.push("INSERT OR REPLACE INTO _vehicles (make, model) VALUES ('" + json[i][0] + "', '" + json[i][1] + "' )");
                    }
                }
            }
    
            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for(i = 0; i < queries.length; i ++){
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }
    }
    catch(ex){
        alert("Inserting vehicles: " + ex);
    }
};

Omadi.data.processFieldsJson = function(json, mainDB, progress){ "use strict";
    /*global PLATFORM*/
    var result, fid, field_exists, field_type, db_type, field_name, label, widgetString, settingsString, region, i, part, queries, description, bundle, weight, required, disabled;
    try{
        queries = [];
    
        if (json.insert) {

            if (json.insert.length) {

                for ( i = 0; i < json.insert.length; i++) {
                    
                    if (progress != null) {
                        progress.set();
                    }

                    widgetString = JSON.stringify(json.insert[i].widget).replace(/'/gi, '"');
                    
                    settingsString = JSON.stringify(json.insert[i].settings).replace(/'/gi, '"');
    
                    fid = json.insert[i].fid;
    
                    if (json.insert[i].type != null){
                        field_type = json.insert[i].type.replace(/'/gi, '"');
                    }
                    else{
                        field_type = "";
                    }
    
                    if (json.insert[i].field_name != null){
                        field_name = json.insert[i].field_name.replace(/'/gi, '"');
                    }
                    else{
                        field_name = "";
                    }
    
                    if (json.insert[i].label != null){
                        label = json.insert[i].label.replace(/'/gi, '"');
                    }
                    else{
                        label = "";
                    }
                    
                    if (json.insert[i].description != null){
                        description = json.insert[i].description.replace(/'/gi, '"');
                    }
                    else{
                        description = "";
                    }
    
                    if (json.insert[i].bundle != null){
                        bundle = json.insert[i].bundle.replace(/'/gi, '"');
                    }
                    else{
                        bundle = "";
                    }
    
                    if (json.insert[i].weight != null){
                        weight = json.insert[i].weight;
                    }
                    else{
                        weight = 0;
                    }
    
                    if (json.insert[i].required != null){
                        required = json.insert[i].required;
                    }
                    else{
                        required = 0;
                    }
    
                    if (json.insert[i].disabled != null){
                        disabled = json.insert[i].disabled;
                    }
                    else{
                        disabled = 0;
                    }
                    
                    if(json.insert[i].settings.region){
                        region = json.insert[i].settings.region;
                    }
                    else{
                        region = "";
                    }
                    
                    
                    result = mainDB.execute('SELECT COUNT(*) FROM fields WHERE fid = ' + fid);

                    field_exists = false;
                    if(result.field(0, Ti.Database.FIELD_TYPE_INT) > 0){
                        field_exists = true;
                    }
                    
                    result.close();

                    if (!field_exists) {
        
        
                        //switch(json.insert[i].type) {
                        //    // case "taxonomy_term_reference":
                            // case "user_reference":
                            // case "datestamp":
                            // case "omadi_time":
                            // case "number_integer":
                            // case "omadi_reference":
                            // case "list_boolean":
                                // if(PLATFORM === 'android'){
                                    // db_type = "INTEGER";
                                // }
                                // else{
                                    // db_type = 'TEXT';
                                // }
                                // break;
//         
                            // case "number_decimal":
                                // db_type = "REAL";
                                // break;
        
                            //default:
                                db_type = "TEXT";
                            //    break;
                       // }
        
                        //Check if it is a valid bundle (automatically inserted through the API):
                        result = mainDB.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
                        if (result.isValidRow()) {
                            if (json.insert[i].settings.parts) {
                                for (part in json.insert[i].settings.parts) {
                                    if(json.insert[i].settings.parts.hasOwnProperty(part)){
                                        queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + part + '\' ' + db_type);
                                    }
                                }
                            }
                            else {
                                if (json.insert[i].type == 'image') {
                                    queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + db_type);
                                    queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + db_type);
                                }
                                if (json.insert[i].type == 'file') {
                                    queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___fid' + '\' ' + db_type);
                                    queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___filename' + '\' ' + db_type);
                                }
        
                                queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + db_type);
                            }
                        }
                        else {
                            Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
                        }
                        result.close();
                        
                        //Multiple parts
                        if (json.insert[i].settings.parts) {
                            for (part in json.insert[i].settings.parts) {
                                if(json.insert[i].settings.parts.hasOwnProperty(part)){
                                    queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + field_type + "','" + field_name + "___" + part + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widgetString + "','" + settingsString + "' )");
                                }
                            }
                        }
                        //Normal field
                        else {
                            queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + field_type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widgetString + "','" + settingsString + "' )");
                        }
                        
                    }
                    else {
                        // The structure exists.... just update the fields table values
                        // This will work for fields with parts, as they are indexed by the same fid
                        queries.push("UPDATE fields SET type='" + field_type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widgetString + "', settings='" + settingsString + "'  WHERE fid=" + fid);
                    }
                }
            }
        }  
        
        if (json["delete"]) {
            if (json["delete"].length) {
                for (i = 0; i < json["delete"].length; i++) {
                    //Ti.API.info('FID: ' + json["delete"][i].fid + ' was deleted');
                    //Deletes rows from terms
                    queries.push('DELETE FROM fields WHERE fid=' + json["delete"][i].fid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for(i = 0; i < queries.length; i ++){
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }
    }
    catch(ex){
        alert("Saving fields: " + ex);
    }
};


Omadi.data.processUsersJson = function(json, mainDB, progress){"use strict";
    var i, j, queries;
    
    try{

        queries = [];

        //Insert - Users
        if (json.insert) {
            if (json.insert.length) {
                for ( i = 0; i < json.insert.length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }
             
                    queries.push('INSERT OR REPLACE  INTO user (uid, username, mail, realname, status ) VALUES (' + json.insert[i].uid + ',"' + json.insert[i].username + '","' + json.insert[i].mail + '","' + json.insert[i].realname + '",' + json.insert[i].status + ')');

                    if (json.insert[i].roles.length) {
                        for ( j = 0; j < json.insert[i].roles.length; j++) {
                            queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.insert[i].uid + ',' + json.insert[i].roles[j] + ')');
                        }
                    }
                    else {
                        queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.insert[i].uid + ',' + json.insert[i].roles + ')');
                    }
                }
            }
        }

        //Update - Users
        if (json.update) {
            if (json.update.length) {
                for ( i = 0; i < json.update.length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }
                    queries.push('UPDATE user SET "username"="' + json.update[i].username + '" , "mail"="' + json.update[i].mail + '", "realname"="' + json.update[i].realname + '", "status"=' + json.update[i].status + ' WHERE "uid"=' + json.update[i].uid);

                    //Delete every row present at user_roles
                    queries.push('DELETE FROM user_roles WHERE "uid"=' + json.update[i].uid);

                    //Insert it over again!
                    if (json.update[i].roles) {
                        if (json.update[i].roles.length) {
                            for ( j = 0; j < json.update[i].roles.length; j++) {
                                queries.push('INSERT OR REPLACE INTO user_roles (uid, rid ) VALUES (' + json.update[i].uid + ',' + json.update[i].roles[j] + ')');
                            }
                        }
                        else {
                            queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.update[i].uid + ',' + json.update[i].roles + ')');
                        }
                    }
                }
            }
        }

        //Delete - Users
        if (json["delete"]) {
            if (json["delete"].length) {
                for ( i = 0; i < json["delete"].length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }

                    //Deletes current row (contact)
                    queries.push('DELETE FROM user WHERE "uid"=' + json["delete"][i].uid);
                    queries.push('DELETE FROM user_roles WHERE "uid"=' + json["delete"][i].uid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for(i = 0; i < queries.length; i ++){
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }

    }  
    catch(ex){
        alert("Installing Users: " + ex);
    }
};


Omadi.data.processNodeJson = function(json, type, mainDB, progress) { "use strict";
    /*jslint nomen: true*/
    /*global treatArray, isNumber*/

    var closeDB, instances, queries, i, field_name, query, fieldNames, no_data, values, value, notifications = {};
    closeDB = false;
    queries = [];
     
    try{
       
        instances = Omadi.data.getFields(type);
       
        //Insert
        if (json.insert) {
            
            Ti.API.debug("inserting " + type + " nodes");
    
            //Multiple objects
            if (json.insert.length) {
                
                for ( i = 0; i < json.insert.length; i++) {
                    
                    //Ti.API.debug("node #" + i);
                    
                    // Original query
                    //var aux_column = ind_column;
                    
                    Titanium.App.Properties.setString("new_node_id", json.insert[i].nid);
                    
                    //Insert into node table
                    if ((json.insert[i].title === null) || (json.insert[i].title == 'undefined') || (json.insert[i].title === false)){
                        json.insert[i].title = "No Title";
                    }
    
                    //'update' is a flag to decide whether the node needs to be synced to the server or not
                    no_data = '';
                    if (!(json.insert[i].no_data_fields instanceof Array)) {
                        no_data = JSON.stringify(json.insert[i].no_data_fields);
                    }
    
                    queries.push(Omadi.data.getNodeTableInsertStatement({
                        nid : json.insert[i].nid,
                        perm_edit : json.insert[i].perm_edit,
                        perm_delete : json.insert[i].perm_delete,
                        created : json.insert[i].created,
                        changed : json.insert[i].changed,
                        title : json.insert[i].title.replace(/"/gi, "'"),
                        author_uid : json.insert[i].author_uid,
                        flag_is_updated : 0,
                        table_name : type,
                        form_part : json.insert[i].form_part,
                        changed_uid : json.insert[i].changed_uid,
                        no_data_fields : no_data,
                        viewed : json.insert[i].viewed
                    }));
    
                    query = 'INSERT OR REPLACE  INTO ' + type + ' (nid, ';
                    
                    fieldNames = [];
                    for(field_name in instances){
                        if(instances.hasOwnProperty(field_name)){
                            fieldNames.push("`" + field_name + "`");
                        }
                    }
                    
                    query += fieldNames.join(',');
                    query += ') VALUES (' + json.insert[i].nid + ',';
                    
                    values = [];
                    
                    for(field_name in instances){
                        if(instances.hasOwnProperty(field_name)){
                            if ((json.insert[i][field_name] == null ) || (json.insert[i][field_name] == "undefined" )) {
                                values.push("null");
                            }
                            else{
                                
                                switch(instances[field_name].type){
                                    case 'number_integer':
                                    case 'number_decimal':
                                    case 'omadi_reference':
                                    case 'taxonomy_term_reference':
                                    case 'user_reference':
                                    case 'list_boolean':
                                    case 'datestamp':
                                    case 'omadi_time':
                                    case 'image':
                                        value = json.insert[i][field_name];
                                        
                                        if (typeof value === 'number') {
                                            values.push(value);
                                        }
                                        else if(typeof value === 'string'){
                                            value = parseInt(value, 10);
                                            if(isNaN(value)){
                                                values.push('null');
                                            }
                                            else{
                                                values.push(value);
                                            }
                                        }
                                        else if ( value instanceof Array) {
                                            value = treatArray(value, 1);
        
                                            // table structure:
                                            // incremental, node_id, field_name, value
                                            queries.push('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json.insert[i].nid + ', \'' + field_name + '\',  \'' + value + '\' )');
                                           
                                            // Code must to be a number since this database field accepts only integers numbers
                                            // Token to indentify array of numbers is 7411176117105122
                                            values.push("7411317618171051229");
                                        }
                                        else {
                                            
                                            values.push("null");
                                        }
                                        break;
                                        
                                    default:
                                        value = json.insert[i][field_name];
                                        
                                        if (value instanceof Array) {
                                            if (instances[field_name].type === 'rules_field') {
                                                values.push('"' + JSON.stringify(value).replace(/"/gi, "\"\"") + '"');
                                            }
                                            else {
                                                value = treatArray(value, 2);
        
                                                // table structure:
                                                // incremental, node_id, field_name, value
                                                queries.push('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json.insert[i].nid + ', \'' + field_name + '\',  \'' + value + '\' )');
                                                
                                                // Code must to be a number since this database field accepts only integers numbers
                                                // Token to indentify array of numbers is 7411176117105122
                                                values.push('"7411317618171051229"');
        
                                            }
                                        }
                                        else {
                                            values.push('"' + value.toString().replace(/"/gi, "'") + '"');
                                        }
                                        
                                        break;
                                }
                            }
                        }
                    }
                    
                    query += values.join(",");
                    query += ')';
                    
                    //Ti.API.debug(query);
                     
                    queries.push(query);
                    
                    
                    if(type == 'notification' && json.insert[i].viewed == 0){
                        notifications = Ti.App.Properties.getObject('newNotifications', {
                            count: 0,
                            nid: 0
                        });
                        
                        Ti.App.Properties.setObject('newNotifications', {
                            count: notifications.count + 1,
                            nid: json.insert[i].nid
                        });
                    }
                    
                    if(typeof json.insert[i].__negative_nid !== 'undefined'){
                        Ti.API.debug("Deleting nid: " + json.insert[i].__negative_nid);
                        
                        queries.push('DELETE FROM ' + type + ' WHERE nid=' + json.insert[i].__negative_nid);
                        queries.push('DELETE FROM node WHERE nid=' + json.insert[i].__negative_nid);
                        
                        queries.push("UPDATE _photos SET nid =" + json.insert[i].nid + " WHERE nid=" + json.insert[i].__negative_nid);
                        
                        
                        // Make sure we don't add a duplicate from doing a next_part action directly after a node save
                        //if(typeof Ti.UI.currentWindow.nid !== 'undefined' && Ti.UI.currentWindow.nid == json.insert[i].__negative_nid){
                        //    Ti.API.error("SWITCHING UP THE NID from " + json.insert[i].__negative_nid + " to " + json.insert[i].nid);
                            
                            Ti.App.fireEvent('switchedItUp', {
                                negativeNid: json.insert[i].__negative_nid,
                                positiveNid: json.insert[i].nid
                            });
                            
                            
                            //Ti.UI.currentWindow.nid = json.insert[i].nid;
                            //Ti.UI.currentWindow.node = loadNode(json.insert[i].nid);
                        //}
                        //Ti.fire negativeNodesSavedFromServer';
                        //Ti.API.fireEvent('negativeNodesSavedFromServer', {
                        //   negativeNid: json.insert[i].__negative_nid,
                        //   positiveNid: json.insert[i].nid
                        //});
                        
                    } 
                }
            }
        }
    
    
        if(typeof mainDB === 'undefined'){
            mainDB = Omadi.utils.openMainDatabase();
            closeDB = true;
        }
        //mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
        
        mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
        for(i = 0; i < queries.length; i ++){
            mainDB.execute(queries[i]);
        }
        
        mainDB.execute("COMMIT TRANSACTION");
        
        if(progress != null && typeof json.insert != 'undefined'){
            for(i = 0; i < json.insert.length; i ++){
                progress.set();
            }
        }
        //mainDB.execute("COMMIT TRANSACTION");

    }
    catch(ex){
        Ti.API.error("Saving Node Data from JSON: " + ex);
        alert("Saving Form Data: " + ex);
    }
    finally{
        if(closeDB){
            mainDB.close();
        }
    }

};


Omadi.data.processVocabulariesJson = function(json, mainDB, progress){"use strict";
    var queries = [], i, vid, name, machine_name;
    try{
        
        if (json.insert) {
            if (json.insert.length) {
              
                for ( i = 0; i < json.insert.length; i++) {
                    //Increment Progress Bar
                    if (progress != null) {
                        progress.set();
                    }
                    vid = json.insert[i].vid;
                    name = json.insert[i].name;
                    machine_name = json.insert[i].machine_name;

                    if (name == null){
                        name = "null";
                    }
                    if (machine_name == null){
                        machine_name = "";
                    }
                    //Ti.API.info("About to insert vocabulary: "+vid_v);
                    queries.push('INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid + ',"' + name + '","' + machine_name + '")');
                }
            }
        }
        if (json.update) {
            if (json.update.length) {
                for ( i = 0; i < json.update.length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }

                    //Ti.API.info("About to update vocabulary: "+json.update[i].vid);
                    queries.push('UPDATE vocabulary SET "name"="' + json.update[i].name + '", "machine_name"="' + json.update[i].machine_name + '" WHERE "vid"=' + json.update[i].vid);
                }
            }
        }
        if (json["delete"]) {
            if (json["delete"].length) {
               
                for ( i = 0; i < json["delete"].length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }

                    //Deletes rows from terms
                    queries.push('DELETE FROM term_data WHERE "vid"=' + json["delete"][i].vid);

                    //Deletes corresponding rows in vocabulary
                    queries.push('DELETE FROM vocabulary WHERE "vid"=' + json["delete"][i].vid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for(i = 0; i < queries.length; i ++){
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");

        }
    }
    catch(ex){
        alert("Installing vocabularies: " + ex);
    }
};

Omadi.data.processRegionsJson = function(json, mainDB, progress){"use strict";
    var i, queries, settings;
    
    try{
        queries = [];

        //Insert - Regions
        if (json.insert) {
            if (json.insert.length) {
                for ( i = 0; i < json.insert.length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }

                    //Encode:
                    settings = JSON.stringify(json.insert[i].settings);

                    if (settings != null){
                        settings = settings.replace(/'/gi, '"');
                    }
                    else{
                        settings = "";
                    }

                    queries.push('INSERT OR REPLACE INTO regions (rid, node_type, label, region_name, weight, settings ) VALUES (' + json.insert[i].rid + ', \'' + json.insert[i].node_type + '\' , \'' + json.insert[i].label + '\', \'' + json.insert[i].region_name + '\' , ' + json.insert[i].weight + ', \'' + settings + '\' )');
                }
            }
        }

        //Update - Regions
        if (json.update) {
            if (json.update.length) {
                for ( i = 0; i < json.update.length; i++) {
                    if (progress != null) {
                        progress.set();
                    }
                    queries.push('UPDATE regions SET \'node_type\'=\'' + json.update[i].node_type + '\' , \'label\'=\'' + json.update[i].label + '\', \'region_name\'=\'' + json.update[i].region_name + '\', \'weight\'=' + json.update[i].weight + ', \'settings\'=\'' + json.update[i].settings + '\' WHERE \'rid\'=' + json.update[i].rid);
                }
            }
        }

        //Delete - Regions
        if (json["delete"]) {
            if (json["delete"].length) {
                for ( i = 0; i < json["delete"].length; i++) {
                    if (progress != null) {
                        progress.set();
                    }
                    queries.push('DELETE FROM regions WHERE "rid"=' + json["delete"][i].rid);
                }
            }
        }

        if (queries.length > 0) {
            
            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for(i = 0; i < queries.length; i ++){
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }
    }
    catch(ex){
        alert("Installing regions: " + ex);
    }
};

Omadi.data.processTermsJson = function(json, mainDB, progress){ "use strict";
    /*jslint nomen: true*/
    var i, vid, tid, name, desc, weight, queries;
    
    try{
        queries = [];

        if (json.insert) {
            if (json.insert.length) {
                
                for ( i = 0; i < json.insert.length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }

                    vid = json.insert[i].vid;
                    tid = json.insert[i].tid;
                    name = json.insert[i].name;
                    desc = json.insert[i].description;
                    weight = json.insert[i].weight;

                    if (desc == null){
                        desc = "";
                    }
                    if (name == null){
                        name = "";
                    }
                    if (weight == null){
                        weight = 0;
                    }

                    queries.push('INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid + ',' + vid + ',"' + name + '","' + desc + '","' + weight + '")');
                    if(typeof json.insert[i].__negative_tid !== 'undefined'){
                        queries.push('DELETE FROM term_data WHERE tid=' + json.insert[i].__negative_tid);
                    }
                }
            }
        }
        if (json.update) {
            if (json.update.length) {
                for ( i = 0; i < json.update.length; i++) {

                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }
                    queries.push('UPDATE term_data SET "name"="' + json.update[i].name + '", "description"="' + json.update[i].description + '",  "weight"="' + json.update[i].weight + '", "vid"=' + json.update[i].vid + '  WHERE "tid"=' + json.update[i].tid);
                }
            }
        }
        if (json["delete"]) {
            if (json["delete"].length) {
                for ( i = 0; i < json["delete"].length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }
                    queries.push('DELETE FROM term_data WHERE "tid"=' + json["delete"][i].tid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for(i = 0; i < queries.length; i ++){
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }
    }
    catch(ex){
        alert("Installing terms: " + ex);
    }
};


Omadi.data.processNodeTypeJson = function(json, mainDB, progress){ "use strict";
    /*global ROLE_ID_ADMIN */
    var node_db, roles, i, type, perm_idx, role_idx, bundle_result, app_permissions, title_fields, data, display, description, display_on_menu, disabled, is_disabled, permission_string;
    try{
        //Node types creation:
        node_db = [];
        
        roles = Ti.App.Properties.getObject("userRoles", {});
        
        //Node type inserts
        if (json.insert) {
            //Multiple nodes inserts
            if (json.insert.length) {

                for (i = 0; i < json.insert.length; i++) {
                    type = json.insert[i].type;
                    
                    if (type != 'user') {
                        //Increment the progress bar
                        if (progress != null) {
                            progress.set();
                        }
                        
                        bundle_result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name = '" + type + "'");
                        if(bundle_result.field(0, Ti.Database.FIELD_TYPE_INT) === 0){
                            node_db[node_db.length] = "CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )";
                        }
                   
                        title_fields = json.insert[i].data.title_fields;
                        data = json.insert[i].data;
                        display = json.insert[i].name.toUpperCase();//n_bund.fieldByName("display_name").toUpperCase();
                        description = json.insert[i].description;//n_bund.fieldByName("description");
                        display_on_menu = false;
                        disabled = json.insert[i].disabled;
                        is_disabled = (disabled == 1 ? true : false); //n_bund.fieldByName("disabled");
                       
                        app_permissions = {
                            can_create : false,
                            can_update : false,
                            all_permissions : false,
                            can_view : false
                        };
    
                        //var node_type_json = JSON.parse(_nd);
    
                        if (data.no_mobile_display != null && data.no_mobile_display == 1) {
                            //n_bund.next();
                            //continue;
                            is_disabled = true;
                        }
                        
                        if(typeof roles !== 'undefined'){
                          
                            if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
                                app_permissions.can_create = true;
                                app_permissions.all_permissions = true;
                                app_permissions.can_update = true;
                                app_permissions.can_view = true;
                            }
                            else {
                                
                                for (perm_idx in data.permissions) {
                                    if(data.permissions.hasOwnProperty(perm_idx)){
                                        for (role_idx in roles) {
                                            if(roles.hasOwnProperty(role_idx)){
                                                if (perm_idx == role_idx) {
                                                    
                                                    //Ti.API.error(data.permissions[perm_idx]);
                                                    permission_string = JSON.stringify(data.permissions[perm_idx]);
                                                    
                                                    if (data.permissions[perm_idx].all_permissions) {
                                                        app_permissions.all_permissions = true;
                                                        app_permissions.can_update = true;
                                                        app_permissions.can_view = true;
                                                    }
                                                    else{
                                                        if (data.permissions[perm_idx]["can create"]) {
                                                            app_permissions.can_create = true;
                                                        }
                    
                                                        if (permission_string.indexOf('update') >= 0 || data.permissions[perm_idx].all_permissions) {
                                                            app_permissions.can_update = true;
                                                        }
                    
                                                        if (permission_string.indexOf('view') >= 0 || data.permissions[perm_idx].all_permissions) {
                                                            app_permissions.can_view = true;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        if(!is_disabled && (app_permissions.can_view || app_permissions.can_create)){
                            display_on_menu = true;
                        }
                        
                        node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data , disabled, display_on_menu) VALUES ('" + type + "', '" + display + "' , '" + description + "', '" + JSON.stringify(title_fields) + "', '" + JSON.stringify(data) + "', '" + disabled + "', '" + display_on_menu + "' )";
                  
                    }
                }
            }
           
        }
        else if (json['delete']) {
            //Multiple node type deletions
            if (json['delete'].length) {
 
                    for ( i = 0; i < json['delete'].length; i++) {
                    //Increment the progress bar
                    if (progress != null) {
                        progress.set();
                    }
                    node_db[node_db.length] = "DROP TABLE " + json.insert[i].type;
                    node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.insert[i].type + "'";
                    node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.insert[i].type + "'";

                }
            }
            //Unique node deletion
            else {
                if (progress != null) {
                    progress.set();
                }
                node_db[node_db.length] = "DROP TABLE " + json.insert.type;
                node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.insert.type + "'";
                node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.insert.type + "'";
            }
        }

        //DB operations
        mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
        for(i = 0; i < node_db.length; i ++) {
            mainDB.execute(node_db[i]);
        }
        mainDB.execute("COMMIT TRANSACTION");

        Ti.API.info("Success for node_types, db operations ran smoothly!");
    }
    catch(ex){
        alert("Installing form types: " + ex);
    }
        
};
