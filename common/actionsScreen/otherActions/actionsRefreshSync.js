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

	describe( 'Start refresh sync data process using "actionsRefreshSync.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should wait for syncAllowed.'.green, function () {
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.elementById( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
		} );

		it( 'should refresh / sync data with server from actions screen.'.green, function () {

			return driver
			.elementById( elements.actionsScreen.sync )
			.isDisplayed()
			.then( function ( sync ) {

				if ( sync === false ) {
					return driver
					.elementById( elements.actionsScreen.about )
					.isDisplayed().should.eventually.be.true
					.elementById( elements.actionsScreen.about )
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
			.elementById( elements.actionsScreen.sync )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.actionsScreen.sync )
			.click()
			.sleep( 800 )
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

		it( 'should be on homeScreen from actionsScreen and wait for syncAllowed.'.green, function () {

			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
			
			console.log( 'sync from actionsScreen test has Psssed....'.green );
			done();
		} );
	} );
};