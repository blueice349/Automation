'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with wrong clientAccount process using wrongClientAccount.js'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should enter wrong clientAccount'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementById( elements.loginScreen.clientAccount, 200000 )
			.then( function ( el ) {

					return commons.sendKeys(el, 'clientAccount!' );
			} );
		} );

		it( 'Should enter a good userName'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.userName )
			.then( function ( el ) {

				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.driverLogins.driver1.username );

				} else {
					return commons.sendKeys( el, login.driverLogins.driver2.username );
				}
			} );
		} );

		it( 'Should enter a good password.'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.driverLogins.driver1.password );

				} else {
					return commons.sendKeys( el, login.driverLogins.driver2.password );
				}
			} );
		} );

		it( 'Should acceptTerms.'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.acceptTerms )
			.click()		} );

		it( 'Should click the loginButton.'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.loginButton )
			.click()
		} );

		it( 'should get alert for incorrect clientAccount'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByXPath( commons.textToXPath( elements.alertButtons.ok ), 120000 )
			.then( function ( el ) {

				commons.alertText( alerts.loginLogoutAlerts.wrongClientAccount )
				return el
				.click()
				.sleep( 1000 );
			} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;
			console.log( 'wrongClientAccount test has Completed....'.green );
			done();
		} );
	});
};