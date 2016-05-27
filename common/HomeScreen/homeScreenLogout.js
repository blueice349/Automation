'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../helpers/setup' );
	var alerts   = require( '../../helpers/alerts' );
	var assert   = require( 'assert' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );
	var Store    = require( '../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start logout Process'.green, function( ) {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should wait for syncAllowed', function () {

			config.loginoutTest = true;
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 40000 )
			.then( function () {
				
				config.currentTest = 'passed';
			} );
		} );

		it( 'Should make sure all buttons are visble after syncAllowed'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			//Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' || lastUser.userRole == 'driver' ) {
				return driver
				.elementByName( lastUser.name )
				.text().should.eventually.become( lastUser.name )
				.elementByName( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.jobs )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					if ( lastUser.tagButton == true ) {
						return driver
						.elementByName( elements.homeScreen.expiredTags )
						.isDisplayed().should.eventually.be.true
					}
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
				return driver
				.elementByName( lastUser.name )
				.text().should.become( lastUser.name )
				.elementByName( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.logout )
				.isDisplayed().should.eventually.be.true
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true	
				.elementByNameIfExists( elements.homeScreen.alerts )
				.then( function ( alerts ) {

					if ( alerts ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.homeScreen.expiredTags )
				.then( function ( expiredTags ) {

					if ( expiredTags ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.elementByNameIfExists( elements.homeScreen.jobs )
				.then( function ( jobs ) {

					if ( jobs ) {
						assert.fail( 'The following element exist and should not exist '.red + alerts );
					}
				} )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should click on the logout_button from homeScreen'.green, function() {

			return driver
			.elementByName( elements.homeScreen.logout )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.logout )
			.click()
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should check for a Vehicle Inspection'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );	
			if ( lastUser.truckOption === true ) {
				console.log( 'Should ask user to post-Inspect'.red );
				return commons.alertText( alerts.loginLogoutAlerts.doInspection )
				.elementByName( elements.alertButtons.no )
				.click()
				.then( function () {

					config.currentTest = 'passsed';
				} );

			} else if ( lastUser.truckOption === false ) {
				console.log( 'User does not have vehicle options!'.red );
				config.currentTest = 'passsed';

			} else {
				assert.fail( 'User truckOption is \'undefined\' and/or not set up!'.red );
			}
		} );

		it( 'should check if user isClockedin'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true && config.isClockedin === true ) {
				console.log( 'User isClockedin should check if current alert is visibile'.red );
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOutClockout )
				.then( function () {

					config.currentTest = 'passed';
				} );
			} else {
				console.log( 'User is NOT clockedin should check if current alert is visibile'.red );
				return commons.alertText( alerts.actionsScreenAlerts.logOutNow.logOut )
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should clockOut & logout or Clockout Now'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.clockInOption === true && config.isClockedin === true ) {
				console.log( 'Clock out + Logout'.red );
				return driver
				.elementByName( elements.alertButtons.clockOutLogout )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );
			} else {
				console.log( 'Logout Now'.red );
				return driver
				.elementByName( elements.alertButtons.logout )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should check for elements on loginScreen after being logged out'.green, function () {

			return driver
			.waitForElementByName( elements.loginScreen.client_account, 200000 )
			.isDisplayed().should.eventually.be.true		
			.then( function ( loginScreen ) {

				if ( loginScreen ) {
					return driver
					.elementByName( elements.loginScreen.user_name )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.loginScreen.password )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.loginScreen.login_button )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.loginScreen.accept_terms )
					.isDisplayed().should.eventually.be.true

				} else {
					assert.fail( 'Can\'t find the ' + elements.loginScreen.client_account + ' element.' ); 
				}
			} )
			.sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
		 	} );
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Logout from homeScreen has completed Completed...'.green );
			config.currentTest = 'passed';
			done();
		} );
	});
};