/* jshint globalstrict:true */
'use strict';

var _instance = null;
var GeofenceServices = require('services/GeofenceServices');
var Data = require('lib/Data');

function Database() {
    this.mainDBConn = null;
    this.listDBConn = null;
    // IMPORTANT, IMPORTANT, IMPORTANT, IMPORTANT!!!!!
    // When changing this version number, also change it in the util_functions file
    this.dbVersion = "DB1725";
    this.mainDBName = null;
}

function getInstance() {
    if(_instance === null){
        _instance = new Database();
    }
    
    return _instance;
}

Database.prototype.getListDBConn = function() {
    if(this.listDBConn === null){
        this.listDBConn = Ti.Database.install('/database/db_list.sqlite', this.dbVersion + "_list");
    
        if (Ti.App.isIOS) {
            this.listDBConn.file.setRemoteBackup(false);
        }
    }
    
    return this.listDBConn;
};

Database.prototype.getMainDBConn = function() {
    if(this.mainDBConn === null){
        this.mainDBConn = Ti.Database.install('/database/db.sqlite', this.dbVersion + "_" + this.getMainDBName());
    
        if (Ti.App.isIOS) {
            this.mainDBConn.file.setRemoteBackup(false);
        }
    }
    
    return this.mainDBConn;
};

Database.prototype.getGPSDBConn = function() {
    if(this.gpsDBConn === null){
		this.gpsDBConn = Ti.Database.install('/database/gps_coordinates.sqlite', this.dbVersion + "_" + this.getMainDBName() + '_GPS');
    
        if (Ti.App.isIOS) {
            this.gpsDBConn.file.setRemoteBackup(false);
        }
    }
    
    return this.gpsDBConn;
};

Database.prototype.getMainDBName = function() {
    if(this.mainDBName === null){
        this.getListDBConn();
        var result = this.listDBConn.execute('SELECT db_name FROM history WHERE id_hist=1');
        this.mainDBName = result.fieldByName('db_name');
        result.close();
        this.listDBConn.close();
        this.listDBConn = null;
    }
    
    return this.mainDBName;
};

Database.prototype.closeDatabases = function() {
    
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

Database.prototype.escape = function(string) {
    if (typeof string === 'undefined' || string === null || string === false) {
        return '';
    }

    string += "".toString();
    return string.replace(/[']/g, "''");
};







// Publicly exposed methods

exports.reset = function() {
    if(_instance !== null){
        _instance.closeDatabases();
    }
    
    _instance = new Database();
};

exports.query = function(sql) { 
    var db = getInstance().getMainDBConn();
    return db.execute(sql);
};

exports.queryList = function(sql) { 
    var db = getInstance().getListDBConn();
    return db.execute(sql);
};

exports.queryGPS = function(sql) {
    var db = getInstance().getGPSDBConn();
    return db.execute(sql);
};

exports.close = function() {
    if(_instance !== null){
        _instance.closeDatabases();
    }
};

exports.escape = function(string) {
    return getInstance().escape(string);
};

exports.resultToObjectArray = function(result) {
	var fieldCount = result.getFieldCount();
	var data = [];
	
	while (result.isValidRow()) {
		var row = {};
		for (var i = 0; i < fieldCount; i++) {
			row[result.getFieldName(i)] = result.field(i);
		}
		data.push(row);
		result.next();
	}
	
	return data;
};

exports.removeAllData = function() {
    GeofenceServices.getInstance().unregisterAllGeofences();
    
    Ti.App.Properties.setDouble('omadi:fullResetLastSync', Data.getLastUpdateTimestamp());
    
    exports.queryList('UPDATE _files SET nid = -1000000 WHERE nid <= 0');
    exports.queryGPS('DELETE FROM alerts');
    if (Ti.App.isAndroid) {
    	_instance.getMainDBConn().remove();
    } else {
    	_instance.getMainDBConn().file.deleteFile();
    }
    exports.close();
};

