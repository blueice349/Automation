/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var GeofenceServices = require('services/GeofenceServices');
var Database = require('lib/Database');
var Data = require('lib/Data');
var Display = require('lib/Display');
var Location = require('lib/Location');
var Node = require('objects/Node');
var ProgressBar = require('objects/ProgressBar');
var PushNotifications = require('lib/PushNotifications');
var Comments = require('services/Comments');
var AndroidBackground = require('lib/android/AndroidBackground');

exports.doBackgroundUploads = null;

var id = new Date().toString();
exports.activityId = id;
Titanium.App.Properties.setString('activityId', id);

exports.checkUpdate = function(useProgressBar, userInitiated){
    Ti.API.info("Checking for sync updates.");
	exports.checkUpdate.lastCheckUpdate = exports.checkUpdate.lastCheckUpdate || 0;
	
    useProgressBar = (typeof useProgressBar == 'undefined' ? true : !!useProgressBar);
    userInitiated = !!userInitiated;
    
    var sendUpdates = false;
    var timestamp = Utils.getUTCTimestamp();
    
    if ((timestamp - exports.checkUpdate.lastCheckUpdate) < 2) {
        // Only allow updates within 2 seconds of each other
        Ti.API.info("Not allowing update - too soon after previous update.");
        return;
    }
    
    exports.checkUpdate.lastCheckUpdate = timestamp;

    var result = Database.query('SELECT COUNT(*) FROM node WHERE flag_is_updated=1');

    if (result.isValidRow() && result.field(0) > 0) {
        sendUpdates = true;
    }
    result.close();
    Database.close();
    
    if(sendUpdates){
        exports.sendUpdates();
    }
    else{
        exports.fetchUpdates(useProgressBar, userInitiated);
    }
    
    // Check for any comments that need to be uploaded
    Comments.sendComments();
};

exports.sendUpdates = function() {
	exports.sendUpdates.sendUpdateRetries = exports.sendUpdates.sendUpdateRetries || 0;
	exports.sendUpdates.lastSendUpdates = exports.sendUpdates.lastSendUpdates || 0;
    var isSendingData, http, secondsLeft, windowURL, timestamp;
    
    if (exports.isDuplicateActivity()) {
    	console.error('Rejecting duplicate ' + (Ti.App.isAndroid ? 'Android' : 'iOS') + ' activity in Service.sendUpdates');
    	//Utils.sendErrorReport('Rejecting duplicate ' + (Ti.App.isAndroid ? 'Android' : 'iOS') + ' activity in Service.sendUpdates');
    	return;
    }
    
    Ti.API.info("Sending Data Now");
    timestamp = Utils.getUTCTimestamp();
    
    if ((timestamp - exports.sendUpdates.lastSendUpdates) < 2) {
        // Do not send updates within 2 seconds of each other
        Ti.API.info("Not allowing data send - too soon after previous send.");
        return;
    }
    
    exports.sendUpdates.lastSendUpdates = timestamp;

    if (Ti.Network.online) {
        isSendingData = exports.isSendingData();
        if (isSendingData) {
            if (exports.sendUpdates.sendUpdateRetries < 10) {
                setTimeout(exports.sendUpdates, 1000);
                
                secondsLeft = 10 - exports.sendUpdates.sendUpdateRetries;
                if (secondsLeft < 0) {
                    secondsLeft = 0;
                }
                
                Ti.App.fireEvent("sendingData", {
                    message : 'Waiting to send data... ' + secondsLeft
                });
            } else {
                exports.sendUpdates.sendUpdateRetries = 0;
                isSendingData = exports.setSendingData(false);
                exports.sendUpdates();
            }
            exports.sendUpdates.sendUpdateRetries++;
        } else {
            exports.setSendingData(true);
            
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 15000
            });
            
            http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/sync.json');

            http.setRequestHeader("Content-Type", "application/json");
            Utils.setCookieHeader(http);
            
            http.onload = exports.sendDataOnLoad;
            http.onerror = exports.sendDataOnError;
            
            http.send(exports.getUpdatedNodeJSON());
            
            Ti.App.fireEvent("sendingData", {
                message : 'Saving data to server...'
            });
        }
    } else {
        // Allow background updates again
        Ti.App.allowBackgroundUpdate = true;
    }
};

exports.setSendingData = function(isSendingData) {
    Database.queryList("UPDATE history SET is_sending_data = " + (isSendingData ? 1 : 0) + " WHERE id_hist = 1");
    Database.close();
};

exports.isSendingData = function() {
    var isSendingData = false;

    var result = Database.queryList("SELECT is_sending_data FROM history WHERE id_hist = 1");
    if(result.isValidRow()){
        isSendingData = (result.fieldByName('is_sending_data', Ti.Database.FIELD_TYPE_INT) === 1);
    }
    result.close();
    Database.close();
    
    return isSendingData;
};

exports.sendDataOnLoad = function(e) {
    var subDB, dialog, json, nameTable, dir, file, string;
                
    Display.doneLoading();
    
    try{
        if (this.responseText !== null && this.responseText !== "null" && this.responseText !== "" && this.responseText !== "" && isJsonString(this.responseText) === true) {
            Data.processFetchedJson(JSON.parse(this.responseText));
        }
        else if(this.responseData !== null){
            // In some very rare cases, this.responseText will be null
            // Here, we write the data to a file, read it back and do the installation
            try{
                dir = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory);
                
                if(!dir.exists()){
                    dir.createDirectory();
                }
                
                Ti.API.debug("JSON String Length: " + this.responseData.length);
                
                file = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory + "/download_" + Utils.getUTCTimestamp() + ".txt");
                
                if(file.write(this.responseData)){
                   
                   string = file.read();
                   
                   if(isJsonString(string.text)){
                        Data.processFetchedJson(JSON.parse(string.text));
                    }
                    else{
                        Utils.sendErrorReport("Text is not json");
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
        else {
            
            if(Ti.App.isAndroid){
                Ti.Media.vibrate();
            }
    
            dialog = Ti.UI.createAlertDialog({
                title : 'Omadi',
                buttonNames : ['OK'],
                message : "The server disconnected you. Please login again."
            });
    
            dialog.show();
    
            dialog.addEventListener('click', function(e) {
                try{
                    Ti.App.Properties.setString('logStatus', "The server logged you out");
                    exports.logout();
                }
                catch(ex){
                    Utils.sendErrorReport("exception on logstatus logout: " + ex);
                }
            });
        }
        
        exports.setSendingData(false);
        
        Ti.App.fireEvent("doneSendingData");
    }
    catch(ex1){
        Utils.sendErrorReport("Exception in update data onload: " + ex1);
    }
};

exports.sendDataOnError = function(e) {
    var dialog, db;
    try{
        
        Display.doneLoading();
        
        try{
            Ti.Media.vibrate();
        }
        catch(ex1){}
        
        Ti.API.error('Error Status: ' + e.error + ", message: " + this.status);
        
        if (this.status == 403 || this.status == 401) {
            
            // Only logout when background logout is enabled
            // Currently, it should only be disabled when the user is filling out a form
            if(Ti.App.allowBackgroundLogout){
                dialog = Titanium.UI.createAlertDialog({
                    title : 'Please Login Again',
                    buttonNames : ['OK'],
                    message : "You have been logged out. Your latest data was saved, and it will be sent to the server after you login again."
                });
                
                try{
                    Utils.sendErrorReport('User logged out with code ' + this.status + " " + e.error);
                }
                catch(none){}
    
                dialog.show();
    
                exports.logout();
            }
        }
        else if (this.status == 500) {
    
            // TODO: fix this so it only changes the flag_is_updated for the nid that had the problem
            // Possible fix is to limit sending only one node at a time
            
            // Set the node as a draft
            // This is only being set for brand new nodes
            Database.query("UPDATE node SET flag_is_updated = 3 WHERE nid < 0");
            Database.close();
            
            // TODO: update old nodes that save incorrectly
    
            dialog = Titanium.UI.createAlertDialog({
                title : 'Service Error',
                buttonNames : ['OK'],
                message : "There was a problem synching your data to the server. Your latest data was saved as a DRAFT for you to save later."
            });
    
            dialog.show();
    
            Utils.sendErrorReport('500 error on send update: ' + e.error);
        }
        else{
            
            try{
                Utils.sendErrorReport('Showed the user a network error dialog on send: ' + this.status + " " + e.error);
            }
            catch(none2){}
            
            dialog = Titanium.UI.createAlertDialog({
                title : 'Network Error',
                buttonNames : ['Retry', 'Cancel'],
                message : "Please check your Internet connection. Your saved data will sync once you regain an Internet connection."
            });
            
            dialog.addEventListener('click', function(e){
                if(e.index === 0){
                    Ti.App.fireEvent('sendUpdates');
                } 
            });
    
            dialog.show();
        }
        
        exports.setSendingData(false);
        Ti.App.fireEvent("doneSendingData");
    }
    catch(ex){
        Utils.sendErrorReport("Exception with update data onerror callback: " + ex);
    }
};

exports.logout = function() {
    Ti.API.info("Logging Out");
    
    Ti.App.fireEvent('upload_gps_locations');
    Ti.App.fireEvent('stop_gps');
    
    if(Ti.App.isAndroid){
        AndroidBackground.stopGPSService();
    }
    
    try {
		Ti.Network.removeAllSystemCookies();
    } catch(error) {
        if (Ti.App.isAndroid) {
			Utils.sendErrorReport('Error trying to clear cookies on logout. ' + error);
		}
    }
    
    GeofenceServices.getInstance().unregisterAllGeofences();
    
    exports.sendLogoutRequest();
};

exports.sendLogoutRequest = function() {
    var http, numFilesLeft, doRequest, listDB, uid, username, clientAccount, token, timestamp;
    
    Ti.App.fireEvent('loggingOut');
    
    doRequest = true;
    
    if(Ti.Network.online){
        uid = Utils.getUid();
        numFilesLeft = Data.getNumFilesReadyToUpload(uid);
        
        if(numFilesLeft > 0){
            // Don't send the logout request just yet
            // Wait until all the files have been uploaded first
            // Pretend the logout happened on the mobile app
            doRequest = false;
            
            username = Utils.getUsername(uid);
            clientAccount = Utils.getClientAccount();
            token = Utils.getCookie();
            timestamp = Utils.getUTCTimestamp();
            
            Database.queryList("INSERT INTO background_files (uid, username, client_account, token, timestamp) VALUES (" + uid + ",'" + Utils.dbEsc(username) + "','" + Utils.dbEsc(clientAccount) + "','" + Utils.dbEsc(token) + "'," + timestamp + ")");
            Database.close();
            
            exports.doPostLogoutOperations();
        }
    }
    
    if(doRequest){
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false,
            timeout: 15000
        });
        http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/sync/logout.json');
    
        //Header parameters
        http.setRequestHeader("Content-Type", "application/json");
        Utils.setCookieHeader(http);
    
        http.onload = function(e) {
            Ti.App.Properties.setString('logStatus', "You have successfully logged out");
            exports.doPostLogoutOperations();
        };
    
        http.onerror = function(e) {
    
            if (this.status == 403 || this.status == 401) {
                Ti.App.Properties.setString('logStatus', "You are logged out");
            }
            else {
                Ti.API.info("Failed to log out");
            }
            
            exports.doPostLogoutOperations();
        };
    
        http.send();  
    }
};

exports.doPostLogoutOperations = function() {
    // Logout of Appcelerator cloud services
    PushNotifications.logoutUser();
    
    var sql = "UPDATE login SET is_logged='false', picked='null', login_json='null', cookie='null' ";
    sql += "WHERE id_log=1";
    
    Database.queryList(sql);
    Database.close();

    Ti.App.Properties.setBool("stopGPS", true);
    Ti.App.Properties.setBool("quitApp", true);

    Display.removeNotifications();
};

exports.fetchUpdates = function(useProgressBar, userInitiated) {
    var http, progress = null, lastSyncTimestamp, timeout, syncURL, progressBar;
    /*global isJsonString*/
    /*jslint eqeq:true*/
    try {
        
        if(typeof useProgressBar === 'undefined'){
            useProgressBar = false;
        }
        
        if(typeof userInitiated === 'undefined'){
            userInitiated = false;
        }
		
		if (!Data.isUpdating()) {

            if (Ti.Network.online) {
                Data.setUpdating(true);
                progressBar = new ProgressBar(100, 'Checking for updates...');
	        	
                if (useProgressBar) {
		            progressBar.show();
                }

                lastSyncTimestamp = Data.getLastUpdateTimestamp();

                timeout = 30000;

                //Timeout until error:
                if(lastSyncTimestamp <= 1){
                    // Allow extra time for the initial downloads
                    timeout = 90000; 
                    Data.isInitialInstall = true;
                }
                
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    userInitiated: userInitiated,
                    timeout: timeout
                });

                //While streamming - following method should be called b4 open URL
                http.ondatastream = function(e) {
                	progressBar.setValue(e.progress * 100);
                };
                
                http.onreadystatechange = function(e){
                    if (this.readyState == this.LOADING) {
                    	progressBar.setMessage('Downloading...');
                    }
                };
                
                Ti.API.debug("lastSynctimestamp: " + lastSyncTimestamp);
                
                syncURL = Ti.App.DOMAIN_NAME + '/js-sync/download.json?sync_timestamp=' + lastSyncTimestamp;
                if(lastSyncTimestamp <= 1){
                    syncURL += '&page=' + Data.initialInstallPage;    
                }
                
                http.open('GET', syncURL);

                //Header parameters
                http.setRequestHeader("Content-Type", "application/json");

                Utils.setCookieHeader(http);

                //When connected
                http.onload = function(e) {
                    var dir, file, string;
                    progressBar.hide();
                    
                    try{
                        Ti.API.debug("Sync data loaded");
                        
                        Ti.API.debug("another sync message");
                        //Parses response into strings
                        if (typeof this.responseText !== 'undefined' && this.responseText !== null && isJsonString(this.responseText) === true) {
                            Data.processFetchedJson(JSON.parse(this.responseText));
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
                                
                                Ti.API.debug("Got here 1");
                                
                                if(file.write(this.responseData)){
                                   Ti.API.debug("Got here 2");
                                   string = file.read();
                                   
                                   if(isJsonString(string.text)){
                                        Data.processFetchedJson(JSON.parse(string.text));
                                    }
                                    else{
                                        Utils.sendErrorReport("Text is not json");
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
                    }
                    catch(ex1){
                        Utils.sendErrorReport("Exception in saving sync data onsuccess: " + ex1);
                    }
                    
                    Data.setUpdating(false);
                    
                    if(lastSyncTimestamp > 1){
                        Ti.App.fireEvent('omadi:finishedDataSync');
                        exports.uploadFile();
                    }
                };

                //Connection error:
                http.onerror = function(e) {
                    var dialog, message, errorDescription;
                    
                    Ti.App.fireEvent('omadi:finishedDataSync');
                    
                    Ti.API.error('Code status: ' + e.error);
                    Ti.API.error('CODE ERROR = ' + this.status);

                	progressBar.hide();

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
                            exports.logout();
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
                            
                            exports.logout();
                        }
                    }
                    // Only show the dialog if this is not a background update
                    else if (useProgressBar) {

                        errorDescription = "Error description: " + e.error;
                        if (errorDescription.indexOf('connection failure') != -1) {
                            errorDescription = '';
                        }
                        else if (errorDescription.indexOf("imeout") != -1) {
                            errorDescription = 'Error: Timeout. Please check your Internet connection.';
                        }
                        
                        if(Data.getLastUpdateTimestamp() <= 1 || this.userInitiated){
                            
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
                                        exports.fetchUpdates(true);
                                    }, 300);
                                }
                            });
    
                            dialog.show();
                        }
                    }

                    Data.setUpdating(false);
                };

                http.send();
            }
            else if(useProgressBar){
                alert("You do not have an Internet connection.");
            }
        }
    }
    catch(ex) {
        Utils.sendErrorReport("exception changing omadi reference select value: " + ex);
    }
};

exports.uploadFile = function(isBackground) {
	isBackground =  isBackground || false;
	
	if (exports.isDuplicateActivity()) {
    	console.error('Rejecting duplicate ' + (Ti.App.isAndroid ? 'Android' : 'iOS') + ' activity in Service.uploadFile');
		//Utils.sendErrorReport('Rejecting duplicate ' + (Ti.App.isAndroid ? 'Android' : 'iOS') + ' activity in Service.uploadFile');
		return;
	}

	var now = Utils.getUTCTimestamp();
    var lastUploadStartTimestamp = exports.getLastUploadStartTimestamp();
    var isUploadingFile = (lastUploadStartTimestamp !== null);
    
    // Don't try to upload a file while form data is being saved. This causes photos to get messed up.
    // Don't upload a file if another file upload has started in the last 90 seconds.
    if (!Ti.Network.online || Ti.App.closingApp || exports.isSendingData() || (isUploadingFile && now - lastUploadStartTimestamp <= 90)) {
        return;
    }
    
    var numFilesReadyToUpload = Data.getNumFilesReadyToUpload();
    if (numFilesReadyToUpload == 0) {
        Ti.App.fireEvent('doneSendingPhotos');
		return;
    }
    
    exports.uploadFile.currentFile = Data.getNextPhotoData();
    if (!exports.uploadFile.currentFile) {
		Ti.API.error('Next photo data is null');
		Ti.App.fireEvent("doneSendingPhotos");
		return;
    }
    
	if (exports.uploadFile.currentFile.nid <= 0) {
		return;
	}
    
    try {
	    // Reset all photos to not uploading in case there was an error previously
	    Database.queryList('UPDATE _files SET uploading = 0 WHERE uploading != 0');
	    
	    // Set the photo to uploading status
	    Database.queryList('UPDATE _files SET uploading = ' + now + ' WHERE id = ' + exports.uploadFile.currentFile.id);
	    Database.close();
	} catch(e) {
	    Utils.sendErrorReport('Exception setting uploading var: ' + e);
	}
	
	Ti.API.info('Uploading photo');
	
	try{
	    
	    if(exports.uploadFile.http){
	        try{
	           // Make sure any previous HTTP requests are aborted (if not complete) before trying to send 
	           exports.uploadFile.http.abort();
	        } catch (ex){
	            Ti.API.error("could not abort existing file upload: " + ex);
	        }
	    }
	    
		// Build HTTP header
        exports.uploadFile.http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false,
            onsendstream: exports.photoUploadStream,
            onload: exports.photoUploadSuccess,
            onerror: exports.photoUploadError,
            timeout: 45000,
            nid: exports.uploadFile.currentFile.nid,
            photoId: exports.uploadFile.currentFile.id,
            delta: exports.uploadFile.currentFile.delta,
            field_name: exports.uploadFile.currentFile.field_name,
            upload_part: exports.uploadFile.currentFile.upload_part,
            numUploadParts: exports.uploadFile.currentFile.numUploadParts,
            tries: exports.uploadFile.currentFile.tries,
            isBackground: isBackground
        });
        
        Ti.API.debug("domain: " + Ti.App.DOMAIN_NAME);
        
        exports.uploadFile.http.open('POST', Ti.App.DOMAIN_NAME + '/js-sync/upload.json');

        // Send headers after open
        exports.uploadFile.http.setRequestHeader('Content-Type', 'application/json');
        
        // Include cookie if there is one
        if (isBackground) {
            var result = Database.queryList('SELECT token FROM background_files WHERE uid = ' + exports.uploadFile.currentFile.uid + ' AND client_account = "' + Utils.dbEsc(exports.uploadFile.currentFile.client_account) + '"');
            if (result.isValidRow()) {
                var cookie = result.fieldByName('token');
                if (cookie > '') {
                    exports.uploadFile.http.setRequestHeader('Cookie', cookie);
                }
            }
            result.close();
            Database.close();
        } else {
            Utils.setCookieHeader(exports.uploadFile.http);
        }
        
        // Build HTTP content
        var payload = JSON.stringify({
            file_data : exports.uploadFile.currentFile.file_data,
            filename : exports.uploadFile.currentFile.file_name,
            nid : exports.uploadFile.currentFile.nid,
            field_name : exports.uploadFile.currentFile.field_name,
            delta : exports.uploadFile.currentFile.delta,
            timestamp : exports.uploadFile.currentFile.timestamp,
            latitude : exports.uploadFile.currentFile.latitude,
            longitude : exports.uploadFile.currentFile.longitude,
            accuracy : exports.uploadFile.currentFile.accuracy,
            degrees : exports.uploadFile.currentFile.degrees,
            type : exports.uploadFile.currentFile.type,
            fid : exports.uploadFile.currentFile.fid,
            filesize : exports.uploadFile.currentFile.filesize,
            mobile_id : exports.uploadFile.currentFile.id,
            bytes_uploaded : exports.uploadFile.currentFile.bytes_uploaded,
            uploading_bytes : exports.uploadFile.currentFile.uploading_bytes,
            upload_part : exports.uploadFile.currentFile.upload_part,
            current_timestamp : Utils.getUTCTimestamp()
        });
        
        if (exports.uploadFile.currentFile.upload_part == 1) {
            Ti.App.fireEvent('sendingData', {
                message : 'Uploading files. ' + numFilesReadyToUpload + ' to go...',
                progress : true
            });
        }
        
        // Upload file
        exports.uploadFile.http.send(payload);
    } catch(ex) {
        Utils.sendErrorReport("Exception sending upload data: " + ex);
    }
};

exports.isDuplicateActivity = function() {
	return Titanium.App.Properties.getString('activityId', '') !== exports.activityId;
};

exports.getLastUploadStartTimestamp = function() {
   var lastUploadStartTimestamp = null;
   try {
        // Upload images
        var result = Database.queryList("SELECT uploading FROM _files WHERE uploading > 0");
        
        if (result.isValidRow()) {
            lastUploadStartTimestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
            
            Ti.API.debug("A photo is currently uploading");
        }
        result.close();
        Database.close();
    }
    catch(ex) {
        
        Utils.sendErrorReport("Exception getting uploading vars: " + ex);
    }  
    
    Ti.API.debug("last upload: " + lastUploadStartTimestamp);
    
    return lastUploadStartTimestamp;
};

exports.photoUploadStream = function(event) {
    /*global uploadingProgressBar*/
    var filesize, uploadingBytes, bytesUploaded, currentBytesUploaded;
    
    if (!exports.uploadFile.currentFile) {
        // The file has already finished uploading or has ended in an error.
        return;
    }
    
    filesize = exports.uploadFile.currentFile.filesize;
    uploadingBytes = exports.uploadFile.currentFile.uploading_bytes;
    bytesUploaded = exports.uploadFile.currentFile.bytes_uploaded;
    
    Ti.API.debug("Uploading: " + Math.floor(event.progress * 100) + "%");
    Ti.API.debug("Filesize: " + filesize);
    Ti.API.debug("Uloading bytes: " + uploadingBytes);
    Ti.API.debug("bytes uploaded: " + bytesUploaded);
    
    exports.photoUploadStream.bytes = (event.progress * uploadingBytes);
     
    if(typeof uploadingProgressBar !== 'undefined' && uploadingProgressBar !== null){
        
        if(filesize == uploadingBytes){
            uploadingProgressBar.setValue(event.progress);
        }
        else{
            currentBytesUploaded = Math.floor(bytesUploaded + exports.photoUploadStream.bytes);
            uploadingProgressBar.setValue(currentBytesUploaded / filesize);
        }
    }
    
    Ti.App.fireEvent('bytesStreamed', {
        bytesStreamed: exports.photoUploadStream.bytes,
        uploadingBytes: uploadingBytes
    });
};

exports.photoUploadSuccess = function(event) {
    var json, subDB, subResult, uploadMore = false, fieldSettings, tableName, 
        decoded_values, decoded, content, multipleValue, dbValue, jsonArray, 
        imageFile, filePath, resizedFilePath, deleteFile, photoWidget, 
        photoDeleteOption, thumbPath, thumbFile, numFilesReadyToUpload, 
        filesize, bytesUploaded, photoId, uploadFinished, listDB,
        nid, delta, field_name, numTries, isBackground, message;
    
    // Get back the memory used for the photo upload
    exports.uploadFile.currentFile = null;
    
    Ti.API.debug("Photo upload succeeded");
    
    photoId = this.photoId;
    nid = this.nid;
    delta = this.delta;
    field_name = this.field_name;
    numTries = this.tries;
    isBackground = this.isBackground;
    
    try{
        json = JSON.parse(this.responseText);
    
        if (json !== null && json.nid) {
            
            if(typeof json.bytes_uploaded !== 'undefined'){
                bytesUploaded = json.bytes_uploaded;
            }
            else{
                bytesUploaded = 0;
            }
            
            Ti.API.debug("Response: " + this.responseText);
            
            if(typeof json.upload_finished !== 'undefined'){
                uploadFinished = json.upload_finished;
            }
            else{
                uploadFinished = false;
            }
            
            tableName = null;
            
            // Updating status
            subResult = Database.query("SELECT table_name FROM node WHERE nid=" + json.nid);
            if(subResult.isValidRow()){
                tableName = subResult.fieldByName('table_name');
            }
            subResult.close();
            
            if(tableName !== null){
                
                // We do not need to update the files in the file that uploaded if the nid does not exist in the node table
                // This could be from a background upload where the second user doesn't have permissions to the node
                
                subResult = Database.query("SELECT settings FROM fields WHERE bundle='" + tableName + "' and type IN ('image','file') AND field_name='" + json.field_name + "'");
                fieldSettings = JSON.parse(subResult.fieldByName('settings'));
                subResult.close();
            }
               
            subResult = Database.queryList("SELECT id, file_path, thumb_path, filesize FROM _files WHERE id = " + photoId);   
            
            if(subResult.isValidRow()){
                
                filePath = subResult.fieldByName('file_path');
                thumbPath = subResult.fieldByName('thumb_path');
                filesize = subResult.fieldByName('filesize', Ti.Database.FIELD_TYPE_INT);
                
                Ti.API.debug("Filesize: " + filesize);
                Ti.API.debug("bytesUploaded: " + bytesUploaded);
                Ti.API.debug("Upload finished: " + uploadFinished);
                
                // Check if the file is ready for deletion
                if(uploadFinished){
                    Ti.API.error("Upload is finished for nid " + nid + " and delta " + delta);
                    try{
                        //Finishing the file after upload so it's available on the device for printing
                        Database.queryList("UPDATE _files SET uploading=0, fid=" + json.file_id + ", finished=" + Utils.getUTCTimestamp() + " WHERE id=" + photoId);
                    }
                    catch(sqlEx2){
                        Utils.sendErrorReport("Exception in upload success ex2: " + sqlEx2 + ", json: " + JSON.stringify(json));
                    }
                }
                else{
                    try{
                        var sql = "UPDATE _files SET bytes_uploaded=" + bytesUploaded + ", fid=" + json.file_id + ", uploading=0 ";
                        
                        if(bytesUploaded == -1){
                            sql += ", tries = tries+1 ";
                        }
                        
                        sql += " WHERE id=" + photoId;
                        
                        Database.queryList(sql);
                    }
                    catch(sqlEx1){
                        Utils.sendErrorReport("Exception in upload success ex1: " + sqlEx1 + ", json: " + JSON.stringify(json));
                    }
                }
            }

            Database.close();
            
            numFilesReadyToUpload = Data.getNumFilesReadyToUpload();
            Ti.API.debug("Photos left now: " + numFilesReadyToUpload);

            Ti.App.fireEvent('photoUploaded', {
                nid : json.nid,
                delta : json.delta,
                field_name : json.field_name,
                fid : json.file_id,
                id : photoId
            });
            
            // closeWindowAfterUpload is set when the user logged out
            // and uploads should now be completed on the login screen
            if (numFilesReadyToUpload > 0 && (typeof Ti.App.closeWindowAfterUpload === 'undefined' || !Ti.App.closeWindowAfterUpload)) {
                
                if(Utils.isLoggedIn()){
                    exports.uploadFile();
                }
                else{
                    exports.uploadBackgroundFile();
                }
            }
            else {
                Ti.App.fireEvent("doneSendingPhotos");
            }
        }
        else{
            Ti.App.fireEvent("doneSendingPhotos");
        }
    }
    catch(ex){
        Ti.App.fireEvent("doneSendingPhotos");
        message = "Exception in upload success: " + ex + ", photoId: " + photoId + ", nid: " + nid + ", delta: " + delta + ", field_name: " + field_name + ", numTries: " + numTries + ", isBackground: " + isBackground;
        if(typeof json !== 'undefined'){
            message += JSON.stringify(json);
        }
        Utils.sendErrorReport(message);
    }
    
    exports.uploadFile.http = null;
};

exports.photoUploadError = function(event) {
    var subDB, dialog, message, subResult, numTries, blob, 
        photoId, nid, uploadMore, imageView, delta, field_name, 
        filename, imageFile, imageDir, incrementTries, 
        saveFailedUpload, isBackground;
    
    // Get back the memory used for the photo upload
    exports.uploadFile.currentFile = null;
    
    if(event.error != "The request timed out" && event.error != "Read timed out"){
        Utils.sendErrorReport("Upload failed. Code: " + event.code + ", Error: " + event.error);
    }
    
    Ti.API.error("Upload failed. Code: " + event.code + ", Error: " + event.error);
    
    incrementTries = false;
    saveFailedUpload = false;
    
    photoId = this.photoId;
    nid = this.nid;
    delta = this.delta;
    field_name = this.field_name;
    numTries = this.tries;
    isBackground = this.isBackground;
    
    if(event.code == 1){
        // Some kind of network error
        if(exports.photoUploadError.dialog === null){
            exports.photoUploadError.dialog = Ti.UI.createAlertDialog({
                title: "Problem with Network",
                message: "Please login to continue uploads.",
                buttonNames: ['Ok'] 
            });
            
            exports.photoUploadError.dialog.addEventListener('click', function(){
                try{
                    exports.photoUploadError.dialog = null;
                }
                catch(ex){
                    Utils.sendErrorReport("exception photouploaderrordialog: " + ex);
                }
            });
            
            exports.photoUploadError.dialog.show();
        }
    }
    else if(event.code == 3 || event.code == 401 || event.code == 403){
        // Some kind of authentication error
        if(exports.photoUploadError.dialog === null){
            
            if(!Utils.isLoggedIn()){
                exports.photoUploadError.dialog = Ti.UI.createAlertDialog({
                    title: "Problem with Upload",
                    message: "Please login to continue uploads.",
                    buttonNames: ['Ok'] 
                });
                
                exports.photoUploadError.dialog.addEventListener('click', function(){
                     exports.photoUploadError.dialog = null;
                });
                
                exports.photoUploadError.dialog.show();
            }
        }
        
        exports.doBackgroundUploads = false;
    }
    else if(event.code == 410 || event.code == 412){
        // Node was deleted, orso delete db entry immediately and save image to gallery
        saveFailedUpload = true;
    }else if(event.code == -1){
        
        if(event.error == "Gone" || event.error == 'Precondition Failed'){
            saveFailedUpload = true;
        }
        else{
            incrementTries = true;
        }
    }
    else if(event.code == 2){
        // Do nothing - this is a request timed out error code
        saveFailedUpload = false;
    }
    
    try{
        Database.queryList("UPDATE _files SET uploading = 0 WHERE id = " + photoId);
        
        if(incrementTries){
           Database.queryList("UPDATE _files SET tries = (tries + 1) where id=" + photoId);
        }
    
        subResult = Database.queryList("SELECT id FROM _files WHERE nid > 0");
        uploadMore = (subResult.rowCount > 0 ? true : false);
        subResult.close();
    
        Database.close();
    
        if (uploadMore) {
            if(Utils.isLoggedIn()){
                setTimeout(exports.uploadFile, 10000);
            }
            else{
                setTimeout(exports.uploadBackgroundFile, 10000);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Upload failed exception: " + ex);
    }
    
    if (Utils.isLoggedIn() && saveFailedUpload) {
        Data.saveFailedUpload(photoId, true);
    }
    
    Ti.App.fireEvent("doneSendingPhotos");
 
    exports.uploadFile.http = null;
};

exports.uploadBackgroundFile = function() {
    if(exports.doBackgroundUploads){
        exports.uploadFile(true);    
    }
};

exports.abortFileUpload = function() {
    if(typeof exports.uploadFile.http !== 'undefined' && exports.uploadFile.http !== null){
        exports.uploadFile.http.abort();
        Ti.API.info("Aborted current file upload.");
        exports.uploadFile.http = null;
    }
    
    try{
        Database.queryList("UPDATE _files SET uploading = 0");
        Database.close();
    }
    catch(ex){
        Utils.sendErrorReport("Error aborting http upload: " + ex);
    }
};

exports.getUpdatedNodeJSON = function() {
    var result, obj, nid, tid, nids, node, instances, field_name, i, v_result, output;
    
    nids = [];
    
    try {
        
        obj = {
            timestamp: Utils.getUTCTimestamp(),
            last_sync_timestamp: Data.getLastUpdateTimestamp(),
            data : {}
        };
        
        result = Database.query("SELECT nid FROM node WHERE flag_is_updated = 1");
        while (result.isValidRow()) {
            nids.push(result.fieldByName('nid'));
            Ti.API.info("Sending nid: " + result.fieldByName('nid'));
            result.next();   
        }
        result.close();
        
        result = Database.query('SELECT * FROM term_data WHERE tid < 0 ORDER BY tid DESC');
        if (result.rowCount > 0) {
            obj.data.term = {};

            while (result.isValidRow()) {

                v_result = Database.query('SELECT * FROM vocabulary WHERE vid = ' + result.fieldByName('vid'));

                tid = result.fieldByName('tid');
                obj.data.term[tid] = {};
                obj.data.term[tid].created = result.fieldByName('created');
                obj.data.term[tid].tid = result.fieldByName('tid');
                obj.data.term[tid].machine_name = v_result.fieldByName('machine_name');
                obj.data.term[tid].vid = result.fieldByName('vid');
                obj.data.term[tid].name = result.fieldByName('name');
                v_result.close();

                result.next();
            }
        }
        result.close();
        // Make sure the db is closed before nodeLoad is called or any other function that opens the db
        Database.close();

        if (nids.length > 0) {
            obj.data.node = {};

            for ( i = 0; i < nids.length; i++) {
                nid = nids[i];
                node = Node.load(nid);

                instances = Node.getFields(node.type);

                obj.data.node[nid] = {};
                obj.data.node[nid].created = node.created;
                obj.data.node[nid].changed = node.changed;
                obj.data.node[nid].nid = node.nid;
                obj.data.node[nid].type = node.type;
                obj.data.node[nid].form_part = node.form_part;
                obj.data.node[nid].no_data_fields = node.no_data_fields;
                obj.data.node[nid].sync_hash = node.sync_hash;
                obj.data.node[nid].dispatch_nid = node.dispatch_nid;
                obj.data.node[nid].custom_copy_orig_nid = node.custom_copy_orig_nid;
                obj.data.node[nid].last_location = node.last_location;

                for (field_name in instances) {
                    if (instances.hasOwnProperty(field_name)) {
                        
                        if ( typeof node[field_name] !== 'undefined' && typeof node[field_name].dbValues !== 'undefined' && node[field_name].dbValues.length > 0) {
                            if (node[field_name].dbValues.length > 1) {
                                obj.data.node[nid][field_name] = node[field_name].dbValues;
                            }
                            else {
                                obj.data.node[nid][field_name] = node[field_name].dbValues[0];
                            }
                        }
                        else {
                            obj.data.node[nid][field_name] = null;
                        }
                        
                        if(instances[field_name].type == 'extra_price'){
                            obj.data.node[nid][field_name + "___data"] = node[field_name].jsonValue;
                        }
                        
                        if (instances[field_name].type == 'image' && 
                            typeof instances[field_name].widget &&
                            instances[field_name].widget.type == 'omadi_image_signature' &&
                            obj.data.node[nid][field_name] == -1){
                            
                            var files = Data.getAllFiles();
                            var fi;

                            Ti.API.debug("adding signature: " + JSON.stringify(files));
                            
                            for(fi = 0; fi < files.length; fi ++){
                                Ti.API.debug("file data" + JSON.stringify(files[fi]));
                                
                                if(files[fi].field_name == field_name){
                                    if(files[fi].nid == node.nid){
                                         
                                       try{
                                            var imageFile = Ti.Filesystem.getFile(files[fi].file_path);
                                            
                                            if(imageFile.exists() && imageFile.isFile()){
                                                var imageBlob = imageFile.read();
                                                
                                                if(!imageBlob){
                                                    Utils.sendErrorReport("initial signature blob is null");
                                                } 
                                                else{
                                                    
                                                    var imageData = Ti.Utils.base64encode(imageBlob);
                    
                                                    try{
                                                        imageData = imageData.getText();
                                                        var lastLocation = Location.getLastLocation();
                                                        
                                                        obj.data.node[nid][field_name] = [{
                                                            nid: -1, 
                                                            data: imageData,
                                                            latitude: lastLocation.latitude,
                                                            longitude: lastLocation.longitude,
                                                            accuracy: lastLocation.accuracy
                                                        }];
                                                    }
                                                    catch(ex6){
                                                        Utils.sendErrorReport("Exception getting text of base64 signature of size " + imageBlob.length + ": " + ex6); 
                                                    }
                                                }
                                            }
                                        }
                                        catch(exRead){
                                            Ti.API.debug("Exception reading initial signature file: " + exRead);
                                            Utils.sendErrorReport("Exception reading initial signature file: " + exRead);
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
    catch(ex) {
        
        alert("There was a problem packaging your data, so it has been saved as a draft.");
        Utils.sendErrorReport("Exception in JSON creation: " + ex);
        
        try {
            Database.close();
        }
        catch(nothing1){
            Utils.sendErrorReport("DB WOULD NOT CLOSE");
        }
        
        try{
            result = Database.query("UPDATE node SET flag_is_updated = 3 WHERE flag_is_updated = 1");
            Database.close();
        }
        catch(nothing2){
            Utils.sendErrorReport("Could not save bad JSON as a draft.");
        }
    }
    
    
    output = "";
    try{
        output = JSON.stringify(obj);
    }
    catch(jsonEx){
        Utils.sendErrorReport("Error stringifying obj: " + jsonEx);
    }
    
    Ti.API.info("Data: " + output);
    return output;
};