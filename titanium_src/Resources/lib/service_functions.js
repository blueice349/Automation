/*global Omadi*/

Omadi.service = Omadi.service || {};

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
    var http, app_timestamp, progress = null;
    /*global isJsonString,PLATFORM*/
    /*jslint eqeq:true*/
    try {
        
        if(!Omadi.data.isUpdating()){
            
            if (Ti.Network.online) {
                
                if(useProgressBar){
                    progress = new Omadi.display.ProgressBar(0, 100);
                }
                
                Omadi.data.setUpdating(true);
                
                app_timestamp = Math.round(+new Date().getTime() / 1000);
                
        
                http = Ti.Network.createHTTPClient();
               // Ti.API.info('Log type : ' + http);
        
                //Timeout until error:
                http.setTimeout(15000);
        
                //While streamming - following method should be called b4 open URL
                http.ondatastream = function(e) {
                    //ind.value = e.progress ;
                    if (progress !== null) {
                        progress.set_download(e.progress);
                        //Ti.API.debug(' ONDATASTREAM1 - PROGRESS: ' + e.progress);
                    }
                };
        
                //Opens address to retrieve list
        
                if (Omadi.data.getLastUpdateTimestamp() === 0) {
                    Ti.API.info("DOING A FULL INSTALL");
                    http.open('GET', Omadi.DOMAIN_NAME + '/js-sync/download.json?sync_timestamp=0');
                }
                else {
                    http.open('GET', Omadi.DOMAIN_NAME + '/js-sync/download.json');
                }
        
                //Header parameters
                http.setRequestHeader("Content-Type", "application/json");
        
                Omadi.utils.setCookieHeader(http);
        
                //When connected
                http.onload = function(e) { 
                    var nodeType, mainDB, gpsDB, dbFile, tableName, json, GMT_OFFSET, dialog, newNotifications;          
                    
                    try{
                        //Parses response into strings
                        //Ti.API.info("Onload reached - Here follows the json: ");
                        Ti.API.info(this.responseText.substr(0, 200));
            
                        if (this.responseText !== null && this.responseText !== "null" && this.responseText !== "" && isJsonString(this.responseText) === true) {
            
                            json = JSON.parse(this.responseText.replace(/'/gi, '\''));
            
                            if (json.request_time && json.request_time !== null && json.request_time !== "") {
                                GMT_OFFSET = Number(json.request_time - app_timestamp);
                                Ti.API.info(GMT_OFFSET + "  === " + json.request_time + " === " + app_timestamp);
                                Ti.App.Properties.setString("timestamp_offset", GMT_OFFSET);
                            }
            
                            //Set our maximum
                            //Ti.API.info("######## CHECK ########  " + parseInt(json.total_item_count));
                            if (progress !== null) {
                                //Set max value for progress bar
                                progress.set_max(parseInt(json.total_item_count, 10));
                            }
            
                            Ti.API.info("Delete all value: " + json.delete_all);
            
                            mainDB = Omadi.utils.openMainDatabase();
                            //Check this function
                            if (json.delete_all === true || json.delete_all === "true") {
                                Ti.API.info("=================== ############ ===================");
                                Ti.API.info("Reseting mainDB, delete_all is required");
                                Ti.API.info("=================== ############ ===================");
            
                                //If delete_all is present, delete all contents:
            
                                if (PLATFORM === "android") {
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
            
                                mainDB = Omadi.utils.openMainDatabase();
            
                                gpsDB = Omadi.utils.openGPSDatabase();
                                gpsDB.execute('DELETE FROM alerts');
                                gpsDB.close();
                            }
            
                            //Ti.API.info("Max itens: " + parseInt(json.total_item_count));
            
                            //mainDB.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');
                            Omadi.data.setLastUpdateTimestamp(json.request_time);
                            //Ti.API.error(json.request_time);
            
                            //If mainDB is already last version
                            if (json.total_item_count == 0) {
                                Ti.API.info('######### Request time : ' + json.sync_timestamp);
                                //mainDB.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');
            
                                Ti.API.info("SUCCESS -> No items ");
                                if (progress != null) {
                                    progress.set();
                                    progress.close();
                                }
            
                            }
                            else {
            
                                if (Omadi.data.getLastUpdateTimestamp() === 0) {
                                    mainDB.execute('UPDATE updated SET "url"="' + Omadi.DOMAIN_NAME + '" WHERE "rowid"=1');
                                }
            
                                //Ti.API.info('######### Request time : ' + json.request_time);
            
                                //Omadi.data.setLastUpdateTimestamp(json.request_time);
            
                                //Ti.API.info("COUNT: " + json.total_item_count);
            
                                if ( typeof json.vehicles !== 'undefined') {
                                    Omadi.data.processVehicleJson(json.vehicles, mainDB, progress);
                                }
            
                                if ( typeof json.node_type !== 'undefined') {
                                    Omadi.data.processNodeTypeJson(json.node_type, mainDB, progress);
                                }
            
                                if ( typeof json.fields !== 'undefined') {
                                    Omadi.data.processFieldsJson(json.fields, mainDB, progress);
                                }
            
                                if ( typeof json.regions !== 'undefined') {
                                    Omadi.data.processRegionsJson(json.regions, mainDB, progress);
                                }
            
                                if ( typeof json.vocabularies !== 'undefined') {
                                    Omadi.data.processVocabulariesJson(json.vocabularies, mainDB, progress);
                                }
            
                                if ( typeof json.terms !== 'undefined') {
                                    Omadi.data.processTermsJson(json.terms, mainDB, progress);
                                }
            
                                if ( typeof json.users !== 'undefined') {
                                    Omadi.data.processUsersJson(json.users, mainDB, progress);
                                }
            
            
                                if ( typeof json.node !== 'undefined') {
                                    for(tableName in json.node) {
                                        if(json.node.hasOwnProperty(tableName)){
                                            if (json.node.hasOwnProperty(tableName)) {
                                                Omadi.data.processNodeJson(json.node[tableName], tableName, mainDB, progress);
                                            }
                                        }
                                    }
                                }
            
                                Titanium.App.Properties.setString("new_node_id", null);
            
                                Ti.App.fireEvent("syncInstallComplete");
            
                                Ti.API.info("SUCCESS");
                                if (progress != null) {
                                    progress.close();
                                }
            
                                //Omadi.data.setUpdating(false);
                                Omadi.service.uploadFile();
            
                            }
            
                            mainDB.close();
                            // Set the last timestamp
                            //Omadi.data.setLastUpdateTimestamp(json.request_time);
                        }
                        else {
                            if (progress != null) {
                                progress.close();
                            }
            
                            Titanium.Media.vibrate();
            
                            dialog = Titanium.UI.createAlertDialog({
                                title : 'Omadi Sync',
                                buttonNames : ['OK'],
                                message: "The server has diconnected you. Please login again."
                            });
            
                            dialog.show();
            
                            dialog.addEventListener('click', function(e) {
                                //Omadi.data.setUpdating(false);
            
                                Ti.App.Properties.setString('logStatus', "The server logged you out");
                                //Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
                                Omadi.service.logout();
                            });
                        }
                        
                        newNotifications = Ti.App.Properties.getObject('newNotifications', {
                            count: 0,
                            nid: 0
                        });
                        
                        if (newNotifications.count > 0) {
                            
                            Ti.App.Properties.setObject('newNotifications',{
                               count: 0,
                               nid: 0 
                            });
            
                            if (newNotifications.count > 1) {
                                dialog = Titanium.UI.createAlertDialog({
                                    title : '(' + newNotifications.count + ') New Notifications',
                                    message : 'View the notification list?',
                                    buttonNames : ['Take Me There', 'View Later'],
                                    cancel : 1
                                });
            
                                dialog.addEventListener('click', function(e) {
                                    if (e.index !== e.source.cancel) {
                                        var win_new = Titanium.UI.createWindow({
                                            navBarHidden : true,
                                            title : 'Notifications',
                                            fullscreen : false,
                                            url : 'objects.js',
                                            type : 'notification',
                                            //uid : jsonLogin.user.uid,
                                            backgroundColor : '#EEEEEE',
                                            show_plus : false
                                        });
            
                                        win_new.open();
                                    }
                                });
            
                                dialog.show();
                            }
                            else {
                                dialog = Titanium.UI.createAlertDialog({
                                    title : 'New Notification',
                                    message : 'Read the notification now?',
                                    buttonNames : ['Read Now', 'Read Later'],
                                    cancel : 1
                                });
            
                                dialog.addEventListener('click', function(e) {
                                    if (e.index !== e.source.cancel) {
                                        var win_new = Titanium.UI.createWindow({
                                            fullscreen : false,
                                            navBarHidden : true,
                                            title : 'Read Notification',
                                            type : 'notification',
                                            url : 'individual_object.js',
                                            nid : newNotifications.nid
                                        });
            
                                        win_new.open();
                                    }
                                });
            
                                dialog.show();
                            }
                        }
                    }
                    catch(ex){
                        alert("Saving Sync Data: " + ex);
                    }
        
                    Omadi.data.setUpdating(false);
                    
                    if(typeof json.node_type !== 'undefined' && (typeof json.node_type.insert !== 'undefined' || typeof json.node_type['delete'] !== 'undefined')){
                        Ti.App.fireEvent("updateUI");
                    }
                };
        
                //Connection error:
                http.onerror = function(e) {
                    var dialog, message, errorDescription;
                    
                    Ti.API.error('Code status: ' + e.error);
                    Ti.API.error('CODE ERROR = ' + this.status);
                    //Ti.API.info("Progress bar = " + progress);
        
                    if (progress != null) {
                        progress.close();
                    }
        
                    Titanium.Media.vibrate();
        
                    if (this.status == 403) {
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Omadi',
                            buttonNames : ['OK'],
                            message: "You have been logged out. Please log back in."
                        });
        
                        dialog.addEventListener('click', function(e) {
                            var db_func = Omadi.utils.openListDatabase();
                            db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                            db_func.close();
                            //win.close();
                        });
        
                        Omadi.service.logout();
                        dialog.show();
                    }
                    else if (this.status == 401) {
                        dialog = Titanium.UI.createAlertDialog({
                            title : 'Omadi',
                            buttonNames : ['OK'],
                            message: "Your session is no longer valid. Please log back in."
                        });
        
                        dialog.addEventListener('click', function(e) {
        
                            var db_func = Omadi.utils.openListDatabase();
                            db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                            db_func.close();
        
                        });
        
                        Omadi.service.logout();
                        dialog.show();
                    }
                    // Only show the dialog if this is not a background update
                    else if (progress != null) {
                        
                        errorDescription = "Error description: " + e.error;
                        if(errorDescription.indexOf('connection failure') !== -1){
                            errorDescription = '';
                        }
                        else if(errorDescription.indexOf("imeout") !== -1){
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
                            message: message
                        });
        
                        dialog.addEventListener('click', function(e) {
                            if (PLATFORM == "android") {
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
        
                    Ti.API.error("Services are down");
                };
        
                http.send();  
            }    
        }
    }
    catch(ex) {
        alert("Fetching updates: " + ex);
    }
};

Omadi.service.sendUpdates = function() { "use strict";
    /*jslint eqeq: true*/
    
    //showNotification();
    //Install new updates using pagination
    //Load existing data with pagination
    //function installMe(win, progress, menu, img, type_request, mode, close_parent, _node_name) {
    //var mode = 0;
    if (Ti.Network.online) {
        
        if (!Ti.App.Properties.getBool("isSendingData", false)) {
    
            Ti.App.Properties.setBool("isSendingData", true);
            //newNotificationCount = 0;
    
            //var timeIndex = Ti.App.Properties.getInt('sync_timestamp');
    
            var http = Ti.Network.createHTTPClient();
            //Ti.API.info('Log type : ' + http);
    
            //Timeout until error:
            http.setTimeout(15000);
    
            //Ti.API.info("Mode: " + mode);
            //Ti.API.info("Menu: " + menu);
            //Ti.API.info("TIME: " + timeIndex);
            //Ti.API.info("Type: " + type_request);
    
            http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync.json');
    
            //Header parameters
            http.setRequestHeader("Content-Type", "application/json");
            //http.node_type = node_type;
    
            Omadi.utils.setCookieHeader(http);
    
            //When connected
            http.onload = function(e) {
                var subDB, dialog, json, nameTable;
                
                //Parses response into strings
                //Ti.API.info("Onload reached - Here follows the json: ");
                //Ti.API.info(this.responseText.substr(0, 200));
    
                if (this.responseText !== null && this.responseText !== "null" && this.responseText !== "" && this.responseText !== "" && isJsonString(this.responseText) === true) {
                    
                    json = JSON.parse(this.responseText.replace(/'/gi, '\''));
                    
                    subDB = Omadi.utils.openMainDatabase();
                    
                    //Terms:
                    if (json.terms) {
                        Omadi.data.processTermsJson(json.terms, subDB, null);
                    }
    
                    Titanium.App.Properties.setString("new_node_id", null);
                    
                    for(nameTable in json.node){
                        if(json.node.hasOwnProperty(nameTable)){
                            Omadi.data.processNodeJson(json.node[nameTable], nameTable, subDB, null);
                        }
                    }
                    
                    subDB.close();
    
                    //Ti.API.info("updated file upload table");
                    // if (mode === 1) {
                        // if (PLATFORM === 'android') {
                            // Ti.UI.createNotification({
                                // message : 'The ' + this.node_type + ' was updated successfully',
                                // duration : Ti.UI.NOTIFICATION_DURATION_LONG
                            // }).show();
                        // }
                        // else {
                            // alert('The ' + this.node_type + ' was updated successfully');
                        // }
                        // //Just to make sure mainDB keeps locked
//     
                        // //close_parent(false);
                        // //Omadi.service.uploadFile(win);
//     
                    // }
                    // else if (mode === 0) {
                        // if (PLATFORM === 'android') {
                            // Ti.UI.createNotification({
                                // message : 'The ' + this.node_type + ' was created successfully.',
                                // duration : Ti.UI.NOTIFICATION_DURATION_LONG
                            // }).show();
                        // }
                        // else {
                            // alert('The ' + this.node_type + ' was created successfully.');
                        // }
                        // //Just to make sure mainDB keeps locked
//     
                        // //close_parent(false);
                        // //Omadi.service.uploadFile(win);
                    // }
    
                }
                else {
    
                    Titanium.Media.vibrate();
    
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Omadi',
                        buttonNames : ['OK'],
                        message: "The server disconnected you. Please login again."
                    });
    
                    dialog.show();
    
                    dialog.addEventListener('click', function(e) {
                        //Omadi.data.setUpdating(false)
    
                        Ti.App.Properties.setString('logStatus', "The server logged you out");
                        Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
                        Omadi.service.logout();
                    });
                }
    
                //Ti.API.debug("at the bottom after sync has returned");
                
                // if ( typeof sendUpdatesCallback !== 'undefined') {
                    // //sendUpdatesCallback();
                // }
                
                Ti.App.Properties.setBool("isSendingData", false);
                Ti.App.fireEvent("doneSendingData");
            };
    
            //Connection error:
            http.onerror = function(e) {
                var dialog, db;
                Ti.API.error('Code status: ' + e.error);
                Ti.API.error('CODE ERROR = ' + this.status);
                //Ti.API.info("Progress bar = " + progress);
                
                Titanium.Media.vibrate();
    
                if (this.status == 403 || this.status == 401) {
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Please Login Again',
                        buttonNames : ['OK'],
                        message: "You have been logged out. Your latest data was saved, and it will be sent to the server after you login again."
                    });
                    
                    Omadi.service.sendErrorReport('User logged out with code ' + this.status);
                    
                    dialog.show();
                    
                    Omadi.service.logout();
                }
                else if(this.status == 500){
                    
                    // Set the node as a draft
                    db = Omadi.utils.openMainDatabase();
                    db.execute("UPDATE node SET flag_is_updated = 3 WHERE nid < 0");
                    db.close();
                    
                    dialog = Titanium.UI.createAlertDialog({
                        title : 'Service Error',
                        buttonNames : ['OK'],
                        message: "There was a problem synching your data to the server. Your latest data was saved as a DRAFT for you to save later."
                    });
    
                    dialog.show();
                        
                    Omadi.service.sendErrorReport('500 error on send update');
                }
                
                Ti.App.Properties.setBool("isSendingData", false);
                Ti.App.fireEvent("doneSendingData");
                

                // if (mode == 0) {
                    // alert('Error: ' + e.error);
                // }
                // else if (mode == 1) {
                    // if (PLATFORM == 'android') {
                        // Ti.UI.createNotification({
                            // //message : 'An error happened while we tried to connect to the server in order to transfer the recently saved node, please make a manual update',
                            // message : 'Error :: ' + e.error, //Change message for testing purpose
                            // duration : Ti.UI.NOTIFICATION_DURATION_LONG
                        // }).show();
                    // }
                    // else {
                        // //alert('An error happened while we tried to connect to the server in order to transfer the recently saved node, please make a manual update');
                        // alert('Error :: ' + e.error);
                        // //Change message for testing purpose
                    // }
                // }
    
                
    
                //Ti.API.info("Services are down");
    
                // if ( typeof sendUpdatesCallback != 'undefined') {
                    // sendUpdatesCallback("There was a problem synching your data to the Internet, but your data is saved in the mobile app and will be synched when problems with Omadi services have been resolved.");
                // }
                
                Ti.UI.currentWindow.close();
                /*** IMPORTANT: CANNOT DO ANYTHING AFTER THE WINDOW IS CLOSED ***/
            };
    
            //app_timestamp = Math.round(+new Date().getTime() / 1000);
            //Ti.API.info('App Time: ' + app_timestamp);
    
    
            if (Ti.Network.online) {
                Ti.App.fireEvent("sendingData",{
                    message: 'Saving data to server...'
                });
                http.send(Omadi.service.getUpdatedNodeJSON());
            }
            else {
                Ti.App.Properties.setBool("isSendingData", false);
            }
        }
    }
};

Omadi.service.logout = function() { "use strict";
    
    var http, db;
    /*jslint eqeq: true*/
   
    Ti.App.fireEvent('upload_gps_locations');
    Ti.App.fireEvent('stop_gps');
    Ti.App.fireEvent('loggingOut');

    http = Ti.Network.createHTTPClient();

    http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync/logout.json');

    //Timeout until error:
    http.setTimeout(10000);

    //Header parameters
    http.setRequestHeader("Content-Type", "application/json");
    Omadi.utils.setCookieHeader(http);

    http.onload = function(e) {
        Ti.App.Properties.setString('logStatus', "You have successfully logged out");
        //Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
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
    };

    http.send();
    
    db = Omadi.utils.openListDatabase();
    db.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
    db.close();
    
    //Omadi.display.hideLoadingIndicator();
    Omadi.display.removeNotifications();
    
    Ti.UI.currentWindow.hide();

    Ti.App.Properties.setBool("stopGPS", true);
    Ti.App.Properties.setBool("quitApp", true);
};



Omadi.service.uploadFile = function() {"use strict";
    /*jslint eqeq:true, plusplus: true*/
    /*global Base64*/
    var http, mainDB, result, nid = 0, id = 0, count, file_data, isUploading, nowTimestamp, lastUploadStartTimestamp, file_name, field_name, delta, timestamp, tmpImageView, blobImage, maxDiff, imageData;    
    
    if(Ti.Network.online){
        try {
            // Upload images
            mainDB = Omadi.utils.openMainDatabase();
            result = mainDB.execute("SELECT uploading FROM _photos WHERE uploading > 0");
            
            isUploading = false;
            lastUploadStartTimestamp = nowTimestamp = Omadi.utils.getUTCTimestamp();
            if(result.isValidRow()){
                lastUploadStartTimestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
                isUploading = true;
            }
            result.close();
            // Make sure no images are currently uploading
            // Maximum of 90 seconds apart for images uploading
            if(!isUploading || (nowTimestamp - lastUploadStartTimestamp) > 90){  
                
                count = 0;
                result = mainDB.execute("SELECT nid, id, file_data, file_name, field_name, delta, timestamp FROM _photos WHERE nid > 0 AND uploading = 0 ORDER BY delta ASC");
                
                while (result.isValidRow()) {
                    //Only upload those images that have positive nids
                    if (count == 0 && result.fieldByName('nid') > 0) {
                        nid = result.fieldByName('nid');
                        id = result.fieldByName('id');
                        file_data = result.fieldByName('file_data');
                        file_name = result.fieldByName('file_name');
                        field_name = result.fieldByName('field_name');
                        delta = result.fieldByName('delta');
                        timestamp = result.fieldByName('timestamp');
                    }
                    
                    count ++;
                    
                    result.next();
                }
                result.close();
                
                // Reset all photos to not uploading in case there was an error previously
                mainDB.execute("UPDATE _photos SET uploading = 0");
                
                // Set the photo to uploading status
                mainDB.execute("UPDATE _photos SET uploading = " + nowTimestamp + " WHERE id = " + id);
                
                mainDB.close();
                
                imageData = file_data;
                //imageData = file_data;
                
                if(nid > 0){
                        
                    http = Ti.Network.createHTTPClient();
                    http.setTimeout(30000);
                    http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/upload.json');
                    http.nid = nid;
                    http.photoId = id;
            
                    //Ti.API.info("Uploading to " + domainName);
                    http.setRequestHeader("Content-Type", "application/json");
                    Omadi.utils.setCookieHeader(http);
                    
                    http.onload = function(e) {
                        var json, subDB, subResult, uploadMore = false, fieldSettings, tableName, decoded_values, decoded, content;
                        //Ti.API.info('UPLOAD FILE: =========== Success ========' + this.responseText);
                        json = JSON.parse(this.responseText);
            
                        if (json.nid) {
                            subDB = Omadi.utils.openMainDatabase();
                            
                            //subResult = subDB.execute("SELECT * FROM _photos WHERE nid> 0;");
                            
            
                            // Updating status
                            subResult = subDB.execute("SELECT table_name FROM node WHERE nid=" + json.nid + ";");
                            tableName = subResult.fieldByName('table_name');
                            subResult.close();
                            
                            subResult = subDB.execute("SELECT settings FROM fields WHERE bundle='" + tableName + "' and type='image' and field_name='" + json.field_name + "';");
                            fieldSettings = JSON.parse(subResult.fieldByName('settings'));
                            subResult.close();
                            
                            if (fieldSettings.cardinality > 1 || fieldSettings.cardinality < 0) {
                                subResult = subDB.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + json.nid + ' AND field_name = \'' + json.field_name + '\'');
                                decoded_values = [];
                                if (subResult.rowCount > 0) {
                                    decoded = subResult.fieldByName('encoded_array');
                                    if (decoded != null || decoded != "") {
                                        decoded = Base64.decode(decoded);
                                        Ti.API.info('Decoded array is equals to: ' + decoded);
                                        decoded = decoded.toString();
                                        decoded_values = decoded.split("j8Oc2s1E");
                                    }
                                }
                                subResult.close();
            
                                if (json.delta < decoded_values.length) {
                                    decoded_values[json.delta] = json.file_id;
                                }
                                else {
                                    decoded_values.push(json.file_id);
                                }
                                
                                content = Base64.encode(decoded_values.join("j8Oc2s1E"));
                                
                                subDB.execute("UPDATE " + tableName + " SET " + json.field_name + "='7411317618171051229', " + json.field_name + "___file_id='7411317618171051229', " + json.field_name + "___status='7411317618171051229' WHERE nid='" + json.nid + "'");
                                subDB.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json.nid + ', \'' + json.field_name + "___file_id" + '\',  \'' + content + '\' )');
                                subDB.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json.nid + ', \'' + json.field_name + '\',  \'' + content + '\' )');
                            }
                            else {
                                subDB.execute("UPDATE " + tableName + " SET " + json.field_name + "='" + json.file_id + "', " + json.field_name + "___file_id='" + json.file_id + "', " + json.field_name + "___status='uploaded' WHERE nid='" + json.nid + "'");
                            }
                            //Deleting file after upload.
                            subDB.execute("DELETE FROM _photos WHERE nid=" + json.nid + " and delta=" + json.delta + " and field_name='" + json.field_name + "'");
                            
                            subResult = subDB.execute("SELECT id FROM _photos WHERE nid > 0 AND tries = 0");
                            uploadMore = (subResult.rowCount > 0 ? true : false);
                            subResult.close();
                            
                            subDB.close();
                            
                            Ti.App.fireEvent('photoUploaded', {
                                nid: json.nid,
                                delta: json.delta,
                                field_name: json.field_name,
                                fid: json.file_id
                            });
                            
                            if (uploadMore) {
                                Omadi.service.uploadFile();
                            }
                            else{
                                Ti.App.fireEvent("doneSendingPhotos");
                            }
                        }
                  
                    };
            
                    http.onerror = function(e) {
                        var subDB, dialog, message, subResult, numTries, blob, photoId, nid, uploadMore, imageView;
                        
                        
                        //Ti.API.error('UPLOAD FILE: =========== Error in uploading ========' + this.error + this.status);
                        
                        //if (this.status == '406') {
                         //   subDB = Omadi.utils.openMainDatabase();
                        //    subDB.execute("DELETE FROM _photos WHERE nid=" + this.nid + " and id=" + this.id + ";");
                        //    subDB.close();
                            
                       // }
                       
                        photoId = this.photoId;
                        nid = this.nid;
                        
                        Omadi.service.sendErrorReport("Photo upload failed: " + nid);
                        
                        subDB = Omadi.utils.openMainDatabase();
                        subResult = subDB.execute("SELECT tries, file_data FROM _photos WHERE id=" + photoId);
                        
                        subDB.execute("UPDATE _photos SET uploading = 0 WHERE id = " + photoId);
                        
                        if (subResult.rowCount > 0) {
                            numTries = subResult.fieldByName('tries', Ti.Database.FIELD_TYPE_INT);
                            
                            if(numTries >= 4){
                                
                                try{
                                    blob = Ti.Utils.base64decode(subResult.fieldByName('file_data'));
                                    // Make a temporary imageView so the blob can be created.
                                    // It doesn't work with the blog from the base64decode
                                    imageView = Ti.UI.createImageView({
                                       image: blob 
                                    });
                                    
                                    // TODO: SAVE the photo to Android filesystem
                                    if(PLATFORM === 'android'){
                                        
                                        // Titanium.Media.saveToPhotoGallery(blob, {
                                            // success: function(){
                //                                     
                                            // },
                                            // error: function(){
                //                                     
                                            // }
                                        // });  
                                        Ti.API.error("ADD THIS IN FOR ANDROID PHOTO SAVING ON FILESYSTEM ON DEVICE"); 
                                    }
                                    else{
                                        
                                        Omadi.service.sendErrorReport("going to save to photo gallery: " + photoId);
                                        Titanium.Media.saveToPhotoGallery(imageView.toImage(), {
                                            success: function(e){
                                                //Omadi.service.sendErrorReport("saved to photo gallery: " + photoId);
                                                
                                                dialog = Titanium.UI.createAlertDialog({
                                                    title : 'Photo Upload Problem',
                                                    message : "There was a problem uploading a photo for node #" + nid + " after 5 tries. The photo was saved to this device's gallery.",
                                                    buttonNames : ['OK']
                                                });
                                                dialog.show();
                                                
                                                Omadi.service.sendErrorReport("Saved to photo gallery: " + nid);
                                                
                                                Omadi.data.deletePhotoUpload(photoId);
                                            },
                                            error: function(e){
                                                Omadi.service.sendErrorReport("Did not save to photo gallery: " + photoId);
                                                dialog = Titanium.UI.createAlertDialog({
                                                    title : 'Corrupted Photo',
                                                    message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery. Unfortunately, the photo cannot be reclaimed.",
                                                    buttonNames : ['OK']
                                                });
                                                dialog.show();
                                                
                                                Omadi.service.sendErrorReport("Failed saving to photo gallery: nid: " + nid);
                                                
                                                Omadi.data.deletePhotoUpload(photoId);
                                            }
                                        });   
                                    }
                                }
                                catch(ex){
                                    Omadi.service.sendErrorReport("Did not save to photo gallery exception: " + photoId + ", ex: " + ex);
                                    dialog = Titanium.UI.createAlertDialog({
                                        title : 'Corrupted Photo',
                                        message : "There was a problem uploading a photo for node #" + nid + ", and the photo could not be saved to this device's gallery.",
                                        buttonNames : ['OK']
                                    });
                                    dialog.show();
                                }
                            }
                            
                            
                            subDB.execute("UPDATE _photos SET tries = (tries + 1) where id=" + photoId);
                        }
                        
                        
                        subResult = subDB.execute("SELECT id FROM _photos WHERE nid > 0");
                        uploadMore = (subResult.rowCount > 0 ? true : false);
                        subResult.close();
                        
                        subDB.close();
                        
                        if (uploadMore) {
                            setTimeout(Omadi.service.uploadFile, 15000);
                        }
                       
                        Ti.App.fireEvent("doneSendingPhotos");
                        
                    
                        // if(this.error.toString().indexOf('Timeout') !== -1){
                            // message = "A photo failed to upload.  Please check your Internet connection. Once you connect, the photo will be automatically uploaded.";
                        // }
                        // else{
                            // message = 'There was a problem uploading your photo. Details: ' + this.status + " " + this.error;
                        // }
                        
                    };
            
                    
                    //if (PLATFORM == 'android') {
                    //    http.send('{"file_data"    :"' + fileUploadTable.fieldByName('file_data') + '", "filename" :"' + fileUploadTable.fieldByName('file_name') + '", "nid"      :"' + fileUploadTable.fieldByName('nid') + '", "field_name":"' + fileUploadTable.fieldByName('field_name') + '", "delta":"' + fileUploadTable.fieldByName('delta') + '","timestamp":"' + fileUploadTable.fieldByName('timestamp') + '"}');
                    //}
                    //else {
                     Ti.App.fireEvent("sendingData",{
                        message: 'Uploading photos to server. ' + count + ' to go...'
                     });  
                    
                    http.send(JSON.stringify({
                        file_data : imageData,
                        filename : file_name, 
                        nid : nid, 
                        field_name : field_name, 
                        delta : delta, 
                        timestamp : timestamp
                    }));
                        //alert("time_stamp_send_to_sever_in_ios");
            
                }
                //alert("time_stamp_sent_to_server");
            }
        }
        catch(ex) {
            Ti.API.error("==== ERROR ===" + ex);
            alert("There was an error uploading your photo. Details: " + ex);
            Omadi.service.sendErrorReport("Exception uploading photo: " + ex);
        }
    }
};


Omadi.service.sendErrorReport = function(message){"use strict";
    var http;
    
    http = Ti.Network.createHTTPClient();
    http.setTimeout(30000);
    http.open('GET', Omadi.DOMAIN_NAME + '/error.json?message=' + message);
    //http.setRequestHeader("Content-Type", "application/json");
    //Omadi.utils.setCookieHeader(http);
    
    http.send();
};



Omadi.service.getUpdatedNodeJSON = function() { "use strict";
    /*jslint eqeq:true,plusplus:true*/
   /*global isNumber,loadNode*/

    var db, result, obj, nid, tid, nids, node, instances, field_name, i, v_result;
    
    try{
        //Initial JSON values:
        //var current_timestamp = Math.round(new Date() / 1000);
        //json = '{ "timestamp" : "' + Omadi.utils.getUTCTimestamp() + '", "data" : { ';
        obj = {
          timestamp: Omadi.utils.getUTCTimestamp(),
          data: {}  
        };
        
        nids = [];
        
        db = Omadi.utils.openMainDatabase();
        result = db.execute("SELECT nid FROM node WHERE flag_is_updated=1");
          
        while(result.isValidRow()){
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
        
        db.close();
        
        
        
        if(nids.length > 0){
            obj.data.node = {};
            
            for(i = 0; i < nids.length; i ++){
                nid = nids[i];
                node = loadNode(nid);
                
                instances = Omadi.data.getFields(node.type);
                
                obj.data.node[nid] = {};
                obj.data.node[nid].created = node.created;
                obj.data.node[nid].changed = node.changed;
                obj.data.node[nid].nid = node.nid;
                obj.data.node[nid].type = node.type;
                obj.data.node[nid].form_part = node.form_part;
                obj.data.node[nid].no_data_fields = node.no_data_fields;
                
                for(field_name in instances){
                    if(instances.hasOwnProperty(field_name)){
                        if(typeof node[field_name] !== 'undefined' && typeof node[field_name].dbValues !== 'undefined' && node[field_name].dbValues.length > 0){
                            if(node[field_name].dbValues.length > 1){
                                obj.data.node[nid][field_name] = node[field_name].dbValues;
                            }
                            else{
                                obj.data.node[nid][field_name] = node[field_name].dbValues[0];
                            }
                        }
                        else{
                            obj.data.node[nid][field_name] = null;
                        }
                    }   
                }
            }
        }
       
        return JSON.stringify(obj);
    }
    catch(ex){
        db = Omadi.utils.openMainDatabase();
        result = db.execute("UPDATE node SET flag_is_updated = 3 WHERE flag_is_updated = 1");
        db.close();
        
        alert("There was a problem packaging your data, so it has been saved as a draft.");
        Omadi.service.sendErrorReport("Exception in JSON creation: " + ex);
    }
};

// 
// 
// Omadi.service.getUpdatedNodeJSON = function() { "use strict";
    // /*jslint eqeq:true,plusplus:true*/
   // /*global isNumber*/
// 
    // var mainDB, field_name, newNodesResult, json, nodeDataResult, fieldsResult, type_string, no_data_string, array_cont, decoded, decoded_values, i, image_count_result, image_count, value, newTermsResult, vocabularyResult, cp_decoded_values;
//     
    // try{
        // //Initial JSON values:
        // //var current_timestamp = Math.round(new Date() / 1000);
        // json = '{ "timestamp" : "' + Omadi.utils.getUTCTimestamp() + '", "data" : { ';
        // mainDB = Omadi.utils.openMainDatabase();
//        
        // //=============================
        // //Builds JSON for new nodes and for nodes that were updated
        // //=============================
        // newNodesResult = mainDB.execute('SELECT * FROM node WHERE flag_is_updated=1 ORDER BY nid DESC');
        // //Ti.API.info('Lets update the node :'+newNodesResult.fieldByName('nid'));
        // if (newNodesResult.rowCount > 0) {
            // json += '"node":{ ';
            // while (newNodesResult.isValidRow()) {
//                
                // //Ti.API.info('NODE ' + newNodesResult.fieldByName('nid') + ' -----JSON BEING CREATED-----');
//                 
                // nodeDataResult = mainDB.execute('SELECT * FROM ' + newNodesResult.fieldByName('table_name') + ' WHERE nid = ' + newNodesResult.fieldByName('nid'));
                // fieldsResult = mainDB.execute('SELECT * FROM fields WHERE bundle = "' + newNodesResult.fieldByName('table_name') + '"');
                // type_string = fieldsResult.fieldByName('bundle');
//     
                // no_data_string = '""';
                // if (newNodesResult.fieldByName("no_data_fields") != null && newNodesResult.fieldByName("no_data_fields") != "") {
                    // no_data_string = newNodesResult.fieldByName("no_data_fields");
                // }
                // if (newNodesResult.fieldByName('nid') < 0) {
                    // json += '"' + newNodesResult.fieldByName('nid') + '":{ "created":"' + newNodesResult.fieldByName('created') + '", "nid":"' + newNodesResult.fieldByName('nid') + '", "type":"' + type_string.toLowerCase() + '", "form_part":"' + newNodesResult.fieldByName("form_part") + '", "no_data_fields":' + no_data_string;
                // }
                // else {
                    // json += '"' + newNodesResult.fieldByName('nid') + '":{ "changed":"' + newNodesResult.fieldByName('changed') + '", "nid":"' + newNodesResult.fieldByName('nid') + '", "type":"' + type_string.toLowerCase() + '", "form_part":"' + newNodesResult.fieldByName("form_part") + '", "no_data_fields":' + no_data_string;
                // }
                // //Ti.API.info(json);
                // //Ti.API.info('1');
                // while (fieldsResult.isValidRow()) {
                    // field_name = fieldsResult.fieldByName('field_name');
                    // //Ti.API.info(field_name);
                    // //Ti.API.debug("CREATE JSON: processing field " + fieldsResult.fieldByName('field_name'));
                    // if ((nodeDataResult.rowCount > 0) && (nodeDataResult.fieldByName(field_name) != null) && (nodeDataResult.fieldByName(field_name) != '')) {
                        // //Ti.API.info('3');
                        // if (nodeDataResult.fieldByName(field_name) == 7411317618171051229 || nodeDataResult.fieldByName(field_name) == "7411317618171051229") {
                            // //Ti.API.info('4');
                            // array_cont = mainDB.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + newNodesResult.fieldByName('nid') + ' AND field_name = \'' + fieldsResult.fieldByName('field_name') + '\'');
                            // //Ti.API.info('5');
                            // if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
                                // //Decode the stored array:
                                // //Ti.API.info('6');
                                // //var a_decoded = ;
                                // //Ti.API.info('7 '+a_decoded);
                                // //TODO: Fix the decoded value:
                                // //decoded = Titanium.Utils.base64decode(decoded);
                                // decoded = Base64.decode(array_cont.fieldByName('encoded_array'));
                                // //Ti.API.info('8 '+decoded);
                                // //Ti.API.info('Decoded array is equals to: ' + decoded);
                                // //Ti.API.info('9');
                                // decoded = decoded.toString();
                                // //Ti.API.info('10');
                                // // Token that splits each element contained into the array: 'j8Oc2s1E'
                                // decoded_values = decoded.split("j8Oc2s1E");
//     
                                // for (i = 0; i < decoded_values.length; i ++) {
                                    // decoded_values[i] = decoded_values[i].toString().replace(/^\s+|\s+$/g, "");
                                // }
//                                 
//                                 
                                // if (fieldsResult.fieldByName('type') == 'image') {
//     
                                    // image_count_result = mainDB.execute('SELECT COUNT(*) AS count FROM _photos WHERE nid = ' + newNodesResult.fieldByName('nid') + ' AND field_name = \'' + fieldsResult.fieldByName('field_name') + '\'');
                                    // image_count = image_count_result.fieldByName('count');
//     
                                    // //Ti.API.info("IMAGE: Image Count: " + image_count);
//     
                                    // if (decoded_values.length) {
                                        // if (decoded_values.length == 1) {
                                            // if (decoded_values[0] == null || decoded_values[0] == "null" || decoded_values[0] == "" || isNumber(decoded_values[0]) === false) {
                                                // Ti.API.info('Nothing to add, pictures not taken');
                                            // }
                                            // else {
                                                // json += ', "' + fieldsResult.fieldByName('field_name') + '": [ \"' + decoded_values.join("\" , \"") + '\" ] ';
                                            // }
                                        // }
                                        // else {
                                            // cp_decoded_values = decoded_values.slice();
//                                         
                                            // for (i = 0; i < decoded_values.length; i ++) {
                                                // if (decoded_values[i] == null || decoded_values[i] == "null" || decoded_values[i] == "" || isNumber(decoded_values[i]) === false) {
                                                    // cp_decoded_values.splice(i, 1);
                                                // }
                                            // }
                                            // json += ', "' + fieldsResult.fieldByName('field_name') + '": [ \"' + cp_decoded_values.join("\" , \"") + '\" ] ';
                                        // }
                                    // }
//                                    
                                // }
                                // else {
                                    // json += ', "' + fieldsResult.fieldByName('field_name') + '": [ \"' + decoded_values.join("\" , \"") + '\" ] ';
                                // }
//     
                                // //Ti.API.info('11.1 '+json);
                            // }
                            // else {
                                // //Ti.API.info('12');
                                // if (fieldsResult.fieldByName('type') == 'image') {
//                                     
                                    // image_count_result = mainDB.execute('SELECT COUNT(*) AS count FROM _photos WHERE nid = ' + newNodesResult.fieldByName('nid') + ' AND field_name = \'' + fieldsResult.fieldByName('field_name') + '\'');
                                    // image_count = image_count_result.fieldByName('count');
//     
                                    // //Ti.API.info("IMAGE: Image Count bottom: " + image_count);
//     
                                    // if (nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')) == null || nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')) == "null" || nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')) == "" || isNumber(nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name'))) === false) {
                                        // Ti.API.info('Nothing to add, pictures not taken');
                                    // }
                                    // else {
                                        // json += ', "' + fieldsResult.fieldByName('field_name') + '": "' + nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')) + '"';
                                    // }
                                // }
                                // else {
                                    // value = nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')).toString();
                                    // json += ', "' + fieldsResult.fieldByName('field_name') + '": "' + value.replace(/^\s+|\s+$/g, "") + '"';
                                // }
                                // //json += ', "' + fieldsResult.fieldByName('field_name') + '": "' + nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')) + '"';
                                // //Ti.API.info('13 PRE_JSON: ' + json);
                            // }
                            // array_cont.close();
                        // }
                        // else {
                            // //Ti.API.info('14');
                            // if (fieldsResult.fieldByName('type') == 'rules_field') {
                                // //Ti.API.info('15');
                                // json += ', "' + fieldsResult.fieldByName('field_name') + '": ' + nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name'));
                                // //Ti.API.info('16 PRE_JSON: ' + json);
                            // }
                            // else {
                                // //Ti.API.info('17');
                                // // Most fields go here
                                // // single cardinality, non-photo, non-rules fields
                                // value = nodeDataResult.fieldByName(fieldsResult.fieldByName('field_name')).toString();
                                // json += ', "' + fieldsResult.fieldByName('field_name') + '": "' + value.replace(/^\s+|\s+$/g, "") + '" ';
                                // //Ti.API.info('18 PRE_JSON: ' + json);
                            // }
                        // }
                    // }
//     
                    // fieldsResult.next();
                // }
                // json += ' } ';
                // //Ti.API.info('19 PRE_JSON: ' + json);
                // //Next node
                // newNodesResult.next();
                // if (newNodesResult.isValidRow()) {
                    // json += ', ';
                // }
            // }
            // //close 'node'
            // json += '} ';
            // nodeDataResult.close();
            // fieldsResult.close();
//            
            // //=============================
            // //Builds JSON for new terms
            // //=============================
            // newTermsResult = mainDB.execute('SELECT * FROM term_data WHERE tid < 0 ORDER BY tid DESC');
            // //Ti.API.info('Lets update the terms :'+newTermsResult.fieldByName('tid'));
            // //Ti.API.info('20');
            // if (newTermsResult.rowCount > 0) {
               // // Ti.API.info('21');
                // json += ',"term":{ ';
                // while (newTermsResult.isValidRow()) {
                    // //Ti.API.info('22');
                   // // Ti.API.info('TERM ' + newTermsResult.fieldByName('tid') + ' -----JSON BEING CREATED-----');
                    // vocabularyResult = mainDB.execute('SELECT * FROM vocabulary WHERE vid = ' + newTermsResult.fieldByName('vid'));
                    // json += '"' + newTermsResult.fieldByName('tid') + '":{ "created":"' + newTermsResult.fieldByName('created') + '", "tid":"' + newTermsResult.fieldByName('tid') + '", "machine_name":"' + vocabularyResult.fieldByName('machine_name') + '", "name":"' + newTermsResult.fieldByName('name') + '"  }';
                    // //Next term
                    // newTermsResult.next();
                    // if (newTermsResult.isValidRow()) {
                        // json += ', ';
                    // }
//                     
                    // vocabularyResult.close();
//                     
                // }
                // //close 'term'
                // json += '} ';
            // }
            // // close data and timestamp:
            // json += ' } }';
//     
            // Ti.API.info('JSON: ' + json);
//     
            // //Close db connections and result set
            // newNodesResult.close();
            // newTermsResult.close();
            // mainDB.close();
            // return json;
        // }
    // }
    // catch(ex){
        // alert("Creating data for server: " + ex);
    // }
// };





