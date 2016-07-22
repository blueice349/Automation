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

	describe( 'Start clockout Process from actionsScreen using "actionsClockout.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.elementById( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should clockout out from actions screen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true && lastUser.userRole != 'client' && config.isClockedin === true ) {
				console.log( 'Clock Out Button'.red );
				return driver
				.elementById( elements.actionsScreen.clockOut )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.actionsScreen.clockOut )
				.click()
				.sleep( 2000 )
				.then( function () {
					
					return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockout );
				} )
				.elementByXPath( commons.textToXPath( elements.alertButtons.clockOut ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.alertButtons.clockOut ) )
				.click()
				.sleep( 2000 )
				.then( function () {

					config.isClockedin = false;
				} )
				
			} else {
				console.log( 'User does not have the clock out option'.red );
			}
		} );
		
		it( 'should go back to homeScreen from actions screen.'.green, function () {
		
			if ( commons.isIOS() ) {
				return driver
				.elementById( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementById( elements.actionsScreen.back )
				.click()

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
			}
		} );
			
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'Clockedout test has Completed....'.green );
			done();
		} );
	} );
};