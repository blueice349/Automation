/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var Database = require('lib/Database');
var Display = require('lib/Display');
var Service = require('lib/Service');
var Node = require('objects/Node');
var RDNGeofenceListener = require('services/RDNGeofenceListener');
var TimecardGeofenceVerifier = require('objects/TimecardGeofenceVerifier');
var ProgressBar = require('objects/ProgressBar');
var ImageWidget = require('ui/widget/Image');
var AndroidCamera = Ti.Platform.name === 'android' ? require('com.omadi.newcamera') : null;
var DispatchBundle = require('lib/bundles/DispatchBundle');
var AndroidSysUtil = null;
if(Ti.Platform.name === 'android'){
    AndroidSysUtil = require("uk.me.thepotters.atf.sys");
}

var MAX_BYTES_PER_UPLOAD = 1000000;

exports.getNumFilesReadyToUpload = function(uid) {
    var result, sql, retval = 0;
    
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
        
        result = Database.queryList(sql);
        
        if(result.isValidRow()){
            retval = result.field(0, Ti.Database.FIELD_TYPE_INT);
        }
        
        result.close();
        Database.close();
    }
    catch(ex){
        Utils.sendErrorReport('Error getting photo count: ' + ex);    
    }
    
    return retval;
};

exports.isUpdating = function() {
    return Ti.App.Properties.getBool("isUpdating", false);
};

exports.setUpdating = function(updating) {
    Ti.App.Properties.setBool("isUpdating", updating);
};

exports.getLastUpdateTimestamp = function() {
    var timestamp = 0;
    
    try{
        var result = Database.query('SELECT timestamp FROM updated WHERE rowid=1');
        if (result.isValidRow()) {
            timestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
        }
        result.close();
        
        if(typeof useDB === 'undefined'){
            Database.close();
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting last update timestamp: "+ ex);
    }

    return timestamp;
};

exports.setLastUpdateTimestamp = function(sync_timestamp) {
    try {
        if ( typeof sync_timestamp == 'undefined') {
            sync_timestamp = 0;
        }
        Database.query('UPDATE updated SET timestamp =' + sync_timestamp + ' WHERE rowid=1');
    }
    catch(nothing) {

    }
    finally {
        Database.close();
    }
};

exports.saveFailedUpload = function(photoId, showMessage) {

    var imageDir, imageFile, newFilePath, imageView, oldImageFile, 
        blob, result, dialog, nid, field_name, delta, filePath, 
        sdCardPath, sdIndex, thumbPath, thumbFile;

    result = Database.queryList("SELECT * FROM _files WHERE id = " + photoId);
    
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
                    
                    newFilePath = 'failed_' + nid + '_' + field_name + '_' + delta + '_' + Utils.getUTCTimestamp() + '.jpg'; 
                    
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
                            ImageWidget.deletePhotoUpload(photoId, true);
                        }
                        else{
                            
                            Utils.sendErrorReport("Did not save to photo gallery: " + photoId);
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Corrupted File',
                                message : "There was a problem uploading a file for node #" + nid + ", and the file could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                                buttonNames : ['OK']
                            });
                            dialog.show();
                            
                            ImageWidget.deletePhotoUpload(photoId, false);
                        }
                    }
                    else{
                         // File was not found, so don't bother with an alert
                        ImageWidget.deletePhotoUpload(photoId, false);
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
                            
                            ImageWidget.deletePhotoUpload(photoId, true);
                        },
                        error : function(e) {
                            Utils.sendErrorReport("Did not save to photo gallery iOS: " + photoId);
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Corrupted File',
                                message : "There was a problem uploading a file for node #" + nid + ", and the file could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                                buttonNames : ['OK']
                            });
                            dialog.show();
    
                            ImageWidget.deletePhotoUpload(photoId, true);
                        }
                    });
                }
                else{
                    // File was not found, so don't bother with an alert
                    ImageWidget.deletePhotoUpload(photoId, false);
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
    Database.close();
};

exports.getNextPhotoData = function() {

    var result, nextFile, imageFile, imageBlob, maxDiff, 
        newWidth, newHeight, resizedFile, isResized, resizedFilePath, 
        resizeRetval, readyForUpload, restartSuggested, dialog, deleteFromDB,
        fileStream, buffer, numBytesRead, sql, position, 
        filePart, resizedBlob, maxPhotoPixels, files, i, incrementTries, retryEncode;
   
    nextFile = null;
    readyForUpload = true;
    restartSuggested = false;
    deleteFromDB = false;
    maxPhotoPixels = 1280;
    
    files = exports.getFileArray();
           
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
                        
                        retryEncode = false;
                        
                        try{
                            nextFile.file_data = AndroidCamera.base64Encode(nextFile.file_path);
                            
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
                                    
                                    if (imageBlob.length > MAX_BYTES_PER_UPLOAD || imageBlob.height > maxPhotoPixels || imageBlob.width > maxPhotoPixels) {
        
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
                            length: MAX_BYTES_PER_UPLOAD 
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
            Database.queryList("UPDATE _files SET tries = (tries + " + incrementTries + ") WHERE id = " + nextFile.id);
            Database.close();
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
                   Utils.closeApp();
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

exports.getFileArray = function() {
    var files, sql, result, nextFile, now, node, message, 
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
    
    now = Utils.getUTCTimestamp();
    
    try{
        result = Database.queryList(sql);
        
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
                    
                    nextFile.numUploadParts = Math.ceil(nextFile.filesize / MAX_BYTES_PER_UPLOAD);
                    nextFile.upload_part = (tempBytesUploaded / MAX_BYTES_PER_UPLOAD) + 1;
                    nextFile.uploading_bytes = MAX_BYTES_PER_UPLOAD;
                } else {
                    nextFile.numUploadParts = 1;
                    nextFile.upload_part = 1;
                    nextFile.uploading_bytes = nextFile.filesize;
                }
                 
                // Negative nids mean they haven't been uploaded yet, -1000000 means never upload.
                // Send error reports for files that should have been uploaded but are over 30 minutes old.
                if (nextFile.nid <= 0) { 
                    if (nextFile.nid != -1000000 && nextFile.timestamp < now - 1800) {
	                    node = Node.load(nextFile.nid);
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
                    node = Node.load(nextFile.nid);
                    
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
        Database.queryList("DELETE FROM _files WHERE id IN(" + deleteFinishedIds.join(',') + ")");
    }
    
    if(neverUploadIds.length > 0){
        // Set files to never be attempted again
        Database.queryList("UPDATE _files SET nid = -1000000 WHERE id IN(" + neverUploadIds.join(',') + ")");
        Utils.sendErrorReport(neverUploadIds.length + " file" + (neverUploadIds.length > 1 ? 's' : '') + " could not be uploaded. You can see non-uploaded files under 'Actions' -> 'Photos Not Uploaded'");
        dialog = Ti.UI.createAlertDialog({
           title: 'Upload Problem',
           message: neverUploadIds.length + " file" + (neverUploadIds.length > 1 ? 's' : '') + " could not be uploaded. You can see non-uploaded files under 'Actions' -> 'Photos Not Uploaded'",  
           buttonNames: ['Ok', 'Take Me There']
        });
        
        dialog.addEventListener('click', function(e){
            try{
                if(e.index === 1){
                    Display.openLocalPhotosWindow();
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception upload problem dialog: " + ex);
            }
        });
        
        dialog.show();
    }
        
    Database.close();
    
    return files;
};

exports.getAllFiles = function() {
	var files = [];

	try {
		var result = Database.queryList('SELECT * FROM _files ORDER BY tries ASC, filesize ASC, delta ASC');
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
	Database.close();
	return files;
};

exports.processFetchedJson = function(json) {
    var nodeType, gpsDB, dbFile, tableName, GMT_OFFSET, dialog, newNotifications, numItems, secondDifference;
    
    try {
        if (json.delete_all === true || json.delete_all === "true") {
            
            Ti.API.info("Reseting mainDB, delete_all is required");
            
            //If delete_all is present, delete all contents:
            Database.removeAllData();
        }
        else{
            
            // Setup the timestamp offset to be used when saving UTC timestamps to the mobile database
            secondDifference = parseInt(json.current_server_timestamp, 10);
            if(!isNaN(secondDifference)){
                secondDifference -= Utils.getUTCTimestamp();
                
                if(secondDifference){
                    Ti.App.Properties.setDouble("service:serverTimestampOffset", secondDifference);
                }
            }
        }

        numItems = parseInt(json.total_item_count, 10);
        Ti.API.info("Total items to install: " + numItems);

        //If mainDB is already last version
        if (numItems == 0) {
            exports.setLastUpdateTimestamp(json.request_time);
            Ti.API.debug("Done with install - no items");
        }
        else {
        	var progressBar = new ProgressBar(numItems, 'Installing...');
            progressBar.show();
            
            if (exports.getLastUpdateTimestamp() === 0) {
                Database.query('UPDATE updated SET "url"="' + Ti.App.DOMAIN_NAME + '" WHERE "rowid"=1');
            }

            Ti.API.info('######### Request time : ' + json.request_time);

            if ( typeof json.vehicles !== 'undefined') {
                Ti.API.debug("Installing vehicles");
                processVehicleJson(json, progressBar);
            }

            if ( typeof json.node_type !== 'undefined') {
                Ti.API.debug("Installing bundles");
                processNodeTypeJson(json, progressBar);
            }

            if ( typeof json.fields !== 'undefined') {
                Ti.API.debug("Installing fields");
                processFieldsJson(json, progressBar);
            }
            
            if ( typeof json.fake_fields !== 'undefined') {
                Ti.API.debug("Installing fake fields");
                processFakeFieldsJson(json, progressBar);
            }

            if ( typeof json.regions !== 'undefined') {
                Ti.API.debug("Installing regions");
                processRegionsJson(json, progressBar);
            }

            if ( typeof json.vocabularies !== 'undefined') {
                Ti.API.debug("Installing vocabularies");
                processVocabulariesJson(json, progressBar);
            }

            if ( typeof json.terms !== 'undefined') {
                Ti.API.debug("Installing terms");
                processTermsJson(json, progressBar);
            }

            if ( typeof json.users !== 'undefined') {
                Ti.API.debug("Installing users");
                processUsersJson(json, progressBar);
            }

            if ( typeof json.node !== 'undefined') {
                Ti.API.debug("Installing nodes");
                for (tableName in json.node) {
                    if (json.node.hasOwnProperty(tableName)) {
                        if (json.node.hasOwnProperty(tableName)) {
                            processNodeJson(tableName, json, progressBar);
                        }
                    }
                }
                
                if (json.node.runsheet) {
					var rdnGeofenceListener = RDNGeofenceListener.getInstance();
					if (json.node.runsheet.insert) {
						rdnGeofenceListener.addOrUpdateGeofences(json.node.runsheet.insert);
					}
					if (json.node.runsheet['delete']) {
						rdnGeofenceListener.deleteGeofences(json.node.runsheet['delete']);
					}
                }
                
                //TimecardGeofenceVerifier.getInstance().clearCache();
            }
            
            if ( typeof json.comment !== 'undefined') {
                Ti.API.debug("Installing comments");
                exports.processCommentJson(json, progressBar);
            }
            
            progressBar.hide();
            
            Database.close();
            
            exports.setLastUpdateTimestamp(json.request_time);
            
            Ti.App.fireEvent("omadi:syncInstallComplete");   
        }

        if ( typeof json.new_app !== 'undefined' && json.new_app.length > 0) {
            Ti.API.debug("New App: " + json.new_app);
            Display.newAppAvailable(json.new_app);
        }
        
        DispatchBundle.showNewDispatchJobs();
        Display.showNewNotificationDialog();
        
        
        if(typeof json.page !== 'undefined' && 
            typeof json.total_pages !== 'undefined' && 
            typeof json.total_node_count !== 'undefined' &&
            typeof json.total_comment_count !== 'undefined'){
            
            exports.syncInitialFormItems(json.total_node_count, json.total_comment_count, json.total_pages);
        }
    }
    catch(ex) {
        alert("Saving Sync Data: " + ex);
        Utils.sendErrorReport("Exception saving sync data: " + ex);
    }
    finally {
        try {
            Database.close();
        }
        catch(nothing) {

        }
    }
};

var processVehicleJson = function(json, progressBar)  {
    try {
        if (json.vehicles) {
            var queries = [], i;

            if (Utils.isArray(json.vehicles)) {
                for (i in json.vehicles) {
                    queries.push("INSERT OR REPLACE INTO _vehicles (make, model) VALUES ('" + Utils.dbEsc(json.vehicles[i][0]) + "', '" + Utils.dbEsc(json.vehicles[i][1]) + "' )");
                }
            }

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for (i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
            }
            Database.query("COMMIT TRANSACTION");
        }
    }
    catch(ex) {
        alert("Inserting vehicles: " + ex);
    }
};

var processNodeTypeJson = function(json, progressBar) {
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
        if (json.node_type.insert) {
            if (json.node_type.insert.length) {
            
                // Ti.API.debug("node_type: " + JSON.stringify(json.node_type));

                for ( i = 0; i < json.node_type.insert.length; i++) {
                    type = json.node_type.insert[i].type;

                    if (type != 'user' && type != '') {
                        
                        //Increment the progress bar
                       	progressBar.increment();

                        bundle_result = Database.query("SELECT COUNT(*) FROM bundles WHERE bundle_name = '" + type + "'");
                        if (bundle_result.field(0, Ti.Database.FIELD_TYPE_INT) === 0) {
                            Ti.API.debug("CREATING TABLE " + type);
                            queries.push("CREATE TABLE " + type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                            
                            // Create the comment table too
                            queries.push("CREATE TABLE 'comment_node_" + type + "' ('cid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                        }
                        
                        data = [];
                        if(typeof json.node_type.insert[i].data !== 'undefined'){
                            data = json.node_type.insert[i].data;
                        }
                        
                        title_fields = [];
                        if(typeof data.title_fields !== 'undefined'){
                            title_fields = data.title_fields;        
                        }
                        
                        childForms = '';
                        if(typeof json.node_type.insert[i].child_forms !== 'undefined'){
                            childForms = json.node_type.insert[i].child_forms;
                        }
                        
                        display = json.node_type.insert[i].name.toUpperCase();
                        description = json.node_type.insert[i].description;
                        disabled = json.node_type.insert[i].disabled;
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

                        queries.push("INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data, can_create, can_view, child_forms) VALUES ('" + Utils.dbEsc(type) + "', '" + Utils.dbEsc(display) + "','" + Utils.dbEsc(description) + "','" + Utils.dbEsc(JSON.stringify(title_fields)) + "','" + Utils.dbEsc(JSON.stringify(data)) + "'," + app_permissions.can_create + "," + app_permissions.can_view + ",'" + Utils.dbEsc(JSON.stringify(childForms)) + "')");
                        
                        resetBundles.push(type);
                    }
                }
            }
        }
        else if (json.node_type['delete']) {
            //Multiple node type deletions
            if (json.node_type['delete'].length) {

                for ( i = 0; i < json.node_type['delete'].length; i++) {
                    //Increment the progress bar
                    progressBar.increment();
                    queries.push("DROP TABLE " + json.node_type.insert[i].type);
                    queries.push("DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert[i].type + "'");
                    queries.push("DELETE FROM node WHERE table_name = '" + json.node_type.insert[i].type + "'");
                }
            }
            //Unique node deletion
            else {
                progressBar.increment();
                queries.push("DROP TABLE " + json.node_type.insert.type);
                queries.push("DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert.type + "'");
                queries.push("DELETE FROM node WHERE table_name = '" + json.node_type.insert.type + "'");
            }
        }

        //DB operations
        Database.query("BEGIN IMMEDIATE TRANSACTION");
        for ( i = 0; i < queries.length; i++) {
            Database.query(queries[i]);
        }
        Database.query("COMMIT TRANSACTION");
        
        if(resetBundles.length > 0){
            for(i = 0; i < resetBundles.length; i ++){
                // Just clear the bundle cache for other functions to use correctly
                Node.getBundle(resetBundles[i], true);
                // TimecardGeofenceVerifier.getInstance().clearCache();
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

var processFieldsJson = function(json, progressBar) {
    /*global ROLE_ID_ADMIN, ROLE_ID_OMADI_AGENT*/
    var result, fid, field_exists, field_type, db_type, field_name, label, widgetString, 
        settingsString, region, part, queries, description, bundle, weight, required, 
        disabled, can_view, can_edit, settings, omadi_session_details, roles, 
        permissionsString, permIdx, roleIdx, i, nodeBundle;
        
    try {
        queries = [];

        omadi_session_details = JSON.parse(Ti.App.Properties.getString('Omadi_session_details'));
        roles = omadi_session_details.user.roles;
        

        if (json.fields.insert) {
            if (json.fields.insert.length) {

                for ( i = 0; i < json.fields.insert.length; i++) {

                    progressBar.increment();
                    
                    field_name = json.fields.insert[i].field_name;
                    bundle = json.fields.insert[i].bundle;
                    
                    settings = json.fields.insert[i].settings;
                    widgetString = JSON.stringify(json.fields.insert[i].widget);

                    settingsString = JSON.stringify(settings);

                    fid = json.fields.insert[i].fid;
                    field_type = json.fields.insert[i].type;
                    
                    label = json.fields.insert[i].label;
                    description = json.fields.insert[i].description;
                    
                    weight = json.fields.insert[i].weight;
                    required = json.fields.insert[i].required;
                    disabled = json.fields.insert[i].disabled;
                    
                    if(typeof json.fields.insert[i].settings.region !== 'undefined'){
                        region = json.fields.insert[i].settings.region;
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

                    result = Database.query('SELECT COUNT(*) FROM fields WHERE fid = ' + fid);

                    field_exists = false;
                    if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {
                        field_exists = true;
                    }

                    result.close();

                    if (!field_exists) {
                        db_type = "TEXT";
                        
                        //Check if it is a valid bundle (automatically inserted through the API):
                        result = Database.query("SELECT * FROM bundles WHERE bundle_name='" + bundle + "'");
                        if (result.isValidRow()) {
                            if (json.fields.insert[i].settings.parts) {
                                for (part in json.fields.insert[i].settings.parts) {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___" + part + "' " + db_type);
                                }
                                if (json.fields.insert[i].type == 'location') {
									queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___lat' " + db_type);
									queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___lng' " + db_type);
                                }
                            }
                            else {
                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
                                
                                if (json.fields.insert[i].type == 'file') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___filename' " + db_type);
                                } else if (json.fields.insert[i].type == 'extra_price') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___data' " + db_type);
                                } else if (json.fields.insert[i].type == 'datestamp') {
                                    queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "___end' " + db_type);
                                }
                            }
                        }
                        else{
                               
                            // The bundle does not exist, so it may be a comment field
                            nodeBundle = bundle.replace('comment_node_', '');
                            result = Database.query("SELECT * FROM bundles WHERE bundle_name='" + nodeBundle + "'");
                            
                            if (result.isValidRow()) {
                                
                                result.close();
                                
                                // The node type exists, so add the column to the correct comment table
                                result = Database.query("SELECT name FROM sqlite_master WHERE type='table' AND name='" + bundle + "'");
                                
                                if(!result.isValidRow()){
                                    // The table has not yet been created, so create it
                                    // This must be created immediately so that any other fields referencing this table will see it
                                    Database.query("CREATE TABLE '" + bundle + "' ('cid' INTEGER PRIMARY KEY NOT NULL UNIQUE )");
                                }
                                
                                queries.push("ALTER TABLE '" + bundle + "' ADD '" + field_name + "' " + db_type);
                            }
                        }

                        result.close();

                        //Multiple parts
                        if (json.fields.insert[i].settings.parts) {
                            for (part in json.fields.insert[i].settings.parts) {
                                if (json.fields.insert[i].settings.parts.hasOwnProperty(part)) {
                                    queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + Utils.dbEsc(field_type) + "','" + Utils.dbEsc(field_name + "___" + part) + "','" + Utils.dbEsc(label) + "','" + Utils.dbEsc(description) + "','" + Utils.dbEsc(bundle) + "','" + Utils.dbEsc(region) + "'," + weight + ", '" + Utils.dbEsc(required) + "' ,  '" + Utils.dbEsc(disabled) + "' , '" + Utils.dbEsc(widgetString) + "','" + Utils.dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                                }
                            }
                        }
                        // Datestamp with end time
                        else if (json.fields.insert[i].type == 'datestamp' && json.fields.insert[i].settings.enddate_get) {
							// push start date
							queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + Utils.dbEsc(field_type) + "','" + Utils.dbEsc(field_name) + "','" + Utils.dbEsc(label) + " Start','" + Utils.dbEsc(description) + "','" + Utils.dbEsc(bundle) + "','" + Utils.dbEsc(region) + "'," + weight + ",'" + Utils.dbEsc(required) + "','" + Utils.dbEsc(disabled) + "','" + Utils.dbEsc(widgetString) + "','" + Utils.dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
							// push end date
							queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + Utils.dbEsc(field_type) + "','" + Utils.dbEsc(field_name + "___end") + "','" + Utils.dbEsc(label) + "','" + Utils.dbEsc(description) + "','" + Utils.dbEsc(bundle) + "','" + Utils.dbEsc(region) + "'," + weight + ", '" + Utils.dbEsc(required) + "' ,  '" + Utils.dbEsc(disabled) + "' , '" + Utils.dbEsc(widgetString) + "','" + Utils.dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                        }
                        //Normal field
                        else {
                            queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + Utils.dbEsc(field_type) + "','" + Utils.dbEsc(field_name) + "','" + Utils.dbEsc(label) + "','" + Utils.dbEsc(description) + "','" + Utils.dbEsc(bundle) + "','" + Utils.dbEsc(region) + "'," + weight + ",'" + Utils.dbEsc(required) + "','" + Utils.dbEsc(disabled) + "','" + Utils.dbEsc(widgetString) + "','" + Utils.dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
                        }
                    }
                    else {
                        // The structure exists.... just update the fields table values
                        // This will work for fields with parts, as they are indexed by the same fid
                        if (json.fields.insert[i].type == 'datestamp') {
							if (json.fields.insert[i].settings.enddate_get) {
								queries.push("INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings, can_view, can_edit) VALUES (" + fid + ",'" + Utils.dbEsc(field_type) + "','" + Utils.dbEsc(field_name + "___end") + "','" + Utils.dbEsc(label) + "','" + Utils.dbEsc(description) + "','" + Utils.dbEsc(bundle) + "','" + Utils.dbEsc(region) + "'," + weight + ", '" + Utils.dbEsc(required) + "' ,  '" + Utils.dbEsc(disabled) + "' , '" + Utils.dbEsc(widgetString) + "','" + Utils.dbEsc(settingsString) + "'," + can_view + ", " + can_edit + ")");
							} else {
								queries.push("DELETE FROM fields WHERE field_name='" + field_name + "___end'");
							}
                        } else {
							queries.push("UPDATE fields SET type='" + Utils.dbEsc(field_type) + "', label='" + Utils.dbEsc(label) + "', description='" + Utils.dbEsc(description) + "', bundle='" + Utils.dbEsc(bundle) + "', region='" + Utils.dbEsc(region) + "', weight=" + weight + ", required='" + Utils.dbEsc(required) + "', disabled='" + Utils.dbEsc(disabled) + "', widget='" + Utils.dbEsc(widgetString) + "', settings='" + Utils.dbEsc(settingsString) + "', can_view=" + can_view + ", can_edit=" + can_edit + "  WHERE fid=" + fid);
                        }
                    }
                }
            }
        }

        if (json.fields["delete"]) {
            if (json.fields["delete"].length) {
                
                
                
                for ( i = 0; i < json.fields["delete"].length; i++) {
                    //Deletes rows from terms
                    queries.push('DELETE FROM fields WHERE fid=' + json.fields["delete"][i].fid);
                }
            }
        }

        if (queries.length > 0) {

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
            }
            Database.query("COMMIT TRANSACTION");
            
            // Reset the field cache
            Node.resetFieldCache();
        }
    }
    catch(ex) {
        alert("Saving fields: " + ex);
    }
};

var processFakeFieldsJson = function(json, progressBar) {
    var result, field_exists, queries, i, field_name, bundle;
    
    try {
        queries = [];

        if (json.fake_fields.insert) {

            if (json.fake_fields.insert.length) {

                for ( i = 0; i < json.fake_fields.insert.length; i++) {

                    progressBar.increment();
                    
                    field_name = json.fake_fields.insert[i].field_name;
                    bundle = json.fake_fields.insert[i].bundle;
    
                    result = Database.query("SELECT COUNT(*) FROM fake_fields WHERE field_name='" + field_name + "' AND bundle='" + bundle + "'");
                    
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

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
            }
            Database.query("COMMIT TRANSACTION");
            
            // Reset the fake field cache
            Node.resetFakeFieldsCache();
        }
    }
    catch(ex){
        alert("Saving extra fields: " + ex);
    }
};

var processRegionsJson = function(json, progressBar)  {
    var i, queries, settings;

    try {
        queries = [];

        //Insert - Regions
        if (json.regions.insert) {
            if (json.regions.insert.length) {
                for ( i = 0; i < json.regions.insert.length; i++) {
                    progressBar.increment();

                    //Encode:
                    settings = JSON.stringify(json.regions.insert[i].settings);

                    queries.push('INSERT OR REPLACE INTO regions (rid, node_type, label, region_name, weight, settings ) VALUES (' + json.regions.insert[i].rid + ", '" + Utils.dbEsc(json.regions.insert[i].node_type) + "','" + Utils.dbEsc(json.regions.insert[i].label) + "','" + Utils.dbEsc(json.regions.insert[i].region_name) + "'," + json.regions.insert[i].weight + ",'" + Utils.dbEsc(settings) + "')");
                }
            }
        }

        //Update - Regions
        if (json.regions.update) {
            if (json.regions.update.length) {
                for ( i = 0; i < json.regions.update.length; i++) {
                    progressBar.increment();
                    queries.push("UPDATE regions SET node_type='" + Utils.dbEsc(json.regions.update[i].node_type) + "', label='" + Utils.dbEsc(json.regions.update[i].label) + "', region_name='" + Utils.dbEsc(json.regions.update[i].region_name) + "', weight=" + json.regions.update[i].weight + ", settings='" + Utils.dbEsc(JSON.stringify(json.regions.update[i].settings)) + "' WHERE rid=" + json.regions.update[i].rid);
                }
            }
        }

        //Delete - Regions
        if (json.regions["delete"]) {
            if (json.regions["delete"].length) {
                for ( i = 0; i < json.regions["delete"].length; i++) {
                    progressBar.increment();
                    queries.push('DELETE FROM regions WHERE rid=' + json.regions["delete"][i].rid);
                }
            }
        }

        if (queries.length > 0) {

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
            }
            Database.query("COMMIT TRANSACTION");
            
            // Reset the region cache
            Node.resetRegionsCache();
        }
    }
    catch(ex) {
        alert("Installing regions: " + ex);
    }
};

var processVocabulariesJson = function(json, progressBar) {
    var queries = [], i, vid, name, machine_name;
    try {
        
        if (typeof json !== 'undefined' && typeof json.vocabularies !== 'undefined'){
            
            if (typeof json.vocabularies.insert !== 'undefined' &&
                json.vocabularies.insert &&
                json.vocabularies.insert.length) {
    
                    for ( i = 0; i < json.vocabularies.insert.length; i++) {
                        //Increment Progress Bar
                        progressBar.increment();
                        vid = json.vocabularies.insert[i].vid;
                        name = json.vocabularies.insert[i].name;
                        machine_name = json.vocabularies.insert[i].machine_name;
    
                        queries.push('INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid + ",'" + Utils.dbEsc(name) + "','" + Utils.dbEsc(machine_name) + "')");
                    }
            }
            if (typeof json.vocabularies.update !== 'undefined' &&
                json.vocabularies.update &&
                json.vocabularies.update.length) {
                    
                    for ( i = 0; i < json.vocabularies.update.length; i++) {
                        progressBar.increment();
    
                        queries.push("UPDATE vocabulary SET name='" + Utils.dbEsc(json.vocabularies.insert[i].name) + "', machine_name='" + Utils.dbEsc(json.vocabularies.update[i].machine_name) + "' WHERE vid=" + json.vocabularies.update[i].vid);
                    }
            }
            
            if (typeof json.vocabularies["delete"] !== 'undefined' && 
                json.vocabularies["delete"] &&
                json.vocabularies["delete"].length) {
             
                    for ( i = 0; i < json.vocabularies["delete"].length; i++) {
                        progressBar.increment();
    
                        //Deletes rows from terms
                        queries.push('DELETE FROM term_data WHERE vid=' + json.vocabularies["delete"][i].vid);
    
                        //Deletes corresponding rows in vocabulary
                        queries.push('DELETE FROM vocabulary WHERE vid=' + json.vocabularies["delete"][i].vid);
                    }
            }
    
            if (queries.length > 0) {
    
                Database.query("BEGIN IMMEDIATE TRANSACTION");
                for ( i = 0; i < queries.length; i++) {
                    Database.query(queries[i]);
                }
                Database.query("COMMIT TRANSACTION");
    
            }
        }
    }
    catch(ex) {
        alert("Installing vocabularies: " + ex);
    }
};

var processTermsJson = function(json, progressBar) {
    /*jslint nomen: true*/
    var i, vid, tid, name, desc, weight, queries;

    try {
        queries = [];
       
        if (json.terms.insert) {
            if (json.terms.insert.length) {

                for ( i = 0; i < json.terms.insert.length; i++) {
                    progressBar.increment();

                    vid = json.terms.insert[i].vid;
                    tid = json.terms.insert[i].tid;
                    name = json.terms.insert[i].name;
                    desc = json.terms.insert[i].description;
                    desc = JSON.stringify(desc);
                    weight = json.terms.insert[i].weight;
                    
                    if (weight == null) {
                        weight = 0;
                    }

                    queries.push('INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid + ',' + vid + ",'" + Utils.dbEsc(name) + "','" + Utils.dbEsc(desc) + "','" + Utils.dbEsc(weight) + "')");
                    if ( typeof json.terms.insert[i].__negative_tid !== 'undefined') {
                        queries.push('DELETE FROM term_data WHERE tid=' + json.terms.insert[i].__negative_tid);
                    }
                }
            }
        }
        if (json.terms.update) {
            if (json.terms.update.length) {
                for ( i = 0; i < json.terms.update.length; i++) {

                    progressBar.increment();
                    
                    vid = json.terms.update[i].vid;
                    tid = json.terms.update[i].tid;
                    name = json.terms.update[i].name;
                    desc = json.terms.update[i].description;
                    desc = JSON.stringify(desc);
                    weight = json.terms.update[i].weight;
                    
                    if (weight == null) {
                        weight = 0;
                    }
                    
                    queries.push("UPDATE term_data SET name='" + Utils.dbEsc(name) + "', description='" + Utils.dbEsc(desc) + "', weight='" + Utils.dbEsc(weight) + "', vid=" + vid + ' WHERE tid=' + tid);
                }
            }
        }
        if (json.terms["delete"]) {
            if (json.terms["delete"].length) {
                for ( i = 0; i < json.terms["delete"].length; i++) {
                    progressBar.increment();
                    queries.push('DELETE FROM term_data WHERE tid=' + json.terms["delete"][i].tid);
                }
            }
        }

        if (queries.length > 0) {

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
            }
            Database.query("COMMIT TRANSACTION");
        }
    }
    catch(ex) {
        alert("Installing terms: " + ex);
    }
};


var processUsersJson = function(json, progressBar)  {
    var i, j, queries;

    try {

        queries = [];

        //Insert - Users
        if (json.users.insert) {
            if (json.users.insert.length) {
                for ( i = 0; i < json.users.insert.length; i++) {
                    progressBar.increment();

                    queries.push('INSERT OR REPLACE  INTO user (uid, username, mail, realname, status ) VALUES (' + json.users.insert[i].uid + ",'" + Utils.dbEsc(json.users.insert[i].username) + "','" + Utils.dbEsc(json.users.insert[i].mail) + "','" + Utils.dbEsc(json.users.insert[i].realname) + "'," + json.users.insert[i].status + ')');

                    if (json.users.insert[i].roles.length) {
                        for ( j = 0; j < json.users.insert[i].roles.length; j++) {
                            queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.insert[i].uid + ',' + json.users.insert[i].roles[j] + ')');
                        }
                    }
                    else {
                        queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.insert[i].uid + ',' + json.users.insert[i].roles + ')');
                    }
                }
            }
        }

        //Update - Users
        if (json.users.update) {
            if (json.users.update.length) {
                for ( i = 0; i < json.users.update.length; i++) {
                    progressBar.increment();
                    queries.push("UPDATE user SET username='" + Utils.dbEsc(json.users.update[i].username) + "', mail='" + Utils.dbEsc(json.users.update[i].mail) + "', realname='" + Utils.dbEsc(json.users.update[i].realname) + "', status=" + json.users.update[i].status + ' WHERE uid=' + json.users.update[i].uid);

                    //Delete every row present at user_roles
                    queries.push('DELETE FROM user_roles WHERE uid=' + json.users.update[i].uid);

                    //Insert it over again!
                    if (json.users.update[i].roles) {
                        if (json.users.update[i].roles.length) {
                            for ( j = 0; j < json.users.update[i].roles.length; j++) {
                                queries.push('INSERT OR REPLACE INTO user_roles (uid, rid ) VALUES (' + json.users.update[i].uid + ',' + json.users.update[i].roles[j] + ')');
                            }
                        }
                        else {
                            queries.push('INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.update[i].uid + ',' + json.users.update[i].roles + ')');
                        }
                    }
                }
            }
        }

        //Delete - Users
        if (json.users["delete"]) {
            if (json.users["delete"].length) {
                for ( i = 0; i < json.users["delete"].length; i++) {
                    progressBar.increment();

                    //Deletes current row (contact)
                    queries.push('DELETE FROM user WHERE uid=' + json.users["delete"][i].uid);
                    queries.push('DELETE FROM user_roles WHERE uid=' + json.users["delete"][i].uid);
                }
            }
        }

        if (queries.length > 0) {

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
            }
            Database.query("COMMIT TRANSACTION");
        }

    }
    catch(ex) {
        alert("Installing Users: " + ex);
    }
};

var processNodeJson = function(type, json, progressBar)  {
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

        instances = Node.getFields(type);
        fakeFields = Node.getFakeFields(type);

        // Make sure the node type still exists
        result = Database.query("SELECT COUNT(*) FROM bundles WHERE bundle_name='" + type + "'");
        if (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {

            //Insert
            if (json && 
                json.node && 
                json.node[type] && 
                json.node[type].insert) {
                    
                Ti.API.debug("inserting " + type + " nodes: " + json.node[type].insert.length);
                
                for ( i = 0; i < json.node[type].insert.length; i++) {
                    
                    if(json.node[type].insert[i].__error){
                        
                        Ti.API.debug("HAS ERROR");
                        
                        if(typeof json.node[type].insert[i].__error_reasons !== 'undefined'){
                            reason = json.node[type].insert[i].__error_reasons.join(", ");
                           
                            Ti.API.debug("Reason: " + reason);
                            
                            if(typeof json.node[type].insert[i].__negative_nid !== 'undefined'){
                                updateNid = json.node[type].insert[i].__negative_nid;
                            }
                            else{
                                updateNid = json.node[type].insert[i].nid;
                            }
                            
                            reason += " The entry has been saved as a draft.";
                            queries.push('UPDATE node SET flag_is_updated=3 WHERE nid=' + updateNid);
                            
                            dialog = Ti.UI.createAlertDialog({
                                title: "Recent Data Not Synched",
                                message: reason,
                                ok: 'Go to Drafts'
                            });
                            
                            dialog.addEventListener("click", Display.openDraftsWindow);
                            
                            dialog.show();
                        }
                    } else {
                    
                        //Insert into node table
                        if ((json.node[type].insert[i].title === null) || (json.node[type].insert[i].title == 'undefined') || (json.node[type].insert[i].title === false)) {
                            json.node[type].insert[i].title = "No Title";
                        }

                        queries.push(exports.getNodeTableInsertStatement({
                            nid : json.node[type].insert[i].nid,
                            perm_edit : json.node[type].insert[i].perm_edit,
                            perm_delete : json.node[type].insert[i].perm_delete,
                            created : json.node[type].insert[i].created,
                            changed : json.node[type].insert[i].changed,
                            title : json.node[type].insert[i].title,
                            author_uid : json.node[type].insert[i].author_uid,
                            flag_is_updated : 0,
                            table_name : type,
                            form_part : json.node[type].insert[i].form_part,
                            changed_uid : json.node[type].insert[i].changed_uid,
                            viewed : json.node[type].insert[i].viewed,
                            dispatch_nid : json.node[type].insert[i].dispatch_nid
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
                        values.push(json.node[type].insert[i].nid);

                        for (field_name in instances) {
                            if(instances[field_name].type == 'file'){
                                
                                if (typeof json.node[type].insert[i][field_name + "___fid"] === "undefined" || json.node[type].insert[i][field_name + "___fid"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.node[type].insert[i][field_name + "___fid"];

                                    if ( value instanceof Array) {
                                        values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                    }
                                    else {
                                        values.push("'" + Utils.dbEsc(value) + "'");
                                    }
                                }
                                
                                if (typeof json.node[type].insert[i][field_name + "___filename"] === "undefined" || json.node[type].insert[i][field_name + "___filename"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.node[type].insert[i][field_name + "___filename"];

                                    if ( value instanceof Array) {
                                        values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                    }
                                    else {
                                        values.push("'" + Utils.dbEsc(value) + "'");
                                    }
                                }
                            }
                            else if(instances[field_name].type == 'extra_price'){
                                
                                if (typeof json.node[type].insert[i][field_name + "___value"] === "undefined" || json.node[type].insert[i][field_name + "___value"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.node[type].insert[i][field_name + "___value"];
                                    values.push("'" + Utils.dbEsc(value) + "'");
                                }
                              
                                if (typeof json.node[type].insert[i][field_name + "___data"] === "undefined" || json.node[type].insert[i][field_name + "___data"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.node[type].insert[i][field_name + "___data"];
                                    values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                }
                            }
                            else if(instances[field_name].type == 'location' && field_name.indexOf('___postal_code') != -1){
								real_field_name = field_name.split('___')[0];
								
								// push ___postal_code value
								value = json.node[type].insert[i][field_name];
								values.push("'" + Utils.dbEsc(value instanceof Array ? JSON.stringify(value) : value) + "'");
								
								// push ___lat
								value = json.node[type].insert[i][real_field_name + '___lat'];
								values.push("'" + Utils.dbEsc(value instanceof Array ? JSON.stringify(value) : value) + "'");
								
								// push ___lng
								value = json.node[type].insert[i][real_field_name + '___lng'];
								values.push("'" + Utils.dbEsc(value instanceof Array ? JSON.stringify(value) : value) + "'");
                            }
                            else if (typeof json.node[type].insert[i][field_name] === "undefined" || json.node[type].insert[i][field_name] === null) {
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
                                    
                                        value = json.node[type].insert[i][field_name];

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
                                            values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                        }
                                        else {
                                            values.push("null");
                                        }
                                        break;
										
                                    default:
                                        value = json.node[type].insert[i][field_name];

                                        if ( value instanceof Array) {
                                            values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                        }
                                        else {
                                            values.push("'" + Utils.dbEsc(value) + "'");
                                        }
                                        break;
                                }
                            }
                        }
                        
                        for(field_name in fakeFields){
                            if(fakeFields.hasOwnProperty(field_name)){
                                
                                if(typeof json.node[type].insert[i][field_name] !== 'undefined'){
                                    value = json.node[type].insert[i][field_name];
                                    values.push("'" + Utils.dbEsc(value) + "'");
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
                        
                        nodeChangedTimestamp = parseInt(json.node[type].insert[i].changed, 10);
                        
                        // Allow a notification or dispatch screen to be shown if this is not a full reset 
                        // OR if the node has actually changed even though this is a full reset
                        if((fullResetLastSync > 0 && nodeChangedTimestamp >= fullResetLastSync) || fullResetLastSync == 0){
                            
                            if(json.node[type].insert[i].viewed == 0){
                                if (type == 'notification') {
                                    notifications = Ti.App.Properties.getObject('newNotifications', {
                                        count : 0,
                                        nid : 0
                                    });
        
                                    Ti.App.Properties.setObject('newNotifications', {
                                        count : notifications.count + 1,
                                        nid : json.node[type].insert[i].nid
                                    });
                                }
                            }
                            
                            // Allow previously viewed dispatches to popup the dispatch screen
                            // The login of when that pops up is dependent on the server's response
                            //  and the code in the dispatch bundle .js file
                            if(type == 'dispatch' &&
                                    typeof json.node[type].insert[i].dispatch_nid !== 'undefined' &&
                                    json.node[type].insert[i].dispatch_nid > 0){
                                 
                                 DispatchBundle.checkInsertNode(json.node[type].insert[i]);
                            }
                        }
                        
                        if ( typeof json.node[type].insert[i].__negative_nid !== 'undefined') {
                            Ti.API.debug("Deleting nid: " + json.node[type].insert[i].__negative_nid);
                            
                            Ti.App.deletedNegatives[json.node[type].insert[i].__negative_nid] = json.node[type].insert[i].nid;
                            
                            
                            queries.push('DELETE FROM ' + type + ' WHERE nid=' + json.node[type].insert[i].__negative_nid);
                            queries.push('DELETE FROM node WHERE nid=' + json.node[type].insert[i].__negative_nid);
                            
                            Database.queryList("UPDATE _files SET nid =" + json.node[type].insert[i].nid + " WHERE nid=" + json.node[type].insert[i].__negative_nid);
                            Database.close();
                            
                            updateSignatureFids(json.node[type].insert[i]);
                            
                            try{
                                Ti.App.fireEvent('switchedItUp', {
                                    negativeNid : json.node[type].insert[i].__negative_nid,
                                    positiveNid : json.node[type].insert[i].nid
                                });
                            }
                            catch(switchedEx){
                                Utils.sendErrorReport("exception switching it up: " + switchedEx);
                            }
                        }

						var newFiles = json.node[type].insert[i].__newFiles;
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
                                            Database.queryList("UPDATE _files SET finished = " + Utils.getUTCTimestamp() + " WHERE nid=" + json.node[type].insert[i].nid + " AND type='signature'");
                                            Database.close();
                                            
                                            // The DB query only needs to be done once for all fields if multiple signature fields exist on the form
                                            break;
                                    }
                                }
                            }
                        }
                    
						if (json.node[type].insert[i].__newFiles) {
							updateFidsOnNewFiles(json.node[type].insert[i].nid, json.node[type].insert[i].__newFiles);
						}
                    }
                }
            }

            if (json.node && 
                json.node[type] &&
                json.node[type]['delete']) {
                    
                    for ( i = 0; i < json.node[type]['delete'].length; i++) {
                        queries.push("DELETE FROM node WHERE nid = " + json.node[type]['delete'][i].nid);
                        queries.push("DELETE FROM " + type + " WHERE nid = " + json.node[type]['delete'][i].nid);
                    }
            }

            numSets = 0;

            Database.query("BEGIN IMMEDIATE TRANSACTION");

            if (progressBar) {
                for ( i = 0; i < queries.length; i++) {
                    // Don't allow one bad node to ruin the rest of the inserts
                    // Do a try/catch for each one
                    try{
                        Database.query(queries[i]);
                        if (i % 4 == 0) {
                            progressBar.increment();
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
                        Database.query(queries[i]); 
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

            Database.query("COMMIT TRANSACTION");
        }

        if (progressBar && typeof json.node[type].insert != 'undefined') {
            for ( i = numSets; i < json.node[type].insert.length; i++) {
                progressBar.increment();
            }
        }
    }
    catch(ex) {
        Utils.sendErrorReport("Exception saving from sync: " + ex);
        alert("Saving Form Data for " + type + ": " + ex);
        
    }
    Database.close();
};

exports.processCommentJson = function(json, progressBar)  {
    var i, j, queries, query, fieldNames, tableName, instances, field_name, values, value;

    try {
        queries = [];

        if (json.comment.insert) {
            if (json.comment.insert.length) {
                for ( i = 0; i < json.comment.insert.length; i++) {
                    if (progressBar) {
                        //Increment Progress Bar
                        progressBar.increment();
                    }
                    
                    tableName = json.comment.insert[i].node_type;
                    
                    queries.push('INSERT OR REPLACE INTO comment (cid, nid, uid, subject, created, changed, status, name, node_type) VALUES (' + Utils.dbEsc(json.comment.insert[i].cid) + "," + Utils.dbEsc(json.comment.insert[i].nid) + "," + Utils.dbEsc(json.comment.insert[i].uid) + ",'" + Utils.dbEsc(json.comment.insert[i].subject) + "'," + Utils.dbEsc(json.comment.insert[i].created) + "," + Utils.dbEsc(json.comment.insert[i].changed) + "," + Utils.dbEsc(json.comment.insert[i].status) + ",'" + Utils.dbEsc(json.comment.insert[i].name) + "','" + Utils.dbEsc(tableName) + "')");
                    
                    query = 'INSERT OR REPLACE  INTO ' + tableName + ' (';
    
                    fieldNames = [];
                    fieldNames.push('cid');
                    instances = Node.getFields(tableName);
                    
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
                    values.push(json.comment.insert[i].cid);

                    for (field_name in instances) {
                        if(instances.hasOwnProperty(field_name)){
                            
                            if(instances[field_name].type == 'file'){
                                
                                if (typeof json.comment.insert[i][field_name + "___fid"] === "undefined" || json.comment.insert[i][field_name + "___fid"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.comment.insert[i][field_name + "___fid"];

                                    if ( value instanceof Array) {
                                        values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                    }
                                    else {
                                        values.push("'" + Utils.dbEsc(value) + "'");
                                    }
                                }
                                
                                if (typeof json.comment.insert[i][field_name + "___filename"] === "undefined" || json.comment.insert[i][field_name + "___filename"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.comment.insert[i][field_name + "___filename"];

                                    if ( value instanceof Array) {
                                        values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                    }
                                    else {
                                        values.push("'" + Utils.dbEsc(value) + "'");
                                    }
                                }
                            }
                            else if(instances[field_name].type == 'extra_price'){
                                
                                if (typeof json.comment.insert[i][field_name + "___value"] === "undefined" || json.comment.insert[i][field_name + "___value"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.comment.insert[i][field_name + "___value"];
                                    values.push("'" + Utils.dbEsc(value) + "'");
                                }
                              
                                if (typeof json.comment.insert[i][field_name + "___data"] === "undefined" || json.comment.insert[i][field_name + "___data"] === null) {
                                    values.push("null");
                                }
                                else{
                                    value = json.comment.insert[i][field_name + "___data"];
                                    values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                }
                            }
                            else if (typeof json.comment.insert[i][field_name] === "undefined" || json.comment.insert[i][field_name] === null) {
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
                                    
                                        value = json.comment.insert[i][field_name];

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
                                            values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                        }
                                        else {
                                            values.push("null");
                                        }
                                        break;
        
                                    default:
                                        value = json.comment.insert[i][field_name];

                                        if ( value instanceof Array) {
                                            values.push("'" + Utils.dbEsc(JSON.stringify(value)) + "'");
                                        }
                                        else {
                                            values.push("'" + Utils.dbEsc(value) + "'");
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

            Database.query("BEGIN IMMEDIATE TRANSACTION");
            for ( i = 0; i < queries.length; i++) {
                Database.query(queries[i]);
                //Ti.API.debug("Inserted a comment");
            }
            Database.query("COMMIT TRANSACTION");
        }

    }
    catch(ex) {
        Utils.sendErrorReport("Exception while installing comments: " + ex);
        alert("Installing Comments: " + ex);
    }
};

var updateFidsOnNewFiles = function(nid, newFiles) {
	try {
	    var i;
		for (i = 0; i < newFiles.length; i++) {
			var result = Database.queryList('SELECT id FROM _files WHERE nid=' + nid + ' AND field_name="' + newFiles[i].fieldName + '" AND fid=0 ORDER BY timestamp ASC LIMIT 1');
			if (result.isValidRow()) {
				Database.queryList('UPDATE _files SET fid=' + newFiles[i].fid + ' WHERE id=' + result.fieldByName('id'));
			} else {
				Utils.sendErrorReport('Could not find matching file in updateFidsOnNewFiles: SELECT id FROM _files WHERE nid=' + nid + ' AND field_name="' + newFiles[i].fieldName + '" AND fid=0 ORDER BY timestamp ASC LIMIT 1');
			}
		}
	} catch (e) {
		Utils.sendErrorReport('Error in updateFidsOnNewFiles: ' + e);
	}
	Database.close();
};

var updateSignatureFids = function(node) {
    var result = Database.queryList('SELECT field_name FROM _files WHERE nid=' + node.nid + ' AND type="signature"');
    
    while(result.isValidRow()) {
        var fieldName = result.fieldByName('field_name');
        var fid = node[fieldName];
        
        Database.queryList('UPDATE _files SET fid=' + fid + ' WHERE nid=' + node.nid + ' AND field_name="' + fieldName + '"');
        result.next(); 
    }
    
    result.close();
    Database.close();
};

exports.getNodeTableInsertStatement = function(node) {

    var sql = 'INSERT OR REPLACE INTO node (nid, perm_edit, perm_delete, created, changed, title, author_uid, flag_is_updated, table_name, form_part, changed_uid, no_data_fields, viewed, dispatch_nid) VALUES (';

    sql += node.nid;
    sql += ',' + node.perm_edit;
    sql += ',' + node.perm_delete;
    sql += ',' + node.created;
    sql += ',' + node.changed;
    sql += ",'" + Utils.dbEsc(node.title) + "'";
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

exports.getFinishedUploadPath = function(nid, fieldName, delta) {
    
    var path = null;
    
    var result = Database.queryList("SELECT file_path FROM _files WHERE nid = " + nid + " AND field_name='" + fieldName + "' AND delta = " + delta);
    if(result.isValidRow()){
        path = result.field(0);
    }
    result.close();
    Database.close();
    
    return path;  
};

exports.initialInstallPage = 0;
exports.isInitialInstall = false;
exports.initialInstallTotalPages = 0;
exports.initialSyncProgressBar = null;

exports.syncInitialFormItems = function(nodeCount, commentCount, numPages) {
    var http, syncURL, i, max, count;
    
    try{
        count = nodeCount + commentCount;
        
        max = count + (numPages * 500);
        
        exports.initialSyncProgressBar = new ProgressBar(max, 'Syncing ' + count + ' form items ...');
        exports.initialSyncProgressBar.show();
        
        Ti.API.debug("Syncing initial form items: " + count);
        
        exports.initialInstallPage = 0;
        exports.initialInstallTotalPages = numPages;
        exports.isInitialInstall = true;
        
        // Make sure any incremental syncs do not interfere
        exports.setUpdating(true);
        
        Ti.App.removeEventListener('omadi:initialInstallDownloadComplete', exports.syncInitialInstallDownloadNextPage); 
        Ti.App.addEventListener('omadi:initialInstallDownloadComplete', exports.syncInitialInstallDownloadNextPage);      
           
        Ti.App.removeEventListener('omadi:initialInstallDownloadRetry', exports.syncInitialInstallDownloadRetry); 
        Ti.App.addEventListener('omadi:initialInstallDownloadRetry', exports.syncInitialInstallDownloadRetry);  
        
        exports.syncInitialInstallDownloadNextPage();
    }
    catch(ex1){
        exports.setUpdating(false);
        Utils.sendErrorReport("Exception in paging retrieval setup: " + ex1);    
    }
};

exports.syncInitialInstallRetryCount = 0;
exports.syncInitialInstallDownloadNextPage = function() {
    exports.initialInstallPage++;
    exports.syncInitialInstallRetryCount = 0;
    
    exports.setUpdating(true);
    
    if(exports.initialInstallPage < exports.initialInstallTotalPages){
        // Make sure the update timestamp is 0 because the sync is not complete    
        Ti.API.debug("About to sync page " + exports.initialInstallPage);
        exports.setLastUpdateTimestamp(0);
        exports.syncInitialFormPage(exports.initialInstallPage);   
    }
    else{
        exports.setUpdating(false);
        
        if(exports.initialSyncProgressBar){
            exports.initialSyncProgressBar.hide();
        }
        
        Ti.API.info("NOW DO AN INCREMENTAL SYNC");
        
        Ti.API.info("last sync: " + exports.getLastUpdateTimestamp());
        
        Service.fetchUpdates(true, true);
    }
};

exports.syncInitialInstallDownloadRetry = function() {
    exports.syncInitialInstallRetryCount++;
    
    if(exports.syncInitialInstallRetryCount <= 5){
        // Make sure the update timestamp is 0 because the sync is not complete
        exports.setLastUpdateTimestamp(0);
        
        if(exports.initialInstallPage < exports.initialInstallTotalPages){
            // Wait 5 seconds before retrying again
            setTimeout(function(){
                exports.syncInitialFormPage(exports.initialInstallPage);       
            }, 5000);
        }
        else{
            Utils.sendErrorReport("in else in syncInitialInstallDownloadRetry: page=" + exports.initialInstallPage + ', total=' + exports.initialInstallTotalPages);
            
            if(exports.initialSyncProgressBar){
	            exports.initialSyncProgressBar.hide();
	        }
        }
    }
    else{
        exports.setLastUpdateTimestamp(0);
        
        alert("A problem occurred syncing the initial form entries. Please logout and try again.");
        Utils.sendErrorReport("Too many retries in the initial install");
    }
};

exports.processInitialInstallJSON = function(json) {
    var tableName;
    // This is only done for the initial install
    // All other objects except for the nodes are installed previous to this
    // We only care about the nodes here
    try{
        
        Ti.API.debug("About to do a node initial install");
        
        if (typeof json.node !== 'undefined') {
            Ti.API.debug("Installing nodes");
            for (tableName in json.node) {
                if (json.node.hasOwnProperty(tableName)) {
                    if (json.node.hasOwnProperty(tableName)) {
                        processNodeJson(tableName, json, exports.initialSyncProgressBar);
                    }
                }
            }
        }
        
        if (typeof json.comment !== 'undefined') {
            Ti.API.debug("Installing comments");
            exports.processCommentJson(json, exports.initialSyncProgressBar);
        }
        
        Ti.API.debug("about to set request_time");
        Database.close();
        
        // Setup the last update timestamp to the correct timestamp in case this is the last synced node bunch
        if(typeof json.request_time !== 'undefined'){
            exports.setLastUpdateTimestamp(json.request_time);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in processInitialInstallJSON: " + ex);
    }
    finally{
        try{
            Database.close();
        }
        catch(ex1){}
    }
};

exports.syncInitialLastProgress = 0;
exports.syncInitialFormPage = function(page) {
    var http, syncURL;
    
    Ti.API.info("syncing for page " + page);
    
    try{
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false,
            timeout: 30000
        });
        
        exports.syncInitialLastProgress = 0;
        
        // While streaming - following method should be called before open URL
        http.ondatastream = function(e) {
            // Multiply by 500 because the the max was initialized with 500 times how many pages, as that is how many items a page can contain
            exports.initialSyncProgressBar.increment((e.progress - exports.syncInitialLastProgress) * 500);
            exports.syncInitialLastProgress = e.progress;
        };
        
        syncURL = Ti.App.DOMAIN_NAME + '/js-sync/download.json?sync_timestamp=0&page=' + page;
        
        http.open('GET', syncURL);
    
        //Header parameters
        http.setRequestHeader("Content-Type", "application/json");
    
        Utils.setCookieHeader(http);
    
        //When connected
        http.onload = function(e) {
            var dir, file, string;
            
            try{
                Ti.API.debug("Initial Sync data loaded");
                if (typeof this.responseText !== 'undefined' && this.responseText !== null){
                    Ti.API.debug("JSON String Length 1: " + this.responseText.length);
                }
                
                if (typeof this.responseData !== 'undefined' && this.responseData !== null){
                    Ti.API.debug("JSON String Length 2: " + this.responseData.length);
                }
                
                Ti.API.debug("another sync message");
                //Parses response into strings
                if (typeof this.responseText !== 'undefined' && this.responseText !== null && Utils.isJsonString(this.responseText) === true) {
                    if(Ti.App.isAndroid && typeof AndroidSysUtil !== 'undefined' && AndroidSysUtil != null){
                        AndroidSysUtil.OptimiseMemory();
                    }
                    exports.processInitialInstallJSON(JSON.parse(this.responseText));
                }
                else if(typeof this.responseData !== 'undefined' && this.responseData !== null){
                    // In some very rare cases, this.responseText will be null
                    // Here, we write the data to a file, read it back and do the installation
                    try{
                        dir = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory);
                        
                        Ti.API.debug("Got here 1");
                        
                        if(!dir.exists()){
                            dir.createDirectory();
                        }
                        
                        Ti.API.debug("JSON String Length: " + this.responseData.length);
                        
                        file = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory + "/download_" + Utils.getUTCTimestamp() + ".txt");
                        
                        if(file.write(this.responseData)){
                           
                           string = file.read();
                           
                           if(Utils.isJsonString(string.text)){
                                if(Ti.App.isAndroid && typeof AndroidSysUtil !== 'undefined' && AndroidSysUtil != null){
                                    AndroidSysUtil.OptimiseMemory();
                                }
                                exports.processInitialInstallJSON(JSON.parse(string.text));
                            }
                            else{
                                Utils.sendErrorReport("Text is not json");
                                if(exports.initialSyncProgressBar){
						            exports.initialSyncProgressBar.hide();
						        }
                            }
                        }
                        else{
                            Utils.sendErrorReport("Failed to write to the download file");
                        }
                        
                        if(file.exists()){
                            file.deleteFile();
                        }
                    }
                    catch(ex){
                        Ti.API.debug("Exception at data: " + ex);
                        Utils.sendErrorReport("Exception at json data: " + ex);
                    }
                    
                    file = null;
                    dir = null;
                }
                else{
                    Ti.API.debug("No data was found.");        
                    Utils.sendErrorReport("Bad response text and data for download: " + this.responseText + ", stautus: " + this.status + ", statusText: " + this.statusText);
                }
                
                setTimeout(function(){
                    Ti.App.fireEvent('omadi:initialInstallDownloadComplete');      
                }, 500);       
            }
            catch(ex1){
                Utils.sendErrorReport("Exception in saving initial install data onsuccess: " + ex1);
                
                Ti.App.fireEvent('omadi:initialInstallDownloadRetry'); 
            }
        };
    
        //Connection error:
        http.onerror = function(e) {
            var dialog, message, errorDescription;
            
            Ti.API.error('Code status: ' + e.error);
            Ti.API.error('CODE ERROR = ' + this.status);
    
            if (this.status == 403) {
                
                // Do not allow a logout when a background logout is disabled
                // Currently, this should only be when the user is filling out a form
                if(Ti.App.allowBackgroundLogout){
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Omadi',
                        buttonNames : ['OK'],
                        message : "You have been logged out. Please log back in."
                    });
    
                    dialog.addEventListener('click', function(e) {
                        try{
                            Database.queryList('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                            Database.close();
                        }
                        catch(ex){
                            Utils.sendErrorReport("exception in logged out update 403: " + ex);
                        }
                    });
    
                    dialog.show();
                    Service.logout();
                }
            }
            else if (this.status == 401) {
                // Do not allow a logout when a background logout is disabled
                // Currently, this should only be when the user is filling out a form
                if(Ti.App.allowBackgroundLogout){
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Omadi',
                        buttonNames : ['OK'],
                        message : "Your session is no longer valid. Please log back in."
                    });
    
                    dialog.addEventListener('click', function(e) {
                        try{
                            Database.queryList('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                            Database.close();
                        }
                        catch(ex){
                            Utils.sendErrorReport("exception in logged out update 401: " + ex);
                        }
                    });
    
                    dialog.show();
                    
                    Service.logout();
                }
            }
            // Only show the dialog if this is not a background update
            else{
   
                errorDescription = "Error description: " + e.error;
                if (errorDescription.indexOf('connection failure') != -1) {
                    errorDescription = '';
                }
                else if (errorDescription.indexOf("imeout") != -1) {
                    errorDescription = 'Error: Timeout. Please check your Internet connection.';
                }
                
                if(exports.getLastUpdateTimestamp() <= 1 || this.userInitiated){
                    
                    Utils.sendErrorReport("Network Error with dialog: " + errorDescription);
                    
                    message = "There was a network error";
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Network Error',
                        buttonNames : ['Retry', 'Cancel'],
                        cancel : 1,
                        click_index : e.index,
                        sec_obj : e.section,
                        row_obj : e.row,
                        message : "A network error occurred. Do you want to retry?"
                    });
    
                    dialog.addEventListener('click', function(e) {
                        
                        if(e.index == 0){
                            setTimeout(function() {
                                Service.fetchUpdates(true);
                            }, 300);
                        }
                    });
    
                    dialog.show();
                }
                
                Ti.App.fireEvent('omadi:initialInstallDownloadRetry');
            }
        };
    
        http.send();
        
    }
    catch(ex1){
        Utils.sendErrorReport("Exception in paging retrieval: " + ex1);    
    }
};