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

Ti.include('/main_windows/create_or_edit_node.js');

//Current window's instance
var win2 = Ti.UI.currentWindow;
win2.backgroundColor = '#111';

win2.addEventListener('focus', function(){
	unsetUse();
});

var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';


var version = 'Omadi Inc';
var isFirstTime = false;

//Common used functions
Ti.include('/lib/functions.js');
var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
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

		var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );

		var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');

		var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
		var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
		
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime.fieldByName('timestamp') +' , '+pb+' , '+listView+', '+null+' , POST  )');
			installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'POST', null);
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
				//installMe(pageIndex, win, timeIndex, progress_bar, menu_list)
				Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime.fieldByName('timestamp') +' , '+pb+' , '+listView+', '+null+' , GET  )');
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'GET', null);
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime.fieldByName('timestamp') +' , '+pb+' , '+listView+', '+img+' , GET  )');
				//installMe(pageIndex, win, timeIndex, progress, menu, img, type)
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, img, 'GET', null);
			}
		}
		updatedTime.close();
		db_up.close();
	}
	else{
		if (evt == 'from_menu'){
			if ( !(Titanium.Network.online)) {
				if(PLATFORM == 'android'){
					Ti.UI.createNotification({
						message : 'You have no internet access, make sure you are online in order to update'
					}).show();
				}else{
					alert('You have no internet access, make sure you are online in order to update');
				}
				//If offline, set up database for use
				unsetUse();
			}
			else {
				if(PLATFORM == 'android'){
					Ti.UI.createNotification({
						message : 'Another updated is already running'
					}).show();
				}else{
					alert('Another updated is already running');
				}
			}
		}
	}
};

function update_node(mode, close_parent){
	//Sets status to 'updating'

	var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );

	var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');
	var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
	
	Ti.API.info("Fired nodes update/creation ");
	
	//function installMe(pageIndex, win, timeIndex, progress, menu, img, type_request, mode, close_parent)
	installMe(0, win2, updatedTime.fieldByName('timestamp') , null, win2.listView, null, 'POST', mode, function (){
		Ti.API.info('Closing create or edit node');
		close_parent();
	});
	updatedTime.close();
	up_flag.close();
	db_up.close();
}

var listView = Titanium.UI.createTableView({
	data : [],
	top : '10%',
	//height : '80%',
	bottom: '10%',
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
	setUse();
	//Creates a new node_type
	if (e.source.is_plus){
		//alert('You clicked the '+e.row.display+' . His table\'s name is '+e.row.name_table);
		// toolActInd.show();
		var win_new = create_or_edit_node.getWindow();
		win_new.title = "New "+e.row.display;
		win_new.type = e.row.name_table;
		win_new.uid = jsonLogin.user.uid;
		win_new.listView = listView;
		win_new.up_node = update_node;
		win_new.mode = 0;
		win_new.picked = win2.picked;
		win_new.region_form = 0;
		win_new.backgroundColor = "#000";
		win_new.nameSelected = 'Fill Details...';
		win_new.open();
		setTimeout(function(){create_or_edit_node.loadUI();}, 100);
		// win_new.addEventListener('focus', function(e){
			// toolActInd.hide();
		// });
	}
	else{
		var win_new = Titanium.UI.createWindow({  
			title: e.row.display,
			fullscreen: false,
			url:'objects.js',
			type: e.row.name_table,
			uid: jsonLogin.user.uid,
			up_node: update_node,
			backgroundColor: '#000'
		});
		win_new.picked 	 = win2.picked;
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
		a.message = 'A data sync is in progress. Please wait a moment to logout.';
		a.show();
	}
	else{
		// window container
		indLog = Titanium.UI.createWindow({
		    url: 'logDecision.js',
			title:'Omadi CRM',		    
		    fullscreen: false,
		    backgroundColor: '#000'
		});

		//Setting both windows with login values:
		indLog.log		 = win2.log;
		indLog.result	 = win2.result;
		indLog.picked 	 = win2.picked;
	    
	    indLog.open();
	   	//win2.close();    	
	}

});

//View at the bottom to show user the database's status
var databaseStatusView = Titanium.UI.createView({
	backgroundColor:'#000',
	height: '12%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0,
	bottom: 0
});

var drafts_lb = Ti.UI.createLabel({
	text: 'Drafts',
	color:'#FFFFFF',
	height:'auto',
	width:'auto',
	right:'20dp',
	bottom: '2dp',
	textAlign:'right',
	font: {
		fontSize: '14dp'
	}	
});
databaseStatusView.add(drafts_lb);

var draft_img = Ti.UI.createImageView({
	image: '/images/draft.png',
	right: '25dp',
	width: '20dp',
	height: 'auto',
	bottom: '22dp'
});
databaseStatusView.add(draft_img);

draft_img.addEventListener('click', function(){
	setUse();
	Ti.API.info('Opening drafts');
	var win_new = Titanium.UI.createWindow({  
		title: 'Drafts',
		fullscreen: false,
		url:'drafts.js',
		type: 'draft',
		uid: jsonLogin.user.uid,
		up_node: update_node
	});
	win_new.picked 	 = win2.picked;
	win_new.open();
});

drafts_lb.addEventListener('click', function(){
	setUse();
	Ti.API.info('Opening drafts');
	var win_new = Titanium.UI.createWindow({  
		title: 'Drafts',
		fullscreen: false,
		url:'drafts.js',
		type: 'draft',
		uid: jsonLogin.user.uid,
		up_node: update_node
	});
	win_new.picked 	 = win2.picked;
	win_new.open();
});


var alerts_lb = Ti.UI.createLabel({
	text: 'Alerts',
	color:'#FFFFFF',
	height:'auto',
	width:'auto',
	right:'142dp',
	bottom: '2dp',
	textAlign:'right',
	font: {
		fontSize: '14dp'
	}	
});
databaseStatusView.add(alerts_lb);

var alerts_img = Ti.UI.createImageView({
	image: '/images/msg3.png',
	right: '145dp',
	width: '30dp',
	height: 'auto',
	bottom: '22dp'
});
databaseStatusView.add(alerts_img);

alerts_img.addEventListener('click', function(){
	setUse();
	var win_new = Titanium.UI.createWindow({  
		title: 'Message center',
		fullscreen: false,
		url:'message_center.js',
		uid: jsonLogin.user.uid,
		up_node: update_node
	});
	win_new.picked 	 = win2.picked;
	win_new.open();
});

alerts_lb.addEventListener('click', function(){
	setUse();
	var win_new = Titanium.UI.createWindow({  
		title: 'Message center',
		fullscreen: false,
		url:'message_center.js',
		uid: jsonLogin.user.uid,
		up_node: update_node
	});
	win_new.picked 	 = win2.picked;
	win_new.open();
});

var home_lb = Ti.UI.createLabel({
	text: 'Home',
	color:'#FFFFFF',
	height:'auto',
	width:'auto',
	left:'20dp',
	bottom: '2dp',
	textAlign:'right',
	font: {
		fontSize: '14dp'
	}	
});
databaseStatusView.add(home_lb);

var home_img = Ti.UI.createImageView({
	image: '/images/home2.png',
	left: '25dp',
	width: '30dp',
	height: 'auto',
	bottom: '22dp'
});
databaseStatusView.add(home_img);


win2.add(databaseStatusView);

//First time install
var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
if (updatedTime.fieldByName('timestamp') == 0){
	isFirstTime = true;
	db.close();
	checkUpdate('from_menu');
}
else{
	isFirstTime = false;
	db.close();
	checkUpdate();
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

if(PLATFORM == 'android'){

var activity = Ti.Android.currentActivity;

activity.onCreateOptionsMenu = function(e) {
    var menu = e.menu;

	var menuItem = menu.add({ 			
		title: 'Update',
		order: 0
	});
	menuItem.setIcon('/images/item1.png');

    
    var menu_draft = menu.add({ 			
		title: 'Display drafts',
		order: 1
	});
	menu_draft.setIcon("/images/draft.png");

    menuItem.addEventListener("click", function(e) {
		Ti.API.info('Refresh event!');
		checkUpdate('from_menu');
    });
    
    menu_draft.addEventListener('click', function(){
    	setUse();
    	Ti.API.info('Opening drafts');
		var win_new = Titanium.UI.createWindow({  
			title: 'Drafts',
			fullscreen: false,
			url:'drafts.js',
			type: 'draft',
			uid: jsonLogin.user.uid,
			up_node: update_node
		});
		win_new.picked 	 = win2.picked;
		win_new.open();
    });
    
};
}

//Close database
db.close();

//Check behind the courtins if there is a new version - 5 minutes
//setInterval( checkUpdate('auto') , 10000);
if(PLATFORM != 'android'){
	bottomButtons();
}

setInterval( function(){
	Ti.API.info('========= Automated Update Check running ========= ');
	
	if ( (isUpdating() === false) && (Titanium.Network.online) ){
		//Sets status to 'updating'
		setUse();

		//No progress bar
		var pb = null;
		
		var pageIndex = 0;

		var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );

		var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');

		var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
		var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
		
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'POST', null);
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
				//installMe(pageIndex, win, timeIndex, progress_bar, menu_list)
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, null, 'GET', null);
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				//installMe(pageIndex, win, timeIndex, progress, menu, img, type)
				installMe(pageIndex, win2, updatedTime.fieldByName('timestamp') , pb, listView, img, 'GET', null);
			}
		}
		updatedTime.close();
		db_up.close();
	}
	else{
		Ti.API.info('========= Database was opened, another update is running or you\'re offline ========= ');
	}
} , 300000);

function bottomButtons(){
	win2.remove(loggedView);
	listView.top = '40';
	//listView.height = '85%'
	var update = Ti.UI.createButton({
		title : 'Refresh',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	update.addEventListener('click', function() {
		checkUpdate('from_menu');
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title:name,
		color:'#fff',
		ellipsize: true,
		wordwrap: false,
		width: 200,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});

	
	var logout = Ti.UI.createButton({
		title : 'Logout',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	logout.addEventListener('click', function() {
		if ( isUpdating() ){
		a.message = 'A data sync is in progress. Please wait a moment to logout.';
		a.show();
	}
	else{
		// window container
		indLog = Titanium.UI.createWindow({
		    url: 'logDecision.js',
			title:'Omadi CRM',		    
		    fullscreen: false,
		    backgroundColor: '#000'
		});

		//Setting both windows with login values:
		indLog.log		 = win2.log;
		indLog.result	 = win2.result;
		indLog.picked 	 = win2.picked;
	    
	    indLog.open();
	   	//win2.close();    	
	}
	});
	
	// create and add toolbar
	var toolbar = Titanium.UI.createToolbar({
		items:[update, space, label, space, logout],
		top:0,
		borderTop:false,
		borderBottom:true
	});
	win2.add(toolbar);
};
