/*global Omadi,dbEsc*/
/*jslint eqeq:true,plusplus:true*/

var Comments = require('services/Comments');
var Utils = require('lib/Utils');

Omadi.service = Omadi.service || {};

Omadi.service.fetchedJSON = null;
Omadi.service.initialSyncProgressBar = null;
Omadi.service.fetchUpdatesProgressBar = null;

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

                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false
                });
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
                                try{
                                    var db_func = Omadi.utils.openListDatabase();
                                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                    db_func.close();
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception in logged out 403: " + ex);
                                }
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
                                try{
                                    var db_func = Omadi.utils.openListDatabase();
                                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                    db_func.close();
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception in logged out 401: " + ex);
                                }
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
    http = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        validatesSecureCertificate: false
    });
    http.setTimeout(10000);
    http.open('POST', Omadi.DOMAIN_NAME + '/js-forms/custom_forms/viewed.json?nid=' + nid);

    Omadi.utils.setCookieHeader(http);
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
    // We don't care about the response, as this is a very trivial thing
};

Omadi.service.initialInstallPage = 0;
Omadi.service.isInitialInstall = false;
Omadi.service.initialInstallTotalPages = 0;

Omadi.service.syncInitialFormItems = function(nodeCount, commentCount, numPages){"use strict";
    var http, syncURL, i, max, count;
    
    try{
        Ti.API.error("in initial form items");
        
        count = nodeCount + commentCount;
        
        max = count + (numPages * 100);
        
        Omadi.service.initialSyncProgressBar = new Omadi.display.DefaultProgressBar(max, 'Syncing ' + count + ' form items ...');
        
        Ti.API.debug("Syncing initial form items: " + count);
        
        Omadi.service.initialInstallPage = 0;
        Omadi.service.initialInstallTotalPages = numPages;
        Omadi.service.isInitialInstall = true;
        
        // Make sure any incremental syncs do not interfere
        Omadi.data.setUpdating(true);
        
        Ti.App.removeEventListener('omadi:initialInstallDownloadComplete', Omadi.service.syncInitialInstallDownloadNextPage); 
        Ti.App.addEventListener('omadi:initialInstallDownloadComplete', Omadi.service.syncInitialInstallDownloadNextPage);      
           
        Ti.App.removeEventListener('omadi:initialInstallDownloadRetry', Omadi.service.syncInitialInstallDownloadRetry); 
        Ti.App.addEventListener('omadi:initialInstallDownloadRetry', Omadi.service.syncInitialInstallDownloadRetry);  
        
        Omadi.service.syncInitialInstallDownloadNextPage();
    }
    catch(ex1){
    	Omadi.data.setUpdating(false);
        Utils.sendErrorReport("Exception in paging retrieval setup: " + ex1);    
    }
};

Omadi.service.syncInitialInstallRetryCount = 0;
Omadi.service.syncInitialInstallDownloadNextPage = function(){"use strict";
    Omadi.service.initialInstallPage ++;
    Omadi.service.syncInitialInstallRetryCount = 0;
    
    Omadi.data.setUpdating(true);
    
    if(Omadi.service.initialInstallPage < Omadi.service.initialInstallTotalPages){
    	
        // Make sure the update timestamp is 0 because the sync is not complete    
        Ti.API.debug("About to sync page " + Omadi.service.initialInstallPage);
        Omadi.data.setLastUpdateTimestamp(0);
        Omadi.service.syncInitialFormPage(Omadi.service.initialInstallPage);   
    }
    else{
        Omadi.data.setUpdating(false);
        
        if(Omadi.service.initialSyncProgressBar !== null){
            Omadi.service.initialSyncProgressBar.close();
        }
        
        Ti.API.error("NOW DO AN INCREMENTAL SYNC");
        
        Ti.API.error("last sync: " + Omadi.data.getLastUpdateTimestamp());
        
        Omadi.service.fetchUpdates(true, true);
    }
};

Omadi.service.syncInitialInstallDownloadRetry = function(){"use strict";
    
    Omadi.service.syncInitialInstallRetryCount ++;
    
    if(Omadi.service.syncInitialInstallRetryCount <= 5){
        // Make sure the update timestamp is 0 because the sync is not complete
        Omadi.data.setLastUpdateTimestamp(0);
        
        if(Omadi.service.initialInstallPage < Omadi.service.initialInstallTotalPages){
            // Wait 5 seconds before retrying again
            setTimeout(function(){
                Omadi.service.syncInitialFormPage(Omadi.service.initialInstallPage);       
            }, 5000);
        }
        else{
            Utils.sendErrorReport("in else in syncInitialInstallDownloadRetry: page=" + Omadi.service.initialInstallPage + ', total=' + Omadi.service.initialInstallTotalPages);
            
            if(Omadi.service.initialSyncProgressBar !== null){
                Omadi.service.initialSyncProgressBar.close();
                Omadi.service.initialSyncProgressBar = null;
            }
        }
    }
    else{
        Omadi.data.setLastUpdateTimestamp(0);
        
        alert("A problem occurred syncing the initial form entries. Please logout and try again.");
        Utils.sendErrorReport("Too many retries in the initial install");
    }
};

Omadi.service.processInitialInstallJSON = function(){"use strict";
    var tableName, mainDB;
    // This is only done for the initial install
    // All other objects except for the nodes are installed previous to this
    // We only care about the nodes here
    try{
        mainDB = Omadi.utils.openMainDatabase();
        
        Ti.API.debug("About to do a node initial install");
        
        if (typeof Omadi.service.fetchedJSON.node !== 'undefined') {
            Ti.API.debug("Installing nodes");
            for (tableName in Omadi.service.fetchedJSON.node) {
                if (Omadi.service.fetchedJSON.node.hasOwnProperty(tableName)) {
                    if (Omadi.service.fetchedJSON.node.hasOwnProperty(tableName)) {
                        Omadi.data.processNodeJson(tableName, mainDB);
                    }
                }
            }
        }
        
        if (typeof Omadi.service.fetchedJSON.comment !== 'undefined') {
            Ti.API.debug("Installing comments");
            Omadi.data.processCommentJson(mainDB);
        }
        
        Ti.API.debug("about to set request_time");
        
        // Setup the last update timestamp to the correct timestamp in case this is the last synced node bunch
        if(typeof Omadi.service.fetchedJSON.request_time !== 'undefined'){
            Omadi.data.setLastUpdateTimestamp(Omadi.service.fetchedJSON.request_time);
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception in processInitialInstallJSON: " + ex);
    }
    finally{
        try{
            mainDB.close();
        }
        catch(ex1){}
    }
};

Omadi.service.syncInitialLastProgress = 0;
Omadi.service.syncInitialFormPage = function(page){"use strict";
    var http, syncURL;
    
    Ti.API.error("syncing for page " + page);
    
    try{
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false,
            timeout: 30000
        });
        
        Omadi.service.syncInitialLastProgress = 0;
        
        // While streaming - following method should be called before open URL
        http.ondatastream = function(e) {
            Omadi.service.initialSyncProgressBar.add((e.progress - Omadi.service.syncInitialLastProgress) * 100);
            Omadi.service.syncInitialLastProgress = e.progress;
        };
        
        syncURL = Omadi.DOMAIN_NAME + '/js-sync/download.json?sync_timestamp=0&page=' + page;
        
        http.open('GET', syncURL);
    
        //Header parameters
        http.setRequestHeader("Content-Type", "application/json");
    
        Omadi.utils.setCookieHeader(http);
    
        //When connected
        http.onload = function(e) {
            var dir, file, string;
            
            try{
                Ti.API.debug("Initial Sync data loaded");
                
                //Ti.API.debug("text: " + (this.responseText !== null));
                //Ti.API.debug("data: " + (this.responseData !== null));
                if (typeof this.responseText !== 'undefined' && this.responseText !== null){
                    Ti.API.debug("JSON String Length 1: " + this.responseText.length);
                }
                
                if (typeof this.responseData !== 'undefined' && this.responseData !== null){
                    Ti.API.debug("JSON String Length 2: " + this.responseData.length);
                }
                
                Ti.API.debug("another sync message");
                //Parses response into strings
                if (typeof this.responseText !== 'undefined' && this.responseText !== null && isJsonString(this.responseText) === true) {
        
                    //Ti.API.info(this.responseText.substring(0, 3000));
                    
                    Ti.API.debug("JSON String Length: " + this.responseText.length);
                    Omadi.service.fetchedJSON = null;
                    
                    if(Ti.App.isAndroid && typeof AndroidSysUtil !== 'undefined' && AndroidSysUtil != null){
                        AndroidSysUtil.OptimiseMemory();
                    }
                    
                    Omadi.service.fetchedJSON = JSON.parse(this.responseText);
                    
                    // Free the memory
                    this.responseText = null;
                    
                    Omadi.service.processInitialInstallJSON();
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
                        
                        file = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory + "/download_" + Omadi.utils.getUTCTimestamp() + ".txt");
                        
                        if(file.write(this.responseData)){
                           
                           string = file.read();
                           
                           if(isJsonString(string.text)){
                                
                                Omadi.service.fetchedJSON = null;
                                if(Ti.App.isAndroid && typeof AndroidSysUtil !== 'undefined' && AndroidSysUtil != null){
                                    AndroidSysUtil.OptimiseMemory();
                                }
                    
                                Omadi.service.fetchedJSON = JSON.parse(string.text);
                                
                                // Free the memory
                                string = null;
                                
                                Omadi.service.processInitialInstallJSON();
                            }
                            else{
                                Utils.sendErrorReport("Text is not json");
                                if (Omadi.service.initialSyncProgressBar !== null) {
                                    Omadi.service.initialSyncProgressBar.close();
                                    Omadi.service.initialSyncProgressBar = null;
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
            
            Omadi.service.fetchedJSON = null;
        };
    
        //Connection error:
        http.onerror = function(e) {
            var dialog, message, errorDescription;
            
            Ti.API.error('Code status: ' + e.error);
            Ti.API.error('CODE ERROR = ' + this.status);
            //Ti.API.info("Progress bar = " + progress);
    
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
                            var db_func = Omadi.utils.openListDatabase();
                            db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                            db_func.close();
                        }
                        catch(ex){
                            Utils.sendErrorReport("exception in logged out update 403: " + ex);
                        }
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
                        try{
                            var db_func = Omadi.utils.openListDatabase();
                            db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                            db_func.close();
                        }
                        catch(ex){
                            Utils.sendErrorReport("exception in logged out update 401: " + ex);
                        }
                    });
    
                    dialog.show();
                    
                    Omadi.service.logout();
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
                
                if(Omadi.data.getLastUpdateTimestamp() <= 1 || this.userInitiated){
                    
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
                                Omadi.service.fetchUpdates(true);
                            }, 300);
                        }
                    });
    
                    dialog.show();
                }
                
                Ti.App.fireEvent('omadi:initialInstallDownloadRetry');
            }
            
            Omadi.service.fetchedJSON = null;
        };
    
        http.send();
        
    }
    catch(ex1){
        Utils.sendErrorReport("Exception in paging retrieval: " + ex1);    
    }
};

Omadi.service.fetchUpdates = function(useProgressBar, userInitiated) {"use strict";
    var http, progress = null, lastSyncTimestamp, timeout, syncURL;
    /*global isJsonString*/
    /*jslint eqeq:true*/
    try {
        
        if(typeof useProgressBar === 'undefined'){
            useProgressBar = false;
        }
        
        if(typeof userInitiated === 'undefined'){
            userInitiated = false;
        }
		
		if (!Omadi.data.isUpdating()) {

            if (Ti.Network.online) {
                Omadi.data.setUpdating(true);

                if (useProgressBar) {
                    Omadi.service.fetchUpdatesProgressBar = new Omadi.display.ProgressBar(0, 100);
                }

                lastSyncTimestamp = Omadi.data.getLastUpdateTimestamp();

                timeout = 30000;

                //Timeout until error:
                if(lastSyncTimestamp <= 1){
                    // Allow extra time for the initial downloads
                    timeout = 90000; 
                    Omadi.service.isInitialInstall = true;
                }
                
                http = Ti.Network.createHTTPClient({
                    enableKeepAlive: false,
                    validatesSecureCertificate: false,
                    userInitiated: userInitiated,
                    timeout: timeout
                });

                //While streamming - following method should be called b4 open URL
                http.ondatastream = function(e) {
                    //ind.value = e.progress ;
                    if (Omadi.service.fetchUpdatesProgressBar !== null) {
                        Omadi.service.fetchUpdatesProgressBar.set_download(e.progress);
                        //Ti.API.debug(' ONDATASTREAM1 - PROGRESS: ' + e.progress);
                    }
                };
                
                http.onreadystatechange = function(e){
                    if(this.readyState == this.LOADING){
                        if(Omadi.service.fetchUpdatesProgressBar !== null){
                            Omadi.service.fetchUpdatesProgressBar.setMessage('Downloading...');
                        }
                    }
                };
                
                Ti.API.debug("lastSynctimestamp: " + lastSyncTimestamp);
                
                syncURL = Omadi.DOMAIN_NAME + '/js-sync/download.json?sync_timestamp=' + lastSyncTimestamp;
                if(lastSyncTimestamp <= 1){
                    syncURL += '&page=' + Omadi.service.initialInstallPage;    
                }
                
                http.open('GET', syncURL);

                //Header parameters
                http.setRequestHeader("Content-Type", "application/json");

                Omadi.utils.setCookieHeader(http);

                //When connected
                http.onload = function(e) {
                    var dir, file, string;
                    
                    try{
                        Ti.API.debug("Sync data loaded");
                        
                        //Ti.API.debug("text: " + (this.responseText !== null));
                        //Ti.API.debug("data: " + (this.responseData !== null));
                        //if (typeof this.responseText !== 'undefined' && this.responseText !== null){
                            //Ti.API.debug("JSON String Length 1: " + this.responseText.length);
                        //}
                        
                        //if (typeof this.responseData !== 'undefined' && this.responseData !== null){
                            //Ti.API.debug("JSON String Length 2: " + this.responseData.length);
                        //}
                        
                        Ti.API.debug("another sync message");
                        //Parses response into strings
                        if (typeof this.responseText !== 'undefined' && this.responseText !== null && isJsonString(this.responseText) === true) {
                
                            //Ti.API.info(this.responseText.substring(0, 3000));
                            
                            Ti.API.debug("JSON String Length: " + this.responseText.length);
                            
                            Omadi.service.fetchedJSON = null;
                            Omadi.service.fetchedJSON = JSON.parse(this.responseText);
                            
                            // Free the memory
                            this.responseText = null;
                            
                            Omadi.data.processFetchedJson();
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
                                
                                file = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory + "/download_" + Omadi.utils.getUTCTimestamp() + ".txt");
                                
                                Ti.API.debug("Got here 1");
                                
                                if(file.write(this.responseData)){
                                   Ti.API.debug("Got here 2");
                                   string = file.read();
                                   
                                   if(isJsonString(string.text)){
                                        Ti.API.debug("Is JSON");
                                        
                                        Omadi.service.fetchedJSON = null;
                                        Omadi.service.fetchedJSON = JSON.parse(string.text);
                                        
                                        // Free the memory
                                        string = null;
                                        
                                        Omadi.data.processFetchedJson();
                                    }
                                    else{
                                        Utils.sendErrorReport("Text is not json");
                                        if (Omadi.service.fetchUpdatesProgressBar !== null) {
                                            Omadi.service.fetchUpdatesProgressBar.close();
                                            Omadi.service.fetchUpdatesProgressBar = null;
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
                            if (Omadi.service.fetchUpdatesProgressBar !== null) {
                                Omadi.service.fetchUpdatesProgressBar.close();
                                Omadi.service.fetchUpdatesProgressBar = null;
                            }
                
                            Utils.sendErrorReport("Bad response text and data for download: " + this.responseText + ", stautus: " + this.status + ", statusText: " + this.statusText);
                        }               
                    }
                    catch(ex1){
                        Utils.sendErrorReport("Exception in saving sync data onsuccess: " + ex1);
                    }
                    
                    Omadi.data.setUpdating(false);
                    
                    Omadi.service.fetchedJSON = null;
                    
                    if(lastSyncTimestamp > 1){
                        Ti.App.fireEvent('omadi:finishedDataSync');
                        Omadi.service.uploadFile();
                    }
                };

                //Connection error:
                http.onerror = function(e) {
                    var dialog, message, errorDescription;
                    
                    Ti.App.fireEvent('omadi:finishedDataSync');
                    
                    Ti.API.error('Code status: ' + e.error);
                    Ti.API.error('CODE ERROR = ' + this.status);
                    //Ti.API.info("Progress bar = " + progress);

                    if (Omadi.service.fetchUpdatesProgressBar !== null) {
                        Omadi.service.fetchUpdatesProgressBar.close();
                        Omadi.service.fetchUpdatesProgressBar = null;
                    }

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
                                    var db_func = Omadi.utils.openListDatabase();
                                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                    db_func.close();
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception in logged out update 403: " + ex);
                                }
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
                                try{
                                    var db_func = Omadi.utils.openListDatabase();
                                    db_func.execute('UPDATE login SET picked = "null", login_json = "null", is_logged = "false", cookie = "null" WHERE "id_log"=1');
                                    db_func.close();
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception in logged out update 401: " + ex);
                                }
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
                        
                        if(Omadi.data.getLastUpdateTimestamp() <= 1 || this.userInitiated){
                            
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
                                        Omadi.service.fetchUpdates(true);
                                    }, 300);
                                }
                            });
    
                            dialog.show();
                        }
                    }

                    Omadi.data.setUpdating(false);
                    
                    Omadi.service.fetchedJSON = null;
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
        isSendingData = (result.fieldByName('is_sending_data', Ti.Database.FIELD_TYPE_INT) === 1);
    }
    result.close();
    db.close();
    
    return isSendingData;
};

Omadi.service.sendDataOnLoad = function(e){"use strict";
    var subDB, dialog, json, nameTable, dir, file, string;
                
    Omadi.display.doneLoading();
    
    try{
        if (this.responseText !== null && this.responseText !== "null" && this.responseText !== "" && this.responseText !== "" && isJsonString(this.responseText) === true) {
    
            Omadi.service.fetchedJSON = JSON.parse(this.responseText);
                
            // Free the memory (probably doesn't actually do anything)
            this.responseText = null;
            
            Omadi.data.processFetchedJson();
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
                
                file = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory + "/download_" + Omadi.utils.getUTCTimestamp() + ".txt");
                
                if(file.write(this.responseData)){
                   
                   string = file.read();
                   
                   if(isJsonString(string.text)){
                        Ti.API.debug("Is JSON");
                        
                        Omadi.service.fetchedJSON = JSON.parse(string.text);
                        
                        // Free the memory
                        string = null;
                        
                        Omadi.data.processFetchedJson();
                    }
                    else{
                        Utils.sendErrorReport("Text is not json");
                        if (Omadi.service.fetchUpdatesProgressBar !== null) {
                            Omadi.service.fetchUpdatesProgressBar.close();
                            Omadi.service.fetchUpdatesProgressBar = null;
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
                    //Ti.API.info('From Functions ... Value is : ' + Ti.App.Properties.getString('logStatus'));
                    Omadi.service.logout();
                }
                catch(ex){
                    Utils.sendErrorReport("exception on logstatus logout: " + ex);
                }
            });
        }
        
        Omadi.service.setSendingData(false);
        
        Ti.App.fireEvent("doneSendingData");
    }
    catch(ex1){
        Utils.sendErrorReport("Exception in update data onload: " + ex1);
    }
};

Omadi.service.sendDataOnError = function(e){"use strict";
    var dialog, db;
    try{
        
        Omadi.display.doneLoading();
        
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
    
                Omadi.service.logout();
            }
        }
        else if (this.status == 500) {
    
            // TODO: fix this so it only changes the flag_is_updated for the nid that had the problem
            // Possible fix is to limit sending only one node at a time
            
            // Set the node as a draft
            db = Omadi.utils.openMainDatabase();
            // This is only being set for brand new nodes
            db.execute("UPDATE node SET flag_is_updated = 3 WHERE nid < 0");
            db.close();
            
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
        
        Omadi.service.setSendingData(false);
        Ti.App.fireEvent("doneSendingData");
    }
    catch(ex){
        Utils.sendErrorReport("Exception with update data onerror callback: " + ex);
    }
};



Omadi.service.sendUpdateRetries = 0;
Omadi.service.lastSendUpdates = 0;
Omadi.service.sendUpdates = function() {"use strict";
    /*jslint eqeq: true*/
    var isSendingData, http, secondsLeft, origAppStartMillis, currentWinStartMillis, windowURL, timestamp;
    
    // Remove the activity if the appStartMillis don't match the current runtime
    // This may come up when the app crashes, and this function is called multiple times
    // for all the open activities, but it should only be called once
    if(typeof Ti.UI.currentWindow.appStartMillis !== 'undefined'){
        origAppStartMillis = Ti.App.Properties.getDouble('omadi:appStartMillis', 0);
        currentWinStartMillis = parseInt(Ti.UI.currentWindow.appStartMillis, 10);
        
        if(isNaN(origAppStartMillis) || isNaN(currentWinStartMillis)){
            Ti.API.error("start millis is NaN: " + currentWinStartMillis + " - " + origAppStartMillis);
            Utils.sendErrorReport("start millis is NaN: " + currentWinStartMillis + " - " + origAppStartMillis);
        }
        else{
            if(origAppStartMillis == 0 || currentWinStartMillis == 0){
                Ti.API.error("AppStartMillis upload was zero: " + origAppStartMillis + " - " + currentWinStartMillis);
                Utils.sendErrorReport("AppStartMillis upload was zero: " + origAppStartMillis + " - " + currentWinStartMillis);
            }
            else{
                if(origAppStartMillis != Ti.UI.currentWindow.appStartMillis){
                    if(Ti.App.isAndroid){
                        //Utils.sendErrorReport("An extra android upload activity was REJECTED, background: " + isBackground + " : "  + Ti.UI.currentWindow.appStartMillis + " - " + origAppStartMillis);
                        return;
                        //Ti.Android.currentActivity.finish();
                    }
                    //else{
                        Utils.sendErrorReport("An extra iOS send update event is being REJECTED: " + Ti.UI.currentWindow.appStartMillis + " - " + origAppStartMillis);
                        return;
                    //}
                }
            }
        }
    }
    else{
        
        windowURL = "";
        if(typeof Ti.UI.currentWindow.url !== 'undefined'){
            windowURL = Ti.UI.currentWindow.url;
        }
        Utils.sendErrorReport("AppStartMillis upload was undefined, url: " + windowURL);
    }
    
    Ti.API.error("Sending Data Now");
    timestamp = Omadi.utils.getUTCTimestamp();
    
    if((timestamp - Omadi.service.lastSendUpdates) < 2){
        // Do not send updates within 2 seconds of each other
        Ti.API.error("Not allowing data send - too soon after previous send.");
        return;
    }
    
    Omadi.service.lastSendUpdates = timestamp;

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
                Omadi.service.sendUpdateRetries = 0;
                isSendingData = Omadi.service.setSendingData(false);
                Omadi.service.sendUpdates();
            }
            Omadi.service.sendUpdateRetries ++;
        }
        else{
            
            Omadi.service.setSendingData(true);
            
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 15000
            });
            
            http.open('POST', Omadi.DOMAIN_NAME + '/js-sync/sync.json');

            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
            
            http.onload = Omadi.service.sendDataOnLoad;
            http.onerror = Omadi.service.sendDataOnError;
            
            http.send(Omadi.service.getUpdatedNodeJSON());
            
            Ti.App.fireEvent("sendingData", {
                message : 'Saving data to server...'
            });
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
    }
    
    Omadi.service.sendLogoutRequest();
};

Omadi.service.doPostLogoutOperations = function(){"use strict";
    var db, sql;
    
    // Logout of Appcelerator cloud services
    Omadi.push_notifications.logoutUser();
    
    sql = "UPDATE login SET is_logged='false', picked='null', login_json='null', cookie='null' ";
    sql += "WHERE id_log=1";
    
    db = Omadi.utils.openListDatabase();
    db.execute(sql);
    db.close();

    Ti.App.Properties.setBool("stopGPS", true);
    Ti.App.Properties.setBool("quitApp", true);

    Omadi.display.removeNotifications();
};

Omadi.service.sendLogoutRequest = function(){"use strict";
    var http, numFilesLeft, doRequest, listDB, uid, username, clientAccount, token, timestamp;
    
    Ti.App.fireEvent('loggingOut');
    
    doRequest = true;
    
    if(Ti.Network.online){
        uid = Omadi.utils.getUid();
        numFilesLeft = Omadi.data.getNumFilesReadyToUpload(uid);
        
        if(numFilesLeft > 0){
            // Don't send the logout request just yet
            // Wait until all the files have been uploaded first
            // Pretend the logout happened on the mobile app
            doRequest = false;
            
            username = Omadi.utils.getUsername(uid);
            clientAccount = Omadi.utils.getClientAccount();
            token = Omadi.utils.getCookie();
            timestamp = Omadi.utils.getUTCTimestamp();
            
            listDB = Omadi.utils.openListDatabase();
            listDB.execute("INSERT INTO background_files (uid, username, client_account, token, timestamp) VALUES (" + uid + ",'" + dbEsc(username) + "','" + dbEsc(clientAccount) + "','" + dbEsc(token) + "'," + timestamp + ")");
            listDB.close();
            
            Omadi.service.doPostLogoutOperations();
        }
    }
    
    if(doRequest){
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false
        });
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
    }
};

Omadi.service.photoUploadSuccess = function(e){"use strict";
    var json, subDB, subResult, uploadMore = false, fieldSettings, tableName, 
        decoded_values, decoded, content, multipleValue, dbValue, jsonArray, 
        imageFile, filePath, resizedFilePath, deleteFile, photoWidget, 
        photoDeleteOption, thumbPath, thumbFile, numFilesReadyToUpload, 
        filesize, bytesUploaded, photoId, uploadFinished, listDB,
        nid, delta, field_name, numTries, isBackground, message;
    
    // Get back the memory used for the photo upload
    Omadi.service.currentFileUpload = null;
    
    //Ti.API.info('UPLOAD FILE: =========== Success ========' + this.responseText);
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
            
            subDB = Omadi.utils.openMainDatabase();
            listDB = Omadi.utils.openListDatabase();
            
            tableName = null;
            
            // Updating status
            subResult = subDB.execute("SELECT table_name FROM node WHERE nid=" + json.nid);
            if(subResult.isValidRow()){
                tableName = subResult.fieldByName('table_name');
            }
            subResult.close();
            
            if(tableName !== null){
                
                // We do not need to update the files in the file that uploaded if the nid does not exist in the node table
                // This could be from a background upload where the second user doesn't have permissions to the node
                
                subResult = subDB.execute("SELECT settings FROM fields WHERE bundle='" + tableName + "' and type IN ('image','file') AND field_name='" + json.field_name + "'");
                fieldSettings = JSON.parse(subResult.fieldByName('settings'));
                subResult.close();
            }
               
            subResult = listDB.execute("SELECT id, file_path, thumb_path, filesize FROM _files WHERE id = " + photoId);   
            
            if(subResult.isValidRow()){
                
                filePath = subResult.fieldByName('file_path');
                thumbPath = subResult.fieldByName('thumb_path');
                filesize = subResult.fieldByName('filesize', Ti.Database.FIELD_TYPE_INT);
                
                Ti.API.debug("Filesize: " + filesize);
                Ti.API.debug("bytesUploaded: " + bytesUploaded);
                Ti.API.debug("Upload finished: " + uploadFinished);
                
                // Check if the file is ready for deletion
                if(bytesUploaded == 0 || bytesUploaded >= filesize || uploadFinished){
                    Ti.API.error("Upload is finished for nid " + nid + " and delta " + delta);
                    try{
                    	//Finishing the file after upload so it's available on the device for printing
                        listDB.execute("UPDATE _files SET uploading=0, fid=" + json.file_id + ", finished=" + Omadi.utils.getUTCTimestamp() + " WHERE id=" + photoId);
                    }
                    catch(sqlEx2){
                        Utils.sendErrorReport("Exception in upload success ex2: " + sqlEx2 + ", json: " + JSON.stringify(json));
                    }
                }
                else{
                    try{
                        listDB.execute("UPDATE _files SET bytes_uploaded=" + bytesUploaded + ", fid=" + json.file_id + ", uploading=0 WHERE id=" + photoId);
                    }
                    catch(sqlEx1){
                        Utils.sendErrorReport("Exception in upload success ex1: " + sqlEx1 + ", json: " + JSON.stringify(json));
                    }
                }
            }

            subResult.close();
            subDB.close();
            
            listDB.close();
            
            numFilesReadyToUpload = Omadi.data.getNumFilesReadyToUpload();
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
                
                if(Omadi.utils.isLoggedIn()){
                    Omadi.service.uploadFile();
                }
                else{
                    Omadi.service.uploadBackgroundFile();
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
    
    Omadi.service.uploadFileHTTP = null;
};

Omadi.service.photoUploadErrorDialog = null;

Omadi.service.photoUploadError = function(e){"use strict";
    var subDB, dialog, message, subResult, numTries, blob, 
        photoId, nid, uploadMore, imageView, delta, field_name, 
        filename, imageFile, imageDir, incrementTries, 
        saveFailedUpload, isBackground;
    
    // Get back the memory used for the photo upload
    Omadi.service.currentFileUpload = null;
    
    if(e.error != "The request timed out" && e.error != "Read timed out"){
        Utils.sendErrorReport("Upload failed. Code: " + e.code + ", Error: " + e.error);
    }
    
    Ti.API.error("Upload failed. Code: " + e.code + ", Error: " + e.error);
    
    //Ti.API.error(JSON.stringify(e));
    //Ti.API.error(JSON.strigify(this));
    
    incrementTries = false;
    saveFailedUpload = false;
    
    photoId = this.photoId;
    nid = this.nid;
    delta = this.delta;
    field_name = this.field_name;
    numTries = this.tries;
    isBackground = this.isBackground;
    
    if(e.code == 1){
        // Some kind of network error
        if(Omadi.service.photoUploadErrorDialog === null){
            Omadi.service.photoUploadErrorDialog = Ti.UI.createAlertDialog({
                title: "Problem with Network",
                message: "Please login to continue uploads.",
                buttonNames: ['Ok'] 
            });
            
            Omadi.service.photoUploadErrorDialog.addEventListener('click', function(){
                try{
                    Omadi.service.photoUploadErrorDialog = null;
                }
                catch(ex){
                    Utils.sendErrorReport("exception photouploaderrordialog: " + ex);
                }
            });
            
            Omadi.service.photoUploadErrorDialog.show();
        }
    }
    else if(e.code == 3 || e.code == 401 || e.code == 403){
        // Some kind of authentication error
        if(Omadi.service.photoUploadErrorDialog === null){
            
            if(!Omadi.utils.isLoggedIn()){
                Omadi.service.photoUploadErrorDialog = Ti.UI.createAlertDialog({
                    title: "Problem with Upload",
                    message: "Please login to continue uploads.",
                    buttonNames: ['Ok'] 
                });
                
                Omadi.service.photoUploadErrorDialog.addEventListener('click', function(){
                     Omadi.service.photoUploadErrorDialog = null;
                });
                
                Omadi.service.photoUploadErrorDialog.show();
            }
        }
        
        Omadi.service.doBackgroundUploads = false;
    }
    else if(e.code == 410 || e.code == 412){
        // Node was deleted, orso delete db entry immediately and save image to gallery
        saveFailedUpload = true;
    }
    else if (e.code == 406){
        // Something was wrong with the file - too small for a photo or video
        //saveFailedUpload = true;
    }
    else if(e.code == -1){
        
        if(e.error == "Gone" || e.error == 'Precondition Failed'){
            saveFailedUpload = true;
        }
        else{
            incrementTries = true;
            if(numTries > 5){
                //saveFailedUpload = true;
            }
        }
    }
    else if(e.code == 2){
        // Do nothing - this is a request timed out error code
        saveFailedUpload = false;
    }
    
    try{
        subDB = Omadi.utils.openListDatabase();

        subDB.execute("UPDATE _files SET uploading = 0 WHERE id = " + photoId);
        
        if(incrementTries){
           subDB.execute("UPDATE _files SET tries = (tries + 1) where id=" + photoId);
        }
    
        subResult = subDB.execute("SELECT id FROM _files WHERE nid > 0");
        uploadMore = (subResult.rowCount > 0 ? true : false);
        subResult.close();
    
        subDB.close();
    
        if (uploadMore) {
            if(Omadi.utils.isLoggedIn()){
                setTimeout(Omadi.service.uploadFile, 10000);
            }
            else{
                setTimeout(Omadi.service.uploadBackgroundFile, 10000);
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Upload failed exception: " + ex);
    }
    
    if (Omadi.utils.isLoggedIn() && saveFailedUpload) {
        Omadi.data.saveFailedUpload(photoId, true);
    }
    
    Ti.App.fireEvent("doneSendingPhotos");
 
    Omadi.service.uploadFileHTTP = null;
};

Omadi.service.getLastUploadStartTimestamp = function(){"use strict";
   var lastUploadStartTimestamp = null, listDB, result;
   try {
        // Upload images
        listDB = Omadi.utils.openListDatabase();
        result = listDB.execute("SELECT uploading FROM _files WHERE uploading > 0");
        
        if (result.isValidRow()) {
            lastUploadStartTimestamp = result.field(0, Ti.Database.FIELD_TYPE_INT);
            
            Ti.API.debug("A photo is currently uploading");
        }
        result.close();
        listDB.close();
    }
    catch(ex) {
        
        Utils.sendErrorReport("Exception getting uploading vars: " + ex);
    }  
    
    Ti.API.debug("last upload: " + lastUploadStartTimestamp);
    
    return lastUploadStartTimestamp;
};

Omadi.service.currentFileUpload = null;

Omadi.service.photoUploadStream = function(e){"use strict";
    /*global uploadingProgressBar*/
    var filesize, uploadingBytes, bytesUploaded, currentBytesUploaded;
    
    filesize = Omadi.service.currentFileUpload.filesize;
    uploadingBytes = Omadi.service.currentFileUpload.uploading_bytes;
    bytesUploaded = Omadi.service.currentFileUpload.bytes_uploaded;
    
    Ti.API.debug("Uploading: " + Math.floor(e.progress * 100) + "%");
    Ti.API.debug("Filesize: " + filesize);
    Ti.API.debug("Uloading bytes: " + uploadingBytes);
    Ti.API.debug("bytes uploaded: " + bytesUploaded);
    
    Omadi.service.bytesStreamed = (e.progress * uploadingBytes);
     
    if(typeof uploadingProgressBar !== 'undefined' && uploadingProgressBar !== null){
        
        if(filesize == uploadingBytes){
            uploadingProgressBar.setValue(e.progress);
        }
        else{
            currentBytesUploaded = Math.floor(bytesUploaded + Omadi.service.bytesStreamed);
            uploadingProgressBar.setValue(currentBytesUploaded / filesize);
        }
    }
    
    Ti.App.fireEvent('bytesStreamed', {
        bytesStreamed: Omadi.service.bytesStreamed,
        uploadingBytes: uploadingBytes
    });
};

Omadi.service.uploadBackgroundFile = function(){"use strict";
    if(Omadi.service.doBackgroundUploads){
        Omadi.service.uploadFile(true);    
    }
};

Omadi.service.uploadFileHTTP = null;

Omadi.service.abortFileUpload = function(){"use strict";
    var db;
    
    if(typeof Omadi.service.uploadFileHTTP !== 'undefined' && Omadi.service.uploadFileHTTP !== null){
        Omadi.service.uploadFileHTTP.abort();
        Ti.API.info("Aborted current file upload.");
        Omadi.service.uploadFileHTTP = null;
    }
    
    try{
        db = Omadi.utils.openListDatabase();
        db.execute("UPDATE _files SET uploading = 0");
        db.close();
    }
    catch(ex){
        Utils.sendErrorReport("Error aborting http upload: " + ex);
    }
};

Omadi.service.verifyStartMillis = function(isBackground){"use strict";
	// Verify that start millis is defined
	if (typeof Ti.UI.currentWindow.appStartMillis === 'undefined') {
		var windowURL = Ti.UI.currentWindow.url || '';
        Utils.sendErrorReport("AppStartMillis upload was undefined, background: " + isBackground + ", url: " + windowURL);
        return true;
	}
	
	var origAppStartMillis = Ti.App.Properties.getDouble('omadi:appStartMillis', 0);
	var currentWinStartMillis = parseInt(Ti.UI.currentWindow.appStartMillis, 10);
	
	// Verify that start millis is a number
	if (isNaN(origAppStartMillis) || isNaN(currentWinStartMillis)) {
        Utils.sendErrorReport("start millis is NaN: " + currentWinStartMillis + " - " + origAppStartMillis);
        return false;
	}
	
	// Verify that start millis is not zero
	if (origAppStartMillis == 0 || currentWinStartMillis == 0) {
        Utils.sendErrorReport("AppStartMillis upload was zero: " + origAppStartMillis + " - " + currentWinStartMillis + ", background: " + isBackground);
        return false;
    }
    
    // Verify that start millis match
    if(origAppStartMillis != Ti.UI.currentWindow.appStartMillis){
        if(Ti.App.isAndroid){
            Utils.sendErrorReport("An extra android upload activity is being REJECTED, background: " + isBackground + " : "  + Ti.UI.currentWindow.appStartMillis + " - " + origAppStartMillis);
        } else {
        	Utils.sendErrorReport("An extra iOS upload event is being REJECTED, background: " + isBackground + " : " + Ti.UI.currentWindow.appStartMillis + " - " + origAppStartMillis);
        }
        return false;
    }
    
    return true;
};

Omadi.service.uploadFile = function(isBackground) {"use strict";
	isBackground =  isBackground || false;
	
    // Don't upload the file if the appStartMillis don't match the current runtime
    // This may come up when the app crashes, and this function is called multiple times
    // for all the open activities, but it should only be called once
	if (!Omadi.service.verifyStartMillis(isBackground)) {
		return;
	}

	var now = Omadi.utils.getUTCTimestamp();
    var lastUploadStartTimestamp = Omadi.service.getLastUploadStartTimestamp();
    var isUploadingFile = lastUploadStartTimestamp === null;
    
    // Don't try to upload a file while form data is being saved. This causes photos to get messed up.
    // Don't upload a file if another file upload has started in the last 90 seconds.
    if (!Ti.Network.online || Ti.App.closingApp || Omadi.service.isSendingData() || (isUploadingFile && now - lastUploadStartTimestamp <= 90)) {
    	return;
    }
    
    var numFilesReadyToUpload = Omadi.data.getNumFilesReadyToUpload();
    if (numFilesReadyToUpload == 0) {
		return;
    }
    
    Omadi.service.currentFileUpload = Omadi.data.getNextPhotoData();
    if (!Omadi.service.currentFileUpload) {
		Ti.API.error('Next photo data is null');
		return;
    }
    
	if (Omadi.service.currentFileUpload.nid <= 0) {
		return;
	}
    
    try {
	    var db = Omadi.utils.openListDatabase();
	    // Reset all photos to not uploading in case there was an error previously
	    db.execute('UPDATE _files SET uploading = 0 WHERE uploading != 0');
	    
	    // Set the photo to uploading status
	    db.execute('UPDATE _files SET uploading = ' + now + ' WHERE id = ' + Omadi.service.currentFileUpload.id);
	    db.close();
	} catch(e) {
	    Utils.sendErrorReport('Exception setting uploading var: ' + e);
	}
	
	Ti.API.info('Uploading photo');
	
	try{
		// Build HTTP header
        Omadi.service.uploadFileHTTP = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false
        });
        
        Omadi.service.uploadFileHTTP.onsendstream = Omadi.service.photoUploadStream;
        Omadi.service.uploadFileHTTP.onload = Omadi.service.photoUploadSuccess;
        Omadi.service.uploadFileHTTP.onerror = Omadi.service.photoUploadError;
        Omadi.service.uploadFileHTTP.open('POST', Omadi.DOMAIN_NAME + '/js-sync/upload.json');
        Omadi.service.uploadFileHTTP.timeout = 45000;
        
        Omadi.service.uploadFileHTTP.nid = Omadi.service.currentFileUpload.nid;
        Omadi.service.uploadFileHTTP.photoId = Omadi.service.currentFileUpload.id;
        Omadi.service.uploadFileHTTP.delta = Omadi.service.currentFileUpload.delta;
        Omadi.service.uploadFileHTTP.field_name = Omadi.service.currentFileUpload.field_name;
        Omadi.service.uploadFileHTTP.upload_part = Omadi.service.currentFileUpload.upload_part;
        Omadi.service.uploadFileHTTP.numUploadParts = Omadi.service.currentFileUpload.numUploadParts;
        Omadi.service.uploadFileHTTP.tries = Omadi.service.currentFileUpload.tries;
        Omadi.service.uploadFileHTTP.isBackground = isBackground;

        Omadi.service.uploadFileHTTP.setRequestHeader('Content-Type', 'application/json');
        
        // Include cookie if there is one
        if (isBackground) {
            db = Omadi.utils.openListDatabase();
            var result = db.execute('SELECT token FROM background_files WHERE uid = ' + Omadi.service.currentFileUpload.uid + ' AND client_account = "' + dbEsc(Omadi.service.currentFileUpload.client_account) + '"');
            if (result.isValidRow()) {
                cookie = result.fieldByName('token');
                if (cookie > '') {
                    Omadi.service.uploadFileHTTP.setRequestHeader('Cookie', cookie);
                }
            }
            result.close();
            db.close();
        } else {
            Omadi.utils.setCookieHeader(Omadi.service.uploadFileHTTP);
        }
        
        // Build HTTP content
        var payload = JSON.stringify({
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
            filesize : Omadi.service.currentFileUpload.filesize,
            mobile_id : Omadi.service.currentFileUpload.id,
            bytes_uploaded : Omadi.service.currentFileUpload.bytes_uploaded,
            uploading_bytes : Omadi.service.currentFileUpload.uploading_bytes,
            upload_part : Omadi.service.currentFileUpload.upload_part,
            current_timestamp : Omadi.utils.getUTCTimestamp()
        });
        
        if (Omadi.service.currentFileUpload.upload_part == 1) {
            Ti.App.fireEvent('sendingData', {
                message : 'Uploading files. ' + numFilesReadyToUpload + ' to go...',
                progress : true
            });
        }
        
        // Upload file
        Omadi.service.uploadFileHTTP.setValidatesSecureCertificate(false);
        Omadi.service.uploadFileHTTP.send(payload);
    } catch(e) {
        Utils.sendErrorReport("Exception sending upload data: " + e);
    }
};

Omadi.service.getUpdatedNodeJSON = function() {"use strict";
    /*jslint eqeq:true,plusplus:true*/
    var db, result, obj, nid, tid, nids, node, instances, field_name, i, v_result, output;
    
    nids = [];
    
    try {
        
        db = Omadi.utils.openMainDatabase();
        
        obj = {
            timestamp : Omadi.utils.getUTCTimestamp(),
            last_sync_timestamp: Omadi.data.getLastUpdateTimestamp(db),
            data : {}
        };
        
        result = db.execute("SELECT nid FROM node WHERE flag_is_updated = 1");
        while (result.isValidRow()) {
            nids.push(result.fieldByName('nid'));
            Ti.API.info("Sending nid: " + result.fieldByName('nid'));
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
        // Make sure the db is closed before nodeLoad is called or any other function that opens the db
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
                            
                            var files = Omadi.data.getAllFiles();
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
                                                        var lastLocation = Omadi.location.getLastLocation();
                                                        
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
            db.close();
        }
        catch(nothing1){
            Ti.API.error("db would not close");
            Utils.sendErrorReport("DB WOULD NOT CLOSE");
        }
        
        try{
            db = Omadi.utils.openMainDatabase();
            result = db.execute("UPDATE node SET flag_is_updated = 3 WHERE flag_is_updated = 1");
            db.close();
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

Omadi.service.lastCheckUpdate = 0;
Omadi.service.checkUpdate = function(useProgressBar, userInitiated){"use strict";
    var db, result, sendUpdates = false, timestamp;
    
    Ti.API.info("Checking for sync updates.");
    
    timestamp = Omadi.utils.getUTCTimestamp();
    
    if((timestamp - Omadi.service.lastCheckUpdate) < 2){
        // Only allow updates within 2 seconds of each other
        Ti.API.error("Not allowing update - too soon after previous update.");
        return;
    }
    
    Omadi.service.lastCheckUpdate = timestamp;
    
    if ( typeof useProgressBar === 'undefined') {
        useProgressBar = true;
    }
    
    if(typeof userInitiated === 'undefined'){
        userInitiated = false;
    }

    db = Omadi.utils.openMainDatabase();
    result = db.execute('SELECT COUNT(*) as numNodes FROM node WHERE flag_is_updated=1');

    if (result.isValidRow() && result.field(0, Ti.Database.FIELD_TYPE_INT) > 0) {
        sendUpdates = true;
    }
    result.close();
    db.close();
    
    if(sendUpdates){
        Omadi.service.sendUpdates();
    }
    else{
        Omadi.service.fetchUpdates(useProgressBar, userInitiated);
    }
    
    // Check for any comments that need to be uploaded
    Comments.sendComments();
};


