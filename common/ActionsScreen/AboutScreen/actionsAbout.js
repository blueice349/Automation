'use strict';

module.exports = function () {

	require( 'colors' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var Store    = require( '../../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start About Page Process using "aboutButton.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should go to Actions Screen from homeScreen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
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
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.actionsScreen.about )
			.click()
			.sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for "Omadi Logo" on aboutScreen.'.green, function () {

			return driver
			.elementByName( elements.aboutScreen.logo )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check "App Version" on aboutScreen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );	
			return driver
			.elementByName( elements.aboutScreen.appVersion )
			.text().should.eventually.become( lastUser.appVersion )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for "Singed into account as user" on aboutScreen.'.green, function () {

			return driver
			.elementByName( elements.aboutScreen.signedInto )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for "Last Synced Time" on aboutScreen.'.green, function () {

			return driver
			.elementByName( elements.aboutScreen.syncTime )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for "Terms of Service" on aboutScreen.'.green, function () {

			return driver
			.elementByName( elements.aboutScreen.terms )
			.isDisplayed().should.eventually.be.true
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

		it( 'should goo back to the homeScreen from actionsScreen.'.green, function () {

			if ( commons.isIOS() ) {
				return driver
				.waitForElementByName( elements.actionsScreen.back, 120000 )
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