/*jslint eqeq:true, plusplus: true*/ 
/*global PLATFORM*/

var Omadi = Omadi || {};
Omadi.utils = Omadi.utils || {};

Omadi.DOMAIN_NAME = domainName;

Omadi.utils.openListDatabase = function(){
	"use strict";
	var db = Ti.Database.install('/database/db_list.sqlite',  Titanium.App.Properties.getString("databaseVersion")+"_list" );
	if(PLATFORM !== 'android'){db.file.setRemoteBackup(false);}
	return db;
};

Omadi.utils.getMainDBName = function() {
	"use strict";
	var db, result, dbName;
	
	db = Omadi.utils.openListDatabase();
	result = db.execute('SELECT db_name FROM history WHERE id_hist=1');
	dbName = result.fieldByName('db_name');
	result.close();
	db.close();
	return dbName;
};

Omadi.utils.openMainDatabase = function(){
	"use strict";
	var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + Omadi.utils.getMainDBName());
	if(PLATFORM !== 'android'){db.file.setRemoteBackup(false);}
	return db;
};

Omadi.utils.openGPSDatabase = function(){
	"use strict";
	var db = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_" + Omadi.utils.getMainDBName()+"_GPS");
	if(PLATFORM !== 'android'){db.file.setRemoteBackup(false);}
	return db;
};

Omadi.utils.getUTCTimestamp = function(){
	"use strict";
	return Math.round(new Date() / 1000);
};

// Takes a timestamp from the past and returns a string with the amount of time elapsed
Omadi.utils.getTimeAgoStr = function(timestamp){
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
};

Omadi.utils.setCookieHeader = function(http){
	"use strict";
	/*global getCookie*/
	
	var cookie = getCookie();
	
	if(PLATFORM === 'android'){
		http.setRequestHeader("Cookie", cookie);// Set cookies
	}
	else{
		cookie = cookie.split(';');
		if (!cookie[0] ){
			cookie[0]="";
		}
		http.setRequestHeader("Cookie", cookie[0]);// Set cookies
	}	
};


/* Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (timestamp, time) {
		var dF = dateFormat;
		var date = new Date(timestamp * 1000);
		var utc = false;
		var mask = "ddd, mmm dd, yyyy";
		if(time){
			mask = "ddd, mmm dd, yyyy - h:MM TT";
		}

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// // For convenience...
// Date.prototype.format = function (mask, utc) {
	// return dateFormat(this, mask, utc);
// };

Omadi.utils.trimWhiteSpace = function(string){
    return string.replace(/^\s+|\s+$/g,"");
};

/*jslint sloppy: true, eqeq:true, vars: true, plusplus: true, bitwise: true*/ 
Omadi.utils.formatDate = function(format, timestamp) {
	
	var a, jsdate = (( typeof (timestamp) == 'undefined') ? new Date() : ( typeof (timestamp) == 'number') ? new Date(timestamp * 1000) : new Date(timestamp));
	var pad = function(n, c) {
		if (n.toString().length < c) {
			return new [++c - n.length].join("0") + n;
		} 
		return n;
	};
	var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var txt_ordin = {
		1 : "st",
		2 : "nd",
		3 : "rd",
		21 : "st",
		22 : "nd",
		23 : "rd",
		31 : "st"
	};
	var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var f = {
		// Day
		d : function() {
			return pad(f.j(), 2);
		},
		D : function() {
			var t = f.l();
			return t.substr(0, 3);
		},
		j : function() {
			return jsdate.getDate();
		},
		l : function() {
			return txt_weekdays[f.w()];
		},
		N : function() {
			return f.w() + 1;
		},
		S : function() {
			return txt_ordin[f.j()] || 'th';
		},
		w : function() {
			return jsdate.getDay();
		},
		z : function() {
			return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
		},

		// Week
		W : function() {
			var a = f.z(), b = 364 + f.L() - a;
			var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

			if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
				return 1;
			} 
			

			if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
				nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
				return date("W", Math.round(nd2.getTime() / 1000));
			} 
			
			return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
			
		},

		// Month
		F : function() {
			return txt_months[f.n()];
		},
		m : function() {
			return pad(f.n(), 2);
		},
		M : function() {
			t = f.F();
			return t.substr(0, 3);
		},
		n : function() {
			return jsdate.getMonth() + 1;
		},
		t : function() {
			var n;
			if (( n = jsdate.getMonth() + 1) == 2) {
				return 28 + f.L();
			} 
			if (((n & 1) && (n < 8)) || (!(n & 1) && (n > 7))){
				return 31;
			} 
			return 30;
		},

		// Year
		L : function() {
			var y = f.Y();
			return ((!(y & 3)) && (y % 1e2 || (y % 4e2 === 0))) ? 1 : 0;
		},
		o : function() {
			if (f.n() === 12 && f.W() === 1) {
				return jsdate.getFullYear() + 1;
			}
			if (f.n() === 1 && f.W() >= 52) {
				return jsdate.getFullYear() - 1;
			}
			return jsdate.getFullYear();
		},
		Y : function() {
			return jsdate.getFullYear();
		},
		y : function() {
			return (jsdate.getFullYear().toString()).slice(2);
		},

		// Time
		a : function() {
			return jsdate.getHours() > 11 ? "pm" : "am";
		},
		A : function() {
			return f.a().toUpperCase();
		},
		B : function() {
			// peter paul koch:
			var off = (jsdate.getTimezoneOffset() + 60) * 60;
			var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
			var beat = Math.floor(theSeconds / 86.4);
			if (beat > 1000){
				beat -= 1000;
			}
			if (beat < 0){
				beat += 1000;
			}
			if ((String(beat)).length == 1){
				beat = "00" + beat;
			}
			if ((String(beat)).length == 2){
				beat = "0" + beat;
			}
			return beat;
		},
		g : function() {
			return jsdate.getHours() % 12 || 12;
		},
		G : function() {
			return jsdate.getHours();
		},
		h : function() {
			return pad(f.g(), 2);
		},
		H : function() {
			return pad(jsdate.getHours(), 2);
		},
		i : function() {
			return pad(jsdate.getMinutes(), 2);
		},
		s : function() {
			return pad(jsdate.getSeconds(), 2);
		},
		u : function() {
			return pad(jsdate.getMilliseconds() * 1000, 6);
		},

		// Timezone
		//e not supported yet
		I : function() {
			var DST = (new Date(jsdate.getFullYear(), 6, 1, 0, 0, 0));
			DST = DST.getHours() - DST.getUTCHours();
			var ref = jsdate.getHours() - jsdate.getUTCHours();
			return ref != DST ? 1 : 0;
		},
		O : function() {
			var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
			if (jsdate.getTimezoneOffset() > 0){
				t = "-" + t;
			}
			else{
				t = "+" + t;
			}
			return t;
		},
		P : function() {
			var O = f.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2));
		},
		//T not supported yet
		Z : function() {
			var t = -jsdate.getTimezoneOffset() * 60;
			return t;
		},

		// Full Date/Time
		c : function() {
			return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
		},
		r : function() {
			return f.D() + ', ' + f.d() + ' ' + f.M() + ' ' + f.Y() + ' ' + f.H() + ':' + f.i() + ':' + f.s() + ' ' + f.O();
		},
		U : function() {
			return Math.round(jsdate.getTime() / 1000);
		}
	};

	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s) {
		if (t != s) {
			// escaped
			ret = s;
		} else if (f[s]) {
			// a date function exists
			ret = f[s]();
		} else {
			// nothing special
			ret = s;
		}

		return ret;
	});
	/*jsl:end*/
};



Ti.include('/lib/location_functions.js');
Ti.include('/lib/service_functions.js');
