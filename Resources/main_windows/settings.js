/**
 * Name: settings.js
 * @author Joseandro
 */

//Current window's instance
var win2 = Ti.UI.currentWindow;

//Common used functions
Ti.include('../lib/functions.js');

var version = 'Omadi Inc';

var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: 'Settings',
	height:'auto',
	width:'auto',
	textAlign:'center'
});

if ( !Titanium.App.Properties.getBool("succesSync") && !win2.firstOpen){
	label_status.text = 'The operation timed out. Please try again later.';
	setTimeout(function(){
		label_status.text = 'Settings';
		},4000);	
}

var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({
	fullscreen : true,
	url : 'mainMenu.js',
	notOpen: true
});


//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win2.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");

	//Passing back the parameters
	goToWindow.log = win2.log;
	goToWindow.picked = win2.picked;
	goToWindow.result = win2.result;

	//Avoids memory leaking problems:
	goToWindow.open();
	win2.close();
});


//Button Contacts
var bSync = Titanium.UI.createButton({
   title: 'Synchronize',
   width: '80%',
   height: '9%',
   top: '45%' 
});

//Action taken when syncronization button is pressed
bSync.addEventListener('click', function(){
	if ( !Titanium.App.Properties.getBool("UpRunning") ){
		var updateWin = Ti.UI.createWindow({
			url: "upContainer.js",
			fullscreen: true
		});		
		
		updateWin.log	     = win2.log;
		updateWin.picked 	 = win2.picked;
		updateWin.name   	 = win2.name;
		updateWin.result     = win2.result;

		updateWin.open();
		win2.close();
	}
	else{
		alert("Database is already being updated!");
	}
});


var guide = Titanium.UI.createView({
	top: '0px',	
	backgroundColor:'#111',
	height: '7%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0
});

guide.add(label_status);
win2.add(bSync);

win2.add(guide);

//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

//showBottom(actualWindow, goToWindow )
showBottom(win2, goToWindow);
