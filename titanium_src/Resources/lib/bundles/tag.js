
/*jslint eqeq:true, plusplus: true*/

Omadi.bundles.tag = {};

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
    community_idx, foundCommunity, userUid;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    expired = [];
    nids = [];
    ready = [];
    finalReady = [];
    tagBundle = Omadi.data.getBundle('tag');
    
    //Ti.API.error(tagBundle);
    
    db = Omadi.utils.openMainDatabase();
    
    sql = "SELECT n.nid, n.title, n.viewed, account.account_name FROM node n ";
    sql += "LEFT JOIN tag ON tag.nid = n.nid ";
    sql += "LEFT JOIN account ON account.nid = tag.enforcement_account ";
    sql += "WHERE n.table_name = 'tag' ";
    sql += "AND ((tag.in_how_many_days_does_tag_exp * 3600) + tag.enforcement_start_timestamp) < " + nowTimestamp + " ";
    sql += "AND ((account.tow_tag_without_approval = 1) OR (tag._tag_ready_timestamp > 0 AND tag._tag_ready_timestamp < " + nowTimestamp + ")) ";
    sql += " ORDER BY account.account_name ASC";
    
    result = db.execute(sql);
    
    while(result.isValidRow()){
        
        expired.push({
           nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
           title: result.fieldByName('title'),
           viewed: result.fieldByName('viewed'),
           account_name: result.fieldByName('account_name')
        });
        
        nids.push(result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT));
        
        result.next();
    }
    
    result.close();
    
    db.close();
    
    restricted = Omadi.bundles.restriction.getRestricted(nids);
    
    for(i = 0; i < expired.length; i ++){
        isReady = true;
        for(j = 0; j < restricted.length; j ++){
            if(restricted[j] == expired[i].nid){
                isReady = false;
                break;
            }
        }
        
        if(isReady){
            ready.push(expired[i]);
        }
    }
    
    nodes = [];
    
    if(typeof tagBundle.data.node_type_specific !== 'undefined'){
        
        if(typeof tagBundle.data.node_type_specific.criteria !== 'undefined' && typeof tagBundle.data.node_type_specific.criteria.search_criteria !== 'undefined'){
            
            for(i = 0; i < ready.length; i ++){
                node = Omadi.data.nodeLoad(ready[i].nid);
                nodes[ready[i].nid] = node;
                
                if(!Omadi.utils.list_search_node_matches_search_criteria(node, tagBundle.data.node_type_specific.criteria)){
                    finalReady.push(ready[i]);
                }
            }
            
            ready = finalReady;
        }
         
               
        if(typeof tagBundle.data.node_type_specific.community_violation_type !== 'undefined' && tagBundle.data.node_type_specific.community_violation_type == 'select_community'){
            
            if(typeof tagBundle.data.node_type_specific.select_community_violations !== 'undefined'){
                finalReady = [];
                
                communityViolations = tagBundle.data.node_type_specific.select_community_violations;
                //Ti.API.error(communityViolations);
                
                userUid = Omadi.utils.getUid();
                
                for(i = 0; i < ready.length; i ++){
                    if(typeof nodes[ready[i].nid] === 'undefined'){
                        nodes[ready[i].nid] = Omadi.data.nodeLoad(ready[i].nid);
                    }
                    node = nodes[ready[i].nid];
                    foundCommunity = false;
                    
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
                    
                    //Ti.API.debug(ready[i].nid);
                    //Ti.API.debug(node.violation);
                    
                    if(foundCommunity){
                        
                        //Ti.API.error("found community" + ready[i].nid);
                        finalReady.push(ready[i]);
                    }
                    else if(typeof node.driver_1 !== 'undefined' && typeof node.driver_1.dbValues !== 'undefined' && typeof node.driver_1.dbValues[0] !== 'undefined'){
                        if(node.driver_1.dbValues[0] == userUid){
                            finalReady.push(ready[i]);
                        }
                    }
                } 
                
                ready = finalReady;
            }
        }
    }
    
    return ready;
};