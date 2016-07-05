'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with blank termsOfService not accepted using termsNotAccepted.js'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

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
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'Should enter good userName'.green, function () {

			config.loginTest = true;
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

			config.loginTest = true;
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

		it( 'Should click the loginButton.'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.loginButton )
			.click()
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should get alert for termsOfService not accepted.'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.alertButtons.ok, 120000 )
			.then( function ( el ) {

				commons.alertText( alerts.loginLogoutAlerts.blankTermsOfService )
				return el
				.click()
				.sleep( 1000 )
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;
			console.log( 'termsOfService not accepted test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	});
};