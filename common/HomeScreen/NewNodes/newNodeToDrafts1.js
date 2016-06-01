'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );
	var Store    = require( '../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start Create New Mobile Mike Node and Save to Drafts'.green, function () {

		it( 'Should Create New Node from homeScreen Save to Drafts'.green, function ( done ) {
			var lastUser = Store.get( 'lastUser' );
			driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.then( function ( mobileMike ) {

				if ( lastUser.userRole === 'admin' || lastUser.userRole === 'driver' || lastUser.userRole === 'AdminClient' ) {
					console.log( 'User is Allowed to add a New Redord'.red );
					return driver
					.elementByName( elements.mobile_MikeRecord.mobileMike + elements.homeScreen.plusButton )
					.click()
					.sleep( 1000 )
					.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
					.then( function ( textFieldCond ) {
					
						return commons.sendKeys( textFieldCond, lastUser.userName + ' Conditional Field' );
					} )	
					.sleep( 1000 )
					.elementByName( elements.formScreen.actions )
					.click().sleep ( 100 )
					.elementByNameIfExists( elements.formScreen.saveAsDraft )
					.then( function ( saveDrafts ) {

						if ( saveDrafts ) {
							return saveDrafts
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

				console.log( 'Adding a New Node to Drafts has Completed....'.green );
				config.currentTest = 'passed';
				done();
		 	} );
		} );
	} );
};