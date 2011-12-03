/**
 * Name: individual_lead.js
 * Function: 
 * 		Show lead's informations retrieved from the database
 * Provides:
 * 		the window called by lead.js
 *		a way to close the current window and open lead.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the lead's information.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win4 = Ti.UI.currentWindow;

//Sets only portrait mode
win4.orientationModes = [ Titanium.UI.PORTRAIT ];

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	title:'Leads',
	url:'leads.js',
	notOpen: true
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var results  = db.execute('SELECT * FROM lead WHERE  nid = '+win4.nid);

// showToolbar(name, actualWindow)
//showToolbar( win4.name, win4);
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
	font: {fontSize: 18 , fontWeight: "bold"},
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
	zIndex: 10
});

resultView.add(viewContent);


var mailResult = results.fieldByName("email");
Ti.API.info("Phone: "+results.fieldByName("phone"));
Ti.API.info("Cell Phone: "+results.fieldByName("cell_phone"));
Ti.API.info("Fax : "+results.fieldByName("fax"));


var label = [];
var content = []; 
var border = [];
var cell = [];
var count = 0;
var heightValue = 38;
var fresh = "";


if (results.fieldByName("job_title_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("job_title_tid"));
	var fresh = auxRes.fieldByName("name");
	
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Job title: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var label1 = Ti.UI.createLabel({
		text: ""+fresh,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux1 = count;
	label1.addEventListener('click', function(){
		highlightMe(aux1);
	});


	content[count] = label1;
	count++;
}


var fresh1 = "";

if (results.fieldByName("lead_status_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_status_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Lead status: ",
		width:  "30%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	label2 = Ti.UI.createLabel({
		text: ""+fresh1,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
		
	var aux2 = count;
	label2.addEventListener('click', function(){
		highlightMe( aux2);
	});

	content[count] = label2;
		
	Ti.API.info("Lead Status: "+ count);	 
	count++;

}



var fresh2 = "";

if (results.fieldByName("lead_source_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("lead_source_tid"));
	var fresh2 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Lead source: ",
		width:  "30%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	label3 = Ti.UI.createLabel({
		text: ""+fresh2,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux3 = count;
	label3.addEventListener('click', function(){
		highlightMe( aux3);
	});

	content[count] = label3;
	count++;
}


var fresh3 = "";

if (results.fieldByName("competing_company_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("competing_company_tid"));
	var fresh3 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Competing company: ",
		width:  "30%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var label4 = Ti.UI.createLabel({
		text: ""+fresh3,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});


	var aux4 = count;
	label4.addEventListener('click', function(){
		highlightMe( aux4);
	});

	content[count] = label4;
	count++;
}


var company = results.fieldByName("company");
	
if (company != null){
	label[count] = Ti.UI.createLabel({
		text: "Company: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	label5 = Ti.UI.createLabel({
		text: ""+company,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux5 = count;
	label5.addEventListener('click', function(){
		highlightMe( aux5);
	});

	content[count] = label5;

	
	Ti.API.info("Company : "+ count);
	count++;
	
}


var phone = results.fieldByName("phone");

if (phone != null)
{

	label[count] = Ti.UI.createLabel({
		text: "Phone: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l10l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});


	var aux6 = count;
	//When number is clicked, make the call
	var auxNumPhone = phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumPhone);
	
	l10l.addEventListener('click', function(){
		highlightMe( aux6);
		Titanium.Platform.openURL('tel:'+auxNumPhone);
	});
	
	l10l.text = ""+phone;
	
	Ti.API.info("Phone : "+ count);

	content[count] = l10l;
	count++;
	
}	

var cell_phone = results.fieldByName("cell_phone");

if (cell_phone != null ){

	label[count] = Ti.UI.createLabel({
		text: "Cell phone: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l11l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux7 = count;

	//When number is clicked, make the call
	var auxNumCell = cell_phone.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumCell);
	
	l11l.addEventListener('click', function(){
		highlightMe( aux7);
		Titanium.Platform.openURL('tel:'+auxNumCell);
	});
	
	l11l.text = ""+cell_phone;

	Ti.API.info("Cell phone: "+ count);
	content[count] = l11l;
	count++;

}	

var fax = results.fieldByName("fax");

if ( fax != null){
	label[count] = Ti.UI.createLabel({
		text: "Fax: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l12l = Ti.UI.createLabel({
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux8 = count;

	//When number is clicked, make the call
	var auxNumFax = fax.replace(/\D/g, '' );
	Ti.API.info("Raw phone number: "+ auxNumFax);
	
	l12l.addEventListener('click', function(){
		highlightMe( aux8);
		Titanium.Platform.openURL('tel:'+auxNumFax);
	});

	l12l.text = ""+fax;
	
	Ti.API.info("Fax: "+ count);

	content[count] = l12l;
	count++;
}

var email = results.fieldByName("email");

if ( email != null){
	label[count] = Ti.UI.createLabel({
		text: "Email: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var index = email.indexOf(".");
		
	label6 = Ti.UI.createLabel({
		text: email, 
		width:  "100%",
		textAlign: 'left',
		left: "33%"
	});

	var aux9 = count;
	label6.addEventListener('click', function(){
		highlightMe( aux9);
	});

	content[count] = label6;

	
	Ti.API.info("Email: "+ count);

	count++;
}

var website = results.fieldByName("website");

if ( website != null){
	label[count] = Ti.UI.createLabel({
		text: "Website: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
			
	label7 = Ti.UI.createLabel({
		text: ""+website,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	website = website.replace("http://","");

	var aux10 = count;

	label7.addEventListener('click', function(){
		highlightMe( aux10);
		website = website.replace("http://","");
		Titanium.Platform.openURL("http://"+website);
	});

	content[count] = label7;
	count++;
}

var description = results.fieldByName("description");

if ( description != null ){
	label[count]  = Ti.UI.createLabel({
		text: "Description: ",
		width:  "33%",
		left: 5,
		textAlign: 'left',
		touchEnabled: false
	});

	var descAux = description;
	var openDescWin = false;
	
	if (description.length > 50){
		description = description.substring(0,50);
		description = description+"...";
		openDescWin = true;
	}
	
	var labelDesc = Ti.UI.createLabel({
		text: ""+description,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var auxDesc = count;

	labelDesc.addEventListener('click', function(){
		highlightMe(auxDesc);
		
		if (openDescWin)
		{
			var descWin = Ti.UI.createWindow({
				modal: true,
				opacity: 0.99
			});
			
			//Header where the selected name is presented
			var descHeader = Ti.UI.createView({
				top: '0',
				height: '20%',
				width: '100%',
				borderRadius: 5,
				backgroundColor: '#A9A9A9',
				opacity: 0.5
			});
			descWin.add(descHeader);
			
			//Label containing the selected name
			var labelDescContent = Ti.UI.createLabel({
				text: "Description",
				height: 'auto',
				color: "#FFFFFF",
				width:  '90%',
				font: {fontSize: 18,  fontWeight: "bold"},
				textAlign: 'center',
				touchEnabled: false
			});
			
			descHeader.add(labelDescContent);
				
			var textDesc = Ti.UI.createTextArea({
				value: descAux,
				color: "blue",
				editable: false,
				top: "30%"
			});	
			
			descWin.add(textDesc);
			
			descWin.open();
			
			descWin.addEventListener('click', function(){
				descWin.close();
			});
		}
	});

	content[count] = labelDesc;	
	count++;
}

Ti.API.info("Items (count): "+ count);
for (var i = 0; i < count ; i++){

	cell[i] = Ti.UI.createView({
		height: heightValue,
		top : 40*i
	});
	label[i].color = "#999999";
	content[i].color = "#FFFFFF";
	
	cell[i].add(label[i]);
	cell[i].add(content[i]);

	viewContent.add(cell[i]);	
	
	border[i] = Ti.UI.createView({
		backgroundColor:"#F16A0B",
		height:2,
		top: (40*(i+1))-2
	});
	viewContent.add(border[i]);
}

function highlightMe(data) {
	cell[data].backgroundColor = "#F16A0B";
	setTimeout(function(){
		cell[data].backgroundColor = '#111111'; 
	}, 100);
};


results.close();

//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);