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

		case '-reset' : {
			if ( args[ i + 1 ] !== undefined ) {
				config.set( {
					'reset' : true
				} );
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
} );;

describe( 'Automation Test in Progress!'.green, function () {

	this.timeout( timeout );
	var allPassed = true;
	require( './helpers/logging' ).configure( driver );

	var tests = apps.runTests;

	commons.beforeAll();
	commons.afterAll();
	

	describe( 'Running automation test, Please wait for all test to complete!'.red, function () {

		var run = require( './TestFiles.js' );

			/* Driver1 iOS Test && Driver2 Android Test */	

				/* Driver login with truck and clockin options */
					run.logins( 'driver1' );
					run.logins( 'clockin' );
					run.logins( 'selectVehicle' );
					run.logins( 'homeScreenCheck' );

		       /* jobs test */
					run.homeScreen( 'homeScreenItems' );
					run.jobsScreen( 'acceptJob' );
					run.jobsScreen( 'drivingToJob' );
					run.jobsScreen( 'arrivedAtJob' );
					run.jobsScreen( 'towingJob' );
					run.jobsScreen( 'arrivedDestination' );
					run.jobsScreen( 'jobComplete' );

				/* New nodes Test */
					// run.newNodes( 'restrictLicensePlate' );
					//run.newNodes( 'newTag;' );
					run.newNodes( 'required' );
					run.newNodes( 'conditionRequiredTextFieldFilled' );
					run.newNodes( 'conditionRequiredCheckboxChecked' );

		        /* draft Test*/
					run.newNodes( 'newDraft1' );
					run.actionsScreen( 'draftView' );
					run.actionsScreen( 'draftSave' );
					run.newNodes( 'newDraft2' );
					run.actionsScreen( 'draftSave' );
					run.newNodes( 'newDraft3' );
					run.actionsScreen( 'draftSave' );
					run.newNodes( 'newDraft4' );
					run.actionsScreen( 'draftSave' );
					run.newNodes( 'newDraft1' );
					run.actionsScreen( 'draftDelete' );
					run.actionsScreen( 'resetAllData' );

			  	/* Company Vehicle test */
					run.actionsScreen( 'removeVehicle' );
					run.actionsScreen( 'selectVehicle' );

			  	/* Recent Screen Test */
					run.recentScreen(  'recentScreenCheckOptions' );  
					run.recentScreen(  'recentScreenViewNode' ); 

			  	/* Clock in and out test */
					run.actionsScreen( 'clockout' );
					run.actionsScreen( 'clockin' );
					run.actionsScreen( 'aboutButton' );
					run.homeScreen( 'logout' );

			/* Client1 iOS Test && Client2 Android Test */
			
				/* Client login, clock in & vehicle check */
					run.logins( 'client1' );
					run.logins( 'clockin' );
					run.logins( 'selectVehicle' );

				/* HomeScreen Test */
					run.logins( 'homeScreenCheck' );
					run.homeScreen( 'homeScreenItems' );

				/* recentScreen Test */
					run.recentScreen(  'recentScreenCheckOptions' ); 
					run.recentScreen(  'recentViewedTabViewNode' ); 
					run.recentScreen(  'recentSavedTabViewNode' ); 

				/* New Nodes Test */
					run.newNodes( 'newTag;' );
					run.newNodes( 'clientDoNotTow' );

				/* Actions Test */
					run.actionsScreen( 'clockout' );
					run.actionsScreen( 'resetAllData' );
					run.actionsScreen( 'aboutButton' );

				/* Logout test */

					run.actionsScreen( 'logout' );

			/* Client3 iOS Test && Client4 Android Test */

				run.logins( 'client2' );
				run.logins( 'homeScreenCheck' );
				run.homeScreen( 'homeScreenItems' );
				run.actionsScreen( 'draftView' );
				run.recentScreen(  'recentScreenCheckOptions' );  
				run.newNodes( 'clientDoNotTow' );
				run.homeScreen( 'logout' );
	} );
} );
