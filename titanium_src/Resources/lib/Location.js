/*jslint node:true */
'use strict';

var Utils = require('lib/Utils');
var Database = require('lib/Database');

var Location = function() {};

Location.getLastLocation = function(expire){
    var result, location, now, expireTimestamp;
    
    // Setup return value
    location = {};
    location.latitude = 0;
    location.longitude = 0;
    location.accuracy = 0;
    
    try{
        if(typeof expire === 'undefined'){
            // last 10 minutes
            expire = 600;
        }
        else{
            expire = parseInt(expire, 10);
        }
        
        if(!isNaN(expire) && expire > 0){
            now = Utils.getUTCTimestamp();
            expireTimestamp = now - expire;
            result = Database.queryGPS("SELECT longitude, latitude, accuracy FROM user_location WHERE timestamp >= " + expireTimestamp + " ORDER BY timestamp DESC LIMIT 1");
        }
        else{
            result = Database.queryGPS("SELECT longitude, latitude, accuracy FROM user_location ORDER BY timestamp DESC LIMIT 1");
        }
        
        if(result.isValidRow()){
            location.latitude = result.fieldByName('latitude');
            location.longitude = result.fieldByName('longitude');
            location.accuracy = result.fieldByName('accuracy');
        }
        
        result.close();
        Database.close();
    }
    catch(ex){
        Utils.sendErrorReport("Exception in getLastLocation: " + ex);
    }
    
    return location;
};

module.exports = Location;
