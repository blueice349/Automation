/* jshint globalstrict:true */
'use strict';

var Utils = require('lib/Utils');
var Display = require('lib/Display');
var Database = require('lib/Database');
var Node = require('objects/Node');

exports.checkInsertNode = function(insert) {
     var userUID, uidIndex, showNewDispatch;
     showNewDispatch = false;
     
     Ti.API.info("Inserting a dispatch node");
     
     if(typeof insert._no_dispatch_popup !== 'undefined'){
         if(insert._no_dispatch_popup){
             // Do not add this to the list for a popup since the server says no
             return;
         }
     }
     
     userUID = Utils.getUid();
     
     // Show if assigned
     if(insert.send_dispatch_requests_to !== 'undefined'){
         if(Utils.isArray(insert.send_dispatch_requests_to)){
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
         if(Utils.isArray(insert.dispatched_to_driver)){
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
         showNewDispatch = false;
         
         if(typeof insert.field_dispatching_status !== 'undefined' && insert.field_dispatching_status == 'dispatching_call'){
             // The job is being dispatched or re-dispatched, so show the jobs dialog
             // the job has been re-dispatched
             showNewDispatch = true;
         }
     }
     
     if(showNewDispatch){
        Ti.App.Properties.setBool('newDispatchJob', true);
     }
};

exports.showNewDispatchJobs = function() {
      var newJobs, currentUserJobs;
      
      if(Ti.App.Properties.getBool('newDispatchJob', false)){
            Ti.App.Properties.setBool('newDispatchJob', false);
            
            newJobs = exports.getNewJobs();
            if(newJobs.length > 0){
                Display.openJobsWindow();
            }
            else{
                currentUserJobs = exports.getCurrentUserJobs();
                if(currentUserJobs.length > 0){
                    Display.openJobsWindow();
                }
            }
      }
};

exports.showJobsScreen = function() {
    var bundle, retval, instances;
    
    retval = false;
    bundle = Node.getBundle('dispatch');
    
    if(bundle){
        instances = Node.getFields('dispatch');
        
        if(typeof instances.field_dispatching_status !== 'undefined'){
            retval = true;
        }
    }
    
    return retval;
};

exports.getNewJobs = function() {
    var newJobs, result, sql, nowTimestamp, dispatchBundle, newDispatchNids,
        jobDiscontinued, nid, title, viewed, type;
    
    nowTimestamp = Utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Node.getBundle('dispatch');
    
    if(dispatchBundle){
        
        sql = "SELECT n.nid, n.title, n.viewed, n.table_name, dispatch.job_discontinued, n.changed FROM dispatch ";
        sql += "INNER JOIN node n ON n.dispatch_nid = dispatch.nid ";
        sql += "WHERE n.dispatch_nid > 0 ";
        sql += "AND n.flag_is_updated != 4 ";
        sql += "AND dispatch.dispatched_to_driver IS NULL "; 
        sql += "AND dispatch.field_dispatching_status != 'job_complete'";
        result = Database.query(sql);
        
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
        Database.close();
    }
    
    return newJobs;
};

exports.getCurrentUserJobs = function() {
    var newJobs, result, sql, nowTimestamp, currentUserUid, 
        nid, title, viewed, type, dispatchBundle, jobDiscontinued, 
        changed, dispatchChanged;
    
    nowTimestamp = Utils.getUTCTimestamp();
    newJobs = [];
    dispatchBundle = Node.getBundle('dispatch');
    
    if(dispatchBundle){
        
        currentUserUid = Utils.getUid();
        
        sql = "SELECT n.nid, n.title, n.viewed, n.table_name, dispatch.job_discontinued, n.changed, n_dispatch.changed AS dispatch_changed FROM dispatch ";
        sql += "INNER JOIN node n ON n.dispatch_nid = dispatch.nid ";
        sql += "LEFT JOIN node n_dispatch ON n_dispatch.nid = dispatch.nid ";
        sql += "WHERE n.dispatch_nid > 0 ";
        sql += "AND n.flag_is_updated != 4 ";
        sql += "AND dispatch.dispatched_to_driver = " + currentUserUid + " "; 
        sql += "AND (dispatch.field_dispatching_status IS NULL OR dispatch.field_dispatching_status <> 'job_complete') ";
        
        result = Database.query(sql);
        
        while(result.isValidRow()){
            try{
                jobDiscontinued = result.fieldByName('job_discontinued');
                nid = result.fieldByName('nid');
                title = result.fieldByName('title');
                viewed = result.fieldByName('viewed');
                type = result.fieldByName('table_name');
                
                if(jobDiscontinued != null && jobDiscontinued > ""){
                    // This job has been discontinued
                    changed = result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT);
                    dispatchChanged = result.fieldByName('dispatch_changed', Ti.Database.FIELD_TYPE_INT);
                    
                    if(nowTimestamp - changed < 900 || nowTimestamp - dispatchChanged < 900){
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
            }
            catch(ex){
                Utils.sendErrorReport("Could not load dispatch job: " + ex);
            }
            
            result.next();
        }
        result.close();
        Database.close();
        
    }
    
    return newJobs;
};

