
/*jslint eqeq:true,plusplus:true*/
/*global Omadi*/

Ti.include('/lib/functions.js');


var bundle, curWin, search, instances, filterValues, filterFields, win_new;

var filterTableView;
var itemsPerPage = 40;
var numPagesLoaded = 0;
var showFinalResults = false;
var tableData = [];
var loadingMoreLabel, loadingMoreView;
var num_records = -1;
var titleSearch = "";
var settingTableData = false;
var tallestDeviceHeight = Math.max(Ti.Platform.displayCaps.getPlatformHeight(), Ti.Platform.displayCaps.getPlatformWidth());
var wrapperView;

curWin = Ti.UI.currentWindow;
curWin.setBackgroundColor('#eee');

wrapperView = Ti.UI.createView({
   layout: 'vertical',
   bottom: 0,
   top: 0,
   right: 0,
   left: 0 
});

if(Ti.App.isIOS7){
    wrapperView.top += 20;
}

function closeWindowObjects(){"use strict";
    Ti.UI.currentWindow.close();   
}

Ti.App.removeEventListener('loggingOut', closeWindowObjects);
Ti.App.addEventListener('loggingOut', closeWindowObjects);

// Do not close this window when a node is saved as it could close a next form part unexpectedly
// Ti.App.addEventListener("savedNode", function() {"use strict";
    // //if (Ti.App.isAndroid) {
        // Ti.UI.currentWindow.close();
    // //}
    // //else {
    // //    Ti.UI.currentWindow.hide();
        // // Close the window after the maximum timeout for a node save
    // //    Ti.UI.currentWindow.close
    // //}
// });

function sortByTitle(a, b) {"use strict";
    if (a.title < b.title) {
        return -1;
    }
    if (a.title > b.title) {
        return 1;
    }
    return 0;
}

function backButtonPressed(e) {"use strict";
    //Ti.API.info("Went to final results: " + e.source.showFinalResults);
    if (Ti.App.isAndroid) {
        if (!e.source.showFinalResults && filterValues.length) {
            filterValues.pop();
        }
    }

    Ti.UI.currentWindow.close();
}

function homeButtonPressed(e) {"use strict";
    var thisWin = Ti.UI.currentWindow, i;

    if ( typeof thisWin.nestedWindows !== 'undefined') {
        for ( i = 0; i < thisWin.nestedWindows.length; i += 1) {
            thisWin.nestedWindows[i].close();
        }
    }

    Ti.UI.currentWindow.close();
}

function getDataSQL(getCount) {"use strict";
    var lastFilterField, sql, field_name, i, filterValue, conditions;

    conditions = [];
    
    Ti.API.debug(filterValues);
    
    if (filterValues.length < filterFields.length && !showFinalResults) {
        lastFilterField = filterFields[filterValues.length];

        //Ti.API.debug("Filtering by " + lastFilterField.field_name);

        if ( typeof lastFilterField.field_name !== 'undefined') {
            field_name = lastFilterField.field_name;
            sql = "SELECT DISTINCT " + field_name + " AS value FROM " + curWin.type + " type  INNER JOIN node n ON n.nid = type.nid";
        }
        else {
            if (getCount) {
                sql = "SELECT COUNT(*) FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
            }
            else {
                sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
            }
            showFinalResults = true;
        }
    }
    else {//(filterValues.length == filterFields.length){
        if (getCount) {
            sql = "SELECT COUNT(*) FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
        }
        else {
            sql = "SELECT n.title, n.nid, n.viewed FROM node n INNER JOIN " + curWin.type + " type ON type.nid = n.nid ";
        }

        showFinalResults = true;
    }
    
    Ti.API.debug(filterValues);

    if (filterFields.length > 0) {
        for ( i = 0; i < filterFields.length; i++) {
            //Ti.API.info(i);
            field_name = filterFields[i].field_name;
            //Ti.API.info("FILTER FIELD NAME: " + field_name);

            if ( typeof filterValues[i] != 'undefined' && filterValues[i].value !== false) {
                Ti.API.info("FILTER VALUE BELOW: " + i + ": " + filterValues[i].value);
                filterValue = filterValues[i].value;
                
                if(filterFields[i].type == 'list_boolean'){
                    // For a checkbox, unchecked is a null or 0
                    if (filterValue == 0) {
                        conditions.push(field_name + ' IS NULL OR ' + field_name + ' = 0');
                    }
                    else{
                        conditions.push(field_name + ' = 1');
                    }
                }
                else{
                    // Show all results with filters applied
                    if (filterValue === null) {
                        conditions.push(field_name + ' IS NULL');
                    }
                    else if (filterValue === "") {
                        conditions.push(field_name + " = ''");
                    }
                    else {
                        conditions.push(field_name + ' = ' + filterValue);
                    }
                }
            }
        }
    }

    if ( typeof titleSearch === 'string' && titleSearch.length > 0) {
        conditions.push("n.title LIKE '%" + titleSearch + "%'");
    }

    conditions.push("n.flag_is_updated IN (0,1)");

    if (conditions.length > 0) {
        sql += " WHERE ";
        sql += conditions.join(" AND ");
    }

    if (showFinalResults) {
        sql += " ORDER BY ";

        if ( typeof bundle.data.mobile !== 'undefined' && typeof bundle.data.mobile.sort_field !== 'undefined') {
            sql += "n." + bundle.data.mobile.sort_field + " " + bundle.data.mobile.sort_direction;
        }
        else {
            sql += "n.title ASC";
        }

        sql += " LIMIT " + itemsPerPage + " OFFSET " + (itemsPerPage * numPagesLoaded);
    }

    Ti.API.info("FILTER SQL: " + sql);

    return sql;
}

function setTableData() {"use strict";

    var lastFilterField, field_name, sql, i, filterValue, row, titleParts, 
        label1, label2, db, db_result, title, separator, whiteSpaceTest, 
        backgroundColor, numTitleRows, fullWidth, text_values, text_value, 
        values, safeValues, subResult, tableIndex, resultCount, appendData, 
        countSQL, dbValue;

    tableIndex = 0;
    appendData = [];
    
    Ti.API.debug(filterValues);
    sql = getDataSQL();
    
    lastFilterField = null;
    if (filterValues.length < filterFields.length && !showFinalResults) {
        lastFilterField = filterFields[filterValues.length];
    }

    if (showFinalResults) {
        db = Omadi.utils.openMainDatabase();

        if (numPagesLoaded === 0) {
            countSQL = getDataSQL(true);
            db_result = db.execute(countSQL);
            num_records = db_result.field(0, Ti.Database.FIELD_TYPE_INT);
            db_result.close();
        }

        db_result = db.execute(sql);

        resultCount = 0;
        while (db_result.isValidRow()) {
            resultCount++;

            //Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('nid'));
            //Ti.API.info("FILTER FINAL RESULT: " + db_result.fieldByName('title'));

            title = db_result.fieldByName('title');
            title = Omadi.utils.trimWhiteSpace(title);

            if (title.length == 0) {
                title = '- No Title -';
            }

            separator = ' - ';
            if ( typeof bundle.data.title_fields !== 'undefined' && typeof bundle.data.title_fields.separator !== 'undefined') {
                separator = bundle.data.title_fields.separator;
            }

            whiteSpaceTest = Omadi.utils.trimWhiteSpace(separator);
            backgroundColor = '#eee';
            if (db_result.fieldByName('viewed') > 0) {
                backgroundColor = '#fff';
            }

            row = Ti.UI.createTableViewRow({
                hasChild : false,
                searchValue : db_result.fieldByName('title'),
                color : '#000',
                nid : db_result.fieldByName('nid'),
                backgroundColor : backgroundColor
            });

            if (whiteSpaceTest.length > 0) {
                titleParts = title.split(separator);
                numTitleRows = Math.ceil(titleParts.length / 2);
                fullWidth = (titleParts.length === 1);

                for ( i = 0; i <= numTitleRows; i++) {

                    // Add label1 before label2 so the white background will go over the right label if it's extra long
                    label1 = Ti.UI.createLabel({
                        height : 20,
                        text : titleParts[i * 2],
                        color : '#000',
                        top : (i * 20 + 5),
                        left : 5,
                        zIndex : 1,
                        width : ( fullWidth ? '100%' : '45%'),
                        font : {
                            fontSize : 14
                        },
                        wordWrap : false,
                        ellipsize : true
                    });

                    row.add(label1);

                    if ( typeof titleParts[i * 2 + 1] != 'undefined') {
                        label2 = Ti.UI.createLabel({
                            height : 20,
                            text : titleParts[i * 2 + 1],
                            color : '#666',
                            top : (i * 20 + 5),
                            left : '54%',
                            width : '45%',
                            font : {
                                fontSize : 14
                            },
                            wordWrap : false,
                            ellipsize : true
                        });

                        row.add(label2);
                    }
                }
                row.height = (numTitleRows * 20) + 10;

            }
            else {
                row.height = 50;
                row.title = row.searchValue;
            }

            appendData[tableIndex] = row;
            tableIndex++;

            db_result.next();
        }
        db_result.close();
        db.close();
    }
    else {

        text_values = [];
        values = [];

        db = Omadi.utils.openMainDatabase();
        db_result = db.execute(sql);
        
        
        while (db_result.isValidRow()) {
            
            //Ti.API.debug(lastFilterField);
            dbValue = db_result.fieldByName('value');
            if(lastFilterField.type == 'list_boolean'){
                // Do not add the null
                if(dbValue > ''){
                    values.push(dbValue);
                }
            }
            else{
                values.push(dbValue);
            }
            
            Ti.API.info("FILTER: " + db_result.fieldByName('value'));

            db_result.next();
        }
        
        db_result.close();

        sql = "SELECT ";

        lastFilterField = filterFields[filterValues.length];

        safeValues = [];

        for ( i = 0; i < values.length; i++) {
            if (values[i] > '') {
                safeValues.push(values[i]);
            }
            else {
                if(lastFilterField.type != 'list_boolean'){
                    text_values[values[i]] = '- Not Set -';
                }
            }
        }

        if (lastFilterField.type == 'taxonomy_term_reference') {
            subResult = db.execute("SELECT tid AS value, name AS text_value FROM term_data WHERE tid IN (" + safeValues.join(",") + ")");
            while (subResult.isValidRow()) {
                text_values[subResult.fieldByName('value')] = subResult.fieldByName('text_value');
                //Ti.API.info("FILTER: " + subResult.fieldByName('text_value'));
                subResult.next();
            }

            subResult.close();
        }
        else if (lastFilterField.type == 'omadi_reference') {
            subResult = db.execute("SELECT nid AS value, title AS text_value FROM node WHERE nid IN (" + safeValues.join(",") + ")");
            while (subResult.isValidRow()) {
                text_values[subResult.fieldByName('value')] = subResult.fieldByName('text_value');
                //Ti.API.info("FILTER: " + subResult.fieldByName('text_value'));
                subResult.next();
            }

            subResult.close();
        }
        else if (lastFilterField.type == 'user_reference') {
            subResult = db.execute("SELECT uid AS value, realname AS text_value FROM user WHERE uid IN (" + safeValues.join(",") + ")");
            while (subResult.isValidRow()) {
                text_values[subResult.fieldByName('value')] = subResult.fieldByName('text_value');
                //Ti.API.info("FILTER: " + subResult.fieldByName('text_value'));
                subResult.next();
            }

            subResult.close();
        }
        else if (lastFilterField.type == 'list_boolean'){
            for(i = 0; i < safeValues.length; i ++){
                if(safeValues[i] == 1){
                    text_values[safeValues[i]] = 'Yes - ' + lastFilterField.label;
                }
                else{
                    text_values[safeValues[i]] = 'No - ' + lastFilterField.label;
                }
            }
        }
        else if (lastFilterField.field_name == 'form_part') {

            if (bundle.data.form_parts != null && bundle.data.form_parts != "") {
                //Ti.API.info('Form table part = ' + bundle.data.form_parts.parts.length);
                if (bundle.data.form_parts.parts.length > 0) {
                    for (i in bundle.data.form_parts.parts) {
                        if (bundle.data.form_parts.parts.hasOwnProperty(i)) {
                            text_values[i] = bundle.data.form_parts.parts[i].label;
                        }
                        //Ti.API.info("FILTER: " + bundle.data.form_parts.parts[i].label);
                    }
                }
            }
        }
        db.close();

        tableIndex = 0;
        for ( i = 0; i < values.length; i++) {

            //var text_value = '- Empty - ';
            //if(value > 0){
            text_value = text_values[values[i]];
            //}

            appendData[tableIndex] = Ti.UI.createTableViewRow({
                height : 50,
                hasChild : true,
                title : text_value,
                color : '#000',
                filterValue : values[i],
                filterValueText : text_value,
                backgroundColor : '#fff'
            });
            tableIndex++;
        }

        if (field_name != 'form_part') {
            appendData.sort(sortByTitle);
        }
    }

    if (showFinalResults && Ti.App.isIOS) {
        // For some weird reason, the android won't set the title to null, so loading is always there
        if (num_records <= (numPagesLoaded + 1) * itemsPerPage) {
            filterTableView.setFooterTitle(null);
        }
        else {
            filterTableView.setFooterTitle("Loading More Rows...");
        }
    }

    if (numPagesLoaded === 0) {
        filterTableView.setData(appendData);
    }
    else {
        filterTableView.appendRow(appendData);
    }
}



( function() {"use strict";
        /*global Omadi*/
        /*jslint vars: true*/

        var i, filterField, field_name, db, db_result, sql, lastFilterField;
        
        filterTableView = Titanium.UI.createTableView({
            separatorColor : '#ccc',
            data : [],
            backgroundColor : '#eee',
            scrollable: true,
            lastTouched: new Date()
        });

        Omadi.data.setUpdating(true);

        bundle = Omadi.data.getBundle(curWin.type);
        instances = Omadi.data.getFields(curWin.type);

        curWin.setBackgroundColor("#eee");
        curWin.addEventListener('android:back', backButtonPressed);

        filterValues = curWin.filterValues;

        if ( typeof filterValues !== "object") {
            filterValues = [];
        }

        filterFields = [];

        if ( typeof bundle.data.mobile !== 'undefined' && typeof bundle.data.mobile.filters !== 'undefined' && typeof bundle.data.mobile.filters.fields !== 'undefined' && bundle.data.mobile.filters.fields.length > 0) {

            for (i in bundle.data.mobile.filters.fields) {
                if (bundle.data.mobile.filters.fields.hasOwnProperty(i)) {

                    field_name = bundle.data.mobile.filters.fields[i].field_name;

                    if (field_name === 'form_part') {
                        filterFields.push({
                            label : 'Form Part',
                            type : 'metadata',
                            field_name : 'form_part'
                        });
                    }
                    else {
                        filterFields.push(instances[field_name]);
                    }
                }
            }
        }

        if ( typeof curWin.showFinalResults != 'undefined') {
            showFinalResults = curWin.showFinalResults;
        }

        filterTableView.addEventListener('scroll', function(e) {
            if (showFinalResults) {
                if (Ti.App.isAndroid) {
                    if (!settingTableData && e.firstVisibleItem > (itemsPerPage * numPagesLoaded)) {
                        settingTableData = true;
                        numPagesLoaded++;
                        setTableData();
                        settingTableData = false;
                    }
                }
                else {
                    
                    if (!settingTableData && e.contentOffset.y + (tallestDeviceHeight * 3) > e.contentSize.height) {
                        settingTableData = true;
                        numPagesLoaded++;
                        setTableData();

                        // Add in a small delay for the contentSize.height to catchup with rendering
                        // If this isn't here, 3-5 pages will be loaded at once
                        setTimeout(function() {
                            settingTableData = false;
                        }, 200);
                    }
                }
            }
        });
        
        Ti.API.debug("Filter values: " + JSON.stringify(filterValues));

        setTableData();

        var topBar = Titanium.UI.createView({
            backgroundColor : '#666',
            top : 0,
            height: Ti.UI.SIZE
        });

        var labelText = '';
        if (Ti.Platform.osname == 'iphone') {
            labelText += 'Found (' + num_records + ')';
        }
        else {
            labelText += bundle.label + " List " + ( showFinalResults ? '(' + num_records + ')' : '');
        }

        var listLabel = Ti.UI.createLabel({
            font : {
                fontWeight : "bold",
                fontSize : 16
            },
            text : labelText,
            textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
            color : '#ccc',
            height: Ti.UI.SIZE
        });

        if (Ti.App.isAndroid) {
            listLabel.top = 4;
            listLabel.left = 10;
        }

        var showAllButton = Ti.UI.createLabel({
            text : 'Show All',
            top : 5,
            right : 10,
            width : 100,
            height : 35,
            backgroundGradient : Omadi.display.backgroundGradientBlue,
            borderRadius : 5,
            color : '#eee',
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
            font: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        });

        if (showFinalResults) {

            search = Ti.UI.createSearchBar({
                hintText : 'Search...',
                autocorrect : false,
                focusable : false,
                barColor: '#111'
            });
            
            if(Ti.App.isAndroid){
                search.height = 45;
                
                search.hide();
                
                //Hiding on Android makes it so the keyboard doesn't automatically pop up
                // Showing it 1/2 second later will then show the search field, but not bring up the keyboard
                setTimeout(function(){
                    search.show(); 
                }, 500);
                
            }
            else{
                search.height = 35;
            }
        }

        if (Ti.App.isAndroid) {
            topBar.add(listLabel);
            // IMPORTANT!! This took way too long to figure out... Do not add this to iOS, or the app will crash at random
        }

        if (filterValues.length) {
            var filterLabelParts = [];
            for ( i = 0; i < filterValues.length; i++) {
                if ( typeof filterValues[i] != 'undefined' && filterValues[i].value !== false) {
                    //Ti.API.info(filterValues[i].text);

                    var filterLabelText = filterFields[i].label + ": ";
                    if (filterValues[i].text == "") {
                        filterLabelText += "- Not Set -";
                    }
                    else {
                        filterLabelText += filterValues[i].text;
                    }
                    filterLabelParts.push(filterLabelText);
                }
            }

            var filterLabel = Ti.UI.createLabel({
                color : '#fff',
                text : filterLabelParts.join("\n"),
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                font : {
                    fontSize : 12
                },
                height: Ti.UI.SIZE
            });

            if (showFinalResults) {
                filterLabel.right = 10;
                filterLabel.top = 1;
            }
            else {
                
                if (Ti.App.isAndroid) {
                    filterLabel.top = 22;
                    filterLabel.left = 10;
                }
                else {
                    filterLabel.left = 80;
                }
            }

            topBar.add(filterLabel);
            topBar.height = Ti.UI.SIZE;
        }

        /*** ADD the IOS top navigation bar ***/
        if (Ti.App.isIOS) {

            var back = Ti.UI.createButton({
                title : 'Back',
                style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            });

            back.addEventListener('click', function() {
                backButtonPressed();
            });

            var homeButton = Ti.UI.createButton({
                title : 'Home',
                style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
            });

            homeButton.addEventListener('click', function() {
                homeButtonPressed();
            });

            var space = Titanium.UI.createButton({
                systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
            });

            var items = [];

            var plusButton = Titanium.UI.createButton({
                backgroundImage : '/images/newicons/plus_btn_grey.png',
                backgroundSelectedImage : '/images/newicons/plus_btn_light_blue.png',
                width : 54,
                height : 38,
                right : 1,
                is_plus : true
            });

            plusButton.addEventListener('click', function() {
                search.blur();
                
                Ti.App.fireEvent('openFormWindow', {
                    node_type: curWin.type,
                    nid: 'new',
                    form_part: 0 
                });
            });

            items.push(back);

            if (filterValues.length > 0) {
                items.push(homeButton);
            }

            listLabel.color = '#fff';
            if(Ti.App.isIOS7){
                listLabel.color = '#333';
            }
            listLabel.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
            items.push(space);

            if (Ti.Platform.osname == 'ipad') {

                items.push(listLabel);
                items.push(space);
                listLabel.color = '#000';
            }
            else if (showFinalResults) {// for iPhone
                listLabel.setTextAlign(Ti.UI.TEXT_ALIGNMENT_RIGHT);
                listLabel.setWidth(160);

                items.push(listLabel);
            }

            if (!showFinalResults) {
                showAllButton.width = 80;
                items.push(showAllButton);
            }

            if (curWin.show_plus == true) {
                items.push(plusButton);
            }

            // create and add toolbar
            var toolbar = Ti.UI.iOS.createToolbar({
                items : items,
                top : 0,
                borderTop : false,
                borderBottom : false,
                height : Ti.UI.SIZE
            });
            wrapperView.add(toolbar);
        }
        else {// Ti.App.isAndroid
            wrapperView.add(topBar);
            if (!showFinalResults) {
                topBar.add(showAllButton);
            }

            Ti.Android.currentActivity.onCreateOptionsMenu = function(e) {

                var menu = e.menu;

                var homeItem = menu.add({
                    title : 'Home',
                    order : 0
                });

                homeItem.setIcon("/images/home_android.png");
                homeItem.addEventListener("click", function(e) {
                    homeButtonPressed();
                });

                if (curWin.show_plus) {
                    var newItem = menu.add({
                        title : 'New ' + bundle.label,
                        order : 1
                    });

                    newItem.setIcon("/images/newiconds/plus_btn_grey.png");
                    newItem.addEventListener("click", function(e) {
                        
                        Ti.App.fireEvent('openFormWindow', {
                            node_type: curWin.type,
                            nid: 'new',
                            form_part: 0 
                        });
                    });
                }
            };
        }

        if (showFinalResults) {
            wrapperView.add(search);
        }
        else {

            lastFilterField = filterFields[filterValues.length];

            var filterFieldView = Ti.UI.createView({
                height : Ti.UI.SIZE,
                width : '100%',
                backgroundGradient : {
                    type : 'linear',
                    startPoint : {
                        x : '50%',
                        y : '0%'
                    },
                    endPoint : {
                        x : '50%',
                        y : '100%'
                    },
                    colors : [{
                        color : '#555',
                        offset : 0.0
                    }, {
                        color : '#777',
                        offset : 0.3
                    }, {
                        color : '#444',
                        offset : 1.0
                    }]
                }
            });

            var filterFieldLabel = Ti.UI.createLabel({
                font : {
                    fontSize : 16,
                    fontWeight : "bold"
                },
                width : '100%',
                height : Ti.UI.SIZE,
                top : 1,
                left : 10,
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                color : '#fff'
            });

            if (Ti.Platform.osname == 'iphone') {
                filterFieldLabel.text = bundle.label + ': Filter by ' + lastFilterField.label;
            }
            else {
                filterFieldLabel.text = 'Filter by ' + lastFilterField.label;
            }

            filterFieldView.add(filterFieldLabel);
            wrapperView.add(filterFieldView);
        }

        if (filterTableView.getData().length) {
            wrapperView.add(filterTableView);
        }
        else {
            var emptyLabel = Ti.UI.createLabel({
                color : '#666',
                text : 'No Results Were Found',
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
                top : '50%',
                font : {
                    fontSize : 24
                },
                width: '100%'
            });
            wrapperView.add(emptyLabel);
        }

        /********** EVENTS *************/

        if (showFinalResults) {

            search.addEventListener('change', function(e) {
               
                titleSearch = e.source.value;
                numPagesLoaded = 0;

                setTableData();
              
                var labelText = '';
                if (Ti.Platform.osname == 'iphone') {
                    labelText += 'Found (' + num_records + ')';
                }
                else {
                    labelText += bundle.label + " List " + ( showFinalResults ? '(' + num_records + ')' : '');
                }

                listLabel.setText(labelText);
            });

            search.addEventListener('return', function(e) {
                search.blur();
                //hides the keyboard
            });

            search.addEventListener('cancel', function(e) {
                e.source.value = "";
                search.blur();
                //hides the keyboard
            });

            filterTableView.addEventListener('scroll', function(e) {
                search.blur();
            });

            filterTableView.addEventListener('touchstart', function(e) {
                search.blur();
            });
        }
        else {
            showAllButton.addEventListener('click', function(e) {
                Omadi.display.openListWindow(curWin.type, curWin.show_plus, filterValues, [], true);
            });
        }

        if (showFinalResults) {
            // //When the user clicks on a certain contact, it opens individual_contact.js
            filterTableView.addEventListener('click', function(e) {
                var now;
                if(e.row.nid > 0){
                    now = new Date();
                    // Only allow one touch per 500 milliseconds
                    if(now - filterTableView.lastTouched < 500){
                        // debounce
                        return;   
                    }
                    
                    filterTableView.lastTouched = now;
                    Omadi.display.showDialogFormOptions(e);
                }
            });
        }
        else {

            filterTableView.addEventListener('click', function(e) {
                var filterValues, now;
                now = new Date();
                // Only allow one touch per 500 milliseconds
                if(now - filterTableView.lastTouched < 500){
                    // debounce
                    return;   
                }
                
                filterTableView.lastTouched = now;
                
                filterValues = curWin.filterValues;

                if ( typeof filterValues != "object") {
                    filterValues = [];
                }

                filterValues.push({
                    value : e.row.filterValue,
                    text : e.row.filterValueText
                });

                var nestedWindows;
                if ( typeof curWin.nestedWindows == 'undefined') {
                    nestedWindows = [];
                }
                else {
                    nestedWindows = curWin.nestedWindows;
                }
                nestedWindows.push(curWin);

                Omadi.display.openListWindow(curWin.type, curWin.show_plus, filterValues, nestedWindows, false);
            });
        }

        Ti.API.info("END OF OBJECTS WINDOW FILE");

        Omadi.data.setUpdating(false);
        
        Ti.UI.currentWindow.add(wrapperView);
        
        Ti.UI.currentWindow.addEventListener('close', function(){
           
           // Clean up memory references
           
           //wrapperView.remove(filterTableView);
           filterTableView = null;
           
           //curWin.remove(wrapperView);
           wrapperView = null; 
           curWin = null;
           
           Ti.App.removeEventListener('loggingOut', closeWindowObjects);
        });

    }());
