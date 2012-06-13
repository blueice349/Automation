/**
 * Name: individual_object.js
 * Function:
 * 		Show individual object's information retrieved from the database
 * Provides:
 * 		the window called by object.js
 *		a way to close the current window and open object.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the object's information.
 * @author Joseandro
 */

//Common used functions
Ti.include('/lib/functions.js');
Ti.include('/main_windows/create_or_edit_node.js');

//Current window's instance
var win4 = Ti.UI.currentWindow;

//Sets only portrait mode
win4.orientationModes = [Titanium.UI.PORTRAIT];

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});
//Functions:
function display_omadi_time(timestamp) {
	var time = timestamp * 1000;

	var got_time = new Date(time);

	var hours = got_time.getHours();
	var min = got_time.getMinutes();

	return hours + ":" + form_min(min);
}

function form_min(min) {
	if(min < 10) {
		return '0' + min;
	}
	return min;
}

var db_display = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
var results = db_display.execute('SELECT * FROM ' + win4.type + ' WHERE  nid = ' + win4.nid);

//The view where the results are presented
var resultView = Ti.UI.createView({
	top: '0',
	height: '100%',
	width: '90%',
	backgroundColor: '#000',
});
win4.add(resultView);

//Header where the selected name is presented
var header = Ti.UI.createView({
	top: '0',
	height: '35',
	width: '100%',
	backgroundColor: '#585858',
	zIndex: 11
});
resultView.add(header);

//Label containing the selected name
var labelNameContent = Ti.UI.createLabel({
	text: win4.nameSelected,
	height: 'auto',
	width:  '90%',
	font: {fontSize: 18,  fontWeight: "bold"},
	color: '#fff',
	textAlign: 'center',
	touchEnabled: false,
	ellipsize: true,
	wordWrap: false
});

header.add(labelNameContent);

var viewContent = Ti.UI.createScrollView({
    height:"100%",
    top: "35",
    //contentWidth: '100%',
    contentHeight: 'auto',
    backgroundColor: '#111111',
	showHorizontalScrollIndicator: false,
	showVerticalScrollIndicator: true,
	opacity: 1,
	//borderRadius: 7,
	//scrollType: 'vertical',
	//zIndex: 10, 
	layout: 'vertical'
});

resultView.add(viewContent);

var fields_result = db_display.execute('SELECT label, weight, type, field_name, widget, settings FROM fields WHERE bundle = "' + win4.type + '" ORDER BY weight ASC');
var regions = db_display.execute('SELECT * FROM regions WHERE node_type = "' + win4.type + '" ORDER BY weight ASC');

//Populate array with field name and configs
var fields = new Array();
var unsorted_res = new Array();
var c_index = 0;
var label = [];
var content = [];
var border = [];
var cell = [];
var count = 0;
var heightValue = 60;
var bug = [];

while(fields_result.isValidRow()) {
	unsorted_res.push({
		label : fields_result.fieldByName('label'),
		type : fields_result.fieldByName('type'),
		field_name : fields_result.fieldByName('field_name'),
		settings : fields_result.fieldByName('settings'),
		widget : fields_result.fieldByName('widget')
	});
	c_index++;
	fields_result.next();
}

while (regions.isValidRow()){
	var reg_settings = JSON.parse(regions.fieldByName('settings'));

	if(reg_settings != null && reg_settings.display_disabled) {
		Ti.API.info('Region : ' + regions.fieldByName('label') + ' won\'t appear');
	} else {
		fields[regions.fieldByName('region_name')] = new Array();

		//Display region title:
		fields[regions.fieldByName('region_name')]['label'] = regions.fieldByName('label');
		fields[regions.fieldByName('region_name')]['type'] = 'region_separator_mode';
		fields[regions.fieldByName('region_name')]['settings'] = regions.fieldByName('settings');

		Ti.API.info(' Region_name: ' + regions.fieldByName('region_name'));
		Ti.API.info(' Weight: ' + regions.fieldByName('weight'));

		//Organizing every field into regions:
		//while (fields_result.isValidRow()){
		for(var i in unsorted_res) {

			var settings = JSON.parse(unsorted_res[i].settings);
			Ti.API.info('Field region = ' + settings.region);
			if(regions.fieldByName('region_name') == settings.region) {
				Ti.API.info('Regions match! ');
				Ti.API.info('Field label: ' + unsorted_res[i].label);
				Ti.API.info('Field type: ' + unsorted_res[i].type);
				Ti.API.info('Field name: ' + unsorted_res[i].field_name);
				Ti.API.info('Field settings: ' + unsorted_res[i].settings);
				Ti.API.info('Field widget: ' + unsorted_res[i].widget);

				fields[unsorted_res[i].field_name] = new Array();

				//Display region title:
				fields[unsorted_res[i].field_name]['label'] = unsorted_res[i].label;
				fields[unsorted_res[i].field_name]['type'] = unsorted_res[i].type;
				fields[unsorted_res[i].field_name]['settings'] = unsorted_res[i].settings;
				fields[unsorted_res[i].field_name]['widget'] = unsorted_res[i].widget;
				fields[unsorted_res[i].field_name]['field_name'] = unsorted_res[i].field_name;
			} else {
				Ti.API.info(' Regions dont match! ');
			}
		}
	}
	regions.next();
}

if(c_index > 0) {
	var c_type = [];
	var c_label = [];
	var c_content = [];
	var c_settings = [];
	var c_widget = [];
	var c_field_name = [];
	var is_array = false;
	var show_region = new Array();

	for(var f_name_f in fields ) {
		//Ti.API.info(f_name_f+" => "+results.fieldByName(f_name_f)+" => "+fields[f_name_f]['type']);
		var fieldVal = null; 
		try{
			//Check is coloum exist in table or not
			fieldVal = results.fieldByName(f_name_f);
		}catch(e){}
		
		if ( (fieldVal != null && fieldVal != "") ||  (fields[f_name_f]['type'] == 'region_separator_mode') || (fields[f_name_f]['type'] == 'image') || (fields[f_name_f]['type'] == 'calculation_field')) {

			//fields from Fields table that match with current object
			c_type[count] = fields[f_name_f]['type'];
			c_label[count] = fields[f_name_f]['label'];
			c_settings[count] = fields[f_name_f]['settings'];
			c_widget[count] = fields[f_name_f]['widget'];
			c_field_name[count] = fields[f_name_f]['field_name'];

			//Content
			c_content[count] = fieldVal;
			var loop_times = 1;
			is_array = false;
			//Check if it is an array, token = 7411317618171051229
			if(((c_content[count] == 7411317618171051229) || (c_content[count] == '7411317618171051229')) && c_type[count] != 'image') {
				//var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win4.nid+' AND field_name = \''+f_name_f+'\' ');
				var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win4.nid + ' AND field_name = \'' + f_name_f + '\'  ');

				Ti.API.info(array_cont.rowCount);
				Ti.API.info('SELECT encoded_array FROM array_base WHERE node_id = ' + win4.nid + ' AND field_name = \'' + f_name_f + '\' ');

				while(array_cont.isValidRow()) {
					var decoded = array_cont.fieldByName('encoded_array');
					//Decode the stored array:
					decoded = Titanium.Utils.base64decode(decoded);
					Ti.API.info('Decoded array is equals to: ' + decoded);

					array_cont.next();
				}
				decoded = decoded.toString();

				// Token that splits each element contained into the array: 'j8Oá2s)E'
				var decoded_values = decoded.split("j8Oá2s)E");
				loop_times = decoded_values.length;
				is_array = true;
				keep_type = c_type[count];
				keep_label = c_label[count];
				keep_sett = c_settings[count];
				keep_widget = c_widget[count];
				keep_name = c_field_name[count];
				//Test echo
				for(var tili in decoded_values) {
					Ti.API.info(tili + ' value is equals to: ' + decoded_values[tili]);
				}

			}

			while(loop_times >= 1) {
				if(is_array) {
					c_content[count] = decoded_values[loop_times - 1];
					c_type[count] = keep_type;
					c_label[count] = keep_label;
					c_settings[count] = keep_sett;
					c_widget[count] = keep_widget;
					c_field_name[count] = keep_name;

					Ti.API.info('For type: ' + c_type[count] + ' is associated ' + c_content[count]);
				}
				loop_times--;

				if ( c_type[count] != 'region_separator_mode' &&  c_type[count] != 'calculation_field'){
					if (( (c_content[count] == "") || (c_content[count] == "null")  || (c_content[count] == null) ) ) {
						continue;
					}
				}

				//Treat regions
				if((c_settings[count] != null) && (c_settings[count] != 'null') && (c_settings[count] != undefined) && (c_settings[count] != 'undefined') && (c_settings[count] != '')) {
					Ti.API.info('Settings: ' + c_settings[count]);
					var settings = JSON.parse(c_settings[count]);
					if(show_region[settings.region]) {
						show_region[settings.region] = true;
						Ti.API.info('Region added : ' + settings.region);
					} else {
						show_region[settings.region] = new Array();
					}
				}

				Ti.API.info('**FIELD: '+c_type[count]+' VALUE: '+c_content[count]);
				switch(c_type[count]){
					//Treatment follows the same for text or text_long
					case 'text':
					case 'text_long':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							left : 5,
							textAlign : 'left',
							touchEnabled : false,
							field : true
						});

						var openDescWin = false;
						var aux_text_desc = c_content[count];

						if(c_content[count].length > 45) {
							c_content[count] = c_content[count].substring(0, 45);
							c_content[count] = c_content[count] + "...";
							openDescWin = true;
						}

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count,
							open : openDescWin,
							w_content : aux_text_desc
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
							if(e.source.open) {
								openBigText(e.source.w_content);
							}
						});
						count++;
						break;

					//Phone
					case 'phone':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count,
							number : c_content[count].replace(/\D/g, '')
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
							Titanium.Platform.openURL('tel:' + e.source.number);
						});

						content[count].text = "" + c_content[count];
						count++;
						break;

					//Refers to some object:
					case 'omadi_reference':
						Ti.API.info("Contains: " + c_content[count] + " for nid " + win4.nid);
						Ti.API.info('SETTINGS: ' + c_settings[count]);
						var json = JSON.parse(c_settings[count]);

						//Define available tables:
						var tables_array = new Array();
						for(var i in json.reference_types) {
							tables_array.push(json.reference_types[i]);
						}

						var count_tables = 0;
						var tables_query = "";
						for(var i in tables_array) {
							if(tables_array.length - 1 == count_tables) {
								tables_query += tables_array[i];
							} else {
								tables_query += tables_array[i] + ", ";
							}
						}
						Ti.API.info('TABLES: ' + tables_query);
						try {

							var auxA = db_display.execute('SELECT * FROM ' + tables_query + ' WHERE nid=' + c_content[count]);
							if(auxA.rowCount === 0) {
								bug[bug.length] = c_content[count];
							} else {
								var auxRes = db_display.execute('SELECT DISTINCT node.title FROM node INNER JOIN account ON node.nid=' + c_content[count]);
								ref_name = auxRes.fieldByName("title");
								auxRes.close();

								label[count] = Ti.UI.createLabel({
									text : c_label[count],
									width : "33%",
									textAlign : 'left',
									left : 5,
									touchEnabled : false,
									field : true
								});

								content[count] = Ti.UI.createLabel({
									text : "" + ref_name,
									width : "60%",
									height : "100%",
									textAlign : 'left',
									left : "40%",
									id : count,
									nid : c_content[count]
								});

								// When account is clicked opens a modal window to show off the content of the specific touched
								// object.

								content[count].addEventListener('click', function(e) {
									highlightMe(e.source.id);
									var newWin = Ti.UI.createWindow({
										fullscreen : false,
										title : 'Account',
										url : "individual_object.js"
									});

									newWin.nameSelected = e.source.text;
									newWin.type = "account";
									newWin.nid = e.source.nid;
									newWin.open();
								});
								count++;
							}
						} catch(e) {
							bug[bug.length] = c_content[count];
						}
						break;

					//Must open browser if clicked
					case 'link_field':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "100%",
							height : "100%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							address : c_content[count].replace("http://", ""),
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
							//website = website.replace("http://","");
							Ti.API.info('LINK PRESSED FOR URL ' + e.source.address);
							Titanium.Platform.openURL('http://' + e.source.address);
						});
						count++;
						break;

					//Must open mail client if clicked - Not supported by Android yet
					case 'email':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count,
							email : c_content[count]
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
							var emailDialog = Titanium.UI.createEmailDialog();
							emailDialog.subject = "Omadi CRM";
							emailDialog.toRecipients = e.source.email;
							emailDialog.open();
						});
						count++;

						break;

					//Link to taxonomy table:
					case 'taxonomy_term_reference':
						Ti.API.info('Contains: ' + c_content[count]);
						var ref_name = "";
						if(c_content[count]) {
							var auxRes = db_display.execute('SELECT * FROM term_data WHERE tid=' + c_content[count]);
							Ti.API.info('We got : ' + auxRes.rowCount + ' lines');
							if(auxRes.rowCount == 0) {
								ref_name = "Invalid term";
							} else {
								ref_name = auxRes.fieldByName("name");
							}
							auxRes.close();
						}

						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "30%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + ref_name,
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;

						break;

					//Just prints the user_reference .. If references table user, link to it
					case 'user_reference':
						var auxRes = db_display.execute('SELECT realname FROM user WHERE uid = ' + c_content[count]);
						var ref_name = "";
						if(auxRes.isValidRow())
							ref_name = auxRes.fieldByName("realname");
						else
							ref_name = "Not defined";
						auxRes.close();

						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + ref_name,
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							Ti.API.info("X = " + e.source.id);
							highlightMe(e.source.id);
						});
						count++;

						break;

					//Formats as decimal
					case 'number_decimal':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;

						break;

					//Formats as integer
					case 'number_integer':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;
						break;

					//Shows up date (check how it is exhibited):
					case 'omadi_time':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + display_omadi_time(c_content[count]),
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;
						break;

					case 'datestamp':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						var widget = JSON.parse(c_widget[count]);

						content[count] = Ti.UI.createLabel({
							text : "" + timeConverter(c_content[count], widget.settings['time']),
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;
						break;

					//Shows the on and off button?
					case 'list_boolean':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;

						break;
					//Prints out content

					case 'license_plate':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;
						break;

					case 'vehicle_fields':
						var fi_name = c_field_name[count]
						fi_name = fi_name.split('___');
						if(fi_name[1]) {
							var i_name = fi_name[1];
						} else {
							var i_name = fi_name[0];
						}
						i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);

						label[count] = Ti.UI.createLabel({
							text : c_label[count] + " " + i_name,
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});

						content[count] = Ti.UI.createLabel({
							text : "" + c_content[count],
							width : "60%",
							height : "100%",
							textAlign : 'left',
							left : "40%",
							id : count
						});

						content[count].addEventListener('click', function(e) {
							highlightMe(e.source.id);
						});
						count++;
						break;

					case 'region_separator_mode':
						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							color : '#FFFFFF',
							font : {
								fontSize : 18,
								fontWeight : 'bold'
							},
							textAlign : 'center',
							width : '100%',
							touchEnabled : false,
							height : '100%',
							is_region : true,
							ref : f_name_f,
							field : false
						});
						count++;
						break;
					case 'image':
						var settings = JSON.parse(c_settings[count]);
						if(settings.cardinality > 1 || settings.cardinality < 0) {
							isUpdated = [];
							content[count] = Ti.UI.createScrollView({
								field_name : c_label[count],
								contentWidth : 'auto',
								contentHeight : 100,
								arrImages : null,
								scrollType : "horizontal",
								layout : 'horizontal',
								left : '33%',
								cardinality : settings.cardinality
							});
							var decodedValues = [];
							var array_cont;
							if(results.fieldByName(c_field_name[count] + '___file_id') == '7411317618171051229' || results.fieldByName(c_field_name[count] + '___file_id') == 7411317618171051229) {
								array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win4.nid + ' AND field_name = \'' + c_field_name[count] + '___file_id\'');
							} else {
								array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = ' + win4.nid + ' AND field_name = \'' + c_field_name[count] + '\'');
							}
							if(array_cont.rowCount > 0) {
								//Decode the stored array:
								var decoded = array_cont.fieldByName('encoded_array');
								decoded = Titanium.Utils.base64decode(decoded);
								decoded = decoded.toString();
								decodedValues = decoded.split("j8Oá2s)E");
							}
							val = db_display.execute('SELECT * FROM file_upload_queue WHERE nid=' + win4.nid + ' AND field_name ="' + c_field_name[count] + '";');

							if(val.rowCount > 0) {
								while(val.isValidRow()) {
									isUpdated[val.fieldByName('delta')] = true;
									decodedValues[val.fieldByName('delta')] = Ti.Utils.base64decode(val.fieldByName('file_data'));
									val.next();
								}
							}
							var arrImages = [];
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
								arrImages = createImage1(arrImages, vl_to_field, content[count], updated);
							}
							content[count].arrImages = arrImages;
						} else {
							isUpdated = false;
							if(results.rowCount > 0) {
								val = results.fieldByName(c_field_name[count] + '___file_id');
								if(val == 'null' || val == null || val == 'undefined' || val == '') {
									val = results.fieldByName(c_field_name[count]);
								}
							}
							valUp = db_display.execute('SELECT * FROM file_upload_queue WHERE nid=' + win4.nid + ' AND field_name ="' + c_field_name[count] + '";');

							if(valUp.rowCount > 0) {
								isUpdated = true;
								val = Ti.Utils.base64decode(valUp.fieldByName('file_data'));
							}
							if((val == 'null' || val == 'undefined' || val == '') && valUp.rowCount == 0) {
								break;
							}
							
						content[count] = Ti.UI.createImageView({
							label 			: c_label[count],
							height			: '100',
							width			: '100',
							top				:5,
							bottom			:5,
							size: {
									height		: '100',
									width		: '100'
								},
								image : '../images/default.png',
								imageVal : val,
								imageData : null,
								bigImg : null,
								mimeType : null,
								cardinality : settings.cardinality,
								isUpdated : isUpdated
							});

							if(isUpdated == true) {
								content[count].image = val;
								content[count].bigImg = val;
								content[count].imageData = val;
							}
							content[count].addEventListener('click', function(e) {
								downloadMainImage(e.source.imageVal, e.source, win4);
							});
						}

						label[count] = Ti.UI.createLabel({
							text : c_label[count],
							width : "33%",
							textAlign : 'left',
							left : 5,
							touchEnabled : false,
							field : true
						});
						count++;
					break;
					
					case 'calculation_field':
							label[count] = Ti.UI.createLabel({
								text: c_label[count],
								width:  "100%",
								textAlign: 'left',
								left: 5,
								touchEnabled: false,
								field: true,
								top: 0,
								height: 40,
								wordWrap: false,
								ellipsize: true
							});
							
							var settings 		= JSON.parse(c_settings[count]); 					
							content[count] = Ti.UI.createView({
									left			: '3%',
									right			: '3%',
									field_type		: c_type[count],
									field_name		: c_field_name[count],
									cardinality		: settings.cardinality,
									reffer_index	: count,
									settings		: settings,
									layout 			: 'vertical'
							});
							count++;
					break;
				}
			}
		}
	}

	if(bug.length === 0) {
		Ti.API.info("Items (count): " + count);
		var index_fields = 0
		for(var i = 0; i < count; i++) {
			//Normal fields
			if((label[i].is_region !== true) && (label[i].field === true)) {

				cell[i] = Ti.UI.createView({
					height : heightValue,
					//	top : (heightValue+2)*index_fields,
					width : '100%'
				});

				label[i].color = "#999999";
				content[i].color = "#FFFFFF";

				cell[i].add(label[i]);
				if(c_type[i] == 'image') {
					if(content[i].cardinality > 1 || content[i].cardinality < 0) {
						if(content[i].arrImages.length == 0) {
							continue;
						}
					}
					cell[i].height = '110';
				}else if(c_type[i]=='calculation_field'){
					createCalculationTableFormat(content[i] , db_display, content);
					cell[i].layout = 'vertical';
					cell[i].height = content[i].height+ heightValue;
				}
				cell[i].add(content[i]);

				viewContent.add(cell[i]);

				border[i] = Ti.UI.createView({
					backgroundColor : "#F16A0B",
					//top:5,
					height : 2,
					//top: ((heightValue+2)*(index_fields+1))-2
				});
				viewContent.add(border[i]);
				index_fields++;
			}
			//Regions
			else {
				var cnd = 0;
				for(var j in show_region) {
					if(j == label[i].ref) {
						cnd++;

						cell[i] = Ti.UI.createView({
							height : heightValue,
							//top : (heightValue+2)*index_fields,
							width : '100%'
						});

						cell[i].add(label[i]);
						viewContent.add(cell[i]);

						border[i] = Ti.UI.createView({
							backgroundColor : "#F16A0B",
							height : 2,
							//top: ((heightValue+2)*(index_fields+1))-2
						});
						viewContent.add(border[i]);
						Ti.API.info('Added region: ' + label[i].ref);
						index_fields++;
					}
				}
				if(cnd == 0) {
					Ti.API.info('No content for region: ' + label[i].ref)
				}
			}
		}

		for(var i = 0; i < count; i++) {
			if(c_type[i] == 'image') {
				if(content[i].cardinality > 1 || content[i].cardinality < 0) {
					var arrImages = content[i].arrImages;
					for( i_idx = 0; i_idx < arrImages.length; i_idx++) {
						if(arrImages[i_idx].isUpdated == false) {
							downloadThumnail(arrImages[i_idx].imageVal, arrImages[i_idx], win4);
						}
					}
				} else {
					if(content[i].isUpdated == false) {
						downloadThumnail(content[i].imageVal, content[i], win4);
					}
				}

			}
		}

	} else {
		var cell = Ti.UI.createLabel({
			height : 'auto',
			top : '30%',
			textAlign : 'center',
			width : '80%',
			text : 'Well, this is embarrassing but it seems that you\'ve found a bug, please submit it to us, here are some things you should inform:\n    NID = ' + win4.nid + '\n   	Omadi_reference = ' + bug[0] + ' \nWe will fix it as soon as possible'
		});

		viewContent.add(cell);
	}
}

//Highlitghts clicked row
function highlightMe(data) {
	Ti.API.info("DATA => " + data);
	cell[data].backgroundColor = "#F16A0B";
	setTimeout(function() {
		cell[data].backgroundColor = '#111111';
	}, 100);
};

//MENU
//======================================
// MENU
//======================================
if(Ti.Platform.name == 'android') {
	var activity = win4.activity;
	activity.onCreateOptionsMenu = function(e) {
		//======================================
		// MENU - UI
		//======================================

		var menu = e.menu;
		var db_act = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") + "_" + getDBName());
		var json_data = db_act.execute('SELECT _data FROM bundles WHERE bundle_name="' + win4.type + '"');
		var _data = JSON.parse(json_data.fieldByName('_data'));

		var node_form = db_act.execute('SELECT form_part FROM node WHERE nid=' + win4.nid);

		Ti.API.info('Form node part = ' + node_form.fieldByName('form_part'));
		Ti.API.info('Form table part = ' + _data.form_parts.parts.length);

		if(_data.form_parts.parts.length >= parseInt(node_form.fieldByName('form_part')) + 2) {
			Ti.API.info("Title = " + _data.form_parts.parts[node_form.fieldByName('form_part') + 1].label);

			var menu_zero = menu.add({
				title : _data.form_parts.parts[node_form.fieldByName('form_part') + 1].label,
				order : 0
			});

			menu_zero.setIcon("/images/drop.png");

			//======================================
			// MENU - EVENTS
			//======================================

			menu_zero.addEventListener("click", function(e) {
				//Next window to be opened
				var win_new = create_or_edit_node.getWindow();
				win_new.title = win4.title;
				win_new.type = win4.type;
				win_new.listView = win4.listView;
				win_new.up_node = win4.up_node;
				win_new.uid = win4.uid;
				win_new.region_form = node_form.fieldByName('form_part') + 1;

				//Passing parameters
				win_new.nid = win4.nid;
				win_new.picked = win4.picked;
				win_new.nameSelected = win4.nameSelected;

				//Sets a mode to fields edition
				win_new.mode = 1;

				win_new.open();
				setTimeout(function() {
					create_or_edit_node.loadUI();
				}, 100);
				win4.close();
			});
		}

		json_data.close();
		db_act.close();

		var menu_edit = menu.add({
			title : 'Edit',
			order : 1
		});

		menu_edit.setIcon("/images/edit.png");

		//======================================
		// MENU - EVENTS
		//======================================

		menu_edit.addEventListener("click", function(e) {
			openEditScreen();
		});
	}
}

results.close();
fields_result.close();
db_display.close();

if(PLATFORM != 'android'){
	resultView.remove(header)
	resultView.height = '95%';
	resultView.top = 0;
	bottomButtons(win4);
}else{
	viewContent.height = '90%'
	bottomBack(win4);
}

function createImage1(arrImages, data, scrollView, updated) {
	contentImage = Ti.UI.createImageView({
		height			: '100',
		width			: '100',
		left			: 5,
		size: {
			height		: '100',
			width		: '100'
		},
		top				:5,
		bottom			:5,
		image			: '../images/default.png',
		imageVal		: data,
		imageData		: null,
		bigImg 			: null,
		mimeType		: null,
		label			: scrollView.field_name,
		isUpdated		: updated
	});
	

	if(updated == true) {
		contentImage.image = data;
		contentImage.bigImg = data;
		contentImage.imageData = data;
	}
	contentImage.addEventListener('click', function(e) {
		//Following method will open camera to capture the image.
		downloadMainImage(e.source.imageVal, e.source, win4);
	});
	scrollView.add(contentImage);
	arrImages.push(contentImage)
	return arrImages;
}

function openEditScreen(){
//Next window to be opened
			var win_new = create_or_edit_node.getWindow();
			win_new.title = win4.title;
			win_new.type = win4.type;
			win_new.listView = win4.listView;
			win_new.up_node = win4.up_node;
			win_new.uid = win4.uid;
			win_new.region_form = node_form.fieldByName('form_part');

			//Passing parameters
			win_new.nid = win4.nid;
			win_new.picked = win4.picked;
			win_new.nameSelected = win4.nameSelected;

			//Sets a mode to fields edition
			win_new.mode = 1;

			win_new.open();
			setTimeout(function() {
				create_or_edit_node.loadUI();
			}, 100);
			(PLATFORM=='android')?win4.close():win4.hide();
}

function createEntity(){
	
	var entity = new Array();
	
	for( idx = 0; idx < content.length; idx++) {
		if(!content[idx]) {
			continue;
		}
		var private_index	 = 0;
		if(entity[c_field_name[idx]]==null){
			entity[c_field_name[idx]] = new Array();
		}else{
			private_index = entity[c_field_name[idx]].length; 
		}
		
		entity[c_field_name[idx]][private_index] = new Array();
		
		entity[c_field_name[idx]][private_index]['value'] = c_content[idx];
		entity[c_field_name[idx]][private_index]['nid'] = c_content[idx];
		entity[c_field_name[idx]][private_index]['uid'] = c_content[idx];
		entity[c_field_name[idx]][private_index]['tid'] = c_content[idx];
		entity[c_field_name[idx]][private_index]['field_name'] = c_field_name[idx];
		entity[c_field_name[idx]][private_index]['field_type'] = c_type[idx];
		entity[c_field_name[idx]][private_index]['reffer_index'] = idx;
	}

	return entity; 
}

function createCalculationTableFormat(content , db_display, contentArr) {
	var entity = createEntity();
	var result = _calculation_field_get_values(win4, db_display, content, entity, contentArr);
	var row_values = result[0].rows;
	var heightView = 0;
	if(row_values.length > 0) {
		var heightCellView = 40;
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
			
			var row = Ti.UI.createView({
				layout 		: 'horizontal',
				height 		: heightCellView,
				width 		: '100%',
				top 		: 1,
			});
			var row_label = Ti.UI.createLabel({
				text 			: row_values[idx].row_label + ":  ",
				textAlign 		: 'right',
				width 			: 140,
				color 			: 'white',
				font 			: {
									fontFamily 	: 'Helvetica Neue',
									fontSize 	: 14
							  	},
				color 			: '#000',
				height 			: heightCellView,
				wordWrap 		: false,
				ellipsize 		: true,
				backgroundColor : '#F2F2F2'

			});
			var value = Ti.UI.createLabel({
				text 			: "  " + cal_value_str,
				textAlign 		: 'left',
				width 			: 120,
				left 			: 1,
				color 			: 'white',
				font 			: {
									fontFamily : 'Helvetica Neue',
									fontSize : 14
							  	},
				color 			: '#000',
				height 			: heightCellView,
				wordWrap 		: false,
				ellipsize 		: true,
				backgroundColor : '#F2F2F2'
			});
			row.add(row_label);
			row.add(value);
			content.add(row);
			heightView += heightCellView + 1;
		}

		cal_value = result[0].final_value;
		typeof(cal_value) == 'number' ? null : typeof(cal_value) == 'string' ? cal_value = parseFloat(cal_value) : null;
		isNegative = (cal_value < 0) ? true  : false; // Is negative. And if it is -ve then write in this value in (brackets).
		cal_value_str =  Math.abs(cal_value).toCurrency({
                "thousands_separator"	:",",
                "currency_symbol"		:"$",
                "symbol_position"		:"front",
                "use_fractions" 		: { "fractions":2, "fraction_separator":"." }
        });
        cal_value_str = (isNegative)?"(" + cal_value_str + ")":cal_value_str; // Adding brackets over -ve value.
			
		var row = Ti.UI.createView({
			layout 	: 'horizontal',
			height 	: heightCellView,
			width 	: '100%',
			top 	: 1
		});
		var row_label = Ti.UI.createLabel({
			text 			: "Newly Calculated Total: ",
			textAlign 		: 'right',
			width 			: 140,
			top 			: 0,
			color 			: 'white',
			font 			: {
								fontFamily 	: 'Helvetica Neue',
								fontSize 	: 14,
								fontWeight 	: 'bold'
						  	   },
			color 			: '#B40404',
			height 			: heightCellView,
			backgroundColor : '#F2F2F2'
		});
		var value = Ti.UI.createLabel({
			text 			: "  " + cal_value_str,
			textAlign 		: 'left',
			width 			: 120,
			right 			: 0,
			top 			: 0,
			left 			: 1,
			color 			: 'white',
			font 			: {
								fontFamily : 'Helvetica Neue',
								fontSize : 14,
								fontWeight : 'bold'
							   },
			color 			: '#B40404',
			height 			: heightCellView,
			wordWrap 		: false,
			ellipsize 		: true,
			backgroundColor : '#F2F2F2'
		});
		row.add(row_label);
		row.add(value);
		content.add(row);
		heightView += heightCellView + 1;

	}
	content.height = heightView;
}

function bottomButtons(actualWindow){
	var back = Ti.UI.createButton({
		title : 'Back',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		actualWindow.close();
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title:win4.nameSelected,
		color:'#fff',
		ellipsize: true,
		wordwrap: false,
		width: 200,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});

	
	var edit = Ti.UI.createButton({
		title : 'Edit',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	edit.addEventListener('click', function() {
		openEditScreen();
	});
	
	// create and add toolbar
	var toolbar = Titanium.UI.createToolbar({
		items:[back, space, label, space, edit],
		top:0,
		borderTop:false,
		borderBottom:true
	});
	win4.add(toolbar);
};
