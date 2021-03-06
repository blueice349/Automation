
var apps = require( './apps.js' );

exports.adminLogins = {
	'admin1' : {
		'default OS'         : 'IOS',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'admin1',
		'password'           : 'test',
		'name'               : 'IOS Admin 1',
		'userRole'           : 'admin',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : true,
		'truckOption'        : true
	},
	'admin2' : {
		'default OS'         : 'Android',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'admin2',
		'password'           : 'test',
		'name'               : 'Android Admin 2',
		'userRole'           : 'admin',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : true,
		'truckOption'        : true
	},
	'admin3' : {
		'default OS'         : 'IOS',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'admin3',
		'password'           : 'test',
		'name'               : 'IOS Admin 3',
		'userRole'           : 'admin',
		'performJob'          : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false		
	},
	'admin4' : {
		'default OS'         : 'Android',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'admin4',
		'password'           : 'test',	
		'name'               : 'IOS Admin 4',
		'userRole'           : 'admin',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	}
}

exports.clientLogins = {
	'client1' : {
		'default OS'         : 'IOS',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'client1',
		'password'           : 'test',
		'name'               : 'Client1',
		'userRole'           : 'AdminClient',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	},
	'client2'  : {
		'default OS'         : 'Android',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'client2',
		'password'           : 'test',
		'name'               : 'Client2',
		'userRole'           : 'AdminClient',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	},
	'client3'  : {
		'default OS'         : 'IOS',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'client3',
		'password'           : 'test',
		'name'               : 'Client3',
		'userRole'           : 'client',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	},
	'client4'  : {
		'default OS'         : 'Android',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'client4',
		'password'           : 'test',
		'name'               : 'Client4',
		'userRole'           : 'client',
		'performJob'         : false,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	}
}

exports.driverLogins = {
	'driver1' : {
		'default OS'         : 'IOS',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'driver1',
		'password'           : 'test',
		'name'               : 'IOS Driver 1',
		'userRole'           : 'driver',
		'performJob'         : true,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : true,
		'truckOption'        : true	
	},
	'driver2'  : {
		'default OS'         : 'Android',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'driver2',
		'password'           : 'test',
		'name'               : 'Android Driver 2',
		'userRole'           : 'driver',
		'performJob'         : true,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : true,
		'truckOption'        : true	
	},
	'driver3'  : {
		'default OS'         : 'IOS',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'driver3',
		'password'           : 'test',
		'name'               : 'IOS Driver 3',
		'userRole'           : 'driver',
		'performJob'         : true,
		'tagButton'          : true,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	},
	'driver4'  : {
		'default OS'         : 'Android',
		'appVersion'         : apps.appVersion,
		'clientAccount'      : 'automobile',
		'username'           : 'driver4',
		'password'           : 'test',
		'name'               : 'Android Driver 4',
		'userRole'           : 'driver',
		'performJob'         : true,
		'tagButton'          : false,
		'permissionGranted'  : false,
		'clockInOption'      : false,
		'truckOption'        : false	
	}
}

