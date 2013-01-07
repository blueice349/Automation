/*global Omadi, dbEsc*/
/*jslint eqeq: true, plusplus: true*/

Omadi.service = Omadi.service || {};

Omadi.service.refreshSession = function(){"use strict";
    var http;
    
    if(Ti.App.isIOS){
        // The cookie only needs to be refreshed for iOS right now.
        // Android has a little less security when setting cookies
        // This was implemented solely for the purpose of using the webview in the fileViewer.js file
        // Without getting a Set-Cookie header in a response at some point, iOS will not allow an unknown cookie to be sent
        // Therefore, this needed to be added
        
        if(Ti.Network.online && !Ti.App.Properties.getBool("sessionRefreshed", false)){
            if (!Omadi.data.isUpdating()) {
                Omadi.data.setUpdating(true);
                
                http = Ti.Network.createHTTPClient();
                http.setTimeout(10000);
                http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync/refreshSession.json');
            
                Omadi.utils.setCookieHeader(http);
                http.setRequestHeader("Content-Type", "application/json");
                
                http.onload = function(e){
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
                
                http.onerror = function(e){
                    var dialog;
                    
                    Omadi.data.setUpdating(false);
                    
                    if (this.status == 403) {
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
                    else if (this.status == 401) {
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
            
                        Omadi.service.logout();
                        dialog.show();
                    }
                    else{
                        setTimeout(Omadi.service.refreshSession, 40000);
                    }
                };
            
                http.send();
            }
            else{
                setTimeout(Omadi.service.refreshSession, 10000);
            }
        }
        else{
            
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
    var http, app_timestamp, progress = null;
    /*global isJsonString*/
    /*jslint eqeq:true*/
    try {

        if (!Omadi.data.isUpdating()) {

            if (Ti.Network.online) {
                Omadi.data.setUpdating(true);

                if (useProgressBar) {
                    progress = new Omadi.display.ProgressBar(0, 100);
                }

                app_timestamp = Math.round(+new Date().getTime() / 1000);

                http = Ti.Network.createHTTPClient();

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

                    try {
                        //Parses response into strings
                        if (this.responseText !== null && isJsonString(this.responseText) === true) {

                            Ti.API.info(this.responseText.substring(0, 3000));

                            json = JSON.parse(this.responseText);

                            if (json.request_time && json.request_time !== null && json.request_time !== "") {
                                GMT_OFFSET = Number(json.request_time - app_timestamp);
                                //Ti.API.info(GMT_OFFSET + "  === " + json.request_time + " === " + app_timestamp);
                                Ti.App.Properties.setString("timestamp_offset", GMT_OFFSET);
                            }

                            
                    
                            if (json.delete_all === true || json.delete_all === "true") {
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
                            Omadi.data.setLastUpdateTimestamp(json.request_time);
                            //Ti.API.error(json.request_time);

                            Ti.API.info("Total items to install: " + json.total_item_count);
                            
                            mainDB = Omadi.utils.openMainDatabase();
                            //If mainDB is already last version
                            if (json.total_item_count == 0) {
                                //mainDB.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');

                                if (progress != null) {
                                    progress.set();
                                    progress.close();
                                }

                            }
                            else {
                                
                                if (progress !== null) {
                                    //Set max value for progress bar
                                    progress.set_max(parseInt(json.total_item_count, 10));
                                }
                                
                                if (Omadi.data.getLastUpdateTimestamp() === 0) {
                                    mainDB.execute('UPDATE updated SET "url"="' + Omadi.DOMAIN_NAME + '" WHERE "rowid"=1');
                                }

                                //Ti.API.info('######### Request time : ' + json.request_time);

                                //Omadi.data.setLastUpdateTimestamp(json.request_time);

                                if ( typeof json.vehicles !== 'undefined') {
                                    Ti.API.debug("Installing vehicles");
                                    Omadi.data.processVehicleJson(json.vehicles, mainDB, progress);
                                }
                                
                                if ( typeof json.node_type !== 'undefined') {
                                    Ti.API.debug("Installing bundles");
                                    Omadi.data.processNodeTypeJson(json.node_type, mainDB, progress);
                                }
                                
                                if ( typeof json.fields !== 'undefined') {
                                    Ti.API.debug("Installing fields");
                                    Omadi.data.processFieldsJson(json.fields, mainDB, progress);
                                }
                                
                                if ( typeof json.regions !== 'undefined') {
                                    Ti.API.debug("Installing regions");
                                    Omadi.data.processRegionsJson(json.regions, mainDB, progress);
                                }
                                
                                if ( typeof json.vocabularies !== 'undefined') {
                                    Ti.API.debug("Installing vocabularies");
                                    Omadi.data.processVocabulariesJson(json.vocabularies, mainDB, progress);
                                }
                                
                                if ( typeof json.terms !== 'undefined') {
                                    Ti.API.debug("Installing terms");
                                    Omadi.data.processTermsJson(json.terms, mainDB, progress);
                                }
                                
                                if ( typeof json.users !== 'undefined') {
                                    Ti.API.debug("Installing users");
                                    Omadi.data.processUsersJson(json.users, mainDB, progress);
                                }
                                
                                
                                if ( typeof json.node !== 'undefined') {
                                    Ti.API.debug("Installing nodes");
                                    for (tableName in json.node) {
                                        if (json.node.hasOwnProperty(tableName)) {
                                            if (json.node.hasOwnProperty(tableName)) {
                                                Omadi.data.processNodeJson(json.node[tableName], tableName, mainDB, progress);
                                            }
                                        }
                                    }
                                }

                                //Ti.API.info("SUCCESS");
                                if (progress != null) {
                                    progress.close();
                                }

                                Ti.App.fireEvent("syncInstallComplete");
                            }
                            mainDB.close();

                            if ( typeof json.new_app !== 'undefined' && json.new_app.length > 0) {
                                Ti.API.debug("New App: " + json.new_app);
                                Omadi.display.newAppAvailable(json.new_app);
                            }
                        }
                        else {
                            if (progress != null) {
                                progress.close();
                            }

                            Titanium.Media.vibrate();
                            Ti.API.error("Bad response text: " + this.responseText);
                        }

                        newNotifications = Ti.App.Properties.getObject('newNotifications', {
                            count : 0,
                            nid : 0
                        });

                        if (newNotifications.count > 0) {

                            Ti.App.Properties.setObject('newNotifications', {
                                count : 0,
                                nid : 0
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
                                        Omadi.display.openListWindow('notification', false, [], [], true);
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
                                        Omadi.display.openViewWindow('notification', newNotifications.nid);
                                    }
                                });

                                dialog.show();
                            }
                        }

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

                    Omadi.data.setUpdating(false);

                    Omadi.service.uploadFile();
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
                            message : "You have been logged out. Please log back in."
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
                            message : "Your session is no longer valid. Please log back in."
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
                        if (errorDescription.indexOf('connection failure') !== -1) {
                            errorDescription = '';
                        }
                        else if (errorDescription.indexOf("imeout") !== -1) {
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
        }
    }
    catch(ex) {
        alert("Fetching updates: " + ex);
    }
};

Omadi.service.sendUpdates = function() {"use strict";
    /*jslint eqeq: true*/

    if (Ti.Network.online) {

        if (!Ti.App.Properties.getBool("isSendingData", false)) {

            Ti.App.Properties.setBool("isSendingData", true);

            var http = Ti.Network.createHTTPClient();
            http.setTimeout(60000);
            http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync.json');

            http.setRequestHeader("Content-Type", "application/json");
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

                    for (nameTable in json.node) {
                        if (json.node.hasOwnProperty(nameTable)) {
                            Omadi.data.processNodeJson(json.node[nameTable], nameTable, subDB, null);
                        }
                    }

                    subDB.close();

                    //Ti.API.info("updated file upload table");
                    // if (mode === 1) {
                    // if (Ti.App.isAndroid) {
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
                    // if (Ti.App.isAndroid) {
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
                        message : "You have been logged out. Your latest data was saved, and it will be sent to the server after you login again."
                    });

                    Omadi.service.sendErrorReport('User logged out with code ' + this.status);

                    dialog.show();

                    Omadi.service.logout();
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

                Ti.App.Properties.setBool("isSendingData", false);
                Ti.App.fireEvent("doneSendingData");

                // if (mode == 0) {
                // alert('Error: ' + e.error);
                // }
                // else if (mode == 1) {
                // if (Ti.App.isAndroid) {
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

            Ti.App.fireEvent("sendingData", {
                message : 'Saving data to server...'
            });
            http.send(Omadi.service.getUpdatedNodeJSON());
        }
    }
};

Omadi.service.logout = function() {"use strict";

    var http, db;
    /*jslint eqeq: true*/

    Ti.App.fireEvent('upload_gps_locations');
    Ti.App.fireEvent('stop_gps');
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

    //Ti.UI.currentWindow.hide();

    Ti.App.Properties.setBool("stopGPS", true);
    Ti.App.Properties.setBool("quitApp", true);

    Omadi.display.removeNotifications();
};

Omadi.service.uploadFile = function() {"use strict";
    /*jslint eqeq:true, plusplus: true*/
    /*global Base64*/
    var http, mainDB, result, nid = 0, id = 0, count, file_data, isUploading, nowTimestamp, lastUploadStartTimestamp, file_name, field_name, delta, timestamp, tmpImageView, blobImage, maxDiff, imageData, tries;

    if (Ti.Network.online) {
        try {
            // Upload images
            mainDB = Omadi.utils.openMainDatabase();
            result = mainDB.execute("SELECT uploading FROM _photos WHERE uploading > 0");

            isUploading = false;
            lastUploadStartTimestamp = nowTimestamp = Omadi.utils.getUTCTimestamp();
            if (result.isValidRow()) {
                lastUploadStartTimestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
                isUploading = true;
                Ti.API.debug("A photo is currently uploading");
            }
            result.close();
            mainDB.close();

            // Make sure no images are currently uploading
            // Maximum of 90 seconds apart for images uploading
            if (!isUploading || (nowTimestamp - lastUploadStartTimestamp) > 90) {

                count = 0;
                mainDB = Omadi.utils.openMainDatabase();
                result = mainDB.execute("SELECT nid, id, file_data, file_name, field_name, delta, timestamp, tries FROM _photos WHERE nid > 0 ORDER BY delta ASC");

                while (result.isValidRow()) {
                    //Only upload those images that have positive nids

                    if (result.fieldByName('tries', Ti.Database.FIELD_TYPE_INT) < 0) {
                        Omadi.data.saveFailedUpload(result.fieldByName('id'));
                    }
                    else if (nid == 0 && result.fieldByName('nid') > 0) {
                        nid = result.fieldByName('nid');
                        id = result.fieldByName('id');
                        file_data = result.fieldByName('file_data');
                        file_name = result.fieldByName('file_name');
                        field_name = result.fieldByName('field_name');
                        delta = result.fieldByName('delta');
                        timestamp = result.fieldByName('timestamp');
                        tries = result.fieldByName('tries');
                    }

                    count++;

                    result.next();
                }
                result.close();

                Ti.API.debug("Current upload is for nid " + nid + " field " + field_name + " delta " + delta + " and tries=" + tries);
                
                // Reset all photos to not uploading in case there was an error previously
                mainDB.execute("UPDATE _photos SET uploading = 0 WHERE uploading <> 0");
                
                if (count > 0) {
                    if((file_data == null || file_data.length) < 10 && id > 0){
                        mainDB.execute("DELETE FROM _photos WHERE id=" + id);
                        return;
                    }
                    
                    // Set the photo to uploading status
                    mainDB.execute("UPDATE _photos SET uploading = " + nowTimestamp + " WHERE id = " + id);
                }

                mainDB.close();

                if (count > 0) {

                    imageData = file_data;
                    //imageData = file_data;

                    if (nid > 0) {

                        http = Ti.Network.createHTTPClient();
                        http.setTimeout(30000);
                        http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/upload.json');
                        http.nid = nid;
                        http.photoId = id;
                        http.delta = delta;
                        http.field_name = field_name;

                        //Ti.API.info("Uploading to " + domainName);
                        http.setRequestHeader("Content-Type", "application/json");
                        Omadi.utils.setCookieHeader(http);

                        http.onload = function(e) {
                            var json, subDB, subResult, uploadMore = false, fieldSettings, tableName, 
                                decoded_values, decoded, content, multipleValue, dbValue, jsonArray;
                            //Ti.API.info('UPLOAD FILE: =========== Success ========' + this.responseText);
                            Ti.API.debug("Photo upload succeeded");

                            json = JSON.parse(this.responseText);

                            if (json.nid) {
                                subDB = Omadi.utils.openMainDatabase();

                                // Updating status
                                subResult = subDB.execute("SELECT table_name FROM node WHERE nid=" + json.nid + ";");
                                tableName = subResult.fieldByName('table_name');
                                subResult.close();

                                subResult = subDB.execute("SELECT settings FROM fields WHERE bundle='" + tableName + "' and type='image' and field_name='" + json.field_name + "';");
                                fieldSettings = JSON.parse(subResult.fieldByName('settings'));
                                subResult.close();

                                if (fieldSettings.cardinality > 1 || fieldSettings.cardinality < 0) {
                                   
                                    subResult = subDB.execute("SELECT " + json.field_name + " FROM " + tableName + " WHERE nid=" + json.nid);
                                    
                                    jsonArray = []; 
                                    
                                    if(subResult.isValidRow()){
                                        multipleValue = Omadi.utils.getParsedJSON(subResult.fieldByName(json.field_name));
                                        if(Omadi.utils.isArray(multipleValue)){
                                            jsonArray = multipleValue;                                       
                                        }
                                    }
                                    
                                    jsonArray[parseInt(json.delta, 10)] = json.file_id;
                                    
                                    subDB.execute("UPDATE " + tableName + " SET " + json.field_name + "='" + dbEsc(JSON.stringify(jsonArray)) + "' WHERE nid=" + json.nid);
                                }
                                else {
                                    subDB.execute("UPDATE " + tableName + " SET " + json.field_name + "='" + json.file_id + "' WHERE nid='" + json.nid + "'");
                                }
                                
                                //Deleting file after upload.
                                subDB.execute("DELETE FROM _photos WHERE nid=" + json.nid + " and delta=" + json.delta + " and field_name='" + json.field_name + "'");

                                subResult = subDB.execute("SELECT id FROM _photos WHERE nid > 0 AND tries = 0");
                                uploadMore = (subResult.rowCount > 0 ? true : false);
                                subResult.close();

                                subDB.close();

                                Ti.App.fireEvent('photoUploaded', {
                                    nid : json.nid,
                                    delta : json.delta,
                                    field_name : json.field_name,
                                    fid : json.file_id
                                });

                                if (uploadMore) {
                                    Omadi.service.uploadFile();
                                }
                                else {
                                    Ti.App.fireEvent("doneSendingPhotos");
                                }
                            }
                        };

                        http.onerror = function(e) {
                            var subDB, dialog, message, subResult, numTries, blob, photoId, nid, uploadMore, imageView, delta, field_name, filename, imageFile, imageDir;

                            Ti.API.error("Photo upload failed");

                            photoId = this.photoId;
                            nid = this.nid;
                            delta = this.delta;
                            field_name = this.field_name;

                            //Omadi.service.sendErrorReport("Photo upload failed: " + nid);

                            subDB = Omadi.utils.openMainDatabase();
                            subResult = subDB.execute("SELECT tries, file_data FROM _photos WHERE id=" + photoId);

                            subDB.execute("UPDATE _photos SET uploading = 0 WHERE id = " + photoId);

                            if (subResult.rowCount > 0) {
                                numTries = subResult.fieldByName('tries', Ti.Database.FIELD_TYPE_INT);

                                if (numTries >= 4) {

                                    Omadi.data.saveFailedUpload(photoId);
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

                        //if (Ti.App.isAndroid) {
                        //    http.send('{"file_data"    :"' + fileUploadTable.fieldByName('file_data') + '", "filename" :"' + fileUploadTable.fieldByName('file_name') + '", "nid"      :"' + fileUploadTable.fieldByName('nid') + '", "field_name":"' + fileUploadTable.fieldByName('field_name') + '", "delta":"' + fileUploadTable.fieldByName('delta') + '","timestamp":"' + fileUploadTable.fieldByName('timestamp') + '"}');
                        //}
                        //else {
                        Ti.App.fireEvent("sendingData", {
                            message : 'Uploading photos. ' + count + ' to go...'
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
                }
            }
        }
        catch(ex) {
            //alert("There was an error uploading your photo. Details: ");
            Omadi.service.sendErrorReport("Exception uploading photo: " + ex);
        }
    }
};

Omadi.service.sendErrorReport = function(message) {"use strict";
    var http, uid;

    uid = Omadi.utils.getUid();
    http = Ti.Network.createHTTPClient();
    http.setTimeout(30000);
    http.open('GET', Omadi.DOMAIN_NAME + '/error.json?domain=' + Omadi.DOMAIN_NAME + '&uid=' + uid + '&message=' + message);
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

        result = db.execute("SELECT nid FROM node WHERE flag_is_updated=1");

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

        result = db.execute("UPDATE node SET flag_is_updated = 3 WHERE flag_is_updated = 1");

        alert("There was a problem packaging your data, so it has been saved as a draft.");
        Omadi.service.sendErrorReport("Exception in JSON creation: " + ex);
    }
    finally {
        try {
            db.close();
        }
        catch(nothing) {
            Ti.API.error("db would not close");
        }
    }
};


