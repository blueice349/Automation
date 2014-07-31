/*jslint eqeq:true,nomen:true,plusplus:true*/

var Database = require('lib/Database');
var Utils = require('lib/Utils');

function Node(){"use strict";
    this.node = {};
}




exports.getNodeType = function(nid){"use strict";
    var type, result;
    type = null;
    
    Ti.API.debug("NID: " + nid);
    
    try{
        result = Database.query("SELECT table_name FROM node WHERE nid = " + nid);
        
        if(result.isValidRow()){
            type = result.fieldByName('table_name');
        }
        
        result.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception getting node type: " + ex);
    }
    
    Database.close();
    
    return type;
};

