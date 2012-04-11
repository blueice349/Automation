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

var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';


var version = 'Omadi Inc';
var isFirstTime = false;
var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: 'Omadi Inc',
	height:'auto',
	width:'auto',
	textAlign:'center'
});

var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

//Common used functions
Ti.include('../lib/functions.js');

unsetUse();
//Geolocation module
Ti.include('geolocation.js');

function checkUpdate(evt){
	Ti.API.info('******* Called checkupate => '+evt);
	
	if ( (isUpdating() === false) && (Titanium.Network.online) ){
		//Sets status to 'updating'
		setUse();
		if (evt == 'from_menu'){
			//instance progress bar object:
			var pb = new Progress_install(0, 100);	
		}
		else{
			//No progress bar
			var pb = null;
		}
		
		var pageIndex = 0;

		var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

		var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');

		var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
		var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
		
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime.fieldByName('timestamp') +' , '+pb+' , '+listView+', '+null+' , POST  )');
			installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'POST');
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
				//installMe(pageIndex, win, timeIndex, progress_bar, menu_list)
				Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime.fieldByName('timestamp') +' , '+pb+' , '+listView+', '+null+' , GET  )');
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'GET');
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime.fieldByName('timestamp') +' , '+pb+' , '+listView+', '+img+' , GET  )');
				//installMe(pageIndex, win, timeIndex, progress, menu, img, type)
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, img, 'GET');
			}
		}
		updatedTime.close();
		db_up.close();
	}
	else{
		if (evt == 'from_menu'){
			if ( !(Titanium.Network.online)) {
				Ti.UI.createNotification({
					message : 'You have no internet access, make sure you are online in order to update'
				}).show();
				//If offline, set up database for use
				unsetUse();
			}
			else {
				Ti.UI.createNotification({
					message : 'Another updated is already running'
				}).show();
			}
		}
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
			display     : display,
			description : description,
			name_table  : name_table,
			className	: 'menu_row' // this is to optimize the rendering
		});
		
		var title = Titanium.UI.createLabel({
			text: display,
			font:{
				fontSize:28
			},
			width:'83%',
			textAlign:'left',
			left:'0%',
			height:'auto'
		});

		var plus =  Titanium.UI.createButton({
			title: '+',
			width:'15%',
			height:'100%',
			right:0,
			is_plus: true
		});
		
		row_t.add(title);
		row_t.add(plus);
		
		listView.appendRow(row_t);
	}
	elements.next();
}
elements.close();

win2.add(listView);

if (check == 0){
	var img = Ti.UI.createImageView({
		image: '/images/message.png',
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
	//Creates a new node_type
	if (e.source.is_plus){
		//alert('You clicked the '+e.row.display+' . His table\'s name is '+e.row.name_table);
		toolActInd.show();
		var win_new = Titanium.UI.createWindow({  
			title: "New "+e.row.display,
			fullscreen: false,
			url:'create_node.js',
			type: e.row.name_table,
			uid: jsonLogin.user.uid
		});
		win_new.open();
		win_new.addEventListener('focus', function(e){
			toolActInd.hide();
		});
	}
	else{
		var win_new = Titanium.UI.createWindow({  
			title: e.row.display,
			fullscreen: false,
			url:'objects.js',
			type: e.row.name_table,
			uid: jsonLogin.user.uid
		});
		win_new.open();
	}	
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
	width:'70%',
	left: '5%',
	horizontalAlign: 'left',
	height: 'auto'
}); 

var offImage = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text:'Log Out',
	width:'20%',
	horizontalAlign: 'left',
	right: '5%',
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
	if ( isUpdating() ){
		a.message = 'A data sync is in progress. Please wait a moment to log out.';
		a.show();
	}
	else{
		// window container
		indLog = Titanium.UI.createWindow({
		    url: 'logDecision.js',
			title:'Omadi CRM',		    
		    fullscreen: false
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
	checkUpdate('from_menu');
}
updatedTime.close();

//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

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
    menuItem.setIcon('/images/item1.png');
    
    menuItem.addEventListener("click", function(e) {
		Ti.API.info('Refresh event!');
		checkUpdate('from_menu');
    });
};

//Close database
db.close();

//Check behind the courtins if there is a new version - 5 minutes
//setInterval( checkUpdate('auto') , 10000);

setInterval( function(){
	Ti.API.info('========= Automated Update Check running ========= ');
	
	if ( (isUpdating() === false) && (Titanium.Network.online) ){
		//Sets status to 'updating'
		setUse();

		//No progress bar
		var pb = null;
		
		var pageIndex = 0;

		var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

		var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');

		var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
		var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
		
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'POST');
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
				//installMe(pageIndex, win, timeIndex, progress_bar, menu_list)
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'GET');
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				//installMe(pageIndex, win, timeIndex, progress, menu, img, type)
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, img, 'GET');
			}
		}
		updatedTime.close();
		db_up.close();
	}
	else{
		Ti.API.info('========= Database was opened, another update is running or you\'re offline ========= ');
	}
} , 300000);