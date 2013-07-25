

/*jslint plusplus:true,eqeq:true,nomen:true*/

Omadi.data = Omadi.data || {};

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
    if (string === null) {
        return '';
    }

    if ( typeof string === 'undefined') {
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

Omadi.data.getLastUpdateTimestamp = function() {"use strict";

    var result, timestamp = 0, db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
    if (result.isValidRow()) {
        timestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
    }
    result.close();
    db.close();

    return timestamp;
    //return Ti.App.Properties.getDouble("sync_timestamp", 0);
};

Omadi.data.getBundle = function(type) {"use strict";
    var db, result, bundle = null;

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
    }

    result.close();
    db.close();

    return bundle;
};

var _staticFields = {};
Omadi.data.getFields = function(type) {"use strict";
    var db, result, instances, field_name, nameParts;

    if ( typeof _staticFields[type] !== 'undefined') {
        instances = _staticFields[type];
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

        _staticFields[type] = instances;
    }

    return instances;
};

var _staticFakeFields = {};
Omadi.data.getFakeFields = function(type){"use strict";
    var db, result, fakeFields, field_name, nameParts;

    if ( typeof _staticFakeFields[type] !== 'undefined') {
        fakeFields = _staticFakeFields[type];
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

        _staticFakeFields[type] = fakeFields;
    }

    return fakeFields;
};

Omadi.data.getRegions = function(type) {"use strict";

    var db, result, regions, region_name, region_settings;

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

    return regions;
};

Omadi.data.getNewNodeNid = function() {"use strict";
    var db, result, smallestNid;
    //Get smallest nid
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT MIN(nid) FROM node");

    if (result.isValidRow()) {
        smallestNid = result.field(0, Ti.Database.FIELD_TYPE_INT);

        if (smallestNid > 0) {
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
  
  Ti.UI.currentWindow.saveContinually = false;
  
  if(typeof Ti.UI.currentWindow.continuous_nid !== 'undefined' && Ti.UI.currentWindow.continuous_nid != null){
      // Don't keep saving as the window should now close
      Ti.API.debug("deleting some nids: " + Ti.UI.currentWindow.continuous_nid);
      
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
          
          Ti.API.debug("DELETING: " + deleteNids[i]);
          Omadi.data.deleteNode(deleteNids[i]);
          
          
      }
  }
};

Omadi.data.trySaveNode = function(node, saveType){"use strict";
    var dialog;
    /*jslint nomen: true*/
    
    if(typeof saveType === 'undefined'){
        saveType = 'regular';
    }
    
    // Allow instant saving of drafts and continuous saves
    // Do not allow drafts or continuous saves to happen while an update is happening as it can cause problems
    if(Omadi.data.isUpdating()){
        Omadi.display.loading("Waiting...");
        setTimeout(function(){
            Omadi.data.trySaveNode(node, saveType);
        }, 1000);
    }
    else{
        
        Omadi.display.doneLoading();
        
        if(saveType != 'continuous'){
            Omadi.display.loading("Saving...");
        }
        
        try{
            
            // Do not allow the web server's data in a background update
            // to overwrite the local data just being saved
            Ti.App.allowBackgroundUpdate = false;
            
            node = Omadi.data.nodeSave(node);
            
            // Now that the node is saved on the phone or a big error occurred, allow background logouts
            Ti.App.allowBackgroundLogout = true;
            
            if(node._saved === true){
                // Don't set the node as saved on a continuous save, as that can mess up windows closing, etc.
                if(!node._isContinuous){
                    Ti.UI.currentWindow.nodeSaved = true;
                }
            }
            
            // Setup the current node and nid in the window so a duplicate won't be made for this window
            Ti.UI.currentWindow.node = node;
            Ti.UI.currentWindow.nid = node.nid;
            
            //Omadi.display.doneLoading();
            
            if(node._saved === true){
                
                if(node._isContinuous === true){
                    // Keep the window open, do not sync
                    Omadi.display.doneLoading();
                }
                else{
                    
                    Ti.App.fireEvent("savedNode");
                    // Delete the continuous node if one exists
                    Omadi.data.deleteContinuousNodes();
                    
                    if(typeof node._deleteNid !== 'undefined' && node._deleteNid < 0){
                        Omadi.data.deleteNode(node._deleteNid);
                    }
                    
                    if(node._isDraft === true){
                        Ti.UI.currentWindow.close();
                    }
                    else if(Ti.Network.online){
                        
                        if (saveType === "next_part") {    
                            
                            Ti.App.fireEvent('openForm', {
                                node_type: node.type,
                                nid: node.nid,
                                form_part: node.form_part + 1
                            });                       
                        }
                        else if(saveType == 'new'){
                            
                            Ti.App.fireEvent('openForm', {
                                node_type: node.type,
                                nid: node.nid,
                                form_part: node.type
                            });
                        }
                        
                        Ti.App.fireEvent('sendUpdates');
                        Ti.UI.currentWindow.close();
                    }
                    else{
                        if(Ti.UI.currentWindow.url.indexOf('form.js') !== -1){
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Form Validation',
                                buttonNames : ['OK'],
                                message: 'Alert management of this ' + node.type.toUpperCase() + ' immediately. You do not have an Internet connection right now.  Your data was saved and will be synched when you connect to the Internet.'
                            });
                            
                            dialog.show();
                            
                            dialog.addEventListener('click', function(ev) {
                                
                                if (saveType === "next_part") {
                                    // Omadi.display.openFormWindow(node.type, node.nid, node.form_part + 1);
                                    Ti.App.fireEvent('openForm', {
                                        node_type: node.type,
                                        nid: node.nid,
                                        form_part: node.form_part + 1
                                    });
                                }
                                else if(saveType == 'new'){
                                    //Omadi.display.openFormWindow(node.type, node.nid, node.type);
                                    
                                    Ti.App.fireEvent('openForm', {
                                        node_type: node.type,
                                        nid: node.nid,
                                        form_part: node.type
                                    });
                                }
                                
                                Omadi.display.loading();
                                
                                Ti.UI.currentWindow.close();
                            });
                        }
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

Omadi.data.nodeSave = function(node) {"use strict";
    var query, field_name, fieldNames, instances, result, db, smallestNid, insertValues, j, k, 
        instance, value_to_insert, has_data, content_s, saveNid, continuousNid, photoNids, origNid,
        continuousId, tempNid;

    /*global treatArray*/
    /*jslint nomen: true*/

    node._saved = false;

    instances = Omadi.data.getFields(node.type);

    fieldNames = [];

    for (field_name in instances) {
        if (instances.hasOwnProperty(field_name)) {
            if (field_name != null && typeof instances[field_name] !== 'undefined') {
                
                // Don't save anything for file or rules_field, as they are read-only for mobile devices
                if(instances[field_name].type != 'file' && instances[field_name].type != 'rules_field'){
                    fieldNames.push(field_name);
                }
            }
        }
    }

    if(typeof Omadi.widgets !== 'undefined'){
        // For autocomplete widgets
        node = Omadi.widgets.taxonomy_term_reference.addNewTerms(node);
    }

    node.title = Omadi.data.getNodeTitle(node);
    
    // Setup the default for the saveNid
    saveNid = node.nid;
    
    if(node._isContinuous){
        
        // Start a new record if the continuous_nid isn't set
        if(typeof Ti.UI.currentWindow.continuous_nid == 'undefined' || Ti.UI.currentWindow.continuous_nid == null || Ti.UI.currentWindow.continuous_nid == 0){
            Ti.UI.currentWindow.continuous_nid = Omadi.data.getNewNodeNid();
        }
        
        // Save the actual nid as the continuous negative NID
        saveNid = Ti.UI.currentWindow.continuous_nid;
        
        // The continuous_nid will be saved as the current window's NID
    }
    else if (node.nid == 'new') {
        Ti.API.debug("Saving new node");
        node.nid = saveNid = Omadi.data.getNewNodeNid();
    }
    else if(node._isDraft){
        // This else if must come after the node.nid == 'new'
        
        // If the draft is already saved as a negative nid, then don't generate a new one
        // If this node has a positive nid, make sure we create a copy with a new negative nid
        if(node.nid > 0){
            node.origNid = node.nid;
            saveNid = Omadi.data.getNewNodeNid();
        }
    }
    else if(typeof node.flag_is_updated !== 'undefined' && node.flag_is_updated == 3){
        // This was saved as a draft, and we are doing a regular save
        // Delete the draft version after a successful node save
        // The continuous_nid is actually the originally saved draft, 
        // as a continuous save is saved over the original draft
        // The logic elsewhere will not delete the node unless the node is correctly saved
        node._deleteNid = node.continuous_nid;
    }
    
    if(typeof node.sync_hash === 'undefined' || node.sync_has == null){
        node.sync_hash = Ti.Utils.md5HexDigest(JSON.stringify(node) + (new Date()).getTime());
    }
    
    db = Omadi.utils.openMainDatabase();
    
    try {

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
                        else {
                            if (node[field_name].dbValues.length == 1) {
                                value_to_insert = node[field_name].dbValues.pop();
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
    
                                if (Omadi.utils.isEmpty(value_to_insert)) {
                                    value_to_insert = "null";
                                }
    
                                insertValues.push("'" + dbEsc(value_to_insert) + "'");
                                break;
    
                            case 'number_decimal':
                            case 'number_integer':
                            case 'list_boolean':
                            case 'calculation_field':
    
                                if (Omadi.utils.isEmpty(value_to_insert) && value_to_insert != 0) {
                                    insertValues.push('null');
                                }
                                else {
                                    insertValues.push("'" + dbEsc(value_to_insert) + "'");
                                }
                                break;
    
                            default:
    
                                insertValues.push("'" + dbEsc(value_to_insert) + "'");
                                break;
                        }
                    }
                }
            }
    
            query += insertValues.join(',');
            query += ")";
    
            //Ti.API.error(query);
    
            db.execute(query);
        }

        try {
            if (node._isContinuous) {          
                Ti.API.debug("SAVING TO CONTINUOUS: " + saveNid + " " + Ti.UI.currentWindow.nid);    
                
                continuousNid = Ti.UI.currentWindow.nid;
                if(continuousNid == 'new'){
                    continuousNid = 0;
                } 
                db.execute("INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",4,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1," + continuousNid + ")");
            }
            else if (node._isDraft) {
                // if (saveNid > 0) {
                    // db.execute("UPDATE node SET changed=" + node.changed + ", changed_uid=" + node.changed_uid + ", title='" + dbEsc(node.title) + "', flag_is_updated=3, table_name='" + node.type + "', form_part=" + node.form_part + ", no_data_fields='" + node.no_data + "',viewed=" + node.viewed + " WHERE nid=" + saveNid);
                // }
                // else {
                origNid = "null";
                if(typeof node.origNid !== 'undefined'){
                    origNid = node.origNid;
                }
                
                Ti.API.debug("SAVING DRAFT: " + saveNid + " " + origNid);
                // Only save drafts as a negative nid
                db.execute("INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete, continuous_nid) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",3,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1," + origNid + ")");
                //}
            }
            else if (saveNid > 0) {
                db.execute("UPDATE node SET changed=" + node.changed + ", changed_uid=" + node.changed_uid + ", title='" + dbEsc(node.title) + "', flag_is_updated=1, table_name='" + node.type + "', form_part=" + node.form_part + ", no_data_fields='" + node.no_data + "',viewed=" + node.viewed + " WHERE nid=" + saveNid);
            }
            else {
                // Give all permissions for this node. Once it comes back, the correct permissions will be there.  If it never gets uploaded, the user should be able to do whatever they want with that info.
                db.execute("INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete) VALUES (" + saveNid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",1,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1)");
            }
            
            photoNids = [0];
            
            if(typeof Ti.UI.currentWindow.continuous_nid !== 'undefined'){
                continuousId = parseInt(Ti.UI.currentWindow.continuous_nid, 10);
                if(!isNaN(continuousId) && continuousId != 0){
                    photoNids.push(continuousId);
                }
            }
            
            if(typeof Ti.UI.currentWindow.nid !== 'undefined'){
                tempNid = parseInt(Ti.UI.currentWindow.nid, 10);
                if(!isNaN(tempNid) && tempNid != 0){
                    photoNids.push(tempNid);
                }
            }
            
            db.execute('UPDATE _files SET nid=' + saveNid + ' WHERE nid IN (' + photoNids.join(',') + ')');

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
    catch(ex2) {
        Omadi.display.doneLoading();
        alert("Error saving to " + node.type + " table: " + ex2 + " : " + query);
        Omadi.service.sendErrorReport("Error saving to " + node.type + " table: " + ex2 + " : " + query);
    }
    finally {
        try {
            db.close();
        }
        catch(nothing) {

        }
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

    return node;
};

Omadi.data.deleteNode = function(nid){"use strict";
    var db, result, table_name;
    
    // Currently, only delete negative nids, which are drafts or non-saved nodes
    // To delete positive nids, we need to sync that to the server, which is not yet supported
    if(nid < 0){
        db = Omadi.utils.openMainDatabase();
        
        result = db.execute("SELECT table_name FROM node WHERE nid = " + nid);
        
        if(result.isValidRow()){
            table_name = result.fieldByName("table_name");
            
            db.execute("DELETE FROM node WHERE nid = " + nid);
            db.execute("DELETE FROM " + table_name + " WHERE nid = " + nid);
        }
        
        result.close();
        
        // Delete any photos from the DB where the nid matches
        db.execute("UPDATE _files SET nid = -1000000 WHERE nid = " + nid);
        
        db.close();
    }
};

Omadi.data.getPhotosNotUploaded = function(){"use strict";
    var db, result, filePaths, filePath, thumbPath;
    filePaths = [];
    
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT * FROM _files WHERE type IN ('image','signature')");
    
    while(result.isValidRow()){
        filePath = result.fieldByName("file_path");
        thumbPath = result.fieldByName("thumb_path");
       
        filePaths.push({
            filePath: filePath,
            thumbPath: thumbPath,
            degrees: result.fieldByName("degrees", Ti.Database.FIELD_TYPE_INT),
            photoId: result.fieldByName("id", Ti.Database.FIELD_TYPE_INT)
        });
        
        result.next();
    }
    
    result.close();
    db.close();
    
    return filePaths;
};

Omadi.data.saveFailedUpload = function(photoId, showMessage) {"use strict";

    var imageDir, imageFile, newFilePath, imageView, oldImageFile, 
        blob, db, result, dialog, nid, field_name, delta, filePath, 
        sdCardPath, sdIndex, thumbPath, thumbFile;

    db = Omadi.utils.openMainDatabase();
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
                                title : 'Photo Upload Problem',
                                message : "There was a problem uploading a photo for node #" + nid + " after 5 tries. The photo was saved to your SD card at " + sdCardPath,
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
                            title : 'Corrupted Photo',
                            message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                            buttonNames : ['OK']
                        });
                        dialog.show();
                        
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
                
                if(oldImageFile.exists()){
                    Titanium.Media.saveToPhotoGallery(oldImageFile, {
                        success : function(e) {
                            
                            if(showMessage){
                                dialog = Titanium.UI.createAlertDialog({
                                    title : 'Photo Upload Problem',
                                    message : "There was a problem uploading a photo for node #" + nid + " after 5 tries. The photo was saved to your photo gallery.",
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
                                title : 'Corrupted Photo',
                                message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                                buttonNames : ['OK']
                            });
                            dialog.show();
    
                            Omadi.data.deletePhotoUpload(photoId, true);
                        }
                    });
                }
                else{
                    Omadi.service.sendErrorReport("Did not save to photo gallery iOS because file not found: " + photoId);
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Corrupted Photo',
                        message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                        buttonNames : ['OK']
                    });
                    dialog.show();

                    Omadi.data.deletePhotoUpload(photoId, false);
                }
            }
        }
    }
    catch(ex) {
        Omadi.service.sendErrorReport("Did not save to photo gallery exception: " + photoId + ", ex: " + ex);
        dialog = Titanium.UI.createAlertDialog({
            title : 'Corrupted Photo',
            message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery.",
            buttonNames : ['OK']
        });
        dialog.show();
    }

    result.close();
    db.close();
};

Omadi.data.deletePhotoUploadByPath = function(filePath, deleteFile){"use strict";
    var db, result, id;
    
    id = null;
    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT id FROM _files WHERE file_path = '" + dbEsc(filePath) + "'");
    if(result.isValidRow()){
        id = result.fieldByName('id', Ti.Database.FIELD_TYPE_INT);
    }
    db.close();
    
    if(id !== null){
        Ti.API.debug("Photo ID to delete: " + id);
        Omadi.data.deletePhotoUpload(id, deleteFile);
    }
};

Omadi.data.deletePhotoUpload = function(id, deleteFile) {"use strict";
    var file, db, result, filePath = null, thumbPath = null, thumbFile;
    
    db = Omadi.utils.openMainDatabase();
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
        tempValue, origDBValue, jsonValue, allowedValues, allowedKey, filePath, newNid;

    node = {
        form_part : 0
    };

    if (parseInt(nid, 10) != 0) {
        db = Omadi.utils.openMainDatabase();
        
        try{
            result = db.execute('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash, continuous_nid FROM node WHERE  nid = ' + nid);
    
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
                node.continuous_nid = result.fieldByName('continuous_nid', Ti.Database.FIELD_TYPE_INT);
            }
            else{
                // If the nid doesn't exist, maybe it was deleted and a positive nid has replaced it
                if(typeof Ti.App.deletedNegatives[nid] !== 'undefined' && Ti.App.deletedNegatives[nid] !== null){
                    
                    newNid = Ti.App.deletedNegatives[nid];
                    Ti.API.debug("CAN RECOVER " + nid +  " >>> " + newNid);
                    
                    Ti.App.deletedNegatives[nid] = null;
                    
                    result = db.execute('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash, continuous_nid FROM node WHERE  nid = ' + newNid);
    
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
                        node.continuous_nid = result.fieldByName('continuous_nid', Ti.Database.FIELD_TYPE_INT);
                    }
                    else{
                         Omadi.service.sendErrorReport("unrecoverable node load 1 for nid " + nid);
                         node = null;
                    }
                }
                else{
                   Omadi.service.sendErrorReport("unrecoverable node load 2 for nid " + nid);
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
                                
                                //Ti.API.debug(dbValue);

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
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                        break;

                                    case 'number_integer':
                                    case 'list_boolean':
                                    case 'auto_increment':
                                    
                                        if (!Omadi.utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                            dbValue = parseInt(dbValue, 10);
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                        break;

                                    case 'number_decimal':

                                        if (!Omadi.utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                            dbValue = parseFloat(dbValue);
                                            node[field_name].dbValues.push(dbValue);
                                        }
                                        break;

                                    case 'calculation_field':

                                        node[field_name].origValues = [];
                                        if (!Omadi.utils.isEmpty(dbValue) || dbValue == 0 || dbValue == "0") {
                                            dbValue = parseFloat(dbValue);
                                            node[field_name].dbValues.push(dbValue);
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
                                    node[field_name].textValues[i] = Omadi.widgets.omadi_time.secondsToString(node[field_name].dbValues[i]);
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

                            case 'image':
                            case 'signature':

                                subResult = db.execute('SELECT * FROM _files WHERE nid=' + node.nid + ' AND field_name ="' + field_name + '" ORDER BY delta ASC');


                                node[field_name].imageData = [];
                                node[field_name].degrees = [];
                                
                                if (subResult.rowCount > 0) {
                                    while (subResult.isValidRow()) {
                                        //isUpdated[val.fieldByName('delta')] = true;
                                        filePath = subResult.fieldByName('file_path');
                                        
                                        node[field_name].imageData.push(filePath);
                                        node[field_name].degrees.push(subResult.fieldByName('degrees', Ti.Database.FIELD_TYPE_INT));
                                        
                                        subResult.next();
                                    }
                                }
                                subResult.close();
                                break;
                                
                            case 'file':
                                
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

        db.close();
    }


//Ti.API.debug(node);
    return node;
};

Omadi.data.getNodeTableInsertStatement = function(node) {"use strict";

    var sql = 'INSERT OR REPLACE INTO node (nid, perm_edit, perm_delete, created, changed, title, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed) VALUES (';

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
    sql += ',\'' + dbEsc(node.no_data_fields) + '\'';
    sql += ',\'' + node.viewed + '\'';

    sql += ')';

    // if (node.table_name == 'notification' && node.viewed == 0) {
    // Ti.API.debug("A notification was added");
    // //newNotificationCount++;
    // //newNotificationNid = node.nid;
    // }

    return sql;
};

Omadi.data.getPhotoCount = function(){"use strict";
    var mainDB, result, retval = 0;
    
    try{
        mainDB = Omadi.utils.openMainDatabase();
        result = mainDB.execute("SELECT COUNT(*) FROM _files WHERE nid > 0");
        
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

Omadi.data.getNextPhotoData = function(){"use strict";
    var mainDB, result, nextPhoto, imageFile, imageBlob, maxDiff, 
        newWidth, newHeight, resizedFile, isResized, resizedFilePath, 
        resizeRetval, readyForUpload, restartSuggested, dialog, deleteFromDB,
        fileStream, buffer, numBytesRead;
   
    nextPhoto = null;
    readyForUpload = true;
    restartSuggested = false;
    deleteFromDB = false;
    
    mainDB = Omadi.utils.openMainDatabase();
    
    try{
        result = mainDB.execute("SELECT * FROM _files WHERE nid > 0 ORDER BY delta ASC LIMIT 1");
        
        if (result.isValidRow()) {
            //Only upload those images that have positive nids
            
            //if (result.fieldByName('tries', Ti.Database.FIELD_TYPE_INT) < 0) {
            //    Omadi.data.saveFailedUpload(result.fieldByName('id'));
            //}
            //else if (result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT) > 0){
                Ti.API.debug("valid row");
                
                nextPhoto = {
                    nid : result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
                    id : result.fieldByName('id', Ti.Database.FIELD_TYPE_INT),
                    file_path : result.fieldByName('file_path'),
                    file_name : result.fieldByName('file_name'),
                    field_name : result.fieldByName('field_name'),
                    delta : result.fieldByName('delta', Ti.Database.FIELD_TYPE_INT),
                    timestamp : result.fieldByName('timestamp', Ti.Database.FIELD_TYPE_INT),
                    tries : result.fieldByName('tries', Ti.Database.FIELD_TYPE_INT),
                    latitude : result.fieldByName('latitude'),
                    longitude : result.fieldByName('longitude'),
                    accuracy : result.fieldByName('accuracy', Ti.Database.FIELD_TYPE_INT),
                    degrees : result.fieldByName('degrees', Ti.Database.FIELD_TYPE_INT),
                    thumb_path : result.fieldByName('thumb_path'),
                    type : result.fieldByName('type'),
                    filesize : result.fieldByName('filesize', Ti.Database.FIELD_TYPE_INT),
                    bytes_uploaded : result.fieldByName('bytes_uploaded', Ti.Database.FIELD_TYPE_INT),
                    fid : result.fieldByName('fid', Ti.Database.FIELD_TYPE_INT)
                };
                
                Ti.API.debug(nextPhoto);
                
                try{
                   
                    if(Ti.App.isAndroid){
                        
                        try{
                            imageFile = Ti.Filesystem.getFile(nextPhoto.file_path);
                            
                            if(!imageFile.exists() || !imageFile.isFile()){
                                Omadi.service.sendErrorReport("File does not exist 2: " + nextPhoto.file_path);
                                // upload to get out of the system
                                deleteFromDB = true;
                            }
                            else{
                                try{
                                    imageBlob = imageFile.read();
                                }
                                catch(ex4){
                                    Ti.API.debug("Exception reading non-resized photo: " + ex4);
                                    Omadi.service.sendErrorReport("Exception reading non-resized photo: " + ex4);
                                    readyForUpload = false;
                                    // This is probably a memory error, so request a restart
                                    restartSuggested = true;
                                }
                            }
                        }
                        catch(ex3){
                            Ti.API.debug("Exception getting non-resized photo: " + ex3);
                            Omadi.service.sendErrorReport("Exception getting non-resized photo: " + ex3);
                            readyForUpload = false;
                        }
                    }
                    else{ // isIOS
                        
                        imageFile = Ti.Filesystem.getFile(nextPhoto.file_path);  
                        
                        if(imageFile.exists() && imageFile.isFile()){
                            
                            if(nextPhoto.type == 'image' || nextPhoto.type == 'signature'){
                                imageBlob = imageFile.read();
                            }
                            else if(nextPhoto.type == 'video' || nextPhoto.type == 'file'){
                                Ti.API.debug("uploading a video");
                                
                                fileStream = imageFile.open(Ti.Filesystem.MODE_READ);
                                buffer = Ti.createBuffer({
                                    length: 2097152 // 2MB 
                                });
                                
                                Ti.API.debug("bytes already uploaded: " + nextPhoto.bytes_uploaded);
                                
                                var position = 0;
                                var filePart = 0;
                                
                                // No seek function, so move the stream to the correct position
                                while(position < nextPhoto.bytes_uploaded){
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
                                }
                                
                                // Release the resources
                                buffer.release();
                            }
                            
                            if(imageBlob){
                            
                                try {
                                    
                                    if (imageBlob.height > 1000 || imageBlob.width > 1000) {
    
                                        maxDiff = imageBlob.height - 1000;
                                        if (imageBlob.width - 1000 > maxDiff) {
                                            // Width is bigger
                                            newWidth = 1000;
                                            newHeight = (1000 / imageBlob.width) * imageBlob.height;
                                        }
                                        else {
                                            // Height is bigger
                                            newHeight = 1000;
                                            newWidth = (1000 / imageBlob.height) * imageBlob.width;
                                        }
    
                                        imageBlob = imageBlob.imageAsResized(newWidth, newHeight);
                                    }
                                }
                                catch(ex) {
                                    Omadi.service.sendErrorReport("Exception resizing iOS Photo: " + ex);
                                    readyForUpload = false;
                                }  
                            }
                            else{
                                Omadi.service.sendErrorReport("Image blob is null");
                            }
                        }
                        else{
                            readyForUpload = false;
                            deleteFromDB = true;
                        }
                    }
                    
                    if(readyForUpload){
                        try{
                            nextPhoto.file_data = Ti.Utils.base64encode(imageBlob);
                            
                            try{
                                nextPhoto.file_data = nextPhoto.file_data.getText();
                            }
                            catch(ex6){
                                Omadi.service.sendErrorReport("Exception getting text of base64 photo: " + ex6); 
                                // This photo is not going to upload correctly
                                readyForUpload = false;
                            }
                        }
                        catch(ex5){
                            Omadi.service.sendErrorReport("Exception base64 encoding photo: " + ex5); 
                            // This photo is not going to upload correctly
                            readyForUpload = false;
                        }
                    }
                    
                    imageFile = null;
                    imageBlob = null;
                }
                catch(fileEx){
                    Omadi.service.sendErrorReport("Exception loading next photo: " + fileEx);
                }
            
        }
        else{
            Omadi.service.sendErrorReport("No result getting next photo data");
        }
        
        result.close();
    }
    catch(ex7){
        Omadi.service.sendErrorReport("Exception getting next photo: " + ex7);
    }
    finally{
        // Make sure the DB gets closed
        mainDB.close();
    }
    
    if(deleteFromDB){
        Omadi.data.deletePhotoUpload(nextPhoto.id, false);
        nextPhoto = null;
    }
    
    if(Ti.App.isAndroid && restartSuggested){
        dialog = Ti.UI.createAlertDialog({
           buttonNames: ['Close App', 'Cancel'],
           cancel: 1,
           message: 'The Omadi app is currently using too much memory. An app restart is suggested.',
           title: 'Restart is Suggested' 
        });
        
        dialog.addEventListener('click', function(e){
           if(e.index == 0){
               Omadi.utils.closeApp();
           } 
        });
        
        dialog.show();
    }
    
    if(readyForUpload){
        return nextPhoto;
    }
    
    return null;
};


Omadi.data.processFetchedJson = function(){"use strict";
    var nodeType, mainDB, gpsDB, dbFile, tableName, GMT_OFFSET, dialog, newNotifications, numItems;
    
    try {
        //Parses response into strings
        
        // if (json.request_time && json.request_time !== null && json.request_time !== "") {
            // GMT_OFFSET = Number(json.request_time - app_timestamp);
            // //Ti.API.info(GMT_OFFSET + "  === " + json.request_time + " === " + app_timestamp);
            // Ti.App.Properties.setString("timestamp_offset", GMT_OFFSET);
        // }

        if (Omadi.service.fetchedJSON.delete_all === true || Omadi.service.fetchedJSON.delete_all === "true") {
            Ti.API.info("=================== ############ ===================");
            Ti.API.info("Reseting mainDB, delete_all is required");
            Ti.API.info("=================== ############ ===================");

            //If delete_all is present, delete all contents:
            mainDB = Omadi.utils.openMainDatabase();
            if (Ti.App.isAndroid) {
                //Remove the mainDB
                mainDB.remove();
                mainDB.close();
            }
            else {
                dbFile = mainDB.getFile();
                mainDB.close();
                //phisically removes the file
                dbFile.deleteFile();
            }

            // Reset the database
            mainDB = Omadi.utils.openMainDatabase();
            mainDB.close();

            gpsDB = Omadi.utils.openGPSDatabase();
            gpsDB.execute('DELETE FROM alerts');
            gpsDB.close();
        }

        //Ti.API.info("Max itens: " + parseInt(json.total_item_count));

        //mainDB.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');
        
        //Ti.API.error(json.request_time);
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
            Ti.API.debug("Opened database");
        
            Ti.API.debug("hihihi");
            if (Omadi.service.progressBar !== null) {
                //Set max value for progress bar
                Omadi.service.progressBar.set_max(numItems);
            }
            
            Ti.API.debug("yoyoyo");
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
            
            mainDB.close();
            
            Omadi.data.setLastUpdateTimestamp(Omadi.service.fetchedJSON.request_time);

            //Ti.API.info("SUCCESS");
            if (Omadi.service.progressBar !== null) {
                Omadi.service.progressBar.close();
                Omadi.service.progressBar = null;
            }
            
            Ti.App.fireEvent("syncInstallComplete");   
        }
        

        if ( typeof Omadi.service.fetchedJSON.new_app !== 'undefined' && Omadi.service.fetchedJSON.new_app.length > 0) {
            Ti.API.debug("New App: " + Omadi.service.fetchedJSON.new_app);
            Omadi.display.newAppAvailable(Omadi.service.fetchedJSON.new_app);
        }
        
        if(!Ti.App.Properties.getBool("doingFullReset", false)){
            Omadi.bundles.dispatch.showNewDispatchJobs();
            Omadi.display.showNewNotificationDialog();
        }
        
        Ti.App.Properties.setBool("doingFullReset", false);
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
        }
    }
    catch(ex){
        alert("Saving extra fields: " + ex);
    }
};



Omadi.data.processFieldsJson = function(mainDB) {"use strict";
    /*global ROLE_ID_ADMIN, ROLE_ID_OMADI_AGENT*/
    var result, fid, field_exists, field_type, db_type, field_name, label, widgetString, settingsString, region, part, queries, description, bundle, weight, required, disabled, can_view, can_edit, settings, omadi_session_details, roles, permissionsString, permIdx, roleIdx, i;
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
                                //if (Omadi.service.fetchedJSON.fields.insert[i].type == 'image') {
                                //queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + db_type);
                                //queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + db_type);
                                //}
                                

                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
                                
                                if (Omadi.service.fetchedJSON.fields.insert[i].type == 'file') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___filename' " + db_type);
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
        }
    }
    catch(ex) {
        alert("Saving fields: " + ex);
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
    /*global treatArray, isNumber*/

    var closeDB, instances, fakeFields, queries, i, j, field_name, query, 
        fieldNames, no_data, values, value, notifications = {}, numSets, 
        result, reasonIndex, reason, alertReason, dialog, updateNid;
    
    closeDB = false;
    queries = [];

    try {

        instances = Omadi.data.getFields(type);
        fakeFields = Omadi.data.getFakeFields(type);

        // Make sure the node type still exists
        result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name='" + type + "'");
        if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {

            //Insert
            if (Omadi.service.fetchedJSON.node[type].insert) {

                Ti.API.debug("inserting " + type + " nodes");
                //Ti.API.debug(Omadi.service.fetchedJSON.node[type]);
                //Multiple objects
                if (Omadi.service.fetchedJSON.node[type].insert.length) {

                    for ( i = 0; i < Omadi.service.fetchedJSON.node[type].insert.length; i++) {
                        
                        //Ti.API.debug(JSON.stringify(Omadi.service.fetchedJSON.node[type].insert[i]));
                        
                        if(typeof Omadi.service.fetchedJSON.node[type].insert[i].__error !== 'undefined' && Omadi.service.fetchedJSON.node[type].insert[i].__error == 1){
                            
                            Ti.API.debug("HAS ERROR");
                            
                            //Ti.API.debug(Omadi.service.fetchedJSON.node[type].insert[i]);  
                            if(typeof Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons !== 'undefined'){
                                reason = Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons.join(", ");
                                alertReason = true;
                                
                                for(reasonIndex in Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons){
                                    if(Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons.hasOwnProperty(reasonIndex)){
                                        if(Omadi.service.fetchedJSON.node[type].insert[i].__error_reasons[reasonIndex] == 'duplicate'){
                                            alertReason = false;
                                        }
                                    }
                                }
                                
                                Ti.API.debug("Alert Reason: " + alertReason);
                                Ti.API.debug("Reason: " + reason);
                                
                                if(typeof Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid !== 'undefined'){
                                    updateNid = Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid;
                                }
                                else{
                                    updateNid = Omadi.service.fetchedJSON.node[type].insert[i].nid;
                                }
                                
                                if(alertReason){
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
                                else if ( typeof Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid !== 'undefined' && alertReason) {
                                    Ti.API.debug("Deleting nid from error: " + updateNid);
        
                                    queries.push('DELETE FROM ' + type + ' WHERE nid=' + updateNid);
                                    queries.push('DELETE FROM node WHERE nid=' + updateNid);
                                }
                            }
                        }
                        else{
                        
                            //Insert into node table
                            if ((Omadi.service.fetchedJSON.node[type].insert[i].title === null) || (Omadi.service.fetchedJSON.node[type].insert[i].title == 'undefined') || (Omadi.service.fetchedJSON.node[type].insert[i].title === false)) {
                                Omadi.service.fetchedJSON.node[type].insert[i].title = "No Title";
                            }
    
                            //'update' is a flag to decide whether the node needs to be synced to the server or not
                            no_data = '';
                            if (!(Omadi.service.fetchedJSON.node[type].insert[i].no_data_fields instanceof Array)) {
                                no_data = JSON.stringify(Omadi.service.fetchedJSON.node[type].insert[i].no_data_fields);
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
                                no_data_fields : no_data,
                                viewed : Omadi.service.fetchedJSON.node[type].insert[i].viewed
                            }));
    
                            query = 'INSERT OR REPLACE  INTO ' + type + ' (nid, ';
    
                            fieldNames = [];
                            for (field_name in instances) {
                                if (instances.hasOwnProperty(field_name)) {
                                    fieldNames.push("`" + field_name + "`");
                                    
                                    if(instances[field_name].type == 'file'){
                                        fieldNames.push(field_name + "___filename");
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
                            query += ') VALUES (' + Omadi.service.fetchedJSON.node[type].insert[i].nid + ',';
    
                            values = [];
    
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
                                                    // for(j = value.length - 1; j <= 0; j --){
                                                        // if(value[j] == -1){
//                                                             
                                                        // }
                                                    // }
                                                    Ti.API.debug(JSON.stringify(value));
                                                    values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                                }
                                                else {
                                                    values.push("null");
                                                }
                                                
                                                if(instances[field_name].type == 'file'){
                                                    Ti.API.error(value);
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
                            
                            if (type == 'notification' && Omadi.service.fetchedJSON.node[type].insert[i].viewed == 0) {
                                notifications = Ti.App.Properties.getObject('newNotifications', {
                                    count : 0,
                                    nid : 0
                                });
    
                                Ti.App.Properties.setObject('newNotifications', {
                                    count : notifications.count + 1,
                                    nid : Omadi.service.fetchedJSON.node[type].insert[i].nid
                                });
                            }
                            else if(Omadi.service.fetchedJSON.node[type].insert[i].viewed == 0 && 
                                    typeof Omadi.service.fetchedJSON.node[type].insert[i].from_dispatch !== 'undefined' &&
                                    Omadi.service.fetchedJSON.node[type].insert[i].from_dispatch > 0){
                                        
                                Ti.API.info("NEW DISPATCH");    
                                Ti.App.Properties.setBool('newDispatchJob', true);
                            }
                            
                            if ( typeof Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid !== 'undefined') {
                                Ti.API.debug("Deleting nid: " + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
                                
                                Ti.App.deletedNegatives[Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid] = Omadi.service.fetchedJSON.node[type].insert[i].nid;
                                
                                queries.push('DELETE FROM ' + type + ' WHERE nid=' + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
                                queries.push('DELETE FROM node WHERE nid=' + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
    
                                queries.push("UPDATE _files SET nid =" + Omadi.service.fetchedJSON.node[type].insert[i].nid + " WHERE nid=" + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid);
    
                                // Make sure we don't add a duplicate from doing a next_part action directly after a node save
                                //if(typeof Ti.UI.currentWindow.nid !== 'undefined' && Ti.UI.currentWindow.nid == Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid){
                                //    Ti.API.error("SWITCHING UP THE NID from " + Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid + " to " + Omadi.service.fetchedJSON.node[type].insert[i].nid);
    
                                Ti.App.fireEvent('switchedItUp', {
                                    negativeNid : Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid,
                                    positiveNid : Omadi.service.fetchedJSON.node[type].insert[i].nid
                                });
                            }
                        }
                    }
                }
            }

            if (Omadi.service.fetchedJSON.node[type]['delete']) {
                if (Omadi.service.fetchedJSON.node[type]['delete'].length) {
                    for ( i = 0; i < Omadi.service.fetchedJSON.node[type]['delete'].length; i++) {
                        queries.push("DELETE FROM node WHERE nid = " + Omadi.service.fetchedJSON.node[type]['delete'][i].nid);
                        queries.push("DELETE FROM " + type + " WHERE nid = " + Omadi.service.fetchedJSON.node[type]['delete'][i].nid);
                    }
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
                    mainDB.execute(queries[i]);
                    if (i % 4 == 0) {
                        Omadi.service.progressBar.set();
                        numSets++;
                    }
                }
            }
            else {
                for ( i = 0; i < queries.length; i++) {
                    mainDB.execute(queries[i]);
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
        alert("Saving Form Data: " + ex);
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

        if (Omadi.service.fetchedJSON.vocabularies.insert) {
            if (Omadi.service.fetchedJSON.vocabularies.insert.length) {

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
        }
        if (Omadi.service.fetchedJSON.vocabularies.update) {
            if (Omadi.service.fetchedJSON.vocabularies.update.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.vocabularies.update.length; i++) {
                    if (Omadi.service.progressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.progressBar.set();
                    }

                    //Ti.API.info("About to update vocabulary: "+Omadi.service.fetchedJSON.vocabularies.update[i].vid);
                    queries.push("UPDATE vocabulary SET name='" + dbEsc(Omadi.service.fetchedJSON.vocabularies.insert[i].name) + "', machine_name='" + dbEsc(Omadi.service.fetchedJSON.vocabularies.update[i].machine_name) + "' WHERE vid=" + Omadi.service.fetchedJSON.vocabularies.update[i].vid);
                }
            }
        }
        if (Omadi.service.fetchedJSON.vocabularies["delete"]) {
            if (Omadi.service.fetchedJSON.vocabularies["delete"].length) {

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
                    queries.push("UPDATE term_data SET name='" + dbEsc(Omadi.service.fetchedJSON.terms.update[i].name) + "', description='" + dbEsc(Omadi.service.fetchedJSON.terms.update[i].description) + "', weight='" + dbEsc(Omadi.service.fetchedJSON.terms.update[i].weight) + "', vid=" + Omadi.service.fetchedJSON.terms.update[i].vid + ' WHERE tid=' + Omadi.service.fetchedJSON.terms.update[i].tid);
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
        disabled, is_disabled, permission_string, childForms;

    try {
        //Node types creation:
        queries = [];

        roles = Ti.App.Properties.getObject("userRoles", {});

        //Node type inserts
        if (Omadi.service.fetchedJSON.node_type.insert) {
            //Multiple nodes inserts
            if (Omadi.service.fetchedJSON.node_type.insert.length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.node_type.insert.length; i++) {
                    type = Omadi.service.fetchedJSON.node_type.insert[i].type;
                    
                    if (type != 'user') {
                        //Increment the progress bar
                        if (Omadi.service.progressBar != null) {
                            Omadi.service.progressBar.set();
                        }

                        bundle_result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name = '" + type + "'");
                        if (bundle_result.field(0, Ti.Database.FIELD_TYPE_INT) === 0) {
                            Ti.API.debug("CREATING TABLE " + type);
                            queries.push("CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                        }

                        title_fields = Omadi.service.fetchedJSON.node_type.insert[i].data.title_fields;
                        data = Omadi.service.fetchedJSON.node_type.insert[i].data;
                        
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

                        //var node_type_Omadi.service.fetchedJSON.node_type = JSON.parse(_nd);

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

        Ti.API.info("Success for node_types, db operations ran smoothly!");
    }
    catch(ex) {
        alert("Installing form types: " + ex);
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
