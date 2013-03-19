
/*jslint eqeq:true, plusplus: true*/
/*global alertQueue, isJsonString*/

Omadi.bundles.dispatch = {};

Omadi.bundles.dispatch.showNewDispatchJobs = function(){"use strict";
      if(Ti.App.Properties.getBool('newDispatchJob', false)){
          Ti.App.Properties.setBool('newDispatchJob', false);
          
          Omadi.display.openJobsWindow();
          
      }
};

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
            
            Omadi.display.loading('Accepting...');
            Omadi.data.setUpdating(true);
            
            http = Ti.Network.createHTTPClient();
            http.setTimeout(15000);
            http.open('POST', Omadi.DOMAIN_NAME + '/js-dispatch/dispatch/accept_job.json');
        
            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
            
            http.onload = function(e) {
                var json;
                
                Omadi.display.doneLoading();
                
                if (this.responseText !== null && isJsonString(this.responseText) === true) {
            
                    json = JSON.parse(this.responseText);            
                    Omadi.data.processFetchedJson(json, null);
                    
                    if(!json.dispatch_accept_job.success){
                        alert(json.dispatch_accept_job.text);
                    }
                }
                else {
                    alert("The job was not accepted because an unknown error occurred.");
                    Omadi.service.sendErrorReport("Bad response text for accept job: " + this.responseText);
                }                    

                Omadi.data.setUpdating(false);
                Ti.App.fireEvent('finishedDataSync');
            };
        
            http.onerror = function(e) {
                var dialog;
                
                Omadi.display.doneLoading();
    
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

Omadi.bundles.dispatch.getStatusOptions = function(nid){"use strict";
    var options, db, result, termResult, vid, dispatchBundle, node, i,
        excludeTids, excludeStatuses, dispatchStatusTids, 
        currentStatusTid, currentStatus, status, useTid, tid, dispatchNode, dispatchNid;
    
    options = [];
    
    node = Omadi.data.nodeLoad(nid);
    
    dispatchNid = node.from_dispatch.dbValues[0];
    dispatchNode = Omadi.data.nodeLoad(dispatchNid);
    
    if(dispatchNode){
        currentStatusTid = dispatchNode.dispatch_status.dbValues[0];
        
        dispatchBundle = Omadi.data.getBundle('dispatch');
        
        excludeTids = [];
        excludeStatuses = [];
        
        if(typeof dispatchBundle.data.node_type_specific !== 'undefined' && typeof dispatchBundle.data.node_type_specific.dispatch_status_terms !== 'undefined'){
            
            if(typeof dispatchBundle.data.node_type_specific.dispatch_status_terms == 'string'){
                dispatchStatusTids = JSON.parse(dispatchBundle.data.node_type_specific.dispatch_status_terms);
            }
            else{
                dispatchStatusTids = dispatchBundle.data.node_type_specific.dispatch_status_terms;
            }
            
            currentStatus = null;
            
            for(status in dispatchStatusTids){
                if(dispatchStatusTids.hasOwnProperty(status)){
                    
                    if(dispatchStatusTids[status] == currentStatusTid){
                        currentStatus = status;
                        break;
                    }
                }
            }
            
            if(currentStatus !== null){
                switch(currentStatus){
                    case 'job complete':
                        excludeStatuses.push('job complete');
                        /* falls through */
                    case 'arrived at destination':
                        excludeStatuses.push('arrived at destination');
                        /* falls through */
                    case 'towing vehicle':
                        excludeStatuses.push('towing vehicle');
                        /* falls through */
                    case 'arrived at job':
                        excludeStatuses.push('arrived at job');
                        /* falls through */
                    case 'driving to job':
                        excludeStatuses.push('driving to job');
                        /* falls through */
                    case 'dispatch job accepted':
                        excludeStatuses.push('dispatch job accepted');
                        /* falls through */
                    case 'dispatching call':
                        excludeStatuses.push('dispatching call');
                        /* falls through */
                    case 'call received':
                        excludeStatuses.push('call received');
                        break;
                        
                }
            }
            
            for(i = 0; i < excludeStatuses.length; i ++){
                excludeTids.push(dispatchStatusTids[excludeStatuses[i]]);
            }
        }
        
        db = Omadi.utils.openMainDatabase();
        
        result = db.execute("SELECT vid FROM vocabulary WHERE machine_name = 'dispatch_status'");
        if(result.isValidRow()){
            vid = result.field(0);
            
            termResult = db.execute("SELECT tid, name FROM term_data WHERE vid = " + vid + " ORDER BY weight");
            
            while(termResult.isValidRow()){
                
                useTid = true;
                tid = termResult.fieldByName('tid', Ti.Database.FIELD_TYPE_INT);
                
                for(i = 0; i < excludeTids.length; i ++){
                    if(tid == excludeTids[i]){
                        useTid = false;
                        break;
                    }
                }
                
                if(useTid){
                    options.push({
                       tid: tid,
                       text: termResult.fieldByName('name') 
                    });
                }
                
                termResult.next();
            }
            termResult.close();
        }
        result.close();
        
        db.close();
    }
    
    return options;
};

Omadi.bundles.dispatch.updateStatus = function(nid, statusTid){"use strict";
    var dialog, http;
    
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
        Omadi.display.loading('Updating...');
                
        Omadi.data.setUpdating(true);
        
        http = Ti.Network.createHTTPClient();
        http.setTimeout(15000);
        http.open('POST', Omadi.DOMAIN_NAME + '/js-dispatch/dispatch/update_status.json');
    
        http.setRequestHeader("Content-Type", "application/json");
        Omadi.utils.setCookieHeader(http);
    
        http.onload = function(e) {
            var json;
            
            Omadi.display.doneLoading();
            //Ti.API.debug(JSON.stringify(e));
            //Ti.API.debug(this.responseText);
            
            if (this.responseText !== null && isJsonString(this.responseText) === true) {
        
                json = JSON.parse(this.responseText);            
                Omadi.data.processFetchedJson(json, null);
                
                if(!json.dispatch_update_status.success){
                    alert(json.dispatch_update_status.text);
                }
            }
            else{
                alert("The status was not updated because an unknown error occurred.");
                Omadi.service.sendErrorReport("Bad response text for update dispatch status: " + this.responseText);
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
            
            statusOptions = Omadi.bundles.dispatch.getStatusOptions(nid);
            
            options = [];
            for(i = 0; i < statusOptions.length; i ++){
                options.push(statusOptions[i].text);
            }
            
            options.push('Cancel');
            
            statusDialog = Ti.UI.createOptionDialog({
               title: 'Update Job Status To',
               options: options,
               cancel: (options.length - 1)
            });
            
            statusDialog.addEventListener('click', function(e){
                if(e.index >= 0 && e.index != e.source.cancel){
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
    var newJobs, db, result, sql, nowTimestamp, dispatchBundle, newDispatchNids, i, node;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
    
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, dispatch.dispatch_form_reference FROM node n ";
        sql += "LEFT JOIN dispatch ON dispatch.nid = n.nid ";
        sql += "WHERE n.table_name = 'dispatch' ";
        sql += "AND dispatch.dispatch_form_reference IS NOT NULL ";
        sql += "AND dispatch.dispatched_to_driver IS NULL"; 
        result = db.execute(sql);
        
        newDispatchNids = [];
        while(result.isValidRow()){
            newDispatchNids.push(result.fieldByName('dispatch_form_reference', Ti.Database.FIELD_TYPE_INT));
            result.next();
        }
        result.close();
        db.close();
        
        Ti.API.debug(newDispatchNids);
        
        for(i = 0; i < newDispatchNids.length; i ++){
            
            node = Omadi.data.nodeLoad(newDispatchNids[i]);
            
            newJobs.push({
               nid: node.nid,
               title: node.title,
               viewed: node.viewed,
               type: node.type
            });
        }
    }
    
    return newJobs;
};

Omadi.bundles.dispatch.getCurrentUserJobs = function(){"use strict";
    /*global list_search_node_matches_search_criteria*/
    var newJobs, db, result, sql, nowTimestamp, dispatchBundle, currentUserUid, 
        jobDoneTid, dispatchStatusTids, i, node, currentUserJobNids;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
        jobDoneTid = 0;
        if(typeof dispatchBundle.data.node_type_specific !== 'undefined' && typeof dispatchBundle.data.node_type_specific.dispatch_status_terms !== 'undefined'){
            if(typeof dispatchBundle.data.node_type_specific.dispatch_status_terms === 'string'){
                dispatchStatusTids = JSON.parse(dispatchBundle.data.node_type_specific.dispatch_status_terms);
            }
            else{
                dispatchStatusTids = dispatchBundle.data.node_type_specific.dispatch_status_terms;
            }
            
            if(typeof dispatchStatusTids['job complete'] !== 'undefined' && dispatchStatusTids['job complete']){
                jobDoneTid = dispatchStatusTids['job complete'];
            }
        }
        
        currentUserUid = Omadi.utils.getUid();
        
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, dispatch.dispatch_form_reference FROM node n ";
        sql += "LEFT JOIN dispatch ON dispatch.nid = n.nid ";
        sql += "WHERE n.table_name = 'dispatch' ";
        sql += "AND dispatch.dispatch_form_reference IS NOT NULL ";
        sql += "AND dispatch.dispatched_to_driver = " + currentUserUid + " "; 
        sql += "AND (dispatch.dispatch_status IS NULL OR dispatch.dispatch_status <> " + jobDoneTid + ") ";
        result = db.execute(sql);
        
        currentUserJobNids = [];
        while(result.isValidRow()){
            currentUserJobNids.push(result.fieldByName('dispatch_form_reference', Ti.Database.FIELD_TYPE_INT));
            result.next();
        }
        result.close();
        db.close();
       
        
        for(i = 0; i < currentUserJobNids.length; i ++){
            
            node = Omadi.data.nodeLoad(currentUserJobNids[i]);
            
            newJobs.push({
               nid: node.nid,
               title: node.title,
               viewed: node.viewed,
               type: node.type
            });
        }
    }
    
    return newJobs;
};

