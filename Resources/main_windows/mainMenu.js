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
Ti.include('geolocation.js');

var version = 'Omadi Inc';

var isFirstTime = false;
var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: 'Omadi Inc',
	height:'auto',
	width:'auto',
	textAlign:'center'
});

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
		//Opens address to retrieve lists
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

var data = [];


var rowFirst = Ti.UI.createTableViewRow({
	height : 'auto',	
	hasChild : true,
	title : 'Leads'
});


//Populates the array
data[0] = rowFirst;

var rowSecond = Ti.UI.createTableViewRow({
	height : 'auto',
	hasChild : true,
	title : 'Contacts'
});

//Populates the array
data[1] = rowSecond;

var rowThird = Ti.UI.createTableViewRow({
	height : 'auto',
	hasChild : true,
	title : 'Accounts'
});

//Populates the array
data[2] = rowThird;

var rowFourth = Ti.UI.createTableViewRow({
	height : 'auto',
	hasChild : true,
	title : 'Potentials'
});

//Populates the array
data[3] = rowFourth;

var rowFiveth = Ti.UI.createTableViewRow({
	height : 'auto',
	hasChild : true,
	title : 'Settings'
});

//Populates the array
data[4] = rowFiveth;


var listView = Titanium.UI.createTableView({
	data : data,
	top : '10%',
	height : '84%',
	scrollable: true
});

win2.add(listView);


//Parses result from user's login 
var jsonLogin = JSON.parse(win2.result) ;

//Retrieves username
var name = jsonLogin.user.realname;

// showToolbar(name, win2)					
var loggedView = Titanium.UI.createView({
	top: '0px',	
	backgroundColor:'#111',
	height: '10%',
	width: '100%',
	opacity: 0.99,
	borderRadius:5
});

var label_top = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text:''+ name,
	textAlign: 'left',
	width:'75%',
	left: '5%',
	horizontalAlign: 'left',
	height: 'auto'
}); 


var offImage = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text:'Log Out',
	width:'20%',
	horizontalAlign: 'left',
	left: '80%',
	height: '30px'
}); 

loggedView.add(label_top);
loggedView.add(offImage);					
win2.add(loggedView);

offImage.addEventListener('click',function(e)
{
	if (Titanium.App.Properties.getBool("UpRunning")){
		alert ("We are updating your database, please hold on");
	}
	else{
		// window container
		indLog = Titanium.UI.createWindow({
		    url: 'logDecision.js',
			title:'Omadi CRM',		    
		    fullscreen: true
		});
	    db.close();	
		//Setting both windows with login values:
		indLog.log		 = win2.log;
		indLog.result	 = win2.result;
		indLog.picked 	 = win2.picked;
	    
	    indLog.open();
	   	win2.close();    	
	}

});

//Go to contact.js when contact's button is clicked
rowFirst.addEventListener('click',function(e){
	if (!isFirstTime){
		var win3 = Titanium.UI.createWindow({  
			title:'Leads',
			fullscreen: true,
			url:'leads.js'
		});
		win3.open();
	}
});

rowSecond.addEventListener('click',function(e){
	if (!isFirstTime){
		var win3 = Titanium.UI.createWindow({  
			title:'Contacts',
			fullscreen: true,
			url:'contacts.js',
		});
		win3.open();
	}
});

//Go to contact.js when contact's button is clicked
rowThird.addEventListener('click',function(e){

	if (!isFirstTime){
	
		var win3 = Titanium.UI.createWindow({  
			title:'Accounts',
			fullscreen: true,
			url:'accounts.js',
		});
		win3.open();
	}
});

rowFourth.addEventListener('click',function(e){

	if (!isFirstTime){
		var win3 = Titanium.UI.createWindow({  
			title:'Potentials',
			fullscreen: true,
			url:'potentials.js',
		});
		win3.open();
	}
});


rowFiveth.addEventListener('click',function(e){
	if (!isFirstTime){
		var win3 = Titanium.UI.createWindow({  
			title:'Omadi CRM',
			fullscreen: true,
			url:'settings.js'
		});
		
		win3.log		 = win2.log;
		win3.picked 	 = win2.picked;
		win3.open();
	}
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
	backgroundColor:'#111',
	height: '7%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0,
	bottom: 0
});

    		
databaseStatusView.add(label_status);
win2.add(databaseStatusView);

var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');

if (updatedTime.fieldByName('timestamp') == 0){
	Titanium.App.Properties.setInt("maxIndex", 100); 
	fireStatusFirstInstall();
	isFirstTime = true;
	checkUpdate();
}
updatedTime.close();

//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

//Ti.App.Properties.removeProperty('update');
//When back button on the phone is pressed, it alerts the user (pop up box)
// that he needs to log out in order to go back to the root window
win2.addEventListener('android:back', function() {
	alert("In order to log off, please click on 'Log Out' next to your username at the top ");
});


//Check behind the courtins if there is a new version - 5 minutes
setInterval(checkUpdate, 300000);