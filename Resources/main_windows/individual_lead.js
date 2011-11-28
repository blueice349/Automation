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

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:'leads.js',
	notOpen: true
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var results  = db.execute('SELECT * FROM lead WHERE  nid = '+win4.nid);

// showToolbar(name, actualWindow)
//showToolbar( win4.name, win4);
//The view where the results are presented
var resultView = Ti.UI.createView({
	top: '5%',
	height: '86%',
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
	font: {fontSize: 18 , fontWeight: "bold"},
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
var heightValue = 15;
var hasSelection = false;
var fresh = "";

if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh = auxRes.fieldByName("name");
	
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Job title: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var label1 = Ti.UI.createLabel({
		text: ""+fresh,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});
	Ti.API.info("Job title: "+ count);

	label1.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label1.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label1;
	count++;
}


var fresh1 = "";

if (results.fieldByName("lead_status_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_status_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Lead status: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	label2 = Ti.UI.createLabel({
		text: ""+fresh1,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});
		
	label2.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label2.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label2;
		
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
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	label3 = Ti.UI.createLabel({
		text: ""+fresh2,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	label3.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label3.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label3;


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
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var label4 = Ti.UI.createLabel({
		text: ""+fresh3,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	label4.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label4.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label4;


	Ti.API.info("Comp. company: "+ count);

	count++;
}


var company = results.fieldByName("company");
	
if (company != null){
	label[count] = Ti.UI.createLabel({
		text: "Company: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	label5 = Ti.UI.createLabel({
		text: ""+company,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	label5.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label5.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label5;

	
	Ti.API.info("Company : "+ count);
	count++;
	
}


var phone = results.fieldByName("phone");

if (phone != null)
{

	label[count] = Ti.UI.createLabel({
		text: "Phone: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l10l = Ti.UI.createLabel({
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l10l.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l10l.backgroundColor = "#89A676";
		hasSelection = true;

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
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l11l = Ti.UI.createLabel({
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumCell);
	
	l11l.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l11l.backgroundColor = "#89A676";
		hasSelection = true;

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
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l12l = Ti.UI.createLabel({
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	l12l.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l12l.backgroundColor = "#89A676";
		hasSelection = true;


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
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var index = email.indexOf(".");
		
	label6 = Ti.UI.createLabel({
		text: email, 
		height:  heightValue,
		width:  "100%",
		textAlign: 'left',
		left: "50%"
	});

	label6.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label6.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label6;

	
	Ti.API.info("Email: "+ count);

	count++;
}

var website = results.fieldByName("website");

if ( website != null){
	label[count] = Ti.UI.createLabel({
		text: "Website: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
			
	label7 = Ti.UI.createLabel({
		text: ""+website,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	label7.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		label7.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = label7;

	
	Ti.API.info("Website: "+ count);

	count++;
}

var description = results.fieldByName("description");

if ( description != null ){
	label[count]  = Ti.UI.createLabel({
		text: "Description: ",
		height:  heightValue,
		width:  "50%",
		left: 0,
		textAlign: 'right',
		touchEnabled: false
	});
		
		
	var openMe = Titanium.UI.createButton({
			title: 'Open',
			width: '30%',
			height:  heightValue+4,
			left: "50%",
			width:  "50%",
		    backgroundColor: '#000000',
		    backgroundSelectedColor: "#E4A520",
		    borderColor: '#1c1d1c',
		    borderRadius: 6,
		    color: '#ffffff',
		    borderWidth: '0',
		    font:{size:7, fontWeight:'lighter'},
		    backgroundImage: 'none',
	});
	
	openMe.addEventListener('click', function(){
		var descWin = Ti.UI.createWindow({
			modal: true,
			opacity: 0.99
		});
		
		//Header where the selected name is presented
		var descHeader = Ti.UI.createView({
			top: '0',
			height: '20%',
			width: '100%',
			borderRadius: 5,
			backgroundColor: '#A9A9A9',
			opacity: 0.5
		});
		descWin.add(descHeader);
		
		//Label containing the selected name
		var labelDescContent = Ti.UI.createLabel({
			text: "Description",
			height: 'auto',
			color: "#FFFFFF",
			width:  '90%',
			font: {fontSize: 18,  fontWeight: "bold"},
			textAlign: 'center',
			touchEnabled: false
		});
		
		descHeader.add(labelDescContent);
			
		var textDesc = Ti.UI.createTextArea({
			value: description,
			color: "blue",
			editable: false,
			top: "30%"
		});	
		
		descWin.add(textDesc);
		
		descWin.open();
		
		descWin.addEventListener('click', function(){
			descWin.close();
		});
		
	});
	
	content[count] = openMe;
	count++;

}


var result = Array();
 
result = getMult(count);

var hScreen = Titanium.Platform.displayCaps.platformHeight;

var base = result["baseConstant"] - ((count - 1)*0.02);

Ti.API.info("Items (count): "+ count);

	
for (var i = 0; i < count ; i++){

	var newTop = base + (i*result["calc"]);
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
