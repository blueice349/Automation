
/*global Omadi,dbEsc*/
/*jslint eqeq:true,plusplus:true*/

Omadi.service = Omadi.service || {};


Omadi.service.fetchedJSON = null;
Omadi.service.progressBar = null;

Omadi.service.refreshSession = function() {"use strict";
    var http;

    if (Ti.App.isIOS) {
        // The cookie only needs to be refreshed for iOS right now.
        // Android has a little less security when setting cookies
        // This was implemented solely for the purpose of using the webview in the fileViewer.js file
        // Without getting a Set-Cookie header in a response at some point, iOS will not allow an unknown cookie to be sent
        // Therefore, this needed to be added

        if (Ti.Network.online && !Ti.App.Properties.getBool("sessionRefreshed", false)) {
            if (!Omadi.data.isUpdating()) {
                
                Omadi.data.setUpdating(true);

                http = Ti.Network.createHTTPClient();
                http.setTimeout(10000);
                http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync/refreshSession.json');

                Omadi.utils.setCookieHeader(http);
                http.setRequestHeader("Content-Type", "application/json");

                http.onload = function(e) {
                    var db_list, cookie, list_result;

                    db_list = Omadi.utils.openListDatabase();

                    cookie = this.getResponseHeader('Set-Cookie');

                    list_result = db_list.execute('SELECT COUNT(*) AS count FROM login WHERE id_log=1');
                    if (list_result.fieldByName('count') > 0) {
                        db_list.execute("BEGIN IMMEDIATE TRANSACTION");
                        db_list.execute("UPDATE login SET is_logged = 'true', cookie = '" + dbEsc(cookie) + "' WHERE id_log=1");
                        db_list.execute("COMMIT TRANSACTION");
                    }
                    list_result.close();

                    db_list.close();

                    Omadi.data.setUpdating(false);

                    Ti.App.Properties.setBool("sessionRefreshed", true);
                };

                http.onerror = function(e) {
                    var dialog;

                    Omadi.data.setUpdating(false);

                    if (this.status == 403) {
                        
                        // Do not allow a logout when a background logout is disabled
                        // Currently, this should only be when the user is filling out a form
                        if(Ti.App.allowBackgroundLogout){
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Omadi',
                                buttonNames : ['OK'],
                                message : "You were logged out while refreshing your session. Please log back in."
                            });
    
                            dialog.addEventListener('click', function(e) {
                                var db_func = Omadi.utils.openListDatabase();
                                db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                db_func.close();
                            });
    
                            Omadi.service.logout();
                            dialog.show();
                        }
                    }
                    else if (this.status == 401) {
                        
                        // Do not allow a logout when a background logout is disabled
                        // Currently, this should only be when the user is filling out a form
                        if(Ti.App.allowBackgroundLogout){
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Omadi',
                                buttonNames : ['OK'],
                                message : "Your session is no longer valid, and it could not be refreshed. Please log back in."
                            });
    
                            dialog.addEventListener('click', function(e) {
    
                                var db_func = Omadi.utils.openListDatabase();
                                db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                db_func.close();
    
                            });
    
                            dialog.show();
                            Omadi.service.logout();
                        }
                        
                    }
                    else {
                        setTimeout(Omadi.service.refreshSession, 40000);
                    }
                };

                http.send();
            }
            else {
                setTimeout(Omadi.service.refreshSession, 10000);
            }
        }
        else {

            Ti.Network.addEventListener('change', function(e) {
                var isOnline = e.online;
                if (isOnline && !Ti.App.Properties.getBool("sessionRefreshed", false)) {
                    Omadi.service.refreshSession();
                }
            });
        }
    }
};

Omadi.service.setNodeViewed = function(nid) {"use strict";

    /** UPDATE the mobile mainDB **/
    /** SEND THE VIEWED TIMESTAMP TO THE SERVER FOR EVERY VIEW, EVEN IF IT WAS VIEWED BEFORE **/
    var db, http;
    db = Omadi.utils.openMainDatabase();
    db.execute("UPDATE node SET viewed = '" + Omadi.utils.getUTCTimestamp() + "' WHERE nid = " + nid);
    db.close();

    /** UPDATE the web server mainDB **/
    http = Ti.Network.createHTTPClient();
    http.setTimeout(10000);
    http.open('POST', Omadi.DOMAIN_NAME + '/js-forms/custom_forms/viewed.json?nid=' + nid);

    Omadi.utils.setCookieHeader(http);
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
    // We don't care about the response, as this is a very trivial thing
};

Omadi.service.fetchUpdates = function(useProgressBar) {"use strict";
    var http, progress = null, lastSyncTimestamp;
    /*global isJsonString*/
    /*jslint eqeq:true*/
    try {

        if (!Omadi.data.isUpdating()) {

            if (Ti.Network.online) {
                Omadi.data.setUpdating(true);

                if (useProgressBar) {
                    Omadi.service.progressBar = new Omadi.display.ProgressBar(0, 100);
                }

                http = Ti.Network.createHTTPClient();

                //Timeout until error:
                http.setTimeout(30000);
                //http.setValidatesSecureCertificate(false);

                //While streamming - following method should be called b4 open URL
                http.ondatastream = function(e) {
                    //ind.value = e.progress ;
                    if (Omadi.service.progressBar !== null) {
                        Omadi.service.progressBar.set_download(e.progress);
                        //Ti.API.debug(' ONDATASTREAM1 - PROGRESS: ' + e.progress);
                    }
                };
                
                lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp();
                Ti.API.debug("lastSynctimestamp: " + lastSyncTimestamp);
                
                http.open('GET', Omadi.DOMAIN_NAME + '/js-sync/download.json?sync_timestamp=' + lastSyncTimestamp);

                //Header parameters
                http.setRequestHeader("Content-Type", "application/json");

                Omadi.utils.setCookieHeader(http);

                //When connected
                http.onload = function(e) {
                    var dir, file, string;
                    
                    //Parses response into strings
                    if (this.responseText !== null && isJsonString(this.responseText) === true) {
            
                        Ti.API.info(this.responseText.substring(0, 3000));
            
                        Omadi.service.fetchedJSON = JSON.parse(this.responseText);
                        
                        // Free the memory
                        this.responseText = null;
                        
                        Omadi.data.processFetchedJson();
                    }
                    else if(this.responseData !== null){
                        // In some very rare cases, this.responseText will be null
                        // Here, we write the data to a file, read it back and do the installation
                        
                        dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);
                        
                        if(!dir.exists()){
                            dir.createDirectory();
                        }
                        
                        file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + "/download.txt");
                        
                        if(file.write(this.responseData)){
                           
                           string = file.read();
                           
                           if(isJsonString(string)){
                            
                                Omadi.service.fetchedJSON = JSON.parse(string);
                                
                                // Free the memory
                                string = null;
                                
                                Omadi.data.processFetchedJson();
                            }
                            else{
                                Omadi.service.sendErrorReport("Text is not json");
                                if (Omadi.service.progressBar !== null) {
                                    Omadi.service.progressBar.close();
                                    Omadi.service.progressBar = null;
                                }
                            }
                        }
                        else{
                            Omadi.service.sendErrorReport("Failed to write to the download file");
                        }
                        
                        if(file.exists()){
                            file.deleteFile();
                        }
                        
                        file = null;
                        dir = null;
                    }
                    else{
                        if (Omadi.service.progressBar !== null) {
                            Omadi.service.progressBar.close();
                            Omadi.service.progressBar = null;
                        }
            
                    
                        Omadi.service.sendErrorReport("Bad response text and data for download: " + this.responseText + ", stautus: " + this.status + ", statusText: " + this.statusText);
                    }               

                    Omadi.data.setUpdating(false);
                    Ti.App.fireEvent('finishedDataSync');

                    Omadi.service.uploadFile();
                };

                //Connection error:
                http.onerror = function(e) {
                    var dialog, message, errorDescription;
                    
                    Ti.App.fireEvent('finishedDataSync');
                    
                    Ti.API.error('Code status: ' + e.error);
                    Ti.API.error('CODE ERROR = ' + this.status);
                    //Ti.API.info("Progress bar = " + progress);

                    if (Omadi.service.progressBar !== null) {
                        Omadi.service.progressBar.close();
                        Omadi.service.progressBar = null;
                    }

                    //Titanium.Media.vibrate();

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
                                var db_func = Omadi.utils.openListDatabase();
                                db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                db_func.close();
                                //win.close();
                            });
    
                            dialog.show();
                            Omadi.service.logout();
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
    
                                var db_func = Omadi.utils.openListDatabase();
                                db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                db_func.close();
    
                            });
    
                            dialog.show();
                            
                            Omadi.service.logout();
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

                        message = "There was a network error, and your data could not be synched. Do you want to retry now?" + errorDescription;

                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Omadi',
                            buttonNames : ['Yes', 'No'],
                            cancel : 1,
                            click_index : e.index,
                            sec_obj : e.section,
                            row_obj : e.row,
                            message : message
                        });

                        dialog.addEventListener('click', function(e) {
                            if (Ti.App.isAndroid) {
                                if (e.index != 1) {
                                    setTimeout(function() {
                                        Omadi.service.fetchUpdates(true);
                                    }, 800);
                                }

                            }
                            else {
                                if (e.cancel === false) {
                                    setTimeout(function() {
                                        Omadi.service.fetchUpdates(true);
                                    }, 800);
                                }

                            }
                        });

                        dialog.show();

                    }

                    Omadi.data.setUpdating(false);
                    Omadi.service.uploadFile();

                    Ti.API.error("Services are down");
                };

                http.send();
            }
            else if(useProgressBar){
                alert("You do not have an Internet connection.");
            }
        }
    }
    catch(ex) {
        alert("Fetching updates: " + ex);
    }
};

Omadi.service.setSendingData = function(isSendingData){"use strict";
    var db;
    
    db = Omadi.utils.openListDatabase();
    db.execute("UPDATE history SET is_sending_data = " + (isSendingData ? 1 : 0) + " WHERE id_hist = 1");
    db.close();
};

Omadi.service.isSendingData = function(){"use strict";
    var db, result, isSendingData;
    
    isSendingData = false;
    
    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT is_sending_data FROM history WHERE id_hist = 1");
    if(result.isValidRow()){
        isSendingData = (result.fieldByName('is_sending_data', Ti.Database.FIELD_TYPE_INT) == 1);
    }
    result.close();
    db.close();
    
    return isSendingData;
};

Omadi.service.sendUpdateRetries = 0;
Omadi.service.sendUpdates = function() {"use strict";
    /*jslint eqeq: true*/
    var isSendingData, http, secondsLeft;

    if (Ti.Network.online) {
        //alert("Has network");
        
        isSendingData = Omadi.service.isSendingData();
        //alert("Is Sending Data: " + isSendingData);
        
        if (isSendingData) {
            
            if(Omadi.service.sendUpdateRetries < 10){
                setTimeout(Omadi.service.sendUpdates, 1000);
                
                secondsLeft = 10 - Omadi.service.sendUpdateRetries;
                if(secondsLeft < 0){
                    secondsLeft = 0;
                }
                
                Ti.App.fireEvent("sendingData", {
                    message : 'Waiting to send data... ' + secondsLeft
                });
            }
            else{
                
                isSendingData = Omadi.service.setSendingData(false);
                Omadi.service.sendUpdates();
            }
            Omadi.service.sendUpdateRetries ++;
        }
        else{
            
            Omadi.service.setSendingData(true);
            
            http = Ti.Network.createHTTPClient();
            http.setTimeout(45000);
            http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync.json');

            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);

            //When connected
            http.onload = function(e) {
                var subDB, dialog, json, nameTable;
                
                //alert("Data Received");
                //Parses response into strings
                //Ti.API.info("Onload reached - Here follows the json: ");
                //Ti.API.info(this.responseText.substr(0, 200));
                
                Ti.API.debug("Got response");
                
                if (this.responseText !== null && this.responseText !== "null" && this.responseText !== "" && this.responseText !== "" && isJsonString(this.responseText) === true) {

                    Omadi.service.fetchedJSON = JSON.parse(this.responseText);
                        
                    Ti.API.debug("parsed data");
                    
                    subDB = Omadi.utils.openMainDatabase();

                    //Terms:
                    if (Omadi.service.fetchedJSON.terms) {
                        Omadi.data.processTermsJson(subDB);
                    }

                    for (nameTable in Omadi.service.fetchedJSON.node) {
                        if (Omadi.service.fetchedJSON.node.hasOwnProperty(nameTable)) {
                            Omadi.data.processNodeJson(nameTable, subDB);
                        }
                    }

                    subDB.close();
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
                        //Omadi.data.setUpdating(false)

                        Ti.App.Properties.setString('logStatus', "The server logged you out");
                        Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
                        Omadi.service.logout();
                    });
                }
                Ti.API.debug("BEFORE set sending data");
                
                Omadi.service.setSendingData(false);
                Ti.API.debug("AFTER set sending data");
                Ti.App.fireEvent("doneSendingData");
            };

            //Connection error:
            http.onerror = function(e) {
                var dialog, db;
                Ti.API.error('Code status: ' + e.error);
                Ti.API.error('CODE ERROR = ' + this.status);
                
                //Ti.API.info("Progress bar = " + progress);
                //alert("Data Received with error");
                
                if(Ti.App.isAndroid){
                    Titanium.Media.vibrate();
                }

                if (this.status == 403 || this.status == 401) {
                    
                    // Only logout when background logout is enabled
                    // Currently, it should only be disabled when the user is filling out a form
                    if(Ti.App.allowBackgroundLogout){
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Please Login Again',
                            buttonNames : ['OK'],
                            message : "You have been logged out. Your latest data was saved, and it will be sent to the server after you login again."
                        });
    
                        Omadi.service.sendErrorReport('User logged out with code ' + this.status);
    
                        dialog.show();
    
                        Omadi.service.logout();
                    }
                }
                else if (this.status == 500) {

                    // Set the node as a draft
                    db = Omadi.utils.openMainDatabase();
                    db.execute("UPDATE node SET flag_is_updated = 3 WHERE nid < 0");
                    db.close();

                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Service Error',
                        buttonNames : ['OK'],
                        message : "There was a problem synching your data to the server. Your latest data was saved as a DRAFT for you to save later."
                    });

                    dialog.show();

                    Omadi.service.sendErrorReport('500 error on send update');
                }
                
                Omadi.service.setSendingData(false);
                Ti.App.fireEvent("doneSendingData");
                
                Ti.UI.currentWindow.close();
                /*** IMPORTANT: CANNOT DO ANYTHING AFTER THE WINDOW IS CLOSED ***/
            };

            Ti.App.fireEvent("sendingData", {
                message : 'Saving data to server...'
            });
            
            //alert("Before packaging");
            
            http.send(Omadi.service.getUpdatedNodeJSON());
        }
    }
    else{
        // Allow background updates again
        Ti.App.allowBackgroundUpdate = true;
    }
};

Omadi.service.logout = function() {"use strict";

    var http, db;
    /*jslint eqeq: true*/
    /*global Cloud*/
    Ti.API.info("Logging Out");
    
    Ti.App.fireEvent('upload_gps_locations');
    Ti.App.fireEvent('stop_gps');
    
    if(Ti.App.isAndroid){
        Omadi.background.android.stopGPSService();
        //Omadi.background.android.stopUpdateService();
    }
    
    if(Omadi.bundles.companyVehicle.getCurrentVehicleNid > 0){
        
        Ti.App.addEventListener('exitedVehicle', Omadi.service.sendLogoutRequest);
        
        Omadi.bundles.companyVehicle.exitVehicle();
    }
    else{
        Omadi.service.sendLogoutRequest();
    }
};

Omadi.service.doPostLogoutOperations = function(){"use strict";
    var db;
    
    // Logout of Appcelerator cloud services
    Omadi.push_notifications.logoutUser();
    
    db = Omadi.utils.openListDatabase();
    db.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
    db.close();

    Ti.App.Properties.setBool("stopGPS", true);
    Ti.App.Properties.setBool("quitApp", true);

    Omadi.display.removeNotifications();
};

Omadi.service.sendLogoutRequest = function(){"use strict";
    var http;
    
    Ti.App.fireEvent('loggingOut');

    http = Ti.Network.createHTTPClient();
    http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync/logout.json');

    //Timeout until error:
    http.setTimeout(15000);

    //Header parameters
    http.setRequestHeader("Content-Type", "application/json");
    Omadi.utils.setCookieHeader(http);

    http.onload = function(e) {
        Ti.App.Properties.setString('logStatus', "You have successfully logged out");
        //Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
        Omadi.service.doPostLogoutOperations();
    };

    http.onerror = function(e) {
        //Omadi.display.hideLoadingIndicator();

        if (this.status == 403 || this.status == 401) {
            Ti.App.Properties.setString('logStatus', "You are logged out");
        }
        else {
            Ti.API.info("Failed to log out");
            //alert("Failed to log out, please try again");
        }
        
        Omadi.service.doPostLogoutOperations();
    };

    http.send();  
};

Omadi.service.photoUploadSuccess = function(e){"use strict";
    var json, subDB, subResult, uploadMore = false, fieldSettings, tableName, 
        decoded_values, decoded, content, multipleValue, dbValue, jsonArray, 
        imageFile, filePath, resizedFilePath, deleteFile, photoWidget, 
        photoDeleteOption, thumbPath, thumbFile, photosLeft, 
        filesize, bytesUploaded, photoId;
    
    //Ti.API.info('UPLOAD FILE: =========== Success ========' + this.responseText);
    Ti.API.debug("Photo upload succeeded");
    
    try{
        json = JSON.parse(this.responseText);
    
        if (json.nid) {
            
            if(typeof json.bytes_uploaded !== 'undefined'){
                bytesUploaded = json.bytes_uploaded;
            }
            else{
                bytesUploaded = 0;
            }
            
            subDB = Omadi.utils.openMainDatabase();
    
            // Updating status
            subResult = subDB.execute("SELECT table_name FROM node WHERE nid=" + json.nid + ";");
            tableName = subResult.fieldByName('table_name');
            subResult.close();
    
            subResult = subDB.execute("SELECT settings FROM fields WHERE bundle='" + tableName + "' and type IN ('image','file') AND field_name='" + json.field_name + "';");
            fieldSettings = JSON.parse(subResult.fieldByName('settings'));
            subResult.close();
    
            if (fieldSettings != null && 
                typeof fieldSettings.cardinality !== 'undefined' && 
                (fieldSettings.cardinality > 1 || fieldSettings.cardinality < 0)) {
    
                subResult = subDB.execute("SELECT " + json.field_name + " FROM " + tableName + " WHERE nid=" + json.nid);
    
                jsonArray = [];
    
                if (subResult.isValidRow()) {
                    multipleValue = Omadi.utils.getParsedJSON(subResult.fieldByName(json.field_name));
                    if (Omadi.utils.isArray(multipleValue)) {
                        jsonArray = multipleValue;
                    }
                }

                jsonArray[parseInt(json.delta, 10)] = json.file_id;

                subDB.execute("UPDATE " + tableName + " SET " + json.field_name + "='" + dbEsc(JSON.stringify(jsonArray)) + "' WHERE nid=" + json.nid);
            }
            else {
                subDB.execute("UPDATE " + tableName + " SET " + json.field_name + "='" + json.file_id + "' WHERE nid='" + json.nid + "'");
            }
               
            subResult = subDB.execute("SELECT id, file_path, thumb_path, filesize FROM _files WHERE nid=" + json.nid + " AND delta=" + json.delta + " AND field_name='" + json.field_name + "'");   
            
            if(subResult.isValidRow()){
                
                photoId = subResult.fieldByName('id', Ti.Database.FIELD_TYPE_INT);
                filePath = subResult.fieldByName('file_path');
                thumbPath = subResult.fieldByName('thumb_path');
                filesize = subResult.fieldByName('filesize', Ti.Database.FIELD_TYPE_INT);
                
                Ti.API.debug("Filesize: " + filesize);
                Ti.API.debug("bytesUploaded: " + bytesUploaded);
                
                if(bytesUploaded == 0 || bytesUploaded >= filesize){
                    
                    if(Ti.App.isAndroid){
                       deleteFile = true;
                        
                       photoWidget = Ti.App.Properties.getString("photoWidget", 'take');
                       photoDeleteOption = Ti.App.Properties.getString("deleteOnUpload", "false");
                       
                       if(photoWidget == 'choose' && photoDeleteOption == "false"){
                            deleteFile = false;
                       }
                        
                       if(deleteFile){
                        
                            imageFile = Ti.Filesystem.getFile(filePath);
                            if(imageFile.exists()){
                                imageFile.deleteFile();
                            } 
                            
                            // Delete the thumbnail if one is saved
                            if(thumbPath != null && thumbPath.length > 10){
                                thumbFile = Ti.Filesystem.getFile(thumbPath);
                                if(thumbFile.exists()){
                                    thumbFile.deleteFile();
                                }
                            }
                       }
                        
                        // resizedFilePath = filePath.replace(/\.jpg$/, "_resized.jpg");
    //                         
                        // imageFile = Ti.Filesystem.getFile("file://" + resizedFilePath);
                        // if(imageFile.exists()){
                            // imageFile.deleteFile(); 
                        // }
                    }
                    else{
                        imageFile = Ti.Filesystem.getFile(filePath);
                        if(imageFile.exists()){
                            imageFile.deleteFile();
                        } 
                        
                        // Delete the thumbnail if one is saved
                        if(thumbPath != null && thumbPath.length > 10){
                            thumbFile = Ti.Filesystem.getFile(thumbPath);
                            if(thumbFile.exists()){
                                thumbFile.deleteFile();
                            }
                        }
                    }
                    
                    // Get rid of file pointers
                    imageFile = null;
                    thumbFile = null;
                    
                    //Deleting file after upload.
                    subDB.execute("DELETE FROM _files WHERE id=" + photoId);
                }
                else{
                    subDB.execute("UPDATE _files SET bytes_uploaded=" + bytesUploaded + ", fid=" + json.file_id + ", uploading=0 WHERE id=" + photoId);
                }
            }

            subResult.close();
            subDB.close();
            
            photosLeft = Omadi.data.getPhotoCount();
            Ti.API.debug("Photos left now: " + photosLeft);

            Ti.App.fireEvent('photoUploaded', {
                nid : json.nid,
                delta : json.delta,
                field_name : json.field_name,
                fid : json.file_id
            });
    
            if (photosLeft > 0) {
                
                Omadi.service.uploadFile();
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
        Omadi.service.sendErrorReport("Exception in upload success: " + ex);
    }
};

Omadi.service.photoUploadError = function(e){"use strict";
    var subDB, dialog, message, subResult, numTries, blob, photoId, nid, uploadMore, imageView, delta, field_name, filename, imageFile, imageDir;

    Ti.API.error("Photo upload failed");

    try{
        photoId = this.photoId;
        nid = this.nid;
        delta = this.delta;
        field_name = this.field_name;
    
        //Omadi.service.sendErrorReport("Photo upload failed: " + nid);
    
        subDB = Omadi.utils.openMainDatabase();
        subResult = subDB.execute("SELECT tries, file_path FROM _files WHERE id=" + photoId);
    
        subDB.execute("UPDATE _files SET uploading = 0 WHERE id = " + photoId);
    
        if (subResult.rowCount > 0) {
            numTries = subResult.fieldByName('tries', Ti.Database.FIELD_TYPE_INT);
    
            if (numTries >= 4) {
    
                Omadi.data.saveFailedUpload(photoId);
            }
    
            subDB.execute("UPDATE _files SET tries = (tries + 1) where id=" + photoId);
        }
    
        subResult = subDB.execute("SELECT id FROM _files WHERE nid > 0");
        uploadMore = (subResult.rowCount > 0 ? true : false);
        subResult.close();
    
        subDB.close();
    
        if (uploadMore) {
            setTimeout(Omadi.service.uploadFile, 15000);
        }
    }
    catch(ex){
        Omadi.service.sendErrorReport("Upload failed exception: " + ex);
    }
    

    Ti.App.fireEvent("doneSendingPhotos");
    
    // if(this.error.toString().indexOf('Timeout') !== -1){
    // message = "A photo failed to upload.  Please check your Internet connection. Once you connect, the photo will be automatically uploaded.";
    // }
    // else{
    // message = 'There was a problem uploading your photo. Details: ' + this.status + " " + this.error;
    // }
};

Omadi.service.getLastUploadStartTimestamp = function(){"use strict";
   var lastUploadStartTimestamp = null, mainDB, result;
   try {
        // Upload images
        mainDB = Omadi.utils.openMainDatabase();
        result = mainDB.execute("SELECT uploading FROM _files WHERE uploading > 0");
        
        if (result.isValidRow()) {
            lastUploadStartTimestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
            
            Ti.API.debug("A photo is currently uploading");
        }
        result.close();
        mainDB.close();
    }
    catch(ex) {
        
        Omadi.service.sendErrorReport("Exception getting uploading vars: " + ex);
    }  
    
    return lastUploadStartTimestamp;
};

Omadi.service.currentFileUpload = null;

Omadi.service.photoUploadStream = function(e){"use strict";
    /*global uploadingProgressBar*/
    var filesize, uploadingBytes, bytesUploaded, currentBytesUploaded;
    
    if(uploadingProgressBar !== null){
        
        filesize = Omadi.service.currentFileUpload.filesize;
        uploadingBytes = Omadi.service.currentFileUpload.uploading_bytes;
        bytesUploaded = Omadi.service.currentFileUpload.bytes_uploaded;
        
        Ti.API.debug("in an upload stream");
        
        if(filesize == uploadingBytes){
            uploadingProgressBar.setValue(e.progress);
        }
        else{
            currentBytesUploaded = Math.floor(bytesUploaded + (e.progress * uploadingBytes));
            uploadingProgressBar.setValue(currentBytesUploaded / filesize);
        }
    }
};

Omadi.service.uploadFile = function() {"use strict";
    /*jslint eqeq:true, plusplus: true*/
    /*global Base64*/
    var http, mainDB, result, isUploading, nowTimestamp, 
        lastUploadStartTimestamp, tmpImageView, 
        blobImage, maxDiff, imageData, uploadPhoto,
        photoCount, payload;
    
    //Omadi.service.sendErrorReport("In uploadFile");
    Ti.API.debug("Attempting to upload a file");
    
    //Ti.API.debug("Online: " + Ti.Network.online + ", closing: " + Ti.App.closingApp);
    
    if (Ti.Network.online && !Ti.App.closingApp) {
        
        nowTimestamp = Omadi.utils.getUTCTimestamp();
        
        lastUploadStartTimestamp = Omadi.service.getLastUploadStartTimestamp();
        
        if(lastUploadStartTimestamp === null){
            lastUploadStartTimestamp = nowTimestamp;
            isUploading = false;
        }
        else{
            isUploading = true;
            Ti.API.debug("Currently uploading a photo: " + lastUploadStartTimestamp);
        }
        
        // Make sure no images are currently uploading
        // Maximum of 90 seconds apart for images uploading
        if (!isUploading || (nowTimestamp - lastUploadStartTimestamp) > 90) {

            photoCount = Omadi.data.getPhotoCount();
            
            Ti.API.debug("Photos left: " + photoCount);
            
            if (photoCount > 0) {
                
                Omadi.service.currentFileUpload = Omadi.data.getNextPhotoData();
                
                //Omadi.service.sendErrorReport("Photo count for upload: " + photoCount);
                
                if(Omadi.service.currentFileUpload){
                    //Omadi.service.sendErrorReport("Next photo data is valid");
                    
                    Ti.API.debug("Current upload is for nid " + Omadi.service.currentFileUpload.nid + " field " + Omadi.service.currentFileUpload.field_name + " delta " + Omadi.service.currentFileUpload.delta + " and tries=" + Omadi.service.currentFileUpload.tries);
                    
                    try{
                        mainDB = Omadi.utils.openMainDatabase();
                        // Reset all photos to not uploading in case there was an error previously
                        mainDB.execute("UPDATE _files SET uploading = 0 WHERE uploading <> 0");
                        
                        if ((Omadi.service.currentFileUpload.file_data === null || Omadi.service.currentFileUpload.file_data.length < 10) && Omadi.service.currentFileUpload.id > 0) {
                            mainDB.execute("DELETE FROM _files WHERE id=" + Omadi.service.currentFileUpload.id);
                            Omadi.service.sendErrorReport("Deleted a photo from the database");
                            return;
                        }
                        
                        // Set the photo to uploading status
                        mainDB.execute("UPDATE _files SET uploading = " + nowTimestamp + " WHERE id = " + Omadi.service.currentFileUpload.id);
                        mainDB.close();
                    }
                    catch(ex1){
                        Omadi.service.sendErrorReport("Exception setting uploading var: " + ex1);
                    }
                     
                    if (Omadi.service.currentFileUpload.nid > 0) {
                        
                        try{
                            http = Ti.Network.createHTTPClient();
                            http.onload = Omadi.service.photoUploadSuccess;
                            http.onerror = Omadi.service.photoUploadError;
                            http.onsendstream = Omadi.service.photoUploadStream;
                            
                            http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/upload.json');
                            http.setTimeout(30000);
                            
                            http.nid = Omadi.service.currentFileUpload.nid;
                            http.photoId = Omadi.service.currentFileUpload.id;
                            http.delta = Omadi.service.currentFileUpload.delta;
                            http.field_name = Omadi.service.currentFileUpload.field_name;
                            http.uploadPart = Omadi.service.currentFileUpload.uploadPart;
                            http.numUploadParts = Omadi.service.currentFileUpload.numUploadParts;
        
                            //Ti.API.info("Uploading to " + domainName);
                            http.setRequestHeader("Content-Type", "application/json");
                            Omadi.utils.setCookieHeader(http);
                            
                            payload = JSON.stringify({
                                file_data : Omadi.service.currentFileUpload.file_data,
                                filename : Omadi.service.currentFileUpload.file_name,
                                nid : Omadi.service.currentFileUpload.nid,
                                field_name : Omadi.service.currentFileUpload.field_name,
                                delta : Omadi.service.currentFileUpload.delta,
                                timestamp : Omadi.service.currentFileUpload.timestamp,
                                latitude : Omadi.service.currentFileUpload.latitude,
                                longitude : Omadi.service.currentFileUpload.longitude,
                                accuracy : Omadi.service.currentFileUpload.accuracy,
                                degrees : Omadi.service.currentFileUpload.degrees,
                                type : Omadi.service.currentFileUpload.type,
                                fid : Omadi.service.currentFileUpload.fid,
                                filesize : Omadi.service.currentFileUpload.filesize
                            })
                            
                            if(Omadi.service.currentFileUpload.uploadPart == 1){
                                Ti.App.fireEvent("sendingData", {
                                    message : 'Uploading files. ' + photoCount + ' to go...',
                                    progress : true
                                });
                            }
                            
                            Ti.API.debug("Sending photo to server");
                            
                            // var file = Ti.Filesystem.getFile(Omadi.service.currentFileUpload.file_path);
                            // var blob = file.read();
                            
                            http.send(payload);
                        }
                        catch(ex2){
                            Omadi.service.sendErrorReport("Exception sending upload data: " + ex2);
                        }
                        //alert("time_stamp_send_to_sever_in_ios");
                    }
                }
                else{
                    Omadi.service.sendErrorReport("Next photo data is null");
                }
            }
        }
        else{
            Ti.API.debug("now: " + nowTimestamp + ", last: " + lastUploadStartTimestamp + ", isUploadin: " + isUploading);
        }
    }
};

Omadi.service.sendErrorReport = function(message) {"use strict";
    var http, uid;

    uid = Omadi.utils.getUid();
    http = Ti.Network.createHTTPClient();
    http.setTimeout(30000);
    http.open('GET', Omadi.DOMAIN_NAME + '/js-sync/error.json?domain=' + Omadi.DOMAIN_NAME + '&uid=' + uid + '&message=' + message);
    //http.setRequestHeader("Content-Type", "application/json");
    //Omadi.utils.setCookieHeader(http);

    http.send();
};

Omadi.service.getUpdatedNodeJSON = function() {"use strict";
    /*jslint eqeq:true,plusplus:true*/
    /*global isNumber*/

    var db, result, obj, nid, tid, nids, node, instances, field_name, i, v_result;

    try {
        
        db = Omadi.utils.openMainDatabase();
        //Initial JSON values:
        //var current_timestamp = Math.round(new Date() / 1000);
        //json = '{ "timestamp" : "' + Omadi.utils.getUTCTimestamp() + '", "data" : { ';
        obj = {
            timestamp : Omadi.utils.getUTCTimestamp(),
            data : {}
        };

        nids = [];
 
        result = db.execute("SELECT nid FROM node WHERE flag_is_updated = 1");

        while (result.isValidRow()) {
            nids.push(result.fieldByName('nid'));
            result.next();
        }

        result.close();
        
        result = db.execute('SELECT * FROM term_data WHERE tid < 0 ORDER BY tid DESC');
        if (result.rowCount > 0) {
            obj.data.term = {};

            while (result.isValidRow()) {

                v_result = db.execute('SELECT * FROM vocabulary WHERE vid = ' + result.fieldByName('vid'));

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
        // Make sure the db is closed before odeLoad is called or any other function that opens the db
        db.close();

        if (nids.length > 0) {
            obj.data.node = {};

            for ( i = 0; i < nids.length; i++) {
                nid = nids[i];
                node = Omadi.data.nodeLoad(nid);

                instances = Omadi.data.getFields(node.type);

                obj.data.node[nid] = {};
                obj.data.node[nid].created = node.created;
                obj.data.node[nid].changed = node.changed;
                obj.data.node[nid].nid = node.nid;
                obj.data.node[nid].type = node.type;
                obj.data.node[nid].form_part = node.form_part;
                obj.data.node[nid].no_data_fields = node.no_data_fields;
                obj.data.node[nid].sync_hash = node.sync_hash;

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
                    }
                }
            }
        }
        
        return JSON.stringify(obj);
    }
    catch(ex) {
        
        try {
            db.close();
        }
        catch(nothing1){
            Ti.API.error("db would not close");
            Omadi.service.sendErrorReport("DB WOULD NOT CLOSE");
        }
        
        db = Omadi.utils.openMainDatabase();
        result = db.execute("UPDATE node SET flag_is_updated = 3 WHERE flag_is_updated = 1");
        db.close();
        
        alert("There was a problem packaging your data, so it has been saved as a draft.");
        Omadi.service.sendErrorReport("Exception in JSON creation: " + ex);
    }
    finally{
        // If there was an error before the db was closed above, close it now so the app doesn't freeze
        try {
            db.close();
        }
        catch(nothing2) {
            Ti.API.error("db would not close");
            Omadi.service.sendErrorReport("DB WOULD NOT CLOSE");
        }
    }
};

Omadi.service.checkUpdate = function(useProgressBar){"use strict";
    var db, result;
    Ti.API.info("Checking for sync updates.");
    
    if ( typeof useProgressBar === 'undefined') {
        useProgressBar = false;
    }
    // else {
        // useProgressBar = true;
    // }
// 
    // if ( typeof Ti.UI.currentWindow.isTopWindow !== 'undefined' && Ti.UI.currentWindow.isTopWindow) {
        // useProgressBar = true;
    // }

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT * FROM node WHERE flag_is_updated=1');

    if (result.rowCount > 0) {
        Omadi.service.sendUpdates();
    }
    result.close();
    db.close();

    Omadi.service.fetchUpdates(useProgressBar);
};


