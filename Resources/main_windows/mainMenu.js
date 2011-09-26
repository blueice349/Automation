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

version = 'Version: 1.0';

var label_status = Titanium.UI.createLabel({
	color:'#FFFFFF',
	text: version,
	height:'auto',
	width:'auto',
	textAlign:'center'
});

var db = Ti.Database.install('../database/db.sqlite', 'omadiDb201');
var dicElements = [];
var actualItem = 0;
var dicSize;

//Restart timestamp - Test purpouses -> DELETE ME
//db.execute('UPDATE updated SET "timestamp"=0 WHERE "rowid"=1');


function checkUpdate (){
	var updatedTime = db.execute('SELECT timestamp FROM updated');
	
	Ti.API.info("Last timestamp: "+updatedTime.fieldByName('timestamp'));

	Ti.API.info(win2.picked + '/js-sync/contact.json?timestamp=' + updatedTime.fieldByName('timestamp'));

	var objectsConCheck = win2.log;
	//Timeout until error:
	objectsConCheck.setTimeout(10000);


	//Opens address to retrieve contact list
	objectsConCheck.open('GET', win2.picked + '/js-sync/contact.json?timestamp=' + updatedTime.fieldByName('timestamp') );

	//Header parameters
	objectsConCheck.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsConCheck.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		if (json.contacts.insert){
			Ti.API.info("Insert first : "+ json.contacts.insert[0].nid);			
		}

		updatedTime.close();
		//If Database is already last version
		if (json.contacts.length == 0){
			Ti.API.info("json.contacts's length : "+ json.contacts.length);
			label_status.text = version;
			bSync.hide();
		}
		else
		{
			//Result's set:
			Ti.API.info("Json's length : "+ json.length);
			Ti.API.info("json.contacts's length : "+ json.contacts.length);
			Ti.API.info("Insert's length : "+ json.contacts.insert.length);
			Ti.API.info("Delete's length : "+ json.contacts["delete"].length);
			Ti.API.info("Insert: "+ json.contacts.insert);
			Ti.API.info("Delete: "+ json.contacts["delete"][0]);
			label_status.text = "Database needs sycronization!";
			bSync.show();
		}
		//hideIndicator();
	}

	//Connection error:
	objectsConCheck.onerror = function(e) {
		updatedTime.close();

		Ti.API.info("Services are down - Connection");
		label_status.text  = version;
		bSync.show();
	}

	//Sending information and try to connect
	objectsConCheck.send();
};

function installDic (){
	label_status.text  = "Installing Vocabulary";
	Ti.API.info(win2.picked + '/js-sync/taxonomy_vocabulary.json');

	var objectsTaxDic = win2.log;
	//Timeout until error:
	objectsTaxDic.setTimeout(10000);


	//Opens address to retrieve contact list
	objectsTaxDic.open('GET', win2.picked + '/js-sync/taxonomy_vocabulary.json' );

	//Header parameters
	objectsTaxDic.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsTaxDic.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		
		Ti.API.info("Insert first vid : "+ json[0].vid);

		//If Database is already last version
		if (json.length == 0){
			Ti.API.info("json's length : "+ json.length);
			return null;
		}
		else
		{
			Ti.API.info(" 	XXXXXXXXXXXX COMECA DIC XXXXXXXXXXX	");
			//Result's set:
			
			var vidItems = [];
			Ti.API.info("Json's length : "+ json.length);
			for (var i = 0; i < json.length ; i++){
				Ti.API.info("Json's VID : "+ json[i].vid);
				Ti.API.info("Json's NAME : "+ json[i].name);
				vidItems[i] = json[i].vid;
				db.execute('INSERT INTO vocabulary (vid, name) VALUES (?,?)', json[i].vid, json[i].name);
			}
			Ti.API.info(" 	XXXXXXXXXXXX ACABOU DIC XXXXXXXXXXX	");
		}
		
		Ti.App.fireEvent("startTerms", {'items': vidItems });
	}

	//Connection error:
	objectsTaxDic.onerror = function(e) {
		Ti.API.info("Services are down - Vocabulary");
		return null ;
	}

	//Sending information and try to connect
	objectsTaxDic.send();
};

Ti.App.addEventListener("startTerms", function(data){
	Ti.API.info("Starting TERMS!");
    Ti.API.info("Array size: "+data.items.length);
    dicSize = data.items.length;
    dicElements = data.items;
	label_status.text  = "Installing Terms";
	Ti.App.fireEvent("installTerm");
});

Ti.App.addEventListener("installTerm", function(data){
	//When API is fixed, delete:
	Ti.API.info("Install item number "+ actualItem+" ?");
	if ( dicSize > actualItem  ){
		installTerms (dicElements[actualItem]);
		Ti.API.info("YES! ");				
	}
	else{
		Ti.API.info("NOPE ! Finished! ");
		label_status.text  = "Terms and Vocabulary Installed!";
		checkUpdate();
	}
	
});	

function installTerms (vid){
	Ti.API.info(" 	XXXXXXXXXXXX COMECOU TERMS XXXXXXXXXXX	");
	Ti.API.info("VID to be inserted: "+ vid);
	Ti.API.info(win2.picked + '/js-sync/taxonomy_vocabulary/getTree.json');
	
	//Opens address to retrieve contact list
	win2.log.open('POST', win2.picked + '/js-sync/taxonomy_vocabulary/getTree.json' );

	//Header parameters
	win2.log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	//When connected
	win2.log.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		
		Ti.API.info("Insert first tid : "+ json[0].tid);

		//If Database is already last version

		if (json.length == 0){
			Ti.API.info("json's length : "+ json.length);
		}
		else
		{
			//Result's set:
			Ti.API.info("Json's length : "+ json.length);
			for (var i = 0; i < json.length ; i++){
				db.execute('INSERT INTO term_data (tid, vid, name, description, weight) VALUES (?,?,?,?,?)', json[i].tid, json[i].vid, json[i].name, json[i].description, json[i].weight);
				Ti.API.info("TID to be inserted: "+ json[i].tid);
				Ti.API.info("VID to be inserted: "+ json[i].vid);
				Ti.API.info("NAME to be inserted: "+ json[i].name);
				Ti.API.info("DESC to be inserted: "+ json[i].description);
				Ti.API.info("WEIGHT to be inserted: "+ json[i].weight);
			}
			Ti.API.info(" 	XXXXXXXXXXXX ACABOU TERMS XXXXXXXXXXX	");
			actualItem++;
			Ti.App.fireEvent("installTerm");
		}
	}

	//Connection error:
	win2.log.onerror = function(e) {
		Ti.API.info("Services are down - Terms");
		//if (vid == null){
			Ti.API.info(e);			
			Ti.API.info("Vocabulary doesn't have associated terms : ");
			Ti.API.info(" 	XXXXXXXXXXXX ACABOU TERMS XXXXXXXXXXX	");
			actualItem++;
			Ti.App.fireEvent("installTerm");
		//}	
	}

	//Sending information and try to connect
	win2.log.send('vid='+vid);
};

//Before system's first update
var updatedTime = db.execute('SELECT timestamp FROM updated');
Ti.API.info('Timestamp (from DB): '+updatedTime.fieldByName('timestamp'));
if (updatedTime.fieldByName('timestamp') < 10000){
	Ti.API.info("Let's UPDATE TAXONOMY ");
	installDic();
	Ti.API.info("Didn't wait finish installation of dictionary");	
}
else{
	Ti.API.info("NOT FIRST TIME! Check UPDATES NOW!");
	checkUpdate();
}
updatedTime.close();

//Parses result from user's login 
var jsonLogin = JSON.parse(win2.result) ;

Ti.API.info("Json Name: "+ jsonLogin.user.name);
Ti.API.info("Json Sessid: "+ jsonLogin.sessid);
//Retrieves username
var name = jsonLogin.user.name;

//Debug content of name
Ti.API.info('Name '+name);


// showToolbar(name, actualWindow)					
showToolbar( name, win2 );


//Button Contacts
var bContacts = Titanium.UI.createButton({
   title: 'Contacts',
   width: '80%',
   height: '9%',
   top: '41%' 
});

//Button Leads
var bLeads = Titanium.UI.createButton({
   title: 'Leads',
   width: '80%',
   height: '9%',
   top: '60%' 
});

var bSync = Titanium.UI.createButton({
	width: '10%',
	height: '90%',
	top: '10%',
	image: Titanium.Android.R.drawable.emo_im_wtf,
	left: '90%'
});

bSync.hide();

//Show black screen when Leads's button is clicked
// When the black screen receives one click, it closes
bLeads.addEventListener('click',function(e){
	
	var winSoon = Titanium.UI.createWindow({
	 	modal: true,
	 	backgroundColor: '#000',
		opacity: 0.9
	});
	
	var labelSoon = Titanium.UI.createLabel({
		text:'Coming soon, click on this screen to go back',
		top: '50%',
		width: 'auto',
		height: 'auto'
	})
	
	winSoon.add(labelSoon);


	winSoon.addEventListener('click', function(){
		winSoon.close();
	});
	
	winSoon.open();

});

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

//Action taken when syncronization button is pressed
bSync.addEventListener('click', function(){
	showIndicator("normal");
	
	//Actual timestamp set
	var timeStamp = new Date().getTime();
	var syncTime = parseInt(timeStamp / 1000);
	Ti.API.info("Actual timestamp " + syncTime);
	
	//Last update
	var lastUpdate    = db.execute('SELECT timestamp FROM updated');
	var isFirstUpdate = lastUpdate.fieldByName('timestamp');
	Ti.API.info("Updating original timestamp equals "+ lastUpdate.fieldByName('timestamp') +" to a new one equals "+ syncTime);
	
	//var objectsConUP = win2.log;
	//var objectsLeaUP = win2.log;
	//var objectsAccUP = win2.log;
	var taxConUP = win2.log;

	//Timeout until error:
	//objectsConUP.setTimeout(10000);
	//objectsLeaUP.setTimeout(10000);
	//objectsAccUP.setTimeout(10000);
	taxConUP.setTimeout(10000);
	
	//Query web service to check timestamp
	//objectsConUP.open('GET', win2.picked + '/js-sync/contact.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
	//objectsLeaUP.open('GET', win2.picked + '/js-sync/lead.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
	//objectsAccUP.open('GET', win2.picked + '/js-sync/account.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
	taxConUP.open('GET', win2.picked + '/js-sync/updated_taxonomy.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
	
	//Header parameters
	//objectsConUP.setRequestHeader("Content-Type", "application/json");
	//objectsLeaUP.setRequestHeader("Content-Type", "application/json");
	//objectsAccUP.setRequestHeader("Content-Type", "application/json");
	taxConUP.setRequestHeader("Content-Type", "application/json");		
	
	taxConUP.onload = function(e) {
		Ti.API.info("LOADEEEEEEED");
		var taxJson = JSON.parse(this.responseText);
		
		//Firstly sync taxonomy tables:
		Ti.API.info("VEJA ->>>>   "+taxJson);
	
		Ti.API.info("VEJA ->>>>   "+taxJson.vocabularies);
	
		Ti.API.info("Passou  ");
		//Vocabulary:
		if (!taxJson){
	
			if (taxJson.vocabulary.insert){
				for (var i = 0; i < taxJson.vocabulary.insert.length; i++ ){
					db.execute('INSERT INTO vocabulary (vid, name) VALUES (?,?)', taxJson.vocabulary.insert[i].vid, taxJson.vocabulary.insert[i].name);				
				}
			}
			if (taxJson.vocabulary.update){
				for (var i = 0; i < taxJson.vocabulary.update.length; i++ ){
					db.execute('UPDATE vocabulary SET "name"='+ taxJson.vocabulary.update[i].name +' WHERE "vid"='+taxJson.vocabulary.update[i].vid);				
				}
			}
			if (taxJson.vocabulary["delete"]){
				for (var i = 0; i < taxJson.vocabulary["delete"].length; i++ ){
					//Deletes rows from terms
					db.execute('DELETE FROM term_data WHERE "vid"='+taxJson.vocabulary["delete"][i].vid);							
					
					//Deletes corresponding rows in vocabulary
					db.execute('DELETE FROM vocabulary WHERE "vid"='+taxJson.vocabulary["delete"][i].vid);				
				}
			}
	
			//terms: 
			if (taxJson.terms.insert){
				for (var i = 0; i < taxJson.terms.insert.length; i++ ){
					db.execute('INSERT INTO term_data (vid, tid, name, description, weight) VALUES (?,?,?,?,?)', taxJson.terms.insert[i].vid, taxJson.terms.insert[i].tid, taxJson.terms.insert[i].name, taxJson.terms.insert[i].desc, taxJson.terms.insert[i].weight);				
				}
			}
			if (taxJson.terms.update){
				db.execute('UPDATE term_data SET "name"='+ taxJson.terms.update[i].name +', "description"='+ taxJson.terms.update[i].desc +',  "weight"='+ taxJson.terms.update[i].weight +', "vid"='+ taxJson.terms.update[i].vid +'  WHERE "tid"='+taxJson.terms.update[i].tid);				
			}
			if (taxJson.terms["delete"]){
				for (var i = 0; i < taxJson.terms["delete"].length; i++ ){
					db.execute('DELETE FROM term_data WHERE "tid"='+taxJson.terms["delete"][i].tid);				
				}				
			}
		}
		installAcc();
	}

	//Connection error:
	taxConUP.onerror = function(e) {
			Ti.API.info("Services are down");
			label_status.text  = "Services are down at the moment, please try again later";
			hideIndicator();
	}
	taxConUP.send();

	function installAcc(){
		var objectsAccUP = win2.log;

		//Timeout until error:
		objectsAccUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsAccUP.open('GET', win2.picked + '/js-sync/account.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
		
		//Header parameters
		objectsAccUP.setRequestHeader("Content-Type", "application/json");

		objectsAccUP.onload = function(e) {
			//Parses account's response into strings
			var jsonAccount = JSON.parse(this.responseText);

			Ti.API.info("Account : "+ jsonAccount);	
			/*********** Accounts *************/
			if ( isFirstUpdate < 100000 ){
				Ti.API.info("First UPDATE! Inserting account 0");	
				db.execute('INSERT INTO account (nid, account_name) VALUES (?,?)', 0 , "Joseandro test");								
			}
	
			//Insert - Accounts
			if (jsonAccount.accounts.insert){
				Ti.API.info("Account insert's length : "+ jsonAccount.accounts.insert.length);
				Ti.API.info("Inserting Accounts:");
				for (var i = 0; i < jsonAccount.accounts.insert.length; i++ ){
					//Inserts into account table
					db.execute('INSERT INTO account (nid, account_name) VALUES (?,?)', jsonAccount.accounts.insert[i].nid, jsonAccount.accounts.insert[i].account_name);
					if (jsonAccount.accounts.insert[i].phone){
						for (var j = 0; jsonAccount.accounts.insert[i].phone.length; j++){
							db.execute('INSERT INTO field_phone (nid, extension, number, delta, type_tid) VALUES (?,?,?,?,?)', jsonAccount.accounts.insert[i].nid, jsonAccount.accounts.insert[i].phone[j].ext, jsonAccount.accounts.insert[i].phone[j].num, j ,  jsonAccount.accounts.insert[i].phone[j].type_tid);						
						}
					}
				}
				//if running first time inserts an account_nid = 0 (Api stills not filled properly)
				Ti.API.info("Inserted accounts sucefully!");				
			}
	
			//Update - Accounts
			if (jsonAccount.accounts.update){
				Ti.API.info("Account update's length : "+ jsonAccount.accounts.update.length);
				Ti.API.info("Updating Accounts:");
				for (var i = 0; i < jsonAccount.accounts.update.length; i++ ){
					//Updating account table
					db.execute('UPDATE account SET "account_name"='+jsonAccount.accounts.update[i].account_name +' WHERE  "nid"='+ jsonAccount.accounts.update[i].nid );
	
					//Updates phones relateds to current account's row
					if (jsonAccount.accounts.update[i].phone){
						for (var j = 0; jsonAccount.accounts.update[i].phone.length; j++){
							db.execute('UPDATE field_phone SET "extension"='+ jsonAccount.accounts.update[i].phone[j].ext +', "number"='+jsonAccount.accounts.update[i].phone[j].num +', "type_tid"='+jsonAccount.accounts.update[i].phone[j].type_tid+' WHERE "nid"='+jsonAccount.accounts.update[i].nid);						
						}
					}
				}
				Ti.API.info("Updated accounts sucefully!");
			}
			
			//Delete - Accounts
			if (jsonAccount.accounts["delete"])	{
				Ti.API.info("Account delete's length : "+ jsonAccount.accounts["delete"].length);
				Ti.API.info("Deleting Accounts");
	
				for (var i = 0; i <  jsonAccount.accounts["delete"].length; i++ ){
					//Delete referenced row in contacts
					db.execute('DELETE FROM contact WHERE "account_nid"='+jsonAccount.accounts["delete"][i].nid);
					
					//Deletes current row
					db.execute('DELETE FROM account WHERE "nid"='+jsonAccount.accounts["delete"][i].nid);
	
					//Delete phones relateds to current account's row
					if (jsonAccount.accounts["delete"][i].phone){
						for (var j = 0; jsonAccount.accounts["delete"][i].phone.length; j++){
							db.execute('DELETE FROM field_phone WHERE "nid"='+jsonAccount.accounts["delete"][i].nid);						
						}
					}
				}				
	
				Ti.API.info("Deleted accounts sucefully!");
			}
	
			installLeads();
		}
		//Connection error:
		objectsAccUP.onerror = function(e) {
			Ti.API.info("Services are down");
			label_status.text  = "Services are down at the moment, please try again later";
			hideIndicator();
		}		
		objectsAccUP.send();
	};

	function installLeads(){
		var objectsLeaUP = win2.log;
	
		//Timeout until error:
		objectsLeaUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsLeaUP.open('GET', win2.picked + '/js-sync/lead.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
		
		//Header parameters
		objectsLeaUP.setRequestHeader("Content-Type", "application/json");
	
		objectsLeaUP.onload = function(e) {
			//Parses lead's response into strings
			var jsonLead = JSON.parse(this.responseText);
			Ti.API.info("VEJA ->>>>   "+jsonLead);
			/*********** Leads *************/
			Ti.API.info("Insert Lead?  "+jsonLead.leads.insert);	
			Ti.API.info("Update Lead?  "+jsonLead.leads.update);
			Ti.API.info("Delete Lead?  "+jsonLead.leads["delete"]);						
			//Insert - Leads
			if (jsonLead.leads.insert){
				Ti.API.info("Account insert's length : "+ jsonLead.leads.insert.length);
				Ti.API.info("Inserting Leads:");
				for (var i = 0; i < jsonLead.leads.insert.length; i++ ){
	
					//Inserts a new person
					db.execute('INSERT INTO field_person (nid, full_name, first_name, last_name) VALUES (?,?,?,?)', jsonLead.leads.insert[i].nid, jsonLead.leads.insert[i].full_name, jsonLead.leads.insert[i].first_name, jsonLead.leads.insert[i].last_name);
	
					//Inserts into lead table
					db.execute('INSERT INTO lead (nid, company) VALUES (?,?)', jsonLead.leads.insert[i].nid, jsonLead.leads.insert[i].company);
	
					//Inserts new phones
					if (jsonLead.leads.insert[i].phone){
						for (var j = 0; jsonLead.leads.insert[i].phone.length; j++){
							db.execute('INSERT INTO field_phone (nid, extension, number, delta, type_tid) VALUES (?,?,?,?,?)', jsonLead.leads.insert[i].nid, jsonLead.leads.insert[i].phone[j].ext, jsonLead.leads.insert[i].phone[j].num, j ,  jsonLead.leads.insert[i].phone[j].type_tid);	
						}
					}
				}
				Ti.API.info("Inserted leads sucefully!");				
			}
	
			//Update - Leads
			if (jsonLead.leads.update){
				Ti.API.info("Lead update's length : "+ jsonLead.leads.update.length);
				Ti.API.info("Updating Leads");
				for (var i = 0; i < jsonLead.leads.update.length; i++ ){
	
					//Updating person table
					db.execute('UPDATE field_person SET "full_name"='+jsonLead.leads.update[i].full_name +', "first_name"='+jsonLead.leads.update[i].first_name +', "last_name"='+jsonLead.leads.update[i].last_name +' WHERE "nid"='+ jsonLead.leads.update[i].nid );								
	
					//Updating lead table
					db.execute('UPDATE lead SET "company"='+jsonLead.leads.update[i].company +' WHERE  "nid"='+ jsonLead.leads.update[i].nid );
	
					//Updates phones relateds to current account's row
					if (jsonLead.leads.update[i].phone){
						for (var j = 0; jsonLead.leads.update[i].phone.length; j++){
							db.execute('UPDATE field_phone SET "extension"='+ jsonLead.leads.update[i].phone[j].ext +', "number"='+jsonLead.leads.update[i].phone[j].num +', "type_tid"='+jsonLead.leads.update[i].phone[j].type_tid+' WHERE "nid"='+jsonLead.leads.update[i].nid);						
						}
					}
				}
				Ti.API.info("Updated Leads sucefully!");
			}
			
			//Delete - Leads
			if (jsonLead.leads["delete"])	{
				Ti.API.info("Lead delete's length : "+ jsonLead.leads["delete"].length);
				Ti.API.info("Deleting Leads");
	
				for (var i = 0; i <  jsonLead.leads["delete"].length; i++ ){
	
					//Deletes current row (person)
					db.execute('DELETE FROM field_person WHERE "nid"='+jsonLead.leads["delete"][i].nid);
	
					//Deletes current row (lead)
					db.execute('DELETE FROM lead WHERE "nid"='+jsonLead.leads["delete"][i].nid);
	
					//Delete phones relateds to current account's row
					if (jsonLead.leads["delete"][i].phone){
						for (var j = 0; jsonLead.leads["delete"][i].phone.length; j++){
							db.execute('DELETE FROM field_phone WHERE "nid"='+jsonLead.leads["delete"][i].nid);						
						}
					}
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
		var objectsConUP = win2.log;
	
		//Timeout until error:
		objectsConUP.setTimeout(10000);
		
		//Query web service to check timestamp
		objectsConUP.open('GET', win2.picked + '/js-sync/contact.json?timestamp=' + lastUpdate.fieldByName('timestamp'));
		
		//Header parameters
		objectsConUP.setRequestHeader("Content-Type", "application/json");

		//When connected
		objectsConUP.onload = function(e) {
			
			//Parses contat's response into strings
			var jsonContact = JSON.parse(this.responseText);
			
			Ti.API.info("VEJA ->>>>   "+jsonContact);
			
			/*********** Contacts *************/
			
			//Insert - Contacts
			if (jsonContact.contacts.insert){
	
				Ti.API.info("Contact insert's length : "+ jsonContact.contacts.insert.length);
				Ti.API.info("Inserting Contacts:");
	
				for (var i = 0; i < jsonContact.contacts.insert.length; i++ ){
	
					//Inserts a new person
					db.execute('INSERT INTO field_person (nid, full_name, first_name, last_name) VALUES (?,?,?,?)', jsonContact.contacts.insert[i].nid, jsonContact.contacts.insert[i].full_name, jsonContact.contacts.insert[i].first_name, jsonContact.contacts.insert[i].last_name);
	
					//Inserts into lead table
					//New version:
					//db.execute('INSERT INTO contact (nid, account_nid) VALUES (?,?)', jsonContact.contacts.insert[i].nid, jsonContact.contacts.insert[i].account_nid);
					//Old version: 
					db.execute('INSERT INTO contact (nid, account_nid) VALUES (?,?)', jsonContact.contacts.insert[i].nid, 0);

					Ti.API.info("Inserting contact with name: "+jsonContact.contacts.insert[i].full_name);
												
					//Inserts new phones
					if (jsonContact.contacts.insert[i].phone){
						for (var j = 0; j < jsonContact.contacts.insert[i].phone.length; j++){
							Ti.API.info("Inserting Phone: "+jsonContact.contacts.insert[i].phone[j]['num']);
							db.execute('INSERT INTO field_phone (nid, extension, number, delta, type_tid) VALUES (?,?,?,?,?)', jsonContact.contacts.insert[i].nid, jsonContact.contacts.insert[i].phone[j]['ext'], jsonContact.contacts.insert[i].phone[j].num, j ,  jsonContact.contacts.insert[i].phone[j].type_tid);
						}
					}
				}
				Ti.API.info("Inserted contacts sucefully!");				
			}
	
			//Update - Contacts
			if (jsonContact.contacts.update){
				Ti.API.info("Contacts update's length : "+ jsonContact.contacts.update.length);
				Ti.API.info("Updating Contacts");
				for (var i = 0; i < jsonContact.contacts.update.length; i++ ){
	
					//Updating person table
					db.execute('UPDATE field_person SET "full_name"='+jsonContact.contacts.update[i].full_name +', "first_name"='+jsonContact.contacts.update[i].first_name +', "last_name"='+jsonContact.contacts.update[i].last_name +' WHERE "nid"='+ jsonContact.contacts.update[i].nid );								
					Ti.API.info("Updating contact with name: "+jsonContact.contacts.update[i].full_name);
					//Updating lead table
					//New Version:
					//db.execute('UPDATE contact SET "account_nid"='+jsonContact.contacts.update[i].account_nid +' WHERE  "nid"='+ jsonContact.contacts.update[i].nid );
					//Old Version:
					if ( jsonContact.contacts.update[i].accound_nid){
						db.execute('UPDATE contact SET "account_nid"=0 WHERE  "nid"='+ jsonContact.contacts.update[i].nid );
					}
					
					//Updates phones relateds to current account's row
					if (jsonContact.contacts.update[i].phone){
						for (var j = 0; jsonContact.contacts.update[i].phone.length; j++){
							db.execute('UPDATE field_phone SET "extension"='+ jsonContact.contacts.update[i].phone[j].ext +', "number"='+jsonContact.contacts.update[i].phone[j].num +', "type_tid"='+jsonContact.contacts.update[i].phone[j].type_tid+' WHERE "nid"='+jsonContact.contacts.update[i].nid);						
						}
					}
				}
				Ti.API.info("Updated Contacts sucefully!");
			}
			
			//Delete - Contacts
			if (jsonContact.contacts["delete"])	{
				Ti.API.info("Contact delete's length : "+ jsonContact.contacts["delete"].length);
				Ti.API.info("Deleting Contacts");
	
				for (var i = 0; i <  jsonContact.contacts["delete"].length; i++ ){
	
					//Deletes current row (person)
					db.execute('DELETE FROM field_person WHERE "nid"='+jsonContact.contacts["delete"][i].nid);
	
					//Deletes current row (contact)
					db.execute('DELETE FROM contact WHERE "nid"='+jsonContact.contacts["delete"][i].nid);
					Ti.API.info("Deleting contact with nid: "+jsonContact.contacts["delete"][i].nid);
	
					//Delete phones relateds to current contact's row
					if (jsonContact.contacts["delete"][i].phone){
						for (var j = 0; j < jsonContact.contacts["delete"][i].phone.length; j++){
							Ti.API.info("Deleting phone: ");
							db.execute('DELETE FROM field_phone WHERE "nid"='+jsonContact.contacts["delete"][i].nid);						
						}
					}
				}				
	
				Ti.API.info("Deleted Contacts sucefully!");
			}
								
		label_status.text = "Database updated";
		db.execute('UPDATE updated SET "timestamp"='+ syncTime +' WHERE "rowid"=1');
		hideIndicator();
		//close select statement
		lastUpdate.close();

		}
		//Connection error:
		objectsConUP.onerror = function(e) {
			lastUpdate.close();
			Ti.API.info("Services are down");
			version = "Services are down at the moment, please try again later";
			hideIndicator();
		}
	
		//Sending information and try to connect
		objectsConUP.send();
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


//Sets only portrait mode
win2.orientationModes = [ Titanium.UI.PORTRAIT ];

//Ti.App.Properties.removeProperty('update');
//When back button on the phone is pressed, it alerts the user (pop up box)
// that he needs to log out in order to go back to the root window
win2.addEventListener('android:back', function() {
	Ti.API.info("Use log off button");
	alert("In order to log off, please click on the X next to your username at the top ");
});

//checkUpdate();

//Check behind the courtins if there is a new version - 5 minutes
setInterval(checkUpdate, 300000);