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

//Common used functions
Ti.include('../lib/functions.js');
Ti.include('geolocation.js');

function checkUpdate (){
	if ( !Titanium.App.Properties.getBool("UpRunning") ){
		
		Titanium.App.Properties.setBool("UpRunning", true);
		
		var objectsCheck = win2.log;
		//Timeout until error:
		objectsCheck.setTimeout(10000);
	
		//Opens address to retrieve lists
		objectsCheck.open('GET', win2.picked + '/js-sync/sync.json?reset=1');
	
		//Header parameters
		objectsCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version 
			if ( json.current_page_item_count == 0 ){
				Ti.API.info("SUCCESS -> No items");
				Titanium.App.Properties.setBool("UpRunning", false);
			}
			else
			{
				var pageIndex = 0;

				var db_up = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

				var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');

				//instance progress bar object:
				var pb = new Progress_install(0, 100);

				var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
				//Normal install
				if ( see.rowCount > 0 ){
					Ti.API.info("Fired normal database install");
					//installMe(pageIndex, win, timeIndex, progress_bar, menu_list)
					installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView);
				}
				//First install
				else{
					Ti.API.info("Fired first database install");
					//installMe(pageIndex, win, timeIndex, progress_bar, menu_list, img)
					installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, img);
				}
				updatedTime.close();
				db_up.close();
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


var listView = Titanium.UI.createTableView({
	data : [],
	top : '10%',
	height : '80%',
	scrollable: true,
	zIndex: 999
});

var elements = db.execute('SELECT * FROM bundles');
var check = 0;


while ( elements.isValidRow() ){
	var name_table   = elements.fieldByName("bundle_name");
	var display      = elements.fieldByName("display_name");
	var description  = elements.fieldByName("description");
	var flag_display = elements.fieldByName("display_on_menu");
	
	if (flag_display){
		check++;
		var row_t = Ti.UI.createTableViewRow({
			height      : 60,	
			hasChild    : true,
			title       : display,
			description : description,
			name_table  : name_table
		});
		
		listView.appendRow(row_t);
	}
	elements.next();
}
elements.close();

win2.add(listView);

if (check == 0){
	var img = Ti.UI.createImageView({
		image: '../images/message.png',
		width: 'auto',
		height: 'auto',
		top: '25%',
		zIndex: 0
	});
	
	win2.add(img);
}

//Go to contact.js when contact's button is clicked
listView.addEventListener('click',function(e){
	Ti.API.info("row click on table view. index = "+e.index+", row_desc = "+e.row.description+", section = "+e.section+", source_desc="+e.source.description);
	
	var win3 = Titanium.UI.createWindow({  
		title: e.row.display,
		fullscreen: true,
		url:'objects.js',
		type: e.row.name_table
	});
	win3.open();
	
});





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

var a = Titanium.UI.createAlertDialog({
	title:'Omadi',
	buttonNames: ['OK']
});

offImage.addEventListener('click',function(e)
{
	Ti.API.info('Is there an update happening? '+Titanium.App.Properties.getBool("UpRunning"));
	if (Titanium.App.Properties.getBool("UpRunning") === true){
		a.message = 'A data sync is in progress. Please wait a moment to log out.';
		a.show();
	}
	else{
		// window container
		indLog = Titanium.UI.createWindow({
		    url: 'logDecision.js',
			title:'Omadi CRM',		    
		    fullscreen: true
		});

		//Setting both windows with login values:
		indLog.log		 = win2.log;
		indLog.result	 = win2.result;
		indLog.picked 	 = win2.picked;
	    
	    indLog.open();
	   	win2.close();    	
	}

});

//View at the bottom to show user the database's status
var databaseStatusView = Titanium.UI.createView({
	backgroundColor:'#111',
	height: '10%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0,
	bottom: 0
});

databaseStatusView.add(label_status);
win2.add(databaseStatusView);

//First time install
var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
if (updatedTime.fieldByName('timestamp') == 0){
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
	a.message = 'In order to log off, please click on \'Log Out\' next to your username at the top ';
	a.show();
});

var activity = Ti.Android.currentActivity;

activity.onCreateOptionsMenu = function(e) {
    var menu = e.menu;
    var menuItem = menu.add({ title: "Update" });
    menuItem.setIcon('../images/item1.png');
    
    menuItem.addEventListener("click", function(e) {
		Ti.API.info('Refresh event!');
		checkUpdate();
    });
};


//Close database
db.close();

//Check behind the courtins if there is a new version - 5 minutes
setInterval(checkUpdate, 300000);