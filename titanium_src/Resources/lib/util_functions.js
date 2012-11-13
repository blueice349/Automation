
/*global PLATFORM*/

function openListDatabase(){
	"use strict";
	var db = Ti.Database.install('/database/db_list.sqlite',  Titanium.App.Properties.getString("databaseVersion")+"_list" );
	if(PLATFORM !== 'android'){db.file.setRemoteBackup(false);}
	return db;
}

function getDBName() {
	"use strict";
	var db, result, dbName;
	
	db = openListDatabase();
	result = db.execute('SELECT db_name FROM history WHERE id_hist=1');
	dbName = result.fieldByName('db_name');
	result.close();
	db.close();
	return dbName;
}

function openMainDatabase(){
	"use strict";
	var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	if(PLATFORM !== 'android'){db.file.setRemoteBackup(false);}
	return db;
}

function openGPSDatabase(){
	"use strict";
	var db = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS");
	if(PLATFORM !== 'android'){db.file.setRemoteBackup(false);}
	return db;
}


// Takes a timestamp from the past and returns a string with the amount of time elapsed
function getTimeAgoStr(timestamp){
	'use strict';
	
	var d_lastSync, d_now, timeDiff, days, hours, minutes, seconds, timeStr;
	
	d_lastSync = new Date(timestamp);
	d_now = new Date();
	
	timeDiff = d_now - d_lastSync;// time difference in ms
	days = parseInt(timeDiff/(1000*60*60*24), 10);//get days
	timeDiff = Math.round(timeDiff%(1000*60*60*24));
	
	hours = parseInt(timeDiff/(1000*60*60), 10);// get hours
	timeDiff = Math.round(timeDiff%(1000*60*60));
	
	minutes = parseInt(timeDiff/(1000*60), 10);// get minutes
	timeDiff = Math.round(timeDiff%(1000*60));
	
	seconds = parseInt(timeDiff/1000, 10);// get seconds
	
	timeStr = "";
	if(days !== 0){
		timeStr += days + ' day';
		if(days>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(hours !== 0){
		timeStr += hours + ' hour';
		if(hours > 1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(minutes !== 0 && days === 0){
		timeStr += minutes + ' minute';
		if(minutes>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(seconds !== 0 && hours === 0){
		timeStr += seconds + ' second';
		if(seconds>1){
			timeStr += 's';
		} 
		timeStr += ' ';
	}
	
	if(timeStr !== ''){
		timeStr += 'ago';
	}
	
	return timeStr;
}
