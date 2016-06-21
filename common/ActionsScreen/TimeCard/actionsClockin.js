'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var assert   = require( 'assert' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var Store    = require( '../../../helpers/Store' );

	var driver          = config.driver;

	describe( 'Start clock in process from actionsScreen using "actionsClockin.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.elementByName( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should clockin from actionsScreen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true && lastUser.userRole != 'client' && config.isClockedin === false ) {	
				console.log( 'Clock In Button'.red );
				return driver
				.elementByName( elements.actionsScreen.clockIn )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.actionsScreen.clockIn )
				.click()
				.sleep( 2000 )
				.then( function () {
						
					return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockin );
				} )
				.elementByName( elements.alertButtons.clockIn )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.alertButtons.clockIn )
				.click()
				.sleep( 2000 )
				.then( function () {

					config.isClockedin = true;
					config.currentTest = 'passed';
				} )
				
			} else {
				console.log( 'User does not have the clockin option'.red );
				config.currentTest = 'passed';
			}
		} );
		
		it( 'should go back to homeScreen from actions screen.'.green, function () {
		
			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.back )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
			
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'Clocked in or out has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};