/*global Omadi*/

Omadi.service = Omadi.service || {};

Omadi.service.setNodeViewed = function(nid) {"use strict";

    /** UPDATE the mobile database **/
    var db, http;
    db = Omadi.utils.openMainDatabase();
    db.execute("UPDATE node SET viewed = '" + Omadi.utils.getUTCTimestamp() + "' WHERE nid = " + nid);
    db.close();

    /** UPDATE the web server database **/
    http = Ti.Network.createHTTPClient();
    http.setTimeout(10000);
    http.open('POST', Omadi.DOMAIN_NAME + '/js-forms/custom_forms/viewed.json?nid=' + nid);

    Omadi.utils.setCookieHeader(http);
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
    // We don't care about the response, as this is a very trivial thing
};

Omadi.service.fetchUpdates = function(win, progress) {"use strict";
    var http, app_timestamp;
    /*global isJsonString,PLATFORM*/
    /*jslint eqeq:true*/
    try {
        
        app_timestamp = Math.round(+new Date().getTime() / 1000);
        
        Omadi.data.setUpdating(true);
        

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

        if (Omadi.data.getSyncTimestamp() === 0) {
            Ti.API.info("DOING A FULL INSALL");
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
            var nodeType, mainDB, gpsDB, dbFile, tableName, json, GMT_OFFSET, dialog, newNotificationCount;          
            
            newNotificationCount = 0;  
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
                    Ti.API.info("Reseting database, delete_all is required");
                    Ti.API.info("=================== ############ ===================");

                    //If delete_all is present, delete all contents:

                    if (PLATFORM === "android") {
                        //Remove the database
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

                mainDB.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');
                Omadi.data.setSyncTimestamp(json.request_time);

                //If Database is already last version
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

                    if (Omadi.data.getSyncTimestamp() === 0) {
                        mainDB.execute('UPDATE updated SET "url"="' + Omadi.DOMAIN_NAME + '" WHERE "rowid"=1');
                    }

                    //Ti.API.info('######### Request time : ' + json.request_time);

                    //Omadi.data.setSyncTimestamp(json.request_time);

                    //Ti.API.info("COUNT: " + json.total_item_count);

                    if ( typeof json.vehicles !== 'undefined') {
                        progress.set();
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
                    uploadFile();

                }

                mainDB.close();
                // Set the last timestamp
                Omadi.data.setSyncTimestamp(json.request_time);
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

            if (newNotificationCount > 0) {

                if (newNotificationCount > 1) {
                    dialog = Titanium.UI.createAlertDialog({
                        title : '(' + newNotificationCount + ') New Notifications',
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
                                uid : jsonLogin.user.uid,
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
                                uid : win.uid,
                                nid : newNotificationNid
                            });

                            win_new.open();
                        }
                    });

                    dialog.show();
                }

            }

            Omadi.data.setUpdating(false);
            Ti.App.fireEvent("updateUI");
        };

        //Connection error:
        http.onerror = function(e) {
            var dialog;
            
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
                    win.close();
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
                
                var message = "There was a network error, and your data could not be synched. Do you want to retry now? Error description: " + e.error;
                if(e.error.toString().indexOf("Timeout") !== -1){
                    message = "The server took too long to respond. Please check your Internet connection.";
                }
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
                                progress = null;
                                progress = new Omadi.display.ProgressBar(0, 100);
                                Omadi.service.fetchUpdates(win, progress);
                            }, 800);
                        }

                    }
                    else {
                        if (e.cancel === false) {
                            setTimeout(function() {
                                progress = null;
                                progress = new Omadi.display.ProgressBar(0, 100);
                                Omadi.service.fetchUpdates(win, progress);
                            }, 800);
                        }

                    }
                });

                dialog.show();

            }

            Omadi.data.setUpdating(false);

            Ti.API.info("Services are down");
        };

        

        if (Ti.Network.online) {
            http.send();
        }
        else {
            Ti.API.error("Not connected to the Internet.");
            Omadi.data.setUpdating(false);
        }
    }
    catch(ex) {
        alert("Fetching updates: " + ex);
    }
};

Omadi.service.sendUpdates = function(mode, _node_name, sendUpdatesCallback) {

    //showNotification();
    //Install new updates using pagination
    //Load existing data with pagination
    //function installMe(win, progress, menu, img, type_request, mode, close_parent, _node_name) {
    //var mode = 0;

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

        http.open('POST', domainName + '/js-sync/sync.json');

        //Header parameters
        http.setRequestHeader("Content-Type", "application/json");

        Omadi.utils.setCookieHeader(http);

        //When connected
        http.onload = function(e) {
            //Parses response into strings
            Ti.API.info("Onload reached - Here follows the json: ");
            //Ti.API.info(this.responseText.substr(0, 200));

            if (this.responseText != null && this.responseText != "null" && this.responseText != "" && this.responseText != "" && isJsonString(this.responseText) === true) {
                Ti.API.debug("is JSOIN");

                var tmp_json = this.responseText.replace(/'/gi, '\'');
                var json = JSON.parse(tmp_json);

                if (json.request_time && json.request_time != null && json.request_time != "") {
                    var GMT_OFFSET = Number(json.request_time - app_timestamp);
                    Ti.API.info(GMT_OFFSET + "  === " + json.request_time + " === " + app_timestamp);
                    Ti.App.Properties.setString("timestamp_offset", GMT_OFFSET);
                }

                //Terms:
                if (json.terms) {
                    var perform_term = [];

                    Ti.API.info('Terms');
                    if (json.terms.insert) {
                        if (json.terms.insert.length) {
                            var i;
                            for ( i = 0; i < json.terms.insert.length; i++) {
                                if (progress != null) {
                                    //Increment Progress Bar
                                    progress.set();
                                }

                                var vid_t = json.terms.insert[i].vid;
                                var tid_t = json.terms.insert[i].tid;
                                var name_t = json.terms.insert[i].name;
                                var desc_t = json.terms.insert[i].description;
                                var weight_t = json.terms.insert[i].weight;

                                if (desc_t == null)
                                    desc_t = "";
                                if (name_t == null)
                                    name_t = "";
                                if (weight_t == null)
                                    weight_t = "";

                                perform_term[perform_term.length] = 'INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid_t + ',' + vid_t + ',"' + name_t + '","' + desc_t + '","' + weight_t + '")';

                                perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms.insert[i].__negative_tid;

                            }
                        }
                        else {
                            if (progress != null) {
                                //Increment Progress Bar
                                progress.set();
                            }

                            var vid_t = json.terms.insert.vid;
                            var tid_t = json.terms.insert.tid;
                            var name_t = json.terms.insert.name;
                            var desc_t = json.terms.insert.description;
                            var weight_t = json.terms.insert.weight;

                            if (desc_t == null)
                                desc_t = "";
                            if (name_t == null)
                                name_t = "";
                            if (weight_t == null)
                                weight_t = "";

                            perform_term[perform_term.length] = 'INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid_t + ',' + vid_t + ',"' + name_t + '","' + desc_t + '","' + weight_t + '")';

                            perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms.insert.__negative_tid;

                        }

                    }
                    if (json.terms.update) {
                        if (json.terms.update.length) {
                            var i;
                            for ( i = 0; i < json.terms.update.length; i++) {

                                if (progress != null) {
                                    //Increment Progress Bar
                                    progress.set();
                                }
                                perform_term[perform_term.length] = 'UPDATE term_data SET "name"="' + json.terms.update[i].name + '", "description"="' + json.terms.update[i].description + '",  "weight"="' + json.terms.update[i].weight + '", "vid"=' + json.terms.update[i].vid + '  WHERE "tid"=' + json.terms.update[i].tid;
                            }
                        }
                        else {
                            if (progress != null) {
                                //Increment Progress Bar
                                progress.set();
                            }

                            perform_term[perform_term.length] = 'UPDATE term_data SET "name"="' + json.terms.update.name + '", "description"="' + json.terms.update.description + '",  "weight"="' + json.terms.update.weight + '", "vid"=' + json.terms.update.vid + '  WHERE "tid"=' + json.terms.update.tid;
                        }
                    }
                    if (json.terms["delete"]) {
                        if (json.terms["delete"].length) {
                            var i;
                            for ( i = 0; i < json.terms["delete"].length; i++) {
                                if (progress != null) {
                                    //Increment Progress Bar
                                    progress.set();
                                }
                                perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms["delete"][i].tid;
                            }
                        }
                        else {
                            if (progress != null) {
                                //Increment Progress Bar
                                progress.set();
                            }
                            perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms["delete"].tid;
                        }
                    }

                    if (perform_term.length > 0) {
                        var iTerm = 0;

                        var iStart = Math.round(new Date().getTime() / 1000);
                        Ti.API.info("Term started at : " + iStart);

                        db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
                        while (iTerm <= perform_term.length - 1) {
                            db_installMe.execute(perform_term[iTerm]);
                            iTerm++;
                        }
                        db_installMe.execute("COMMIT TRANSACTION");

                        var iEnd = Math.round(new Date().getTime() / 1000);
                        Ti.API.info("Term finishes at : " + iEnd);

                        var iResult = iEnd - iStart;
                        Ti.API.info('Term seconds: ' + iResult);
                        Ti.API.info('Terms were succefully installed');
                    }

                }

                // Adds new itemns to menu and also processes each object
                var callback;
                var db_installMe = Omadi.utils.openMainDatabase();
                var n_bund = db_installMe.execute('SELECT * FROM bundles');

                var count_t = 0;
                var data_rows = [];
                Titanium.App.Properties.setString("new_node_id", null);

                while (n_bund.isValidRow()) {

                    var name_table = n_bund.fieldByName("bundle_name");
                    Ti.API.debug(name_table);
                    //try{
                    if ((json.node) && (json.node[name_table])) {
                        Ti.API.info('##### Called ' + name_table);
                        //callback = process_object(json.node, name_table, quotes, progress, type_request, db_installMe);

                        Omadi.data.processNodeJson(json.node, name_table, db_installMe, null);
                    }

                    n_bund.next();
                    //  }
                    //catch(evt){
                    //}

                }
                n_bund.close();

                db_installMe.close();
                //var d = new Date();
                // Titanium.App.Properties.setDouble("lastSynced", d.getTime());

                //Ti.API.info("about to update file upload table");
                //updateFileUploadTable(json);

                // try {
                // if (json.total_item_count != 0) {
                // //close_parent(false);
                //
                // var db_fileUpload = Omadi.utils.openMainDatabase();
                //
                // // To replace all negative nid to positive in file_upload_queue table
                // var bundles = db_fileUpload.execute('SELECT * FROM bundles;');
                // while (bundles.isValidRow()) {
                // var name_table = bundles.fieldByName("bundle_name");
                // if (json.node && json.node[name_table]) {
                // if (json.node[name_table].insert) {
                // for ( i = 0; i < json.node[name_table].insert.length; i++) {
                // var insertedNode = json.node[name_table].insert[i];
                // if (insertedNode.__negative_nid) {
                // db_fileUpload.execute("UPDATE file_upload_queue SET nid =" + insertedNode.nid + " WHERE nid=" + insertedNode.__negative_nid);
                // }
                // }
                // }
                // }
                // bundles.next();
                // }
                // bundles.close();
                // db_fileUpload.close();
                // }
                // }
                // catch(evt) {
                // Ti.API.error("Setting upload database: " + evt);
                // }

                //Ti.API.info("updated file upload table");
                if (mode == 1) {
                    if (PLATFORM == 'android') {
                        Ti.UI.createNotification({
                            message : 'The ' + _node_name + ' was updated successfully',
                            duration : Ti.UI.NOTIFICATION_DURATION_LONG
                        }).show();
                    }
                    else {
                        alert('The ' + _node_name + ' was updated successfully');
                    }
                    //Just to make sure database keeps locked

                    //close_parent(false);
                    //uploadFile(win);

                }
                else if (mode == 0) {
                    if (PLATFORM === 'android') {
                        Ti.UI.createNotification({
                            message : 'The ' + _node_name + ' was created successfully.',
                            duration : Ti.UI.NOTIFICATION_DURATION_LONG
                        }).show();
                    }
                    else {
                        alert('The ' + _node_name + ' was created successfully.');
                    }
                    //Just to make sure database keeps locked

                    //close_parent(false);
                    //uploadFile(win);
                }

            }
            else {

                Titanium.Media.vibrate();

                var a_msg = Titanium.UI.createAlertDialog({
                    title : 'Omadi',
                    buttonNames : ['OK']
                });

                a_msg.message = "We are sorry, but the server has diconnected you. Please login again.";
                a_msg.show();

                a_msg.addEventListener('click', function(e) {
                    //Omadi.data.setUpdating(false)

                    Ti.App.Properties.setString('logStatus', "The server logged you out");
                    Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
                    Omadi.service.logout();
                });
            }

            Ti.API.debug("at the bottom after sync has returned");
            if ( typeof sendUpdatesCallback != 'undefined') {
                sendUpdatesCallback();
            }

            // if (newNotificationCount > 0) {
            //
            // if (newNotificationCount > 1) {
            // var newNotificationsAlert = Titanium.UI.createAlertDialog({
            // title : '(' + newNotificationCount + ') New Notifications',
            // message : 'View the notification list?',
            // buttonNames : ['Take Me There', 'View Later'],
            // cancel : 1
            // });
            //
            // newNotificationsAlert.addEventListener('click', function(e) {
            // if (e.index !== e.source.cancel) {
            // var win_new = Titanium.UI.createWindow({
            // navBarHidden : true,
            // title : 'Notifications',
            // fullscreen : false,
            // url : 'objects.js',
            // type : 'notification',
            // uid : jsonLogin.user.uid,
            // backgroundColor : '#EEEEEE',
            // show_plus : false
            // });
            //
            // win_new.open();
            // }
            // });
            //
            // newNotificationsAlert.show();
            // }
            // else {
            // var newNotificationsAlert = Titanium.UI.createAlertDialog({
            // title : 'New Notification',
            // message : 'Read the notification now?',
            // buttonNames : ['Read Now', 'Read Later'],
            // cancel : 1
            // });
            //
            // newNotificationsAlert.addEventListener('click', function(e) {
            // if (e.index !== e.source.cancel) {
            // var win_new = Titanium.UI.createWindow({
            // fullscreen : false,
            // navBarHidden : true,
            // title : 'Read Notification',
            // type : 'notification',
            // url : 'individual_object.js',
            // uid : win.uid,
            // nid : newNotificationNid
            // });
            //
            // win_new.open();
            // }
            // });
            //
            // newNotificationsAlert.show();
            // }
            //
            // }

            Ti.App.Properties.setBool("isSendingData", false);

        };

        //Connection error:
        http.onerror = function(e) {
            Ti.API.error('Code status: ' + e.error);
            Ti.API.error('CODE ERROR = ' + this.status);
            //Ti.API.info("Progress bar = " + progress);

            if (progress != null) {
                progress.close();
            }

            Titanium.Media.vibrate();

            if (this.status == 403) {
                var a_msg = Titanium.UI.createAlertDialog({
                    title : 'Omadi',
                    buttonNames : ['OK']
                });

                a_msg.message = "You have been logged out. Please log back in."
                a_msg.addEventListener('click', function(e) {
                    var db_func = Omadi.utils.openListDatabase();
                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                    db_func.close();
                    win.close();
                });

                Omadi.service.logout();
                a_msg.show();
            }
            else if (this.status == 401) {
                var a_msg = Titanium.UI.createAlertDialog({
                    title : 'Omadi',
                    buttonNames : ['OK']
                });

                a_msg.message = "Your session is no longer valid. Please log back in.";
                a_msg.addEventListener('click', function(e) {

                    var db_func = Omadi.utils.openListDatabase();
                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                    db_func.close();

                });

                Omadi.service.logout();
                a_msg.show();
            }
            // else if (progress != null) {
            // var a_msg = Titanium.UI.createAlertDialog({
            // title : 'Omadi',
            // buttonNames : ['Yes', 'No'],
            // cancel : 1,
            // click_index : e.index,
            // sec_obj : e.section,
            // row_obj : e.row
            // });
            // a_msg.message = "There was a network error, and your data could not be synched. Do you want to retry now? Error description: " + e.error;
            //
            // a_msg.addEventListener('click', function(e) {
            // if (PLATFORM == "android") {
            // if (e.index != 1) {
            // setTimeout(function() {
            // progress = null;
            // progress = new Omadi.display.ProgressBar(0, 100);
            // installMe(win, progress, menu, img, type_request, mode, close_parent);
            // }, 800);
            // }
            // else {
            //
            // Omadi.data.setUpdating(false)
            // }
            // }
            // else {
            // if (e.cancel === false) {
            // setTimeout(function() {
            // progress = null;
            // progress = new Omadi.display.ProgressBar(0, 100);
            // installMe(win, progress, menu, img, type_request, mode, close_parent);
            // }, 800);
            // }
            // else {
            //
            // Omadi.data.setUpdating(false)
            // }
            // }
            // });
            //
            // a_msg.show();
            //
            // }

            //Ti.API.info('Request type: ' + type_request + ' progress value: ' + progress);
            // if ((type_request == 'POST') && (progress != null)) {
            // if (PLATFORM == 'android') {
            // Ti.UI.createNotification({
            // //message : 'Connection timed out, please try again',
            // message : 'Error :: ' + e.error, //Change message for testing purpose
            // duration : Ti.UI.NOTIFICATION_DURATION_LONG
            // }).show();
            // }
            // else {
            // //alert('Connection timed out, please try again');
            // alert('Error :: ' + e.error);
            // //Change message for testing purpose
            // }
            // }
            //else
            if (mode == 0) {
                if (PLATFORM == 'android') {
                    Ti.UI.createNotification({
                        //message : 'An error happened while we tried to connect to the server in order to transfer the recently updated node, please make a manual update',
                        message : 'Error :: ' + e.error, //Change message for testing purpose
                        duration : Ti.UI.NOTIFICATION_DURATION_LONG
                    }).show();
                }
                else {
                    //alert('An error happened while we tried to connect to the server in order to transfer the recently updated node, please make a manual update');
                    alert('Error :: ' + e.error);
                    //Change message for testing purpose
                }
                close_parent(true);
            }
            else if (mode == 1) {
                if (PLATFORM == 'android') {
                    Ti.UI.createNotification({
                        //message : 'An error happened while we tried to connect to the server in order to transfer the recently saved node, please make a manual update',
                        message : 'Error :: ' + e.error, //Change message for testing purpose
                        duration : Ti.UI.NOTIFICATION_DURATION_LONG
                    }).show();
                }
                else {
                    //alert('An error happened while we tried to connect to the server in order to transfer the recently saved node, please make a manual update');
                    alert('Error :: ' + e.error);
                    //Change message for testing purpose
                }
                close_parent(true);
            }

            db_installMe.close();

            Ti.App.Properties.setBool("isSendingData", false);

            Ti.API.info("Services are down");

            if ( typeof sendUpdatesCallback != 'undefined') {
                sendUpdatesCallback("There was a problem synching your data to the Internet, but your data is saved in the mobile app and will be synched when problems with Omadi services have been resolved.");
            }
        };

        app_timestamp = Math.round(+new Date().getTime() / 1000);
        Ti.API.info('App Time: ' + app_timestamp);

        var insert_JSON = getJSON();
        // while (Titanium.Network.online === false) {
        // // blank
        // // TODO: fix this
        // };

        if (Ti.Network.online) {
            http.send(insert_JSON);
        }
        else {
            Ti.App.Properties.setBool("isSendingData", false);
        }
    }
};

Omadi.service.logout = function() { "use strict";
    
    var http;
    /*jslint eqeq: true*/
   
    Ti.App.fireEvent('upload_gps_locations');
    Ti.App.fireEvent('stop_gps');
    Ti.App.fireEvent('free_login');

    Omadi.display.showLoadingIndicator("Logging you out...");

    http = Ti.Network.createHTTPClient();

    http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync/logout.json');

    //Timeout until error:
    http.setTimeout(10000);

    //Header parameters
    http.setRequestHeader("Content-Type", "application/json");
    Omadi.utils.setCookieHeader(http);

    http.onload = function(e) {
        var db;
        Ti.App.Properties.setString('logStatus', "You have successfully logged out");
        //Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));

        Ti.UI.currentWindow.close();

        db = Omadi.utils.openListDatabase();
        db.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
        db.close();

        //indLog._parent.close();
        Omadi.display.hideLoadingIndicator();
        //indLog.close();
        Omadi.display.removeNotifications();
    };

    http.onerror = function(e) {
        Omadi.display.hideLoadingIndicator();

        if (this.status == 403 || this.status == 401) {
            Ti.App.Properties.setString('logStatus', "You are logged out");

            var db = Omadi.utils.openListDatabase();
            db.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
            db.close();

            //indLog._parent.close();
            Omadi.display.hideLoadingIndicator();
            //indLog.close();
        }
        else {
            Ti.API.info("Failed to log out");
            //alert("Failed to log out, please try again");
        }

        Ti.UI.currentWindow.close();
        Omadi.display.removeNotifications();
    };

    http.send();

    Ti.App.Properties.setBool("stopGPS", true);
    Ti.App.Properties.setBool("quitApp", true);
};



