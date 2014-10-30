/*global Omadi*/
Omadi.bundles.inspection = {};

var Utils = require('lib/Utils');
var AlertQueue = require('lib/AlertQueue');

Omadi.bundles.inspection.getLastInspectionReportNid = function(vehicleNid){"use strict";
    var db, result, lastNid;
    /* Prerequisite to using this function is knowing the inspection bundle exists */
    
    lastNid = 0;
    
    if(vehicleNid > 0){
        
        if(Omadi.data.fieldExists('inspection', 'truck_reference')){
        
            db = Omadi.utils.openMainDatabase();
            result = db.execute("SELECT n.nid FROM inspection i INNER JOIN node n ON n.nid = i.nid WHERE i.truck_reference = " + vehicleNid + " ORDER BY n.created DESC LIMIT 1");
            if(result.isValidRow()){
                lastNid = result.field(0, Ti.Database.FIELD_TYPE_INT);         
            }
            result.close();
            db.close();
        }
    }
    
    return lastNid;
};

Omadi.bundles.inspection.askToReviewLastInspection = function(){"use strict";
    var dialog, bundle, showNextAlert, currentVehicleNid, lastInspectionReportNid, 
        lastNode, noInspectionDialog, showNoInspectionDialog;
    
    showNextAlert = false;
    
    bundle = Omadi.data.getBundle('inspection');
    if(bundle && bundle.can_create == 1){
        if(Omadi.bundles.inspection.userDrivesATruck()){
            
            currentVehicleNid = Omadi.bundles.companyVehicle.getCurrentVehicleNid();
            
            Ti.API.debug("truck nid: " + currentVehicleNid);
            
            showNoInspectionDialog = false;
            noInspectionDialog = Ti.UI.createAlertDialog({
               title: 'No inspection to review',
               message: "Somebody failed to do their post-shift inspection or it has not synced to this device.",
               buttonNames: ['OK']
            });
            
            if(currentVehicleNid > 0){
                // The user is currently in a truck
                
                lastInspectionReportNid = Omadi.bundles.inspection.getLastInspectionReportNid(currentVehicleNid);
                
                Ti.API.debug("last nid: " + lastInspectionReportNid);
                
                if(lastInspectionReportNid > 0){
                    
                    lastNode = Omadi.data.nodeLoad(lastInspectionReportNid);
                    
                    if(lastNode){
                        
                        if(lastNode.form_part > 0){
                            // The last inspection pre-shift has already been filled out
                            showNoInspectionDialog = true;
                        }
                        else{
                            dialog = Ti.UI.createAlertDialog({
                               title: 'Review Last Inspection Report?',
                               buttonNames: ['Review', 'No']
                            });
                            
                            dialog.addEventListener('click', function(e){
                               try{
                                   if(e.index == 0){
                                   
                                       var newWin = Omadi.display.openFormWindow('inspection', lastInspectionReportNid, 1);
                                       
                                       newWin.addEventListener('close', function(){
                                            AlertQueue.showNextAlertInQueue();
                                       });
                                    }
                                    else{
                                        AlertQueue.showNextAlertInQueue();
                                    }
                                }
                                catch(ex){
                                    Utils.sendErrorReport("exception review last inspection report: " + ex);
                                }
                            });
                            
                            AlertQueue.enqueue(dialog);
                        }
                    }
                    else{
                        showNoInspectionDialog = true;
                    }
                }
                else{
                    showNoInspectionDialog = true;
                }
            }
            else{
               showNextAlert = true;
            }
        }
        else{
           showNextAlert = true;
        }
    }
    else{
        showNextAlert = true;
    }
    
    if(showNoInspectionDialog){
        AlertQueue.enqueue(noInspectionDialog);
        AlertQueue.showNextAlertInQueue();
    }
    else if(showNextAlert){
    	AlertQueue.showNextAlertInQueue();
    }
};

Omadi.bundles.inspection.userDrivesATruck = function(){"use strict";
    var loginDetails = JSON.parse(Ti.App.Properties.getString("Omadi_session_details"));
    
    if(typeof loginDetails.user.user_drives_a_tow_truck !== 'undefined' && 
        typeof loginDetails.user.user_drives_a_tow_truck.und !== 'undefined' && 
        typeof loginDetails.user.user_drives_a_tow_truck.und[0] !== 'undefined' && 
        typeof loginDetails.user.user_drives_a_tow_truck.und[0].value !== 'undefined' &&
        loginDetails.user.user_drives_a_tow_truck.und[0].value == 1){
        
            return true;
    }
    
    return false;
};

Omadi.bundles.inspection.userShouldDoInspection = function(){"use strict";
    var bundle, db, result, uid, lastInspection, now;
    
    bundle = Omadi.data.getBundle('inspection');
    if(bundle && bundle.can_create == 1){
        if(Omadi.bundles.inspection.userDrivesATruck()){
            uid = Omadi.utils.getUid();
            now = Omadi.utils.getUTCTimestamp();
            db = Omadi.utils.openMainDatabase();
            
            result = db.execute("SELECT MAX(created) FROM node WHERE table_name = 'inspection' AND author_uid = " + uid);
            
            lastInspection = 0;
            if(result.isValidRow()){
                try{
                    lastInspection = result.field(0, Ti.Database.FIELD_TYPE_INT);
                }
                catch(ex){
                    // the value is null
                    lastInspection = 0;
                }
            }
            result.close();
            db.close();
            
            // If it's been over 2 hours since the last inspection, ask to do one
            if(now - lastInspection > (3600 * 2)){
                return true;
            }
        }
    }
    return false;
};

Omadi.bundles.inspection.askToCreateInspection = function(showLogout){"use strict";
    var dialog = Ti.UI.createAlertDialog({
       title: 'Do Post-Shift Inspection?',
       buttonNames: ['Do Inspection', 'No'] 
    });
    
    dialog.addEventListener('click', function(e){
       try{
           if(e.index == 0){
               Ti.App.fireEvent('openFormWindow', {
                    node_type: 'inspection',
                    nid: 'new',
                    form_part: 0 
               });
           }
           else if(showLogout){
               Omadi.display.showLogoutDialog();
           }
        }
        catch(ex){
            Utils.sendErrorReport("exception ask to create inspection: " + ex);
            // Make sure the user can always log out
            Omadi.display.showLogoutDialog();
        }
    });
    
    dialog.show();
};

