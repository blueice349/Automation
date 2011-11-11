/**
 * Name: functions.js
 * Provides:
 * 		Functions used by the app
 * @author Joseandro
 */

/* Function Name: showIndicator(show)
 * Purpouse: Show the loading screen
 * Parameters: 
 * 	show:   Used to decide if the loading screen should be modal or
 * 			full screen.
 * Variables: 
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	indView: The view that contains actInd.
 * 	actInd:  Activity indicator.  
 *  
 */
function showIndicator(show)
{
	Titanium.App.Properties.setBool("indicatorActive", true);
 
    // window container
    if ( show == 'modal'){ 
    indWin = Titanium.UI.createWindow({
        modal: true,
        opacity: 0.9,
        backgroundColor: '#000000'
    });
    }
    else{ 
	    indWin = Titanium.UI.createWindow({
	        fullscreen: true
	    });
    }
 
    // black view
    var indView = Titanium.UI.createView({
        height: '32%',
        width: '70%',
        backgroundColor:'#000',
        borderRadius:10,
        opacity:0.9
    });
 
    indWin.add(indView);
 
    // loading indicator
    actInd = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actInd);
    
    if ( show == "settings")
    {
    	
	    var pb=Titanium.UI.createProgressBar({
		    width:"90%",
		    min:0,
		    max:100,
		    value:0,
		    top: "75%",
		    color:'#fff',
		    message:'Installing Updates',
		    font:{fontSize:14, fontWeight:'bold'}
		});
	 	
	 	indWin.add(pb);

		function updateStatus(){
			if (Titanium.App.Properties.getInt("maxIndex", 0) <= 0 ){
				pb.value = 100;
			}
			else
			{
				if ((Titanium.App.Properties.getInt("index") == 0) && (Titanium.App.Properties.getInt("maxIndex") == 1)){
					pb.value = 50;
				}
				else{
					pb.value = (Titanium.App.Properties.getInt("index")*100/Titanium.App.Properties.getInt("maxIndex") );					
				}
			}

		}
		var timer = setInterval(updateStatus, 500);

		
	} 	
	else
	{
		// message
	    var message = Titanium.UI.createLabel({
	        text:'Communicating with' + '\n' + 'the server...',
	        color:'#fff',
	        width:'auto',
	        height:'auto',
	        textAlign:'center',
	        font:{fontFamily:'Helvetica Neue',fontWeight:'bold'},
	        top:'67%'
	    });
    	indWin.add(message);
	}

	indWin.orientationModes = [ Titanium.UI.PORTRAIT ];
    indWin.open();
    actInd.show();
};

function showIndicatorDelete(inform)
{
	Titanium.App.Properties.setBool("indicatorActive", true);
 
    // window container

    indWin = Titanium.UI.createWindow({
        modal: true,
        opacity: 0.9,
        backgroundColor: '#000000'
    });
 
    // black view
    var indView = Titanium.UI.createView({
        height: '32%',
        width: '70%',
        backgroundColor:'#000',
        borderRadius:10,
        opacity:0.9
    });
 
    indWin.add(indView);
 
    // loading indicator
    actInd = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actInd);
    
	// message
    var message = Titanium.UI.createLabel({
        text: inform,
        color:'#fff',
        width:'auto',
        height:'auto',
        textAlign:'center',
        font:{fontFamily:'Helvetica Neue',fontWeight:'bold'},
        top:'67%'
    });
	indWin.add(message);

	indWin.orientationModes = [ Titanium.UI.PORTRAIT ];
    indWin.open();
    actInd.show();
};



/* Function Name: hideIndicator()
 * Purpouse: Close the loading screen
 * Parameters: none
 * Variables: 
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	actInd:  Activity indicator.  
 *  
 */

function hideIndicator()
{
    actInd.hide();
    indWin.close();
    Titanium.App.Properties.setBool("indicatorActive", false);
};

function hideIndicatorFistPage()
{
    setInterval(function (){
    	if (Titanium.App.Properties.getBool("isFirstPage"))
    	{
		    actInd.hide();
		    indWin.close();
    	}
   	}, 1000);
};


/* Function Name: sortTableView( a, b)
 * Purpouse: Sort arrays
 * Parameters: 
 * 	a:   Previous object in the array.
 *  b: 	 Next object in the array.
 * Variables: none 
 *  
 */

function sortTableView( a, b)  
{  
  if (a.name < b.name)  
     return -1;  
  if (a.name > b.name)  
     return 1;  
  // a must be equal to b  
  return 0;  
};

/* Function Name: (actualWindow, goToWindow )
 * Purpouse: Show button Back at the bottom and close actualWindow and go to goToWindow
 * Parameters: 
 * 	actualWindow:   The windows where the function was called from.
 *  goToWindow: 	The target window (The window where the user is gonna be redirected)
 * Variables: 
 *  backView:		The bottom button
 *  label_bottom:   Label "Back"
 */
function showBottom(actualWindow, goToWindow ){
	var backView = Titanium.UI.createView({
		top: '95%',	
		backgroundColor:'#111',
		height: '6%',
		width: '100%',
		opacity: 0.99,
		borderRadius:5
	});
	
	var label_bottom = Titanium.UI.createLabel({
		color:'#FFFFFF',
		text:'Back',
		textAlign: 'center',
		height: 'auto'
	}); 
	
	
	backView.add(label_bottom);
	
	backView.addEventListener('click', function(){
		goToWindow.log = actualWindow.log;
    	goToWindow.picked = actualWindow.picked;
    	goToWindow.result = actualWindow.result;
		goToWindow.name = actualWindow.name;
		
		if (actualWindow.returnTo == "individual_contacts.js"){
			goToWindow.nid = actualWindow.nidToReturn;
			goToWindow.nameSelected = actualWindow.nameToReturn;
		}

		//Avoiding memory leaking problems:	
		if (!goToWindow.notOpen)
			goToWindow.open();
		
		actualWindow.close();
	});					
	actualWindow.add(backView);
};

//Install new updates using pagination
//Load existing data with pagination
function installMe(pageIndex, win, timeIndex, calledFrom)
{
	if ((calledFrom == "settings") && (pageIndex == 0))
	{
		Titanium.App.Properties.setInt("index",    0);
		Titanium.App.Properties.setInt("maxIndex",    100);
		showIndicator("settings");
	}	
	
	if ((calledFrom == "mainMenu") && isFirstTime){
		bFirst.enabled  = false;
		bSecond.enabled = false;
		bThird.enabled  = false;
		bFourth.enabled = false;
		bFiveth.enabled = false;												
	}
	
	var objectsUp = win.log;

	//Timeout until error:
	objectsUp.setTimeout(10000);

	Ti.API.info("Current page: "+ pageIndex);
	//Opens address to retrieve contact list

	if (pageIndex == 0 )   
		objectsUp.open('GET', win.picked + '/js-sync/sync.json?timestamp=' + timeIndex +'&reset=1&limit=50' );
	else
		objectsUp.open('GET', win.picked + '/js-sync/sync.json?timestamp=' + timeIndex +'&page='+pageIndex+'&limit=50');
	
	//Header parameters
	objectsUp.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsUp.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		var existsMorePages;
		
		pageIndex++;

		Ti.API.info("Max page integer: "+parseInt(json.max_page));
		Ti.API.info("Current page integer: "+parseInt(json.page));
				
		Titanium.App.Properties.setInt("maxIndex", parseInt(json.max_page));
		Titanium.App.Properties.setInt("index",    parseInt(json.page));
		
		//If it is the end
		if ( (json.page == json.max_page) || json.max_page == -1 )
			existsMorePages = false;
		else
			existsMorePages = true;	
		
		Ti.API.info("Current page: "+json.page);
		Ti.API.info("Maximum pages: "+json.max_page);
		Ti.API.info("Exist more pages? "+existsMorePages);
		Ti.API.info("Next page (no limit): "+pageIndex);
		
		
		//If Database is already last version
		if ( json.current_page_item_count == 0 ){
			
			if ( calledFrom == "mainMenu"){
					Ti.API.info('Called from value: '+calledFrom);
					if (isFirstTime){
						bFirst.enabled = true;
						bSecond.enabled = true;
						bThird.enabled = true;
						bFourth.enabled = true;
						bFiveth.enabled = true;												
					}
					isFirstTime = false;
			}
			
			//Success
			Titanium.App.Properties.setBool("succesSync", true);
			Ti.API.info("SUCCESS -> No items ");
			if (( calledFrom == "settings") && !existsMorePages){
				setInterval(function(){
						hideIndicator();
					}, 3000);	
			}
		}
		else
		{
			if ( calledFrom == "mainMenu"){
					if (isFirstTime){
						db.execute('UPDATE updated SET "url"="'+ win.picked +'" WHERE "rowid"=1');						
					}
			}

			db.execute('UPDATE updated SET "timestamp"='+ json.request_time +' WHERE "rowid"=1');		
			Ti.API.info("COUNT: "+json.total_item_count);	
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
			
			if (json.account){
				//Insert - Accounts
				if (json.account.insert){
					for (var i = 0; i < json.account.insert.length; i++ ){
						//Inserts into account table
						Ti.API.info("Phone Account: "+ json.account.insert[i].phone);
						db.execute('INSERT INTO account (nid, name, account_type_tid, parent_account_nid, website, phone, fax, description) VALUES (?,?,?,?,?,?,?,?)', json.account.insert[i].nid,json.account.insert[i].name, json.account.insert[i].account_type_tid, json.account.insert[i].account_nid, json.account.insert[i].website, json.account.insert[i].phone, json.account.insert[i].fax, json.account.insert[i].description);
					}
					Ti.API.info("Inserted account sucefully!");				
				}
				
				//Update - Accounts
				if (json.account.update){
					for (var i = 0; i < json.account.update.length; i++ ){
						//Updating account table
						db.execute('UPDATE account SET "name"=?, "account_type_tid"=?, "parent_account_nid"=?, "website"=?, "phone"=?, "fax"=?, "description"=? WHERE  "nid"=?', json.account.update[i].name, json.account.update[i].account_type_tid, json.account.update[i].account_nid, json.account.update[i].website, json.account.update[i].phone, json.account.update[i].fax, json.account.update[i].description, json.account.update[i].nid );
					}
					Ti.API.info("Updated account sucefully!");
				}
				
				//Delete - Accounts
				if (json.account["delete"])	{
					//Ti.API.info("Deleting Accounts");
					for (var i = 0; i <  json.account["delete"].length; i++ ){
						//Deletes current row
						db.execute('DELETE FROM account WHERE "nid"=?',json.account["delete"][i].nid);
					}				
					Ti.API.info("Deleted account sucefully!");
				}
			}
			
			if (json.lead){
				//Insert - Leads
				if (json.lead.insert){
					for (var i = 0; i < json.lead.insert.length; i++ ){
						//Inserts a new person
						db.execute('INSERT INTO lead (nid, first_name, last_name, job_title_tid, lead_status_tid, lead_source_tid, competing_company_tid, company, phone, cell_phone, fax, email, description, website) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', json.lead.insert[i].nid, json.lead.insert[i].first_name, json.lead.insert[i].last_name, json.lead.insert[i].job_title_tid, json.lead.insert[i].lead_status_tid, json.lead.insert[i].lead_source_tid, json.lead.insert[i].competing_company_tid, json.lead.insert[i].company, json.lead.insert[i].phone, json.lead.insert[i].cell_phone, json.lead.insert[i].fax, json.lead.insert[i].email, json.lead.insert[i].description, json.lead.insert[i].website);
					}
					Ti.API.info("Inserted lead sucefully!");				
				}
		
				//Update - Leads
				if (json.lead.update){
					for (var i = 0; i < json.lead.update.length; i++ ){
						//Updating lead table
						db.execute('UPDATE lead SET "first_name"=?, "last_name"=?, "job_title_tid"=?, "lead_status_tid"=?, "lead_source_tid"=?, "competing_company_tid"=?, "company"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=?, "website"=? WHERE  "nid"=?', json.lead.update[i].first_name, json.lead.update[i].last_name, json.lead.update[i].job_title_tid, json.lead.update[i].lead_status_tid, json.lead.update[i].lead_source_tid, json.lead.update[i].competing_company_tid, json.lead.update[i].company, json.lead.update[i].phone, json.lead.update[i].cell_phone, json.lead.update[i].fax, json.lead.update[i].email, json.lead.update[i].description, json.lead.update[i].website , json.lead.update[i].nid );
					}
					Ti.API.info("Updated Leads sucefully!");
				}
				
				//Delete - Leads
				if (json.lead["delete"])	{
					for (var i = 0; i <  json.lead["delete"].length; i++ ){
						//Deletes current row (lead)
						db.execute('DELETE FROM lead WHERE "nid"=?',json.lead["delete"][i].nid);
					}				
					Ti.API.info("Deleted Leads sucefully!");
				}

			}
			
			/*********** Contacts *************/
			if (json.contact){
				//Insert - Contacts
				if (json.contact.insert){
					for (var i = 0; i < json.contact.insert.length; i++ ){
						db.execute('INSERT INTO contact (nid, first_name, last_name, account_nid, lead_source, job_title_tid, phone, cell_phone, fax, email, description ) VALUES (?,?,?,?,?,?,?,?,?,?,?)', json.contact.insert[i].nid, json.contact.insert[i].first_name, json.contact.insert[i].last_name, json.contact.insert[i].account_nid, json.contact.insert[i].lead_source_tid, json.contact.insert[i].job_title_tid, json.contact.insert[i].phone, json.contact.insert[i].cell_phone, json.contact.insert[i].fax, json.contact.insert[i].email, json.contact.insert[i].description );
					}
					Ti.API.info("Inserted contact sucefully!");				
				}
		
				//Update - Contacts
				if (json.contact.update){
					for (var i = 0; i < json.contact.update.length; i++ ){
						db.execute('UPDATE contact SET "first_name"=?, "last_name"=?, "account_nid"=? , "lead_source"=? , "job_title_tid"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=? WHERE "nid"=?', json.contact.update[i].first_name , json.contact.update[i].last_name , json.contact.update[i].account_nid , json.contact.update[i].lead_source_tid , json.contact.update[i].job_title_tid , json.contact.update[i].phone , json.contact.update[i].cell_phone , json.contact.update[i].fax , json.contact.update[i].email , json.contact.update[i].description , json.contact.update[i].nid );
					}
					Ti.API.info("Updated Contacts sucefully!");
				}
				
				//Delete - Contacts
				if (json.contact["delete"])	{
					for (var i = 0; i <  json.contact["delete"].length; i++ ){
						//Deletes current row (contact)
						db.execute('DELETE FROM contact WHERE "nid"=?', json.contact["delete"][i].nid);
					}				
					Ti.API.info("Deleted Contacts sucefully!");
				}
			}

			/*********** Potentials *************/
			if(json.potential){
				//Insert - Potentials
				if (json.potential.insert){
					for (var i = 0; i < json.potential.insert.length; i++ ){
						db.execute('INSERT INTO potential (nid, name, account_nid, potential_stage_tid, competing_company_tid, potential_type_tid, closing_date, next_step, description ) VALUES (?,?,?,?,?,?,?,?,?)', json.potential.insert[i].nid, json.potential.insert[i].name, json.potential.insert[i].account_nid, json.potential.insert[i].potential_stage_tid, json.potential.insert[i].competing_company_tid, json.potential.insert[i].potential_type_tid, json.potential.insert[i].closing_date, json.potential.insert[i].next_step, json.potential.insert[i].description);
					}
					Ti.API.info("Inserted potential sucefully!");				
				}
	
				//Update - Contacts
				if (json.potential.update){
					for (var i = 0; i < json.potential.update.length; i++ ){
						db.execute('UPDATE potential SET "name"=? , "account_nid"=?, "potential_stage_tid"=?, "competing_company_tid"=?, "potential_type_tid"=?, "closing_date"=?, "next_step"=?, "description"=? WHERE "nid"=?', json.potential.update[i].name, json.potential.update[i].account_nid, json.potential.update[i].potential_stage_tid, json.potential.update[i].competing_company_tid, json.potential.update[i].potential_type_tid, json.potential.update[i].closing_date, json.potential.update[i].next_step, json.potential.update[i].description, json.potential.update[i].nid );
					}
					Ti.API.info("Updated Potentials sucefully!");
				}
				
				//Delete - Contacts
				if (json.potential["delete"])	{
					for (var i = 0; i <  json.potential["delete"].length; i++ ){
						//Deletes current row (contact)
						db.execute('DELETE FROM potential WHERE "nid"=?', json.potential["delete"][i].nid);
					}
					Ti.API.info("Deleted Potentials sucefully!");
				}
			}
			Ti.API.info("SUCCESS");
			if ( existsMorePages ){
				installMe(pageIndex, win, timeIndex, calledFrom);
			}
				
			else{
				if ( calledFrom == "settings")
					hideIndicator();
				else{
					Ti.API.info('Called from value: '+calledFrom);
					if (isFirstTime){
						bFirst.enabled = true;
						bSecond.enabled = true;
						bThird.enabled = true;
						bFourth.enabled = true;
						bFiveth.enabled = true;												
					}
					isFirstTime = false;
					label_status.text = version;
										
				}

				Titanium.App.Properties.setBool("UpRunning", false);
				//Success
				Titanium.App.Properties.setBool("succesSync", true);
			}

		}
	}
	//Connection error:
	objectsUp.onerror = function(e) {
		Ti.API.info("Services are down");
		if ( calledFrom == "settings")
			hideIndicator();
		else{
			Ti.API.info('Called from value: '+calledFrom);
			label_status.text = version;					
		}
		Titanium.App.Properties.setBool("UpRunning", false);
		//Failure
		Titanium.App.Properties.setBool("succesSync", false);
	}
	//Sending information and try to connect
	objectsUp.send();
}

