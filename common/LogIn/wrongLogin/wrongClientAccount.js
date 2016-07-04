'use strict';

module.exports = function () {

	require( 'colors' );
	var alert    = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with wrong clientAccount process using wrongClientAccount.js'.green, function() {

		it( 'Should enter wrong clientAccount'.green, function () {

			return driver
			.waitForElementByName( elements.loginScreen.clientAccount, 200000 )
			.then( function ( el ) {

					return commons.sendKeys(el, 'Wrong account!' );
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should enter a good userName'.green, function () {

			return driver
			.elementByName( elements.loginScreen.userName )
			.then( function ( el ) {

				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.driverLogins.driver1.username );

				} else {
					return commons.sendKeys( el, login.driverLogins.driver2.username );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should enter a good password.'.green, function () {

			return driver
			.elementByName( elements.loginScreen.password )
			.then( function ( el ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( el, login.driverLogins.driver1.password );

				} else {
					return commons.sendKeys( el, login.driverLogins.driver2.password );
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should acceptTerms.'.green, function () {

			return driver
			.elementByName( elements.loginScreen.acceptTerms )
			.click()
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should click the loginButton.'.green, function () {

			return driver
			.elementByName( elements.loginScreen.loginButton )
			.click()
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should get alert for incorrect clientAccount'.green, function () {

			return driver
			.waitForElementByName( elements.alertButtons.ok, 120000 )
			.then( function ( el ) {

				return commons.alertText( alerts.loginLogoutAlerts.wrongClientAccount );
				el.click()
				.sleep( 1000 )
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'wrongClientAccount test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	});
};