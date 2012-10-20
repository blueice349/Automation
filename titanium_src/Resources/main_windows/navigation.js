var win_nav = Ti.UI.currentWindow;
win_nav.backgroundColor = '#EEEEEE';
win_nav.orientationModes = [Titanium.UI.PORTRAIT];
Ti.include('/lib/functions.js');	

function secondsToTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));
   
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
 
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
   
    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

//degrees to radians
function toRad(degree) 
{
    rad = degree* Math.PI/ 180;
    return rad;
}

//@Parameters: Origin / End
function getDistance(lat1, lon1, lat2, lon2){
	Ti.API.info(lat1+' - '+lon1+' - '+lat2+' - '+lon2);
	var R = 6371; // km
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1);
	var lat1 = toRad(lat1);
	var lat2 = toRad(lat2);
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}


var db_nav_name = Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName() + "_NAVIGATION";

var db_nav = Ti.Database.install('/database/navigation.sqlite', db_nav_name);
db_nav.file.setRemoteBackup(false);
var nav_res = db_nav.execute("SELECT * FROM gps ORDER BY timestamp ASC");
var nav_res_last = db_nav.execute("SELECT * FROM gps ORDER BY timestamp DESC");

var num_nav = nav_res.rowCount;

if (num_nav > 0){
	
	var focus_region = {latitude:nav_res_last.fieldByName('latitude'),longitude:nav_res_last.fieldByName('longitude'),latitudeDelta:0.50, longitudeDelta:0.50};
	
	//
	// CREATE MAP VIEW
	//
	var mapview = Titanium.Map.createView({
		mapType: Titanium.Map.STANDARD_TYPE,
		region: focus_region,
		animate:true,
		regionFit:true,
		userLocation:true,
		zIndex: 1
	});
	
	var points = new Array();
	var distance_total = 0;
	var lat_o = nav_res.fieldByName('latitude');
	var lon_o = nav_res.fieldByName('longitude');
	var time_o = nav_res.fieldByName('timestamp');
	points.push(new Array());
	
	while (nav_res.isValidRow())
	{
		var lat = nav_res.fieldByName('latitude');
		var lon = nav_res.fieldByName('longitude');
		var time = nav_res.fieldByName('timestamp');
		
		//If it's been more than 10 minutes since the last saved coordinate, we do not consider this distance
		if (time - time_o < 60*10){
			distance_total += getDistance(parseFloat(lat_o) , parseFloat(lon_o), parseFloat(lat), parseFloat(lon));
		}
		else{
			points.push(new Array());
		}
		
		var entry = {latitude:lat,longitude:lon};
		points[points.length - 1].push(entry);
		
		lat_o = lat;
		lon_o = lon;
		time_o = time;
		
		nav_res.next();
	}
	
	
	for (var _w in points){
		Ti.API.info(_w+" = "+points[_w]);
		
		// route object
		var route = {
			name:"Route",
			points:points[_w],
			color:"red",
			width:4
		};
		
		// add a route
		mapview.addRoute(route);
	}
	win_nav.add(mapview);
	
	var back_bt = Titanium.UI.createButton({
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,
		title:'Back'
	});
	win_nav.leftNavButton = back_bt;
	
	back_bt.addEventListener('click', function(e){
		win_nav.close();
	});
	
	var box = Ti.UI.createView({
		right: '20dp',
		top: '20dp',
		width: '200dp',
		height: '100dp',
		backgroundColor: '#000',
		opacity: 0.8,
		zIndex: 99,
		borderRadius: 10,
		layout: 'vertical'
	});
	win_nav.add(box);
	
	
	var sp_db = db_nav.execute("SELECT MAX(speed) AS speed FROM gps");
	var maxSpeed = (sp_db.fieldByName('speed')*2.23693629).toFixed(1);
	if(maxSpeed < 0){
		maxSpeed = 0;
	}
	var speed = Ti.UI.createLabel({
		text: 'Top speed: '+ maxSpeed +' Mph',
		color: '#FFF',
		font: {
			size: '12dp'
		},
		opacity: 1,
		left: "10dp",
		textAlign:'left',
		top: '5dp'
	});
	box.add(speed);

	var miles = Ti.UI.createLabel({
		text: 'Traveled: '+(distance_total*0.621371192).toFixed(1)+' Miles',
		color: '#FFF',
		font: {
			size: '12dp'
		},
		opacity: 1,
		left: "10dp",
		textAlign:'left',
		top: '5dp'
	});
	box.add(miles);
	
	var total_seconds = num_nav*5; //Each coordinate is capturated from 5 to 5 seconds
	
	var time_obj = secondsToTime(total_seconds);
	
	var time = Ti.UI.createLabel({
		text: 'Time:  '+time_obj.h+'h '+time_obj.m+'m',
		color: '#FFF',
		font: {
			size: '12dp'
		},
		opacity: 1,
		left: "10dp",
		textAlign:'left',
		top: '5dp'
	});
	box.add(time);
	
	var al_db = db_nav.execute("SELECT MAX(altitude) AS altitude FROM gps");
	
	var altitude = Ti.UI.createLabel({
		text: 'Highest altitude: '+Math.round(al_db.fieldByName('altitude') * 3.28084) +' Ft',
		color: '#FFF',
		font: {
			size: '12dp'
		},
		opacity: 1,
		left: "10dp",
		textAlign:'left',
		top: '5dp'
	});
	box.add(altitude);	
	
	db_nav.close();
}
else{
	var a = Titanium.UI.createAlertDialog({
		title:'Omadi',
		buttonNames: ['OK']
	});
	
	a.message = 'Omadi has not processed any saved GPS coordinates yet. Please come back shortly.';
	a.show();
	
	a.addEventListener('click', function(e){
		win_nav.close();
	});
	
}