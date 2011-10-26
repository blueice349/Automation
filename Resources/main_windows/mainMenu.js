/**
 * Name: mainMenu.js
 * Function: 
 * 		Show buttons where the user can select where he
 *		wants to go.
 * Provides:
 * 		First window the user sees when he logs in.
 *		Alert messages when user clicks on "back" on the phone.
 *		Menu with different buttons.
 *		Log out button.
 * @author Joseandro
 */

//Current window's instance
var win2 = Ti.UI.currentWindow;

//Common used functions
Ti.include('../lib/functions.js');

var version = 'Database is updated';

var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: 'Omadi Inc',
	height:'auto',
	width:'auto',
	textAlign:'center'
});

var db = Ti.Database.install('../database/db.sqlite', 'omadiDb416');
var dicElements = [];
var actualItem = 0;
var dicSize;

var runningUp = false;

function checkUpdate (){
	if (runningUp == false){
		runningUp = true;
		var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
		
		var objectsCheck = win2.log;
		//Timeout until error:
		objectsCheck.setTimeout(10000);
	
		Ti.API.info("Timestamp: "+ updatedTime.fieldByName('timestamp'));
		//Opens address to retrieve contact list
		objectsCheck.open('GET', win2.picked + '/js-sync/sync.json?timestamp=' + updatedTime.fieldByName('timestamp') );
		updatedTime.close();
	
		//Header parameters
		objectsCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version
			if ((json.vocabularies.length == 0) && (json.terms.length == 0) && (json.leads.length == 0) && (json.contacts.length == 0) && (json.accounts.length == 0) && (json.potentials.length == 0) ){
				label_status.text = version;
			}
			else
			{
				label_status.text = "Database needs sycronization!";
			}
			runningUp = false;
		}
		//Connection error:
		objectsCheck.onerror = function(e) {
			runningUp = false;
		}
	
		//Sending information and try to connect
		objectsCheck.send();
	}
	
};

var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
if (updatedTime.fieldByName('timestamp') == 0){
	checkUpdate();
}
updatedTime.close();


//Button Contacts
var bContacts = Titanium.UI.createButton({
   title: 'Contacts',
   width: '80%',
   height: '9%',
   top: '17%' 
});

//Button Leads
var bLeads = Titanium.UI.createButton({
   title: 'Leads',
   width: '80%',
   height: '9%',
   top: '37%' 
});

//Button Accounts
var bAccounts = Titanium.UI.createButton({
   title: 'Accounts',
   width: '80%',
   height: '9%',
   top: '57%' 
});

//Button Accounts
var bPotentials = Titanium.UI.createButton({
   title: 'Potentials',
   width: '80%',
   height: '9%',
   top: '77%' 
});

var bSync = Titanium.UI.createButton({
	width: '10%',
	height: '90%',
	top: '10%',
	image: Titanium.Android.R.drawable.emo_im_wtf,
	left: '90%'
});

//Parses result from user's login 
var jsonLogin = JSON.parse(win2.result) ;

//Retrieves username
var name = jsonLogin.user.name;

// showToolbar(name, actualWindow)					
showToolbar( name, win2 );

//Go to contact.js when contact's button is clicked
bContacts.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'contacts.js',
	});

	//Passes parameter to the contact's window:
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	win3.name   	 = name;
	win3.result      = win2.result;
	//taxConUP.close();
	//objectsConCheck.close();

	//objectsConUP.close();
	//objectsLeaUP.close();
	//objectsAccUP.close();

	db.close();
	
	//Manages memory leaking
	win3.open();
	win2.close();

});
//bContacts.enabled = false;

//Show black screen when Leads's button is clicked
// When the black screen receives one click, it closes
bLeads.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'leads.js',
	});

	//Passes parameter to the contact's window:
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	win3.name   	 = name;
	win3.result      = win2.result;
	//taxConUP.close();
	//objectsConCheck.close();

	//objectsConUP.close();
	//objectsLeaUP.close();
	//objectsAccUP.close();

	db.close();
	
	//Manages memory leaking
	win3.open();
	win2.close();
});
//bLeads.enabled = false;

//Go to contact.js when contact's button is clicked
bAccounts.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'accounts.js',
	});

	//Passes parameter to the contact's window:
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	win3.name   	 = name;
	win3.result      = win2.result;
	//taxConUP.close();
	//objectsConCheck.close();

	//objectsConUP.close();
	//objectsLeaUP.close();
	//objectsAccUP.close();

	db.close();
	
	//Manages memory leaking
	win3.open();
	win2.close();

});

bPotentials.addEventListener('click',function(e){

	var win3 = Titanium.UI.createWindow({  
		fullscreen: true,
		url:'potentials.js',
	});

	//Passes parameter to the contact's window:
	win3.log	     = win2.log;
	win3.picked 	 = win2.picked;
	win3.name   	 = name;
	win3.result      = win2.result;
	//taxConUP.close();
	//objectsConCheck.close();

	//objectsConUP.close();
	//objectsLeaUP.close();
	//objectsAccUP.close();

	db.close();
	
	//Manages memory leaking
	win3.open();
	win2.close();

});



//Action taken when syncronization button is pressed
bSync.addEventListener('click', function(){
	if (runningUp == false)
	{
		runningUp = true;
		showIndicator("normal");
	
		var updatedTime = db.execute('SELECT timestamp FROM updated WHERE rowid=1');
		
		var objectsUp = win2.log;
		//Timeout until error:
		objectsUp.setTimeout(10000);
	
		Ti.API.info("Timestamp: "+ updatedTime.fieldByName('timestamp'));
		//Opens address to retrieve contact list
		objectsUp.open('GET', win2.picked + '/js-sync/sync.json?timestamp=' + updatedTime.fieldByName('timestamp') );
		updatedTime.close();
	
		//Header parameters
		objectsUp.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsUp.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version
			if ((json.vocabularies.length == 0) && (json.terms.length == 0) && (json.leads.length == 0) && (json.contacts.length == 0) && (json.accounts.length == 0) && (json.potentials.length == 0) ){
				label_status.text  = version;
				hideIndicator();
				setFree ();
				Ti.API.info("SUCCESS");
			}
			else
			{
				db.execute('UPDATE updated SET "timestamp"='+ json.request_time +' WHERE "rowid"=1');		
	
				//Vocabulary:
				if (json.vocabularies){
					if (json.vocabularies.insert){
						for (var i = 0; i < json.vocabularies.insert.length; i++ ){
							db.execute('INSERT INTO vocabulary (vid, name) VALUES (?,?)', json.vocabularies.insert[i].vid , json.vocabularies.insert[i].name);				
						}
					}
					if (json.vocabularies.update){
						for (var i = 0; i < json.vocabularies.update.length; i++ ){
							db.execute('UPDATE vocabulary SET "name"=? WHERE "vid"=?',json.vocabularies.update[i].name ,json.vocabularies.update[i].vid);
						}
					}
					if (json.vocabularies["delete"]){
						for (var i = 0; i < json.vocabularies["delete"].length; i++ ){
							//Deletes rows from terms
							db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"][i].vid);							
							
							//Deletes corresponding rows in vocabulary
							db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"][i].vid);				
						}
					}
				}
				//Terms:
				if (json.terms){
					if (json.terms.insert){
						for (var i = 0; i < json.terms.insert.length; i++ ){
							Ti.API.info("Term: "+json.terms.insert[i]);
							db.execute('INSERT INTO term_data (vid, tid, name, description, weight) VALUES (?,?,?,?,?)', json.terms.insert[i].vid, json.terms.insert[i].tid, json.terms.insert[i].name, json.terms.insert[i].desc, json.terms.insert[i].weight);				
						}
					}
					if (json.terms.update){
						//db.execute('UPDATE term_data SET "name"="'+ json.terms.update[i].name +'", "description"="'+ json.terms.update[i].desc +'",  "weight"='+ json.terms.update[i].weight +', "vid"='+ json.terms.update[i].vid +'  WHERE "tid"='+json.terms.update[i].tid);				
						db.execute('UPDATE term_data SET "name"=?, "description"=?,  "weight"=?, "vid"=?  WHERE "tid"=?', json.terms.update[i].name, json.terms.update[i].desc, json.terms.update[i].weight, json.terms.update[i].vid, json.terms.update[i].tid);
					}
					if (json.terms["delete"]){
						for (var i = 0; i < json.terms["delete"].length; i++ ){
							db.execute('DELETE FROM term_data WHERE "tid"=?',json.terms["delete"][i].tid);
							//Insert in another tables a default value or simply attribute a default value in case of no results returning from a query?
							//A: Default value in case of no results returning from a query. (Way faster and easyer than set up every table linked to this deleted field) 
						}
					}
				}
				
				if (json.accounts){
					//Insert - Accounts
					if (json.accounts.insert){
						for (var i = 0; i < json.accounts.insert.length; i++ ){
							//Inserts into account table
							Ti.API.info("Phone Account: "+ json.accounts.insert[i].phone);
							db.execute('INSERT INTO account (nid, name, account_type_tid, parent_account_nid, website, phone, fax, description) VALUES (?,?,?,?,?,?,?,?)', json.accounts.insert[i].nid,json.accounts.insert[i].name, json.accounts.insert[i].account_type_tid, json.accounts.insert[i].account_nid, json.accounts.insert[i].website, json.accounts.insert[i].phone, json.accounts.insert[i].fax, json.accounts.insert[i].description);
						}
						Ti.API.info("Inserted accounts sucefully!");				
					}
					
					//Update - Accounts
					if (json.accounts.update){
						for (var i = 0; i < json.accounts.update.length; i++ ){
							//Updating account table
							db.execute('UPDATE account SET "name"=?, "account_type_tid"=?, "parent_account_nid"=?, "website"=?, "phone"=?, "fax"=?, "description"=? WHERE  "nid"=?', json.accounts.update[i].name, json.accounts.update[i].account_type_tid, json.accounts.update[i].account_nid, json.accounts.update[i].website, json.accounts.update[i].phone, json.accounts.update[i].fax, json.accounts.update[i].description, json.accounts.update[i].nid );
						}
						Ti.API.info("Updated accounts sucefully!");
					}
					
					//Delete - Accounts
					if (json.accounts["delete"])	{
						//Ti.API.info("Deleting Accounts");
						for (var i = 0; i <  json.accounts["delete"].length; i++ ){
							//Deletes current row
							db.execute('DELETE FROM account WHERE "nid"=?',json.accounts["delete"][i].nid);
						}				
						Ti.API.info("Deleted accounts sucefully!");
					}
				}
				
				if (json.leads){
					//Insert - Leads
					if (json.leads.insert){
						for (var i = 0; i < json.leads.insert.length; i++ ){
							//Inserts a new person
							db.execute('INSERT INTO lead (nid, first_name, last_name, job_title_tid, lead_status_tid, lead_source_tid, competing_company_tid, company, phone, cell_phone, fax, email, description, website) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', json.leads.insert[i].nid, json.leads.insert[i].first_name, json.leads.insert[i].last_name, json.leads.insert[i].job_title_tid, json.leads.insert[i].lead_status_tid, json.leads.insert[i].lead_source_tid, json.leads.insert[i].competing_company_tid, json.leads.insert[i].company, json.leads.insert[i].phone, json.leads.insert[i].cell_phone, json.leads.insert[i].fax, json.leads.insert[i].email, json.leads.insert[i].description, json.leads.insert[i].website);
						}
						Ti.API.info("Inserted leads sucefully!");				
					}
			
					//Update - Leads
					if (json.leads.update){
						for (var i = 0; i < json.leads.update.length; i++ ){
							//Updating lead table
							db.execute('UPDATE lead SET "first_name"=?, "last_name"=?, "job_title_tid"=?, "lead_status_tid"=?, "lead_source_tid"=?, "competing_company_tid"=?, "company"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=?, "website"=? WHERE  "nid"=?', json.leads.update[i].first_name, json.leads.update[i].last_name, json.leads.update[i].job_title_tid, json.leads.update[i].lead_status_tid, json.leads.update[i].lead_source_tid, json.leads.update[i].competing_company_tid, json.leads.update[i].company, json.leads.update[i].phone, json.leads.update[i].cell_phone, json.leads.update[i].fax, json.leads.update[i].email, json.leads.update[i].description, json.leads.update[i].website , json.leads.update[i].nid );
						}
						Ti.API.info("Updated Leads sucefully!");
					}
					
					//Delete - Leads
					if (json.leads["delete"])	{
						for (var i = 0; i <  json.leads["delete"].length; i++ ){
							//Deletes current row (lead)
							db.execute('DELETE FROM lead WHERE "nid"=?',json.leads["delete"][i].nid);
						}				
						Ti.API.info("Deleted Leads sucefully!");
					}
	
				}
				
				/*********** Contacts *************/
				if (json.contacts){
					//Insert - Contacts
					if (json.contacts.insert){
						for (var i = 0; i < json.contacts.insert.length; i++ ){
							db.execute('INSERT INTO contact (nid, first_name, last_name, account_nid, lead_source, job_title_tid, phone, cell_phone, fax, email, description ) VALUES (?,?,?,?,?,?,?,?,?,?,?)', json.contacts.insert[i].nid, json.contacts.insert[i].first_name, json.contacts.insert[i].last_name, json.contacts.insert[i].account_nid, json.contacts.insert[i].lead_source_tid, json.contacts.insert[i].job_title_tid, json.contacts.insert[i].phone, json.contacts.insert[i].cell_phone, json.contacts.insert[i].fax, json.contacts.insert[i].email, json.contacts.insert[i].description );
						}
						Ti.API.info("Inserted contacts sucefully!");				
					}
			
					//Update - Contacts
					if (json.contacts.update){
						for (var i = 0; i < json.contacts.update.length; i++ ){
							db.execute('UPDATE contact SET "first_name"=?, "last_name"=?, "account_nid"=? , "lead_source"=? , "job_title_tid"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=? WHERE "nid"=?', json.contacts.update[i].first_name , json.contacts.update[i].last_name , json.contacts.update[i].account_nid , json.contacts.update[i].lead_source_tid , json.contacts.update[i].job_title_tid , json.contacts.update[i].phone , json.contacts.update[i].cell_phone , json.contacts.update[i].fax , json.contacts.update[i].email , json.contacts.update[i].description , json.contacts.update[i].nid );
						}
						Ti.API.info("Updated Contacts sucefully!");
					}
					
					//Delete - Contacts
					if (json.contacts["delete"])	{
						for (var i = 0; i <  json.contacts["delete"].length; i++ ){
							//Deletes current row (contact)
							db.execute('DELETE FROM contact WHERE "nid"=?', json.contacts["delete"][i].nid);
						}				
						Ti.API.info("Deleted Contacts sucefully!");
					}
				}
	
				/*********** Potentials *************/
				if(json.potentials){
					//Insert - Potentials
					if (json.potentials.insert){
						for (var i = 0; i < json.potentials.insert.length; i++ ){
							db.execute('INSERT INTO potential (nid, name, account_nid, potential_stage_tid, competing_company_tid, potential_type_tid, closing_date, next_step, description ) VALUES (?,?,?,?,?,?,?,?,?)', json.potentials.insert[i].nid, json.potentials.insert[i].name, json.potentials.insert[i].account_nid, json.potentials.insert[i].potential_stage_tid, json.potentials.insert[i].competing_company_tid, json.potentials.insert[i].potential_type_tid, json.potentials.insert[i].closing_date, json.potentials.insert[i].next_step, json.potentials.insert[i].description);
						}
						Ti.API.info("Inserted potentials sucefully!");				
					}
		
					//Update - Contacts
					if (json.potentials.update){
						for (var i = 0; i < json.potentials.update.length; i++ ){
							db.execute('UPDATE potential SET "name"=? , "account_nid"=?, "potential_stage_tid"=?, "competing_company_tid"=?, "potential_type_tid"=?, "closing_date"=?, "next_step"=?, "description"=? WHERE "nid"=?', json.potentials.update[i].name, json.potentials.update[i].account_nid, json.potentials.update[i].potential_stage_tid, json.potentials.update[i].competing_company_tid, json.potentials.update[i].potential_type_tid, json.potentials.update[i].closing_date, json.potentials.update[i].next_step, json.potentials.update[i].description, json.potentials.update[i].nid );
						}
						Ti.API.info("Updated Potentials sucefully!");
					}
					
					//Delete - Contacts
					if (json.potentials["delete"])	{
						for (var i = 0; i <  json.potentials["delete"].length; i++ ){
							//Deletes current row (contact)
							db.execute('DELETE FROM potential WHERE "nid"=?', json.potentials["delete"][i].nid);
						}
						Ti.API.info("Deleted Potentials sucefully!");
					}
				}
				label_status.text  = version;
				hideIndicator();
				setFree ();
				Ti.API.info("SUCCESS");
				runningUp = false;
			}
		}
		//Connection error:
		objectsUp.onerror = function(e) {
			label_status.text  = "Services are down, please try again";
			hideIndicator();
			Ti.API.info("Services are down");
			runningUp = false;
		}
	
		//Sending information and try to connect
		objectsUp.send();
	}
});

function setFree (){
	bContacts.enabled = true;
	bLeads.enabled = true;
	bAccounts.enabled = true;
	bPotentials.enabled = true;
}

//View at the bottom to show user the database's status
var databaseStatusView = Titanium.UI.createView({
	bottom: '0px',	
	backgroundColor:'#111',
	height: '7%',
	width: '100%',
	opacity: 0.99,
	borderRadius:0
});

databaseStatusView.add(label_status);
databaseStatusView.add(bSync);

win2.add(databaseStatusView);

//Adds both buttons to the current window
win2.add(bContacts);
win2.add(bLeads);
win2.add(bAccounts);
win2.add(bPotentials);

//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

//Ti.App.Properties.removeProperty('update');
//When back button on the phone is pressed, it alerts the user (pop up box)
// that he needs to log out in order to go back to the root window
win2.addEventListener('android:back', function() {
	//Ti.API.info("Use log off button");
	alert("In order to log off, please click on the X next to your username at the top ");
});


//Check behind the courtins if there is a new version - 5 minutes
setInterval(checkUpdate, 30000);