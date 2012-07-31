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

// this sets the background color of every 
Titanium.UI.setBackgroundColor('#EEEEEE');

//Common used functions
Ti.include('lib/functions.js'); 
if(PLATFORM!='android'){clearCache();}

var win1 = Titanium.UI.createWindow({  
    title:'Omadi CRM',
    fullscreen: false,
    zIndex: -100,
	backgroundColor: '#EEEEEE'
});

var OMADI_VERSION = "omadiDb1567";

Titanium.App.Properties.setString("databaseVersion", OMADI_VERSION);
var db = Ti.Database.install('/database/db_list.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_list" );
var credentials = db.execute('SELECT domain, username, password FROM history WHERE "id_hist"=1');

var locked_field = true;
var db_a = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
var updatedTime = db_a.execute('SELECT timestamp FROM updated WHERE rowid=1');
if (updatedTime.fieldByName('timestamp') != 0){
	locked_field = false;
}
else{
	Ti.App.Properties.setString("timestamp_offset", 0); 
}

updatedTime.close();
db_a.close();

var i_scroll_page = Titanium.UI.createScrollView({
    contentWidth:'auto',
    contentHeight:'auto',
    showVerticalScrollIndicator:true,
    showHorizontalScrollIndicator:false,
    scrollType: 'vertical',
	width: '100%',
	top: 0,
	left: 0,
	height: 'auto',
	layout: 'vertical',
	zIndex: 0
});
win1.add(i_scroll_page);

//Web site picker 
var logo = Titanium.UI.createImageView({
	width:'auto',
	top: '10dp',
	height: '114dp',
	image: '/images/logo.png'
});
//Adds picker to root window
i_scroll_page.add(logo);

//Web site picker 
var portal = Titanium.UI.createTextField({
	width:parseInt((Ti.Platform.displayCaps.platformWidth*65)/100),
	top: '20dp',
	height: '53dp',
	hintText:'Client Account',
	color:'#000000',
	value: credentials.fieldByName('domain'),
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Ti.UI.RETURNKEY_NEXT,
	softKeyboardOnFocus : (PLATFORM == 'android')?Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS:'',
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
	autocorrect: false,
	editable: locked_field
});
//Adds picker to root window
i_scroll_page.add(portal);

portal.addEventListener('return', function(){
	tf1.focus();
});

//Text field for username
var tf1 = Titanium.UI.createTextField({
	hintText:'Username',
	width:parseInt((Ti.Platform.displayCaps.platformWidth*65)/100),
	top: '10dp',
	height: '53dp',
	color:'#000000',
	value: credentials.fieldByName('username'),
	keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Ti.UI.RETURNKEY_NEXT,
	softKeyboardOnFocus : (PLATFORM == 'android')?Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS:'',
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
	autocorrect: false
});

//No autocorrection for username
tf1.autocorrect = false;

//Adds text field "username" to the interface
i_scroll_page.add(tf1);


//Text field for password
var tf2 = Titanium.UI.createTextField({
	hintText:'Password',
	color:'#000000',
	width:parseInt((Ti.Platform.displayCaps.platformWidth*65)/100),
	height: '53dp',
	top: '10dp',	
    passwordMask:true,
	value: credentials.fieldByName('password'),
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
	returnKeyType: Ti.UI.RETURNKEY_SEND,
	softKeyboardOnFocus : (PLATFORM == 'android')?Ti.UI.Android.SOFT_KEYBOARD_DEFAULT_ON_FOCUS:'',
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
	autocorrect: false
});

credentials.close();
//No autocorrection for password
tf2.autocorrect = false;

//Adds text field "password" to the interface
i_scroll_page.add(tf2);

tf1.addEventListener('return', function(){
	tf2.focus();
});

tf2.addEventListener('return', function(){
	b1.fireEvent('click');
});


win1.addEventListener('focus', function(){
	var db_a = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
	var updatedTime = db_a.execute('SELECT timestamp FROM updated WHERE rowid=1');
	var new_color = "#000000";
	if (updatedTime.fieldByName('timestamp') != 0){
		locked_field = false;
		new_color = "#999999";
	}
	updatedTime.close();
	db_a.close();

	portal.editable = locked_field;
	tf1.editable	= locked_field;
	
	portal.color = new_color;
	tf1.color	 = new_color;
	tf2.value	 = "";
});

//
//  CREATE INFO MESSAGE
//
var messageView = Titanium.UI.createView({
	bottom: '0px',	
	backgroundGradient: {
        type: 'linear',
        colors: [
            {color: '#FFF', position: 0.0},
			{color: '#AAA', position: 1.0}
        ],
        startPoint: {x: 0, y: 0},
        endPoint: {x: 0, y: 100},
        backFillStart: false
	},
	height: '10%',
	width: '100%',
	borderRadius:0
});

//Debug logStatus's value:
Ti.API.info('The value for logStatus we found in app.js is : '+Ti.App.Properties.getString('logStatus'));


//Decides wether logStatus is set or not
// If it is set, print: Inform your credentials
// Otherwise, print the content of logStatus
if ( ( Ti.App.Properties.getString('logStatus') == null) || (Ti.App.Properties.getString('logStatus') == "") ){
	var label_error = Titanium.UI.createLabel({
		color:'#4B5C8C',
		text:'Please login',
		font : {
			fontWeight: 'bold'
		},
		height:'auto',
		width:'auto',
		textAlign:'center'
	});
}
else{    
	var label_error = Titanium.UI.createLabel({
		color:'#4B5C8C',
		font : {
			fontWeight: 'bold'
		},	
		text: Ti.App.Properties.getString('logStatus'),
		height:'auto',
		width:'auto',
		textAlign:'center'
	});
}
label_error.backgroundColor = "transparent";
// Adds label_error to the messageView
messageView.add(label_error);

//Adds messageView to root window
win1.add(messageView);

//Adds error to interface
//win1.add(label_error);

//Login button definition:
var b1 = Titanium.UI.createButton({
   title: 'Log In',
   width: '80%',
   height: '55',
   top: '13dp' 
});

//Adds button to the interface
i_scroll_page.add(b1);

var block_i = Ti.UI.createView({
	top: '20dp',
	height: '50dp'
});
i_scroll_page.add(block_i);

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
	var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
	
	//Onblur the text fields, remove keyboard from screen
	portal.blur();
	tf2.blur();
	tf1.blur();
	
	//Empty text fields 
	if ( tf1.value == "" || tf2.value == "" || portal.value == ""){
		alert ("Please, in order to login, fill out the boxes.");
	}
	//No internet connection
	else if ( !(Titanium.Network.online)) {
		alert("Please, be sure you have a valid internet connection!");
	}
	
	//Everything ok, so let's login:
	else{

		showIndicator('Logging you in...');
		//Create internet connection
		var xhr = Ti.Network.createHTTPClient();
		
		//10 seconds till die
		xhr.setTimeout(10000);
		
		xhr.open('POST', 'https://'+portal.value+'.omadi.com/js-sync/sync/login.json');
		Ti.API.info('URL : https://'+portal.value+'.omadi.com/js-sync/sync/login.json');
		
		//Header parameters
		xhr.setRequestHeader("Content-Type", "application/json");

		//Parameters to send ()
		var parms = {
          username: tf1.value,
          password: tf2.value,
          device_id: Titanium.Platform.getId(),
          app_version: Titanium.App.version,
          //device_data: '{ "model": "'+Titanium.Platform.model+'", "version": "'+Titanium.Platform.version+'", "architecture": "'+Titanium.Platform.architecture+'", "platform": "'+Titanium.Platform.name+'", "os_type": "'+Titanium.Platform.ostype+'" }' 
          device_data: { "model": Titanium.Platform.model, "version": Titanium.Platform.version, "architecture": Titanium.Platform.architecture, "platform": Titanium.Platform.name, "os_type": Titanium.Platform.ostype, "screen_density":Titanium.Platform.displayCaps.density, "primary_language": Titanium.Platform.locale, "processor_count": Titanium.Platform.processorCount }
        };
                
		//Send info
		xhr.send('{"username":"'+parms["username"]+'","password":"'+parms["password"] +'","device_id":"'+parms["device_id"] +'","app_version":"'+parms["app_version"] +'","device_data": '+JSON.stringify(parms["device_data"]) +' }');
		Ti.API.info('{"username":"'+parms["username"]+'","password":"'+parms["password"] +'","device_id":"'+parms["device_id"] +'","app_version":"'+parms["app_version"] +'","device_data":'+JSON.stringify(parms["device_data"]) +' }');
		Ti.API.info('"model": '+ Titanium.Platform.model +', "version": '+Titanium.Platform.version+', "architecture": '+Titanium.Platform.architecture+', "platform": '+Titanium.Platform.name+', "os_type": '+Titanium.Platform.ostype+', "screen_density": '+Titanium.Platform.displayCaps.density+', "primary_language": '+Titanium.Platform.locale+', "processor_count": '+Titanium.Platform.processorCount );
				
		// When infos are retrieved:
		xhr.onload = function(e) {
							
				var db_list = Ti.Database.install('/database/db_list.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_list" );	
	
				var portal_base = db_list.execute('SELECT domain FROM domains WHERE domain=\''+portal.value+'\'');
				
				if ( portal_base.rowCount > 0){
					//Exists
					Ti.API.info('database exists');
				}
				else{
					//Create another database
					Ti.API.info('database does not exist, creating a new one');
					db_list.execute('INSERT INTO domains (domain, db_name) VALUES ("'+portal.value+'", "db_'+portal.value+'_'+tf1.value+'" )');
				}
				Ti.API.info('DB NAME_APP: db_'+portal.value+'_'+tf1.value+' ');
				
				db_list.execute('UPDATE history SET domain = "'+portal.value+'", username = "'+tf1.value+'", password = "", db_name="db_'+portal.value+'_'+tf1.value+'" WHERE "id_hist"=1');
				db_list.close();
				
				//Debug
				Ti.API.info("You have just connected");
				
				// Receives the selected row's value
				var picked = 'https://'+portal.value+'.omadi.com';

				//Creation of the main menu window
				var win2 = Titanium.UI.createWindow({  
					fullscreen: false,
					title:'Omadi CRM',
					url:'main_windows/mainMenu.js',
					zIndex: 100
				});
				
				//Passes parameter to the second window:
				win2.picked 	 = picked;
				win2.result 	 = this.responseText;
				win2.log		 = xhr;
				Ti.API.info(this.responseText);
				
				db.close();

				win1.touchEnabled = false;
				win2.open();
				
				hideIndicator();	
				//xhr.abort();
				//(PLATFORM == 'android')?win1.close():'';
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
	Ti.API.info("Shouldn't go back");
	label_error.text = "You can't go back, this is the first menu";
});

//Remove logStatus, so if the user opens the app again after some time
// he is gonna see the standart "Inform your credentials" message
// instead of something else that stands inside logStatus
Ti.App.Properties.removeProperty('logStatus');

//Close database
db.close();

if(PLATFORM == 'android') {
	portal.backgroundImage = tf1.backgroundImage = tf2.backgroundImage = 'images/textfield.png';
	b1.backgroundImage = '',
	b1.backgroundColor = 'white',
	b1.backgroundSelectedColor = '#2E64FE',
	b1.borderColor = 'gray',
	b1.borderRadius = 10,
	b1.color = 'black',
	b1.height = '50',
	b1.borderWidth = 1
}

//Make everthing happen:
win1.open();
if ( (PLATFORM != 'android') && (Ti.Platform.displayCaps.platformHeight > 500)){
	i_scroll_page.top = '200dp'
}

Ti.App.addEventListener('free_login', function(){
	win1.touchEnabled = true;	
});
