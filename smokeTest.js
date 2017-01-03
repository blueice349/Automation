//'use strict';

require( 'colors' );
require( './helpers/setup' );
var wd            = require( 'wd' );
var assert        = require( 'assert' );
var serverConfigs = require( './helpers/appium-servers' );
var args          = process.argv.slice( 2 );
var config        = require( './helpers/Config' );
var actions       = require( './helpers/actions' );
var elements      = require( './helpers/elements' );
var timeout       = 180000;
var simulator     = false;
var desired;
wd.addPromiseChainMethod( 'swipe', actions.swipe );

for ( var i in args ) {
	var arg = args[ i ];
	var i   = Number( i );

	switch ( arg ) {
		case '-sim' : {
			if ( args[ i + 1 ] !== undefined ) {
				simulator = true;
				desired   = require( './helpers/caps' )[ args[ i + 1 ] ];

				config.set( {
					'os'      : args[ i + 1 ],
					'desired' : desired,
					'sim'     : true
				} );
			}

			break;
		}

		case '-time' : {
			if ( args[ i + 1 ] !== undefined ) {
				timeout = args[ i + 1 ];

			} else {
				throw 'You did not specify a timeout for -timeout';
			}

			break;
		}

		case '-reset' : {
			if ( args[ i + 1 ] !== undefined ) {
				config.set( {
					'reset' : true
				} );
			}

			break;
		}

		case '-device' : {
			if ( args[ i + 1 ] !== undefined ) {
				desired = require( './helpers/caps' )[ args[ i + 1 ] ];

				config.set( {
					'os'      : args[ i + 1 ],
					'desired' : desired,
					'sim'     : false
				} );
			}

			break;
		}
	}
}

var commons = require( './helpers/Commons' );
	//wd.addPromiseChainMethod( 'inputKeys', commons.sendKeys );
	// wd.addPromiseChainMethod( 'inputKeys', function ( config, keys ) {

	// 	if ( config.desired.platformName == 'Android' ) {
	// 		return this
	// 		.click()
	// 		.clear()
	// 		.sendKeys( keys )
	// 		.hideKeyboard();
		
	// 	} else if ( config.desired.platformName == 'IOS' ) {
	// 		return this
	// 		.click()
	// 		.elementByName( 'space' ).isDisplayed().should.eventually.be.true
	// 		.clear()
	// 		.sendKeys( keys );
	// 	}
	// } );
var driver = wd.promiseChainRemote( serverConfigs.local );
config.set( {
	'driver'   : driver,
	'elements' : elements
} );

describe( 'Automation Test in Progress!'.green, function () {

	this.timeout( timeout );
	var allPassed = true;
	require( './helpers/logging' ).configure( driver );

	commons.beforeAll();
	commons.afterAll();
	

	describe( 'Running automation test, Please wait for all test to complete!'.red, function () {

		// describe( 'Running "SourceCode Check and SourceCode updates" Test.'.red, function () {
			
		// 	var run = require( './TestFiles.js' );
		// 		run.sourceCodeCheck( 'gitPullCheck' );
		// 		//run.sourceCodeCheck( 'buildUpdates' );
		// } );
		
		describe( 'Running "Smoke Test"'.red, function () {
			
			describe( 'Running Sync Smoke Test'.red, function () {

				var run = require( './TestFiles.js' );
					run.logins( 'loginSanboxSmokeTest' );
			} );
		} );
	} );
} );
