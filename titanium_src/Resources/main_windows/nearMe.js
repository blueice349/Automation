/*global Omadi*/

Ti.include('/lib/functions.js');


var win, bundle, data;

var initGlobalVars = function() {'use strict';
	win = Ti.UI.currentWindow;
	bundle = Omadi.data.getBundle(win.formType);
};

var initWindowStyle = function() {'use strict';
	win.setBackgroundColor('#eee');
};

var close = function() {'use strict';
	win.close();
};

var getSortField = function() {'use strict';
	return bundle.data.mobile.location_sort_field || 'location';
};

var getData = function() {'use strict';
	var db = Omadi.utils.openMainDatabase();
	var result = db.execute("SELECT n.title, n.nid, n.viewed type." + getSortField() + "___lat as lat, type." + getSortField() + "___lng as lng FROM node n INNER JOIN " + win.formType + " type ON type.nid = n.nid");
	
	var data = [];
	
	while (result.isValidRow()) {
		data.push({
			title: result.fieldByName('title'),
			nid: result.fieldByName('nid'),
			viewed: result.fieldByName('viewed'),
			lat: parseInt(result.fieldByName('lat'), 10),
			lng: parseInt(result.fieldByName('lng'), 10)
		});
		result.next();
	}
	
	result.close();
	db.close();
	
	return data;
};

var calculateDistance = function(data, currentLocation) {'use strict';
	var distance;
	if (isNaN(data.lat) || isNaN(data.lng)) {
		distance = Infinity;
	} else {
		var R = 3959; // radius of earth in miles
		var lat1 = currentLocation.latRadians;
		var lat2 = data.lat.toRadians();
		var lng1 = currentLocation.lngRadians;
		var lng2 = data.lng.toRadians();
		
		var deltaLat = (lat2 - lat1).toRadians();
		var deltaLng = (lng2 - lng1).toRadians();
		
		var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
				Math.cos(lat1) * Math.cos(lat2) *
				Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		distance = d.toFixed(1);
	}
	
	return distance;
};

var calculateDistances = function(data, currentLocation) {'use strict';
	var i;
	for (i = 0; i < data.length; i++) {
		data[i].distance = calculateDistance(data[i], currentLocation);
	}
	
	return data;
};

var getCurrentLocation = function(callback) {'use strict';
	Ti.Geolocation.getCurrentPosition(function(e) {
		callback({
			lat: e.coords.latitude,
			lng: e.coords.longitude,
			latRadians: e.coords.latitude.toRadians(),
			lngRadians: e.coords.longitude.toRadians()
		});
	});
};

var refresh = function(){'use strict';
	var currentLocation = getCurrentLocation(function(currentLocation) {
		var data = getData();
		data = calculateDistances(data, currentLocation);
		
		// TODO sort and display data
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

var getTitleLable = function() {'use strict';
	return Ti.UI.createLabel({
        font : {
            fontWeight : 'bold',
            fontSize : 16
        },
        text : bundle.label + ' Near Me',
        textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
        color : getLabelColor(),
        height: Ti.UI.SIZE
    });
};

var getRefreshButton = function() {'use strict';
	var refreshButton = Ti.UI.createImageView({
	    image : '/images/refresh_light_blue.png',
	    right : 9,
	    top: 4,
	    bottom: 4,
	    width : 32,
	    height : 32
	});
	
	refreshButton.addEventListener('click', refresh);
	return refreshButton;
};

var getIOSToolbar = function() {'use strict';
	var backButton = Ti.UI.createButton({
        title : 'Back',
        style : Titanium.UI.iPhone.SystemButtonStyle.BORDERED
    });
    backButton.addEventListener('click', close);
    
    var space = Titanium.UI.createButton({
        systemButton : Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
    });
    
    var toolbar = Ti.UI.iOS.createToolbar({
        items : [backButton, space, getTitleLable(), space, getRefreshButton()],
        top : 0,
        borderTop : false,
        borderBottom : false,
        height : Ti.UI.SIZE
    });
    
    return toolbar;
};

var getAndroidToolbar = function() {'use strict';
	var toolbar = Titanium.UI.createView({
        backgroundColor : '#666',
        top : 0,
        height: Ti.UI.SIZE
    });
    
    toolbar.add(getTitleLable());
    toolbar.add(getRefreshButton());
    
    return toolbar;
};

var getToolbar = function() {'use strict';
	var toolbar;
	
	if (Ti.App.isIOS) {
		toolbar = getIOSToolbar();
	} else {
		toolbar = getAndroidToolbar();
	}
	
	return toolbar;
};

var getView = function() {'use strict';
	var view = Ti.UI.createView({
	   layout: 'vertical',
	   bottom: 0,
	   top: Ti.App.isIOS7 ? 20 : 0,
	   right: 0,
	   left: 0 
	});
	
	view.add(getToolbar());
	
	return view;
};

(function() {'use strict';
	initGlobalVars();
	initWindowStyle();
	initEventHandlers();
	
	win.add(getView());
}());
