/**
 * Name: mainMenu.js
 * Function: 
 * 		Show buttons where the user can select where he
 *		wants to go.
 * Provides:
 * 		First window the user sees when he logs in.
 *		Alert messages when user clicks on "back" on the phone.
 *		Menu with different buttons.
 *		Log out button.
 *		No internet connection checking (No necessary)
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win2 = Ti.UI.currentWindow;

//Parses result from user's loggin 
var xml = Ti.XML.parseString(win2.result);

//Retrieves username
var name = xml.documentElement.getElementsByTagName("name");

//Debug content of name
Ti.API.info('Name '+name.item(0).text);


// showToolbar(name, actualWindow)					
showToolbar( name.item(0).text, win2 );

//Button Contacts
var bContacts = Titanium.UI.createButton({
   title: 'Contacts',
   width: '80%',
   height: '9%',
   top: '41%' 
});

//Button Leads
var bLeads = Titanium.UI.createButton({
   title: 'Leads',
   width: '80%',
   height: '9%',
   top: '60%' 
});

//Show black screen when Leads's button is clicked
// When the black screen receives one click, it closes
bLeads.addEventListener('click',function(e){
	
	var winSoon = Titanium.UI.createWindow({
	 	modal: true,
	 	backgroundColor: '#000',
		opacity: 0.9
	});
	
	var labelSoon = Titanium.UI.createLabel({
		text:'Coming soon, click on this screen to go back',
		top: '50%',
		width: 'auto',
		height: 'auto'
	})
	
	winSoon.add(labelSoon);


	winSoon.addEventListener('click', function(){
		winSoon.close();
	});
	
	winSoon.open();

});

//Go to contact.js when contact's button is clicked
bContacts.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'contacts.js',
	});

	//Passes parameter to the contact's window:
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	win3.name   	 = name;
	win3.result      = win2.result;
	
	//Manages memory leaking
	win3.open();
	win2.close();

});

//Adds both buttons to the current window
win2.add(bContacts);
win2.add(bLeads);

//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

//When back button on the phone is pressed, it alerts the user (pop up box)
// that he needs to log out in order to go back to the root window
win2.addEventListener('android:back', function() {
	Ti.API.info("Use log off button");
	alert("In order to log off, please click on the X next to your username at the top ");
});