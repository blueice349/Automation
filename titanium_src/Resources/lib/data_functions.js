
/*jslint plusplus:true,eqeq:true,nomen:true*/

Omadi.data = Omadi.data || {};

Omadi.data.cache = {};
Omadi.data.cache.fields = {};
Omadi.data.cache.regions = {};
Omadi.data.cache.fakeFields = {};

Omadi.data.cameraAndroid = null;

Omadi.data.isUpdating = function() {"use strict";

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

function dbEsc(string) {"use strict";
    if (typeof string === 'undefined' || string === null || string === false) {
        return '';
    }

    string += "".toString();
    return string.replace(/[']/g, "''");
}

Omadi.data.setUpdating = function(updating) {"use strict";
    Ti.App.Properties.setBool("isUpdating", updating);
};

Omadi.data.setLastUpdateTimestamp = function(sync_timestamp) {"use strict";

    var db = Omadi.utils.openMainDatabase();

    try {
        if ( typeof sync_timestamp == 'undefined') {
            sync_timestamp = 0;
        }
        db.execute('UPDATE updated SET timestamp =' + sync_timestamp + ' WHERE rowid=1');
    }
    catch(nothing) {

    }
    finally {
        db.close();
    }
};

Omadi.data.getLastUpdateTimestamp = function(useDB) {"use strict";
    var result, timestamp = 0, db;
    
    try{
        if(typeof useDB === 'undefined'){
            db = Omadi.utils.openMainDatabase();    
        }
        else{
            db = useDB;
        }
        
        result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
        if (result.isValidRow()) {
            timestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
        }
        result.close();
        
        if(typeof useDB === 'undefined'){
            db.close();
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception getting last update timestamp: "+ ex);
    }

    return timestamp;
};

Omadi.data.bundleCache = {};
Omadi.data.getBundle = function(type, reset) {"use strict";
    var db, result, bundle = null;
    
    if(typeof reset === 'undefined'){
        reset = false;
    }
    
    if(typeof Omadi.data.bundleCache[type] === 'undefined' || reset){

        db = Omadi.utils.openMainDatabase();
        result = db.execute('SELECT _data, display_name, can_create, can_view, child_forms FROM bundles WHERE bundle_name="' + type + '"');
    
        if (result.isValidRow()) {
            bundle = {
                type : type,
                data : JSON.parse(result.fieldByName('_data')),
                child_forms : JSON.parse(result.fieldByName('child_forms')),
                label : result.fieldByName('display_name'),
                can_create : result.fieldByName('can_create', Ti.Database.FIELD_TYPE_INT),
                can_view : result.fieldByName('can_view', Ti.Database.FIELD_TYPE_INT)
            };
            
            Omadi.data.bundleCache[type] = bundle;
        }
        else{
            Omadi.data.bundleCache[type] = null;
        }
    
        result.close();
        db.close();
    }
    
    bundle = Omadi.data.bundleCache[type];

    return bundle;
};

/**
 * Return true or false if the DB schema should have the specified field in the specified bundle
 */
Omadi.data.fieldExists = function(nodeType, fieldName){"use strict";
    var instances;
    instances = Omadi.data.getFields(nodeType);
    
    if(typeof instances[fieldName] !== 'undefined'){
        return true;
    }
    
    return false;
};



Omadi.data.getFields = function(type) {"use strict";
    var db, result, instances, field_name, nameParts;
    
    if (typeof Omadi.data.cache.fields[type] !== 'undefined') {
        instances = Omadi.data.cache.fields[type];
    }
    else {

        instances = {};
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT type, field_name, label, description, bundle, weight, required, widget, settings, disabled, region, fid, can_view, can_edit FROM fields WHERE bundle = '" + type + "' and disabled = 0 ORDER BY weight");

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

            if (field_name.indexOf("___") !== -1) {
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
        db.close();

        Omadi.data.cache.fields[type] = instances;
    }

    return instances;
};


Omadi.data.getFakeFields = function(type){"use strict";
    var db, result, fakeFields, field_name, nameParts;
    
    if ( typeof Omadi.data.cache.fakeFields[type] !== 'undefined') {
        fakeFields = Omadi.data.cache.fakeFields[type];
    }
    else {

        fakeFields = {};
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT field_name FROM fake_fields WHERE bundle = '" + type + "'");

        while (result.isValidRow()) {
            field_name = result.fieldByName('field_name');
            
            fakeFields[field_name] = field_name;

            result.next();
        }
        result.close();
        db.close();

        Omadi.data.cache.fakeFields[type] = fakeFields;
    }

    return fakeFields;
};

Omadi.data.getRegions = function(type) {"use strict";

    var db, result, regions, region_name, region_settings;
    
    if ( typeof Omadi.data.cache.regions[type] !== 'undefined') {
        regions = Omadi.data.cache.regions[type];
    }
    else {
        regions = {};
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT rid, node_type, label, region_name, weight, settings FROM regions WHERE node_type = '" + type + "' ORDER BY weight ASC");
        
        while (result.isValidRow()) {
            region_name = result.fieldByName('region_name');
            
            //Ti.API.debug(region_name);
            region_settings = result.fieldByName('settings');
            
            //Ti.API.debug(region_settings);
            
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
        db.close();
        
        Omadi.data.cache.regions[type] = regions;
    }

    return regions;
};

Omadi.data.getNewNodeNid = function() {"use strict";
    var db, result, smallestNid;
    //Get smallest nid
    try{
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT MIN(nid) FROM node");
    
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
        db.close();
    }
    catch(ex){
        Ti.API.error("Exception in getNewNodeNid: " + ex);
        Omadi.service.sendErrorReport("Exception in getNewNodeNid: " + ex);   
        try{
            db.close();
        }
        catch(ex1){}
    }

    return smallestNid;
};

Omadi.data.getNodeTitle = function(node) {"use strict";
    var title, bundle, index, field_name, titleValues = [], spacer = ' - ', realname, db, result;

    title = "- No Title -";

    bundle = Omadi.data.getBundle(node.type);
    
    if (bundle && typeof bundle.data.title_fields !== 'undefined') {
        for (index in bundle.data.title_fields) {
            if (bundle.data.title_fields.hasOwnProperty(index)) {
                field_name = bundle.data.title_fields[index];

                if (field_name == 'uid') {
                    field_name = 'author_uid';
                }

                if ((field_name == 'author_uid' || field_name == 'changed_uid') && typeof node.changed_uid !== 'undefined') {
                    titleValues.push(Omadi.utils.getRealname(node[field_name]));
                }
                else if ((field_name == 'created' || field_name == 'changed') && typeof node[field_name] !== 'undefined') {
                    titleValues.push(Omadi.utils.formatDate(node[field_name], true));
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

Omadi.data.deleteContinuousNodes = function(){"use strict";
  var db, result, deleteNids, i;
  
  try{
      Ti.App.saveContinually = false;
      
      deleteNids = [];
      db = Omadi.utils.openMainDatabase();
      
      result = db.execute("SELECT nid FROM node WHERE flag_is_updated = 4");  
      
      while(result.isValidRow()){
          deleteNids.push(result.fieldByName('nid'));
          result.next();
      }
      
      result.close();
      db.close();
      
      for(i = 0; i < deleteNids.length; i ++){
          
          Ti.API.debug("DELETING NODE with nid: " + deleteNids[i]);
          Omadi.data.deleteNode(deleteNids[i]);
      }
  }
  catch(ex){
      Omadi.service.sendErrorReport("Exception deleteContinuousNodes: " + ex);
  }
};

Omadi.data.addNewTerms = function(node){"use strict";
    var instances, field_name, i;
    
    try{
        instances = Omadi.data.getFields(node.type);
        
        for(field_name in instances){
            if(instances.hasOwnProperty(field_name)){
                if(typeof instances[field_name].type !== 'undefined' && instances[field_name].type == 'taxonomy_term_reference' && instances[field_name].widget.type == 'taxonomy_autocomplete'){
                    
                    if(typeof node[field_name] !== 'undefined' && typeof node[field_name].dbValues !== 'undefined'){
                        for(i = 0; i < node[field_name].dbValues.length; i ++){
                            if(node[field_name].dbValues[i] == -1){
                                node[field_name].dbValues[i] = Omadi.data.insertNewTerm(instances[field_name].settings.vocabulary, node[field_name].textValues[i]);
                            }
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in addNewTerms: " + ex);
    }
    
    return node;
};
    
Omadi.data.insertNewTerm = function(machine_name, name){"use strict";
    var db, result, tid = -2, vid = 0, retval = null;
    
    try{
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT MIN(tid) FROM term_data");
        if(result.isValidRow()){
            tid = result.field(0, Ti.Database.FIELD_TYPE_INT);
            tid -= 1; 
        }
        result.close();
        
        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name='" + dbEsc(machine_name) + "'");
        if(result.isValidRow()){
            vid = result.fieldByName('vid');
            
            // -2 is the first negative tid to use because -1 is a place holder for a non-set new term
            tid = Math.min(tid, -2);
            
            db.execute("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES (" + tid + "," + vid + ",'" + dbEsc(name) + "','',0," + Omadi.utils.getUTCTimestamp() + ")");
            Ti.API.debug("tid: " + tid);
            retval = tid;
        }
        result.close();
        db.close();
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception in insertNewTerm: " + ex);
    }
    
    return retval;
};

Omadi.data.nodeSave = function(node) {"use strict";
    var query, field_name, fieldNames, instances, result, db, smallestNid, insertValues, j, k, 
        instance, value_to_insert, has_data, content_s, saveNid, continuousNid, photoNids, origNid,
        continuousId, tempNid, listDB, trueWindowNid, priceIdx, priceTotal, priceData, 
        jsonValue, nodeHasData, lastLocation;
    /*jslint nomen: true*/
    try{
        node._saved = false;
    
        instances = Omadi.data.getFields(node.type);
    
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
        node = Omadi.data.addNewTerms(node);
        
        node.title = Omadi.data.getNodeTitle(node);
        
        // Setup the default for the saveNid
        saveNid = node.nid;
        
        if(node._isContinuous){
            
            Ti.API.debug("Saving continuous id: " + node.continuous_nid);
            
            // Start a new record if the continuous_nid isn't set
            if(!node.continuous_nid){
                node.continuous_nid = Omadi.data.getNewNodeNid();
            }
            
            // Save the actual nid as the continuous negative NID
            saveNid = node.continuous_nid;
            origNid = node.nid;
            
            if(isNaN(origNid)){
                origNid = 0;
            }
            
            // The continuous_nid will be saved as the current window's NID
        }
        else if (node.nid == 'new') {
            Ti.API.debug("Saving new node");
            if(!node.continuous_nid){
                node.continuous_nid = Omadi.data.getNewNodeNid();
            }
            node.nid = saveNid = node.continuous_nid;  //Omadi.data.getNewNodeNid();
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
        else if(typeof node.flag_is_updated !== 'undefined' && node.flag_is_updated == 3 && node.continuous_nid < 0){
            // This was saved as a draft, and we are doing a regular save
            // Delete the draft version after a successful node save
            // as a continuous save is saved over the original draft
            // The logic elsewhere will not delete the node unless the node is correctly saved
            Ti.API.debug("Saving draft to normal: " + JSON.stringify(node));
            if(node.nid > 0){
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
        Omadi.service.sendErrorReport("Exception in first part of node save: " + ex);
    }
      
    db = Omadi.utils.openMainDatabase();
    db.execute("BEGIN IMMEDIATE TRANSACTION");
    
    try {
        nodeHasData = false;
        
        if(fieldNames.length > 0){
            query = "INSERT OR REPLACE INTO " + node.type + " (nid, `";
            query += fieldNames.join('`,`');
            query += '`) VALUES (' + saveNid + ',';
    
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
                                            Omadi.service.sendErrorReport("Could not parse JSON for extra_price: " + node[field_name].textValues[priceIdx]);
                                        }
                                        if(jsonValue != null){
                                            priceData.push(jsonValue);
                                        }
                                    }
                                }
                            }
                            
                            Ti.API.error("In save...");
                            Ti.API.error(JSON.stringify(priceData));
                            
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
    
                                if (Omadi.utils.isEmpty(value_to_insert)) {
                                    value_to_insert = "null";
                                }
                                else{
                                    nodeHasData = true;
                                }
    
                                insertValues.push("'" + dbEsc(value_to_insert) + "'");
                                break;
    
                            case 'number_decimal':
                            case 'number_integer':
                            case 'list_boolean':
                            case 'calculation_field':
                            case 'extra_price':
    
                                if (Omadi.utils.isEmpty(value_to_insert) && value_to_insert != 0) {
                                    insertValues.push('null');
                                }
                                else {
                                    insertValues.push("'" + dbEsc(value_to_insert) + "'");
                                    nodeHasData = true;
                                }
                                break;
    
                            default:
                                
                                if(("".toString() + value_to_insert).length > 0){
                                    nodeHasData = true;    
                                }
                                
                                insertValues.push("'" + dbEsc(value_to_insert) + "'");
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
                db.execute(query);
                
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
                    
                    // continuousNid = node.continuous_nid;
                    // if(continuousNid == 'new'){
                        // continuousNid = 0;
                    // }
                    query = "INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid, dispatch_nid, copied_from_nid) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",4,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1," + origNid + "," + node.dispatch_nid + "," + node.custom_copy_orig_nid + ")";
                }
                else if (node._isDraft) {
                    // if (saveNid > 0) {
                        // db.execute("UPDATE node SET changed=" + node.changed + ", changed_uid=" + node.changed_uid + ", title='" + dbEsc(node.title) + "', flag_is_updated=3, table_name='" + node.type + "', form_part=" + node.form_part + ", no_data_fields='" + node.no_data + "',viewed=" + node.viewed + " WHERE nid=" + saveNid);
                    // }
                    // else {
                    // origNid = 0;
                    // if(typeof node.origNid !== 'undefined'){
                        // origNid = node.origNid;
                    // }
    //                 
                    // Ti.API.debug("SAVING DRAFT: " + saveNid + " " + origNid);
                    //Omadi.service.sendErrorReport("Saved draft: saveNid = " + saveNid + ", origNid = " + origNid + ", winNid = " + Ti.UI.currentWindow.nid + ", continuous = " + Ti.UI.currentWindow.continuous_nid);
                    // Only save drafts as a negative nid
                    query = "INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid, dispatch_nid, copied_from_nid) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",3,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1," + node.origNid + "," + node.dispatch_nid + "," + node.custom_copy_orig_nid + ")";
                }
                else{
                    // This is a save the will be sent to the server
                    
                    lastLocation = Omadi.location.getLastLocation();
                    
                    if (saveNid > 0) {
                        
                        //Omadi.service.sendErrorReport("Saved update: saveNid = " + saveNid + ", winNid = " + Ti.UI.currentWindow.nid + ", continuous = " + Ti.UI.currentWindow.continuous_nid);
                        query = "UPDATE node SET changed=" + node.changed + 
                            ", changed_uid=" + node.changed_uid + 
                            ", title='" + dbEsc(node.title) + 
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
                        
                        //Omadi.service.sendErrorReport("Saved new: saveNid = " + saveNid + ", winNid = " + Ti.UI.currentWindow.nid + ", continuous = " + Ti.UI.currentWindow.continuous_nid);
                        // Give all permissions for this node. Once it comes back, the correct permissions will be there.  If it never gets uploaded, the user should be able to do whatever they want with that info.
                        query = "INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid, dispatch_nid, copied_from_nid, latitude, longitude, accuracy) VALUES (" + 
                            saveNid + "," + 
                            node.created + "," + 
                            node.changed + ",'" + 
                            dbEsc(node.title) + "'," + 
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
                db.execute(query);
                
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
                
                // Do not save the photos to the continuous
                // Do not save photos to a dispatch node
                if(!node._isContinuous && node.type != 'dispatch'){
                    
                    listDB = Omadi.utils.openListDatabase();
                    listDB.execute('UPDATE _files SET nid=' + saveNid + ' WHERE nid IN (' + photoNids.join(',') + ')');
                    listDB.close();
                }
    
                node._saved = true;
                Ti.API.debug("NODE SAVE WAS SUCCESSFUL");
            
            }
            catch(ex1) {
                Omadi.display.doneLoading();
                alert("Error saving to the node table: " + ex1);
                db.execute("DELETE FROM " + node.type + " WHERE nid = " + saveNid);
                Omadi.service.sendErrorReport("Error saving to the node table: " + ex1);
            }
        }    
        else{
            // The node didn't have any data to save in fields, so do not save, and send a report
            Omadi.service.sendErrorReport("Node has no data: " + JSON.stringify(node));
            node._saved = false;
        }

    }
    catch(ex2) {
        Omadi.display.doneLoading();
        alert("Error saving to " + node.type + " table: " + ex2 + " : " + query);
        Omadi.service.sendErrorReport("Error saving to " + node.type + " table: " + ex2 + " : " + query);
    }
    
    try {
        db.execute("COMMIT TRANSACTION");
    }
    catch(nothing) {
        
    }
    
    try{
         db.close();
    }
    catch(dbEx){}
    
    if(node._saved === true){
         if(typeof node._deleteNid !== 'undefined'){
              // This was setup with the drafts section above
              Omadi.data.deleteNode(node._deleteNid);  
         }
    }
    
    return node;
};

Omadi.data.deleteNode = function(nid){"use strict";
    var db, result, table_name, listDB, dispatchNid;
    try{
        // Currently, only delete negative nids, which are drafts or non-saved nodes
        // To delete positive nids, we need to sync that to the server, which is not yet supported
        if(nid < 0){
            db = Omadi.utils.openMainDatabase();
            dispatchNid = 0;
            
            result = db.execute("SELECT table_name, dispatch_nid FROM node WHERE nid = " + nid);
            
            if(result.isValidRow()){
                table_name = result.fieldByName("table_name");
                dispatchNid = result.fieldByName("dispatch_nid", Ti.Database.FIELD_TYPE_INT);
    
                db.execute("DELETE FROM node WHERE nid = " + nid);
                
                if(table_name){
                    db.execute("DELETE FROM " + table_name + " WHERE nid = " + nid);
                }
            }
            
            result.close();
            db.close();
            
            listDB = Omadi.utils.openListDatabase();
            // Delete any photos from the DB where the nid matches
            listDB.execute("UPDATE _files SET nid = -1000000 WHERE nid = " + nid);
            listDB.close();
            
            if(dispatchNid < 0){
                Omadi.data.deleteNode(dispatchNid);
            }
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Exception deleting node: " + ex);
    }
};

Omadi.data.getPhotosNotUploaded = function(){"use strict";
    var db, result, filePaths, filePath, thumbPath;
    filePaths = [];
    
    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT * FROM _files WHERE type IN ('image','signature') AND finished = 0 ORDER BY nid DESC");
    
    while(result.isValidRow()){
        filePath = result.fieldByName("file_path");
        thumbPath = result.fieldByName("thumb_path");
       
        filePaths.push({
            filePath: filePath,
            thumbPath: thumbPath,
            degrees: result.fieldByName("degrees", Ti.Database.FIELD_TYPE_INT),
            photoId: result.fieldByName("id", Ti.Database.FIELD_TYPE_INT),
            nid: result.fieldByName("nid", Ti.Database.FIELD_TYPE_INT)
        });
        
        result.next();
    }
    
    result.close();
    db.close();
    
    return filePaths;
};

Omadi.data.setNoFilesUploading = function(){"use strict";
    var db;
    
    db = Omadi.utils.openListDatabase();
    db.execute("UPDATE _files SET uploading = 0 WHERE 1=1");
    db.close();
};

Omadi.data.saveFailedUpload = function(photoId, showMessage) {"use strict";

    var imageDir, imageFile, newFilePath, imageView, oldImageFile, 
        blob, db, result, dialog, nid, field_name, delta, filePath, 
        sdCardPath, sdIndex, thumbPath, thumbFile;

    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT * FROM _files WHERE id = " + photoId);
    
    if(typeof showMessage === 'undefined'){
        showMessage = true;
    }

    try {

        if (result.isValidRow()) {

            filePath = result.fieldByName('file_path');
            thumbPath = result.fieldByName('thumb_path');
            nid = result.fieldByName('nid');
            field_name = result.fieldByName('field_name');
            delta = result.fieldByName('delta');

            // Make a temporary imageView so the blob can be created.
            // It doesn't work with the blob from the base64decode
            imageView = Ti.UI.createImageView({
                image : blob
            });
            
            if(showMessage){
                Omadi.service.sendErrorReport("going to save to photo gallery_nid_" + nid + "_field_name_" + field_name + "_delta_" + delta + "_photoId_" + photoId);
            }

            if (Ti.App.isAndroid) {
                
                if (Ti.Filesystem.isExternalStoragePresent()) {

                    imageDir = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'failed_uploads');
                    
                    newFilePath = 'failed_' + nid + '_' + field_name + '_' + delta + '_' + Omadi.utils.getUTCTimestamp() + '.jpg'; 
                    
                    if (! imageDir.exists()) {
                        imageDir.createDirectory();
                    }

                    // .resolve() provides the resolved native path for the directory.
                    //imageFile = Ti.Filesystem.getFile(imageDir.resolve(), newFilePath);
                    //Ti.API.info("ImageFile path is: " + imageFile.resolve());

                    Ti.API.info("file_path: " + filePath);
                    
                    oldImageFile = Ti.Filesystem.getFile(filePath);
                    
                    if(oldImageFile.exists() && oldImageFile.isFile()){
                        newFilePath = Ti.Filesystem.externalStorageDirectory + "/failed_uploads/" + newFilePath;
                        
                        if(oldImageFile.move(newFilePath)){
                            newFilePath = Ti.Filesystem.getFile(newFilePath);
                            
                            if(showMessage){
                                
                                sdCardPath = newFilePath.getNativePath();
                                sdIndex = sdCardPath.indexOf("/sdcard/");
                                if(sdIndex != -1){
                                    sdCardPath = sdCardPath.substring(sdIndex + 7);
                                }
                                
                                dialog = Ti.UI.createAlertDialog({
                                    title : 'File Upload Problem',
                                    message : "There was a problem uploading a file for node #" + nid + " after 5 tries. The file was saved to your SD card at " + sdCardPath,
                                    buttonNames : ['OK']
                                });
                                dialog.show();
        
                                Omadi.service.sendErrorReport("Saved to photo gallery Android: " + nid);
                            }
                            
                            // Only delete the original file if the file was moved correctly
                            Omadi.data.deletePhotoUpload(photoId, true);
                        }
                        else{
                            
                            Omadi.service.sendErrorReport("Did not save to photo gallery: " + photoId);
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Corrupted File',
                                message : "There was a problem uploading a file for node #" + nid + ", and the file could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                                buttonNames : ['OK']
                            });
                            dialog.show();
                            
                            Omadi.data.deletePhotoUpload(photoId, false);
                        }
                    }
                    else{
                         // File was not found, so don't bother with an alert
                        Omadi.data.deletePhotoUpload(photoId, false);
                    }
                    
                    // dispose of file handles
                    oldImageFile = null;
                        
                    // dispose of file handles
                    imageDir = null;
                }
                else{
                    Omadi.service.sendErrorReport("Does not have external storage trying to save failed upload.");
                }
            }
            else{
                        
                Ti.API.info("file_path: " + filePath);
                
                oldImageFile = Ti.Filesystem.getFile(filePath);
                
                if(oldImageFile.exists() && oldImageFile.isFile()){
                    Titanium.Media.saveToPhotoGallery(oldImageFile, {
                        success : function(e) {
                            
                            if(showMessage){
                                dialog = Titanium.UI.createAlertDialog({
                                    title : 'File Upload Problem',
                                    message : "There was a problem uploading a file for node #" + nid + " after 5 tries. The file was saved to your photo gallery.",
                                    buttonNames : ['OK']
                                });
                                dialog.show();
        
                                Omadi.service.sendErrorReport("Saved to photo gallery iOS: " + nid);
                            }
                            
                            Omadi.data.deletePhotoUpload(photoId, true);
                        },
                        error : function(e) {
                            Omadi.service.sendErrorReport("Did not save to photo gallery iOS: " + photoId);
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Corrupted File',
                                message : "There was a problem uploading a file for node #" + nid + ", and the file could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                                buttonNames : ['OK']
                            });
                            dialog.show();
    
                            Omadi.data.deletePhotoUpload(photoId, true);
                        }
                    });
                }
                else{
                    // File was not found, so don't bother with an alert
                    Omadi.data.deletePhotoUpload(photoId, false);
                }
            }
        }
    }
    catch(ex) {
        Omadi.service.sendErrorReport("Did not save to photo gallery exception: " + photoId + ", ex: " + ex);
        dialog = Titanium.UI.createAlertDialog({
            title : 'Corrupted File',
            message : "There was a problem uploading a file for node #" + nid + ", and the file could not be saved to this device's gallery.",
            buttonNames : ['OK']
        });
        dialog.show();
    }

    result.close();
    db.close();
};

Omadi.data.deletePhotoUploadByPath = function(filePath, deleteFile){"use strict";
    var db, result, id, nid, delta;
    
    id = null;
    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT id, nid, delta FROM _files WHERE file_path = '" + dbEsc(filePath) + "'");
    if(result.isValidRow()){
        id = result.fieldByName('id', Ti.Database.FIELD_TYPE_INT);
        nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
        delta = result.fieldByName('delta', Ti.Database.FIELD_TYPE_INT);
        
        // Move over the other photos still in the queue for uploads
        db.execute("UPDATE _files SET delta = (delta - 1) WHERE nid = " + nid + " AND delta > " + delta);
    }
    else{
        Omadi.service.sendErrorReport("Could not find filepath in database: " + filePath);
    }
    
    result.close();
    db.close();
    
    if(id !== null){
        Ti.API.debug("Photo ID to delete: " + id);
        Omadi.data.deletePhotoUpload(id, deleteFile);
    }
};

Omadi.data.deletePhotoUpload = function(id, deleteFile) {"use strict";
    var file, db, result, filePath = null, thumbPath = null, thumbFile;
    
    
    
    db = Omadi.utils.openListDatabase();
    if(typeof deleteFile !== 'undefined' && deleteFile == true){
        result = db.execute("SELECT file_path, thumb_path FROM _files WHERE id = " + id);
        if(result.isValidRow()){
            filePath = result.fieldByName('file_path');
            thumbPath = result.fieldByName('thumb_path');
        }
    }
    else{
        deleteFile = false;
    }
    
    db.execute("DELETE FROM _files WHERE id = " + id);
    db.close();
    
    Ti.API.error("DELETING a file: " + filePath);
    
    if(filePath !== null){
        file = Ti.Filesystem.getFile(filePath);
        if(file.exists() && file.isFile()){
            file.deleteFile();
        }
        
        if(thumbPath != null && thumbPath.length > 10){
            thumbFile = Ti.Filesystem.getFile(thumbPath);
            if(thumbFile.exists() && thumbFile.isFile()){
                thumbFile.deleteFile();
            }
        }
    }
};

Omadi.data.nodeLoad = function(nid) {"use strict";

    var db, node, result, subResult, field_name, dbValue, tempDBValues, textValue, 
        subValue, decoded, i, real_field_name, part, field_parts, widget, instances, 
        tempValue, origDBValue, jsonValue, allowedValues, allowedKey, filePath, newNid,
        listDB, intNid;

    node = null;
    
    if(typeof nid !== 'undefined'){
        intNid = parseInt(nid, 10);
    
        if (!isNaN(intNid) && intNid != 0) {
            
            node = {
                form_part: 0,
                nid : nid
            };

            db = Omadi.utils.openMainDatabase();
            listDB = Omadi.utils.openListDatabase();
            
            try{

                result = db.execute('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash, continuous_nid, dispatch_nid, copied_from_nid, latitude, longitude, accuracy FROM node WHERE  nid = ' + nid);
        
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
                        
                        result = db.execute('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash, continuous_nid, dispatch_nid, copied_from_nid, latitude, longitude, accuracy FROM node WHERE  nid = ' + newNid);
        
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
                             Omadi.service.sendErrorReport("unrecoverable node load 1 for nid " + nid);
                             node = null;
                        }
                    }
                    else{
                        
                        if(nid <= 0){
                            Omadi.service.sendErrorReport("unrecoverable node load 2 for nid " + nid);
                        }
                        
                        node = null;
                    }
                }
                
                result.close();

            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception with node table query: " + ex);
            }
    
            if (node != null && typeof node.nid !== 'undefined') {
                
                instances = Omadi.data.getFields(node.table_name);
    
                result = db.execute("SELECT * FROM " + node.table_name + " WHERE nid = " + node.nid);
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
                            if (field_name.indexOf("___") !== -1) {
                                dbValue = origDBValue;
                                
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
                                else if(dbValue === false){
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
    
                                jsonValue = Omadi.utils.getParsedJSON(origDBValue);
                                //Ti.API.info(origDBValue);
                                tempDBValues = [];
    
                                if (Omadi.utils.isArray(jsonValue)) {
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
                                            
                                            if (!Omadi.utils.isEmpty(dbValue)) {
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
                                        
                                            if (!Omadi.utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
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
    
                                            if (!Omadi.utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
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
                                            if (!Omadi.utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
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
                                            node[field_name].dbValues.push(Omadi.utils.getParsedJSON(origDBValue));
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
                                    subResult = db.execute('SELECT title, table_name, nid FROM node WHERE nid IN (' + node[field_name].dbValues.join(',') + ')');
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
                                        node[field_name].textValues[i] = Omadi.utils.secondsToString(node[field_name].dbValues[i]);
                                    }
                                    break;
    
                                case 'datestamp':
                                    for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                        if (!Omadi.utils.isEmpty(node[field_name].dbValues[i])) {
                                            node[field_name].dbValues[i] = parseInt(node[field_name].dbValues[i], 10);
                                            node[field_name].textValues[i] = Omadi.utils.formatDate(node[field_name].dbValues[i], 
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
                                        node[field_name].jsonValue = JSON.parse(node[field_name].tempData);
                                        if(Omadi.utils.isArray(node[field_name].jsonValue)){
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
                                case 'file':
                                    // This includes signature and video fields
                                    
                                    subResult = listDB.execute('SELECT * FROM _files WHERE finished = 0 AND nid IN(' + node.nid + ',0) AND field_name ="' + field_name + '" ORDER BY delta ASC');
    
                                    node[field_name].imageData = [];
                                    node[field_name].degrees = [];
                                    node[field_name].deltas = [];
                                    node[field_name].thumbData = [];
                                    
                                    if (subResult.rowCount > 0) {
                                        while (subResult.isValidRow()) {
                                            
                                            node[field_name].imageData.push(subResult.fieldByName('file_path'));
                                            node[field_name].deltas.push(subResult.fieldByName('delta'));
                                            node[field_name].degrees.push(subResult.fieldByName('degrees', Ti.Database.FIELD_TYPE_INT));
                                            node[field_name].thumbData.push(subResult.fieldByName('thumb_path'));
                                            
                                            //Ti.API.debug(JSON.stringify(node[field_name]));
                                            
                                            subResult.next();
                                        }
                                    }
                                    subResult.close();
                                    
                                    // Special case for only file-type fields
                                    if(instances[field_name].type == 'file'){
                                        
                                        subResult = db.execute("SELECT " + field_name + "___filename AS filename FROM " + node.type + " WHERE nid=" + node.nid);
                                        if (subResult.rowCount > 0) {
                                            textValue = [];
                                            origDBValue = subResult.fieldByName("filename");
                                            tempDBValues = Omadi.utils.getParsedJSON(origDBValue);
                                            //Ti.API.debug(tempDBValues);
                                            if(Omadi.utils.isArray(tempDBValues)){
                                                textValue = tempDBValues;
                                            }
                                            else{
                                                textValue.push(origDBValue);
                                            }
                                            //Ti.API.debug(textValue);
                                            
                                            for ( i = 0; i < node[field_name].dbValues.length; i++) {
                                                if (!Omadi.utils.isEmpty(node[field_name].dbValues[i])) {
                                                    
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
            
            listDB.close();
            db.close();
        }
    }
    
    return node;
};



Omadi.data.getNodeTableInsertStatement = function(node) {"use strict";

    var sql = 'INSERT OR REPLACE INTO node (nid, perm_edit, perm_delete, created, changed, title, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed, dispatch_nid) VALUES (';

    sql += node.nid;
    sql += ',' + node.perm_edit;
    sql += ',' + node.perm_delete;
    sql += ',' + node.created;
    sql += ',' + node.changed;
    sql += ",'" + dbEsc(node.title) + "'";
    sql += ',' + node.author_uid;
    sql += ',' + node.flag_is_updated;
    sql += ',"' + node.table_name + '"';
    sql += ',' + node.form_part;
    sql += ',' + node.changed_uid;
    sql += ",''";
    sql += ',\'' + node.viewed + '\'';
    sql += ',' + node.dispatch_nid;
    sql += ')';

    return sql;
};

Omadi.data.getFinishedUploadPath = function(nid, fieldName, delta){"use strict";
    var listDB, result, path;
    
    path = null;
    listDB = Omadi.utils.openListDatabase();
    
    result = listDB.execute("SELECT file_path FROM _files WHERE nid = " + nid + " AND field_name='" + fieldName + "' AND delta = " + delta);
    if(result.isValidRow()){
        path = result.field(0);
    }
    result.close();
    listDB.close();
    
    return path;  
};

Omadi.data.getNumFilesReadyToUpload = function(uid){"use strict";
    var mainDB, result, sql, retval = 0;
    
    try{
        sql = "SELECT COUNT(*) FROM _files WHERE nid > 0 AND finished = 0";
        
        if(typeof uid !== 'undefined'){
            sql += " AND uid = " + uid;
        }
        
        if(Ti.Network.networkType === Ti.Network.NETWORK_MOBILE){
            if(!Ti.App.Properties.getBool('allowVideoMobileNetwork', false)){
                // We do not want to upload a video when on a mobile network   
                sql += " AND type != 'video' "; 
            }
        }
        
        mainDB = Omadi.utils.openListDatabase();
        result = mainDB.execute(sql);
        
        if(result.isValidRow()){
            retval = result.field(0, Ti.Database.FIELD_TYPE_INT);
            //Omadi.service.sendErrorReport("Num Photos greater than 0: " + result.field(0, Ti.Database.FIELD_TYPE_INT));
        }
        
        result.close();
        mainDB.close();
    }
    catch(ex){
        Omadi.service.sendErrorReport('Error getting photo count: ' + ex);    
    }
    
    return retval;
};

Omadi.data.maxBytesPerUpload = 2097152; // 2MB

Omadi.data.getFileArray = function(onlyUploadable){"use strict";
    var files, sql, listDB, result, nextFile, now, node, message, lastErrorTimestamp, 
        neverUploadIds, dialog, deleteFile, photoWidget, photoDeleteOption, imageFile, 
        thumbFile, deleteFinishedIds;
    
    if(typeof onlyUploadable === 'undefined'){
        onlyUploadable = true;
    }
    
    neverUploadIds = [];
    deleteFinishedIds = [];
    files = [];
    
    
    sql = "SELECT * FROM _files ";
        
    if(Ti.Network.networkType === Ti.Network.NETWORK_MOBILE && onlyUploadable){
        if(!Ti.App.Properties.getBool('allowVideoMobileNetwork', false)){
            // We do not want to upload a video when on a mobile network   
            sql += " WHERE type != 'video' "; 
        }
    }
    
    sql += " ORDER BY tries ASC, filesize ASC, delta ASC";
    
    now = Omadi.utils.getUTCTimestamp();
    lastErrorTimestamp = Ti.App.Properties.getDouble('lastFileErrorTimestamp', 0);
    
    listDB = Omadi.utils.openListDatabase();
    
    try{
        result = listDB.execute(sql);
        
        while(result.isValidRow()) {
            
            try{
                
                nextFile = {
                    nid : result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
                    id : result.fieldByName('id', Ti.Database.FIELD_TYPE_INT),
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
                    finished : result.fieldByName('finished'),
                    upload_part : 1
                };
                
                if(nextFile.filesize != null){
                    nextFile.filesize = parseInt(nextFile.filesize, 10);
                }
                else{
                    nextFile.filesize = 0;
                }
                
                if(nextFile.bytes_uploaded != null){
                    nextFile.bytes_uploaded = parseInt(nextFile.bytes_uploaded, 10);
                }
                else{
                    nextFile.bytes_uploaded = 0;
                }
                
                if(nextFile.tries != null){
                    nextFile.tries = parseInt(nextFile.tries, 10);
                }
                else{
                    nextFile.tries = 0;
                }
                
                if(nextFile.delta != null){
                    nextFile.delta = parseInt(nextFile.delta, 10);
                }
                else{
                    nextFile.delta = 0;
                }
                
                if(nextFile.timestamp != null){
                    nextFile.timestamp = parseInt(nextFile.timestamp, 10);
                }
                else{
                    nextFile.timestamp = 0;
                }
                
                if(nextFile.fid != null){
                    nextFile.fid = parseInt(nextFile.fid, 10);
                }
                else{
                    nextFile.fid = 0;
                }
                
                if(nextFile.finished != null){
                    nextFile.finished = parseInt(nextFile.finished, 10);
                }
                else{
                    nextFile.finished = 0;
                }
                
                if(nextFile.uploaded != null){
                    nextFile.uploaded = parseInt(nextFile.uploaded, 10);
                }
                else{
                    nextFile.uploaded = 0;
                }
                
                if(nextFile.type == 'video' || nextFile.type == 'file'){
                    nextFile.numUploadParts = Math.ceil(nextFile.filesize / Omadi.data.maxBytesPerUpload);
                    nextFile.upload_part = (nextFile.bytes_uploaded / Omadi.data.maxBytesPerUpload) + 1;
                    nextFile.uploading_bytes = Omadi.data.maxBytesPerUpload;
                }
                else{
                    nextFile.numUploadParts = 1;
                    nextFile.upload_part = 1;
                    nextFile.uploading_bytes = nextFile.filesize;
                }
                
                if(onlyUploadable){
                    
                    if(nextFile.nid <= 0){
                            
                        if(nextFile.timestamp < now - 1800){
                            // If the file was done over 30 minutes ago, find out more
                            if(nextFile.nid != -1000000){
                                node = Omadi.data.nodeLoad(nextFile.nid);
                                if(node !== null){
                                    if(node.flag_is_updated != 3 && node.flag_is_updated != 4){
                                        // If this is not a draft or continuous save, send up the debug
                                        message = "Not a negative draft: " + JSON.stringify(node);
                                        // Limit node message to 2000 characters
                                        message = message.substring(0, 2000);
                                        message += JSON.stringify(nextFile);
                                        Omadi.service.sendErrorReport(message);
                                        
                                        // Do not remove this as an upload just yet.
                                        // It could be a continuous save node
                                        // Need to look at error data from users using this
                                        // to determine what to do in this case
                                    }
                                }
                                else{
                                    message = "Null negative Node with nid " + nextFile.nid + " ";
                                    message += JSON.stringify(nextFile);
                                    Omadi.service.sendErrorReport(message);
                                    
                                    // This file should stop attempting to be uploaded
                                    neverUploadIds.push(nextFile.id);
                                }
                            }
                        }
                    }
                    else if(nextFile.finished > 0){
                        // We don't show the finished uploads
                        
                        if(now > nextFile.finished + (3600 * 16)){
                            // Delete any files that have been uploaded and still exist on the device for too long
                            
                            deleteFile = true;
                            
                            photoWidget = Ti.App.Properties.getString("photoWidget", 'take');
                            photoDeleteOption = Ti.App.Properties.getString("deleteOnUpload", "false");
                           
                            if(photoWidget == 'choose' && photoDeleteOption == "false"){
                                deleteFile = false;
                            }
                            
                            Ti.API.error("ABOUT TO DELETE A FINISHED FILE!: " + nextFile.file_path);
                            
                            if(deleteFile){
                                imageFile = Ti.Filesystem.getFile(nextFile.file_path);
                                if(imageFile.exists()){
                                    imageFile.deleteFile();
                                } 
                                
                                // Delete the thumbnail if one is saved
                                if(nextFile.thumb_path != null && nextFile.thumb_path.length > 10){
                                    thumbFile = Ti.Filesystem.getFile(nextFile.thumb_path);
                                    if(thumbFile.exists()){
                                       thumbFile.deleteFile();
                                    }
                                }
                                
                                deleteFinishedIds.push(nextFile.id);
                            }
                        }
                    }
                    else if(nextFile.tries > 10){
                        
                        // Show everything if the file was attempted more than 10 times
                        node = Omadi.data.nodeLoad(nextFile.nid);
                        
                        if(node !== null){
                           
                            message = "Over 10 tries: " + JSON.stringify(node);
                            // Limit node message to 2000 characters
                            message = message.substring(0, 2000);
                            message += JSON.stringify(nextFile);
                            Omadi.service.sendErrorReport(message);
                        }
                        else{
                            message = "Null Node with nid " + nextFile.nid + " ";
                            message += JSON.stringify(nextFile);
                            Omadi.service.sendErrorReport(message);
                        }
                        
                        // This file should stop attempting to be uploaded
                        neverUploadIds.push(nextFile.id);
                    }
                    else{
                        // Only allow positive nids into the possibilities for upload
                        files.push(nextFile);
                    }
                }
                else{
                    // Put all files into the array
                    files.push(nextFile);
                }
            }
            catch(innerEx){
                // Catch the inner exception so it doesn't throw away all uploads
                Ti.API.error("Error in inner file query load: " + innerEx);
                Omadi.service.sendErrorReport("Error in get file query load: " + innerEx);
            }
            
            result.next();
        }
        result.close();
    }
    catch(exDB){
        Ti.API.error("Error in get file query load: " + exDB);
        Omadi.service.sendErrorReport("Error in get file query load: " + exDB);
    }
    
    if(deleteFinishedIds.length > 0){
        // Delete the record from the files table
        listDB.execute("DELETE FROM _files WHERE id IN(" + deleteFinishedIds.join(',') + ")");
    }
    
    if(neverUploadIds.length > 0){
        // Set files to never be attempted again
        listDB.execute("UPDATE _files SET nid = -1000000 WHERE id IN(" + neverUploadIds.join(',') + ")");
        dialog = Ti.UI.createAlertDialog({
           title: 'Upload Problem',
           message: neverUploadIds.length + " file" + (neverUploadIds.length > 1 ? 's' : '') + " could not be uploaded. You can see non-uploaded files under 'Actions' -> 'Photos Not Uploaded'",  
           buttonNames: ['Ok', 'Take Me There']
        });
        
        dialog.addEventListener('click', function(e){
            try{
                if(e.index === 1){
                    Omadi.display.openLocalPhotosWindow();
                }
            }
            catch(ex){
                Omadi.service.sendErrorReport("exception upload problem dialog: " + ex);
            }
        });
        
        dialog.show();
    }
        
    listDB.close();
    
    return files;
};

Omadi.data.getNextPhotoData = function(){"use strict";

    var listDB, result, nextFile, imageFile, imageBlob, maxDiff, 
        newWidth, newHeight, resizedFile, isResized, resizedFilePath, 
        resizeRetval, readyForUpload, restartSuggested, dialog, deleteFromDB,
        fileStream, buffer, numBytesRead, sql, position, 
        filePart, resizedBlob, maxPhotoPixels, files, i, errorOccurred, retryEncode;
   
    nextFile = null;
    readyForUpload = true;
    restartSuggested = false;
    deleteFromDB = false;
    maxPhotoPixels = 1280;
    
    files = Omadi.data.getFileArray();
           
    for(i = 0; i < files.length; i ++){
        errorOccurred = false;
        
        try{
            nextFile = files[i];
            imageFile = Ti.Filesystem.getFile(nextFile.file_path);
            
            if(!imageFile.exists() || !imageFile.isFile()){
               
                Ti.API.error("File does not exist: " + nextFile.file_path);
                
                //Omadi.data.deletePhotoUpload(nextFile.id, false);
                
                Omadi.service.sendErrorReport("The file at " + nextFile.file_path + " for node #" + nextFile.nid + " cannot be found for upload.");
                
                alert("The file at " + nextFile.file_path + " for node #" + nextFile.nid + " cannot be found for upload.");
                
                errorOccurred = true;
            }
            else{
                
                nextFile.loaded = false;
            
                if(nextFile.type == 'image' || nextFile.type == 'signature'){
                    
                    if(Ti.App.isAndroid){
                        
                        if(Omadi.data.cameraAndroid === null){
                            Omadi.data.cameraAndroid = require('com.omadi.newcamera');
                        }
                        
                        retryEncode = false;
                        
                        try{
                            nextFile.file_data = Omadi.data.cameraAndroid.base64Encode(nextFile.file_path);
                            
                            if(nextFile.file_data.length > 5000){
                                // If we have at least 5KB of data, we probably have a photo (signature can be < 10KB)
                                nextFile.loaded = true;
                            }
                            else{
                                Ti.API.debug("Defined exception in Android base64Encode: " + nextFile.file_data);
                                Omadi.service.sendErrorReport("Defined exception in Android base64Encode: " + nextFile.file_data);
                                retryEncode = true;
                            }
                        }
                        catch(exbase64){
                            Ti.API.debug("Exception reading Android base64Encode: " + exbase64);
                            Omadi.service.sendErrorReport("Exception reading Android base64Encode: " + exbase64);
                            retryEncode = true;
                        }
                        
                        if(retryEncode){
                            // Fall back to original method of encoding the image
                            try{
                                imageBlob = imageFile.read();
                                
                                if(!imageBlob){
                                    errorOccurred = true;
                                    Ti.API.debug("Image Blob is null");
                                    Omadi.service.sendErrorReport("Image blob is null");
                                } 
                            }
                            catch(exRead){
                                Ti.API.debug("Exception reading file: " + exRead);
                                Omadi.service.sendErrorReport("Exception reading non-resized photo: " + exRead);
                                readyForUpload = false;
                                // This is probably a memory error, so request a restart
                                restartSuggested = true;
                                
                                errorOccurred = true;
                            }
                        }
                    }
                    else{
                        try{
                            imageBlob = imageFile.read();
                            
                            if(!imageBlob){
                                errorOccurred = true;
                                Ti.API.debug("Image Blob is null");
                                Omadi.service.sendErrorReport("Image blob is null");
                            }
                        }
                        catch(exRead1){
                            Ti.API.debug("Exception reading file: " + exRead1);
                            Omadi.service.sendErrorReport("Exception reading non-resized photo: " + exRead1);
                            readyForUpload = false;
                            // This is probably a memory error, so request a restart
                            restartSuggested = true;
                            
                            errorOccurred = true;
                        }
                        
                        if(!errorOccurred){
                            
                            if(Ti.App.isIOS){
                                // Resize the photo to a smaller size
                                try {
                                    
                                    Ti.API.debug("Original: " + imageBlob.length + " " + imageBlob.width + "x" + imageBlob.height);
                                    
                                    if (imageBlob.length > Omadi.data.maxBytesPerUpload || imageBlob.height > maxPhotoPixels || imageBlob.width > maxPhotoPixels) {
        
                                        maxDiff = imageBlob.height - maxPhotoPixels;
                                        if (imageBlob.width - maxPhotoPixels > maxDiff) {
                                            // Width is bigger
                                            newWidth = maxPhotoPixels;
                                            newHeight = (maxPhotoPixels / imageBlob.width) * imageBlob.height;
                                        }
                                        else {
                                            // Height is bigger
                                            newHeight = maxPhotoPixels;
                                            newWidth = (maxPhotoPixels / imageBlob.height) * imageBlob.width;
                                        }
        
                                        //imageBlob = imageBlob.imageAsResized(newWidth, newHeight);
                                        /*global ImageFactory*/
                                       resizedBlob = imageBlob.imageAsResized(newWidth, newHeight);
                                        // resizedBlob = ImageFactory.imageAsResized(imageBlob, {
                                            // width: newWidth, 
                                            // height: newHeight,
                                            // quality: ImageFactory.QUALITY_DEFAULT,
                                            // hires: false
                                        // });
    //                                     
                                        Ti.API.debug("Resized: " + resizedBlob.length);
                                        
                                        if(resizedBlob.length > maxPhotoPixels){
                                            imageBlob = ImageFactory.compress(resizedBlob, 0.75);
                                            nextFile.filesize = imageBlob.length;
                                            
                                            nextFile.numUploadParts = 1;
                                            nextFile.upload_part = 1;
                                            nextFile.uploading_bytes = nextFile.filesize;
                                        }
                                        
                                        Ti.API.debug("Compressed: " + imageBlob.length);
                                    }
                                    else{
                                        Ti.API.debug("No image Resize was necessary");
                                    }
                                }
                                catch(ex) {
                                    Omadi.service.sendErrorReport("Exception resizing iOS Photo: " + ex);
                                    readyForUpload = false;
                                    errorOccurred = true;
                                }
                                finally{
                                    // Clean up some memory
                                    resizedBlob = null;
                                }
                            }
                        }
                    }
                }
                else if(nextFile.type == 'video' || nextFile.type == 'file'){
                    
                    Ti.API.debug("uploading a video");
                    
                    try{
                        fileStream = imageFile.open(Ti.Filesystem.MODE_READ);
                        buffer = Ti.createBuffer({
                            length: Omadi.data.maxBytesPerUpload 
                        });
                        
                        Ti.API.debug("bytes already uploaded: " + nextFile.bytes_uploaded);
                        
                        position = 0;
                        filePart = 0;
                        
                        // No seek function, so move the stream to the correct position
                        while(position < nextFile.bytes_uploaded){
                            filePart ++;
                            position += fileStream.read(buffer);
                            Ti.API.debug("used a buffer");
                        }
                        
                        if(filePart > 0){
                            buffer.clear();
                        }
                        
                        numBytesRead = fileStream.read(buffer);
                        if(numBytesRead > 0){
                            if(numBytesRead < buffer.length){
                                buffer.length = numBytesRead;
                            }
                            imageBlob = buffer.toBlob();
                        }
                        else{
                            Omadi.service.sendErrorReport("Read zero bytes from stream.");
                            errorOccurred = true;
                        }
                        
                        // Set the actual number of bytes we're uploading for this part
                        nextFile.uploading_bytes = numBytesRead;
                        
                        // Release the resources
                        buffer.release();
                    }
                    catch(exVideo){
                        Ti.API.error("Exception with video upload: " + exVideo);
                        Omadi.service.sendErrorReport("Exception with video upload: " + exVideo);
                        errorOccurred = true;
                    }
                }
                
                if(!nextFile.loaded && !errorOccurred){
                    Ti.API.debug("Upload Part: " + nextFile.upload_part + "/" + nextFile.numUploadParts);
                    Ti.API.debug(nextFile);
                    
                    try{
                        nextFile.file_data = Ti.Utils.base64encode(imageBlob);
                        
                        try{
                            nextFile.file_data = nextFile.file_data.getText();
                        }
                        catch(ex6){
                            Omadi.service.sendErrorReport("Exception getting text of base64 photo of size " + imageBlob.length + ": " + ex6); 
                            // This photo is not going to upload correctly
                            readyForUpload = false;
                            errorOccurred = true;
                        }
                    }
                    catch(ex5){
                        Omadi.service.sendErrorReport("Exception base64 encoding photo of size " + imageBlob.length + ": " + ex5 + ", availableMemory " + Ti.Platform.availableMemory); 
                        // This photo is not going to upload correctly
                        readyForUpload = false;
                        errorOccurred = true;
                        
                        // A memory problem is usually the culprit here.
                        restartSuggested = true;
                    }
                }
                
                imageBlob = null;
            }
            
            imageFile = null;
        }
        catch(exAll){
            errorOccurred = true;
            Ti.API.error("File error: " + exAll);
            Omadi.service.sendErrorReport("File error: " + exAll);
        }
        
        if(errorOccurred){
            // Increment the file load tries counter
            listDB = Omadi.utils.openListDatabase();
            listDB.execute("UPDATE _files SET tries = (tries + 1) WHERE id = " + nextFile.id);
            listDB.close();
        }
        else{
            // We can use the current file to upload, so don't check another one
            return nextFile;
        }
    }
    
    // if(deleteFromDB){
        // Omadi.data.deletePhotoUpload(nextFile.id, false);
        // nextFile = null;
    // }
    
    if(Ti.App.isAndroid && restartSuggested){
        dialog = Ti.UI.createAlertDialog({
           buttonNames: ['Close App', 'Cancel'],
           cancel: 1,
           message: 'The Omadi app is currently using too much memory. An app restart is suggested.',
           title: 'Restart is Suggested' 
        });
        
        dialog.addEventListener('click', function(e){
            try{
               if(e.index == 0){
                   Omadi.service.sendErrorReport("Actually closing the app by user");
                   Omadi.utils.closeApp();
               } 
            }
            catch(ex){
                Omadi.service.sendErrorReport("exception the app is currently using too much memory: " + ex);
            }
        });
        
        dialog.show();
        
        Omadi.service.sendErrorReport("An Android restart was suggested.");
    }
    
    return null;
};

Omadi.data.debugDataSent = function(){"use strict";
    
    alert("The debug report was sent.");
    
    Ti.App.removeEventListener('errorReportSuccess', Omadi.data.debugDataSent);
    Ti.App.removeEventListener('errorReportFailed', Omadi.data.debugDataFailed);
};

Omadi.data.debugDataFailed = function(){"use strict";
    
    alert("Failed to send the debug report. Please try again.");
    
    Ti.App.removeEventListener('errorReportSuccess', Omadi.data.debugDataSent);
    Ti.App.removeEventListener('errorReportFailed', Omadi.data.debugDataFailed);
};

Omadi.data.sendDebugData = function(showResponse){"use strict";
    var message, files, db, result, nids, i;
    
    message = "--- DEBUG DATA --- ";
    if(showResponse){
        message += " --- USER SUBMITTED --- ";    
    }
    
    files = Omadi.data.getFileArray(false);
    
    message += JSON.stringify(files);
    
    nids = [];
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT nid FROM node WHERE nid <= 0");
    while(result.isValidRow()){
        nids.push(result.field(0, Ti.Database.FIELD_TYPE_INT));
        result.next();
    }
    result.close();
    db.close();
    
    for(i = 0; i < nids.length; i ++){
        message += JSON.stringify(Omadi.data.nodeLoad(nids[i]));
    }
    
    if(showResponse){
        Ti.App.removeEventListener('errorReportSuccess', Omadi.data.debugDataSent);
        Ti.App.addEventListener('errorReportSuccess', Omadi.data.debugDataSent);
        
        Ti.App.removeEventListener('errorReportFailed', Omadi.data.debugDataFailed);
        Ti.App.addEventListener('errorReportFailed', Omadi.data.debugDataFailed);
    }
    
    Omadi.service.sendErrorReport(message);
};

Omadi.data.resetDatabases = function(){"use strict";
    var listDB, db, gpsDB;
    
    Ti.App.Properties.setDouble('omadi:fullResetLastSync', Omadi.data.getLastUpdateTimestamp());
    
    // Do not remove files with a positive nid, as they can still be uploaded
    listDB = Omadi.utils.openListDatabase();
    listDB.execute("UPDATE _files SET nid = -1000000 WHERE nid <= 0");
    listDB.close();
    
    db = Omadi.utils.openMainDatabase();    
    if (Ti.App.isAndroid) {
        //Remove the database
        db.remove();
        db.close();
    }
    else {
        // The file isn't actually being deleted
        db.file.deleteFile();
        db.close();
    }

    // Install database with an empty version
    db = Omadi.utils.openMainDatabase();
    db.close();

    // Clear out the GPS database alerts
    gpsDB = Omadi.utils.openGPSDatabase();
    gpsDB.execute('DELETE FROM alerts');
    gpsDB.close();  
};


Omadi.data.processFetchedJson = function(){"use strict";
    var nodeType, mainDB, gpsDB, dbFile, tableName, GMT_OFFSET, dialog, newNotifications, numItems, secondDifference;
    
    try {
        //Parses response into strings
        
        // if (json.request_time && json.request_time !== null && json.request_time !== "") {
            // GMT_OFFSET = Number(json.request_time - app_timestamp);
            // //Ti.API.info(GMT_OFFSET + "  === " + json.request_time + " === " + app_timestamp);
            // Ti.App.Properties.setString("timestamp_offset", GMT_OFFSET);
        // }

        if (Omadi.service.fetchedJSON.delete_all === true || Omadi.service.fetchedJSON.delete_all === "true") {
            
            Ti.API.info("Reseting mainDB, delete_all is required");
            
            //If delete_all is present, delete all contents:
            Omadi.data.resetDatabases();
        }
        else{
            
            // Setup the timestamp offset to be used when saving UTC timestamps to the mobile database
            secondDifference = parseInt(Omadi.service.fetchedJSON.current_server_timestamp, 10);
            if(!isNaN(secondDifference)){
                secondDifference -= Omadi.utils.getUTCTimestamp();
                
                if(secondDifference){
                    Ti.App.Properties.setDouble("service:serverTimestampOffset", secondDifference);
                }
            }
        }

        numItems = parseInt(Omadi.service.fetchedJSON.total_item_count, 10);
        Ti.API.info("Total items to install: " + numItems);

        //If mainDB is already last version
        if (numItems == 0) {
            //mainDB.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');
            Omadi.data.setLastUpdateTimestamp(Omadi.service.fetchedJSON.request_time);
            
            if (Omadi.service.progressBar !== null) {
                Omadi.service.progressBar.set();
                Omadi.service.progressBar.close();
                Omadi.service.progressBar = null;
            }
            Ti.API.debug("Done with install - no items");
        }
        else {
            mainDB = Omadi.utils.openMainDatabase();
        
            if (Omadi.service.progressBar !== null) {
                //Set max value for progress bar
                Omadi.service.progressBar.set_max(numItems);
            }
            
            if (Omadi.data.getLastUpdateTimestamp() === 0) {
                mainDB.execute('UPDATE updated SET "url"="' + Omadi.DOMAIN_NAME + '" WHERE "rowid"=1');
            }

            Ti.API.info('######### Request time : ' + Omadi.service.fetchedJSON.request_time);

            //Omadi.data.setLastUpdateTimestamp(json.request_time);

            if ( typeof Omadi.service.fetchedJSON.vehicles !== 'undefined') {
                Ti.API.debug("Installing vehicles");
                Omadi.data.processVehicleJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.node_type !== 'undefined') {
                Ti.API.debug("Installing bundles");
                Omadi.data.processNodeTypeJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.fields !== 'undefined') {
                Ti.API.debug("Installing fields");
                Omadi.data.processFieldsJson(mainDB);
            }
            
            if ( typeof Omadi.service.fetchedJSON.fake_fields !== 'undefined') {
                Ti.API.debug("Installing fake fields");
                Omadi.data.processFakeFieldsJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.regions !== 'undefined') {
                Ti.API.debug("Installing regions");
                Omadi.data.processRegionsJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.vocabularies !== 'undefined') {
                Ti.API.debug("Installing vocabularies");
                Omadi.data.processVocabulariesJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.terms !== 'undefined') {
                Ti.API.debug("Installing terms");
                Omadi.data.processTermsJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.users !== 'undefined') {
                Ti.API.debug("Installing users");
                Omadi.data.processUsersJson(mainDB);
            }

            if ( typeof Omadi.service.fetchedJSON.node !== 'undefined') {
                Ti.API.debug("Installing nodes");
                for (tableName in Omadi.service.fetchedJSON.node) {
                    if (Omadi.service.fetchedJSON.node.hasOwnProperty(tableName)) {
                        if (Omadi.service.fetchedJSON.node.hasOwnProperty(tableName)) {
                            Omadi.data.processNodeJson(tableName, mainDB);
                        }
                    }
                }
            }
            
            if ( typeof Omadi.service.fetchedJSON.comment !== 'undefined') {
                Ti.API.debug("Installing comments");
                Omadi.data.processCommentJson(mainDB);
            }
            
            mainDB.close();
            
            Omadi.data.setLastUpdateTimestamp(Omadi.service.fetchedJSON.request_time);

            //Ti.API.info("SUCCESS");
            if (Omadi.service.progressBar !== null) {
                Omadi.service.progressBar.close();
                Omadi.service.progressBar = null;
            }
            
            Ti.App.fireEvent("omadi:syncInstallComplete");   
        }

        if ( typeof Omadi.service.fetchedJSON.new_app !== 'undefined' && Omadi.service.fetchedJSON.new_app.length > 0) {
            Ti.API.debug("New App: " + Omadi.service.fetchedJSON.new_app);
            Omadi.display.newAppAvailable(Omadi.service.fetchedJSON.new_app);
        }
        
        Omadi.bundles.dispatch.showNewDispatchJobs();
        Omadi.display.showNewNotificationDialog();
        
    }
    catch(ex) {
        alert("Saving Sync Data: " + ex);
    }
    finally {
        try {
            mainDB.close();
        }
        catch(nothing) {

        }
    }
};

Omadi.data.processVehicleJson = function(mainDB) {"use strict";
    try {
        if (Omadi.service.fetchedJSON.vehicles) {
            var queries = [], i;

            if ( Omadi.service.fetchedJSON.vehicles instanceof Array) {
                for (i in Omadi.service.fetchedJSON.vehicles) {
                    if (Omadi.service.fetchedJSON.vehicles.hasOwnProperty(i)) {
                        queries.push("INSERT OR REPLACE INTO _vehicles (make, model) VALUES ('" + dbEsc(Omadi.service.fetchedJSON.vehicles[i][0]) + "', '" + dbEsc(Omadi.service.fetchedJSON.vehicles[i][1]) + "' )");
                    }
                }
            }

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }
    }
    catch(ex) {
        alert("Inserting vehicles: " + ex);
    }
};

Omadi.data.processFakeFieldsJson = function(mainDB) {"use strict";
    var result, field_exists, queries, i, field_name, bundle;
    
    try {
        queries = [];

        if (Omadi.service.fetchedJSON.fake_fields.insert) {

            if (Omadi.service.fetchedJSON.fake_fields.insert.length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.fake_fields.insert.length; i++) {

                    if (Omadi.service.progressBar != null) {
                        Omadi.service.progressBar.set();
                    }
                    
                    field_name = Omadi.service.fetchedJSON.fake_fields.insert[i].field_name;
                    bundle = Omadi.service.fetchedJSON.fake_fields.insert[i].bundle;
    
                    result = mainDB.execute("SELECT COUNT(*) FROM fake_fields WHERE field_name='" + field_name + "' AND bundle='" + bundle + "'");
                    
                    field_exists = false;
                    if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {
                        field_exists = true;
                    }
                
                    result.close();
                    
                    if(!field_exists){
                        queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' TEXT"); 
                        queries.push("INSERT INTO fake_fields (bundle, field_name) VALUES ('" + bundle + "','" + field_name + "')");
                           
                    }
                }
            }
        }
        
        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
            
            // Reset the fake field cache
            Omadi.data.cache.fakeFields = {};
        }
    }
    catch(ex){
        alert("Saving extra fields: " + ex);
    }
};

Omadi.data.processFieldsJson = function(mainDB) {"use strict";
    /*global ROLE_ID_ADMIN, ROLE_ID_OMADI_AGENT*/
    var result, fid, field_exists, field_type, db_type, field_name, label, widgetString, 
        settingsString, region, part, queries, description, bundle, weight, required, 
        disabled, can_view, can_edit, settings, omadi_session_details, roles, 
        permissionsString, permIdx, roleIdx, i;
        
    try {
        queries = [];

        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;
        
        //Ti.API.debug(roles);

        if (Omadi.service.fetchedJSON.fields.insert) {
            //Ti.API.debug(json);
            
            if (Omadi.service.fetchedJSON.fields.insert.length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.fields.insert.length; i++) {

                    if (Omadi.service.progressBar != null) {
                        Omadi.service.progressBar.set();
                    }
                    
                    field_name = Omadi.service.fetchedJSON.fields.insert[i].field_name;
                    bundle = Omadi.service.fetchedJSON.fields.insert[i].bundle;
                    
                    settings = Omadi.service.fetchedJSON.fields.insert[i].settings;
                    widgetString = JSON.stringify(Omadi.service.fetchedJSON.fields.insert[i].widget);

                    settingsString = JSON.stringify(settings);

                    fid = Omadi.service.fetchedJSON.fields.insert[i].fid;
                    field_type = Omadi.service.fetchedJSON.fields.insert[i].type;
                    
                    label = Omadi.service.fetchedJSON.fields.insert[i].label;
                    description = Omadi.service.fetchedJSON.fields.insert[i].description;
                    
                    weight = Omadi.service.fetchedJSON.fields.insert[i].weight;
                    required = Omadi.service.fetchedJSON.fields.insert[i].required;
                    disabled = Omadi.service.fetchedJSON.fields.insert[i].disabled;
                    
                    if(typeof Omadi.service.fetchedJSON.fields.insert[i].settings.region !== 'undefined'){
                        region = Omadi.service.fetchedJSON.fields.insert[i].settings.region;
                    }
                    else{
                        region = "";
                    }

                    can_view = 0;
                    can_edit = 0;
                    
                    if (roles.hasOwnProperty(ROLE_ID_ADMIN) || roles.hasOwnProperty(ROLE_ID_OMADI_AGENT)) {
                        // Admin users can view/edit any field
                        can_view = can_edit = 1;
                    }
                    else if (settings.enforce_permissions != null && settings.enforce_permissions == 1) {
                        for (permIdx in settings.permissions) {
                            if (settings.permissions.hasOwnProperty(permIdx)) {
                                for (roleIdx in roles) {
                                    if (roles.hasOwnProperty(roleIdx)) {
                                        if (permIdx == roleIdx) {
                                            permissionsString = JSON.stringify(settings.permissions[permIdx]);
                                            if (permissionsString.indexOf('update') >= 0 || settings.permissions[permIdx].all_permissions) {
                                                can_edit = 1;
                                            }

                                            if (permissionsString.indexOf('view') >= 0 || settings.permissions[permIdx].all_permissions) {
                                                can_view = 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        // No permissions are enforced, so give permission to everybody
                        can_view = can_edit = 1;
                    }

                    result = mainDB.execute('SELECT COUNT(*) FROM fields WHERE fid = ' + fid);

                    field_exists = false;
                    if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {
                        field_exists = true;
                    }

                    result.close();

                    if (!field_exists) {

                        //switch(Omadi.service.fetchedJSON.fields.insert[i].type) {
                        //    // case "taxonomy_term_reference":
                        // case "user_reference":
                        // case "datestamp":
                        // case "omadi_time":
                        // case "number_integer":
                        // case "omadi_reference":
                        // case "list_boolean":
                        // if(Ti.App.isAndroid){
                        // db_type = "INTEGER";
                        // }
                        // else{
                        // db_type = 'TEXT';
                        // }
                        // break;
                        // case "number_decimal":
                        // db_type = "REAL";
                        // break;

                        //default:
                        db_type = "TEXT";
                        //    break;
                        // }

                        //Check if it is a valid bundle (automatically inserted through the API):
                        result = mainDB.execute("SELECT * FROM bundles WHERE bundle_name='" + bundle + "'");
                        if (result.isValidRow()) {
                            if (Omadi.service.fetchedJSON.fields.insert[i].settings.parts) {
                                for (part in Omadi.service.fetchedJSON.fields.insert[i].settings.parts) {
                                    if (Omadi.service.fetchedJSON.fields.insert[i].settings.parts.hasOwnProperty(part)) {
                                        queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___" + part + "' " + db_type);
                                    }
                                }
                            }
                            else {
                               
                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
                                
                                if (Omadi.service.fetchedJSON.fields.insert[i].type == 'file') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___filename' " + db_type);
                                }
                                else if (Omadi.service.fetchedJSON.fields.insert[i].type == 'extra_price') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___data' " + db_type);
                                }
                            }
                        }

                        result.close();

                        //Multiple parts
                        if (Omadi.service.fetchedJSON.fields.insert[i].settings.parts) {
                            for (part in Omadi.service.fetchedJSON.fields.insert[i].settings.parts) {
                                if (Omadi.service.fetchedJSON.fields.insert[i].settings.parts.hasOwnProperty(part)) {
                                    queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + dbEsc(field_type) + "','" + dbEsc(field_name + "___" + part) + "','" + dbEsc(label) + "','" + dbEsc(description) + "','" + dbEsc(bundle) + "','" + dbEsc(region) + "'," + weight + ", '" + dbEsc(required) + "' ,  '" + dbEsc(disabled) + "' , '" + dbEsc(widgetString) + "','" + dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                                }
                            }
                        }
                        //Normal field
                        else {
                            queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + dbEsc(field_type) + "','" + dbEsc(field_name) + "','" + dbEsc(label) + "','" + dbEsc(description) + "','" + dbEsc(bundle) + "','" + dbEsc(region) + "'," + weight + ",'" + dbEsc(required) + "','" + dbEsc(disabled) + "','" + dbEsc(widgetString) + "','" + dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                        }
                    }
                    else {
                        // The structure exists.... just update the fields table values
                        // This will work for fields with parts, as they are indexed by the same fid
                        queries.push("UPDATE fields SET type='" + dbEsc(field_type) + "', label='" + dbEsc(label) + "', description='" + dbEsc(description) + "', bundle='" + dbEsc(bundle) + "', region='" + dbEsc(region) + "', weight=" + weight + ", required='" + dbEsc(required) + "', disabled='" + dbEsc(disabled) + "', widget='" + dbEsc(widgetString) + "', settings='" + dbEsc(settingsString) + "', can_view=" + can_view + ", can_edit=" + can_edit + "  WHERE fid=" + fid);
                    }
                }
            }
        }

        if (Omadi.service.fetchedJSON.fields["delete"]) {
            if (Omadi.service.fetchedJSON.fields["delete"].length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.fields["delete"].length; i++) {
                    //Ti.API.info('FID: ' + Omadi.service.fetchedJSON.fields["delete"][i].fid + ' was deleted');
                    //Deletes rows from terms
                    queries.push('DELETE FROM fields WHERE fid=' + Omadi.service.fetchedJSON.fields["delete"][i].fid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
            
            // Reset the field cache
            Omadi.data.cache.fields = {};
        }
    }
    catch(ex) {
        alert("Saving fields: " + ex);
    }
};

Omadi.data.processCommentJson = function(mainDB) {"use strict";
    var i, j, queries;

    try {
        queries = [];

        //Insert - Users
        if (Omadi.service.fetchedJSON.comment.insert) {
            if (Omadi.service.fetchedJSON.comment.insert.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.comment.insert.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }

                    queries.push('INSERT OR REPLACE INTO comment (cid, nid, uid, subject, created, changed, status, name, body) VALUES (' + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].cid) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].nid) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].uid) + ",'" + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].subject) + "'," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].created) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].changed) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].status) + ",'" + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].name) + "','" + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].body) + "')");

                }
            }
        }


        //Delete - Comments
        // TODO: Implement the comment delete section
        // if (Omadi.service.fetchedJSON.users["delete"]) {
            // if (Omadi.service.fetchedJSON.users["delete"].length) {
                // for ( i = 0; i < Omadi.service.fetchedJSON.users["delete"].length; i++) {
                    // if (Omadi.service.progressBar != null) {
                        // //Increment Progress Bar
                        // Omadi.service.progressBar.set();
                    // }
// 
                    // //Deletes current row (contact)
                    // queries.push('DELETE FROM user WHERE uid=' + Omadi.service.fetchedJSON.users["delete"][i].uid);
                    // queries.push('DELETE FROM user_roles WHERE uid=' + Omadi.service.fetchedJSON.users["delete"][i].uid);
                // }
            // }
        // }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
                Ti.API.debug("Inserted a comment");
            }
            mainDB.execute("COMMIT TRANSACTION");
        }

    }
    catch(ex) {
        alert("Installing Comments: " + ex);
    }
};


Omadi.data.processUsersJson = function(mainDB) {"use strict";
    var i, j, queries;

    try {

        queries = [];

        //Insert - Users
        if (Omadi.service.fetchedJSON.users.insert) {
            if (Omadi.service.fetchedJSON.users.insert.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.users.insert.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }

                    queries.push('INSERT OR REPLACE  INTO user (uid, username, mail, realname, status ) VALUES (' + Omadi.service.fetchedJSON.users.insert[i].uid + ",'" + dbEsc(Omadi.service.fetchedJSON.users.insert[i].username) + "','" + dbEsc(Omadi.service.fetchedJSON.users.insert[i].mail) + "','" + dbEsc(Omadi.service.fetchedJSON.users.insert[i].realname) + "'," + Omadi.service.fetchedJSON.users.insert[i].status + ')');

                    if (Omadi.service.fetchedJSON.users.insert[i].roles.length) {
                        for ( j = 0; j < Omadi.service.fetchedJSON.users.insert[i].roles.length; j++) {
                            queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + Omadi.service.fetchedJSON.users.insert[i].uid + ',' + Omadi.service.fetchedJSON.users.insert[i].roles[j] + ')');
                        }
                    }
                    else {
                        queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + Omadi.service.fetchedJSON.users.insert[i].uid + ',' + Omadi.service.fetchedJSON.users.insert[i].roles + ')');
                    }
                }
            }
        }

        //Update - Users
        if (Omadi.service.fetchedJSON.users.update) {
            if (Omadi.service.fetchedJSON.users.update.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.users.update.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }
                    queries.push("UPDATE user SET username='" + dbEsc(Omadi.service.fetchedJSON.users.update[i].username) + "', mail='" + dbEsc(Omadi.service.fetchedJSON.users.update[i].mail) + "', realname='" + dbEsc(Omadi.service.fetchedJSON.users.update[i].realname) + "', status=" + Omadi.service.fetchedJSON.users.update[i].status + ' WHERE uid=' + Omadi.service.fetchedJSON.users.update[i].uid);

                    //Delete every row present at user_roles
                    queries.push('DELETE FROM user_roles WHERE uid=' + Omadi.service.fetchedJSON.users.update[i].uid);

                    //Insert it over again!
                    if (Omadi.service.fetchedJSON.users.update[i].roles) {
                        if (Omadi.service.fetchedJSON.users.update[i].roles.length) {
                            for ( j = 0; j < Omadi.service.fetchedJSON.users.update[i].roles.length; j++) {
                                queries.push('INSERT OR REPLACE INTO user_roles (uid, rid ) VALUES (' + Omadi.service.fetchedJSON.users.update[i].uid + ',' + Omadi.service.fetchedJSON.users.update[i].roles[j] + ')');
                            }
                        }
                        else {
                            queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + Omadi.service.fetchedJSON.users.update[i].uid + ',' + Omadi.service.fetchedJSON.users.update[i].roles + ')');
                        }
                    }
                }
            }
        }

        //Delete - Users
        if (Omadi.service.fetchedJSON.users["delete"]) {
            if (Omadi.service.fetchedJSON.users["delete"].length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.users["delete"].length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }

                    //Deletes current row (contact)
                    queries.push('DELETE FROM user WHERE uid=' + Omadi.service.fetchedJSON.users["delete"][i].uid);
                    queries.push('DELETE FROM user_roles WHERE uid=' + Omadi.service.fetchedJSON.users["delete"][i].uid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }

    }
    catch(ex) {
        alert("Installing Users: " + ex);
    }
};

Omadi.data.processNodeJson = function(type, mainDB) {"use strict";
    /*jslint nomen: true*/

    var closeDB, instances, fakeFields, queries, i, j, field_name, query, 
        fieldNames, no_data, values, value, notifications = {}, numSets, 
        result, reasonIndex, reason, alertReason, dialog, updateNid, 
        listDB, fullResetLastSync, nodeChangedTimestamp;
    
    
    fullResetLastSync = Ti.App.Properties.getDouble('omadi:fullResetLastSync', 0);
    
    // No full reset is happening after this process, so reset, the value is cached above
    Ti.App.Properties.setDouble('omadi:fullResetLastSync', 0);
    
    closeDB = false;
    queries = [];

    try {

        instances = Omadi.data.getFields(type);
        fakeFields = Omadi.data.getFakeFields(type);

        // Make sure the node type still exists
        result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name='" + type + "'");
        if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {

            //Insert
            if (Omadi.service.fetchedJSON && 
                Omadi.service.fetchedJSON.node && 
                typeof Omadi.service.fetchedJSON.node[type] !== 'undefined' &&
                Omadi.service.fetchedJSON.node[type] && 
                typeof Omadi.service.fetchedJSON.node[type].insert !== 'undefined' &&
                Omadi.service.fetchedJSON.node[type].insert) {
                
                
                //Ti.API.debug(Omadi.service.fetchedJSON.node[type]);
                //Multiple objects
                if (Omadi.service.fetchedJSON.node[type].insert.length) {
                    
                    Ti.API.debug("inserting " + type + " nodes: " + Omadi.service.fetchedJSON.node[type].insert.length);
                    
                    for ( i = 0; i < Omadi.service.fetchedJSON.node[type].insert.length; i++) {
                        
                        if(typeof Omadi.service.fetchedJSON.node[type].insert[i].__error !== 'undefined' && Omadi.service.fetchedJSON.node[type].insert[i].__error == 1){
                            
                            Ti.API.debug("HAS ERROR");
                            
                            //Ti.API.debug(Omadi.service.fetchedJSON.node[type].insert[i]);  
                            if(typeof Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons !== 'undefined'){
                                reason = Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons.join(", ");
                               
                                Ti.API.debug("Reason: " + reason);
                                
                                if(typeof Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid !== 'undefined'){
                                    updateNid = Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid;
                                }
                                else{
                                    updateNid = Omadi.service.fetchedJSON.node[type].insert[i].nid;
                                }
                                
                                reason += " The entry has been saved as a draft.";
                                queries.push('UPDATE node SET flag_is_updated=3 WHERE nid=' + updateNid);
                                
                                dialog = Ti.UI.createAlertDialog({
                                    title: "Recent Data Not Synched",
                                    message: reason,
                                    ok: 'Go to Drafts'
                                });
                                
                                dialog.addEventListener("click", Omadi.display.openDraftsWindow);
                                
                                dialog.show();
                            }
                        }
                        else{
                        
                            //Insert into node table
                            if ((Omadi.service.fetchedJSON.node[type].insert[i].title === null) || (Omadi.service.fetchedJSON.node[type].insert[i].title == 'undefined') || (Omadi.service.fetchedJSON.node[type].insert[i].title === false)) {
                                Omadi.service.fetchedJSON.node[type].insert[i].title = "No Title";
                            }
    
                            queries.push(Omadi.data.getNodeTableInsertStatement({
                                nid : Omadi.service.fetchedJSON.node[type].insert[i].nid,
                                perm_edit : Omadi.service.fetchedJSON.node[type].insert[i].perm_edit,
                                perm_delete : Omadi.service.fetchedJSON.node[type].insert[i].perm_delete,
                                created : Omadi.service.fetchedJSON.node[type].insert[i].created,
                                changed : Omadi.service.fetchedJSON.node[type].insert[i].changed,
                                title : Omadi.service.fetchedJSON.node[type].insert[i].title,
                                author_uid : Omadi.service.fetchedJSON.node[type].insert[i].author_uid,
                                flag_is_updated : 0,
                                table_name : type,
                                form_part : Omadi.service.fetchedJSON.node[type].insert[i].form_part,
                                changed_uid : Omadi.service.fetchedJSON.node[type].insert[i].changed_uid,
                                viewed : Omadi.service.fetchedJSON.node[type].insert[i].viewed,
                                dispatch_nid : Omadi.service.fetchedJSON.node[type].insert[i].dispatch_nid
                            }));
    
                            query = 'INSERT OR REPLACE  INTO ' + type + ' (';
    
                            fieldNames = [];
                            fieldNames.push('nid');
                            
                            for (field_name in instances) {
                                if (instances.hasOwnProperty(field_name)) {
                                    fieldNames.push("`" + field_name + "`");
                                    
                                    if(instances[field_name].type == 'file'){
                                        fieldNames.push(field_name + "___filename");
                                    }
                                    else if(instances[field_name].type == 'extra_price'){
                                        fieldNames.push(field_name + "___data");
                                    }
                                }
                            }
                            
                            for(field_name in fakeFields){
                                if(fakeFields.hasOwnProperty(field_name)){
                                    fieldNames.push("`" + field_name + "`");
                                }
                            }
    
                            //Ti.API.error(fieldNames);
                            
                            query += fieldNames.join(',');
                            query += ') VALUES (';
    
                            values = [];
                            values.push(Omadi.service.fetchedJSON.node[type].insert[i].nid);
    
                            for (field_name in instances) {
                                if(instances.hasOwnProperty(field_name)){
                                    
                                    if(instances[field_name].type == 'file'){
                                        
                                        if (typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___fid"] === "undefined" || Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___fid"] === null) {
                                            values.push("null");
                                        }
                                        else{
                                            value = Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___fid"];
        
                                            if ( value instanceof Array) {
                                                values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                            }
                                            else {
                                                values.push("'" + dbEsc(value) + "'");
                                            }
                                        }
                                        
                                        if (typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___filename"] === "undefined" || Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___filename"] === null) {
                                            values.push("null");
                                        }
                                        else{
                                            value = Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___filename"];
        
                                            if ( value instanceof Array) {
                                                values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                            }
                                            else {
                                                values.push("'" + dbEsc(value) + "'");
                                            }
                                        }
                                    }
                                    else if(instances[field_name].type == 'extra_price'){
                                        
                                        if (typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___value"] === "undefined" || Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___value"] === null) {
                                            values.push("null");
                                        }
                                        else{
                                            value = Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___value"];
                                            values.push("'" + dbEsc(value) + "'");
                                        }
                                      
                                        if (typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___data"] === "undefined" || Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___data"] === null) {
                                            values.push("null");
                                        }
                                        else{
                                            value = Omadi.service.fetchedJSON.node[type].insert[i][field_name + "___data"];
                                            values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                        }
                                    }
                                    else if (typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name] === "undefined" || Omadi.service.fetchedJSON.node[type].insert[i][field_name] === null) {
                                        values.push("null");
                                    }
                                    else {
                                        switch(instances[field_name].type) {
                                            case 'number_integer':
                                            case 'number_decimal':
                                            case 'omadi_reference':
                                            case 'taxonomy_term_reference':
                                            case 'user_reference':
                                            case 'list_boolean':
                                            case 'datestamp':
                                            case 'omadi_time':
                                            case 'image':
                                            
                                                value = Omadi.service.fetchedJSON.node[type].insert[i][field_name];
        
                                                if (typeof value === 'number') {
                                                    values.push(value);
                                                }
                                                else if ( typeof value === 'string') {
                                                    value = parseInt(value, 10);
                                                    if (isNaN(value)) {
                                                        values.push('null');
                                                    }
                                                    else {
                                                        values.push(value);
                                                    }
                                                }
                                                else if ( value instanceof Array) {
                                                    values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                                }
                                                else {
                                                    values.push("null");
                                                }
                                                break;
                
                                            default:
                                                value = Omadi.service.fetchedJSON.node[type].insert[i][field_name];
        
                                                if ( value instanceof Array) {
                                                    values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                                }
                                                else {
                                                    values.push("'" + dbEsc(value) + "'");
                                                }
                                                break;
                                        }
                                    }
                                }
                            }
                            
                            for(field_name in fakeFields){
                                if(fakeFields.hasOwnProperty(field_name)){
                                    
                                    if(typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name] !== 'undefined'){
                                        value = Omadi.service.fetchedJSON.node[type].insert[i][field_name];
                                        values.push("'" + dbEsc(value) + "'");
                                        //Ti.API.error("*" + value);
                                    }
                                    else{
                                        //Ti.API.error("nope");
                                       values.push("null");
                                    }
                                }
                            }
    
                            query += values.join(",");
                            query += ')';
                        
                            //Ti.API.debug(query);
                            
                            queries.push(query);
                            
                            // Don't display new items from a full reset, as it is just annoying
                            
                            nodeChangedTimestamp = parseInt(Omadi.service.fetchedJSON.node[type].insert[i].changed, 10);
                            
                            // Allow a notification or dispatch screen to be shown if this is not a full reset 
                            // OR if the node has actually changed even though this is a full reset
                            if((fullResetLastSync > 0 && nodeChangedTimestamp >= fullResetLastSync) || fullResetLastSync == 0){
                                
                                if(Omadi.service.fetchedJSON.node[type].insert[i].viewed == 0){
                                    if (type == 'notification') {
                                        notifications = Ti.App.Properties.getObject('newNotifications', {
                                            count : 0,
                                            nid : 0
                                        });
            
                                        Ti.App.Properties.setObject('newNotifications', {
                                            count : notifications.count + 1,
                                            nid : Omadi.service.fetchedJSON.node[type].insert[i].nid
                                        });
                                    }
                                }
                                
                                // Allow previously viewed dispatches to popup the dispatch screen
                                // The login of when that pops up is dependent on the server's response
                                //  and the code in the dispatch bundle .js file
                                if(type == 'dispatch' &&
                                        typeof Omadi.service.fetchedJSON.node[type].insert[i].dispatch_nid !== 'undefined' &&
                                        Omadi.service.fetchedJSON.node[type].insert[i].dispatch_nid > 0){
                                     
                                     Omadi.bundles.dispatch.checkInsertNode(Omadi.service.fetchedJSON.node[type].insert[i]);
                                }
                            }
                            
                            if ( typeof Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid !== 'undefined') {
                                Ti.API.debug("Deleting nid: " + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
                                
                                Ti.App.deletedNegatives[Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid] = Omadi.service.fetchedJSON.node[type].insert[i].nid;
                                
                                queries.push('DELETE FROM ' + type + ' WHERE nid=' + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
                                queries.push('DELETE FROM node WHERE nid=' + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
                                
                                listDB = Omadi.utils.openListDatabase();
                                listDB.execute("UPDATE _files SET nid =" + Omadi.service.fetchedJSON.node[type].insert[i].nid + " WHERE nid=" + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
                                listDB.close();
                                
                                // Make sure we don't add a duplicate from doing a next_part action directly after a node save
                                //if(typeof Ti.UI.currentWindow.nid !== 'undefined' && Ti.UI.currentWindow.nid == Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid){
                                //    Ti.API.error("SWITCHING UP THE NID from " + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid + " to " + Omadi.service.fetchedJSON.node[type].insert[i].nid);
                                
                                try{
                                    Ti.App.fireEvent('switchedItUp', {
                                        negativeNid : Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid,
                                        positiveNid : Omadi.service.fetchedJSON.node[type].insert[i].nid
                                    });
                                }
                                catch(switchedEx){
                                    Omadi.service.sendErrorReport("exception switching it up: " + switchedEx);
                                }
                            }
                            
                            // Set signature fields to show as uploaded
                            for (field_name in instances) {
                                if(instances.hasOwnProperty(field_name)){
                                    if(instances[field_name].type == 'image'){
                                        
                                        if(typeof instances[field_name].widget !== 'undefined' &&
                                            typeof instances[field_name].widget.type !== 'undefined' &&
                                            instances[field_name].widget.type &&
                                            instances[field_name].widget.type == 'omadi_image_signature'){
                                                
                                                // Remove the signature from the non-uploaded list since it was synched in the original form JSON
                                                listDB = Omadi.utils.openListDatabase();
                                                listDB.execute("UPDATE _files SET finished = " + Omadi.utils.getUTCTimestamp() + " WHERE nid=" + Omadi.service.fetchedJSON.node[type].insert[i].nid + " AND type='signature'");
                                                listDB.close();
                                                
                                                // The DB query only needs to be done once for all fields if multiple signature fields exist on the form
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (typeof Omadi.service.fetchedJSON.node !== 'undefined' && 
                typeof Omadi.service.fetchedJSON.node[type] !== 'undefined' && 
                Omadi.service.fetchedJSON.node[type] && 
                typeof Omadi.service.fetchedJSON.node[type]['delete'] !== 'undefined' && 
                Omadi.service.fetchedJSON.node[type]['delete'] && 
                Omadi.service.fetchedJSON.node[type]['delete'].length) {
                    
                    for ( i = 0; i < Omadi.service.fetchedJSON.node[type]['delete'].length; i++) {
                        queries.push("DELETE FROM node WHERE nid = " + Omadi.service.fetchedJSON.node[type]['delete'][i].nid);
                        queries.push("DELETE FROM " + type + " WHERE nid = " + Omadi.service.fetchedJSON.node[type]['delete'][i].nid);
                    }   
            }

            closeDB = false;
            if ( typeof mainDB === 'undefined') {
                mainDB = Omadi.utils.openMainDatabase();
                closeDB = true;
            }
            //mainDB.execute("BEGIN IMMEDIATE TRANSACTION");

            numSets = 0;

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");

            if (Omadi.service.progressBar != null) {
                for ( i = 0; i < queries.length; i++) {
                    // Don't allow one bad node to ruin the rest of the inserts
                    // Do a try/catch for each one
                    try{
                        mainDB.execute(queries[i]);
                        if (i % 4 == 0) {
                            Omadi.service.progressBar.set();
                            numSets++;
                        }   
                    }
                    catch(ex1) {
                        Ti.API.error("Saving single Node Data from JSON: " + ex1);
                        alert("Error saving node Data for " + type + ": " + ex1 + ". Details: " + queries[i]);
                    }
                }
            }
            else {
                for ( i = 0; i < queries.length; i++) {
                    // Don't allow one bad node to ruin the rest of the inserts
                    // Do a try/catch for each one
                    try{
                        mainDB.execute(queries[i]); 
                    }
                    catch(ex2) {
                        Ti.API.error("Saving single Node Data from JSON: " + ex2);
                        alert("Error saving node Data for " + type + ": " + ex2 + ". Details: " + queries[i]);
                    }
                }
            }

            mainDB.execute("COMMIT TRANSACTION");
        }

        if (Omadi.service.progressBar != null && typeof Omadi.service.fetchedJSON.node[type].insert != 'undefined') {
            for ( i = numSets; i < Omadi.service.fetchedJSON.node[type].insert.length; i++) {
                Omadi.service.progressBar.set();
            }
        }
    }
    catch(ex) {
        Ti.API.error("Saving Node Data from JSON: " + ex);
        Omadi.service.sendErrorReport("Exception saving from sync: " + ex);
        alert("Saving Form Data for " + type + ": " + ex);
        
    }
    finally {
        try {
            if (closeDB) {
                mainDB.close();
            }
        }
        catch(nothing) {

        }
    }

};

Omadi.data.processVocabulariesJson = function(mainDB) {"use strict";
    var queries = [], i, vid, name, machine_name;
    try {
        
        if (typeof Omadi.service.fetchedJSON !== 'undefined' && typeof Omadi.service.fetchedJSON.vocabularies !== 'undefined'){
            
            if (typeof Omadi.service.fetchedJSON.vocabularies.insert !== 'undefined' &&
                Omadi.service.fetchedJSON.vocabularies.insert &&
                Omadi.service.fetchedJSON.vocabularies.insert.length) {
    
                    for ( i = 0; i < Omadi.service.fetchedJSON.vocabularies.insert.length; i++) {
                        //Increment Progress Bar
                        if (Omadi.service.progressBar != null) {
                            Omadi.service.progressBar.set();
                        }
                        vid = Omadi.service.fetchedJSON.vocabularies.insert[i].vid;
                        name = Omadi.service.fetchedJSON.vocabularies.insert[i].name;
                        machine_name = Omadi.service.fetchedJSON.vocabularies.insert[i].machine_name;
    
                        //Ti.API.info("About to insert vocabulary: "+vid_v);
                        queries.push('INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid + ",'" + dbEsc(name) + "','" + dbEsc(machine_name) + "')");
                    }
            }
            if (typeof Omadi.service.fetchedJSON.vocabularies.update !== 'undefined' &&
                Omadi.service.fetchedJSON.vocabularies.update &&
                Omadi.service.fetchedJSON.vocabularies.update.length) {
                    
                    for ( i = 0; i < Omadi.service.fetchedJSON.vocabularies.update.length; i++) {
                        if (Omadi.service.progressBar != null) {
                            //Increment Progress Bar
                            Omadi.service.progressBar.set();
                        }
    
                        queries.push("UPDATE vocabulary SET name='" + dbEsc(Omadi.service.fetchedJSON.vocabularies.insert[i].name) + "', machine_name='" + dbEsc(Omadi.service.fetchedJSON.vocabularies.update[i].machine_name) + "' WHERE vid=" + Omadi.service.fetchedJSON.vocabularies.update[i].vid);
                    }
            }
            
            if (typeof Omadi.service.fetchedJSON.vocabularies["delete"] !== 'undefined' && 
                Omadi.service.fetchedJSON.vocabularies["delete"] &&
                Omadi.service.fetchedJSON.vocabularies["delete"].length) {
             
                    for ( i = 0; i < Omadi.service.fetchedJSON.vocabularies["delete"].length; i++) {
                        if (Omadi.service.progressBar != null) {
                            //Increment Progress Bar
                            Omadi.service.progressBar.set();
                        }
    
                        //Deletes rows from terms
                        queries.push('DELETE FROM term_data WHERE vid=' + Omadi.service.fetchedJSON.vocabularies["delete"][i].vid);
    
                        //Deletes corresponding rows in vocabulary
                        queries.push('DELETE FROM vocabulary WHERE vid=' + Omadi.service.fetchedJSON.vocabularies["delete"][i].vid);
                    }
            }
    
            if (queries.length > 0) {
    
                mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
                for ( i = 0; i < queries.length; i++) {
                    mainDB.execute(queries[i]);
                }
                mainDB.execute("COMMIT TRANSACTION");
    
            }
        }
    }
    catch(ex) {
        alert("Installing vocabularies: " + ex);
    }
};

Omadi.data.processRegionsJson = function(mainDB) {"use strict";
    var i, queries, settings;

    try {
        queries = [];

        //Insert - Regions
        if (Omadi.service.fetchedJSON.regions.insert) {
            if (Omadi.service.fetchedJSON.regions.insert.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.regions.insert.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }

                    //Encode:
                    settings = JSON.stringify(Omadi.service.fetchedJSON.regions.insert[i].settings);

                    queries.push('INSERT OR REPLACE INTO regions (rid, node_type, label, region_name, weight, settings ) VALUES (' + Omadi.service.fetchedJSON.regions.insert[i].rid + ", '" + dbEsc(Omadi.service.fetchedJSON.regions.insert[i].node_type) + "','" + dbEsc(Omadi.service.fetchedJSON.regions.insert[i].label) + "','" + dbEsc(Omadi.service.fetchedJSON.regions.insert[i].region_name) + "'," + Omadi.service.fetchedJSON.regions.insert[i].weight + ",'" + dbEsc(settings) + "')");
                }
            }
        }

        //Update - Regions
        if (Omadi.service.fetchedJSON.regions.update) {
            if (Omadi.service.fetchedJSON.regions.update.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.regions.update.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        Omadi.service.progressBar.set();
                    }
                    queries.push("UPDATE regions SET node_type='" + dbEsc(Omadi.service.fetchedJSON.regions.update[i].node_type) + "', label='" + dbEsc(Omadi.service.fetchedJSON.regions.update[i].label) + "', region_name='" + dbEsc(Omadi.service.fetchedJSON.regions.update[i].region_name) + "', weight=" + Omadi.service.fetchedJSON.regions.update[i].weight + ", settings='" + dbEsc(JSON.stringify(Omadi.service.fetchedJSON.regions.update[i].settings)) + "' WHERE rid=" + Omadi.service.fetchedJSON.regions.update[i].rid);
                }
            }
        }

        //Delete - Regions
        if (Omadi.service.fetchedJSON.regions["delete"]) {
            if (Omadi.service.fetchedJSON.regions["delete"].length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.regions["delete"].length; i++) {
                    if (Omadi.service.progressBar != null) {
                        Omadi.service.progressBar.set();
                    }
                    queries.push('DELETE FROM regions WHERE rid=' + Omadi.service.fetchedJSON.regions["delete"][i].rid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
            
            // Reset the region cache
            Omadi.data.cache.regions = {};
        }
    }
    catch(ex) {
        alert("Installing regions: " + ex);
    }
};

Omadi.data.processTermsJson = function(mainDB) {"use strict";
    /*jslint nomen: true*/
    var i, vid, tid, name, desc, weight, queries;

    try {
        queries = [];
       
        Ti.API.error(JSON.stringify(Omadi.service.fetchedJSON.terms));
       
        if (Omadi.service.fetchedJSON.terms.insert) {
            if (Omadi.service.fetchedJSON.terms.insert.length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.terms.insert.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }

                    vid = Omadi.service.fetchedJSON.terms.insert[i].vid;
                    tid = Omadi.service.fetchedJSON.terms.insert[i].tid;
                    name = Omadi.service.fetchedJSON.terms.insert[i].name;
                    desc = Omadi.service.fetchedJSON.terms.insert[i].description;
                    desc = JSON.stringify(desc);
                    weight = Omadi.service.fetchedJSON.terms.insert[i].weight;
                    
                    if (weight == null) {
                        weight = 0;
                    }

                    queries.push('INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid + ',' + vid + ",'" + dbEsc(name) + "','" + dbEsc(desc) + "','" + dbEsc(weight) + "')");
                    if ( typeof Omadi.service.fetchedJSON.terms.insert[i].__negative_tid !== 'undefined') {
                        queries.push('DELETE FROM term_data WHERE tid=' + Omadi.service.fetchedJSON.terms.insert[i].__negative_tid);
                    }
                }
            }
        }
        if (Omadi.service.fetchedJSON.terms.update) {
            if (Omadi.service.fetchedJSON.terms.update.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.terms.update.length; i++) {

                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }
                    
                    vid = Omadi.service.fetchedJSON.terms.update[i].vid;
                    tid = Omadi.service.fetchedJSON.terms.update[i].tid;
                    name = Omadi.service.fetchedJSON.terms.update[i].name;
                    desc = Omadi.service.fetchedJSON.terms.update[i].description;
                    desc = JSON.stringify(desc);
                    weight = Omadi.service.fetchedJSON.terms.update[i].weight;
                    
                    if (weight == null) {
                        weight = 0;
                    }
                    
                    queries.push("UPDATE term_data SET name='" + dbEsc(name) + "', description='" + dbEsc(desc) + "', weight='" + dbEsc(weight) + "', vid=" + vid + ' WHERE tid=' + tid);
                }
            }
        }
        if (Omadi.service.fetchedJSON.terms["delete"]) {
            if (Omadi.service.fetchedJSON.terms["delete"].length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.terms["delete"].length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }
                    queries.push('DELETE FROM term_data WHERE tid=' + Omadi.service.fetchedJSON.terms["delete"][i].tid);
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
            }
            mainDB.execute("COMMIT TRANSACTION");
        }
    }
    catch(ex) {
        alert("Installing terms: " + ex);
    }
};

Omadi.data.processNodeTypeJson = function(mainDB) {"use strict";
    /*global ROLE_ID_ADMIN, ROLE_ID_OMADI_AGENT */
    var queries, roles, i, type, perm_idx, role_idx, bundle_result, 
        app_permissions, title_fields, data, display, description, 
        disabled, is_disabled, permission_string, childForms, resetBundles;
    
    resetBundles = [];
    
    try {
        //Node types creation:
        queries = [];

        roles = Ti.App.Properties.getObject("userRoles", {});

        //Node type inserts
        if (Omadi.service.fetchedJSON.node_type.insert) {
            if (Omadi.service.fetchedJSON.node_type.insert.length) {
            
                Ti.API.debug("node_type: " + JSON.stringify(Omadi.service.fetchedJSON.node_type));

                for ( i = 0; i < Omadi.service.fetchedJSON.node_type.insert.length; i++) {
                    type = Omadi.service.fetchedJSON.node_type.insert[i].type;

                    if (type != 'user' && type != '') {
                        
                        //Increment the progress bar
                        if (Omadi.service.progressBar != null) {
                            Omadi.service.progressBar.set();
                        }

                        bundle_result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name = '" + type + "'");
                        if (bundle_result.field(0, Ti.Database.FIELD_TYPE_INT) === 0) {
                            Ti.API.debug("CREATING TABLE " + type);
                            queries.push("CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                        }
                        
                        data = [];
                        if(typeof Omadi.service.fetchedJSON.node_type.insert[i].data !== 'undefined'){
                            data = Omadi.service.fetchedJSON.node_type.insert[i].data;
                        }
                        
                        title_fields = [];
                        if(typeof data.title_fields !== 'undefined'){
                            title_fields = data.title_fields;        
                        }
                        
                        childForms = '';
                        if(typeof Omadi.service.fetchedJSON.node_type.insert[i].child_forms !== 'undefined'){
                            childForms = Omadi.service.fetchedJSON.node_type.insert[i].child_forms;
                        }
                        
                        display = Omadi.service.fetchedJSON.node_type.insert[i].name.toUpperCase();
                        //n_bund.fieldByName("display_name").toUpperCase();
                        description = Omadi.service.fetchedJSON.node_type.insert[i].description;
                        //n_bund.fieldByName("description");
                        disabled = Omadi.service.fetchedJSON.node_type.insert[i].disabled;
                        is_disabled = (disabled == 1 ? true : false);
                        //n_bund.fieldByName("disabled");

                        app_permissions = {
                            can_create : 0,
                            can_update : 0,
                            all_permissions : 0,
                            can_view : 0
                        };


                        if (data.no_mobile_display != null && data.no_mobile_display == 1) {
                            is_disabled = true;
                        }

                        if (!is_disabled) {
                            if ( typeof roles !== 'undefined') {

                                if (roles.hasOwnProperty(ROLE_ID_ADMIN) || roles.hasOwnProperty(ROLE_ID_OMADI_AGENT)) {
                                    app_permissions.can_create = 1;
                                    app_permissions.all_permissions = 1;
                                    app_permissions.can_update = 1;
                                    app_permissions.can_view = 1;
                                }
                                else {

                                    for (perm_idx in data.permissions) {
                                        if (data.permissions.hasOwnProperty(perm_idx)) {
                                            for (role_idx in roles) {
                                                if (roles.hasOwnProperty(role_idx)) {
                                                    if (perm_idx == role_idx) {

                                                        permission_string = JSON.stringify(data.permissions[perm_idx]);

                                                        if (data.permissions[perm_idx].all_permissions) {
                                                            app_permissions.all_permissions = 1;
                                                            app_permissions.can_update = 1;
                                                            app_permissions.can_view = 1;
                                                            app_permissions.can_create = 1;
                                                        }
                                                        else {
                                                            if (data.permissions[perm_idx]["can create"]) {
                                                                app_permissions.can_create = 1;
                                                            }

                                                            if (permission_string.indexOf('update') >= 0) {
                                                                app_permissions.can_update = 1;
                                                            }

                                                            if (permission_string.indexOf('view') >= 0) {
                                                                app_permissions.can_view = 1;
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

                        queries.push("INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data, can_create, can_view, child_forms) VALUES ('" + dbEsc(type) + "', '" + dbEsc(display) + "','" + dbEsc(description) + "','" + dbEsc(JSON.stringify(title_fields)) + "','" + dbEsc(JSON.stringify(data)) + "'," + app_permissions.can_create + "," + app_permissions.can_view + ",'" + dbEsc(JSON.stringify(childForms)) + "')");
                        
                        resetBundles.push(type);
                    }
                }
            }
        }
        else if (Omadi.service.fetchedJSON.node_type['delete']) {
            //Multiple node type deletions
            if (Omadi.service.fetchedJSON.node_type['delete'].length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.node_type['delete'].length; i++) {
                    //Increment the progress bar
                    if (Omadi.service.progressBar !== null) {
                        Omadi.service.progressBar.set();
                    }
                    queries.push("DROP TABLE " + Omadi.service.fetchedJSON.node_type.insert[i].type);
                    queries.push("DELETE FROM bundles WHERE bundle_name = '" + Omadi.service.fetchedJSON.node_type.insert[i].type + "'");
                    queries.push("DELETE FROM node WHERE table_name = '" + Omadi.service.fetchedJSON.node_type.insert[i].type + "'");
                }
            }
            //Unique node deletion
            else {
                if (Omadi.service.progressBar !== null) {
                    Omadi.service.progressBar.set();
                }
                queries.push("DROP TABLE " + Omadi.service.fetchedJSON.node_type.insert.type);
                queries.push("DELETE FROM bundles WHERE bundle_name = '" + Omadi.service.fetchedJSON.node_type.insert.type + "'");
                queries.push("DELETE FROM node WHERE table_name = '" + Omadi.service.fetchedJSON.node_type.insert.type + "'");
            }
        }

        //DB operations
        mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
        for ( i = 0; i < queries.length; i++) {
            mainDB.execute(queries[i]);
        }
        mainDB.execute("COMMIT TRANSACTION");
        
        if(resetBundles.length > 0){
            for(i = 0; i < resetBundles.length; i ++){
                // Just clear the bundle cache for other functions to use correctly
                Omadi.data.getBundle(resetBundles[i], true);
            }
        }

        Ti.API.info("Success for node_types, db operations ran smoothly!");
    }
    catch(ex) {
        alert("Installing form types: " + ex);
        Omadi.service.sendErrorReport("FATAL Exception installing form types: " + ex);
    }
};

Omadi.data.loadTerm = function(tid) {"use strict";
    var db, result, term;
    term = {};

    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT tid, vid, name, weight FROM term_data WHERE tid = " + tid);
    if (result.isValidRow()) {
        term.tid = result.fieldByName('tid', Ti.Database.FIELD_TYPE_INT);
        term.vid = result.fieldByName('vid', Ti.Database.FIELD_TYPE_INT);
        term.name = result.fieldByName('name', Ti.Database.FIELD_TYPE_STRING);
        term.weight = result.fieldByName('weight', Ti.Database.FIELD_TYPE_INT);
    }
    result.close();
    db.close();

    return term;
};
