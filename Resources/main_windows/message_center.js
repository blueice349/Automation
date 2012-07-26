//Common used functions
Ti.include('/lib/functions.js');

//Current window's instance
var win = Ti.UI.currentWindow;

//Sets only portrait mode
win.orientationModes = [Titanium.UI.PORTRAIT];

//When back button on the phone is pressed, it opens mainMenu.js and close the current window
win.addEventListener('android:back', function() {
	//Enable background updates
	unsetUse();	
	win.close();
});

//Lock database for background updates
setUse();

var db = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS" );
var res_set = db.execute('SELECT *, COUNT(*) term_count FROM alerts GROUP BY location_nid');

//Check if the list is empty or not
if(res_set.rowCount == 0) {
	//Shows the empty list
	var empty = Titanium.UI.createLabel({
		height : 'auto',
		width : 'auto',
		top : '50%',
		color: '#000',
		text : 'You have no messages'
	});

	//Debug
	Ti.API.info("XXXXXXX ---- No messages ----- XXXXXX");

	win.add(empty);
}
//Shows the messages
else {
	var data = new Array();
	while (res_set.isValidRow())
	{
		var fullName = res_set.fieldByName('location_label')+" ("+res_set.fieldByName('term_count')+")";
		var row = Ti.UI.createTableViewRow({
			height : 'auto',
			hasChild : false,
			title : fullName,
			nid: res_set.fieldByName('location_nid'),
			color: '#000',
			counter: res_set.fieldByName('term_count')
		});
	
		//Parameters added to each row
		row.name = fullName;
		
		//Populates the array
		data.push(row);
		res_set.next();
	}

	//Search bar definition
	var search = Ti.UI.createSearchBar({
		hintText : 'Search...',
		autocorrect : false,
		barColor : '#000'
	});
	
	//Contat list container
	var listTableView = Titanium.UI.createTableView({
		data : data,
		top : '3%',
		search : search,
		height : '91%',
		separatorColor: '#BDBDBD'
	});
	
	listTableView.addEventListener('focus', function(e) {
		search.blur();
		//hide keyboard
	});
	
	// SEARCH BAR EVENTS
	search.addEventListener('change', function(e) {
		//e.value; // search string as user types
	});

	search.addEventListener('return', function(e) {
		search.blur();
		//hides the keyboard
	});
	
	search.addEventListener('cancel', function(e) {
		search.blur();
		//hides the keyboard
	});

	//When the user clicks on a certain contact, it opens individual_contact.js
	listTableView.addEventListener('click', function(e) {
		var n_win = Ti.UI.createWindow({
			fullscreen: true
		});
		
		var db_t = Ti.Database.install('/database/gps_coordinates.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName()+"_GPS" );
		var msgs = db_t.execute('SELECT * FROM alerts WHERE location_nid='+e.row.nid);

		if (msgs.rowCount > 0 ){

			var n_data = new Array();
			while (msgs.isValidRow())
			{
				Ti.API.info("======>>> "+msgs.fieldByName('message'));
				var full_msg = msgs.fieldByName('message');
				var n_lb = Titanium.UI.createLabel({
				    text: full_msg,
				    height:'auto',
				    width:'auto',
				    font : {
				    	fontSize: '22dp',
				    	fontWeight:'bold'
				    },
				    left: "2%",
				    right: "2%",
				    textAlign : 'left'
				});
				
				var n_row = Ti.UI.createTableViewRow({
					height : 'auto',
					hasChild : false,
					color: '#000',
					className: "sorted",
				    font : {
				    	fontSize: '22dp',
				    	fontWeight:'bold'
				    },
				    textAlign : 'left',
				    nid: msgs.fieldByName('ref_nid')
				});
				Ti.API.info("NID: "+msgs.fieldByName('ref_nid'));
				n_row.add(n_lb);
				
				//Populates the array
				n_data.push(n_row);
				msgs.next();
			}
			db_t.close();
			//Search bar definition
			var n_search = Ti.UI.createSearchBar({
				hintText : 'Search...',
				autocorrect : false,
				barColor : '#000'
			});
			
			//Contat list container
			var n_listTableView = Titanium.UI.createTableView({
				data : n_data,
				top : '3%',
				search : n_search,
				height : '91%',
				separatorColor: '#BDBDBD'
			});
			n_win.add(n_listTableView);
			
			if(PLATFORM == 'android'){
				bottomBack_release(n_win, "Back" , "enable");
			}else{
				alertNavButtons(n_listTableView, n_win);
			}
			
			n_listTableView.addEventListener('click', function(e){
				var a_db = Ti.Database.install('/database/db.sqlite', Titanium.App.Properties.getString("databaseVersion")+"_"+getDBName() );
				var a_res = a_db.execute("SELECT * FROM node WHERE nid="+e.row.nid);
				var n_nid = e.row.nid;
				var type_vl = a_res.fieldByName('table_name');
				var region_f = a_res.fieldByName('form_part');
				var name_s	= a_res.fieldByName('title');
				a_db.close();
				
				var a_msg = Titanium.UI.createAlertDialog({
					title:'Omadi - '+type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
					buttonNames: ['Close', 'See Node'],
					cancel: 0,
					message: "What would you like to do ?"
				});
				a_msg.show();
				a_msg.addEventListener('click', function(ev){
					if (ev.index != ev.cancel){
						Ti.API.info('Opening node if it exists');
						//Next window to be opened
						var win_new = Titanium.UI.createWindow({
							fullscreen : false,
							title: type_vl.charAt(0).toUpperCase() + type_vl.slice(1),
							type: type_vl,
							url : 'individual_object.js',
							up_node: win.up_node,
							uid: win.uid,
							region_form: region_f
						});
				
						search.blur();
						//hide keyboard
				
						//Passing parameters
						win_new.picked 			 = win.picked;
						win_new.nid 			 = n_nid;
						win_new.nameSelected 	 = name_s
						db_t.close();
						
						//Avoiding memory leaking
						win_new.open();
					}
				});
				
			});
			n_win.open();

			//When back button on the phone is pressed, it opens mainMenu.js and close the current window
			n_win.addEventListener('android:back', function() {
				//Enable background updates
				n_win.close();
			});			
			
		}
		else{
			notifyIOS('There are no messages for this item');
			db_t.close();
		}
	});
	
	//Adds contact list container to the UI
	win.add(listTableView);
	search.blur();
	win.addEventListener('focus', function(){
		setTimeout(function (){
			search.blur();
		}, 110 );
	});
}

db.close();
if(PLATFORM == 'android'){
	bottomBack_release(win, "Back" , "enable");
}else{
	alertNavButtons(listTableView, win);
}

function alertNavButtons(listTableView, win){
	if (listTableView){
		listTableView.top = '40';
		listTableView.height = '97%';
	}
	var back = Ti.UI.createButton({
		title : 'Back',
		style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED
	});
	back.addEventListener('click', function() {
		unsetUse();	
		win.close();
	});
	
	var space = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});
	var label = Titanium.UI.createButton({
		title: 'Alert List',
		color:'#fff',
		ellipsize: true,
		wordwrap: false,
		width: 200,
		style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
	});
	
	// create and add toolbar
	var toolbar = Ti.UI.iOS.createToolbar({
		items:[back, label, space],
		top:0,
		borderTop:false,
		borderBottom:true
	});
	win.add(toolbar);
};
