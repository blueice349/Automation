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

if (win4.returnTo == "accounts.js")
	urlTo = 'accounts.js';
else
	urlTo = win4.returnTo; 	

var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:urlTo,
	notOpen: true	
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
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
var heightValue = 15;
var fresh = "";
var hasSelection = false;


if (results.fieldByName("account_type_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("account_type_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Account type: ",
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


var parent = results.fieldByName("parent_account_nid");

if ( parent != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Parent account:",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
		
	label2 = Ti.UI.createLabel({
		text: ""+parent,
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
	count++;
}

var website =  results.fieldByName("website");

if ( website != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Website: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});

	website = website.replace("http://","");
		
	var l4l = Ti.UI.createLabel({
		text: ""+website,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});
	
	l4l.addEventListener('click', function(){
		website = website.replace("http://","");
		Titanium.Platform.openURL("http://"+website);
	});
	
	l4l.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l4l.backgroundColor = "#89A676";
		hasSelection = true;
	});

	content[count] = l4l;
	count++;
}


var phone = results.fieldByName("phone");

if ( phone != null ){

	var l5 = Ti.UI.createLabel({
		text: "Phone: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l5l = Ti.UI.createLabel({
		text: ""+phone,
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});
	
	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l5l.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l5l.backgroundColor = "#89A676";
		hasSelection = true;

		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});

	l5l.text = ""+phone;
	
	label[count] = l5;
	content[count] = l5l;
	count++;
}

var fax = results.fieldByName("fax");
if ( fax != null){
	var l6 = Ti.UI.createLabel({
		text: "Fax: ",
		height:  heightValue,
		width:  "50%",
		textAlign: 'right',
		left: 0,
		touchEnabled: false
	});
	
	var l6l = Ti.UI.createLabel({
		height:  heightValue,
		width:  "auto",
		textAlign: 'left',
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	l6l.addEventListener('click', function(){
		if (hasSelection){
			for (var arp=0 ; arp < count; arp++){
				content[arp].backgroundColor = '#111111'; 
			}
		}
		l6l.backgroundColor = "#89A676";
		hasSelection = true;

		Titanium.Platform.openURL('tel:'+auxNumFax);
	});

	l6l.text = ""+fax;
	
	label[count] = l6;
	content[count] = l6l;
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