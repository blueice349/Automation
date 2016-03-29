'use strict';

require( 'colors' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );

var driver = config.driver;


describe( 'Start About Page Process'.green, function () {

	it( 'should go to about from actions screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		console.log( 'About App Automation...'.green );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.elementByName( elements.mainMenuScreen.actions )
		.click().sleep( 1000 )
		.waitForElementByName( elements.actionsScreen.drafts, 20000 )
		.elementByName( elements.actionsScreen.about )
		.click()
		.sleep( 1000 )
		.then( function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementByName( elements.aboutScreen.back, 10000 )
				.click()
				.waitForElementByName( elements.actionsScreen.back, 180000 )
				.click();

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.waitForElementByName( elements.actionsScreen.drafts, 20000 )
				.back().sleep( 100 );
			}
		} )
		.elementByNameIfExists( elements.mainMenuScreen.syncAllowed )
		.then( function ( sync ) {

			if ( sync ) {
				return driver
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.click()
				.sleep ( 2000 );
			}
			return driver;
		} )
		.then( function () {

			console.log( 'Logged out of Vehicle has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
