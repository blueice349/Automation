//Common used functions
Ti.include('/lib/functions.js');

var domainName =  Titanium.App.Properties.getString("domainName");
var message_center = {};
var win = {};
win.is_opened = false;
var listTableView;
//var search;
var empty;
var accountMessage = {};
accountMessage.win = {};
//accountMessage.search = null;
accountMessage.listView = null;
accountMessage.win.isOpened = false;
var actIndAlert;
var refresh_image;
var toolbar;


message_center.get_win = function() {
	win = Titanium.UI.createWindow({
		fullscreen : false,
		navBarHidden : true,
		backgroundColor : '#FFF',
		is_opened: false
	});
	
	//Sets only portrait mode
	win.orientationModes = [Titanium.UI.PORTRAIT];
	
	//Search bar definition
	// search = Ti.UI.createSearchBar({
		// hintText : 'Search...',
		// autocorrect : false,
		// barColor : '#000'
	// });		

	//Contat list container
	listTableView = Titanium.UI.createTableView({
		top : '0',
		bottom: '0',
		//search : search,
		separatorColor: '#BDBDBD',
		backgroundColor: '#fff'
	});
	win.add(listTableView);
	
	empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		color: '#999',
		font: {
		    fontWeight: 'bold',
		    fontSize: '22dp'
		},
		text : 'No location alerts were found'
	});
	
	win.add(empty);
	
	if(PLATFORM == 'android'){
		actIndAlert = Ti.UI.createActivityIndicator({
			message: 'Updating Alerts...',
			color: '#fff'
		});
		win.add(actIndAlert);
	}
	else{
		actIndAlert = Ti.UI.createActivityIndicator({
			height: '32dp',
			width: '32dp',
			style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
			right: '12dp'
		});
	}
	
	//When back button on the phone is pressed, it opens mainMenu.js and close the current window
	win.addEventListener('android:back', function() {
		//Enable background updates
		win.is_opened = false;
		//Omadi.data.setUpdating(false);
		win.close();
	});
	
	win.addEventListener('close', function(){
		win.is_opened = false;
	});
	
	win.addEventListener('open', function(){
		win.is_opened = true;
		//_upload_gps_locations();
		Omadi.location.uploadGPSCoordinates();
		
	});
	
	
	// listTableView.addEventListener('focus', function(e) {
				// search.blur();
			// });
// 			
	// search.addEventListener('return', function(e) {
		// search.blur();
	// });
// 	
	// search.addEventListener('cancel', function(e) {
		// search.blur();
	// });

	//When the user clicks on a certain contact, it opens individual_contact.js
	listTableView.addEventListener('click', function(e) {
		if(e.row!=null){
			opnAccountAlertsList(e);
		}
	});

	if(PLATFORM == 'android') {
		alertNavButtons_android(listTableView, win)
		//bottomBack_release(win, "Back", "enable");
	} else {
		alertNavButtons(listTableView, win);
	}

	return win;
};

var listTableView = null;

message_center.loadUI = function() {
	win.is_opened = true;
	loadData();
};

var showLoading = function(){
	if(PLATFORM == 'android'){
		actIndAlert.show();	
	}
	else{
		var items = toolbar.getItems();
		items.pop();
		items.push(actIndAlert);
		toolbar.setItems(items);
		actIndAlert.show();
		refresh_image.hide();
	}
};

var hideLoading = function(){
	if(PLATFORM == 'android'){
		actIndAlert.hide();	
	}
	else{
		var items = toolbar.getItems();
		items.pop();
		items.push(refresh_image);
		toolbar.setItems(items);
		actIndAlert.hide();
		refresh_image.show();
		
	}
};

//message_center.loadUI = function() {
Ti.App.addEventListener('refresh_UI_Alerts', function(e){
	if (win && win.is_opened === true){
		hideLoading();
		if(e.status == 'fail') {
			return;
		}
		if(accountMessage.win.isOpened==true){
			loadAccAlertData();
		}else{
			loadData();
		}
	}else{
		Ti.API.info(win+' Check ===>>> '+win.is_opened);
		Ti.API.info('ALERT CENTER is closed!');
	}
});

function alertNavButtons(lv_listTableView, currentWin, type){
	if (lv_listTableView){
		lv_listTableView.top = '40';
		lv_listTableView.height = '97%';
	}
	var back = Ti.UI.createButton({
		title : 'Back',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		//Omadi.data.setUpdating(false);
		currentWin.close();
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	
	var label = Titanium.UI.createButton({
			title: type,
			color:'#fff',
			ellipsize: true,
			wordwrap: false,
			width: '200',
			focusable: false,
			touchEnabled: false,
			style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	if (type != null ){
		label.title = type;
	}
	else{
		label.title = 'Alert List';
	}
	
	refresh_image = Ti.UI.createImageView({
		image: '/images/refresh.png',
		right: '9dp',
		width: '32dp',
		height: 'auto'
	});	

	refresh_image.addEventListener('click', function(e){
		showLoading();
		//_upload_gps_locations();
		Omadi.location.uploadGPSCoordinates();
	});
	
	// create and add toolbar
	toolbar = Ti.UI.iOS.createToolbar({
		items:[back, space, label, space, actIndAlert, refresh_image],
		top:0,
		borderTop:false,
		borderBottom:true
	});
	
	currentWin.add(toolbar);
};

function alertNavButtons_android(lv_listTableView, win, type){
	if (lv_listTableView){
		lv_listTableView.top = '50';
		lv_listTableView.bottom = '6%';
	}
	var baseHeader = Ti.UI.createView({
		top: 0,
		height: 50,
		backgroundImage: '/images/header.png'
	});
	
	var label = Titanium.UI.createLabel({
			color:'#fff',
			ellipsize: true,
			wordwrap: false,
			left: 0,
			right: 41,
			font: {
				fontSize: '18sp',
				fontWeight: 'bold'
			},
			textAlign: 'center',
	});
	
	if (type != null ){
		label.text = type;
	}else{
		label.text = 'Alert List';
	}
	
	refresh_image = Ti.UI.createImageView({
		image: '/images/refresh.png',
		right: '9dp',
		width: '32dp',
		height: 'auto'
	});	

	refresh_image.addEventListener('click', function(e){
		showLoading();
		//_upload_gps_locations();
		Omadi.location.uploadGPSCoordinates();
	});
	
	baseHeader.add(label);
	baseHeader.add(refresh_image);
	win.add(baseHeader);
}

function loadData(){
		var db = Omadi.utils.openGPSDatabase();
		var res_set = db.execute('SELECT *, COUNT(*) term_count FROM alerts GROUP BY location_nid ORDER BY timestamp DESC');
		var res_names = db.execute('SELECT * FROM alert_names');
		
		var obj_cnt = new Array();
		
		while (res_set.isValidRow()){
			obj_cnt.push({});
			obj_cnt[obj_cnt.length -1].label = res_set.fieldByName('location_label');
			obj_cnt[obj_cnt.length -1].nid = res_set.fieldByName('location_nid');
			obj_cnt[obj_cnt.length -1].count = res_set.fieldByName('term_count');
			res_set.next();
		}
		
		while (res_names.isValidRow()){
			var insert_it = true;
			var b;
			for (b in obj_cnt){
				if (obj_cnt[b].nid == res_names.fieldByName('location_nid')){
					insert_it = false;
				}
			}
			if (insert_it === true){
				obj_cnt.push({});
				obj_cnt[obj_cnt.length -1].label = res_names.fieldByName('location_label');
				obj_cnt[obj_cnt.length -1].nid = res_names.fieldByName('location_nid');
				obj_cnt[obj_cnt.length -1].count = 0;
			}
			res_names.next();
		}
		var data = new Array();
		//Check if the list is empty or not
		if(obj_cnt.length == 0) {
			listTableView.hide();
			empty.show();
			
		}
		else { //Shows the messages
			var x;
			for (x in obj_cnt){
				var fullName = obj_cnt[x].label+" ("+obj_cnt[x].count+")";
				var row = Ti.UI.createTableViewRow({
					height : 'auto',
					hasChild : false,
					title : fullName,
					nid: obj_cnt[x].nid,
					color: '#000',
					counter: obj_cnt[x].count,
					lbl: obj_cnt[x].label
				});
				//Parameters added to each row
				row.name = fullName;
				//Populates the array
				data.push(row);
			}
			listTableView.show();
			empty.hide();
			
			
			//Adds contact list container to the UI
			//search.blur();
			// win.addEventListener('focus', function(){
				// setTimeout(function(){
					// search.blur();
				// }, 110 );
			// });
		}
		listTableView.setData(data);
		db.close();
		
}

function opnAccountAlertsList(e) {
	accountMessage.win = Ti.UI.createWindow({
		fullscreen : false,
		navBarHidden : true,
		//title : e.row.lbl + " - Alert List",
		nid: e.row.nid,
		isOpened: false
	});
	accountMessage.win.isOpened = true;
	// accountMessage.search = Ti.UI.createSearchBar({
		// hintText : 'Search...',
		// autocorrect : false,
		// barColor : '#000'
	// });

	//Contat list container
	accountMessage.listView = Titanium.UI.createTableView({
		top : '0',
		bottom: '0',
		//search : accountMessage.search,
		separatorColor : '#BDBDBD',
		backgroundColor : '#fff'
	});
	accountMessage.win.add(accountMessage.listView);
	accountMessage.listView.addEventListener('click', function(e) {
			//accountMessage.search.blur();
			var a_db = Omadi.utils.openMainDatabase();
			
			var a_res = a_db.execute("SELECT * FROM node WHERE nid=" + e.row.nid);
			var n_nid = e.row.nid;
			var type_vl = a_res.fieldByName('table_name');
			var region_f = a_res.fieldByName('form_part');
			var name_s = a_res.fieldByName('title');
			a_db.close();

			var a_msg = Titanium.UI.createAlertDialog({
				title : 'Omadi - ' + type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
				buttonNames : ['Close', 'View Form Data'],
				cancel : 0,
				message : "What would you like to do ?"
			});
			a_msg.show();
			a_msg.addEventListener('click', function(ev) {
				var clicked_false = false;
				if(PLATFORM == 'android') {
					if(ev.cancel != false) {
						clicked_false = true;
					}
				} else {
					if(ev.index == ev.cancel) {
						clicked_false = true
					}
				}
				if(clicked_false == false) {
					Ti.API.info('LOCATION ALERT: Opening node if it exists: ' + n_nid);
					//Next window to be opened
					var win_new = Titanium.UI.createWindow({
						fullscreen : false,
						navBarHidden : true,
						title : type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
						type : type_vl,
						url : 'individual_object.js',
						up_node : win.up_node,
						uid : win.uid,
						region_form : region_f
					});

					//search.blur();
					//hide keyboard

					//Passing parameters
					win_new.nid = n_nid;
					win_new.nameSelected = name_s
					//db_t.close();

					//Avoiding memory leaking
					win_new.open();
				}
			});
	});
	
	// accountMessage.listView.addEventListener('focus', function(e) {
		// accountMessage.search.blur();
	// });
// 
	// accountMessage.search.addEventListener('return', function(e) {
		// accountMessage.search.blur();
	// });
// 
	// accountMessage.search.addEventListener('cancel', function(e) {
		// accountMessage.search.blur();
	// }); 

	if(PLATFORM == 'android') {
		alertNavButtons_android(accountMessage.listView, accountMessage.win, accountMessage.win.title);
		//bottomBack_release(accountMessage.win, "Back", "enable");
	} else {
		alertNavButtons(accountMessage.listView, accountMessage.win, accountMessage.win.title);
	}
	accountMessage.win.addEventListener('android:back', function() {
		accountMessage.win.close();
	});
	
	accountMessage.win.addEventListener('close', function(e){
		accountMessage.win.isOpened = false;
	});
	
	// accountMessage.win.addEventListener('focus', function() {
		// setTimeout(function() {
			// accountMessage.search.blur();
		// }, 110);
	// }); 

	accountMessage.win.open();
	if(PLATFORM == 'android'){
		Ti.UI.Android.hideSoftKeyboard();
	}
	loadAccAlertData();
}

function loadAccAlertData(){
	var db_t = Omadi.utils.openGPSDatabase();
	
	var msgs = db_t.execute('SELECT * FROM alerts WHERE location_nid=' + accountMessage.win.nid + ' ORDER BY timestamp DESC');
	if(msgs.rowCount > 0) {
		var n_data = new Array();
		var ch = 0;
		while(msgs.isValidRow()) {
			if(ch % 2 != 0) {
				var ch_color = '#FFFFFF';
			} else {
				var ch_color = '#ECF2F3';
			}
			ch++;
			Ti.API.info("======>>> " + msgs.fieldByName('message'));
			var full_msg = msgs.fieldByName('message');

			var t_lb = Titanium.UI.createLabel({
				text : msgs.fieldByName('subject'),
				height : 'auto',
				width : 'auto',
				font : {
					fontSize : '15sp',
					fontWeight : 'bold'
				},
				left : "2%",
				right : "2%",
				textAlign : 'left',
				color : '#0B0B61'
			});

			var n_lb = Titanium.UI.createLabel({
				text : full_msg,
				height : 'auto',
				width : 'auto',
				font : {
					fontSize : '12sp',
				},
				left : "2%",
				right : "2%",
				textAlign : 'left',
				color : '#000'
			});

			var n_row = Ti.UI.createTableViewRow({
				height : 'auto',
				hasChild : false,
				color : ch_color,
				layout : 'vertical',
				backgroundColor : ch_color,
				className : "sorted",
				font : {
					fontSize : '22dp',
					fontWeight : 'bold'
				},
				textAlign : 'left',
				nid : msgs.fieldByName('ref_nid'),
				title: msgs.fieldByName('subject')
			});
			Ti.API.info("NID: " + msgs.fieldByName('ref_nid'));
			n_row.add(t_lb);
			n_row.add(n_lb);

			//Populates the array
			n_data.push(n_row);
			msgs.next();
		}
		db_t.close();
		accountMessage.listView.setData(n_data);
		//Search bar definition		
	} else {
		notifyIOS('There are no messages for this item');
		db_t.close();
	}
	
}
