/**
 * Name: individual_contact.js
 * Function: 
 * 		Show contact's informations retrieved from the database
 * Provides:
 * 		the window called by contact.js
 *		a way to close the current window and open contact.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the contact information.
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
	url:'contacts.js',
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

var results  = db.execute('SELECT * FROM contact WHERE  nid = '+win4.nid);

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

var l2 = Ti.UI.createLabel({
	text: "Owner: ",
	height: "5%",
	left: 0,
	width:  "50%",
	textAlign: 'right',
	top: "27%",
	touchEnabled: false
});
resultView.add(l2);

var owner = results.fieldByName("owner_uid");

if ( owner == null )
	owner = "";
	
var l2l = Ti.UI.createLabel({
	text: ""+owner,
	height: "5%",
	width:  "50%",
	left: "50%",
	textAlign: 'left',
	top: "27%"
});
resultView.add(l2l);

var l3 = Ti.UI.createLabel({
	text: "First name: ",
	height: "5%",
	left: 0,
	width:  "50%",
	textAlign: 'right',
	top: "33%",
	touchEnabled: false
});
resultView.add(l3);

var first_name = results.fieldByName("first_name");

if (first_name == null )
	first_name = "";
	
var l3l = Ti.UI.createLabel({
	text: ""+first_name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	left: "50%",
	top: "33%"
});
resultView.add(l3l);

var l4 = Ti.UI.createLabel({
	text: "Last name: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	left: 0,
	top: "39%",
	touchEnabled: false
});
resultView.add(l4);

var last_name = results.fieldByName("last_name");

if ( last_name == null)
	last_name = "";

var l4l = Ti.UI.createLabel({
	text: ""+last_name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	left: "50%",
	top: "39%",
});
resultView.add(l4l);

var l5 = Ti.UI.createLabel({
	text: "Account: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "45%",
	left: 0,
	touchEnabled: false
});
resultView.add(l5);


var account_nid = results.fieldByName("account_nid");

if (account_nid != null){
	var auxRes  = db.execute('SELECT * FROM account WHERE  nid = '+account_nid);
	account_name = auxRes.fieldByName("name");
	auxRes.close();
}
else
	account_name = "";
		
var l5l = Ti.UI.createLabel({
	text: ""+account_name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "45%",
	left: "50%"
});
resultView.add(l5l);

// When account is clicked opens a modal window to show off the content of the specific touched
// object.

l5l.addEventListener('click', function(){
	
	var newWin = Ti.UI.createWindow({
		fullscreen: true,
		url: "individual_account.js"
	});
	
	newWin.returnTo = "individual_contacts.js";
	newWin.nid      = account_nid;
	newWin.nameSelected  = account_name;
	newWin.nidToReturn   = win4.nid;
	newWin.nameToReturn  = win4.nameSelected;
	
	newWin.open();
});


var fresh = "";

if (results.fieldByName("lead_source") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_source"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();
}


var l6 = Ti.UI.createLabel({
	text: "Lead Source: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "51%",
	left: 0,
	touchEnabled: false
});
resultView.add(l6);

var l6l = Ti.UI.createLabel({
	text: ""+fresh,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "51%",
	left: "50%"
});
resultView.add(l6l);

var fresh1 = "";

if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();
}


var l7 = Ti.UI.createLabel({
	text: "Job title: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "57%",
	left: 0,
	touchEnabled: false
});
resultView.add(l7);

var l7l = Ti.UI.createLabel({
	text: ""+fresh1,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "57%",
	left: "50%"
});
resultView.add(l7l);

var l8 = Ti.UI.createLabel({
	text: "Phone: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "63%",
	left: 0,
	touchEnabled: false
});
resultView.add(l8);

var l8l = Ti.UI.createLabel({
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "63%",
	left: "50%"
});
resultView.add(l8l);

var phone = results.fieldByName("phone");

if (phone == null)
	phone = "";
else{
	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l8l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});
}

l8l.text = ""+phone;

var l9 = Ti.UI.createLabel({
	text: "Cell phone: ",
	height: "5%",
	left: 0,
	width:  "50%",
	textAlign: 'right',
	top: "69%",
	touchEnabled: false
});
resultView.add(l9);

var l9l = Ti.UI.createLabel({
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "69%",
	left: "50%"
});
resultView.add(l9l);

var cell_phone = results.fieldByName("cell_phone");

if ( cell_phone == null)
	cell_phone = "";
else{
	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw cell phone number: "+ auxNumCell);
	
	l9l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumCell);
	});
}

l9l.text = ""+cell_phone;


var l10 = Ti.UI.createLabel({
	text: "Fax: ",
	height: "5%",
	left: 0,
	width:  "50%",
	textAlign: 'right',
	top: "75%",
	touchEnabled: false
});
resultView.add(l10);

var l10l = Ti.UI.createLabel({
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "75%",
	left: "50%"
});
resultView.add(l10l);

var fax = results.fieldByName("fax");

if ( fax == null)
	fax = "";
else{
	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw fax number: "+ auxNumFax);
	
	l10l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumFax);
	});
}

l10l.text = ""+fax;
	

var l11 = Ti.UI.createLabel({
	text: "Email: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "81%",
	left: 0,
	touchEnabled: false
});
resultView.add(l11);

var email  =  results.fieldByName("email");

if ( email == null )
	email = "";

var l11l = Ti.UI.createLabel({
	text: ""+email,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "81%",
	left: "50%"
});
resultView.add(l11l);

var l12 = Ti.UI.createLabel({
	text: "Description: ",
	height: "auto",
	width:  "50%",
	textAlign: 'right',
	top: "87%",
	left: 0,
	touchEnabled: false
});
resultView.add(l12);

var description = results.fieldByName("description");
 	
if ( description == null)
	description = "";
	
var l12l = Ti.UI.createLabel({
	text: ""+description,
	height: "auto",
	width:  "50%",
	textAlign: 'left',
	top: "87%",
	left: "50%"
});
resultView.add(l12l);


results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
