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
    
    var listDB = Omadi.utils.openMainDatabase();
    listDB.execute('UPDATE updated SET timestamp =' + sync_timestamp + ' WHERE rowid=1');
    listDB.close();

    Ti.App.Properties.setDouble("sync_timestamp", sync_timestamp);
};

Omadi.data.getLastUpdateTimestamp = function(){ "use strict";
    return Ti.App.Properties.getDouble("sync_timestamp", 0);
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
    
    var db, result, instances, field_name;
    
    instances = {};
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT label, type, field_name, settings FROM fields WHERE bundle = '" + type + "'");
    
    while(result.isValidRow()){
        field_name = result.fieldByName('field_name'); 
        instances[field_name] = {
            field_name: field_name,
            label: result.fieldByName('label'),
            type: result.fieldByName('type'),
            settings: JSON.parse(result.fieldByName('settings'))
        };
        result.next();   
    }
    result.close();
    db.close();
    
    return instances;
};


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


    if (node.table_name == 'notification' && node.viewed == 0) {
        Ti.API.debug("A notification was added");
        //newNotificationCount++;
        //newNotificationNid = node.nid;
    }

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
        
        
                        switch(json.insert[i].type) {
                            case "taxonomy_term_reference":
                            case "term_reference":
                            case "datestamp":
                            case "number_integer":
                                if(PLATFORM == 'android'){
                                    db_type = "INTEGER";
                                }
                                else{
                                    db_type = 'TEXT';
                                }
                                break;
        
                            case "number_decimal":
                                db_type = "REAL";
                                break;
        
                            default:
                                db_type = "TEXT";
                                break;
                        }
        
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

    var closeDB, instances, queries, i, field_name, query, fieldNames, no_data, values, value;
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
                                    
                                        value = json.insert[i][field_name];
        
                                        if (isNumber(value)) {
                                            values.push(value);
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
                    
                    
                    
                    if(typeof json.insert[i].__negative_nid !== 'undefined'){
                        Ti.API.debug("Deleting nid: " + json.insert[i].__negative_nid);
                        queries.push('DELETE FROM ' + type + ' WHERE nid=' + json.insert[i].__negative_nid);
                        queries.push('DELETE FROM node WHERE nid=' + json.insert[i].__negative_nid);
                        
                        queries.push("UPDATE file_upload_queue SET nid =" + json.insert[i].nid + " WHERE nid=" + json.insert[i].__negative_nid);
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
