/*jslint eqeq:true*/

Omadi.bundles.inspection = {};

Omadi.bundles.inspection.askToDoInspection = function(){"use strict";
    var dialog, bundle;
    /*global roles, ROLE_ID_FIELD, alertQueue*/
    
    bundle = Omadi.data.getBundle('inspection');
    if(bundle && bundle.can_create == 1){
        if(typeof roles[ROLE_ID_FIELD] !== 'undefined' && roles[ROLE_ID_FIELD] > ''){
            
            Ti.App.Properties.setBool("inspectionAlertShowing", true);
            
            dialog = Ti.UI.createAlertDialog({
               title: 'Driver\'s Inspection Report',
               message: 'Do you want to create an inspection report now?',
               buttonNames: ['Yes', 'No'] 
            });
            
            dialog.addEventListener('click', function(e){
               
               Ti.App.Properties.setBool("inspectionAlertShowing", false);
               
               if(e.index == 0){
                   Omadi.display.openFormWindow('inspection', 'new', 0);
               }
               else{
                   Omadi.display.showNewNotificationDialog();
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
