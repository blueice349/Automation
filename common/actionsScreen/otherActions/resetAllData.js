'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var assert   = require( 'assert' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver = config.driver;

	describe( 'Start Reset All Data Process using "resetAllData.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should wait for syncAllowed.'.green, function () {
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
		} );

		it( 'should reset all data from actions screen.'.green, function () {

			return driver
			.elementByName( elements.actionsScreen.resetData )
			.isDisplayed()
			.then( function ( resetData ) {

				if ( resetData === false ) {
					return driver
					.elementByName( elements.actionsScreen.about )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.actionsScreen.about )
					.getLocation()
					.then( function ( loc ) {

						return driver.swipe( {
			              startX: loc.x, startY: loc.y,
			              endX: loc.x, endY: loc.y - 500,
			              duration: 800 
			          	} );
					} );
				}
			} )
			.sleep ( 1000 )
			.elementByName( elements.actionsScreen.resetData )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.actionsScreen.resetData )
			.click()
			.sleep( 800 )
			.then( function () {

				return commons.alertText( alerts.actionsScreenAlerts.resetAllData.resetAllDataHeader );
			} )
			.elementByName( elements.alertButtons.deleteIt )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.alertButtons.deleteIt )
			.click()
		} );

		it( 'should be on homeScreen from actionsScreen and wait for syncAllowed.'.green, function () {

			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'resetAllData test has Psssed....'.green );
			done();
		} );
	} );
};