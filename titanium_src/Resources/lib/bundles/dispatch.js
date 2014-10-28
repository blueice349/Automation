/*jslint eqeq:true,plusplus:true,nomen:true*/
/*global isJsonString*/


Omadi.bundles.dispatch = {};

var Utils = require('lib/Utils');
var DispatchBundle = require('lib/bundles/DispatchBundle');
var AlertQueue = require('lib/AlertQueue');

Omadi.bundles.dispatch.showJobsScreen = function(){"use strict";
    return DispatchBundle.showJobsScreen();
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
            
            AlertQueue.enqueue(dialog);
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
        Utils.sendErrorReport('No NID to get driving directions');
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
                               Utils.sendErrorReport("reference node null for address: " + JSON.stringify(node) + JSON.strigify(bundle));
                               alert("The street address is blank, so directions cannot be opened.");
                           }
                       }
                       else{
                           Utils.sendErrorReport("reference nid Street is not filled in: " + JSON.stringify(node) + JSON.strigify(bundle));
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
            alert("The street address is blank, so directions cannot be opened.");
        }
    }
    else{
        Utils.sendErrorReport("Could not find locationFieldName: " + JSON.stringify(node) + JSON.stringify(bundle));
        alert("The directions could not be opened. Please try again later.");
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
            
            AlertQueue.enqueue(dialog);
        }
        else{
            
            Omadi.display.loading('Accepting...');
            Omadi.data.setUpdating(true);
            
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 15000
            });
            
            http.open('POST', Ti.App.DOMAIN_NAME + '/js-dispatch/dispatch/accept_job.json');
        
            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
            
            http.onload = function(e) {
                var json;
                
                Omadi.display.doneLoading();
                
                if (this.responseText !== null && isJsonString(this.responseText) === true) {
            
                    json = JSON.parse(this.responseText);            
                    Omadi.data.processFetchedJson(json);
                    
                    if(!json.dispatch_accept_job.success){
                        alert(json.dispatch_accept_job.text);
                    }
                }
                else {
                    alert("The job was not accepted because an unknown error occurred.");
                    Utils.sendErrorReport("Bad response text for accept job: " + this.responseText);
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
                
                AlertQueue.enqueue(dialog);
                
                Utils.sendErrorReport('Could not accept job' + JSON.stringify(e));
            };
            
            http.send(JSON.stringify({
                nid: nid,
                sync_timestamp: Omadi.data.getLastUpdateTimestamp()
            }));
        }
    }
    else{
        Utils.sendErrorReport('No NID to accept job');
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

Omadi.bundles.dispatch.hasStatusOption = function(fieldOptions, status){"use strict";
    var statusTitle = false;
    for(var i = 0; i < fieldOptions.length; i ++){
        if(fieldOptions[i].dbValue == status){
            statusTitle = fieldOptions[i].title;
            break;   
        }
    }
    
    return statusTitle;
};

Omadi.bundles.dispatch.getStatusOptions = function(nid){"use strict";
    var options, db, result, termResult, vid, dispatchBundle, node, i, j,
        excludeKeys, excludeStatuses, 
        currentStatusKey, currentStatus, status, useKey, dispatchNode, dispatchNid,
        dispatchInstances, statusInstance, fieldOptions, maxStatusToShow, 
        currentFormPart, workNodeTypeInfo, formPartStatus, formPartIndex, statusCompare, statusTitle;
    
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
            
            if(typeof workNodeTypeInfo.data.dispatch !== 'undefined' && typeof workNodeTypeInfo.data.dispatch.dispatch_parts !== 'undefined'){
                
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
                    var ListTextWidget = require('ui/widget/ListText');
                    fieldOptions = ListTextWidget.getOptions(statusInstance);
                    
                    switch(currentStatusKey){
                        case 'call_received':
                        case 'dispatching_call':
                            statusTitle = Omadi.bundles.dispatch.hasStatusOption(fieldOptions, 'job_accepted');
                            
                            if(statusTitle !== false){
                                options.push({
                                   dbValue: 'job_accepted',
                                   title: statusTitle,
                                   nextPart: false
                                });
                            }
                            
                            /*fall through*/
                            
                        case 'job_accepted':
                            
                            statusTitle = Omadi.bundles.dispatch.hasStatusOption(fieldOptions, 'driving_to_job');
                            
                            if(maxStatusToShow == 'driving_to_job'){
                               if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'driving_to_job',
                                       title: statusTitle + ' +',
                                       nextPart: true
                                    });
                                }
                                break;
                            }
                            else{
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'driving_to_job',
                                       title: statusTitle,
                                       nextPart: false
                                    });
                                }
                            }
                            
                            /*fall through*/
                            
                        case 'driving_to_job':
                            
                            statusTitle = Omadi.bundles.dispatch.hasStatusOption(fieldOptions, 'arrived_at_job');
                            if(maxStatusToShow == 'arrived_at_job'){
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'arrived_at_job',
                                       title: statusTitle + ' +',
                                       nextPart: true
                                    });
                                }
                                break;
                            }
                            else{
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'arrived_at_job',
                                       title: statusTitle,
                                       nextPart: false
                                    });
                                }
                            }
                            
                            /*fall through*/
                            
                        case 'arrived_at_job':
                            
                            statusTitle = Omadi.bundles.dispatch.hasStatusOption(fieldOptions, 'towing_vehicle');
                            if(maxStatusToShow == 'towing_vehicle'){
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'towing_vehicle',
                                       title: statusTitle + ' +',
                                       nextPart: true
                                    });
                                }
                                break;
                            }
                            else{
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'towing_vehicle',
                                       title: statusTitle,
                                       nextPart: false
                                    });
                                }
                            }
                            
                            /*fall through*/
                            
                        case 'towing_vehicle':
                            
                            statusTitle = Omadi.bundles.dispatch.hasStatusOption(fieldOptions, 'arrived_at_destination');
                            if(maxStatusToShow == 'arrived_at_destination'){
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'arrived_at_destination',
                                       title: statusTitle + ' +',
                                       nextPart: true
                                    });
                                }
                                break;
                            }
                            else{
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'arrived_at_destination',
                                       title: statusTitle,
                                       nextPart: false
                                    });
                                }
                            }
                            
                            /*fall through*/
                            
                        case 'arrived_at_destination':
                            
                            statusTitle = Omadi.bundles.dispatch.hasStatusOption(fieldOptions, 'job_complete');
                            if(maxStatusToShow == 'job_complete'){
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'job_complete',
                                       title: statusTitle + ' +',
                                       nextPart: true
                                    });
                                }
                                break;
                            }
                            else{
                                if(statusTitle !== false){
                                    options.push({
                                       dbValue: 'job_complete',
                                       title: statusTitle,
                                       nextPart: false
                                    });
                                }
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

Omadi.bundles.dispatch.updateStatusOffline = function(nid, status){"use strict";
    var dispatchNode = Omadi.data.nodeLoad(nid), updated = false;
    
    try{
        if(dispatchNode && dispatchNode.type !== 'dispatch'){
            if(dispatchNode.dispatch_nid > 0){
                dispatchNode = Omadi.data.nodeLoad(dispatchNode.dispatch_nid);   
            }
        }
        
        if(dispatchNode){
            
            // Set the new status
            dispatchNode.field_dispatching_status = {
               dbValues : [status],
               // Don't need the textValues for a correct node save
               textValues : ['']  
            };
            
            var timestamp = Utils.getUTCTimestampServerCorrected();
            
            var nowValues = {
                dbValues: [timestamp],
                // Don't need the textValues for a correct node save
                textValues: ['']
            };
                        
            switch(status){
                case 'pending':
                case 'call_received':
                    // Do nothing
                    break;
                case 'dispatching_call':
                    if(!dispatchNode.job_dispatched_time || !dispatchNode.job_dispatched_time.dbValues || !dispatchNode.job_dispatched_time.dbValues[0]){
                        dispatchNode.job_dispatched_time = nowValues;
                    }
                    break;
                case 'job_accepted':
                    if(!dispatchNode.job_accepted_time || !dispatchNode.job_accepted_time.dbValues || !dispatchNode.job_accepted_time.dbValues[0]){
                        dispatchNode.job_accepted_time = nowValues;
                    }
                    break;
                case 'driving_to_job':
                    if(!dispatchNode.started_driving_time || !dispatchNode.started_driving_time.dbValues || !dispatchNode.started_driving_time.dbValues[0]){
                        dispatchNode.started_driving_time = nowValues;
                    }
                    break;
                case 'arrived_at_job':
                    if(!dispatchNode.arrived_at_job_time || !dispatchNode.arrived_at_job_time.dbValues || !dispatchNode.arrived_at_job_time.dbValues[0]){
                        dispatchNode.arrived_at_job_time = nowValues;
                    }
                    break;
                case 'towing_vehicle':
                    if(!dispatchNode.started_towing_time || !dispatchNode.started_towing_time.dbValues || !dispatchNode.started_towing_time.dbValues[0]){
                        dispatchNode.started_towing_time = nowValues;
                    }
                    break;
                case 'arrived_at_destination':
                    if(!dispatchNode.arrived_at_destination_time || !dispatchNode.arrived_at_destination_time.dbValues || !dispatchNode.arrived_at_destination_time.dbValues[0]){
                        dispatchNode.arrived_at_destination_time = nowValues;
                    }
                    break;
                case 'job_complete':
                    if(!dispatchNode.job_complete_time || !dispatchNode.job_complete_time.dbValues || !dispatchNode.job_complete_time.dbValues[0]){
                        dispatchNode.job_complete_time = nowValues;
                    }
                    break;
            }
            
            var node = Omadi.data.nodeSave(dispatchNode);
            
            if(node._saved){
                updated = true;
            }
        }
    }
    catch(ex){
        Utils.sendErrorReport("Exception updating the dispatch status offline: " + ex);
    }
    
    return updated;
};

Omadi.bundles.dispatch.updateStatus = function(nid, status, background){"use strict";
    var dialog, http, savedLocally, json;
    
    if(typeof background === 'undefined'){
        background = false;
    }
    
    // Always update the node locally
    savedLocally = Omadi.bundles.dispatch.updateStatusOffline(nid, status);
    
    if(!savedLocally){
        if(!background){
            // If not on a form, let the user know there was a problem
            alert('An error occurred while updating the status. Please try again.');
        }
    } else{
        if(Ti.Network.online){
            // With an Internet connection, send the status to the server immediately
            
            // Must set updating, because this is also being used as a regular sync in case any permissions 
            // are updated (if an Internet connection exists and the response is fine)
            Omadi.data.setUpdating(true);
            
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 15000
            });
            
            http.open('POST', Ti.App.DOMAIN_NAME + '/js-dispatch/dispatch/update_status.json');
        
            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
            
            http.onload = function(e) {
                if (this.responseText !== null && isJsonString(this.responseText) === true) {
            
                    json = JSON.parse(this.responseText);            
                    Omadi.data.processFetchedJson(json);
                    
                    if(!background && !json.dispatch_update_status.success){
                        alert(json.dispatch_update_status.text);
                    }
                }
                else{
                    if(!background){
                        alert("The status was not updated because an unknown error occurred.");
                    }
                    Utils.sendErrorReport("Bad response text for discontinue job: " + this.responseText);
                }  
            };
            
            http.onload = function(e) {
                
                try{
                    if (this.responseText !== null && isJsonString(this.responseText) === true) {
                
                        json = JSON.parse(this.responseText);            
                        Omadi.data.processFetchedJson(json);
                        
                        if(!background && !json.dispatch_update_status.success){
                            alert(json.dispatch_update_status.text);
                        }
                    }
                    else{
                        if(!background){
                            alert('The status was not updated because an unknown error occurred.');
                        }
                        Utils.sendErrorReport("Bad response text for discontinue job: " + this.responseText);
                    }
                } catch(ex){
                    Utils.sendErrorReport('Exception onload of discontinue job: ' + ex);
                }
                
                // Let the system do other syncs
                Omadi.data.setUpdating(false);
                Ti.App.fireEvent('omadi:finishedDataSync');
            };
            
            http.onerror = function(e) {
                // Let the system do other syncs
                Omadi.data.setUpdating(false);
                
                if(e.code == 500){
                    // Send an error only on a server error
                    Utils.sendErrorReport('Could not update status: ' + JSON.stringify(e));
                }
                
                if(!background){
                    // Only when the user is not on a form, popup the error
                    alert("The status failed to update online, but it will update on the next mobile sync.");
                }
            };
            
            http.send(JSON.stringify({
                nid: nid,
                status: status,
                sync_timestamp: Omadi.data.getLastUpdateTimestamp()
            }));
            
        } else if(!background){
            // Show the user a dialog when not on a form
            dialog = Ti.UI.createAlertDialog({
                buttonNames: ['Ok'],
                title: 'No Internet Connection',
                message: 'The status was saved, but it will not be sent to dispatch until you have an Internet connection.' 
            }).show();
        }
    }
};

Omadi.bundles.dispatch.discontinueJobOffline = function(nid, status){"use strict";
    
    var dispatchNode = Omadi.data.nodeLoad(nid), updated = false;
    
    try{
        if(dispatchNode && dispatchNode.type !== 'dispatch'){
            if(dispatchNode.dispatch_nid > 0){
                dispatchNode = Omadi.data.nodeLoad(dispatchNode.dispatch_nid);   
            }
        }
        
        if(dispatchNode){
            
            // Set the new status
            dispatchNode.job_discontinued = {
               dbValues : [status],
               // Don't need the textValues for a correct node save
               textValues : ['']  
            };
            
            dispatchNode.time_discontinued = {
               dbValues : [Utils.getUTCTimestampServerCorrected()],
               // Don't need the textValues for a correct node save
               textValues : ['']  
            };
            
            var node = Omadi.data.nodeSave(dispatchNode);
            
            if(node._saved){
                updated = true;
            }
        }
    } catch(ex){
        Utils.sendErrorReport('Exception in discontinueJobOffline: ' + ex);
    }
    
    return updated;
};

Omadi.bundles.dispatch.discontinueJob = function(nid, status, background){"use strict";
    var dialog, http, savedLocally;
    
    if(typeof background === 'undefined'){
        background = false;
    }
    
    // Always update the node locally
    savedLocally = Omadi.bundles.dispatch.discontinueJobOffline(nid, status);
    
    if(!savedLocally){
        if(!background){
            // If not on a form, let the user know there was a problem
            alert('An error occurred while discontinuing the job. Please try again.');
        }
    } else{
        
        if(Ti.Network.online){
            
            // Must set updating, because this is also being used as a regular sync in case any permissions 
            // are updated (if an Internet connection exists and the response is fine)
            Omadi.data.setUpdating(true);
            
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false,
                timeout: 15000
            });
    
            http.open('POST', Ti.App.DOMAIN_NAME + '/js-dispatch/dispatch/discontinue_job.json');
        
            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
        
            http.onload = function(e) {
                try{
                    if (this.responseText !== null && isJsonString(this.responseText) === true) {
                
                        var json = JSON.parse(this.responseText);            
                        Omadi.data.processFetchedJson(json);
                        
                        if(!background && !json.dispatch_update_status.success){
                            alert(json.dispatch_update_status.text);
                        }
                    }
                    else{
                        if(!background){
                            alert('The status was not updated because an unknown error occurred.');
                        }
                        Utils.sendErrorReport("Bad response text for discontinue job: " + this.responseText);
                    }
                } catch(ex){
                    Utils.sendErrorReport('Exception onload of discontinue job: ' + ex);
                }
                
                // Let the system do other syncs
                Omadi.data.setUpdating(false);
                Ti.App.fireEvent('omadi:finishedDataSync');
            };
        
            http.onerror = function(e) {
                
                // Let the system do other syncs
                Omadi.data.setUpdating(false);
                
                if(!background){
                    // Only when the user is not on a form, popup the error
                    alert("The job failed to update online, but it will update on the next mobile sync.");
                }
                
                if(e.code == 500){
                    Utils.sendErrorReport('Could not discontinue job: ' + JSON.stringify(e));
                }
            };
            
            http.send(JSON.stringify({
                nid: nid,
                status: status,
                sync_timestamp: Omadi.data.getLastUpdateTimestamp()
            }));
            
        } else if(!background){
            // Show the user a dialog when not on a form
            dialog = Ti.UI.createAlertDialog({
                buttonNames: ['Ok'],
                title: 'No Internet Connection',
                message: 'The job was discontinued, but it will not be sent to dispatch until you have an Internet connection.' 
            }).show();
        }
    }
};

Omadi.bundles.dispatch.showUpdateStatusDialog = function(args){"use strict";
    
    var http, dialog, nid = 0, node, statusDialog, statusOptions, options;
    
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
                try{
                    if(e.index === 0){
                        Omadi.display.loading();
                       
                        node = Omadi.data.nodeLoad(nid);
                        
                        Ti.App.fireEvent('openFormWindow', {
                            node_type: node.type, 
                            nid: node.nid, 
                            form_part: node.form_part + 1
                        });
                        
                        setTimeout(Omadi.display.doneLoading, 5000);
                    }
                }
                catch(ex){
                    Utils.sendErrorReport("exception update form info first: " + ex);
                }
            });
            
            statusDialog.show();
        }
        else{
        
            options = [];
            for(var i = 0; i < statusOptions.length; i ++){
                options.push(statusOptions[i].title);
            }
            
            options.push('Cancel');
            
            statusDialog = Ti.UI.createOptionDialog({
               title: 'Update Job Status To',
               options: options,
               cancel: (options.length - 1)
            });
            
            statusDialog.addEventListener('click', function(e){
                try{
                    if(e.index >= 0 && e.index != statusDialog.cancel){
                        var status = statusOptions[e.index].dbValue;
                        
                        if(statusOptions[e.index].nextPart){
                            
                            Omadi.display.loading();
                            
                            node = Omadi.data.nodeLoad(nid);
                            if(node){
                                Ti.App.fireEvent('openFormWindow', {
                                    node_type: node.type,
                                    nid: node.nid,
                                    form_part: node.form_part + 1
                                });
                                setTimeout(Omadi.display.doneLoading, 5000);
                            }
                            else{
                                Omadi.display.doneLoading();
                                alert("The form you were trying to update was not found on your device.");
                            }
                        }
                        else{
                            Omadi.bundles.dispatch.updateStatus(nid, status);
                        }
                    }
                }
                catch(ex){
                    Utils.sendErrorReport("Exception updating job status: " + ex);
                }
            });
            
            statusDialog.show();
        }
    }
    else{
        Utils.sendErrorReport('No NID to accept job');
        alert("An unknown error occurred attempting to update the status.");
    }
};

Omadi.bundles.dispatch.showDiscontinueJobDialog = function(args){"use strict";
    
    var http, dialog, nid = 0, node, discontinueDialog, discontinueOptions, options, i, discontinueInstances;
    
    if(typeof args[0] !== 'undefined'){
        nid = args[0];
    }
    
    if(nid != 0){
        
        discontinueInstances = Omadi.data.getFields('dispatch');
        if(typeof discontinueInstances.job_discontinued !== 'undefined'){
            Ti.API.debug("has job discontinued");
            
            var ListTextWidget = require('ui/widget/ListText');
            discontinueOptions = ListTextWidget.getOptions(discontinueInstances.job_discontinued);
            
            if(discontinueOptions.length > 0){
                
                if(discontinueOptions[0].dbValue == null){
                    // Remove the first element if it is null
                    discontinueOptions.shift();
                }
                
                Ti.API.debug("Options: " + JSON.stringify(discontinueOptions));
                
                options = [];
                for(i = 0; i < discontinueOptions.length; i ++){
                    options.push(discontinueOptions[i].title);
                }
                
                options.push('Cancel');
                
                discontinueDialog = Ti.UI.createOptionDialog({
                   title: 'Update Job Status To',
                   options: options,
                   cancel: (options.length - 1)
                });
                
                discontinueDialog.addEventListener('click', function(e){
                    try{
                        if(e.index >= 0 && e.index != discontinueDialog.cancel){
                            var status = discontinueOptions[e.index].dbValue;
                            Omadi.bundles.dispatch.discontinueJob(nid, status);
                        }
                    }
                    catch(ex){
                        Utils.sendErrorReport("Exception discontinuing job: " + ex);
                    }
                });
                
                discontinueDialog.show();
            }
        }
        else{
            alert("Job Discontinued is not setup correctly in your system. Please contact an adminitrator.");    
        }
    }
    else{
        Utils.sendErrorReport('No NID to discontinue job');
        alert("An unknown error occurred attempting to discontinue the job.");
    }  
};

Omadi.bundles.dispatch.getNewJobs = function(){"use strict";
    return DispatchBundle.getNewJobs();
};

Omadi.bundles.dispatch.getCurrentUserJobs = function(){"use strict";
	return DispatchBundle.getCurrentUserJobs();
};

