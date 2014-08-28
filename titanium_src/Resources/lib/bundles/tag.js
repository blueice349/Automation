
/*jslint eqeq:true, plusplus: true*/

Omadi.bundles.tag = {};

var Utils = require('lib/Utils');

Omadi.bundles.tag.hasSavedTags = function(){"use strict";
    var db, result, retval = false;
    
    db = Omadi.utils.openMainDatabase();
    
    result = db.execute("SELECT COUNT(*) FROM node WHERE table_name = 'tag'");
    
    if(result.isValidRow()){
        retval = (result.field(0, Ti.Database.FIELD_TYPE_INT) > 0);
    }
    
    db.close();
    
    return retval;
};

Omadi.bundles.tag.getExpiredTags = function(){"use strict";
    var expired, db, result, sql, nowTimestamp, nids, restricted, i, j, ready, isReady, nodes, node, 
    tagBundle, searchFieldName, criteriaRow, finalReady, communityViolations, v_idx, 
    community_idx, foundCommunity, userUid, restrictions, accountNid, restriction, accountNids, 
    accountSQL, accountORs, searchSQL, filtered, nid, conditions, conditionSQL, foundDriver;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    expired = [];
    nids = [];
    ready = {};
    finalReady = [];
    tagBundle = Omadi.data.getBundle('tag');
    
    try{
        restrictions = Omadi.bundles.restriction.getCurrentRestrictions();
        db = Omadi.utils.openMainDatabase();
        
        sql = "SELECT n.nid, n.title, n.viewed, account.account_name FROM node n ";
        sql += "LEFT JOIN tag ON tag.nid = n.nid ";
        sql += "LEFT JOIN account ON account.nid = tag.enforcement_account ";
        sql += "WHERE n.table_name = 'tag' ";
        sql += "AND ((tag.in_how_many_days_does_tag_exp * 3600) + tag.enforcement_start_timestamp) < " + nowTimestamp + " ";
        sql += "AND ((account.tow_tag_without_approval = 1) OR (tag._tag_ready_timestamp > 0 AND tag._tag_ready_timestamp < " + nowTimestamp + ")) ";
        
        accountNids = [];
        accountORs = [];
        
        for(accountNid in restrictions){
            if(restrictions.hasOwnProperty(accountNid)){
                
                accountNids.push(accountNid);
                
                if(!isNaN(accountNid)){
                    restriction = restrictions[accountNid];
                    
                    if(restriction.restrict_entire_account){
                        sql += " AND tag.enforcement_account != " + accountNid;
                    }
                    else{
                        accountSQL = '';
                        accountSQL += " (tag.enforcement_account = " + accountNid;
                        
                        if(restriction.license_plates.length > 0){
                           if(restriction.vins.length > 0){
                               accountSQL += " AND (tag.license_plate___plate NOT IN ('" + restriction.license_plates.join("','") + "') ";
                               accountSQL += " AND tag.vin NOT IN ('" + restriction.vins.join("','") + "')) ";
                           }
                           else{
                               accountSQL += " AND tag.license_plate___plate NOT IN ('" + restriction.license_plates.join("','") + "') ";
                           }
                        }
                        else if(restriction.vins.length > 0){
                            accountSQL += " AND tag.vin NOT IN ('" + restriction.vins.join("','") + "') ";
                        }
                        
                        accountSQL += ") ";
                        
                        accountORs.push(accountSQL);
                    }
                }
            }
        }
        
        if(accountORs.length > 0){
            
            sql += " AND (";
            sql += accountORs.join(' OR ');
            sql += " OR tag.enforcement_account NOT IN (" + accountNids.join(',') + ")) ";
        }
        
        Ti.API.debug(sql);
        
        result = db.execute(sql);
        
        while(result.isValidRow()){
            
            nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_STRING);
            ready[nid] = {
               nid: nid,
               title: result.fieldByName('title'),
               viewed: result.fieldByName('viewed'),
               account_name: result.fieldByName('account_name')
            };
            
            result.next();
        }
        
        result.close();
        
        db.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception in getting expired tags: " + ex);
    }
    
    if(typeof tagBundle.data.node_type_specific !== 'undefined'){
        
        try{
            
            searchSQL = "SELECT nid FROM tag ";
            conditions = [];
            
            if(typeof tagBundle.data.node_type_specific.criteria !== 'undefined' && typeof tagBundle.data.node_type_specific.criteria.search_criteria !== 'undefined'){
                conditionSQL = Omadi.utils.list_search_get_search_sql('tag', tagBundle.data.node_type_specific.criteria);
                if(conditionSQL && conditionSQL.length > 0){
                    conditions.push(conditionSQL);
                }
            }
            
            if(conditions.length > 0){
                searchSQL += ' WHERE ' + conditions.join(" AND ");
                
                db = Omadi.utils.openMainDatabase();
                
                Ti.API.debug("search SQL");
                Ti.API.debug(searchSQL);
                
                result = db.execute(searchSQL);
                
                while(result.isValidRow()){
                    
                    // Remove the nid from the ready list by setting it to null if it matches the criteria sent in
                    nid = result.field(0);
                    if(typeof ready[nid] !== 'undefined'){
                        ready[nid] = null;
                    }
                    
                    result.next();
                }
                result.close();
                db.close();
            }
        }
        catch(ex1){
            Utils.sendErrorReport("Exception in adding search sql to tag expired: " + ex1);
        }
            
        try{
            if(typeof tagBundle.data.node_type_specific.community_violation_type !== 'undefined' && tagBundle.data.node_type_specific.community_violation_type == 'select_community'){
                if(typeof tagBundle.data.node_type_specific.select_community_violations !== 'undefined'){
                    communityViolations = tagBundle.data.node_type_specific.select_community_violations;
                    userUid = Omadi.utils.getUid();
                    
                    for(i in ready){
                        if(ready.hasOwnProperty(i)){
                            if(ready[i] != null){
                                node = Omadi.data.nodeLoad(ready[i].nid);
                                foundCommunity = false;
                                
                                Ti.API.debug("loaded node");
                                
                                if(typeof node.violation !== 'undefined' && typeof node.violation.dbValues !== 'undefined'){    
                                    for(v_idx = 0; v_idx < node.violation.dbValues.length; v_idx ++){
                                        for(community_idx in communityViolations){
                                            if(communityViolations.hasOwnProperty(community_idx)){
                                                
                                                if(communityViolations[community_idx] == node.violation.dbValues[v_idx]){
                                                    foundCommunity = true;
                                                    break;
                                                }
                                            }
                                        }
                                        
                                        if(foundCommunity){
                                            break;
                                        }
                                    }
                                }
                                  
                                foundDriver = false;
                                
                                if(!foundCommunity){  
                                    if(typeof node.driver_1 !== 'undefined' && typeof node.driver_1.dbValues !== 'undefined' && typeof node.driver_1.dbValues[0] !== 'undefined'){
                                        if(node.driver_1.dbValues[0] == userUid){
                                            foundDriver = true;
                                        }
                                    }
                                }
                                
                                Ti.API.debug("Comm: " + foundCommunity + " driver: " + foundDriver);
                                
                                if(foundCommunity || foundDriver){
                                    // Leave it in the list
                                }
                                else{
                                    ready[i] = null;
                                }
                            }
                        }
                    } 
                }
            }
        }
        catch(ex2){
            Utils.sendErrorReport("Exception in filtering community tags: " + ex2);
        }
    }
    
    return ready;
};

