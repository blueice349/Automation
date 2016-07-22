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
		commons.afterEachIt();

		it( 'Should wait for syncAllowed.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'Should check lastUser permissons and create a new doNotTow.'.green, function () {

			var lastUser = Store.get( 'lastUser' );	
			if ( lastUser.userRole === 'AdminClient' ) {
				console.log( 'User is Allowed to add a New Redord'.red );
				return driver
				.elementById( elements.doNotTow.doNotTow + elements.homeScreen.button )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.canCreate = true;
				} );
			
			} else if ( lastUser.userRole === 'client' ) {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				return driver
				.elementByIdIfExists( elements.doNotTow.doNotTow + elements.homeScreen.button )
				.then( function ( doNotTow ) {
					
					if ( doNotTow ) {
						assert.fail( 'User ' + lastUser.userName + ' Should not have access to ' + doNotTow + ' and should not exit' );
					
					} else {
						return;
					}
				} )
				.elementByIdIfExists( elements.doNotTow.doNotTow + elements.homeScreen.plusButton )
				.then( function ( doNotTowPlus ) {
					
					if ( doNotTowPlus ) {
						assert.fail( 'User ' + lastUser.userName + ' Should not have access to ' + doNotTowPlus + ' and should not exit' );
					
					} else {
						return;
					}
				} )
				.then( function () {

					config.canCreate = false;
				} );
			
			} else {
				console.log( 'Current is not a client account'.red );
				config.canCreate = false;
			}
		} );

		it( 'Should add text into the licensePlate field.'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( config.canCreate === true ) {
				return driver
				.elementById( elements.doNotTow.otherFields.licensePlate )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.doNotTow.otherFields.licensePlate )
				.then( function ( textField ) {

					if ( textField ) {
						return commons.sendKeys( textField, lastUser.userName  )
						.sleep ( 1000 );
					}
				} )
				.elementById( elements.doNotTow.otherFields.licensePlate )
				.text().should.eventually.become( lastUser.userName )
				.sleep( 1000 )
			
			} else {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.canCreate = false;
			}
		} );

		it( 'Should click actions --> save from the formScreen.'.green, function () {

			if ( config.canCreate === true ) {
				return driver		
				.elementById( elements.formScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.formScreen.actions )
				.click().sleep ( 100 )
				.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.formScreen.cancel ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.formScreen.save ) )
				.click()
				.sleep( 1000 )
			
			} else {
				console.log( 'Current User Does Not Have The Option to Add a New Node'.red );
				config.canCreate = false;
			}
		} );

		it( 'Should wait for syncAllowed and sync currentTest data to server.'.green, function () {

			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.syncAllowed )
			.click()
			.sleep ( 2000 )
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'clientDoNotTow test has Completed....'.green );
			done();
		} );
	} );
};