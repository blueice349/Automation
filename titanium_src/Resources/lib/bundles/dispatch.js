
/*jslint eqeq:true, plusplus: true*/
/*global alertQueue, isJsonString*/

Omadi.bundles.dispatch = {};

Omadi.bundles.dispatch.showJobsScreen = function(){"use strict";
    var bundle, retval, instances;
    
    retval = false;
    bundle = Omadi.data.getBundle('dispatch');
    
    if(bundle){
        instances = Omadi.data.getFields('dispatch');
        
        if(typeof instances.dispatch_form_reference !== 'undefined'){
            if(typeof instances.field_dispatching_status !== 'undefined'){
                retval = true;
            }
        }
    }
    
    return retval;
};

Omadi.bundles.dispatch.showNewDispatchJobs = function(){"use strict";
      if(Ti.App.Properties.getBool('newDispatchJob', false)){
          Ti.App.Properties.setBool('newDispatchJob', false);
          
          Omadi.display.openJobsWindow();
          
      }
};

Omadi.bundles.dispatch.getDrivingDirections = function(args){"use strict";
    var http, dialog, nid = 0, address, node, accountNid;
    
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
            
            node = Omadi.data.nodeLoad(nid);
            address = "";
            
            if(node.type == 'cod' || node.type == 'pd'){
                Omadi.bundles.dispatch.openDirectionsToFirstAddress(node);
            }
            else if(node.type == 'tow'){
                accountNid = node.enforcement_account.dbValues[0];
                node = Omadi.data.nodeLoad(accountNid);
                Omadi.bundles.dispatch.openDirectionsToFirstAddress(node);
            }
            else if(node.type == 'service'){
                
                if(typeof node.service_tow_start_address___street !== 'undefined' && node.service_tow_start_address___street.dbValues[0] > ''){
                    Omadi.bundles.dispatch.openDirectionsToFirstAddress(node);
                }
                else{
                    accountNid = node.enforcement_account.dbValues[0];
                    node = Omadi.data.nodeLoad(accountNid);
                    Omadi.bundles.dispatch.openDirectionsToFirstAddress(node);
                }
            }
        }
    }
    else{
        Omadi.service.sendErrorReport('No NID to accept job');
        alert("An unknown error occurred attempting to accept the job.");
    }
};

Omadi.bundles.dispatch.openDirectionsToFirstAddress = function(node){"use strict";
    var firstLocationFieldName, index, fieldName, street, city, state, zip, address, instances;
    
    instances = Omadi.data.getFields(node.type);
    
    firstLocationFieldName = "";
                
    for(index in instances){
        if(instances.hasOwnProperty(index)){
            if(instances[index].type == 'location'){
                Ti.API.debug(instances[index]);
                firstLocationFieldName = instances[index].field_name.split('___');
                firstLocationFieldName = firstLocationFieldName[0];
                break;
            }
        }
    }
    
    if(firstLocationFieldName.length){
        
        Ti.API.debug(firstLocationFieldName);
        
        for(index in instances){
            if(instances.hasOwnProperty(index)){
                if(instances[index].type == 'location'){
                    switch(instances[index].part){
                        case 'street':
                            fieldName = firstLocationFieldName + "___street";
                            street = node[fieldName].dbValues[0]; break;
                        case 'city':
                            fieldName = firstLocationFieldName + "___city";
                            city = node[fieldName].dbValues[0]; break;
                        case 'province':
                            fieldName = firstLocationFieldName + "___province";
                            state = node[fieldName].dbValues[0]; break;
                        case 'postal_code':
                            fieldName = firstLocationFieldName + "___postal_code";
                            zip = node[fieldName].dbValues[0]; break;
                    }
                }
            }
        }
        
        address = street + " " + city + ", " + state + " " + zip;
        
        Ti.API.debug(address);
        Omadi.display.getDrivingDirectionsTo(address);
    }
    else{
        alert("An unknown error occurred. Please contact support.");
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
    var options, db, result, termResult, vid, dispatchBundle, node, i, j,
        excludeKeys, excludeStatuses, 
        currentStatusKey, currentStatus, status, useKey, dispatchNode, dispatchNid,
        dispatchInstances, statusInstance, fieldOptions;
    
    options = [];
    
    node = Omadi.data.nodeLoad(nid);
    
    dispatchNid = node.from_dispatch.dbValues[0];
    dispatchNode = Omadi.data.nodeLoad(dispatchNid);
    
    if(dispatchNode){
        currentStatusKey = dispatchNode.field_dispatching_status.dbValues[0];
        
        dispatchInstances = Omadi.data.getFields('dispatch');
        
        if(typeof dispatchInstances.field_dispatching_status !== 'undefined'){
            statusInstance = dispatchInstances.field_dispatching_status;
            
            excludeKeys = [];
            
            if(currentStatusKey !== null){
                switch(currentStatusKey){
                    case 'job_complete':
                        excludeKeys.push('job_complete');
                        /* falls through */
                    case 'arrived_at_destination':
                        excludeKeys.push('arrived_at_destination');
                        /* falls through */
                    case 'towing_vehicle':
                        excludeKeys.push('towing_vehicle');
                        /* falls through */
                    case 'arrived_at_job':
                        excludeKeys.push('arrived_at_job');
                        /* falls through */
                    case 'driving_to_job':
                        excludeKeys.push('driving_to_job');
                        /* falls through */
                    case 'job_accepted':
                        excludeKeys.push('job_accepted');
                        /* falls through */
                    case 'dispatching_call':
                        excludeKeys.push('dispatching_call');
                        /* falls through */
                    case 'call_received':
                        excludeKeys.push('call_received');
                        break;       
                }
            }
        }
        
        excludeKeys.push(null);
        
        fieldOptions = Omadi.widgets.list_text.getOptions(statusInstance);
        
        for(i = 0; i < fieldOptions.length; i ++){
            useKey = true;
            
            for(j = 0; j < excludeKeys.length; j ++){
                if(fieldOptions[i].dbValue == excludeKeys[j]){
                    useKey = false;
                    break;
                }
            }
            
            if(useKey){
                options.push({
                   dbValue: fieldOptions[i].dbValue,
                   title: fieldOptions[i].title
                });
            }
        }
    }
    
    //Ti.API.debug(options);
    
    return options;
};

Omadi.bundles.dispatch.updateStatus = function(nid, status){"use strict";
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
            status: status
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
                options.push(statusOptions[i].title);
            }
            
            options.push('Cancel');
            
            statusDialog = Ti.UI.createOptionDialog({
               title: 'Update Job Status To',
               options: options,
               cancel: (options.length - 1)
            });
            
            statusDialog.addEventListener('click', function(e){
                if(e.index >= 0 && e.index != e.source.cancel){
                    var status = statusOptions[e.index].dbValue;
                    Ti.API.debug(status);
                    Omadi.bundles.dispatch.updateStatus(nid, status);
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
            if(node && node.nid){
                newJobs.push({
                   nid: node.nid,
                   title: node.title,
                   viewed: node.viewed,
                   type: node.type
                });
            }
        }
    }
    
    return newJobs;
};

Omadi.bundles.dispatch.getCurrentUserJobs = function(){"use strict";
    /*global list_search_node_matches_search_criteria*/
    var newJobs, db, result, sql, nowTimestamp, currentUserUid, 
        i, node, currentUserJobNids, dispatchBundle;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
        
        currentUserUid = Omadi.utils.getUid();
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, dispatch.dispatch_form_reference FROM node n ";
        sql += "LEFT JOIN dispatch ON dispatch.nid = n.nid ";
        sql += "WHERE n.table_name = 'dispatch' ";
        sql += "AND dispatch.dispatch_form_reference IS NOT NULL ";
        sql += "AND dispatch.dispatched_to_driver = " + currentUserUid + " "; 
        sql += "AND (dispatch.field_dispatching_status IS NULL OR dispatch.field_dispatching_status <> 'job_complete') ";
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

