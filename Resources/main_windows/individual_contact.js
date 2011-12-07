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
	title:'Contacts',
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
	opacity: 0.23,
	zIndex: 11
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

var viewContent = Ti.UI.createScrollView({
    height:"auto",
    top: "19%",
    backgroundColor: '#111111',
	showHorizontalScrollIndicator: false,
	showVerticalScrollIndicator: true,
	opacity: 1,
	borderRadius: 7,
	zIndex: 10
});

resultView.add(viewContent);

var label = [];
var content = []; 
var border = [];
var cell = [];
var count = 0;
var heightValue = 38;
var fresh = "";


var owner = results.fieldByName("owner_uid");

if ( owner != null ){
	
	label[count] = Ti.UI.createLabel({
		text: "Owner: ",
		left: 5,
		width:  "33%",
		textAlign: 'left',
		touchEnabled: false
	});
		
	var label1 = Ti.UI.createLabel({
		text: ""+owner,
		width:  "67%",
		left: "33%",
		textAlign: 'left',
	});
	
	var aux1 = count;
	label1.addEventListener('click', function(){
		highlightMe( aux1);
	});

	content[count] = label1;	

	count++;
}

var account_nid = results.fieldByName("account_nid");

if (account_nid != null){
	var auxRes  = db.execute('SELECT * FROM account WHERE  nid = '+account_nid);
	account_name = auxRes.fieldByName("name");
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Account: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l5l = Ti.UI.createLabel({
		text: ""+account_name,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
	
	// When account is clicked opens a modal window to show off the content of the specific touched
	// object.

	var aux2x = count;
	
	l5l.addEventListener('click', function(){
		
		highlightMe( aux2x);
		var newWin = Ti.UI.createWindow({
			fullscreen: true,
			title:'Account',
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
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	label2 = Ti.UI.createLabel({
		text: ""+fresh,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
	
	
	var aux2 = count;
	label2.addEventListener('click', function(){
		highlightMe( aux2);
	});
	content[count] = label2;	

	count++;

}

var fresh1 = "";

if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Job title: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var label3 = Ti.UI.createLabel({
		text: ""+fresh1,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});


	var aux3 = count;
	label3.addEventListener('click', function(){
		highlightMe( aux3);
	});

	content[count] = label3;	
	
	count++;

}

var phone = results.fieldByName("phone");

if (phone != null){

	label[count] = Ti.UI.createLabel({
		text: "Phone: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l8l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux4 = count;

	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l8l.addEventListener('click', function(){
		highlightMe( aux4);
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
		left: 5,
		width:  "33%",
		textAlign: 'left',
		touchEnabled: false
	});
	
	var l9l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux5 = count;

	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw cell phone number: "+ auxNumCell);
	
	l9l.addEventListener('click', function(){
		highlightMe( aux5);
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
		left: 5,
		width:  "33%",
		textAlign: 'left',
		touchEnabled: false
	});
	
	var l10l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux6 = count;
	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw fax number: "+ auxNumFax);
	
	l10l.addEventListener('click', function(){
		highlightMe( aux6);		
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
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	label4 = Ti.UI.createLabel({
		text: ""+email,
		width:  "100%",
		textAlign: 'left',
		left: "33%"
	});
	
	var aux7 = count;
	label4.addEventListener('click', function(){
		highlightMe( aux7);
	});

	content[count] = label4;
	
	count++;
}


var description = results.fieldByName("description");

if ( description != null ){
	label[count]  = Ti.UI.createLabel({
		text: "Description: ",
		width:  "33%",
		left: 5,
		textAlign: 'left',
		touchEnabled: false
	});

	var descAux = description;
	var openDescWin = false;
	
	if (description.length > 45){
		description = description.substring(0,45);
		description = description+"...";
		openDescWin = true;
	}
	
	var labelDesc = Ti.UI.createLabel({
		text: ""+description,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var auxDesc = count;

	labelDesc.addEventListener('click', function(){
		highlightMe(auxDesc);
		
		if (openDescWin)
		{
			openBigText(descAux);
		}
	});

	content[count] = labelDesc;	
	count++;
}

Ti.API.info("Items (count): "+ count);
for (var i = 0; i < count ; i++){

	cell[i] = Ti.UI.createView({
		height: heightValue,
		top : 40*i
	});
	label[i].color = "#999999";
	content[i].color = "#FFFFFF";
	
	cell[i].add(label[i]);
	cell[i].add(content[i]);

	viewContent.add(cell[i]);	
	
	border[i] = Ti.UI.createView({
		backgroundColor:"#F16A0B",
		height:2,
		top: (40*(i+1))-2
	});
	viewContent.add(border[i]);
}

function highlightMe(data) {
	cell[data].backgroundColor = "#F16A0B";
	setTimeout(function(){
		cell[data].backgroundColor = '#111111'; 
	}, 100);
};



results.close();
db.close();
//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);