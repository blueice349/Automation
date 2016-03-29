'use strict';

require( 'colors' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );

var driver   = config.driver;

describe( 'Start Create New Mobile Mike Node with Condition required filed and save'.green, function () {

	it( 'Should Create New Node from mainMenuScreen with Conditions and Save'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		
		.then( function ( mobileMike ) {

			if ( lastUser.userRole != 'driver' && lastUser.userRole != 'admin' ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				return driver;

			} else if ( lastUser.userName == 'driver1' || lastUser.userName == 'driver2'  ) {
				console.log( 'User should have a field required to save'.red );
				return driver
				.elementByName( elements.mobile_MikeRecord.mobileMike + elements.mainMenuScreen.plusButton )
				.click()
				.sleep( 1000 )
				.then( function () {

					if ( commons.isAndroid() ) {
						return driver
						.hideKeyboard();
					}
				} )
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
				.then( function ( textFieldReq ) {
					
					return commons.sendKeys( textFieldReq, lastUser.userName + ' Required Field' );
				} )
				.elementByName( elements.formScreen.actions )
				.click()
				.sleep ( 100 )
				.elementByName( elements.formScreen.save )
				.click()
				.sleep( 1000 )
				.waitForElementByName( elements.alertButtons.ok, 4000 )
				.click()
				.sleep( 1000 )
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldCond )
				.then( function ( textFieldCond ) {
				
						return commons.sendKeys( textFieldCond, lastUser.userName + ' Conditional Field' );
				} )
				.elementByName( elements.formScreen.actions )
				.click()
				.sleep ( 100 )
				.elementByName( elements.formScreen.save )
				.click()

			} else if ( lastUser.userRole == 'driver' && lastUser.userName != 'driver1' &&  lastUser.userName != 'driver2' || lastUser.userRole == 'admin' ) {
				console.log ( 'current user can save with out a condion required field' );
				return driver
				.elementByName( elements.mobile_MikeRecord.mobileMike + elements.mainMenuScreen.plusButton )
				.click()
				.sleep( 1000 )
				.then( function () {

					if ( commons.isAndroid() ) {
						return driver
						.hideKeyboard();
					}
				} )
				.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq )
				.then( function ( textFieldReq ) {
					
					return commons.sendKeys( driver.elementByName( elements.mobile_MikeRecord.otherFields.textFieldReq ), 'Required Field' );
				} )
				.elementByName( elements.formScreen.actions )
				.click()
				.sleep ( 100 )
				.elementByName( elements.formScreen.save )
				.click()
				.sleep( 1000 );
			}
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
