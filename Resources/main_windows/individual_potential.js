/**
 * Name: individual_potential.js
 * Function: 
 * 		Show potential's informations retrieved from the database
 * Provides:
 * 		the window called by potential.js
 *		a way to close the current window and open potential.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the potential's information.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win4 = Ti.UI.currentWindow;

//Sets only portrait mode
win4.orientationModes = [ Titanium.UI.PORTRAIT ];

//
// create base UI root window
//
var logWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:'../app.js',
});

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:'potentials.js',
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");

	//Passing back the parameters
	goToWindow.log = win4.log;
   	goToWindow.picked = win4.picked;
	goToWindow.result = win4.result;
	goToWindow.name = win4.name;

	//Avoiding memory leaking problems:	
	goToWindow.open();
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', 'omadiDb416');

var results  = db.execute('SELECT * FROM potential WHERE  nid = '+win4.nid);

//The view where the results are presented
var resultView = Ti.UI.createView({
	top: '5%',
	height: '85%',
	width: '90%',
	borderRadius: 5,
	backgroundColor: '#A9A9A9',
	opacity: 0.05
});
win4.add(resultView);


//Header where the selected name is presented
var header = Ti.UI.createView({
	top: '0',
	height: '20%',
	width: '100%',
	borderRadius: 5,
	backgroundColor: '#A9A9A9',
	opacity: 0.1
});
resultView.add(header);

//Label containing "Name" 
var labelName = Ti.UI.createLabel({
	text: 'Name: ',
	height: 'auto',
	width:  '18%',
	left: '5%',
	font: {fontSize: 11},
	textAlign: 'left',
	touchEnabled: false,
});

//Label containing the selected name
var labelNameContent = Ti.UI.createLabel({
	text: win4.nameSelected,
	height: 'auto',
	width:  '77%',
	left: '23%',
	font: {fontSize: 11},
	textAlign: 'left',
	touchEnabled: false,
});

header.add(labelName);
header.add(labelNameContent);

var screenWidth = Titanium.Platform.displayCaps.platformWidth;
var screenHeight = Titanium.Platform.displayCaps.platformHeight;

Ti.API.info("Phone: "+results.fieldByName("phone"));
Ti.API.info("Fax : "+results.fieldByName("fax"));

var l3 = Ti.UI.createLabel({
	text: "Name: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "28%",
	left: 0,
	touchEnabled: false
});
resultView.add(l3);

var name = results.fieldByName("name");

if ( name == null)
	name = "";
	
var l3l = Ti.UI.createLabel({
	text: ""+name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "28%",
	left: "50%"
});
resultView.add(l3l);

var fresh = "";

if (results.fieldByName("potential_stage_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("potential_stage_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();
}


var l5 = Ti.UI.createLabel({
	text: "Potential stage: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "38%",
	left: 0,
	touchEnabled: false
});
resultView.add(l5);

var l5l = Ti.UI.createLabel({
	text: ""+fresh,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "38%",
	left: "50%"
});
resultView.add(l5l);


var fresh1 = "";

if (results.fieldByName("competing_company_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("competing_company_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();
}

var l6 = Ti.UI.createLabel({
	text: "Competing company: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "48%",
	left: 0,
	touchEnabled: false
});
resultView.add(l6);


var l6l = Ti.UI.createLabel({
	text: ""+fresh1,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "48%",
	left: "50%"
});
resultView.add(l6l);

var fresh2 = "";

if (results.fieldByName("potential_type_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("potential_type_tid"));
	var fresh2 = auxRes.fieldByName("name");
	auxRes.close();
}

var l7 = Ti.UI.createLabel({
	text: "Potential type: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "58%",
	left: 0,
	touchEnabled: false
});
resultView.add(l7);

var l7l = Ti.UI.createLabel({
	text: ""+fresh2,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "58%",
	left: "50%"
});
resultView.add(l7l);

var l8 = Ti.UI.createLabel({
	text: "Closing date: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "68%",
	left: 0,
	touchEnabled: false
});
resultView.add(l8);

var closing_date = results.fieldByName("closing_date");

if ( closing_date == null)
	closing_date = "";
	
var l8l = Ti.UI.createLabel({
	text: ""+closing_date,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "68%",
	left: "50%"
});
resultView.add(l8l);

var l9 = Ti.UI.createLabel({
	text: "Next step: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "78%",
	left:0,
	touchEnabled: false
});
resultView.add(l9);

var next_step = results.fieldByName("next_step");

if ( next_step == null )
	next_step = "";
	
var l9l = Ti.UI.createLabel({
	text: ""+next_step,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "78%",
	left: "50%"
});
resultView.add(l9l);

var l10 = Ti.UI.createLabel({
	text: "Description: ",
	height: "auto",
	width:  "50%",
	textAlign: 'right',
	top: "88%",
	left: 0,
	touchEnabled: false
});
resultView.add(l10);

var description = results.fieldByName("description");

if ( description == null )
	description = "";
	
var l10l = Ti.UI.createLabel({
	text: ""+description,
	height: "auto",
	width:  "50%",
	textAlign: 'left',
	top: "88%",
	left: "50%"
});
resultView.add(l10l);

results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
