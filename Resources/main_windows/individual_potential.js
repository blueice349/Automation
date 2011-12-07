/**
 * Name: individual_potential.js
 * Function: 
 * 		Show potential's informations retrieved from the database
 * Provides:
 * 		the window called by potential.js
 *		a way to close the current window and open potential.js. This is achieved when the user clicks on
 * 			"back" on the phone or on the Back button at the app's bottom
 *		the potential's information.
 * @author Joseandro
 */

//Common used functions
Ti.include('../lib/functions.js');

//Current window's instance
var win4 = Ti.UI.currentWindow;

//Sets only portrait mode
win4.orientationModes = [ Titanium.UI.PORTRAIT ];

//
// create base UI root window
//
var logWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	url:'../app.js',
});

//Definition of the window before (opens when the user clicks on the back button)
var goToWindow = Titanium.UI.createWindow({  
	fullscreen: true,
	title:'Potentials',
	url:'potentials.js',
	notOpen: true
});

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win4.addEventListener('android:back', function() {
	Ti.API.info("Back to the step before");
	win4.close();
});
	
var db = Ti.Database.install('../database/db.sqlite', Titanium.App.Properties.getString("databaseVersion") );
var results  = db.execute('SELECT * FROM potential WHERE  nid = '+win4.nid);

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
	zIndex: 10
});

resultView.add(viewContent);

var label = [];
var content = []; 
var border = [];
var cell = [];
var count = 0;
var heightValue = 38;
var fresh = "";


Ti.API.info("Phone: "+results.fieldByName("phone"));
Ti.API.info("Fax : "+results.fieldByName("fax"));

var account_nid = results.fieldByName("account_nid");

if (account_nid != null){
	var auxRes  = db.execute('SELECT * FROM account WHERE  nid = '+account_nid);
	account_name = auxRes.fieldByName("name");
	auxRes.close();
	
	label[count] = Ti.UI.createLabel({
		text: "Account: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var l5l = Ti.UI.createLabel({
		text: ""+account_name,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});
	

	var aux1 = count;

	// When account is clicked opens a modal window to show off the content of the specific touched
	// object.
	
	l5l.addEventListener('click', function(){
		highlightMe(aux1);
		
		var newWin = Ti.UI.createWindow({
			fullscreen: true,
			title:'Account',
			url: "individual_account.js"
		});
		
		newWin.returnTo = "individual_potential.js";
		newWin.nid      = account_nid;
		newWin.nameSelected  = account_name;
		newWin.nidToReturn   = win4.nid;
		newWin.nameToReturn  = win4.nameSelected;
		
		newWin.open();
	});
	
	content[count] = l5l;
	count++;

}

var fresh = "";

if (results.fieldByName("potential_stage_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("potential_stage_tid"));
	var fresh = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Potential stage: ",
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
	
	var aux2 = count;
	label1.addEventListener('click', function(){
		highlightMe(aux2);
	});

	content[count] = label1;	

	count++;
}


var fresh1 = "";

if (results.fieldByName("competing_company_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("competing_company_tid"));
	var fresh1 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Competing Company: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var label2 = Ti.UI.createLabel({
		text: ""+fresh1,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux3 = count;
	label2.addEventListener('click', function(){
		highlightMe(aux3);
	});

	content[count] = label2;	
	
	count++;
}

var fresh2 = "";

if (results.fieldByName("potential_type_tid") != null){
	var auxRes  = db.execute('SELECT * FROM term_data WHERE  tid = '+results.fieldByName("potential_type_tid"));
	var fresh2 = auxRes.fieldByName("name");
	auxRes.close();

	label[count] = Ti.UI.createLabel({
		text: "Potential type: ",
		width:  "30%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});
	
	var label3 = Ti.UI.createLabel({
		text: ""+fresh2,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux4 = count;
	label3.addEventListener('click', function(){
		highlightMe(aux4);
	});

	content[count] = label3;	

	count++;
}

var closing_date = results.fieldByName("closing_date");

if ( closing_date != null){
	
	label[count] = Ti.UI.createLabel({
		text: "Closing date: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});	
		
	var label4 = Ti.UI.createLabel({
		text: ""+closing_date,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux5 = count;
	label4.addEventListener('click', function(){
		highlightMe(aux5);
	});

	content[count] = label4;	
	count++;
}


var next_step = results.fieldByName("next_step");

if ( next_step != null ){
	
	label[count] = Ti.UI.createLabel({
		text: "Next step: ",
		width:  "33%",
		textAlign: 'left',
		left: 5,
		touchEnabled: false
	});

	var nstep_aux = next_step;
	var openNWin = false;
	
	if (next_step.length > 42){
		next_step = next_step.substring(0,42);
		next_step = next_step+"...";
		openNWin = true;
	}
	
	var label5 = Ti.UI.createLabel({
		text: ""+next_step,
		width:  "67%",
		textAlign: 'left',
		left: "33%"
	});

	var aux6 = count;
	label5.addEventListener('click', function(){
		highlightMe(aux6);

		if (openNWin)
		{
			Ti.API.info("vim");
			openBigText(nstep_aux);
		}
		
	});

	content[count] = label5;	
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
	
	if (description.length > 45){
		description = description.substring(0,45);
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
			openBigText(descAux);
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
db.close();
//showBottom(actualWindow, goToWindow )
showBottom(win4, goToWindow);