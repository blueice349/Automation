'use strict';

require( 'colors' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );

var driver = config.driver;


describe( 'Start Create New Mobile Mike Node and save'.green, function () {

	it( 'Should Create New Node from mainMenuScreen Save'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		
		.then( function ( mobileMike ) {

			if ( lastUser.userRole === 'admin' || lastUser.userRole === 'driver'  ) {
				console.log( 'User is Allowed to add a New Redord'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.mobileMike + elements.mainMenuScreen.plusButton )
				.click()
				.sleep( 1000 )
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReg )
				.then( function ( textFieldReg ) {

					if ( textFieldReg ) {
						return commons.sendKeys( textFieldReg, lastUser.userName + ' Required Field' )
						.sleep ( 1000 );
					}
				} )
						
				.sleep( 1000 )
				.elementByName( elements.formScreen.actions )
				.click().sleep ( 100 )
				.elementByNameIfExists( elements.formScreen.save )
				.then( function ( save ) {

					if ( save ) {
						return save
						.click()
						.sleep( 1000 );

					} else {
						return driver
						.elementByName( elements.formScreen.cancel )
						.click()
						.sleep( 1000 );
					}
				} );
			} else {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
			}
			return driver;
		} ) 
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
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

			console.log( 'Adding a New Node has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
