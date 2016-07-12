'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with blank password process using blankPassword.js'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();	

		it( 'Should enter good clientAccount'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.loginScreen.clientAccount, 200000 )
			.then( function ( clientAccount ) {

				if ( commons.isIOS() ) {
					return commons.sendKeys( clientAccount, login.driverLogins.driver1.clientAccount );

				} else {
					return commons.sendKeys( clientAccount, login.driverLogins.driver2.clientAccount );
				}
			} );
		} );

		it( 'Should enter good userName'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.userName )
			.then( function ( userName ) {

				if ( commons.isIOS() ) {
					return commons.sendKeys( userName, login.driverLogins.driver1.username );

				} else {
					return commons.sendKeys( userName, login.driverLogins.driver2.username );
				}
			} );
		} );

		it( 'Should make sure password is blank.'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.password )
			.click()
			.clear()
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

		it( 'should get alert for blank password'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.alertButtons.ok, 120000 )
			.then( function () {

				return commons.alertText( alerts.loginLogoutAlerts.blankPassword )
			} )
			.elementByName( elements.alertButtons.ok )
			.click()
			.sleep( 1000 );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;
			console.log( 'blankPassword test has Completed....'.green );
			done();
		} );
	});
};