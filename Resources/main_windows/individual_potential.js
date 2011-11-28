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
	notOpen: true
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
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

//Label containing the selected name
var labelNameContent = Ti.UI.createLabel({
	text: win4.nameSelected,
	height: 'auto',
	width:  '90%',
	font: {fontSize: 18, fontWeight: "bold"},
	textAlign: 'center',
	touchEnabled: false
});

header.add(labelNameContent);

var label = [];
var content = []; 
var count = 0;
var heightValue = 15;
var hasSelection = false;


Ti.API.info("Phone: "+results.fieldByName("phone"));
Ti.API.info("Fax : "+results.fieldByName("fax"));

var account_nid = results.fieldByName("account_nid");

if (account_nid != null){
	var auxRes  = db.execute('SELECT * FROM account WHERE  nid = '+account_nid);
	account_name = auxRes.fieldByName("name");
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Account: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		top: "45%",
		left: 0,
		touchEnabled: false
	});
	
	var l5l = Ti.UI.createLabel({
		text: ""+account_name,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		top: "45%",
		left: "50%"
	});
	
	// When account is clicked opens a modal window to show off the content of the specific touched
	// object.
	
	l5l.addEventListener('click', function(){

		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l5l.backgroundColor = "#89A676";
		hasSelection = true;
		
		var newWin = Ti.UI.createWindow({
			fullscreen: true,
			url: "individual_account.js"
		});
		
		newWin.returnTo = "individual_potential.js";
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

if (results.fieldByName("potential_stage_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("potential_stage_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Potential stage: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		top: "38%",
		left: 0,
		touchEnabled: false
	});
	
	var label1 = Ti.UI.createLabel({
		text: ""+fresh,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		top: "38%",
		left: "50%"
	});

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

if (results.fieldByName("competing_company_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("competing_company_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Competing company: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		top: "48%",
		left: 0,
		touchEnabled: false
	});
	
	var label2 = Ti.UI.createLabel({
		text: ""+fresh1,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		top: "48%",
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
	
	count++;
}

var fresh2 = "";

if (results.fieldByName("potential_type_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("potential_type_tid"));
	var fresh2 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Potential type: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		top: "58%",
		left: 0,
		touchEnabled: false
	});
	
	var label3 = Ti.UI.createLabel({
		text: ""+fresh2,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		top: "58%",
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

	count++;
}

var closing_date = results.fieldByName("closing_date");

if ( closing_date != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Closing date: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		top: "68%",
		left: 0,
		touchEnabled: false
	});	
		
	var label4 = Ti.UI.createLabel({
		text: ""+closing_date,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		top: "68%",
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
	count++;
}


var next_step = results.fieldByName("next_step");

if ( next_step != null ){
	
	label[count] = Ti.UI.createLabel({
		text: "Next step: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		top: "78%",
		left:0,
		touchEnabled: false
	});
		
	var label5 = Ti.UI.createLabel({
		text: ""+next_step,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		top: "78%",
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
