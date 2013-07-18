
/*jslint eqeq:true, plusplus: true*/

Omadi.bundles.restriction = {};

Omadi.bundles.restriction.getRestricted = function(nids){"use strict";
    var restricted, timestamp, query, nid, i, j, nodes, node, accountNids, licensePlate, vin, 
        db, result, restrictionBundle, restrictions, accountNid;
    
    restricted = [];
    restrictionBundle = Omadi.data.getBundle('restriction');
    
    if(restrictionBundle){
       
        timestamp = Omadi.utils.getUTCTimestamp();
        
        nodes = [];
        accountNids = [];
        
        for(i = 0; i < nids.length; i ++){
            node = Omadi.data.nodeLoad(nids[i]);
            
            if(typeof node.enforcement_account !== 'undefined' && typeof node.enforcement_account.dbValues !== 'undefined' && typeof node.enforcement_account.dbValues[0] !== 'undefined'){
                accountNids.push(node.enforcement_account.dbValues[0]);
            }
            
            nodes.push(node);
        }
         
        if(accountNids.length){
            restrictions = [];
            
            query = 'SELECT restriction_account, restriction_license_plate___plate, vin, restrict_entire_account, restriction_start_date, restriction_end_date ';
            query += ' FROM restriction WHERE restriction_account IN (' + accountNids.join(',') + ')';
            query += ' AND ((restriction_start_date < ' + timestamp + ' OR restriction_start_date IS NULL) ';
            query += ' AND (restriction_end_date > ' + timestamp + ' OR restriction_end_date IS NULL))';
            
            db = Omadi.utils.openMainDatabase();
            result = db.execute(query);
            
            while (result.isValidRow()) {
                
                restrictions.push({
                    restriction_account: result.fieldByName('restriction_account', Ti.Database.FIELD_TYPE_INT),
                    license_plate : result.fieldByName('restriction_license_plate___plate', Ti.Database.FIELD_TYPE_STRING).toUpperCase(),
                    restrict_entire_account : result.fieldByName('restrict_entire_account'),
                    startTime: result.fieldByName('restriction_start_date'),
                    endTime: result.fieldByName('restriction_end_date'),
                    vin : result.fieldByName('vin', Ti.Database.FIELD_TYPE_STRING).toUpperCase()
                });
                result.next();
            }
            result.close();
            db.close();
            
            for(i = 0; i < nodes.length; i ++){
                node = nodes[i];
                
                accountNid = 0;
                if(typeof node.enforcement_account !== 'undefined' && typeof node.enforcement_account.dbValues !== 'undefined' && typeof node.enforcement_account.dbValues[0] !== 'undefined'){
                    accountNid = node.enforcement_account.dbValues[0];
                }
                
                licensePlate = null;
                if(typeof node.license_plate___plate !== 'undefined' && typeof node.license_plate___plate.dbValues !== 'undefined' && typeof node.license_plate___plate.dbValues[0] !== 'undefined'){
                    licensePlate = node.license_plate___plate.dbValues[0].toUpperCase();
                    if(licensePlate.length == 0){
                        licensePlate = null;
                    }
                }
                
                vin = null;
                if(typeof node.vin !== 'undefined' && typeof node.vin.dbValues !== 'undefined' && typeof node.vin.dbValues[0] !== 'undefined'){
                    vin = node.vin.dbValues[0].toUpperCase();
                    if(vin.length == 0){
                        vin = null;
                    }
                }
                
                for(j = 0; j < restrictions.length; j ++){
                    
                    if(restrictions[j].restriction_account == accountNid){
                        
                        if(restrictions[j].restrict_entire_account == '1'){
                            restricted.push(node.nid);
                        }
                        else if(restrictions[j].license_plate != null && licensePlate == restrictions[j].license_plate){
                            restricted.push(node.nid);
                        }
                        else if(restrictions[j].vin != null && vin == restrictions[j].vin){
                            restricted.push(node.nid);
                        }
                    }
                }
            }
        }
    }
        
    return restricted;
};

