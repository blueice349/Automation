/*jslint eqeq:true*/

Omadi.bundles.inspection = {};

Omadi.bundles.inspection.askToReviewLastInspection = function(){"use strict";
    var dialog, bundle, newWin;
    /*global roles, ROLE_ID_FIELD, alertQueue*/
    
    bundle = Omadi.data.getBundle('inspection');
    if(bundle && bundle.can_create == 1){
        if(Omadi.bundles.timecard.userDrivesATruck()){
            
            dialog = Ti.UI.createAlertDialog({
               title: 'Review Inspection Log',
               message: 'Do you want to review the vehicle inspection log?',
               buttonNames: ['Yes', 'No']
            });
            
            dialog.addEventListener('click', function(e){
               
               if(e.index == 0){
                   
                   newWin = Omadi.display.openListWindow('inspection', false, [], [], false);
                   
                   if(typeof alertQueue !== 'undefined'){
                       newWin.addEventListener('close', function(){
                            Ti.App.fireEvent('showNextAlertInQueue'); 
                       });
                   }
               }
               else{
                   if(typeof alertQueue !== 'undefined'){
                        Ti.App.fireEvent('showNextAlertInQueue');
                   }
               }
            });
            
            if(typeof alertQueue !== 'undefined'){
                alertQueue.push(dialog);
            }
            else{
                dialog.show();
            }
        }
    }
};

Omadi.bundles.timecard.userDrivesATruck = function(){"use strict";
    var loginDetails, bundle;
    
    loginDetails = JSON.parse(Ti.App.Properties.getString("Omadi_session_details"));
    
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
        if(Omadi.bundles.timecard.userDrivesATruck()){
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

Omadi.bundles.inspection.askToCreateInspection = function(){"use strict";
    var dialog, bundle;
    /*global roles, ROLE_ID_FIELD, alertQueue, showLogoutDialog*/
    
    //if(Omadi.bundles.inspection.userShouldDoInspection()){

        dialog = Ti.UI.createAlertDialog({
           title: 'DOT Inspection Report',
           message: 'Do you want to fill out a DOT vehicle inspection report?',
           buttonNames: ['Yes', 'No'] 
        });
        
        dialog.addEventListener('click', function(e){
           
           if(e.index == 0){
               Omadi.display.openFormWindow('inspection', 'new', 0);
           }
           else if(typeof showLogoutDialog !== 'undefined'){
               showLogoutDialog();
           }
        });
        
        dialog.show();
    //}
};

