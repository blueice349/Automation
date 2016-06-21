'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var assert   = require( 'assert' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var Store    = require( '../../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start Create New Do Not Tow Node using licensePlate using "clientDoNotTow.js".'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should wait for syncAllowed.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should check lastUser permissons and create a new doNotTow.'.green, function () {

			var lastUser = Store.get( 'lastUser' );	
			if ( lastUser.userRole === 'AdminClient' ) {
				console.log( 'User is Allowed to add a New Redord'.red );
				return driver
				.elementByName( elements.doNotTow.doNotTow + elements.homeScreen.button )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.canCreate   = true;
					config.currentTest = 'passed';
				} );
			
			} else if ( lastUser.userRole === 'client' ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				return driver
				.elementByNameIfExists( elements.doNotTow.doNotTow + elements.homeScreen.button )
				.then( function ( doNotTow ) {
					
					if ( doNotTow ) {
						assert.fail( 'User ' + lastUser.userName + ' Should not have access to ' + doNotTow + ' and should not exit' );
					
					} else {
						return;
					}
				} )
				.elementByNameIfExists( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
				.then( function ( doNotTowPlus ) {
					
					if ( doNotTowPlus ) {
						assert.fail( 'User ' + lastUser.userName + ' Should not have access to ' + doNotTowPlus + ' and should not exit' );
					
					} else {
						return;
					}
				} )
				.then( function () {

					config.canCreate   = false;
					config.currentTest = 'passed';
				} );
			
			} else {
				console.log( 'Current is not a client account'.red );
				config.canCreate   = false;
				config.currentTest = 'passed';
			}
		} );

		it( 'Should add text into the licensePlate field.'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( config.canCreate === true ) {
				return driver
				.elementByName( elements.doNotTow.otherFields.licensePlate )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.doNotTow.otherFields.licensePlate )
				.then( function ( textField ) {

					if ( textField ) {
						return commons.sendKeys( textField, lastUser.userName  )
						.sleep ( 1000 );
					}
				} )
				.elementByName( elements.doNotTow.otherFields.licensePlate )
				.text().should.eventually.become( lastUser.userName )
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			
			} else {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.canCreate  = false;
				config.currentTest = 'passed';
			}
		} );

		it( 'Should click actions --> save from the formScreen.'.green, function () {

			if ( config.canCreate === true ) {
				return driver		
				.elementByName( elements.formScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.actions )
				.click().sleep ( 100 )
				.elementByName( elements.formScreen.save )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.cancel )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.save )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			
			} else {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.canCreate  = false;
				config.currentTest = 'passed';
			}
		} );

		it( 'Should wait for syncAllowed and sync currentTest data to server.'.green, function () {

			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.syncAllowed )
			.click()
			.sleep ( 2000 )			
			.then( function () {

				console.log( 'Adding a restrictedPlate has Completed....'.green );
				config.currentTest = 'passed';
		 	} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'clientDoNotTow test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};