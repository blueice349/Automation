/** 
 * @author Joseandro
 */

//Common used functions
Ti.include('/lib/functions.js');

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
	height: '20%',
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

var fields_result = db_display.execute('SELECT label, weight, type, field_name, settings FROM fields WHERE bundle = "'+win.type+'" ORDER BY weight ASC');

//Populate array with field name and configs
var field_arr		=	new Array();
var label			=	new Array();
var content			=	new Array();
var border			=	new Array();
var values_query	=	new Array();
var count = 0;
var heightValue = 60;
var title = 0;

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
				field_name: fields_result.fieldByName('field_name') 
	};

	fields_result.next();
}
var top = 0;

//Go throught the whole array in order to format the fields on screen
for (var index_label in field_arr ){
	for (var index_size in field_arr[index_label]){
		Ti.API.info(index_size+'. Label : '+index_label+' we got content: '+field_arr[index_label][index_size].type+' ');
		switch(field_arr[index_label][index_size].type){
			
			//Treatment follows the same for text or text_long
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
					height			: 40,
					top				: top
				});
				top += 40;
				
				content[count] = Ti.UI.createTextField({
					hintText		: field_arr[index_label][index_size].label,
					borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					textAlign		: 'left',
					left			: '3%',
					right			: '3%',
					height			: 40,
					color			: '#000000',
					top				: top,
					type			: field_arr[index_label][index_size].type,
					field_name		: field_arr[index_label][index_size].field_name
				});
				top += 40;
				
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
					height			: 40,
					top				: top
				});
				top += 40;
				
				content[count] = Ti.UI.createTextField({
					hintText		: field_arr[index_label][index_size].label,
					borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					textAlign		: 'left',
					left			: '3%',
					right			: '3%',
					height			: 100,
					color			: '#000000',
					top				: top,
					type			: field_arr[index_label][index_size].type,
					field_name		: field_arr[index_label][index_size].field_name
				});
				top += 100;
				
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
					height			: 40,
					top				: top
				});
				top += 40;
				
				content[count] = Ti.UI.createTextField({
					hintText		: field_arr[index_label][index_size].label,
					borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					keyboardType	: Titanium.UI.KEYBOARD_NUMBER_PAD,
					textAlign		: 'left',
					left			: '3%',
					right			: '3%',
					height			: 40,
					color			: '#000000',
					top				: top,
					type			: field_arr[index_label][index_size].type,
					field_name		: field_arr[index_label][index_size].field_name
				});
				top += 40;
				
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
					height			: 40,
					top				: top
				});
				top += 40;
				
				content[count] = Ti.UI.createTextField({
					hintText		: field_arr[index_label][index_size].label,
					borderStyle		: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
					keyboardType	: Ti.UI.KEYBOARD_EMAIL,
					textAlign		: 'left',
					left			: '3%',
					right			: '3%',
					height			: 40,
					color			: '#000000',
					top				: top,
					type			: field_arr[index_label][index_size].type,
					field_name		: field_arr[index_label][index_size].field_name
				});
				top += 40;
				
				//Add fields:
				viewContent.add(label[count]);
				viewContent.add(content[count]);
				count++;
			break;

			
			/*	
			//Refers to some object:
			case 'omadi_reference':
				Ti.API.info("Contains: "+c_z_content[count]+" for nid "+win.nid);
				try{
					
					var auxA  = db_display.execute('SELECT * FROM account WHERE nid='+c_z_content[count]);
					if (auxA.rowCount === 0 ){
						bug[bug.length] = c_z_content[count];
					}
					else{
						var auxRes  = db_display.execute('SELECT DISTINCT node.title FROM node INNER JOIN account ON node.nid='+c_z_content[count]);
						
						ref_name = auxRes.fieldByName("title");
						auxRes.close();
					
						z_label[count] = Ti.UI.createLabel({
							text: c_label[count],
						});
						
						z_content[count] = Ti.UI.createLabel({
							text: ""+ref_name,
							width:  "60%",
							height: "100%",
							textAlign: 'left',
							left: "40%",
							id: count,
							nid: c_z_content[count]
						});
						
						// When account is clicked opens a modal window to show off the content of the specific touched
						// object.
						
						z_content[count].addEventListener('click', function(e){
							//highlightMe( e.source.id );
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
					bug[bug.length] = c_z_content[count];
				}
			break;
			*/
			
			
			/*				
			//Link to taxonomy table:
			case 'taxonomy_term_reference':
							
				var ref_name = "";
			
				z_label[count] = Ti.UI.createLabel({
					text: c_z_label[count],
				});
				
				z_content[count] = Ti.UI.createLabel({
					text: ""+ref_name,
					id: count
				}); 
	
				config_label(z_label[count]);
				config_content(z_content[count]);
	
				z_content[count].addEventListener('click', function(e){
					//highlightMe( e.source.id );
				});
				count++;
	
			break;
						
			//Just prints the user_reference .. If references table user, link to it
			case 'user_reference':
				
				var ref_name = "";
				
				z_label[count] = Ti.UI.createLabel({
					text: c_z_label[count],
				});
				
				z_content[count] = Ti.UI.createLabel({
					text: ""+ref_name,
					id: count
				});
				
				config_label(z_label[count]);
				config_content(z_content[count]);
								
				z_content[count].addEventListener('click', function(e){
					Ti.API.info("X = "+e.source.id);
					//highlightMe( e.source.id );
				});
				
				count++;
	
			break;

			//Shows up date (check how it is exhibited):
			case 'datestamp':
			
				z_label[count] = Ti.UI.createLabel({
					text: c_z_label[count],
				});
				
				z_content[count] = Ti.UI.createLabel({
					text: ""+timeConverter(c_z_content[count]),
					id: count
				});
	
				config_label(z_label[count]);
				config_content(z_content[count]);
				
				z_content[count].addEventListener('click', function(e){
					//highlightMe( e.source.id );
				});
				count++;
			break;
							
			//Shows the on and off button?
			case 'list_boolean':
							
				z_label[count] = Ti.UI.createLabel({
					text: c_z_label[count],
				});
				
				z_content[count] = Ti.UI.createLabel({
					text: ""+c_z_content[count],
					id: count
				});
	
				config_label(z_label[count]);
				config_content(z_content[count]);
				
				z_content[count].addEventListener('click', function(e){
					//highlightMe( e.source.id );
				});
				count++;
			
			break;
			//Prints out content
	
			case 'license_plate':
							
				z_label[count] = Ti.UI.createLabel({
					text: c_z_label[count],
				});
				
				z_content[count] = Ti.UI.createLabel({
					text: ""+c_z_content[count],
					id: count
				});
	
				config_label(z_label[count]);
				config_content(z_content[count]);
				
				z_content[count].addEventListener('click', function(e){
					//highlightMe( e.source.id );
				});
				count++;
			break;
		*/
		}
	}
}
fields_result.close();
db_display.close();

var a = Titanium.UI.createAlertDialog({
	title:'Omadi',
	font:{
				fontFamily: 'Lobster'
	},
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
	
				var query = "INSERT INTO "+win.type+" ( nid, ";
				
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
					Ti.API.info('=================================');
					if (content[j].value === null){
						mark = "";
					}
					Ti.API.info('Mark value: '+mark);
					Ti.API.info('Content value: '+content[j].value);
					Ti.API.info('=================================');
					if (j == content.length-1){
						query += mark+""+content[j].value+""+mark+" )";
					}
					else{
						query += mark+""+content[j].value+""+mark+", ";
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
								
					win.close();
				}
				catch(e){
					Ti.UI.createNotification({
						message : 'An error has occurred when we tried to create this new node, please try again'
					}).show();
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
	win.close();
});
