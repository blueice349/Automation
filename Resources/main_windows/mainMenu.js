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
 * @author Joseandro
 */

//Current window's instance
var win2 = Ti.UI.currentWindow;

//Common used functions
Ti.include('../lib/functions.js');

var version = 'Omadi Inc';

var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: 'Omadi Inc',
	height:'auto',
	width:'auto',
	textAlign:'center'
});

Titanium.App.Properties.setString("databaseVersion", "omadiDb456");
Titanium.App.Properties.setBool("UpRunning", false);

var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

function checkUpdate (){
	if ( !Titanium.App.Properties.getBool("UpRunning") ){
		Titanium.App.Properties.setBool("UpRunning", true);
		var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
		
		var objectsCheck = win2.log;
		//Timeout until error:
		objectsCheck.setTimeout(10000);
	
		Ti.API.info("Timestamp: "+ updatedTime.fieldByName('timestamp'));
		//Opens address to retrieve contact list
		objectsCheck.open('GET', win2.picked + '/js-sync/sync.json?timestamp=' + updatedTime.fieldByName('timestamp') +'&reset=1');
		updatedTime.close();
	
		//Header parameters
		objectsCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version 
			if ( json.current_page_item_count == 0 ){
				label_status.text = version;
				Ti.API.info("SUCCESS -> No items");
				Titanium.App.Properties.setBool("UpRunning", false);
			}
			else
			{
				label_status.text = "Synchronizing database, don't close the App !";
				Ti.API.info("Fired database install");
				updateMe();				
			}
		}
		//Connection error:
		objectsCheck.onerror = function(e) {
			Ti.API.info("Error checking if update is needed, not running");
			Titanium.App.Properties.setBool("UpRunning", false);
		}
	
		//Sending information and try to connect
		objectsCheck.send();	
	}
};

var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
if (updatedTime.fieldByName('timestamp') == 0){
	checkUpdate();
}
updatedTime.close();


//Button Contacts
var bContacts = Titanium.UI.createButton({
   title: 'Contacts',
   width: '80%',
   height: '9%',
   top: '13%' 
});

//Button Leads
var bLeads = Titanium.UI.createButton({
   title: 'Leads',
   width: '80%',
   height: '9%',
   top: '30%' 
});

//Button Accounts
var bAccounts = Titanium.UI.createButton({
   title: 'Accounts',
   width: '80%',
   height: '9%',
   top: '48%' 
});

//Button Accounts
var bPotentials = Titanium.UI.createButton({
   title: 'Potentials',
   width: '80%',
   height: '9%',
   top: '66%' 
});

//Button Settings
var bSettings = Titanium.UI.createButton({
   title: 'Settings',
   width: '80%',
   height: '9%',
   top: '82%' 
});

//Parses result from user's login 
var jsonLogin = JSON.parse(win2.result) ;

//Retrieves username
var name = jsonLogin.user.name;

// showToolbar(name, actualWindow)					
showToolbar( name, win2 );

//Go to contact.js when contact's button is clicked
bContacts.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'contacts.js'
	});

	//Passes parameter to the contact's window:
	win3.name   	 = name;
	win3.result      = win2.result;
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	
	//Manages memory leaking
	win3.open();
});

//Show black screen when Leads's button is clicked
// When the black screen receives one click, it closes
bLeads.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'leads.js',
	});

	//Passes parameter to the contact's window:
	win3.name   	 = name;
	win3.result      = win2.result;
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;

	//Manages memory leaking
	win3.open();
});
//bLeads.enabled = false;

//Go to contact.js when contact's button is clicked
bAccounts.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'accounts.js',
	});

	//Passes parameter to the contact's window:
	win3.name   	 = name;
	win3.result      = win2.result;
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;

	win3.open();
});

bPotentials.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'potentials.js',
	});

	//Passes parameter to the contact's window:
	win3.name   	 = name;
	win3.result      = win2.result;
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;

	//Manages memory leaking
	win3.open();
});

bSettings.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'settings.js',
	});

	//Passes parameter to the contact's window:
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	win3.name   	 = name;
	win3.result      = win2.result;

	//Manages memory leaking
	win3.open();
});

//Action taken when syncronization button is pressed
function updateMe(){
	var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
	
	Ti.API.info("Timestamp: "+ updatedTime.fieldByName('timestamp'));	
	
	var timeIndex = updatedTime.fieldByName('timestamp');
	updatedTime.close();

	var pageIndex = 0;

	//installMe(pageIndex, win, timeIndex, calledFrom)
	installMe(pageIndex, win2, timeIndex, "mainMenu");
};

//View at the bottom to show user the database's status
var databaseStatusView = Titanium.UI.createView({
	bottom: '0px',	
	backgroundColor:'#111',
	height: '7%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0
});

databaseStatusView.add(label_status);

win2.add(databaseStatusView);

//Adds both buttons to the current window
win2.add(bContacts);
win2.add(bLeads);
win2.add(bAccounts);
win2.add(bPotentials);
win2.add(bSettings);

//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

//Ti.App.Properties.removeProperty('update');
//When back button on the phone is pressed, it alerts the user (pop up box)
// that he needs to log out in order to go back to the root window
win2.addEventListener('android:back', function() {
	//Ti.API.info("Use log off button");
	alert("In order to log off, please click on the X next to your username at the top ");
});


//Check behind the courtins if there is a new version - 5 minutes
setInterval(checkUpdate, 300000);