
/*jslint eqeq:true,plusplus:true*/
/*global alertQueue,isJsonString*/

Omadi.bundles.dispatch = {};

Omadi.bundles.dispatch.showJobsScreen = function(){"use strict";
    var bundle, retval, instances;
    
    retval = false;
    bundle = Omadi.data.getBundle('dispatch');
    
    if(bundle){
        instances = Omadi.data.getFields('dispatch');
        
        if(typeof instances.field_dispatching_status !== 'undefined'){
            retval = true;
        }
    }
    
    return retval;
};

Omadi.bundles.dispatch.showNewDispatchJobs = function(){"use strict";
      var newJobs, currentUserJobs;
      
      if(Ti.App.Properties.getBool('newDispatchJob', false)){
            Ti.App.Properties.setBool('newDispatchJob', false);
            
            newJobs = Omadi.bundles.dispatch.getNewJobs();
            if(newJobs.length > 0){
                Omadi.display.openJobsWindow();
            }
            else{
                currentUserJobs = Omadi.bundles.dispatch.getCurrentUserJobs();
                if(currentUserJobs.length > 0){
                    Omadi.display.openJobsWindow();
                }
            }
      }
};

Omadi.bundles.dispatch.getDrivingDirections = function(args){"use strict";
    var http, dialog, nid = 0, address, node, accountNid, bundle;
    
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
            
            if(node){
                Omadi.bundles.dispatch.openDispatchDirections(node);
            }
            else{
                alert("An error occurred getting the address.");
            }
        }
    }
    else{
        Omadi.service.sendErrorReport('No NID to get driving directions');
        alert("An unknown error occurred attempting to accept the job.");
    }
};

Omadi.bundles.dispatch.openDispatchDirections = function(node){"use strict";
    var locationFieldName, bundle, index, fieldName, street, city, state, 
        zip, address, locationFieldParts, locationFieldBundle, 
        locationFieldOmadiReference, referenceNid;
    
    bundle = Omadi.data.getBundle(node.type);
    
    street = "";
    city = "";
    state = "";
    zip = "";
    
    locationFieldName = null;
    
    if(typeof bundle.data !== 'undefined' &&
        typeof bundle.data.dispatch !== 'undefined' && 
        typeof bundle.data.dispatch.dispatch_location_field !== 'undefined'){
        
            locationFieldParts = bundle.data.dispatch.dispatch_location_field.split('|');
            locationFieldBundle = locationFieldParts[0];
            locationFieldOmadiReference = locationFieldParts[1];
            locationFieldName = locationFieldParts[2];
            
            if(locationFieldBundle != node.type){
                if(typeof node[locationFieldOmadiReference] !== 'undefined' &&
                   typeof node[locationFieldOmadiReference].dbValues !== 'undefined' && 
                   typeof node[locationFieldOmadiReference].dbValues[0] !== 'undefined'){
                       referenceNid = parseInt(node[locationFieldOmadiReference].dbValues[0], 10);
                       
                       if(!isNaN(referenceNid)){
                           // Change the node to the referenced parent node
                           node = Omadi.data.nodeLoad(referenceNid);
                           if(node == null){
                               Omadi.service.sendErrorReport("reference node null for address: " + JSON.stringify(node) + JSON.strigify(bundle));
                               alert("The street address is blank, so directions cannot be opened.");
                           }
                       }
                       else{
                           Omadi.service.sendErrorReport("reference nid Street is not filled in: " + JSON.stringify(node) + JSON.strigify(bundle));
                           alert("The street address is blank, so directions cannot be opened.");
                       }
                }
            }
    }
    
    if(locationFieldName !== null){
        
        fieldName = locationFieldName + "___street";
        if(typeof node[fieldName] !== 'undefined'){
            street = node[fieldName].dbValues[0];
        }
        
        fieldName = locationFieldName + "___city";
        if(typeof node[fieldName] !== 'undefined'){
            city = node[fieldName].dbValues[0];
        }
        
        fieldName = locationFieldName + "___province";
        if(typeof node[fieldName] !== 'undefined'){
            state = node[fieldName].dbValues[0];
        }
        
        fieldName = locationFieldName + "___postal_code";
        if(typeof node[fieldName] !== 'undefined'){
            zip = node[fieldName].dbValues[0];
        }
        
        address = street + " " + city + ", " + state + " " + zip;
        
        if(street.length > 0){
            Omadi.display.getDrivingDirectionsTo(address);
        }
        else{
            Omadi.service.sendErrorReport("Street is not filled in: " + locationFieldName + " " + address + JSON.stringify(node));
            alert("The street address is blank, so directions cannot be opened.");
        }
    }
    else{
        Omadi.service.sendErrorReport("Could not find locationFieldName: " + JSON.stringify(node) + JSON.stringify(bundle));
        alert("The directions could not be opened. Please try again later.");
    }  
};

// Omadi.bundles.dispatch.openDirectionsToFirstAddress = function(node){"use strict";
    // var firstLocationFieldName, index, fieldName, street, city, state, zip, address, instances;
//     
    // instances = Omadi.data.getFields(node.type);
//     
    // firstLocationFieldName = "";
//                 
    // for(index in instances){
        // if(instances.hasOwnProperty(index)){
            // if(instances[index].type == 'location'){
                // Ti.API.debug(instances[index]);
                // firstLocationFieldName = instances[index].field_name.split('___');
                // firstLocationFieldName = firstLocationFieldName[0];
                // break;
            // }
        // }
    // }
//     
    // if(firstLocationFieldName.length){
//         
        // for(index in instances){
            // if(instances.hasOwnProperty(index)){
                // if(instances[index].type == 'location'){
                    // switch(instances[index].part){
                        // case 'street':
                            // fieldName = firstLocationFieldName + "___street";
                            // street = node[fieldName].dbValues[0]; break;
                        // case 'city':
                            // fieldName = firstLocationFieldName + "___city";
                            // city = node[fieldName].dbValues[0]; break;
                        // case 'province':
                            // fieldName = firstLocationFieldName + "___province";
                            // state = node[fieldName].dbValues[0]; break;
                        // case 'postal_code':
                            // fieldName = firstLocationFieldName + "___postal_code";
                            // zip = node[fieldName].dbValues[0]; break;
                    // }
                // }
            // }
        // }
//         
        // address = street + " " + city + ", " + state + " " + zip;
//         
        // Omadi.display.getDrivingDirectionsTo(address);
    // }
    // else{
        // alert("An unknown error occurred. Please contact support.");
    // }  
// };

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
            
                    Omadi.service.fetchedJSON = JSON.parse(this.responseText);            
                    Omadi.data.processFetchedJson();
                    
                    if(!Omadi.service.fetchedJSON.dispatch_accept_job.success){
                        alert(Omadi.service.fetchedJSON.dispatch_accept_job.text);
                    }
                }
                else {
                    alert("The job was not accepted because an unknown error occurred.");
                    Omadi.service.sendErrorReport("Bad response text for accept job: " + this.responseText);
                }                    

                Omadi.data.setUpdating(false);
                Ti.App.fireEvent('omadi:finishedDataSync');
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

Omadi.bundles.dispatch.compareStatuses = function(status1, status2){"use strict";
    var statuses, status1Index, status2Index;
    
    statuses = [
            'call_received',
            'dispatching_call',
            'job_accepted',
            'driving_to_job',
            'arrived_at_job',
            'towing_vehicle',
            'arrived_at_destination',
            'job_complete'
    ];
    
    status1Index = statuses.indexOf(status1);
    status2Index = statuses.indexOf(status2);
    
    if(status1Index != -1 && status2Index != -1){
        if(status1Index < status2Index){
            return -1;
        }
        
        if(status1Index > status2Index){
            return 1;
        }
        return 0;
    }
   
    return false;
};

Omadi.bundles.dispatch.checkInsertNode = function(insert){"use strict";
    /*jslint nomen:true*/
     var userUID, uidIndex, showNewDispatch;
     userUID = Omadi.utils.getUid();
     showNewDispatch = false;
     
     Ti.API.info("Inserting a dispatch node");
     
     if(typeof insert._no_dispatch_popup !== 'undefined'){
         if(insert._no_dispatch_popup){
             // Do not add this to the list for a popup since the server says no
             return;
         }
     }
     
     // Show if assigned
     if(insert.send_dispatch_requests_to !== 'undefined'){
         if(Omadi.utils.isArray(insert.send_dispatch_requests_to)){
             for(uidIndex in insert.send_dispatch_requests_to){
                 if(insert.send_dispatch_requests_to.hasOwnProperty(uidIndex)){
                    if(userUID == insert.send_dispatch_requests_to[uidIndex]){
                        showNewDispatch = true;
                    }
                 }
             }
         }
         else if(userUID == insert.send_dispatch_requests_to){
             showNewDispatch = true;
         }
     }
     
     // Show if it's the driver
     if(insert.dispatched_to_driver !== 'undefined'){
         if(Omadi.utils.isArray(insert.dispatched_to_driver)){
             for(uidIndex in insert.dispatched_to_driver){
                 if(insert.dispatched_to_driver.hasOwnProperty(uidIndex)){
                    if(userUID == insert.dispatched_to_driver[uidIndex]){
                        showNewDispatch = true;
                    }
                 }
             }
         }
         else if(userUID == insert.send_dispatch_requests_to){
             showNewDispatch = true;
         }
     }
     
     if(showNewDispatch){
         // The user is part of this dispatch, so possibly dispatch if the below is true
         
         if(typeof insert.field_dispatching_status !== 'undefined' && insert.field_dispatching_status == 'dispatching_call'){
             // The job is being dispatched or re-dispatched, so show the jobs dialog
             // the job has been re-dispatched
             showNewDispatch = true;
         }
         else if(insert.viewed > 0){
             // This is not checked when calling this function like it is for notifications
             // Make sure the dispatch isn't shows when changed and not required to see the popup
             // as defined just above
             showNewDispatch = false;
         }
     }
     
     if(showNewDispatch){
        Ti.App.Properties.setBool('newDispatchJob', true);
     }
};

Omadi.bundles.dispatch.getStatusOptions = function(nid){"use strict";
    var options, db, result, termResult, vid, dispatchBundle, node, i, j,
        excludeKeys, excludeStatuses, 
        currentStatusKey, currentStatus, status, useKey, dispatchNode, dispatchNid,
        dispatchInstances, statusInstance, fieldOptions, maxStatusToShow, 
        currentFormPart, workNodeTypeInfo, formPartStatus, formPartIndex, statusCompare;
    
    options = [];
    
    node = Omadi.data.nodeLoad(nid);
    
    if(node){
        dispatchNid = node.dispatch_nid;
        dispatchNode = Omadi.data.nodeLoad(dispatchNid);
        
        if(dispatchNode){
            
            currentStatusKey = dispatchNode.field_dispatching_status.dbValues[0];
            dispatchInstances = Omadi.data.getFields('dispatch');
            
            currentFormPart = node.form_part;
            maxStatusToShow = '_none';
            workNodeTypeInfo = Omadi.data.getBundle(node.type);
            
            if(typeof workNodeTypeInfo.data.dispatch !== 'undefined' && typeof workNodeTypeInfo.data.dispatch.dispatch_parts !== 'undefine'){
                
                for(formPartIndex in workNodeTypeInfo.data.dispatch.dispatch_parts){
                    if(workNodeTypeInfo.data.dispatch.dispatch_parts.hasOwnProperty(formPartIndex)){
                        formPartStatus = workNodeTypeInfo.data.dispatch.dispatch_parts[formPartIndex];
                        
                        if(formPartStatus != null && formPartStatus > ""){
                            if(formPartIndex > currentFormPart){
                                maxStatusToShow = formPartStatus;
                                break;
                            }
                        }
                    }
                }
            }
            
            statusCompare = Omadi.bundles.dispatch.compareStatuses(currentStatusKey, maxStatusToShow);
            
            if(statusCompare < 0 || statusCompare === false){
            
                if(typeof dispatchInstances.field_dispatching_status !== 'undefined'){
                    statusInstance = dispatchInstances.field_dispatching_status;
                    fieldOptions = Omadi.widgets.list_text.getOptions(statusInstance);
                    
                    switch(currentStatusKey){
                        
                        case 'call_received':
                        case 'dispatching_call':
                            
                            options.push({
                               dbValue: 'job_accepted',
                               title: 'Job Accepted',
                               nextPart: false
                            });
                            
                            /*fall through*/
                            
                        case 'job_accepted':
                            
                            if(maxStatusToShow == 'driving_to_job'){
                                options.push({
                                   dbValue: 'driving_to_job',
                                   title: 'Driving to Job +',
                                   nextPart: true
                                });
                                break;
                            }
                            else{
                                options.push({
                                   dbValue: 'driving_to_job',
                                   title: 'Driving to Job',
                                   nextPart: false
                                });
                            }
                            
                            /*fall through*/
                            
                        case 'driving_to_job':
                            
                            if(maxStatusToShow == 'arrived_at_job'){
                                options.push({
                                   dbValue: 'arrived_at_job',
                                   title: 'Arrived at Job +',
                                   nextPart: true
                                });
                                break;
                            }
                            else{
                                options.push({
                                   dbValue: 'arrived_at_job',
                                   title: 'Arrived at Job',
                                   nextPart: false
                                });
                            }
                            
                            /*fall through*/
                            
                        case 'arrived_at_job':
                            
                            if(maxStatusToShow == 'towing_vehicle'){
                                options.push({
                                   dbValue: 'towing_vehicle',
                                   title: 'Towing Vehicle +',
                                   nextPart: true
                                });
                                break;
                            }
                            else{
                                options.push({
                                   dbValue: 'towing_vehicle',
                                   title: 'Towing Vehicle',
                                   nextPart: false
                                });
                            }
                            
                            /*fall through*/
                            
                        case 'towing_vehicle':
                            
                            if(maxStatusToShow == 'arrived_at_destination'){
                                options.push({
                                   dbValue: 'arrived_at_destination',
                                   title: 'Arrived at Destination +',
                                   nextPart: true
                                });
                                break;
                            }
                            else{
                                options.push({
                                   dbValue: 'arrived_at_destination',
                                   title: 'Arrived at Destination',
                                   nextPart: false
                                });
                            }
                            
                            /*fall through*/
                            
                        case 'arrived_at_destination':
                            
                            if(maxStatusToShow == 'job_complete'){
                                options.push({
                                   dbValue: 'job_complete',
                                   title: 'Job Complete +',
                                   nextPart: true
                                });
                                break;
                            }
                            else{
                                options.push({
                                   dbValue: 'job_complete',
                                   title: 'Job Complete',
                                   nextPart: false
                                });
                            }
            
                            break;
                    }
                }
            }
        }
    }
    
    return options;
};

Omadi.bundles.dispatch.isDispatch = function(type, nid){"use strict";
    var db, result, formWindow, intNid, isDispatch, dispatchNid, bundle;
    
    isDispatch = false;
   
    if(type == 'dispatch'){
        isDispatch = true;
    }
    else{
        intNid = parseInt(nid, 10);
        if(!isNaN(intNid)){
            db = Omadi.utils.openMainDatabase();
            result = db.execute("SELECT dispatch_nid FROM node where nid = " + intNid);
            if(result.isValidRow()){
                dispatchNid = result.field(0, Ti.Database.FIELD_TYPE_INT);
                if(dispatchNid != 0){
                    isDispatch = true;
                }
            }
            result.close();
            db.close();   
        }
        else{
            // This is a new node from plus button
            bundle = Omadi.data.getBundle(type);
            if(typeof bundle.data.dispatch !== 'undefined' && typeof bundle.data.dispatch.force_dispatch !== 'undefined' && bundle.data.dispatch.force_dispatch == 1){
                // Do not allow a force dispatch to create its own node without a dispatch node
                isDispatch = true;
            }
        }
    }  
    
    return isDispatch;
};

Omadi.bundles.dispatch.updateStatus = function(nid, status, background){"use strict";
    var dialog, http;
    
    if(typeof background === 'undefined'){
        background = false;
    }
    
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
        
        if(background){
          // TODO: update the dispatch node in the local database and set the dispatch timestmap and status  
        }
    }
    else{
        
        if(!background){
            Omadi.display.loading('Updating...');
        }
        
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
        
                Omadi.service.fetchedJSON = JSON.parse(this.responseText);            
                Omadi.data.processFetchedJson();
                
                if(!background && !Omadi.service.fetchedJSON.dispatch_update_status.success){
                    alert(Omadi.service.fetchedJSON.dispatch_update_status.text);
                }
            }
            else{
                if(!background){
                    alert("The status was not updated because an unknown error occurred.");
                }
                Omadi.service.sendErrorReport("Bad response text for update dispatch status: " + this.responseText);
            }
    
            Omadi.data.setUpdating(false);
            Ti.App.fireEvent('omadi:finishedDataSync');
        };
    
        http.onerror = function(e) {
            var dialog;
            
            Omadi.display.doneLoading();
    
            dialog = Ti.UI.createAlertDialog({
                message : 'An error occured. Please try again.',
                buttonNames: ['OK']
            });
            
            if(!background){
                if ( typeof alertQueue !== 'undefined') {
                    alertQueue.push(dialog);
                }
                else {
                    dialog.show();
                }
            }
            
            Omadi.service.sendErrorReport('Could not update status: ' + JSON.stringify(e));
        };
        
        http.send(JSON.stringify({
            nid: nid,
            status: status
        }));
    }
};

Omadi.bundles.dispatch.showUpdateStatusDialog = function(args){"use strict";
    
    var http, dialog, nid = 0, node, statusDialog, statusOptions, options, i;
    
    if(typeof args[0] !== 'undefined'){
        nid = args[0];
    }
    
    if(nid){
        
        statusOptions = Omadi.bundles.dispatch.getStatusOptions(nid);
        
        if(statusOptions.length == 0){
            statusDialog = Ti.UI.createAlertDialog({
                title: 'Update Form Info First',
                message: 'Go to the form now?',
                buttonNames: ['Yes', 'Cancel'] 
            });
            
            statusDialog.addEventListener('click', function(e){
                if(e.index === 0){
                    node = Omadi.data.nodeLoad(nid);
                    
                    Omadi.display.openFormWindow(node.type, node.nid, node.form_part + 1);
                }
            });
            
            statusDialog.show();
        }
        else{
        
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
                    
                    if(statusOptions[e.index].nextPart){
                        node = Omadi.data.nodeLoad(nid);
                        Omadi.display.openFormWindow(node.type, node.nid, node.form_part + 1)
                    }
                    else{
                        Omadi.bundles.dispatch.updateStatus(nid, status);
                    }
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
    var newJobs, db, result, sql, nowTimestamp, dispatchBundle, newDispatchNids, i, 
        jobDiscontinued, nid, title, viewed, type, changed;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
    
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, n.title, n.viewed, n.table_name, dispatch.job_discontinued, n.changed FROM dispatch ";
        sql += "INNER JOIN node n ON n.dispatch_nid = dispatch.nid ";
        sql += "WHERE n.dispatch_nid > 0 ";
        sql += "AND dispatch.dispatched_to_driver IS NULL "; 
        sql += "AND dispatch.field_dispatching_status != 'job_complete'";
        result = db.execute(sql);
        
        newDispatchNids = [];
        while(result.isValidRow()){
            jobDiscontinued = result.fieldByName('job_discontinued');
            nid = result.fieldByName('nid');
            title = result.fieldByName('title');
            viewed = result.fieldByName('viewed');
            type = result.fieldByName('table_name');
            
            if(jobDiscontinued != null && jobDiscontinued > ""){
                // This job has been discontinued
                // We never want a discontinued job to show up in the new jobs list
            }
            else{
                newJobs.push({
                   nid: nid,
                   title: title,
                   viewed: viewed,
                   type: type,
                   isDiscontinued: false
                });
            }
            
            result.next();
        }
        result.close();
        db.close();
    }
    
    return newJobs;
};

Omadi.bundles.dispatch.getCurrentUserJobs = function(){"use strict";
    /*global list_search_node_matches_search_criteria*/
    var newJobs, db, result, sql, nowTimestamp, currentUserUid, 
        i, nid, title, viewed, type, dispatchBundle, jobDiscontinued, changed, isDiscontinued;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Omadi.data.getBundle('dispatch');
    
    if(dispatchBundle){
        
        currentUserUid = Omadi.utils.getUid();
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, n.title, n.viewed, n.table_name, dispatch.job_discontinued, n.changed FROM dispatch ";
        sql += "INNER JOIN node n ON n.dispatch_nid = dispatch.nid ";
        sql += "WHERE n.dispatch_nid > 0 ";
        sql += "AND dispatch.dispatched_to_driver = " + currentUserUid + " "; 
        sql += "AND (dispatch.field_dispatching_status IS NULL OR dispatch.field_dispatching_status <> 'job_complete') ";
        
        result = db.execute(sql);
        
        while(result.isValidRow()){
            jobDiscontinued = result.fieldByName('job_discontinued');
            nid = result.fieldByName('nid');
            title = result.fieldByName('title');
            viewed = result.fieldByName('viewed');
            type = result.fieldByName('table_name');
            
            if(jobDiscontinued != null && jobDiscontinued > ""){
                // This job has been discontinued
                changed = result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT);
                if(nowTimestamp - changed < 900){
                    // Only show the job if it was changed in the last 15 minutes
                    newJobs.push({
                       nid: nid,
                       title: title,
                       viewed: viewed,
                       type: type,
                       isDiscontinued: true
                    });
                }
            }
            else{
                newJobs.push({
                   nid: nid,
                   title: title,
                   viewed: viewed,
                   type: type,
                   isDiscontinued: false
                });
            }
            result.next();
        }
        result.close();
        db.close();
        
    }
    
    return newJobs;
};

