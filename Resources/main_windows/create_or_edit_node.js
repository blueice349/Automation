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
var heightValue = getScreenHeight()*0.13;
var toolActInd = Ti.UI.createActivityIndicator();
toolActInd.font = {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'};
toolActInd.color = 'white';
toolActInd.message = 'Loading...';

toolActInd.show();

var months_set = ['January','February','March','April','May','June','July','August','September','October','November','December'];
//Current window's instance
var win = Ti.UI.currentWindow;
//Sets only portrait mode
win.orientationModes = [ Titanium.UI.PORTRAIT ];
var mode = win.mode;
var db_display = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );

///////////////////////////
// Extra Functions
//////////////////////////

function close_me(){
	hideIndicator();
	win.close();
}

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

function form_min(min){
	if (min < 10){
		return '0'+min;
	}
	return min;
}

function display_widget(obj){
	
	var win_wid = Ti.UI.createWindow({
		modal: true,
		backgroundColor: "#000",
		opacity: 0.9
	});

	var widget = obj.widget;
	var settings = obj.settings
	Ti.API.info('====>> Widget settings = '+widget.settings['time']);
	
	var tit_picker	= Ti.UI.createLabel({
		top				: 0,
		width			: '100%',
		height			: '10%',
		backgroundColor	: '#FFF',
		color			: '#000',
		textAlign		: 'center',
		font			: {
						fontWeight: 'bold'
		},
		text			: obj.title_picker
	});
	win_wid.add(tit_picker);

	// call function display_widget
	if (widget.settings['time'] != "1"){

		//Get current
		var currentDate = obj.currentDate;
		var day = currentDate.getDate();
		var month = currentDate.getMonth();
		var year = currentDate.getFullYear();

		//Min
		var minDate = new Date();
		minDate.setFullYear(year-5);
		minDate.setMonth(0);
		minDate.setDate(1);
		
		//Max
		var maxDate = new Date();
		maxDate.setFullYear(year+5);
		maxDate.setMonth(11);
		maxDate.setDate(31);
		
		//Current
		var value_date = new Date();
		value_date.setFullYear(year);
		value_date.setMonth(month);
		value_date.setDate(day);

		obj.update_it = true;

		//Update timezone
		obj.timezone  = obj.currentDate.getTimezoneOffset()*60*1000;
	
		//discover if is GMT+ or GMT-
		obj.timezone = obj.timezone*verify_UTC(obj.currentDate);
	
		//Refresh GMT value
		obj.value	= Math.round(obj.currentDate.getTime()) + obj.timezone;
	
		Ti.API.info('TIMEZONE : '+obj.timezone);
		Ti.API.info('Date : '+obj.currentDate);
	

		var date_picker = Titanium.UI.createPicker({
			borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			value				: obj.currentDate,
			font 				: {
									fontSize: 18
			},
			type				: Ti.UI.PICKER_TYPE_DATE,
			minDate				: minDate,
			maxDate				: maxDate,
			report				: obj.currentDate,
			color				: '#000000'
		});
		date_picker.selectionIndicator = true;

		Ti.API.info('Value: '+obj.value);
	
		date_picker.addEventListener('change', function(e){
			e.source.report =  e.value;
			//Update timezone
			obj.timezone  = e.source.report.getTimezoneOffset()*60*1000;
			//discover if is GMT+ or GMT-
			obj.timezone = obj.timezone*verify_UTC(e.source.report);
		});

		//Add fields:
		win_wid.add(date_picker);

		var done = Ti.UI.createButton({
			title: 'Done',
			bottom: 10,
			width: '35%',
			left: '10%',
			height: '10%'
		});
	
		var cancel = Ti.UI.createButton({
			title: 'Cancel',
			bottom: 10,
			width: '35%',
			left: '55%',
			height: '10%'	
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
			win_wid.close();
		});
	
		cancel.addEventListener('click', function(){
			if (obj.value == null){
				obj.update_it = false;
			}
			win_wid.close();
		});
	}
	else{
		//Composed field 
		// Date picker
		// Time picker
		// For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it

		obj.update_it = true;

		//Update timezone
		obj.timezone  = obj.currentDate.getTimezoneOffset()*60*1000;
		Ti.API.info('Hours : '+obj.currentDate.getHours());
		Ti.API.info('UTC Hour : '+obj.currentDate.getUTCHours());

		//discover if is GMT+ or GMT-
		obj.timezone = obj.timezone*verify_UTC(obj.currentDate);
		//Refresh GMT value
		obj.value	= Math.round(obj.currentDate.getTime()) + obj.timezone;
	
		Ti.API.info('TIMEZONE : '+obj.timezone);
		Ti.API.info('Date : '+obj.currentDate);


		//Get current
		var currentDate = obj.currentDate;
		var year = currentDate.getFullYear();

		//Min
		var minDate = new Date();
		minDate.setFullYear(year-5);
		minDate.setMonth(0);
		minDate.setDate(1);
		
		//Max
		var maxDate = new Date();
		maxDate.setFullYear(year+5);
		maxDate.setMonth(11);
		maxDate.setDate(31);
		
		var date_picker = Titanium.UI.createPicker({
			borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			value				: obj.currentDate,
			font 				: {
									fontSize: 18
			},
			type				: Ti.UI.PICKER_TYPE_DATE,
			minDate				: minDate,
			maxDate				: maxDate,
			report				: obj.currentDate,
			color				: '#000000',
			top					: '12%'
		});
		date_picker.selectionIndicator = true;

		/*
		 * Time picker
		 */
		var time_picker =  Titanium.UI.createPicker({
				borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
				value				: obj.currentDate,
				font 				: {
										fontSize: 18
				},
				report				: obj.currentDate,
				type				: Ti.UI.PICKER_TYPE_TIME,
				color				: '#000000',
				top					: '50%',
				timezone			: null
		});
		time_picker.selectionIndicator = true;


		Ti.API.info('Value: '+obj.value);
	
		date_picker.addEventListener('change', function(e){
			e.source.report =  e.value;
			//Update timezone
			obj.timezone  = e.source.report.getTimezoneOffset()*60*1000;
			//discover if is GMT+ or GMT-
			obj.timezone = obj.timezone*verify_UTC(e.source.report);
			Ti.API.info('New Timezone: '+obj.timezone);	
		});
		//Add field:
		win_wid.add(date_picker);
		
		time_picker.addEventListener('change', function(e){
			Ti.API.info('Time: '+e.value);
			Ti.API.info('Report: '+e.source.report);
			
			e.source.report =  e.value;	
			//Update timezone
			e.source.timezone  = e.source.report.getTimezoneOffset()*60*1000;
			//discover if is GMT+ or GMT-
			e.source.timezone = e.source.timezone*verify_UTC(e.source.report);
			Ti.API.info('Timezone for time_picker: '+e.source.timezone);		
		});
		
		//Add field:
		win_wid.add(time_picker);

		var done = Ti.UI.createButton({
			title: 'Done',
			bottom: 10,
			width: '35%',
			left: '10%',
			height: '10%'
		});
	
		var cancel = Ti.UI.createButton({
			title: 'Cancel',
			bottom: 10,
			width: '35%',
			left: '55%',
			height: '10%'	
		});
		
		win_wid.add(done);
		win_wid.add(cancel);
	
		done.addEventListener('click', function(){
			var date_value	= date_picker.report;
			var time_value	= time_picker.report;
			
			//Day with no second
			var date_rest 		= date_value.getTime() % 86400000;

			//Local and actual timezone
			var local_timezone  = time_picker.report.getTimezoneOffset()*60*1000;
			
			//discover if is GMT+ or GMT-
			local_timezone 		= local_timezone*verify_UTC(time_picker.report);
			var timezone_diff 	= local_timezone - obj.timezone;

			var time_rest	 	= (time_value.getTime()+timezone_diff) % 86400000;
			date_value 	= (Math.round(date_value.getTime()) - date_rest);
			time_value	= (time_rest);
			
			var composed_date	= date_value+time_value;
			var new_date		= new Date(composed_date);

			obj.currentDate		= new_date;
			obj.value			= Math.round(obj.currentDate.getTime()) + obj.timezone;
			
			Ti.API.info('Date : '+obj.currentDate);
			Ti.API.info('Value: '+obj.value);

			var f_minute	=	obj.currentDate.getMinutes();
			var f_hour		= 	obj.currentDate.getHours();
			var f_date		= 	obj.currentDate.getDate();
			var f_month		=	months_set[obj.currentDate.getMonth()];
			var f_year		=	obj.currentDate.getFullYear();
		    
			obj.text = f_hour+":"+form_min(f_minute)+" - "+f_month+" / "+f_date+" / "+f_year;
			win_wid.close();
		});
	
		cancel.addEventListener('click', function(){
			if (obj.value == null){
				obj.update_it = false;
			}
			win_wid.close();
		});
	} 
	
	win_wid.open();
	
}

function display_omadi_time(obj){
	var win_wid = Ti.UI.createWindow({
		modal: true,
		backgroundColor: "#000",
		opacity: 0.9
	});

	var widget = obj.widget;
	var settings = obj.settings;

	var tit_picker	= Ti.UI.createLabel({
		top				: 0,
		width			: '100%',
		height			: '10%',
		backgroundColor	: '#FFF',
		color			: '#000',
		textAlign		: 'center',
		font			: {
						fontWeight: 'bold'
		},
		text			: obj.title_picker
	});
	win_wid.add(tit_picker);
	
	obj.update_it = true;

	//Update timezone
	obj.timezone  = obj.currentDate.getTimezoneOffset()*60*1000;

	//discover if is GMT+ or GMT-
	obj.timezone = obj.timezone*verify_UTC(obj.currentDate);
	
	//Refresh GMT value
	obj.value	= Math.round(obj.currentDate.getTime()) + obj.timezone;
	
	Ti.API.info('TIMEZONE : '+obj.timezone);
	Ti.API.info('Date : '+obj.currentDate);
	
	var date_picker =  Titanium.UI.createPicker({
			borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
			value				: obj.currentDate,
			font 				: {
									fontSize: 18
			},
			report				: obj.currentDate,
			type				: Ti.UI.PICKER_TYPE_TIME,
			color				: '#000000'
	});
	date_picker.selectionIndicator = true;

	Ti.API.info('Value: '+obj.value);
	
	date_picker.addEventListener('change', function(e){
		e.source.report =  e.value;
		//Update timezone
		obj.timezone  = e.source.report.getTimezoneOffset()*60*1000;
		//discover if is GMT+ or GMT-
		obj.timezone = obj.timezone*verify_UTC(e.source.report);
	});

	//Add fields:
	win_wid.add(date_picker);

	var done = Ti.UI.createButton({
		title: 'Done',
		bottom: 10,
		width: '35%',
		left: '10%',
		height: '10%'
	});
	
	var cancel = Ti.UI.createButton({
		title: 'Cancel',
		bottom: 10,
		width: '35%',
		left: '55%',
		height: '10%'	
	});
	
	win_wid.add(done);
	win_wid.add(cancel);
	
	done.addEventListener('click', function(){
		obj.currentDate	= date_picker.report;
		obj.value		= Math.round(obj.currentDate.getTime()) + obj.timezone;
		
		Ti.API.info('Date : '+obj.currentDate);
		Ti.API.info('Value: '+obj.value);

		var hours = obj.currentDate.getHours();
		var min	=	obj.currentDate.getMinutes();

		obj.text = hours+":"+form_min(min);
		win_wid.close();
	});
	
	cancel.addEventListener('click', function(){
		if (obj.value == null){
			obj.update_it = false;
		}
		win_wid.close();
	});
	
	win_wid.open();
}


function open_mult_selector( obj ){	
	var win_wid = Ti.UI.createWindow({
		modal: true,
		opacity: 0
	});
	
	var win_view = Ti.UI.createView({
		backgroundColor		: '#FFFFFF',
		top					: '6%',
		left				: '6%',
		right				: '6%',
		bottom				: '6%',
		borderRadius		: 10,
		borderWidth			: 2,
		borderColor			: '#FFFFFF',
		opacity: 1
	});
	win_wid.add(win_view);
	
	var header_sel = Ti.UI.createView({
		top: 0,
		height: '15%',
		backgroundColor: '#333'
	});
	win_view.add(header_sel);
	
	var ico_sel = Ti.UI.createImageView({
		image: '/images/drop.png',
		width: "31dp",
		height: "31dp",
		left: "10dp"
	});
	header_sel.add(ico_sel);
	
	var label_sel = Ti.UI.createLabel({
		text: obj.view_title,
		color: '#FFF',
		font: {
			fontSize: '18dp',
			fontWeight: 'bold'
		},
		left: '51dp'
	});
	header_sel.add(label_sel);
	
	var listView = Titanium.UI.createTableView({
		data : [],
		top : '15%',
		height : '73%',
		scrollable: true
	});
	
	var elements_to_insert = [];
	for (var v_iten in obj.itens){
		Ti.API.info(v_iten);
		elements_to_insert.push({
			title:  obj.itens[v_iten].title,
			v_info: obj.itens[v_iten].v_info,
			is_set: obj.itens[v_iten].is_set
		});
	}
	var color_set	= "#A8A8A8";
	var color_unset = "#FFFFFF";
	
	var count_sel = 0;
	while ( count_sel < elements_to_insert.length ){
		
		var row_t = Ti.UI.createTableViewRow({
			height			: 'auto',	
			display 		: elements_to_insert[count_sel].title,
			selected		: elements_to_insert[count_sel].is_set,
			v_info			: elements_to_insert[count_sel].v_info,
			backgroundColor : elements_to_insert[count_sel].is_set ? color_set : color_unset,
			className		: 'menu_row' //optimize rendering
		});
		
		var title = Titanium.UI.createLabel({
			text: elements_to_insert[count_sel].title,
			width:'83%',
			textAlign:'left',
			left:'0%',
			color: '#000',
			height:'auto'
		});
		row_t.add(title);
		
		listView.appendRow(row_t);
		++count_sel;
	}
	win_view.add(listView);	
	
	listView.addEventListener('click',function(e){
		if (listView.data[0].rows[e.index].selected === false){
			listView.data[0].rows[e.index].selected = true;
			listView.data[0].rows[e.index].backgroundColor = color_set;
		}
		else{
			listView.data[0].rows[e.index].selected = false;
			listView.data[0].rows[e.index].backgroundColor = color_unset;
		}
		Ti.API.info('Field set to '+listView.data[0].rows[e.index].selected);
	});
	
	var bottom_sel = Ti.UI.createView({
		bottom: 0,
		height: '12%',
		width: '100%',
		backgroundColor: '#AAA'
	});
	win_view.add(bottom_sel);
	
	var selected_ok = Ti.UI.createButton({
		title: 'OK',
		width: '60%',
		top: '3%',
		bottom: '3%'
	});
	bottom_sel.add(selected_ok);
	
	selected_ok.addEventListener('click', function(){
		var aux_ret = new Array();
		var valid_return = new Array();
		for (var i_sel = 0 ; i_sel < listView.data[0].rows.length ; i_sel++){
			if (listView.data[0].rows[i_sel].selected == true){
				aux_ret.push({
					title	: listView.data[0].rows[i_sel].display,
					v_info	: listView.data[0].rows[i_sel].v_info,
					is_set	: true
				});
				
				valid_return.push({
					title	: listView.data[0].rows[i_sel].display,
					v_info	: listView.data[0].rows[i_sel].v_info
				});
			}
			else{
				aux_ret.push({
					title	: listView.data[0].rows[i_sel].display,
					v_info	: listView.data[0].rows[i_sel].v_info,
					is_set	: false
				});
			}
		}


		if (valid_return.length == 0){
			obj.value = null
			obj.text = "UNSET";
		}
		else{
			obj.value = valid_return;
			if (valid_return.length == 1){
				obj.text = valid_return[0].title;
			}
			else{
				obj.text = obj.view_title+" ["+valid_return.length+"]";
			}
		}
		
		obj.itens = aux_ret;
		win_wid.close();
				
	});
	win_wid.open();
}

///////////////////////////
// UI
//////////////////////////


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
	text: win.nameSelected,
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

var regions			 = db_display.execute('SELECT * FROM regions WHERE node_type = "'+win.type+'" ORDER BY weight ASC');
var fields_result	 = db_display.execute('SELECT * FROM fields WHERE bundle = "'+win.type+'" ORDER BY weight ASC');
var bundle_titles	 = db_display.execute('SELECT title_fields FROM bundles WHERE bundle_name = "'+win.type+'" ');
//Contents for node edits
if (mode == 1){
	var content_fields	 = db_display.execute('SELECT * FROM '+win.type+' WHERE nid = "'+win.nid+'" ');	
}

var titles_required = "";
if (bundle_titles.isValidRow()){
	titles_required	= JSON.parse(bundle_titles.fieldByName('title_fields'));
	//alert(titles_required);	
}

//Populate array with field name and configs
var field_arr		=	new Array();
var unsorted_res	=   new Array();
var label			=	new Array();
var content			=	new Array();
var border			=	new Array();
var values_query	=	new Array();
var count = 0;
var title = 0;

setTimeout(function(e){
	//Load an array containing fields_result 
	while (fields_result.isValidRow()){
		var is_title = false;
		for (var t_req in titles_required){
			if (fields_result.fieldByName('field_name').indexOf(t_req) != -1){
				is_title = true;
			}
		}		
		
		if (mode == 1){
			Ti.API.info(fields_result.fieldByName('field_name')+'\'s actual value = '+content_fields.fieldByName(fields_result.fieldByName('field_name')));
			unsorted_res.push({
						label:fields_result.fieldByName('label'),
						fid:fields_result.fieldByName('fid'),
						type:fields_result.fieldByName('type'), 
						field_name: fields_result.fieldByName('field_name'),
						disabled:fields_result.fieldByName('disabled'),
						required:fields_result.fieldByName('required'),
						settings: fields_result.fieldByName('settings'),
						widget: fields_result.fieldByName('widget'),
						actual_value: content_fields.fieldByName(fields_result.fieldByName('field_name')),
						is_title: is_title
			});
		}
		else{
			unsorted_res.push({
						label:fields_result.fieldByName('label'),
						fid:fields_result.fieldByName('fid'),
						type:fields_result.fieldByName('type'), 
						field_name: fields_result.fieldByName('field_name'),
						disabled:fields_result.fieldByName('disabled'),
						required:fields_result.fieldByName('required'),
						settings: fields_result.fieldByName('settings'),
						widget: fields_result.fieldByName('widget'),
						is_title: is_title
			});
		}
		fields_result.next();	
	}
	
	while (regions.isValidRow()){
		
		var reg_settings = JSON.parse(regions.fieldByName('settings'));
		var evaluate_this = null; 
		
		if (!reg_settings){
			evaluate_this = null;
		}
		else if (mode == 0 ){
			evaluate_this = reg_settings.creation_disabled;
		}
		else{
			evaluate_this = reg_settings.update_disabled;
		}
		
		if (reg_settings != null && evaluate_this){
			Ti.API.info('Region : '+regions.fieldByName('label')+' won\'t appear');
		}
		else{

			//Display region title:
			field_arr[regions.fieldByName('label')] = new Array();
			field_arr[regions.fieldByName('label')][field_arr[regions.fieldByName('label')].length] = {
					label			: regions.fieldByName('label'),
					type			: 'region_separator_mode', 
					field_name		: regions.fieldByName('region_name'),
					settings		: null,
					widget			: null,
					region_settings	: regions.fieldByName('settings'),
					region_show		: false
			};
			
			Ti.API.info(' Region_name: '+regions.fieldByName('region_name'));
			Ti.API.info(' Weight: '+regions.fieldByName('weight'));
	
			//Organizing every field into regions:
			//while (fields_result.isValidRow()){
			for (var i in unsorted_res){
				var settings = JSON.parse(unsorted_res[i].settings);

				if (unsorted_res[i].disabled == 0){
					if (regions.fieldByName('region_name') == settings.region ){
						Ti.API.info('Regions match! ');
						Ti.API.info('Field label: '+unsorted_res[i].label);
						Ti.API.info('Field type: '+unsorted_res[i].type);
						Ti.API.info('Field name: '+unsorted_res[i].field_name);
						
						field_arr[regions.fieldByName('label')][0].region_show = true;						
						//Index the array by label
						if (!field_arr[unsorted_res[i].label]){
							 field_arr[unsorted_res[i].label] = new Array();
						}
						
						////
						//Array of fields
						// field_arr[label][length] 
						// field_arr[address][0], field_arr[address][1], field_arr[address][2]
						////
						if (mode == 1){
							field_arr[unsorted_res[i].label][field_arr[unsorted_res[i].label].length] = {
										label			: unsorted_res[i].label,
										type			: unsorted_res[i].type,
										required		: unsorted_res[i].required,
										field_name		: unsorted_res[i].field_name,
										settings		: unsorted_res[i].settings,
										widget			: unsorted_res[i].widget,
										fid				: unsorted_res[i].fid,
										is_title		: unsorted_res[i].is_title,
										actual_value	: unsorted_res[i].actual_value
							};
						}
						else{
							field_arr[unsorted_res[i].label][field_arr[unsorted_res[i].label].length] = {
										label			: unsorted_res[i].label,
										type			: unsorted_res[i].type,
										required		: unsorted_res[i].required,
										field_name		: unsorted_res[i].field_name,
										settings		: unsorted_res[i].settings,
										widget			: unsorted_res[i].widget,
										fid				: unsorted_res[i].fid,
										is_title		: unsorted_res[i].is_title,
										actual_value	: ""
							};
						}
					}
					else{
						if (field_arr[regions.fieldByName('label')][0].region_show === false){
							//field_arr[regions.fieldByName('label')][0].region_show = false;							
						}
						Ti.API.info(' Regions dont match! ');
					}
				}
				else{
					
				}
				
			}
		}
		regions.next();
	}
	var top = 0;
	var field_definer = 0;
	//Go throught the whole array in order to format the fields on screen
	for (var index_label in field_arr ){
		for (var index_size in field_arr[index_label]){
			Ti.API.info(index_size+'. Label : '+index_label+' we got content: '+field_arr[index_label][index_size].type+' ');
			
			var widget = JSON.parse(field_arr[index_label][index_size].widget);
			var settings = JSON.parse(field_arr[index_label][index_size].settings);

			if ((settings) && (settings.cardinality == "-1")){
				Ti.API.info(field_arr[index_label][index_size].settings);
				Ti.API.info(field_arr[index_label][index_size].widget);
			}
			
			switch(field_arr[index_label][index_size].type){

				case 'license_plate':
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

					var settings 	= JSON.parse(field_arr[index_label][index_size].settings); 
					var fi_name		= field_arr[index_label][index_size].field_name;
					var reffer_index	= count;
					
					fi_name = fi_name.split('___');
					if (fi_name[1]){
						var i_name = fi_name[1];
					}
					else{
						var i_name = fi_name[0];
					}
					
					i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);

					//Add fields:
					viewContent.add(label[count]);

					if (settings.cardinality > 1){
						if ((field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
							
						}
		   				
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}
							
							if (field_arr[index_label][index_size].field_name == "license_plate___state"){
								var arr_picker = [];
								
								var aux_val = {
									cnt : 0,
									usps: null,
									title: " -- State -- "
								}
								
								//States
								arr_picker.push({title:" -- State -- " , usps:null });
								arr_picker.push({title:"Alabama" , usps:"AL" });
								arr_picker.push({title:"Alaska" , usps:"AK" });
								arr_picker.push({title:"Arizona" , usps:"AZ" });
								arr_picker.push({title:"Arkansas" , usps:"AR" });
								arr_picker.push({title:"California" , usps:"CA" });
								arr_picker.push({title:"Colorado" , usps:"CO" });
								arr_picker.push({title:"Connecticut" , usps:"CT" });
								arr_picker.push({title:"Delaware" , usps:"DE" });
								arr_picker.push({title:"Florida" , usps:"FL" });
								arr_picker.push({title:"Georgia" , usps:"GA" });
								arr_picker.push({title:"Hawaii" , usps:"HI" });
								arr_picker.push({title:"Idaho" , usps:"ID" });
								arr_picker.push({title:"Illinois" , usps:"IL" });
								arr_picker.push({title:"Indiana" , usps:"IN" });
								arr_picker.push({title:"Iowa" , usps:"IA" });
								arr_picker.push({title:"Kansas" , usps:"KS" });
								arr_picker.push({title:"Kentucky" , usps:"KY" });
								arr_picker.push({title:"Louisiana" , usps:"LA" });
								arr_picker.push({title:"Maine" , usps:"ME" });
								arr_picker.push({title:"Maryland" , usps:"MD" });
								arr_picker.push({title:"Massachusetts" , usps:"MA" });
								arr_picker.push({title:"Michigan" , usps:"MI" });
								arr_picker.push({title:"Minnesota" , usps:"MN" });
								arr_picker.push({title:"Mississippi" , usps:"MS" });
								arr_picker.push({title:"Missouri" , usps:"MO" });
								arr_picker.push({title:"Montana" , usps:"MT" });
								arr_picker.push({title:"Nebraska" , usps:"NE" });
								arr_picker.push({title:"Nevada" , usps:"NV" });
								arr_picker.push({title:"New Hampshire" , usps:"NH" });
								arr_picker.push({title:"New Jersey" , usps:"NJ" });
								arr_picker.push({title:"New Mexico" , usps:"NM" });
								arr_picker.push({title:"New York" , usps:"NY" });
								arr_picker.push({title:"North Carolina" , usps:"NC" });
								arr_picker.push({title:"North Dakota" , usps:"ND" });
								arr_picker.push({title:"Ohio" , usps:"OH" });
								arr_picker.push({title:"Oklahoma" , usps:"OK" });
								arr_picker.push({title:"Oregon" , usps:"OR" });
								arr_picker.push({title:"Pennsylvania" , usps:"PA" });
								arr_picker.push({title:"Rhode Island" , usps:"RI" });
								arr_picker.push({title:"South Carolina" , usps:"SC" });
								arr_picker.push({title:"South Dakota" , usps:"SD" });
								arr_picker.push({title:"Tennessee" , usps:"TN" });
								arr_picker.push({title:"Texas" , usps:"TX" });
								arr_picker.push({title:"Utah" , usps:"UT" });
								arr_picker.push({title:"Vermont" , usps:"VT" });
								arr_picker.push({title:"Virginia" , usps:"VA" });
								arr_picker.push({title:"Washington" , usps:"WA" });
								arr_picker.push({title:"West Virginia" , usps:"WV" });
								arr_picker.push({title:"Wisconsin" , usps:"WI" });
								arr_picker.push({title:"Wyoming" , usps:"WY" });
								
								var count_at = 0;
								var to_row = new Array();
								
								for (var at in arr_picker){
									to_row.push(Ti.UI.createPickerRow({title:arr_picker[at].title , usps:arr_picker[at].usps }));
									if (arr_picker[at].usps == vl_to_field){
										aux_val.cnt = count_at;
										aux_val.title = arr_picker[at].title;
										aux_val.usps = arr_picker[at].usps;
									}
									count_at++;
								}
								
								//Compares where it is
								
								content[count] = Titanium.UI.createPicker({
									borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									private_index		: o_index,
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
									required			: field_arr[index_label][index_size].required,
									is_title			: field_arr[index_label][index_size].is_title,
									value				: aux_val.usps,
									composed_obj		: true,
									cardinality			: settings.cardinality,
									reffer_index		: reffer_index
								}); 
								
								content[count].add(to_row);
								
								content[count].setSelectedRow(0, aux_val.cnt, false);
								
								content[count].addEventListener('change', function(e){
									Ti.API.info('USPS: '+e.row.usps);
									e.source.value = e.row.usps; 
								});
								top += heightValue;
		
								viewContent.add(content[count]);
								count++;
								
							}
							else{
								content[count] = Ti.UI.createTextField({
									hintText		: "#"+o_index+" "+i_name,
									private_index	: o_index,
									reffer_index	: reffer_index,
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
									field_name		: field_arr[index_label][index_size].field_name,
									required		: field_arr[index_label][index_size].required,
									is_title		: field_arr[index_label][index_size].is_title,
									composed_obj	: true,
									cardinality		: settings.cardinality,
									value			: vl_to_field
								});
							}
							top += heightValue;
							
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
						if (field_arr[index_label][index_size].field_name == "license_plate___state"){
							var arr_picker = [];
							
							var aux_val = {
								cnt : 0,
								usps: null,
								title: " -- State -- "
							}
							
							//States
							arr_picker.push({title:" -- State -- " , usps:null });
							arr_picker.push({title:"Alabama" , usps:"AL" });
							arr_picker.push({title:"Alaska" , usps:"AK" });
							arr_picker.push({title:"Arizona" , usps:"AZ" });
							arr_picker.push({title:"Arkansas" , usps:"AR" });
							arr_picker.push({title:"California" , usps:"CA" });
							arr_picker.push({title:"Colorado" , usps:"CO" });
							arr_picker.push({title:"Connecticut" , usps:"CT" });
							arr_picker.push({title:"Delaware" , usps:"DE" });
							arr_picker.push({title:"Florida" , usps:"FL" });
							arr_picker.push({title:"Georgia" , usps:"GA" });
							arr_picker.push({title:"Hawaii" , usps:"HI" });
							arr_picker.push({title:"Idaho" , usps:"ID" });
							arr_picker.push({title:"Illinois" , usps:"IL" });
							arr_picker.push({title:"Indiana" , usps:"IN" });
							arr_picker.push({title:"Iowa" , usps:"IA" });
							arr_picker.push({title:"Kansas" , usps:"KS" });
							arr_picker.push({title:"Kentucky" , usps:"KY" });
							arr_picker.push({title:"Louisiana" , usps:"LA" });
							arr_picker.push({title:"Maine" , usps:"ME" });
							arr_picker.push({title:"Maryland" , usps:"MD" });
							arr_picker.push({title:"Massachusetts" , usps:"MA" });
							arr_picker.push({title:"Michigan" , usps:"MI" });
							arr_picker.push({title:"Minnesota" , usps:"MN" });
							arr_picker.push({title:"Mississippi" , usps:"MS" });
							arr_picker.push({title:"Missouri" , usps:"MO" });
							arr_picker.push({title:"Montana" , usps:"MT" });
							arr_picker.push({title:"Nebraska" , usps:"NE" });
							arr_picker.push({title:"Nevada" , usps:"NV" });
							arr_picker.push({title:"New Hampshire" , usps:"NH" });
							arr_picker.push({title:"New Jersey" , usps:"NJ" });
							arr_picker.push({title:"New Mexico" , usps:"NM" });
							arr_picker.push({title:"New York" , usps:"NY" });
							arr_picker.push({title:"North Carolina" , usps:"NC" });
							arr_picker.push({title:"North Dakota" , usps:"ND" });
							arr_picker.push({title:"Ohio" , usps:"OH" });
							arr_picker.push({title:"Oklahoma" , usps:"OK" });
							arr_picker.push({title:"Oregon" , usps:"OR" });
							arr_picker.push({title:"Pennsylvania" , usps:"PA" });
							arr_picker.push({title:"Rhode Island" , usps:"RI" });
							arr_picker.push({title:"South Carolina" , usps:"SC" });
							arr_picker.push({title:"South Dakota" , usps:"SD" });
							arr_picker.push({title:"Tennessee" , usps:"TN" });
							arr_picker.push({title:"Texas" , usps:"TX" });
							arr_picker.push({title:"Utah" , usps:"UT" });
							arr_picker.push({title:"Vermont" , usps:"VT" });
							arr_picker.push({title:"Virginia" , usps:"VA" });
							arr_picker.push({title:"Washington" , usps:"WA" });
							arr_picker.push({title:"West Virginia" , usps:"WV" });
							arr_picker.push({title:"Wisconsin" , usps:"WI" });
							arr_picker.push({title:"Wyoming" , usps:"WY" });
							
							var count_at = 0;
							var to_row = new Array();
							
							for (var at in arr_picker){
								to_row.push(Ti.UI.createPickerRow({title:arr_picker[at].title , usps:arr_picker[at].usps }));
								if (arr_picker[at].usps == field_arr[index_label][index_size].actual_value){
									aux_val.cnt = count_at;
									aux_val.title = arr_picker[at].title;
									aux_val.usps = arr_picker[at].usps;
								}
								count_at++;
							}
							
							//Compares where it is
							
							content[count] = Titanium.UI.createPicker({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								private_index		: o_index,
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
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								value				: aux_val.usps,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index
							}); 
							
							content[count].add(to_row);
							
							content[count].setSelectedRow(0, aux_val.cnt, false);
							
							content[count].addEventListener('change', function(e){
								Ti.API.info('USPS: '+e.row.usps);
								e.source.value = e.row.usps; 
							});
							top += heightValue;
	
							viewContent.add(content[count]);
							count++;
						}
						else{
						
							content[count] = Ti.UI.createTextField({
								hintText		: i_name,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: false,
								cardinality		: settings.cardinality,
								value			: field_arr[index_label][index_size].actual_value,
								reffer_index	: reffer_index
							});
							top += heightValue;
	
							viewContent.add(content[count]);
							count++;
						}
					}
				break;
				
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

					//Add fields:
					viewContent.add(label[count]);
					var reffer_index	= count;
					
					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}

							content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index
							});
							top += heightValue;
														
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
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
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index
						});
						top += heightValue;

						viewContent.add(content[count]);
						count++;
					}
	
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

					//Add fields:
					viewContent.add(label[count]);
					var reffer_index	= count;
					
					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}

							content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
								borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								textAlign		: 'left',
								left			: '3%',
								right			: '3%',
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
								reffer_index	: reffer_index
							});
							top += 100;
							
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
						content[count] = Ti.UI.createTextField({
							hintText		: field_arr[index_label][index_size].label,
							borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
							textAlign		: 'left',
							left			: '3%',
							right			: '3%',
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
							reffer_index	: reffer_index
						});
						top += 100;

						viewContent.add(content[count]);
						count++;
					}
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
					 
					//Add fields:
					viewContent.add(label[count]);

					var reffer_index	= count;
					
					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}


							content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index
							});
							top += heightValue;
							
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
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
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index
						});
						top += heightValue;
						
						viewContent.add(content[count]);
						count++;
					}
				break;
	
	
				
				case 'number_decimal':
				case 'number_integer':
					var settings = JSON.parse(field_arr[index_label][index_size].settings);
					
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
					//Add fields:
					viewContent.add(label[count]);
					var reffer_index	= count;
					
					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") && (decoded_values[o_index] != "null")) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = null;
							}

			 				content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								composed_obj	: true,
								is_title		: field_arr[index_label][index_size].is_title,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index
							});
							top += heightValue;
							
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
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
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							composed_obj	: false,
							is_title		: field_arr[index_label][index_size].is_title,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index
						});
						top += heightValue;
						
						viewContent.add(content[count]);
						count++;
					}
				break;

				case 'phone':
					var settings = JSON.parse(field_arr[index_label][index_size].settings);
					
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
					//Add fields:
					viewContent.add(label[count]);
					var reffer_index	= count;
					
					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}

			 				content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								composed_obj	: true,
								is_title		: field_arr[index_label][index_size].is_title,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index
							});
							top += heightValue;
							
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
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
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							composed_obj	: false,
							is_title		: field_arr[index_label][index_size].is_title,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index
						});
						top += heightValue;
						
						viewContent.add(content[count]);
						count++;
					}
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
	
					//Add fields:
					viewContent.add(label[count]);

					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}

							content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+field_arr[index_label][index_size].label,
								private_index	: o_index,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index
							});
							top += heightValue;
							
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
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
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index
						});
						top += heightValue;

						viewContent.add(content[count]);
						count++;
					}
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
						var reffer_index	= count;
						
						var vocabulary = db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '"+settings.vocabulary+"'");
						var terms = db_display.execute("SELECT * FROM term_data WHERE vid='"+vocabulary.fieldByName('vid')+"'GROUP BY name ORDER BY name ASC");
	
						var data_terms = [];
						if (settings.cardinality != -1){
							data_terms.push({title: field_arr[index_label][index_size].label, tid: null });
						}
						
						while (terms.isValidRow()){ 
							data_terms.push({title: terms.fieldByName('name'), tid: terms.fieldByName('tid') }); 
							terms.next();
						}
						terms.close();
						vocabulary.close();

						//Add fields:
						viewContent.add(label[count]);
						
						Ti.API.info('===> '+settings.cardinality);
												
						if (settings.cardinality > 1){
							if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
								var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
								
								//Decode the stored array:
								var decoded = array_cont.fieldByName('encoded_array');
								decoded = Titanium.Utils.base64decode(decoded);
								Ti.API.info('Decoded array is equals to: '+decoded);
								
								decoded = decoded.toString();
								
								// Token that splits each element contained into the array: 'j8Oá2s)E'
								var decoded_values = decoded.split("j8Oá2s)E");
							}
							else{
								var decoded_values = new Array();
								decoded_values[0] = field_arr[index_label][index_size].actual_value;
							}
							
							for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
								
								if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
									var vl_to_field = decoded_values[o_index];
								}
								else{
									var vl_to_field = "";
								}

								var arr_picker 	= new Array();
								
								var aux_val		= {
										title: "",
										vl	: null,
										cnt : 0
								};
								
								var counter_loop = 0;
								for (var i_data_terms in data_terms){
									if (vl_to_field == data_terms[i_data_terms].tid){
										aux_val.title = data_terms[i_data_terms].title;
										aux_val.vl	  = data_terms[i_data_terms].tid;
										aux_val.cnt	  = counter_loop;
									}
									arr_picker.push(Ti.UI.createPickerRow({title:data_terms[i_data_terms].title, tid:data_terms[i_data_terms].tid }));
									counter_loop++;
								}
								
								content[count] = Titanium.UI.createPicker({
									borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
									private_index		: o_index,
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
									widget				: 'options_select',
									required			: field_arr[index_label][index_size].required,
									is_title			: field_arr[index_label][index_size].is_title,
									value				: aux_val.vl,
									composed_obj		: true,
									cardinality			: settings.cardinality,
									reffer_index		: reffer_index
								}); 
								
								content[count].add(arr_picker);
								
								content[count].setSelectedRow(0, aux_val.cnt, false);
								
								content[count].addEventListener('change', function(e){
									Ti.API.info('TID: '+e.row.tid);
									e.source.value = e.row.tid; 
								});
								top += heightValue;
								
								//Add fields:
								viewContent.add(content[count]);
								count++;
							}
						}
						else if (settings.cardinality == 1){
							
							var arr_picker 	= new Array();
								
							var aux_val		= {
									title: "",
									vl	: null,
									cnt : 0
							};
							
							var counter_loop = 0;
							for (var i_data_terms in data_terms){
								if (field_arr[index_label][index_size].actual_value == data_terms[i_data_terms].tid){
									aux_val.title = data_terms[i_data_terms].title;
									aux_val.vl	  = data_terms[i_data_terms].tid;
									aux_val.cnt	  = counter_loop;
								}
								arr_picker.push(Ti.UI.createPickerRow({title:data_terms[i_data_terms].title, tid:data_terms[i_data_terms].tid }));
								counter_loop++;
							}
							
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
								widget				: 'options_select',
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: false,
								cardinality			: settings.cardinality,
								value				: aux_val.vl,
								reffer_index		: reffer_index
							}); 
							
							content[count].add(arr_picker);
							content[count].setSelectedRow(0, aux_val.cnt, false);
							
							content[count].addEventListener('change', function(e){
								Ti.API.info('TID: '+e.row.tid);
								e.source.value = e.row.tid; 
							});
							top += heightValue;
							
							//Add fields:
							viewContent.add(content[count]);
							count++;
						}
						else if (settings.cardinality == -1){
							var sel_text = "UNSET";
							var _val_itens = [];
							var _itens = "";
							var _exist = [];
							
							if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
								var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
								
								//Decode the stored array:
								var decoded = array_cont.fieldByName('encoded_array');
								decoded = Titanium.Utils.base64decode(decoded);
								Ti.API.info('Decoded array is equals to: '+decoded);
								
								decoded = decoded.toString();
								
								// Token that splits each element contained into the array: 'j8Oá2s)E'
								var decoded_values = decoded.split("j8Oá2s)E");
							}
							else{
								var decoded_values = new Array();
								decoded_values[0] = field_arr[index_label][index_size].actual_value;
							}
							
							for (var j_ind in data_terms){
								Ti.API.info(data_terms[j_ind].tid+' = '+decoded_values.indexOf(data_terms[j_ind].tid.toString()));

								if( decoded_values.indexOf(data_terms[j_ind].tid.toString()) != -1){
									sel_text	  = data_terms[j_ind].title;
									_val_itens.push({
										title 	: data_terms[j_ind].title,
										v_info  : data_terms[j_ind].tid,
										is_set	: true
									});
									
									_exist.push({
										title 	: data_terms[j_ind].title,
										v_info  : data_terms[j_ind].tid
									});
									
								}
								else{
									_val_itens.push({
										title	: data_terms[j_ind].title,
										v_info	: data_terms[j_ind].tid,
										is_set	: false
									});											
								}


							}
							
							if (_exist.length > 1){
								sel_text = field_arr[index_label][index_size].label+" ["+_exist.length+"]"
							}
							
							_itens = _exist;
							
							if (_exist.length == 0){
								_itens = null;
							}
							
							Ti.API.info("==>> "+_val_itens);
							Ti.API.info("==>> "+_itens);
							
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
								reffer_index		: reffer_index
							}); 
							
							
							content[count].addEventListener('click', function(e){
								for (var jsa in e.source.itens){
									Ti.API.info(jsa+' = '+e.source.itens[jsa].title);
								}
								open_mult_selector(e.source); 
							});
							top += heightValue;
							
							//Add fields:
							viewContent.add(content[count]);
							count++;
						}
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

						//Add fields:
						viewContent.add(label[count]);
						var reffer_index	= count;
						
						if (settings.cardinality > 1){
							if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
								var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
								
								//Decode the stored array:
								var decoded = array_cont.fieldByName('encoded_array');
								decoded = Titanium.Utils.base64decode(decoded);
								Ti.API.info('Decoded array is equals to: '+decoded);
								
								decoded = decoded.toString();
								
								// Token that splits each element contained into the array: 'j8Oá2s)E'
								var decoded_values = decoded.split("j8Oá2s)E");
							}
							else{
								var decoded_values = new Array();
								decoded_values[0] = field_arr[index_label][index_size].actual_value;
							}
							
							for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
								
								if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
									var vl_to_field = decoded_values[o_index];
								}
								else{
									var vl_to_field = "";
								}

								if (!settings.vocabulary){
									settings.vocabulary = field_arr[index_label][index_size].field_name;
								}
								Ti.API.info('================> Vocabulary '+settings.vocabulary);
								var vocabulary 	= db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '"+settings.vocabulary+"'");
								var terms		= db_display.execute("SELECT * FROM term_data WHERE vid='"+vocabulary.fieldByName('vid')+"'GROUP BY name ORDER BY name ASC");
								var vid			= vocabulary.fieldByName('vid');
								
								data_terms 		= new Array;
								var aux_val		= {
										title: "",
										vl	: null
								};

								while (terms.isValidRow()){
									if ( vl_to_field == terms.fieldByName('tid') ){
										aux_val.title = terms.fieldByName('name');
										aux_val.vl	  = terms.fieldByName('tid');
									}
									 
									data_terms.push({title: terms.fieldByName('name'), tid: terms.fieldByName('tid') }); 
									terms.next();
								}
								//alert('AQUI => title: '+aux_val.title+' tid = '+aux_val.vl);
								
								terms.close();
								vocabulary.close();
								
								var rest_up = settings.restrict_new_autocomplete_terms;
								if (!rest_up){
									rest_up = 0;
								}

								content[count] = Titanium.UI.createTextField({
									hintText						: "#"+o_index+" "+field_arr[index_label][index_size].label+' ...',
									private_index					: o_index,
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
									reffer_index					: reffer_index
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
									}
									else{
										e.source.first_time = false;
									}
								});
			
								//Add fields:
								viewContent.add(content[count]);
								count++;
							}
						}
						else{
							
							var vl_to_field = field_arr[index_label][index_size].actual_value;
							
							if (!settings.vocabulary){
								settings.vocabulary = field_arr[index_label][index_size].field_name;
							}
							
							Ti.API.info('================> Vocabulary '+settings.vocabulary);
							var vocabulary 	= db_display.execute("SELECT vid FROM vocabulary WHERE machine_name = '"+settings.vocabulary+"'");
							var terms		= db_display.execute("SELECT * FROM term_data WHERE vid='"+vocabulary.fieldByName('vid')+"'GROUP BY name ORDER BY name ASC");
							var vid			= vocabulary.fieldByName('vid');
							
							data_terms 		= new Array;
							var aux_val		= {
									title: "",
									vl	: null
							};

							while (terms.isValidRow()){
								if ( vl_to_field == terms.fieldByName('tid') ){
									aux_val.title = terms.fieldByName('name');
									aux_val.vl	  = terms.fieldByName('tid');
								}
								
								data_terms.push({title: terms.fieldByName('name'), tid: terms.fieldByName('tid') }); 
								terms.next();
							}
							//alert('AQUI => title: '+aux_val.title+' tid = '+aux_val.vl);
							
							terms.close();
							vocabulary.close();
							
							var rest_up = settings.restrict_new_autocomplete_terms;
							if (!rest_up){
								rest_up = 0;
							}

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
								reffer_index					: reffer_index
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
								}
								else{
									e.source.first_time = false;
								}
		
							});
		
							//Add fields:
							viewContent.add(content[count]);
							count++;
						}
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
				 	
				 	var reffer_index	= count;
				 	
					data_terms 	= new Array();
					aux_nodes	= new Array();
					
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
						var db_bah = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
						var nodes = db_bah.execute(secondary);
						Ti.API.info("Num of rows: "+nodes.rowCount);
						while(nodes.isValidRow()){
							Ti.API.info('Title: '+nodes.fieldByName('title')+' NID: '+nodes.fieldByName('nid'));
							data_terms.push({title: nodes.fieldByName('title'), nid:nodes.fieldByName('nid') });
							nodes.next();
						}
					}

					//Add fields:
					viewContent.add(label[count]);

					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){

							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}
							
							var aux_val		= {
									title: "",
									vl	: null
							};

							for (var h in data_terms){
								if (data_terms[h].nid == vl_to_field){
									aux_val.title = data_terms[h].title;
									aux_val.vl	  = data_terms[h].nid; 
								}
							}
							
							content[count] = Titanium.UI.createTextField({
								hintText						: "#"+o_index+" "+field_arr[index_label][index_size].label+' ...',
								private_index					: o_index,
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
								nid								: aux_val.vl,
								required						: field_arr[index_label][index_size].required,
								is_title						: field_arr[index_label][index_size].is_title,
								composed_obj					: true,
								cardinality						: settings.cardinality,
								value							: aux_val.title,
								first_time						: true,
								reffer_index					: reffer_index
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
								}
								else{
									e.source.first_time = false;
								}
		
							});
		
							//Add fields:
							viewContent.add(content[count]);
							count++;						}
					}
					else{
						
						var vl_to_field = field_arr[index_label][index_size].actual_value;
						
						var aux_val		= {
								title: "",
								vl	: null
						};

						for (var h in data_terms){
							if (data_terms[h].nid == vl_to_field){
								aux_val.title = data_terms[h].title;
								aux_val.vl	  = data_terms[h].nid; 
							}
						}

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
							nid								: aux_val.vl,
							required						: field_arr[index_label][index_size].required,
							is_title						: field_arr[index_label][index_size].is_title,
							composed_obj					: false,
							cardinality						: settings.cardinality,
							value							: aux_val.title,
							first_time						: true,
							reffer_index					: reffer_index
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
							}
							else{
								e.source.first_time = false;
							}
	
						});
	
						//Add fields:
						viewContent.add(content[count]);
						count++;
					}
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
					var reffer_index	= count;
					
					//Add fields:
					viewContent.add(label[count]);
					
					var users = db_display.execute("SELECT * FROM user WHERE ((uid != 0) AND (uid != 1)) ORDER BY realname ASC");
					var data_terms = [];
					data_terms.push({title: field_arr[index_label][index_size].label, uid: null });
					
					while (users.isValidRow()){ 
						if (users.fieldByName('realname') == ''){
							var name_ff = users.fieldByName('username');
						}
						else{
							var name_ff = users.fieldByName('realname');
						}
						
						data_terms.push({title: name_ff, uid: users.fieldByName('uid') });
						
						Ti.API.info('Username: \''+users.fieldByName('username')+'\' , Realname: \''+users.fieldByName('realname')+'\' , UID = '+users.fieldByName('uid')); 
						users.next();
					}
					users.close();
					for (var algo in settings){
						Ti.API.info(algo+" ===================>>> "+settings[algo]);
					}
					
					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}

							var arr_picker 	= new Array();
							
							var aux_val		= {
									title: "",
									vl	: null,
									cnt : 0
							};
							
							if (vl_to_field == ""){
								if (settings.default_value == "current_user"){
									vl_to_field = win.uid;
								}
							}
							
							Ti.API.info(vl_to_field+" ----------------- is the uid ------------------- "+settings.default_value);
							
							var counter_loop = 0;
							for (var i_data_terms in data_terms){
								if (vl_to_field == data_terms[i_data_terms].uid){
									aux_val.title = data_terms[i_data_terms].title;
									aux_val.vl	  = data_terms[i_data_terms].uid;
									aux_val.cnt	  = counter_loop;
								}
								arr_picker.push(Ti.UI.createPickerRow({title:data_terms[i_data_terms].title, uid:data_terms[i_data_terms].uid }));
								counter_loop++;
							}
							
							content[count] = Titanium.UI.createPicker({
								borderStyle			: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
								private_index		: o_index,
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
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								value				: aux_val.vl,
								composed_obj		: true,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index
							}); 
							top += heightValue;
							
							content[count].add(arr_picker);
							content[count].setSelectedRow(0, aux_val.cnt, false);
							
							content[count].addEventListener('change', function(e){
									Ti.API.info('UID: '+e.row.uid);
									e.source.value = e.row.uid; 
							});
							
							//Add fields:
							viewContent.add(content[count]);
							count++;

						}
					}
					else{

						var vl_to_field = field_arr[index_label][index_size].actual_value;

						if (vl_to_field == ""){
							if (settings.default_value == "current_user"){
								vl_to_field = win.uid;
							}
						}
						
						Ti.API.info(vl_to_field+" ----------------- is the uid ------------------- "+settings.default_value);

					
						var arr_picker 	= new Array();
						
						var aux_val		= {
								title: "",
								vl	: null,
								cnt : 0
						};
						
						var counter_loop = 0;
						for (var i_data_terms in data_terms){
							if (vl_to_field == data_terms[i_data_terms].uid){
								aux_val.title = data_terms[i_data_terms].title;
								aux_val.vl	  = data_terms[i_data_terms].uid;
								aux_val.cnt	  = counter_loop;
							}
							arr_picker.push(Ti.UI.createPickerRow({title:data_terms[i_data_terms].title, uid:data_terms[i_data_terms].uid }));
							counter_loop++;
						}
						
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
							required			: field_arr[index_label][index_size].required,
							is_title			: field_arr[index_label][index_size].is_title,
							composed_obj		: false,
							cardinality			: settings.cardinality,
							value				: aux_val.vl,
							reffer_index		: reffer_index
						}); 
						
						top += heightValue;
						
						content[count].add(arr_picker);
						content[count].setSelectedRow(0, aux_val.cnt, false);
						
						content[count].addEventListener('change', function(e){
								Ti.API.info('UID: '+e.row.uid);
								e.source.value = e.row.uid; 
						});
						
						//Add fields:
						viewContent.add(content[count]);
						count++;
					}
				break;
	
				//Shows up date (check how it is exhibited):
				case 'datestamp':
				
					var widget = JSON.parse(field_arr[index_label][index_size].widget);
					var settings = JSON.parse(field_arr[index_label][index_size].settings); 
					Ti.API.info(field_arr[index_label][index_size].settings);

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
					var reffer_index	= count;
					
					//Add fields:
					viewContent.add(label[count]);

					// call function display_widget
					if (widget.settings['time'] != "1"){

						if (settings.cardinality > 1){
							if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
								var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
								
								//Decode the stored array:
								var decoded = array_cont.fieldByName('encoded_array');
								decoded = Titanium.Utils.base64decode(decoded);
								Ti.API.info('Decoded array is equals to: '+decoded);
								
								decoded = decoded.toString();
								
								// Token that splits each element contained into the array: 'j8Oá2s)E'
								var decoded_values = decoded.split("j8Oá2s)E");
							}
							else{
								var decoded_values = new Array();
								decoded_values[0] = field_arr[index_label][index_size].actual_value;
							}
							
							for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
								var text_in_field = "";
								if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != null) && (decoded_values[o_index] != "null") && (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
									var vl_to_field = (decoded_values[o_index])*1000;
									//Get current
									var currentDate = new Date(vl_to_field);
									var day = currentDate.getDate();
									var month = currentDate.getMonth();
									var year = currentDate.getFullYear();
									
									text_in_field = months_set[month]+" / "+day+" / "+year;
								}
								else{
									//Let's show it as UNSET
									var currentDate = new Date();
									var day = currentDate.getDate();
									var month = currentDate.getMonth();
									var year = currentDate.getFullYear();

									if (settings.default_value == 'now'){
										var vl_to_field = currentDate.getTime();
										text_in_field = months_set[month]+" / "+day+" / "+year;
									}
									else{
										var vl_to_field = null;
										text_in_field = "UNSET";
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
									height				: '100%'
								});
								
								var mother_of_view = Ti.UI.createView({
									height				: heightValue,
									top					: top 
								});
								top += heightValue;	
	
								mother_of_view.add(content[count]);
								
								var clear = Ti.UI.createImageView({
								  image:'/images/cancel.png',
								  right: '4%',
								  height: '35dp',
								  width: '35dp',
								  is_clear: true,
								  its_parent: content[count]
								});
								
								content[count].clear = clear;
								mother_of_view.add(content[count].clear); 							
								content[count].clear.addEventListener('click', function(e){
									e.source.its_parent.text = "UNSET";
									e.source.its_parent.value = null;
								});
								
								
								content[count].addEventListener('click', function(e){
									display_widget(e.source);
								});
	
								//viewContent.add(content[count]);
								viewContent.add(mother_of_view);
								count++;
							}
						}
						else{
							var text_in_field = "";
							if ((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")){
								var vl_to_field = (field_arr[index_label][index_size].actual_value)*1000;
								
								//Get current
								var currentDate = new Date(vl_to_field);
								var day = currentDate.getDate();
								var month = currentDate.getMonth();
								var year = currentDate.getFullYear();
								text_in_field = months_set[month]+" / "+day+" / "+year;
							}
							else{
								var currentDate = new Date();
								
								var day = currentDate.getDate();
								var month = currentDate.getMonth();
								var year = currentDate.getFullYear();

								if (settings.default_value == 'now'){
									var vl_to_field = currentDate.getTime();
									text_in_field = months_set[month]+" / "+day+" / "+year;
								}
								else{
									var vl_to_field = null;
									text_in_field = "UNSET";
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
								height				: '100%'

							});


							var mother_of_view = Ti.UI.createView({
								height				: heightValue,
								top					: top 
							});
							top += heightValue;	

							mother_of_view.add(content[count]);
							
							var clear = Ti.UI.createImageView({
							  image:'/images/cancel.png',
							  right: '4%',
							  height: '35dp',
							  width: '35dp',
							  is_clear: true,
							  its_parent: content[count]
							});
							
							content[count].clear = clear;
							mother_of_view.add(content[count].clear); 							
							content[count].clear.addEventListener('click', function(e){
								e.source.its_parent.text = "UNSET";
								e.source.its_parent.value = null;
							});

							content[count].addEventListener('click', function(e){
								display_widget(e.source);
							});

							//viewContent.add(content[count]);
							viewContent.add(mother_of_view);
							count++;
						}
					}
					else{
						//Composed field 
						// Date picker
						// Time picker
						// For current Titanium Studio version (1.8), Android doesn't supply such pre build API. Here we create it
						
						if (settings.cardinality > 1){
							if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
								var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
								
								//Decode the stored array:
								var decoded = array_cont.fieldByName('encoded_array');
								decoded = Titanium.Utils.base64decode(decoded);
								Ti.API.info('Decoded array is equals to: '+decoded);
								
								decoded = decoded.toString();
								
								// Token that splits each element contained into the array: 'j8Oá2s)E'
								var decoded_values = decoded.split("j8Oá2s)E");
							}
							else{
								var decoded_values = new Array();
								decoded_values[0] = field_arr[index_label][index_size].actual_value;
							}

							for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
								var text_in_field = "";
								if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != null) && (decoded_values[o_index] != "null") && (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
									var vl_to_field = decoded_values[o_index]*1000;
									
									//Get current
									var currentDate = new Date(vl_to_field);
									
									var day			= currentDate.getDate();
									var month		= currentDate.getMonth();
									var year 		= currentDate.getFullYear();
									var min			= currentDate.getMinutes();
									var hours		= currentDate.getHours();
									text_in_field	= hours+":"+form_min(min)+" - "+months_set[month]+" / "+day+" / "+year;
								}
								else{
									//Get current
									var currentDate = new Date();
									
									var day			= currentDate.getDate();
									var month		= currentDate.getMonth();
									var year 		= currentDate.getFullYear();
									var min			= currentDate.getMinutes();
									var hours		= currentDate.getHours();


									if (settings.default_value == 'now'){
										var vl_to_field = currentDate.getTime();
										text_in_field = hours+":"+form_min(min)+" - "+months_set[month]+" / "+day+" / "+year;
									}
									else{
										var vl_to_field = null;
										text_in_field = "UNSET";
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
									height				: '100%'

								});	

								var mother_of_view = Ti.UI.createView({
									height				: heightValue,
									top					: top 
								});
								top += heightValue;	
	
								mother_of_view.add(content[count]);
								
								var clear = Ti.UI.createImageView({
								  image:'/images/cancel.png',
								  right: '4%',
								  height: '35dp',
								  width: '35dp',
								  is_clear: true,
								  its_parent: content[count]
								});
								
								content[count].clear = clear;
								mother_of_view.add(content[count].clear); 							
								content[count].clear.addEventListener('click', function(e){
									e.source.its_parent.text = "UNSET";
									e.source.its_parent.value = null;
								});

								content[count].addEventListener('click', function(e){
									display_widget(e.source);
								});
	
								//viewContent.add(content[count]);
								viewContent.add(mother_of_view);
								count++;
							}
						}
						else{
							var text_in_field = "";
							if ((field_arr[index_label][index_size].actual_value != null) && (field_arr[index_label][index_size].actual_value != "null") && (field_arr[index_label][index_size].actual_value != "") && (field_arr[index_label][index_size].actual_value != " ")){
								var vl_to_field = field_arr[index_label][index_size].actual_value*1000;
								//Get current
								var currentDate = new Date(vl_to_field);
								
								var day			= currentDate.getDate();
								var month		= currentDate.getMonth();
								var year 		= currentDate.getFullYear();
								var min			= currentDate.getMinutes();
								var hours		= currentDate.getHours();
								
								text_in_field = hours+":"+form_min(min)+" - "+months_set[month]+" / "+day+" / "+year;
							}
							else{
								//Get current
								var currentDate = new Date();
								
								var day			= currentDate.getDate();
								var month		= currentDate.getMonth();
								var year 		= currentDate.getFullYear();
								var min			= currentDate.getMinutes();
								var hours		= currentDate.getHours();
								
								if (settings.default_value == 'now'){
									var vl_to_field = currentDate.getTime();
									text_in_field = hours+":"+form_min(min)+" - "+months_set[month]+" / "+day+" / "+year;
								}
								else{
									var vl_to_field = null;
									text_in_field = "UNSET";
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
								height				: '100%'
							});

							var mother_of_view = Ti.UI.createView({
								height				: heightValue,
								top					: top 
							});
							top += heightValue;	

							mother_of_view.add(content[count]);
							
							var clear = Ti.UI.createImageView({
							  image:'/images/cancel.png',
							  right: '4%',
							  height: '35dp',
							  width: '35dp',
							  is_clear: true,
							  its_parent: content[count]
							});
							
							content[count].clear = clear;
							mother_of_view.add(content[count].clear); 							
							content[count].clear.addEventListener('click', function(e){
								e.source.its_parent.text = "UNSET";
								e.source.its_parent.value = null;
							});

							content[count].addEventListener('click', function(e){
									display_widget(e.source);
							});
							
							//viewContent.add(content[count]);
							viewContent.add(mother_of_view);
							count++;
						}
					} 
				break;
	
				//Shows the on and off button?
				case 'list_boolean':
				
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
		
					var reffer_index	= count;
					
					//Add fields:
					viewContent.add(label[count]);

					if (settings.cardinality > 1){

						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if (o_index < decoded_values.length){
								if ( (decoded_values[o_index] === true ) || (decoded_values[o_index] =="true") )
									var vl_to_field = true;
								else
									var vl_to_field = false;
							}
							else{
								var vl_to_field = false;
							}
						
							content[count] = Titanium.UI.createSwitch({
								top					: top,
								private_index		: o_index,
								height				: getScreenHeight()*0.1,
								titleOff			: "No",
								titleOn				: "Yes",
								value				: vl_to_field, 
								field_type			: field_arr[index_label][index_size].type,
								field_name			: field_arr[index_label][index_size].field_name,
								enabled				: true,
								required			: field_arr[index_label][index_size].required,
								is_title			: field_arr[index_label][index_size].is_title,
								composed_obj		: true,
								cardinality			: settings.cardinality,
								reffer_index		: reffer_index
							}); 
							top += getScreenHeight()*0.1;
							
							content[count].addEventListener('change',function(e){
								Ti.API.info('Basic Switch value = ' + e.value);
							});
	
							viewContent.add(content[count]);
							count++;
						}
					}
					else{

						if ( (field_arr[index_label][index_size].actual_value === true ) || ( field_arr[index_label][index_size].actual_value == "true") )
							var vl_to_field = true;
						else
							var vl_to_field = false;

						content[count] = Titanium.UI.createSwitch({
							top					: top,
							height				: getScreenHeight()*0.1,
							titleOff			: "No",
							titleOn				: "Yes",
							value				: vl_to_field, 
							field_type			: field_arr[index_label][index_size].type,
							field_name			: field_arr[index_label][index_size].field_name,
							enabled				: true,
							required			: field_arr[index_label][index_size].required,
							is_title			: field_arr[index_label][index_size].is_title,
							composed_obj		: false,
							cardinality			: settings.cardinality,
							reffer_index		: reffer_index
						}); 
						top += getScreenHeight()*0.1;
						
						content[count].addEventListener('change',function(e){
							Ti.API.info('Basic Switch value = ' + e.value);
						});

						viewContent.add(content[count]);
						count++;
					}
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
					var reffer_index	= count;
					
					var widget = JSON.parse(field_arr[index_label][index_size].widget);
					var settings = JSON.parse(field_arr[index_label][index_size].settings); 
					
					Ti.API.info('SETTINGS FOR DATESTAMP: '+settings.default_value);
					Ti.API.info('WIDGET FOR DATESTAMP: '+widget.settings['time']);
					
					// call function display_widget
					var currentDate = new Date();
					var min			= currentDate.getMinutes();
					var hours		= currentDate.getHours();
					var day 		= currentDate.getDate();
					var month 		= currentDate.getMonth();
					var year 		= currentDate.getFullYear();
	
					//Add fields:
					viewContent.add(label[count]);

					if (settings.cardinality > 1){

						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
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
								height				: '100%'
							});

							var mother_of_view = Ti.UI.createView({
								height				: heightValue,
								top					: top 
							});
							top += heightValue;	

							mother_of_view.add(content[count]);
							
							var clear = Ti.UI.createImageView({
							  image:'/images/cancel.png',
							  right: '4%',
							  height: '35dp',
							  width: '35dp',
							  is_clear: true,
							  its_parent: content[count]
							});
							
							content[count].clear = clear;
							mother_of_view.add(content[count].clear); 							
							content[count].clear.addEventListener('click', function(e){
								e.source.its_parent.text = "UNSET";
								e.source.its_parent.value = null;
							});

							content[count].addEventListener('click', function(e){
								display_omadi_time(e.source);
							});

							//viewContent.add(content[count]);
							viewContent.add(mother_of_view);
							count++;
						}
					}
					else{
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
							height				: '100%'
						});

						var mother_of_view = Ti.UI.createView({
							height				: heightValue,
							top					: top 
						});
						top += heightValue;	

						mother_of_view.add(content[count]);
						
						var clear = Ti.UI.createImageView({
						  image:'/images/cancel.png',
						  right: '4%',
						  height: '35dp',
						  width: '35dp',
						  is_clear: true,
						  its_parent: content[count]
						});
						
						content[count].clear = clear;
						mother_of_view.add(content[count].clear); 							
						content[count].clear.addEventListener('click', function(e){
							e.source.its_parent.text = "UNSET";
							e.source.its_parent.value = null;
						});

						content[count].addEventListener('click', function(e){
							display_omadi_time(e.source);
						});

						//viewContent.add(content[count]);
						viewContent.add(mother_of_view);
						count++;
					}
				break;

				case 'vehicle_fields':
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
					
					var reffer_index	= count;
					var settings 	= JSON.parse(field_arr[index_label][index_size].settings); 
					var fi_name		= field_arr[index_label][index_size].field_name;
					
					fi_name = fi_name.split('___');
					if (fi_name[1]){
						var i_name = fi_name[1];
					}
					else{
						var i_name = fi_name[0];
					}
					
					i_name = i_name.charAt(0).toUpperCase() + i_name.slice(1);

					//Add fields:
					viewContent.add(label[count]);

					if (settings.cardinality > 1){
						if ( (field_arr[index_label][index_size].actual_value) && (field_arr[index_label][index_size].actual_value.toString().indexOf('7411317618171051') != -1) ){
							var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win.nid+' AND field_name = \''+field_arr[index_label][index_size].field_name+'\'');
							
							//Decode the stored array:
							var decoded = array_cont.fieldByName('encoded_array');
							decoded = Titanium.Utils.base64decode(decoded);
							Ti.API.info('Decoded array is equals to: '+decoded);
							
							decoded = decoded.toString();
							
							// Token that splits each element contained into the array: 'j8Oá2s)E'
							var decoded_values = decoded.split("j8Oá2s)E");
						}
						else{
							var decoded_values = new Array();
							decoded_values[0] = field_arr[index_label][index_size].actual_value;
						}
						
						for (var o_index = 0 ; o_index < settings.cardinality ; o_index++){
							
							if ((o_index < decoded_values.length) && ( (decoded_values[o_index] != "") && (decoded_values[o_index] != " ") ) ){
								var vl_to_field = decoded_values[o_index];
							}
							else{
								var vl_to_field = "";
							}
							
							content[count] = Ti.UI.createTextField({
								hintText		: "#"+o_index+" "+i_name,
								private_index	: o_index,
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
								field_name		: field_arr[index_label][index_size].field_name,
								required		: field_arr[index_label][index_size].required,
								is_title		: field_arr[index_label][index_size].is_title,
								composed_obj	: true,
								cardinality		: settings.cardinality,
								value			: vl_to_field,
								reffer_index	: reffer_index
							});
							top += heightValue;
		
							viewContent.add(content[count]);
							count++;
						}
					}
					else{
						content[count] = Ti.UI.createTextField({
							hintText		: i_name,
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
							field_name		: field_arr[index_label][index_size].field_name,
							required		: field_arr[index_label][index_size].required,
							is_title		: field_arr[index_label][index_size].is_title,
							composed_obj	: false,
							cardinality		: settings.cardinality,
							value			: field_arr[index_label][index_size].actual_value,
							reffer_index	: reffer_index
						});
						top += heightValue;
						
						viewContent.add(content[count]);
						count++;
					}
				break;
				
				case 'region_separator_mode':
					if (field_arr[index_label][index_size].region_show === true){
						if (top == 0){
							var regionTop = 0;
						}
						else{
							var regionTop = top+10;
						}
						label[count] = Ti.UI.createLabel({
							text			: field_arr[index_label][index_size].label+' :',
							color			: '#000000',
							font 			: {
												fontSize: 18, fontWeight: 'bold'
							},
							textAlign		: 'center',
							width			: '100%',
							touchEnabled	: false,
							height			: 40,
							top				: regionTop,
							backgroundColor	: '#FFFFFF'
						});
						top += 40;
						
						viewContent.add(label[count]);
						count++;
					}
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

	if (Ti.Platform.name == 'android') {
		var activity = win.activity;
		activity.onCreateOptionsMenu = function(e){
			//======================================
			// MENU - UI
			//======================================
	
			var menu = e.menu; 
			var menu_first = menu.add({ 			
		  		title: 'Cancel',
				order: 0
			});
			menu_first.setIcon("/images/cancel.png");
			
			var menu_second = menu.add({ 			
		  		title: 'Save',
				order: 1
			});
			menu_second.setIcon("/images/save.png");
	   
			//======================================
			// MENU - EVENTS
			//======================================
			
			menu_first.addEventListener("click", function(e) {	
				if (mode == 0){
					Ti.UI.createNotification({
						message : win.title+' creation was cancelled !'
					}).show();
				}
				else{
					Ti.UI.createNotification({
						message : win.title+' update was cancelled !'
					}).show();
				}
				
				win.close();

			});
			
			//======================================
			// MENU - EVENTS
			//======================================
			
			menu_second.addEventListener("click", function(e) {
					
				var string_text = "";
				var count_fields = 0;
				
				for (var x in content){
					try{
						Ti.API.info(label[x].text+' is required: '+content[x].required+' = '+content[x].value);
					}
					catch(e){
						
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
				if (count_fields > 0){
					if (count_fields == 1){
						if (mode == 0 ){
							a.message = 'The field "'+string_text+'" is empty, please fill it out in order to save this node';
						}
						else{
							a.message = 'The field "'+string_text+'" is empty, please fill it out in order to update this node';
						}
					}
					else{
						a.message = 'The following fields are required and are empty:\n'+string_text;
					}
					a.show();
				}
				else{
					var mode_msg = '';
					if (mode == 0 ){
						mode_msg = 'Saving node';
					}
					else{
						mode_msg = 'Updating node';
					}
					
					showIndicator(mode_msg);
					var db_put = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );			

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
					
					if ( mode == 0){
						//Get smallest nid
						var nid = db_put.execute("SELECT nid FROM node ORDER BY nid ASC ");
						
						if ( nid.fieldByName('nid') >= 0){
							var new_nid = -1;
						}
						else{
							var new_nid = nid.fieldByName('nid')-1;
						}
					}
					
					var query = "INSERT OR REPLACE INTO "+win.type+" ( 'nid', ";


					var _array_value	= new Array();
					for (var x_j in content){ 
						if((content[x_j].composed_obj === true) && (content[x_j].cardinality > 1)){
							
							if( (content[x_j].field_type == 'omadi_time') || (content[x_j].field_type == 'datestamp') ){
								if (content[x_j].value != null)
									var _vlr = Math.round(content[x_j].value/1000);
								else
									var _vlr = null;
							}
							else if( (content[x_j].field_type == 'number_integer') || (content[x_j].field_type == 'number_decimal') ){
								if ((content[x_j].value == null) || (content[x_j].value == "") || (content[x_j].value == " ")){
									var _vlr = null;
								}
								else{
									var _vlr = content[x_j].value;
								}
							} 
							else{
								var _vlr = content[x_j].value;
							}
							
							if (_array_value[content[x_j].field_name]){
								_array_value[content[x_j].field_name].push(_vlr);
								continue;
							}
							else{
								_array_value[content[x_j].field_name] = new Array ();
								_array_value[content[x_j].field_name].push(_vlr);
								continue;
							}
						}
					}
					
					//field names
					for (var j_y = 0; j_y < content.length ; j_y++){
						Ti.API.info('INDEX: '+j_y);
						
						//Is different of a region
						if(!content[j_y]){
							continue;
						}

						//Point the last field
						if(content[j_y+1]){
							while (content[j_y].field_name == content[j_y+1].field_name){
								j_y++;
								if (content[j_y+1]){
									//Go on
								}
								else{
									//Finish, we found the point
									break;
								}
							}
						}
						
						if (j_y == content.length-1){
							query += "'"+content[j_y].field_name+"' ) ";
						}
						else{
							query += "'"+content[j_y].field_name+"', ";
						}
					}
					
					if (mode == 1){
						query += ' VALUES ( '+win.nid+', ';
					}
					else{
						query += ' VALUES ( '+new_nid+', ';
					}

					//Values
					var title_to_node = "";
					
					for (var j = 0; j <= content.length ; j++){
						if (!content[j]){
							continue;
						}

						if(content[j].is_title === true){
							if (title_to_node.charAt(0) == ""){
								if (content[j].cardinality == -1){
									var tit_aux = content[j].value;
									title_to_node = tit_aux[0].title;
								}
								else{
									title_to_node = content[j].value;
								}
							}
							else{
								if (content[j].cardinality == -1){
									var tit_aux = content[j].value;
									title_to_node+= " - "+tit_aux[0].title;
								}
								else{
									title_to_node+= " - "+content[j].value;
								}
							}
						}
						Ti.API.info('Title: '+title_to_node);
						Ti.API.info(content[j].field_type+' is the field');
						
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
						
						//If it is a composed field, just insert the number
						//Build cardinality for fields

						if ((content[j].composed_obj === true) && (content[j].cardinality > 1)){
							//Point the last field							
							if(content[j+1]){
								while (content[j].field_name == content[j+1].field_name){
									j++;
									if (content[j+1]){
										//Go on
									}
									else{
										//Finish, we found the point
										break;
									}
								}
							}
							
							//Treat the array
							content_s = treatArray(_array_value[content[j].field_name], 6);
							Ti.API.info('About to insert '+_array_value[content[j].field_name]);
							// table structure:
							// incremental, node_id, field_name, value
							var db_jub = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
							
							if (mode == 0) {
								Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+new_nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');								
								db_jub.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+new_nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');								
							}
							else{
								Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+win.nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');
								db_jub.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+win.nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');
							}
							
							db_jub.close();
							
							// Code must to be a number since this database field accepts only integers numbers
							// Token to indentify array of numbers is 7411317618171051229 
							value_to_insert = 7411317618171051229;
						}
						else if ((content[j].field_type ==  'number_decimal') || (content[j].field_type ==  'number_integer')){
							if ((content[j].value == '')|| (content[j].value == null)){
								value_to_insert = 'null';
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
								mark			= '\'';
							}
							else{
								value_to_insert = content[j].getSelectedRow(0).uid;
								mark = '';
							}
						}
						else if (content[j].field_type ==  'taxonomy_term_reference'){ 
							if (content[j].widget == 'options_select'){
								if (content[j].cardinality != -1){
									if (content[j].getSelectedRow(0).tid == null){
										value_to_insert = ''
										mark			= '\'';
									}
									else{
										value_to_insert = content[j].getSelectedRow(0).tid;
										mark = '';
									}
								}
								else{
									
									var vital_info = [];
									
									if (content[j].value == null){
										vital_info.push("null");
									}
									else{
										for (var v_info_tax in content[j].value ){
											vital_info.push(content[j].value[v_info_tax].v_info.toString());
										}
									}
									
									//Treat the array
									content_s = treatArray(vital_info, 6);
									Ti.API.info('About to insert '+content[j].field_name);
									// table structure:
									// incremental, node_id, field_name, value
									var db_jub = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
									
									if (mode == 0) {
										Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+new_nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');								
										db_jub.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+new_nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');								
									}
									else{
										Ti.API.info('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+win.nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');
										db_jub.execute('INSERT OR REPLACE INTO array_base ( node_id, field_name, encoded_array ) VALUES ( '+win.nid+', \''+content[j].field_name+'\',  \''+content_s+'\' )');
									}
									
									db_jub.close();
									
									// Code must to be a number since this database field accepts only integers numbers
									// Token to indentify array of numbers is 7411317618171051229 
									value_to_insert = 7411317618171051229;
									mark = '';
								}
							}
							else if( content[j].widget == 'taxonomy_autocomplete' ){
								if ((content[j].tid == null) && (content[j].value == "")){
									value_to_insert = '';
									mark			= '\'';
								}
								else if ( (mode == 0) && (content[j].tid == null) && (content[j].value != "")){
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
								mark			= '\'';
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
						else if( (content[j].field_type == 'omadi_time') || (content[j].field_type == 'datestamp') ){
							if (content[j].update_it === true ){
								value_to_insert = Math.round(content[j].value/1000);
							}
							else{
								mark = "'";
								value_to_insert = '';
							}
						}
						else{
							value_to_insert = content[j].value;
						}
						
						if (value_to_insert == ''){
							mark			= '\'';
						}
						
						if (j == content.length-1){
							query += mark+""+value_to_insert+""+mark+" )";
						}
						else{
							query += mark+""+value_to_insert+""+mark+", ";
						}
						Ti.API.info(content[j].field_type+' has value to insert '+value_to_insert);
					}
					
					var has_bug = false;
					try{
						//Insert into node table
						var _now = Math.round(+new Date()/1000);
						
						if (mode == 1){
							Ti.API.info('UPDATE node SET changed="'+_now+'", title="'+title_to_node+'" , flag_is_updated=1, table_name="'+win.type+'" WHERE nid='+win.nid);
							db_put.execute('UPDATE node SET changed="'+_now+'", title="'+title_to_node+'" , flag_is_updated=1, table_name="'+win.type+'" WHERE nid='+win.nid);
						}
						else{
							Ti.API.info('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name ) VALUES ('+new_nid+', '+_now+', 0, "'+title_to_node+'" , '+win.uid+', 1 , "'+win.type+'")');
							db_put.execute('INSERT INTO node (nid , created , changed , title , author_uid , flag_is_updated, table_name ) VALUES ('+new_nid+', '+_now+', 0, "'+title_to_node+'" , '+win.uid+', 1 , "'+win.type+'")');
						}
						
						//Insert into table
						Ti.API.info(query);
						db_put.execute(query);
						db_put.close();
						has_bug = false;
					}
					catch(e){ 
						if (mode == 1){
							hideIndicator();
							Ti.UI.createNotification({
								message : 'An error has occurred when we tried to update this new node, please try again'
							}).show();
						}
						else{
							hideIndicator();
							Ti.UI.createNotification({
								message : 'An error has occurred when we tried to create this new node, please try again'
							}).show();
						}
						has_bug = true;
					}
					
					Ti.API.info('========= Updating new info running ========= ');
					if  ((Titanium.Network.online) && (has_bug === false)) {
						win.up_node(mode, close_me);
					}
					else if (!(Titanium.Network.online)){
						if (mode == 1){
							hideIndicator();
							Ti.UI.createNotification({
								message : win.title+' has been successfully updated, but you are now offline, node will be only local until you have a valid internet connection !'
							}).show();
						}
						else{
							hideIndicator();
							Ti.UI.createNotification({
								message : win.title+' has been successfully created, but you are now offline, node will be only local until you have a valid internet connection !'
							}).show();
						}
						win.close();
					}
					else if (has_bug === true){
						win.close();
					}
						
					
				}
			});
		};
	}
	
	win.addEventListener('android:back', function() {
		if (mode == 1){
			Ti.UI.createNotification({
				message : win.title+' update was cancelled !',
				duration: Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		}
		else{
			Ti.UI.createNotification({
				message : win.title+' creation was cancelled !',
				duration: Ti.UI.NOTIFICATION_DURATION_LONG
			}).show();
		}
		win.close();
	});
} , 1000);

