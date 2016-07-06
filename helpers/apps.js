
var homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

var home   = homeDir();
var fs     = require( 'fs' );
var xml2js = require( 'xml2js' );
var parser = new xml2js.Parser();
var OmadiAppVersion;

fs.readFile( home + '/Projects/omadi_mobile/titanium_src/tiapp.xml', function ( err, data ) {

    parser.parseString( data, function ( err, result ) {

		OmadiAppVersion               = result['ti:app'].version[ 0 ]
		exports.appVersion            = OmadiAppVersion + '.';
		exports.appVersionTextAndroid = OmadiAppVersion;
		exports.appVersionTextIOS     = OmadiAppVersion + '.';
		console.log( 'Current APP Version: ' + OmadiAppVersion );
    } );
} );

exports.androidApp   = home + '/Projects/omadi_mobile/titanium_src/build/android/bin/Omadi.apk';
exports.iosSimApp    = home + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphonesimulator/Omadi.app';
exports.iosDeviceApp = home + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphoneos/Omadi.ipa';