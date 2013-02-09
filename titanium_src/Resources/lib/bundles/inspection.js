/*jslint eqeq:true*/

Omadi.bundles.inspection = {};

Omadi.bundles.inspection.askToReviewLastInspection = function(){"use strict";
    var dialog, bundle, newWin, vehicle_nid, vehicle_name, hasFilter;
    /*global roles, ROLE_ID_FIELD, alertQueue*/
    
    bundle = Omadi.data.getBundle('inspection');
    if(bundle && bundle.can_create == 1){
        if(Omadi.bundles.inspection.userDrivesATruck()){
            
            dialog = Ti.UI.createAlertDialog({
               title: 'Review Last Inspection',
               message: 'Sign Pre-Shift Form?',
               buttonNames: ['Yes', 'No']
            });
            
            dialog.addEventListener('click', function(e){
               
               if(e.index == 0){
                   
                   vehicle_nid = Omadi.bundles.companyVehicle.getCurrentVehicleNid();
                   
                   hasFilter = false;
                   
                   if(typeof bundle.data.mobile !== 'undefined' && 
                        typeof bundle.data.mobile.filters !== 'undefined' && 
                        typeof bundle.data.mobile.filters.fields !== 'undefined' && 
                        typeof bundle.data.mobile.filters.fields[0] !== 'undefined' &&
                        typeof bundle.data.mobile.filters.fields[0].field_name !== 'undefined' &&
                        bundle.data.mobile.filters.fields[0].field_name == 'truck_reference'){
                            hasFilter = true;
                        } 
                   
                   if(vehicle_nid > 0 && hasFilter){
                       
                       vehicle_name = Omadi.bundles.companyVehicle.getCurrentVehicleName();
                       
                       var filterValues = [];
                       filterValues.push({
                           value: vehicle_nid,
                           text: vehicle_name
                       });
                       
                       newWin = Omadi.display.openListWindow('inspection', false, filterValues, [], true);
                   }
                   else{
                       newWin = Omadi.display.openListWindow('inspection', false, [], [], false);    
                   }
                   
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

Omadi.bundles.inspection.userDrivesATruck = function(){"use strict";
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

Omadi.bundles.inspection.askToCreateInspection = function(){"use strict";
    var dialog, bundle;
    /*global roles, ROLE_ID_FIELD, alertQueue*/
    
    //if(Omadi.bundles.inspection.userShouldDoInspection()){

        dialog = Ti.UI.createAlertDialog({
           title: 'DOT Inspection Report',
           message: 'Fill Out Post-Shift Form?',
           buttonNames: ['Yes', 'No'] 
        });
        
        dialog.addEventListener('click', function(e){
           
           if(e.index == 0){
               Omadi.display.openFormWindow('inspection', 'new', 0);
           }
           else{
               Omadi.display.showLogoutDialog();
           }
        });
        
        dialog.show();
    //}
};

