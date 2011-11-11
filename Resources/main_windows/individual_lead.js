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

//Label containing the selected name
var labelNameContent = Ti.UI.createLabel({
	text: win4.nameSelected,
	height: 'auto',
	width:  '90%',
	font: {fontSize: 18},
	textAlign: 'center',
	touchEnabled: false
});

header.add(labelNameContent);

var mailResult = results.fieldByName("email");
Ti.API.info("Phone: "+results.fieldByName("phone"));
Ti.API.info("Cell Phone: "+results.fieldByName("cell_phone"));
Ti.API.info("Fax : "+results.fieldByName("fax"));


var label = [];
var content = []; 
var count = 0;

var first_name = results.fieldByName("first_name");

if (first_name != null){
	label[count]  = Ti.UI.createLabel({
		text: "First name: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});

	content[count] = Ti.UI.createLabel({
		text: ""+first_name,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
	Ti.API.info("Name : "+ count); 
	count++;
}
	
var last_name = results.fieldByName("last_name");

if (last_name != null){
	label[count] = Ti.UI.createLabel({
		text: "Last name: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
		
	content[count] = Ti.UI.createLabel({
		text: ""+last_name,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
	Ti.API.info("Last name: "+ count);

	count++;
}

var fresh = "";

if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh = auxRes.fieldByName("name");
	
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Job title: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+fresh,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
	Ti.API.info("Job title: "+ count);

	count++;
}


var fresh1 = "";

if (results.fieldByName("lead_status_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_status_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Lead status: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+fresh1,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
		
		
	Ti.API.info("Lead Status: "+ count);	 
	count++;

}



var fresh2 = "";

if (results.fieldByName("lead_source_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_source_tid"));
	var fresh2 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Lead source: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+fresh2,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});

	Ti.API.info("Lead source: "+ count);
	count++;
}


var fresh3 = "";

if (results.fieldByName("competing_company_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("competing_company_tid"));
	var fresh3 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Comp. company: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+fresh3,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});

	Ti.API.info("Comp. company: "+ count);

	count++;
}


var company = results.fieldByName("company");
	
if (company != null){
	label[count] = Ti.UI.createLabel({
		text: "Company: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+company,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
	
	Ti.API.info("Company : "+ count);
	count++;
	
}


var phone = results.fieldByName("phone");

if (phone != null)
{

	label[count] = Ti.UI.createLabel({
		text: "Phone: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l10l = Ti.UI.createLabel({
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l10l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});
	
	l10l.text = ""+phone;
	
	Ti.API.info("Phone : "+ count);

	content[count] = l10l;
	count++;
	
}	

var cell_phone = results.fieldByName("cell_phone");

if (cell_phone != null ){

	label[count] = Ti.UI.createLabel({
		text: "Cell phone: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l11l = Ti.UI.createLabel({
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumCell);
	
	l11l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumCell);
	});
	
	l11l.text = ""+cell_phone;

	Ti.API.info("Cell phone: "+ count);
	content[count] = l11l;
	count++;

}	

var fax = results.fieldByName("fax");

if ( fax != null){
	label[count] = Ti.UI.createLabel({
		text: "Fax: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l12l = Ti.UI.createLabel({
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	l12l.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNumFax);
	});

	l12l.text = ""+fax;
	
	Ti.API.info("Fax: "+ count);

	content[count] = l12l;
	count++;
}

var email = results.fieldByName("email");

if ( email != null){
	label[count] = Ti.UI.createLabel({
		text: "Email: ",
		height: "5%",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var index = email.indexOf(".");
		
	content[count] = Ti.UI.createLabel({
		text: email, 
		height: "5%",
		width:  "100%",
		textAlign: 'left',
		left: "50%"
	});
	
	Ti.API.info("Email: "+ count);

	count++;
}

var website = results.fieldByName("website");

if ( website != null){
	label[count] = Ti.UI.createLabel({
		text: "Website: ",
		height: "auto",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
			
	content[count] = Ti.UI.createLabel({
		text: ""+website,
		height: "5%",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
	
	Ti.API.info("Website: "+ count);

	count++;
}

var description = results.fieldByName("description");

if ( description != null ){
	
	label[count] = Ti.UI.createLabel({
		text: "Description: ",
		height: "auto",
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	content[count] = Ti.UI.createLabel({
		text: ""+description,
		height: "auto",
		width:  "50%",
		textAlign: 'left',
		left: "50%"
	});
	
	Ti.API.info("Description: "+ count);

	count++;
}

var hScreen = Titanium.Platform.displayCaps.platformHeight;

var base = 0.42 - ((count - 1)*0.02);

Ti.API.info("Items (count): "+ count);

for (var i = 0; i < count ; i++){

	var newTop = base + (i*0.05);
	label[i].top = newTop*hScreen;
	content[i].top = newTop*hScreen;
	
	resultView.add(label[i]);
	resultView.add(content[i]);
}

results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
