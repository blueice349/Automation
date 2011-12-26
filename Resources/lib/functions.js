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
 * 	indView: The view that contains actIndFun.
 * 	actIndFun:  Activity indicator.  
 *  
 */
function showIndicator(show)
{
	Titanium.App.Properties.setBool("indicatorActive", true);
 
    // window container
    if ( show == 'modal'){ 
    indWin = Titanium.UI.createWindow({
        modal: true,
    	title:'Omadi CRM',
        opacity: 0.9,
        backgroundColor: '#000000'
    });
    }
    else{ 
	    indWin = Titanium.UI.createWindow({
    		title:'Omadi CRM',
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
    actIndFun = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actIndFun);
    
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
    actIndFun.show();
};

function fireStatusFirstInstall(){
	
	var firstRound = true;
	
   	var a1 = Titanium.UI.createAnimation();
	a1.bottom =  -1*Ti.Platform.displayCaps.platformHeight*0.1;
	a1.duration = 1000;

   	var a2 = Titanium.UI.createAnimation();
	a2.bottom = 0;
	a2.duration = 1000;


    // black view
    var indView = Titanium.UI.createView({
        height: '8%',
        width: '100%',
        backgroundColor:'#111',
        opacity:0.9,
        bottom: -1*Ti.Platform.displayCaps.platformHeight*0.1,
    });

    Ti.UI.currentWindow.add(indView);
    
    databaseStatusView.animate(a1);
	
	setTimeout (function (){
		indView.animate(a2);
	}, 700);
   	
    var pb=Titanium.UI.createProgressBar({
	    width:"70%",
	    min:0,
	    max:100,
	    value:0,
	    color:'#fff',
	    message:'Installing Updates',
	    font:{fontSize:14}
	});
 	
 	indView.add(pb);
	
	var alreadyAnimating = false;
	
	function updateStatus(){
		if (Titanium.App.Properties.getInt("maxIndex", 0) < 0 ){
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
		
		if ((pb.value == 100 ) && (!alreadyAnimating)){
			clearInterval(timer);
			firstRound = false;
			alreadyAnimating = true;
			indView.animate(a1);
			setTimeout (function (){
				databaseStatusView.animate(a2);
			}, 700);

		}

	}
	var timer = setInterval(updateStatus, 1500);
	
}


function showIndicatorDelete(inform)
{
	Titanium.App.Properties.setBool("indicatorActive", true);
 
    // window container

    indWin = Titanium.UI.createWindow({
        title:'Omadi CRM',
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
    actIndFun = Titanium.UI.createActivityIndicator({
        height:'7%',
        message: "Loading ...",
        width: '30%'
    });
    
    indWin.add(actIndFun);
    
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
    actIndFun.show();
};



/* Function Name: hideIndicator()
 * Purpouse: Close the loading screen
 * Parameters: none
 * Variables: 
 * 	indWin:  Window that is supposed to contain the loading screen
 * 			 modal or fullscreen.
 * 	actIndFun:  Activity indicator.  
 *  
 */

function hideIndicator()
{
    actIndFun.hide();
    indWin.close();
    Titanium.App.Properties.setBool("indicatorActive", false);
};

function hideIndicatorFistPage()
{
    setInterval(function (){
    	if (Titanium.App.Properties.getBool("isFirstPage"))
    	{
		    actIndFun.hide();
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
		if (!goToWindow.notOpen){
			goToWindow.log = actualWindow.log;
	    	goToWindow.picked = actualWindow.picked;
	    	goToWindow.result = actualWindow.result;
			goToWindow.name = actualWindow.name;
		}
		
		if ((actualWindow.returnTo == "individual_contact.js") || (actualWindow.returnTo == "individual_potential.js") ){
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
	
	var objectsUp = win.log;

	//Timeout until error:
	objectsUp.setTimeout(10000);

	Ti.API.info("Current page: "+ pageIndex);
	//Opens address to retrieve contact list
	Ti.API.info("TIME: "+timeIndex);

	if (timeIndex == 0 ){
		objectsUp.open('GET', win.picked + '/js-sync/sync.json?timestamp=' + timeIndex +'&reset=1&limit=35&page='+pageIndex );
		Ti.API.info("First EXECUTION");
	}
	else
		objectsUp.open('GET', win.picked + '/js-sync/sync.json?timestamp=' + timeIndex +'&reset=0&limit=35&page='+pageIndex );
	
	//Header parameters
	objectsUp.setRequestHeader("Content-Type", "application/json");

	//When connected
	objectsUp.onload = function(e) {
		//Parses response into strings
		var json = JSON.parse(this.responseText);
		var existsMorePages;
		
		Ti.API.info("JSON: "+json);
		Ti.API.info("Delete all value: "+json.delete_all);
		
		if (json.delete_all == true){
			Ti.API.info("=================== ############ ===================");
			Ti.API.info("Reseting database, delete_all is required");
			Ti.API.info("=================== ############ ===================");
			//If delete_all is present, delete all contents:
			//db.execute('DELETE FROM account');
			db.execute('DROP TABLE IF EXISTS account');
			db.execute('CREATE TABLE account');
			
			db.execute('DROP TABLE IF EXISTS contact');
			db.execute('CREATE TABLE contact');

			db.execute('DROP TABLE IF EXISTS lead');
			db.execute('CREATE TABLE lead');
			
			db.execute('DROP TABLE IF EXISTS node');
			db.execute('CREATE TABLE node');
						
			db.execute('DROP TABLE IF EXISTS potential');
			db.execute('CREATE TABLE potential');
						
			db.execute('DROP TABLE IF EXISTS task');
			db.execute('CREATE TABLE task');
						
			db.execute('DROP TABLE IF EXISTS term_data');
			db.execute('CREATE TABLE term_data');
						
			db.execute('DROP TABLE IF EXISTS updated');
			db.execute('CREATE TABLE updated');
						
			db.execute('DROP TABLE IF EXISTS users');
			db.execute('CREATE TABLE users');
						
			db.execute('DROP TABLE IF EXISTS vocabulary');
			db.execute('CREATE TABLE vocabulary');
						
			db.execute('INSERT INTO updated (timestamp, url) VALUES (?,?)', 0 , null);		
		}
		
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
		if ( json.total_item_count == 0 ){
			
			if ( calledFrom == "mainMenu"){
					Ti.API.info('Called from value: '+calledFrom);
					isFirstTime = false;
			}
			db.execute('UPDATE updated SET "timestamp"='+ json.request_time +' WHERE "rowid"=1');
			//Success
			Titanium.App.Properties.setBool("succesSync", true);
			Ti.API.info("SUCCESS -> No items ");
			if (( calledFrom == "settings") && !existsMorePages){
				setInterval(function(){
						hideIndicator();
					}, 2000);	
			}
		}
		else
		{
			if ( calledFrom == "mainMenu"){
					if ((isFirstTime) && (pageIndex==1)){
						db.execute('UPDATE updated SET "url"="'+ win.picked +'" WHERE "rowid"=1');						
					}
			}
			//pageIndex == 1 means first load, pageIndex is incremented some lines above
			if (pageIndex == 1 ){
				db.execute('UPDATE updated SET "timestamp"='+ json.request_time +' WHERE "rowid"=1');				
			}   
			Ti.API.info("COUNT: "+json.total_item_count);	
			
			//Fields:
			if (json.fields){
				if (json.fields.insert){
					if (json.fields.insert.length){
						for (var i = 0; i < json.fields.insert.length; i++ ){
							var var_widget = JSON.stringify(json.fields.insert[i].widget);
							var var_settings = JSON.stringify(json.fields.insert[i].settings); 
							//Insert into fields
							//Ti.API.info("Fid: "+json.fields.insert[i].fid +", Type: "+ json.fields.insert[i].type +", Field name: "+ json.fields.insert[i].field_name +", Label: "+ json.fields.insert[i].label +", Description: "+ json.fields.insert[i].description +", Bundle: "+ json.fields.insert[i].bundle +", Weight: "+ json.fields.insert[i].weight +", Required: "+ json.fields.insert[i].required +", Var_widget: "+ var_widget +", Var_settings: "+ var_settings );
							//db.execute('INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES (?,?,?,?,?,?,?,?,?,?)', json.fields.insert[i].fid , json.fields.insert[i].type , json.fields.insert[i].field_name , json.fields.insert[i].label , json.fields.insert[i].description , json.fields.insert[i].bundle , json.fields.insert[i].weight, json.fields.insert[i].required , var_widget , var_settings );
							var fid = json.fields.insert[i].fid;
							Ti.API.info("Index: "+fid);
							
							
							if (json.fields.insert[i].type != null )
								var type = json.fields.insert[i].type.replace(/'/gi, '"');
							else
								var type = null;
							
							if (json.fields.insert[i].field_name != null)
								var field_name = json.fields.insert[i].field_name.replace(/'/gi, '"');
							else
								var field_name = null;
							
							if (json.fields.insert[i].label != null)
								var label = json.fields.insert[i].label.replace(/'/gi, '"');
							else
								var label = null;
									
							if (json.fields.insert[i].description != null)
								var description = json.fields.insert[i].description.replace(/'/gi, '"');
							else
								var description = null;
							
							if (json.fields.insert[i].bundle != null )		
								var bundle = json.fields.insert[i].bundle.replace(/'/gi, '"');
							else
								var bundle = null;
							
							if (json.fields.insert[i].weight != null)		
								var weight = json.fields.insert[i].weight;
							else
								var weight = null;
							
							if (json.fields.insert[i].required != null)
								var required = json.fields.insert[i].required;
							else
								var required = null;
							
							if (var_widget != null)
								var widget = var_widget.replace(/'/gi, '"');
							else
								var widget = null;	
							
							if (var_settings != null)
								var settings = var_settings.replace(/'/gi, '"');
							else
								var settings = null;

							db.execute("INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES ("+fid+",'"+type+"','"+field_name+"','"+label+"','"+description+"','"+bundle+"',"+weight+", '"+required+"','"+widget+"','"+settings+"' )");
							//Insert into bundles
							db.execute('INSERT INTO bundles (fid, bundle_name) VALUES ('+fid+',"'+bundle+'")' );
							
							var type = "";
							switch(json.fields.insert[i].type){
								case "taxonomy_term_reference":
								case "term_reference":
								case "datestamp":
								case "number_integer":
									type = "INTEGER"
								break;
								
								case "number_decimal":
									type = "REAL"
								break;
								
								default:
									type = "TEXT";
								break;
							}
							
							switch(json.fields.insert[i].bundle){
								case "lead":
								case "contact":
								case "potential":
								case "account":
								case "task":
								case "boot":
									db.execute('ALTER TABLE '+json.fields.insert[i].bundle+' ADD '+json.fields.insert[i].field_name+' '+ type);
								break;
							}

						}
					}
					else{
						var var_widget = JSON.stringify(json.fields.insert.widget);
						var var_settings = JSON.stringify(json.fields.insert.settings); 

						//Insert into fields
						db.execute('INSERT INTO fields (fid, type, field_name, label, description, bundle, weight, required, widget, settings) VALUES (?,?,?,?,?,?,?,?,?,?)', json.fields.insert.fid , json.fields.insert.type , json.fields.insert.field_name , json.fields.insert.label , json.fields.insert.description , json.fields.insert.bundle , json.fields.insert.weight, json.fields.insert.required , "var_widget", "var_settings" );

						//Insert into bundles
						db.execute('INSERT INTO bundles (fid, bundle_name) VALUES (?,?)', json.fields.insert.fid,  json.fields.insert.bundle );
						
						var type = "";
						switch(json.fields.insert.type){
							case "taxonomy_term_reference":
							case "term_reference":
							case "datestamp":
							case "number_integer":
								type = "INTEGER"
							break;
							
							case "number_decimal":
								type = "REAL"
							break;
							
							default:
								type = "TEXT";
							break;
						}
						
						switch(json.fields.insert.bundle){
							case "lead":
							case "contact":
							case "potential":
							case "account":
							case "task":
							case "boot":
								db.execute('ALTER TABLE '+json.fields.insert.bundle+' ADD '+json.fields.insert.field_name+' '+ type);
							break;
						}
					}
				}
				if (json.fields.update){
					if (json.fields.update.length){
						for (var i = 0; i < json.fields.update.length; i++ ){
							var_widget = JSON.stringify(json.fields.update[i].widget);
							var_settings = JSON.stringify(json.fields.update[i].settings); 
							db.execute('UPDATE fields SET "type"=?, "field_name"=?, "label"=?, "description"=?, "bundle"=?, "weight"=?, "required"=?, "widget"=?, "settings"=? WHERE "fid"=?', json.fields.insert[i].type , json.fields.insert[i].field_name , json.fields.insert[i].label , json.fields.insert[i].description , json.fields.insert[i].bundle , json.fields.insert[i].weight, json.fields.insert[i].required , var_widget , var_settings, json.fields.insert[i].fid );
						}
					}
					else{
							var_widget = JSON.stringify(json.fields.update.widget);
							var_settings = JSON.stringify(json.fields.update.settings); 
							db.execute('UPDATE fields SET "type"=?, "field_name"=?, "label"=?, "description"=?, "bundle"=?, "weight"=?, "required"=?, "widget"=?, "settings"=? WHERE "fid"=?', json.fields.insert.type , json.fields.insert.field_name , json.fields.insert.label , json.fields.insert.description , json.fields.insert.bundle , json.fields.insert.weight, json.fields.insert.required , var_widget, var_settings, json.fields.insert.fid );
					}
				}
				
				/*
				 * Delete fields from fields table
				 * Not implemented yet from the server side
				 */
				/*
				if (json.fields["delete"]){
					if (json.fields["delete"].length){
						for (var i = 0; i < json.fields["delete"].length; i++ ){
							//Deletes rows from terms
							db.execute('DELETE FROM fields WHERE "fid"=?',json.fields["delete"][i].vid);											
						}
					}
					else{
						//Deletes row from terms
						db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"].vid);							
						
						//Deletes corresponding row in vocabulary
						db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"].vid);				
					}
				}
				*/
				
			} 
			
			//Vocabulary:
			if (json.vocabularies){
				if (json.vocabularies.insert){
					if (json.vocabularies.insert.length){
						for (var i = 0; i < json.vocabularies.insert.length; i++ ){
							db.execute('INSERT INTO vocabulary (vid, name, machine_name) VALUES (?,?,?)', json.vocabularies.insert[i].vid , json.vocabularies.insert[i].name, json.vocabularies.insert[i].machine_name);				
						}
					}
					else{
							db.execute('INSERT INTO vocabulary (vid, name, machine_name) VALUES (?,?,?)', json.vocabularies.insert.vid , json.vocabularies.insert.name, json.vocabularies.insert.machine_name);						
					}
				}
				if (json.vocabularies.update){
					if (json.vocabularies.update.length){
						for (var i = 0; i < json.vocabularies.update.length; i++ ){
							db.execute('UPDATE vocabulary SET "name"=?, "machine_name"=? WHERE "vid"=?',json.vocabularies.update[i].name, json.vocabularies.update[i].machine_name, json.vocabularies.update[i].vid);
						}
					}
					else{
							db.execute('UPDATE vocabulary SET "name"=?, "machine_name"=? WHERE "vid"=?',json.vocabularies.update.name, json.vocabularies.update.machine_name, json.vocabularies.update.vid);						
					}
				}
				if (json.vocabularies["delete"]){
					if (json.vocabularies["delete"].length){
						for (var i = 0; i < json.vocabularies["delete"].length; i++ ){
							//Deletes rows from terms
							db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"][i].vid);							
							
							//Deletes corresponding rows in vocabulary
							db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"][i].vid);				
						}
					}
					else{
						//Deletes row from terms
						db.execute('DELETE FROM term_data WHERE "vid"=?',json.vocabularies["delete"].vid);							
						
						//Deletes corresponding row in vocabulary
						db.execute('DELETE FROM vocabulary WHERE "vid"=?',json.vocabularies["delete"].vid);				
					}
				}
			} 
			//Terms:
			if (json.terms){
				if (json.terms.insert){
					if (json.terms.insert.length){
						for (var i = 0; i < json.terms.insert.length; i++ ){
							db.execute('INSERT INTO term_data (vid, tid, name, description, weight) VALUES (?,?,?,?,?)', json.terms.insert[i].vid, json.terms.insert[i].tid, json.terms.insert[i].name, json.terms.insert[i].desc, json.terms.insert[i].weight);				
						}
					}
					else{
							db.execute('INSERT INTO term_data (vid, tid, name, description, weight) VALUES (?,?,?,?,?)', json.terms.insert.vid, json.terms.insert.tid, json.terms.insert.name, json.terms.insert.desc, json.terms.insert.weight);						
					}
				}
				if (json.terms.update){
					if (json.terms.update.length){
						for (var i = 0; i < json.terms.update.length; i++ ){
							db.execute('UPDATE term_data SET "name"=?, "description"=?,  "weight"=?, "vid"=?  WHERE "tid"=?', json.terms.update[i].name, json.terms.update[i].desc, json.terms.update[i].weight, json.terms.update[i].vid, json.terms.update[i].tid);
						}
					}
					else{
							db.execute('UPDATE term_data SET "name"=?, "description"=?,  "weight"=?, "vid"=?  WHERE "tid"=?', json.terms.update.name, json.terms.update.desc, json.terms.update.weight, json.terms.update.vid, json.terms.update.tid);						
					}
				}
				if (json.terms["delete"]){
					if (json.terms["delete"].length){
						for (var i = 0; i < json.terms["delete"].length; i++ ){
							db.execute('DELETE FROM term_data WHERE "tid"=?',json.terms["delete"][i].tid);
						}
					}
					else{
						db.execute('DELETE FROM term_data WHERE "tid"=?',json.terms["delete"].tid);
					}
				}
			}
			if (json.account){
				var deploy = db.execute('SELECT field_name FROM fields WHERE bundle = "account"');
				var col_titles = [];
				
				var ind_column = 0;
				while (deploy.isValidRow()){
					col_titles[ind_column] = deploy.fieldByName('field_name'); 
					ind_column++;
					deploy.next();
				}
				deploy.close();
				//Insert - Accounts
				if (json.account.insert){
					if (json.account.insert.length){
						for (var i = 0; i < json.account.insert.length; i++ ){
							var aux_column = ind_column;
							var node_id = db.execute('INSERT INTO node (nid, type) VALUES (?,?)', db.lastInsertRowId+1, "account");
							
							Ti.API.info("Last row: "+db.lastInsertRowId);
							if (aux_column > 0)
								var query = 'INSERT INTO account (nid, ';
							else
								var query = 'INSERT INTO account (nid) VALUES ('+db.lastInsertRowId+')';
							
							while (aux_column > 0){
								if (aux_column == 1)
									query += ' '+col_titles[aux_column-1]+') VALUES ('+db.lastInsertRowId+', ';
								else
									query += ' '+col_titles[aux_column-1]+', ';
								aux_column--;
							}

							aux_column = ind_column;
							while (aux_column > 0){
								var parse_api = col_titles[aux_column-1];
								Ti.API.info("Inserting: "+json.account.insert[i][parse_api]);
								if (aux_column == 1)
									query += ' '+json.account.insert[i][parse_api]+' )';
								else
									query += ' '+json.account.insert[i][parse_api]+' ,';
								aux_column--;
							}
							//Inserts into account table
							db.execute(query);
						}
					}
					else{
						//db.execute('INSERT INTO account (nid, name, account_type_tid, parent_account_nid, website, phone, fax, description) VALUES (?,?,?,?,?,?,?,?)', json.account.insert.nid,json.account.insert.name, json.account.insert.account_type_tid, json.account.insert.account_nid, json.account.insert.website, json.account.insert.phone, json.account.insert.fax, json.account.insert.description);						
					}
					Ti.API.info("Inserted account sucefully!");				
				}
				
				//Update - Accounts
				if (json.account.update){
					if (json.account.update.length){
						for (var i = 0; i < json.account.update.length; i++ ){
							//Updating account table
							//db.execute('UPDATE account SET "name"=?, "account_type_tid"=?, "parent_account_nid"=?, "website"=?, "phone"=?, "fax"=?, "description"=? WHERE  "nid"=?', json.account.update[i].name, json.account.update[i].account_type_tid, json.account.update[i].account_nid, json.account.update[i].website, json.account.update[i].phone, json.account.update[i].fax, json.account.update[i].description, json.account.update[i].nid );
						}
					}
					else{
						//db.execute('UPDATE account SET "name"=?, "account_type_tid"=?, "parent_account_nid"=?, "website"=?, "phone"=?, "fax"=?, "description"=? WHERE  "nid"=?', json.account.update.name, json.account.update.account_type_tid, json.account.update.account_nid, json.account.update.website, json.account.update.phone, json.account.update.fax, json.account.update.description, json.account.update.nid );	
					}
					Ti.API.info("Updated account sucefully!");
				}
				
				//Delete - Accounts
				if (json.account["delete"])	{
					if (json.account["delete"].length){
						for (var i = 0; i <  json.account["delete"].length; i++ ){
							//Deletes current row
							//db.execute('DELETE FROM account WHERE "nid"=?',json.account["delete"][i].nid);
						}				
					}
					else{
						//db.execute('DELETE FROM account WHERE "nid"=?',json.account["delete"].nid);
					}
					Ti.API.info("Deleted account sucefully!");
				}
			}
			
			if (json.lead){
				var deploy = db.execute('SELECT field_name FROM fields WHERE bundle = "lead"');
				var col_titles = [];
				
				var ind_column = 0;
				while (deploy.isValidRow()){
					col_titles[ind_column] = deploy.fieldByName('field_name'); 
					ind_column++;
					deploy.next();
				}
				deploy.close();


				//Insert - Leads
				if (json.lead.insert){
					if (json.lead.insert.length){
						for (var i = 0; i < json.lead.insert.length; i++ ){
							//Inserts a new person
							var aux_column = ind_column;
							var node_id = db.execute('INSERT INTO node (nid, type) VALUES (?,?)', db.lastInsertRowId+1, "lead");
							
							if (aux_column > 0)
								var query = 'INSERT INTO lead (nid, ';
							else
								var query = 'INSERT INTO lead (nid) VALUES ('+db.lastInsertRowId+')';
								
							while (aux_column > 0){
								if (aux_column == 1)
									query += ' '+col_titles[aux_column-1]+') VALUES ('+db.lastInsertRowId+', ';
								else
									query += ' '+col_titles[aux_column-1]+', ';
								aux_column--;
							}
							aux_column = ind_column;
							while (aux_column > 0){
								var parse_api = col_titles[aux_column-1];
								Ti.API.info("Inserting: "+json.lead.insert[i][parse_api]);
								if (aux_column == 1)
									query += ' '+json.lead.insert[i][parse_api]+' )';
								else
									query += ' '+json.lead.insert[i][parse_api]+' ,';
								aux_column--;
							}
							//Inserts into lead table
							db.execute(query);
						}
					}
					else{
						//db.execute('INSERT INTO lead (nid, first_name, last_name, job_title_tid, lead_status_tid, lead_source_tid, competing_company_tid, company, phone, cell_phone, fax, email, description, website) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', json.lead.insert.nid, json.lead.insert.first_name, json.lead.insert.last_name, json.lead.insert.job_title_tid, json.lead.insert.lead_status_tid, json.lead.insert.lead_source_tid, json.lead.insert.competing_company_tid, json.lead.insert.company, json.lead.insert.phone, json.lead.insert.cell_phone, json.lead.insert.fax, json.lead.insert.email, json.lead.insert.description, json.lead.insert.website);	
					}
					Ti.API.info("Inserted lead sucefully!");				
				}
				//Update - Leads
				if (json.lead.update){
					if (json.lead.update.length){
						for (var i = 0; i < json.lead.update.length; i++ ){
							//Updating lead table
							//db.execute('UPDATE lead SET "first_name"=?, "last_name"=?, "job_title_tid"=?, "lead_status_tid"=?, "lead_source_tid"=?, "competing_company_tid"=?, "company"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=?, "website"=? WHERE  "nid"=?', json.lead.update[i].first_name, json.lead.update[i].last_name, json.lead.update[i].job_title_tid, json.lead.update[i].lead_status_tid, json.lead.update[i].lead_source_tid, json.lead.update[i].competing_company_tid, json.lead.update[i].company, json.lead.update[i].phone, json.lead.update[i].cell_phone, json.lead.update[i].fax, json.lead.update[i].email, json.lead.update[i].description, json.lead.update[i].website , json.lead.update[i].nid );
						}
					}
					else{
						//db.execute('UPDATE lead SET "first_name"=?, "last_name"=?, "job_title_tid"=?, "lead_status_tid"=?, "lead_source_tid"=?, "competing_company_tid"=?, "company"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=?, "website"=? WHERE  "nid"=?', json.lead.update.first_name, json.lead.update.last_name, json.lead.update.job_title_tid, json.lead.update.lead_status_tid, json.lead.update.lead_source_tid, json.lead.update.competing_company_tid, json.lead.update.company, json.lead.update.phone, json.lead.update.cell_phone, json.lead.update.fax, json.lead.update.email, json.lead.update.description, json.lead.update.website , json.lead.update.nid );	
					}
					Ti.API.info("Updated Leads sucefully!");
				}
				
				//Delete - Leads
				if (json.lead["delete"]){
					if (json.lead["delete"].length){
						for (var i = 0; i <  json.lead["delete"].length; i++ ){
							//Deletes current row (lead)
							//db.execute('DELETE FROM lead WHERE "nid"=?',json.lead["delete"][i].nid);
						}				
					}
					else{
						//db.execute('DELETE FROM lead WHERE "nid"=?',json.lead["delete"].nid);
					}
					Ti.API.info("Deleted Leads sucefully!");
				}

			}
			
			/*********** Contacts *************/
			if (json.contact){
				var deploy = db.execute('SELECT field_name FROM fields WHERE bundle = "contact"');
				var col_titles = [];
				
				var ind_column = 0;
				while (deploy.isValidRow()){
					col_titles[ind_column] = deploy.fieldByName('field_name'); 
					ind_column++;
					deploy.next();
				}
				deploy.close();

				//Insert - Contacts
				if (json.contact.insert){
					if (json.contact.insert.length){
						for (var i = 0; i < json.contact.insert.length; i++ ){
							var aux_column = ind_column;
							var node_id = db.execute('INSERT INTO node (nid, type) VALUES (?,?)', db.lastInsertRowId+1, "contact");
							
							if (aux_column > 0)
								var query = 'INSERT INTO contact (nid, ';
							else
								var query = 'INSERT INTO contact (nid) VALUES ('+db.lastInsertRowId+')';
								
							while (aux_column > 0){
								if (aux_column == 1)
									query += ' '+col_titles[aux_column-1]+') VALUES ('+db.lastInsertRowId+', ';
								else
									query += ' '+col_titles[aux_column-1]+', ';
								aux_column--;
							}
							aux_column = ind_column;
							while (aux_column > 0){
								var parse_api = col_titles[aux_column-1];
								Ti.API.info("Inserting: "+json.contact.insert[i][parse_api]);
								if (aux_column == 1)
									query += ' '+json.contact.insert[i][parse_api]+' )';
								else
									query += ' '+json.contact.insert[i][parse_api]+' ,';
								aux_column--;
							}
							//Inserts into contact table
							db.execute(query);
						}
					}
					else{
						//db.execute('INSERT INTO contact (nid, first_name, last_name, account_nid, lead_source, job_title_tid, phone, cell_phone, fax, email, description ) VALUES (?,?,?,?,?,?,?,?,?,?,?)', json.contact.insert.nid, json.contact.insert.first_name, json.contact.insert.last_name, json.contact.insert.account_nid, json.contact.insert.lead_source_tid, json.contact.insert.job_title_tid, json.contact.insert.phone, json.contact.insert.cell_phone, json.contact.insert.fax, json.contact.insert.email, json.contact.insert.description );
					}
					Ti.API.info("Inserted contact sucefully!");				
				}
		
				//Update - Contacts
				if (json.contact.update){
					if (json.contact.update.length){
						for (var i = 0; i < json.contact.update.length; i++ ){
							//db.execute('UPDATE contact SET "first_name"=?, "last_name"=?, "account_nid"=? , "lead_source"=? , "job_title_tid"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=? WHERE "nid"=?', json.contact.update[i].first_name , json.contact.update[i].last_name , json.contact.update[i].account_nid , json.contact.update[i].lead_source_tid , json.contact.update[i].job_title_tid , json.contact.update[i].phone , json.contact.update[i].cell_phone , json.contact.update[i].fax , json.contact.update[i].email , json.contact.update[i].description , json.contact.update[i].nid );
						}
					}
					else{
						//db.execute('UPDATE contact SET "first_name"=?, "last_name"=?, "account_nid"=? , "lead_source"=? , "job_title_tid"=?, "phone"=?, "cell_phone"=?, "fax"=?, "email"=?, "description"=? WHERE "nid"=?', json.contact.update.first_name , json.contact.update.last_name , json.contact.update.account_nid , json.contact.update.lead_source_tid , json.contact.update.job_title_tid , json.contact.update.phone , json.contact.update.cell_phone , json.contact.update.fax , json.contact.update.email , json.contact.update.description , json.contact.update.nid );	
					}
					Ti.API.info("Updated Contacts sucefully!");
				}
				
				//Delete - Contacts
				if (json.contact["delete"])	{
					if (json.contact["delete"].length){
						for (var i = 0; i <  json.contact["delete"].length; i++ ){
							//Deletes current row (contact)
							//db.execute('DELETE FROM contact WHERE "nid"=?', json.contact["delete"][i].nid);
						}				
					}
					else{
						//db.execute('DELETE FROM contact WHERE "nid"=?', json.contact["delete"].nid);	
					}
					Ti.API.info("Deleted Contacts sucefully!");
				}
			}

			/*********** Potentials *************/
			if(json.potential){
				var deploy = db.execute('SELECT field_name FROM fields WHERE bundle = "potential"');
				var col_titles = [];
				
				var ind_column = 0;
				while (deploy.isValidRow()){
					col_titles[ind_column] = deploy.fieldByName('field_name'); 
					ind_column++;
					deploy.next();
				}
				deploy.close();
				
				//Insert - Potentials
				if (json.potential.insert){
					if (json.potential.insert.length){
						for (var i = 0; i < json.potential.insert.length; i++ ){
							var aux_column = ind_column;
							var node_id = db.execute('INSERT INTO node (nid, type) VALUES (?,?)', db.lastInsertRowId+1, "potential");
							
							if (aux_column > 0)
								var query = 'INSERT INTO potential (nid, ';
							else
								var query = 'INSERT INTO potential (nid) VALUES ('+node_id.lastInsertRowId+')';
								
							while (aux_column > 0){
								if (aux_column == 1)
									query += ' '+col_titles[aux_column-1]+') VALUES ('+node_id.lastInsertRowId+', ';
								else
									query += ' '+col_titles[aux_column-1]+', ';
								aux_column--;
							}
							aux_column = ind_column;
							while (aux_column > 0){
								var parse_api = col_titles[aux_column-1];
								Ti.API.info("Inserting: "+json.potential.insert[i][parse_api]);
								if (aux_column == 1)
									query += ' '+json.potential.insert[i][parse_api]+' )';
								else
									query += ' '+json.potential.insert[i][parse_api]+' ,';
								aux_column--;
							}
							//Inserts into contact table
							db.execute(query);
						}
					}
					else{
						//db.execute('INSERT INTO potential (nid, name, account_nid, potential_stage_tid, competing_company_tid, potential_type_tid, closing_date, next_step, description ) VALUES (?,?,?,?,?,?,?,?,?)', json.potential.insert.nid, json.potential.insert.name, json.potential.insert.account_nid, json.potential.insert.potential_stage_tid, json.potential.insert.competing_company_tid, json.potential.insert.potential_type_tid, json.potential.insert.closing_date, json.potential.insert.next_step, json.potential.insert.description);	
					}
					Ti.API.info("Inserted potential sucefully!");				
				}
	
				//Update - Contacts
				if (json.potential.update){
					if (json.potential.update.length){
						for (var i = 0; i < json.potential.update.length; i++ ){
							//db.execute('UPDATE potential SET "name"=? , "account_nid"=?, "potential_stage_tid"=?, "competing_company_tid"=?, "potential_type_tid"=?, "closing_date"=?, "next_step"=?, "description"=? WHERE "nid"=?', json.potential.update[i].name, json.potential.update[i].account_nid, json.potential.update[i].potential_stage_tid, json.potential.update[i].competing_company_tid, json.potential.update[i].potential_type_tid, json.potential.update[i].closing_date, json.potential.update[i].next_step, json.potential.update[i].description, json.potential.update[i].nid );
						}
					}
					else{
						//db.execute('UPDATE potential SET "name"=? , "account_nid"=?, "potential_stage_tid"=?, "competing_company_tid"=?, "potential_type_tid"=?, "closing_date"=?, "next_step"=?, "description"=? WHERE "nid"=?', json.potential.update.name, json.potential.update.account_nid, json.potential.update.potential_stage_tid, json.potential.update.competing_company_tid, json.potential.update.potential_type_tid, json.potential.update.closing_date, json.potential.update.next_step, json.potential.update.description, json.potential.update.nid );	
					}
					Ti.API.info("Updated Potentials sucefully!");
				}
				
				//Delete - Contacts
				if (json.potential["delete"]){
					if ( json.potential["delete"].length){
						for (var i = 0; i <  json.potential["delete"].length; i++ ){
							//Deletes current row (contact)
							//db.execute('DELETE FROM potential WHERE "nid"=?', json.potential["delete"][i].nid);
						}
					}
					else{
						//db.execute('DELETE FROM potential WHERE "nid"=?', json.potential["delete"].nid);
					}
					Ti.API.info("Deleted Potentials sucefully!");
				}
				
			}
			
			/*********** Users *************/
			if(json.users){
				//Insert - Users
				if (json.users.insert){
					if (json.users.insert.length){
						for (var i = 0; i < json.users.insert.length; i++ ){
							db.execute('INSERT INTO users (uid, username, mail, realname, status ) VALUES (?,?,?,?,?)', json.users.insert[i].uid, json.users.insert[i].username, json.users.insert[i].mail, json.users.insert[i].realname, json.users.insert[i].status);
							if (json.users.insert[i].roles.length){
								for (var j = 0; j < json.users.insert[i].roles.length; j++ ){
									db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert[i].uid, json.users.insert[i].roles[j]);
								}
							}
							else{
								db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert[i].uid, json.users.insert[i].roles);
							}
						}
					}
					else{
						db.execute('INSERT INTO users (uid, username, mail, realname, status ) VALUES (?,?,?,?,?)', json.users.insert.uid, json.users.insert.username, json.users.insert.mail, json.users.insert.realname, json.users.insert.status);
						
						if (json.users.insert.roles.length){
							for (var j = 0; j < json.users.insert.roles.length; j++ ){
								db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert.uid, json.users.insert.roles[j]);
							}
						}
						else{
							db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.insert.uid, json.users.insert.roles);
						}
					}
					Ti.API.info("Inserted users sucefully!");
				}

				//Update - Users
				if (json.users.update){
					if (json.users.update.length){
						for (var i = 0; i < json.users.update.length; i++ ){
							db.execute('UPDATE users SET "username"=? , "mail"=?, "realname"=?, "status"=? WHERE "uid"=?', json.users.update[i].username, json.users.update[i].mail, json.users.update[i].realname, json.users.update[i].status, json.users.update[i].uid );
							
							//Delete every row present at user_roles
							db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users.update[i].uid);
							
							//Insert it over again!
							if(json.users.update[i].roles){
								
								if (json.users.update[i].roles.length){
									for (var j = 0; j < json.users.update[i].roles.length ; j++ ){
										db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update[i].uid, json.users.update[i].roles[j]);
									}							
								}
								else{
									db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update[i].uid, json.users.update[i].roles);
								}
							}
						}
					}
					else{
						db.execute('UPDATE users SET "username"=? , "mail"=?, "realname"=?, "status"=? WHERE "uid"=?', json.users.update.username, json.users.update.mail, json.users.update.realname, json.users.update.status, json.users.update.uid );
							
						//Delete every row present at user_roles
						db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users.update.uid);
						
						//Insert it over again!
						if(json.users.update.roles){
							if (json.users.update.roles.length){
								for (var j = 0; j < json.users.update.roles.length ; j++ ){
									db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update.uid, json.users.update.roles[j]);
								}							
							}
							else{
								db.execute('INSERT INTO user_roles (uid, rid ) VALUES (?,?)', json.users.update.uid, json.users.update.roles);
							}
						}
					}
					Ti.API.info("Updated Users sucefully!");
				}
				
				//Delete - Contacts
				if (json.users["delete"])	{
					if (json.users["delete"].length){
						for (var i = 0; i <  json.users["delete"].length; i++ ){
							//Deletes current row (contact)
							db.execute('DELETE FROM users WHERE "uid"=?', json.users["delete"][i].uid);
							db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users["delete"][i].uid);
							
						}
					}
					else{
						db.execute('DELETE FROM users WHERE "uid"=?', json.users["delete"].uid);
						db.execute('DELETE FROM user_roles WHERE "uid"=?', json.users["delete"].uid);
					}
				Ti.API.info("Deleted Users sucefully!");
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

//Function Opens a new window to display descAux.
//The window closes when receives a click event
function openBigText(descAux){
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

function getTitle(i){
	var value = "";
	switch(i){
		case "first_name":
			value = "First name: ";
		break;
		case last_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
		case first_name:
			value = "First name: ";
		break;
	}
	return value;
}
