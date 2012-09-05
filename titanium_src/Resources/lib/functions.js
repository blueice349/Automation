/**
 * Name: functions.js
 * Provides:
 * 		Functions used by the app
 * @author Joseandro
 */

Ti.include('/lib/encoder_base_64.js');

var DOWNLOAD_URL_THUMBNAIL = '/sync/image/thumbnail/';
var DOWNLOAD_URL_IMAGE_FILE = '/sync/file/';
var PLATFORM = Ti.Platform.name;
var NUMBER_FORMAT_CURRENCY = 'currency';
var NUMBER_FORMAT_INTEGER = 'integer';
var NUMBER_FORMAT_DECIMAL_0 = 'one decimal';
var NUMBER_FORMAT_DECIMAL_00 = 'two decimal';
var NUMBER_FORMAT_DECIMAL_000 = 'three decimal';
var ROLE_ID_ADMIN = 3;
var app_timestamp = 0;
var omadi_time_format = Ti.App.Properties.getString("Omadi_time_format", 'g:iA');

var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

function getDBName() {
	var db_list = Ti.Database.install('/database/db_list.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_list");
	var portal_base = db_list.execute('SELECT db_name FROM history WHERE id_hist=1');
	var recebe = portal_base.fieldByName('db_name');
	portal_base.close();
	db_list.close();
	Ti.API.info("DB NAME: " + recebe);
	return recebe;
}

function notifyIOS(msg, update_time) {
	if (update_time === true){
		var time = Math.round(new Date().getTime() / 1000);
		Ti.App.Properties.setString("last_alert_popup", time);
	}
	
	var slide_it_top = Titanium.UI.createAnimation();
	slide_it_top.top = 0; // to put it back to the left side of the window
    slide_it_top.duration = 400;
	var win = Titanium.UI.createWindow({
		height : "50dp",
		width : "100%",
		top : "-50dp",
		zIndex: -1000
	});

	var view = Titanium.UI.createView({
		backgroundColor : '#000',
		opacity : 0.8,
		height : "100%",
		zIndex: -1000
	});

	var label = Titanium.UI.createLabel({
		color : '#fff',
		font : {
			fontSize : 13
		},
		textAlign : 'center',
		width : '100%',
		height : '100%'
	});
	win.add(view);
	win.add(label);

	label.text = msg;
	win.open(slide_it_top);
	
	setTimeout(function() {
		var slide_it_out = Titanium.UI.createAnimation();
		slide_it_out.top = "-50dp"; // to put it back to the left side of the window
    	slide_it_out.duration = 400;
		win.close(slide_it_out);
	}, 2500);
	
}

function showIndicator(show) {
	indWin = Titanium.UI.createWindow({
		title : 'Omadi CRM',
		fullscreen : false,
		backgroundColor : '#000'
	});

	// black view
	var indView = Titanium.UI.createView({
		height : '32%',
		width : '70%',
		backgroundColor : '#000',
		borderRadius : 10,
		opacity : 0.9
	});

	indWin.add(indView);

	// loading indicator
	actIndFun = Titanium.UI.createActivityIndicator({
		height : '7%',
		message : (PLATFORM == 'android') ? show : '',
		width : '30%',
		color : '#fff'
	});

	indWin.add(actIndFun);
	// message
	var message = Titanium.UI.createLabel({
		text : 'Communicating with' + '\n' + 'the server...',
		color : '#fff',
		width : 'auto',
		height : 'auto',
		textAlign : 'center',
		font : {
			fontFamily : 'Helvetica Neue',
			fontWeight : 'bold'
		},
		top : '67%'
	});
	indWin.add(message);

	indWin.orientationModes = [Titanium.UI.PORTRAIT];
	indWin.open();
	actIndFun.show();
};

//
// The progress bar for every install/update
//
// 1st param : sets the first value of the progress bar (instance of this object)
// 2nd param : Maximum the progress bar can reach
//

function Progress_install(current, max) {
	this.current = current;
	this.max = max;

	var a1 = Titanium.UI.createAnimation();
	a1.top = -1 * Ti.Platform.displayCaps.platformHeight * 0.14;
	a1.duration = 1000;

	var a2 = Titanium.UI.createAnimation();
	a2.top = 0;
	a2.duration = 1000;

	// black view
	var indView = Titanium.UI.createView({
		height : '50dp',
		width : '100%',
		backgroundColor : '#111',
		opacity : 1,
		top : -1 * Ti.Platform.displayCaps.platformHeight * 0.14
	});

	Ti.UI.currentWindow.add(indView);

	//If bar is not hiding change this to be incorporated at mainMenu.js
	loggedView.animate(a1);

	setTimeout(function() {
		indView.animate(a2);
	}, 500);

	var pb_download = Titanium.UI.createProgressBar({
		width : "70%",
		min : 0,
		max : 1,
		top : '5%',
		value : 0,
		color : '#fff',
		message : 'Downloading ...',
		style : (PLATFORM != 'android') ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : '',
	});

	var pb_install = Titanium.UI.createProgressBar({
		width : "70%",
		min : 0,
		max : 100,
		top : '5%',
		value : 0,
		color : '#fff',
		message : 'Installing ...',
		style : (PLATFORM != 'android') ? Titanium.UI.iPhone.ProgressBarStyle.PLAIN : '',
	});

	indView.add(pb_download);
	pb_download.show();

	pb_download.value = 0;
	pb_install.value = this.current;

	this.set_max = function(value) {
		indView.remove(pb_download);
		indView.add(pb_install);
		pb_install.show();
		this.max = value;
		Ti.API.info("Changed max");
	}

	this.set = function() {
		this.current++;

		if (this.max <= 0) {
			pb_install.value = 100;
		} else {
			//Only one page case
			if ((this.current == 0) && (this.max == 1)) {
				pb_install.value = 50;
			} else {
				var perc = parseInt((this.current * 100 ) / this.max);
				pb_install.value = perc;
			}
		}
	}

	this.set_download = function(_value) {
		pb_download.value = _value;
	}

	this.close = function() {
		indView.animate(a1);
		setTimeout(function() {
			Ti.UI.currentWindow.remove(indView);
			loggedView.animate(a2);
		}, 700);
	}
}

function showIndicatorDelete(inform) {
	Titanium.App.Properties.setBool("indicatorActive", true);

	// window container

	indWin = Titanium.UI.createWindow({
		title : 'Omadi CRM',
		modal : true,
		opacity : 0.9,
		backgroundColor : '#000000'
	});

	// black view
	var indView = Titanium.UI.createView({
		height : '32%',
		width : '70%',
		backgroundColor : '#000',
		borderRadius : 10,
		opacity : 0.9
	});

	indWin.add(indView);

	// loading indicator
	actIndFun = Titanium.UI.createActivityIndicator({
		height : '7%',
		message : "Logging you in",
		width : '30%'
	});

	indWin.add(actIndFun);

	// message
	var message = Titanium.UI.createLabel({
		text : inform,
		color : '#fff',
		width : 'auto',
		height : 'auto',
		textAlign : 'center',
		font : {
			fontFamily : 'Helvetica Neue',
			fontWeight : 'bold'
		},
		top : '67%'
	});
	indWin.add(message);

	indWin.orientationModes = [Titanium.UI.PORTRAIT];
	indWin.open();
	actIndFun.show();
};

/* Function Name: hideIndicator()
 * Purpouse: Close the loading screen
 * Parameters: none
 * Variables:
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	actIndFun:  Activity indicator.
 *
 */

function hideIndicator() {
	actIndFun.hide();
	indWin.close();
};

function hideIndicatorFistPage() {
	setInterval(function() {
		if (Titanium.App.Properties.getBool("isFirstPage")) {
			actIndFun.hide();
			Titanium.App.Properties.setBool("indicatorActive", false);
			indWin.close();
		}
	}, 1000);
};

/* Function Name: sortTableView( a, b)
 * Purpouse: Sort arrays
 * Parameters:
 * 	a:   Previous object in the array.
 *  b: 	 Next object in the array.
 * Variables: none
 *
 */

function sortTableView(a, b) {
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	// a must be equal to b
	return 0;
};

/* Function Name: (actualWindow, goToWindow )
 * Purpouse: Show button Back at the bottom and close actualWindow and go to goToWindow
 * Parameters:
 * 	actualWindow:   The windows where the function was called from.
 *  goToWindow: 	The target window (The window where the user is gonna be redirected)
 * Variables:
 *  backView:		The bottom button
 *  label_bottom:   Label "Back"
 */
function showBottom(actualWindow, goToWindow) {
	var backView = Titanium.UI.createView({
		top : '95%',
		backgroundColor : '#111',
		height : '6%',
		width : '100%',
		opacity : 0.99,
		borderRadius : 5
	});

	var label_bottom = Titanium.UI.createLabel({
		color : '#FFFFFF',
		text : 'Back',
		textAlign : 'center',
		height : 'auto'
	});

	backView.add(label_bottom);

	backView.addEventListener('click', function() {
		if (!goToWindow.notOpen) {
			goToWindow.log = actualWindow.log;
			goToWindow.picked = actualWindow.picked;
			goToWindow.result = actualWindow.result;
			goToWindow.name = actualWindow.name;
		}

		if ((actualWindow.returnTo == "individual_contact.js") || (actualWindow.returnTo == "individual_potential.js")) {
			goToWindow.nid = actualWindow.nidToReturn;
			goToWindow.nameSelected = actualWindow.nameToReturn;
		}

		//Avoiding memory leaking problems:
		if (!goToWindow.notOpen)
			goToWindow.open();

		actualWindow.close();
	});
	actualWindow.add(backView);
};

function bottomBack(actualWindow, text, method, unset) {
	var backView = Titanium.UI.createView({
		top : '95%',
		backgroundColor : '#111',
		height : '6%',
		width : '100%',
		opacity : 0.99,
		borderRadius : 5
	});

	if (text) {
		var label_bottom = Titanium.UI.createLabel({
			color : '#FFFFFF',
			text : text,
			textAlign : 'center',
			height : 'auto'
		});
	} else {
		var label_bottom = Titanium.UI.createLabel({
			color : '#FFFFFF',
			text : 'Back',
			textAlign : 'center',
			height : 'auto'
		});
	}
	backView.add(label_bottom);

	backView.addEventListener('click', function() {
		if (unset === true) {
			unsetUse();
		}
		actualWindow.close();
	});
	actualWindow.add(backView);
};

function bottomBack_release(actualWindow, text, method) {
	var backView = Titanium.UI.createView({
		top : '95%',
		backgroundColor : '#111',
		height : '6%',
		width : '100%',
		opacity : 0.99,
		borderRadius : 5
	});

	if (text) {
		var label_bottom = Titanium.UI.createLabel({
			color : '#FFFFFF',
			text : text,
			textAlign : 'center',
			height : 'auto'
		});
	} else {
		var label_bottom = Titanium.UI.createLabel({
			color : '#FFFFFF',
			text : 'Back',
			textAlign : 'center',
			height : 'auto'
		});
	}
	backView.add(label_bottom);

	backView.addEventListener('click', function() {
		unsetUse();
		actualWindow.close();
	});
	actualWindow.add(backView);
};

//
//Check type at field table
// Return values
// 0 => It is a number
// 1 => It is text
//

function check_type(name, object) {
	var db_type = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	var qRes = db_type.execute("SELECT DISTINCT type FROM fields WHERE field_name=? AND bundle=?", name, object);

	if (qRes.isValidRow()) {
		switch(qRes.fieldByName("type")) {
			case "number_integer":
				type = 0
				break;

			case "number_decimal":
				type = 0;
				break;

			default:
				type = 1;
				break;
		}
	} else {
		Ti.API.info("Field type not found!!");
		//Treat as text!
		type = 1;
	}
	qRes.close();
	db_type.close();

	return type;
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function treatArray(num_to_insert, call_id) {

	// Insert array in a better way?
	// Optimization matters!
	// data separator

	var separator = 'j8Oc2s1E';
	var content_s = '';
	var array_size = num_to_insert.length;

	var test1 = 0;
	var test2 = 0;
	var count_a = 0;

	if (array_size == 0) {
		//Pack everything
		var content_s = Base64.encode("null");
		return content_s;
	} else if (array_size == 1) {
		//Pack everything
		//Ti.API.info(num_to_insert[0]);
		if (num_to_insert[0] != null) {
			var content_s = Base64.encode(num_to_insert[0]);
		} else {
			var content_s = Base64.encode("null");
		}
		return content_s;
	} else {
		for (var key in num_to_insert) {
			count_a++;
			if (count_a < array_size) {
				content_s += num_to_insert[key] + '' + separator;
				test1++;
			} else if (count_a == array_size) {
				content_s += num_to_insert[key] + '';
				test2++;
			}
		}

		//Checking test:
		if ((test1 < 1) || (test2 != 1)) {
			Ti.API.info('@Developer, check arrays insertion! _' + call_id);
			var blah = num_to_insert instanceof Array;
			Ti.API.info('This is the original array-size: ' + num_to_insert.length + ' is this an array? ' + blah);
			for (var key in num_to_insert) {
				Ti.API.info('For value ' + key + ' in array we got ' + num_to_insert[key]);
			}
		}

		//Pack everything
		content_s = Base64.encode(content_s);

		return content_s;
	}
}

//
// Function's signature : process_object(json,obj)
// Purpouse: Insert, update and delete objects such as contact, potential, account and lead
// Parameters:
//		json: Receveid answer from API's request.
//		obj: Name of the object (contact/potential/account/lead)
// Returns: An empty return to callback the parent's action.
//

function process_object(json, obj, f_marks, progress, type_request, db_process_object) {
	var deploy = db_process_object.execute('SELECT field_name, type FROM fields WHERE bundle = "' + obj + '"');
	var col_titles = [];
	var col_type = [];
	var ind_column = 0;
	while (deploy.isValidRow()) {
		col_titles[ind_column] = deploy.fieldByName('field_name');
		col_type[ind_column] = deploy.fieldByName('type');
		ind_column++;
		deploy.next();
	}
	deploy.close();
	
	var process_obj = [];
	
	//Insert
	if (json[obj].insert) {
		
		if (type_request == 'POST'){
			if (json[obj].insert.length){
				Titanium.App.Properties.setString("new_node_id", json[obj].insert[0].nid);
			}
			else{
				Titanium.App.Properties.setString("new_node_id", json[obj].insert.nid); 
			}
		}
		//Multiple objects
		if (json[obj].insert.length) {

			for (var i = 0; i < json[obj].insert.length; i++) {
				if (progress != null) {
					//Increments Progress Bar
					progress.set();
				}
				// Original query
				var aux_column = ind_column;
				var query = "";

				//Insert into node table
				if ((json[obj].insert[i].title === null) || (json[obj].insert[i].title == 'undefined') || (json[obj].insert[i].title === false))
					json[obj].insert[i].title = "No Title";

				//'update' is a flag to decide whether the node needs to be synced to the server or not
				var no_data = '';
				if (!(json[obj].insert[i].no_data_fields instanceof Array)) {
					no_data = JSON.stringify(json[obj].insert[i].no_data_fields);
				}
				process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields ) VALUES ( ' + json[obj].insert[i].nid + ', ' + json[obj].insert[i].created + ' , ' + json[obj].insert[i].changed + ', "' + json[obj].insert[i].title.replace(/"/gi, "'") + '" , ' + json[obj].insert[i].author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert[i].form_part + ',' + json[obj].insert[i].changed_uid + ',\'' + no_data + '\') ';

				if (aux_column > 0) {
					query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
				}
				//This would happen only if table has no columns, shouldn't happen
				else {
					query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].insert[i].nid + ')';
				}

				while (aux_column > 0) {
					if (aux_column == 1) {
						query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].insert[i].nid + ', ';
					} else {
						query += ' \'' + col_titles[aux_column - 1] + '\', ';
					}
					aux_column--;
				}

				aux_column = ind_column;
				var mark = '';
				while (aux_column > 0) {
					var parse_api = col_titles[aux_column - 1];
					mark = '"';
					for (var i_index in f_marks) {
						if (i_index == parse_api) {
							for (var j_index in f_marks[i_index]) {
								if (j_index == obj) {
									mark = '';
								}
							}
						}
					}
					if (aux_column == 1) {
						if ((json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" )) {
							query += ' null )';
						} else {
							if (mark == '') {
								var num_to_insert = json[obj].insert[i][parse_api];

								if (isNumber(num_to_insert)) {
									query += ' ' + num_to_insert + ' )';
								} else if ( num_to_insert instanceof Array) {
									content_s = treatArray(num_to_insert, 1);

									// table structure:
									// incremental, node_id, field_name, value
									process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
									//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411176117105122
									query += ' 7411317618171051229 )';
								} else {
									//Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
									query += ' null )';
								}
							} else {
								if (json[obj].insert[i][parse_api] instanceof Array) {
									if (col_type[aux_column - 1] == 'rules_field') {
										query += ' \'' + JSON.stringify(json[obj].insert[i][parse_api]).replace(/'/gi, "\\\'") + '\' )';
									} else {
										content_s = treatArray(json[obj].insert[i][parse_api], 2);

										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
										//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' ' + mark + '7411317618171051229' + mark + ' )';

									}
								} else {
									query += ' ' + mark + '' + json[obj].insert[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
								}
							}
						}
					} else {
						if ((json[obj].insert[i][parse_api] == null ) || (json[obj].insert[i][parse_api] == "undefined" )) {
							query += ' null ,';
						} else {
							if (mark == '') {
								var num_to_insert = json[obj].insert[i][parse_api];

								if (isNumber(num_to_insert)) {
									query += ' ' + num_to_insert + ' ,';
								} else if ( num_to_insert instanceof Array) {
									//If we have only one object in array we don't need another table to help us out
									content_s = treatArray(num_to_insert, 3);

									// table structure:
									// incremental, node_id, field_name, value
									process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
									//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411176117105122
									query += ' 7411317618171051229 ,';
								} else {
									query += ' null ,';
								}
							} else {
								if (json[obj].insert[i][parse_api] instanceof Array) {
									if (col_type[aux_column - 1] == 'rules_field') {
										query += ' \'' + JSON.stringify(json[obj].insert[i][parse_api]).replace(/'/gi, "\\\'") + '\' ,';
									} else {
										content_s = treatArray(json[obj].insert[i][parse_api], 4);

										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
										//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert[i].nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' ' + mark + '7411317618171051229' + mark + ' ,';
									}
								} else {
									query += ' ' + mark + '' + json[obj].insert[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
								}
							}
						}
					}
					aux_column--;
				}
				//Inserts into object table
				process_obj[process_obj.length] = query;
				if (type_request == 'POST') {
					process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE nid=' + json[obj].insert[i].__negative_nid;
					process_obj[process_obj.length] = 'DELETE FROM node WHERE nid=' + json[obj].insert[i].__negative_nid;
				}

			}

		}
		//Only one object
		else {
			if (progress != null) {
				//Increments Progress Bar
				progress.set();
			}
			// Original query
			var aux_column = ind_column;
			var query = "";

			//Insert into node table
			if ((json[obj].insert.title === null) || (json[obj].insert.title == 'undefined') || (json[obj].insert.title === false))
				json[obj].insert.title = "No Title";

			//'update' is a flag to decide whether the node needs to be synced to the server or not
			var no_data = '';
			if (!(json[obj].insert.no_data_fields instanceof Array)) {
				no_data = JSON.stringify(json[obj].insert.no_data_fields);
			}
			process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields  ) VALUES ( ' + json[obj].insert.nid + ', ' + json[obj].insert.created + ' , ' + json[obj].insert.changed + ', "' + json[obj].insert.title.replace(/"/gi, "'") + '" , ' + json[obj].insert.author_uid + ' , 0 , "' + obj + '", ' + json[obj].insert.form_part + ',' + json[obj].insert.changed_uid + ',\'' + no_data + '\') ';

			if (aux_column > 0) {
				query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
			}
			//This would happen only if table has no columns, shouldn't happen
			else {
				query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].insert.nid + ')';
			}

			while (aux_column > 0) {
				if (aux_column == 1) {
					query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].insert.nid + ', ';
				} else {
					query += ' \'' + col_titles[aux_column - 1] + '\', ';
				}
				aux_column--;
			}

			aux_column = ind_column;
			var mark = '';
			while (aux_column > 0) {
				var parse_api = col_titles[aux_column - 1];
				mark = '"';
				for (var i_index in f_marks) {
					if (i_index == parse_api) {
						for (var j_index in f_marks[i_index]) {
							if (j_index == obj) {
								mark = '';
							}
						}
					}
				}
				if (aux_column == 1) {
					if ((json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" )) {
						query += ' null )';
					} else {
						if (mark == '') {
							var num_to_insert = json[obj].insert[parse_api];

							if (isNumber(num_to_insert)) {
								query += ' ' + num_to_insert + ' )';
							} else if ( num_to_insert instanceof Array) {
								content_s = treatArray(num_to_insert, 1);

								// table structure:
								// incremental, node_id, field_name, value
								process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
								//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

								// Code must to be a number since this database field accepts only integers numbers
								// Token to indentify array of numbers is 7411176117105122
								query += ' 7411317618171051229 )';
							} else {
								//Ti.API.info('Null ==> The value '+num_to_insert+' is a number? '+isNumber(num_to_insert) );
								query += ' null )';
							}
						} else {
							if (json[obj].insert[parse_api] instanceof Array) {
								if (col_type[aux_column - 1] == 'rules_field') {
									query += ' \'' + JSON.stringify(json[obj].insert[parse_api]).replace(/'/gi, "\\\'") + '\' )';
								} else {
									content_s = treatArray(json[obj].insert[parse_api], 2);

									// table structure:
									// incremental, node_id, field_name, value
									process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411176117105122
									query += ' ' + mark + '7411317618171051229' + mark + ' )';
								}
							} else {
								query += ' ' + mark + '' + json[obj].insert[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
							}
						}
					}
				} else {
					if ((json[obj].insert[parse_api] == null ) || (json[obj].insert[parse_api] == "undefined" )) {
						query += ' null ,';
					} else {
						if (mark == '') {
							var num_to_insert = json[obj].insert[parse_api];

							if (isNumber(num_to_insert)) {
								query += ' ' + num_to_insert + ' ,';
							} else if ( num_to_insert instanceof Array) {
								content_s = treatArray(num_to_insert, 3);

								// table structure:
								// incremental, node_id, field_name, value
								process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
								//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

								// Code must to be a number since this database field accepts only integers numbers
								// Token to indentify array of numbers is 7411176117105122
								query += ' 7411317618171051229 ,';
							} else {
								query += ' null ,';
							}
						} else {
							if (json[obj].insert[parse_api] instanceof Array) {
								if (col_type[aux_column - 1] == 'rules_field') {
									query += ' \'' + JSON.stringify(json[obj].insert[parse_api]).replace(/'/gi, "\\\'") + '\' ,';
								} else {

									content_s = treatArray(json[obj].insert[parse_api], 4);

									// table structure:
									// incremental, node_id, field_name, value
									process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].insert.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';
									//Ti.API.info('INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+json[obj].insert.nid+', \''+col_titles[aux_column-1] +'\',  \''+content_s+'\' )');

									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411176117105122
									query += ' ' + mark + '7411317618171051229' + mark + ' ,';
								}
							} else {
								query += ' ' + mark + '' + json[obj].insert[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
							}
						}
					}
				}
				aux_column--;
			}
			//Inserts into object table
			process_obj[process_obj.length] = query;
			if (type_request == 'POST') {
				process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE nid=' + json[obj].insert.__negative_nid;
				process_obj[process_obj.length] = 'DELETE FROM node WHERE nid=' + json[obj].insert.__negative_nid;
			}
		}
		//Ti.API.info("Inserted object [" + obj + "] sucefully!");
	}

	//Update Object
	//We use 'insert or replace' for updates in order to reuse the logic for inserts
	//If an updated field doesn't exists, the app is gonna create it avoiding errors returns
	//It will never freezes if a field that needs update isn't found in the database yet

	if (json[obj].update) {
		if (json[obj].update.length) {
			for (var i = 0; i < json[obj].update.length; i++) {
				if (progress != null) {
					//Increments Progress Bar
					progress.set();
				}
				// Original query
				var aux_column = ind_column;
				var query = "";

				//Insert into node table
				if ((json[obj].update[i].title === null) || (json[obj].update[i].title == 'undefined') || (json[obj].update[i].title === false))
					json[obj].update[i].title = "No Title";

				var no_data = '';
				if (!(json[obj].update[i].no_data_fields instanceof Array)) {
					no_data = JSON.stringify(json[obj].update[i].no_data_fields);
				}
				//'update' is a flag to decide whether the node needs to be synced to the server or not
				process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields ) VALUES ( ' + json[obj].update[i].nid + ', ' + json[obj].update[i].created + ' , ' + json[obj].update[i].changed + ', "' + json[obj].update[i].title.replace(/"/gi, "'") + '" , ' + json[obj].update[i].author_uid + ' , 0 , "' + obj + '", ' + json[obj].update[i].form_part + ', ' + json[obj].update[i].changed_uid + ',\'' + no_data + '\') ';

				if (aux_column > 0) {
					query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
				}
				//This would happen only if table has no columns, shouldn't happen
				else {
					query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].update[i].nid + ')';
				}

				while (aux_column > 0) {
					if (aux_column == 1) {
						query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].update[i].nid + ', ';
					} else {
						query += ' \'' + col_titles[aux_column - 1] + '\', ';
					}
					aux_column--;
				}

				aux_column = ind_column;
				var mark = '';
				while (aux_column > 0) {
					var parse_api = col_titles[aux_column - 1];
					mark = '"';
					for (var i_index in f_marks) {
						if (i_index == parse_api) {
							for (var j_index in f_marks[i_index]) {
								if (j_index == obj) {
									mark = '';
								}
							}
						}
					}
					if (aux_column == 1) {
						if ((json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" )) {
							query += ' null )';
						} else {
							if (mark == '') {
								var num_to_insert = json[obj].update[i][parse_api];

								if (isNumber(num_to_insert)) {
									query += ' ' + num_to_insert + ' )';
								} else if ( num_to_insert instanceof Array) {
									content_s = treatArray(num_to_insert, 1);

									var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\'');
									if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';

										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' 7411317618171051229 )';
									} else {
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' 7411317618171051229 )';
									}

									array_cont.close();
								} else {
									Ti.API.info('Null ==> The value ' + num_to_insert + ' is a number? ' + isNumber(num_to_insert));
									query += ' null )';
								}
							} else {
								if (json[obj].update[i][parse_api] instanceof Array) {
									if (col_type[aux_column - 1] == 'rules_field') {
										query += ' \'' + JSON.stringify(json[obj].update[i][parse_api]).replace(/'/gi, "\\\'") + '\' )';
									} else {
										content_s = treatArray(json[obj].update[i][parse_api], 2);
										var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
										if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
											// table structure:
											// incremental, node_id, field_name, value
											process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';

											// Code must to be a number since this database field accepts only integers numbers
											// Token to indentify array of numbers is 7411176117105122
											query += ' ' + mark + '7411317618171051229' + mark + ' )';
										} else {
											// table structure:
											// incremental, node_id, field_name, value
											process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

											// Code must to be a number since this database field accepts only integers numbers
											// Token to indentify array of numbers is 7411176117105122
											query += ' ' + mark + '7411317618171051229' + mark + ' )';
										}
										array_cont.close();
									}
								} else {
									query += ' ' + mark + '' + json[obj].update[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
								}
							}
						}
					} else {
						if ((json[obj].update[i][parse_api] == null ) || (json[obj].update[i][parse_api] == "undefined" )) {
							query += ' null ,';
						} else {
							if (mark == '') {
								var num_to_insert = json[obj].update[i][parse_api];

								if (isNumber(num_to_insert)) {
									query += ' ' + num_to_insert + ' ,';
								} else if ( num_to_insert instanceof Array) {
									content_s = treatArray(num_to_insert, 3);

									var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
									if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';

										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' 7411317618171051229 ,';
									} else {
										// table structure:
										// incremental, node_id, field_name, value
										process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

										// Code must to be a number since this database field accepts only integers numbers
										// Token to indentify array of numbers is 7411176117105122
										query += ' 7411317618171051229 ,';
									}
									array_cont.close();
								} else {
									query += ' null ,';
								}
							} else {
								if (json[obj].update[i][parse_api] instanceof Array) {
									if (col_type[aux_column - 1] == 'rules_field') {
										query += ' \'' + JSON.stringify(json[obj].update[i][parse_api]).replace(/'/gi, "\\\'") + '\' ,';
									} else {
										content_s = treatArray(json[obj].update[i][parse_api], 4);

										var array_cont = db_process_object.execute('SELECT * FROM array_base WHERE node_id = ' + json[obj].update[i].nid + ' AND field_name="' + col_titles[aux_column - 1] + '"');
										if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {

											// table structure:
											// incremental, node_id, field_name, value
											process_obj[process_obj.length] = 'UPDATE array_base SET encoded_array = \'' + content_s + '\' WHERE node_id=' + json[obj].update[i].nid + ' AND field_name=\'' + col_titles[aux_column - 1] + '\' ';

											// Code must to be a number since this database field accepts only integers numbers
											// Token to indentify array of numbers is 7411176117105122
											query += ' ' + mark + '7411317618171051229' + mark + ' ,';
										} else {
											// table structure:
											// incremental, node_id, field_name, value
											process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update[i].nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

											// Code must to be a number since this database field accepts only integers numbers
											// Token to indentify array of numbers is 7411176117105122
											query += ' ' + mark + '7411317618171051229' + mark + ' ,';
										}
										array_cont.close();
									}
								} else {
									query += ' ' + mark + '' + json[obj].update[i][parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
								}
							}
						}
					}
					aux_column--;
				}
				//Inserts into object table
				process_obj[process_obj.length] = query;
			}
		}
		//Only one object
		else {
			if (progress != null) {
				//Increments Progress Bar
				progress.set();
			}
			// Original query
			var aux_column = ind_column;
			var query = "";
			//Insert into node table
			if ((json[obj].update.title === null) || (json[obj].update.title == 'undefined') || (json[obj].update.title === false))
				json[obj].update.title = "No Title";

			var no_data = '';
			if (!(json[obj].update.no_data_fields instanceof Array)) {
				no_data = JSON.stringify(json[obj].update.no_data_fields);
			}
			//'update' is a flag to decide whether the node needs to be synced to the server or not
			process_obj[process_obj.length] = 'INSERT OR REPLACE INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part, changed_uid, no_data_fields ) VALUES ( ' + json[obj].update.nid + ', ' + json[obj].update.created + ' , ' + json[obj].update.changed + ', "' + json[obj].update.title.replace(/"/gi, "'") + '" , ' + json[obj].update.author_uid + ' , 0 , "' + obj + '", ' + json[obj].update.form_part + ', ' + json[obj].update.changed_uid + ',\'' + no_data + '\') ';

			if (aux_column > 0) {
				query = 'INSERT OR REPLACE  INTO ' + obj + ' (\'nid\', ';
			}
			//This would happen only if table has no columns, shouldn't happen
			else {
				query = 'INSERT OR REPLACE  INTO ' + obj + ' (nid) VALUES (' + json[obj].update.nid + ')';
			}

			while (aux_column > 0) {
				if (aux_column == 1) {
					query += ' \'' + col_titles[aux_column - 1] + '\') VALUES (' + json[obj].update.nid + ', ';
				} else {
					query += ' \'' + col_titles[aux_column - 1] + '\', ';
				}
				aux_column--;
			}

			aux_column = ind_column;
			var mark = '';
			while (aux_column > 0) {
				var parse_api = col_titles[aux_column - 1];
				mark = '"';
				for (var i_index in f_marks) {
					if (i_index == parse_api) {
						for (var j_index in f_marks[i_index]) {
							if (j_index == obj) {
								mark = '';
							}
						}
					}
				}
				if (aux_column == 1) {
					if ((json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" )) {
						query += ' null )';
					} else {
						if (mark == '') {
							var num_to_insert = json[obj].update[parse_api];

							if (isNumber(num_to_insert)) {
								query += ' ' + num_to_insert + ' )';
							} else if ( num_to_insert instanceof Array) {
								content_s = treatArray(num_to_insert, 1);

								// table structure:
								// incremental, node_id, field_name, value
								process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

								// Code must to be a number since this database field accepts only integers numbers
								// Token to indentify array of numbers is 7411176117105122
								query += ' 7411317618171051229 )';

							} else {
								Ti.API.info('Null ==> The value ' + num_to_insert + ' is a number? ' + isNumber(num_to_insert));
								query += ' null )';
							}
						} else {
							if (json[obj].update[parse_api] instanceof Array) {
								if (col_type[aux_column - 1] == 'rules_field') {
									query += ' \'' + JSON.stringify(json[obj].update[parse_api]).replace(/'/gi, "\\\'") + '\' )';
								} else {
									content_s = treatArray(json[obj].update[parse_api], 2);

									// table structure:
									// incremental, node_id, field_name, value
									process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411176117105122
									query += ' ' + mark + '7411317618171051229' + mark + ' )';
								}
							} else {
								query += ' ' + mark + '' + json[obj].update[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' )';
							}
						}
					}
				} else {
					if ((json[obj].update[parse_api] == null ) || (json[obj].update[parse_api] == "undefined" )) {
						query += ' null ,';
					} else {
						if (mark == '') {
							var num_to_insert = json[obj].update[parse_api];

							if (isNumber(num_to_insert)) {
								query += ' ' + num_to_insert + ' ,';
							} else if ( num_to_insert instanceof Array) {
								content_s = treatArray(num_to_insert, 3);

								// table structure:
								// incremental, node_id, field_name, value
								process_obj[process_obj.length] = 'INSERT OR REPLACE  INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

								// Code must to be a number since this database field accepts only integers numbers
								// Token to indentify array of numbers is 7411176117105122
								query += ' 7411317618171051229 ,';
							} else {
								query += ' null ,';
							}
						} else {
							if (json[obj].update[parse_api] instanceof Array) {
								if (col_type[aux_column - 1] == 'rules_field') {
									query += ' \'' + JSON.stringify(json[obj].update[parse_api]).replace(/'/gi, "\\\'") + '\' ,';
								} else {
									content_s = treatArray(json[obj].update[parse_api], 4);

									// table structure:
									// incremental, node_id, field_name, value
									process_obj[process_obj.length] = 'INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + json[obj].update.nid + ', \'' + col_titles[aux_column - 1] + '\',  \'' + content_s + '\' )';

									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411176117105122
									query += ' ' + mark + '7411317618171051229' + mark + ' ,';
								}
							} else {
								query += ' ' + mark + '' + json[obj].update[parse_api].toString().replace(/"/gi, "'") + '' + mark + ' ,';
							}
						}
					}
				}
				aux_column--;
			}
			//Inserts into object table
			process_obj[process_obj.length] = query;
		}
		//Ti.API.info("Updated object [" + obj + "] sucefully!");
	}

	//Delete
	if (json[obj]["delete"]) {
		if (json[obj]["delete"].length) {
			for (var i = 0; i < json[obj]["delete"].length; i++) {
				if (progress != null) {
					//Increments Progress Bar
					progress.set();
				}
				//Deletes from object's table
				process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE "nid"=' + json[obj]["delete"][i].nid;
				//Deletes from node table
				process_obj[process_obj.length] = 'DELETE FROM node WHERE "nid"=' + json[obj]["delete"][i].nid;
			}
		} else {
			if (progress != null) {
				//Increments Progress Bar
				progress.set();
			}
			//Deletes from object's table
			process_obj[process_obj.length] = 'DELETE FROM ' + obj + ' WHERE "nid"=' + json[obj]["delete"].nid;

			//Deletes from node table
			process_obj[process_obj.length] = 'DELETE FROM node WHERE "nid"=' + json[obj]["delete"].nid;
		}
		//Ti.API.info("Deleted object [" + obj + "] sucefully!");
	}

	Ti.API.info('########## CRITICAL STEP ##########');

	var iObj = 0;
	var iStart = Math.round(new Date().getTime() / 1000);
	Ti.API.info("Objects started at : " + iStart);

	db_process_object.execute("BEGIN IMMEDIATE TRANSACTION");
	while (iObj <= process_obj.length - 1) {
		db_process_object.execute(process_obj[iObj]);
		iObj++;
	}
	db_process_object.execute("COMMIT TRANSACTION");

	var iEnd = Math.round(new Date().getTime() / 1000);
	Ti.API.info("Object finishes at : " + iEnd);

	var iResult = iEnd - iStart;
	Ti.API.info('Object seconds: ' + iResult);
	//db_process_object.close();
	return;
}

////////////////////////////////////////////////
// Gets the JSON for updated nodes
////////////////////////////////////////////////

function getJSON() {
	//Initial JSON values:
	var current_timestamp = Math.round(+new Date() / 1000);
	var returning_json = '{ "timestamp" : "' + current_timestamp + '", "data" : { ';
	var db_json = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

	//=============================
	//Builds JSON for new nodes and for nodes that were updated
	//=============================
	var new_nodes = db_json.execute('SELECT * FROM node WHERE flag_is_updated=1 ORDER BY nid DESC');
	//Ti.API.info('Lets update the node :'+new_nodes.fieldByName('nid'));
	if (new_nodes.rowCount > 0) {
		returning_json += '"node":{ ';
		while (new_nodes.isValidRow()) {
			Ti.API.info('NODE ' + new_nodes.fieldByName('nid') + ' -----JSON BEING CREATED-----');
			var selected_node = db_json.execute('SELECT * FROM ' + new_nodes.fieldByName('table_name') + ' WHERE nid = ' + new_nodes.fieldByName('nid'));
			var node_fields = db_json.execute('SELECT * FROM fields WHERE bundle = "' + new_nodes.fieldByName('table_name') + '"');
			var type = db_json.execute('SELECT display_name, bundle_name FROM bundles WHERE bundle_name = "' + node_fields.fieldByName('bundle') + '"');
			var type_string = type.fieldByName('bundle_name');

			var no_data_string = '""';
			if (new_nodes.fieldByName("no_data_fields") != null && new_nodes.fieldByName("no_data_fields") != "") {
				no_data_string = new_nodes.fieldByName("no_data_fields");
			}
			if (new_nodes.fieldByName('nid') < 0) {
				returning_json += '"' + new_nodes.fieldByName('nid') + '":{ "created":"' + new_nodes.fieldByName('created') + '", "nid":"' + new_nodes.fieldByName('nid') + '", "type":"' + type_string.toLowerCase() + '", "form_part":"' + new_nodes.fieldByName("form_part") + '", "no_data_fields":' + no_data_string;
			} else {
				returning_json += '"' + new_nodes.fieldByName('nid') + '":{ "changed":"' + new_nodes.fieldByName('changed') + '", "nid":"' + new_nodes.fieldByName('nid') + '", "type":"' + type_string.toLowerCase() + '", "form_part":"' + new_nodes.fieldByName("form_part") + '", "no_data_fields":' + no_data_string;
			}
			Ti.API.info(returning_json);
			Ti.API.info('1');
			while (node_fields.isValidRow()) {
				Ti.API.info('2');
				if ((selected_node.rowCount > 0) && (selected_node.fieldByName(node_fields.fieldByName('field_name')) != null) && (selected_node.fieldByName(node_fields.fieldByName('field_name')) != '')) {
					Ti.API.info('3');
					if (selected_node.fieldByName(node_fields.fieldByName('field_name')) == 7411317618171051229) {
						Ti.API.info('4');
						var array_cont = db_json.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + new_nodes.fieldByName('nid') + ' AND field_name = \'' + node_fields.fieldByName('field_name') + '\'');
						Ti.API.info('5');
						if ((array_cont.rowCount > 0) || (array_cont.isValidRow())) {
							//Decode the stored array:
							Ti.API.info('6');
							var a_decoded = array_cont.fieldByName('encoded_array');
							Ti.API.info('7 '+a_decoded);
							//TODO: Fix the decoded value:
							//decoded = Titanium.Utils.base64decode(decoded);
							var decoded = Base64.decode(a_decoded);
							Ti.API.info('8 '+decoded);
							Ti.API.info('Decoded array is equals to: ' + decoded);
							Ti.API.info('9');
							decoded = decoded.toString();
							Ti.API.info('10');
							// Token that splits each element contained into the array: 'j8Oc2s1E'
							var decoded_values = decoded.split("j8Oc2s1E");
							Ti.API.info('11 '+decoded_values);
							if (node_fields.fieldByName('field_name').indexOf('photo') != -1){
								if (decoded_values.length){
									if (decoded_values.length == 1){
										if (decoded_values[0] == null || decoded_values[0] == "null" || decoded_values[0] == "" || isNumber(decoded_values[0]) === false){
											Ti.API.info('Nothing to add, pictures not taken');
										}
										else{
											returning_json += ', "' + node_fields.fieldByName('field_name') + '": [ \"' + decoded_values.join("\" , \"") + '\" ] ';
										}
									}
									else{
										var cp_decoded_values = decoded_values.slice();
										for (var y in decoded_values){
											if (decoded_values[y] == null || decoded_values[y] == "null" || decoded_values[y] == "" || isNumber(decoded_values[y]) === false){
												cp_decoded_values.splice(y,1);
											}
										}
										returning_json += ', "' + node_fields.fieldByName('field_name') + '": [ \"' + cp_decoded_values.join("\" , \"") + '\" ] ';
									}
								}
								else{
									Ti.API.info('Nothing to add, pictures do not exit');
								}
							}
							else{
								returning_json += ', "' + node_fields.fieldByName('field_name') + '": [ \"' + decoded_values.join("\" , \"") + '\" ] ';								
							}

							Ti.API.info('11.1 '+returning_json);
						} else {
							Ti.API.info('12');
							if (node_fields.fieldByName('field_name').indexOf('photo') != -1){
								if ( selected_node.fieldByName(node_fields.fieldByName('field_name')) == null || selected_node.fieldByName(node_fields.fieldByName('field_name'))== "null" || selected_node.fieldByName(node_fields.fieldByName('field_name')) == "" || isNumber( selected_node.fieldByName(node_fields.fieldByName('field_name'))) === false){
									Ti.API.info('Nothing to add, pictures not taken');
								}
								else{
									returning_json += ', "' + node_fields.fieldByName('field_name') + '": "' + selected_node.fieldByName(node_fields.fieldByName('field_name')) + '"';
								}
							}
							else{
								returning_json += ', "' + node_fields.fieldByName('field_name') + '": "' + selected_node.fieldByName(node_fields.fieldByName('field_name')) + '"';
							}
							//returning_json += ', "' + node_fields.fieldByName('field_name') + '": "' + selected_node.fieldByName(node_fields.fieldByName('field_name')) + '"';
							Ti.API.info('13 PRE_JSON: ' + returning_json);
						}
						array_cont.close();
					} else {
						Ti.API.info('14');
						if (node_fields.fieldByName('type') == 'rules_field') {
							Ti.API.info('15');
							returning_json += ', "' + node_fields.fieldByName('field_name') + '": ' + selected_node.fieldByName(node_fields.fieldByName('field_name'));
							Ti.API.info('16 PRE_JSON: ' + returning_json);
						} else {
							Ti.API.info('17');
							returning_json += ', "' + node_fields.fieldByName('field_name') + '": "' + selected_node.fieldByName(node_fields.fieldByName('field_name')) + '" ';
							Ti.API.info('18 PRE_JSON: ' + returning_json);
						}
					}
				}
				node_fields.next();
			}
			returning_json += ' } ';
			Ti.API.info('19 PRE_JSON: ' + returning_json);
			//Next node
			new_nodes.next();
			if (new_nodes.isValidRow()) {
				returning_json += ', ';
			}
		}
		//close 'node'
		returning_json += '} ';
		selected_node.close();
		node_fields.close();
		type.close();

		//=============================
		//Builds JSON for new terms
		//=============================
		var new_terms = db_json.execute('SELECT * FROM term_data WHERE tid < 0 ORDER BY tid DESC');
		//Ti.API.info('Lets update the terms :'+new_terms.fieldByName('tid'));
		Ti.API.info('20');
		if (new_terms.rowCount > 0) {
			Ti.API.info('21');
			returning_json += ',"term":{ ';
			while (new_terms.isValidRow()) {
				Ti.API.info('22');
				Ti.API.info('TERM ' + new_terms.fieldByName('tid') + ' -----JSON BEING CREATED-----');
				var vocabulary = db_json.execute('SELECT * FROM vocabulary WHERE vid = ' + new_terms.fieldByName('vid'));
				returning_json += '"' + new_terms.fieldByName('tid') + '":{ "created":"' + new_terms.fieldByName('created') + '", "tid":"' + new_terms.fieldByName('tid') + '", "machine_name":"' + vocabulary.fieldByName('machine_name') + '", "name":"' + new_terms.fieldByName('name') + '"  }';
				//Next term
				new_terms.next();
				if (new_terms.isValidRow()) {
					returning_json += ', ';
				}
			}
			//close 'term'
			returning_json += '} ';
		}
		// close data and timestamp:
		returning_json += ' } }';

		Ti.API.info(returning_json);

		//Close db connections and result set
		new_nodes.close();
		new_terms.close();
		db_json.close();
		return returning_json;
	}
}

function isJsonString(str) {
	if (str == "" || str == null) {
		return false;
	} else {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
	}
	return true;
}

//Install new updates using pagination
//Load existing data with pagination
function installMe(pageIndex, win, timeIndex, progress, menu, img, type_request, mode, close_parent, _node_name) {
	setUse();
	var db_installMe = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

	var objectsUp = Ti.Network.createHTTPClient();
	Ti.API.info('Log type : ' + objectsUp);

	//Timeout until error:
	objectsUp.setTimeout(15000);

	Ti.API.info("Current page: " + pageIndex);
	Ti.API.info("Mode: " + mode);
	Ti.API.info("Menu: " + menu);
	Ti.API.info("TIME: " + timeIndex);
	Ti.API.info("Type: " + type_request);

	//While streamming - following method should be called b4 open URL
	objectsUp.ondatastream = function(e) {
		//ind.value = e.progress ;
		if (progress != null) {
			progress.set_download(e.progress);
			Ti.API.info(' ONDATASTREAM1 - PROGRESS: ' + e.progress);
		}
	}
	if (type_request == 'POST') {
		objectsUp.open('POST', win.picked + '/js-sync/sync.json');
	} else {
		//Opens address to retrieve list
		Ti.API.info('GET, ' + win.picked + '/js-sync/download.json?sync_timestamp=' + timeIndex);
		objectsUp.open('GET', win.picked + '/js-sync/download.json?sync_timestamp=' + timeIndex);
	}
	//Header parameters
	objectsUp.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsUp.onload = function(e) {
		//Parses response into strings
		Ti.API.info("Onload reached - Here follows the json: ");
		Ti.API.info(this.responseText);

		if (this.responseText != null && this.responseText != "null" && this.responseText != "" && this.responseText != "" && isJsonString(this.responseText) === true) {
			var json = JSON.parse(this.responseText);

			if (json.request_time && json.request_time != null && json.request_time != "") {
				var GMT_OFFSET = Number(json.request_time - app_timestamp);
				Ti.API.info(GMT_OFFSET + "  === " + json.request_time + " === " + app_timestamp);
				Ti.App.Properties.setString("timestamp_offset", GMT_OFFSET);
			}

			Ti.API.info('==========TYPE=========   ' + type_request);
			if (type_request == 'GET') {

				//Set our maximum
				Ti.API.info("######## CHECK ########  " + parseInt(json.total_item_count));
				if (progress != null) {
					//Set max value for progress bar
					progress.set_max(parseInt(json.total_item_count));
				}
			} else {
				Ti.API.info("######## CHECK ########  " + parseInt(json.total_item_count));
				if (progress != null) {
					//Set max value for progress bar
					Ti.API.info('************ PROGRESS BAR NOT NULL *************')
					progress.set_max(parseInt(json.total_item_count));
				}
			}

			if (type_request == 'GET') {
				Ti.API.info("Delete all value: " + json.delete_all);

				//Check this function
				if (json.delete_all === true || json.delete_all == "true") {
					Ti.API.info("=================== ############ ===================");
					Ti.API.info("Reseting database, delete_all is required");
					Ti.API.info("=================== ############ ===================");

					//If delete_all is present, delete all contents:

					if (PLATFORM == "android") {
						//Remove the database
						db_installMe.remove();
						db_installMe.close();
					} else {
						var db_file = db_installMe.getFile();
						db_installMe.close();
						//phisically removes the file
						db_file.deleteFile();
					}
					db_installMe = null;
					db_installMe = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
					
					var db_coord = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS");
					db_coord.execute('DELETE FROM alerts');
					db_coord.close();
				}
				
				Ti.API.info("Max itens: " + parseInt(json.total_item_count));
			}

			//If Database is already last version
			if ((type_request == 'GET') && (json.total_item_count == 0 )) {
				Ti.API.info('######### Request time : ' + json.sync_timestamp);
				db_installMe.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');
				db_installMe.close();

				Ti.API.info("SUCCESS -> No items ");
				if (progress != null) {
					progress.set();
					progress.close();
				}
				if ((mode != 0 ) && (mode != 1)) {
					unsetUse();
				}
			} else {
				if (type_request == 'GET') {
					if ((isFirstTime)) {
						db_installMe.execute('UPDATE updated SET "url"="' + win.picked + '" WHERE "rowid"=1');
					}

					//pageIndex == 1 means first load, pageIndex is incremented some lines above
					Ti.API.info('######### Request time : ' + json.request_time);
					db_installMe.execute('UPDATE updated SET "timestamp"=' + json.request_time + ' WHERE "rowid"=1');

					Ti.API.info("COUNT: " + json.total_item_count);
				}

				//Vehicles:
				if (json.vehicles) {
					var _veh = json.vehicles;
					var veh_db = new Array();

					if ( _veh instanceof Array) {
						for (var _i_veh in _veh) {
							veh_db.push("INSERT OR REPLACE INTO _vehicles (make, model ) VALUES ('" + _veh[_i_veh][0] + "', '" + _veh[_i_veh][1] + "' )");
						}
					} else {
						veh_db.push("INSERT OR REPLACE INTO _vehicles (make, model ) VALUES ('" + _veh[0] + "', '" + _veh[1] + "' )");
					}

					//DB operations
					var iPerform = 0;
					var iStart = Math.round(new Date().getTime() / 1000);
					Ti.API.info("Vehicles started at : " + iStart);

					db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
					while (iPerform <= veh_db.length - 1) {
						db_installMe.execute(veh_db[iPerform]);
						iPerform++;
					}
					db_installMe.execute("COMMIT TRANSACTION");

					var iEnd = Math.round(new Date().getTime() / 1000);
					Ti.API.info("Vehicles finishes at : " + iEnd);

					var iResult = iEnd - iStart;
					Ti.API.info('Vehicles seconds: ' + iResult);
					Ti.API.info("Success for vehicles, db operations ran smoothly!");
				}

				//Node types creation:
				if (json.node_type) {
					var node_db = [];
					//Node type inserts
					if (json.node_type.insert) {
						//Multiple nodes inserts
						if (json.node_type.insert.length) {
							for (var i = 0; i < json.node_type.insert.length; i++) {
								if (json.node_type.insert[i].type != 'user') {
									//Increment the progress bar
									if (progress != null) {
										progress.set();
									}
									node_db[node_db.length] = "CREATE TABLE " + json.node_type.insert[i].type + " ('nid' INTEGER PRIMARY KEY NOT NULL UNIQUE )";

									var get_title = JSON.stringify(json.node_type.insert[i].data.title_fields);

									var _get_data = JSON.stringify(json.node_type.insert[i].data);
									node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data , disabled) VALUES ('" + json.node_type.insert[i].type + "', '" + json.node_type.insert[i].name + "' , '" + json.node_type.insert[i].description + "', '" + get_title + "', '" + _get_data + "', '" + json.node_type.insert[i].disabled + "' )";
									Ti.API.info('Node type : ' + json.node_type.insert[i].type + ' has been created');
									Ti.API.info("DISABLED ? " + json.node_type.insert[i].disabled);
								}
							}
						}
						//Unique node insert
						else {
							if (json.node_type.insert.type != 'user') {
								if (progress != null) {
									progress.set();
								}
								node_db[node_db.length] = "CREATE TABLE " + json.node_type.insert.type + " ('nid' INTEGER PRIMARY KEY NOT NULL  UNIQUE )";

								var get_title = JSON.stringify(json.node_type.insert.data.title_fields);
								var _get_data = JSON.stringify(json.node_type.insert.data);

								node_db[node_db.length] = "INSERT OR REPLACE INTO bundles (bundle_name, display_name, description, title_fields, _data  , disabled) VALUES ('" + json.node_type.insert.type + "', '" + json.node_type.insert.name + "' , '" + json.node_type.insert.description + "' , '" + get_title + "', '" + _get_data + "',  '" + json.node_type.insert.disabled + "' )";
								Ti.API.info('Node type : ' + json.node_type.insert.type + ' has been created');
								Ti.API.info("DISABLED ? " + json.node_type.insert.disabled);
							}
						}
					}

					//Doesn't make sense to update it at this moment because we create an empty table
					//The only thing to consideer is deletion.
					//Node type updates - Not implemented yet (API's side)
					else if (json.node_type.update) {
						//Multiple nodes updates
						if (json.node_type.update.length) {
							for (var i = 0; i < json.node_type.update.length; i++) {
								//Increment the progress bar
								if (progress != null) {
									progress.set();
								}	

								var get_title = JSON.stringify(json.node_type.update[i].data.title_fields);

								var _get_data = JSON.stringify(json.node_type.update[i].data);
								var node_type_json = json.node_type.update[i].data;
								var no_mob_display = true;
								
								if((node_type_json.no_mobile_display != null && (node_type_json.no_mobile_display == 1 || 
									node_type_json.no_mobile_display == '1')) || json.node_type.update[i].disabled == 1 ||
									json.node_type.update[i].disabled == '1'  || json.node_type.update[i].disabled == 'true' ||
									json.node_type.update[i].disabled == true) {
									no_mob_display = false;
								}
								
								db_installMe.execute("UPDATE bundles SET bundle_name='" + json.node_type.update[i].type + "', display_on_menu='" + no_mob_display + "', display_name='" + json.node_type.update[i].name + "', description='" + json.node_type.update[i].description + "', title_fields='" + get_title + "', _data='" + _get_data + "', disabled='" + json.node_type.update[i].disabled + "' WHERE bundle_name='" + json.node_type.update[i].type + "'");
							
								var n_bund = db_installMe.execute('SELECT * FROM bundles');
								var data_rows = new Array();
								while(n_bund.isValidRow()) {
									var name_table = n_bund.fieldByName("bundle_name");
									var display = n_bund.fieldByName("display_name").toUpperCase();
									var description = n_bund.fieldByName("description");
									var flag_display = n_bund.fieldByName("display_on_menu");
									var _is_disabled = n_bund.fieldByName("disabled");
									var _nd = n_bund.fieldByName("_data");
									var show_plus = false;
									var app_permissions = {
										"can_create" : false,
										"can_update" : false,
										"all_permissions" : false,
										"can_view" : false
									}

									var node_type_json = JSON.parse(_nd);

									if(node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
										n_bund.next();
										continue;
									}

									if(roles.hasOwnProperty(ROLE_ID_ADMIN)) {
										show_plus = true;
										app_permissions.can_create = true;
										app_permissions.all_permissions = true;
										app_permissions.can_update = true;
										app_permissions.can_view = true;

									} else {
										for(var _l in node_type_json.permissions) {
											for(_k in roles) {
												if(_l == _k) {
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

									if(flag_display == 'true' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
										var row_a = Ti.UI.createTableViewRow({
											height : 60,
											name : display,
											display : display,
											desc : description,
											name_table : name_table,
											show_plus : show_plus,
											app_permissions : app_permissions,
											className : 'menu_row', // this is to optimize the rendering
											selectionStyle : app_permissions.can_view ? 1 : 0,
											backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
										});

										var icon = Titanium.UI.createImageView({
											width : 48,
											height : 48,
											top : 6,
											left : 5,
											desc : description,
											image: '/images/icons/' + name_table.toLowerCase() + '.png',
										});

										if(icon.toBlob() == null || icon.toBlob().length == 0) {
											icon.image = '/images/icons/settings.png';
										}

										var title_a = Titanium.UI.createLabel({
											text : display,
											font : {
												fontSize : 28
											},
											width : '80%',
											textAlign : 'left',
											left : 58,
											height : 'auto',
											desc : description,
											color : '#000'
										});

										var plus_a = Titanium.UI.createButton({
											backgroundImage : '/images/plus_btn.png',
											backgroundSelectedImage : '/images/plus_btn_selected.png',
											width : 64,
											height : 48,
											right : 1,
											is_plus : true
										});
										if(show_plus === false) {
											plus_a.hide();
										}

										row_a.add(icon);
										row_a.add(title_a);
										row_a.add(plus_a);

										if(PLATFORM == 'android') {
											row_a.addEventListener('longclick', function(e) {
												if(e.source.desc != null && e.source.desc != "") {
													alert(e.source.desc)
												}
											});
										} else {
											row_a.addEventListener('longpress', function(e) {
												if(e.source.desc != null && e.source.desc != "") {
													alert(e.source.desc)
												}
											});
										}
										data_rows.push(row_a);
										data_rows.sort(sortTableView);
										menu.setData(data_rows);
									}

									n_bund.next();
								}
								n_bund.close(); 							
							}
						}
						//Unique node update
						else {
							//Increment the progress bar
							if (progress != null) {
								progress.set();
							}	

							var get_title = JSON.stringify(json.node_type.update.data.title_fields);

							var _get_data = JSON.stringify(json.node_type.update.data);
							var node_type_json = json.node_type.update.data;
							var no_mob_display = true;
							
							if((node_type_json.no_mobile_display != null && (node_type_json.no_mobile_display == 1 || 
								node_type_json.no_mobile_display == '1')) || json.node_type.update.disabled == 1 ||
								json.node_type.update.disabled == '1'  || json.node_type.update.disabled == 'true' ||
								json.node_type.update.disabled == true) {
								no_mob_display = false;
							}
							
							db_installMe.execute("UPDATE bundles SET bundle_name='" + json.node_type.update.type + "', display_on_menu='" + no_mob_display + "', display_name='" + json.node_type.update.name + "', description='" + json.node_type.update.description + "', title_fields='" + get_title + "', _data='" + _get_data + "', disabled='" + json.node_type.update.disabled + "' WHERE bundle_name='" + json.node_type.update.type + "'");
						
							var n_bund = db_installMe.execute('SELECT * FROM bundles');
							var data_rows = new Array();
							while(n_bund.isValidRow()) {
								var name_table = n_bund.fieldByName("bundle_name");
								var display = n_bund.fieldByName("display_name").toUpperCase();
								var description = n_bund.fieldByName("description");
								var flag_display = n_bund.fieldByName("display_on_menu");
								var _is_disabled = n_bund.fieldByName("disabled");
								var _nd = n_bund.fieldByName("_data");
								var show_plus = false;
								var app_permissions = {
									"can_create" : false,
									"can_update" : false,
									"all_permissions" : false,
									"can_view" : false
								}

								var node_type_json = JSON.parse(_nd);

								if(node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
									n_bund.next();
									continue;
								}

								if(roles.hasOwnProperty(ROLE_ID_ADMIN)) {
									show_plus = true;
									app_permissions.can_create = true;
									app_permissions.all_permissions = true;
									app_permissions.can_update = true;
									app_permissions.can_view = true;

								} else {
									for(var _l in node_type_json.permissions) {
										for(_k in roles) {
											if(_l == _k) {
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

								if(flag_display == 'true' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
									var row_a = Ti.UI.createTableViewRow({
										height : 60,
										name : display,
										display : display,
										desc : description,
										name_table : name_table,
										show_plus : show_plus,
										app_permissions : app_permissions,
										className : 'menu_row', // this is to optimize the rendering
										selectionStyle : app_permissions.can_view ? 1 : 0,
										backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
									});

									var icon = Titanium.UI.createImageView({
										width : 48,
										height : 48,
										top : 6,
										left : 5,
										desc : description,
										image: '/images/icons/' + name_table.toLowerCase() + '.png',
									});

									if(icon.toBlob() == null || icon.toBlob().length == 0) {
										icon.image = '/images/icons/settings.png';
									}

									var title_a = Titanium.UI.createLabel({
										text : display,
										font : {
											fontSize : 28
										},
										width : '80%',
										textAlign : 'left',
										left : 58,
										height : 'auto',
										desc : description,
										color : '#000'
									});

									var plus_a = Titanium.UI.createButton({
										backgroundImage : '/images/plus_btn.png',
										backgroundSelectedImage : '/images/plus_btn_selected.png',
										width : 64,
										height : 48,
										right : 1,
										is_plus : true
									});
									if(show_plus === false) {
										plus_a.hide();
									}

									row_a.add(icon);
									row_a.add(title_a);
									row_a.add(plus_a);

									if(PLATFORM == 'android') {
										row_a.addEventListener('longclick', function(e) {
											if(e.source.desc != null && e.source.desc != "") {
												alert(e.source.desc)
											}
										});
									} else {
										row_a.addEventListener('longpress', function(e) {
											if(e.source.desc != null && e.source.desc != "") {
												alert(e.source.desc)
											}
										});
									}
									data_rows.push(row_a);
									data_rows.sort(sortTableView);
									menu.setData(data_rows);
								}

								n_bund.next();
							}
							n_bund.close(); 				
						}
					}

					//Node type deletion - Not implemented yet (API's side)
					else if (json.node_type['delete']) {
						//Multiple node type deletions
						if (json.node_type['delete'].length) {
							for (var i = 0; i < json.node_type['delete'].length; i++) {
								//Increment the progress bar
								if (progress != null) {
									progress.set();
								}
								node_db[node_db.length] = "DROP TABLE " + json.node_type.insert[i].type;
								node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert[i].type + "'";
								node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.node_type.insert[i].type + "'";

							}
						}
						//Unique node deletion
						else {
							if (progress != null) {
								progress.set();
							}
							node_db[node_db.length] = "DROP TABLE " + json.node_type.insert.type;
							node_db[node_db.length] = "DELETE FROM bundles WHERE bundle_name = '" + json.node_type.insert.type + "'";
							node_db[node_db.length] = "DELETE FROM node WHERE table_name = '" + json.node_type.insert.type + "'";
						}
					}

					//DB operations
					var iPerform = 0;
					var iStart = Math.round(new Date().getTime() / 1000);
					Ti.API.info("Node_type started at : " + iStart);

					db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
					while (iPerform <= node_db.length - 1) {
						db_installMe.execute(node_db[iPerform]);
						iPerform++;
					}
					db_installMe.execute("COMMIT TRANSACTION");

					var iEnd = Math.round(new Date().getTime() / 1000);
					Ti.API.info("Node_type finishes at : " + iEnd);

					var iResult = iEnd - iStart;
					Ti.API.info('Node_type seconds: ' + iResult);
					Ti.API.info("Success for node_types, db operations ran smoothly!");
				}

				//Fields:
				if (json.fields) {
					//SQL actions:
					var perform = [];

					if (json.fields.insert) {
						//Array of objects
						if (json.fields.insert.length) {
							for (var i = 0; i < json.fields.insert.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								//Encode:
								var var_widget = JSON.stringify(json.fields.insert[i].widget);
								var var_settings = JSON.stringify(json.fields.insert[i].settings);

								var fid = json.fields.insert[i].fid;

								if (json.fields.insert[i].type != null)
									var type = json.fields.insert[i].type.replace(/'/gi, '"');
								else
									var type = null;

								if (json.fields.insert[i].field_name != null)
									var field_name = json.fields.insert[i].field_name.replace(/'/gi, '"');
								else
									var field_name = null;

								if (json.fields.insert[i].label != null)
									var label = json.fields.insert[i].label.replace(/'/gi, '"');
								else
									var label = null;

								if (json.fields.insert[i].description != null)
									var description = json.fields.insert[i].description.replace(/'/gi, '"');
								else
									var description = null;

								if (json.fields.insert[i].bundle != null)
									var bundle = json.fields.insert[i].bundle.replace(/'/gi, '"');
								else
									var bundle = null;

								if (json.fields.insert[i].weight != null)
									var weight = json.fields.insert[i].weight;
								else
									var weight = null;

								if (json.fields.insert[i].required != null)
									var required = json.fields.insert[i].required;
								else
									var required = null;

								if (json.fields.insert[i].disabled != null)
									var disabled = json.fields.insert[i].disabled;
								else
									var disabled = 0;

								if (var_widget != null)
									var widget = var_widget.replace(/'/gi, '"');
								else
									var widget = null;

								if (var_settings != null) {
									var settings = var_settings.replace(/'/gi, '"');
									var s = JSON.parse(settings);
									var region = s.region;
								} else {
									var settings = null;
									var region = null;
								}

								//Multiple parts
								if (json.fields.insert[i].settings.parts) {
									for (var f_value_i in json.fields.insert[i].settings.parts ) {
										perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
									}
								}
								//Normal field
								else {
									perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
								}
								if (type ==  "auto_increment"){
									Ti.API.info(" --- "+perform[perform.length - 1]);
								}
								
								var type = "";

								switch(json.fields.insert[i].type) {
									case "taxonomy_term_reference":
									case "term_reference":
									case "datestamp":
									case "number_integer":
										(PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
										break;

									case "number_decimal":
										type = "REAL"
										break;

									default:
										type = "TEXT";
										break;
								}

								//Check if it is a valid bundle (automatically inserted throught the API):
								var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
								if (q_bund.isValidRow()) {
									if (json.fields.insert[i].settings.parts) {
										for (var f_value_i in json.fields.insert[i].settings.parts ) {
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
										}
									} else {
										if (json.fields.insert[i].type == 'image') {
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
										}
										perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
									}
								} else {
									Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
								}
								q_bund.close();
							}
						}
						//Single object
						else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							//Encode:
							var var_widget = JSON.stringify(json.fields.insert.widget);
							var var_settings = JSON.stringify(json.fields.insert.settings);

							var fid = json.fields.insert.fid;

							if (json.fields.insert.type != null)
								var type = json.fields.insert.type.replace(/'/gi, '"');
							else
								var type = null;

							if (json.fields.insert.field_name != null)
								var field_name = json.fields.insert.field_name.replace(/'/gi, '"');
							else
								var field_name = null;

							if (json.fields.insert.label != null)
								var label = json.fields.insert.label.replace(/'/gi, '"');
							else
								var label = null;

							if (json.fields.insert.description != null)
								var description = json.fields.insert.description.replace(/'/gi, '"');
							else
								var description = null;

							if (json.fields.insert.bundle != null)
								var bundle = json.fields.insert.bundle.replace(/'/gi, '"');
							else
								var bundle = null;

							if (json.fields.insert.weight != null)
								var weight = json.fields.insert.weight;
							else
								var weight = null;

							if (json.fields.insert.required != null)
								var required = json.fields.insert.required;
							else
								var required = null;

							if (json.fields.insert.disabled != null)
								var disabled = json.fields.insert.disabled;
							else
								var disabled = null;

							if (var_widget != null)
								var widget = var_widget.replace(/'/gi, '"');
							else
								var widget = null;

							if (var_settings != null) {
								var settings = var_settings.replace(/'/gi, '"');
								var s = JSON.parse(settings);
								var region = s.region;
							} else {
								var settings = null;
								var region = null;
							}

							//Multiple parts
							if (json.fields.insert.settings.parts) {
								for (var f_value_i in json.fields.insert.settings.parts ) {
									perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "', '" + disabled + "','" + widget + "','" + settings + "' )";
								}
							}
							//Normal field
							else {
								perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "', '" + disabled + "','" + widget + "','" + settings + "' )";
							}

							var type = "";

							switch(json.fields.insert.type) {
								case "taxonomy_term_reference":
								case "term_reference":
								case "datestamp":
								case "number_integer":
									(PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
									break;

								case "number_decimal":
									type = "REAL"
									break;

								default:
									type = "TEXT";
									break;
							}

							//Check if it is a valid bundle (automatically inserted throught the API):
							var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
							if (q_bund.isValidRow()) {
								if (json.fields.insert.settings.parts) {
									for (var f_value_i in json.fields.insert.settings.parts ) {
										perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
										//Ti.API.info("Inserted: "+field_name+"___"+f_value_i+" to be used in "+bundle);
									}
								} else {
									if (json.fields.insert[i].type == 'image') {
										perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
										perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
									}
									perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
									//Ti.API.info("Inserted: "+field_name+" to be used in "+bundle);
								}
							} else {
								Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
							}
							q_bund.close();
						}
					}

					if (json.fields.update) {
						Ti.API.info("################################ Fields update found! #################################");
						//Array of objects
						if (json.fields.update.length) {
							for (var i = 0; i < json.fields.update.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								//Encode:
								var var_widget = JSON.stringify(json.fields.update[i].widget);
								var var_settings = JSON.stringify(json.fields.update[i].settings);

								var fid = json.fields.update[i].fid;

								if (json.fields.update[i].type != null)
									var type = json.fields.update[i].type.replace(/'/gi, '"');
								else
									var type = null;

								if (json.fields.update[i].field_name != null)
									var field_name = json.fields.update[i].field_name.replace(/'/gi, '"');
								else
									var field_name = null;

								if (json.fields.update[i].label != null)
									var label = json.fields.update[i].label.replace(/'/gi, '"');
								else
									var label = null;

								if (json.fields.update[i].description != null)
									var description = json.fields.update[i].description.replace(/'/gi, '"');
								else
									var description = null;

								if (json.fields.update[i].bundle != null)
									var bundle = json.fields.update[i].bundle.replace(/'/gi, '"');
								else
									var bundle = null;

								if (json.fields.update[i].weight != null)
									var weight = json.fields.update[i].weight;
								else
									var weight = null;

								if (json.fields.update[i].required != null)
									var required = json.fields.update[i].required;
								else
									var required = null;

								if (json.fields.update[i].disabled != null)
									var disabled = json.fields.update[i].disabled;
								else
									var disabled = 0;

								if (var_widget != null)
									var widget = var_widget.replace(/'/gi, '"');
								else
									var widget = null;

								if (var_settings != null) {
									var settings = var_settings.replace(/'/gi, '"');
									var s = JSON.parse(settings);
									var region = s.region;
								} else {
									var settings = null;
									var region = null;
								}

								var tables = db_installMe.execute('SELECT * FROM fields WHERE fid = ' + fid);

								var fi_array = {
									//We might have many (of the same) fid for the same row
									fid : tables.fieldByName('fid'),
									//Settings never changes when there is duplicity
									settings : tables.fieldByName('settings'),
									//Variables
									fi_obj : new Array()
								}

								var count_fi_database = 0;

								while (tables.isValidRow()) {
									//ID is primary key
									fi_array.fi_obj[count_fi_database] = new Array();
									fi_array.fi_obj[count_fi_database]['id'] = tables.fieldByName('id');
									fi_array.fi_obj[count_fi_database]['field_name'] = tables.fieldByName('field_name');
									count_fi_database++;
									tables.next();
								}

								if (count_fi_database == 0) {
									//This field is not present in database, let's include it:
									//Shouldn't happen within an update but if it does, it will be treated
									//Multiple parts
									if (json.fields.update[i].settings.parts) {
										for (var f_value_i in json.fields.update[i].settings.parts ) {
											perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
											//Ti.API.info('Field not presented in the database, creating field_name = '+field_name+"___"+f_value_i);
										}
									}
									//Normal field
									else {
										perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
										//Ti.API.info('Field not presented in the database, creating field_name = '+field_name);
									}

									var type = "";

									switch(json.fields.update[i].type) {
										case "taxonomy_term_reference":
										case "term_reference":
										case "datestamp":
										case "number_integer":
											(PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
											break;

										case "number_decimal":
											type = "REAL"
											break;

										default:
											type = "TEXT";
											break;
									}

									//Check if it is a valid bundle (automatically updated throught the API):
									var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
									if (q_bund.isValidRow()) {
										if (json.fields.update[i].settings.parts) {
											for (var f_value_i in json.fields.update[i].settings.parts ) {
												perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
												Ti.API.info("Updated: " + field_name + "___" + f_value_i + " to be used in " + bundle);
											}
										} else {
											if (json.fields.update[i].type == 'image') {
												perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
												perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
											}
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
											Ti.API.info("Updated: " + field_name + " to be used in " + bundle);
										}
									} else {
										Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
									}
									q_bund.close();
								} else {
									//Real update
									//This field is present in database, let's update it:

									//Multiple parts need to be inserted
									if (fi_array.fi_obj.length > 1) {
										//Filter fields from database
										var missing_update = new Array();
										var match_base = new Array();

										for (var f_base in json.fields.update[i].settings.parts) {
											missing_update[f_base] = true;
										}

										for (var f_base in fi_array.fi_obj) {
											var i_obj = {
												match : false,
												id : fi_array.fi_obj[f_base]['id'],
												field_name : fi_array.fi_obj[f_base]['field_name']
											};
											match_base[fi_array.fi_obj[f_base]['field_name']] = i_obj;

											Ti.API.info('***************** INSERTED ' + fi_array.fi_obj[f_base]['field_name']);
										}

										//Deletions
										//Fields in database and in JSON update
										var parts = json.fields.update[i].settings.parts;

										for (var f_base in fi_array.fi_obj) {
											for (var indField in parts) {
												if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
													Ti.API.info('IS in database : ' + fi_array.fi_obj[f_base]['field_name']);
													//Turn update flag off
													match_base[fi_array.fi_obj[f_base]['field_name']].match = true;
												}
											}
										}
										//Delete missing fields at the database
										for (var i_x in match_base) {
											if (match_base[i_x].match === false) {
												perform[perform.length] = "DELETE FROM fields WHERE id=" + match_base[i_x].id;
											}
										}

										//UPDATES:
										//First off, update the fields:
										for (var indField in json.fields.update[i].settings.parts) {
											for (var f_base in fi_array.fi_obj) {
												if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
													Ti.API.info(field_name + '___' + indField);
													Ti.API.info(fi_array.fi_obj[f_base]['field_name']);

													//Run update script
													Ti.API.info('Updated field_name = ' + field_name + "___" + indField);

													perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[f_base]['id'];

													//Turn update flag off
													missing_update[indField] = false;
												}
											}
										}

										//Now we have the new properties, let's add them
										for (var index in missing_update) {
											if (missing_update[index] === true) {
												perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + index + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
												Ti.API.info('Created a new field because of a new part, field_name = ' + field_name + "___" + index);

												var type = "";

												switch(json.fields.update[i].type) {
													case "taxonomy_term_reference":
													case "term_reference":
													case "datestamp":
													case "number_integer":
														(PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT';
														break;

													case "number_decimal":
														type = "REAL"
														break;

													default:
														type = "TEXT";
														break;
												}

												var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
												if (q_bund.isValidRow()) {
													var db_tester = db_installMe.execute('SELECT ' + field_name + '___' + index + ' FROM ' + bundle);
													if (db_tester.isValidRow()) {
														Ti.API.info('Field recovered!');
													} else {
														perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + "___" + index + '\' ' + type;
													}
													db_tester.close();
													Ti.API.info("Updated: " + field_name + "___" + index + " to be used in " + bundle);
												} else {
													Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
												}
												q_bund.close();
											}
										}
									}
									//Single insert
									else if (fi_array.fi_obj.length == 1) {
										//Run update script
										Ti.API.info('Single updated for single part, fid = ' + fid);
										perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[0]['id'];
									}
									//Length == 0 has count_fi_database == 0, so it should not end here.
									else {
										Ti.API.info('#################################### @Developer, take a look, fields update should not end here ####################################');
									}
								}
							}
						}
						//Single object
						else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							//Encode:
							var var_widget = JSON.stringify(json.fields.update.widget);
							var var_settings = JSON.stringify(json.fields.update.settings);

							var fid = json.fields.update.fid;

							if (json.fields.update.type != null)
								var type = json.fields.update.type.replace(/'/gi, '"');
							else
								var type = null;

							if (json.fields.update.field_name != null)
								var field_name = json.fields.update.field_name.replace(/'/gi, '"');
							else
								var field_name = null;

							if (json.fields.update.label != null)
								var label = json.fields.update.label.replace(/'/gi, '"');
							else
								var label = null;

							if (json.fields.update.description != null)
								var description = json.fields.update.description.replace(/'/gi, '"');
							else
								var description = null;

							if (json.fields.update.bundle != null)
								var bundle = json.fields.update.bundle.replace(/'/gi, '"');
							else
								var bundle = null;

							if (json.fields.update.weight != null)
								var weight = json.fields.update.weight;
							else
								var weight = null;

							if (json.fields.update.required != null)
								var required = json.fields.update.required;
							else
								var required = null;

							if (json.fields.update.disabled != null)
								var disabled = json.fields.update.disabled;
							else
								var disabled = null;

							if (var_widget != null)
								var widget = var_widget.replace(/'/gi, '"');
							else
								var widget = null;

							if (var_settings != null) {
								var settings = var_settings.replace(/'/gi, '"');
								var s = JSON.parse(settings);
								var region = s.region;
							} else {
								var settings = null;
								var region = null;
							}

							var tables = db_installMe.execute('SELECT * FROM fields WHERE fid = ' + fid);

							var fi_array = {
								//We might have various (of the same) fid for the same row
								fid : tables.fieldByName('fid'),
								//Settings never changes when there is duplicity
								settings : tables.fieldByName('settings'),
								//Variables
								fi_obj : new Array()
							}

							var count_fi_database = 0;

							while (tables.isValidRow()) {
								//ID is primary key
								fi_array.fi_obj[count_fi_database] = new Array();
								fi_array.fi_obj[count_fi_database]['id'] = tables.fieldByName('id');
								fi_array.fi_obj[count_fi_database]['field_name'] = tables.fieldByName('field_name');
								count_fi_database++;
								tables.next();
							}

							if (count_fi_database == 0) {
								//This field is not present in database, let's include it:
								//Shouldn't happen within an update but if it does, it will be treated
								//Multiple parts
								if (json.fields.update.settings.parts) {
									for (var f_value_i in json.fields.update.settings.parts ) {
										perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + f_value_i + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
										Ti.API.info('Field not presented in the database, creating field_name = ' + field_name + "___" + f_value_i);
									}
								}
								//Normal field
								else {
									perform[perform.length] = "INSERT OR REPLACE  INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ",'" + required + "','" + disabled + "','" + widget + "','" + settings + "' )";
									Ti.API.info('Field not presented in the database, creating field_name = ' + field_name);
								}

								var type = "";

								switch(json.fields.update.type) {
									case "taxonomy_term_reference":
									case "term_reference":
									case "datestamp":
									case "number_integer":
										(PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
										break;

									case "number_decimal":
										type = "REAL"
										break;

									default:
										type = "TEXT";
										break;
								}

								//Check if it is a valid bundle (automatically updated throught the API):
								var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
								if (q_bund.isValidRow()) {
									if (json.fields.update.settings.parts) {
										for (var f_value_i in json.fields.update.settings.parts ) {
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___' + f_value_i + '\' ' + type;
											Ti.API.info("Updated: " + field_name + "___" + f_value_i + " to be used in " + bundle);
										}
									} else {
										if (json.fields.update[i].type == 'image') {
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___file_id' + '\' ' + type;
											perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '___status' + '\' ' + type;
										}
										perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + '\' ' + type;
										Ti.API.info("Updated: " + field_name + " to be used in " + bundle);
									}
								} else {
									Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
								}
								q_bund.close();
							} else {
								//Real update
								//This field is present in database, let's update it:

								//Multiple parts need to be inserted
								if (fi_array.fi_obj.length > 1) {
									//Filter fields from database
									var missing_update = new Array();
									var match_base = new Array();

									for (var f_base in json.fields.update.settings.parts) {
										missing_update[f_base] = true;
									}

									for (var f_base in fi_array.fi_obj) {
										var i_obj = {
											match : false,
											id : fi_array.fi_obj[f_base]['id'],
											field_name : fi_array.fi_obj[f_base]['field_name']
										};
										match_base[fi_array.fi_obj[f_base]['field_name']] = i_obj;

										Ti.API.info('***************** INSERTED ' + fi_array.fi_obj[f_base]['field_name']);
									}

									//Deletions
									//Fields in database and in JSON update
									var parts = json.fields.update.settings.parts;

									for (var f_base in fi_array.fi_obj) {
										for (var indField in parts) {
											if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
												Ti.API.info('IS in database : ' + fi_array.fi_obj[f_base]['field_name']);
												//Turn update flag off
												match_base[fi_array.fi_obj[f_base]['field_name']].match = true;
											}
										}
									}
									//Delete missing fields at the database
									for (var i_x in match_base) {
										if (match_base[i_x].match === false) {
											perform[perform.length] = "DELETE FROM fields WHERE id=" + match_base[i_x].id;
										}
									}

									//UPDATES:
									//First off, update the fields:
									for (var indField in json.fields.update.settings.parts) {
										for (var f_base in fi_array.fi_obj) {
											if (field_name + "___" + indField == fi_array.fi_obj[f_base]['field_name']) {
												Ti.API.info(field_name + '___' + indField);
												Ti.API.info(fi_array.fi_obj[f_base]['field_name']);

												//Run update script
												Ti.API.info('Updated field_name = ' + field_name + "___" + indField);

												perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[f_base]['id'];

												//Turn update flag off
												missing_update[indField] = false;
											}
										}
									}

									//Now we have the new properties, let's add them
									for (var index in missing_update) {
										if (missing_update[index] === true) {
											perform[perform.length] = "INSERT OR REPLACE INTO fields (fid, type, field_name, label, description, bundle, region, weight, required, disabled, widget, settings) VALUES (" + fid + ",'" + type + "','" + field_name + "___" + index + "','" + label + "','" + description + "','" + bundle + "','" + region + "'," + weight + ", '" + required + "' ,  '" + disabled + "' , '" + widget + "','" + settings + "' )";
											Ti.API.info('Created a new field because of a new part, field_name = ' + field_name + "___" + index);

											var type = "";

											switch(json.fields.update.type) {
												case "taxonomy_term_reference":
												case "term_reference":
												case "datestamp":
												case "number_integer":
													(PLATFORM == 'android') ? type = "INTEGER" : type = 'TEXT'
													break;

												case "number_decimal":
													type = "REAL"
													break;

												default:
													type = "TEXT";
													break;
											}

											var q_bund = db_installMe.execute('SELECT * FROM bundles WHERE bundle_name = "' + bundle + '"');
											if (q_bund.isValidRow()) {
												var db_tester = db_installMe.execute('SELECT ' + field_name + '___' + index + ' FROM ' + bundle);
												if (db_tester.isValidRow()) {
													Ti.API.info('Field recovered!');
												} else {
													perform[perform.length] = 'ALTER TABLE \'' + bundle + '\' ADD \'' + field_name + "___" + index + '\' ' + type;
												}
												db_tester.close();
												Ti.API.info("Updated: " + field_name + "___" + index + " to be used in " + bundle);
											} else {
												Ti.API.info('=====================>>>>> Avoiding fields creation for table: ' + bundle);
											}
											q_bund.close();
										}
									}
								}
								//Single insert
								else if (fi_array.fi_obj.length == 1) {
									//Run update script
									Ti.API.info('Single updated for single part, fid = ' + fid);
									perform[perform.length] = "UPDATE fields SET type='" + type + "', label='" + label + "', description='" + description + "', bundle='" + bundle + "', region='" + region + "', weight=" + weight + ", required='" + required + "', disabled='" + disabled + "', widget='" + widget + "', settings='" + settings + "'  WHERE id=" + fi_array.fi_obj[0]['id'];
								}
								//Length == 0 has count_fi_database == 0, so it should not end here.
								else {
									Ti.API.info('#################################### @Developer, take a look, fields update should not end here ####################################');
								}
							}
						}
					}
					/*
					 * Delete fields from fields table
					 */

					if (json.fields["delete"]) {
						if (json.fields["delete"].length) {
							for (var i = 0; i < json.fields["delete"].length; i++) {
								Ti.API.info('FID: ' + json.fields["delete"][i].fid + ' was deleted');
								//Deletes rows from terms
								perform[perform.length] = 'DELETE FROM fields WHERE "fid"=' + json.fields["delete"][i].fid;
							}
						} else {
							Ti.API.info('FID: ' + json.fields["delete"].fid + ' was deleted');
							perform[perform.length] = 'DELETE FROM fields WHERE "fid"=' + json.fields["delete"].fid;
						}
					}

					if (perform) {
						var iPerform = 0;
						var iStart = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Fields started at : " + iStart);

						db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
						while (iPerform <= perform.length - 1) {
							//Ti.API.info("Field -------  "+perform[iPerform]);
							db_installMe.execute(perform[iPerform]);
							iPerform++;
						}
						db_installMe.execute("COMMIT TRANSACTION");

						var iEnd = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Fields finishes at : " + iEnd);

						var iResult = iEnd - iStart;
						Ti.API.info('Fields seconds: ' + iResult);
						Ti.API.info("Success for fields, it was inserted / updated!");
					}
				}
				//
				//Retrieve objects that need quotes:
				//
				var iStart = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Finding proccess started at : " + iStart);

				var need_at = db_installMe.execute("SELECT field_name,bundle FROM fields WHERE type='number_integer' OR type='number_decimal' ");

				var quotes = new Array();
				while (need_at.isValidRow()) {
					quotes[need_at.fieldByName('field_name')] = new Array();
					quotes[need_at.fieldByName('field_name')][need_at.fieldByName('bundle')] = true;
					need_at.next();
				}

				var iEnd = Math.round(new Date().getTime() / 1000);
				Ti.API.info("Finding proccess ended at : " + iEnd);

				var iResult = iEnd - iStart;
				Ti.API.info('Found in seconds: ' + iResult);
				Ti.API.info("Success for finding!");

				//Vocabulary:
				if (json.vocabularies) {
					Ti.API.info('Vocabularies');
					var perform_vocabulary = [];

					if (json.vocabularies.insert) {
						if (json.vocabularies.insert.length) {
							for (var i = 0; i < json.vocabularies.insert.length; i++) {
								//Increment Progress Bar
								if (progress != null) {
									progress.set();
								}
								var vid_v = json.vocabularies.insert[i].vid;
								var name_v = json.vocabularies.insert[i].name;
								var machine_v = json.vocabularies.insert[i].machine_name;

								if (name_v == null)
									name_v = "null";
								if (machine_v == null)
									machine_v = "";
								//Ti.API.info("About to insert vocabulary: "+vid_v);
								perform_vocabulary[perform_vocabulary.length] = 'INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid_v + ',"' + name_v + '","' + machine_v + '")';
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}
							var vid_v = json.vocabularies.insert.vid;
							var name_v = json.vocabularies.insert.name;
							var machine_v = json.vocabularies.insert.machine_name;

							if (name_v == null)
								name_v = "null";

							if (machine_v == null)
								machine_v = "";
							//Ti.API.info("About to insert vocabulary: "+vid_v);
							perform_vocabulary[perform_vocabulary.length] = 'INSERT OR REPLACE  INTO vocabulary (vid, name, machine_name) VALUES (' + vid_v + ',"' + name_v + '","' + machine_v + '")';
						}

					}
					if (json.vocabularies.update) {
						if (json.vocabularies.update.length) {
							for (var i = 0; i < json.vocabularies.update.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								//Ti.API.info("About to update vocabulary: "+json.vocabularies.update[i].vid);
								perform_vocabulary[perform_vocabulary.length] = 'UPDATE vocabulary SET "name"="' + json.vocabularies.update[i].name + '", "machine_name"="' + json.vocabularies.update[i].machine_name + '" WHERE "vid"=' + json.vocabularies.update[i].vid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}
							//Ti.API.info("About to update vocabulary: "+json.vocabularies.update.vid);
							perform_vocabulary[perform_vocabulary.length] = 'UPDATE vocabulary SET "name"="' + json.vocabularies.update.name + '", "machine_name"="' + json.vocabularies.update.machine_name + '" WHERE "vid"=' + json.vocabularies.update.vid;
						}
						Ti.API.info("Vocabulary updated!");
					}
					if (json.vocabularies["delete"]) {
						if (json.vocabularies["delete"].length) {
							for (var i = 0; i < json.vocabularies["delete"].length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								//Deletes rows from terms
								perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM term_data WHERE "vid"=' + json.vocabularies["delete"][i].vid;

								//Deletes corresponding rows in vocabulary
								perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM vocabulary WHERE "vid"=' + json.vocabularies["delete"][i].vid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}
							//Deletes row from terms
							perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM term_data WHERE "vid"=' + json.vocabularies["delete"].vid;

							//Deletes corresponding row in vocabulary
							perform_vocabulary[perform_vocabulary.length] = 'DELETE FROM vocabulary WHERE "vid"=' + json.vocabularies["delete"].vid;
						}
						Ti.API.info("Vocabulary deleted!");
					}

					if (perform_vocabulary.length > 0) {
						var iVocabulary = 0;

						var iStart = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Vocabulary started at : " + iStart);

						db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
						while (iVocabulary <= perform_vocabulary.length - 1) {
							db_installMe.execute(perform_vocabulary[iVocabulary]);
							iVocabulary++;
						}
						db_installMe.execute("COMMIT TRANSACTION");

						var iEnd = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Vocabulary finishes at : " + iEnd);

						var iResult = iEnd - iStart;
						Ti.API.info('Vocabulary seconds: ' + iResult);

						Ti.API.info("Vocabulary inserted!");
					}
				}

				//Terms:
				if (json.terms) {
					var perform_term = [];

					Ti.API.info('Terms');
					if (json.terms.insert) {
						if (json.terms.insert.length) {
							for (var i = 0; i < json.terms.insert.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								var vid_t = json.terms.insert[i].vid;
								var tid_t = json.terms.insert[i].tid;
								var name_t = json.terms.insert[i].name;
								var desc_t = json.terms.insert[i].description;
								var weight_t = json.terms.insert[i].weight;

								if (desc_t == null)
									desc_t = "";
								if (name_t == null)
									name_t = "";
								if (weight_t == null)
									weight_t = "";

								perform_term[perform_term.length] = 'INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid_t + ',' + vid_t + ',"' + name_t + '","' + desc_t + '","' + weight_t + '")';
								if (type_request == 'POST') {
									perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms.insert[i].__negative_tid;
								}

							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							var vid_t = json.terms.insert.vid;
							var tid_t = json.terms.insert.tid;
							var name_t = json.terms.insert.name;
							var desc_t = json.terms.insert.description;
							var weight_t = json.terms.insert.weight;

							if (desc_t == null)
								desc_t = "";
							if (name_t == null)
								name_t = "";
							if (weight_t == null)
								weight_t = "";

							perform_term[perform_term.length] = 'INSERT OR REPLACE  INTO term_data ( tid , vid, name, description, weight) VALUES (' + tid_t + ',' + vid_t + ',"' + name_t + '","' + desc_t + '","' + weight_t + '")';
							if (type_request == 'POST') {
								perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms.insert.__negative_tid;
							}
						}

					}
					if (json.terms.update) {
						if (json.terms.update.length) {
							for (var i = 0; i < json.terms.update.length; i++) {

								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}
								perform_term[perform_term.length] = 'UPDATE term_data SET "name"="' + json.terms.update[i].name + '", "description"="' + json.terms.update[i].description + '",  "weight"="' + json.terms.update[i].weight + '", "vid"=' + json.terms.update[i].vid + '  WHERE "tid"=' + json.terms.update[i].tid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							perform_term[perform_term.length] = 'UPDATE term_data SET "name"="' + json.terms.update.name + '", "description"="' + json.terms.update.description + '",  "weight"="' + json.terms.update.weight + '", "vid"=' + json.terms.update.vid + '  WHERE "tid"=' + json.terms.update.tid;
						}
					}
					if (json.terms["delete"]) {
						if (json.terms["delete"].length) {
							for (var i = 0; i < json.terms["delete"].length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}
								perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms["delete"][i].tid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}
							perform_term[perform_term.length] = 'DELETE FROM term_data WHERE "tid"=' + json.terms["delete"].tid;
						}
					}

					if (perform_term.length > 0) {
						var iTerm = 0;

						var iStart = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Term started at : " + iStart);

						db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
						while (iTerm <= perform_term.length - 1) {
							db_installMe.execute(perform_term[iTerm]);
							iTerm++;
						}
						db_installMe.execute("COMMIT TRANSACTION");

						var iEnd = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Term finishes at : " + iEnd);

						var iResult = iEnd - iStart;
						Ti.API.info('Term seconds: ' + iResult);
						Ti.API.info('Terms were succefully installed');
					}

				}

				// Adds new itemns to menu and also processes each object
				var callback;
				var n_bund = db_installMe.execute('SELECT * FROM bundles');
				var take = db_installMe.execute('SELECT * FROM bundles WHERE display_on_menu="true"');
				var count_t = 0;
				var data_rows = new Array();
				Titanium.App.Properties.setString("new_node_id", null);
				 
				while (n_bund.isValidRow()) {
					var name_table = n_bund.fieldByName("bundle_name");
					//try{
					if ((json.node) && (json.node[name_table])) {
						Ti.API.info('##### Called ' + name_table);
						callback = process_object(json.node, name_table, quotes, progress, type_request, db_installMe);

						//Add it to the main screen
						var display = n_bund.fieldByName("display_name").toUpperCase();
						var description = n_bund.fieldByName("description");
						var flag_display = n_bund.fieldByName("display_on_menu");
						var id = n_bund.fieldByName("bid");
						var _is_disabled = n_bund.fieldByName("disabled");
						var _nd = n_bund.fieldByName("_data");
						var show_plus = false;
						var app_permissions = {
							"can_create" : false,
							"can_update" : false,
							"all_permissions" : false,
							"can_view" : false
						}

						var node_type_json = JSON.parse(_nd);

						if (node_type_json.no_mobile_display != null && node_type_json.no_mobile_display == 1 && node_type_json.no_mobile_display == '1') {
							n_bund.next();
							continue;
						}

						if (roles.hasOwnProperty(ROLE_ID_ADMIN)) {
							show_plus = true;
							app_permissions.can_create = true;
							app_permissions.all_permissions = true;
							app_permissions.can_update = true;
							app_permissions.can_view = true;

						} else {
							for (var _l in node_type_json.permissions) {
								for (_k in roles) {
									if (_l == _k) {
										var stringifyObj = JSON.stringify(node_type_json.permissions[_l]);
										if (node_type_json.permissions[_l]["can create"] || node_type_json.permissions[_l]["all_permissions"]) {
											show_plus = true;
											app_permissions.can_create = true;
										}

										if (node_type_json.permissions[_l]["all_permissions"]) {
											app_permissions.all_permissions = true;
											app_permissions.can_update = true;
											app_permissions.can_view = true;
											continue;
										}

										if (stringifyObj.indexOf('update') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
											app_permissions.can_update = true;
										}

										if (stringifyObj.indexOf('view') >= 0 || node_type_json.permissions[_l]["all_permissions"]) {
											app_permissions.can_view = true;
										}

									}
								}
							}
						}

						if (flag_display == 'false' && (_is_disabled != 1 && _is_disabled != "1" && _is_disabled != "true" && _is_disabled != true)) {
							var row_a = Ti.UI.createTableViewRow({
								height : 60,
								name : display,
								display : display,
								desc : description,
								name_table : name_table,
								show_plus : show_plus,
								app_permissions : app_permissions,
								className : 'menu_row', // this is to optimize the rendering
								selectionStyle : app_permissions.can_view ? 1 : 0,
								backgroundSelectedColor : app_permissions.can_view ? '#BDBDBD' : '#00000000'
							});

							var icon = Titanium.UI.createImageView({
								width : 48,
								height : 48,
								top : 6,
								left : 5,
								desc : description,
								image: '/images/icons/' + name_table.toLowerCase() + '.png',
							});

							if (icon.toBlob() == null || icon.toBlob().length == 0) {
								icon.image = '/images/icons/settings.png';
							}

							var title_a = Titanium.UI.createLabel({
								text : display,
								font : {
									fontSize : 28
								},
								width : '80%',
								textAlign : 'left',
								left : 58,
								height : 'auto',
								desc : description,
								color : '#000'
							});

							var plus_a = Titanium.UI.createButton({
								backgroundImage : '/images/plus_btn.png',
								backgroundSelectedImage : '/images/plus_btn_selected.png',
								width : 64,
								height : 48,
								right : 1,
								is_plus : true
							});
							if (show_plus === false) {
								plus_a.hide();
							}

							row_a.add(icon);
							row_a.add(title_a);
							row_a.add(plus_a);

							if (PLATFORM == 'android') {
								row_a.addEventListener('longclick', function(e) {
									if (e.source.desc != null && e.source.desc != "") {
										alert(e.source.desc)
									}
								});
							} else {
								row_a.addEventListener('longpress', function(e) {
									if (e.source.desc != null && e.source.desc != "") {
										alert(e.source.desc)
									}
								});
							}

							//menu.appendRow(row_a);
							data_rows.push(row_a);
							data_rows.sort(sortTableView);
							menu.setData(data_rows);
							db_installMe.execute('UPDATE bundles SET display_on_menu =\'true\' WHERE bid=' + id);
						}

					}
					n_bund.next();
					//	}
					//catch(evt){
					//}

				}
				n_bund.close();
				/*********** Users *************/
				if (json.users) {

					var perform_user = [];

					//Insert - Users
					if (json.users.insert) {
						if (json.users.insert.length) {
							for (var i = 0; i < json.users.insert.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}
								Ti.API.info("USER UID: " + json.users.insert[i].uid);
								perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user (uid, username, mail, realname, status ) VALUES (' + json.users.insert[i].uid + ',"' + json.users.insert[i].username + '","' + json.users.insert[i].mail + '","' + json.users.insert[i].realname + '",' + json.users.insert[i].status + ')';

								if (json.users.insert[i].roles.length) {
									for (var j = 0; j < json.users.insert[i].roles.length; j++) {
										perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.insert[i].uid + ',' + json.users.insert[i].roles[j] + ')';
									}
								} else {
									perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.insert[i].uid + ',' + json.users.insert[i].roles + ')';
								}
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							Ti.API.info("USER UID: " + json.users.insert.uid);
							perform_user[perform_user.length] = 'INSERT OR REPLACE INTO user (uid, username, mail, realname, status ) VALUES (' + json.users.insert.uid + ',"' + json.users.insert.username + '","' + json.users.insert.mail + '","' + json.users.insert.realname + '",' + json.users.insert.status + ')';

							if (json.users.insert.roles.length) {
								for (var j = 0; j < json.users.insert.roles.length; j++) {
									perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.insert.uid + ',' + json.users.insert.roles[j] + ')';
								}
							} else {
								perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.insert.uid + ',' + json.users.insert.roles + ')';
							}
						}
						Ti.API.info("Inserted users sucefully!");
					}

					//Update - Users
					if (json.users.update) {
						if (json.users.update.length) {
							for (var i = 0; i < json.users.update.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}
								perform_user[perform_user.length] = 'UPDATE user SET "username"="' + json.users.update[i].username + '" , "mail"="' + json.users.update[i].mail + '", "realname"="' + json.users.update[i].realname + '", "status"=' + json.users.update[i].status + ' WHERE "uid"=' + json.users.update[i].uid;

								//Delete every row present at user_roles
								perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"=' + json.users.update[i].uid;

								//Insert it over again!
								if (json.users.update[i].roles) {
									if (json.users.update[i].roles.length) {
										for (var j = 0; j < json.users.update[i].roles.length; j++) {
											perform_user[perform_user.length] = 'INSERT OR REPLACE INTO user_roles (uid, rid ) VALUES (' + json.users.update[i].uid + ',' + json.users.update[i].roles[j] + ')';
										}
									} else {
										perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.update[i].uid + ',' + json.users.update[i].roles + ')';
									}
								}
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							perform_user[perform_user.length] = 'UPDATE user SET "username"="' + json.users.update.username + '" , "mail"="' + json.users.update.mail + '", "realname"="' + json.users.update.realname + '", "status"=' + json.users.update.status + ' WHERE "uid"=' + json.users.update.uid;

							//Delete every row present at user_roles
							perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"=' + json.users.update.uid;

							//Insert it over again!
							if (json.users.update.roles) {
								if (json.users.update.roles.length) {
									for (var j = 0; j < json.users.update.roles.length; j++) {
										perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.update.uid + ',' + json.users.update.roles[j] + ')';
									}
								} else {
									perform_user[perform_user.length] = 'INSERT OR REPLACE  INTO user_roles (uid, rid ) VALUES (' + json.users.update.uid + ',' + json.users.update.roles + ')';
								}
							}
						}
						Ti.API.info("Updated Users sucefully!");
					}

					//Delete - Users
					if (json.users["delete"]) {
						if (json.users["delete"].length) {
							for (var i = 0; i < json.users["delete"].length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								//Deletes current row (contact)
								perform_user[perform_user.length] = 'DELETE FROM user WHERE "uid"=' + json.users["delete"][i].uid;
								perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"=' + json.users["delete"][i].uid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							perform_user[perform_user.length] = 'DELETE FROM user WHERE "uid"=' + json.users["delete"].uid;
							perform_user[perform_user.length] = 'DELETE FROM user_roles WHERE "uid"=' + json.users["delete"].uid;
						}
						Ti.API.info("Deleted Users sucefully!");
					}

					if (perform_user.length > 0) {
						var iUser = 0;

						var iStart = Math.round(new Date().getTime() / 1000);
						Ti.API.info("User started at : " + iStart);

						db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
						while (iUser <= perform_user.length - 1) {
							db_installMe.execute(perform_user[iUser]);
							iUser++;
						}
						db_installMe.execute("COMMIT TRANSACTION");

						var iEnd = Math.round(new Date().getTime() / 1000);
						Ti.API.info("User finishes at : " + iEnd);

						var iResult = iEnd - iStart;
						Ti.API.info('User seconds: ' + iResult);

						Ti.API.info("User ended!");
					}

				}

				/*********** Regions *************/
				if (json.regions) {
					var perform_region = [];

					//Insert - Regions
					if (json.regions.insert) {
						Ti.API.info('####################### Regions insert');
						if (json.regions.insert.length) {
							for (var i = 0; i < json.regions.insert.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}

								//Encode:
								var var_settings = JSON.stringify(json.regions.insert[i].settings);

								if (var_settings != null)
									var settings = var_settings.replace(/'/gi, '"');
								else
									var settings = null;

								Ti.API.info("REGION RID: " + json.regions.insert[i].rid);
								perform_region[perform_region.length] = 'INSERT OR REPLACE INTO regions (rid, node_type, label, region_name, weight, settings ) VALUES (' + json.regions.insert[i].rid + ', \'' + json.regions.insert[i].node_type + '\' , \'' + json.regions.insert[i].label + '\', \'' + json.regions.insert[i].region_name + '\' , ' + json.regions.insert[i].weight + ', \'' + settings + '\' )';
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}

							Ti.API.info("REGION RID: " + json.regions.insert.rid);
							//Encode:
							var var_settings = JSON.stringify(json.regions.insert.settings);

							if (var_settings != null)
								var settings = var_settings.replace(/'/gi, '"');
							else
								var settings = null;

							Ti.API.info("REGION RID: " + json.regions.insert.rid);
							perform_region[perform_region.length] = 'INSERT OR REPLACE INTO regions (rid, node_type, label, region_name, weight, settings ) VALUES (' + json.regions.insert.rid + ', \'' + json.regions.insert.node_type + '\' , \'' + json.regions.insert.label + '\', \'' + json.regions.insert.region_name + '\' , ' + json.regions.insert.weight + ', \'' + settings + '\' )';

						}
						Ti.API.info("Inserted regions sucefully!");
					}

					//Update - Regions
					if (json.regions.update) {
						Ti.API.info('####################### Regions update');
						if (json.regions.update.length) {
							for (var i = 0; i < json.regions.update.length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}
								perform_region[perform_region.length] = 'UPDATE regions SET \'node_type\'=\'' + json.regions.update[i].node_type + '\' , \'label\'=\'' + json.regions.update[i].label + '\', \'region_name\'=\'' + json.regions.update[i].region_name + '\', \'weight\'=' + json.regions.update[i].weight + ', \'settings\'=\'' + json.regions.update[i].settings + '\' WHERE \'rid\'=' + json.regions.update[i].rid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}
							perform_region[perform_region.length] = 'UPDATE regions SET \'node_type\'=\'' + json.regions.update.node_type + '\' , \'label\'=\'' + json.regions.update.label + '\', \'region_name\'=\'' + json.regions.update.region_name + '\', \'weight\'=' + json.regions.update.weight + ', \'settings\'=\'' + json.regions.update.settings + '\' WHERE \'rid\'=' + json.regions.update.rid;
						}
						Ti.API.info("Updated Regions sucefully!");
					}

					//Delete - Regions
					if (json.regions["delete"]) {
						Ti.API.info('####################### Regions delete');
						if (json.regions["delete"].length) {
							for (var i = 0; i < json.regions["delete"].length; i++) {
								if (progress != null) {
									//Increment Progress Bar
									progress.set();
								}
								perform_region[perform_region.length] = 'DELETE FROM regions WHERE "rid"=' + json.regions["delete"][i].rid;
							}
						} else {
							if (progress != null) {
								//Increment Progress Bar
								progress.set();
							}
							perform_region[perform_region.length] = 'DELETE FROM regions WHERE "rid"=' + json.regions["delete"].rid;
						}
						Ti.API.info("Deleted Regions sucefully!");
					}

					if (perform_region.length > 0) {
						Ti.API.info('####################### Regions install');
						var iRegion = 0;
						var iStart = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Regions started at : " + iStart);
						db_installMe.execute("BEGIN IMMEDIATE TRANSACTION");
						while (iRegion <= perform_region.length - 1) {
							db_installMe.execute(perform_region[iRegion]);
							iRegion++;
						}
						db_installMe.execute("COMMIT TRANSACTION");
						var iEnd = Math.round(new Date().getTime() / 1000);
						Ti.API.info("Region finishes at : " + iEnd);
						var iResult = iEnd - iStart;
						Ti.API.info('Region seconds: ' + iResult);
						Ti.API.info("Region ended!");
					}
				}

				Ti.API.info("SUCCESS");
				if (progress != null) {
					progress.close();
				}
				db_installMe.close();
				var d = new Date();
				Titanium.App.Properties.setDouble("lastSynced", d.getTime());

				if (type_request == 'POST') {
					updateFileUploadTable(win, json);
				}

				if (mode == 1) {
					if (PLATFORM == 'android') {
						Ti.UI.createNotification({
							message : 'The ' + _node_name + ' was updated successfully',
							duration : Ti.UI.NOTIFICATION_DURATION_LONG
						}).show();
					} else {
						alert('The ' + _node_name + ' was updated successfully');
					}
					//Just to make sure database keeps locked

					//setUse();
					unsetUse();
					close_parent();
					uploadFile(win, 'POST');
					
				} else if (mode == 0) {
					if (PLATFORM == 'android') {
						Ti.UI.createNotification({
							message : 'The ' + _node_name + ' was created successfully.',
							duration : Ti.UI.NOTIFICATION_DURATION_LONG
						}).show();
					} else {
						alert('The ' + _node_name + ' was created successfully.');
					}
					//Just to make sure database keeps locked

					//setUse();
					unsetUse();
					close_parent();
					uploadFile(win, 'POST');
				} else {
					unsetUse();
					uploadFile(win, type_request)
				}
			}
		} else {
			if (progress != null) {
				progress.close();
			}

			Titanium.Media.vibrate();

			var a_msg = Titanium.UI.createAlertDialog({
				title : 'Omadi',
				buttonNames : ['OK']
			});

			a_msg.message = "We are sorry, but the server has diconnected you. Don't worry though, we will help you to get to the login window again";
			a_msg.show();

			a_msg.addEventListener('click', function(e) {
				unsetUse();

				Ti.App.Properties.setString('logStatus', "The server logged you out");
				Ti.API.info('From Functions ... Value is : '+ Ti.App.Properties.getString('logStatus'));
				if( getDeviceTypeIndentifier() == "android"){
					Ti.App.fireEvent('stop_gps');
				}
				Ti.App.fireEvent('free_login');
				win2.close();
			});
		}
	}
	//Connection error:
	objectsUp.onerror = function(e) {
		Ti.API.error('Code status: ' + e.error);
		Ti.API.info("Progress bar = " + progress);
		if (progress != null) {
			progress.close();

			Titanium.Media.vibrate();

			var a_msg = Titanium.UI.createAlertDialog({
				title : 'Omadi',
				buttonNames : ['Yes', 'No'],
				cancel : 1,
				click_index : e.index,
				sec_obj : e.section,
				row_obj : e.row
			});

			a_msg.message = "There was a network error, and your data could not be synched. Do you want to retry now? Error description: " + e.error;
			if(this.status == 403 || elements.status == 403) {
				a_msg.message = "You have been logged out. Please log back in."
				a_msg.addEventListener('click', function(e) {
					if(getDeviceTypeIndentifier() == "android") {
						Ti.App.fireEvent('stop_gps');
					}
					Ti.App.fireEvent('free_login');
					win.close();
				});
			}

				
			a_msg.show();

			a_msg.addEventListener('click', function(e) {
				if (PLATFORM == "android"){
					if (e.index != 1) {
						setTimeout(function() {
							progress = null;
							progress = new Progress_install(0, 100);
							installMe(pageIndex, win, timeIndex, progress, menu, img, type_request, mode, close_parent);
						}, 800);
					} else {
						unsetUse();
					}
				}
				else{
					if (e.cancel === false) {
						setTimeout(function() {
							progress = null;
							progress = new Progress_install(0, 100);
							installMe(pageIndex, win, timeIndex, progress, menu, img, type_request, mode, close_parent);
						}, 800);
					} else {
						unsetUse();
					}
				}
			});
		}

		Ti.API.info('Request type: ' + type_request + ' progress value: ' + progress);
		if ((type_request == 'POST') && (progress != null)) {
			if (PLATFORM == 'android') {
				Ti.UI.createNotification({
					//message : 'Connection timed out, please try again',
					message : 'Error :: ' + e.error, //Change message for testing purpose
					duration : Ti.UI.NOTIFICATION_DURATION_LONG
				}).show();
			} else {
				//alert('Connection timed out, please try again');
				alert('Error :: ' + e.error);
				//Change message for testing purpose
			}
		} else if (mode == 0) {
			if (PLATFORM == 'android') {
				Ti.UI.createNotification({
					//message : 'An error happened while we tried to connect to the server in order to transfer the recently updated node, please make a manual update',
					message : 'Error :: ' + e.error, //Change message for testing purpose
					duration : Ti.UI.NOTIFICATION_DURATION_LONG
				}).show();
			} else {
				//alert('An error happened while we tried to connect to the server in order to transfer the recently updated node, please make a manual update');
				alert('Error :: ' + e.error);
				//Change message for testing purpose
			}
			close_parent();
		} else if (mode == 1) {
			if (PLATFORM == 'android') {
				Ti.UI.createNotification({
					//message : 'An error happened while we tried to connect to the server in order to transfer the recently saved node, please make a manual update',
					message : 'Error :: ' + e.error, //Change message for testing purpose
					duration : Ti.UI.NOTIFICATION_DURATION_LONG
				}).show();
			} else {
				//alert('An error happened while we tried to connect to the server in order to transfer the recently saved node, please make a manual update');
				alert('Error :: ' + e.error);
				//Change message for testing purpose
			}
			close_parent();
		}

		db_installMe.close();
		unsetUse();

		Ti.API.info("Services are down");
	}
	app_timestamp = Math.round(+new Date().getTime() / 1000);
	Ti.API.info('App Time: ' + app_timestamp);
	//Get upload JSON
	if (type_request == 'POST') {
		var insert_JSON = getJSON();
		while (Titanium.Network.online === false);
		objectsUp.send(insert_JSON);
	} else {
		//Sending information and try to connect
		while (Titanium.Network.online === false);
		objectsUp.send();
	}

}

//Function Opens a new window to display descAux [Description?].
//The window closes when it receives a click event
function openBigText(descAux) {
	var descWin = Ti.UI.createWindow({
		backgroundColor : '#00000000'
	});
	var tanslucent = Ti.UI.createView({
		backgroundColor : 'black',
		opacity : 0.5
	});
	tanslucent.top = tanslucent.bottom = tanslucent.right = tanslucent.left = 0;
	var baseView = Ti.UI.createView({
		backgroundColor : '#424242',
		left : 5,
		right : 5,
		height : '250'
	});
	descWin.add(tanslucent);
	descWin.add(baseView);

	//Header where the selected name is presented
	var descHeader = Ti.UI.createView({
		backgroundImage : '../images/header.png',
		top : '1',
		height : '38',
		left : 1,
		right : 1
	});
	var labelDescContent = Ti.UI.createLabel({
		text : 'Desciption',
		left : 5,
		height : 30,
		width : Ti.Platform.displayCaps.platformWidth - 10,
		color : '#fff',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 18,
			fontWeight : 'bold',

		},
		ellipsize : true,
		wordWrap : false
	});
	var close_btn = Ti.UI.createImageView({
		height : 30,
		width : 25,
		top : 4,
		right : 5,
		image : '../images/close.png'
	});
	baseView.add(descHeader);
	descHeader.add(labelDescContent);
	descHeader.add(close_btn);

	var textDesc = Ti.UI.createTextArea({
		top : 40,
		bottom : 1,
		left : 1,
		right : 1,
		value : descAux,
		color : "blue",
		editable : false,
		backgroundColor : '#fff',
		backgroundImage : '',
		font : {
			fontSize : 12
		}
	});

	baseView.add(textDesc);

	descWin.open();

	close_btn.addEventListener('click', function() {
		descWin.close();
	});
	tanslucent.addEventListener('click', function() {
		descWin.close();
	});
}

function verify_UTC(date_original) {
	//discover if is GMT+ or GMT-
	if ((date_original.getFullYear() - date_original.getUTCFullYear()) < 0) {
		Ti.API.info('Timezone is negative');
		return -1;
	} else if ((date_original.getFullYear() - date_original.getUTCFullYear()) < 0) {
		Ti.API.info('Timezone is positive');
		return 1;
	} else {
		if ((date_original.getMonth() - date_original.getUTCMonth()) < 0) {
			Ti.API.info('Timezone is negative');
			return -1;
		} else if ((date_original.getMonth() - date_original.getUTCMonth()) < 0) {
			Ti.API.info('Timezone is positive');
			return 1;
		} else {
			if ((date_original.getDate() - date_original.getUTCDate()) < 0) {
				Ti.API.info('Timezone is negative');
				return -1;
			} else if ((date_original.getDate() - date_original.getUTCDate()) < 0) {
				Ti.API.info('Timezone is positive');
				return 1;
			} else {
				if ((date_original.getHours() - date_original.getUTCHours()) < 0) {
					Ti.API.info('Timezone is negative');
					return -1;
				} else {
					Ti.API.info('Timezone is positive');
					return 1;
				}
			}
		}
	}
}

function timeConverter(UNIX_timestamp, type) {
	var a = new Date(UNIX_timestamp * 1000);

	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();

	if (min < 10) {
		min = '0' + min;
	}

	if (type != "1") {
		var time = month + " / " + date + " / " + year;
		return time;
	} else {
		var time = display_omadi_time01(UNIX_timestamp) + " - " + month + " / " + date + " / " + year;
		return time;
	}

}

function display_omadi_time01(timestamp) {
	var time = timestamp * 1000;

	var got_time = new Date(time);

	var hours = got_time.getHours();
	var min = got_time.getMinutes();

	//return hours + ":" + form_min(min);
	return date(omadi_time_format, got_time);
}

function setUse() {
	var db_su = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	db_su.execute('UPDATE updated SET updating = 1 ');
	Ti.API.info("DB WAS JUST SET");
	db_su.close();
}

function unsetUse() {
	var db_us = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	db_us.execute('UPDATE updated SET updating = 0 ');
	Ti.API.info("DB WAS JUST UNSET");
	db_us.close();
}

function isUpdating() {
	var db_gu = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	var res_set = db_gu.execute('SELECT updating FROM updated WHERE rowid=1');

	if (res_set.fieldByName('updating') == 1) {
		res_set.close();
		db_gu.close();
		Ti.API.info("App is updating");
		return true;
	} else {
		res_set.close();
		db_gu.close();
		Ti.API.info("App is idle");
		return false;
	}

}

function getDeviceTypeIndentifier() {
	if (Ti.Platform.osname == 'android') {
		return 'android';
	} else {
		if (Ti.Platform.osname == 'ipad') {
			return 'ipad';
		} else {
			if (getScreenWidth() > 320) {
				return 'iphone4';
			} else {
				return 'iphone3';
			}
		}
	}
}

function getOSIdentifier() {
	switch(Ti.Platform.osname) {
		case "android":
			return "android";
			break;
		case "ipad":
		case "iphone":
			return "ios";
			break;
		case "mobileweb":
			return "mobileweb";
			break;
		default:
			return "ios";
			break;
	}
}

function getOrientation() {
	var o = Ti.UI.currentWindow.orientation;
	if (o == Ti.UI.PORTRAIT || o == Ti.UI.UPSIDE_PORTRAIT) {
		return 'portrait';
	} else {
		return 'landscape';
	}
}

function getScreenWidth() {
	var o = getOrientation();
	var ret = 0;
	switch(o) {
		case 'portrait':
			ret = Ti.Platform.displayCaps.platformWidth;
			break;
		case 'landscape':
			ret = Ti.Platform.displayCaps.platformHeight;
			break;
	}
	return ret;
}

function getScreenHeight() {
	var o = getOrientation();
	var ret = 0;
	switch(o) {
		case 'portrait':
			ret = Ti.Platform.displayCaps.platformHeight;
			break;
		case 'landscape':
			ret = Ti.Platform.displayCaps.platformWidth;
			break;
	}
	return ret;
}

function uploadFile(win, type_request) {
	try {
		//var fileUploadXHR = win.log;
		var _file_xhr = Ti.Network.createHTTPClient();
		_file_xhr.setTimeout(30000);
		_file_xhr.open(type_request, win.picked + '/js-sync/upload.json');
		// Upload images
		var database = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
		var fileUploadTable = database.execute("SELECT * FROM file_upload_queue WHERE nid> 0;");
		if (fileUploadTable.isValidRow()) {
			//Only upload those images that have positive nids
			if (fileUploadTable.fieldByName('nid') > 0) {
				_file_xhr.onload = function(e) {
					Ti.API.info('=========== Success ========' + this.responseText);
					var respnseJson = JSON.parse(this.responseText);
					
					database = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
					fileUploadTable = database.execute("SELECT * FROM file_upload_queue WHERE nid> 0;");

					// Updating status
					var table = database.execute("SELECT table_name FROM node WHERE nid=" + respnseJson.nid + ";");
					var fieldSettings = database.execute("SELECT settings FROM fields WHERE bundle='" + table.fieldByName('table_name') + "' and type='image' and field_name='" + respnseJson.field_name + "';");

					var settings = JSON.parse(fieldSettings.fieldByName('settings'));
					if (settings.cardinality > 1 || settings.cardinality < 0) {
						var array_cont = database.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + respnseJson.nid + ' AND field_name = \'' + respnseJson.field_name + '\'');
						var decoded_values = [];
						if (array_cont.rowCount > 0) {
							var decoded = array_cont.fieldByName('encoded_array');
							if (decoded != null || decoded != "") {
								decoded = Base64.decode(decoded);
								Ti.API.info('Decoded array is equals to: ' + decoded);
								decoded = decoded.toString();
								decoded_values = decoded.split("j8Oc2s1E");
							}
						}

						if (respnseJson.delta < decoded_values.length) {
							decoded_values[respnseJson.delta] = respnseJson.file_id;
						} else {
							decoded_values.push(respnseJson.file_id);
						}
						var content = '';
						for ( i = 0; i < decoded_values.length; i++) {
							if (i == decoded_values.length - 1) {
								content += decoded_values[i];
							} else {
								content += decoded_values[i] + '' + "j8Oc2s1E";
							}
						}
						content = Base64.encode(content);
						database.execute("UPDATE " + table.fieldByName('table_name') + " SET " + respnseJson.field_name + "='7411317618171051229', " + respnseJson.field_name + "___file_id='7411317618171051229', " + respnseJson.field_name + "___status='7411317618171051229' WHERE nid='" + respnseJson.nid + "';");
						database.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + respnseJson.nid + ', \'' + respnseJson.field_name + "___file_id" + '\',  \'' + content + '\' )');
						database.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + respnseJson.nid + ', \'' + respnseJson.field_name + '\',  \'' + content + '\' )');
					} else {
						database.execute("UPDATE " + table.fieldByName('table_name') + " SET " + respnseJson.field_name + "='" + respnseJson.file_id + "', " + respnseJson.field_name + "___file_id='" + respnseJson.file_id + "', " + respnseJson.field_name + "___status='uploaded' WHERE nid='" + respnseJson.nid + "';");
					}
					//Deleting file after upload.
					database.execute("DELETE FROM file_upload_queue WHERE nid=" + respnseJson.nid + " and delta=" + respnseJson.delta + " and field_name='" + respnseJson.field_name + "';");
					fileUploadTable = database.execute("SELECT * FROM file_upload_queue WHERE nid > 0;");
					var remainingRow = fileUploadTable.rowCount;
					table.close();
					fieldSettings.close();
					fileUploadTable.close();
					database.close();
					if (remainingRow != 0) {
						uploadFile(win, type_request);
					} 
				}

				_file_xhr.onerror = function(e) {
					Ti.API.info('=========== Error in uploading ========' + this.error + this.status);
					if (this.status == '406' && this.error == 'Nid is not connected to a valid node.') {
						var database = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
						database.execute("DELETE FROM file_upload_queue WHERE nid=" + fileUploadTable.fieldByName('nid') + " and id=" + fileUploadTable.fieldByName('id') + ";");
						database.close();
					}
					
				}

				_file_xhr.setRequestHeader("Content-Type", "application/json");

				if (PLATFORM == 'android') {
					_file_xhr.send('{"file_data"	:"' + fileUploadTable.fieldByName('file_data') + '", "filename"	:"' + fileUploadTable.fieldByName('file_name') + '", "nid"		:"' + fileUploadTable.fieldByName('nid') + '", "field_name":"' + fileUploadTable.fieldByName('field_name') + '", "delta"		:' + fileUploadTable.fieldByName('delta') + '}');

				} else {
					_file_xhr.send({
						file_data : fileUploadTable.fieldByName('file_data'),
						filename : fileUploadTable.fieldByName('file_name'),
						nid : fileUploadTable.fieldByName('nid'),
						field_name : fileUploadTable.fieldByName('field_name'),
						delta : fileUploadTable.fieldByName('delta')
					});
				}
				
				fileUploadTable.close();
				database.close();
			}
		}
	} catch(e) {
		Ti.API.info("==== ERROR ===" + e);
	}
}

// To reduce image
function reduceImageSize(blobImage, maxWidth, maxHeight) {
	try{
		var image1 = Titanium.UI.createImageView({
			image : blobImage,
			width : 'auto',
			height : 'auto'
		});
		var imageBlob = image1.toBlob();
		var multiple;
		if(imageBlob.height / imageBlob.width > maxHeight / maxWidth) {
			multiple = imageBlob.height / maxHeight;
		} else {
			multiple = imageBlob.width / maxWidth;
		}

		if(multiple >= 1) {
			image1.height = parseInt(imageBlob.height / multiple);
			image1.width = parseInt(imageBlob.width / multiple);
			image1.image = image1.toImage();
		} else {

		}
		return image1;
	}catch(evt){}
	
}

function updateFileUploadTable(win, json) {
	try {
		if (json.total_item_count == 0) {
			close_parent();
			return;
		}
		var db_fileUpload = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

		// To replace all negative nid to positive in file_upload_queue table
		var bundles = db_fileUpload.execute('SELECT * FROM bundles;');
		while (bundles.isValidRow()) {
			var name_table = bundles.fieldByName("bundle_name");
			if (json.node && json.node[name_table]) {
				if (json.node[name_table].insert) {
					for ( i = 0; i < json.node[name_table].insert.length; i++) {
						var insertedNode = json.node[name_table].insert[i];
						if (insertedNode.__negative_nid) {
							db_fileUpload.execute("UPDATE file_upload_queue SET nid =" + insertedNode.nid + " WHERE nid=" + insertedNode.__negative_nid);
						}
					}
				}
			}
			bundles.next();
		}
		bundles.close();
		db_fileUpload.close();
	} catch(evt) {
	}
}

// Download Image from the server
function downloadThumnail(file_id, image, win) {
	var URL = win.picked + DOWNLOAD_URL_THUMBNAIL + win.nid + '/' + file_id;
	Ti.API.info("==== site:: " + URL);
	try {
		var downloadImage = Ti.Network.createHTTPClient();
		downloadImage.setTimeout(30000);
		downloadImage.open('GET', URL);

		downloadImage.onload = function(e) {
			var tempImg = Ti.UI.createImageView({
				height : 'auto',
				width : 'auto',
				image : this.responseData
			});
			if (tempImg.toImage().height > 100 || tempImg.toImage().width > 100) {
				image.image = reduceImageSize(tempImg.toImage(), 100, 100).toBlob();
			} else {
				image.image = this.responseData
			}
			image.isImage = true;
		}

		downloadImage.onerror = function(e) {
			image.image = '../images/default.png';
		}

		downloadImage.send();
	} catch(e) {
		Ti.API.info("==== ERROR ===" + e);
	}
}

function downloadMainImage(file_id, content, win) {
	var actInd = Ti.UI.createActivityIndicator();
	actInd.font = {
		fontFamily : 'Helvetica Neue',
		fontSize : 15,
		fontWeight : 'bold'
	};
	actInd.color = 'white';
	actInd.message = 'Loading...';
	actInd.show();
	if (content.bigImg != null) {
		showImage(content, actInd);
		return;
	}

	var URL = win.picked + DOWNLOAD_URL_IMAGE_FILE + win.nid + '/' + file_id;
	Ti.API.info("==== site:: " + URL);
	try {
		var downloadImage = Ti.Network.createHTTPClient();
		downloadImage.setTimeout(30000);
		downloadImage.open('GET', URL);

		downloadImage.onload = function(e) {
			Ti.API.info('=========== Success ========');
			content.bigImg = this.responseData;
			showImage(content, actInd);
		}

		downloadImage.onerror = function(e) {
			actInd.hide();
		}
		downloadImage.send();
	} catch(e) {
		actInd.hide();
		Ti.API.info("==== ERROR ===" + e);
	}
}

function showImage(source, actInd) {
	var imageWin = Ti.UI.createWindow({
		backgroundColor : '#00000000',
	});
	imageWin.orientation = [Ti.UI.PORTRAIT];

	var tanslucent = Ti.UI.createView({
		backgroundColor : 'black',
		opacity : 0.7,
		top : 0,
		bottom : 0,
		right : 0,
		left : 0
	});
	imageWin.add(tanslucent);
	//Header part
	var header = Ti.UI.createView({
		backgroundImage : '../images/header.png',
		height : '40',
		top : 0
	});
	header.top = header.left = header.right = 0
	var labelDesc = Ti.UI.createLabel({
		text : source.label,
		left : 5,
		height : 30,
		width : Ti.Platform.displayCaps.platformWidth - 10,
		color : '#fff',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 18,
			fontWeight : 'bold',

		},
		ellipsize : true,
		wordWrap : false
	});
	var close_btn = Ti.UI.createImageView({
		height : 30,
		width : 25,
		top : 4,
		right : 5,
		image : '../images/close.png'
	});
	imageWin.add(header);
	header.add(labelDesc);
	header.add(close_btn);

	var fullImage = reduceImageSize(source.bigImg, Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight - 50);
	fullImage.canScale = true;
	var imageBaseView = Ti.UI.createView({
		top : 38,
		right : 0,
		left : 0,
		bottom : 0
	});
	close_btn.addEventListener('click', function(e) {
		imageWin.close();
	});
	imageBaseView.add(fullImage);
	imageWin.add(imageBaseView);
	actInd.hide();
	imageWin.open();
}

function clearCache() {
	var path = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDirectory).getParent();
	var cookies = Ti.Filesystem.getFile(path + '/Library/Cookies', 'Cookies.binarycookies');
	if (cookies.exists()) {
		cookies.deleteFile();
	}

}

function node_load(db_display, nid) {
	var parent_node = new Array();
	var table = db_display.execute('SELECT table_name FROM node WHERE nid = ' + nid);
	table = table.fieldByName('table_name');
	var node_data = db_display.execute('SELECT * FROM ' + table + ' WHERE nid=' + nid);
	return node_data;
}

function _calculation_field_sort_on_weight(a, b) {
	if (a['weight'] != null && a['weight'] != "" && b['weight'] != null && b['weight'] != "") {
		return a['weight'] > b['weight'];
	}
	return 0;
}

function _calculation_field_get_values(win, db_display, instance, entity, content) {
	//Ti.API.info('here--------0.1' + instance.field_name + ", mode: " + win.mode);
	var calculated_field_cache = [];
	var final_value = 0;
	if (instance.settings.calculation.items != null && !instance.disabled) {
		var row_values = [];
		if (instance.value != null && instance.value != "") {
			cached_final_value = instance.value;
		} else {
			cached_final_value = 0;
		}

		usort(instance['settings']['calculation']['items'], '_calculation_field_sort_on_weight');

		for (var idx in instance.settings.calculation.items) {
			var calculation_row = instance.settings.calculation.items[idx];
			var value = 0;
			var field_1_multiplier = 0;
			var field_2_multiplier = 0;
			var numeric_multiplier = 0;
			calculated_field_cache = new Array();
			if (calculation_row.field_name_1 != null && entity[calculation_row.field_name_1] != null && entity[calculation_row.field_name_1][0]['field_type'] == 'calculation_field') {
				// Make sure a dependency calculation is made first
				// TODO: Statically cache these values for future use by other calculation fields
				// TODO: Make sure an infinite loop doesn't occur
				//Ti.API.info('here--------0.2');
				required_instance_final_values = _calculation_field_get_values(win, db_display, content[entity[calculation_row.field_name_1][0]['reffer_index']], entity, content);
				//Ti.API.info('here--------0.3' + required_instance_final_values[0].final_value);
				calculated_field_cache[calculation_row.field_name_1] = required_instance_final_values[0].final_value;
			}

			if (calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
				//Ti.API.info('here--------0.4' + calculation_row.field_name_1 + "," + calculated_field_cache[calculation_row.field_name_1]);
				if (calculated_field_cache[calculation_row.field_name_1] != null) {
					//Ti.API.info('here--------0.5' + calculated_field_cache[calculation_row.field_name_1]);
					field_1_multiplier = calculated_field_cache[calculation_row.field_name_1];
				} else if (calculation_row.type == 'parent_field_value') {
					//Ti.API.info('here--------0.6' + calculation_row.parent_field);
					parent_field = calculation_row.parent_field;
					if (entity[parent_field] != null && entity[parent_field][0]['nid'] != null) {
						parent_node = node_load(db_display, entity[parent_field][0]['nid']);
						if (parent_node.rowCount > 0 && parent_node.fieldByName(calculation_row.field_name_1) != null) {
							field_1_multiplier = parent_node.fieldByName(calculation_row.field_name_1);
							//Ti.API.info('here--------0.7' + field_1_multiplier);
						}
					}
				} else if (entity[calculation_row.field_name_1] != null && entity[calculation_row.field_name_1][0]['value'] != null) {
					field_1_multiplier = entity[calculation_row.field_name_1][0]['value'];
					//Ti.API.info('here--------0.8' + field_1_multiplier);
				}
				if (calculation_row.datestamp_end_field != null && calculation_row.datestamp_end_field != "") {
					//Ti.API.info('here--------0.9' + field_1_multiplier);
					start_timestamp = field_1_multiplier;
					// Set this end value to 0 in case the terminating datestamp field is empty
					field_1_multiplier = 0;
					if (entity[calculation_row.datestamp_end_field] != null && entity[calculation_row.datestamp_end_field][0]['value'] != null) {
						end_timestamp = entity[calculation_row.datestamp_end_field][0]['value'];
						//Ti.API.info('here--------0.10' + end_timestamp);
						if (calculation_row.type == 'time-only') {
							//Ti.API.info('here--------0.11' + calculation_row.type);
							if (end_timestamp < start_timestamp) {
								//Ti.API.info('here--------0.12' + start_timestamp);
								end_timestamp += (24 * 3600);
							}
						}

						difference = end_timestamp - start_timestamp;

						switch(calculation_row.datestamp_interval) {
							case 'minute':
								field_1_multiplier = difference / 60;
								//Ti.API.info('here--------0.13' + field_1_multiplier);
								break;
							case 'hour':
								field_1_multiplier = difference / 3600;
								//Ti.API.info('here--------0.14' + field_1_multiplier);
								break;
							case 'day':
								field_1_multiplier = difference / (3600 * 24);
								//Ti.API.info('here--------0.15' + field_1_multiplier);
								break;
							case 'week':
								field_1_multiplier = difference / (3600 * 24 * 7);
								//Ti.API.info('here--------0.16' + field_1_multiplier);
								break;
						}
						if (calculation_row.type == 'time') {
							//Ti.API.info('here--------0.17' + calculation_row.type);
							if (calculation_row.interval_rounding == 'up') {
								field_1_multiplier = Math.ceil(field_1_multiplier);
								//Ti.API.info('here--------0.18' + field_1_multiplier);
							} else if (calculation_row.interval_rounding == 'down') {
								field_1_multiplier = Math.floor(field_1_multiplier);
								//Ti.API.info('here--------0.19' + field_1_multiplier);
							} else if (calculation_row.interval_rounding == 'integer') {
								field_1_multiplier = Math.round(field_1_multiplier);
								//Ti.API.info('here--------0.20' + field_1_multiplier);
							} else if (calculation_row.interval_rounding == 'increment-at-time') {
								//Ti.API.info('here--------0.21' + calculation_row.increment_at_time);
								at_time = calculation_row.increment_at_time;
								start_timestamp = Number(start_timestamp);
								relative_increment_time = at_time = mktime(0, 0, 0, date('n', start_timestamp), date('j', start_timestamp), date('Y', start_timestamp));
								//Ti.API.info('here--------0.22' + relative_increment_time + "," + end_timestamp);
								day_count = 0;
								if (relative_increment_time < start_timestamp) {
									relative_increment_time += (3600 * 24);
									//Ti.API.info('here--------0.23' + relative_increment_time);
								}

								while (relative_increment_time <= end_timestamp) {
									day_count++;
									relative_increment_time += (3600 * 24);
									//	Ti.API.info('here--------0.24' + relative_increment_time );
								}

								field_1_multiplier = day_count;
							}
						}
					}
				}

			}

			if (calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
				//Ti.API.info('here--------1' + calculation_row.field_name_2);
				if (calculated_field_cache[calculation_row.field_name_1] != null) {
					field_2_multiplier = calculated_field_cache[calculation_row.field_name_2];
					//Ti.API.info('here--------2' + field_2_multiplier);
				} else if (calculation_row.type == 'parent_field_value') {
					parent_field = calculation_row.parent_field;
					//Ti.API.info('here--------3' + parent_field);
					if (entity[parent_field] != null && entity[parent_field][0]['nid'] != null) {
						parent_node = node_load(db_display, entity[parent_field][0]['nid']);
						//Ti.API.info('here--------4' + parent_field);
						if (parent_node.rowCount > 0 && parent_node.fieldByName(calculation_row.field_name_2) != null) {
							field_2_multiplier = parent_node.fieldByName(calculation_row.field_name_2);
							//Ti.API.info('here--------5' + field_2_multiplier);
						}
					}
				} else if (entity[calculation_row.field_name_2] != null && entity[calculation_row.field_name_2][0]['value'] != null) {
					field_2_multiplier = entity[calculation_row.field_name_2][0]['value'];
					//Ti.API.info('here--------6' + field_2_multiplier);
				}
			}

			if (calculation_row.numeric_multiplier != null && calculation_row.numeric_multiplier != "") {
				numeric_multiplier = Number(calculation_row.numeric_multiplier);
				//Ti.API.info('here--------7' + numeric_multiplier);
			}

			var zero = false;

			if (calculation_row.criteria != null && calculation_row.criteria.search_criteria != null) {
				//Ti.API.info('here--------8' + calculation_row.criteria);
				if (!list_search_node_matches_search_criteria(win, db_display, entity, calculation_row.criteria, content)) {
					//Ti.API.info('here--------9');
					zero = true;
				}
			}

			var value = 0;
			if (field_1_multiplier == 0 && calculation_row.field_name_1 != null && calculation_row.field_name_1 != "") {
				//Ti.API.info('here--------10');
				zero = true;
			} else if (value == 0 && field_1_multiplier != 0) {
				//Ti.API.info('here--------11');
				value = field_1_multiplier;
			}

			if (field_2_multiplier == 0 && calculation_row.field_name_2 != null && calculation_row.field_name_2 != "") {
				//Ti.API.info('here--------12');
				zero = true;
			} else if (value == 0 && field_2_multiplier != 0) {
				//Ti.API.info('here--------13');
				value = Number(field_2_multiplier);
			} else if (value != 0 && field_2_multiplier != 0) {
				//Ti.API.info('here--------14');
				value *= Number(field_2_multiplier);
			}

			if (value == 0 && numeric_multiplier != 0) {
				//Ti.API.info('here--------15');
				value = Number(numeric_multiplier);
			} else if (value != 0 && numeric_multiplier != 0) {
				//Ti.API.info('here--------16');
				value *= Number(numeric_multiplier);
			}

			// if(calculation_row.type!=null && calculation_row.type=='static'){
			// Ti.API.info('here--------17' );
			// zero = false;
			// }
			if (zero) {
				//Ti.API.info('here--------18');
				value = 0;
			}

			row_values.push({
				'row_label' : (calculation_row.row_label != null && calculation_row.row_label != "") ? calculation_row.row_label : '',
				'value' : value
			});
			//alert('field_1_multiplier : ' + field_1_multiplier);
			//alert('field_2_multiplier : ' + field_2_multiplier);
			//alert('numeric_multiplier : ' + numeric_multiplier);
			//alert('Value : ' + value);
			final_value += Number(value);
			//Ti.API.info('here--------19' + final_value);
		}
		//	alert("final value: " + final_value);
		return new Array({
			'cached_final_value' : cached_final_value,
			'final_value' : final_value,
			'rows' : row_values,
		});

	}
	return new Array();
}

function omadi_fields_get_fields(win, db_display) {
	try {
		var fields = new Array();
		var unsorted_res = new Array();
		var regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win.type + '" ORDER BY weight ASC');
		var fields_result = db_display.execute('SELECT * FROM fields WHERE bundle = "' + win.type + '" ORDER BY weight ASC');

		while (fields_result.isValidRow()) {
			unsorted_res.push({
				label : fields_result.fieldByName('label'),
				type : fields_result.fieldByName('type'),
				field_name : fields_result.fieldByName('field_name'),
				settings : fields_result.fieldByName('settings'),
				widget : fields_result.fieldByName('widget')
			});
			fields_result.next();
		}

		while (regions.isValidRow()) {

			var reg_settings = JSON.parse(regions.fieldByName('settings'));

			if (reg_settings != null && reg_settings.display_disabled) {
				Ti.API.info('Region : ' + regions.fieldByName('label') + ' won\'t appear');
			} else {
				fields[regions.fieldByName('region_name')] = new Array();
				fields[regions.fieldByName('region_name')]['label'] = regions.fieldByName('label');
				fields[regions.fieldByName('region_name')]['type'] = 'region_separator_mode';
				fields[regions.fieldByName('region_name')]['settings'] = regions.fieldByName('settings');
				for (var i in unsorted_res) {
					var settings = JSON.parse(unsorted_res[i].settings);
					if (regions.fieldByName('region_name') == settings.region) {
						fields[unsorted_res[i].field_name] = new Array();
						fields[unsorted_res[i].field_name]['label'] = unsorted_res[i].label;
						fields[unsorted_res[i].field_name]['type'] = unsorted_res[i].type;
						fields[unsorted_res[i].field_name]['settings'] = unsorted_res[i].settings;
						fields[unsorted_res[i].field_name]['widget'] = unsorted_res[i].widget;
						fields[unsorted_res[i].field_name]['field_name'] = unsorted_res[i].field_name;
					}
				}
			}
			regions.next();
		}
		return fields;
	} catch(evt) {
		return null;
	}
}

// PHP equivelent function in javaScript----START
function mktime() {
	var no, ma = 0, mb = 0, i = 0, d = new Date(), argv = arguments, argc = argv.length;

	if (argc > 0) {
		d.setHours(0, 0, 0);
		d.setDate(1);
		d.setMonth(1);
		d.setYear(1972);
	}

	var dateManip = {
		0 : function(tt) {
			return d.setHours(tt);
		},
		1 : function(tt) {
			return d.setMinutes(tt);
		},
		2 : function(tt) {
			var set = d.setSeconds(tt);
			mb = d.getDate() - 1;
			return set;
		},
		3 : function(tt) {
			var set = d.setMonth(parseInt(tt) - 1);
			ma = d.getFullYear() - 1972;
			return set;
		},
		4 : function(tt) {
			return d.setDate(tt + mb);
		},
		5 : function(tt) {
			return d.setYear(tt + ma);
		}
	};

	for ( i = 0; i < argc; i++) {
		no = parseInt(argv[i] * 1);
		if (isNaN(no)) {
			return false;
		} else {
			// arg is number, let's manipulate date object
			if (!dateManip[i](no)) {
				// failed
				return false;
			}
		}
	}

	return Math.floor(d.getTime() / 1000);
}

function date(format, timestamp) {

	var a, jsdate = (( typeof (timestamp) == 'undefined') ? new Date() : ( typeof (timestamp) == 'number') ? new Date(timestamp * 1000) : new Date(timestamp)
	);
	var pad = function(n, c) {
		if (( n = n + "").length < c) {
			return new Array(++c - n.length).join("0") + n;
		} else {
			return n;
		}
	};
	var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var txt_ordin = {
		1 : "st",
		2 : "nd",
		3 : "rd",
		21 : "st",
		22 : "nd",
		23 : "rd",
		31 : "st"
	};
	var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var f = {
		// Day
		d : function() {
			return pad(f.j(), 2);
		},
		D : function() {
			var t = f.l();
			return t.substr(0, 3);
		},
		j : function() {
			return jsdate.getDate();
		},
		l : function() {
			return txt_weekdays[f.w()];
		},
		N : function() {
			return f.w() + 1;
		},
		S : function() {
			return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
		},
		w : function() {
			return jsdate.getDay();
		},
		z : function() {
			return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
		},

		// Week
		W : function() {
			var a = f.z(), b = 364 + f.L() - a;
			var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

			if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
				return 1;
			} else {

				if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
					nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
					return date("W", Math.round(nd2.getTime() / 1000));
				} else {
					return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
				}
			}
		},

		// Month
		F : function() {
			return txt_months[f.n()];
		},
		m : function() {
			return pad(f.n(), 2);
		},
		M : function() {
			t = f.F();
			return t.substr(0, 3);
		},
		n : function() {
			return jsdate.getMonth() + 1;
		},
		t : function() {
			var n;
			if (( n = jsdate.getMonth() + 1) == 2) {
				return 28 + f.L();
			} else {
				if (n & 1 && n < 8 || !(n & 1) && n > 7) {
					return 31;
				} else {
					return 30;
				}
			}
		},

		// Year
		L : function() {
			var y = f.Y();
			return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
		},
		o : function() {
			if (f.n() === 12 && f.W() === 1) {
				return jsdate.getFullYear() + 1;
			}
			if (f.n() === 1 && f.W() >= 52) {
				return jsdate.getFullYear() - 1;
			}
			return jsdate.getFullYear();
		},
		Y : function() {
			return jsdate.getFullYear();
		},
		y : function() {
			return (jsdate.getFullYear() + "").slice(2);
		},

		// Time
		a : function() {
			return jsdate.getHours() > 11 ? "pm" : "am";
		},
		A : function() {
			return f.a().toUpperCase();
		},
		B : function() {
			// peter paul koch:
			var off = (jsdate.getTimezoneOffset() + 60) * 60;
			var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
			var beat = Math.floor(theSeconds / 86.4);
			if (beat > 1000)
				beat -= 1000;
			if (beat < 0)
				beat += 1000;
			if ((String(beat)).length == 1)
				beat = "00" + beat;
			if ((String(beat)).length == 2)
				beat = "0" + beat;
			return beat;
		},
		g : function() {
			return jsdate.getHours() % 12 || 12;
		},
		G : function() {
			return jsdate.getHours();
		},
		h : function() {
			return pad(f.g(), 2);
		},
		H : function() {
			return pad(jsdate.getHours(), 2);
		},
		i : function() {
			return pad(jsdate.getMinutes(), 2);
		},
		s : function() {
			return pad(jsdate.getSeconds(), 2);
		},
		u : function() {
			return pad(jsdate.getMilliseconds() * 1000, 6);
		},

		// Timezone
		//e not supported yet
		I : function() {
			var DST = (new Date(jsdate.getFullYear(), 6, 1, 0, 0, 0));
			DST = DST.getHours() - DST.getUTCHours();
			var ref = jsdate.getHours() - jsdate.getUTCHours();
			return ref != DST ? 1 : 0;
		},
		O : function() {
			var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
			if (jsdate.getTimezoneOffset() > 0)
				t = "-" + t;
			else
				t = "+" + t;
			return t;
		},
		P : function() {
			var O = f.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2));
		},
		//T not supported yet
		Z : function() {
			var t = -jsdate.getTimezoneOffset() * 60;
			return t;
		},

		// Full Date/Time
		c : function() {
			return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
		},
		r : function() {
			return f.D() + ', ' + f.d() + ' ' + f.M() + ' ' + f.Y() + ' ' + f.H() + ':' + f.i() + ':' + f.s() + ' ' + f.O();
		},
		U : function() {
			return Math.round(jsdate.getTime() / 1000);
		}
	};

	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s) {
		if (t != s) {
			// escaped
			ret = s;
		} else if (f[s]) {
			// a date function exists
			ret = f[s]();
		} else {
			// nothing special
			ret = s;
		}

		return ret;
	});
}

Number.prototype.toCurrency = function($O) {// extending Number prototype

	String.prototype.separate_thousands = function() {// Thousands separation
		$val = this;
		var rx = new RegExp('(-?[0-9]+)([0-9]{3})');
		while (rx.test($val)) {
			$val = $val.replace(rx, '$1' + $O.thousands_separator + '$2');
		}
		return $val;
	}

	Number.prototype.toFixed = function() {// Rounding
		var m = Math.pow(10, $O.use_fractions.fractions);
		return Math.round(this * m, 0) / m;
	}

	String.prototype.times = function(by) {// String multiplication
		by = (by >> 0);
		var t = (by > 1 ? this.times(by / 2) : '' );
		return t + (by % 2 ? t + this : t);
	}
	var $A = this;

	/* I like to keep all options, as the name would sugesst, **optional** :) so, let me make tham as such */
	$O ? null : $O = new Object;
	/* If no thousands_separator is present default to "," */
	$O.thousands_separator ? null : $O.thousands_separator = ",";
	/* If no currency_symbol is present default to "$" */
	$O.currency_symbol ? null : $O.currency_symbol = "";

	// Fractions use is separated, just in case you don't want them
	if ($O.use_fractions) {
		$O.use_fractions.fractions ? null : $O.use_fractions.fractions = 2;
		$O.use_fractions.fraction_separator ? null : $O.use_fractions.fraction_separator = ".";
	} else {
		$O.use_fractions = new Object;
		$O.use_fractions.fractions = 0;
		$O.use_fractions.fraction_separator = " ";
	}
	// We round this number
	$A.round = $A.toFixed();

	// We convert rounded Number to String and split it to integrer and fractions
	$A.arr = ($A.round + "").split(".");
	// First part is an integrer
	$A._int = $A.arr[0].separate_thousands();
	// Second part, if exists, are rounded decimals
	$A.arr[1] == undefined ? $A._dec = $O.use_fractions.fraction_separator + "0".times($O.use_fractions.fractions) : $A._dec = $O.use_fractions.fraction_separator + $A.arr[1] + "0".times($O.use_fractions.fractions - ($A.arr[1] + "").length);

	/* If no symbol_position is present, default to "front" */
	$O.symbol_position ? null : $O.symbol_position = "front";
	$O.symbol_position == "front" ? $A.ret = $O.currency_symbol + $A._int + $A._dec : $A.ret = $A._int + $A._dec + " " + $O.currency_symbol;
	return $A.ret;
}
var in_array = function(p_val, haystack) {
	for (var i = 0, l = haystack.length; i < l; i++) {
		if (haystack[i] == p_val) {
			return true;
		}
	}
	return false;
}
function isArray(input) {
	return typeof (input) == 'object' && ( input instanceof Array);
}

function strpos(haystack, needle, offset) {
	var i = (haystack + '').indexOf(needle, (offset || 0));
	return i === -1 ? false : i;
}

function count_arr_obj(mixed_var, mode) {
	if (mixed_var === null || typeof mixed_var === 'undefined') {
		return 0;
	} else if (mixed_var.constructor !== Array && mixed_var.constructor !== Object) {
		return 1;
	}

	if (mode === 'COUNT_RECURSIVE') {
		mode = 1;
	}
	if (mode != 1) {
		mode = 0;
	}
	var cnt = 0;
	for (key in mixed_var) {
		if (mixed_var.hasOwnProperty(key)) {
			cnt++;
			if (mode == 1 && mixed_var[key] && (mixed_var[key].constructor === Array || mixed_var[key].constructor === Object)) {
				cnt += this.count(mixed_var[key], 1);
			}
		}
	}

	return cnt;
}

function usort(inputArr, sorter) {
	var valArr = [], k = '', i = 0, strictForIn = false, populateArr = {};
	if ( typeof sorter === 'string') {
		sorter = this[sorter];
	} else if (Object.prototype.toString.call(sorter) === '[object Array]') {
		sorter = this[sorter[0]][sorter[1]];
	}
	// BEGIN REDUNDANT
	this.php_js = this.php_js || {};
	this.php_js.ini = this.php_js.ini || {};
	// END REDUNDANT
	strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
	populateArr = strictForIn ? inputArr : populateArr;

	for (k in inputArr) {// Get key and value arrays
		if (inputArr.hasOwnProperty(k)) {
			valArr.push(inputArr[k]);
			if (strictForIn) {
				delete inputArr[k];
			}
		}
	}
	try {
		valArr.sort(sorter);
	} catch (e) {
		return false;
	}
	for ( i = 0; i < valArr.length; i++) {// Repopulate the old array
		populateArr[i] = valArr[i];
	}
	return strictForIn || populateArr;
}

// PHP equivelent function in javaScript-----END

function _list_search_criteria_search_order(a, b) {
	if (a['weight'] != null && a['weight'] != "" && b['weight'] != null && b['weight'] != "") {
		return a['weight'] > b['weight'];
	}
	return 0;
}

function list_search_node_matches_search_criteria(win, db_display, entity, criteria, content) {
	try {
		var user;
		var row_matches = [];
		if (criteria.search_criteria != null && criteria.search_criteria != "") {
			//Ti.API.info('here--------A.1');
			var instances = omadi_fields_get_fields(win, db_display);
			//Ti.API.info('here--------A.2');
			usort(criteria['search_criteria'], '_list_search_criteria_search_order');
			for (var criteria_index in criteria.search_criteria) {
				//Ti.API.info('here--------A.3' + criteria.search_criteria[criteria_index]);
				var criteria_row = criteria.search_criteria[criteria_index];
				row_matches[criteria_index] = false;
				var field_name = criteria_row.field_name;
				//Ti.API.info('here--------A.4' + field_name);
				if (instances[field_name] != null) {
					var search_field = instances[field_name];
					//Ti.API.info('here--------A.5' + search_field['type']);
					var node_values = [];
					if (search_field['type'] == 'datestamp') {
						//Ti.API.info('here--------A.6' + search_field['type']);
						if ((field_name == 'uid' || field_name == 'created' || field_name == 'changed_uid') && win.nid != null & win.nid != "") {
							var node = db_display.execute('SELECT ' + field_name + ' from node WHERE nid="' + win.nid + '";');
							if (field_name == 'uid') {
								field_name = 'author_uid';
							}
							node_values.push(node.fieldByName(field_name));
						} else {
							//Ti.API.info('here--------A.7');
							if (entity[field_name] != null) {
								//Ti.API.info('here--------A.8');
								for (idx in entity[field_name]) {
									//Ti.API.info('here--------A.9' + entity[field_name][idx]);
									var elements = entity[field_name][idx];
									if (elements['value'] != null && elements['value'] != "") {
										//Ti.API.info('here--------A.10' + elements['value']);
										node_values.push(elements['value']);
									}
								}
							} else {
								// No match, so move on
								continue;
							}
						}

						var search_value = criteria_row.value;
						var search_operator = criteria_row.operator;
						//Ti.API.info('here--------A.11' + search_value + "," + search_operator);

						if (in_array(search_operator, Array('after-time', 'before-time', 'between-time'))) {
							//Ti.API.info('here--------A.12');
							var search_time_value = Number(search_value.time);
							//Ti.API.info('here--------A.12' + search_time_value);
							var compare_times = new Array();
							for (var value_index in node_values) {
								compare_times[value_index] = search_time_value + mktime(0, 0, 0, date('n', Number(node_values[value_index])), date('j', Number(node_values[value_index])), date('Y', Number(node_values[value_index])));
								//Ti.API.info('here--------A.13' + compare_times[value_index] + "," + node_values[value_index]);
							}

							if (search_operator == 'after-time') {
								//Ti.API.info('here--------A.14' + search_operator);
								for (var value_index in node_values) {
									//Ti.API.info('here--------A.15' + node_values[value_index] + "," + compare_times[value_index]);
									if (node_values[value_index] > compare_times[value_index]) {
										//Ti.API.info('here--------A.16');
										row_matches[criteria_index] = true;
									}
								}
							} else if (search_operator == 'before-time') {
								//Ti.API.info('here--------A.17');
								for (var value_index in node_values) {
									//Ti.API.info('here--------A.18');
									if (node_values[value_index] < compare_times[value_index]) {
										//Ti.API.info('here--------A.19');
										row_matches[criteria_index] = true;
									}
								}
							} else if (search_operator == 'between-time') {
								//Ti.API.info('here--------A.20');
								var search_time_value2 = search_value.time2;
								//Ti.API.info('here--------A.21');
								var compare_times2 = new Array();
								for (var value_index in node_values) {

									compare_times2[value_index] = search_time_value2 + mktime(0, 0, 0, date('n', Number(node_values[value_index])), date('j', Number(node_values[value_index])), date('Y', Number(node_values[value_index])));
									//Ti.API.info('here--------A.22' + compare_times2[value_index] + "," + node_values[value_index]);
								}

								if (search_time_value < search_time_value2) {
									//Ti.API.info('here--------A.23');
									// Like between 5:00PM - 8:00PM
									for (var value_index in node_values) {
										//Ti.API.info('here--------A.24');
										if (node_values[value_index] >= compare_times[value_index] && node_values[value_index] < compare_times2[value_index]) {
											//Ti.API.info('here--------A.25');
											row_matches[criteria_index] = true;
										}
									}
								} else {
									//Ti.API.info('here--------A.25----1');
									// Like between 8:00PM - 4:00AM
									for (var value_index in node_values) {
										//Ti.API.info('here--------A.26');
										if (node_values[value_index] >= compare_times[value_index] || node_values[value_index] < compare_times2[value_index]) {
											//Ti.API.info('here--------A.26---1');
											row_matches[criteria_index] = true;
										}
									}
								}
							}
						} else if (search_operator == '__blank') {
							//Ti.API.info('here--------A.26---2');
							row_matches[criteria_index] = true;
							for (var value_index in node_values) {
								//Ti.API.info('here--------A.26---3');
								node_value = node_values[value_index];
								if (node_value != null && node_value != "") {
									//Ti.API.info('here--------A.26---4');
									row_matches[criteria_index] = false;
								}

							}
						} else if (search_operator == '__filled') {
							//Ti.API.info('here--------A.26---5');
							for (var value_index in node_values) {
								//Ti.API.info('here--------A.26---6');
								node_value = node_values[value_index];
								if (node_value != null && node_value != "") {
									//Ti.API.info('here--------A.26---7');
									row_matches[criteria_index] = true;
								}

							}
						} else if (search_operator == 'weekday') {
							//Ti.API.info('here--------A.27' + search_value.weekday);
							var weekdays = search_value.weekday;
							if (!isArray(search_value.weekday)) {
								//Ti.API.info('here--------A.28' + search_value.weekday);
								weekdays = [];
								for (var key in search_value.weekday) {
									//Ti.API.info('here--------A.29' + search_value.weekday);
									if (search_value.weekday.hasOwnProperty(key)) {
										//Ti.API.info('here--------A.30' + key);
										weekdays.push(key);
									}
								}
							}

							for (var value_index in node_values) {
								//Ti.API.info('here--------A.31' + node_values[value_index] + ", " + date('w', Number(node_values[value_index])), weekdays);
								if (in_array(date('w', Number(node_values[value_index])), weekdays)) {
									//Ti.API.info('here--------A.32' + date('w', Number(node_values[value_index])), weekdays);
									row_matches[criteria_index] = true;
								}
							}
						}
					}

					/* TODO ---- In Future else
					  if(search_field['settings']['parts'] != null) {

					 if(search_field['type'] == 'location') {
					 for(part in search_field['settings']['parts']) {
					 search_value = isset($form_state['values']['search'][$search_field['field_name']][$part]) ? $form_state['values']['search'][$search_field['field_name']][$part] : $form_state['values']['search']['more_fields'][$search_field['field_name']][$part];
					 $query->condition('l_' . $search_field['field_name'] . '.' . $part, '%' . $search_value . '%', 'LIKE');
					 $search_fields[$search_key][$part]['default_value'] = $search_value;
					 }
					 object_lists_add_location_column($query, FALSE, $search_field, $id, $node_table);
					 } else {
					 for(part in search_field['settings']['parts']) {
					 $search_value = isset($form_state['values']['search'][$search_field['field_name']][$part]) ? $form_state['values']['search'][$search_field['field_name']][$part] : $form_state['values']['search']['more_fields'][$search_field['field_name']][$part];
					 $query->condition($search_field['field_name'] . '.' . $search_field['field_name'] . '_' . $part, '%' . $search_value . '%', 'LIKE');
					 $search_fields[$search_key][$part]['default_value'] = $search_value;
					 }
					 object_lists_add_parts_column($query, FALSE, $search_field, $id, $node_table);
					 }

					 }
					 */

					else {
						//Ti.API.info('here--------A.33');
						// if(entity[field_name] == null) {
						// entity[field_name] = null;
						// }
						search_value = criteria_row.value != null && criteria_row.value != "" ? criteria_row.value : null;
						search_operator = criteria_row.operator;
						//Ti.API.info('here--------A.34' + search_value + "," + search_operator);
						switch(search_field['type']) {
							case 'text':
							case 'text_long':
							case 'email':
							case 'link_field':
							case 'phone':
								for (idx in entity[field_name]) {
									var elements = entity[field_name][idx];
									if (elements['value'] != null && elements['value'] != "") {
										node_values.push(elements['value']);
									}
								}

								for (var value_index in node_values) {
									node_value = node_values[value_index];
									switch(search_operator) {
										case 'not like':
											if (strpos(node_value, search_value) === false) {
												row_matches[criteria_index] = true;
											}
											break;

										case 'starts with':
											if (strpos(node_value, search_value) === 0) {
												row_matches[criteria_index] = true;
											}
											break;

										case 'ends with':
											if (strpos(node_value, search_value) === node_value.length - search_value.length) {
												row_matches[criteria_index] = true;
											}
											break;

										case 'not starts with':
											if (strpos(node_value, search_value) !== 0) {
												row_matches[criteria_index] = true;
											}
											break;

										case 'not ends with':
											if (strpos(node_value, search_value) !== node_value.length - search_value.length) {
												row_matches[criteria_index] = true;
											}
											break;

										default:
											if (strpos(node_value, search_value) !== false) {
												row_matches[criteria_index] = true;
											}
											break;
									}
								}

								break;
							case 'list_boolean':
								for (idx in entity[field_name]) {
									var elements = entity[field_name][idx];
									node_values.push(elements['value']);
								}

								if (search_operator == '__filled') {
									for (var value_index in node_values) {
										node_value = node_values[value_index];
										if (node_value != 0) {
											row_matches[criteria_index] = true;
										}

									}
								} else {
									if (node_values == null && node_values == "") {
										row_matches[criteria_index] = true;
									} else {
										for (var value_index in node_values) {
											node_value = node_values[value_index];
											if (node_value == 0) {
												row_matches[criteria_index] = true;
											}

										}
									}
								}

								break;
							case 'calculation_field':
								//Ti.API.info('here--------A.35---1');
								var calculation_values = _calculation_field_get_values(win, db_display, content[entity[field_name][0]['reffer_index']], entity);
								//Ti.API.info('here--------A.35' + calculation_values);
								node_values.push(calculation_values[0].final_value);

								for (var value_index in node_values) {
									node_value = node_values[value_index];
									//Ti.API.info('here--------A.36' + node_value);
									switch(search_operator) {

										case '>':
											//Ti.API.info('here--------A.37' + node_value + "," + search_value);
											if (node_value > search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '>=':
											//Ti.API.info('here--------A.38' + node_value + "," + search_value);
											if (node_value >= search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '!=':
											//Ti.API.info('here--------A.39' + node_value + "," + search_value);
											if (node_value != search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '<':
											//Ti.API.info('here--------A.40' + node_value + "," + search_value);
											if (node_value < search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '<=':
											//Ti.API.info('here--------A.41' + node_value + "," + search_value);
											if (node_value <= search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										default:
											//Ti.API.info('here--------A.42' + node_value + "," + search_value);
											if (node_value == search_value) {
												row_matches[criteria_index] = true;
											}
											break;
									}
								}
								break;
							case 'number_integer':
							case 'number_decimal':
							case 'auto_increment':
								for (idx in entity[field_name]) {
									var elements = entity[field_name][idx];
									if (elements['value'] != null && elements['value'] != "") {
										node_values.push(elements['value']);
									}
								}

								for (var value_index in node_values) {
									node_value = node_values[value_index];
									switch(search_operator) {

										case '>':
											if (node_value > search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '>=':
											if (node_value >= search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '!=':
											if (node_value != search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '<':
											if (node_value < search_value) {
												row_matches[criteria_index] = true;
											}
											break;
										case '<=':
											if (node_value <= search_value) {
												row_matches[criteria_index] = true;
											}
											break;

										default:
											if (node_value == search_value) {
												row_matches[criteria_index] = true;
											}
											break;
									}
								}

								break;

							case 'omadi_reference':
							 	for(idx in entity[field_name]) {
									var elements = entity[field_name][idx];
									if(elements['nid'] != null && elements['nid'] != "") {
										node_values.push(elements['nid']);
									}
								}

				              	var reference_types = instances[search_field['field_name']]['settings']['reference_types'];
				               	var array_filter = '';
				               	var reference_types_arr = [];
				                for(var key in reference_types) {
									reference_types_arr.push(reference_types[key]);
								}
								for (var reference_types_idx = 0; reference_types_idx < reference_types_arr.length; reference_types_idx++) {
									if (reference_types_idx == reference_types_arr.length - 1) {
										array_filter += '\'' + reference_types_arr[reference_types_idx] + '\'';
									} else {
										array_filter += '\'' + reference_types_arr[reference_types_idx] + '\',';
									}
								}
				               	var query = 'SELECT nid from node WHERE table_name IN (' + array_filter+ ')';
			                   switch(search_operator){                  
				                case 'starts with':
				                case 'not starts with':
					                query += ' AND title LIKE "%' + search_value + '%";'
									break;
				                case 'ends with':
				                case 'not ends with':
				               	  	query += ' AND title LIKE "%' + search_value + '";'
				                  	break;
				                default: 
				               		query += ' AND title LIKE "%' + search_value + '%";'
									break;
				              }
				              
				              var possible_nids = db_display.execute(query);
							  var possible_nids_arr = [];
							  while (possible_nids.isValidRow()) {
									possible_nids_arr.push(possible_nids.fieldByName('tid'));
									possible_nids.next();
							  }
				              
				              switch($search_operator){                                    
				                case 'not starts with':
				                case 'not ends with':
				                case 'not like':
				               	if(node_values[0] == 0) {
										row_matches[criteria_index] = true;
									} else {
										row_matches[criteria_index] = true;
										for(idx in node_values) {
											node_value = node_values[idx];
											if(in_array(node_value, possible_nids_arr)) {
												row_matches[criteria_index] = false;
											}
										}
									}
									break;
								default:
									for(idx in node_values) {
										node_value = node_values[idx];
										if(in_array(node_value, possible_nids_arr)) {
											row_matches[criteria_index] = true;
										}
									}
									break;
				              }
				              
				              break;
							case 'user_reference':
								//Ti.API.info('here--------A.43');
								if ((field_name == 'uid' || field_name == 'created' || field_name == 'changed_uid') && win.nid != null & win.nid != "") {
									var node = db_display.execute('SELECT ' + field_name + ' from node WHERE nid="' + win.nid + '";');
									if (field_name == 'uid') {
										field_name = 'author_uid';
									}
									node_values.push(node.fieldByName(field_name));
								} else {
									//Ti.API.info('here--------A.44');
									for (idx in entity[field_name]) {
										var elements = entity[field_name][idx];
										//Ti.API.info('here--------A.45' + elements);
										if (elements['uid'] != null && elements['uid'] != "") {
											//Ti.API.info('here--------A.43' + elements['uid']);
											node_values.push(elements['value']);
										}
									}

								}
								if (search_value == 'current_user') {
									search_value = win.uid;
								}
								// Make sure the search value is an array
								var search_value_arr = [];
								if (!isArray(search_value)) {
									//Ti.API.info('here--------A.44' + search_value);
									for (var key in search_value) {
										//Ti.API.info('here--------A.45' + key);
										if (search_value.hasOwnProperty(key)) {
											//Ti.API.info('here--------A.46' + key);
											search_value_arr[key] = key;
										}
									}
									search_value = search_value_arr;
								}

								if (search_operator != null && search_operator == '!=') {
									//Ti.API.info('here--------A.47' + search_value['__null']);
									row_matches[criteria_index] = true;
									if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
										//Ti.API.info('here--------A.48');
										row_matches[criteria_index] = false;
									} else {
										//Ti.API.info('here--------A.49');
										for (idx in search_value) {
											//Ti.API.info('here--------A.50' + search_value[idx] + row_matches[criteria_index] + criteria_index);
											chosen_value = search_value[idx];
											if (in_array(chosen_value, node_values)) {
												//Ti.API.info('here--------A.51' + chosen_value);
												row_matches[criteria_index] = false;
											}
										}
									}
								} else {
									//Ti.API.info('here--------A.52');
									if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
										//Ti.API.info('here--------A.53');
										row_matches[criteria_index] = true;
									} else {
										//Ti.API.info('here--------A.54');
										for (idx in search_value) {
											//Ti.API.info('here--------A.55' + search_value[idx]);
											chosen_value = search_value[idx];
											if (in_array(chosen_value, node_values)) {
												//Ti.API.info('here--------A.56' + chosen_value);
												row_matches[criteria_index] = true;
											}
										}
									}
								}
								break;
							case 'taxonomy_term_reference':

								for (idx in entity[field_name]) {
									elements = entity[field_name][idx];
									if (elements['tid'] == 0) {
										node_values.push(elements['tid']);
									}
								}

								if (JSON.parse(search_field['widget']).type == 'options_select' || JSON.parse(search_field['widget']).type == 'violation_select') {
									// Make sure the search value is an array
									var search_value_arr = [];
									if (!isArray(search_value)) {
										for (var key in search_value) {
											if (search_value.hasOwnProperty(key)) {
												search_value_arr[key] = key;
											}
										}
										search_value = search_value_arr;
									}

									if (search_operator != null && search_operator == '!=') {

										row_matches[criteria_index] = true;
										if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
											row_matches[criteria_index] = false;
										} else {
											for (idx in search_value) {
												chosen_value = search_value[idx];
												if (in_array(chosen_value, node_values)) {
													row_matches[criteria_index] = false;
												}
											}

										}
									} else {
										if (search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
											row_matches[criteria_index] = true;
										} else {
											for (idx in search_value) {
												chosen_value = search_value[idx];
												if (in_array(chosen_value, node_values)) {
													row_matches[criteria_index] = true;
												}
											}
										}
									}
								} else {
									var machine_name = JSON.parse(search_field['settings']).vocabulary;
									var vocabulary = db_display.execute('SELECT vid from vocabulary WHERE machine_name="' + machine_name + '";');
									var query = 'SELECT tid from term_data WHERE vid=' + vocabulary.fieldByName('vid');
									switch(search_operator) {
										case 'starts with':
										case 'not starts with':
											query += ' AND name LIKE "' + search_value + '%";'
											break;

										case 'ends with':
										case 'not ends with':
											query += ' AND name LIKE "%' + search_value + '";'
											break;

										default:
											query += ' AND name LIKE "%' + search_value + '%";'
											break;
									}
									//Ti.API.info(query);
									var possible_tids = db_display.execute(query);
									var possible_tids_arr = [];
									while (possible_tids.isValidRow()) {
										possible_tids_arr.push(possible_tids.fieldByName('tid'));
										possible_tids.next();
									}

									switch(search_operator) {
										case 'not starts with':
										case 'not ends with':
										case 'not like':
											if (node_values[0] == 0) {
												row_matches[criteria_index] = true;
											} else {
												row_matches[criteria_index] = true;
												for (idx in node_values) {
													node_value = node_values[idx];
													if (in_array(node_value, possible_tids_arr)) {
														row_matches[criteria_index] = false;
													}
												}
											}
											break;

										default:
											for (idx in node_values) {
												node_value = node_values[idx];
												if (in_array(node_value, possible_tids_arr)) {
													row_matches[criteria_index] = true;
												}
											}
											break;
									}
								}

								break;

							case 'omadi_time':
								// TODO: Add the omadi_time field here
								break;

							case 'image':
								// Do nothing
								break;

						}

					}

				}
			}

			if (count_arr_obj(criteria['search_criteria']) == 1) {
				//Ti.API.info('here--------A.57' + row_matches[criteria_index]);
				var retval = row_matches[criteria_index];
			} else {
				//Ti.API.info('here--------A.58');
				// Group each criteria row into groups of ors with the matching result of each or
				var and_groups = new Array();
				var and_group_index = 0;
				and_groups[and_group_index] = new Array();
				//print_r($criteria['search_criteria']);
				for (criteria_index in criteria['search_criteria']) {
					//Ti.API.info('here--------A.59' + criteria_index);
					criteria_row = criteria['search_criteria'][criteria_index];
					if (criteria_index == 0) {
						//Ti.API.info('here--------A.60' + row_matches[criteria_index]);
						//and_groups[and_group_index][0] = row_matches[criteria_index];
						and_groups[and_group_index].push(row_matches[criteria_index]);
					} else {
						//Ti.API.info('here--------A.61');
						if (criteria_row['row_operator'] == null || criteria_row['row_operator'] != 'or') {
							//Ti.API.info('here--------A.62');
							and_group_index++;
							and_groups[and_group_index] = new Array();
						}
						//Ti.API.info('here--------A.63' + row_matches[criteria_index]);
						and_groups[and_group_index].push(row_matches[criteria_index]);
						//and_groups[and_group_index][0] = row_matches[criteria_index];
					}
				}

				// Get the final result, making sure each and group is TRUE
				retval = true;
				//Ti.API.info('here--------A.64' + and_groups.length);
				for (idx in and_groups) {
					//Ti.API.info('here--------A.65');
					and_group = and_groups[idx];
					and_group_match = false;
					for (idx1 in and_group) {
						//Ti.API.info('here--------A.66' + and_group[idx1]);
						or_match = and_group[idx1];
						// Make sure at least one item in an and group is true (or the only item is true)
						if (or_match) {
							//Ti.API.info('here--------A.67');
							and_group_match = true;
							break;
						}
					}

					// If one and group doesn't match the whole return value of this function is false
					if (!and_group_match) {
						//Ti.API.info('here--------A.68');
						retval = false;
						break;
					}
				}
			}
			//Ti.API.info('here--------A.69' + retval);
			return retval;
		}

		// No conditions exist, so the row matches

	} catch(e) {
	}
	return true;
}

function rules_field_format_readable_time_rules(timeValue) {
	var timeStrings = [];

	var dayStrings = [];
	dayStrings.push('Sun');
	dayStrings.push('Mon');
	dayStrings.push('Tue');
	dayStrings.push('Wed');
	dayStrings.push('Thu');
	dayStrings.push('Fri');
	dayStrings.push('Sat');

	var times = [];

	var returnVal = 'No Rules';

	if (timeValue > '') {
		var rows = timeValue.split(';');
		for (var idx in rows) {
			var row = rows[idx];
			var values = row.split('|');
			if (values[0] == '1') {
				if (values[1] == '1') {
					if (times['All Day'] == null) {
						times['All Day'] = new Array();
					}

					times['All Day'].push(idx);
				} else {
					if (times[omadi_time_seconds_to_string(values[2], 'h:iA') + '-' + omadi_time_seconds_to_string(values[3], 'h:iA')] == null) {
						times[omadi_time_seconds_to_string(values[2], 'h:iA') + '-' + omadi_time_seconds_to_string(values[3], 'h:iA')] = new Array();
					}

					times[omadi_time_seconds_to_string(values[2], 'h:iA') + '-' + omadi_time_seconds_to_string(values[3], 'h:iA')].push(idx);
				}
			}
		}

		if (times['All Day'] != null && count_arr_obj(times['All Day']) == 7) {
			// This is equivalent to no rules, so fall through
		} else {

			for (var time_index in times) {
				var time = times[time_index];
				var timeString = '';
				var startDay = -1;
				var currentDay = -2;
				var lastConsecutive = -1;
				var dayPatrolStrings = [];

				for (var day_index in time) {
					var day = time[day_index];
					currentDay = Number(day);
					if (startDay == -1) {
						startDay = currentDay;
					} else if (currentDay == (lastConsecutive + 1)) {
						// Just continue to the next day
					} else {
						if (startDay != lastConsecutive) {
							dayPatrolStrings.push(dayStrings[startDay] + '-' + dayStrings[lastConsecutive]);
						} else {
							dayPatrolStrings.push(dayStrings[startDay]);
						}
						startDay = currentDay;
					}
					lastConsecutive = currentDay;
				}

				if (lastConsecutive == currentDay) {
					if (startDay != lastConsecutive) {
						dayPatrolStrings.push(dayStrings[startDay] + '-' + dayStrings[lastConsecutive]);
					} else {
						dayPatrolStrings.push(dayStrings[startDay]);
					}
				}

				timeString += dayPatrolStrings.join(',') + ' (' + time_index + ')';

				timeStrings.push(timeString);
			}

			returnVal = timeStrings.join('; ');
		}
	}

	return returnVal;
}

function omadi_time_seconds_to_string(seconds, format) {
	var am_pm = (strpos(format, 'H') === false);

	var hours = Math.floor(seconds / 3600);

	var hours_str = hours;
	if (hours_str < 10) {
		hours_str = '0' + hours_str;
	}

	var minutes = Math.floor((seconds - (hours * 3600)) / 60);
	if (minutes < 10) {
		minutes = '0' + minutes;
	}

	var time_string = "";
	if (am_pm) {
		if (hours == 0) {
			time_string = '12:' + minutes + 'AM';
		} else if (hours == 12) {
			time_string = '12:' + minutes + 'PM';
		} else if (hours > 12) {
			var new_hours = hours - 12;
			hours_str = new_hours;
			if (new_hours < 10) {
				hours_str = '0' + new_hours;
			}
			time_string = hours_str + ':' + minutes + 'PM';
		} else {
			time_string = hours_str + ':' + minutes + 'AM';
		}
	} else {
		time_string = hours_str + ':' + minutes;
	}

	return time_string;
}

function rules_field_passed_time_check(time_rule, timestamp) {
	var retval = false;
	timestamp = parseInt(timestamp / 1000);
	var timestamp_day = Number(date('w', Number(timestamp)));

	if (time_rule != '' && time_rule != null) {

		var timestamp_midnight = mktime(0, 0, 0, date('n', Number(timestamp)), date('j', Number(timestamp)), date('Y', Number(timestamp)));

		var days = time_rule.split(';');

		var day_rule = days[timestamp_day];

		var values = day_rule.split('|');

		if (values[0] == '1' || values[0] == 1) {
			if (values[1] == '1' || values[1] == 1) {
				retval = true;
			} else {
				var start_time = Number(timestamp_midnight) + Number(values[2]);
				var end_time = Number(timestamp_midnight) + Number(values[3]) + Number(59);

				// For times like 8:00PM - 5:00AM
				if (start_time > end_time) {
					end_time = Number(end_time) + Number((3600 * 24));
				}

				if (Number(timestamp) >= Number(start_time) && Number(timestamp) <= Number(end_time)) {
					retval = true;
				}
			}
		}

		if (retval == false) {
			if (timestamp_day == 0) {
				timestamp_day = 6;
			} else {
				timestamp_day--;
			}
			day_rule = days[timestamp_day];

			values = day_rule.split('|');
			if (values[0] == '1' && values[0] == 1) {
				if (values[1] == '1' && values[1] == 1) {
					// Do nothing, since we're not on this previous day
					// Do not return true
				} else {
					start_time = Number(timestamp_midnight) + Number(values[2]);
					end_time = Number(timestamp_midnight) + Number(values[3]) + Number(59);
					// For times like 8:00PM - 5:00AM
					if (start_time > end_time) {
						start_time = Number(start_time) - (3600 * 24);
						// Only do the check if we're in a multi-day time span since we moved to the day before
						if (Number(timestamp) >= Number(start_time) && Number(timestamp) <= Number(end_time)) {
							retval = true;
						}
					}
				}
			}
		}
	} else {
		retval = true;
	}
	return retval;
}