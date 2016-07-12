'use strict';

module.exports = function () {

	require( 'colors' );
	var alerts   = require( '../../../helpers/alerts' );
	var config   = require( '../../../helpers/Config' );
	var elements = require( '../../../helpers/elements' );
	var commons  = require( '../../../helpers/Commons' );
	var login    = require( '../../../helpers/loginTable' );


	var driver = config.driver;

	describe( 'Start try login with blank userName process using blankUserName.js'.green, function() {

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

		it( 'Should make sure userName is blank'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.userName )
			.click()
			.clear()
		} );

		it( 'Should enter a good password.'.green, function () {

			config.loginTest = true;
			return driver
			.elementByName( elements.loginScreen.password )
			.then( function ( password ) {
				
				if ( commons.isIOS() ) {
					return commons.sendKeys( password, login.driverLogins.driver1.password );

				} else {
					return commons.sendKeys( password, login.driverLogins.driver2.password );
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

		it( 'should get alert for blank userName'.green, function () {

			config.loginTest = true;
			return driver
			.waitForElementByName( elements.alertButtons.ok, 120000 )
			.then( function () {

				return commons.alertText( alerts.loginLogoutAlerts.blankUserName )
			} )
			.elementByName( elements.alertButtons.ok )
			.click()
			.sleep( 1000 );
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;
			console.log( 'blankUserName test has Completed....'.green );
			done();
		} );
	});
};