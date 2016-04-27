//'use strict';

require( 'colors' );
require( './helpers/setup' );
var wd            = require( 'wd' );
var assert        = require( 'assert' );
var serverConfigs = require( './helpers/appium-servers' );
var apps          = require( './helpers/apps' );
var args          = process.argv.slice( 2 );
var config        = require( './helpers/Config' );
var actions       = require( './helpers/actions' );
var elements      = require( './helpers/elements' );

var desired;
var timeout       = 180000;
var simulator     = false;
var androidDevice = false;
var iosDevice     = false;

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
					'desired' : desired
				} );
			// config.set( {
			// 	'simulator' : true
			// } );
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

		case '-os' : {
			if ( args[ i + 1 ] !== undefined ) {
				desired = require( './helpers/caps' )[ args[ i + 1 ] ];

				config.set( {
					'os'      : args[ i + 1 ],
					'desired' : desired
				} );
				if ( config.os === 'Android' ){
					androidDevice = true;
				} else if ( config.os === 'iOS' ) {
					iosDevice = true;
				}
			} else {
				throw 'You did not specify a os for -os';
			}

			break;
		}
	}
}


var commons  = require( './helpers/Commons' );
//wd.addPromiseChainMethod( 'inputKeys', commons.sendKeys );
wd.addPromiseChainMethod( 'inputKeys', function ( config, keys ) {

	if ( config.desired.platformName == 'Android' ) {
		return this
			.click()
			.clear()
			.sendKeys( keys )
			.hideKeyboard();
	} else if ( config.desired.platformName == 'IOS' ) {
		return this
			.click()
			.elementByName( 'space' ).isDisplayed().should.eventually.be.true
			.clear()
			.sendKeys( keys );
	}
} );
var driver = wd.promiseChainRemote( serverConfigs.local );
config.set( {
	'driver'   : driver,
	'elements' : elements
} );

describe( 'Automation Test in Progress!'.green, function () {

	this.timeout( timeout );
	var allPassed = true;
	require( './helpers/logging' ).configure( driver );

	var tests = apps.runTests;

	commons.beforeAll();
	commons.afterAll();
	

	describe( 'Running automation test, Please wait for all test to complete!'.red, function () {

		var run = require( './Test.js' );

			run.logins( 'driver2' );
			run.jobsScreen( 'acceptJob' );
			run.jobsScreen( 'drivingToJob' );
			run.jobsScreen( 'arrivedAtJob' );
			run.jobsScreen( 'towingJob' );
			run.jobsScreen( 'arrivedDestination' );
			run.jobsScreen( 'jobComplete' );
			// run.restrictions( 'licensePlate' );
			// run.newNodes( 'required' );
			// run.newNodes( 'conditionallyRequired' );
			// run.newNodes( 'nodeToDrafts1' );
			// run.newNodes( 'nodeToDrafts2' );
			// run.actionsScreen( 'draftSave' );
			// run.actionsScreen( 'draftDelete' );
			// run.actionsScreen( 'resetAllData' );
			// run.actionsScreen( 'companyVehicle' );
			// run.actionsScreen( 'clockInOut' );
			// run.actionsScreen( 'aboutButton' );
			run.mainMenuScreen( 'logout' );
			// run.logins( 'client1' );
			// run.restrictions( 'clientDoNotTow' );
			// run.actionsScreen( 'logout' );
	} );
} );
