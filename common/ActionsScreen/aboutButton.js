'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );
	var Store    = require( '../../helpers/Store' );
	var driver = config.driver;
	var lastUser = Store.get( 'lastUser' );

	describe( 'Start About Page Process'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should go to Actions Screen from mainMenuScreen'.green, function() {
			
			return driver
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.elementByName( elements.mainMenuScreen.actions )
			.click()
			.sleep( 800 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should go to aboutScreen from actions screen.'.green, function () {

			return driver
			.waitForElementByName( elements.actionsScreen.drafts, 20000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.actionsScreen.about )
			.click()
			.sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should go back to the actionsScreen from aboutScreen.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementByName( elements.aboutScreen.back, 10000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.aboutScreen.back )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.waitForElementByName( elements.actionsScreen.drafts, 20000 )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should goo back to the mainMenuScreen from actionsScreen.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.back, 180000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.actionsScreen.back )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.drafts, 20000 )
				.isDisplayed().should.eventually.be.true
				.back().sleep( 100 )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
		

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'go to aboutScreen test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};