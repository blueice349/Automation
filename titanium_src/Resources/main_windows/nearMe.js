/*global Omadi*/

var Display = require('lib/Display');
Display.setCurrentWindow(Ti.UI.currentWindow, 'nearMe');

Ti.include('/lib/functions.js');


var win;

var numPagesLoaded = 0;
var itemsPerPage = 40;
var tallestDeviceHeight = Math.max(Ti.Platform.displayCaps.getPlatformHeight(), Ti.Platform.displayCaps.getPlatformWidth());
var cachedData = [];
var settingTableData = false;

var initWin = function() {'use strict';
	win = Ti.UI.currentWindow;
	win.bundle = Omadi.data.getBundle(win.formType);
	win.setBackgroundColor('#eee');
};

var getFilterQuery = function() {'use strict';
	return win.filterQuery;
};

var getWrapper = function() {'use strict';
	return win.getChildren()[0];
};

var getTable = function() {'use strict';
	var wrapper = getWrapper();
	if (wrapper) {
		return wrapper.getChildren()[1];
	}
};

var close = function() {'use strict';
	win.close();
};

var getSortField = function() {'use strict';
	return win.bundle.data.mobile.location_sort_field || 'location';
};

var getDataFromDB = function() {'use strict';
	var db = Omadi.utils.openMainDatabase();
	var result = db.execute("SELECT n.title, n.nid, n.viewed, type." + getSortField() + "___lat as lat, type." + getSortField() + "___lng as lng FROM node n INNER JOIN " + win.formType + " type ON type.nid = n.nid" + getFilterQuery());
	
	var data = [];
	
	while (result.isValidRow()) {
		data.push({
			title: result.fieldByName('title'),
			nid: result.fieldByName('nid'),
			viewed: result.fieldByName('viewed'),
			lat: parseFloat(result.fieldByName('lat')),
			lng: parseFloat(result.fieldByName('lng'))
		});
		result.next();
	}
	
	result.close();
	db.close();
	
	return data;
};

var calculateDistance = function(lat1, lng1, lat2, lng2, lat1Rad, lng1Rad, lat2Rad, lng2Rad) {'use strict';
	var distance = Infinity;
	
	if (lat1 + lng1 && lat2 + lng2) {
		var R = 3959; // radius of earth in miles
		var latDelta = (lat2 - lat1) * Math.PI / 180;
		var lngDelta = (lng2 - lng1) * Math.PI / 180;
		var a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
				Math.cos(lat1Rad) * Math.cos(lat2Rad) *
				Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		distance = d;
	}
	
	return distance;
};

var calculateDistances = function(data, currentLocation) {'use strict';

	var lat1 = currentLocation.lat;
	var lng1 = currentLocation.lng;
	var lat1Rad = currentLocation.lat * Math.PI / 180;
	var lng1Rad = currentLocation.lng * Math.PI / 180;
	
	var i;
	for (i = 0; i < data.length; i++) {
		
		var lat2 = data[i].lat;
		var lng2 = data[i].lng;
		var lat2Rad = lat2 * Math.PI / 180;
		var lng2Rad = lng2 * Math.PI / 180;
		
		data[i].distance = calculateDistance(lat1, lng1, lat2, lng2, lat1Rad, lng1Rad, lat2Rad, lng2Rad);
	}
	
	return data;
};

var getCurrentLocation = function(callback) {'use strict';
	Ti.Geolocation.getCurrentPosition(function(e) {
		callback({
			lat: e.coords.latitude,
			lng: e.coords.longitude
		});
	});
};

var sortByDistance = function(a, b) {'use strict';
	return a.distance - b.distance;
};

var getTitleSeparator = function() {'use strict';
	var separator = ' - ';
    if (win.bundle.data.title_fields &&
		win.bundle.data.title_fields.separator &&
		win.bundle.data.title_fields.separator.trim() != '') {
		separator = win.bundle.data.title_fields.separator;
    }
    return separator;
};

var getRowTitleParts = function(title) {'use strict';
	var parts = [title];
	var separator = getTitleSeparator();
	if (separator.trim() != '') {
		parts = title.split(getTitleSeparator());
	}
	return parts.slice(0, 4);
};

var createRowTitleLabel = function(data) {'use strict';
	
	var parts = getRowTitleParts(data.title);

	var title = Ti.UI.createView({
		height: parts.length > 2 ? 50 : 30,
		width: '75%',
		left: '5%'
	});
	
	var i;
	for (i = 0; i < parts.length; i++) {
		title.add(Ti.UI.createLabel({
			text: parts[i],
			height: 20,
			width: parts.length > 1 ? '50%' : '100%',
			wordWrap: false,
			ellipsize: true,
			font: { fontSize: 14 },
			top: i < 2 ? 5 : 25,
			left: i % 2 ? '50%' : 0,
			color: i % 2 ? '#666' : '#000'
		}));
	}
	
	return title;
};

var createRowDistanceLabel = function(data) {'use strict';
	return Ti.UI.createLabel({
		text: data.distance == Infinity ? '???' : data.distance.toFixed(1) + ' mi',
		width: '15%',
		height: 50,
		left: '85%',
		font: { fontSize: 14 },
		color: '#333',
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
		backgroundColor: '#ddd'
	});
};

var createTableRow = function(data) {'use strict';
	var row = Ti.UI.createTableViewRow({
        hasChild: false,
        searchValue: data.title,
        color: '#000',
        nid: data.nid,
        backgroundColor: data.viewed ? '#fff' : '#eee',
        height: 50
    });
	
	row.add(createRowTitleLabel(data));
	row.add(createRowDistanceLabel(data));
	
	return row;
};

var createTableRows = function() {'use strict';
	var tableData = [];
	var i;
	//for (i = numPagesLoaded * itemsPerPage + (numPagesLoaded ? 20 : 0); i < cachedData.length && i < (numPagesLoaded + 1) * itemsPerPage + 20; i++) {
	for (i = numPagesLoaded * itemsPerPage; i < cachedData.length && i < (numPagesLoaded + 1) * itemsPerPage; i++) {
		tableData.push(createTableRow(cachedData[i]));
	}
	numPagesLoaded++;
	return tableData;
};

var getData = function(callback) {'use strict';
	getCurrentLocation(function(currentLocation) {
		var data = getDataFromDB();
		data = calculateDistances(data, currentLocation);
		data.sort(sortByDistance);
		callback(data);
	});
};

var handleTableClick = function(e) {'use strict';
	var now = new Date();
	var table = getTable();
    if(e.row.nid > 0){
        if(now - table.lastTouched > 500){
			table.lastTouched = now;
			Omadi.display.showDialogFormOptions(e);
        }
    }
};

var createSearchBar = function() {'use strict';
	var searchBar = Ti.UI.createSearchBar({
        hintText: 'Search...',
        autocorrect: false,
        focusable: false,
        showCancel: true,
        font: {fontSize: 16},
        height: Ti.App.isAndroid ? 45 : 35,
        top: 0
    });
    
    if (Ti.App.isAndroid) {
		searchBar.hide();
		
		setTimeout(function(){
			searchBar.show();
		}, 500);
    }
    
    return searchBar;
};

var handleTableScroll = function(event) {
    if (Ti.App.isAndroid) {
        if (!settingTableData && event.firstVisibleItem > itemsPerPage * (numPagesLoaded - 1)) {
            settingTableData = true;
			getTable().appendRow(createTableRows());
            settingTableData = false;
        }
    } else {
        if (!settingTableData && event.contentOffset.y + (tallestDeviceHeight * 3) > event.contentSize.height) {
            settingTableData = true;
            getTable().appendRow(createTableRows());
            setTimeout(function() {
                settingTableData = false;
            }, 200);
        }
    }
};

var createTable = function() {'use strict';
	var table = Titanium.UI.createTableView({
        separatorColor: '#ccc',
        data: [],
        backgroundColor: '#eee',
        scrollable: true,
        search: createSearchBar(),
        filterAttribute: 'searchValue',
        lastTouched: new Date()
    });
    
    table.addEventListener('click', handleTableClick);
    table.addEventListener('scroll', handleTableScroll);
    
    return table;
};

var refresh = function(){'use strict';
	getData(function(data) {
		var table = getTable();
		table.data = [];
		cachedData = data;
		numPagesLoaded = 0;
		table.appendRow(createTableRows());
	});
};

var initEventHandlers = function() {'use strict';
	Ti.App.removeEventListener('loggingOut', close);
	Ti.App.addEventListener('loggingOut', close);
	win.addEventListener('android:back', close);
};

var getLabelColor = function() {'use strict';
	var color;
	
	if (Ti.App.isIPad) {
		color = '#000';
	} else if (Ti.App.isIOS7) {
		color = '#333';
	} else if (Ti.App.isIOS) {
		color = '#fff';
	} else {
		color = '#ccc';
	} 
	
	return color;
};

var createTitleLabel = function() {'use strict';
	return Ti.UI.createLabel({
        font: {
            fontWeight: 'bold',
            fontSize: 16
        },
        text: win.bundle.label + ' Near Me',
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        color: getLabelColor(),
        height: Ti.UI.SIZE
    });
};

var createRefreshButton = function() {'use strict';
	var refreshButton = Ti.UI.createImageView({
	    image: '/images/refresh_light_blue.png',
	    right: 9,
	    top: 4,
	    bottom: 4,
	    width: 32,
	    height: 32
	});
	
	refreshButton.addEventListener('click', refresh);
	return refreshButton;
};

var createIOSToolbar = function() {'use strict';
	var backButton = Ti.UI.createButton({
        title: 'Back',
        style: Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    backButton.addEventListener('click', close);
    
    var space = Titanium.UI.createButton({
        systemButton: Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    var toolbar = Ti.UI.iOS.createToolbar({
        items: [backButton, space, createTitleLabel(), space, createRefreshButton()],
        top: 0,
        borderTop: false,
        borderBottom: false,
        height: Ti.UI.SIZE
    });
    
    return toolbar;
};

var createAndroidToolbar = function() {'use strict';
	var toolbar = Titanium.UI.createView({
        backgroundColor: '#666',
        top: 0,
        height: Ti.UI.SIZE
    });
    
    toolbar.add(createTitleLabel());
    toolbar.add(createRefreshButton());
    
    return toolbar;
};

var createToolbar = function() {'use strict';
	var toolbar;
	
	if (Ti.App.isIOS) {
		toolbar = createIOSToolbar();
	} else {
		toolbar = createAndroidToolbar();
	}
	
	return toolbar;
};

var createWrapperView = function() {'use strict';
	var wrapper = Ti.UI.createView({
	   layout: 'vertical',
	   bottom: 0,
	   top: Ti.App.isIOS7 ? 20 : 0,
	   right: 0,
	   left: 0 
	});
	
	wrapper.add(createToolbar());
	wrapper.add(createTable());
	
	return wrapper;
};

(function() {'use strict';
	initWin();
	initEventHandlers();
	
	win.add(createWrapperView());
	refresh();
}());
