/** 
 * Name: individual_account.js
 * Function: 
 * 		Show account's informations retrieved from the database
 * Provides:
 * 		the window called by account.js
 *		a way to close the current window and open account.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the account's information.
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
var urlTo;
if (win4.returnTo == "individual_contacts.js")
	urlTo = win4.returnTo;
else
	urlTo = 'accounts.js';	

var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:urlTo,
});

goToWindow.notOpen = (win4.returnTo == "individual_contacts.js") ? true : false;

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");

	if (win4.returnTo == "individual_contacts.js"){
		goToWindow.nid = win4.nidToReturn;
		goToWindow.nameSelected = win4.nameToReturn;
	}
	
	//Passing back the parameters
	goToWindow.name = win4.name;

	//Avoiding memory leaking problems:	
	if (!goToWindow.notOpen)
		goToWindow.open();
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var results  = db.execute('SELECT * FROM account WHERE  nid = '+win4.nid);

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

var l1_2 = Ti.UI.createLabel({
	text: "Name: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "31%",
	left: 0,
	touchEnabled: false
});
resultView.add(l1_2);

var name = results.fieldByName("name");

if ( name == null)
	name = "";
var l1_2l = Ti.UI.createLabel({
	text: ""+name,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "31%",
	left: "50%"
});
resultView.add(l1_2l);


var fresh = "";

if (results.fieldByName("account_type_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("account_type_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();
}

var l2 = Ti.UI.createLabel({
	text: "Account type: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "40%",
	left: 0,
	touchEnabled: false
});
resultView.add(l2);


var l2l = Ti.UI.createLabel({
	text: ""+fresh,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "40%",
	left: "50%"
});
resultView.add(l2l);

var l3 = Ti.UI.createLabel({
	text: "Parent account:",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "49%",
	left: 0,
	touchEnabled: false
});
resultView.add(l3);

var parent = results.fieldByName("parent_account_nid");

if ( parent == null)
	parent = "";
	
var l3l = Ti.UI.createLabel({
	text: ""+parent,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "49%",
	left: "50%"
});
resultView.add(l3l);

var l4 = Ti.UI.createLabel({
	text: "Website: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "58%",
	left: 0,
	touchEnabled: false
});
resultView.add(l4);

var website =  results.fieldByName("website");

if ( website == null)
	website = "";

website = website.replace("http://","");
	
var l4l = Ti.UI.createLabel({
	text: ""+website,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "58%",
	left: "50%"
});
resultView.add(l4l);

var siteResult = results.fieldByName("website");

if (siteResult != null){
	l4l.addEventListener('click', function(){
		siteResult = siteResult.replace("http://","");
		Titanium.Platform.openURL("http://"+siteResult);
	});
}

var l5 = Ti.UI.createLabel({
	text: "Phone: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "67%",
	left: 0,
	touchEnabled: false
});
resultView.add(l5);

var l5l = Ti.UI.createLabel({
	text: ""+phone,
	height: "5%",
	width:  "50%",
	textAlign: 'left',
	top: "67%",
	left: "50%"
});
resultView.add(l5l);


var phone = results.fieldByName("phone");

if ( phone == null )
	phone = "";
else{
	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l5l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});
}
l5l.text = ""+phone;

var l6 = Ti.UI.createLabel({
	text: "Fax: ",
	height: "5%",
	width:  "50%",
	textAlign: 'right',
	top: "76%",
	left: 0,
	touchEnabled: false
});
resultView.add(l6);

var l6l = Ti.UI.createLabel({
	height: "5%",
	width:  "100%",
	textAlign: 'left',
	top: "76%",
	left: "50%"
});
resultView.add(l6l);

var fax = results.fieldByName("fax");

if ( fax == null)
	fax = "";
else{
	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	l6l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumFax);
	});
}

l6l.text = ""+fax;

var l7 = Ti.UI.createLabel({
	text: "Description: ",
	height: "auto",
	width:  "50%",
	left: 0,
	textAlign: 'right',
	top: "85%",
	touchEnabled: false
});
resultView.add(l7);


var description = results.fieldByName("description");

if ( description == null )
	description = "";
	
var l7l = Ti.UI.createLabel({
	text: ""+description,
	height: "auto",
	width:  "50%",
	textAlign: 'left',
	top: "85%",
	left: "50%"
});
resultView.add(l7l);

results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
