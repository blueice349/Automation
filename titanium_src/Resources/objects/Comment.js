/*jslint eqeq: true,nomen:true*/

var Omadi, _instance = null;

// Load the Database module
var Database = require('lib/Database');

function Comment(){"use strict";
    this.comment = {};
}

function getInstance(){"use strict";
    if(_instance === null){
        _instance = new Comment();
    }
    
    return _instance;
}

Comment.prototype.load = function(cid) {"use strict";

    var db, comment, result, subResult, field_name, dbValue, tempDBValues, textValue, 
        subValue, decoded, i, real_field_name, part, field_parts, widget, instances, 
        tempValue, origDBValue, jsonValue, allowedValues, allowedKey, filePath, newCid,
        listDB, intCid;

    this.comment = null;
    
    Ti.API.debug("Loading cid: " + cid);
    
    if(typeof cid !== 'undefined'){
        intCid = parseInt(cid, 10);
    
        if (!isNaN(intCid) && intCid != 0) {
            
            this.comment = {
                cid : cid
            };

            try{
                result = Database.query('SELECT cid, nid, uid, created, changed, subject, sync_status, status, name, body FROM comment WHERE cid = ' + cid);
                Ti.API.debug("Executed comment sql: " + cid);
                
                if (result.isValidRow()) {
                    Ti.API.info("Loaded a comment");
                    
                    this.comment.cid = result.fieldByName('cid', Ti.Database.FIELD_TYPE_INT);
                    this.comment.nid = result.fieldByName('nid', Ti.Database.FIELD_TYPE_INT);
                    this.comment.uid = result.fieldByName('uid', Ti.Database.FIELD_TYPE_INT);
                    
                    this.comment.subject = result.fieldByName('subject', Ti.Database.FIELD_TYPE_STRING);
                    this.comment.created = result.fieldByName('created', Ti.Database.FIELD_TYPE_INT);
                    this.comment.changed = result.fieldByName('changed', Ti.Database.FIELD_TYPE_INT);
                    
                    this.comment.sync_status = result.fieldByName('sync_status', Ti.Database.FIELD_TYPE_INT);
                    this.comment.name = result.fieldByName('name', Ti.Database.FIELD_TYPE_STRING);
                    this.comment.comment_body = {
                      dbValues : [result.fieldByName('body', Ti.Database.FIELD_TYPE_STRING)],
                      textValues : [result.fieldByName('body', Ti.Database.FIELD_TYPE_STRING)]  
                    };
                }
                
                result.close();
                Database.close();
            }
            catch(ex){
                Omadi.service.sendErrorReport("Exception with comment table query: " + ex);
            }
        }
    }
    
    Ti.API.debug("Comment load: " + JSON.stringify(this.comment));
    
    return this.comment;
};

Comment.prototype.save = function(comment){"use strict";
    var sql, saved = false, body;
    
    Ti.API.debug("saving comment in .save: " + JSON.stringify(comment));
    
    this.comment = comment;
    
    Ti.API.debug("About to save comment: " + JSON.stringify(this.comment));
    
    body = '';
    if(typeof this.comment.comment_body !== 'undefined'){
        if(typeof this.comment.comment_body == 'string'){
            body = this.comment.comment_body;
        }
        else if(typeof this.comment.comment_body.dbValues !== 'undefined'){
            if(typeof this.comment.comment_body.dbValues[0] !== 'undefined'){
                body = this.comment.comment_body.dbValues[0];
            }
        }
    }
    
    Ti.API.debug("Body: " + body);
    
    try{
        sql = "INSERT INTO comment (cid, nid, uid, subject, created, changed, status, name, body, sync_status) VALUES ";
        sql += "(" + this.comment.cid + "," + this.comment.nid + "," + this.comment.uid + ",''," + this.comment.created + "," + this.comment.changed + ",1,'','" + Database.escape(body) + "',1)"; 
        
        Ti.API.debug(sql);
        
        Database.query(sql);
        saved = true;
        
        Ti.API.info("Saved comment");
    }
    catch(ex){
        this.sendError("Exception saving comment: " + ex);
    }
    
    Database.close();
    
    return saved;
};

Comment.prototype.remove = function(cid){"use strict";
    Database.query("DELETE FROM comment WHERE cid = " + cid);
    Database.close();
    
    Ti.API.debug("Deleted cid: " + cid);
};


exports.load = function(cid){"use strict";
    return getInstance().load(cid); 
};

exports.save = function(comment){"use strict";
    return getInstance().save(comment);
};

exports.remove = function(cid){
    return getInstance().remove(cid);  
};
