
/*jslint eqeq:true, plusplus: true*/
/*global alertQueue, isJsonString*/

Omadi.bundles.dispatch = {};

Omadi.bundles.dispatch.acceptJob = function(args){"use strict";
    
    var http, dialog, nid = 0;
    
    if(typeof args[0] !== 'undefined'){
        nid = args[0];
    }
    
    if(nid){
        if(!Ti.Network.online){
            dialog = Ti.UI.createOptionDialog({
                message : 'Your Internet connection was lost. Please try again after you get an Internet connection.'
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
        }
        else{
            
            Omadi.display.loading();
            
            Omadi.data.setUpdating(true);
            
            http = Ti.Network.createHTTPClient();
            http.setTimeout(15000);
            http.open('POST', Omadi.DOMAIN_NAME + '/js-dispatch/dispatch/accept_job.json');
        
            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
        
            http.onload = function(e) {
                var json;
                
                Omadi.display.doneLoading();
                Ti.API.debug(JSON.stringify(e));
                Ti.API.debug(this.responseText);
                alert("job accepted");
                
                if (this.responseText !== null && isJsonString(this.responseText) === true) {
            
                        json = JSON.parse(this.responseText);            
                        Omadi.data.processFetchedJson(json, null);
                }
                else {
        
                    Titanium.Media.vibrate();
                    Ti.API.error("Bad response text: " + this.responseText);
                }                    

                Omadi.data.setUpdating(false);
                Ti.App.fireEvent('finishedDataSync');
            };
        
            http.onerror = function(e) {
                var dialog;
                
                Omadi.display.doneLoading();
    
                Ti.API.error(JSON.stringify(e));
                dialog = Ti.UI.createAlertDialog({
                    message : 'An error occured. Please try again.',
                    buttonNames: ['OK']
                });
                
                if ( typeof alertQueue !== 'undefined') {
                    alertQueue.push(dialog);
                }
                else {
                    dialog.show();
                }
                
                Omadi.service.sendErrorReport('Could not accept job' + JSON.stringify(e));
            };
            Ti.API.debug(nid);
            
            http.send(JSON.stringify({
                nid: nid
            }));
        }
    }
    else{
        Omadi.service.sendErrorReport('No NID to accept job');
        alert("An unknown error occurred attempting to accept the job.");
    }    
};

Omadi.bundles.dispatch.getStatusOptions = function(){"use strict";
    var options, db, result, termResult, vid;
    
    options = [];
    db = Omadi.utils.openMainDatabase();
    
    result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = 'dispatch_status'");
    if(result.isValidRow()){
        vid = result.field(0);
        
        termResult = db.execute("SELECT tid, name FROM term_data WHERE vid = " + vid + " ORDER BY weight");
        
        while(termResult.isValidRow()){
            
            options.push({
               tid: termResult.fieldByName('tid'),
               text: termResult.fieldByName('name') 
            });
            
            termResult.next();
        }
        termResult.close();
    }
    result.close();
    
    db.close();
    
    return options;
};

Omadi.bundles.dispatch.updateStatus = function(nid, statusTid){"use strict";
    var dialog, http;
    
    Ti.API.debug(nid);
    Ti.API.debug(statusTid);
    
    if(!Ti.Network.online){
        dialog = Ti.UI.createOptionDialog({
            message : 'Your Internet connection was lost. Please try again after you get an Internet connection.'
        });
        
        if ( typeof alertQueue !== 'undefined') {
            alertQueue.push(dialog);
        }
        else {
            dialog.show();
        }
    }
    else{
        Omadi.display.loading();
                
        Omadi.data.setUpdating(true);
        
        http = Ti.Network.createHTTPClient();
        http.setTimeout(15000);
        http.open('POST', Omadi.DOMAIN_NAME + '/js-dispatch/dispatch/update_status.json');
    
        http.setRequestHeader("Content-Type", "application/json");
        Omadi.utils.setCookieHeader(http);
    
        http.onload = function(e) {
            var json;
            
            Omadi.display.doneLoading();
            Ti.API.debug(JSON.stringify(e));
            Ti.API.debug(this.responseText);
            
            if (this.responseText !== null && isJsonString(this.responseText) === true) {
        
                json = JSON.parse(this.responseText);            
                Omadi.data.processFetchedJson(json, null);
            }
            else{
    
                Titanium.Media.vibrate();
                Ti.API.error("Bad response text: " + this.responseText);
            }                    
    
            Omadi.data.setUpdating(false);
            Ti.App.fireEvent('finishedDataSync');
        };
    
        http.onerror = function(e) {
            var dialog;
            
            Omadi.display.doneLoading();
    
            Ti.API.error(JSON.stringify(e));
            dialog = Ti.UI.createAlertDialog({
                message : 'An error occured. Please try again.',
                buttonNames: ['OK']
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            
            Omadi.service.sendErrorReport('Could not accept job' + JSON.stringify(e));
        };
        Ti.API.debug(nid);
        
        http.send(JSON.stringify({
            nid: nid,
            status_tid: statusTid
        }));
    }
};

Omadi.bundles.dispatch.showUpdateStatusDialog = function(args){"use strict";
    
    var http, dialog, nid = 0, statusDialog, statusOptions, options, i;
    
    if(typeof args[0] !== 'undefined'){
        nid = args[0];
    }
    
    if(nid){
        if(!Ti.Network.online){
            dialog = Ti.UI.createOptionDialog({
                message : 'Your Internet connection was lost. Please try again after you get an Internet connection.'
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
        }
        else{
            
            statusOptions = Omadi.bundles.dispatch.getStatusOptions();
            
            options = [];
            for(i = 0; i < statusOptions.length; i ++){
                options.push(statusOptions[i].text);
            }
            
            statusDialog = Ti.UI.createOptionDialog({
               title: 'Update Job Status To',
               options: options
            });
            
            statusDialog.addEventListener('click', function(e){
                if(e.index >= 0){
                    var statusTid = statusOptions[e.index].tid;
                    Omadi.bundles.dispatch.updateStatus(nid, statusTid);
                }
            });
            
            statusDialog.show();
        }
    }
    else{
        Omadi.service.sendErrorReport('No NID to accept job');
        alert("An unknown error occurred attempting to update the status.");
    }
    
};

Omadi.bundles.dispatch.getNewJobs = function(){"use strict";
    /*global list_search_node_matches_search_criteria*/
    var newJobs, db, result, sql, nowTimestamp, dispatchBundle;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
    
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, n.title, n.viewed FROM node n ";
        sql += "LEFT JOIN dispatch ON dispatch.nid = n.nid ";
        sql += "WHERE n.table_name = 'dispatch' ";
        sql += "AND dispatch.dispatched_to_driver IS NULL"; 
        result = db.execute(sql);
        
        while(result.isValidRow()){
            
            newJobs.push({
               nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
               title: result.fieldByName('title'),
               viewed: result.fieldByName('viewed')
            });
            
            result.next();
        }
        
        result.close();
        
        db.close();
    }
    
    return newJobs;
};

Omadi.bundles.dispatch.getCurrentUserJobs = function(){"use strict";
    /*global list_search_node_matches_search_criteria*/
    var newJobs, db, result, sql, nowTimestamp, dispatchBundle, currentUserUid;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
        
        currentUserUid = Omadi.utils.getUid();
        
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, n.title, n.viewed FROM node n ";
        sql += "LEFT JOIN dispatch ON dispatch.nid = n.nid ";
        sql += "WHERE n.table_name = 'dispatch' ";
        sql += "AND dispatch.dispatched_to_driver = " + currentUserUid; 
        result = db.execute(sql);
        
        while(result.isValidRow()){
            
            newJobs.push({
               nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
               title: result.fieldByName('title'),
               viewed: result.fieldByName('viewed')
            });
            
            result.next();
        }
        
        result.close();
        
        db.close();
    }
    
    return newJobs;
};