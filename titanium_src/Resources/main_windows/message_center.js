//Common used functions
Ti.include('/lib/functions.js');
var db_coord_name = Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName() + "_GPS";

var _upload_gps_locations = function() {
	Ti.API.info('################################## CALLED UPDATE FUNCTION ################################## '+is_GPS_uploading());
	if (is_GPS_uploading() === false){
		set_GPS_uploading();
		Ti.API.info('GPS');
		var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
		if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
		Ti.API.info("Length before: " + location_obj.length);
		var leng_before = location_obj.length;
		var aux_location = location_obj.slice(0);
		Ti.API.info(aux_location.length + " Length after: " + location_obj.length);
		location_obj = new Array();
	
		for (var ind_local in aux_location) {
			Ti.API.info(aux_location[ind_local].accurated_location);
			db_coord.execute(aux_location[ind_local].accurated_location);
		}
		if (aux_location.length > 0) {
			last_db_timestamp = aux_location.pop().timestamp;
			Ti.API.info("Last timestamp = " + last_db_timestamp);
		}
		var result = db_coord.execute("SELECT * FROM user_location WHERE status = 'notUploaded' ORDER BY timestamp ASC");
	
		if (result.rowCount > 0) {
			Ti.API.info(result.rowCount + ' gps locations were found ');
			if (Ti.Network.getOnline() === true) {
	
				//Build JSON structure
				var json_coord = "{ \"data\": [";
				if (result.rowCount >= 50){
					for (var i = 0; i < 50; i++) {
						db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
						(i == 49) ? json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
						result.next();
					}
				}
				else{
					for (var i = 0; i < result.rowCount; i++) {
						db_coord.execute("UPDATE user_location SET status =\"json\" WHERE ulid=" + result.fieldByName('ulid'));
		
						(i == result.rowCount - 1) ? json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}" : json_coord += " {\"lat\" : \"" + result.fieldByName('latitude') + "\", \"lng\" : \"" + result.fieldByName('longitude') + "\" , \"time\" : \"" + result.fieldByName('timestamp') + "\"}, ";
						result.next();
					}
				}
				json_coord += "], \"current_time\": \" " + Math.round(new Date().getTime() / 1000) + "\" }";
	
				result.close();
	
				//alert ("Before open connection");
				var objectsCheck = Ti.Network.createHTTPClient();
				//Timeout until error:
				objectsCheck.setTimeout(30000);
	
				//Opens address to retrieve contact list
				objectsCheck.open('POST', domainName + '/js-location/mobile_location.json');
	
				//Header parameters
				objectsCheck.setRequestHeader("Content-Type", "application/json");
				objectsCheck.setRequestHeader("Cookie", getCookie());
	
				//When connected
				objectsCheck.onload = function(e) {
					//Parses response into strings
					Ti.API.info('onLoad for GPS coordiates reached! Here is the reply: ');
					Ti.API.info(this.responseText);
					Ti.API.info('Requested: ');
					Ti.API.info(json_coord);
	
					if (isJsonString(this.responseText) === true) {
						var resultReq = JSON.parse(this.responseText);
						if (resultReq.inserted) {
							if (resultReq.success) {
								Ti.API.info(resultReq.success + " GPS coordinates successfully inserted ");
							}
						}
						var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
						if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
						db_coord.execute('DELETE FROM user_location WHERE status="json"');
						var _arr_content = new Array();
						var nids = new Array();
						if (resultReq.alert) {
							for (var _i in resultReq.alert) {
								var tmstp = new Date();
								Ti.API.info("====>>>>>>>>>>>> " + resultReq.alert[_i].location_nid);
								if (nids.indexOf(resultReq.alert[_i].location_nid) == -1) {
									nids.push(resultReq.alert[_i].location_nid);
								}
								_arr_content.push('INSERT OR REPLACE INTO alert_names (location_nid, location_label) VALUES ( ' + resultReq.alert[_i].location_nid + ', "' + resultReq.alert[_i].location_label + '" )');
	
								for (var _y in resultReq.alert[_i].alerts) {
									if (resultReq.alert[_i].alerts[_y]) {
										Ti.API.info("Alert Message: " + resultReq.alert[_i].alerts[_y].message);
										_arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "' + resultReq.alert[_i].alerts[_y].subject + '", ' + resultReq.alert[_i].alerts[_y].reference_id + ', ' + resultReq.alert[_i].alerts[_y].alert_id + ', ' + resultReq.alert[_i].alerts[_y].location_nid + ', "' + resultReq.alert[_i].alerts[_y].location_label + '", "' + resultReq.alert[_i].alerts[_y].message + '" , ' + tmstp.getTime() + ' )');
									} else {
										Ti.API.info("Alert Message: " + resultReq.alert[_i].alerts.message);
										_arr_content.push('INSERT OR REPLACE INTO alerts (subject, ref_nid, alert_id, location_nid, location_label, message, timestamp) VALUES ( "' + resultReq.alert[_i].alerts.subject + '", ' + resultReq.alert[_i].alerts.reference_id + ', ' + resultReq.alert[_i].alerts.alert_id + ', ' + resultReq.alert[_i].alerts.location_nid + ', "' + resultReq.alert[_i].alerts.location_label + '", "' + resultReq.alert[_i].alerts.message + '" , ' + tmstp.getTime() + ' )');
									}
								}
							}
						}
						db_coord.execute("BEGIN IMMEDIATE TRANSACTION");
						for (var _e in nids) {
							db_coord.execute('DELETE FROM alerts WHERE location_nid=' + nids[_e]);
							db_coord.execute('DELETE FROM alert_names WHERE location_nid=' + nids[_e]);
							Ti.API.info('Deleted location nids: ' + nids[_e]);
						}
	
						for (var _k in _arr_content) {
							Ti.API.info(_arr_content[_k]);
							db_coord.execute(_arr_content[_k]);
						}
						db_coord.execute("COMMIT TRANSACTION");
						Ti.API.info('Finished inserting');
						db_coord.close();
						Ti.App.fireEvent('refresh_UI_Alerts', {status: 'success'});
						unset_GPS_uploading();
						var __timestamp  = Math.round(new Date().getTime() / 1000);
						createNotification("Uploaded Coordinates at "+date('h:i a', Number(__timestamp)));
					}
				}
				//Connection error:
				objectsCheck.onerror = function(e) {
					var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', db_coord_name);
					if(PLATFORM != 'android'){db_coord.file.setRemoteBackup(false);}
					db_coord.execute("UPDATE user_location SET status =\"notUploaded\"");
					Ti.API.info("Error found for GPS uploading ");
					db_coord.close();
					Ti.App.fireEvent('refresh_UI_Alerts', {status: 'fail'});
					unset_GPS_uploading();
				}
				//Sending information and try to connect
				objectsCheck.send(json_coord);
			} else {
				unset_GPS_uploading();
				Ti.API.info('We are offline');
			}
		} else {
			unset_GPS_uploading();
			Ti.API.info('No GPS coordinates found');
			result.close();
			db_coord.close();
		}
	}
	else{
		Ti.API.info("##### There are locations being updated already #####");
	}
};

var message_center = {};
var win = {};
win.is_opened = false;
var listTableView;
var search;
var empty;
var accountMessage = {};
accountMessage.win = {};
accountMessage.search = null;
accountMessage.listView = null;
accountMessage.win.isOpened = false;
var actIndAlert;


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
	search = Ti.UI.createSearchBar({
		hintText : 'Search...',
		autocorrect : false,
		barColor : '#000'
	});		

	//Contat list container
	listTableView = Titanium.UI.createTableView({
		top : '0',
		bottom: '0',
		search : search,
		separatorColor: '#BDBDBD',
		backgroundColor: '#fff'
	});
	win.add(listTableView);
	
	empty = Titanium.UI.createLabel({
				height : 'auto',
				width : 'auto',
				top : '50%',
				color: '#000',
				text : 'You have no messages'
			});
	win.add(empty);
	
	actIndAlert = Ti.UI.createActivityIndicator({
		message: 'Please wait..',
		color: '#fff'
	});
	win.add(actIndAlert);
		
	//When back button on the phone is pressed, it opens mainMenu.js and close the current window
	win.addEventListener('android:back', function() {
		//Enable background updates
		win.is_opened = false;
		unsetUse();	
		win.close();
	});
	
	win.addEventListener('close', function(){
		win.is_opened = false;
	});
	
	win.addEventListener('open', function(){
		win.is_opened = true;
		_upload_gps_locations();
	});

	listTableView.addEventListener('focus', function(e) {
				search.blur();
			});
			
	search.addEventListener('return', function(e) {
		search.blur();
	});
	
	search.addEventListener('cancel', function(e) {
		search.blur();
	});

	//When the user clicks on a certain contact, it opens individual_contact.js
	listTableView.addEventListener('click', function(e) {
		if(e.row!=null){
			opnAccountAlertsList(e);
		}
	});

	if(PLATFORM == 'android') {
		alertNavButtons_android(listTableView, win)
		bottomBack_release(win, "Back", "enable");
	} else {
		alertNavButtons(listTableView, win);
	}

	return win;
}
var listTableView = null;

message_center.loadUI = function() {
	win.is_opened = true;
	loadData();
}

//message_center.loadUI = function() {
Ti.App.addEventListener('refresh_UI_Alerts', function(e){
	if (win && win.is_opened === true){
		actIndAlert.hide();
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
		unsetUse();	
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
	
	var refresh_image = Ti.UI.createImageView({
		image: '/images/refresh.png',
		right: '9dp',
		width: '32dp',
		height: 'auto'
	});	
	refresh_image.addEventListener('click', function(e){
		_upload_gps_locations();
	});
	
	// create and add toolbar
	var toolbar = Ti.UI.iOS.createToolbar({
		items:[back, space, label, space, refresh_image],
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
	
	var refresh_image = Ti.UI.createImageView({
		image: '/images/refresh.png',
		right: '9dp',
		width: '32dp',
		height: 'auto'
	});	
	refresh_image.addEventListener('click', function(e){
		actIndAlert.show();
		_upload_gps_locations();
	});
	
	baseHeader.add(label);
	baseHeader.add(refresh_image);
	win.add(baseHeader);
}

function loadData(){
		var db = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS" );
		if(PLATFORM != 'android'){db.file.setRemoteBackup(false);}
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
			for (var b in obj_cnt){
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
			
		}else { //Shows the messages
			for (var x in obj_cnt){
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
			search.blur();
			win.addEventListener('focus', function(){
				setTimeout(function(){
					search.blur();
				}, 110 );
			});
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
	accountMessage.search = Ti.UI.createSearchBar({
		hintText : 'Search...',
		autocorrect : false,
		barColor : '#000'
	});

	//Contat list container
	accountMessage.listView = Titanium.UI.createTableView({
		top : '0',
		bottom: '0',
		search : accountMessage.search,
		separatorColor : '#BDBDBD',
		backgroundColor : '#fff'
	});
	accountMessage.win.add(accountMessage.listView);
	accountMessage.listView.addEventListener('click', function(e) {
			accountMessage.search.blur();
			var a_db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
			if(PLATFORM != 'android'){a_db.file.setRemoteBackup(false);}
			var a_res = a_db.execute("SELECT * FROM node WHERE nid=" + e.row.nid);
			var n_nid = e.row.nid;
			var type_vl = a_res.fieldByName('table_name');
			var region_f = a_res.fieldByName('form_part');
			var name_s = a_res.fieldByName('title');
			a_db.close();

			var a_msg = Titanium.UI.createAlertDialog({
				title : 'Omadi - ' + type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
				buttonNames : ['Close', 'See Node'],
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
					Ti.API.info('Opening node if it exists');
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

					search.blur();
					//hide keyboard

					//Passing parameters
					win_new.picked = win.picked;
					win_new.nid = n_nid;
					win_new.nameSelected = name_s
					db_t.close();

					//Avoiding memory leaking
					win_new.open();
				}
			});
	});
	
	accountMessage.listView.addEventListener('focus', function(e) {
		accountMessage.search.blur();
	});

	accountMessage.search.addEventListener('return', function(e) {
		accountMessage.search.blur();
	});

	accountMessage.search.addEventListener('cancel', function(e) {
		accountMessage.search.blur();
	}); 

	if(PLATFORM == 'android') {
		alertNavButtons_android(accountMessage.listView, accountMessage.win, accountMessage.win.title);
		bottomBack_release(accountMessage.win, "Back", "enable");
	} else {
		alertNavButtons(accountMessage.listView, accountMessage.win, accountMessage.win.title);
	}
	accountMessage.win.addEventListener('android:back', function() {
		accountMessage.win.close();
	});
	
	accountMessage.win.addEventListener('close', function(e){
		accountMessage.win.isOpened = false;
	});
	
	accountMessage.win.addEventListener('focus', function() {
		setTimeout(function() {
			accountMessage.search.blur();
		}, 110);
	}); 

	accountMessage.win.open();
	if(PLATFORM == 'android'){
		Ti.UI.Android.hideSoftKeyboard();
	}
	loadAccAlertData();
}

function loadAccAlertData(){
	var db_t = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName() + "_GPS");
	if(PLATFORM != 'android'){db_t.file.setRemoteBackup(false);}
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
