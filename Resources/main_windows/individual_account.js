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
	title:'Omadi CRM',
	url:'../app.js',
});

//Definition of the window before (opens when the user clicks on the back button)
var urlTo;

if (win4.returnTo == "accounts.js"){
	urlTo = 'accounts.js';	
}
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

if (results.fieldByName("account_type_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("account_type_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Account type: ",
		width:  "30%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var label1 = Ti.UI.createLabel({
		text: ""+fresh,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
	var aux1 = count;
	label1.addEventListener('click', function(){
		highlightMe( aux1);
	});

	content[count] = label1;	
	count++;
}


var parent = results.fieldByName("parent_account_nid");

if ( parent != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Parent account:",
		width:  "30%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
		
	label2 = Ti.UI.createLabel({
		text: ""+parent,
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

var website =  results.fieldByName("website");

if ( website != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Website: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});

	website = website.replace("http://","");
		
	var l4l = Ti.UI.createLabel({
		text: ""+website,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
	
	var aux3 = count;

	l4l.addEventListener('click', function(){
		highlightMe( aux3);
		website = website.replace("http://","");
		Titanium.Platform.openURL("http://"+website);
	});
	
	content[count] = l4l;
	count++;
}


var phone = results.fieldByName("phone");

if ( phone != null ){

	var l5 = Ti.UI.createLabel({
		text: "Phone: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l5l = Ti.UI.createLabel({
		text: ""+phone,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
	
	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	var aux4 = count;
	l5l.addEventListener('click', function(){
		highlightMe( aux4);
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
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l6l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	var aux5 = count;
	l6l.addEventListener('click', function(){
		highlightMe( aux5);
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