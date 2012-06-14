/**
 * @author Joseandro
 */

/*
* This code generates forms for node creation and node edition.
* The tracked variable is win.mode.
* node_creation -> win.mode == 0
* node_edition  -> win.mode == 1
*/

//Common used functions
Ti.include('/lib/functions.js');
var heightValue = getScreenHeight() * 0.13;
var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {
	fontFamily : 'Helvetica Neue',
	fontSize : 15,
	fontWeight : 'bold'
};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';

var months_set = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//Current window's instance
var win;
var viewContent;
var title_head;
var resultView;

var db_display;
var doneButton = null;

var ONE_MB = 1048576;

var create_or_edit_node = {};

create_or_edit_node.getWindow = function() {
	if(win != null) {
		resultView.remove(viewContent);
		viewContent = null;
		viewContent = Ti.UI.createScrollView({
			//height : "100%",
			bottom: 0,
			contentHeight: 'auto',
			top : "11%",
			backgroundColor : '#111111',
			showHorizontalScrollIndicator : false,
			showVerticalScrollIndicator : true,
			opacity : 1,
			//borderRadius : 7,
			scrollType : "vertical",
			zIndex : 10
		});
		resultView.add(viewContent);
	} else {
		win = Titanium.UI.createWindow({
			fullscreen : false,
			backgroundColor: '#111'
		});
		//Sets only portrait mode
		win.orientationModes = [Titanium.UI.PORTRAIT];

		//The view where the results are presented
		resultView = Ti.UI.createView({
			top : '0',
			height : '100%',
			width : '100%',
			backgroundColor : '#111111',
			opacity : 1
		});
		win.add(resultView);

		//Header where the selected name is presented
		var header = Ti.UI.createView({
			top : '0',
			height : '10%',
			width : '100%',
			backgroundColor : '#000000',
			zIndex : 11
		});
		resultView.add(header);
		title_head = Ti.UI.createLabel({
			text : win.nameSelected,
			color : '#FFFFFF',
			font : {
				fontSize : 24
			}
		});
		header.add(title_head);
		viewContent = Ti.UI.createScrollView({
			//height : "100%",
			bottom :0,
			contentHeight: 'auto',
			top : "11%",
			backgroundColor : '#111111',
			showHorizontalScrollIndicator : false,
			showVerticalScrollIndicator : true,
			opacity : 1,
			//borderRadius : 7,
			scrollType : "vertical",
			zIndex : 10
		});
		resultView.add(viewContent);
	}
	title_head.text = win.nameSelected;
	return win;
}
///////////////////////////
// Extra Functions
//////////////////////////

function keep_info(_flag_info) {
	var a = Titanium.UI.createAlertDialog({
		title : 'Omadi',
		buttonNames : ['OK']
	});

	var string_text = "";
	var string_err = "";
	var count_fields = 0;
	var value_err = 0;

		for (var x in content){
		try{
			Ti.API.info(label[x].text+' is required: '+content[x].required+' = '+content[x].value);
		}
		catch(e){
			
		}
		// Regular expression for phone
		if(content[x].field_type=='phone'){
			if(content[x].value != "" && content[x].value!=null){
				var str = content[x].value.trim();
				var regExp = /\D*(\d*)\D*[2-9][0-8]\d\D*[2-9]\d{2}\D*\d{4}\D*\d*\D*/g
				var match = regExp.test(str);	
				regExp.exec(str)
				var matchVal = regExp.exec(str);	
				if(match==false || (matchVal[1] != '' && matchVal[1] != null)){
					value_err++;
					string_err += content[x].value + ' is not a valid North American phone number.' + 
					'\nPhone numbers should only contain numbers, +, -, (, ) and spaces and be like 999-999-9999. Please enter a valid ten-digit phone number.';	
				}
				break;
			}
		}
		
		if (((content[x].is_title === true) || (content[x].required == 'true') || (content[x].required === true) || (content[x].required == '1') || (content[x].required == 1) ) && ((content[x].value == '') || (content[x].value == null)) ){
			count_fields++;
			if (content[x].cardinality > 1){
				string_text += "#"+content[x].private_index+" "+label[content[x].reffer_index].text+"\n";
			}
			else{
				string_text += label[content[x].reffer_index].text+"\n";
			}
		}
	}
	
	if((count_fields > 0) && (_flag_info != "draft")) {
		if(count_fields == 1) {
			if(win.mode == 0) {
				a.message = 'The field "' + string_text + '" is empty, please fill it out in order to save this node';
			} else {
				a.message = 'The field "' + string_text + '" is empty, please fill it out in order to update this node';
			}
		} else {
			a.message = 'The following fields are required and are empty:\n' + string_text;
		}
		a.show();
	} else if(value_err > 0){
		a.message = string_err;
		a.show();
	}else {
		var mode_msg = '';
		if(_flag_info == "draft") {
			mode_msg = 'Saving draft';
		} else if(win.mode == 0) {
			mode_msg = 'Saving node';
		} else {
			mode_msg = 'Updating node';
		}

		showIndicator(mode_msg);
		var db_put = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

		//
		//Retrieve objects that need quotes:
		//
		var need_at = db_put.execute("SELECT field_name FROM fields WHERE bundle = '" + win.type + "' AND ( type='number_integer' OR type='number_decimal' ) ");
		var quotes = new Array();
		while(need_at.isValidRow()) {
			quotes[need_at.fieldByName('field_name')] = true;
			need_at.next();
		}
		need_at.close();

		if(win.mode == 0) {
			//Get smallest nid
			var nid = db_put.execute("SELECT nid FROM node ORDER BY nid ASC ");

			if(nid.fieldByName('nid') >= 0) {
				var new_nid = -1;
			} else {
				var new_nid = nid.fieldByName('nid') - 1;
			}
		}

		var query = "INSERT OR REPLACE INTO " + win.type + " ( 'nid', ";

		var _array_value = new Array();
		for(var x_j in content) {
			if((content[x_j].composed_obj === true) && (content[x_j].cardinality > 1)) {

				if((content[x_j].field_type == 'omadi_time') || (content[x_j].field_type == 'datestamp')) {
					if(content[x_j].value != null)
						var _vlr = Math.round(content[x_j].value / 1000);
					else
						var _vlr = null;
				} else if((content[x_j].field_type == 'number_integer') || (content[x_j].field_type == 'number_decimal')) {
					if((content[x_j].value == null) || (content[x_j].value == "") || (content[x_j].value == " ")) {
						var _vlr = null;
					} else {
						var _vlr = content[x_j].value;
					}
				} else {
					var _vlr = content[x_j].value;
				}

				if(_array_value[content[x_j].field_name]) {
					_array_value[content[x_j].field_name].push(_vlr);
					continue;
				} else {
					_array_value[content[x_j].field_name] = new Array();
					_array_value[content[x_j].field_name].push(_vlr);
					continue;
				}
			}
		}

		//field names
		for(var j_y = 0; j_y < content.length; j_y++) {
			Ti.API.info('INDEX: ' + j_y);

			//Is different of a region
			if(!content[j_y]) {
				continue;
			}

			//Point the last field
			if(content[j_y + 1]) {
				while(content[j_y].field_name == content[j_y + 1].field_name) {
					j_y++;
					if(content[j_y + 1]) {
						//Go on
					} else {
						//Finish, we found the point
						break;
					}
				}
			}

			if(j_y == content.length - 1) {
				query += "'" + content[j_y].field_name + "' ) ";
			} else {
				query += "'" + content[j_y].field_name + "', ";
			}
		}

		if(win.mode == 1) {
			query += ' VALUES ( ' + win.nid + ', ';
		} else {
			query += ' VALUES ( ' + new_nid + ', ';
		}

		//Values
		var title_to_node = "";

		for(var j = 0; j <= content.length; j++) {
			if(!content[j]) {
				continue;
			}

			if(content[j].is_title === true) {
				if(title_to_node.charAt(0) == "") {
					if(content[j].cardinality == -1) {
						var tit_aux = content[j].value;
						if(tit_aux == null)
							tit_aux = "";
						else
							tit_aux = tit_aux[0].title;
						title_to_node = tit_aux;
					} else {
						if(content[j].value == null) {
							title_to_node = "";
						} else {
							title_to_node = content[j].value;
						}
					}
				} else {
					if(content[j].cardinality == -1) {
						var tit_aux = content[j].value;
						if(tit_aux == null)
							tit_aux = "";
						else
							tit_aux = " - " + tit_aux[0].title;
						title_to_node += tit_aux;
					} else {
						if(content[j].value == null) {
							title_to_node = "";
						} else {
							title_to_node += " - " + content[j].value;
						}
					}
				}
			}

			Ti.API.info(content[j].field_type + ' is the field');

			if(quotes[content[j].field_name] === true) {
				var mark = "";
			} else {
				var mark = "'";
			}

			if(content[j].value === null) {
				mark = "";
			}

			var value_to_insert = '';

			//If it is a composed field, just insert the number
			//Build cardinality for fields
			if((content[j].composed_obj === true) && (content[j].cardinality > 1)) {
				//Point the last field
				if(content[j + 1]) {
					while(content[j].field_name == content[j + 1].field_name) {
						j++;
						if(content[j + 1]) {
							//Go on
						} else {
							//Finish, we found the point
							break;
						}
					}
				}

				//Treat the array
				content_s = treatArray(_array_value[content[j].field_name], 6);
				Ti.API.info('About to insert ' + _array_value[content[j].field_name]);
				// table structure:
				// incremental, node_id, field_name, value
				var db_jub = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

				if(win.mode == 0) {
					Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + new_nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
					db_jub.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + new_nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
				} else {
					Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + win.nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
					db_jub.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + win.nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
				}

				db_jub.close();

				// Code must to be a number since this database field accepts only integers numbers
				// Token to indentify array of numbers is 7411317618171051229
				value_to_insert = 7411317618171051229;
			} else if((content[j].field_type == 'number_decimal') || (content[j].field_type == 'number_integer')) {
				if((content[j].value == '') || (content[j].value == null)) {
					value_to_insert = 'null';
					mark = "'";
				} else {
					value_to_insert = content[j].value;
					mark = '';
				}
			} else if(content[j].field_type == 'user_reference') {
				if(content[j].value == null) {
					value_to_insert = ''
					mark = '\'';
				} else {
					value_to_insert = content[j].value;
					mark = '';
				}
			} else if(content[j].field_type == 'taxonomy_term_reference') {
				if(content[j].widget == 'options_select') {
					if(content[j].cardinality != -1) {
						if(content[j].value == null) {
							value_to_insert = ''
							mark = '\'';
						} else {
							value_to_insert = content[j].value;
							mark = '';
						}
					} else {

						var vital_info = [];

						if(content[j].value == null) {
							vital_info.push("null");
						} else {
							for(var v_info_tax in content[j].value ) {
								vital_info.push(content[j].value[v_info_tax].v_info.toString());
							}
						}

						//Treat the array
						content_s = treatArray(vital_info, 6);
						Ti.API.info('About to insert ' + content[j].field_name);
						// table structure:
						// incremental, node_id, field_name, value
						//var db_jub = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

						if(win.mode == 0) {
							Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + new_nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
							db_put.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + new_nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
						} else {
							Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + win.nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
							db_put.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( ' + win.nid + ', \'' + content[j].field_name + '\',  \'' + content_s + '\' )');
						}

						//db_jub.close();

						// Code must to be a number since this database field accepts only integers numbers
						// Token to indentify array of numbers is 7411317618171051229
						value_to_insert = 7411317618171051229;
						mark = '';
					}
				} else if(content[j].widget == 'taxonomy_autocomplete') {
					if((content[j].tid == null) && (content[j].value == "")) {
						value_to_insert = '';
						mark = '\'';
					} else if((win.mode == 0) && (content[j].tid == null) && (content[j].value != "")) {
						if(content[j].restrict_new_autocomplete_terms != 1) {
							mark = '';
							//Get smallest tid
							var tid = db_put.execute("SELECT tid FROM term_data ORDER BY tid ASC ");

							if(tid.fieldByName('tid') >= 0) {
								var new_tid = -1;
							} else {
								var new_tid = tid.fieldByName('tid') - 1;
							}
							var date_created = Math.round(+new Date() / 1000);
							db_put.execute("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES (" + new_tid + ", " + content[j].vid + ", '" + content[j].value + "', '', '', '" + date_created + "'  )");
							value_to_insert = new_tid;

							Ti.API.info('First tid is: ' + new_tid + ' and tid ' + content[j].tid + ' and value ' + content[j].value);
							tid.close();
						} else {
							value_to_insert = '';
						}

					} else if((content[j].tid != null)) {
						mark = '';
						value_to_insert = content[j].tid;
					}
				}
			} else if(content[j].field_type == 'omadi_reference') {
				if(content[j].nid === null) {
					value_to_insert = '';
					mark = '\'';
				} else {
					mark = '';
					value_to_insert = content[j].nid;
				}
			} else if(content[j].field_type == 'list_boolean') {
				if(content[j].value === true){
					value_to_insert = 1;	
				}
				else{
					value_to_insert = 0;
				}
			} else if((content[j].field_type == 'omadi_time') || (content[j].field_type == 'datestamp')) {
				if(content[j].update_it === true) {
					value_to_insert = Math.round(content[j].value / 1000);
				} else {
					mark = "'";
					value_to_insert = '';
				}
			} else {
				value_to_insert = content[j].value;
			}

			if(value_to_insert == '') {
				mark = '\'';
			}

			if(j == content.length - 1) {
				query += mark + "" + value_to_insert + "" + mark + " )";
			} else {
				query += mark + "" + value_to_insert + "" + mark + ", ";
			}
			Ti.API.info(content[j].field_type + ' has value to insert ' + value_to_insert);
		}

		var has_bug = false;
		try {
			Ti.API.info('Title: ' + title_to_node);
			if(title_to_node == "") {
				title_to_node = "No title";
			}
			//Insert into node table
			var _now = Math.round(+new Date() / 1000);
			if(_flag_info == "draft") {
				if(win.mode == 1) {
					Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=3, table_name="' + win.type + '", form_part =' + win.region_form + ' WHERE nid=' + win.nid);
					db_put.execute('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=3, table_name="' + win.type + '", form_part =' + win.region_form + ' WHERE nid=' + win.nid);
				} else {
					Ti.API.info('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 3 , "' + win.type + '" , ' + win.region_form + ' )');
					db_put.execute('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name , form_part ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 3 , "' + win.type + '", ' + win.region_form + ' )');
				}
			} else if(win.mode == 1) {
				Ti.API.info('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ' WHERE nid=' + win.nid);
				db_put.execute('UPDATE node SET changed="' + _now + '", title="' + title_to_node + '" , flag_is_updated=1, table_name="' + win.type + '", form_part =' + win.region_form + ' WHERE nid=' + win.nid);
			} else {
				Ti.API.info('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '", ' + win.region_form + '  )');
				db_put.execute('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name, form_part  ) VALUES (' + new_nid + ', ' + _now + ', 0, "' + title_to_node + '" , ' + win.uid + ', 1 , "' + win.type + '"  , ' + win.region_form + ' )');
			}

			//Insert into table
			Ti.API.info("=====Query=== " + query);
			if(win.mode == 1) {
				var oldVal = db_put.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid);
			}
			db_put.execute(query);

			//If Images captured and not yet uploaded then store in file_uploaded_queue
			for(var j = 0; j <= content.length; j++) {
				if(!content[j]) {
					continue;
				}

				var file_upload_nid;

				if(win.mode == 1) {
					file_upload_nid = win.nid;
				} else {
					file_upload_nid = new_nid;
				}

				if(content[j].field_type == 'image' && (content[j].cardinality > 1 || content[j].cardinality < 0)) {
					var arrImages = content[j].arrImages;
					for( k = 0; k < arrImages.length; k++) {
						if(arrImages[k].imageData != null && arrImages[k].mimeType != null) {

							var encodeImage = Ti.Utils.base64encode(arrImages[k].imageData);

							var mime = arrImages[k].mimeType;

							var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);

							var is_exists = db_put.execute('SELECT delta, nid FROM file_upload_queue WHERE nid=' + file_upload_nid + ' and delta=' + arrImages[k].private_index + ' and field_name="' + content[j].field_name + '";');

							if(is_exists.rowCount > 0) {
								db_put.execute('UPDATE file_upload_queue SET nid="' + file_upload_nid + '", file_data="' + encodeImage + '", field_name="' + content[j].field_name + '", file_name="' + imageName + '", delta=' + arrImages[k].private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + arrImages[k].private_index + ' and field_name="' + content[j].field_name + '";');
								continue;
							}

							db_put.execute('INSERT INTO file_upload_queue (nid , file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ', "' + encodeImage + '", "' + content[j].field_name + '", "' + imageName + '", ' + arrImages[k].private_index + ')');
						}
					}
				} else if(content[j].field_type == 'image') {
					if(content[j].imageData != null && content[j].mimeType != null) {
						var encodeImage = Ti.Utils.base64encode(content[j].imageData);
						var mime = content[j].mimeType;
						var imageName = 'image.' + mime.substring(mime.indexOf('/') + 1, mime.length);

						var is_exists = db_put.execute('SELECT delta, nid FROM file_upload_queue WHERE nid=' + file_upload_nid + ' and delta=' + content[j].private_index + ' and field_name="' + content[j].field_name + '";');

						if(is_exists.rowCount > 0) {
							db_put.execute('UPDATE file_upload_queue SET nid="' + file_upload_nid + '", file_data="' + encodeImage + '", field_name="' + content[j].field_name + '", file_name="' + imageName + '", delta=' + content[j].private_index + ' WHERE nid=' + file_upload_nid + ' and delta=' + content[j].private_index + ' and field_name="' + content[j].field_name + '";');
							continue;
						}
						db_put.execute('INSERT INTO file_upload_queue (nid , file_data , field_name, file_name, delta) VALUES (' + file_upload_nid + ', "' + encodeImage + '", "' + content[j].field_name + '", "' + imageName + '","' + content[j].private_index + '")');
					}
				}

				if(content[j].field_type == 'image' && win.mode == 1) {
					db_put.execute('UPDATE ' + win.type + ' SET ' + content[j].field_name + '="' + oldVal.fieldByName(content[j].field_name) + '", ' + content[j].field_name + '___file_id="' + oldVal.fieldByName(content[j].field_name + '___file_id') + '", ' + content[j].field_name + '___status="' + oldVal.fieldByName(content[j].field_name + '___status') + '" WHERE nid=' + file_upload_nid + ';');
				}
			}

			db_put.close();
			has_bug = false;
		} catch(e) {
			Ti.API.info("Error----------" + e);

			if(_flag_info == 'draft') {
				Ti.UI.createNotification({
					message : 'An error has occurred when we tried to save this node as a draft, please try again'
				}).show();
			} else if(win.mode == 1) {
				if(PLATFORM == 'android'){	
					Ti.UI.createNotification({
						message : 'An error has occurred when we tried to update this new node, please try again'
					}).show();
				}else{
					alert('An error has occurred when we tried to update this new node, please try again');
				}
			} else {
				if(PLATFORM == 'android'){	
					Ti.UI.createNotification({
						message : 'An error has occurred when we tried to create this new node, please try again'
					}).show();
				}else{
					alert('An error has occurred when we tried to create this new node, please try again');
				}	
			}
			has_bug = true;
		}

		Ti.API.info('========= Updating new info running ========= ' + _flag_info);
		if((Titanium.Network.online) && (has_bug === false) && (_flag_info != 'draft')) {
			Ti.API.info('Submitting');
			win.up_node(win.mode, close_me);
		} else if(has_bug === true) {
			Ti.API.info('Error');
			close_me_delay();
		} else if(!(Titanium.Network.online) || (_flag_info == 'draft')) {
			if(_flag_info == 'draft') {
				Ti.API.info('Draft creation');
				if(PLATFORM == 'android') {
					Ti.UI.createNotification({
						message : win.title + ' has been successfully saved as a draft !'
					}).show();
				}else{
					alert(win.title + ' has been successfully saved as a draft !');
				}
			} else if(win.mode == 1) {
				Ti.API.info('Off line update');
				if(PLATFORM == 'android'){	
					Ti.UI.createNotification({
						message : win.title+' has been successfully updated, but you are now offline, node will be only local until you have a valid internet connection !'
					}).show();
				}else{
					alert(win.title+' has been successfully updated, but you are now offline, node will be only local until you have a valid internet connection !');
				}
			} else {
				Ti.API.info('Off line creation');
				if(PLATFORM == 'android'){
					Ti.UI.createNotification({
						message : win.title+' has been successfully created, but you are now offline, node will be only local until you have a valid internet connection !'
					}).show();
				}else{
					alert(win.title+' has been successfully created, but you are now offline, node will be only local until you have a valid internet connection !');
				}
			}
			close_me_delay();
		}
	}
}

function close_me_delay() {
	setTimeout(function() {
		hideIndicator();
		win.close();
	}, 3000);
}

function close_me() {
	hideIndicator();
	win.close();
}

//Return models based on a certain "make" if "make" is not present returns the whole database set
function get_models(make) {
	var db_for_veh = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());

	var _aux_dt = db_for_veh.execute("SELECT DISTINCT model FROM _vehicles WHERE make LIKE '%" + make + "%'");
	var _set_result = [];
	if(_aux_dt.rowCount > 0) {
		while(_aux_dt.isValidRow()) {
			_set_result.push(_aux_dt.fieldByName('model'));
			_aux_dt.next();
		}
	} else {
		var _aux_dt = db_display.execute("SELECT DISTINCT model FROM _vehicles");
		while(_aux_dt.isValidRow()) {
			_set_result.push(_aux_dt.fieldByName('model'));
			_aux_dt.next();
		}
	}
	db_for_veh.close();
	return _set_result;
}

function config_label(label) {
	label.color = "#FFFFFF";
	label.textAlign = 'left';
	label.left = '3%';
	label.touchEnabled = false;
	label.height = 40;
}

function config_content(content) {
	content.color = "#000000";
	content.textAlign = 'left';
	content.left = "3%";
	content.height = 40;
}

function form_min(min) {
	if(min < 10) {
		return '0' + min;
	}
	return min;
}

function display_widget(obj) {

	var win_wid = Ti.UI.createWindow({
		//modal: true,
		backgroundColor: "#000",
		opacity: 0.9
	});

	var widget = obj.widget;
	var settings = obj.settings
	Ti.API.info('====>> Widget settings = ' + widget.settings['time']);

	var tit_picker = Ti.UI.createLabel({
		top : 0,
		width : '100%',
		height : '10%',
		backgroundColor : '#FFF',
		color : '#000',
		textAlign : 'center',
		font : {
			fontWeight : 'bold'
		},
		text : obj.title_picker
	});
	win_wid.add(tit_picker);

	// call function display_widget
	if(widget.settings['time'] != "1") {

		//Get current
		var currentDate = obj.currentDate;
		var day = currentDate.getDate();
		var month = currentDate.getMonth();
		var year = currentDate.getFullYear();

		//Min
		var minDate = new Date();
		minDate.setFullYear(year - 5);
		minDate.setMonth(0);
		minDate.setDate(1);

		//Max
		var maxDate = new Date();
		maxDate.setFullYear(year + 5);
		maxDate.setMonth(11);
		maxDate.setDate(31);

		//Current
		var value_date = new Date();
		value_date.setFullYear(year);
		value_date.setMonth(month);
		value_date.setDate(day);

		obj.update_it = true;

		//Update timezone
		obj.timezone = obj.currentDate.getTimezoneOffset() * 60 * 1000;

		//discover if is GMT+ or GMT-
		obj.timezone = obj.timezone * verify_UTC(obj.currentDate);

		//Refresh GMT value
		obj.value = Math.round(obj.currentDate.getTime()) + obj.timezone;

		Ti.API.info('TIMEZONE : ' + obj.timezone);
		Ti.API.info('Date : ' + obj.currentDate);

		var date_picker = Titanium.UI.createPicker({
			borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			value : obj.currentDate,
			font : {
				fontSize : 18
			},
			type : Ti.UI.PICKER_TYPE_DATE,
			minDate : minDate,
			maxDate : maxDate,
			report : obj.currentDate,
			color : '#000000'
		});
		date_picker.selectionIndicator = true;

		Ti.API.info('Value: ' + obj.value);

		date_picker.addEventListener('change', function(e) {
			e.source.report = e.value;
			//Update timezone
			obj.timezone = e.source.report.getTimezoneOffset() * 60 * 1000;
			//discover if is GMT+ or GMT-
			obj.timezone = obj.timezone * verify_UTC(e.source.report);
		});
		//Add fields:
		win_wid.add(date_picker);

		var done = Ti.UI.createButton({
			title : 'Done',
			bottom : 10,
			width : '35%',
			left : '10%',
			height : '10%'
		});

		var cancel = Ti.UI.createButton({
			title : 'Cancel',
			bottom : 10,
			width : '35%',
			left : '55%',
			height : '10%'
		});

		win_wid.add(done);
		win_wid.add(cancel);
	
		done.addEventListener('click', function(){
			obj.currentDate	= date_picker.report;
			obj.value		= Math.round(obj.currentDate.getTime()) + obj.timezone;
			
			Ti.API.info('Date : '+obj.currentDate);
			Ti.API.info('Value: '+obj.value);

			var f_date	= 	obj.currentDate.getDate();
			var f_month	=	months_set[obj.currentDate.getMonth()];
			var f_year	=	obj.currentDate.getFullYear();
		    
			obj.text = f_month+" / "+f_date+" / "+f_year;
			changedContentValue(obj);
			win_wid.close();
		});

		cancel.addEventListener('click', function() {
			if(obj.value == null) {
				obj.update_it = false;
			}
			win_wid.close();
		});
	} else {
		//Composed field
		// Date picker
		// Time picker
		// For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it

		obj.update_it = true;

		//Update timezone
		obj.timezone = obj.currentDate.getTimezoneOffset() * 60 * 1000;
		Ti.API.info('Hours : ' + obj.currentDate.getHours());
		Ti.API.info('UTC Hour : ' + obj.currentDate.getUTCHours());

		//discover if is GMT+ or GMT-
		obj.timezone = obj.timezone * verify_UTC(obj.currentDate);
		//Refresh GMT value
		obj.value = Math.round(obj.currentDate.getTime()) + obj.timezone;

		Ti.API.info('TIMEZONE : ' + obj.timezone);
		Ti.API.info('Date : ' + obj.currentDate);

		//Get current
		var currentDate = obj.currentDate;
		var year = currentDate.getFullYear();

		//Min
		var minDate = new Date();
		minDate.setFullYear(year - 5);
		minDate.setMonth(0);
		minDate.setDate(1);

		//Max
		var maxDate = new Date();
		maxDate.setFullYear(year + 5);
		maxDate.setMonth(11);
		maxDate.setDate(31);

		var date_picker = Titanium.UI.createPicker({
			borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			value : obj.currentDate,
			font : {
				fontSize : 18
			},
			type : Ti.UI.PICKER_TYPE_DATE,
			minDate : minDate,
			maxDate : maxDate,
			report : obj.currentDate,
			color : '#000000',
			top : '12%'
		});
		date_picker.selectionIndicator = true;

		/*
		 * Time picker
		 */
		var time_picker = Titanium.UI.createPicker({
			borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			value : obj.currentDate,
			font : {
				fontSize : 18
			},
			report : obj.currentDate,
			type : Ti.UI.PICKER_TYPE_TIME,
			color : '#000000',
			top : '50%',
			timezone : null
		});
		time_picker.selectionIndicator = true;

		Ti.API.info('Value: ' + obj.value);

		date_picker.addEventListener('change', function(e) {
			e.source.report = e.value;
			//Update timezone
			obj.timezone = e.source.report.getTimezoneOffset() * 60 * 1000;
			//discover if is GMT+ or GMT-
			obj.timezone = obj.timezone * verify_UTC(e.source.report);
			Ti.API.info('New Timezone: ' + obj.timezone);
		});
		//Add field:
		win_wid.add(date_picker);

		time_picker.addEventListener('change', function(e) {
			Ti.API.info('Time: ' + e.value);
			Ti.API.info('Report: ' + e.source.report);

			e.source.report = e.value;
			//Update timezone
			e.source.timezone = e.source.report.getTimezoneOffset() * 60 * 1000;
			//discover if is GMT+ or GMT-
			e.source.timezone = e.source.timezone * verify_UTC(e.source.report);
			Ti.API.info('Timezone for time_picker: ' + e.source.timezone);
		});
		//Add field:
		win_wid.add(time_picker);

		var done = Ti.UI.createButton({
			title : 'Done',
			bottom : 10,
			width : '35%',
			left : '10%',
			height : '10%'
		});

		var cancel = Ti.UI.createButton({
			title : 'Cancel',
			bottom : 10,
			width : '35%',
			left : '55%',
			height : '10%'
		});

		win_wid.add(done);
		win_wid.add(cancel);

		done.addEventListener('click', function() {
			var date_value = date_picker.report;
			var time_value = time_picker.report;

			//Day with no second
			var date_rest = date_value.getTime() % 86400000;

			//Local and actual timezone
			var local_timezone = time_picker.report.getTimezoneOffset() * 60 * 1000;

			//discover if is GMT+ or GMT-
			local_timezone = local_timezone * verify_UTC(time_picker.report);
			var timezone_diff = local_timezone - obj.timezone;

			var time_rest = (time_value.getTime() + timezone_diff) % 86400000;
			date_value = (Math.round(date_value.getTime()) - date_rest);
			time_value = (time_rest);

			var composed_date = date_value + time_value;
			var new_date = new Date(composed_date);

			obj.currentDate = new_date;
			obj.value = Math.round(obj.currentDate.getTime()) + obj.timezone;

			Ti.API.info('Date : ' + obj.currentDate);
			Ti.API.info('Value: ' + obj.value);

			var f_minute = obj.currentDate.getMinutes();
			var f_hour = obj.currentDate.getHours();
			var f_date = obj.currentDate.getDate();
			var f_month = months_set[obj.currentDate.getMonth()];
			var f_year = obj.currentDate.getFullYear();

			obj.text = f_hour + ":" + form_min(f_minute) + " - " + f_month + " / " + f_date + " / " + f_year;
			win_wid.close();
		});

		cancel.addEventListener('click', function() {
			if(obj.value == null) {
				obj.update_it = false;
			}
			win_wid.close();
		});
	}

	win_wid.open();

}

function display_omadi_time(obj) {
	var win_wid = Ti.UI.createWindow({
		//modal: true,
		backgroundColor: "#000",
		opacity: 0.9
	});

	var widget = obj.widget;
	var settings = obj.settings;

	var tit_picker = Ti.UI.createLabel({
		top : 0,
		width : '100%',
		height : '10%',
		backgroundColor : '#FFF',
		color : '#000',
		textAlign : 'center',
		font : {
			fontWeight : 'bold'
		},
		text : obj.title_picker
	});
	win_wid.add(tit_picker);

	obj.update_it = true;

	//Update timezone
	obj.timezone = obj.currentDate.getTimezoneOffset() * 60 * 1000;

	//discover if is GMT+ or GMT-
	obj.timezone = obj.timezone * verify_UTC(obj.currentDate);

	//Refresh GMT value
	obj.value = Math.round(obj.currentDate.getTime()) + obj.timezone;

	Ti.API.info('TIMEZONE : ' + obj.timezone);
	Ti.API.info('Date : ' + obj.currentDate);

	var date_picker = Titanium.UI.createPicker({
		borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		value : obj.currentDate,
		font : {
			fontSize : 18
		},
		report : obj.currentDate,
		type : Ti.UI.PICKER_TYPE_TIME,
		color : '#000000'
	});
	date_picker.selectionIndicator = true;

	Ti.API.info('Value: ' + obj.value);

	date_picker.addEventListener('change', function(e) {
		e.source.report = e.value;
		//Update timezone
		obj.timezone = e.source.report.getTimezoneOffset() * 60 * 1000;
		//discover if is GMT+ or GMT-
		obj.timezone = obj.timezone * verify_UTC(e.source.report);
	});
	//Add fields:
	win_wid.add(date_picker);

	var done = Ti.UI.createButton({
		title : 'Done',
		bottom : 10,
		width : '35%',
		left : '10%',
		height : '10%'
	});

	var cancel = Ti.UI.createButton({
		title : 'Cancel',
		bottom : 10,
		width : '35%',
		left : '55%',
		height : '10%'
	});

	win_wid.add(done);
	win_wid.add(cancel);

	done.addEventListener('click', function() {
		obj.currentDate = date_picker.report;
		obj.value = Math.round(obj.currentDate.getTime()) + obj.timezone;

		Ti.API.info('Date : ' + obj.currentDate);
		Ti.API.info('Value: ' + obj.value);

		var hours = obj.currentDate.getHours();
		var min = obj.currentDate.getMinutes();

		obj.text = hours+":"+form_min(min);
		changedContentValue(obj);
		win_wid.close();
	});

	cancel.addEventListener('click', function() {
		if(obj.value == null) {
			obj.update_it = false;
		}
		win_wid.close();
	});

	win_wid.open();
}

function open_mult_selector(obj) {
	var win_wid = Ti.UI.createWindow({
	//	modal: true,
		opacity: 1
	});
	var opacView = Ti.UI.createView({
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: '#000000',
		opacity : 0.5
	});
	
	win_wid.add(opacView);
	
	var win_view = Ti.UI.createView({
		backgroundColor : '#FFFFFF',
		top : '6%',
		left : '6%',
		right : '6%',
		bottom : '6%',
		borderRadius : 10,
		borderWidth : 2,
		borderColor : '#FFFFFF',
		opacity : 1
	});
	win_wid.add(win_view);

	var header_sel = Ti.UI.createView({
		top : 0,
		height : '15%',
		backgroundColor : '#333'
	});
	win_view.add(header_sel);

	var ico_sel = Ti.UI.createImageView({
		image : '/images/drop.png',
		width : "31dp",
		height : "31dp",
		left : "10dp"
	});
	header_sel.add(ico_sel);

	var label_sel = Ti.UI.createLabel({
		text : obj.view_title,
		color : '#FFF',
		font : {
			fontSize : '18dp',
			fontWeight : 'bold'
		},
		left: '51dp',
		wordWrap: false,
		ellipsize: true
	});
	header_sel.add(label_sel);

	var listView = Titanium.UI.createTableView({
		data : [],
		top : '15%',
		height : '73%',
		scrollable : true
	});

	var elements_to_insert = [];
	for(var v_iten in obj.itens) {
		Ti.API.info(v_iten);
		elements_to_insert.push({
			title : obj.itens[v_iten].title,
			v_info : obj.itens[v_iten].v_info,
			is_set : obj.itens[v_iten].is_set
		});
	}
	var color_set = "#A8A8A8";
	var color_unset = "#FFFFFF";

	var count_sel = 0;
	while(count_sel < elements_to_insert.length) {

		var row_t = Ti.UI.createTableViewRow({
			height : 'auto',
			display : elements_to_insert[count_sel].title,
			selected : elements_to_insert[count_sel].is_set,
			v_info : elements_to_insert[count_sel].v_info,
			backgroundColor : elements_to_insert[count_sel].is_set ? color_set : color_unset,
			className : 'menu_row' //optimize rendering
		});

		var title = Titanium.UI.createLabel({
			text: elements_to_insert[count_sel].title,
			//width:'83%',
			textAlign:'left',
			left:'10',
			right: '0',
			color: '#000',
			height:'auto',
			wordWrap: false,
			ellipsize: true
		});
		row_t.add(title);

		listView.appendRow(row_t);
		++count_sel;
	}
	win_view.add(listView);

	listView.addEventListener('click', function(e) {
		if(listView.data[0].rows[e.index].selected === false) {
			listView.data[0].rows[e.index].selected = true;
			listView.data[0].rows[e.index].backgroundColor = color_set;
		} else {
			listView.data[0].rows[e.index].selected = false;
			listView.data[0].rows[e.index].backgroundColor = color_unset;
		}
		Ti.API.info('Field set to ' + listView.data[0].rows[e.index].selected);
	});
	var bottom_sel = Ti.UI.createView({
		bottom : 0,
		height : '12%',
		width : '100%',
		backgroundColor : '#AAA'
	});
	win_view.add(bottom_sel);

	var selected_ok = Ti.UI.createButton({
		title: 'OK',
		width: '50%',
		top: '3',
		bottom: '5'
	});
	bottom_sel.add(selected_ok);

	selected_ok.addEventListener('click', function() {
		var aux_ret = new Array();
		var valid_return = new Array();
		for(var i_sel = 0; i_sel < listView.data[0].rows.length; i_sel++) {
			if(listView.data[0].rows[i_sel].selected == true) {
				aux_ret.push({
					title : listView.data[0].rows[i_sel].display,
					v_info : listView.data[0].rows[i_sel].v_info,
					is_set : true
				});

				valid_return.push({
					title : listView.data[0].rows[i_sel].display,
					v_info : listView.data[0].rows[i_sel].v_info
				});
			} else {
				aux_ret.push({
					title : listView.data[0].rows[i_sel].display,
					v_info : listView.data[0].rows[i_sel].v_info,
					is_set : false
				});
			}
		}

		if(valid_return.length == 0) {
			obj.value = null
			obj.text = "";
		} else {
			obj.value = valid_return;
			if(valid_return.length == 1) {
				obj.text = valid_return[0].title;
			} else {
				obj.text = obj.view_title + " [" + valid_return.length + "]";
			}
		}

		obj.itens = aux_ret;
		win_wid.close();

	});
	
	if(PLATFORM != 'android'){
		var back = Ti.UI.createButton({
			title: 'Back',
			bottom: 10,
			width: '35%',
			left: '55%',
			height: '10%'	
		});
		back.addEventListener('click', function(){
			win_wid.close();
		});
		win_wid.leftNavButton = back;
	
	}
	
	win_wid.open();
}

//Populate array with field name and configs
var field_arr = new Array();
var unsorted_res = new Array();
var label = new Array();
var content = new Array();
var border = new Array();
var values_query = new Array();

var regions;
var fields_result;
var bundle_titles;
var content_fields;

var count = 0;
var title = 0;
var defaultImageVal = '../images/default.png'

create_or_edit_node.loadUI = function() {
	toolActInd.show();
	db_display = null;
	regions = null;
	fields_result = null;
	bundle_titles = null;
	content_fields = null;
	label = null;
	content = null;
	border = null;
	values_query = null;
	field_arr = null;
	unsorted_res = null;
	field_arr = new Array();
	unsorted_res = new Array();
	label = new Array();
	content = new Array();
	border = new Array();
	values_query = new Array();
	count = 0;
	title = 0;
	db_display = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
	regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win.type + '" ORDER BY weight ASC');

	var y = 0;
	var regionCount = 0;
	var expandedRegion = 0;
	while(regions.isValidRow()) {
		var reg_settings = JSON.parse(regions.fieldByName('settings'));

		if(reg_settings != null && parseInt(reg_settings.form_part) > win.region_form) {
			Ti.API.info('Region : ' + regions.fieldByName('label') + ' won\'t appear');
		} else {
			var regionHeader = Ti.UI.createLabel({
				text : regions.fieldByName('label') + ' :',
				color : '#000000',
				font : {
					fontSize : 18,
					fontWeight : 'bold'
				},
				textAlign : 'center',
				width : '100%',
				height : 40,
				top : y,
				backgroundColor : '#FFFFFF'
			});
			y = y + 40;

			var regionView = Ti.UI.createView({
				width : '100%',
				top : y,
				backgroundColor: '#000',
				zIndex: 0
			});

			regionHeader.viewContainer = regionView;
			regionHeader.addEventListener('click', function(e) {
				e.source.viewContainer.expanded = !e.source.viewContainer.expanded;
				if(e.source.viewContainer.expanded === true) {
					e.source.viewContainer.height = e.source.viewContainer.calculatedHeight;
					var top = 0;
					for(var i = 0; i < viewContent.getChildren().length; i++) {
						var v = viewContent.getChildren()[i];
						var isLabel = false;
						if(PLATFORM == 'android'){
							if( v instanceof Ti.UI.Label) {
								isLabel = true;
							}
						}else{
							if(v == '[object TiUILabel]'){
								isLabel = true;
							}
						}
						if( isLabel ) {
							v.top = top;
							top = top + 40;
							v.viewContainer.top = top;
							top = top + v.viewContainer.height + 10;
							e.source.viewContainer.show();
						}
					}
				} else {
					e.source.viewContainer.height = 0;
					e.source.viewContainer.hide();
					var top = 0;
					for(var i = 0; i < viewContent.getChildren().length; i++) {
						var v = viewContent.getChildren()[i];
						var isLabel = false;
						if(PLATFORM == 'android'){
							if( v instanceof Ti.UI.Label) {
								isLabel = true;
							}
						}else{
							if(v == '[object TiUILabel]'){
								isLabel = true;
							}
						}
						if( isLabel ) {
							v.top = top;
							top = top + 40;
							v.viewContainer.top = top;
							top = top + v.viewContainer.height + 10;
						}
					}
				}
			});
			var regionName = regions.fieldByName('region_name');
			fields_result = db_display.execute('SELECT * FROM fields WHERE bundle = "' + win.type + '" AND region = "' + regionName + '" ORDER BY weight ASC');
			if(win.mode == 1) {
				content_fields = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid = "' + win.nid + '" ');
			}

			var top = 0;
			var field_definer = 0;
			var index_size = 0;

			//If there is no field enabled for this region, then remove the header for this region after the end of loop.
			var isAnyEnabledField = false;

			var index_label = regions.fieldByName('label');
			while(fields_result.isValidRow()) {
				if(fields_result.fieldByName('disabled') == 0) {
					isAnyEnabledField = true;
					var widget = JSON.parse(fields_result.fieldByName('widget'));
					var settings = JSON.parse(fields_result.fieldByName('settings'));

					//Array of fields
					// field_arr[label][length]
					// field_arr[address][0], field_arr[address][1], field_arr[address][2]
					////
					field_arr[index_label] = new Array();
					if(win.mode == 1) {
						field_arr[index_label][index_size] = {
							label : fields_result.fieldByName('label'),
							type : fields_result.fieldByName('type'),
							required : fields_result.fieldByName('required'),
							field_name : fields_result.fieldByName('field_name'),
							settings : fields_result.fieldByName('settings'),
							widget : fields_result.fieldByName('widget'),
							fid : fields_result.fieldByName('fid'),
							is_title : false,
							actual_value : content_fields.fieldByName(fields_result.fieldByName('field_name'))
						};
					} else {
						field_arr[index_label][index_size] = {
							label : fields_result.fieldByName('label'),
							type : fields_result.fieldByName('type'),
							required : fields_result.fieldByName('required'),
							field_name : fields_result.fieldByName('field_name'),
							settings : fields_result.fieldByName('settings'),
							widget : fields_result.fieldByName('widget'),
							fid : fields_result.fieldByName('fid'),
							is_title : false,
							actual_value : ""
						};
					}

					var isRequired = false;
					if(field_arr[index_label][index_size].required == true || field_arr[index_label][index_size].required == 'true'){
						isRequired = true;
					}
					switch(field_arr[index_label][index_size].type) {

						case 'license_plate':
							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							var settings = JSON.parse(field_arr[index_label][index_size].settings);
							var fi_name = field_arr[index_label][index_size].field_name;
							var reffer_index = count;
							fi_name = fi_name.split('___');
							if(fi_name[1]) {
								var i_name = fi_name[1];
							} else {
								var i_name = fi_name[0];
							}

							i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);

							//Add fields:
							regionView.add(label[count]);

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = settings.state_default_value;
									}

									if(field_arr[index_label][index_size].field_name == "license_plate___state") {
										var arr_picker = [];
										var arr_opt		=	new Array();
										arr_picker.push({title: 'Cancel'});

										var aux_val = {
											cnt : 0,
											usps : null,
											title : " -- State -- "
										}

										//States
										// arr_picker.push({
											// title : " -- State -- ",
											// usps : null
										// });
										arr_picker.push({
											title : "Alabama",
											usps : "AL"
										});
										arr_picker.push({
											title : "Alaska",
											usps : "AK"
										});
										arr_picker.push({
											title : "Arizona",
											usps : "AZ"
										});
										arr_picker.push({
											title : "Arkansas",
											usps : "AR"
										});
										arr_picker.push({
											title : "California",
											usps : "CA"
										});
										arr_picker.push({
											title : "Colorado",
											usps : "CO"
										});
										arr_picker.push({
											title : "Connecticut",
											usps : "CT"
										});
										arr_picker.push({
											title : "Delaware",
											usps : "DE"
										});
										arr_picker.push({
											title : "Florida",
											usps : "FL"
										});
										arr_picker.push({
											title : "Georgia",
											usps : "GA"
										});
										arr_picker.push({
											title : "Hawaii",
											usps : "HI"
										});
										arr_picker.push({
											title : "Idaho",
											usps : "ID"
										});
										arr_picker.push({
											title : "Illinois",
											usps : "IL"
										});
										arr_picker.push({
											title : "Indiana",
											usps : "IN"
										});
										arr_picker.push({
											title : "Iowa",
											usps : "IA"
										});
										arr_picker.push({
											title : "Kansas",
											usps : "KS"
										});
										arr_picker.push({
											title : "Kentucky",
											usps : "KY"
										});
										arr_picker.push({
											title : "Louisiana",
											usps : "LA"
										});
										arr_picker.push({
											title : "Maine",
											usps : "ME"
										});
										arr_picker.push({
											title : "Maryland",
											usps : "MD"
										});
										arr_picker.push({
											title : "Massachusetts",
											usps : "MA"
										});
										arr_picker.push({
											title : "Michigan",
											usps : "MI"
										});
										arr_picker.push({
											title : "Minnesota",
											usps : "MN"
										});
										arr_picker.push({
											title : "Mississippi",
											usps : "MS"
										});
										arr_picker.push({
											title : "Missouri",
											usps : "MO"
										});
										arr_picker.push({
											title : "Montana",
											usps : "MT"
										});
										arr_picker.push({
											title : "Nebraska",
											usps : "NE"
										});
										arr_picker.push({
											title : "Nevada",
											usps : "NV"
										});
										arr_picker.push({
											title : "New Hampshire",
											usps : "NH"
										});
										arr_picker.push({
											title : "New Jersey",
											usps : "NJ"
										});
										arr_picker.push({
											title : "New Mexico",
											usps : "NM"
										});
										arr_picker.push({
											title : "New York",
											usps : "NY"
										});
										arr_picker.push({
											title : "North Carolina",
											usps : "NC"
										});
										arr_picker.push({
											title : "North Dakota",
											usps : "ND"
										});
										arr_picker.push({
											title : "Ohio",
											usps : "OH"
										});
										arr_picker.push({
											title : "Oklahoma",
											usps : "OK"
										});
										arr_picker.push({
											title : "Oregon",
											usps : "OR"
										});
										arr_picker.push({
											title : "Pennsylvania",
											usps : "PA"
										});
										arr_picker.push({
											title : "Rhode Island",
											usps : "RI"
										});
										arr_picker.push({
											title : "South Carolina",
											usps : "SC"
										});
										arr_picker.push({
											title : "South Dakota",
											usps : "SD"
										});
										arr_picker.push({
											title : "Tennessee",
											usps : "TN"
										});
										arr_picker.push({
											title : "Texas",
											usps : "TX"
										});
										arr_picker.push({
											title : "Utah",
											usps : "UT"
										});
										arr_picker.push({
											title : "Vermont",
											usps : "VT"
										});
										arr_picker.push({
											title : "Virginia",
											usps : "VA"
										});
										arr_picker.push({
											title : "Washington",
											usps : "WA"
										});
										arr_picker.push({
											title : "West Virginia",
											usps : "WV"
										});
										arr_picker.push({
											title : "Wisconsin",
											usps : "WI"
										});
										arr_picker.push({
											title : "Wyoming",
											usps : "WY"
										});

										var count_at = 0;
										//var to_row = new Array();

										for(var at in arr_picker) {
											// to_row.push(Ti.UI.createPickerRow({
												// title : arr_picker[at].title,
												// usps : arr_picker[at].usps
											// }));
											if(arr_picker[at].usps == vl_to_field) {
												aux_val.cnt = count_at;
												aux_val.title = arr_picker[at].title;
												aux_val.usps = arr_picker[at].usps;
											}
											arr_opt.push(arr_picker[at].title);
											count_at++;
										}

										//Compares where it is

										content[count] = Titanium.UI.createButton({
									borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									private_index		: o_index,
									left				: '3%',
									right				: '3%',
									height				: heightValue,
									arr_opt				: arr_opt,
									arr_picker			: arr_picker,
									title				: aux_val.title,
									font 				: {
															fontSize: 18
									},
									color				: '#000000',
									top					: top,
									selectionIndicator	: true,
									field_type			: field_arr[index_label][index_size].type,
									field_name			: field_arr[index_label][index_size].field_name,
									required			: field_arr[index_label][index_size].required,
									is_title			: field_arr[index_label][index_size].is_title,
									value				: aux_val.usps,
									composed_obj		: true,
									cardinality			: settings.cardinality,
									reffer_index		: reffer_index,
									settings 			: settings,
									changedFlag			: 0
								});

										//content[count].add(to_row);

										//content[count].setSelectedRow(0, aux_val.cnt, false);

										content[count].addEventListener('click', function(e){
									//Ti.API.info('USPS: '+e.row.usps);
									//e.source.value = e.row.usps;
									var postDialog = Titanium.UI.createOptionDialog();
									postDialog.options = e.source.arr_opt;
									postDialog.cancel = -1;
									postDialog.show();
			
									postDialog.addEventListener('click', function(ev){
										if(ev.index != 0 && ev.index>0){
											e.source.title = e.source.arr_opt[ev.index];
											e.source.value = e.source.arr_picker[ev.index].usps;
										}
										changedContentValue(e.source);
									});   
								});
										top += heightValue;

										regionView.add(content[count]);
										count++;

									} else {
										content[count] = Ti.UI.createTextField({
									hintText		: "#"+o_index+" "+i_name,
									private_index	: o_index,
									reffer_index	: reffer_index,
									borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									textAlign		: 'left',
									width			: Ti.Platform.displayCaps.platformWidth-20,
									height			: heightValue,
									font 			: {
														fontSize: 18
									},
									color			: '#000000',
									top				: top,
									field_type		: field_arr[index_label][index_size].type,
									field_name		: field_arr[index_label][index_size].field_name,
									required		: field_arr[index_label][index_size].required,
									is_title		: field_arr[index_label][index_size].is_title,
									composed_obj	: true,
									cardinality		: settings.cardinality,
									value			: vl_to_field,
									settings 		: settings,
									changedFlag		: 0
								});
									}
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							}); 
									count++;
								}
							} else {
								if(field_arr[index_label][index_size].field_name == "license_plate___state") {
									var arr_picker = [];
									var arr_opt		=	new Array();
									arr_picker.push({title: 'Cancel'});

									var aux_val = {
										cnt : 0,
										usps : null,
										title : " -- State -- "
									}
									if(field_arr[index_label][index_size].actual_value != "" && field_arr[index_label][index_size].actual_value != "null" && field_arr[index_label][index_size].actual_value != null) {
									} else {
										field_arr[index_label][index_size].actual_value = settings.state_default_value;
									}
									Ti.API.info(settings.state_default_value);
									//States
									// arr_picker.push({
										// title : " -- State -- ",
										// usps : null
									// });
									arr_picker.push({
										title : "Alabama",
										usps : "AL"
									});
									arr_picker.push({
										title : "Alaska",
										usps : "AK"
									});
									arr_picker.push({
										title : "Arizona",
										usps : "AZ"
									});
									arr_picker.push({
										title : "Arkansas",
										usps : "AR"
									});
									arr_picker.push({
										title : "California",
										usps : "CA"
									});
									arr_picker.push({
										title : "Colorado",
										usps : "CO"
									});
									arr_picker.push({
										title : "Connecticut",
										usps : "CT"
									});
									arr_picker.push({
										title : "Delaware",
										usps : "DE"
									});
									arr_picker.push({
										title : "Florida",
										usps : "FL"
									});
									arr_picker.push({
										title : "Georgia",
										usps : "GA"
									});
									arr_picker.push({
										title : "Hawaii",
										usps : "HI"
									});
									arr_picker.push({
										title : "Idaho",
										usps : "ID"
									});
									arr_picker.push({
										title : "Illinois",
										usps : "IL"
									});
									arr_picker.push({
										title : "Indiana",
										usps : "IN"
									});
									arr_picker.push({
										title : "Iowa",
										usps : "IA"
									});
									arr_picker.push({
										title : "Kansas",
										usps : "KS"
									});
									arr_picker.push({
										title : "Kentucky",
										usps : "KY"
									});
									arr_picker.push({
										title : "Louisiana",
										usps : "LA"
									});
									arr_picker.push({
										title : "Maine",
										usps : "ME"
									});
									arr_picker.push({
										title : "Maryland",
										usps : "MD"
									});
									arr_picker.push({
										title : "Massachusetts",
										usps : "MA"
									});
									arr_picker.push({
										title : "Michigan",
										usps : "MI"
									});
									arr_picker.push({
										title : "Minnesota",
										usps : "MN"
									});
									arr_picker.push({
										title : "Mississippi",
										usps : "MS"
									});
									arr_picker.push({
										title : "Missouri",
										usps : "MO"
									});
									arr_picker.push({
										title : "Montana",
										usps : "MT"
									});
									arr_picker.push({
										title : "Nebraska",
										usps : "NE"
									});
									arr_picker.push({
										title : "Nevada",
										usps : "NV"
									});
									arr_picker.push({
										title : "New Hampshire",
										usps : "NH"
									});
									arr_picker.push({
										title : "New Jersey",
										usps : "NJ"
									});
									arr_picker.push({
										title : "New Mexico",
										usps : "NM"
									});
									arr_picker.push({
										title : "New York",
										usps : "NY"
									});
									arr_picker.push({
										title : "North Carolina",
										usps : "NC"
									});
									arr_picker.push({
										title : "North Dakota",
										usps : "ND"
									});
									arr_picker.push({
										title : "Ohio",
										usps : "OH"
									});
									arr_picker.push({
										title : "Oklahoma",
										usps : "OK"
									});
									arr_picker.push({
										title : "Oregon",
										usps : "OR"
									});
									arr_picker.push({
										title : "Pennsylvania",
										usps : "PA"
									});
									arr_picker.push({
										title : "Rhode Island",
										usps : "RI"
									});
									arr_picker.push({
										title : "South Carolina",
										usps : "SC"
									});
									arr_picker.push({
										title : "South Dakota",
										usps : "SD"
									});
									arr_picker.push({
										title : "Tennessee",
										usps : "TN"
									});
									arr_picker.push({
										title : "Texas",
										usps : "TX"
									});
									arr_picker.push({
										title : "Utah",
										usps : "UT"
									});
									arr_picker.push({
										title : "Vermont",
										usps : "VT"
									});
									arr_picker.push({
										title : "Virginia",
										usps : "VA"
									});
									arr_picker.push({
										title : "Washington",
										usps : "WA"
									});
									arr_picker.push({
										title : "West Virginia",
										usps : "WV"
									});
									arr_picker.push({
										title : "Wisconsin",
										usps : "WI"
									});
									arr_picker.push({
										title : "Wyoming",
										usps : "WY"
									});

									var count_at = 0;
									//var to_row = new Array();

									for(var at in arr_picker) {
										// to_row.push(Ti.UI.createPickerRow({
											// title : arr_picker[at].title,
											// usps : arr_picker[at].usps
										// }));
										if(arr_picker[at].usps == field_arr[index_label][index_size].actual_value) {
											aux_val.cnt = count_at;
											aux_val.title = arr_picker[at].title;
											aux_val.usps = arr_picker[at].usps;
										}
										arr_opt.push(arr_picker[at].title);
										count_at++;
									}

									//Compares where it is

									content[count] = Titanium.UI.createButton({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								private_index		: o_index,
								left				: '3%',
								right				: '3%',
								height				: heightValue,
								arr_opt				: arr_opt,
								arr_picker			: arr_picker,
								title				: aux_val.title,
								font 				: {
														fontSize: 18
								},
								color				: '#000000',
								top					: top,
								selectionIndicator	: true,
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								value				: aux_val.usps,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							}); 

									//content[count].add(to_row);

									//content[count].setSelectedRow(0, aux_val.cnt, false);

									content[count].addEventListener('click', function(e){
								//Ti.API.info('USPS: '+e.row.usps);
								//e.source.value = e.row.usps;
								var postDialog = Titanium.UI.createOptionDialog();
									postDialog.options = e.source.arr_opt;
									postDialog.cancel = -1;
									postDialog.show();
			
									postDialog.addEventListener('click', function(ev){
										if(ev.index != 0 && ev.index>0){
											e.source.title = e.source.arr_opt[ev.index];
											e.source.value = e.source.arr_picker[ev.index].usps;
										}
										changedContentValue(e.source);
									});    
							});
									top += heightValue;

									regionView.add(content[count]);
									count++;
								} else {

									content[count] = Ti.UI.createTextField({
								hintText		: i_name,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: false,
								cardinality		: settings.cardinality,
								value			: field_arr[index_label][index_size].actual_value,
								reffer_index	: reffer_index,
								settings 		: settings,
								changedFlag		: 0
							});
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
										changedContentValue(e.source);
									});
									count++;
								}
							}
							break;

						case 'text':
						case 'link_field':
							label[count] = Ti.UI.createLabel({
								text            : (isRequired? '*':'') +  field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							//Add fields:
							regionView.add(label[count]);
							var reffer_index = count;
							var settings 	= JSON.parse(field_arr[index_label][index_size].settings); 

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								settings 		: settings,
								changedFlag		: 0
							});
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							}); 
									count++;
								}
							} else {
								content[count] = Ti.UI.createTextField({
							hintText		: field_arr[index_label][index_size].label,
							borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							textAlign		: 'left',
							width			: Ti.Platform.displayCaps.platformWidth-20,
							height			: heightValue,
							font 			: {
												fontSize: 18
							},
							color			: '#000000',
							top				: top,
							field_type		: field_arr[index_label][index_size].type,
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index,
							settings 			: settings,
							changedFlag			: 0
						});
								top += heightValue;

								regionView.add(content[count]);
								content[count].addEventListener('change', function(e){
							changedContentValue(e.source);
						});
								count++;
							}

							break;

						case 'text_long':
							label[count] = Ti.UI.createLabel({
								text			:  (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							//Add fields:
							regionView.add(label[count]);
							var reffer_index = count;
							var settings 	= JSON.parse(field_arr[index_label][index_size].settings);

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: 100,
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							});
									top += 100;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							});
									count++;
								}
							} else {
								content[count] = Ti.UI.createTextField({
							hintText		: field_arr[index_label][index_size].label,
							borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							textAlign		: 'left',
							width			: Ti.Platform.displayCaps.platformWidth-20,
							height			: 100,
							color			: '#000000',
							top				: top,
							field_type		: field_arr[index_label][index_size].type,
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index,
							settings 			: settings,
							changedFlag			: 0
						});
								top += 100;

								regionView.add(content[count]);
								content[count].addEventListener('change', function(e){
							changedContentValue(e.source);
						});
								count++;
							}
							break;

						case 'location':
							var settings = JSON.parse(field_arr[index_label][index_size].settings);

							//Set our auxiliar array
							var aux_local = new Array;
							for(var i in settings.parts) {
								aux_local.push(settings.parts[i]);
							}

							var title_location = "";

							if(aux_local.length > 0) {
								if(aux_local.length == field_definer) {
									field_definer = 0;
								}
								if(aux_local[field_definer]) {
									title_location = aux_local[field_definer];
									field_definer++;
								}

							} else {
								title_location = field_arr[index_label][index_size].label;
								field_definer = 0;
							}

							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') + title_location ,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							//Add fields:
							regionView.add(label[count]);

							var reffer_index = count;

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							});
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							});
									count++;
								}
							} else {
								content[count] = Ti.UI.createTextField({
							hintText		: field_arr[index_label][index_size].label,
							borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							textAlign		: 'left',
							width			: Ti.Platform.displayCaps.platformWidth-20,
							height			: heightValue,
							font 			: {
												fontSize: 18
							},
							color			: '#000000',
							top				: top,
							field_type		: field_arr[index_label][index_size].type,
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index,
							settings 			: settings,
							changedFlag			: 0
						});
								top += heightValue;

								regionView.add(content[count]);
								content[count].addEventListener('change', function(e){
							changedContentValue(e.source);
						});
								count++;
							}
							break;

						case 'number_decimal':
						case 'number_integer':
							var settings = JSON.parse(field_arr[index_label][index_size].settings);

							label[count] = Ti.UI.createLabel({
								text			:  (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;
							
							//Add fields:
							regionView.add(label[count]);
							var reffer_index = count;
							var hasParent = false;
					var parent_name = "";
					var defaultField = "";
					if(settings.parent_form_default_value){
						if(settings.parent_form_default_value.parent_field != null && settings.parent_form_default_value.parent_field != ""){
							hasParent = true;
							parent_name = settings.parent_form_default_value.parent_field;
							defaultField = settings.parent_form_default_value.default_value_field;
						}
					}

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") && (decoded_values[o_index] != "null"))) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = null;
									}

									content[count] = Ti.UI.createTextField({
										hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								keyboardType	: Titanium.UI.KEYBOARD_NUMBER_PAD,
								returnKeyType   : Titanium.UI.RETURNKEY_DONE,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								composed_obj	: true,
								is_title		: field_arr[index_label][index_size].is_title,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								hasParent		: hasParent,
								parent_name		: parent_name,
								defaultField	: defaultField,
								settings 			: settings,
								changedFlag			: 0
									});
									addDoneButtonInKB(content[count]);
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							}); 
									count++;
								}
							} else {
								content[count] = Ti.UI.createTextField({
									hintText 		   	: field_arr[index_label][index_size].label,
									borderStyle    		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									keyboardType 		: Titanium.UI.KEYBOARD_NUMBER_PAD,
									returnKeyType  		: Titanium.UI.RETURNKEY_DONE,
									textAlign  			: 'left',
									width   			: Ti.Platform.displayCaps.platformWidth-20,
									height   			: heightValue,
									font   				: {
													     	fontSize: 18
															},
									color   			: '#000000',
									top    				: top,
									field_type  		: field_arr[index_label][index_size].type,
									field_name  		: field_arr[index_label][index_size].field_name,
									required  			: field_arr[index_label][index_size].required,
									composed_obj 		: false,
									is_title  			: field_arr[index_label][index_size].is_title,
									cardinality  		: settings.cardinality,
									value   			: field_arr[index_label][index_size].actual_value,
									reffer_index 		: reffer_index,
									hasParent  			: hasParent,
									parent_name  		: parent_name,
									defaultField 		: defaultField,
									settings   			: settings,
									changedFlag  		: 0
    							});
 								addDoneButtonInKB(content[count]);
								top += heightValue;

								regionView.add(content[count]);
								content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							}); 
								count++;
							}
							break;

						case 'phone':
							var settings = JSON.parse(field_arr[index_label][index_size].settings);

							label[count] = Ti.UI.createLabel({
								text			:  (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;
							//Add fields:
							regionView.add(label[count]);
							var reffer_index = count;

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								keyboardType	: Titanium.UI.KEYBOARD_NUMBER_PAD,
								returnKeyType   : Titanium.UI.RETURNKEY_DONE,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								composed_obj	: true,
								is_title		: field_arr[index_label][index_size].is_title,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							});
									addDoneButtonInKB(content[count]);
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							});
									count++;
								}
							} else {
								content[count] = Ti.UI.createTextField({
							hintText		: field_arr[index_label][index_size].label,
							borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							keyboardType	: Titanium.UI.KEYBOARD_NUMBER_PAD,
							returnKeyType   : Titanium.UI.RETURNKEY_DONE,
							textAlign		: 'left',
							width			: Ti.Platform.displayCaps.platformWidth-20,
							height			: heightValue,
							font 			: {
												fontSize: 18
							},
							color			: '#000000',
							top				: top,
							field_type		: field_arr[index_label][index_size].type,
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							composed_obj	: false,
							is_title		: field_arr[index_label][index_size].is_title,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index,
							settings 			: settings,
							changedFlag			: 0
						});
								addDoneButtonInKB(content[count]);
								top += heightValue;

								regionView.add(content[count]);
								content[count].addEventListener('change', function(e){
							changedContentValue(e.source);
						});
								count++;
							}
							break;

						case 'email':
							label[count] = Ti.UI.createLabel({
								text			:  (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							//Add fields:
							regionView.add(label[count]);
							var reffer_index	= count;
							var settings 	= JSON.parse(field_arr[index_label][index_size].settings); 

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								keyboardType	: Ti.UI.KEYBOARD_EMAIL,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							});
									top += heightValue;

									regionView.add(content[count]);
										content[count].addEventListener('change', function(e) {
											changedContentValue(e.source);
										});
									count++;
								}
							} else {
								content[count] = Ti.UI.createTextField({
							hintText		: field_arr[index_label][index_size].label,
							borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							keyboardType	: Ti.UI.KEYBOARD_EMAIL,
							textAlign		: 'left',
							width			: Ti.Platform.displayCaps.platformWidth-20,
							height			: heightValue,
							font 			: {
												fontSize: 18
							},
							color			: '#000000',
							top				: top,
							field_type		: field_arr[index_label][index_size].type,
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index,
							settings 			: settings,
							changedFlag			: 0
						});
								top += heightValue;

								regionView.add(content[count]);
								content[count].addEventListener('change', function(e){
							changedContentValue(e.source);
						});
								count++;
							}
							break;

						case 'taxonomy_term_reference':
							var widget = JSON.parse(field_arr[index_label][index_size].widget);
							var settings = JSON.parse(field_arr[index_label][index_size].settings);
							var hasParent = false;
							var parent_name = "";
							var defaultField = "";
							if(settings.parent_form_default_value) {
								if(settings.parent_form_default_value.parent_field != null && settings.parent_form_default_value.parent_field != "") {
									hasParent = true;
									parent_name = settings.parent_form_default_value.parent_field;
									defaultField = settings.parent_form_default_value.default_value_field;
								}
							}

							//Create picker list
							if(widget.type == 'options_select') {
								label[count] = Ti.UI.createLabel({
									text			: (isRequired? '*':'') + 'Select one '+field_arr[index_label][index_size].label,
									color			: isRequired? 'red':'#FFFFFF',
									font : {
										fontSize : 18
									},
									textAlign : 'left',
									left : '3%',
									touchEnabled : false,
									height : heightValue,
									top : top
								});
								top += heightValue;
								var reffer_index = count;

								var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
								var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY name ASC");

								var data_terms = [];
								if(settings.cardinality != -1) {
									// data_terms.push({
										// title : field_arr[index_label][index_size].label,
										// tid : null
									// });
								}

								while(terms.isValidRow()) {
									data_terms.push({
										title : terms.fieldByName('name'),
										tid : terms.fieldByName('tid')
									});
									terms.next();
								}
								terms.close();
								vocabulary.close();

								//Add fields:
								regionView.add(label[count]);

								Ti.API.info('===> ' + settings.cardinality);

								if(settings.cardinality > 1) {
									if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
										var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

										//Decode the stored array:
										var decoded = array_cont.fieldByName('encoded_array');
										decoded = Titanium.Utils.base64decode(decoded);
										Ti.API.info('Decoded array is equals to: ' + decoded);
										decoded = decoded.toString();

										// Token that splits each element contained into the array: 'j8Oá2s)E'
										var decoded_values = decoded.split("j8Oá2s)E");
									} else {
										var decoded_values = new Array();
										decoded_values[0] = field_arr[index_label][index_size].actual_value;
									}

									for(var o_index = 0; o_index < settings.cardinality; o_index++) {

										if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
											var vl_to_field = decoded_values[o_index];
										} else {
											var vl_to_field = "";
										}

										var arr_picker = new Array();
										var arr_opt		=	new Array();
										arr_picker.push({title: 'Cancel'});
										arr_opt.push('Cancel');	

										var aux_val = {
											title : "",
											vl : null,
											cnt : 0
										};

										var counter_loop = 0;
										for(var i_data_terms in data_terms) {
											if(vl_to_field == data_terms[i_data_terms].tid) {
												aux_val.title = data_terms[i_data_terms].title;
												aux_val.vl = data_terms[i_data_terms].tid;
												aux_val.cnt = counter_loop;
											}
											arr_picker.push({title:data_terms[i_data_terms].title, tid:data_terms[i_data_terms].tid });
											arr_opt.push(data_terms[i_data_terms].title);
											counter_loop++;
										}

										content[count] = Titanium.UI.createButton({
									borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									private_index		: o_index,
									left				: '3%',
									right				: '3%',
									height				: heightValue,
									arr_opt				: arr_opt,
									arr_picker			: arr_picker,
									title				: aux_val.title,
									font 				: {
															fontSize: 18
									},
									color				: '#000000',
									top					: top,
									selectionIndicator	: true,
									field_type			: field_arr[index_label][index_size].type,
									field_name			: field_arr[index_label][index_size].field_name,
									machine_name		: vocabulary.fieldByName('machine_name'),
									widget				: 'options_select',
									required			: field_arr[index_label][index_size].required,
									is_title			: field_arr[index_label][index_size].is_title,
									value				: aux_val.vl,
									composed_obj		: true,
									cardinality			: settings.cardinality,
									reffer_index		: reffer_index,
									hasParent		: hasParent,
									parent_name		: parent_name,
									defaultField	: defaultField,
									settings 			: settings,
									changedFlag			: 0
								}); 
								

										//content[count].add(arr_picker);

										//content[count].setSelectedRow(0, aux_val.cnt, false);

																			
										content[count].addEventListener('click', function(e) {
											//Ti.API.info('TID: '+e.row.tid);
											//e.source.value = e.row.tid;
											var postDialog = Titanium.UI.createOptionDialog();
											postDialog.options = e.source.arr_opt;
											postDialog.cancel = -1;
											postDialog.show();
									
											postDialog.addEventListener('click', function(ev) {
												if(ev.index != 0 && ev.index > 0) {
													e.source.title = e.source.arr_opt[ev.index];
													e.source.value = e.source.arr_picker[ev.index].tid;
												}
												changedContentValue(e.source);
											});
										});


										top += heightValue;

										//Add fields:
										regionView.add(content[count]);
										count++;
									}
								} else if(settings.cardinality == 1) {

									var arr_picker = new Array();
									var arr_opt		=	new Array();
									arr_picker.push({title: 'Cancel'});
									arr_opt.push('Cancel');	

									var aux_val = {
										title : "",
										vl : null,
										cnt : 0
									};

									var counter_loop = 0;
									for(var i_data_terms in data_terms) {
										if(field_arr[index_label][index_size].actual_value == data_terms[i_data_terms].tid) {
											aux_val.title = data_terms[i_data_terms].title;
											aux_val.vl = data_terms[i_data_terms].tid;
											aux_val.cnt = counter_loop;
										}
										arr_picker.push({
											title : data_terms[i_data_terms].title,
											tid : data_terms[i_data_terms].tid
										});
										arr_opt.push(data_terms[i_data_terms].title);
										counter_loop++;
									}


									content[count] = Titanium.UI.createButton({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								left				: '3%',
								right				: '3%',
								height				: heightValue,
								arr_opt				: arr_opt,
								arr_picker			: arr_picker,
								title				: aux_val.title,
								font 				: {
														fontSize: 18
								},
								color				: '#000000',
								top					: top,
								selectionIndicator	: true,
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								machine_name		: vocabulary.fieldByName('machine_name'),
								widget				: 'options_select',
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								value				: aux_val.vl,
								reffer_index		: reffer_index,
								hasParent			: hasParent,
								parent_name			: parent_name,
								defaultField		: defaultField,
								settings 			: settings,
								changedFlag			: 0
							}); 

									//content[count].add(arr_picker);
									//content[count].setSelectedRow(0, aux_val.cnt, false);
													
							content[count].addEventListener('click', function(e) {
								//Ti.API.info('TID: '+e.row.tid);
								//e.source.value = e.row.tid;
								var postDialog = Titanium.UI.createOptionDialog();
								postDialog.options = e.source.arr_opt;
								postDialog.cancel = -1;
								postDialog.show();
						
								postDialog.addEventListener('click', function(ev) {
									if(ev.index != 0 && ev.index > 0) {
										e.source.title = e.source.arr_opt[ev.index];
										e.source.value = e.source.arr_picker[ev.index].tid;
									}
									changedContentValue(e.source);
								});
							});
									top += heightValue;

									//Add fields:
									regionView.add(content[count]);
									count++;
								} else if(settings.cardinality == -1) {
									var sel_text = "";
									var _val_itens = [];
									var _itens = "";
									var _exist = [];

									if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
										var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

										//Decode the stored array:
										var decoded = array_cont.fieldByName('encoded_array');
										decoded = Titanium.Utils.base64decode(decoded);
										Ti.API.info('Decoded array is equals to: ' + decoded);
										decoded = decoded.toString();

										// Token that splits each element contained into the array: 'j8Oá2s)E'
										var decoded_values = decoded.split("j8Oá2s)E");
									} else {
										var decoded_values = new Array();
										decoded_values[0] = field_arr[index_label][index_size].actual_value;
									}

									for(var j_ind in data_terms) {
										Ti.API.info(data_terms[j_ind].tid + ' = ' + decoded_values.indexOf(data_terms[j_ind].tid.toString()));

										if(decoded_values.indexOf(data_terms[j_ind].tid.toString()) != -1) {
											sel_text = data_terms[j_ind].title;
											_val_itens.push({
												title : data_terms[j_ind].title,
												v_info : data_terms[j_ind].tid,
												is_set : true
											});

											_exist.push({
												title : data_terms[j_ind].title,
												v_info : data_terms[j_ind].tid
											});

										} else {
											_val_itens.push({
												title : data_terms[j_ind].title,
												v_info : data_terms[j_ind].tid,
												is_set : false
											});
										}

									}

									if(_exist.length > 1) {
										sel_text = field_arr[index_label][index_size].label + " [" + _exist.length + "]"
									}
									_itens = _exist;

									if(_exist.length == 0) {
										_itens = null;
									}

									Ti.API.info("==>> " + _val_itens);
									Ti.API.info("==>> " + _itens);

							content[count] = Titanium.UI.createLabel({
								left				: '3%',
								right				: '3%',
								text				: sel_text,
								backgroundColor     : "#FFF",
								textAlign			: "center",
								height				: heightValue,
								font 				: {
														fontSize: 18
								},
								color				: '#000000',
								top					: top,
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								machine_name		: vocabulary.fieldByName('machine_name'),
								widget				: 'options_select',
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								value				: _itens,
								itens				: _val_itens,
								view_title			: field_arr[index_label][index_size].label,
								reffer_index		: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							}); 
															
								content[count].addEventListener('click', function(e) {
									for(var jsa in e.source.itens) {
										Ti.API.info(jsa + ' = ' + e.source.itens[jsa].title);
									}
									open_mult_selector(e.source);
									changedContentValue(e.source);
								});


									top += heightValue;

									//Add fields:
									regionView.add(content[count]);
									count++;
								}
							}
							//Create autofill field
							else if(widget.type == 'taxonomy_autocomplete') {
								label[count] = Ti.UI.createLabel({
									text			: (isRequired? '*':'') +field_arr[index_label][index_size].label,
									color			: isRequired? 'red':'#FFFFFF',
									font : {
										fontSize : 18
									},
									textAlign : 'left',
									left : '3%',
									touchEnabled : false,
									height : heightValue,
									top : top
								});
								top += heightValue;

								//Add fields:
								regionView.add(label[count]);
								var reffer_index = count;

								if(settings.cardinality > 1) {
									if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
										var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

										//Decode the stored array:
										var decoded = array_cont.fieldByName('encoded_array');
										decoded = Titanium.Utils.base64decode(decoded);
										Ti.API.info('Decoded array is equals to: ' + decoded);
										decoded = decoded.toString();

										// Token that splits each element contained into the array: 'j8Oá2s)E'
										var decoded_values = decoded.split("j8Oá2s)E");
									} else {
										var decoded_values = new Array();
										decoded_values[0] = field_arr[index_label][index_size].actual_value;
									}

									for(var o_index = 0; o_index < settings.cardinality; o_index++) {

										if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
											var vl_to_field = decoded_values[o_index];
										} else {
											var vl_to_field = "";
										}

										if(!settings.vocabulary) {
											settings.vocabulary = field_arr[index_label][index_size].field_name;
										}
										Ti.API.info('================> Vocabulary ' + settings.vocabulary);
										var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
										var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY name ASC");
										var vid = vocabulary.fieldByName('vid');
										data_terms = new Array;
										var aux_val = {
											title : "",
											vl : null
										};

										while(terms.isValidRow()) {
											if(vl_to_field == terms.fieldByName('tid')) {
												aux_val.title = terms.fieldByName('name');
												aux_val.vl = terms.fieldByName('tid');
											}

											data_terms.push({
												title : terms.fieldByName('name'),
												tid : terms.fieldByName('tid')
											});
											terms.next();
										}
										//alert('AQUI => title: '+aux_val.title+' tid = '+aux_val.vl);

										terms.close();
										vocabulary.close();

										var rest_up = settings.restrict_new_autocomplete_terms;
										if(!rest_up) {
											rest_up = 0;
										}

										content[count] = Titanium.UI.createTextField({
									hintText						: "#"+o_index+" "+field_arr[index_label][index_size].label+' ...',
									borderStyle						: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						   			color							: '#000000',
									private_index					: o_index,
									height							: heightValue,
									font				 			: {
																		fontSize: 18
									},
								    width							: Ti.Platform.displayCaps.platformWidth-20,
								    top								: top,
			  						field_type						: field_arr[index_label][index_size].type,
									field_name						: field_arr[index_label][index_size].field_name,
									machine_name					: vocabulary.fieldByName('machine_name'),
									terms							: data_terms,
									tid								: aux_val.vl,
									restrict_new_autocomplete_terms	: rest_up,
									widget							: 'taxonomy_autocomplete',
									vid								: vid,
									fantasy_name					: field_arr[index_label][index_size].label,
									required						: field_arr[index_label][index_size].required,
									is_title						: field_arr[index_label][index_size].is_title,
									composed_obj					: true,
									cardinality						: settings.cardinality,
									value							: aux_val.title,
									first_time						: true,
									reffer_index					: reffer_index,
									settings 						: settings,
									changedFlag						: 0
								});

										//AUTOCOMPLETE TABLE
										var autocomplete_table = Titanium.UI.createTableView({
											top : top - getScreenHeight() * 0.2,
											searchHidden : true,
											zIndex : 15,
											height : getScreenHeight() * 0.2,
											backgroundColor : '#FFFFFF',
											visible : false
										});
										content[count].autocomplete_table = autocomplete_table;
										top += heightValue;

										regionView.add(content[count].autocomplete_table);

										//
										// TABLE EVENTS
										//
											content[count].autocomplete_table.addEventListener('click', function(e) {
												//e.source.setValueF(e.rowData.title, e.rowData.tid);

												if(PLATFORM != 'android') {
													e.source.textField.value = e.rowData.title;
													e.source.textField.tid = e.rowData.tid;
												} else {
													e.source.setValueF(e.rowData.title, e.rowData.tid);
												}

												setTimeout(function() {
													e.source.autocomplete_table.visible = false;
													Ti.API.info(e.rowData.title + ' was selected!');
												}, 80);
											});
																		
										content[count].addEventListener('blur', function(e) {
											e.source.autocomplete_table.visible = false;
											if((e.source.restrict_new_autocomplete_terms == 1) && (e.source.value != "") && (e.source.tid == null)) {
												if(PLATFORM == 'android') {
													Ti.UI.createNotification({
														message : 'The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !',
														duration : Ti.UI.NOTIFICATION_DURATION_LONG
													}).show();
												} else {
													alert('The field ' + e.source.fantasy_name + ' does not accept fields creation, select one of the list !');
												}
											}
										});

										//
										// SEARCH EVENTS
										//
									content[count].addEventListener('change', function(e){
									changedContentValue(e.source);
									if (e.source.first_time === false){
										var list = e.source.terms;
										var func = function setValueF(value_f, tid){
											e.source.value 	= value_f;
											e.source.tid	= tid;
											Ti.API.info('Value: '+value_f+' TID: '+tid);
										}
										
										e.source.tid = null;
										if ((e.value != null) && (e.value != '')){
										    table_data = [];
									        for (var i = 0; i < list.length; i++)
									        {
									        	var rg = new RegExp(e.source.value,'i');
									        	if (list[i].title.search(rg) != -1){
													//Check match
									        		if (e.source.value == list[i].title){
									        			e.source.tid	= list[i].tid;
									        		}
									        		else{
									        			e.source.tid	= null;
									        		}
				
													var row = Ti.UI.createTableViewRow(
													{
														height				: getScreenHeight()*0.10,
														title				: list[i].title,
														tid					: list[i].tid,
														color				: '#000000',
														autocomplete_table	: e.source.autocomplete_table,
														setValueF			: func,
														textField			: e.source
													});
													// apply rows to data array
													table_data.push(row);
									        	}
									        }
											e.source.autocomplete_table.setData(table_data);
											e.source.autocomplete_table.visible = true;
										}
										else{
											e.source.autocomplete_table.visible = false;
											e.source.tid = null;
										}
									}
									else{
										e.source.first_time = false;
									}
								});
										//Add fields:
										regionView.add(content[count]);
										count++;
									}
								} else {

									var vl_to_field = field_arr[index_label][index_size].actual_value;

									if(!settings.vocabulary) {
										settings.vocabulary = field_arr[index_label][index_size].field_name;
									}

									Ti.API.info('================> Vocabulary ' + settings.vocabulary);
									var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '" + settings.vocabulary + "'");
									var terms = db_display.execute("SELECT * FROM term_data WHERE vid='" + vocabulary.fieldByName('vid') + "'GROUP BY name ORDER BY name ASC");
									var vid = vocabulary.fieldByName('vid');
									data_terms = new Array;
									var aux_val = {
										title : "",
										vl : null
									};

									while(terms.isValidRow()) {
										if(vl_to_field == terms.fieldByName('tid')) {
											aux_val.title = terms.fieldByName('name');
											aux_val.vl = terms.fieldByName('tid');
										}

										data_terms.push({
											title : terms.fieldByName('name'),
											tid : terms.fieldByName('tid')
										});
										terms.next();
									}
									//alert('AQUI => title: '+aux_val.title+' tid = '+aux_val.vl);

									terms.close();
									vocabulary.close();

									var rest_up = settings.restrict_new_autocomplete_terms;
									if(!rest_up) {
										rest_up = 0;
									}

									content[count] = Titanium.UI.createTextField({
							    hintText						: field_arr[index_label][index_size].label+' ...',
							    borderStyle						: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						   		color							: '#000000',
								height							: heightValue,
								font				 			: {
																	fontSize: 18
								},
							    width							: Ti.Platform.displayCaps.platformWidth-20,
							    top								: top,
		  						field_type						: field_arr[index_label][index_size].type,
								field_name						: field_arr[index_label][index_size].field_name,
								machine_name					: vocabulary.fieldByName('machine_name'),
								terms							: data_terms,
								tid								: aux_val.vl,
								restrict_new_autocomplete_terms	: rest_up,
								widget							: 'taxonomy_autocomplete',
								vid								: vid,
								fantasy_name					: field_arr[index_label][index_size].label,
								required						: field_arr[index_label][index_size].required,
								is_title						: field_arr[index_label][index_size].is_title,
								composed_obj					: false,
								cardinality						: settings.cardinality,
								value							: aux_val.title,
								first_time						: true,
								reffer_index					: reffer_index,
								hasParent						: hasParent,
								parent_name						: parent_name,
								defaultField					: defaultField,
								settings 						: settings,
								changedFlag						: 0
							});

									//AUTOCOMPLETE TABLE
									var autocomplete_table = Titanium.UI.createTableView({
										top : top - getScreenHeight() * 0.2,
										searchHidden : true,
										zIndex : 15,
										height : getScreenHeight() * 0.2,
										backgroundColor : '#FFFFFF',
										visible : false
									});
									content[count].autocomplete_table = autocomplete_table;
									top += heightValue;

									regionView.add(content[count].autocomplete_table);

									//
									// TABLE EVENTS
									//
									content[count].autocomplete_table.addEventListener('click', function(e){
								//e.source.setValueF(e.rowData.title, e.rowData.tid);
								if(PLATFORM != 'android') {
									e.source.textField.value = e.rowData.title;
									e.source.textField.tid = e.rowData.tid;
								} else {
									e.source.setValueF(e.rowData.title, e.rowData.tid);
								}
								setTimeout(function(){
										e.source.autocomplete_table.visible = false;
										Ti.API.info(e.rowData.title+' was selected!');
								}, 80);
							});
							
							content[count].addEventListener('blur', function(e){
								e.source.autocomplete_table.visible = false;
								if ((e.source.restrict_new_autocomplete_terms == 1) && (e.source.value != "") && (e.source.tid == null)){
									if(PLATFORM == 'android'){
										Ti.UI.createNotification({
											message : 'The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !',
											duration: Ti.UI.NOTIFICATION_DURATION_LONG
										}).show();
									}else{
										alert('The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !');
									}	
								}
							});
									//
									// SEARCH EVENTS
									//
									content[count].addEventListener('change', function(e){
								changedContentValue(e.source);
								if (e.source.first_time === false){
									var list = e.source.terms;
									var func = function setValueF(value_f, tid){
										e.source.value 	= value_f;
										e.source.tid	= tid;
										Ti.API.info('Value: '+value_f+' TID: '+tid);
									}
									
									e.source.tid = null;
									if ((e.value != null) && (e.value != '')){
									    table_data = [];
								        for (var i = 0; i < list.length; i++)
								        {
								        	var rg = new RegExp(e.source.value,'i');
								        	if (list[i].title.search(rg) != -1){
												//Check match
								        		if (e.source.value == list[i].title){
								        			e.source.tid	= list[i].tid;
								        		}
								        		else{
								        			e.source.tid	= null;
								        		}
			
												var row = Ti.UI.createTableViewRow(
												{
													height				: getScreenHeight()*0.10,
													title				: list[i].title,
													tid					: list[i].tid,
													color				: '#000000',
													autocomplete_table	: e.source.autocomplete_table,
													setValueF			: func,
													textField			: e.source
												});
												// apply rows to data array
												table_data.push(row);
								        	}
								        }
										e.source.autocomplete_table.setData(table_data);
										e.source.autocomplete_table.visible = true;
									}
									else{
										e.source.autocomplete_table.visible = false;
										e.source.tid = null;
									}
								}
								else{
									e.source.first_time = false;
								}
		
							});
									//Add fields:
									regionView.add(content[count]);
									count++;
								}
							}
							break;

						//Refers to an object:
						case 'omadi_reference':
							var widget = JSON.parse(field_arr[index_label][index_size].widget);
							var settings = JSON.parse(field_arr[index_label][index_size].settings);

							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							var reffer_index = count;
							data_terms = new Array();
							aux_nodes = new Array();

							for(var i in settings.reference_types) {
								aux_nodes.push(settings.reference_types[i]);
							}

							if(aux_nodes.length > 0) {
								var secondary = 'SELECT * FROM node WHERE ';

								for(var i = 0; i < aux_nodes.length; i++) {
									if(i == aux_nodes.length - 1) {
										secondary += ' table_name = \'' + aux_nodes[i] + '\' ';
									} else {
										secondary += ' table_name = \'' + aux_nodes[i] + '\' OR ';
									}
								}
								Ti.API.info(secondary);
								var db_bah = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
								var nodes = db_bah.execute(secondary);
								Ti.API.info("Num of rows: " + nodes.rowCount);
								while(nodes.isValidRow()) {
									Ti.API.info('Title: ' + nodes.fieldByName('title') + ' NID: ' + nodes.fieldByName('nid'));
									data_terms.push({
										title : nodes.fieldByName('title'),
										nid : nodes.fieldByName('nid')
									});
									nodes.next();
								}
							}

							//Add fields:
							regionView.add(label[count]);

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									var aux_val = {
										title : "",
										vl : null
									};

									for(var h in data_terms) {
										if(data_terms[h].nid == vl_to_field) {
											aux_val.title = data_terms[h].title;
											aux_val.vl = data_terms[h].nid;
										}
									}

									content[count] = Titanium.UI.createTextField({
								hintText						: "#"+o_index+" "+field_arr[index_label][index_size].label+' ...',
								borderStyle						: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						   		color							: '#000000',
								private_index					: o_index,
								height							: heightValue,
								font				 			: {
																	fontSize: 18
								},
							    width							: Ti.Platform.displayCaps.platformWidth-20,
							    top								: top,
		  						field_type						: field_arr[index_label][index_size].type,
								field_name						: field_arr[index_label][index_size].field_name,
								terms							: data_terms,
								restrict_new_autocomplete_terms	: rest_up,
								fantasy_name					: field_arr[index_label][index_size].label,
								nid								: aux_val.vl,
								required						: field_arr[index_label][index_size].required,
								is_title						: field_arr[index_label][index_size].is_title,
								composed_obj					: true,
								cardinality						: settings.cardinality,
								value							: aux_val.title,
								first_time						: true,
								reffer_index					: reffer_index,
								settings 						: settings,
								changedFlag						: 0
							});

									//AUTOCOMPLETE TABLE
									var autocomplete_table = Titanium.UI.createTableView({
										top : top - getScreenHeight() * 0.2,
										searchHidden : true,
										zIndex : 15,
										height : getScreenHeight() * 0.2,
										backgroundColor : '#FFFFFF',
										visible : false
									});
									content[count].autocomplete_table = autocomplete_table;
									top += heightValue;

									regionView.add(content[count].autocomplete_table);

									//
									// TABLE EVENTS
									//
									content[count].autocomplete_table.addEventListener('click', function(e){
								//e.source.textField.setValueF(e.rowData.title, e.rowData.nid);
								
								if(PLATFORM != 'android') {
									e.source.textField.value = e.rowData.title;
									e.source.textField.nid = e.rowData.nid;
								} else {
									e.source.setValueF(e.rowData.title, e.rowData.nid);
								}

								setTimeout(function(){
										e.source.autocomplete_table.visible = false;
										Ti.API.info(e.rowData.title+' was selected!');
								}, 80);
								
							});
							
							content[count].addEventListener('blur', function(e){
								e.source.autocomplete_table.visible = false;
								if ((e.source.nid === null) && (e.source.value != "")){
									if(PLATFORM == 'android'){
										Ti.UI.createNotification({
											message : 'The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !',
											duration: Ti.UI.NOTIFICATION_DURATION_LONG
										}).show();
									}else{
										alert('The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !');
									}	
								}
							});
							
							//
							// SEARCH EVENTS
							//
							content[count].addEventListener('change', function(e){
								changedContentValue(e.source);
								if (e.source.first_time === false){
									var list = e.source.terms;
									var func = function setValueF(value_f, nid){
										e.source.value	 	= value_f;
										e.source.nid		= nid;
										Ti.API.info('Value: '+value_f+' NID: '+nid);
									}
									
									if ((e.value != null) && (e.value != '')){
									    table_data = [];
									    e.source.nid	= null;
								        for (var i = 0; i < list.length; i++)
								        {
								        	var rg = new RegExp(e.source.value,'i');
								        	if (list[i].title.search(rg) != -1){
												//Check match
								        		if (e.source.value == list[i].title){
								        			e.source.nid	= list[i].nid;
								        		}
								        		else{
								        			e.source.nid	= null;
								        		}
								        		
								        		//Create partial matching row
												var row = Ti.UI.createTableViewRow(
												{
													height				: getScreenHeight()*0.10,
													title				: list[i].title,
													nid					: list[i].nid,
													color				: '#000000',
													autocomplete_table	: e.source.autocomplete_table,
													setValueF			: func,
													textField			: e.source
												});
												// apply rows to data array
												table_data.push(row);
								        	}
								        }
										e.source.autocomplete_table.setData(table_data);
										e.source.autocomplete_table.visible = true;
									}
									else{
										e.source.autocomplete_table.visible = false;
										e.source.nid = null;
									}
								}
								else{
									e.source.first_time = false;
								}
		
							});
									//Add fields:
									regionView.add(content[count]);
									count++;
								}
							} else {

								var vl_to_field = field_arr[index_label][index_size].actual_value;

								var aux_val = {
									title : "",
									vl : null
								};

								for(var h in data_terms) {
									if(data_terms[h].nid == vl_to_field) {
										aux_val.title = data_terms[h].title;
										aux_val.vl = data_terms[h].nid;
									}
								}

								content[count] = Titanium.UI.createTextField({
						    hintText						: field_arr[index_label][index_size].label+' ...',
						    borderStyle						: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						    color							: '#000000',
							height							: heightValue,
							font				 			: {
																fontSize: 18
							},
						    width							: Ti.Platform.displayCaps.platformWidth-20,
						    top								: top,
	  						field_type						: field_arr[index_label][index_size].type,
							field_name						: field_arr[index_label][index_size].field_name,
							terms							: data_terms,
							restrict_new_autocomplete_terms	: rest_up,
							fantasy_name					: field_arr[index_label][index_size].label,
							nid								: aux_val.vl,
							required						: field_arr[index_label][index_size].required,
							is_title						: field_arr[index_label][index_size].is_title,
							composed_obj					: false,
							cardinality						: settings.cardinality,
							value							: aux_val.title,
							first_time						: true,
							reffer_index					: reffer_index,
							settings 						: settings,
							changedFlag						: 0
						});

								//AUTOCOMPLETE TABLE
								var autocomplete_table = Titanium.UI.createTableView({
									top : top - getScreenHeight() * 0.2,
									searchHidden : true,
									zIndex : 15,
									height : getScreenHeight() * 0.2,
									backgroundColor : '#FFFFFF',
									visible : false
								});
								content[count].autocomplete_table = autocomplete_table;
								top += heightValue;

								regionView.add(content[count].autocomplete_table);

								//
								// TABLE EVENTS
								//

								content[count].autocomplete_table.addEventListener('click', function(e){
							if(PLATFORM != 'android'){
								e.source.textField.value = e.rowData.title;
								e.source.textField.nid =  e.rowData.nid;
							}else{
								e.source.setValueF(e.rowData.title, e.rowData.nid);	
							}
							setTimeout(function(){
									e.source.autocomplete_table.visible = false;
									Ti.API.info(e.rowData.title+' was selected!');
							}, 80);
							
						});
						
						content[count].addEventListener('blur', function(e){
							e.source.autocomplete_table.visible = false;
							if ((e.source.nid === null) && (e.source.value != "")){
								if(PLATFORM == 'android'){
									Ti.UI.createNotification({
										message : 'The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !',
										duration: Ti.UI.NOTIFICATION_DURATION_LONG
									}).show();
								}else{
									alert('The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !');
								}
							}else{
								setDefaultValues(content, e);
							}
						});
						
						//
						// SEARCH EVENTS
						//
						content[count].addEventListener('change', function(e){
							changedContentValue(e.source);
							if (e.source.first_time === false){
								var list = e.source.terms;
								var func = function setValueF(value_f, nid){
									e.source.value	 	= value_f;
									e.source.nid		= nid;
									Ti.API.info('Value: '+value_f+' NID: '+nid);
								}
								
								if ((e.value != null) && (e.value != '')){
								    table_data = [];
								    e.source.nid	= null;
							        for (var i = 0; i < list.length; i++)
							        {
							        	var rg = new RegExp(e.source.value,'i');
							        	if (list[i].title.search(rg) != -1){
											//Check match
							        		if (e.source.value == list[i].title){
							        			e.source.nid	= list[i].nid;
							        		}
							        		else{
							        			e.source.nid	= null;
							        		}
							        		
							        		//Create partial matching row
											var row = Ti.UI.createTableViewRow(
											{
												height				: getScreenHeight()*0.10,
												title				: list[i].title,
												nid					: list[i].nid,
												color				: '#000000',
												autocomplete_table	: e.source.autocomplete_table,
												setValueF			: func,
												textField			: e.source
											});
											// apply rows to data array
											table_data.push(row);
							        	}
							        }
									e.source.autocomplete_table.setData(table_data);
									e.source.autocomplete_table.visible = true;
								}
								else{
									e.source.autocomplete_table.visible = false;
									e.source.nid = null;
								}
							}
							else{
								e.source.first_time = false;
							}
	
						});
								//Add fields:
								regionView.add(content[count]);
								count++;
							}

							break;

						case 'user_reference':
							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') +'Select one '+field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top

							});
							top += heightValue;

							var reffer_index = count;
							var settings 	= JSON.parse(field_arr[index_label][index_size].settings); 
							//Add fields:
							regionView.add(label[count]);

							var users = db_display.execute("SELECT * FROM user WHERE ((uid != 0) AND (uid != 1)) ORDER BY realname ASC");
							var data_terms = [];
							// data_terms.push({
								// title : field_arr[index_label][index_size].label,
								// uid : null
							// });

							while(users.isValidRow()) {
								if(users.fieldByName('realname') == '') {
									var name_ff = users.fieldByName('username');
								} else {
									var name_ff = users.fieldByName('realname');
								}

								data_terms.push({
									title : name_ff,
									uid : users.fieldByName('uid')
								});

								Ti.API.info('Username: \'' + users.fieldByName('username') + '\' , Realname: \'' + users.fieldByName('realname') + '\' , UID = ' + users.fieldByName('uid'));
								users.next();
							}
							users.close();
							for(var algo in settings) {
								Ti.API.info(algo + " ===================>>> " + settings[algo]);
							}

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									var arr_picker = new Array();
									var arr_opt		=	new Array();
									arr_picker.push({title: 'Cancel'});
									arr_opt.push('Cancel');	
									
									var aux_val = {
										title : "",
										vl : null,
										cnt : 0
									};

									if(vl_to_field == "") {
										if(settings.default_value == "current_user") {
											vl_to_field = win.uid;
										}

									}

									Ti.API.info(vl_to_field + " ----------------- is the uid ------------------- " + settings.default_value);

									var counter_loop = 0;
									for(var i_data_terms in data_terms) {
										if(vl_to_field == data_terms[i_data_terms].uid) {
											aux_val.title = data_terms[i_data_terms].title;
											aux_val.vl = data_terms[i_data_terms].uid;
											aux_val.cnt = counter_loop;
										}
										arr_picker.push({title:data_terms[i_data_terms].title, uid:data_terms[i_data_terms].uid});
										arr_opt.push(data_terms[i_data_terms].title);
										counter_loop++;
									}

							content[count] = Titanium.UI.createButton({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								private_index		: o_index,
								left				: '3%',
								right				: '3%',
								height				: heightValue,
								arr_opt				: arr_opt,
								arr_picker			: arr_picker,
								title				: aux_val.title,
								font 				: {
														fontSize: 18
								},
								color				: '#000000',
								top					: top,
								selectionIndicator	: true,
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								value				: aux_val.vl,
								composed_obj		: true,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							}); 
									top += heightValue;

								//	content[count].add(arr_picker);
								//	content[count].setSelectedRow(0, aux_val.cnt, false);

								content[count].addEventListener('click', function(e){
								//Ti.API.info('UID: '+e.row.uid);
								//e.source.value = e.row.uid; 
								var postDialog = Titanium.UI.createOptionDialog();
								postDialog.options = e.source.arr_opt;
								postDialog.cancel = -1;
								postDialog.show();
		
								postDialog.addEventListener('click', function(ev){
									if(ev.index != 0 && ev.index>0){
										e.source.title = e.source.arr_opt[ev.index];
										e.source.value = e.source.arr_picker[ev.index].uid;
									}
									changedContentValue(e.source);
								});  
							});
									//Add fields:
									regionView.add(content[count]);
									count++;

								}
							} else {

								var vl_to_field = field_arr[index_label][index_size].actual_value;

								if(vl_to_field == "") {
									if(settings.default_value == "current_user") {
										vl_to_field = win.uid;
									}
								}

								Ti.API.info(vl_to_field + " ----------------- is the uid ------------------- " + settings.default_value);

								var arr_picker = new Array();
								var arr_opt		=	new Array();
								arr_picker.push({title: 'Cancel'});
								arr_opt.push('Cancel');	

								var aux_val = {
									title : "",
									vl : null,
									cnt : 0
								};

								var counter_loop = 0;
								for(var i_data_terms in data_terms) {
									if(vl_to_field == data_terms[i_data_terms].uid) {
										aux_val.title = data_terms[i_data_terms].title;
										aux_val.vl = data_terms[i_data_terms].uid;
										aux_val.cnt = counter_loop;
									}
									arr_picker.push({title:data_terms[i_data_terms].title, uid:data_terms[i_data_terms].uid });
									arr_opt.push(data_terms[i_data_terms].title);
									counter_loop++;
								}

								content[count] = Titanium.UI.createButton({
							borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							left				: '3%',
							right				: '3%',
							height				: heightValue,
							arr_opt				: arr_opt,
							arr_picker			: arr_picker,
							title				: aux_val.title,
							font 				: {
													fontSize: 18
							},
							color				: '#000000',
							top					: top,
							selectionIndicator	: true,
							field_type			: field_arr[index_label][index_size].type,
							field_name			: field_arr[index_label][index_size].field_name,
							required			: field_arr[index_label][index_size].required,
							is_title			: field_arr[index_label][index_size].is_title,
							composed_obj		: false,
							cardinality			: settings.cardinality,
							value				: aux_val.vl,
							reffer_index		: reffer_index,
							settings 			: settings,
							changedFlag			: 0
						}); 
								top += heightValue;

								//content[count].add(arr_picker);
								//content[count].setSelectedRow(0, aux_val.cnt, false);

								content[count].addEventListener('click', function(e){
								//Ti.API.info('UID: '+e.row.uid);
								//e.source.value = e.row.uid; 
								var postDialog = Titanium.UI.createOptionDialog();
								postDialog.options = e.source.arr_opt;
								postDialog.cancel = -1;
								postDialog.show();
		
								postDialog.addEventListener('click', function(ev){
									if(ev.index != 0 && ev.index>0){
										e.source.title = e.source.arr_opt[ev.index];
										e.source.value = e.source.arr_picker[ev.index].uid;
									}
									changedContentValue(e.source);
								});  
							
						});
								//Add fields:
								regionView.add(content[count]);
								count++;
							}
							break;

						//Shows up date (check how it is exhibited):
						case 'datestamp':
							var widget = JSON.parse(field_arr[index_label][index_size].widget);
							var settings = JSON.parse(field_arr[index_label][index_size].settings);
							Ti.API.info(field_arr[index_label][index_size].settings);

							label[count] = Ti.UI.createLabel({
								text : 'Select the ' + field_arr[index_label][index_size].label,
								color : '#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top

							});
							top += heightValue;

							var reffer_index = count;

							//Add fields:
							regionView.add(label[count]);

							// call function display_widget
							if(widget.settings['time'] != "1") {

								if(settings.cardinality > 1) {
									if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
										var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

										//Decode the stored array:
										var decoded = array_cont.fieldByName('encoded_array');
										decoded = Titanium.Utils.base64decode(decoded);
										Ti.API.info('Decoded array is equals to: ' + decoded);
										decoded = decoded.toString();

										// Token that splits each element contained into the array: 'j8Oá2s)E'
										var decoded_values = decoded.split("j8Oá2s)E");
									} else {
										var decoded_values = new Array();
										decoded_values[0] = field_arr[index_label][index_size].actual_value;
									}

									for(var o_index = 0; o_index < settings.cardinality; o_index++) {
										var text_in_field = "";
										if((o_index < decoded_values.length) && ((decoded_values[o_index] != null) && (decoded_values[o_index] != "null") && (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
											var vl_to_field = (decoded_values[o_index]) * 1000;
											//Get current
											var currentDate = new Date(vl_to_field);
											var day = currentDate.getDate();
											var month = currentDate.getMonth();
											var year = currentDate.getFullYear();
											text_in_field = months_set[month] + " / " + day + " / " + year;
										} else {
											//Let's show it as
											var currentDate = new Date();
											var day = currentDate.getDate();
											var month = currentDate.getMonth();
											var year = currentDate.getFullYear();

											if(settings.default_value == 'now') {
												var vl_to_field = currentDate.getTime();
												text_in_field = months_set[month] + " / " + day + " / " + year;
											} else {
												var vl_to_field = null;
												text_in_field = "";
											}

										}

										content[count] = Titanium.UI.createLabel({
									borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									private_index		: o_index,
									left				: '3%',
									right				: '3%',
									title_picker		: field_arr[index_label][index_size].label,
									font 				: {
															fontSize: 18
									},
									text				: text_in_field,
									textAlign			: 'center',
									color				: '#000000',
									backgroundColor		: '#FFFFFF',
									field_type			: field_arr[index_label][index_size].type,
									field_name			: field_arr[index_label][index_size].field_name,
									widget				: widget,
									settings			: settings,
									currentDate			: currentDate,
									update_it			: true,
									time_type			: 0,
									required			: field_arr[index_label][index_size].required,
									value				: vl_to_field,
									is_title			: field_arr[index_label][index_size].is_title,
									composed_obj		: true,
									cardinality			: settings.cardinality,
									reffer_index		: reffer_index,
									width				: '100%',
									height				: '100%',
									settings 			: settings,
									changedFlag			: 0
								});

										var mother_of_view = Ti.UI.createView({
											height : heightValue,
											top : top
										});
										top += heightValue;

										mother_of_view.add(content[count]);

										var clear = Ti.UI.createImageView({
											image : '/images/cancel.png',
											right : '4%',
											height : '35dp',
											width : '35dp',
											is_clear : true,
											its_parent : content[count]
										});

										content[count].clear = clear;
										mother_of_view.add(content[count].clear);
										content[count].clear.addEventListener('click', function(e) {
											e.source.its_parent.text = "";
											e.source.its_parent.value = null;
										});

										content[count].addEventListener('click', function(e) {
											display_widget(e.source);
										});
										//regionView.add(content[count]);
										regionView.add(mother_of_view);
										count++;

									}
								} else {
									var text_in_field = "";
									if((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")) {
										var vl_to_field = (field_arr[index_label][index_size].actual_value) * 1000;

										//Get current
										var currentDate = new Date(vl_to_field);
										var day = currentDate.getDate();
										var month = currentDate.getMonth();
										var year = currentDate.getFullYear();
										text_in_field = months_set[month] + " / " + day + " / " + year;
									} else {
										var currentDate = new Date();

										var day = currentDate.getDate();
										var month = currentDate.getMonth();
										var year = currentDate.getFullYear();

										if(settings.default_value == 'now') {
											var vl_to_field = currentDate.getTime();
											text_in_field = months_set[month] + " / " + day + " / " + year;
										} else {
											var vl_to_field = null;
											text_in_field = "";
										}

									}

									content[count] = Titanium.UI.createLabel({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								left				: '3%',
								right				: '3%',
								title_picker		: field_arr[index_label][index_size].label,
								font 				: {
														fontSize: 18
								},
								text				: text_in_field,
								textAlign			: 'center',
								color				: '#000000',
								backgroundColor		: '#FFFFFF',
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								widget				: widget,
								settings			: settings,
								currentDate			: currentDate,
								update_it			: true,
								value				: vl_to_field,
								time_type			: 0,
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index,
								width				: '100%',
								height				: '100%',
								settings 			: settings,
								changedFlag			: 0

							});

									var mother_of_view = Ti.UI.createView({
										height : heightValue,
										top : top
									});
									top += heightValue;

									mother_of_view.add(content[count]);

									var clear = Ti.UI.createImageView({
										image : '/images/cancel.png',
										right : '4%',
										height : '35dp',
										width : '35dp',
										is_clear : true,
										its_parent : content[count]
									});

									content[count].clear = clear;
									mother_of_view.add(content[count].clear);
									content[count].clear.addEventListener('click', function(e) {
										e.source.its_parent.text = "";
										e.source.its_parent.value = null;
									});

									content[count].addEventListener('click', function(e) {
										display_widget(e.source);
									});
									//regionView.add(content[count]);
									regionView.add(mother_of_view);
									count++;

								}
							} else {
								//Composed field
								// Date picker
								// Time picker
								// For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it

								if(settings.cardinality > 1) {
									if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
										var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

										//Decode the stored array:
										var decoded = array_cont.fieldByName('encoded_array');
										decoded = Titanium.Utils.base64decode(decoded);
										Ti.API.info('Decoded array is equals to: ' + decoded);
										decoded = decoded.toString();

										// Token that splits each element contained into the array: 'j8Oá2s)E'
										var decoded_values = decoded.split("j8Oá2s)E");
									} else {
										var decoded_values = new Array();
										decoded_values[0] = field_arr[index_label][index_size].actual_value;
									}

									for(var o_index = 0; o_index < settings.cardinality; o_index++) {
										var text_in_field = "";
										if((o_index < decoded_values.length) && ((decoded_values[o_index] != null) && (decoded_values[o_index] != "null") && (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
											var vl_to_field = decoded_values[o_index] * 1000;

											//Get current
											var currentDate = new Date(vl_to_field);

											var day = currentDate.getDate();
											var month = currentDate.getMonth();
											var year = currentDate.getFullYear();
											var min = currentDate.getMinutes();
											var hours = currentDate.getHours();
											text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
										} else {
											//Get current
											var currentDate = new Date();

											var day = currentDate.getDate();
											var month = currentDate.getMonth();
											var year = currentDate.getFullYear();
											var min = currentDate.getMinutes();
											var hours = currentDate.getHours();

											if(settings.default_value == 'now') {
												var vl_to_field = currentDate.getTime();
												text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
											} else {
												var vl_to_field = null;
												text_in_field = "";
											}
										}

										//Date picker
										content[count] = Titanium.UI.createLabel({
									borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									private_index		: o_index,
									left				: '3%',
									right				: '3%',
									font 				: {
															fontSize: 18
									},
									text				: text_in_field,
									textAlign			: 'center',
									color				: '#000000',
									backgroundColor		: '#FFFFFF',
									field_type			: field_arr[index_label][index_size].type,
									field_name			: field_arr[index_label][index_size].field_name,
									title_picker		: field_arr[index_label][index_size].label,
									widget				: widget,
									settings			: settings,
									currentDate			: currentDate,
									update_it			: true,
									value				: vl_to_field,
									time_type			: 1,
									required			: field_arr[index_label][index_size].required,
									is_title			: field_arr[index_label][index_size].is_title,
									composed_obj		: true,
									cardinality			: settings.cardinality,
									reffer_index		: reffer_index,
									width				: '100%',
									height				: '100%',
									settings 			: settings,
									changedFlag			: 0

								});	

										var mother_of_view = Ti.UI.createView({
											height : heightValue,
											top : top
										});
										top += heightValue;

										mother_of_view.add(content[count]);

										var clear = Ti.UI.createImageView({
											image : '/images/cancel.png',
											right : '4%',
											height : '35dp',
											width : '35dp',
											is_clear : true,
											its_parent : content[count]
										});

										content[count].clear = clear;
										mother_of_view.add(content[count].clear);
										content[count].clear.addEventListener('click', function(e) {
											e.source.its_parent.text = "";
											e.source.its_parent.value = null;
										});

										content[count].addEventListener('click', function(e) {
											display_widget(e.source);
										});
										//regionView.add(content[count]);
										regionView.add(mother_of_view);
										count++;
									}
								} else {
									var text_in_field = "";
									if((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")) {
										var vl_to_field = field_arr[index_label][index_size].actual_value * 1000;
										//Get current
										var currentDate = new Date(vl_to_field);

										var day = currentDate.getDate();
										var month = currentDate.getMonth();
										var year = currentDate.getFullYear();
										var min = currentDate.getMinutes();
										var hours = currentDate.getHours();
										text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
									} else {
										//Get current
										var currentDate = new Date();

										var day = currentDate.getDate();
										var month = currentDate.getMonth();
										var year = currentDate.getFullYear();
										var min = currentDate.getMinutes();
										var hours = currentDate.getHours();

										if(settings.default_value == 'now') {
											var vl_to_field = currentDate.getTime();
											text_in_field = hours + ":" + form_min(min) + " - " + months_set[month] + " / " + day + " / " + year;
										} else {
											var vl_to_field = null;
											text_in_field = "";
										}
									}

									//Date picker

									content[count] = Titanium.UI.createLabel({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								left				: '3%',
								right				: '3%',
								font 				: {
														fontSize: 18
								},
								text				: text_in_field,
								textAlign			: 'center',
								color				: '#000000',
								backgroundColor		: '#FFFFFF',
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								title_picker		: field_arr[index_label][index_size].label,
								widget				: widget,
								settings			: settings,
								currentDate			: currentDate,
								update_it			: true,
								time_type			: 1,
								required			: field_arr[index_label][index_size].required,
								value				: vl_to_field,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index,
								width				: '100%',
								height				: '100%',
								settings 			: settings,
								changedFlag			: 0
							});

									var mother_of_view = Ti.UI.createView({
										height : heightValue,
										top : top
									});
									top += heightValue;

									mother_of_view.add(content[count]);

									var clear = Ti.UI.createImageView({
										image : '/images/cancel.png',
										right : '4%',
										height : '35dp',
										width : '35dp',
										is_clear : true,
										its_parent : content[count]
									});

									content[count].clear = clear;
									mother_of_view.add(content[count].clear);
									content[count].clear.addEventListener('click', function(e) {
										e.source.its_parent.text = "";
										e.source.its_parent.value = null;
									});

									content[count].addEventListener('click', function(e) {
										display_widget(e.source);
									});
									//regionView.add(content[count]);
									regionView.add(mother_of_view);
									count++;
								}

							}
							break;

						//Shows the on and off button?
						case 'list_boolean':

							var settings = JSON.parse(field_arr[index_label][index_size].settings);

							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') +field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top

							});
							top += heightValue;

							var reffer_index = count;

							//Add fields:
							regionView.add(label[count]);

							if(settings.cardinality > 1) {

								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;

								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if(o_index < decoded_values.length) {
										if((decoded_values[o_index] === true ) || (decoded_values[o_index] == "true") || ( field_arr[index_label][index_size].actual_value == 1) || ( field_arr[index_label][index_size].actual_value == '1'))
											var vl_to_field = true;
										else
											var vl_to_field = false;
									} else {
										var vl_to_field = false;
									}

									content[count] = Titanium.UI.createSwitch({
										top : top,
										private_index : o_index,
										height : getScreenHeight() * 0.1,
										titleOff : "No",
										titleOn : "Yes",
										value : vl_to_field,
										field_type : field_arr[index_label][index_size].type,
										field_name : field_arr[index_label][index_size].field_name,
										enabled : true,
										required : field_arr[index_label][index_size].required,
										is_title : field_arr[index_label][index_size].is_title,
										composed_obj : true,
										cardinality : settings.cardinality,
										reffer_index : reffer_index,
										settings 			: settings,
										changedFlag			: 0
									});
									top += getScreenHeight() * 0.1;
																	
									content[count].addEventListener('change', function(e) {
										Ti.API.info('Basic Switch value = ' + e.value);
										changedContentValue(e.source);
									});

									regionView.add(content[count]);
									count++;
								}
							} else {

								if((field_arr[index_label][index_size].actual_value === true ) || (field_arr[index_label][index_size].actual_value == "true") || ( field_arr[index_label][index_size].actual_value == 1) || ( field_arr[index_label][index_size].actual_value == '1'))
									var vl_to_field = true;
								else
									var vl_to_field = false;

								content[count] = Titanium.UI.createSwitch({
									top : top,
									height : getScreenHeight() * 0.1,
									titleOff : "No",
									titleOn : "Yes",
									value : vl_to_field,
									field_type : field_arr[index_label][index_size].type,
									field_name : field_arr[index_label][index_size].field_name,
									enabled : true,
									required : field_arr[index_label][index_size].required,
									is_title : field_arr[index_label][index_size].is_title,
									composed_obj : false,
									cardinality : settings.cardinality,
									reffer_index : reffer_index,
									settings 			: settings,
									changedFlag			: 0
								});
								top += getScreenHeight() * 0.1;
													
								content[count].addEventListener('change', function(e) {
									Ti.API.info('Basic Switch value = ' + e.value);
									changedContentValue(e.source);
								});

								regionView.add(content[count]);
								count++;
							}
							break;

						//Shows up date (check how it is exhibited):
						case 'omadi_time':
							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') +''+field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;
							var reffer_index = count;

							var widget = JSON.parse(field_arr[index_label][index_size].widget);
							var settings = JSON.parse(field_arr[index_label][index_size].settings);

							Ti.API.info('SETTINGS FOR DATESTAMP: ' + settings.default_value);
							Ti.API.info('WIDGET FOR DATESTAMP: ' + widget.settings['time']);

							// call function display_widget
							var currentDate = new Date();
							var min = currentDate.getMinutes();
							var hours = currentDate.getHours();
							var day = currentDate.getDate();
							var month = currentDate.getMonth();
							var year = currentDate.getFullYear();

							//Add fields:
							regionView.add(label[count]);

							if(settings.cardinality > 1) {

								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = currentDate.getTime();
									}

									content[count] = Titanium.UI.createLabel({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								private_index		: o_index,
								left				: '3%',
								right				: '3%',
								title_picker		: field_arr[index_label][index_size].label,
								font 				: {
														fontSize: 18
								},
								text				: hours+":"+form_min(min),
								textAlign			: 'center',
								color				: '#000000',
								backgroundColor		: '#FFFFFF',
								value				: vl_to_field,
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								widget				: widget,
								settings			: settings,
								currentDate			: currentDate,
								update_it			: true,
								timezone			: null,
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: true,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index,
								width				: '100%',
								height				: '100%',
								settings 			: settings,
								changedFlag			: 0
							});

									var mother_of_view = Ti.UI.createView({
										height : heightValue,
										top : top
									});
									top += heightValue;

									mother_of_view.add(content[count]);

									var clear = Ti.UI.createImageView({
										image : '/images/cancel.png',
										right : '4%',
										height : '35dp',
										width : '35dp',
										is_clear : true,
										its_parent : content[count]
									});

									content[count].clear = clear;
									mother_of_view.add(content[count].clear);
									content[count].clear.addEventListener('click', function(e) {
										e.source.its_parent.text = "";
										e.source.its_parent.value = null;
									});

									content[count].addEventListener('click', function(e) {
										display_omadi_time(e.source);
									});
									//regionView.add(content[count]);
									regionView.add(mother_of_view);
									count++;
								}
							} else {
								content[count] = Titanium.UI.createLabel({
							borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							left				: '3%',
							right				: '3%',
							title_picker		: field_arr[index_label][index_size].label,
							font 				: {
													fontSize: 18
							},
							text				: hours+":"+form_min(min),
							textAlign			: 'center',
							color				: '#000000',
							backgroundColor		: '#FFFFFF',
							value				: null,
							field_type			: field_arr[index_label][index_size].type,
							field_name			: field_arr[index_label][index_size].field_name,
							widget				: widget,
							settings			: settings,
							currentDate			: currentDate,
							update_it			: true,
							value				: currentDate.getTime(),
							required			: field_arr[index_label][index_size].required,
							is_title			: field_arr[index_label][index_size].is_title,
							composed_obj		: false,
							cardinality			: settings.cardinality,
							reffer_index		: reffer_index,
							width				: '100%',
							height				: '100%',
							settings 			: settings,
							changedFlag			: 0
						});


								var mother_of_view = Ti.UI.createView({
									height : heightValue,
									top : top
								});
								top += heightValue;

								mother_of_view.add(content[count]);

								var clear = Ti.UI.createImageView({
									image : '/images/cancel.png',
									right : '4%',
									height : '35dp',
									width : '35dp',
									is_clear : true,
									its_parent : content[count]
								});

								content[count].clear = clear;
								mother_of_view.add(content[count].clear);
								content[count].clear.addEventListener('click', function(e) {
									e.source.its_parent.text = "";
									e.source.its_parent.value = null;
								});

								content[count].addEventListener('click', function(e) {
									display_omadi_time(e.source);
								});
								//regionView.add(content[count]);
								regionView.add(mother_of_view);
								count++;
							}
							break;

						case 'vehicle_fields':
							label[count] = Ti.UI.createLabel({
								text: (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : heightValue,
								top : top
							});
							top += heightValue;

							var reffer_index = count;
							var settings = JSON.parse(field_arr[index_label][index_size].settings);
							var fi_name = field_arr[index_label][index_size].field_name;
							fi_name = fi_name.split('___');
							if(fi_name[1]) {
								var i_name = fi_name[1];
							} else {
								var i_name = fi_name[0];
							}
							i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);

							if(i_name == "Make") {
								var _make_ref = reffer_index;
							}

							//Add fields:
							regionView.add(label[count]);

							if(settings.cardinality > 1) {
								if((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1)) {
									var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');

									//Decode the stored array:
									var decoded = array_cont.fieldByName('encoded_array');
									decoded = Titanium.Utils.base64decode(decoded);
									Ti.API.info('Decoded array is equals to: ' + decoded);
									decoded = decoded.toString();

									// Token that splits each element contained into the array: 'j8Oá2s)E'
									var decoded_values = decoded.split("j8Oá2s)E");
								} else {
									var decoded_values = new Array();
									decoded_values[0] = field_arr[index_label][index_size].actual_value;
								}

								for(var o_index = 0; o_index < settings.cardinality; o_index++) {

									if((o_index < decoded_values.length) && ((decoded_values[o_index] != "") && (decoded_values[o_index] != " ") )) {
										var vl_to_field = decoded_values[o_index];
									} else {
										var vl_to_field = "";
									}

									content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+i_name,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								textAlign		: 'left',
								width			: Ti.Platform.displayCaps.platformWidth-20,
								height			: heightValue,
								font 			: {
													fontSize: 18
								},
								color			: '#000000',
								top				: top,
								field_type		: field_arr[index_label][index_size].type,
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index,
								settings 			: settings,
								changedFlag			: 0
							});
									top += heightValue;

									regionView.add(content[count]);
									content[count].addEventListener('change', function(e) {
								changedContentValue(e.source);
							}); 
									count++;
								}
							} else {
								var vl_to_field = field_arr[index_label][index_size].actual_value;
								var data_terms = new Array();

								if(i_name == "Make") {
									var aux_dt = db_display.execute("SELECT DISTINCT make FROM _vehicles");
									var keep_from_make = vl_to_field;


									while(aux_dt.isValidRow()) {
										data_terms.push(aux_dt.fieldByName("make"));
										aux_dt.next();
									}
								} else {
									data_terms = get_models(keep_from_make);
								}

								content[count] = Ti.UI.createTextField({
									hintText : i_name + ' ...',
									fantasy_name : i_name,
									borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									textAlign : 'left',
									left : '3%',
									right : '3%',
									height : heightValue,
									font : {
										fontSize : 18
									},
									color : '#000000',
									top : top,
									field_type : field_arr[index_label][index_size].type,
									field_name : field_arr[index_label][index_size].field_name,
									required : field_arr[index_label][index_size].required,
									is_title : field_arr[index_label][index_size].is_title,
									composed_obj : false,
									cardinality : settings.cardinality,
									value : vl_to_field,
									reffer_index : reffer_index,
									make_ind : _make_ref,
									terms : data_terms,
									first_time : true,
									_make : keep_from_make,
									settings 			: settings,
									changedFlag			: 0
								});

								//AUTOCOMPLETE TABLE
								var autocomplete_table = Titanium.UI.createTableView({
									top : top - getScreenHeight() * 0.2,
									searchHidden : true,
									zIndex : 15,
									height : getScreenHeight() * 0.2,
									backgroundColor : '#FFFFFF',
									visible : false
								});
								content[count].autocomplete_table = autocomplete_table;
								top += heightValue;

								regionView.add(content[count].autocomplete_table);


								//
								// TABLE EVENTS
								//
								content[count].autocomplete_table.addEventListener('click', function(e) {
										if(PLATFORM != 'android') {
											e.source.textField.value = e.rowData.title;
										} else {
											e.source.setValueF(e.rowData.title);
										}
									
									setTimeout(function() {
										e.source.autocomplete_table.visible = false;
										Ti.API.info(e.rowData.title + ' was selected!');
									}, 80);
								});

								content[count].addEventListener('blur', function(e) {
									e.source.autocomplete_table.visible = false;
								});


								content[count].addEventListener('focus', function(e) {
									if(e.source.fantasy_name == "Model") {
										Ti.API.info(content[e.source.make_ind].value);

										if(content[e.source.make_ind].value == e.source._make) {
											Ti.API.info('User didn\'t change make');
										} else {
											Ti.API.info('Make changed, reloading list')
											e.source._make = content[e.source.make_ind].value;
											e.source.terms = get_models(content[e.source.make_ind].value);
											e.source.value = null;
											e.source.first_time = true;
										}
									}
								});
								//
								// SEARCH EVENTS
								//
								content[count].addEventListener('change', function(e) {
									changedContentValue(e.source);
									if(e.source.first_time === false) {
										var list = e.source.terms;
										var func = function setValueF(value_f) {
											e.source.value = value_f;
											Ti.API.info('Value: ' + value_f);
										}
										if((e.value != null) && (e.value != '')) {
											table_data = [];
											for(var i = 0; i < list.length; i++) {
												var rg = new RegExp(e.source.value, 'i');
												if(list[i].search(rg) != -1) {

													//Create partial matching row
													var row = Ti.UI.createTableViewRow({
														height : getScreenHeight() * 0.10,
														title : list[i],
														color : '#000000',
														autocomplete_table : e.source.autocomplete_table,
														setValueF : func,
														textField			: e.source
													});
													// apply rows to data array
													table_data.push(row);
												}
											}
											e.source.autocomplete_table.setData(table_data);
											e.source.autocomplete_table.visible = true;
										} else {
											e.source.autocomplete_table.visible = false;
										}
									} else {
										e.source.first_time = false;
									}
								});
								//Add fields:
								regionView.add(content[count]);
								count++;

							}
							break;

						case 'region_separator_mode':
							if(field_arr[index_label][index_size].region_show === true) {
								if(top == 0) {
									var regionTop = 0;
								} else {
									var regionTop = top + 10;
								}
								label[count] = Ti.UI.createLabel({
									text : field_arr[index_label][index_size].label + ' :',
									color : '#000000',
									font : {
										fontSize : 18,
										fontWeight : 'bold'
									},
									textAlign : 'center',
									width : '100%',
									touchEnabled : false,
									height : 40,
									top : regionTop,
									backgroundColor : '#FFFFFF'
								});
								top += 40;

								regionView.add(label[count]);
								count++;
							}

							break;

						//Stuff to add image field..
						case 'image':
							label[count] = Ti.UI.createLabel({
								text			: (isRequired? '*':'') + field_arr[index_label][index_size].label,
								color			: isRequired? 'red':'#FFFFFF',
								font : {
									fontSize : 18
								},
								textAlign : 'left',
								left : '3%',
								touchEnabled : false,
								height : 25,
								top : top
							});

							//Add fields:
							var reserveTop = top;
							regionView.add(label[count]);
							var settings = JSON.parse(field_arr[index_label][index_size].settings);
							var reffer_index = count;
							top += heightValue;

							if(settings.cardinality > 1 || settings.cardinality < 0) {
								isUpdated = [];
								content[count] = Ti.UI.createScrollView({
									right : 10,
									left : '3%',
									top : top,
									contentWidth : 'auto',
									contentHeight : 100,
									height: 100,
									reffer_index : reffer_index,
									arrImages : null,
									scrollType : "horizontal",
									layout : 'horizontal',
									field_type : field_arr[index_label][index_size].type,
									field_name : field_arr[index_label][index_size].field_name,
									required : field_arr[index_label][index_size].required,
									is_title : field_arr[index_label][index_size].is_title,
									label : field_arr[index_label][index_size].label,
									composed_obj : true,
									addButton : null,
									cardinality : settings.cardinality,
									value : null
								});
								regionView.add(content[count]);
								var decodedValues = [];
								if(win.mode == 1) {
									var val = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid + ';');
									if(val.fieldByName(field_arr[index_label][index_size].field_name + '___file_id') == '7411317618171051229' || val.fieldByName(field_arr[index_label][index_size].field_name + '___file_id') == 7411317618171051229) {
										array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '___file_id\'');
									} else {
										array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win.nid + ' AND field_name = \'' + field_arr[index_label][index_size].field_name + '\'');
									}
									if(array_cont.rowCount > 0) {
										//Decode the stored array:
										var decoded = array_cont.fieldByName('encoded_array');
										decoded = Titanium.Utils.base64decode(decoded);
										decoded = decoded.toString();
										decodedValues = decoded.split("j8Oá2s)E");
									}
									val = db_display.execute('SELECT * FROM file_upload_queue WHERE nid=' + win.nid + ' AND field_name ="' + field_arr[index_label][index_size].field_name + '";');
									if(val.rowCount > 0) {
										while(val.isValidRow()) {
											isUpdated[val.fieldByName('delta')] = true;
											decodedValues[val.fieldByName('delta')] = Ti.Utils.base64decode(val.fieldByName('file_data'));
											val.next();
										}
									}
								}
								var arrImages = [];

								if(settings.cardinality < 0) {
									o_index = 0;
									for( img = 0; img < decodedValues.length; img++) {
										var updated = false
										if((img < decodedValues.length) && (decodedValues[img] != "") && (decodedValues[img] != null) && decodedValues[img] != 'null' && decodedValues[img] != 'undefined') {
											var vl_to_field = decodedValues[img];
											if(isUpdated[img] == true) {
												updated = isUpdated[img];
											}
										} else {
											continue;
										}
										arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
										o_index += 1;
									}
									if(decodedValues.length == 0 || o_index ==0) {
										arrImages = createImage(o_index, arrImages, defaultImageVal, content[count], false);
										o_index += 1;
									}

									//--------- Add Button
									addButton = Ti.UI.createButton({
										right : '5',
										title : '+',
										top : reserveTop,
										height : 40,
										width : 40,
										scrollView : content[count],
										o_index : o_index
									});
									regionView.add(addButton);
									addButton.addEventListener('click', function(e) {
										arrImages = createImage(e.source.o_index, arrImages, defaultImageVal, e.source.scrollView, false);
										e.source.scrollView.arrImages = arrImages
										e.source.o_index += 1;
									});
									content[count].addButton = addButton;
								} else {
									for(var o_index = 0; o_index < settings.cardinality; o_index++) {
										var updated = false;
										if((o_index < decodedValues.length) && (decodedValues[o_index] != "") && (decodedValues[o_index] != null) && decodedValues[o_index] != 'null' && decodedValues[o_index] != 'undefined') {
											var vl_to_field = decodedValues[o_index];
											if(isUpdated[o_index] == true) {
												updated = isUpdated[o_index];
											}
										} else {
											var vl_to_field = defaultImageVal;
										}
										arrImages = createImage(o_index, arrImages, vl_to_field, content[count], updated);
									}
								}
								content[count].arrImages = arrImages;
							} else {
								isUpdated = false;
								if(win.mode == 1) {
									var results = db_display.execute('SELECT * FROM ' + win.type + ' WHERE nid=' + win.nid + ';');
									if(results.rowCount > 0) {
										val = results.fieldByName(field_arr[index_label][index_size].field_name + '___file_id');
										if(val == null || val == 'null' || val == 'undefined') {
											val = results.fieldByName(field_arr[index_label][index_size].field_name);
										}
									}
									valUp = db_display.execute('SELECT * FROM file_upload_queue WHERE nid=' + win.nid + ' AND field_name ="' + field_arr[index_label][index_size].field_name + '";');

									if(valUp.rowCount > 0) {
										isUpdated = true;
										val = Ti.Utils.base64decode(valUp.fieldByName('file_data'));
									}
									if(val == null || val == 'null' || val == 'undefined' || val.rowCount == 0) {
										val = defaultImageVal;
									}

								}
								content[count] = Ti.UI.createImageView({
									label : field_arr[index_label][index_size].label,
									left : '3%',
									height : 80,
									width : 80,
									size : {
										height : '80',
										width : '80'
									},
									top : top + 10,
									private_index : 0,
									field_type : field_arr[index_label][index_size].type,
									field_name : field_arr[index_label][index_size].field_name,
									required : field_arr[index_label][index_size].required,
									is_title : field_arr[index_label][index_size].is_title,
									composed_obj : false,
									image : defaultImageVal,
									imageVal : val,
									imageData : null,
									bigImg : null,
									mimeType : null,
									cardinality : settings.cardinality,
									isUpdated : isUpdated,
									value : null
								});

								if(isUpdated == true) {
									content[count].image = val;
									content[count].bigImg = val;
									content[count].imageData = val;
								}
								content[count].addEventListener('click', function(e) {
									//Following method will open camera to capture the image.
									if(e.source.imageData != null) {
										var postDialog = Titanium.UI.createOptionDialog();
										postDialog.options = ['Capture Image', 'Show Image', 'cancel'];
										postDialog.cancel = 2;
										postDialog.show();

										postDialog.addEventListener('click', function(ev) {
											if(ev.index == 0) {
												openCamera(e);
											} else if(ev.index == 1) {
												downloadMainImage(e.source.imageVal, e.source, win);
											}
										});
										return;
									}
									openCamera(e);
								});
								regionView.add(content[count]);
							}

							top += 100;
							count++;
							break;
							case 'calculation_field':
					label[count] = Ti.UI.createLabel({
						text:   field_arr[index_label][index_size].label,
						color			: '#FFFFFF',
						font 			: {
											fontSize: 18
						},
						textAlign		: 'left',
						left			: '3%',
						touchEnabled	: false,
						height			: heightValue,
						top				: top
					});
					regionView.add(label[count]);
					top += heightValue;
					var reffer_index	= count;
					
					var settings 		= JSON.parse(field_arr[index_label][index_size].settings); 					
					content[count] = Ti.UI.createView({
							left			: '3%',
							right			: '3%',
							top				: top,
							field_type		: field_arr[index_label][index_size].type,
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							composed_obj	: false,
							is_title		: field_arr[index_label][index_size].is_title,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index,
							settings		: settings,
							layout 			: 'vertical',
							settings 			: settings,
							changedFlag			: 0
					});
					regionView.add(content[count]);
					createCalFieldTableFormat(content[count] , db_display, content);
					top += content[count].height+10;
					count++;
					break;
					}

				}
				fields_result.next();
				index_size++;
			}
			fields_result.close();

			Ti.API.info("expandedRegion = " + expandedRegion + "\ni = " + regionCount);
			if(expandedRegion == regionCount) {
				regionView.calculatedHeight = top;
				regionView.height = top;
				regionView.expanded = true;
				regionView.show();
			} else {
				regionView.calculatedHeight = top;
				regionView.height = 0;
				regionView.expanded = false;
				regionView.hide();
			}
			y = y + regionView.height + 10;

			if(isAnyEnabledField == true) {
				viewContent.add(regionHeader);
				viewContent.add(regionView);
			}
		}
		regions.next();
		regionCount++;
	}

	regions.close();
	if(content_fields != null) {
		content_fields.close();
	}
	db_display.close();

	setTimeout(function() {
		var entityArr = createEntityMultiple();
	for(var j = 0; j <= content.length; j++) {
		if(!content[j]) {
			continue;
		}
		// Call for Calculate 'Calculation field'
		if(win.mode==1){
			if(content[j].field_type == 'calculation_field') {
				reCalculate(content[j]);
			}
		}		

		if(content[j].settings == null || content[j].settings == "") {
			continue;
		}
		
		// set conditional required field
		if(content[j].settings['criteria'] != null && content[j].settings['criteria']['search_criteria'] != null) {
			for(var row_idx in content[j].settings['criteria']['search_criteria']) {
				var criteria_row = content[j].settings['criteria']['search_criteria'][row_idx];
				var field_name = criteria_row.field_name;
				if(content[entityArr[field_name][0]['reffer_index']].condDependedFields == null) {
					content[entityArr[field_name][0]['reffer_index']].condDependedFields = [];
				}
				var depArr = content[entityArr[field_name][0]['reffer_index']].condDependedFields;
				depArr.push(j);
				content[entityArr[field_name][0]['reffer_index']].condDependedFields = depArr;
			}
			if(content[j]) {
				conditionalSetRequiredField(j);
			}

		}
		
		// Download thumbnails from site
		if(win.mode == 1) {
			if(content[j].field_type == 'image') {
				if(content[j].cardinality > 1 || content[j].cardinality < 0) {
					var arrImages = content[j].arrImages;
					for( i_idx = 0; i_idx < arrImages.length; i_idx++) {
						if(arrImages[i_idx].imageVal != defaultImageVal && arrImages[i_idx].isUpdated == false) {
							downloadThumnail(arrImages[i_idx].imageVal, arrImages[i_idx], win);
						}
					}
				} else {
					if(content[j].imageVal != defaultImageVal && content[j].isUpdated == false) {
						downloadThumnail(content[j].imageVal, content[j], win);
					}
				}
			} 
		}
	}
	}, 100);
	
	var a = Titanium.UI.createAlertDialog({
		title : 'Omadi',
		buttonNames : ['OK']
	});
	//MENU
	//======================================
	// MENU
	//======================================

	if(Ti.Platform.name == 'android') {
		var activity = win.activity;
		activity.onCreateOptionsMenu = function(e) {
			//======================================
			// MENU - UI
			//======================================

			var menu = e.menu;
			var menu_first = menu.add({
				title : 'Cancel',
				order : 0
			});
			menu_first.setIcon("/images/cancel.png");

			var menu_second = menu.add({
				title : 'Save',
				order : 1
			});
			menu_second.setIcon("/images/save.png");

			var menu_third = menu.add({
				title : 'Draft',
				order : 3
			});
			menu_third.setIcon("/images/draft.png");

			//======================================
			// MENU - EVENTS
			//======================================

			menu_first.addEventListener("click", function(e) {
				if(win.mode == 0) {
					Ti.UI.createNotification({
						message : win.title + ' creation was cancelled !'
					}).show();
				} else {
					Ti.UI.createNotification({
						message : win.title + ' update was cancelled !'
					}).show();
				}

				win.close();

			});
			//======================================
			// MENU - EVENTS
			//======================================
			menu_third.addEventListener("click", function(e) {
				keep_info('draft');
			});

			menu_second.addEventListener("click", function(e) {
				keep_info('normal');
			});
		};
	}else{
		bottomButtons(win);
	}

	win.addEventListener('android:back', function() {
		if(win.mode == 1) {
			Ti.UI.createNotification({
				message : win.title + ' update was cancelled !',
				duration : Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		} else {
			Ti.UI.createNotification({
				message : win.title + ' creation was cancelled !',
				duration : Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		}
		win.close();
	});

	toolActInd.hide();
}
//setTimeout(function(e){} , 1000);


// To open camera
function openCamera(e) {
	try {
		var alertBox = Ti.UI.createAlertDialog();
		alertBox.title = 'Camera';
		Ti.Media.showCamera({

			success : function(event) {
				Ti.API.info("MIME TYPE: " + event.media.mimeType);
				// If image size greater than 1MB we will reduce th image else take as it is.
				if(event.media.length > ONE_MB) {
					e.source.imageData = reduceImage(event.media, 1000, 1000);
				} else {
					e.source.imageData = event.media;
				}
				e.source.image = e.source.imageData;
				e.source.bigImg = e.source.imageData;
				e.source.mimeType = event.media.mimeType;

				if(e.source.cardinality > 1 || e.source.cardinality < 0) {
					var alertPh = Ti.UI.createAlertDialog({
						message : 'Take another ' + e.source.label + ' photo?',
						buttonNames : ['Yes', 'No'],
						cancel : 1
					});
					alertPh.addEventListener('click', function(ev) {
						alertPh.hide();
						if(ev.index == 0) {
							if(e.source.cardinality < 1) {
								arrImages = createImage(e.source.scrollView.addButton.o_index, e.source.scrollView.arrImages, defaultImageVal, e.source.scrollView, false);
								e.source.scrollView.arrImages = arrImages;
								e.source.scrollView.addButton.o_index += 1;
								newSource = arrImages.length - 1;
							} else {
								newSource = (e.source.private_index == e.source.cardinality - 1) ? 0 : e.source.private_index + 1;
							}
							e.source = e.source.scrollView.arrImages[newSource];
							openCamera(e)
						}
					});
					if(e.source.cardinality > 1 && e.source.private_index == e.source.cardinality - 1) {
						return;
					}
					alertPh.show();
				}

			},
			error : function(error) {
				Ti.API.info('Captured Image - Error: ' + error.code + " :: " + error.message);
				if(error.code == Titanium.Media.NO_CAMERA) {
					alertBox.setMessage('No Camera in device');
					alertBox.show();
				}
			},
			saveToPhotoGallery : false,
			mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
		});
	} catch(ex) {

	}
}


function createImage(o_index, arrImages, data, scrollView, updated){
	contentImage = Ti.UI.createImageView({
		private_index : o_index,
		left : '5',
		//right			: '5',
		height			: 80,
		width			: 80,
		size: {
			height		: '80',
			width		: '80'
		},
		image : defaultImageVal,
		imageVal : data,
		imageData : null,
		bigImg : null,
		mimeType : null,
		label : scrollView.label,
		isUpdated : updated,
		scrollView : scrollView,
		cardinality : scrollView.cardinality
	});

	if(updated == true) {
		contentImage.image = data;
		contentImage.bigImg = data;
		contentImage.imageData = data;
	}
	contentImage.addEventListener('click', function(e) {
		//Following method will open camera to capture the image.
		if(e.source.imageData != null) {

			var postDialog = Titanium.UI.createOptionDialog();
			postDialog.options = ['Capture Image', 'Show Image', 'cancel'];
			postDialog.cancel = 2;
			postDialog.show();

			postDialog.addEventListener('click', function(ev) {
				if(ev.index == 0) {
					openCamera(e);
				} else if(ev.index == 1) {
					downloadMainImage(e.source.imageVal, e.source, win);
				}
			});
			return;
		}
		openCamera(e);
	});
	scrollView.add(contentImage);
	arrImages.push(contentImage);
	contentImage.scrollView.arrImages = arrImages;
	return arrImages;
}

function bottomButtons(actualWindow){
try{	
	if(actualWindow!=null){
		var back = Ti.UI.createButton({
			title : 'Back',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		back.addEventListener('click', function() {
			cancelOpt();
		});
		
		var space = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		});
		var label = Titanium.UI.createButton({
			title: actualWindow.title,
			color:'#fff',
			ellipsize: true,
			wordwrap: false,
			width: 200,
			style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
		});
		
		var save = Ti.UI.createButton({
			title : 'Save',
			style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
		});
		save.addEventListener('click', function() {
			keep_info('normal');
		});
	
		// create and add toolbar
		var toolbar = Titanium.UI.createToolbar({
			items:[back, space, label, space, save],
			top:0,
			borderTop:false,
			borderBottom:true
		});
		actualWindow.add(toolbar);
	}
}catch(evt){
	
}	
};

function cancelOpt(){
	if (win.mode == 0){
		if(PLATFORM == 'android'){
			Ti.UI.createNotification({
				message : win.title+' creation was cancelled !'
			}).show();
		}else{
			alert(win.title+' creation was cancelled !'); 
		}
	}
	else{
		if(PLATFORM == 'android'){
			Ti.UI.createNotification({
				message : win.title+' update was cancelled !'
			}).show();
		}else{
			alert(win.title+' update was cancelled !'); 
		}
	}
	win.close();
}

function setDefaultValues(content, e){
	try{
		for(counter = 0; counter < content.length; counter++) {
		if(!content[counter]) {
			continue;
		}
		if((content[counter].field_type == 'number_decimal' || content[counter].field_type == 'number_integer' 
		|| content[counter].field_type == 'taxonomy_term_reference') && content[counter].hasParent) {
			if(content[counter].value!=null && content[counter].value!=""){
				continue;
			}
			if(content[counter].parent_name == e.source.field_name) {
				
				db_display = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
				var table = db_display.execute('SELECT table_name FROM node WHERE nid = ' + e.source.nid);
				table = table.fieldByName('table_name');

				var defaultFieldVal = db_display.execute('SELECT ' + content[counter].defaultField + ' FROM ' + table + ' WHERE nid=' + e.source.nid);
				defaultFieldVal = defaultFieldVal.fieldByName(content[counter].defaultField);

				var defaultFieldSetting = db_display.execute('SELECT settings FROM fields WHERE field_name="' + content[counter].defaultField + '" and bundle="' + table + '";');
				defaultFieldSetting = JSON.parse(defaultFieldSetting.fieldByName('settings'));
				if(content[counter].cardinality == defaultFieldSetting.cardinality && defaultFieldSetting.cardinality == 1) {
					if(defaultFieldVal == null || defaultFieldVal == "" || defaultFieldVal == 7411317618171051229 || defaultFieldVal == "7411317618171051229" || defaultFieldVal == 7411317618171051000 || defaultFieldVal == "7411317618171051000") {
						continue;
					}

					 if((content[counter].field_type == 'number_decimal' || content[counter].field_type == 'number_integer')) {
						 content[counter].value = defaultFieldVal+ "";
						 content[counter].nid = e.source.nid;
					 } 
					 else {
						 defaultFieldVal = db_display.execute('SELECT name FROM term_data WHERE tid="' + defaultFieldVal + '";');
						 defaultFieldVal = defaultFieldVal.fieldByName('name');
						 content[counter].value = e.source.tid;
						 content[counter].title = defaultFieldVal;
					 }

				}else if(content[counter].cardinality == defaultFieldSetting.cardinality && defaultFieldSetting.cardinality > 1){
					
				}
				db_display.close();
			}

		}
	}
	
	}catch(evt){
		Ti.API.info('ERROR=====' + evt);
	}
	
}

function createEntityMultiple(){
	
	var entity = new Array();
	
	for( idx = 0; idx < content.length; idx++) {
		if(!content[idx]) {
			continue;
		}
		if(entity[content[idx].field_name]==null){
			entity[content[idx].field_name] = new Array();
		}
		var private_index	 = 0;
		if(content[idx].private_index!=null && content[idx].private_index!=""){
			private_index = content[idx].private_index;
		}
		entity[content[idx].field_name][private_index] = new Array();
		
		entity[content[idx].field_name][private_index]['value'] = content[idx].value;
		if(content[idx].field_type == 'datestamp') {
			entity[content[idx].field_name][private_index]['value'] = content[idx].value / 1000;
		}else if(content[idx].field_type == 'list_boolean'){
			entity[content[idx].field_name][private_index]['value'] = (content[idx].value)?1:0;
		}else{
			entity[content[idx].field_name][private_index]['value'] = content[idx].value;
		}
		
		entity[content[idx].field_name][private_index]['nid'] = content[idx].nid;
		
		if(content[idx].field_type == 'taxonomy_term_reference'){
			if(content[idx].widget == 'options_select'){
				entity[content[idx].field_name][private_index]['tid'] = content[idx].value;
			}else{
				entity[content[idx].field_name][private_index]['tid'] = content[idx].tid;
			}
		}else if(content[idx].field_type == 'user_reference'){
			entity[content[idx].field_name][private_index]['uid'] = content[idx].value;
		}
		
		entity[content[idx].field_name][private_index]['field_name'] = content[idx].field_name;
		entity[content[idx].field_name][private_index]['field_type'] = content[idx].field_type;
		entity[content[idx].field_name][private_index]['reffer_index'] = idx;
	}
	
	return entity; 
}

function createCalFieldTableFormat(single_content , db_display, contentArr){
	var entity = createEntityMultiple();
	var result = _calculation_field_get_values(win, db_display, single_content, entity, contentArr);
	var row_values = result[0].rows;
	var heightView = 0;
	if(row_values.length > 0) {
			var heightCellView = 40;
			var cal_value = 0;
			var total_rows = [];
			var cal_value_str = "";
			var isNegative = false;
			for( idx = 0; idx < row_values.length; idx++) {
				cal_value = row_values[idx].value;
				
				typeof(cal_value) == 'number' ? null : typeof(cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null; //Check type of the data
				isNegative = (cal_value < 0) ? true : false; // Is negative. And if it is -ve then write in this value in (brackets).
				cal_value_str =  Math.abs(cal_value).toCurrency({
	                "thousands_separator":",",
	                "currency_symbol":"$",
	                "symbol_position":"front",
	                "use_fractions" : { "fractions":2, "fraction_separator":"." }
	            });
	            cal_value_str = (isNegative)?"(" + cal_value_str + ")":cal_value_str; // Adding brackets over -ve value.
		
				var row = Ti.UI.createView({
					layout : 'horizontal',
					height : heightCellView,
					width : '100%',
					top : 1,
				});
				row.row_label = Ti.UI.createLabel({
					text : row_values[idx].row_label + ":  ",
					textAlign : 'right',
					width : 140,
					color : 'white',
					font : {
						fontFamily:'Helvetica Neue',
						fontSize : 14
					},
					color : '#000',
					height : heightCellView,
					wordWrap : false,
					ellipsize : true,
					backgroundColor: '#F2F2F2'

				});
				row.value = Ti.UI.createLabel({
					text : "  " + cal_value_str,
					textAlign : 'left',
					width: 150,
					left : 1,
					color : 'white',
					font : {
						fontFamily:'Helvetica Neue',
						fontSize : 14
					},
					color : '#000',
					height : heightCellView,
					wordWrap : false,
					ellipsize : true,
					backgroundColor: '#F2F2F2'
				});
				row.add(row.row_label);
				row.add(row.value);
				single_content.add(row);
				total_rows.push(row);
				heightView += heightCellView+1;
			}
			
			cal_value = result[0].final_value;
			typeof(cal_value) == 'number' ? null : typeof(cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null; //Check type of the data
			isNegative = (cal_value < 0) ? true : false; // Is negative. And if it is -ve then write in this value in (brackets).
			cal_value_str =  Math.abs(cal_value).toCurrency({
                "thousands_separator":",",
                "currency_symbol":"$",
                "symbol_position":"front",
                "use_fractions" : { "fractions":2, "fraction_separator":"." }
            });
            cal_value_str = (isNegative)?"(" + cal_value_str + ")":cal_value_str; // Adding brackets over -ve value.
		
			var row = Ti.UI.createView({
					layout 	: 'horizontal',
					height 	: heightCellView,
					width 	: '100%',
					top		:1
			});
			row.row_label = Ti.UI.createLabel({
				text 			: "Newly Calculated Total: ",
				textAlign 		: 'right',
				width			: 140,
				top 			: 0,
				color 			: 'white',
				font 			: {
					fontFamily:'Helvetica Neue',
					fontSize : 14,
					fontWeight: 'bold'
				},
				color 			: '#B40404',
				height 			: heightCellView,
				backgroundColor	: '#F2F2F2'
			});
			row.value = Ti.UI.createLabel({
				text 			: "  " + cal_value_str,
				textAlign 		: 'left',
				width 			: 150,
				right			: 0,
				top 			: 0,
				left			: 1,
				color 			: 'white',
				font 			: {
					fontFamily:'Helvetica Neue',
					fontSize : 14,
					fontWeight: 'bold'
				},
				color 			: '#B40404',
				height 			: heightCellView,
				wordWrap 		: false,
				ellipsize 		: true,
				backgroundColor	: '#F2F2F2'
			});
			
			row.add(row.row_label);
			row.add(row.value);
			single_content.add(row);
			total_rows.push(row);
			heightView += heightCellView+1;
			
			row = Ti.UI.createView({
					layout 	: 'horizontal',
					height 	: heightCellView,
					width 	: '100%',
					top		:5
			});
			row.calculateBtn = Ti.UI.createButton({
				title 			: "Recalculate",
				height: 35,
				width: 100,
				color: '#000',
				font 			: {
					fontFamily:'Helvetica Neue',
					fontSize : 14
				},
				idx: single_content.reffer_index
			});
			row.add(row.calculateBtn);
			single_content.add(row);
			heightView += heightCellView+5;
			row.calculateBtn.addEventListener('click', function(e){
				reCalculate(content[e.source.idx]);
			});
			
			single_content.total_rows = total_rows;
			single_content.value = result[0].final_value;
			
						
	}
	single_content.height = heightView;	
}

function addDoneButtonInKB(content){
	if(PLATFORM != 'android') {
		if(doneButton == null){
			var doneButton = Ti.UI.createButton({
				systemButton : Ti.UI.iPhone.SystemButton.DONE,
				right : 0,
				field : content
			});
		}
		doneButton.addEventListener('click', function(e) {
			e.source.field.blur();
		});
		content.keyboardToolbar = [doneButton];
		content.addEventListener('focus', function(e) {
			//e.source.keyboardToolbar = [doneButton];
			//doneButton.field = e.source;
		});				
	}
}

function reCalculate(singel_content){
	try{
		db_display = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
		var entity = createEntityMultiple();
		var result = _calculation_field_get_values(win, db_display, singel_content, entity, content);
		var row_values = result[0].rows;
		var total_rows = singel_content.total_rows;
		if(row_values.length > 0) {
			var cal_value = 0;
			var cal_value_str = "";
			var isNegative = false;
			for( idx = 0; idx < row_values.length; idx++) {
				cal_value = row_values[idx].value;
				typeof(cal_value) == 'number' ? null : typeof(cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null; //Check type of the data
				isNegative = (cal_value < 0) ? true : false; // Is negative. And if it is -ve then write in this value in (brackets).
				cal_value_str =  Math.abs(cal_value).toCurrency({
	                "thousands_separator":",",
	                "currency_symbol":"$",
	                "symbol_position":"front",
	                "use_fractions" : { "fractions":2, "fraction_separator":"." }
	            });
	            cal_value_str = (isNegative)?"(" + cal_value_str + ")":cal_value_str; // Adding brackets over -ve value.

				var row = total_rows[idx];
				row.row_label.text = row_values[idx].row_label + ":  ";
				row.value.text = "  " + cal_value_str;
			}
			
			cal_value = result[0].final_value;
			typeof(cal_value) == 'number' ? null : typeof(cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null; //Check type of the data
			isNegative = (cal_value < 0) ? true : false; // Is negative. And if it is -ve then write in this value in (brackets).
			cal_value_str =  Math.abs(cal_value).toCurrency({
                "thousands_separator":",",
                "currency_symbol":"$",
                "symbol_position":"front",
                "use_fractions" : { "fractions":2, "fraction_separator":"." }
      	 	 });
		 	cal_value_str = (isNegative)?"(" + cal_value_str + ")":cal_value_str; // Adding brackets over -ve value.

			var row = total_rows[row_values.length];
			row.row_label.text = "Newly Calculated Total: ";
			row.value.text = "  " + cal_value_str;
			singel_content.value = result[0].final_value;
		}
	}catch(e){
	}
	db_display.close();
				
}

function changedContentValue(changed_content){
	if(changed_content['condDependedFields'] != null) {
		var isTextField = false;
		if(PLATFORM == 'android') {
			if(changed_content instanceof Ti.UI.TextField){
				isTextField = true;
			}
		}else{
			if(changed_content == '[object TiUITextField]'){
				isTextField = true;
			}
		}
		
		if(isTextField){
			if((changed_content['changedFlag'] == 1) && (changed_content['value'] == null || changed_content['value'] == "")) {
				changed_content['changedFlag'] = 0;
			} else if((changed_content['changedFlag'] == 0) && (changed_content['value'] != null) && (changed_content['value'] != "")) {
				changed_content['changedFlag'] = 1;
			} else {
				return;
			}
		}

		for(idx in changed_content['condDependedFields']){
			if(!content[changed_content['condDependedFields'][idx]]){
				continue;
			}
			conditionalSetRequiredField(changed_content['condDependedFields'][idx]);
		}
		
	}	
	
}

function conditionalSetRequiredField(idx) {
	var entityArr = createEntityMultiple();
	var row_matches = [];
	if(content[idx].settings['criteria'] != null && content[idx].settings['criteria']['search_criteria'] != null) {
		usort(content[idx].settings['criteria']['search_criteria'], '_list_search_criteria_search_order');

		for(var row_idx in content[idx].settings['criteria']['search_criteria']) {
			var criteria_row = content[idx].settings['criteria']['search_criteria'][row_idx];
			row_matches[row_idx] = false;
			var field_name = criteria_row.field_name;
			var search_operator = criteria_row.operator;
			var search_value = criteria_row.value;
			var node_values = [];
			if(entityArr[field_name] != null) {

				switch(entityArr[field_name][0]['field_type']) {
					case 'text':
					case 'text_long':
					case 'link_field':
					case 'phone':
					case 'license_plate':
					case 'location':
					case 'vehicle_fields':
					case 'number_integer':
					case 'number_decimal':
					case 'email':
					case 'datestamp':
					case 'omadi_reference':
					case 'omadi_time':
						for(idx1 in entityArr[field_name]) {
							var elements = entityArr[field_name][idx1];
							if(elements['value'] != null && elements['value'] != "") {
								node_values.push(elements['value']);
							}
						}
						if(search_operator == '__filled') {
							for(var value_index in node_values) {
								node_value = node_values[value_index];
								if(node_value != null && node_value != "") {
									row_matches[row_idx] = true;
								}

							}
						} else {
							if(node_values == null && node_values == "") {
								row_matches[row_idx] = true;
							} else {
								for(var value_index in node_values) {
									node_value = node_values[value_index];
									if(node_value == null || node_value == "") {
										row_matches[row_idx] = true;
									}

								}
							}
						}
						break;
					case 'taxonomy_term_reference':
					case 'user_reference':
						for(idx1 in entityArr[field_name]) {
							elements = entityArr[field_name][idx1];
							if(elements['value'] != null && elements['value'] != "") {
								node_values.push(elements['value']);
							}
						}

						var search_value_arr = [];
						if(!isArray(search_value)) {
							for(var key in search_value) {
								if(search_value.hasOwnProperty(key)) {
									search_value_arr[key] = key;
								}
							}
							search_value = search_value_arr;
						} else {
							if(search_value.length == 0) {
								row_matches[row_idx] = true;
								break;
							}
						}
						if(search_operator != null && search_operator == '!=') {
							row_matches[row_idx] = true;
							if(search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
								row_matches[row_idx] = false;
							} else {
								for(idx1 in search_value) {
									chosen_value = search_value[idx1];
									if(in_array(chosen_value, node_values)) {
										row_matches[row_idx] = false;
									}
								}

							}
						} else if(search_operator == '=') {
							if(search_value['__null'] == '__null' && (node_values == null || node_values[0] == null)) {
								row_matches[row_idx] = true;
							} else {
								for(idx1 in search_value) {
									chosen_value = search_value[idx1];
									if(in_array(chosen_value, node_values)) {
										row_matches[row_idx] = true;
									}
								}
							}
						}

						break;

					case 'list_boolean':

						for(idx1 in entityArr[field_name]) {
							var elements = entityArr[field_name][idx1];
							node_values.push(elements['value']);
						}

						if(search_operator == '__filled') {
							for(var value_index in node_values) {
								node_value = node_values[value_index];
								if(node_value != 0) {
									row_matches[row_idx] = true;
								}

							}
						} else {
							if(node_values == null && node_values == "") {
								row_matches[row_idx] = true;
							} else {
								for(var value_index in node_values) {
									node_value = node_values[value_index];
									if(node_value == 0) {
										row_matches[row_idx] = true;
									}

								}
							}
						}
						break;

					case 'calculation_field':
						for(idx1 in entityArr[field_name]) {
							var elements = entityArr[field_name][idx1];
							node_values.push(elements['value']);
						}
						node_value = node_values[0];
						switch(search_operator) {

							case '>':
								if(node_value > search_value) {
									row_matches[row_idx] = true;
								}
								break;
							case '>=':
								if(node_value >= search_value) {
									row_matches[row_idx] = true;
								}
								break;
							case '!=':
								if(node_value != search_value) {
									row_matches[row_idx] = true;
								}
								break;
							case '<':
								if(node_value < search_value) {
									row_matches[row_idx] = true;
								}
								break;
							case '<=':
								if(node_value <= search_value) {
									row_matches[row_idx] = true;
								}
								break;

							default:
								if(node_value == search_value) {
									row_matches[row_idx] = true;
								}
								break;
						}

						break;

				}
			}
		}

		var retval = true;
		if(count_arr_obj(content[idx].settings['criteria']['search_criteria']) == 1) {
			retval = row_matches[0];
		} else {
			// Group each criteria row into groups of ors with the matching result of each or
			var and_groups = new Array();
			var and_group_index = 0;
			and_groups[and_group_index] = new Array();
			//print_r($criteria['search_criteria']);
			for(criteria_index in content[idx].settings['criteria']['search_criteria']) {
				criteria_row = content[idx].settings['criteria']['search_criteria'][criteria_index];
				if(criteria_index == 0) {
					and_groups[and_group_index][0] = row_matches[criteria_index];
				} else {
					if(criteria_row['row_operator'] == null || criteria_row['row_operator'] != 'or') {
						and_group_index++;
						and_groups[and_group_index] = new Array();
					}
					and_groups[and_group_index][0] = row_matches[criteria_index];
				}
			}

			// Get the final result, making sure each and group is TRUE
			for(idx1 in and_groups) {
				and_group = and_groups[idx1];
				and_group_match = false;
				for(idx1 in and_group) {
					or_match = and_group[idx1];
					// Make sure at least one item in an and group is true (or the only item is true)
					if(or_match) {
						and_group_match = true;
						break;
					}
				}

				// If one and group doesn't match the whole return value of this function is false
				if(!and_group_match) {
					retval = false;
					break;
				}
			}
		}
		if(retval) {
			if(content[idx].required != 'true' && content[idx].required != true && content[idx].required != 1) {
				label[idx].text = '*' + label[idx].text;
				label[idx].color = 'red';
				content[idx].required = true;
			}
		} else {
			if(content[idx].required == 'true' || content[idx].required == true || content[idx].required == 1) {
				label[idx].text = label[idx].text.substring(1, label[idx].text.length);
				label[idx].color = 'white';
				content[idx].required = false;
			}
		}
	}
}
