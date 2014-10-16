/*jslint plusplus:true,eqeq:true,nomen:true*/

Omadi.data = Omadi.data || {};

Omadi.data.cache = {};
Omadi.data.cache.regions = {};
Omadi.data.cache.fakeFields = {};

var Utils = require('lib/Utils');
var RDNGeofenceListener = require('services/RDNGeofenceListener');
var GeofenceServices = require('services/GeofenceServices');
var Node = require('objects/Node');
var ImageWidget = require('ui/widget/Image');
var TimecardGeofenceVerifier = require('objects/TimecardGeofenceVerifier');

// Constants
Omadi.data.MAX_BYTES_PER_UPLOAD = 1000000; // 1MB

Omadi.data.cameraAndroid = null;

Omadi.data.isUpdating = function() {"use strict";
    return Ti.App.Properties.getBool("isUpdating", false);
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
        Utils.sendErrorReport("Exception getting last update timestamp: "+ ex);
    }

    return timestamp;
};

Omadi.data.getBundle = function(type, reset) {"use strict";
	return Node.getBundle(type, reset);
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
	return Node.getFields(type);
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
        db.close();
        
        Omadi.data.cache.regions[type] = regions;
    }

    return regions;
};

Omadi.data.getNewNodeNid = function() {"use strict";
    return Node.getNewNid();
};

Omadi.data.getNodeTitle = function(node) {"use strict";
    return Node.getTitle(node);
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
      Utils.sendErrorReport("Exception deleteContinuousNodes: " + ex);
  }
};

Omadi.data.addNewTerms = function(node){"use strict";
    return Node.addNewTerms(node);
};
    
Omadi.data.insertNewTerm = function(machine_name, name){"use strict";
    return Node.insertNewTerm(machine_name, name);
};

Omadi.data.nodeSave = function(node) {"use strict";
	return Node.save(node);
};

Omadi.data.deleteNode = function(nid){"use strict";
    Node.deleteNode(nid);
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
                Utils.sendErrorReport("going to save to photo gallery_nid_" + nid + "_field_name_" + field_name + "_delta_" + delta + "_photoId_" + photoId);
            }

            if (Ti.App.isAndroid) {
                
                if (Ti.Filesystem.isExternalStoragePresent()) {

                    imageDir = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, 'failed_uploads');
                    
                    newFilePath = 'failed_' + nid + '_' + field_name + '_' + delta + '_' + Omadi.utils.getUTCTimestamp() + '.jpg'; 
                    
                    if (! imageDir.exists()) {
                        imageDir.createDirectory();
                    }

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
        
                                Utils.sendErrorReport("Saved to photo gallery Android: " + nid);
                            }
                            
                            // Only delete the original file if the file was moved correctly
                            Omadi.data.deletePhotoUpload(photoId, true);
                        }
                        else{
                            
                            Utils.sendErrorReport("Did not save to photo gallery: " + photoId);
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
                    Utils.sendErrorReport("Does not have external storage trying to save failed upload.");
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
        
                                Utils.sendErrorReport("Saved to photo gallery iOS: " + nid);
                            }
                            
                            Omadi.data.deletePhotoUpload(photoId, true);
                        },
                        error : function(e) {
                            Utils.sendErrorReport("Did not save to photo gallery iOS: " + photoId);
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
        Utils.sendErrorReport("Did not save to photo gallery exception: " + photoId + ", ex: " + ex);
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

Omadi.data.deletePhotoUpload = function(id, deleteFile) {"use strict";
    ImageWidget.deletePhotoUpload(id, deleteFile);
};

Omadi.data.nodeLoad = function(nid) {'use strict';
	return Node.load(nid);
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
        sql = "SELECT COUNT(*) FROM _files WHERE nid > 0 AND finished = 0 AND fid > 0";
        
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
        }
        
        result.close();
        mainDB.close();
    }
    catch(ex){
        Utils.sendErrorReport('Error getting photo count: ' + ex);    
    }
    
    return retval;
};

/*
 * Retuns an array of all files stored on the device according to the database.
 */
Omadi.data.getAllFiles = function(){"use strict";
	var files = [];

	var db = Omadi.utils.openListDatabase();
	try {
		var result = db.execute('SELECT * FROM _files ORDER BY tries ASC, filesize ASC, delta ASC');
		while (result.isValidRow()) {
			var file = {
                nid : parseInt(result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT), 10) || 0,
                id : result.fieldByName('id', Ti.Database.FIELD_TYPE_INT),
                file_path : result.fieldByName('file_path'),
                file_name : result.fieldByName('file_name'),
                field_name : result.fieldByName('field_name'),
                delta : parseInt(result.fieldByName('delta'), 10) || 0,
                timestamp : parseInt(result.fieldByName('timestamp'), 10) || 0,
                tries : parseInt(result.fieldByName('tries'), 10) || 0,
                latitude : result.fieldByName('latitude'),
                longitude : result.fieldByName('longitude'),
                accuracy : result.fieldByName('accuracy'),
                degrees : result.fieldByName('degrees'),
                thumb_path : result.fieldByName('thumb_path'),
                type : result.fieldByName('type'),
                filesize : parseInt(result.fieldByName('filesize'), 10) || 0,
                bytes_uploaded : parseInt(result.fieldByName('bytes_uploaded'), 10) || 0,
                fid : result.fieldByName('fid'),
                uid : result.fieldByName('uid'),
                client_account : result.fieldByName('client_account'),
                uploading : parseInt(result.fieldByName('uploading'), 10) || 0,
                finished : parseInt(result.fieldByName('finished'), 10) || 0
            };
            
            files.push(file);
            result.next();
		}
	} catch (e) {
        Utils.sendErrorReport("Error in get file query load: " + e);
	}
	db.close();
	return files;
};

/*
 * Returns an array of all files that are ready to be uploaded.
 * @param {Array.<Object>} files The files from which you want to select uploadable files.
 * @return {Array.<Object>} The files that are ready to be uploaded.
 */
Omadi.data.getUploadableFiles = function(files){"use strict";
	files = files || Omadi.data.getAllFiles();

	var uploadableFiles = [];
	
	var allowVideoMobileNetwork = Ti.App.Properties.getBool('allowVideoMobileNetwork', false);
	var i;
	
	for (i = 0; i < files.length; i++) {
		var file = files[i];
		
		// Filter out videos on mobile unless the user allows it
		if (Ti.Network.networkType === Ti.Network.NETWORK_MOBILE && !allowVideoMobileNetwork) {
			continue;
		}
		
		// Filter out negative nids
		if (file.nid <= 0) {
			continue;
		}
		
		// Filter out files that have already finished uploading
		if (file.finished > 0) {
			continue;
		}
		
		// Filter out files that have failed to upload 10 times
		if (file.tries > 10) {
			continue;
		}
		
		// Prepare large files for chunk uploading
		
		
		uploadableFiles.push(file);
	}
	
	return uploadableFiles;
};

/*
 * Adds chunk loading data to an array of files.
 * @param {Array.<Object>} files The files to process.
 */
Omadi.data.processAttachmentsForChunkUploading = function(files) {"use strict";
    var i;
	for (i = 0; i < files.length; i++) {
		var file = files[i];
		
		// A -1 means the file needs to be fully uploaded from scratch because of some network error, but do not update the bytes_uploaded or it may abort the upload
		var tempBytesUploaded = file.bytes_uploaded;
		if(tempBytesUploaded == -1){
		    tempBytesUploaded = 0;
		}
		
		if(file.type == 'video' || file.type == 'file'){
			file.numUploadParts = Math.ceil(file.filesize / Omadi.data.MAX_BYTES_PER_UPLOAD);
			file.upload_part = (tempBytesUploaded / Omadi.data.MAX_BYTES_PER_UPLOAD) + 1;
			file.uploading_bytes = Omadi.data.MAX_BYTES_PER_UPLOAD;
        } else {
			file.numUploadParts = 1;
			file.upload_part = 1;
			file.uploading_bytes = file.filesize;
		}
	}
};

/*
 * Removes from the database and deletes any files that have been uploaded and need to be removed.
 * @param {Array.<Object>} files The files from which you want to delete finished uploads.
 * @return {Array.<Object>} The passed in files minus those that were deleted.
 */
Omadi.data.deleteFinishedUploads = function(files){"use strict";
	// Don't delete photos if the user set the option to keep them.
	if(Ti.App.Properties.getString("photoWidget", 'take') == 'choose' && Ti.App.Properties.getString("deleteOnUpload", "false") == "false"){
        return files;
    }
    
	files = files || Omadi.data.getAllFiles();
	var returnFiles = [];
	
	var now = Omadi.utils.getUTCTimestamp();
	var db = Omadi.utils.openListDatabase();
	try {
	    var i;
		for (i = 0; i < files.length; i++) {
			var file = files[i];
			
			// Delete files that finshed over 16 hours ago.
			if (file.finished > 0 && now > file.finished + (3600 * 16)) {
				
				// Delete file
				var imageFile = Ti.Filesystem.getFile(file.file_path);
	            if(imageFile.exists()){
	                imageFile.deleteFile();
	            }
	            
	            // Delete thumbnail
	            if(file.thumb_path != null && file.thumb_path.length > 10){
	                var thumbFile = Ti.Filesystem.getFile(file.thumb_path);
	                if(thumbFile.exists()){
	                   thumbFile.deleteFile();
	                }
	            }
	            
	            // Delete from database
	            db.execute("DELETE FROM _files WHERE id = " + file.id);
			} else {
				returnFiles.push(file);
			}
		}
	} catch (e) {
        Utils.sendErrorReport("Error in delete file or thumbnail from device: " + e);
	}
	db.close();
	
	return returnFiles;
};

/*
 * Sets a flag to stop attempting to upload files that have failed 10 times or haven't been uploaded after 30 minutes.
 * @param {Array.<Object>} files The files from which you want to delete finished uploads.
 */
Omadi.data.keepFailedUploads = function(files){"use strict";
	files = files || Omadi.data.getAllFiles();
	
	var now = Omadi.utils.getUTCTimestamp();
	var idsToKeep = [];
	var i;
	var message;
	
	for (i = 0; i < files.length; i++) {
		var file = files[i];
		var node = Omadi.data.nodeLoad(file.nid);
		
		if (node === null) {
            Utils.sendErrorReport('Null node with nid ' + file.nid + ' ' + JSON.stringify(file));
		}
		
		// Check for files that should have been uploaded but haven't after 30 minutes
		if (file.nid <= 0) {
			if (file.nid != -1000000 && file.timestamp < now - 1800) {
				// Files with negative nids have not been uploaded. An nid of -1000000 should never be uploaded.
				if (node.flag_is_updated != 3 && node.flag_is_updated != 4) { // 3 = Draft, 4 = Continuous save
				    // If this is not a draft or continuous save, send up the debug
				    message = "Non draft or continuos node not uploaded after 30 minutes: " + JSON.stringify(node);
				    // Limit node message to 2000 characters
			        message = message.substring(0, 2000);
			        message += JSON.stringify(file);
			        Utils.sendErrorReport(message);
			        
			        idsToKeep.push(file.id);
				}
			}
            
        // Check for files that have failed to upload after 10 attempts
        } else if (file.tries > 10) {
			message = "Over 10 tries: " + JSON.stringify(node);
	        // Limit node message to 2000 characters
	        message = message.substring(0, 2000);
			message += JSON.stringify(file);
			Utils.sendErrorReport(message);
			
            idsToKeep.push(file.id);
        }
	}
	
	var db = Omadi.utils.openListDatabase();
	try {
		if (idsToKeep.length > 0) {
	        // Set files to never be attempted again
	        db.execute("UPDATE _files SET nid = -1000000 WHERE id IN(" + idsToKeep.join(',') + ")");
	        var dialog = Ti.UI.createAlertDialog({
	           title: 'Upload Problem',
	           message: idsToKeep.length + " file" + (idsToKeep.length > 1 ? 's' : '') + " could not be uploaded. You can see non-uploaded files under 'Actions' -> 'Photos Not Uploaded'",  
	           buttonNames: ['Ok', 'Take Me There']
	        });
	        
	        dialog.addEventListener('click', function(e){
                if (e.index === 1) {
		            try {
                        Omadi.display.openLocalPhotosWindow();
		            } catch(ex) {
		                Utils.sendErrorReport("exception upload problem dialog: " + ex);
		            }
				}
	        });
	        
	        dialog.show();
	    }
	} catch (e) {
        Utils.sendErrorReport("Error in keep failed uploads: " + e);
	}
	db.close();
};


/*
Omadi.data.getFileArray = function(){"use strict";
	var files = Omadi.data.getAllFiles();
	
	Omadi.data.keepFailedUploads(files);
	Omadi.data.deleteFinishedUploads(files);
	
	var uploadableFiles = Omadi.data.getUploadableFiles(files);
	Omadi.data.processAttachmentsForChunkUploading(uploadableFiles);
	return files;
};
*/

Omadi.data.getFileArray = function(){"use strict";
    var files, sql, listDB, result, nextFile, now, node, message, 
        neverUploadIds, dialog, deleteFile, photoWidget, photoDeleteOption, imageFile, 
        thumbFile, deleteFinishedIds;
    
    neverUploadIds = [];
    deleteFinishedIds = [];
    files = [];
    
    
    sql = "SELECT * FROM _files ";
    if(Ti.Network.networkType === Ti.Network.NETWORK_MOBILE && !Ti.App.Properties.getBool('allowVideoMobileNetwork', false)){
        sql += " WHERE type != 'video' "; 
    }
    // Try to upload non-failed files first, then the smallest size, then by delta
    sql += " ORDER BY tries ASC, filesize ASC, delta ASC";
    
    now = Omadi.utils.getUTCTimestamp();
    
    listDB = Omadi.utils.openListDatabase();
    
    try{
        result = listDB.execute(sql);
        
        while(result.isValidRow()) {
            
            try{
                
                nextFile = {
                    nid : parseInt(result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT), 10) || 0,
                    id : result.fieldByName('id', Ti.Database.FIELD_TYPE_INT),
                    file_path : result.fieldByName('file_path'),
                    file_name : result.fieldByName('file_name'),
                    field_name : result.fieldByName('field_name'),
                    delta : parseInt(result.fieldByName('delta'), 10) || 0,
                    timestamp : parseInt(result.fieldByName('timestamp'), 10) || 0,
                    tries : parseInt(result.fieldByName('tries'), 10) || 0,
                    latitude : result.fieldByName('latitude'),
                    longitude : result.fieldByName('longitude'),
                    accuracy : result.fieldByName('accuracy'),
                    degrees : result.fieldByName('degrees'),
                    thumb_path : result.fieldByName('thumb_path'),
                    type : result.fieldByName('type'),
                    filesize : parseInt(result.fieldByName('filesize'), 10) || 0,
                    bytes_uploaded : parseInt(result.fieldByName('bytes_uploaded'), 10) || 0,
                    fid : result.fieldByName('fid'),
                    uid : result.fieldByName('uid'),
                    client_account : result.fieldByName('client_account'),
                    uploading : parseInt(result.fieldByName('uploading'), 10) || 0,
                    finished : parseInt(result.fieldByName('finished'), 10) || 0
                };
                
                // Upload videos and files in chunks
                if(nextFile.type == 'video' || nextFile.type == 'file'){
                    // A -1 means that the video upload needs to be restarted 
                    var tempBytesUploaded = nextFile.bytes_uploaded;
                    if(tempBytesUploaded == -1){
                        tempBytesUploaded = 0;
                    }
                    
                    nextFile.numUploadParts = Math.ceil(nextFile.filesize / Omadi.data.MAX_BYTES_PER_UPLOAD);
                    nextFile.upload_part = (tempBytesUploaded / Omadi.data.MAX_BYTES_PER_UPLOAD) + 1;
                    nextFile.uploading_bytes = Omadi.data.MAX_BYTES_PER_UPLOAD;
                } else {
                    nextFile.numUploadParts = 1;
                    nextFile.upload_part = 1;
                    nextFile.uploading_bytes = nextFile.filesize;
                }
                 
                // Negative nids mean they haven't been uploaded yet, -1000000 means never upload.
                // Send error reports for files that should have been uploaded but are over 30 minutes old.
                if (nextFile.nid <= 0) { 
                    if (nextFile.nid != -1000000 && nextFile.timestamp < now - 1800) {
	                    node = Omadi.data.nodeLoad(nextFile.nid);
	                    if (node !== null) {
	                        if (node.flag_is_updated != 3 && node.flag_is_updated != 4) { // 3 = Draft, 4 = Continuous save
	                            // If this is not a draft or continuous save, send up the debug
	                            message = "Not a negative draft: " + JSON.stringify(node);
	                            // Limit node message to 2000 characters
	                            message = message.substring(0, 2000);
	                            message += JSON.stringify(nextFile);
	                            Utils.sendErrorReport(message);
	                            
	                            // Do not remove this as an upload just yet.
	                            // It could be a continuous save node
	                            // Need to look at error data from users using this
	                            // to determine what to do in this case
	                        }
	                    } else {
	                        message = "Null negative Node with nid " + nextFile.nid + " ";
	                        message += JSON.stringify(nextFile);
	                        Utils.sendErrorReport(message);
	                        
	                        // This file should stop attempting to be uploaded
	                        neverUploadIds.push(nextFile.id);
	                    }
                    }
                } else if (nextFile.finished > 0) {
                    // We don't show the finished uploads
                    
                    if(now > nextFile.finished + (3600 * 16)){
                        // Delete any files that have been uploaded and still exist on the device for too long (16 hours)
                        
                        deleteFile = true;
                        
                        photoWidget = Ti.App.Properties.getString("photoWidget", 'take');
                        photoDeleteOption = Ti.App.Properties.getString("deleteOnUpload", "false");
                       
                        if(photoWidget == 'choose' && photoDeleteOption == "false"){
                            deleteFile = false;
                        }
                        
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
                        Utils.sendErrorReport(message);
                    }
                    else{
                        message = "Null Node with nid " + nextFile.nid + " ";
                        message += JSON.stringify(nextFile);
                        Utils.sendErrorReport(message);
                    }
                    
                    // This file should stop attempting to be uploaded
                    neverUploadIds.push(nextFile.id);
                }
                else{
                    // Only allow positive nids into the possibilities for upload
                    files.push(nextFile);
                }
            }
            catch(innerEx){
                // Catch the inner exception so it doesn't throw away all uploads
                Utils.sendErrorReport("Error in get file query load: " + innerEx);
            }
            
            result.next();
        }
        result.close();
    }
    catch(exDB){
        Utils.sendErrorReport("Error in get file query load: " + exDB);
    }
    
    if(deleteFinishedIds.length > 0){
        // Delete the record from the files table
        listDB.execute("DELETE FROM _files WHERE id IN(" + deleteFinishedIds.join(',') + ")");
    }
    
    if(neverUploadIds.length > 0){
        // Set files to never be attempted again
        listDB.execute("UPDATE _files SET nid = -1000000 WHERE id IN(" + neverUploadIds.join(',') + ")");
        Utils.sendErrorReport(neverUploadIds.length + " file" + (neverUploadIds.length > 1 ? 's' : '') + " could not be uploaded. You can see non-uploaded files under 'Actions' -> 'Photos Not Uploaded'");
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
                Utils.sendErrorReport("exception upload problem dialog: " + ex);
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
        filePart, resizedBlob, maxPhotoPixels, files, i, incrementTries, retryEncode;
   
    nextFile = null;
    readyForUpload = true;
    restartSuggested = false;
    deleteFromDB = false;
    maxPhotoPixels = 1280;
    
    files = Omadi.data.getFileArray();
           
    for(i = 0; i < files.length; i ++){
        incrementTries = 0;
        
        try{
            nextFile = files[i];
            if(nextFile.fid <= 0){
                // Only upload photos that already have an fid assigned to them
                continue;
            }
            
            imageFile = Ti.Filesystem.getFile(nextFile.file_path);
            
            if(!imageFile.exists()){
                Utils.sendErrorReport("The file at " + nextFile.file_path + " for node #" + nextFile.nid + " cannot be found for upload.");
                
                alert("The file at " + nextFile.file_path + " for node #" + nextFile.nid + " cannot be found for upload.");
                
                // Don't show this error again, since this will not ever be resolved
                incrementTries = 10;
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
                                Utils.sendErrorReport("Defined exception in Android base64Encode: " + nextFile.file_data);
                                retryEncode = true;
                            }
                        }
                        catch(exbase64){
                            Ti.API.debug("Exception reading Android base64Encode: " + exbase64);
                            Utils.sendErrorReport("Exception reading Android base64Encode: " + exbase64);
                            retryEncode = true;
                        }
                        
                        if(retryEncode){
                            // Fall back to original method of encoding the image
                            try{
                                imageBlob = imageFile.read();
                                
                                if(!imageBlob){
                                    incrementTries = 1;
                                    Ti.API.debug("Image Blob is null");
                                    Utils.sendErrorReport("Image blob is null");
                                    restartSuggested = true;
                                } 
                            }
                            catch(exRead){
                                Ti.API.debug("Exception reading file: " + exRead);
                                Utils.sendErrorReport("Exception reading non-resized photo: " + exRead);
                                readyForUpload = false;
                                // This is probably a memory error, so request a restart
                                restartSuggested = true;
                                
                                incrementTries = 1;
                            }
                        }
                    }
                    else{
                        try{
                            imageBlob = imageFile.read();
                            
                            if(!imageBlob){
                                incrementTries = 1;
                                Ti.API.debug("Image Blob is null");
                                Utils.sendErrorReport("Image blob is null");
                                restartSuggested = true;
                            }
                        }
                        catch(exRead1){
                            Ti.API.debug("Exception reading file: " + exRead1);
                            Utils.sendErrorReport("Exception reading non-resized photo: " + exRead1);
                            readyForUpload = false;
                            // This is probably a memory error, so request a restart
                            restartSuggested = true;
                            
                            incrementTries = 1;
                        }
                        
                        if(incrementTries == 0){
                            
                            if(Ti.App.isIOS){
                                // Resize the photo to a smaller size
                                try {
                                    
                                    Ti.API.debug("Original: " + imageBlob.length + " " + imageBlob.width + "x" + imageBlob.height);
                                    
                                    if (imageBlob.length > Omadi.data.MAX_BYTES_PER_UPLOAD || imageBlob.height > maxPhotoPixels || imageBlob.width > maxPhotoPixels) {
        
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
        
                                        /*global ImageFactory*/
                                        resizedBlob = imageBlob.imageAsResized(newWidth, newHeight);
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
                                    Utils.sendErrorReport("Exception resizing iOS Photo: " + ex);
                                    readyForUpload = false;
                                    incrementTries = 1;
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
                            length: Omadi.data.MAX_BYTES_PER_UPLOAD 
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
                            Utils.sendErrorReport("Read zero bytes from stream.");
                            incrementTries = 1;
                        }
                        
                        // Set the actual number of bytes we're uploading for this part
                        nextFile.uploading_bytes = numBytesRead;
                        
                        // Release the resources
                        buffer.release();
                    }
                    catch(exVideo){
                        Utils.sendErrorReport("Exception with video upload: " + exVideo);
                        incrementTries = 1;
                    }
                }
                
                if(!nextFile.loaded && incrementTries == 0){
                    Ti.API.debug("Upload Part: " + nextFile.upload_part + "/" + nextFile.numUploadParts);
                    Ti.API.debug(nextFile);
                    
                    try{
                        nextFile.file_data = Ti.Utils.base64encode(imageBlob);
                        
                        try{
                            nextFile.file_data = nextFile.file_data.getText();
                        }
                        catch(ex6){
                            Utils.sendErrorReport("Exception getting text of base64 photo of size " + imageBlob.length + ": " + ex6); 
                            // This photo is not going to upload correctly
                            readyForUpload = false;
                            incrementTries = 0;
                            
	                        // A memory problem is usually the culprit here.
	                        restartSuggested = true;
                        }
                    }
                    catch(ex5){
                        Utils.sendErrorReport("Exception base64 encoding photo of size " + imageBlob.length + ": " + ex5 + ", availableMemory " + Ti.Platform.availableMemory); 
                        // This photo is not going to upload correctly
                        readyForUpload = false;
                        incrementTries = 0;
                        
                        // A memory problem is usually the culprit here.
                        restartSuggested = true;
                    }
                }
                
                imageBlob = null;
            }
            
            imageFile = null;
        }
        catch(exAll){
            incrementTries = 1;
            Utils.sendErrorReport("File error: " + exAll);
        }
        
        if(incrementTries > 0){
            // Increment the file load tries counter
            listDB = Omadi.utils.openListDatabase();
            listDB.execute("UPDATE _files SET tries = (tries + " + incrementTries + ") WHERE id = " + nextFile.id);
            listDB.close();
        }
        else{
            // We can use the current file to upload, so don't check another one
            return nextFile;
        }
    }
    
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
                   Utils.sendErrorReport("Actually closing the app by user");
                   Omadi.utils.closeApp();
               } 
            }
            catch(ex){
                Utils.sendErrorReport("exception the app is currently using too much memory: " + ex);
            }
        });
        
        dialog.show();
        
        Utils.sendErrorReport("An Android restart was suggested.");
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
    
    files = Omadi.data.getAllFiles();
    
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
    
    Utils.sendErrorReport(message);
};

Omadi.data.resetDatabases = function(){"use strict";
    var listDB, db, gpsDB;
    
    GeofenceServices.getInstance().unregisterAllGeofences();
    
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
            Omadi.data.setLastUpdateTimestamp(Omadi.service.fetchedJSON.request_time);
            
            if (Omadi.service.fetchUpdatesProgressBar !== null) {
                Omadi.service.fetchUpdatesProgressBar.increment();
                Omadi.service.fetchUpdatesProgressBar.close();
                Omadi.service.fetchUpdatesProgressBar = null;
            }
            Ti.API.debug("Done with install - no items");
        }
        else {
            mainDB = Omadi.utils.openMainDatabase();
        
            if (Omadi.service.fetchUpdatesProgressBar !== null) {
                //Set max value for progress bar
                Omadi.service.fetchUpdatesProgressBar.set_max(numItems);
            }
            
            if (Omadi.data.getLastUpdateTimestamp() === 0) {
                mainDB.execute('UPDATE updated SET "url"="' + Ti.App.DOMAIN_NAME + '" WHERE "rowid"=1');
            }

            Ti.API.info('######### Request time : ' + Omadi.service.fetchedJSON.request_time);

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
                
                if (Omadi.service.fetchedJSON.node.runsheet) {
					var rdnGeofenceListener = RDNGeofenceListener.getInstance();
					if (Omadi.service.fetchedJSON.node.runsheet.insert) {
						rdnGeofenceListener.addOrUpdateGeofences(Omadi.service.fetchedJSON.node.runsheet.insert);
					}
					if (Omadi.service.fetchedJSON.node.runsheet['delete']) {
						rdnGeofenceListener.deleteGeofences(Omadi.service.fetchedJSON.node.runsheet['delete']);
					}
                }
                
                TimecardGeofenceVerifier.getInstance().clearCache();
            }
            
            if ( typeof Omadi.service.fetchedJSON.comment !== 'undefined') {
                Ti.API.debug("Installing comments");
                Omadi.data.processCommentJson(mainDB);
            }
            
            mainDB.close();
            
            Omadi.data.setLastUpdateTimestamp(Omadi.service.fetchedJSON.request_time);

            if (Omadi.service.fetchUpdatesProgressBar !== null) {
                Omadi.service.fetchUpdatesProgressBar.close();
                Omadi.service.fetchUpdatesProgressBar = null;
            }
            
            Ti.App.fireEvent("omadi:syncInstallComplete");   
        }

        if ( typeof Omadi.service.fetchedJSON.new_app !== 'undefined' && Omadi.service.fetchedJSON.new_app.length > 0) {
            Ti.API.debug("New App: " + Omadi.service.fetchedJSON.new_app);
            Omadi.display.newAppAvailable(Omadi.service.fetchedJSON.new_app);
        }
        
        Omadi.bundles.dispatch.showNewDispatchJobs();
        Omadi.display.showNewNotificationDialog();
        
        
        if(typeof Omadi.service.fetchedJSON.page !== 'undefined' && 
            typeof Omadi.service.fetchedJSON.total_pages !== 'undefined' && 
            typeof Omadi.service.fetchedJSON.total_node_count !== 'undefined' &&
            typeof Omadi.service.fetchedJSON.total_comment_count !== 'undefined'){
            
            Omadi.service.syncInitialFormItems(Omadi.service.fetchedJSON.total_node_count, Omadi.service.fetchedJSON.total_comment_count, Omadi.service.fetchedJSON.total_pages);
        }
    }
    catch(ex) {
        alert("Saving Sync Data: " + ex);
        Utils.sendErrorReport("Exception saving sync data: " + ex);
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

                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
        permissionsString, permIdx, roleIdx, i, nodeBundle;
        
    try {
        queries = [];

        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;
        

        if (Omadi.service.fetchedJSON.fields.insert) {
            if (Omadi.service.fetchedJSON.fields.insert.length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.fields.insert.length; i++) {

                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
                        db_type = "TEXT";
                        
                        //Check if it is a valid bundle (automatically inserted through the API):
                        result = mainDB.execute("SELECT * FROM bundles WHERE bundle_name='" + bundle + "'");
                        if (result.isValidRow()) {
                            if (Omadi.service.fetchedJSON.fields.insert[i].settings.parts) {
                                for (part in Omadi.service.fetchedJSON.fields.insert[i].settings.parts) {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___" + part + "' " + db_type);
                                }
                                if (Omadi.service.fetchedJSON.fields.insert[i].type == 'location') {
									queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___lat' " + db_type);
									queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___lng' " + db_type);
                                }
                            }
                            else {
                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
                                
                                if (Omadi.service.fetchedJSON.fields.insert[i].type == 'file') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___filename' " + db_type);
                                } else if (Omadi.service.fetchedJSON.fields.insert[i].type == 'extra_price') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___data' " + db_type);
                                } else if (Omadi.service.fetchedJSON.fields.insert[i].type == 'datestamp') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___end' " + db_type);
                                }
                            }
                        }
                        else{
                               
                            // The bundle does not exist, so it may be a comment field
                            nodeBundle = bundle.replace('comment_node_', '');
                            result = mainDB.execute("SELECT * FROM bundles WHERE bundle_name='" + nodeBundle + "'");
                            
                            if (result.isValidRow()) {
                                
                                result.close();
                                
                                // The node type exists, so add the column to the correct comment table
                                result = mainDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='" + bundle + "'");
                                
                                if(!result.isValidRow()){
                                    // The table has not yet been created, so create it
                                    // This must be created immediately so that any other fields referencing this table will see it
                                    mainDB.execute("CREATE TABLE '" + bundle + "' ('cid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                                }
                                
                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
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
                        // Datestamp with end time
                        else if (Omadi.service.fetchedJSON.fields.insert[i].type == 'datestamp' && Omadi.service.fetchedJSON.fields.insert[i].settings.enddate_get) {
							// push start date
							queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + dbEsc(field_type) + "','" + dbEsc(field_name) + "','" + dbEsc(label) + " Start','" + dbEsc(description) + "','" + dbEsc(bundle) + "','" + dbEsc(region) + "'," + weight + ",'" + dbEsc(required) + "','" + dbEsc(disabled) + "','" + dbEsc(widgetString) + "','" + dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
							// push end date
							queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + dbEsc(field_type) + "','" + dbEsc(field_name + "___end") + "','" + dbEsc(label) + "','" + dbEsc(description) + "','" + dbEsc(bundle) + "','" + dbEsc(region) + "'," + weight + ", '" + dbEsc(required) + "' ,  '" + dbEsc(disabled) + "' , '" + dbEsc(widgetString) + "','" + dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                        }
                        //Normal field
                        else {
                            queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + dbEsc(field_type) + "','" + dbEsc(field_name) + "','" + dbEsc(label) + "','" + dbEsc(description) + "','" + dbEsc(bundle) + "','" + dbEsc(region) + "'," + weight + ",'" + dbEsc(required) + "','" + dbEsc(disabled) + "','" + dbEsc(widgetString) + "','" + dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                        }
                    }
                    else {
                        // The structure exists.... just update the fields table values
                        // This will work for fields with parts, as they are indexed by the same fid
                        if (Omadi.service.fetchedJSON.fields.insert[i].type == 'datestamp') {
							if (Omadi.service.fetchedJSON.fields.insert[i].settings.enddate_get) {
								queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + dbEsc(field_type) + "','" + dbEsc(field_name + "___end") + "','" + dbEsc(label) + "','" + dbEsc(description) + "','" + dbEsc(bundle) + "','" + dbEsc(region) + "'," + weight + ", '" + dbEsc(required) + "' ,  '" + dbEsc(disabled) + "' , '" + dbEsc(widgetString) + "','" + dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
							} else {
								queries.push("DELETE FROM fields WHERE field_name='" + field_name + "___end'");
							}
                        } else {
							queries.push("UPDATE fields SET type='" + dbEsc(field_type) + "', label='" + dbEsc(label) + "', description='" + dbEsc(description) + "', bundle='" + dbEsc(bundle) + "', region='" + dbEsc(region) + "', weight=" + weight + ", required='" + dbEsc(required) + "', disabled='" + dbEsc(disabled) + "', widget='" + dbEsc(widgetString) + "', settings='" + dbEsc(settingsString) + "', can_view=" + can_view + ", can_edit=" + can_edit + "  WHERE fid=" + fid);
                        }
                    }
                }
            }
        }

        if (Omadi.service.fetchedJSON.fields["delete"]) {
            if (Omadi.service.fetchedJSON.fields["delete"].length) {
                
                
                
                for ( i = 0; i < Omadi.service.fetchedJSON.fields["delete"].length; i++) {
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
            Node.resetFieldCache();
        }
    }
    catch(ex) {
        alert("Saving fields: " + ex);
    }
};

Omadi.data.processCommentJson = function(mainDB) {"use strict";
    var i, j, queries, query, fieldNames, tableName, instances, field_name, values, value;

    try {
        queries = [];

        if (Omadi.service.fetchedJSON.comment.insert) {
            if (Omadi.service.fetchedJSON.comment.insert.length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.comment.insert.length; i++) {
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.set();
                    }
                    
                    tableName = Omadi.service.fetchedJSON.comment.insert[i].node_type;
                    
                    queries.push('INSERT OR REPLACE INTO comment (cid, nid, uid, subject, created, changed, status, name, node_type) VALUES (' + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].cid) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].nid) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].uid) + ",'" + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].subject) + "'," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].created) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].changed) + "," + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].status) + ",'" + dbEsc(Omadi.service.fetchedJSON.comment.insert[i].name) + "','" + dbEsc(tableName) + "')");
                    
                    query = 'INSERT OR REPLACE  INTO ' + tableName + ' (';
    
                    fieldNames = [];
                    fieldNames.push('cid');
                    instances = Omadi.data.getFields(tableName);
                    
                    for (field_name in instances) {
                        fieldNames.push("`" + field_name + "`");
                        
                        if(instances[field_name].type == 'file'){
                            fieldNames.push(field_name + "___filename");
                        }
                        else if(instances[field_name].type == 'extra_price'){
                            fieldNames.push(field_name + "___data");
                        }
                    }
                    
                    query += fieldNames.join(',');
                    query += ') VALUES (';

                    values = [];
                    values.push(Omadi.service.fetchedJSON.comment.insert[i].cid);

                    for (field_name in instances) {
                        if(instances.hasOwnProperty(field_name)){
                            
                            if(instances[field_name].type == 'file'){
                                
                                if (typeof Omadi.service.fetchedJSON.comment.insert[i][field_name + "___fid"] === "undefined" || Omadi.service.fetchedJSON.comment.insert[i][field_name + "___fid"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = Omadi.service.fetchedJSON.comment.insert[i][field_name + "___fid"];

                                    if ( value instanceof Array) {
                                        values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                    }
                                    else {
                                        values.push("'" + dbEsc(value) + "'");
                                    }
                                }
                                
                                if (typeof Omadi.service.fetchedJSON.comment.insert[i][field_name + "___filename"] === "undefined" || Omadi.service.fetchedJSON.comment.insert[i][field_name + "___filename"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = Omadi.service.fetchedJSON.comment.insert[i][field_name + "___filename"];

                                    if ( value instanceof Array) {
                                        values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                    }
                                    else {
                                        values.push("'" + dbEsc(value) + "'");
                                    }
                                }
                            }
                            else if(instances[field_name].type == 'extra_price'){
                                
                                if (typeof Omadi.service.fetchedJSON.comment.insert[i][field_name + "___value"] === "undefined" || Omadi.service.fetchedJSON.comment.insert[i][field_name + "___value"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = Omadi.service.fetchedJSON.comment.insert[i][field_name + "___value"];
                                    values.push("'" + dbEsc(value) + "'");
                                }
                              
                                if (typeof Omadi.service.fetchedJSON.comment.insert[i][field_name + "___data"] === "undefined" || Omadi.service.fetchedJSON.comment.insert[i][field_name + "___data"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = Omadi.service.fetchedJSON.comment.insert[i][field_name + "___data"];
                                    values.push("'" + dbEsc(JSON.stringify(value)) + "'");
                                }
                            }
                            else if (typeof Omadi.service.fetchedJSON.comment.insert[i][field_name] === "undefined" || Omadi.service.fetchedJSON.comment.insert[i][field_name] === null) {
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
                                    case 'omadi_time':
                                    case 'datestamp':
                                    case 'image':
                                    
                                        value = Omadi.service.fetchedJSON.comment.insert[i][field_name];

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
                                        value = Omadi.service.fetchedJSON.comment.insert[i][field_name];

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
                
                    queries.push(query);    
                }
            }
        }

        if (queries.length > 0) {

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                mainDB.execute(queries[i]);
                //Ti.API.debug("Inserted a comment");
            }
            mainDB.execute("COMMIT TRANSACTION");
        }

    }
    catch(ex) {
        Utils.sendErrorReport("Exception while installing comments: " + ex);
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
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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

Omadi.data.updateFidsOnNewFiles = function(nid, newFiles) {"use strict";
	var db = Omadi.utils.openListDatabase();
	try {
	    var i;
		for (i = 0; i < newFiles.length; i++) {
			var result = db.execute('SELECT id FROM _files WHERE nid=' + nid + ' AND field_name="' + newFiles[i].fieldName + '" AND fid=0 ORDER BY timestamp ASC LIMIT 1');
			if (result.isValidRow()) {
				db.execute('UPDATE _files SET fid=' + newFiles[i].fid + ' WHERE id=' + result.fieldByName('id'));
			} else {
				Utils.sendErrorReport('Could not find matching file in updateFidsOnNewFiles: SELECT id FROM _files WHERE nid=' + nid + ' AND field_name="' + newFiles[i].fieldName + '" AND fid=0 ORDER BY timestamp ASC LIMIT 1');
			}
		}
	} catch (e) {
		Utils.sendErrorReport('Error in updateFidsOnNewFiles: ' + e);
	}
	db.close();
};

Omadi.data.processNodeJson = function(type, mainDB) {"use strict";
    /*jslint nomen: true*/

    var closeDB, instances, fakeFields, queries, i, j, field_name, query, 
        fieldNames, no_data, values, value, notifications = {}, numSets, 
        result, reasonIndex, reason, alertReason, dialog, updateNid, 
        listDB, fullResetLastSync, nodeChangedTimestamp, real_field_name;
    
    
    fullResetLastSync = Ti.App.Properties.getDouble('omadi:fullResetLastSync', 0);
    
    // No full reset is happening after this process, so reset, the value is cached above
    Ti.App.Properties.setDouble('omadi:fullResetLastSync', 0);
    
    closeDB = false;
    queries = [];
    
    var sentErrors = 0;

    try {

        instances = Omadi.data.getFields(type);
        fakeFields = Omadi.data.getFakeFields(type);

        // Make sure the node type still exists
        result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name='" + type + "'");
        if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {

            //Insert
            if (Omadi.service.fetchedJSON && 
                Omadi.service.fetchedJSON.node && 
                Omadi.service.fetchedJSON.node[type] && 
                Omadi.service.fetchedJSON.node[type].insert) {
                    
                Ti.API.debug("inserting " + type + " nodes: " + Omadi.service.fetchedJSON.node[type].insert.length);
                
                for ( i = 0; i < Omadi.service.fetchedJSON.node[type].insert.length; i++) {
                    
                    if(Omadi.service.fetchedJSON.node[type].insert[i].__error){
                        
                        Ti.API.debug("HAS ERROR");
                        
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
                    } else {
                    
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
                            fieldNames.push("`" + field_name + "`");
                            
                            if(instances[field_name].type == 'file'){
                                fieldNames.push(field_name + "___filename");
                            }
                            else if(instances[field_name].type == 'extra_price'){
                                fieldNames.push(field_name + "___data");
                            }
                            else if(instances[field_name].type == 'location' && field_name.indexOf('___postal_code') != -1) {
								real_field_name = field_name.split('___')[0];
								fieldNames.push(real_field_name + '___lat');
								fieldNames.push(real_field_name + '___lng');
                            }
                        }
                        
                        for(field_name in fakeFields){
                            fieldNames.push("`" + field_name + "`");
                        }
                        
                        query += fieldNames.join(',');
                        query += ') VALUES (';

                        values = [];
                        values.push(Omadi.service.fetchedJSON.node[type].insert[i].nid);

                        for (field_name in instances) {
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
                            else if(instances[field_name].type == 'location' && field_name.indexOf('___postal_code') != -1){
								real_field_name = field_name.split('___')[0];
								
								// push ___postal_code value
								value = Omadi.service.fetchedJSON.node[type].insert[i][field_name];
								values.push("'" + dbEsc(value instanceof Array ? JSON.stringify(value) : value) + "'");
								
								// push ___lat
								value = Omadi.service.fetchedJSON.node[type].insert[i][real_field_name + '___lat'];
								values.push("'" + dbEsc(value instanceof Array ? JSON.stringify(value) : value) + "'");
								
								// push ___lng
								value = Omadi.service.fetchedJSON.node[type].insert[i][real_field_name + '___lng'];
								values.push("'" + dbEsc(value instanceof Array ? JSON.stringify(value) : value) + "'");
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
                                    case 'omadi_time':
                                    case 'datestamp':
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
                        
                        for(field_name in fakeFields){
                            if(fakeFields.hasOwnProperty(field_name)){
                                
                                if(typeof Omadi.service.fetchedJSON.node[type].insert[i][field_name] !== 'undefined'){
                                    value = Omadi.service.fetchedJSON.node[type].insert[i][field_name];
                                    values.push("'" + dbEsc(value) + "'");
                                }
                                else{
                                   values.push("null");
                                }
                            }
                        }

                        query += values.join(",");
                        query += ')';
                        
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
                            
                            Omadi.data.updateSignatureFids(Omadi.service.fetchedJSON.node[type].insert[i]);
                            
                            try{
                                Ti.App.fireEvent('switchedItUp', {
                                    negativeNid : Omadi.service.fetchedJSON.node[type].insert[i].__negative_nid,
                                    positiveNid : Omadi.service.fetchedJSON.node[type].insert[i].nid
                                });
                            }
                            catch(switchedEx){
                                Utils.sendErrorReport("exception switching it up: " + switchedEx);
                            }
                        }

						var newFiles = Omadi.service.fetchedJSON.node[type].insert[i].__newFiles;
                        if (newFiles && newFiles.length > 0) {
							try{
                                Ti.App.fireEvent('newFilesAdded', {
                                    newFiles : newFiles
                                });
                            }
                            catch(e){
                                Utils.sendErrorReport("Exception firing newFilesAdded event: " + e);
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
                    
						if (Omadi.service.fetchedJSON.node[type].insert[i].__newFiles) {
							Omadi.data.updateFidsOnNewFiles(Omadi.service.fetchedJSON.node[type].insert[i].nid, Omadi.service.fetchedJSON.node[type].insert[i].__newFiles);
						}
                    }
                }
            }

            if (Omadi.service.fetchedJSON.node && 
                Omadi.service.fetchedJSON.node[type] &&
                Omadi.service.fetchedJSON.node[type]['delete']) {
                    
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

            numSets = 0;

            mainDB.execute("BEGIN IMMEDIATE TRANSACTION");

            if (Omadi.service.fetchUpdatesProgressBar != null) {
                for ( i = 0; i < queries.length; i++) {
                    // Don't allow one bad node to ruin the rest of the inserts
                    // Do a try/catch for each one
                    try{
                        mainDB.execute(queries[i]);
                        if (i % 4 == 0) {
                            Omadi.service.fetchUpdatesProgressBar.increment();
                            numSets++;
                        }   
                    }
                    catch(ex1) {
                        if(sentErrors < 5){
                            Utils.sendErrorReport("Error saving node Data for " + type + ": " + ex1 + ". Details: " + queries[i]);
                            alert("Error saving node Data for " + type + ": " + ex1 + ". Details: " + queries[i]);
                            sentErrors ++;   
                        }
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
                        if(sentErrors < 5){
                            Utils.sendErrorReport("Error saving node Data for " + type + ": " + ex2 + ". Details: " + queries[i]);
                            alert("Error saving node Data for " + type + ": " + ex2 + ". Details: " + queries[i]);
                            sentErrors ++;   
                        }
                    }
                }
            }

            mainDB.execute("COMMIT TRANSACTION");
        }

        if (Omadi.service.fetchUpdatesProgressBar != null && typeof Omadi.service.fetchedJSON.node[type].insert != 'undefined') {
            for ( i = numSets; i < Omadi.service.fetchedJSON.node[type].insert.length; i++) {
                Omadi.service.fetchUpdatesProgressBar.increment();
            }
        }
    }
    catch(ex) {
        Utils.sendErrorReport("Exception saving from sync: " + ex);
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

Omadi.data.updateSignatureFids = function(node) {"use strict";
	var db = Omadi.utils.openListDatabase();
    var result = db.execute('SELECT field_name FROM _files WHERE nid=' + node.nid + ' AND type="signature"');
    
    while(result.isValidRow()) {
        var fieldName = result.fieldByName('field_name');
        var fid = node[fieldName];
        
        db.execute('UPDATE _files SET fid=' + fid + ' WHERE nid=' + node.nid + ' AND field_name="' + fieldName + '"');
        result.next(); 
    }
    
    result.close();
    db.close();
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
                        if (Omadi.service.fetchUpdatesProgressBar != null) {
                            Omadi.service.fetchUpdatesProgressBar.increment();
                        }
                        vid = Omadi.service.fetchedJSON.vocabularies.insert[i].vid;
                        name = Omadi.service.fetchedJSON.vocabularies.insert[i].name;
                        machine_name = Omadi.service.fetchedJSON.vocabularies.insert[i].machine_name;
    
                        queries.push('INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid + ",'" + dbEsc(name) + "','" + dbEsc(machine_name) + "')");
                    }
            }
            if (typeof Omadi.service.fetchedJSON.vocabularies.update !== 'undefined' &&
                Omadi.service.fetchedJSON.vocabularies.update &&
                Omadi.service.fetchedJSON.vocabularies.update.length) {
                    
                    for ( i = 0; i < Omadi.service.fetchedJSON.vocabularies.update.length; i++) {
                        if (Omadi.service.fetchUpdatesProgressBar != null) {
                            //Increment Progress Bar
                            Omadi.service.fetchUpdatesProgressBar.increment();
                        }
    
                        queries.push("UPDATE vocabulary SET name='" + dbEsc(Omadi.service.fetchedJSON.vocabularies.insert[i].name) + "', machine_name='" + dbEsc(Omadi.service.fetchedJSON.vocabularies.update[i].machine_name) + "' WHERE vid=" + Omadi.service.fetchedJSON.vocabularies.update[i].vid);
                    }
            }
            
            if (typeof Omadi.service.fetchedJSON.vocabularies["delete"] !== 'undefined' && 
                Omadi.service.fetchedJSON.vocabularies["delete"] &&
                Omadi.service.fetchedJSON.vocabularies["delete"].length) {
             
                    for ( i = 0; i < Omadi.service.fetchedJSON.vocabularies["delete"].length; i++) {
                        if (Omadi.service.fetchUpdatesProgressBar != null) {
                            //Increment Progress Bar
                            Omadi.service.fetchUpdatesProgressBar.increment();
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
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        Omadi.service.fetchUpdatesProgressBar.increment();
                    }
                    queries.push("UPDATE regions SET node_type='" + dbEsc(Omadi.service.fetchedJSON.regions.update[i].node_type) + "', label='" + dbEsc(Omadi.service.fetchedJSON.regions.update[i].label) + "', region_name='" + dbEsc(Omadi.service.fetchedJSON.regions.update[i].region_name) + "', weight=" + Omadi.service.fetchedJSON.regions.update[i].weight + ", settings='" + dbEsc(JSON.stringify(Omadi.service.fetchedJSON.regions.update[i].settings)) + "' WHERE rid=" + Omadi.service.fetchedJSON.regions.update[i].rid);
                }
            }
        }

        //Delete - Regions
        if (Omadi.service.fetchedJSON.regions["delete"]) {
            if (Omadi.service.fetchedJSON.regions["delete"].length) {
                for ( i = 0; i < Omadi.service.fetchedJSON.regions["delete"].length; i++) {
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
       
        if (Omadi.service.fetchedJSON.terms.insert) {
            if (Omadi.service.fetchedJSON.terms.insert.length) {

                for ( i = 0; i < Omadi.service.fetchedJSON.terms.insert.length; i++) {
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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

                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
                    if (Omadi.service.fetchUpdatesProgressBar != null) {
                        //Increment Progress Bar
                        Omadi.service.fetchUpdatesProgressBar.increment();
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
            
                // Ti.API.debug("node_type: " + JSON.stringify(Omadi.service.fetchedJSON.node_type));

                for ( i = 0; i < Omadi.service.fetchedJSON.node_type.insert.length; i++) {
                    type = Omadi.service.fetchedJSON.node_type.insert[i].type;

                    if (type != 'user' && type != '') {
                        
                        //Increment the progress bar
                        if (Omadi.service.fetchUpdatesProgressBar != null) {
                            Omadi.service.fetchUpdatesProgressBar.increment();
                        }

                        bundle_result = mainDB.execute("SELECT COUNT(*) FROM bundles WHERE bundle_name = '" + type + "'");
                        if (bundle_result.field(0, Ti.Database.FIELD_TYPE_INT) === 0) {
                            Ti.API.debug("CREATING TABLE " + type);
                            queries.push("CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                            
                            // Create the comment table too
                            queries.push("CREATE TABLE 'comment_node_" + type + "' ('cid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
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
                        description = Omadi.service.fetchedJSON.node_type.insert[i].description;
                        disabled = Omadi.service.fetchedJSON.node_type.insert[i].disabled;
                        is_disabled = (disabled == 1 ? true : false);

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
                    if (Omadi.service.fetchUpdatesProgressBar !== null) {
                        Omadi.service.fetchUpdatesProgressBar.increment();
                    }
                    queries.push("DROP TABLE " + Omadi.service.fetchedJSON.node_type.insert[i].type);
                    queries.push("DELETE FROM bundles WHERE bundle_name = '" + Omadi.service.fetchedJSON.node_type.insert[i].type + "'");
                    queries.push("DELETE FROM node WHERE table_name = '" + Omadi.service.fetchedJSON.node_type.insert[i].type + "'");
                }
            }
            //Unique node deletion
            else {
                if (Omadi.service.fetchUpdatesProgressBar !== null) {
                    Omadi.service.fetchUpdatesProgressBar.increment();
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
                TimecardGeofenceVerifier.getInstance().clearCache();
        		Ti.App.fireEvent('bundleUpdated', { bundle: resetBundles[i] });
            }
        }

        Ti.API.info("Success for node_types, db operations ran smoothly!");
    }
    catch(ex) {
        alert("Installing form types: " + ex);
        Utils.sendErrorReport("FATAL Exception installing form types: " + ex);
    }
};
