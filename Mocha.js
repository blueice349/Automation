//'use strict';

require( 'colors' );
require( './helpers/setup' );
//var failed        = require( './Test.js' );
var wd            = require( 'wd' );
var assert        = require( 'assert' );
var serverConfigs = require( './helpers/appium-servers' );
var apps          = require( './helpers/apps' );
var args          = process.argv.slice( 2 );
var config        = require( './helpers/Config' );
var actions       = require( './helpers/actions' );

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


//var commons  = require( './helpers/Commons' );
//wd.addPromiseChainMethod( 'inputKeys', commons.sendKeys );
wd.addPromiseChainMethod( 'inputKeys', function ( keys ) {

	if ( config.desired.platformName == 'Android' ) {
		return this
			.click()
			.clear()
			.sendKeys( keys )
			.hideKeyboard();
	} else {
		return this
			.click()
			.clear()
			.sendKeys( keys );
	}
} );
var driver = wd.promiseChainRemote( serverConfigs.local );
config.set( {
	'driver' : driver
} );

describe( 'Automation Test in Progress!'.green, function () {

	this.timeout( timeout );
	var allPassed = true;
	require( './helpers/logging' ).configure( driver );

	var tests    = apps.runTests;
	var elements = require( './helpers/elements' );

	before( function () {
		console.log( 'BEFORE...'.red );
		return driver.init( desired );
	} );

 	beforeEach( function () {
		console.log( 'beforeEach...'.red );
		config.currentTest = 'notStarted';
		config.loginTest   = false;
		
	} );


	after( function () {
		process.exit(1);
		return driver.quit();
	} );

	afterEach( function () {
		console.log( 'AFTEREACH...'.red );
		allPassed = allPassed && this.currentTest.state === 'passed';
		if ( config.currentTest != 'passed' && config.loginTest == false ) {
			return driver
			.resetApp()
			.sleep ( 3000 )
			.elementByNameIfExists( elements.formScreen.actions )
			.isDisplayed()
			.then( function ( actions ) {

				if ( actions === true ) {
					if ( commons.isIOS() ) {
						driver
						.elementByName( elements.formScreen.back )
						.click()
						.sleep ( 1000 );

					} else if ( commons.isAndroid() ) { 
						driver
						.back()
						.sleep( 1000 );
					}
				}
				return driver
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				.then( function () {
				
					console.log( 'App Restarted due to Failed test... App will not restart if a failed login test was performed'.green );
				} )
			} )
		} else if ( config.loginTest = true && config.currentTest != 'passed' ) {
			console.log( 'Automation could not resert and comeplete due to a login failed test.'.red );
			assert.fail( 'Login Test Failed' );
			driver.quit();
			//process.exit();
		}

	} );

	describe( 'Running automation test, Please wait for all test to complete!'.red, function () {

		var run = require( './Test.js' );

			run.logins( 'driver1' );
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
			run.actionsScreen( 'companyVehicle' );
			run.actionsScreen( 'clockInOut' );
			// run.actionsScreen( 'aboutButton' );
			run.mainMenuScreen( 'logout' );
			// run.logins( 'client1' );
			// run.restrictions( 'clientDoNotTow' );
			//run.actionsScreen( 'logout' );
	} );
} );
