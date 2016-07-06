'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with wrong userName process using wrongUserName.js'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should enter good clientAccount'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.loginScreen.clientAccount, 200000 )
			.then( function ( el ) {

				if ( commons.isIOS() ) {

					return commons.sendKeys( el, login.driverLogins.driver1.clientAccount );

				} else {
					return commons.sendKeys( el, login.driverLogins.driver2.clientAccount );
				}
			} );
		} );

		it( 'Should enter a wrong userName'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				return commons.sendKeys( el, 'Wrong userName' );
			} );
		} );

		it( 'Should enter a good password.'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.password )
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
			.elementByName( elements.loginScreen.acceptTerms )
			.click()
		} );

		it( 'Should click the loginButton.'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.loginButton )
			.click()
		} );

		it( 'should get alert for bad incorrect userName or password'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.alertButtons.ok, 120000 )
			.then( function ( el ) {

				commons.alertText( alerts.loginLogoutAlerts.wrongUserNamePassword )
				return el
				.click()
				.sleep( 1000 )
			} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;
			console.log( 'wrongPasswort test has Completed....'.green );
			done();
		} );
	});
};