/**
 * Name: individual_contact.js
 * Function: 
 * 		Show contact's informations retrieved from the server
 * Provides:
 * 		Internet connection checking.
 * 		the window called by contact.js(contact button)
 *		a way to close the current window and open contact.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the log out button.
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
	
var db = Ti.Database.install('../database/db.sqlite', 'omadiDb367');

var results  = db.execute('SELECT phone, cell_phone, fax, email FROM lead WHERE  nid = '+win4.nid);

// showToolbar(name, actualWindow)
showToolbar( win4.name, win4);
//The view where the results are presented
var resultView = Ti.UI.createView({
	top: '16%',
	height: '74%',
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

if  (  ( (results.fieldByName("phone") != null) && (results.fieldByName("cell_phone") == null) && (results.fieldByName("fax") == null) )  
	|| ( (results.fieldByName("phone") == null) && (results.fieldByName("cell_phone") != null) && (results.fieldByName("fax") == null) )
	|| ( (results.fieldByName("phone") == null) && (results.fieldByName("cell_phone") == null) && (results.fieldByName("fax") != null) ) ){
	
	Ti.API.info("ONE NUMBER");
	
	var type;
	var dbType;
	
	if (results.fieldByName("phone") != null){
		type = "Phone: ";
		dbType = "phone";
	}

	else if (results.fieldByName("cell_phone") != null){
		type = "Cell Phone: ";
		dbType = "cell_phone";
	}
	else{
		type = "Fax: ";
		dbType = "fax";
	}
	var typeLabel = Ti.UI.createLabel({
		text: type,
		height: "10%",
		width:  "30%",
		textAlign: 'left',
		top: "49%",
		touchEnabled: false,
		left: "10%"
	});
	resultView.add(typeLabel);
	
	var numberString  = results.fieldByName(dbType);
	
	//Print number in the format (XXX) XXX-XXXX 
	var number = Ti.UI.createLabel({
		text: numberString,
		height: "10%",
		width:  "40%",
		textAlign: 'right',
		top: "49%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNum = numberString.replace(/\D/g, '' );
	Ti.API.info("Raw number: "+ auxNum);
	
	number.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNum);
	});
	resultView.add(number);

	if (mailResult != null){
		var email = Ti.UI.createLabel({
			text: results.fieldByName("email"),
			height: "10%",
			width:  "80%",
			textAlign: 'center',
			top: "92%",
			left: "10%"
		});
	
		Ti.API.info("Email : "+ results.fieldByName("email"));
		email.addEventListener('click', function(){
			Titanium.Platform.openURL('mailto:'+mailResult);
		});
		resultView.add(email);
	}
	results.close();
}
else if  (  ( (results.fieldByName("phone") != null) 	  && (results.fieldByName("cell_phone") != null) && (results.fieldByName("fax") == null) 		)  
         || ( (results.fieldByName("cell_phone") != null) && (results.fieldByName("fax") != null)   	 && (results.fieldByName("phone") == null)      )
         || ( (results.fieldByName("phone") != null) 	  && (results.fieldByName("fax") != null)        && (results.fieldByName("cell_phone") == null) ) ){

	Ti.API.info("TWO NUMBERS");
	Ti.API.info("Fax: "+results.fieldByName("fax"));
	var type_first;
	var dbType_first;
	
	var type_second;
	var dbType_second;
	
	if ( (results.fieldByName("phone") != null) && (results.fieldByName("cell_phone") != null) ){
		type_first = "Phone: ";
		dbType_first = "phone";

		type_second = "Cell Phone: ";
		dbType_second = "cell_phone";
	}
	else if ( (results.fieldByName("cell_phone") != null) && (results.fieldByName("fax") != null)   ){
		type_first = "Cell Phone: ";
		dbType_first = "cell_phone";

		type_second = "Fax: ";
		dbType_second = "fax";	
	}
	else{
		type_first = "Phone: ";
		dbType_first = "phone";

		type_second = "Fax: ";
		dbType_second = "fax";	
	}


	var typeLabel_first = Ti.UI.createLabel({
		text: type_first,
		height: "10%",
		width:  "30%",
		textAlign: 'left',
		top: "35%",
		touchEnabled: false,
		left: "10%"
	});
	resultView.add(typeLabel_first);
	
	var numberString_first  = results.fieldByName(dbType_first);
	
	//Print number in the format (XXX) XXX-XXXX 
	var number_first = Ti.UI.createLabel({
		text: numberString_first,
		height: "10%",
		width:  "40%",
		textAlign: 'right',
		top: "35%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNum_first = numberString_first.replace(/\D/g, '' );
	Ti.API.info("Raw number: "+ auxNum_first);
	
	number_first.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNum_first);
	});
	resultView.add(number_first);
	
	//Second number:
	var typeLabel_second = Ti.UI.createLabel({
		text: type_second,
		height: "10%",
		width:  "30%",
		textAlign: 'left',
		top: "65%",
		touchEnabled: false,
		left: "10%"
	});
	resultView.add(typeLabel_second);
	
	var numberString_second  = results.fieldByName(dbType_second);
	
	//Print number in the format (XXX) XXX-XXXX 
	var number_second = Ti.UI.createLabel({
		text: numberString_second,
		height: "10%",
		width:  "40%",
		textAlign: 'right',
		top: "65%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNum_second = numberString_second.replace(/\D/g, '' );
	Ti.API.info("Raw number: "+ auxNum_second);
	
	number_second.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNum_second);
	});
	resultView.add(number_second);
	

	if (mailResult != null){
		var email = Ti.UI.createLabel({
			text: results.fieldByName("email"),
			height: "10%",
			width:  "80%",
			textAlign: 'center',
			top: "92%",
			left: "10%"
		});
	
		Ti.API.info("Email : "+ results.fieldByName("email"));
		email.addEventListener('click', function(){
			Titanium.Platform.openURL('mailto:'+mailResult);
		});
		resultView.add(email);
	}
	results.close();
}
else if ( (results.fieldByName("phone") == null) && (results.fieldByName("cell_phone") == null) && (results.fieldByName("fax") == null) ) {
	var typeLabel_first = Ti.UI.createLabel({
		text: "No numbers for this lead",
		height: "10%",
		width:  "100%",
		textAlign: 'center',
		top: "49%",
		touchEnabled: false,
		left: 0
	});
	resultView.add(typeLabel_first);
}

else {
	Ti.API.info("THREE NUMBERS");
	
	var typeLabel_first = Ti.UI.createLabel({
		text: "Phone: ",
		height: "10%",
		width:  "30%",
		textAlign: 'left',
		top: "25%",
		touchEnabled: false,
		left: "10%"
	});
	resultView.add(typeLabel_first);
	
	var numberString_first  = results.fieldByName("phone");
	
	//Print number in the format (XXX) XXX-XXXX 
	var number_first = Ti.UI.createLabel({
		text: numberString_first,
		height: "10%",
		width:  "40%",
		textAlign: 'right',
		top: "25%",
		left: "50%"
	});

	Ti.API.info("Number from DB: "+ numberString_first);
	//When number is clicked, make the call
	var auxNum_first = numberString_first.replace(/\D/g, '' );
	Ti.API.info("Raw number: "+ auxNum_first);
	
	number_first.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNum_first);
	});
	resultView.add(number_first);
	
	//Second number:
	var typeLabel_second = Ti.UI.createLabel({
		text: "Cell Phone: ",
		height: "10%",
		width:  "30%",
		textAlign: 'left',
		top: "50%",
		touchEnabled: false,
		left: "10%"
	});
	resultView.add(typeLabel_second);
	
	var numberString_second  = results.fieldByName("cell_phone");
	
	//Print number in the format (XXX) XXX-XXXX 
	var number_second = Ti.UI.createLabel({
		text: numberString_second,
		height: "10%",
		width:  "40%",
		textAlign: 'right',
		top: "50%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNum_second = numberString_second.replace(/\D/g, '' );
	Ti.API.info("Raw number: "+ auxNum_second);
	
	number_second.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNum_second);
	});
	resultView.add(number_second);
	
	//Third number:
	var typeLabel_third = Ti.UI.createLabel({
		text: "Fax: ",
		height: "10%",
		width:  "30%",
		textAlign: 'left',
		top: "75%",
		touchEnabled: false,
		left: "10%"
	});
	resultView.add(typeLabel_third);
	
	var numberString_third  = results.fieldByName("fax");
	
	//Print number in the format (XXX) XXX-XXXX 
	var number_third = Ti.UI.createLabel({
		text: numberString_third,
		height: "10%",
		width:  "40%",
		textAlign: 'right',
		top: "75%",
		left: "50%"
	});

	//When number is clicked, make the call
	var auxNum_third = numberString_third.replace(/\D/g, '' );
	Ti.API.info("Raw number: "+ auxNum_third);
	
	number_third.addEventListener('click', function(){
		Titanium.Platform.openURL('tel:'+auxNum_third);
	});
	resultView.add(number_third);
	
	if (mailResult != null){
		var email = Ti.UI.createLabel({
			text: results.fieldByName("email"),
			height: "10%",
			width:  "80%",
			textAlign: 'center',
			top: "92%",
			left: "10%"
		});
	
		Ti.API.info("Email : "+ results.fieldByName("email"));
		email.addEventListener('click', function(){
			Titanium.Platform.openURL('mailto:'+mailResult);
		});
		resultView.add(email);
	}
	results.close();

}

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);
