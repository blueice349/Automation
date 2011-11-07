/**
 * Name: individual_lead.js
 * Function: 
 * 		Show lead's informations retrieved from the database
 * Provides:
 * 		the window called by lead.js
 *		a way to close the current window and open lead.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the lead's information.
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
	url:'leads.js',
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
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var results  = db.execute('SELECT * FROM lead WHERE  nid = '+win4.nid);

// showToolbar(name, actualWindow)
//showToolbar( win4.name, win4);
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

var mailResult = results.fieldByName("email");
Ti.API.info("Phone: "+results.fieldByName("phone"));
Ti.API.info("Cell Phone: "+results.fieldByName("cell_phone"));
Ti.API.info("Fax : "+results.fieldByName("fax"));


var l3 = Ti.UI.createLabel({
	text: "First name: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "28%",
	left: 0,
	touchEnabled: false
});
resultView.add(l3);

var first_name = results.fieldByName("first_name");

if (first_name == null)
	first_name = '';

var l3l = Ti.UI.createLabel({
	text: ""+first_name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "28%",
	left: "50%"
});
resultView.add(l3l);

var l4 = Ti.UI.createLabel({
	text: "Last name: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "33%",
	left: 0,
	touchEnabled: false
});
resultView.add(l4);

var last_name = results.fieldByName("last_name");

if (last_name == null)
	last_name = "";
	
var l4l = Ti.UI.createLabel({
	text: ""+last_name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "33%",
	left: "50%"
});
resultView.add(l4l);

var fresh = "";

if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();
}

var l5 = Ti.UI.createLabel({
	text: "Job title: ",
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

if (results.fieldByName("lead_status_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_status_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();
}

var l6 = Ti.UI.createLabel({
	text: "Lead status: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "43%",
	left: 0,
	touchEnabled: false
});
resultView.add(l6);

var l6l = Ti.UI.createLabel({
	text: ""+fresh1,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "43%",
	left: "50%"
});
resultView.add(l6l);


var fresh2 = "";

if (results.fieldByName("lead_source_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_source_tid"));
	var fresh2 = auxRes.fieldByName("name");
	auxRes.close();
}

var l7 = Ti.UI.createLabel({
	text: "Lead source: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "48%",
	left: 0,
	touchEnabled: false
});
resultView.add(l7);

var l7l = Ti.UI.createLabel({
	text: ""+fresh2,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "48%",
	left: "50%"
});
resultView.add(l7l);

var fresh3 = "";

if (results.fieldByName("competing_company_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("competing_company_tid"));
	var fresh3 = auxRes.fieldByName("name");
	auxRes.close();
}


var l8 = Ti.UI.createLabel({
	text: "Comp. company: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "53%",
	left: 0,
	touchEnabled: false
});
resultView.add(l8);

var l8l = Ti.UI.createLabel({
	text: ""+fresh3,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "53%",
	left: "50%"
});
resultView.add(l8l);

var l9 = Ti.UI.createLabel({
	text: "Company: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "58%",
	left: 0,
	touchEnabled: false
});
resultView.add(l9);

var company = results.fieldByName("company");

if (company == null)
	company = "";

var l9l = Ti.UI.createLabel({
	text: ""+company,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "58%",
	left: "50%"
});
resultView.add(l9l);

var l10 = Ti.UI.createLabel({
	text: "Phone: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "63%",
	left: 0,
	touchEnabled: false
});
resultView.add(l10);

var l10l = Ti.UI.createLabel({
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "63%",
	left: "50%"
});
resultView.add(l10l);


var phone = results.fieldByName("phone");

if (phone == null)
	phone = "";
else{
	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l10l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});
}

l10l.text = ""+phone;	
	

var l11 = Ti.UI.createLabel({
	text: "Cell phone: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "68%",
	left: 0,
	touchEnabled: false
});
resultView.add(l11);

var l11l = Ti.UI.createLabel({
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "68%",
	left: "50%"
});
resultView.add(l11l);


var cell_phone = results.fieldByName("cell_phone");

if (cell_phone == null )
	cell_phone = "";
else{
	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumCell);
	
	l11l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumCell);
	});
}

l11l.text = ""+cell_phone;	
	

var l12 = Ti.UI.createLabel({
	text: "Fax: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "73%",
	left: 0,
	touchEnabled: false
});
resultView.add(l12);

var l12l = Ti.UI.createLabel({
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "73%",
	left: "50%"
});
resultView.add(l12l);

var fax = results.fieldByName("fax");

if ( fax == null)
	fax = "";
else{
	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	l12l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumFax);
	});
}

l12l.text = ""+fax;	
	


var l14 = Ti.UI.createLabel({
	text: "Email: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "78%",
	left: 0,
	touchEnabled: false
});
resultView.add(l14);

var email = results.fieldByName("email");

if ( email == null)
	email = "";

var index = email.indexOf(".");
	
var l14 = Ti.UI.createLabel({
	text: email, 
	height: "5%",
	width:  "100%",
	textAlign: 'left',
	top: "78%",
	left: "50%"
});
resultView.add(l14);


var l15 = Ti.UI.createLabel({
	text: "Website: ",
	height: "auto",
	width:  "50%",
	textAlign: 'right',
	top: "83%",
	left: 0,
	touchEnabled: false
});
resultView.add(l15);

var website = results.fieldByName("website");

if ( website == null)
	website = "";
	
var l15l = Ti.UI.createLabel({
	text: ""+website,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "83%",
	left: "50%"
});
resultView.add(l15l);

var l16 = Ti.UI.createLabel({
	text: "Description: ",
	height: "auto",
	width:  "50%",
	textAlign: 'right',
	top: "88%",
	left: 0,
	touchEnabled: false
});
resultView.add(l16);

var description = results.fieldByName("description");

if ( description == null )
	description = "";
	
var l16l = Ti.UI.createLabel({
	text: ""+description,
	height: "auto",
	width:  "50%",
	textAlign: 'left',
	top: "88%",
	left: "50%"
});
resultView.add(l16l);


results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
