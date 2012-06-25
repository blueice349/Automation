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


var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';

var version = 'Omadi Inc';
var isFirstTime = false;

//Common used functions
Ti.include('/lib/functions.js');
setUse();
unsetUse();
var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );

//Geolocation module
setTimeout(function(){
	Ti.include('geolocation.js');
}, 10000)


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
		var updatedTime = updatedTime.fieldByName('timestamp');
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime +' , '+pb+' , '+listView+', '+null+' , POST  )');
			db_up.close();
			installMe(pageIndex, win2, updatedTime , pb, listView, null, 'POST', null);
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
				//installMe(pageIndex, win, timeIndex, progress_bar, menu_list)
				Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime +' , '+pb+' , '+listView+', '+null+' , GET  )');
				db_up.close();
				installMe(pageIndex, win2, updatedTime , pb, listView, null, 'GET', null);
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				Ti.API.info('installMe( '+pageIndex+' , '+win2+' , '+updatedTime +' , '+pb+' , '+listView+', '+img+' , GET  )');
				//installMe(pageIndex, win, timeIndex, progress, menu, img, type)
				db_up.close();
				installMe(pageIndex, win2, updatedTime , pb, listView, img, 'GET', null);
			}
		}
		//updatedTime.close();
		//db_up.close();
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
	top : '50',
	//height : '80%',
	bottom: '60',
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

if(PLATFORM == 'android'){
	var notf = Ti.UI.createNotification({
					message : 'Please, wait ...',
					duration: Ti.UI.NOTIFICATION_DURATION_LONG
	});
}

//Go to contact.js when contact's button is clicked
listView.addEventListener('click',function(e){
	Ti.API.info("row click on table view. index = "+e.index+", row_desc = "+e.row.description+", section = "+e.section+", source_desc="+e.source.description);
	var timer_int_list  =  setInterval(function(){
		if (isUpdating()){
			if(PLATFORM == 'android'){
				notf.show();
			}
			else{
				alert('Please, wait ...');
			}		
		}
		else{
			clearInterval(timer_int_list);
			if (PLATFORM == "android"){
				notf.hide();				
			}
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
		}
	}, 1000);
});

//Parses result from user's login 
var jsonLogin = JSON.parse(win2.result) ;

//Retrieves username
var name = jsonLogin.user.realname;

// showToolbar(name, win2)					
var loggedView = Titanium.UI.createView({
	top: '0px',	
	backgroundColor:'#111',
	height: '50',
	width: '100%',
	opacity: 0.99
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
		indLog._parent	 = win2;
	    
	    indLog.open();
	   	//win2.close();    	
	}

});

//Will create bottom toolbar with Home/Draft/Alert/Action buttons
createDatabaseStatusView();

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
	
	var menu_about = menu.add({
		title: 'About',
		order: 2
	});
	menu_about.setIcon("/images/about.png");

	menu_about.addEventListener("click", function(e) {
		var about_win = Ti.UI.createWindow({
			title: 'About',
			fullscreen: false,
			backgroundColor: 'black',
			url:'about.js'
		});
		about_win.open();
    });

    menuItem.addEventListener("click", function(e) {
		Ti.API.info('Refresh event!');
		checkUpdate('from_menu');
    });
    
    menu_draft.addEventListener('click', function(){
    	openDraftWindow();
    });
    
};
}

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

function createDatabaseStatusView(){
	//View at the bottom to show user the database's status
	var databaseStatusView = Titanium.UI.createView({
		backgroundColor:'#000',
		height: '60',
		width: '100%',
		bottom: 0,
		layout: 'horizontal'
	});
	var home_view = Ti.UI.createView()
	databaseStatusView.add(home_view);
	var home_img = Ti.UI.createImageView({
		image: '/images/home2.png'
	});
	var home_lb = Ti.UI.createLabel({
		text: 'Home',
		font: {
			fontSize: '14dp'
		}	
	});
	home_view.add(home_img);
	home_view.add(home_lb);
	
	var alerts_view = Ti.UI.createView()
	databaseStatusView.add(alerts_view);
	var alerts_img = Ti.UI.createImageView({
		image: '/images/msg3.png'
	});
	var alerts_lb = Ti.UI.createLabel({
		text: 'Alerts',
		font: {
			fontSize: '14dp'
		}	
	});
	alerts_view.add(alerts_img);
	alerts_view.add(alerts_lb);
	alerts_view.addEventListener('click', function(){
		var timer_int_msg  =  setInterval(function(){
			if (isUpdating()){
				if(PLATFORM == 'android'){
					notf.show();
				}
				else{
					alert('Please, wait ...');
				}		
			}
			else{
				clearInterval(timer_int_msg);
				notf.hide();
				setUse();		
			
				var win_new = Titanium.UI.createWindow({
					title : 'Message center',
					fullscreen : false,
					url : 'message_center.js',
					uid : jsonLogin.user.uid,
					up_node : update_node,
					backgroundColor: '#000'
				});
				win_new.picked = win2.picked;
				win_new.open();
			}
		}, 1000);	
	});
	
	var drafts_view = Ti.UI.createView({top: 7})
	databaseStatusView.add(drafts_view);
	var draft_img = Ti.UI.createImageView({
		image: '/images/draft.png',
		height: '22',
		width: '25'
	});
	var drafts_lb = Ti.UI.createLabel({
		text: 'Drafts',
		top: 3,
		font: {
			fontSize: '14dp'
		}	
	});
	drafts_view.add(draft_img);
	drafts_view.add(drafts_lb);
	drafts_view.addEventListener('click', function(){
		openDraftWindow();
	});
	
	//View settings (Draft/ Alert/ Home)
	drafts_view.height = alerts_view.height = home_view.height = 60;
	drafts_view.layout = alerts_view.layout = home_view.layout = 'vertical';
	
	//Label settings (Draft/ Alert/ Home)
	drafts_lb.color 	= alerts_lb.color 		= home_lb.color 	= '#FFFFFF';
	drafts_lb.height 	= alerts_lb.height 		= home_lb.height 	= '21dp';
	drafts_lb.width 	= alerts_lb.width 		= home_lb.width 	= 'auto';
	drafts_lb.textAlign = alerts_lb.textAlign 	= home_lb.textAlign = 'center';
	
	//Image view setting (Draft/ Alert/ Home)
	alerts_img.height 	= home_img.height 	= '30';
	alerts_img.width	= home_img.width 	= '30';
	draft_img.top 		= alerts_img.top 	= draft_img.top = '2';
	
	if(PLATFORM == 'android'){
		drafts_view.width = alerts_view.width = home_view.width = Ti.Platform.displayCaps.platformWidth/3;
	}else{
		drafts_view.width = alerts_view.width = home_view.width = Ti.Platform.displayCaps.platformWidth/4;
		
		var actions_view = Ti.UI.createView({
			height: '50',
			width: Ti.Platform.displayCaps.platformWidth/4,
			layout: 'vertical'
		})
		databaseStatusView.add(actions_view);
		var actions_img = Ti.UI.createImageView({
			image: '/images/action.png',
			width: '30',
			height: '30',
			top: 5
		});
		var actions_lb = Ti.UI.createLabel({
			text: 'Actions',
			color:'#FFFFFF',
			height:'16',
			width:'auto',
			textAlign:'center',
			font: {
				fontSize: '14dp'
			}	
		});
		actions_view.add(actions_img);
		actions_view.add(actions_lb);
		
		actions_view.addEventListener('click', function(){
			var postDialog = Titanium.UI.createOptionDialog();
			postDialog.options = ['Update', 'Display Draft', 'cancel'];
			postDialog.cancel = 2;
			postDialog.show();

			postDialog.addEventListener('click', function(ev) {
				if(ev.index == 0) {
					checkUpdate('from_menu');
				} else if(ev.index == 1) {
					openDraftWindow();
				}
			});
			return;
		
		});
	}
	
	win2.add(databaseStatusView);
}

function openDraftWindow(){

	var timer_int_draft  =  setInterval(function(){
		if (isUpdating()){
			if(PLATFORM == 'android'){
				notf.show();
			}
			else{
				alert('Please, wait ...');
			}		
		}
		else{
			clearInterval(timer_int_draft);
			notf.hide();			
			setUse();
			Ti.API.info('Opening drafts');
			var win_new = Titanium.UI.createWindow({  
				title: 'Drafts',
				fullscreen: false,
				url:'drafts.js',
				type: 'draft',
				uid: jsonLogin.user.uid,
				up_node: update_node,
				backgroundColor: '#000'
			});
			win_new.picked 	 = win2.picked;
			win_new.open();
		}
	}, 1000);	
}
