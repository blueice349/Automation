Omadi.data = Omadi.data || {};

Omadi.data.cache = {};
Omadi.data.cache.regions = {};
Omadi.data.cache.fakeFields = {};

var Utils = require('lib/Utils');
var Data = require('lib/Data');
var Node = require('objects/Node');
var ImageWidget = require('ui/widget/Image');

// Constants
Omadi.data.MAX_BYTES_PER_UPLOAD = 1000000; // 1MB

Omadi.data.isUpdating = function() {"use strict";
    return Data.isUpdating();
};

Omadi.data.setUpdating = function(updating) {"use strict";
    Data.setUpdating(updating);
};

Omadi.data.setLastUpdateTimestamp = function(sync_timestamp) {"use strict";
	Data.setLastUpdateTimestamp(sync_timestamp);
};

Omadi.data.getLastUpdateTimestamp = function(useDB) {"use strict";
    return Data.getLastUpdateTimestamp(useDB);
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
    return Node.getFakeFields(type);
};

Omadi.data.getRegions = function(type) {"use strict";
	return Node.getRegions(type);
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

Omadi.data.deletePhotoUpload = function(id, deleteFile) {"use strict";
    ImageWidget.deletePhotoUpload(id, deleteFile);
};

Omadi.data.nodeLoad = function(nid) {'use strict';
	return Node.load(nid);
};

Omadi.data.getNumFilesReadyToUpload = function(uid){"use strict";
    return Data.getNumFilesReadyToUpload(uid);
};

/*
 * Retuns an array of all files stored on the device according to the database.
 */
Omadi.data.getAllFiles = function(){"use strict";
	return Data.getAllFiles();
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
	return Data.getFileArray();
};

Omadi.data.getNextPhotoData = function(){"use strict";
	return Data.getNextPhotoData();
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
    Database.removeAllData();
};


Omadi.data.processFetchedJson = function(json){"use strict";
	Data.processFetchedJson(json);
};

Omadi.data.processCommentJson = function(json) {"use strict";
    Data.processCommentJson(json);
};
