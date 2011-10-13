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

var version = 'Version: 1.0';

var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: version,
	height:'auto',
	width:'auto',
	textAlign:'center'
});

var db = Ti.Database.install('../database/db.sqlite', 'omadiDb400');
var dicElements = [];
var actualItem = 0;
var dicSize;

function checkUpdate (){
	var updatedTimeTx = db.execute('SELECT timestampTax FROM updated WHERE rowid=1');
	
	var objectsTaxCheck = win2.log;
	//Timeout until error:
	objectsTaxCheck.setTimeout(10000);

	Ti.API.info("Timestamp: "+ updatedTimeTx.fieldByName('timestampTax'));
	//Opens address to retrieve contact list
	objectsTaxCheck.open('GET', win2.picked + '/js-sync/updated_taxonomy.json?timestamp=' + updatedTimeTx.fieldByName('timestampTax') );
	updatedTimeTx.close();

	//Header parameters
	objectsTaxCheck.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsTaxCheck.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);

		//If Database is already last version
		if ((json.vocabularies.length == 0) && (json.terms.length == 0)){
			checkUpAccounts();
		}
		else
		{
			label_status.text = "Database needs sycronization!";
			//////bSync.show();
		}
	}

	//Connection error:
	objectsTaxCheck.onerror = function(e) {
		label_status.text  = version;
		//////bSync.show();
	}

	//Sending information and try to connect
	objectsTaxCheck.send();

	function checkUpAccounts(){
		var updatedTimeAx = db.execute('SELECT timestampAccount FROM updated WHERE rowid=1');

		var objectsAccCheck = win2.log;
		
		//Timeout until error:
		objectsAccCheck.setTimeout(10000);
	
	
		//Opens address to retrieve contact list
		objectsAccCheck.open('GET', win2.picked + '/js-sync/account.json?timestamp=' + updatedTimeAx.fieldByName('timestampAccount') );
		updatedTimeAx.close();
			
		//Header parameters
		objectsAccCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsAccCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version
			if (json.accounts.length == 0){
				checkUpLeads();
			}
			else
			{
				label_status.text = "Database needs sycronization!";
				//////bSync.show();
			}
		}
	
		//Connection error:
		objectsAccCheck.onerror = function(e) {
			label_status.text  = version;
			//////bSync.show();
		}
	
		//Sending information and try to connect
		objectsAccCheck.send();
	}

	function checkUpLeads(){

		var updatedTimeLx = db.execute('SELECT timestampLead FROM updated WHERE rowid=1');

		var objectsLeadCheck = win2.log;
		
		//Timeout until error:
		 objectsLeadCheck.setTimeout(10000);
	
	
		//Opens address to retrieve contact list
		objectsLeadCheck.open('GET', win2.picked + '/js-sync/lead.json?timestamp=' + updatedTimeLx.fieldByName('timestampLead') );
		updatedTimeLx.close();	
		
		//Header parameters
		objectsLeadCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsLeadCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version
			if (json.leads.length == 0){
				checkUpContacts();
			}
			else
			{
				label_status.text = "Database needs sycronization!";
				//////bSync.show();
			}
		}
	
		//Connection error:
		 objectsLeadCheck.onerror = function(e) {
			label_status.text  = version;
			////bSync.show();
		}
	
		//Sending information and try to connect
		 objectsLeadCheck.send();
	}
	
	function checkUpContacts(){
		var updatedTimeCx = db.execute('SELECT timestampContact FROM updated WHERE rowid=1');
		
		var objectsContactCheck = win2.log;
		
		//Timeout until error:
		objectsContactCheck.setTimeout(10000);
	
	
		//Opens address to retrieve contact list
		objectsContactCheck.open('GET', win2.picked + '/js-sync/contact.json?timestamp=' + updatedTimeCx.fieldByName('timestampContact') );
		updatedTimeCx.close();	
		
		//Header parameters
		objectsContactCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		objectsContactCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version
			if (json.contacts.length == 0){
				checkUpPotentials();
			}
			else
			{
				label_status.text = "Database needs sycronization!";
				////bSync.show();
			}
		}
	
		//Connection error:
		 objectsContactCheck.onerror = function(e) {
			label_status.text  = version;
			////bSync.show();
		}
	
		//Sending information and try to connect
		 objectsContactCheck.send();
	}

	function checkUpContacts(){
		var updatedTimePx = db.execute('SELECT timestampPotential FROM updated WHERE rowid=1');
		
		var objectsPotentialCheck = win2.log;
		
		//Timeout until error:
		 objectsPotentialCheck.setTimeout(10000);
	
	
		//Opens address to retrieve contact list
		objectsPotentialCheck.open('GET', win2.picked + '/js-sync/potential.json?timestamp=' + updatedTimePx.fieldByName('timestampPotential') );
		updatedTimePx.close();
				
		//Header parameters
		 objectsPotentialCheck.setRequestHeader("Content-Type", "application/json");
	
		//When connected
		 objectsPotentialCheck.onload = function(e) {
			//Parses response into strings
			var json = JSON.parse(this.responseText);
	
			//If Database is already last version
			if (json.potentials.length == 0){
				label_status.text = version;
				//bSync.hide();
				bContacts.enabled = true;
				bLeads.enabled = true;
				bAccounts.enabled = true;
				bPotentials.enabled = true;
			}
			else
			{
				label_status.text = "Database needs sycronization!";
				////bSync.show();
			}
		}
	
		//Connection error:
		 objectsPotentialCheck.onerror = function(e) {
			label_status.text  = version;
			////bSync.show();
		}
	
		//Sending information and try to connect
		 objectsPotentialCheck.send();
	}

};

//Button Contacts
var bContacts = Titanium.UI.createButton({
   title: 'Contacts',
   width: '80%',
   height: '9%',
   top: '20%' 
});

//Button Leads
var bLeads = Titanium.UI.createButton({
   title: 'Leads',
   width: '80%',
   height: '9%',
   top: '40%' 
});

//Button Accounts
var bAccounts = Titanium.UI.createButton({
   title: 'Accounts',
   width: '80%',
   height: '9%',
   top: '60%' 
});

//Button Accounts
var bPotentials = Titanium.UI.createButton({
   title: 'Potentials',
   width: '80%',
   height: '9%',
   top: '80%' 
});

var bSync = Titanium.UI.createButton({
	width: '10%',
	height: '90%',
	top: '10%',
	image: Titanium.Android.R.drawable.emo_im_wtf,
	left: '90%'
});

//bSync.hide();


function installDic (){
	label_status.text  = "Installing Vocabulary";
	bAccounts.enabled = false;
	bLeads.enabled = false;
	bContacts.enabled = false;
	bPotentials.enabled = false;
	//Ti.API.info(win2.picked + '/js-sync/taxonomy_vocabulary.json');

	var objectsTaxDic = win2.log;
	//Timeout until error:
	objectsTaxDic.setTimeout(10000);


	//Opens address to retrieve contact list
	objectsTaxDic.open('GET', win2.picked + '/js-sync/taxonomy_vocabulary.json' );

	//Header parameters
	objectsTaxDic.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsTaxDic.onload = function(e) {
		var timeStamp = new Date().getTime();
		var syncTime = parseInt(timeStamp / 1000);
		Ti.API.info("Time sync: "+syncTime);
		
		var currentDate = new Date();
		var day = currentDate.getUTCDate();
		var month = currentDate.getUTCMonth();
		var year = currentDate.getUTCFullYear();
		var hour = currentDate.getUTCHours();
		var min = currentDate.getUTCMinutes();
		var sec = currentDate.getUTCSeconds();
		var mili = currentDate.getUTCMilliseconds();
		
	  	Ti.API.info("Time right: "+Date.UTC(year,month,day, hour, min, sec, mili ));
		db.execute('UPDATE updated SET "timestampTax"='+ syncTime +' WHERE "rowid"=1');

		//Parses response into strings
		var json = JSON.parse(this.responseText);
		
		//Ti.API.info("Insert first vid : "+ json[0].vid);

		//If Database is already last version
		if (json.length == 0){
			//Ti.API.info("json's length : "+ json.length);
			return null;
		}
		else
		{
			//Ti.API.info(" 	XXXXXXXXXXXX COMECA DIC XXXXXXXXXXX	");
			//Result's set:
			
			var vidItems = [];
			//Ti.API.info("Json's length : "+ json.length);
			for (var i = 0; i < json.length ; i++){
				//Ti.API.info("Json's VID : "+ json[i].vid);
				//Ti.API.info("Json's NAME : "+ json[i].name);
				vidItems[i] = json[i].vid;
				Ti.API.info ("Type of VID: "+typeof (json[i].vid));
				db.execute('INSERT INTO vocabulary (vid, name) VALUES (?,?)', json[i].vid, json[i].name);
			}
			//Ti.API.info(" 	XXXXXXXXXXXX ACABOU DIC XXXXXXXXXXX	");
		}
		
		Ti.App.fireEvent("startTerms", {'items': vidItems });
	}

	//Connection error:
	objectsTaxDic.onerror = function(e) {
		//Ti.API.info("Services are down - Vocabulary");
		return null ;
	}

	//Sending information and try to connect
	objectsTaxDic.send();
};

Ti.App.addEventListener("startTerms", function(data){
	//Ti.API.info("Starting TERMS!");
    //Ti.API.info("Array size: "+data.items.length);
    dicSize = data.items.length;
    dicElements = data.items;
	label_status.text  = "Installing Terms";
	Ti.App.fireEvent("installTerm");
});

Ti.App.addEventListener("installTerm", function(data){
	//When API is fixed, delete:
	//Ti.API.info("Install item number "+ actualItem+" ?");
	if ( dicSize > actualItem  ){
		installTerms (dicElements[actualItem]);
		//Ti.API.info("YES! ");				
	}
	else{
		//Ti.API.info("NOPE ! Finished! ");
		label_status.text  = "Terms and Vocabulary Installed!";
		checkUpdate();
	}
	
});	

function installTerms (vid){
	//Ti.API.info(" 	XXXXXXXXXXXX COMECOU TERMS XXXXXXXXXXX	");
	//Ti.API.info("VID to be inserted: "+ vid);
	//Ti.API.info(win2.picked + '/js-sync/taxonomy_vocabulary/getTree.json');
	
	//Opens address to retrieve contact list
	win2.log.open('POST', win2.picked + '/js-sync/taxonomy_vocabulary/getTree.json' );

	//Header parameters
	win2.log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	//When connected
	win2.log.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		
		//Ti.API.info("Insert first tid : "+ json[0].tid);

		//If Database is already last version

		if (json.length == 0){
			//Ti.API.info("json's length : "+ json.length);
		}
		else
		{
			//Result's set:
			//Ti.API.info("Json's length : "+ json.length);
			for (var i = 0; i < json.length ; i++){
				db.execute('INSERT INTO term_data (tid, vid, name, description, weight) VALUES (?,?,?,?,?)', json[i].tid, json[i].vid, json[i].name, json[i].description, json[i].weight);
				//Ti.API.info("TID to be inserted: "+ json[i].tid);
				//Ti.API.info("VID to be inserted: "+ json[i].vid);
				//Ti.API.info("NAME to be inserted: "+ json[i].name);
				//Ti.API.info("DESC to be inserted: "+ json[i].description);
				//Ti.API.info("WEIGHT to be inserted: "+ json[i].weight);
			}
			//Ti.API.info(" 	XXXXXXXXXXXX ACABOU TERMS XXXXXXXXXXX	");
			actualItem++;
			Ti.App.fireEvent("installTerm");
		}
	}

	//Connection error:
	win2.log.onerror = function(e) {
		//Ti.API.info("Services are down - Terms");
		//if (vid == null){
			//Ti.API.info(e);			
			//Ti.API.info("Vocabulary doesn't have associated terms : ");
			//Ti.API.info(" 	XXXXXXXXXXXX ACABOU TERMS XXXXXXXXXXX	");
			actualItem++;
			Ti.App.fireEvent("installTerm");
		//}	
	}

	//Sending information and try to connect
	win2.log.send('vid='+vid);
};

//Before system's first update
var updatedTime = db.execute('SELECT timestampTax FROM updated');
//Ti.API.info('Timestamp (from DB): '+updatedTime.fieldByName('timestamp'));
if (updatedTime.fieldByName('timestampTax') < 10000){
	//Ti.API.info("Let's UPDATE TAXONOMY ");
	installDic();
	//Ti.API.info("Didn't wait finish installation of dictionary");	
}
else{
	//Ti.API.info("NOT FIRST TIME! Check UPDATES NOW!");
	//checkUpdate();
}
updatedTime.close();

//Parses result from user's login 
var jsonLogin = JSON.parse(win2.result) ;

//Ti.API.info("Json Name: "+ jsonLogin.user.name);
//Ti.API.info("Json Sessid: "+ jsonLogin.sessid);
//Retrieves username
var name = jsonLogin.user.name;

//Debug content of name
//Ti.API.info('Name '+name);


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
	showIndicator("normal");
	
	//Last update
	var lastUpdateT    = db.execute('SELECT timestampTax FROM updated WHERE rowid=1');
	Ti.API.info ("Here it comes!");
	Ti.API.info ("TimestampTax : "+lastUpdateT.fieldByName('timestampTax'));
	
	var taxConUP = win2.log;

	//Timeout until error:
	taxConUP.setTimeout(10000);
	//Query web service to check timestamp
	taxConUP.open('GET', win2.picked + '/js-sync/updated_taxonomy.json?timestamp=' + lastUpdateT.fieldByName('timestampTax'));
	lastUpdateT.close();
	
	//Header parameters
	taxConUP.setRequestHeader("Content-Type", "application/json");		
	
	taxConUP.onload = function(e) {
		//Actual timestamp set
		var timeStamp = new Date().getTime();
		var syncTime = parseInt(timeStamp / 1000);

		db.execute('UPDATE updated SET "timestampTax"='+ syncTime +' WHERE "rowid"=1');

		var taxJson = JSON.parse(this.responseText);
		
		//Firstly sync taxonomy tables:
		Ti.API.info("taxObject ->>>>   "+taxJson);
		//Vocabulary:
		if (taxJson){
			if (taxJson.vocabularies.insert){
				for (var i = 0; i < taxJson.vocabularies.insert.length; i++ ){
					db.execute('INSERT INTO vocabulary (vid, name) VALUES (?,?)', taxJson.vocabularies.insert[i].vid , taxJson.vocabularies.insert[i].name);				
				}
			}
			if (taxJson.vocabularies.update){
				for (var i = 0; i < taxJson.vocabularies.update.length; i++ ){
					db.execute('UPDATE vocabulary SET "name"=? WHERE "vid"=?',taxJson.vocabularies.update[i].name ,taxJson.vocabularies.update[i].vid);
				}
			}
			if (taxJson.vocabularies["delete"]){
				for (var i = 0; i < taxJson.vocabularies["delete"].length; i++ ){
					//Deletes rows from terms
					db.execute('DELETE FROM term_data WHERE "vid"=?',taxJson.vocabularies["delete"][i].vid);							
					
					//Deletes corresponding rows in vocabulary
					db.execute('DELETE FROM vocabulary WHERE "vid"=?',taxJson.vocabularies["delete"][i].vid);				
				}
			}
	
			//terms: 
			if (taxJson.terms.insert){
				for (var i = 0; i < taxJson.terms.insert.length; i++ ){
					Ti.API.info("Term: "+taxJson.terms.insert[i]);
					db.execute('INSERT INTO term_data (vid, tid, name, description, weight) VALUES (?,?,?,?,?)', taxJson.terms.insert[i].vid, taxJson.terms.insert[i].tid, taxJson.terms.insert[i].name, taxJson.terms.insert[i].desc, taxJson.terms.insert[i].weight);				
				}
			}
			if (taxJson.terms.update){
				//db.execute('UPDATE term_data SET "name"="'+ taxJson.terms.update[i].name +'", "description"="'+ taxJson.terms.update[i].desc +'",  "weight"='+ taxJson.terms.update[i].weight +', "vid"='+ taxJson.terms.update[i].vid +'  WHERE "tid"='+taxJson.terms.update[i].tid);				
				db.execute('UPDATE term_data SET "name"=?, "description"=?,  "weight"=?, "vid"=?  WHERE "tid"=?', taxJson.terms.update[i].name, taxJson.terms.update[i].desc, taxJson.terms.update[i].weight, taxJson.terms.update[i].vid, taxJson.terms.update[i].tid);
			}
			if (taxJson.terms["delete"]){
				for (var i = 0; i < taxJson.terms["delete"].length; i++ ){
					db.execute('DELETE FROM term_data WHERE "tid"=?',taxJson.terms["delete"][i].tid);
					//Insert in another tables a default value or simply attribute a default value in case of no results returning from a query?
					//A: Default value in case of no results returning from a query. (Way faster and easyer than set up every table linked to this deleted field) 
				}
			}
		}
		installAcc();
	}

	//Connection error:
	taxConUP.onerror = function(e) {
			//Ti.API.info("Services are down");
			label_status.text  = "Services are down at the moment, please try again later";
			hideIndicator();
	}
	taxConUP.send();

	function installAcc(){
		
		//Last update
		var lastUpdateA    = db.execute('SELECT timestampAccount FROM updated WHERE rowid=1');

		var objectsAccUP = win2.log;

		//Timeout until error:
		objectsAccUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsAccUP.open('GET', win2.picked + '/js-sync/account.json?timestamp=' + lastUpdateA.fieldByName('timestampAccount'));
		lastUpdateA.close();
				
		//Header parameters
		objectsAccUP.setRequestHeader("Content-Type", "application/json");

		objectsAccUP.onload = function(e) {
			//Actual timestamp set
			var timeStamp = new Date().getTime();
			var syncTime = parseInt(timeStamp / 1000);

			db.execute('UPDATE updated SET "timestampAccount"='+ syncTime +' WHERE "rowid"=1');
		
			//Parses account's response into strings
			var jsonAccount = JSON.parse(this.responseText);

			Ti.API.info("Account Obj : "+ jsonAccount);	
			Ti.API.info("Account : "+ jsonAccount.accounts);

			/*********** Accounts *************/
	
			//Insert - Accounts
			if (jsonAccount.accounts.insert){
				for (var i = 0; i < jsonAccount.accounts.insert.length; i++ ){
					//Inserts into account table
					Ti.API.info("Phone Account: "+ jsonAccount.accounts.insert[i].phone);
					db.execute('INSERT INTO account (nid, name, account_type_tid, parent_account_nid, website, phone, fax, description) VALUES (?,?,?,?,?,?,?,?)', jsonAccount.accounts.insert[i].nid,jsonAccount.accounts.insert[i].name, jsonAccount.accounts.insert[i].account_type_tid, jsonAccount.accounts.insert[i].account_nid, jsonAccount.accounts.insert[i].website, jsonAccount.accounts.insert[i].phone, jsonAccount.accounts.insert[i].fax, jsonAccount.accounts.insert[i].description);
				}
				Ti.API.info("Inserted accounts sucefully!");				
			}
			
			// TODO: Replicate the changes on account to contact (and others that may apply)
			//Update - Accounts
			if (jsonAccount.accounts.update){
				for (var i = 0; i < jsonAccount.accounts.update.length; i++ ){
					//Updating account table
					db.execute('UPDATE account SET "name"=? "account_type_tid"=?, "parent_account_nid"=?, "website"=?, "phone"=?, "fax"=?, "description"=? WHERE  "nid"=?', jsonAccount.accounts.update[i].name, jsonAccount.accounts.update[i].account_type_tid, jsonAccount.accounts.update[i].account_nid, jsonAccount.accounts.update[i].website, jsonAccount.accounts.update[i].phone, jsonAccount.accounts.update[i].fax, jsonAccount.accounts.update[i].description, jsonAccount.accounts.update[i].nid );
				}
				Ti.API.info("Updated accounts sucefully!");
			}
			
			//Delete - Accounts
			if (jsonAccount.accounts["delete"])	{
				//Ti.API.info("Deleting Accounts");
				for (var i = 0; i <  jsonAccount.accounts["delete"].length; i++ ){
					//Deletes current row
					db.execute('DELETE FROM account WHERE "nid"=?',jsonAccount.accounts["delete"][i].nid);
				}				
				Ti.API.info("Deleted accounts sucefully!");
			}
			installLeads();
		}
		//Connection error:
		objectsAccUP.onerror = function(e) {
			//Ti.API.info("Services are down");
			label_status.text  = "Services are down at the moment, please try again later";
			hideIndicator();
		}		
		objectsAccUP.send();
	};

	function installLeads(){
		//Last update
		var lastUpdateL    = db.execute('SELECT timestampLead FROM updated WHERE rowid=1');

		var objectsLeaUP = win2.log;
	
		//Timeout until error:
		objectsLeaUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsLeaUP.open('GET', win2.picked + '/js-sync/lead.json?timestamp=' + lastUpdateL.fieldByName('timestampLead'));
		lastUpdateL.close();
				
		//Header parameters
		objectsLeaUP.setRequestHeader("Content-Type", "application/json");
	
		objectsLeaUP.onload = function(e) {
	
			//Actual timestamp set
			var timeStamp = new Date().getTime();
			var syncTime = parseInt(timeStamp / 1000);

			db.execute('UPDATE updated SET "timestampLead"='+ syncTime +' WHERE "rowid"=1');
	
			//Parses lead's response into strings
			var jsonLead = JSON.parse(this.responseText);
			Ti.API.info("jsonLead ->>>>   "+jsonLead);
			/*********** Leads *************/
			Ti.API.info("Insert Lead?  "+jsonLead.leads.insert);	
			Ti.API.info("Update Lead?  "+jsonLead.leads.update);
			Ti.API.info("Delete Lead?  "+jsonLead.leads["delete"]);						
			//Insert - Leads
			if (jsonLead.leads.insert){
				//Ti.API.info("Account insert's length : "+ jsonLead.leads.insert.length);
				//Ti.API.info("Inserting Leads:");
				for (var i = 0; i < jsonLead.leads.insert.length; i++ ){
					//Inserts a new person
					db.execute('INSERT INTO lead (nid, first_name, last_name, job_title_tid, lead_status_tid, lead_source_tid, competing_company_tid, company, phone, cell_phone, fax, email, description, website) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', jsonLead.leads.insert[i].nid, jsonLead.leads.insert[i].first_name, jsonLead.leads.insert[i].last_name, jsonLead.leads.insert[i].job_title_tid, jsonLead.leads.insert[i].lead_status_tid, jsonLead.leads.insert[i].lead_source_tid, jsonLead.leads.insert[i].competing_company_tid, jsonLead.leads.insert[i].company, jsonLead.leads.insert[i].phone, jsonLead.leads.insert[i].cell_phone, jsonLead.leads.insert[i].fax, jsonLead.leads.insert[i].email, jsonLead.leads.insert[i].description, jsonLead.leads.insert[i].website);
				}
				Ti.API.info("Inserted leads sucefully!");				
			}
	
			//Update - Leads
			if (jsonLead.leads.update){
				//Ti.API.info("Lead update's length : "+ jsonLead.leads.update.length);
				//Ti.API.info("Updating Leads");
				for (var i = 0; i < jsonLead.leads.update.length; i++ ){
					//Updating lead table
					db.execute('UPDATE lead SET "first_name"=?, "last_name"=?, "job_title_tid"=?, "lead_status_tid"=?, "lead_source_tid"=?, "competing_company_tid"=?, "company"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=?, "website"=? WHERE  "nid"=?', jsonLead.leads.update[i].first_name, jsonLead.leads.update[i].last_name, jsonLead.leads.update[i].job_title_tid, jsonLead.leads.update[i].lead_status_tid, jsonLead.leads.update[i].lead_source_tid, jsonLead.leads.update[i].competing_company_tid, jsonLead.leads.update[i].company, jsonLead.leads.update[i].phone, jsonLead.leads.update[i].cell_phone, jsonLead.leads.update[i].fax, jsonLead.leads.update[i].email, jsonLead.leads.update[i].description, jsonLead.leads.update[i].website , jsonLead.leads.update[i].nid );
				}
				Ti.API.info("Updated Leads sucefully!");
			}
			
			//Delete - Leads
			if (jsonLead.leads["delete"])	{
				for (var i = 0; i <  jsonLead.leads["delete"].length; i++ ){
					//Deletes current row (lead)
					db.execute('DELETE FROM lead WHERE "nid"=?',jsonLead.leads["delete"][i].nid);
				}				
				Ti.API.info("Deleted Leads sucefully!");
			}
			installCon();		
		}
		//Connection error:
		objectsLeaUP.onerror = function(e) {
			Ti.API.info("Services are down");
			label_status.text  = "Services are down at the moment, please try again later";
			hideIndicator();
		}	
		objectsLeaUP.send();
	}

	function installCon(){
		//Last update
		var lastUpdateC    = db.execute('SELECT timestampContact FROM updated WHERE rowid=1');

		var objectsConUP = win2.log;
	
		//Timeout until error:
		objectsConUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsConUP.open('GET', win2.picked + '/js-sync/contact.json?timestamp=' + lastUpdateC.fieldByName('timestampContact'));
		lastUpdateC.close();
		
		
		//Header parameters
		objectsConUP.setRequestHeader("Content-Type", "application/json");

		//When connected
		objectsConUP.onload = function(e) {
			//Actual timestamp set
			var timeStamp = new Date().getTime();
			var syncTime = parseInt(timeStamp / 1000);

			db.execute('UPDATE updated SET "timestampContact"='+ syncTime +' WHERE "rowid"=1');

			//Parses contat's response into strings
			var jsonContact = JSON.parse(this.responseText);
			
			Ti.API.info("jsonContact ->>>>   "+jsonContact);
			
			/*********** Contacts *************/
			
			//Insert - Contacts
			if (jsonContact.contacts.insert){
				for (var i = 0; i < jsonContact.contacts.insert.length; i++ ){
					db.execute('INSERT INTO contact (nid, first_name, last_name, account_nid, lead_source, job_title_tid, phone, cell_phone, fax, email, description ) VALUES (?,?,?,?,?,?,?,?,?,?,?)', jsonContact.contacts.insert[i].nid, jsonContact.contacts.insert[i].first_name, jsonContact.contacts.insert[i].last_name, jsonContact.contacts.insert[i].account_nid, jsonContact.contacts.insert[i].lead_source_tid, jsonContact.contacts.insert[i].job_title_tid, jsonContact.contacts.insert[i].phone, jsonContact.contacts.insert[i].cell_phone, jsonContact.contacts.insert[i].fax, jsonContact.contacts.insert[i].email, jsonContact.contacts.insert[i].description );
				}
				Ti.API.info("Inserted contacts sucefully!");				
			}
	
			//Update - Contacts
			if (jsonContact.contacts.update){
				for (var i = 0; i < jsonContact.contacts.update.length; i++ ){
					db.execute('UPDATE contact SET "first_name"=?, "last_name"=?, "account_nid"=? , "lead_source"=? , "job_title_tid"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=? WHERE "nid"=?', jsonContact.contacts.update[i].first_name , jsonContact.contacts.update[i].last_name , jsonContact.contacts.update[i].account_nid , jsonContact.contacts.update[i].lead_source_tid , jsonContact.contacts.update[i].job_title_tid , jsonContact.contacts.update[i].phone , jsonContact.contacts.update[i].cell_phone , jsonContact.contacts.update[i].fax , jsonContact.contacts.update[i].email , jsonContact.contacts.update[i].description , jsonContact.contacts.update[i].nid );
				}
				Ti.API.info("Updated Contacts sucefully!");
			}
			
			//Delete - Contacts
			if (jsonContact.contacts["delete"])	{
				for (var i = 0; i <  jsonContact.contacts["delete"].length; i++ ){
					//Deletes current row (contact)
					db.execute('DELETE FROM contact WHERE "nid"=?', jsonContact.contacts["delete"][i].nid);
					//Ti.API.info("NID: "+ jsonContact.contacts["delete"][i].nid);
				}				
				Ti.API.info("Deleted Contacts sucefully!");
			}
			installPotential();
		}

		//Connection error:
		objectsConUP.onerror = function(e) {
			//Ti.API.info("Services are down");
			version = "Services are down at the moment, please try again later";
			hideIndicator();
		}
		//Sending information and try to connect
		objectsConUP.send();
	}

	function installPotential(){
		//Last update
		var lastUpdateP    = db.execute('SELECT timestampPotential FROM updated WHERE rowid=1');

		var objectsPotUP = win2.log;
	
		//Timeout until error:
		objectsPotUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsPotUP.open('GET', win2.picked + '/js-sync/potential.json?timestamp=' + lastUpdateP.fieldByName('timestampContact'));
		lastUpdateP.close();
		
		//Header parameters
		objectsPotUP.setRequestHeader("Content-Type", "application/json");

		//When connected
		objectsPotUP.onload = function(e) {
			//Actual timestamp set
			var timeStamp = new Date().getTime();
			var syncTime = parseInt(timeStamp / 1000);

			db.execute('UPDATE updated SET "timestampPotential"='+ syncTime +' WHERE "rowid"=1');

			//Parses contat's response into strings
			var jsonPotential = JSON.parse(this.responseText);
			
			Ti.API.info("jsonPotential ->>>>   "+jsonPotential);
			
			/*********** Potentials *************/
			
			//Insert - Potentials
			if (jsonPotential.potentials.insert){
				for (var i = 0; i < jsonPotential.potentials.insert.length; i++ ){
					db.execute('INSERT INTO potential (nid, name, account_nid, potential_stage_tid, competing_company_tid, potential_type_tid, closing_date, next_step, description ) VALUES (?,?,?,?,?,?,?,?,?)', jsonPotential.potentials.insert[i].nid, jsonPotential.potentials.insert[i].name, jsonPotential.potentials.insert[i].account_nid, jsonPotential.potentials.insert[i].potential_stage_tid, jsonPotential.potentials.insert[i].competing_company_tid, jsonPotential.potentials.insert[i].potential_type_tid, jsonPotential.potentials.insert[i].closing_date, jsonPotential.potentials.insert[i].next_step, jsonPotential.potentials.insert[i].description);
				}
				Ti.API.info("Inserted potentials sucefully!");				
			}

			//Update - Contacts
			if (jsonPotential.potentials.update){
				for (var i = 0; i < jsonPotential.potentials.update.length; i++ ){
					db.execute('UPDATE potential SET "name"=? , "account_nid"=?, "potential_stage_tid"=?, "competing_company_tid"=?, "potential_type_tid"=?, "closing_date"=?, "next_step"=?, "description"=? WHERE "nid"=?', jsonPotential.potentials.update[i].name, jsonPotential.potentials.update[i].account_nid, jsonPotential.potentials.update[i].potential_stage_tid, jsonPotential.potentials.update[i].competing_company_tid, jsonPotential.potentials.update[i].potential_type_tid, jsonPotential.potentials.update[i].closing_date, jsonPotential.potentials.update[i].next_step, jsonPotential.potentials.update[i].description, jsonPotential.potentials.update[i].nid );
				}
				Ti.API.info("Updated Potentials sucefully!");
			}
			
			//Delete - Contacts
			if (jsonPotential.potentials["delete"])	{
				for (var i = 0; i <  jsonPotential.potentials["delete"].length; i++ ){
					//Deletes current row (contact)
					db.execute('DELETE FROM potential WHERE "nid"=?', jsonPotential.potentials["delete"][i].nid);
				}
				Ti.API.info("Deleted Potentials sucefully!");
			}

			label_status.text = "Database updated";
			
			hideIndicator();
			//bContacts.enabled = true;
			//bLeads.enabled = true;
			//bAccounts.enabled = true;
			Ti.API.info("SUCCESS");
		}
		//Connection error:
		objectsPotUP.onerror = function(e) {
			//Ti.API.info("Services are down");
			version = "Services are down at the moment, please try again later";
			hideIndicator();
		}
	
		//Sending information and try to connect
		objectsPotUP.send();
	}
	
});

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

//checkUpdate();

//Check behind the courtins if there is a new version - 5 minutes
//setInterval(checkUpdate, 30000);