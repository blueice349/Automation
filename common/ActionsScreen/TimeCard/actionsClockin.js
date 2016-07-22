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

		it( 'should clockin from actionsScreen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true && lastUser.userRole != 'client' && config.isClockedin === false ) {	
				console.log( 'Clock In Button'.red );
				return driver
				.elementById( elements.actionsScreen.clockIn )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.actionsScreen.clockIn )
				.click()
				.sleep( 2000 )
				.then( function () {

					return commons.alertText( alerts.actionsScreenAlerts.timeCard.clockin );
				} )
				.elementByXPath( commons.textToXPath( elements.alertButtons.clockIn ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.alertButtons.clockIn ) )
				.click()
				.sleep( 2000 )
				.then( function () {

					config.isClockedin = true;
				} )
				
			} else {
				console.log( 'User does not have the clockin option'.red );
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
			
			console.log( 'Clocked in or out has Completed....'.green );
			done();
		} );
	} );
};