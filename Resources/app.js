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

var win1 = Titanium.UI.createWindow({  
    title:'Omadi CRM',
    fullscreen: true
});

Titanium.App.Properties.setString("databaseVersion", "omadiDb1111");

var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

//Label Website:
var label_website = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text:'Website: ',
	top: '4.4%',
	textAlign:'center',
	width:'auto'
});

//Adds label "website" to the interface
win1.add(label_website);

//Web site picker 
var picker = Titanium.UI.createPicker({
	width:'65%',
	top: '10%',
	height: '13%'
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
	top: '29.5%',
	height: '13%',
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
	height: '13%',
	top: '50.1%',	
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
	height: '10%',
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
   height: '15%',
   top: '70%' 
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
	
	var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

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
		
		//10 seconds till die
		xhr.setTimeout(10000);
		
		xhr.open('POST', picker.getSelectedRow(0).value+'/js-sync/sync/login.json');
		Ti.API.info("URL : "+picker.getSelectedRow(0).value+'/js-sync/sync/login.json');
		
		//Header parameters
		xhr.setRequestHeader("Content-Type", "application/json");

		//Parameters to send ()
		var parms = {
          username: tf1.value,
          password: tf2.value,
          device_id: Titanium.Platform.macaddress,
          app_version: Titanium.App.version,
          //device_data: '{ "model": "'+Titanium.Platform.model+'", "version": "'+Titanium.Platform.version+'", "architecture": "'+Titanium.Platform.architecture+'", "platform": "'+Titanium.Platform.name+'", "os_type": "'+Titanium.Platform.ostype+'" }' 
          device_data: { "model": Titanium.Platform.model, "version": Titanium.Platform.version, "architecture": Titanium.Platform.architecture, "platform": Titanium.Platform.name, "os_type": Titanium.Platform.ostype, "screen_density":Titanium.Platform.DisplayCaps.density, "primary_language": Titanium.Platform.locale, "processor_count": Titanium.Platform.processorCount }
        };
        
		//Send info
		xhr.send('{"username":"'+parms["username"]+'","password":"'+parms["password"] +'","device_id":"'+parms["device_id"] +'","app_version":"'+parms["app_version"] +'","device_data":"'+parms["device_data"] +'" }');
		Ti.API.info('{"username":"'+parms["username"]+'","password":"'+parms["password"] +'","device_id":"'+parms["device_id"] +'","app_version":"'+parms["app_version"] +'","device_data":"'+parms["device_data"] +'" }');
		Ti.API.info('"model": '+Titanium.Platform.model+', "version": '+Titanium.Platform.version+', "architecture": '+Titanium.Platform.architecture+', "platform": '+Titanium.Platform.name+', "os_type": '+Titanium.Platform.ostype+', "screen_density": '+Titanium.Platform.DisplayCaps.density+', "primary_language": '+Titanium.Platform.locale+', "processor_count": '+Titanium.Platform.processorCount );
		// When infos are retrieved:
		xhr.onload = function(e) {
				//Debug
				Ti.API.info("You have just connected");
				
				// Receives the selected row's value
				var picked = picker.getSelectedRow(0).value;

				//Creation of the main menu window
				var win2 = Titanium.UI.createWindow({  
					fullscreen: true,
					title:'Omadi CRM',
					url:'main_windows/mainMenu.js',
				});
				
				//Passes parameter to the second window:
				win2.log 		 = xhr;
				win2.picked 	 = picked;
				win2.result 	 = this.responseText;
				Ti.API.info(this.responseText);
				
				db.close();
				//Manages windows and connections closing or openning them. It avoids memory leaking
				win2.open();
				hideIndicator();	
				//xhr.abort();
				win1.close();
		}
			
		//If username and pass wrong:
		xhr.onerror = function(e) {
			Ti.API.info("status is: "+this.status);
			db.close();
			hideIndicator();
			if (this.status == 406){
				label_error.text = "The user '"+tf1.value+"' is already logged in another device";
			}
			else if (this.status == 401){
				label_error.text = "Check your username or password and try again ";
			}
			else{
				label_error.text = "An error has occurred, please try again";
			}
   		}
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

//Close database
db.close();

//Make everthing happen:
win1.open();
