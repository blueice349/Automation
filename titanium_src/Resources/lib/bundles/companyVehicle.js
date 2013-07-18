Omadi.bundles.companyVehicle = {};

/*jslint eqeq: true, plusplus: true*/

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
            vehicles : vehicles
        });

        dialog.addEventListener('click', function(e) {
            
            if (e.index == e.source.options.length - 1 || e.index == -1) {
                if(Omadi.bundles.companyVehicle.getCurrentVehicleNid() > 0){
                    Omadi.bundles.companyVehicle.exitVehicle();   
                }
            }
            else if(typeof e.source.vehicles[e.index] !== 'undefined'){
                Omadi.bundles.companyVehicle.setUserVehicle(e.source.vehicles[e.index].nid);
            }
            
            Ti.API.debug(e.index);

            if ( typeof alertQueue !== 'undefined') {
                Ti.App.fireEvent('showNextAlertInQueue');
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
    var http, dialog;
    
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
        
        http = Ti.Network.createHTTPClient();
        http.setTimeout(60000);
        http.open('POST', Omadi.DOMAIN_NAME + '/js-company-vehicle/company_vehicle/enter_vehicle.json');
    
        http.setRequestHeader("Content-Type", "application/json");
        Omadi.utils.setCookieHeader(http);
    
        http.onload = function(e) {
            Omadi.display.doneLoading();
            //Ti.API.debug(JSON.stringify(e));
            var db;
            
            db = Omadi.utils.openListDatabase();
            db.execute("UPDATE history SET in_vehicle_nid = " + vehicle_nid + " WHERE id_hist=1");
            db.close();
            
            Ti.App.fireEvent('companyVehicleSelected');
        };
    
        http.onerror = function(e) {
            var dialog;
            
            Omadi.display.doneLoading();
            
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
            
            Omadi.service.sendErrorReport('Could not select vehicle' + JSON.stringify(e));
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
            
            http = Ti.Network.createHTTPClient();
            http.setTimeout(30000);
            http.open('POST', Omadi.DOMAIN_NAME + '/js-company-vehicle/company_vehicle/exit_vehicle.json');
        
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
                    
                    //Ti.API.error(JSON.stringify(e));
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
                    
                    Omadi.service.sendErrorReport('Could not exit vehicle' + JSON.stringify(e));
                }
                catch(ex){
                    
                    Omadi.service.sendErrorReport('Exception exiting vehicle' + JSON.stringify(ex));
                }
            };
        
            http.send();
        }
    }
};

Omadi.bundles.companyVehicle.getCurrentVehicleNid = function(){"use strict";
    var db, result, nid;
    
    nid = 0;
    
    db = Omadi.utils.openListDatabase();
    result = db.execute("SELECT in_vehicle_nid FROM history WHERE id_hist=1");
    if(result.isValidRow()){
        nid = result.field(0, Ti.Database.FIELD_TYPE_INT);
    }
    result.close();
    db.close();
    
    return nid;
};

Omadi.bundles.companyVehicle.getCurrentVehicleName = function(){"use strict";
    var db, result, nid, name;
    
    nid = Omadi.bundles.companyVehicle.getCurrentVehicleNid();
    name = null;
    
    db = Omadi.utils.openMainDatabase();
    if(nid > 0){
        result = db.execute("SELECT title FROM node WHERE nid = " + nid);
        if(result.isValidRow()){
            name = result.field(0);
        }
        result.close();
    }
    
    db.close();
    
    return name;
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
