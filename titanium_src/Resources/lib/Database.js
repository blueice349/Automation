/*jslint nomen:true*/

var _instance = null;

function Database(){"use strict";
    this.mainDBConn = null;
    this.listDBConn = null;
    // IMPORTANT, IMPORTANT, IMPORTANT, IMPORTANT!!!!!
    // When changing this version number, also change it in the util_functions file
    this.dbVersion = "DB1725";
    this.mainDBName = null;
}

function getInstance(){"use strict";
    if(_instance === null){
        _instance = new Database();
    }
    
    return _instance;
}

Database.prototype.getListDBConn = function(){"use strict";
    if(this.listDBConn === null){
        this.listDBConn = Ti.Database.install('/database/db_list.sqlite', this.dbVersion + "_list");
    
        if (Ti.App.isIOS) {
            this.listDBConn.file.setRemoteBackup(false);
        }
    }
    
    return this.listDBConn;
};

Database.prototype.getMainDBConn = function(){"use strict";
    if(this.mainDBConn === null){
        this.mainDBConn = Ti.Database.install('/database/db.sqlite', this.dbVersion + "_" + this.getMainDBName());
    
        if (Ti.App.isIOS) {
            this.mainDBConn.file.setRemoteBackup(false);
        }
    }
    
    return this.mainDBConn;
};

Database.prototype.getGPSDBConn = function(){"use strict";
    if(this.gpsDBConn === null){
		this.gpsDBConn = Ti.Database.install('/database/gps_coordinates.sqlite', this.dbVersion + "_" + this.getMainDBName() + '_GPS');
    
        if (Ti.App.isIOS) {
            this.gpsDBConn.file.setRemoteBackup(false);
        }
    }
    
    return this.gpsDBConn;
};

Database.prototype.getMainDBName = function(){"use strict";
    var listDB, result;
    
    if(this.mainDBName === null){
        this.getListDBConn();
        result = this.listDBConn.execute('SELECT db_name FROM history WHERE id_hist=1');
        this.mainDBName = result.fieldByName('db_name');
        result.close();
        this.listDBConn.close();
        this.listDBConn = null;
    }
    
    return this.mainDBName;
};

Database.prototype.closeDatabases = function(){"use strict";
    
    if(this.mainDBConn !== null){
        try{
            this.mainDBConn.close();
        }
        catch(ex){}
        finally{
            this.mainDBConn = null;
        }
    }
    
    if(this.listDBConn !== null){
        try{
            this.listDBConn.close();
        }
        catch(ex1){}
        finally{
            this.listDBConn = null;
        }
    }
    
    if(this.gpsDBConn !== null){
        try{
            this.gpsDBConn.close();
        }
        catch(ex2){}
        finally{
            this.gpsDBConn = null;
        }
    }
};

Database.prototype.escape = function(string){"use strict";
    if (typeof string === 'undefined' || string === null || string === false) {
        return '';
    }

    string += "".toString();
    return string.replace(/[']/g, "''");
};







// Publicly exposed methods

exports.reset = function(){"use strict";
    if(_instance !== null){
        _instance.closeDatabases();
    }
    
    _instance = new Database();
};

exports.query = function(sql){"use strict"; 
    try{ 
        var db = getInstance().getMainDBConn();
        return db.execute(sql);
    }
    catch(ex){
        var Utils = require('lib/Utils');
		Utils.sendErrorReport("Exception running Main " + sql + ":" + ex);
    }
};

exports.queryList = function(sql){"use strict"; 
    try{
        var db = getInstance().getListDBConn();
        return db.execute(sql);
    }
    catch(ex){
        var Utils = require('lib/Utils');
        Utils.sendErrorReport("Exception running List " + sql + ":" + ex);
    }
};

exports.queryGPS = function(sql){"use strict"; 
    try{
        var db = getInstance().getGPSDBConn();
        return db.execute(sql);
    }
    catch(ex){
        var Utils = require('lib/Utils');
        Utils.sendErrorReport("Exception running List " + sql + ":" + ex);
    }
};

exports.close = function(){"use strict";
    if(_instance !== null){
        _instance.closeDatabases();
    }
};

exports.escape = function(string){"use strict";
    return getInstance().escape(string);
};

