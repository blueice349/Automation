Ti.include('/lib/functions.js');
Ti.include('/main_windows/create_or_edit_node.js');

/*jslint eqeq: true, vars: true, nomen: true, plusplus: true*/
/*global PLATFORM, Omadi, sortTableView, create_or_edit_node*/

var curWin = Ti.UI.currentWindow;
var listTableView = null;
var win_new;

function draftNavButtons() {"use strict";
    if (listTableView !== null) {
        listTableView.top = '40';
    }
    var back = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });

    back.addEventListener('click', function() {
        //Omadi.data.setUpdating(false);
        curWin.close();
    });

    var space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    var label = Titanium.UI.createButton({
        title : 'Drafts',
        color : '#fff',
        ellipsize : true,
        wordwrap : false,
        width : 200,
        style : Titanium.UI.iPhone.SystemButtonStyle.PLAIN
    });

    // create and add toolbar
    var toolbar = Titanium.UI.iOS.createToolbar({
        items : [back, space, label, space],
        top : 0,
        borderTop : false,
        borderBottom : true
    });
    curWin.add(toolbar);

}

(function() {"use strict";

    var db, result, data, i;
    //Current window's instance

    //Sets only portrait mode
    curWin.orientationModes = [Titanium.UI.PORTRAIT];

    //When back button on the phone is pressed, it opens mainMenu.js and close the current window
    curWin.addEventListener('android:back', function() {
        //Enable background updates
        //Omadi.data.setUpdating(false);
        curWin.close();
    });

    //Lock database for background updates

    db = Omadi.utils.openMainDatabase();
    var resultsNames;
    var aux_data;
    var section;
    var _i;

    data = [];
    i = 0;
    var _arr_tables = [];
    resultsNames = db.execute('SELECT * FROM node WHERE flag_is_updated=3 ORDER BY table_name ASC ');
    if (resultsNames.rowCount == 0) {
        resultsNames = null;
        Ti.API.info('0 drafts');
    }
    else {
        Ti.API.info(resultsNames.rowCount + ' drafts ..');
        while (resultsNames.isValidRow()) {
            if (!_arr_tables[resultsNames.fieldByName('table_name')]) {

                if (i != 0) {
                    aux_data.sort(sortTableView);

                    for ( _i = 0; _i < aux_data.length; _i++) {
                        section.add(aux_data[_i]);
                    }
                    data.push(section);
                }

                aux_data = [];

                _arr_tables[resultsNames.fieldByName('table_name')] = true;

                section = Titanium.UI.createTableViewSection({
                    height : 'auto',
                    headerTitle : resultsNames.fieldByName('table_name').charAt(0).toUpperCase() + resultsNames.fieldByName('table_name').slice(1),
                    backgroundColor : '#000',
                    color : '#000',
                    nid : false,
                    visible : true
                });

            }

            var fullName = resultsNames.fieldByName('title');
            var row = Ti.UI.createTableViewRow({
                height : 'auto',
                hasChild : false,
                title : fullName,
                form_part : resultsNames.fieldByName('form_part'),
                _type : resultsNames.fieldByName('table_name'),
                color : '#000'
            });

            //Parameters added to each row
            row.nid = resultsNames.fieldByName('nid');
            row.name = fullName;

            //Populates the array
            aux_data.push(row);
            i++;
            resultsNames.next();

            if (!resultsNames.isValidRow()) {
                aux_data.sort(sortTableView);
                for ( _i = 0; _i < aux_data.length; _i++) {
                    section.add(aux_data[_i]);
                }
                data.push(section);
            }
        }
    }

    //Check if the list is empty or not
    if (data.length < 1) {
        //Shows the empty list
        var empty = Titanium.UI.createLabel({
            height : 'auto',
            width : 'auto',
            top : '50%',
            text : 'No drafts have been saved',
            color : '#999',
            font : {
                fontSize : '22dp',
                fontWeight : 'bold'
            }
        });

        curWin.add(empty);
       
    }
    //Shows the contacts
    else {

        //Search bar definition
        var search = Ti.UI.createSearchBar({
            hintText : 'Search...',
            autocorrect : false,
            barColor : '#000'
        });

        //Contat list container
        listTableView = Titanium.UI.createTableView({
            data : data,
            top : '3%',
            search : search,
            height : '91%',
            separatorColor : '#E6E6E6'
        });

        listTableView.addEventListener('focus', function(e) {
            search.blur();
            //hides the keyboard
        });

        //Sort the array (A>B>C>...>Z):
        data.sort(sortTableView);

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

                win_new = create_or_edit_node.getWindow();
                win_new.title = e.row.title;
                win_new.type = e.row._type;
                win_new.listView = curWin.listView;
                win_new.up_node = curWin.up_node;
                win_new.uid = curWin.uid;
                win_new.region_form = e.row.form_part;

                //Passing parameters
                win_new.nid = e.row.nid;
                win_new.nameSelected = e.row.name;

                //Sets a mode to fields edition
                win_new.mode = 1;

                win_new.open();
                setTimeout(function() {
                    create_or_edit_node.loadUI();
                }, 100);

                //Omadi.data.setUpdating(false);

                if (PLATFORM === 'android') {
                    curWin.close();
                }
                else {
                    curWin.hide();
                }

                //curWin.close();
                resultsNames.close();
            }
        });

        listTableView.addEventListener('longclick', function(e) {
            //Hide keyboard when returning

            Ti.API.info('Size : ' + e.section.rowCount);

            if (e.row.nid != null) {
                Ti.API.info('DELETE');
                Titanium.Media.vibrate();

                var a_msg = Titanium.UI.createAlertDialog({
                    title : 'Omadi',
                    buttonNames : ['Yes', 'No'],
                    cancel : 1,
                    click_index : e.index,
                    sec_obj : e.section,
                    row_obj : e.row
                });

                a_msg.message = 'Are you sure you want to delete the draft "' + e.row.title + '" ?';
                a_msg.show();

                a_msg.addEventListener('click', function(e) {
                    if (e.cancel === false) {
                        Ti.API.info('deleted');
                        Ti.API.info(e.source.click_index);
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
        curWin.addEventListener('focus', function() {
            setTimeout(function() {
                search.blur();
            }, 110);
        });

    }

    if (resultsNames !== null) {
        resultsNames.close();
    }

    db.close();

    if (PLATFORM !== 'android') {
        draftNavButtons();
    }
}());

