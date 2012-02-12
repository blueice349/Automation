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

var fields_result = db_display.execute('SELECT label, weight, type, field_name, settings FROM fields WHERE bundle = "'+win4.type+'" ORDER BY weight ASC');

//Populate array with field name and configs
var fields = new Array();
var c_index = 0;
var label = [];
var content = []; 
var border = [];
var cell = [];
var count = 0;
var heightValue = 60;
var bug = [];


while (fields_result.isValidRow()){
	
	fields[fields_result.fieldByName('field_name')] = new Array(); 
	fields[fields_result.fieldByName('field_name')]['label']  = fields_result.fieldByName('label');
	fields[fields_result.fieldByName('field_name')]['type']  = fields_result.fieldByName('type');
	
	c_index++;
	fields_result.next();
}

if (c_index > 0){
	var c_type = [];
	var c_label = [];
	var c_content = [];
	var c_settings = [];
	
	for (var f_name_f in fields ){
		Ti.API.info(f_name_f+" => "+results.fieldByName(f_name_f)+" => "+fields[f_name_f]['type']);
		if ((results.fieldByName(f_name_f) != null) && (results.fieldByName(f_name_f) != "")){
		
			//fields from Fields table that match with current object
			c_type[count]   	= fields[f_name_f]['type'];
			c_label[count]		= fields[f_name_f]['label'];
			c_settings[count]	= fields[f_name_f]['settings'];
			
			
			//Content
			c_content[count] = results.fieldByName(f_name_f);
			
			switch(c_type[count]){
				
				//Treatment follows the same for text or text_long
				case 'text':
				case 'text_long':
					label[count]  = Ti.UI.createLabel({
						text: c_label[count],
						width:  "33%", 
						left: 5,
						textAlign: 'left',
						touchEnabled: false
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
						touchEnabled: false
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
					try{
						
						var auxA  = db_display.execute('SELECT * FROM account WHERE nid='+c_content[count]);
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
								touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
						touchEnabled: false
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
			}
		}
	}

	if (bug.length === 0){
		Ti.API.info("Items (count): "+ count);
		for (var i = 0; i < count ; i++){
		
			cell[i] = Ti.UI.createView({
				height: heightValue,
				top : (heightValue+2)*i,
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
				top: ((heightValue+2)*(i+1))-2
			});
			viewContent.add(border[i]);
		
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