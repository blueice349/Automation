// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var stop = false;
var win1 = Titanium.UI.createWindow({
title : 'Tracker',
backgroundColor : '#fff'
});

var lat = Titanium.UI.createLabel({
color : '#999',
top : 290,
left : 0,
height : 30,
text : 'Lat:',
//font:{fontSize:20,fontFamily:'Helvetica Neue'},
//textAlign:'center',
width : 'auto'
});

var lon = Titanium.UI.createLabel({
color : '#999',
top : 320,
left : 0,
height : 30,
text : 'Lon:',
//font:{fontSize:20,fontFamily:'Helvetica Neue'},
//textAlign:'center',
width : 'auto'
});

var acc = Titanium.UI.createLabel({
color : '#999',
top : 350,
left : 0,
height : 30,
text : 'Accuracy: ',
//font:{fontSize:20,fontFamily:'Helvetica Neue'},
//textAlign:'center',
width : 'auto'
});

win1.add(lat);
win1.add(lon);
win1.add(acc);

win1.addEventListener('click', function(e) {
stop = true;
alert('click')
});

win1.open();

var curr;
var movement = require('com.omadi.ios_gps');

Ti.API.info('Accuracy three: ' + movement.LOCATION_ACCURACY_THREE_KILOMETERS);
Ti.API.info('Accuracy best: ' + movement.LOCATION_ACCURACY_BEST);
Ti.API.info('Accuracy navig: ' + movement.LOCATION_ACCURACY_BEST_FOR_NAVIGATION);

movement.startMovementUpdates({
	location : true,
	locationAccuracy : movement.LOCATION_ACCURACY_BEST
});

function s() {
curr = movement.currentMovement;

lat.setText('Lat: ' + curr.location.latitude);
lon.setText('Lon: ' + curr.location.longitude);
acc.setText('Accuracy : ' + curr.location.accuracy);
Ti.API.info('=====>>> Longitude '+curr.location.longitude);
Ti.API.info('=====>>> Latitude '+curr.location.latitude);
Ti.API.info('=====>>> Accuracy '+curr.location.accuracy);
setTimeout(s, 5000);

return;
}


setTimeout(s, 5000); 
