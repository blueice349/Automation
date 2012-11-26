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
Ti.include('/main_windows/message_center.js');
Ti.include('/lib/functions.js'); 
Ti.include('/lib/encoder_base_64.js');

Ti.API.info("hi");

//Current window's instance
var curWin = Ti.UI.currentWindow;
curWin.backgroundColor = '#FFFFFF';

var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';

var version = 'Omadi Inc';
var isFirstTime = false;

//Common used functions
unsetUse();
var db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
if(PLATFORM != 'android'){db.file.setRemoteBackup(false);}

function checkUpdate(evt){
	Ti.API.info('******* Called checkupate => '+evt);
	
	if ( (isUpdating() === false) && (Titanium.Network.online) ){
		//Sets status to 'updating'
		setUse();
		if (evt == 'from_menu'){
			//instance progress bar object:
			var d = new Date();
			Titanium.App.Properties.setDouble("lastSynced", d.getTime());
			var pb = new Progress_install(0, 100);
			Ti.API.info(pb);
		}
		else{
			//No progress bar
			var pb = null;
		}
 
		var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
		if(PLATFORM != 'android'){db_up.file.setRemoteBackup(false);}
		var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');

		var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
		var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
		updatedTime = updatedTime.fieldByName('timestamp');
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			Ti.API.info('installMe( '+curWin+' , '+updatedTime +' , '+pb+' , '+listView+', '+null+' , POST  )');
			db_up.close();
			installMe(curWin, updatedTime , pb, listView, null, 'POST', null);
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
	
				Ti.API.info('installMe( '+curWin+' , '+updatedTime +' , '+pb+' , '+listView+', '+null+' , GET  )');
				db_up.close();
				installMe(curWin, updatedTime , pb, listView, null, 'GET', null);
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				Ti.API.info('installMe( '+curWin+' , '+updatedTime +' , '+pb+' , '+listView+', '+img+' , GET  )');
			
				db_up.close();
				installMe(curWin, updatedTime , pb, listView, img, 'GET', null);
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
					notifyIOS('You have no internet access, make sure you are online in order to update');
				}
				//If offline, set up database for use
				unsetUse();
			}
			else {
				if(PLATFORM == 'android'){
					Ti.UI.createNotification({
						message : 'Another update is already running'
					}).show();
				}else{
					notifyIOS('Another update is already running');
				}
			}
		}
	}
};


var listView = Titanium.UI.createTableView({
	data : [],
	top : '50dp',
	bottom: '60dp',
	scrollable: true,
	zIndex: 999,
	separatorColor: '#BDBDBD'
});

var elements = db.execute('SELECT * FROM bundles');
var check = 0;

//Parses result from user's login 
var jsonLogin = JSON.parse(curWin.result);

//Retrieves username
Ti.App.Properties.setString('Omadi_session_details', curWin.result);

Ti.App.Properties.setString('username', name);

var time_format = jsonLogin.user.time_format;
Ti.App.Properties.setString('Omadi_time_format', (time_format!=null && time_format!="")?time_format:'g:iA' );
omadi_time_format = Ti.App.Properties.getString("Omadi_time_format", 'g:iA');
var name = jsonLogin.user.realname;
var roles = jsonLogin.user.roles;

Ti.App.Properties.setString('username', name);

var _data_rows = new Array();
while ( elements.isValidRow() ){
	var name_table   = elements.fieldByName("bundle_name");
	var display      = elements.fieldByName("display_name").toUpperCase();
	var description  = elements.fieldByName("description");
	var flag_display = elements.fieldByName("display_on_menu");
	var _is_disabled = elements.fieldByName("disabled");
	var _nd 		 = elements.fieldByName("_data");
	var show_plus 	 = false;
	var app_permissions = {
		"can_create" : false,
		"can_update" : false,
		"all_permissions" : false,
		"can_view" : false
	}
	
	var node_type_json = JSON.parse(_nd);
	if(node_type_json.no_mobile_display!=null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1'){
		elements.next();
		continue;
	}
	
	if(roles.hasOwnProperty(ROLE_ID_ADMIN)) {
		show_plus = true;
		app_permissions.can_create = true;
		app_permissions.all_permissions = true;
		app_permissions.can_update = true;
		app_permissions.can_view = true;
	} else {
		var _l;
		for(_l in node_type_json.permissions) {
			for(_k in roles) {
				if(_l == _k) {
					//Ti.API.info("====>> " + _l);
					var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
					if(node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
						show_plus = true;
						app_permissions.can_create = true;
					}

					if(node_type_json.permissions[_l]["all_permissions"]) {
						app_permissions.all_permissions = true;
						app_permissions.can_update = true;
						app_permissions.can_view = true;
						continue;
					}

					if(stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
						app_permissions.can_update = true;
					}

					if(stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
						app_permissions.can_view = true;
					}

				}
			}
		}
	}

	//Ti.API.info(flag_display+" = "+_is_disabled);	
	
	if (flag_display == 'true' && ( _is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true) ){
		
		if(app_permissions.can_view == false && app_permissions.can_create == false){
			elements.next();
			continue;
		}
		check++;
		var row_t = Ti.UI.createTableViewRow({
			height      : "50dp",	
			display     : display,
			name		: display,
			desc : description,
			name_table  : name_table,
			show_plus 	: show_plus,
			app_permissions: app_permissions,
			className	: 'menu_row', // this is to optimize the rendering
			selectionStyle : app_permissions.can_view?1:0,
			backgroundSelectedColor: app_permissions.can_view?'#BDBDBD':'#00000000'
		});
		
		var icon = Titanium.UI.createImageView({
			width: "32dp",
			height: "32dp",
			top: "6dp",
			left: "5dp",
			image: '/images/icons/' + name_table.toLowerCase() + '.png',
			desc : description,
		});
		
		if(icon.toBlob() == null || icon.toBlob().length == 0){
			icon.image = '/images/icons/settings.png';
		}
		
		var title = Titanium.UI.createLabel({
			text: display,
			font:{
				fontSize: "20dp"
			},
			width:'82%',
			textAlign:'left',
			left:"42dp",
			height:'auto',
			color: '#000',
			desc : description,
		});

		var plus =  Titanium.UI.createButton({
			backgroundImage: '/images/plus_btn.png',
			backgroundSelectedImage: '/images/plus_btn_selected.png',
			width:"54dp",
			height:"38dp",
			right: "1dp",
			is_plus: true
		});
		if (show_plus === false){
			if(PLATFORM=='android'){
				plus.visible = false;
			}else{
				plus.hide();	
			}
		}
		
		row_t.add(icon);
		row_t.add(title);
		row_t.add(plus);
		
		_data_rows.push(row_t);
		_data_rows.sort(sortTableView);
		listView.setData(_data_rows);
		
		if(PLATFORM == 'android') {
			row_t.addEventListener('longclick', function(e) {
				if(e.source.desc != null && e.source.desc != "") {
					alert(e.source.desc)
				}
			});
		} else {
			row_t.addEventListener('longpress', function(e) {
				if(e.source.desc != null && e.source.desc != "") {
					alert(e.source.desc)
				}
			});
		}

	}
	elements.next();
}
elements.close();

curWin.add(listView);

if (check == 0){
	var img = Ti.UI.createImageView({
		image: '/images/message.png',
		width: 'auto',
		height: 'auto',
		top: '25%',
		zIndex: 0
	});
	
	curWin.add(img);
}

if(PLATFORM == 'android'){
	var notf = Ti.UI.createNotification({
		message : 'Please, wait ...',
		duration: Ti.UI.NOTIFICATION_DURATION_LONG
	});
}

//Go to contact.js when contact's button is clicked
listView.addEventListener('click',function(e){
	lock_screen();
	Ti.API.info("row click on table view. index = "+e.index+", row_desc = "+e.row.description+", section = "+e.section+", source_desc="+e.source.description);
	if(e.row.app_permissions.can_view == false && e.source.is_plus != true){
		alert("You don't have access to view the " + e.row.display + " list.");
		unlock_screen();
		unsetUse();
		return; 
	}

	setUse();
	//Creates a new node_type
	if (e.source.is_plus){
		//alert('You clicked the '+e.row.display+' . His table\'s name is '+e.row.name_table);
		var win_new = create_or_edit_node.getWindow();
		win_new.title = "New "+e.row.display;
		win_new.type = e.row.name_table;
		win_new.uid = jsonLogin.user.uid;
		win_new.up_node = update_node;
		win_new.mode = 0;
		//win_new.movement = movement;
		win_new.region_form = 0;
		win_new.backgroundColor = "#EEEEEE";
		win_new.app_permissions = e.row.app_permissions;
		win_new.addEventListener('focus', function(){
			unlock_screen();
		});
		
		win_new.open();
		setTimeout(function(){create_or_edit_node.loadUI();}, 100);
	}
	else{
		if(e.row.app_permissions.can_view == true){
			var win_new = Titanium.UI.createWindow({ 
				navBarHidden : true,
				title: e.row.display,
				fullscreen: false,
				url:'objects.js',
				type: e.row.name_table,
				uid: jsonLogin.user.uid,
				up_node: update_node,
				backgroundColor: '#EEEEEE',
				show_plus: e.row.show_plus
			});
			//win_new.movement = movement;
			win_new.app_permissions = e.row.app_permissions;
			win_new.addEventListener('focus', function(){
				unlock_screen();
			});
		
			win_new.open();
		 }else{
		     alert("You don't have access to view the " + e.row.display + " list.");
			 unlock_screen();
			 unsetUse();
		 }
	}
});

// showToolbar(name, curWin)
var loggedView = Titanium.UI.createView({
	top: '0px',	
	backgroundColor:'#111',
	height: '50dp',
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
	height: 'auto',
	font: {
		fontSize: "15dp"
	}
}); 

var offImage = Titanium.UI.createLabel({
	color:'#FFF',
	text:'Log Out',
	borderRadius: '4dp',
	width:'70dp',
	horizontalAlign: 'right',
	textAlign: 'center',
	right: '50dp',
	height: '30dp',
	backgroundGradient: {
        type: 'linear',
        startPoint: { x: '50%', y: '0%' },
        endPoint: { x: '50%', y: '100%' },
        colors: [ { color: '#ccc', offset: 0.0}, { color: '#ddd', offset: 0.25 }, { color: '#aaa', offset: 1.0 } ],
   },
   borderRadius: '5dp', 
   color: '#000',
   style: Ti.UI.iPhone.SystemButtonStyle.PLAIN
});

var refresh_image = Ti.UI.createImageView({
	image: '/images/refresh.png',
	right: '9dp',
	width: '32dp',
	height: 'auto'
});
loggedView.add(refresh_image);

loggedView.add(label_top);
loggedView.add(offImage);
curWin.add(loggedView);

var a = Titanium.UI.createAlertDialog({
	title:'Omadi',
	buttonNames: ['OK']
});

refresh_image.addEventListener('click', function(e){
	checkUpdate('from_menu');
});

offImage.addEventListener('click', function(e){
	// window container
	// indLog = Titanium.UI.createWindow({
		// navBarHidden : true,
	    // url: 'logDecision.js',
		// title:'Omadi CRM',
	    // fullscreen: false,
	    // backgroundColor: '#EEEEEE'
	// });
// 
	// //Setting both windows with login values:
	// indLog.log		 = curWin.log;
	// indLog.result	 = curWin.result;
	// indLog._parent	 = curWin;
    
    //indLog.open();
    
    var verifyLogout = Titanium.UI.createAlertDialog({
		title: 'Logout?',
		message: 'Are you sure you want to logout?',
		buttonNames: ['Yes', 'No'],
		cancel: 1
	});
	
	verifyLogout.addEventListener('click', function(e){
		if (e.index !== e.source.cancel){
			Ti.API.info('The yes button was clicked.');
			
			do_logout();
		}
	});
	
	verifyLogout.show();

});

curWin.addEventListener('close', function(){
	Ti.API.info('Closing main menu');
});

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
curWin.orientationModes = [ Titanium.UI.PORTRAIT ];

//When back button on the phone is pressed, it alerts the user (pop up box)
// that he needs to log out in order to go back to the root window
curWin.addEventListener('android:back', function() {
	var verifyLogout = Titanium.UI.createAlertDialog({
		title: 'Logout?',
		message: 'Are you sure you want to logout?',
		buttonNames: ['Yes', 'No'],
		cancel: 1
	});
	
	verifyLogout.addEventListener('click', function(e){
		if (e.index !== e.source.cancel){
			Ti.API.info('The yes button was clicked.');
			
			do_logout();
		}
	});
	
	verifyLogout.show();
});

if(PLATFORM == 'android'){

	var activity = Ti.Android.currentActivity;
	
	activity.onCreateOptionsMenu = function(e) {
	    var menu = e.menu;
	
		var menuItem = menu.add({ 
			title: 'Sync Data',
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
			if (isUpdating()){
				if(PLATFORM == 'android'){
					notf.show();
				}
				else{
					notifyIOS('Please, wait ...');
				}
			}
			else{
				var about_win = Ti.UI.createWindow({
					title: 'About',
					navBarHidden : true,
					fullscreen: false,
					backgroundColor: '#EEEEEE',
					url:'about.js'
				});
				about_win.open();
			}
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
Ti.App.syncInterval = setInterval( function(){
	Ti.API.info('========= Automated Update Check running ========= ');
	
	if(!isLogged()){
		Ti.API.info("Tried to sync, but not logged in... quitting.");
	}
	else if ( (isUpdating() === false) && (Titanium.Network.online) ){
		//Sets status to 'updating'
		setUse();

		//No progress bar
		var pb = null;

		var db_up = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
		if(PLATFORM != 'android'){db_up.file.setRemoteBackup(false);}
		var updatedTime = db_up.execute('SELECT timestamp FROM updated WHERE rowid=1');
		var updatedTimeStamp = updatedTime.fieldByName('timestamp');

		var see = db_up.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
		var up_flag = db_up.execute('SELECT * FROM node WHERE flag_is_updated=1');
		
		if (up_flag.rowCount > 0){
			Ti.API.info("Fired nodes update");
			updatedTime.close();
			db_up.close();
			installMe(curWin, updatedTimeStamp , pb, listView, null, 'POST', null);
		}
		else{
			//Normal install
			if ( see.rowCount > 0 ){
				Ti.API.info("Fired normal database install");
			
				updatedTime.close();
				db_up.close();

				installMe(curWin, updatedTimeStamp , pb, listView, null, 'GET', null);
			}
			//First install
			else{
				Ti.API.info("Fired first database install");
				
				updatedTime.close();
				db_up.close();

				installMe(curWin, updatedTimeStamp , pb, listView, img, 'GET', null);
			}
		}
	}
	else{
		Ti.API.info('========= Database was opened, another update is running or you\'re offline ========= ');
	}
} , 300000);

var databaseStatusView = Titanium.UI.createView({
	backgroundColor:'#000',
	height: '60dp',
	width: '100%',
	bottom: 0,
	layout: 'horizontal'
});

//View at the bottom to show user the database's status

var alerts_view = Ti.UI.createView({
	backgroundSelectedColor: 'orange',
	focusable: true,
	width: '50%'
});
databaseStatusView.add(alerts_view);

var alerts_img = Ti.UI.createImageView({
	image: '/images/msg3.png'
});
var alerts_lb = Ti.UI.createLabel({
	text: 'Alerts',
	font: {
		fontSize: '14dp'
	},
	height: 'auto',
	bottom: 0
});
alerts_view.add(alerts_img);
alerts_view.add(alerts_lb);
alerts_view.addEventListener('click', function(){
	lock_screen();
	var win_new = message_center.get_win();
	
	win_new.addEventListener('focus', function(){
		unlock_screen();
	});
	
	win_new.open();

	setTimeout(function(){message_center.loadUI();}, 100);
});

var drafts_view = Ti.UI.createView(
{
	backgroundSelectedColor: 'orange',
	focusable: true,
	width: '50%'
});
databaseStatusView.add(drafts_view);
var draft_img = Ti.UI.createImageView({
	image: '/images/drafts.png'
});
var drafts_lb = Ti.UI.createLabel({
	text: 'Drafts',
	font: {
		fontSize: '14dp'
	},
	height: 'auto',
	bottom: 0
});
drafts_view.add(draft_img);
drafts_view.add(drafts_lb);
drafts_view.addEventListener('click', function(){
	openDraftWindow();
});

//View settings (Draft/ Alert/ Home)
drafts_view.height = alerts_view.height =  '60dp';
drafts_view.layout = alerts_view.layout =  'vertical';

//Label settings (Draft/ Alert/ Home)
drafts_lb.color 	= alerts_lb.color  		= '#FFFFFF';
drafts_lb.height 	= alerts_lb.height 		= '21dp';
drafts_lb.width 	= alerts_lb.width  		= 'auto';
drafts_lb.textAlign = alerts_lb.textAlign  	= 'center';

//Image view setting (Draft/ Alert/ Home)
alerts_img.height = draft_img.height	= '30dp';
alerts_img.width  = draft_img.width	 	= '30dp';
draft_img.top 	  = alerts_img.top 		= '2dp';

if(PLATFORM != 'android'){
	drafts_view.width = alerts_view.width =  Ti.Platform.displayCaps.platformWidth/3;
	
	var actions_view = Ti.UI.createView({
		height: 'auto',
		width: Ti.Platform.displayCaps.platformWidth/3,
		layout: 'vertical'
	});
	databaseStatusView.add(actions_view);
	
	var actions_img = Ti.UI.createImageView({
		image: '/images/actions.png',
		width: '30dp',
		height: '30dp',
		top: '2dp'
	});
	var actions_lb = Ti.UI.createLabel({
		text: 'Actions',
		color:'#FFFFFF',
		height:'21dp',
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
		postDialog.options = ['Sync Data', 'Navigation Map', 'Display Draft', 'About', 'cancel'];
		postDialog.cancel = 4;
		postDialog.show();

		postDialog.addEventListener('click', function(ev) {
			if(ev.index == 0) {
				checkUpdate('from_menu');
			}
			else if(ev.index == 1) {
				var nav_win = Ti.UI.createWindow({
					title : 'Navigation',
					//navBarHidden : false,
					modal : true,
					backgroundColor : 'black',
					url : 'navigation.js'
				});
				nav_win.open();
			}
			 else if(ev.index == 2) {
				openDraftWindow();
			} else if(ev.index == 3) {
				var about_win = Ti.UI.createWindow({
					title : 'About',
					navBarHidden : true,
					fullscreen : false,
					backgroundColor : 'black',
					url : 'about.js'
				});
				about_win.open();
			}
		});
		return;
	});
}

curWin.add(databaseStatusView);

function openDraftWindow(){
	lock_screen();
	var toolActInd = Ti.UI.createActivityIndicator();
	toolActInd.font = {
		fontFamily : 'Helvetica Neue',
		fontSize : 15,
		fontWeight : 'bold'
	};

	toolActInd.color = 'white';
	toolActInd.message = 'Loading...';
	toolActInd.show();
	setUse();
	Ti.API.info('Opening drafts');
	var win_new = Titanium.UI.createWindow({  
		title: 'Drafts',
		navBarHidden : true,
		fullscreen: false,
		url:'drafts.js',
		type: 'draft',
		uid: jsonLogin.user.uid,
		up_node: update_node,
		backgroundColor: '#EEE'
	});

	win_new.addEventListener('focus', function(){
		unlock_screen();
	});
	
	win_new.open();
	toolActInd.hide();
}

function lock_screen(){
	curWin.touchEnabled = false;
	databaseStatusView.touchEnabled = false;
	databaseStatusView.focusable = false;
}

function unlock_screen(){
	curWin.touchEnabled = true;
	databaseStatusView.touchEnabled = true;
	databaseStatusView.focusable = true;
}

Ti.App.addEventListener('update_from_menu', function(){
	listView.setData([]);
	checkUpdate('from_menu');
});

Ti.App.addEventListener('normal_update_from_menu', function(){
	checkUpdate('from_menu');
});


//TEST
//alert("DPTOPIXEL = "+DPUnitsToPixels(100)+"      PIXELTODP = "+PixelsToDPUnits(100));
