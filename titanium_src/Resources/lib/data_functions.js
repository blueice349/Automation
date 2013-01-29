Omadi.data = Omadi.data || {};

/*jslint plusplus: true, eqeq: true, nomen: true*/

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
    var db, result, bundle;

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT _data, display_name, can_create, can_view FROM bundles WHERE bundle_name="' + type + '"');

    if (result.isValidRow()) {
        bundle = {
            type : type,
            data : JSON.parse(result.fieldByName('_data')),
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


Omadi.data.trySaveNode = function(node, saveType){"use strict";
    var dialog;
    /*jslint nomen: true*/
    
    if(typeof saveType === 'undefined'){
        saveType = 'regular';
    }
    
    if(Omadi.data.isUpdating()){
        Omadi.display.loading("Waiting...");
        setTimeout(function(){
            Omadi.data.trySaveNode(node, saveType);
        }, 1000);
    }
    else{
        
        Omadi.display.doneLoading();
        Omadi.display.loading("Saving...");
        
        node = Omadi.data.nodeSave(node);
                    
        if(node._saved === true){
            Ti.UI.currentWindow.nodeSaved = true;
        }
        
        // Setup the current node and nid in the window so a duplicate won't be made for this window
        Ti.UI.currentWindow.node = node;
        Ti.UI.currentWindow.nid = node.nid;
        
        Omadi.display.doneLoading();
        
        if(node._saved === true){
            
            if(Ti.Network.online){
                
                if (saveType === "next_part") {
                    Omadi.display.openFormWindow(node.type, node.nid, node.form_part + 1);                            
                }
                
                // Send a clone of the object so the window will close after the network returns a response
                Omadi.service.sendUpdates();
                
                if(Ti.UI.currentWindow.url.indexOf('form.js') !== -1){
                    if(Ti.App.isAndroid){
                        Ti.UI.currentWindow.close();
                    }
                    else{
                        Ti.UI.currentWindow.hide();
                    }
                }
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
                            Omadi.display.openFormWindow(node.type, node.nid, node.form_part + 1);
                        }
                        
                        Ti.UI.currentWindow.close();
                    });
                }
            }
            
            Ti.App.fireEvent("savedNode");
        }
    } 
};

Omadi.data.nodeSave = function(node) {"use strict";
    var query, field_name, fieldNames, instances, result, db, smallestNid, insertValues, j, k, 
        instance, value_to_insert, has_data, content_s;

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

    if (node.nid == 'new') {
        node.nid = Omadi.data.getNewNodeNid();
        node.sync_hash = Ti.Utils.md5HexDigest(JSON.stringify(node) + (new Date()).getTime());
    }
    
    db = Omadi.utils.openMainDatabase();
    
    try {

        if(fieldNames.length > 0){
            query = "INSERT OR REPLACE INTO " + node.type + " (nid, `";
            query += fieldNames.join('`,`');
            query += '`) VALUES (' + node.nid + ',';
    
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
            if (node._isDraft) {
                if (node.nid > 0) {
                    db.execute("UPDATE node SET changed=" + node.changed + ", changed_uid=" + node.changed_uid + ", title='" + dbEsc(node.title) + "', flag_is_updated=3, table_name='" + node.type + "', form_part=" + node.form_part + ", no_data_fields='" + node.no_data + "',viewed=" + node.viewed + " WHERE nid=" + node.nid);
                }
                else {
                    db.execute("INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash) VALUES (" + node.nid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",3,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "')");
                }
            }
            else if (node.nid > 0) {
                db.execute("UPDATE node SET changed=" + node.changed + ", changed_uid=" + node.changed_uid + ", title='" + dbEsc(node.title) + "', flag_is_updated=1, table_name='" + node.type + "', form_part=" + node.form_part + ", no_data_fields='" + node.no_data + "',viewed=" + node.viewed + " WHERE nid=" + node.nid);
            }
            else {
                // Give all permissions for this node. Once it comes back, the correct permissions will be there.  If it never gets uploaded, the user should be able to do whatever they want with that info.
                db.execute("INSERT OR REPLACE INTO node (nid, created, changed, title, author_uid, changed_uid, flag_is_updated, table_name, form_part, no_data_fields, viewed, sync_hash, perm_edit, perm_delete) VALUES (" + node.nid + "," + node.created + "," + node.changed + ",'" + dbEsc(node.title) + "'," + node.author_uid + "," + node.changed_uid + ",1,'" + node.type + "'," + node.form_part + ",'" + node.no_data + "'," + node.viewed + ",'" + node.sync_hash + "',1,1)");
            }

            db.execute('UPDATE _photos SET nid=' + node.nid + ' WHERE nid = 0');

            node._saved = true;
            Ti.API.debug("NODE SAVE WAS SUCCESSFUL");
        }
        catch(ex1) {
            alert("Error saving to the node table: " + ex1);
            db.execute("DELETE FROM " + node.type + " WHERE nid = " + node.nid);
            Omadi.service.sendErrorReport("Error saving to the node table: " + ex1);
        }

    }
    catch(ex2) {
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

Omadi.data.saveFailedUpload = function(photoId, showMessage) {"use strict";

    var imageDir, imageFile, filename, imageView, blob, db, result, dialog, nid, field_name, delta;

    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT * FROM _photos WHERE id = " + photoId);
    
    if(typeof showMessage === 'undefined'){
        showMessage = true;
    }

    try {

        if (result.isValidRow()) {

            blob = Ti.Utils.base64decode(result.fieldByName('file_data'));
            nid = result.fieldByName('nid');
            field_name = result.fieldByName('field_name');
            delta = result.fieldByName('delta');

            // Make a temporary imageView so the blob can be created.
            // It doesn't work with the blog from the base64decode
            imageView = Ti.UI.createImageView({
                image : blob
            });
            
            if(showMessage){
                Omadi.service.sendErrorReport("going to save to photo gallery_nid_" + nid + "_field_name_" + field_name + "_delta_" + delta + "_photoId_" + photoId);
            }

            if (Ti.App.isAndroid) {
                if (Ti.Filesystem.isExternalStoragePresent()) {

                    filename = 'O_' + nid + '_' + field_name + '_' + delta + '_' + Omadi.utils.getUTCTimestamp() + '.jpg';

                    imageDir = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'failed_uploads');
                    if (! imageDir.exists()) {
                        imageDir.createDirectory();
                    }

                    // .resolve() provides the resolved native path for the directory.
                    imageFile = Ti.Filesystem.getFile(imageDir.resolve(), filename);

                    Ti.API.info("ImageFile path is: " + imageFile.resolve());

                    if (imageFile.write(imageView.toBlob())) {
                        
                        if(showMessage){
                            dialog = Ti.UI.createAlertDialog({
                                title : 'Photo Upload Problem',
                                message : "There was a problem uploading a photo for node #" + nid + " after 5 tries. The photo was saved to this device's filesystem at " + imageFile.getNativePath(),
                                buttonNames : ['OK']
                            });
                            dialog.show();
    
                            Omadi.service.sendErrorReport("Saved to photo gallery: " + nid);
                        }

                        Omadi.data.deletePhotoUpload(photoId);
                    }
                    else {
                        
                        Omadi.service.sendErrorReport("Did not save to photo gallery: " + photoId);
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Corrupted Photo',
                            message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                            buttonNames : ['OK']
                        });
                        dialog.show();

                        Omadi.data.deletePhotoUpload(photoId);
                    }

                    // dispose of file handles
                    imageFile = null;
                    imageDir = null;
                }
                else {
                    Omadi.service.sendErrorReport("Device does not have external storage on: " + photoId);
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Insert SD Card',
                        message : "There was a problem uploading a photo. You can either insert an SD card and have the photo saved to the SD card, or you can delete the photo permanently.",
                        buttonNames : ['Delete', 'Inserted SD Card']
                    });

                    dialog.addEventListener('click', function(e) {
                        if (e.index == 0) {
                            Omadi.data.deletePhotoUpload(photoId);
                        }
                        else if (e.index == 1) {
                            Omadi.data.saveFailedUpload(photoId); 
                        }
                    });
                    dialog.show();
                }
            }
            else {
                Titanium.Media.saveToPhotoGallery(imageView.toImage(), {
                    success : function(e) {
                        
                        if(showMessage){
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Photo Upload Problem',
                                message : "There was a problem uploading a photo for node #" + nid + " after 5 tries. The photo was saved to this device's gallery.",
                                buttonNames : ['OK']
                            });
                            dialog.show();
    
                            Omadi.service.sendErrorReport("Saved to photo gallery: " + nid);
                        }
                        
                        Omadi.data.deletePhotoUpload(photoId);
                    },
                    error : function(e) {
                        Omadi.service.sendErrorReport("Did not save to photo gallery: " + photoId);
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Corrupted Photo',
                            message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                            buttonNames : ['OK']
                        });
                        dialog.show();

                        Omadi.data.deletePhotoUpload(photoId);
                    }
                });
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

Omadi.data.deletePhotoUpload = function(id) {"use strict";
    var db = Omadi.utils.openMainDatabase();
    db.execute("DELETE FROM _photos WHERE id = " + id);
    db.close();
};

Omadi.data.nodeLoad = function(nid) {"use strict";

    var db, node, result, subResult, field_name, dbValue, tempDBValues, textValue, 
        subValue, decoded, i, real_field_name, part, field_parts, widget, instances, tempValue, origDBValue, jsonValue;

    node = {
        form_part : 0
    };

    if (parseInt(nid, 10) != 0) {
        db = Omadi.utils.openMainDatabase();

        result = db.execute('SELECT nid, title, created, changed, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, perm_edit, perm_delete, viewed, sync_hash FROM node WHERE  nid = ' + nid);

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
        }
        result.close();

        instances = Omadi.data.getFields(node.table_name);

        if ( typeof node.nid !== 'undefined') {

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
                            Ti.API.info(origDBValue);
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

                            case 'omadi_reference':
                                subResult = db.execute('SELECT title, table_name, nid FROM node WHERE nid IN(' + node[field_name].dbValues.join(',') + ')');
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
                                        node[field_name].textValues[i] = Omadi.utils.formatDate(node[field_name].dbValues[i], (instances[field_name].settings.time == 1 || typeof instances[field_name].settings.granularity.hour !== 'undefined'));
                                    }
                                    else {
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

Omadi.data.processVehicleJson = function(json, mainDB, progress) {"use strict";
    try {
        if (json) {
            var queries = [], i;

            if ( json instanceof Array) {
                for (i in json) {
                    if (json.hasOwnProperty(i)) {
                        queries.push("INSERT OR REPLACE INTO _vehicles (make, model) VALUES ('" + dbEsc(json[i][0]) + "', '" + dbEsc(json[i][1]) + "' )");
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

Omadi.data.processFieldsJson = function(json, mainDB, progress) {"use strict";

    var result, fid, field_exists, field_type, db_type, field_name, label, widgetString, settingsString, region, part, queries, description, bundle, weight, required, disabled, can_view, can_edit, settings, omadi_session_details, roles, permissionsString, permIdx, roleIdx, i;
    try {
        queries = [];

        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;

        if (json.insert) {

            if (json.insert.length) {

                for ( i = 0; i < json.insert.length; i++) {

                    if (progress != null) {
                        progress.set();
                    }

                    settings = json.insert[i].settings;
                    widgetString = JSON.stringify(json.insert[i].widget);

                    settingsString = JSON.stringify(settings);

                    fid = json.insert[i].fid;
                    field_type = json.insert[i].type;
                    field_name = json.insert[i].field_name;
                    label = json.insert[i].label;
                    description = json.insert[i].description;
                    bundle = json.insert[i].bundle;
                    weight = json.insert[i].weight;
                    required = json.insert[i].required;
                    disabled = json.insert[i].disabled;
                    region = json.insert[i].settings.region;

                    can_view = 0;
                    can_edit = 0;

                    if (settings.enforce_permissions != null && settings.enforce_permissions == 1) {
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
                        can_view = can_edit = 1;
                    }

                    result = mainDB.execute('SELECT COUNT(*) FROM fields WHERE fid = ' + fid);

                    field_exists = false;
                    if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {
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
                            if (json.insert[i].settings.parts) {
                                for (part in json.insert[i].settings.parts) {
                                    if (json.insert[i].settings.parts.hasOwnProperty(part)) {
                                        queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___" + part + "' " + db_type);
                                    }
                                }
                            }
                            else {
                                //if (json.insert[i].type == 'image') {
                                //queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + db_type);
                                //queries.push('ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + db_type);
                                //}
                                

                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
                                
                                if (json.insert[i].type == 'file') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___filename' " + db_type);
                                }
                            }
                        }

                        result.close();

                        //Multiple parts
                        if (json.insert[i].settings.parts) {
                            for (part in json.insert[i].settings.parts) {
                                if (json.insert[i].settings.parts.hasOwnProperty(part)) {
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

        if (json["delete"]) {
            if (json["delete"].length) {
                for ( i = 0; i < json["delete"].length; i++) {
                    //Ti.API.info('FID: ' + json["delete"][i].fid + ' was deleted');
                    //Deletes rows from terms
                    queries.push('DELETE FROM fields WHERE fid=' + json["delete"][i].fid);
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

Omadi.data.processUsersJson = function(json, mainDB, progress) {"use strict";
    var i, j, queries;

    try {

        queries = [];

        //Insert - Users
        if (json.insert) {
            if (json.insert.length) {
                for ( i = 0; i < json.insert.length; i++) {
                    if (progress != null) {
                        //Increment Progress Bar
                        progress.set();
                    }

                    queries.push('INSERT OR REPLACE  INTO user (uid, username, mail, realname, status ) VALUES (' + json.insert[i].uid + ",'" + dbEsc(json.insert[i].username) + "','" + dbEsc(json.insert[i].mail) + "','" + dbEsc(json.insert[i].realname) + "'," + json.insert[i].status + ')');

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
                    queries.push("UPDATE user SET username='" + dbEsc(json.update[i].username) + "', mail='" + dbEsc(json.update[i].mail) + "', realname='" + dbEsc(json.update[i].realname) + "', status=" + json.update[i].status + ' WHERE uid=' + json.update[i].uid);

                    //Delete every row present at user_roles
                    queries.push('DELETE FROM user_roles WHERE uid=' + json.update[i].uid);

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
                    queries.push('DELETE FROM user WHERE uid=' + json["delete"][i].uid);
                    queries.push('DELETE FROM user_roles WHERE uid=' + json["delete"][i].uid);
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

Omadi.data.processNodeJson = function(json, type, mainDB, progress) {"use strict";
    /*jslint nomen: true*/
    /*global treatArray, isNumber*/

    var closeDB, instances, queries, i, j, field_name, query, fieldNames, no_data, values, value, notifications = {}, numSets, result;
    closeDB = false;
    queries = [];

    try {

        instances = Omadi.data.getFields(type);

        // Make sure the node type still exists
        result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name='" + type + "'");
        if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {

            //Insert
            if (json.insert) {

                Ti.API.debug("inserting " + type + " nodes");

                //Multiple objects
                if (json.insert.length) {

                    for ( i = 0; i < json.insert.length; i++) {

                        //Insert into node table
                        if ((json.insert[i].title === null) || (json.insert[i].title == 'undefined') || (json.insert[i].title === false)) {
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
                            title : json.insert[i].title,
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
                        for (field_name in instances) {
                            if (instances.hasOwnProperty(field_name)) {
                                fieldNames.push("`" + field_name + "`");
                                
                                if(instances[field_name].type == 'file'){
                                    fieldNames.push(field_name + "___filename");
                                }
                            }
                        }

                        query += fieldNames.join(',');
                        query += ') VALUES (' + json.insert[i].nid + ',';

                        values = [];

                        for (field_name in instances) {
                            if(instances.hasOwnProperty(field_name)){
                                
                                if(instances[field_name].type == 'file'){
                                    
                                    if (typeof json.insert[i][field_name + "___fid"] === "undefined" || json.insert[i][field_name + "___fid"] === null) {
                                        values.push("null");
                                    }
                                    else{
                                        value = json.insert[i][field_name + "___fid"];
    
                                        if ( value instanceof Array) {
                                            values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                        }
                                        else {
                                            values.push("'" + dbEsc(value) + "'");
                                        }
                                    }
                                    
                                    if (typeof json.insert[i][field_name + "___filename"] === "undefined" || json.insert[i][field_name + "___filename"] === null) {
                                        values.push("null");
                                    }
                                    else{
                                        value = json.insert[i][field_name + "___filename"];
    
                                        if ( value instanceof Array) {
                                            values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                        }
                                        else {
                                            values.push("'" + dbEsc(value) + "'");
                                        }
                                    }
                                }
                                else if (typeof json.insert[i][field_name] === "undefined" || json.insert[i][field_name] === null) {
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
                                            value = json.insert[i][field_name];
    
                                            if ( typeof value === 'number') {
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
                                            
                                            if(instances[field_name].type == 'file'){
                                                Ti.API.error(value);
                                            }
                                            
                                            break;
            
                                        default:
                                            value = json.insert[i][field_name];
    
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

                        query += values.join(",");
                        query += ')';
                    
                        //Ti.API.debug(query);

                        queries.push(query);
                        
                        if (type == 'notification' && json.insert[i].viewed == 0) {
                            notifications = Ti.App.Properties.getObject('newNotifications', {
                                count : 0,
                                nid : 0
                            });

                            Ti.App.Properties.setObject('newNotifications', {
                                count : notifications.count + 1,
                                nid : json.insert[i].nid
                            });
                        }

                        if ( typeof json.insert[i].__negative_nid !== 'undefined') {
                            Ti.API.debug("Deleting nid: " + json.insert[i].__negative_nid);

                            queries.push('DELETE FROM ' + type + ' WHERE nid=' + json.insert[i].__negative_nid);
                            queries.push('DELETE FROM node WHERE nid=' + json.insert[i].__negative_nid);

                            queries.push("UPDATE _photos SET nid =" + json.insert[i].nid + " WHERE nid=" + json.insert[i].__negative_nid);

                            // Make sure we don't add a duplicate from doing a next_part action directly after a node save
                            //if(typeof Ti.UI.currentWindow.nid !== 'undefined' && Ti.UI.currentWindow.nid == json.insert[i].__negative_nid){
                            //    Ti.API.error("SWITCHING UP THE NID from " + json.insert[i].__negative_nid + " to " + json.insert[i].nid);

                            Ti.App.fireEvent('switchedItUp', {
                                negativeNid : json.insert[i].__negative_nid,
                                positiveNid : json.insert[i].nid
                            });
                        }
                    }
                }
            }

            if (json['delete']) {
                if (json['delete'].length) {
                    for ( i = 0; i < json['delete'].length; i++) {
                        queries.push("DELETE FROM node WHERE nid = " + json['delete'][i].nid);
                        queries.push("DELETE FROM " + type + " WHERE nid = " + json['delete'][i].nid);
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

            if (progress != null) {
                for ( i = 0; i < queries.length; i++) {
                    mainDB.execute(queries[i]);
                    if (i % 4 == 0) {
                        progress.set();
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

        if (progress != null && typeof json.insert != 'undefined') {
            for ( i = numSets; i < json.insert.length; i++) {
                progress.set();
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

Omadi.data.processVocabulariesJson = function(json, mainDB, progress) {"use strict";
    var queries = [], i, vid, name, machine_name;
    try {

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

                    //Ti.API.info("About to insert vocabulary: "+vid_v);
                    queries.push('INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid + ",'" + dbEsc(name) + "','" + dbEsc(machine_name) + "')");
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
                    queries.push("UPDATE vocabulary SET name='" + dbEsc(json.insert[i].name) + "', machine_name='" + dbEsc(json.update[i].machine_name) + "' WHERE vid=" + json.update[i].vid);
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
                    queries.push('DELETE FROM term_data WHERE vid=' + json["delete"][i].vid);

                    //Deletes corresponding rows in vocabulary
                    queries.push('DELETE FROM vocabulary WHERE vid=' + json["delete"][i].vid);
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

Omadi.data.processRegionsJson = function(json, mainDB, progress) {"use strict";
    var i, queries, settings;

    try {
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

                    queries.push('INSERT OR REPLACE INTO regions (rid, node_type, label, region_name, weight, settings ) VALUES (' + json.insert[i].rid + ", '" + dbEsc(json.insert[i].node_type) + "','" + dbEsc(json.insert[i].label) + "','" + dbEsc(json.insert[i].region_name) + "'," + json.insert[i].weight + ",'" + dbEsc(settings) + "')");
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
                    queries.push("UPDATE regions SET node_type='" + dbEsc(json.update[i].node_type) + "', label='" + dbEsc(json.update[i].label) + "', region_name='" + dbEsc(json.update[i].region_name) + "', weight=" + json.update[i].weight + ", settings='" + dbEsc(JSON.stringify(json.update[i].settings)) + "' WHERE rid=" + json.update[i].rid);
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
                    queries.push('DELETE FROM regions WHERE rid=' + json["delete"][i].rid);
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

Omadi.data.processTermsJson = function(json, mainDB, progress) {"use strict";
    /*jslint nomen: true*/
    var i, vid, tid, name, desc, weight, queries;

    try {
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

                    if (weight == null) {
                        weight = 0;
                    }

                    queries.push('INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid + ',' + vid + ",'" + dbEsc(name) + "','" + dbEsc(desc) + "','" + dbEsc(weight) + "')");
                    if ( typeof json.insert[i].__negative_tid !== 'undefined') {
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
                    queries.push("UPDATE term_data SET name='" + dbEsc(json.update[i].name) + "', description='" + dbEsc(json.update[i].description) + "', weight='" + dbEsc(json.update[i].weight) + "', vid=" + json.update[i].vid + ' WHERE tid=' + json.update[i].tid);
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
                    queries.push('DELETE FROM term_data WHERE tid=' + json["delete"][i].tid);
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

Omadi.data.processNodeTypeJson = function(json, mainDB, progress) {"use strict";
    /*global ROLE_ID_ADMIN */
    var queries, roles, i, type, perm_idx, role_idx, bundle_result, app_permissions, title_fields, data, display, description, disabled, is_disabled, permission_string;

    try {
        //Node types creation:
        queries = [];

        roles = Ti.App.Properties.getObject("userRoles", {});

        //Node type inserts
        if (json.insert) {
            //Multiple nodes inserts
            if (json.insert.length) {

                for ( i = 0; i < json.insert.length; i++) {
                    type = json.insert[i].type;

                    if (type != 'user') {
                        //Increment the progress bar
                        if (progress != null) {
                            progress.set();
                        }

                        bundle_result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name = '" + type + "'");
                        if (bundle_result.field(0, Ti.Database.FIELD_TYPE_INT) === 0) {
                            Ti.API.debug("CREATING TABLE " + type);
                            queries.push("CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                        }

                        title_fields = json.insert[i].data.title_fields;
                        data = json.insert[i].data;
                        display = json.insert[i].name.toUpperCase();
                        //n_bund.fieldByName("display_name").toUpperCase();
                        description = json.insert[i].description;
                        //n_bund.fieldByName("description");
                        disabled = json.insert[i].disabled;
                        is_disabled = (disabled == 1 ? true : false);
                        //n_bund.fieldByName("disabled");

                        app_permissions = {
                            can_create : 0,
                            can_update : 0,
                            all_permissions : 0,
                            can_view : 0
                        };

                        //var node_type_json = JSON.parse(_nd);

                        if (data.no_mobile_display != null && data.no_mobile_display == 1) {
                            is_disabled = true;
                        }

                        if (!is_disabled) {
                            if ( typeof roles !== 'undefined') {

                                if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
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

                        queries.push("INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data, can_create, can_view) VALUES ('" + dbEsc(type) + "', '" + dbEsc(display) + "','" + dbEsc(description) + "','" + dbEsc(JSON.stringify(title_fields)) + "','" + dbEsc(JSON.stringify(data)) + "'," + app_permissions.can_create + "," + app_permissions.can_view + ")");
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
                    queries.push("DROP TABLE " + json.insert[i].type);
                    queries.push("DELETE FROM bundles WHERE bundle_name = '" + json.insert[i].type + "'");
                    queries.push("DELETE FROM node WHERE table_name = '" + json.insert[i].type + "'");

                }
            }
            //Unique node deletion
            else {
                if (progress != null) {
                    progress.set();
                }
                queries.push("DROP TABLE " + json.insert.type);
                queries.push("DELETE FROM bundles WHERE bundle_name = '" + json.insert.type + "'");
                queries.push("DELETE FROM node WHERE table_name = '" + json.insert.type + "'");
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
