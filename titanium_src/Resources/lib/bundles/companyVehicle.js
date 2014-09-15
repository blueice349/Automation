Omadi.bundles.companyVehicle = {};

/*jslint eqeq: true, plusplus: true*/

var Utils = require('lib/Utils');

Omadi.bundles.companyVehicle.askAboutVehicle = function() {"use strict";
    var dialog, bundle, newWin, vehicles, options, i;
    /*global roles, ROLE_ID_FIELD, alertQueue*/

    bundle = Omadi.data.getBundle('company_vehicle');

    if (bundle && Omadi.bundles.inspection.userDrivesATruck()) {

        vehicles = Omadi.bundles.companyVehicle.getCompanyVehicles();

        options = [];
        for ( i = 0; i < vehicles.length; i++) {
            options.push(vehicles[i].title);
        }

        options.push('- No Vehicle -');

        dialog = Ti.UI.createOptionDialog({
            title : 'Which Vehicle Will You Drive?',
            options : options,
            vehicles : vehicles,
            cancel : options.length - 1
        });

        dialog.addEventListener('click', function(e) {
            try{
                if (e.index == e.source.options.length - 1 || e.index == -1) {
                    if(Omadi.bundles.companyVehicle.getCurrentVehicleNid() > 0){
                        Omadi.bundles.companyVehicle.exitVehicle();   
                    }
                }
                else if(typeof e.source.vehicles[e.index] !== 'undefined'){
                    Omadi.bundles.companyVehicle.setUserVehicle(e.source.vehicles[e.index].nid);
                    
                    Omadi.bundles.inspection.askToReviewLastInspection();
                }
                
                if ( typeof alertQueue !== 'undefined') {
                    Ti.App.fireEvent('showNextAlertInQueue');
                }
            }
            catch(ex){
                Utils.sendErrorReport("exception selecting vehicle: " + ex);
            }
        });

        if ( typeof alertQueue !== 'undefined') {
            alertQueue.push(dialog);
        }
        else {
            dialog.show();
        }
    }
};

Omadi.bundles.companyVehicle.setUserVehicle = function(vehicle_nid) {"use strict";
    var http, dialog, db;
    
    if(!Ti.Network.online){
        dialog = Ti.UI.createOptionDialog({
            message : 'Your vehicle was not selected. Please try again once you are connected to the Internet.'
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
        
        // Set the vehicle immediately, if it fails, unset it
        db = Omadi.utils.openListDatabase();
        db.execute("UPDATE history SET in_vehicle_nid = " + vehicle_nid + " WHERE id_hist=1");
        db.close();
        
        http = Ti.Network.createHTTPClient({
            enableKeepAlive: false,
            validatesSecureCertificate: false
        });
        http.setTimeout(60000);
        http.open('POST', Ti.App.DOMAIN_NAME + '/js-company-vehicle/company_vehicle/enter_vehicle.json');
    
        http.setRequestHeader("Content-Type", "application/json");
        Omadi.utils.setCookieHeader(http);
    
        http.onload = function(e) {
            Omadi.display.doneLoading();
            
            Ti.App.fireEvent('companyVehicleSelected');
        };
    
        http.onerror = function(e) {
            var dialog, db;
            
            Omadi.display.doneLoading();
            
            db = Omadi.utils.openListDatabase();
            db.execute("UPDATE history SET in_vehicle_nid=0 WHERE id_hist=1");
            db.close();
            
            Ti.API.error(JSON.stringify(e));
            dialog = Ti.UI.createAlertDialog({
                message : 'An error occured, and your vehicle was not selected. Please try again.',
                buttonNames: ['OK']
            });
            
            if ( typeof alertQueue !== 'undefined') {
                alertQueue.push(dialog);
            }
            else {
                dialog.show();
            }
            
            Utils.sendErrorReport('Could not select vehicle' + JSON.stringify(e));
        };
    
        http.send(JSON.stringify({
            vehicle_nid: vehicle_nid
        }));
    }
};

Omadi.bundles.companyVehicle.exitVehicle = function(){"use strict";
    var http, bundle, dialog;
    
    bundle = Omadi.data.getBundle('company_vehicle');

    if (bundle && Omadi.bundles.inspection.userDrivesATruck()) {
        
        // Make sure the user doesn't forget to do an inspection on the last vehicle just exited
        Omadi.bundles.inspection.askToCreateInspection(false);
        
        if(!Ti.Network.online){
            dialog = Ti.UI.createOptionDialog({
                message : 'Exiting the vehicle was not saved. Please try again once you are connected to the Internet.',
                buttonNames: ['OK']
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
            
            http = Ti.Network.createHTTPClient({
                enableKeepAlive: false,
                validatesSecureCertificate: false
            });
            http.setTimeout(30000);
            http.open('POST', Ti.App.DOMAIN_NAME + '/js-company-vehicle/company_vehicle/exit_vehicle.json');
        
            http.setRequestHeader("Content-Type", "application/json");
            Omadi.utils.setCookieHeader(http);
        
            http.onload = function(e) {
                var db;
                
                Omadi.display.doneLoading();
                
                db = Omadi.utils.openListDatabase();
                db.execute("UPDATE history SET in_vehicle_nid=0 WHERE id_hist=1");
                db.close();
                
                Ti.App.fireEvent('companyVehicleSelected');
                
                Ti.App.fireEvent('exitedVehicle');
            };
        
            http.onerror = function(e) {
                
                try{
                    Omadi.display.doneLoading();
                    
                    Ti.App.fireEvent('exitedVehicle');
                    
                    dialog = Ti.UI.createOptionDialog({
                        message : 'Exiting the vehicle was not saved. Please try again.',
                        buttonNames: ['OK']
                    });
                    
                    if ( typeof alertQueue !== 'undefined') {
                        alertQueue.push(dialog);
                    }
                    else {
                        dialog.show();
                    }
                    
                    Utils.sendErrorReport('Could not exit vehicle' + JSON.stringify(e));
                }
                catch(ex){
                    
                    Utils.sendErrorReport('Exception exiting vehicle' + JSON.stringify(ex));
                }
            };
        
            http.send();
        }
    }
};

Omadi.bundles.companyVehicle.getCurrentVehicleNid = function(){"use strict";
    return Utils.getCurrentVehicleNid();
};

Omadi.bundles.companyVehicle.getCurrentVehicleName = function(){"use strict";
    return Utils.getCurrentVehicleName();
};

Omadi.bundles.companyVehicle.getCompanyVehicles = function() {"use strict";

    var db, result, vehicles;

    vehicles = [];

    db = Omadi.utils.openMainDatabase();
    result = db.execute("SELECT nid, title FROM node WHERE table_name = 'company_vehicle' ORDER BY title ASC");

    while (result.isValidRow()) {
        vehicles.push({
            nid : result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
            title : result.fieldByName('title')
        });
        result.next();
    }
    result.close();
    db.close();

    return vehicles;
};
