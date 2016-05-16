'use strict';

require( 'colors' );
require( './helpers/setup' );
var childProcess = require( 'child_process' );

var loaded  = false;
var rawArgs = process.argv.slice( 2 );
var args    = [ 'Mocha.js' ]
var appium;

var homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

for ( var i  in rawArgs ) {
	args.push( rawArgs[ i ] );
}

var stripColors = function ( string ) {

	return string.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' );
};

for ( var i in args ) {
	var arg = args[ i ];
	var i   = Number( i );

	switch ( arg ) {
		case '-sim' : {
			appium = childProcess.spawn( 'appium', [
				'--app-pkg', 'com.omadi.crm',
				'--app', homeDir() + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphonesimulator/Omadi.app',
				'--no-reset',
				( config.get( 'reset' ) == true ? '--full-reset' : '--no-reset' ),
				//'--dont-stop-app-on-reset',
				( config.get( 'reset' ) == true ? '--dont-stop-app-on-reset' : '' ),
				'--command-timeout', '7200',
				'--pre-launch',
				'--show-ios-log',
				'--show-ios-log',
				'--device-name', 'iPhone 6 Plus',
				'--automation-name', 'Appium',
				'--platform-name', 'iOS',
				'--platform-version', '9.2',
				'--launch-timeout', '90000',
				'--native-instruments-lib'
			] );

			break;
		}

		case '-os' : {

			if ( args[ i + 1 ] !== undefined ) {
				if ( args[ i + 1 ].indexOf( 'android' ) != -1 ) {
					appium = childProcess.spawn( 'appium', [
						'--app-pkg', 'com.omadi.crm',
						'--app', homeDir() + '/Projects/omadi_mobile/titanium_src/build/android/bin/Omadi.apk',
						( config.get( 'reset' ) == true ? '--full-reset' : '--no-reset' ),
						'--dont-stop-app-on-reset',
						'--command-timeout', '7200',
						'--pre-launch',
						'--debug-log-spacing',
						'--automation-name', 'Appium',
						'--platform-name', 'Android',
						'--platform-version', '4.4'
					] );
				} else {
					appium = childProcess.spawn( 'appium', [
						'--app-pkg', 'com.omadi.crm',
						'--app', homeDir() + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphoneos/Omadi.ipa',
						( config.get( 'reset' ) == true ? '--full-reset' : '--no-reset-' ),
						'--dont-stop-app-on-reset',
						'--command-timeout', '7200',
						'--pre-launch',
						'--udid', 'aae3470d1a553da7c3cd2f5c14fead0b1a900cad',
						'--show-ios-log',
						'--show-ios-log',
						'--default-device',
						'--automation-name', 'Appium',
						'--platform-name', 'iOS',
						'--platform-version', '9.1',
						'--launch-timeout', '90000',
						'--native-instruments-lib'
					] );
				}

			} else {
				throw 'You did not specify a os for -os';
			}

			break;
		}
	}
}


appium.stdout.on( 'data', function ( data ) {

	var buff = new Buffer( data );

	if ( !loaded ) {
		console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
	}

	if ( stripColors( buff.toString( 'utf8' ) ) === 'info: Console LogLevel: debug\n' && !loaded ) {
		loaded = true;

		var mocha = childProcess.spawn( 'mocha', args );

		mocha.stdout.on( 'data', function ( data ) {

			var buff = new Buffer( data );
			console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
		} );

		mocha.stderr.on( 'data', function ( data ) {

			var buff = new Buffer( data );
			console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
		} );
	}
} );

