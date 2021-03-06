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
					'desired' : desired,
					'sim'     : true
				} );
			// config.set( {
			// 	'sim' : true
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
					'desired' : desired,
					'sim'     : false
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

		describe( 'Running "SourceCode Check and SourceCode updates" Test.'.red, function () {
			
			var run = require( './TestFiles.js' );
				run.sourceCodeCheck( 'gitPullCheck' );
				//run.sourceCodeCheck( 'buildUpdates' );
		} );
		
		describe( 'Running "Driver1 iOS Test && Driver2 Android Test"'.red, function () {
			
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

				/* Node(s) Test */
					// run.restrictionNodes( 'restrictLicensePlate' );
					//run.otherNodes( 'newTag;' );
					run.requiredNodes( 'required' );
					run.conditionRequiredNodes( 'conditionRequiredTextFieldFilled' );
					run.conditionRequiredNodes( 'conditionRequiredTextFieldEmpty' );
					run.conditionRequiredNodes( 'conditionRequiredCheckboxChecked' );
					run.conditionNotMetNodes( 'textAreaFieldConditionNotMet' );

		        /* draft Test*/
					run.draftNodes( 'newDraft1' );
					run.actionsScreen( 'draftView' );
					run.actionsScreen( 'draftSave' );
					run.draftNodes( 'newDraft2' );
					run.actionsScreen( 'draftSave' );
					run.draftNodes( 'newDraft3' );
					run.actionsScreen( 'draftSave' );
					run.draftNodes( 'newDraft4' );
					run.actionsScreen( 'draftSave' );
					run.draftNodes( 'newDraft1' );
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
					run.actionsScreen( 'actionsAbout' );
					run.homeScreen( 'logout' );
		} );

		describe( ' Running "Client1 iOS Test && Client2 Android Test"'.red, function () {
			
			var run = require( './TestFiles.js' );
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
					run.otherNodes( 'newTag;' );
					run.clientNodes( 'clientDoNotTow' );

				/* Actions Test */
					run.actionsScreen( 'clockout' );
					run.actionsScreen( 'resetAllData' );
					run.actionsScreen( 'actionsAbout' );

				/* Logout test */

					run.actionsScreen( 'logout' );
		} );

		describe( 'Running Client3 iOS Test && Client4 Android Test'.red, function () {
			
			var run = require( './TestFiles.js' );
			/* Client3 iOS Test && Client4 Android Test */

				run.logins( 'client2' );
				run.logins( 'homeScreenCheck' );
				run.homeScreen( 'homeScreenItems' );
				run.actionsScreen( 'draftView' );
				run.recentScreen(  'recentScreenCheckOptions' );  
				run.clientNodes( 'clientDoNotTow' );
				run.homeScreen( 'logout' );
		} );
	} );
} );
