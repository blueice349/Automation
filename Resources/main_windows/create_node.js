/** 
 * @author Joseandro
 */

//Common used functions
Ti.include('/lib/functions.js');
var heightValue = getScreenHeight()*0.13;

var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';

toolActInd.show();

///////////////////////////
// Extra Functions
//////////////////////////

function config_label(label){
	label.color			= "#FFFFFF";
	label.textAlign		= 'left';
	label.left			= '3%';
	label.touchEnabled	= false;
	label.height		= 40;
}

function config_content(content){
		content.color		= "#000000";
		content.textAlign	= 'left';
		content.left		= "3%";
		content.height		= 40;
}



///////////////////////////
// UI
//////////////////////////

//Current window's instance
var win = Ti.UI.currentWindow;

//Sets only portrait mode
win.orientationModes = [ Titanium.UI.PORTRAIT ];

var db_display = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

//The view where the results are presented
var resultView = Ti.UI.createView({
	top: '0',
	height: '100%',
	width: '100%',
	backgroundColor: '#A9A9A9',
	opacity: 0.05
});
win.add(resultView);

//Header where the selected name is presented
var header = Ti.UI.createView({
	top: '0',
	height: '10%',
	width: '100%',
	backgroundColor: '#000000',
	zIndex: 11
});
resultView.add(header);

var title_head = Ti.UI.createLabel({
	text: win.title,
	color: '#FFFFFF',
	font: {
		fontSize: 24
	}
});
header.add(title_head);

var viewContent = Ti.UI.createScrollView({
    height:"auto",
    top: "11%",
    backgroundColor: '#111111',
	showHorizontalScrollIndicator: false,
	showVerticalScrollIndicator: true,
	opacity: 1,
	borderRadius: 7,
	scrollType: "vertical",
	zIndex: 10
});
resultView.add(viewContent);

var fields_result = db_display.execute('SELECT label, weight, type, field_name, settings, widget FROM fields WHERE bundle = "'+win.type+'" ORDER BY weight ASC');

//Populate array with field name and configs
var field_arr		=	new Array();
var label			=	new Array();
var content			=	new Array();
var border			=	new Array();
var values_query	=	new Array();
var count = 0;
var title = 0;

setTimeout(function(e){

	while (fields_result.isValidRow()){
		//Index the array by label
		if (!field_arr[fields_result.fieldByName('label')]){
			field_arr[fields_result.fieldByName('label')] = new Array();
		}
		
		////
		//Array of fields
		// field_arr[label][length] 
		// field_arr[address][0], field_arr[address][1], field_arr[address][2]
		////
		field_arr[fields_result.fieldByName('label')][field_arr[fields_result.fieldByName('label')].length] = {
					label:fields_result.fieldByName('label'),
					type:fields_result.fieldByName('type'), 
					field_name: fields_result.fieldByName('field_name'),
					settings: fields_result.fieldByName('settings'),
					widget: fields_result.fieldByName('widget')
		};
		fields_result.next();
	}
	var top = 0;
	var field_definer = 0;
	var manager = { location_pure : true, last_text : null} ;
	//Go throught the whole array in order to format the fields on screen
	for (var index_label in field_arr ){
		for (var index_size in field_arr[index_label]){
			Ti.API.info(index_size+'. Label : '+index_label+' we got content: '+field_arr[index_label][index_size].type+' ');
			switch(field_arr[index_label][index_size].type){
				
				case 'license_plate':
				case 'text':
				case 'link_field':
					label[count] = Ti.UI.createLabel({
						text:  field_arr[index_label][index_size].label,
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
					top += heightValue;
	
					manager.last_text = count;				 
					content[count] = Ti.UI.createTextField({
						hintText		: field_arr[index_label][index_size].label,
						borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						textAlign		: 'left',
						left			: '3%',
						right			: '3%',
						height			: heightValue,
						font 			: {
											fontSize: 18
						},
						color			: '#000000',
						top				: top,
						field_type		: field_arr[index_label][index_size].type,
						field_name		: field_arr[index_label][index_size].field_name
					});
					top += heightValue;
					
					var key= '';
					switch (win.type){
						case 'account':
							key = 'ACCOUNT NAME';
						break;
						
						case 'lead':
						case 'contact':
							key = 'FIRST NAME';
						break;
						
						case 'potential':
							key = 'POTENTIAL NAME';
						break;
					}
					
					//Is the node title?
					if (index_label.toUpperCase() == key ){
						title = count;
						label[count].text = '*'+field_arr[index_label][index_size].label;
					}
	
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				break;
	
				case 'text_long':
					label[count] = Ti.UI.createLabel({
						text:  field_arr[index_label][index_size].label,
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
					top += heightValue;
					
					manager.last_text = count;				
					content[count] = Ti.UI.createTextField({
						hintText		: field_arr[index_label][index_size].label,
						borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						textAlign		: 'left',
						left			: '3%',
						right			: '3%',
						height			: 100,
						color			: '#000000',
						top				: top,
						field_type			: field_arr[index_label][index_size].type,
						field_name		: field_arr[index_label][index_size].field_name
					});
					top += 100;
					
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				break;
	
				case 'location':
					var settings = JSON.parse(field_arr[index_label][index_size].settings); 
					
					//Set our auxiliar array
					var aux_local = new Array;
					for (var i in settings.parts){
						aux_local.push(settings.parts[i]);
					}
					
					var title_location = "";
					
					if (aux_local.length > 0){
						if (aux_local.length == field_definer){
							field_definer = 0;						
						}
						if (aux_local[field_definer]){
							title_location = aux_local[field_definer];
							field_definer++;						
						}
	
					}
					else{
						title_location = field_arr[index_label][index_size].label;
						field_definer = 0;
					}
	
					label[count] = Ti.UI.createLabel({
						text			: title_location ,
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
					top += heightValue;
					 
					manager.last_text = count;
					content[count] = Ti.UI.createTextField({
						hintText		: field_arr[index_label][index_size].label,
						borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						textAlign		: 'left',
						left			: '3%',
						right			: '3%',
						height			: heightValue,
						font 			: {
											fontSize: 18
						},
						color			: '#000000',
						top				: top,
						field_type		: field_arr[index_label][index_size].type,
						field_name		: field_arr[index_label][index_size].field_name
					});
					top += heightValue;
					
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				break;
	
	
				
				case 'number_decimal':
				case 'number_integer':
				case 'phone':
					label[count] = Ti.UI.createLabel({
						text:  field_arr[index_label][index_size].label,
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
					top += heightValue;
	
					manager.last_text = count;				
					content[count] = Ti.UI.createTextField({
						hintText		: field_arr[index_label][index_size].label,
						borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						keyboardType	: Titanium.UI.KEYBOARD_NUMBER_PAD,
						textAlign		: 'left',
						left			: '3%',
						right			: '3%',
						height			: heightValue,
						font 			: {
											fontSize: 18
						},
						color			: '#000000',
						top				: top,
						field_type		: field_arr[index_label][index_size].type,
						field_name		: field_arr[index_label][index_size].field_name
					});
					top += heightValue;
					
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				break;
	
				case 'email':
					label[count] = Ti.UI.createLabel({
						text:  field_arr[index_label][index_size].label,
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
					top += heightValue;
	
					manager.last_text = count;				
					content[count] = Ti.UI.createTextField({
						hintText		: field_arr[index_label][index_size].label,
						borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						keyboardType	: Ti.UI.KEYBOARD_EMAIL,
						textAlign		: 'left',
						left			: '3%',
						right			: '3%',
						height			: heightValue,
						font 			: {
											fontSize: 18
						},
						color			: '#000000',
						top				: top,
						field_type		: field_arr[index_label][index_size].type,
						field_name		: field_arr[index_label][index_size].field_name
					});
					top += heightValue;
					
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				break;
	
				case 'taxonomy_term_reference':
					var widget = JSON.parse(field_arr[index_label][index_size].widget);
					var settings = JSON.parse(field_arr[index_label][index_size].settings); 
	
					//Create picker list
					if (widget.type == 'options_select'){
						label[count] = Ti.UI.createLabel({
							text			: 'Select one '+field_arr[index_label][index_size].label,
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
						top += heightValue;
	
						var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '"+settings.vocabulary+"'");
						
						content[count] = Titanium.UI.createPicker({
							borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							left				: '3%',
							right				: '3%',
							height				: heightValue,
							font 				: {
													fontSize: 18
							},
							color				: '#000000',
							top					: top,
							selectionIndicator	: true,
							field_type			: field_arr[index_label][index_size].type,
							field_name			: field_arr[index_label][index_size].field_name,
							machine_name		: vocabulary.fieldByName('machine_name'),
							widget				: 'options_select'
						}); 
						
						var terms = db_display.execute("SELECT * FROM term_data WHERE vid='"+vocabulary.fieldByName('vid')+"'GROUP BY name ORDER BY name ASC");
	
						var data_terms = [];
						data_terms.push({title: field_arr[index_label][index_size].label, tid: null });
						while (terms.isValidRow()){ 
							data_terms.push({title: terms.fieldByName('name'), tid: terms.fieldByName('tid') }); 
							terms.next();
						}
						terms.close();
						vocabulary.close();
						for (var i_data_terms in data_terms){
							content[count].add (Ti.UI.createPickerRow({title:data_terms[i_data_terms].title, tid:data_terms[i_data_terms].tid }));
						}
						
						top += heightValue;
						
						//Add fields:
						viewContent.add(label[count]);
						viewContent.add(content[count]);
						count++;
					}
					//Create autofill field
					else if(widget.type == 'taxonomy_autocomplete'){
						label[count] = Ti.UI.createLabel({
							text			: field_arr[index_label][index_size].label,
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
						top += heightValue;
						if (!settings.vocabulary){
							settings.vocabulary = field_arr[index_label][index_size].field_name;
						}
						Ti.API.info('================> Vocabulary '+settings.vocabulary);
						var vocabulary 	= db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '"+settings.vocabulary+"'");
						var terms		= db_display.execute("SELECT * FROM term_data WHERE vid='"+vocabulary.fieldByName('vid')+"'GROUP BY name ORDER BY name ASC");
						var vid			= vocabulary.fieldByName('vid');
						
						data_terms = new Array;
						while (terms.isValidRow()){ 
							data_terms.push({title: terms.fieldByName('name'), tid: terms.fieldByName('tid') }); 
							terms.next();
						}
						terms.close();
						vocabulary.close();
						
						var rest_up = settings.restrict_new_autocomplete_terms;
						if (!rest_up){
							rest_up = 0;
						}
						manager.last_text = count;
						content[count] = Titanium.UI.createTextField({
						    hintText						: field_arr[index_label][index_size].label+' ...',
							height							: heightValue,
							font				 			: {
																fontSize: 18
							},
						    left							: '3%',
						    right							: '3%',
						    top								: top,
	  						field_type						: field_arr[index_label][index_size].type,
							field_name						: field_arr[index_label][index_size].field_name,
							machine_name					: vocabulary.fieldByName('machine_name'),
							terms							: data_terms,
							tid								: null,
							restrict_new_autocomplete_terms	: rest_up,
							widget							: 'taxonomy_autocomplete',
							vid								: vid,
							fantasy_name					: field_arr[index_label][index_size].label
						});
						
						//AUTOCOMPLETE TABLE
						var autocomplete_table = Titanium.UI.createTableView({
							top: top-getScreenHeight()*0.2,
							searchHidden: true,
							zIndex: 15,
							height: getScreenHeight()*0.2,
							backgroundColor: '#FFFFFF',
							visible: false
						});
						content[count].autocomplete_table = autocomplete_table;
						top += heightValue;
	
						viewContent.add(content[count].autocomplete_table);
						
						//
						// TABLE EVENTS
						//
						content[count].autocomplete_table.addEventListener('click', function(e){
							e.source.setValueF(e.rowData.title, e.rowData.tid);
							setTimeout(function(){
									e.source.autocomplete_table.visible = false;
									Ti.API.info(e.rowData.title+' was selected!');
							}, 80);
						});
						
						content[count].addEventListener('blur', function(e){
							e.source.autocomplete_table.visible = false;
							if ((e.source.restrict_new_autocomplete_terms == 1) && (e.source.value != "") && (e.source.tid == null)){
									Ti.UI.createNotification({
										message : 'The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !',
										duration: Ti.UI.NOTIFICATION_DURATION_LONG
									}).show();
							}
						});
						
						//
						// SEARCH EVENTS
						//
						content[count].addEventListener('change', function(e){
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
											setValueF			: func
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
	
						});
	
						//Add fields:
						viewContent.add(label[count]);
						viewContent.add(content[count]);
						count++;
					}
				break;
	
				//Refers to an object:
				case 'omadi_reference':
						var widget = JSON.parse(field_arr[index_label][index_size].widget);
						var settings = JSON.parse(field_arr[index_label][index_size].settings); 
	
						label[count] = Ti.UI.createLabel({
							text			: field_arr[index_label][index_size].label,
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
						top += heightValue;
						
						data_terms 	= new Array;
						aux_nodes	= new Array;
						
						for (var i in settings.reference_types){
							aux_nodes.push(settings.reference_types[i]);
						}
						
						if (aux_nodes.length > 0){
							var secondary = 'SELECT * FROM node WHERE ';
	
							for (var i = 0; i < aux_nodes.length ; i++){
								if ( i == aux_nodes.length-1){
									secondary += ' table_name = \''+aux_nodes[i]+'\' ';
								}
								else{
									secondary += ' table_name = \''+aux_nodes[i]+'\' OR ';
								}
							}
							Ti.API.info(secondary);
							var db_bah = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
							var nodes = db_bah.execute(secondary);
							Ti.API.info("Num of rows: "+nodes.rowCount);
							while(nodes.isValidRow()){
								Ti.API.info('Title: '+nodes.fieldByName('title')+' NID: '+nodes.fieldByName('nid'));
								data_terms.push({title: nodes.fieldByName('title'), nid:nodes.fieldByName('nid') });
								nodes.next();
							}
						}
						manager.last_text = count;
						content[count] = Titanium.UI.createTextField({
						    hintText						: field_arr[index_label][index_size].label+' ...',
							height							: heightValue,
							font				 			: {
																fontSize: 18
							},
						    left							: '3%',
						    right							: '3%',
						    top								: top,
	  						field_type						: field_arr[index_label][index_size].type,
							field_name						: field_arr[index_label][index_size].field_name,
							terms							: data_terms,
							restrict_new_autocomplete_terms	: rest_up,
							fantasy_name					: field_arr[index_label][index_size].label,
							nid								: null
						});
						
						//AUTOCOMPLETE TABLE
						var autocomplete_table = Titanium.UI.createTableView({
							top: top-getScreenHeight()*0.2,
							searchHidden: true,
							zIndex: 15,
							height: getScreenHeight()*0.2,
							backgroundColor: '#FFFFFF',
							visible: false
						});
						content[count].autocomplete_table = autocomplete_table;
						top += heightValue;
	
						viewContent.add(content[count].autocomplete_table);
						
						//
						// TABLE EVENTS
						//
						content[count].autocomplete_table.addEventListener('click', function(e){
							e.source.setValueF(e.rowData.title, e.rowData.nid);
							setTimeout(function(){
									e.source.autocomplete_table.visible = false;
									Ti.API.info(e.rowData.title+' was selected!');
							}, 80);
							
						});
						
						content[count].addEventListener('blur', function(e){
							e.source.autocomplete_table.visible = false;
							if ((e.source.nid === null) && (e.source.value != "")){
									Ti.UI.createNotification({
										message : 'The field '+e.source.fantasy_name+' does not accept fields creation, select one of the list !',
										duration: Ti.UI.NOTIFICATION_DURATION_LONG
									}).show();
							}
						});
						
						//
						// SEARCH EVENTS
						//
						content[count].addEventListener('change', function(e){
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
											tid					: list[i].tid,
											color				: '#000000',
											autocomplete_table	: e.source.autocomplete_table,
											setValueF			: func
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
	
						});
	
						//Add fields:
						viewContent.add(label[count]);
						viewContent.add(content[count]);
						count++;
				break;
	
				case 'user_reference':
					label[count] = Ti.UI.createLabel({
						text			: 'Select one '+field_arr[index_label][index_size].label,
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
					top += heightValue;
	
					content[count] = Titanium.UI.createPicker({
						borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						left				: '3%',
						right				: '3%',
						height				: heightValue,
						font 				: {
												fontSize: 18
						},
						color				: '#000000',
						top					: top,
						selectionIndicator	: true,
						field_type			: field_arr[index_label][index_size].type,
						field_name			: field_arr[index_label][index_size].field_name,
					}); 
					
					var users = db_display.execute("SELECT * FROM user");
	
					var data_terms = [];
					data_terms.push({title: field_arr[index_label][index_size].label, tid: null });
					while (users.isValidRow()){ 
						data_terms.push({title: users.fieldByName('realname'), uid: users.fieldByName('uid') }); 
						users.next();
					}
					users.close();
					
					for (var i_data_terms in data_terms){
						content[count].add (Ti.UI.createPickerRow({title:data_terms[i_data_terms].title, uid:data_terms[i_data_terms].uid }));
					}
					
					top += heightValue;
					
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				break;
	
				//Shows up date (check how it is exhibited):
				case 'datestamp':
					var widget = JSON.parse(field_arr[index_label][index_size].widget);
					var settings = JSON.parse(field_arr[index_label][index_size].settings); 
					
					Ti.API.info('SETTINGS FOR DATESTAMP: '+settings.default_value);
					Ti.API.info('WIDGET FOR DATESTAMP: '+widget.settings['time']);
					
					label[count] = Ti.UI.createLabel({
						text			: 'Select the '+field_arr[index_label][index_size].label,
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
					top += heightValue;
	
					if (widget.settings['time'] != "1"){
						//Min
						var minDate = new Date();
						minDate.setFullYear(2009);
						minDate.setMonth(0);
						minDate.setDate(1);
						
						//Max
						var maxDate = new Date();
						maxDate.setFullYear(2015);
						maxDate.setMonth(11);
						maxDate.setDate(31);
						
						//Get current
						var currentDate = new Date();
						var day = currentDate.getDate();
						var month = currentDate.getMonth();
						var year = currentDate.getFullYear();
		
						//Current
						var value_date = new Date();
						value_date.setFullYear(year);
						value_date.setMonth(month);
						value_date.setDate(day);

						var cur_timestamp = Math.round(value_date.getTime()/1000);
						var sec_timestamp = parseInt(cur_timestamp)%86400;
						var day_timestamp = cur_timestamp - sec_timestamp;
		
						content[count] = Titanium.UI.createPicker({
							borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							left				: '3%',
							right				: '3%',
							height				: 100,
							font 				: {
													fontSize: 18
							},
							type				: Ti.UI.PICKER_TYPE_DATE,
							minDate				: minDate,
							maxDate				: maxDate,
							value				: value_date,
							color				: '#000000',
							top					: top,
							field_type			: field_arr[index_label][index_size].type,
							field_name			: field_arr[index_label][index_size].field_name,
							update_it			: false,
							time_type			: 0,
							day_timestamp		: day_timestamp
						});
						content[count].selectionIndicator = true;
						top += 100;
						
						content[count].addEventListener('change', function(e){
							manager.location_pure = false;
							e.source.update_it = true;
							e.source.day_timestamp = ((Math.round(e.value/1000)) - ( (Math.round(e.value/1000)) % 86400) );  
							Ti.API.info('After day timestamp: '+e.source.day_timestamp);
						});
					
						//Add fields:
						viewContent.add(label[count]);
						viewContent.add(content[count]);
						count++;
					}
					else{
						//Composed field 
						// Date picker
						// Time picker
						// For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it
						
						//Min
						var minDate = new Date();
						minDate.setFullYear(2009);
						minDate.setMonth(0);
						minDate.setDate(1);
						
						//Max
						var maxDate = new Date();
						maxDate.setFullYear(2015);
						maxDate.setMonth(11);
						maxDate.setDate(31);
						
						//Get current
						var currentDate = new Date();
						var day = currentDate.getDate();
						var month = currentDate.getMonth();
						var year = currentDate.getFullYear();
		
						//Current
						var value_date = new Date();
						value_date.setFullYear(year);
						value_date.setMonth(month);
						value_date.setDate(day);

						var cur_timestamp = Math.round(value_date.getTime()/1000);
						var sec_timestamp = Math.round(value_date.getTime()/1000) % 86400;
						var day_timestamp = cur_timestamp - sec_timestamp;

						//Date picker
						content[count] = Titanium.UI.createPicker({
							borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							left				: '3%',
							right				: '3%',
							height				: 100,
							font 				: {
													fontSize: 18
							},
							type				: Ti.UI.PICKER_TYPE_DATE,
							minDate				: minDate,
							maxDate				: maxDate,
							value				: value_date,
							color				: '#000000',
							top					: top,
							field_type			: field_arr[index_label][index_size].type,
							field_name			: field_arr[index_label][index_size].field_name,
							update_it			: false,
							time_type			: 1,
							day_timestamp		: day_timestamp
						});
						top += 100;					
						content[count].selectionIndicator = true;
						
						var min			= currentDate.getMinutes();
						var hours		= currentDate.getHours();
						var	time_got	= ((hours*60*60)+(60*min));
						//Time picker
						var time_picker = Titanium.UI.createPicker({
							borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							left				: '3%',
							right				: '3%',
							height				: 100,
							value				: value_date,
							font 				: {
													fontSize: 18
							},
							type				: Ti.UI.PICKER_TYPE_TIME,
							color				: '#000000',
							top					: top,
							sec_timestamp		: time_got,
							day_timestamp		: day_timestamp,
							update_it			: false
						});
						
						//Becomes property of date_picker
						content[count].time_picker = time_picker;
						top += 100;
						
						content[count].addEventListener('change', function(e){
							manager.location_pure = false;
							e.source.update_it = true;
							e.source.day_timestamp = ((Math.round(e.value/1000)) - ( (Math.round(e.value/1000)) % 86400) );  
							e.source.time_picker.day_timestamp = e.source.day_timestamp;
							Ti.API.info('After day timestamp: '+e.source.day_timestamp);
						});
						
						content[count].time_picker.addEventListener('change', function(e){
							manager.location_pure = false;
							e.source.update_it = true;
							var currentDate = new Date(e.value);
							var min	=	currentDate.getMinutes();
							var hours = currentDate.getHours();
							var	time_got = ((hours*60*60)+(60*min));
							
							e.source.sec_timestamp =  time_got;
							Ti.API.info('Day timestamp: '+e.source.day_timestamp);
							Ti.API.info('Consider the real timestamp: '+(e.source.day_timestamp+e.source.sec_timestamp));
						});
					
						//Add fields:
						viewContent.add(label[count]);
						viewContent.add(content[count]);
						viewContent.add(content[count].time_picker);
						count++;
					} 
				break;
	
				//Shows the on and off button?
				case 'list_boolean':
					var settings = JSON.parse(field_arr[index_label][index_size].settings);
					var switch_value = settings.required_no_data_checkbox;
					
					if (switch_value == "1"){
						switch_value = true;
					}
					else{
						switch_value = false;
					}
					
					label[count] = Ti.UI.createLabel({
						text			: field_arr[index_label][index_size].label,
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
					top += heightValue;
		
					content[count] = Titanium.UI.createSwitch({
						top					: top,
						height				: 45,
						value				: switch_value, 
						field_type			: field_arr[index_label][index_size].type,
						field_name			: field_arr[index_label][index_size].field_name,
						enabled				: false
					}); 
					top += 45;
					
					content[count].addEventListener('change',function(e){
						Ti.API.info('Basic Switch value = ' + e.value);
					});
					
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
				
				break;
				
				//Shows up date (check how it is exhibited):
				case 'omadi_time':
	
					label[count] = Ti.UI.createLabel({
						text			: ''+field_arr[index_label][index_size].label,
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
					top += heightValue;
					
					//Get current
					var currentDate = new Date();
					var day = currentDate.getDate();
					var month = currentDate.getMonth();
					var year = currentDate.getFullYear();
	
					//Current
					var value_date = new Date();
					value_date.setFullYear(year);
					value_date.setMonth(month);
					value_date.setDate(day);
					
					var cur_timestamp = Math.round(value_date.getTime()/1000);
					var sec_timestamp = parseInt(cur_timestamp)%86400;
					var day_timestamp = cur_timestamp - sec_timestamp;
	
					content[count] = Titanium.UI.createPicker({
						borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
						left				: '3%',
						right				: '3%',
						height				: 100,
						font 				: {
												fontSize: 18
						},
						type				: Ti.UI.PICKER_TYPE_TIME,
						value				: value_date,
						color				: '#000000',
						top					: top,
						field_type			: field_arr[index_label][index_size].type,
						field_name			: field_arr[index_label][index_size].field_name,
						update_it			: false,
						day_timestamp		: day_timestamp,
						sec_timestamp		: sec_timestamp
					});
					content[count].selectionIndicator = true;
					top += 100;
	
	
					content[count].addEventListener('change', function(e){
						manager.location_pure = false;
						e.source.update_it = true;
						
						var currentDate = new Date(e.value);
						var min	=	currentDate.getMinutes();
						var hours = currentDate.getHours();
						var	time_got = ((hours*60*60)+(60*min));
						e.source.sec_timestamp =  time_got;
						Ti.API.info('Consider this timestamp: '+(e.source.day_timestamp+e.source.sec_timestamp));
					});
				
					//Add fields:
					viewContent.add(label[count]);
					viewContent.add(content[count]);
					count++;
	
				break;
				
				
			}
		}
	}
	toolActInd.hide();
	fields_result.close();
	db_display.close();
	
	var a = Titanium.UI.createAlertDialog({
		title:'Omadi',
		buttonNames: ['OK']
	});
	
	//MENU
	//======================================
	// MENU
	//======================================
	if (Ti.Platform.name === 'android') {
		var activity = win.activity;
		activity.onCreateOptionsMenu = function(e){
			//======================================
			// MENU - UI
			//======================================
	
			var menu = e.menu; 
			var menu_first = menu.add({ 			
		  		title: 'Save',
				order: 0
			});
			
			menu_first.setIcon("/images/save.png");
	   
			//======================================
			// MENU - EVENTS
			//======================================
			
			menu_first.addEventListener("click", function(e) {	
				if (content[title].value == ''){
					a.message = 'Please, fill out the required field '+label[title].text;
					a.show();
				}
				else{
					var db_put = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );			
					//
					//Retrieve objects that need quotes:
					//
					var need_at = db_put.execute("SELECT field_name FROM fields WHERE bundle = '"+win.type+"' AND ( type='number_integer' OR type='number_decimal' ) ");
					var quotes = new Array(); 
					
					while (need_at.isValidRow()){
						quotes[need_at.fieldByName('field_name')] = true;
						need_at.next();
					}
					need_at.close();
					
					//Get smallest nid
					var nid = db_put.execute("SELECT nid FROM node ORDER BY nid ASC ");
					
					if ( nid.fieldByName('nid') >= 0){
						var new_nid = -1;
					}
					else{
						var new_nid = nid.fieldByName('nid')-1;
					}
		
					var query = "INSERT INTO "+win.type+" ( 'nid', ";
					
					//field names
					for (var j in content){
						if (j == content.length-1){
							query += "'"+content[j].field_name+"' ) ";
						}
						else{
							query += "'"+content[j].field_name+"', ";
						}
					}
					
					query += ' VALUES ( '+new_nid+', ';
					
					//Values
					for (var j in content){
						if (quotes[content[j].field_name] === true){
							var mark = "";
						}
						else{
							var mark = "'";
						}
						
						if (content[j].value === null){
							mark = "";
						}
						
						var value_to_insert = ''; 
						
						if ((content[j].field_type ==  'number_decimal') || (content[j].field_type ==  'number_integer')){
							if (content[j].value == ''){
								value_to_insert = '';
								mark = "'";
							}
							else{
								value_to_insert = content[j].value;
								mark = '';
							}
						}
						else if (content[j].field_type ==  'user_reference'){
							if (content[j].getSelectedRow(0).uid == null){
								value_to_insert = ''
							}
							else{
								value_to_insert = content[j].getSelectedRow(0).uid;
								mark = '';
							}
						}
						else if (content[j].field_type ==  'taxonomy_term_reference'){ 
							if (content[j].widget == 'options_select'){
								if (content[j].getSelectedRow(0).tid == null){
									value_to_insert = ''
								}
								else{
									value_to_insert = content[j].getSelectedRow(0).tid;
									mark = '';
								}
							}
							else if( content[j].widget == 'taxonomy_autocomplete' ){
								if ((content[j].tid == null) && (content[j].value == "")){
									value_to_insert = '';
								}
								else if ((content[j].tid == null) && (content[j].value != "")){
									
									if (content[j].restrict_new_autocomplete_terms != 1){
										mark = '';
										//Get smallest tid
										var tid = db_put.execute("SELECT tid FROM term_data ORDER BY tid ASC ");
										
										if (tid.fieldByName('tid') >= 0){
											var new_tid = -1;
										}
										else{
											var new_tid = tid.fieldByName('tid')-1; 
										}		
										var date_created = Math.round(+new Date()/1000);
										db_put.execute("INSERT INTO term_data (tid, vid, name, description, weight, created) VALUES ("+new_tid+", "+content[j].vid+", '"+content[j].value+"', '', '', '"+date_created+"'  )");
										value_to_insert = new_tid;
										
										Ti.API.info('First tid is: '+new_tid+' and tid '+content[j].tid+' and value '+content[j].value);
										tid.close();
									}
									else{
										value_to_insert = '';
									}
									
								}
								else if ((content[j].tid != null)){
									mark = '';
									value_to_insert = content[j].tid;
								}
							}
						}
						else if (content[j].field_type ==  'omadi_reference'){
							if(content[j].nid === null){
								value_to_insert = '';	
							}
							else{
								mark = '';
								value_to_insert = content[j].nid;
							}
						}
						else if (content[j].field_type == 'list_boolean'){
							if(content[j].value === true){
								value_to_insert = 'true';	
							}
							else{
								value_to_insert = 'false';
							}
						}
						else if (content[j].field_type == 'datestamp'){
								if (content[j].time_type == 0){
									if (content[j].update_it === true ){
										value_to_insert = content[j].day_timestamp;
									}
									else{
										value_to_insert = '';
									}
								}
								else{
									if ((content[j].update_it === true ) || (content[j].time_picker.update_it === true )){
										value_to_insert = content[j].time_picker.day_timestamp+content[j].time_picker.sec_timestamp;
									}
									else{
										value_to_insert = '';
									}
								}
						}
						else if (content[j].field_type == 'omadi_time'){
							if (content[j].update_it === true ){
								value_to_insert = content[j].day_timestamp+content[j].sec_timestamp;
							}
							else{
								value_to_insert = '';
							}
						}
						else{
							value_to_insert = content[j].value;
						}
						
						if (j == content.length-1){
							query += mark+""+value_to_insert+""+mark+" )";
						}
						else{
							query += mark+""+value_to_insert+""+mark+", ";
						}
					}
					try{
						//Insert into node table
						var date_created = Math.round(+new Date()/1000);
						Ti.API.info('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name ) VALUES ('+new_nid+', '+date_created+', 0, \''+content[title].value+'\' , '+win.uid+', 1 , "'+win.type+'")');
		
						db_put.execute('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name ) VALUES ('+new_nid+', '+date_created+', 0, \''+content[title].value+'\' , '+win.uid+', 1 , "'+win.type+'")');
						
						//Insert into table
						Ti.API.info(query);
						db_put.execute(query);
						db_put.close();
						Ti.UI.createNotification({
							message : win.title+' has been sucefully saved !'
						}).show();
						
						//
						//WORKAROUND FOR DATE CALENDAR WORK OUT
						//
						Ti.API.info('Last text field is '+manager.last_text);
						Ti.API.info('Value of it: '+content[manager.last_text]);
						if (manager.location_pure === false){
							Ti.API.info('Not pure !');
							content[manager.last_text].focus();
						}
						else{
							Ti.API.info('Pure !');
						}
	
						win.close();
					}
					catch(e){
						Ti.UI.createNotification({
							message : 'An error has occurred when we tried to create this new node, please try again'
						}).show();
						
						
						//
						//WORKAROUND FOR DATE CALENDAR WORK OUT
						//
						Ti.API.info('Last text field is '+manager.last_text);
						Ti.API.info('Value of it: '+content[manager.last_text]);
						if (manager.location_pure === false){
							Ti.API.info('Not pure !');
							content[manager.last_text].focus();
						}
						else{
							Ti.API.info('Pure !');
						}
	
						win.close();
	
					}
				}
			});
		};
	}
	
	win.addEventListener('android:back', function() {
		Ti.UI.createNotification({
			message : win.title+' not saved !',
			duration: Ti.UI.NOTIFICATION_DURATION_LONG
		}).show();
		//
		//WORKAROUND FOR DATE CALENDAR WORK OUT
		//
		Ti.API.info('Last text field is '+manager.last_text);
		Ti.API.info('Value of it: '+content[manager.last_text]);
		if (manager.location_pure === false){
			Ti.API.info('Not pure !');
			content[manager.last_text].focus();
		}
		else{
			Ti.API.info('Pure !');
		}
		win.close();
	});
} , 1000);