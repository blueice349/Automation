'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );
	var Store    = require( '../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start Create New Do Not Tow Node and save'.green, function () {

		it( 'Should Create New do not tow Node from homeScreen Save'.green, function () {
			var lastUser = Store.get( 'lastUser' );
			driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			
			.then( function ( mobileMike ) {

				if ( lastUser.userRole === 'AdminClient' || lastUser.userRole === 'client' || lastUser === 'admin'  ) {
					console.log( 'User is Allowed to add a New Redord'.red );
					return driver
					.elementByName( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
					.click()
					.sleep( 1000 )
					.elementByName( elements.doNotTow.otherFields.licensePlate )
					.then( function ( textField ) {

						if ( textField ) {
							return commons.sendKeys( textField, 'test' )
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
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.then( function ( sync ) {
				if ( sync ) {
					return driver
					.elementByName( elements.homeScreen.syncAllowed )
					.click()
					.sleep ( 2000 );
				}
				return driver;
			} )
			.then( function () {

				console.log( 'Adding a New Node has Completed....'.green );
				config.currentTest = 'passed';
		 	} );
		} );
	} );
};