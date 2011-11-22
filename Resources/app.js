/**
 * Name: app.js
 * Function: 
 * 		Log into the system.
 * Provides:
 * 		internet connection checking.
 *		no submitions with empty fields.
 * 		the first window the user sees when the app starts.
 *		the window the user sees when he logs out.
 * @author Joseandro
 */

// this sets the background color of every window
Titanium.UI.setBackgroundColor('#000000');

//Common used functions
Ti.include('lib/functions.js');

//
// create base UI root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Welcome!',
    fullscreen: true
});

Titanium.App.Properties.setString("databaseVersion", "omadiDb533");

var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

//Label Website:
var label_website = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text:'Website: ',
	top: '9.4%',
	textAlign:'center',
	width:'auto'
});

//Adds label "website" to the interface
win1.add(label_website);

//Web site picker 
var picker = Titanium.UI.createPicker({
	width:'65%',
	top: '14%',
	height: '9%'
});

//Array of addresses 
var portals = [];
portals[0]=Titanium.UI.createPickerRow({title:'Omadi.com', value:'http://omadi.com'});
portals[1]=Titanium.UI.createPickerRow({title:'Lasvegasparkingsystems.com', value:'https://lasvegasparkingsystems.com'});

//Adds array of addresses to the picker
picker.add(portals);

//Adds picker to root window
win1.add(picker);

//Text field for username
var tf1 = Titanium.UI.createTextField({
	hintText:'Username',
	width:'65%',
	top: '31.3%',
	height: '9%',
	color:'#000000',
	value: 'test user',
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
	softKeyboardOnFocus : Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

//No autocorrection for username
tf1.autocorrect = false;

//Adds text field "username" to the interface
win1.add(tf1);

//Text field for password
var tf2 = Titanium.UI.createTextField({
	hintText:'Password',
	color:'#000000',
	width:'65%',
	height: '9%',
	top: '48.1%',	
    passwordMask:true,
	value: 'testing',
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType:Titanium.UI.RETURNKEY_DONE,
	softKeyboardOnFocus : Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});

//No autocorrection for password
tf2.autocorrect = false;

//Adds text field "password" to the interface
win1.add(tf2);

//
//  CREATE INFO MESSAGE
//
var messageView = Titanium.UI.createView({
	bottom: '0px',	
	backgroundColor:'#111',
	height: '7%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0
});

//Debug logStatus's value:
Ti.API.info('The value for logStatus we found in app.js is : '+Ti.App.Properties.getString('logStatus'));


//Decides wether logStatus is set or not
// If it is set, print: Inform your credentials
// Otherwise, print the content of logStatus
if ( ( Ti.App.Properties.getString('logStatus') == null) || (Ti.App.Properties.getString('logStatus') == "") ){
	var label_error = Titanium.UI.createLabel({
		color:'#FFFFFF',
		text:'Inform your credentials',
		height:'auto',
		width:'auto',
		textAlign:'center'
	});
}
else{
	var label_error = Titanium.UI.createLabel({
		color:'#FFFFFF',
		text: Ti.App.Properties.getString('logStatus'),
		height:'auto',
		width:'auto',
		textAlign:'center'
	});
}
// Adds label_error to the messageView
messageView.add(label_error);

//Adds messageView to root window
win1.add(messageView);

//Adds error to interface
win1.add(label_error);

//Login button definition:
var b1 = Titanium.UI.createButton({
   title: 'Log In',
   width: '80%',
   height: '9%',
   top: '66%' 
});

//Adds button to the interface
win1.add(b1);

/* Function: Trigger for login button
 * Name: b1.addEventListener('click', function(){ ... });
 * Parameters: none
 * Variables:
 * 	tf1:   Username text field
 * 	tf2:   Password text field
 * 	xhr:   Connection to retrieve session ID
 * 	log:   Connection to log into the system
 *  win2:  New window (Displays content when logged)
 * Purpouse: Provides Log in to the system using 
 * 			 tf1.value and tf2.value as the user's credentials. 
 */
b1.addEventListener('click', function(){
	//Onblur the text fields, remove keyboard from screen
	tf2.blur();
	tf1.blur();
	
	//Empty text fields
	if ( tf1.value == "" || tf2.value == "" ){
		alert ("Please, in order to login, fill out the boxes.");
	}
	//No internet connection
	else if ( !(Titanium.Network.online)) {
		alert("Please, be sure you have a valid internet connection!");
	}
	
	//Everything ok, so let's login:
	else{
		
		//Check database:
		var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
		if (updatedTime.fieldByName('timestamp') != 0){
			var url = db.execute('SELECT url FROM updated WHERE rowid=1');
			if ( url.fieldByName('url') !=  picker.getSelectedRow(0).value){
				showIndicatorDelete("Hold on, we are deleting the old database and creating a fresh one for you");
				db.execute('DELETE FROM account');
				db.execute('DELETE FROM contact');
				db.execute('DELETE FROM lead');			
				db.execute('DELETE FROM node');
				db.execute('DELETE FROM potential');
				db.execute('DELETE FROM task');
				db.execute('DELETE FROM term_data');
				db.execute('DELETE FROM updated');
				db.execute('DELETE FROM users');
				db.execute('DELETE FROM vocabulary');
				db.execute('INSERT INTO updated (timestamp, url) VALUES (?,?)', 0 , null);		
				hideIndicator();
			}
			url.close();	
		}
		updatedTime.close();

		showIndicator('full');
		//Create internet connection
		var xhr = Ti.Network.createHTTPClient();
		
		//Define connection
		xhr.open('POST', picker.getSelectedRow(0).value+'/js-login/system/connect.json');

		//Parameters to send ()
		var parms = {
          username: tf1.value,
          password: tf2.value
        };
        
		xhr.setTimeout(10000);
		// When infos are retrieved:
		xhr.onload = function(e) {
			//XML document object
			var doc = JSON.parse(this.responseText); 	

   			//Retrieving Session ID
			var value = doc.sessid;
	        
	        //Debugg code 
	        Ti.API.info('Session ID: '+value);
	        
			//Create a new connection to log in
			var log = Ti.Network.createHTTPClient();
			//Timeout until error:
			log.setTimeout(10000);
			
			log.open('POST', picker.getSelectedRow(0).value+'/js-login/user/login.json');
			
			//Header parameters
			log.setRequestHeader("Content-Type", "application/json");
			
			//Information to send
			var log_parms = {
					sessid: value,
					username: tf1.value,
					password: tf2.value
    		}
    		//Ti.API.info("Parametros: Sessid = "+log_parms["sessid"]+" Username = "+log_parms["username"]+" Pass = "+log_parms["password"]);

			//When sucefully connected
			log.onload = function(e) {
				//Debug
				Ti.API.info("You have just connected");
				
				// Receives the selected row's value
				var picked = picker.getSelectedRow(0).value;

				//Creation of the main menu window
				var win2 = Titanium.UI.createWindow({  
					fullscreen: true,
					url:'main_windows/mainMenu.js',
				});
				
				//Passes parameter to the second window:
				win2.log	     = log;
				win2.picked 	 = picked;
				win2.result 	 = this.responseText;

				//Manages windows and connections closing or openning them. It avoids memory leaking
				win2.open();
				hideIndicator();	
				xhr.abort();
				db.close();
				win1.close();
			}
			
			//If username and pass wrong:
			log.onerror = function(e) {
					hideIndicator();
					Ti.API.info("Check your username or password and try again ");
					label_error.text = "Check your username or password and try again ";
    		}
			//Sending information and try to log in
			//log.send(log_parms);
			log.send('{"sessid":"'+log_parms["sessid"]+'","username":"'+log_parms["username"]+'","password":"'+log_parms["password"] +'"}');
			Ti.API.info('{"sessid":"'+log_parms["sessid"]+'","username":"'+log_parms["username"]+'","password":"'+log_parms["password"] +'"}');				
		}
		//Connection refused, services are down
		xhr.onerror = function(e) {
			hideIndicator();
			Ti.API.info("Services are not available at the moment, wait until we fix the problem");
			label_error.text = "Services are not available at the moment, wait until we fix the problem";
		}
		//Sending information and try to retrieve session ID
		xhr.send('{"username":"'+parms["username"]+'","password":"'+parms["password"] +'"}');
		
	} 
});
// Always show the window in portrait orientation
win1.orientationModes = [ Titanium.UI.PORTRAIT ];

//When back button on the phone is pressed, it informs the user (message at the bottom)
// that he is already in the first menu
win1.addEventListener('android:back', function() {
	Ti.API.info("É pra sair!");
	label_error.text = "You can't go back, this is the first menu";
});

//Remove logStatus, so if the user opens the app again after some time
// he is gonna see the standart "Inform your credentials" message
// instead of something else that stands inside logStatus
Ti.App.Properties.removeProperty('logStatus');


//Make everthing happen:
win1.open();