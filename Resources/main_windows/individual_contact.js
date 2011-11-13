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
	notOpen: true	
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
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

//Label containing the selected name
var labelNameContent = Ti.UI.createLabel({
	text: win4.nameSelected,
	height: 'auto',
	width:  '90%',
	font: {fontSize: 18,  fontWeight: "bold"},
	textAlign: 'center',
	touchEnabled: false
});

header.add(labelNameContent);

var label = [];
var content = []; 
var count = 0;

var owner = results.fieldByName("owner_uid");

if ( owner != null ){
	
	label[count] = Ti.UI.createLabel({
		text: "Owner: ",
		height: "5%",
		left: 0,
		width:  "50%",
		textAlign: 'right',
		top: "27%",
		touchEnabled: false
	});
		
	content[count] = Ti.UI.createLabel({
		text: ""+owner,
		height: "5%",
		width:  "50%",
		left: "50%",
		textAlign: 'left',
		top: "27%"
	});
	
	count++;
}

var account_nid = results.fieldByName("account_nid");

if (account_nid != null){
	var auxRes  = db.execute('SELECT * FROM account WHERE  nid = '+account_nid);
	account_name = auxRes.fieldByName("name");
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Account: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		top: "45%",
		left: 0,
		touchEnabled: false
	});
	
	var l5l = Ti.UI.createLabel({
		text: ""+account_name,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "45%",
		left: "50%"
	});
	
	// When account is clicked opens a modal window to show off the content of the specific touched
	// object.
	
	l5l.addEventListener('click', function(){
		
		var newWin = Ti.UI.createWindow({
			fullscreen: true,
			url: "individual_account.js"
		});
		
		newWin.returnTo = "individual_contact.js";
		newWin.nid      = account_nid;
		newWin.nameSelected  = account_name;
		newWin.nidToReturn   = win4.nid;
		newWin.nameToReturn  = win4.nameSelected;
		
		newWin.open();
	});
	
	content[count] = l5l;
	count++;

}


var fresh = "";

if (results.fieldByName("lead_source") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_source"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Lead Source: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		top: "51%",
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+fresh,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "51%",
		left: "50%"
	});
	
	count++;

}

var fresh1 = "";

if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Job title: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		top: "57%",
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+fresh1,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "57%",
		left: "50%"
	});
	
	count++;

}

var phone = results.fieldByName("phone");

if (phone != null){

	label[count] = Ti.UI.createLabel({
		text: "Phone: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		top: "63%",
		left: 0,
		touchEnabled: false
	});
	
	var l8l = Ti.UI.createLabel({
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "63%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l8l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});

	l8l.text = ""+phone;
	
	content[count] = l8l;
	count++;
}

var cell_phone = results.fieldByName("cell_phone");

if ( cell_phone != null)
{
	label[count] = Ti.UI.createLabel({
		text: "Cell phone: ",
		height: "5%",
		left: 0,
		width:  "50%",
		textAlign: 'right',
		top: "69%",
		touchEnabled: false
	});
	
	var l9l = Ti.UI.createLabel({
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "69%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw cell phone number: "+ auxNumCell);
	
	l9l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumCell);
	});

	l9l.text = ""+cell_phone;
	
	content[count] = l9l;
	count++;
}

var fax = results.fieldByName("fax");

if ( fax != null){

	label[count] = Ti.UI.createLabel({
		text: "Fax: ",
		height: "5%",
		left: 0,
		width:  "50%",
		textAlign: 'right',
		top: "75%",
		touchEnabled: false
	});
	
	var l10l = Ti.UI.createLabel({
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "75%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw fax number: "+ auxNumFax);
	
	l10l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumFax);
	});

	l10l.text = ""+fax;
	
	content[count] = l10l;
	count++;
}

var email  =  results.fieldByName("email");

if ( email != null ){
	label[count] = Ti.UI.createLabel({
		text: "Email: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		top: "81%",
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+email,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		top: "81%",
		left: "50%"
	});
	count++;
}


var description = results.fieldByName("description");
 	
if ( description != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Description: ",
		height: "auto",
		width:  "50%",
		textAlign: 'right',
		top: "87%",
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+description,
		height: "auto",
		width:  "50%",
		textAlign: 'left',
		top: "87%",
		left: "50%"
	});
	count++;
}

var hScreen = Titanium.Platform.displayCaps.platformHeight;

var base = 0.42 - ((count - 1)*0.02);

Ti.API.info("Items (count): "+ count);

for (var i = 0; i < count ; i++){

	var newTop = base + (i*0.05);
	label[i].top = newTop*hScreen;
	label[i].color = "#999999";
	
	content[i].top = newTop*hScreen;
	content[i].color = "#FFFFFF";
		
	resultView.add(label[i]);
	resultView.add(content[i]);

}


results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
