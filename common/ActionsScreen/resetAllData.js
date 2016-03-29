'use strict';

require( 'colors' );
var assert   = require('assert');
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );

var driver = config.driver;


describe( 'Start Reset All Data Process'.green, function () {

	it( 'should reset all data from actions screen.'.green, function ( done ) {

		console.log( 'Reset All Data Automation...'.green );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.elementByName( elements.mainMenuScreen.actions )
		.click().sleep( 1000 )
		.waitForElementByName( elements.actionsScreen.drafts, 20000 )
		.sleep( 1000 )
		.elementByName( elements.actionsScreen.resetData )
		.isDisplayed()
		.then( function ( resetData ) {

			if ( resetData === false ) {
				return driver
				.elementByName( elements.actionsScreen.about )
				.getLocation()
				.then( function ( loc ) {

					return driver.swipe( {
		              startX: loc.x, startY: loc.y,
		              endX: loc.x, endY: loc.y - 500,
		              duration: 800 
		          	} );
				} );
			}
		} )
		.sleep ( 1000 )
		.elementByName( elements.actionsScreen.resetData )
		.click()
		.sleep( 800 )
		.elementByName( elements.alertButtons.deleteIt )
		.click()
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.then( function ( sync ) {

			if ( sync ) {
				return driver
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.click()
				.sleep ( 2000 )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed()
				.then( function ( mainMenuScreen ) {

					if ( !mainMenuScreen ) {
						if ( commons.isIOS() ) {
							return driver
							.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
							.click()
							.sleep( 1000 );

						} else if ( commons.isAndroid() ) {
							return driver
							.back()
							.sleep( 1000 );
						}
					}
				} );
			}
			return driver;
		} )
		.then( function () {

			console.log( 'Reset ALL Data has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
