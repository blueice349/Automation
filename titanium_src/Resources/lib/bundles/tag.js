
/*jslint eqeq:true, plusplus: true*/

Omadi.bundles.tag = {};

Omadi.bundles.tag.getExpiredTags = function(){"use strict";
    var expired, db, result, sql, nowTimestamp, nids, restricted, i, j, ready, isReady;
    
    nowTimestamp = Omadi.utils.getUTCTimestamp();
    expired = [];
    nids = [];
    ready = [];
    
    db = Omadi.utils.openMainDatabase();
    
    sql = "SELECT n.nid, n.title, n.viewed FROM node n ";
    sql += "LEFT JOIN tag ON tag.nid = n.nid ";
    sql += "LEFT JOIN account ON account.nid = tag.enforcement_account ";
    sql += "WHERE n.table_name = 'tag' ";
    sql += "AND ((tag.in_how_many_days_does_tag_exp * 3600) + tag.enforcement_start_timestamp) < " + nowTimestamp + " ";
    sql += "AND (account.tow_tag_without_approval = '1' OR (tag._tag_ready_timestamp > 0 AND tag._tag_ready_timestamp < " + nowTimestamp + ")) ";
    
    result = db.execute(sql);
    
    while(result.isValidRow()){
        
        expired.push({
           nid: result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT),
           title: result.fieldByName('title'),
           viewed: result.fieldByName('viewed')
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
    
    return ready;
};