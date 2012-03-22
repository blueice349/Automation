/** 
 * Name: individual_object.js
 * Function: 
 * 		Show object's informations retrieved from the database
 * Provides:
 * 		the window called by object.js
 *		a way to close the current window and open object.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the object's information.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win4 = Ti.UI.currentWindow;

//Sets only portrait mode
win4.orientationModes = [ Titanium.UI.PORTRAIT ];

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});


var db_display = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var results  = db_display.execute('SELECT * FROM '+win4.type+' WHERE  nid = '+win4.nid);

//The view where the results are presented
var resultView = Ti.UI.createView({
	top: '5%',
	height: '85%',
	width: '90%',
	borderRadius: 5,
	backgroundColor: '#A9A9A9',
	opacity: 0.05
});
win4.add(resultView);


//Header where the selected name is presented
var header = Ti.UI.createView({
	top: '0',
	height: '20%',
	width: '100%',
	borderRadius: 5,
	backgroundColor: '#A9A9A9',
	opacity: 0.23,
	zIndex: 11
});
resultView.add(header);

//Label containing the selected name
var labelNameContent = Ti.UI.createLabel({
	text: win4.nameSelected,
	height: 'auto',
	width:  '90%',
	font: {fontSize: 18,  fontWeight: "bold"},
	textAlign: 'center',
	touchEnabled: false
});

header.add(labelNameContent);

var viewContent = Ti.UI.createScrollView({
    height:"auto",
    top: "19%",
    backgroundColor: '#111111',
	showHorizontalScrollIndicator: false,
	showVerticalScrollIndicator: true,
	opacity: 1,
	borderRadius: 7,
	scrollType: "vertical",
	zIndex: 10
});

resultView.add(viewContent);

var fields_result 	= db_display.execute('SELECT label, weight, type, field_name, widget, settings FROM fields WHERE bundle = "'+win4.type+'" ORDER BY weight ASC');
var regions			= db_display.execute('SELECT * FROM regions WHERE node_type = "'+win4.type+'" ORDER BY weight ASC');

//Populate array with field name and configs
var fields 			=   new Array();
var unsorted_res	=   new Array();
var c_index = 0;
var label = [];
var content = []; 
var border = [];
var cell = [];
var count = 0;
var heightValue = 60;
var bug = [];

while (fields_result.isValidRow()){
	unsorted_res.push({
				label:fields_result.fieldByName('label'),
				type:fields_result.fieldByName('type'), 
				field_name: fields_result.fieldByName('field_name'),
				settings: fields_result.fieldByName('settings'),
				widget: fields_result.fieldByName('widget')
	});
	c_index++;
	fields_result.next();	
}

while (regions.isValidRow()){

	fields[regions.fieldByName('region_name')] = new Array();

	//Display region title:
	fields[regions.fieldByName('region_name')]['label']		= regions.fieldByName('label');
	fields[regions.fieldByName('region_name')]['type']		= 'region_separator_mode'; 
	fields[regions.fieldByName('region_name')]['settings'] 	= regions.fieldByName('settings');
	
	Ti.API.info(' Region_name: '+regions.fieldByName('region_name'));
	Ti.API.info(' Weight: '+regions.fieldByName('weight'));

	//Organizing every field into regions:
	//while (fields_result.isValidRow()){
	for (var i in unsorted_res){
		
		var settings = JSON.parse(unsorted_res[i].settings);
		Ti.API.info('Field region = '+settings.region);
		if (regions.fieldByName('region_name') == settings.region ){
			Ti.API.info('Regions match! ');
			Ti.API.info('Field label: '+unsorted_res[i].label);
			Ti.API.info('Field type: '+unsorted_res[i].type);
			Ti.API.info('Field name: '+unsorted_res[i].field_name);
			Ti.API.info('Field settings: '+unsorted_res[i].settings);
			
			fields[unsorted_res[i].field_name] = new Array();
		
			//Display region title:
			fields[unsorted_res[i].field_name]['label']		= unsorted_res[i].label;
			fields[unsorted_res[i].field_name]['type']		= unsorted_res[i].type; 
			fields[unsorted_res[i].field_name]['settings'] 	= unsorted_res[i].settings;
			fields[unsorted_res[i].field_name]['widget'] 	= unsorted_res[i].widget;
		}
		else{
			Ti.API.info(' Regions dont match! ');
		}
	}
	regions.next();
}


if (c_index > 0){
	var c_type = [];
	var c_label = [];
	var c_content = [];
	var c_settings = [];
	var is_array = false;
	var show_region = new Array();
	
	for (var f_name_f in fields ){
		Ti.API.info(f_name_f+" => "+results.fieldByName(f_name_f)+" => "+fields[f_name_f]['type']);
		if ( (results.fieldByName(f_name_f) != null && results.fieldByName(f_name_f) != "") ||  (fields[f_name_f]['type'] == 'region_separator_mode')) {
		
			//fields from Fields table that match with current object
			c_type[count]   	= fields[f_name_f]['type'];
			c_label[count]		= fields[f_name_f]['label'];
			c_settings[count]	= fields[f_name_f]['settings'];
			
			//Content
			c_content[count] = results.fieldByName(f_name_f);
			
			var loop_times = 1;
			is_array = false;
			//Check if it is an array, token = 7411317618171051229
			if ((c_content[count] == 7411317618171051229) || (c_content[count] == '7411317618171051229')){
				var array_cont = db_display.execute('SELECT encoded_array FROM array_base WHERE node_id = '+win4.nid+' AND field_name = \''+f_name_f+'\' ');
				
				//Decode the stored array:
				var decoded = array_cont.fieldByName('encoded_array');
				decoded = Titanium.Utils.base64decode(decoded);
				Ti.API.info('Decoded array is equals to: '+decoded);
				
				decoded = decoded.toString();
				
				// Token that splits each element contained into the array: 'j8Oá2s)E'
				var decoded_values = decoded.split("j8Oá2s)E");
				
				loop_times = decoded_values.length;
				is_array = true;
				
				keep_type	= c_type[count];
				keep_label	= c_label[count];
				keep_sett	= c_settings[count];
				
				//Test echo	
				for (var tili in decoded_values){
					Ti.API.info(tili+' value is equals to: '+decoded_values[tili]);
				}

			}

			while ( loop_times >= 1 ){
				if (is_array){
					c_content[count] = decoded_values[loop_times - 1];
					c_type[count]		= keep_type;
					c_label[count]		= keep_label;
					c_settings[count]	= keep_sett;
					
					Ti.API.info('For type: '+c_type[count]+' is associated '+c_content[count]);
				}
				
				loop_times--;
				
				/* 
				 * So far the folowing cases are being treated:
				 * 
				 * case 'text':
				 * case 'text_long':
				 * case 'phone':
				 * case 'omadi_reference':
				 * case 'link_field':
				 * case 'email':
				 * case 'taxonomy_term_reference':
				 * case 'user_reference':
				 * case 'number_decimal':
				 * case 'number_integer':
				 * case 'datestamp':
				 * case 'list_boolean':
				 * case 'license_plate':
				 * 
				 */
				
				if ((c_settings[count] != null) && (c_settings[count] != 'null') && (c_settings[count] != undefined) && (c_settings[count] != 'undefined')&& (c_settings[count] != '')){
					Ti.API.info('Settings: '+c_settings[count]);
					var settings = JSON.parse(c_settings[count]); 
					if (show_region[settings.region]){
						show_region[settings.region] = true;
						Ti.API.info('Region added : '+settings.region);
					}
					else{
						show_region[settings.region] = new Array();
					}
				}
				
				switch(c_type[count]){
					//Treatment follows the same for text or text_long
					case 'text':
					case 'text_long':
						label[count]  = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%", 
							left: 5,
							textAlign: 'left',
							touchEnabled: false,
							field: true
						});
					
	
						var openDescWin = false;
						var aux_text_desc = c_content[count];
						
						if (c_content[count].length > 45){
							c_content[count] = c_content[count].substring(0,45);
							c_content[count] = c_content[count]+"...";
							openDescWin = true;
						}
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count,
							open: openDescWin,
							w_content:aux_text_desc
						});
	
						content[count].addEventListener('click', function(e){
							highlightMe(e.source.id);
							if (e.source.open)
							{
								openBigText(e.source.w_content);
							}
						});
						
						count++;
					break;
					
					
					//Phone
					case 'phone':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						 
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count,
							number: c_content[count].replace(/\D/g, '' )
						});
											
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id);
							Titanium.Platform.openURL('tel:'+e.source.number);
						});
					
						content[count].text = ""+c_content[count];
						count++;
					break;
					
					//Refers to some object:
					case 'omadi_reference':
						Ti.API.info("Contains: "+c_content[count]+" for nid "+win4.nid);
						Ti.API.info('SETTINGS: '+c_settings[count]);
						var json = JSON.parse(c_settings[count]);

						//Define available tables:
						var tables_array = new Array();
						for (var i in json.reference_types){
							tables_array.push(json.reference_types[i]);
						}
						
						var count_tables = 0;
						var tables_query = "";
						for (var i in tables_array){
							if (tables_array.length-1 == count_tables){
								tables_query+= tables_array[i];
							}
							else{
								tables_query+= tables_array[i]+", ";
							}
						}
						Ti.API.info('TABLES: '+tables_query);
						try{
							
							var auxA  = db_display.execute('SELECT * FROM '+tables_query+' WHERE nid='+c_content[count]);
							if (auxA.rowCount === 0 ){
								bug[bug.length] = c_content[count];
							}
							else{
								var auxRes  = db_display.execute('SELECT DISTINCT node.title FROM node INNER JOIN account ON node.nid='+c_content[count]);
								
								ref_name = auxRes.fieldByName("title");
								auxRes.close();
							
								label[count] = Ti.UI.createLabel({
									text: c_label[count],
									width:  "33%",
									textAlign: 'left',
									left: 5,
									touchEnabled: false,
									field: true
								});
								
								content[count] = Ti.UI.createLabel({
									text: ""+ref_name,
									width:  "60%",
									height: "100%",
									textAlign: 'left',
									left: "40%",
									id: count,
									nid: c_content[count]
								});
								
								// When account is clicked opens a modal window to show off the content of the specific touched
								// object.
								
								content[count].addEventListener('click', function(e){
									highlightMe( e.source.id );
									var newWin = Ti.UI.createWindow({
										fullscreen: true,
										title:'Account',
										url: "individual_object.js"
									});
									
									newWin.nameSelected  = e.source.text;
									newWin.type = "account";
									newWin.nid = e.source.nid;
									newWin.open();
								});
								
								count++;
							}
						}
						catch(e){
							bug[bug.length] = c_content[count];
						}
					break;
									
					//Must open browser if clicked
					case 'link_field':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "100%",
							height: "100%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
					
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							address: c_content[count].replace("http://",""),
							id: count
						});
										
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
							//website = website.replace("http://","");
							Ti.API.info('LINK PRESSED FOR URL '+e.source.address);
							Titanium.Platform.openURL('http://'+e.source.address);
						});
	
						count++;
					break;
									
					//Must open mail client if clicked - Not supported by Android yet
					case 'email':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count,
							email: c_content[count]
						});
	
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
							var emailDialog = Titanium.UI.createEmailDialog();
							emailDialog.subject = "Omadi CRM";
							emailDialog.toRecipients = e.source.email;
							emailDialog.open();
						});
						count++;
	
					break;
									
					//Link to taxonomy table:
					case 'taxonomy_term_reference':
						Ti.API.info('Contains: '+c_content[count]);
						var auxRes  = db_display.execute('SELECT * FROM term_data WHERE tid = '+c_content[count]);
						Ti.API.info('We got : '+ auxRes.rowCount +' lines');
						var ref_name = auxRes.fieldByName("name");
						auxRes.close();
					
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "30%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+ref_name,
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						}); 
	
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
	
					break;
									
					//Just prints the user_reference .. If references table user, link to it
					case 'user_reference':
						var auxRes  = db_display.execute('SELECT realname FROM user WHERE uid = '+c_content[count]);
						var ref_name = "";
						if (auxRes.isValidRow())
							ref_name = auxRes.fieldByName("realname");
						else
							ref_name = "Not defined";
						auxRes.close();
						
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+ref_name,
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							Ti.API.info("X = "+e.source.id);
							highlightMe( e.source.id );
						});
						
						count++;
	
					break;
									
					//Formats as decimal
					case 'number_decimal':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
	
					break;
									
					//Formats as integer
					case 'number_integer':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					break;
									
					//Shows up date (check how it is exhibited):
					case 'datestamp':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+timeConverter(c_content[count]),
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					break;
									
					//Shows the on and off button?
					case 'list_boolean':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					
					break;
					//Prints out content
	
					case 'license_plate':
						label[count] = Ti.UI.createLabel({
							text: c_label[count],
							width:  "33%",
							textAlign: 'left',
							left: 5,
							touchEnabled: false,
							field: true
						});
						
						content[count] = Ti.UI.createLabel({
							text: ""+c_content[count],
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count
						});
						
						content[count].addEventListener('click', function(e){
							highlightMe( e.source.id );
						});
						count++;
					break;
					
					case 'region_separator_mode':
						 
						label[count] = Ti.UI.createLabel({
							text			: c_label[count],
							color			: '#FFFFFF',
							font 			: {
												fontSize: 18, fontWeight: 'bold'
							},
							textAlign		: 'center',
							width			: '100%',
							touchEnabled	: false,
							height			: '100%',
							is_region		: true,
							ref				: f_name_f,
							field			: false
						});
						count++;
					break;
				}
			}
		}
	}

	if (bug.length === 0){
		Ti.API.info("Items (count): "+ count);
		var index_fields = 0
		for (var i = 0; i < count ; i++){
			//Normal fields
			if ((label[i].is_region !== true) && (label[i].field === true)){
				
				cell[i] = Ti.UI.createView({
					height: heightValue,
					top : (heightValue+2)*index_fields,
					width: '100%'
				});

				label[i].color = "#999999";
				content[i].color = "#FFFFFF";
				
				cell[i].add(label[i]);
				cell[i].add(content[i]);
				
				viewContent.add(cell[i]);
			
				border[i] = Ti.UI.createView({
					backgroundColor:"#F16A0B",
					height:2,
					top: ((heightValue+2)*(index_fields+1))-2
				});
				viewContent.add(border[i]);
				index_fields++;
			}
			//Regions
			else{
				var cnd = 0;
				for (var j in show_region){
					if (j == label[i].ref){
						cnd++;
						
						cell[i] = Ti.UI.createView({
							height: heightValue,
							top : (heightValue+2)*index_fields,
							width: '100%'
						});

						cell[i].add(label[i]);
						viewContent.add(cell[i]);
						
						border[i] = Ti.UI.createView({
							backgroundColor:"#F16A0B",
							height:2,
							top: ((heightValue+2)*(index_fields+1))-2
						});
						viewContent.add(border[i]);
						Ti.API.info('Added region: '+label[i].ref);
						index_fields++;
					}
				}
				if (cnd == 0){
						Ti.API.info('No content for region: '+label[i].ref)
				}
			}
		}
	}
	else{
			var cell = Ti.UI.createLabel({
				height: 'auto',
				top : '30%',
				textAlign: 'center',
				width: '80%',
				text: 'Well, this is embarrassing but it seems that you\'ve found a bug, please submit it to us, here are some things you should inform:\n    NID = '+win4.nid+'\n   	Omadi_reference = '+bug[0]+' \nWe will fix it as soon as possible'
			});
			
			viewContent.add(cell);
	}
}
	
//Highlitghts clicked row
function highlightMe(data) {
	Ti.API.info("DATA => "+data);
	cell[data].backgroundColor = "#F16A0B";
	setTimeout(function(){
		cell[data].backgroundColor = '#111111'; 
	}, 100);
};


results.close();
fields_result.close();
db_display.close();

bottomBack(win4);