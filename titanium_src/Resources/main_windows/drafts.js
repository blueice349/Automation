Ti.include('/lib/functions.js');

/*jslint eqeq: true, plusplus: true*/
/*global PLATFORM, Omadi*/

var curWin = Ti.UI.currentWindow;
curWin.setBackgroundColor('#eee');

var listTableView = null;
var win_new;

function draftNavButtons() {"use strict";
    var back, space, label, toolbar;
    
    if (listTableView !== null) {
        listTableView.top = 40;
    }
    back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    back.addEventListener('click', function() {
        //Omadi.data.setUpdating(false);
        curWin.close();
    });

    space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    label = Titanium.UI.createButton({
        title : 'Drafts',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    // create and add toolbar
    toolbar = Titanium.UI.iOS.createToolbar({
        items : [back, space, label, space],
        top : 0,
        borderTop : false,
        borderBottom : true
    });
    curWin.add(toolbar);
}

(function() {"use strict";

    var db, result, data, i, count, aux_data, section, arr_tables, fullName, row, empty, search, formWindow, dialog;
    //Current window's instance

    //Sets only portrait mode
    curWin.orientationModes = [Titanium.UI.PORTRAIT];

    //When back button on the phone is pressed, it opens mainMenu.js and close the current window
    curWin.addEventListener('android:back', function() {
        //Enable background updates
        //Omadi.data.setUpdating(false);
        curWin.close();
    });
    
    Ti.App.addEventListener('loggingOut', function(){
        Ti.UI.currentWindow.close();
    });

    //Lock database for background updates

    db = Omadi.utils.openMainDatabase();

    data = [];
    count = 0;
    arr_tables = [];
    result = db.execute('SELECT * FROM node WHERE flag_is_updated=3 ORDER BY table_name ASC ');
    if (result.rowCount == 0) {
        result = null;
        //Ti.API.info('0 drafts');
    }
    else {
        //Ti.API.info(result.rowCount + ' drafts ..');
        while (result.isValidRow()) {
            if (!arr_tables[result.fieldByName('table_name')]) {

                if (count != 0) {
                    aux_data.sort(Omadi.utils.sortByName);

                    for ( i = 0; i < aux_data.length; i++) {
                        section.add(aux_data[i]);
                    }
                    data.push(section);
                }

                aux_data = [];

                arr_tables[result.fieldByName('table_name')] = true;

                section = Titanium.UI.createTableViewSection({
                    height : Ti.UI.SIZE,
                    headerTitle : result.fieldByName('table_name').charAt(0).toUpperCase() + result.fieldByName('table_name').slice(1),
                    backgroundColor : '#000',
                    color : '#fff',
                    nid : false,
                    visible : true,
                    font: {
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                });

            }

            fullName = result.fieldByName('title');
            row = Ti.UI.createTableViewRow({
                height : 'auto',
                hasChild : false,
                title : fullName,
                form_part : result.fieldByName('form_part'),
                node_type : result.fieldByName('table_name'),
                backgroundColor: '#fff',
                color : '#000',
                nid: result.fieldByName('nid')
            });

            //Populates the array
            aux_data.push(row);
            count++;
            result.next();

            if (!result.isValidRow()) {
                aux_data.sort(Omadi.utils.sortByName);
                for ( i = 0; i < aux_data.length; i++) {
                    section.add(aux_data[i]);
                }
                data.push(section);
            }
        }
    }

    //Check if the list is empty or not
    if (data.length < 1) {
        //Shows the empty list
        empty = Titanium.UI.createLabel({
            height : Ti.UI.FILL,
            width : '100%',
            text : 'No drafts have been saved',
            color : '#999',
            font : {
                fontSize : 22,
                fontWeight : 'bold'
            },
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });

        curWin.add(empty);
    }
    else {

        //Search bar definition
        search = Ti.UI.createSearchBar({
            hintText : 'Search...',
            autocorrect : false,
            barColor : '#000',
            height: 50,
            top: 0
        });

        listTableView = Titanium.UI.createTableView({
            data : data,
            top : 0,
            search : search,
            bottom: 0,
            separatorColor : '#E6E6E6'
        });
        
        if(PLATFORM !== 'android'){
            listTableView.footerView = Ti.UI.createView({
                height: 50,
                width: '100%'
            });
            listTableView.top = 45;
        }

        listTableView.addEventListener('focus', function(e) {
            search.blur();
            //hides the keyboard
        });

        //Sort the array (A>B>C>...>Z):
        data.sort(Omadi.utils.sortByName);

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
            //Hide keyboard when returning

            if (e.row.nid != null) {

                //draftsWindow = Omadi.utils.cloneObject(curWin);
                
                Omadi.display.loading();
                
                
                formWindow = Ti.UI.createWindow({
                    navBarHidden: true,
                    type: e.row.node_type,
                    nid: e.row.nid,
                    url: '/main_windows/form.js',
                    form_part: e.row.form_part
                });
                
                //Ti.API.debug(e.row._type);
                // win_new.title = e.row.title;
                // win_new.type = e.row._type;
                // win_new.listView = curWin.listView;
                // win_new.up_node = curWin.up_node;
                // win_new.uid = curWin.uid;
                // win_new.region_form = e.row.form_part;
// 
                // //Passing parameters
                // win_new.nid = e.row.nid;
                // win_new.nameSelected = e.row.name;
// 
                // //Sets a mode to fields edition
                // win_new.mode = 1;

                formWindow.addEventListener('close', function(){
                   Ti.UI.currentWindow.close(); 
                   Ti.API.debug("form window closed");
                   Omadi.display.doneLoading();
                });
                
                
                formWindow.open();
                
                if(PLATFORM === 'android'){
                    Ti.UI.currentWindow.close();
                }
                else{
                    setTimeout(function() {
                        Ti.UI.currentWindow.hide();
                    }, 3000);
                    
                }

                
                
                //Ti.API.debug("Openeing form window");
                
                
            }
        });

        listTableView.addEventListener('longclick', function(e) {
            //Hide keyboard when returning

            //Ti.API.info('Size : ' + e.section.rowCount);

            if (e.row.nid != null) {
                Ti.API.info('DELETE');
                Titanium.Media.vibrate();

                dialog = Titanium.UI.createAlertDialog({
                    title : 'Omadi',
                    buttonNames : ['Yes', 'No'],
                    cancel : 1,
                    click_index : e.index,
                    sec_obj : e.section,
                    row_obj : e.row
                });

                dialog.message = 'Are you sure you want to delete the draft "' + e.row.title + '" ?';
                dialog.show();

                dialog.addEventListener('click', function(e) {
                    if (e.cancel === false) {
                        //Ti.API.info('deleted');
                        //Ti.API.info(e.source.click_index);
                        listTableView.deleteRow(listTableView.data[0][e.source.click_index]);
                        var db = Omadi.utils.openMainDatabase();
                        db.execute('UPDATE node SET flag_is_updated = 4 WHERE nid=' + e.source.row_obj.nid);
                        db.close();
                    }
                });
            }
        });

        //Adds contact list container to the UI
        curWin.add(listTableView);
        search.blur();
        
        setTimeout(function() {
            search.blur();
        }, 110);
    }

    if (result !== null) {
        result.close();
    }

    db.close();

    if (PLATFORM !== 'android') {
        draftNavButtons();
    }
}());

