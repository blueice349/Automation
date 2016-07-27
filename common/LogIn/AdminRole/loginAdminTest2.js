'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var apps     = require( '../../../helpers/apps' ); 
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver = config.driver;

	var clientAccount,
	var truckOption;
	var clockInOption;
	var userRole;
	var userName;
	var password;
	var name;
	var permissionGranted;
	var performJob;
	var tagButton;

	describe( 'Start login Process using "loginAdminTest2.js"'.green, function( done ) {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should set user information and enter clientAccount '.green, function () {

			return driver
			.elementById( elements.loginScreen.clientAccount )
			.then( function ( el ) { 

				if ( commons.isIOS() ){
					clientAccount     = login.adminLogins.admin3.clientAccount;
					truckOption       = login.adminLogins.admin3.truckOption;
					clockInOption     = login.adminLogins.admin3.clockInOption;
					userRole          = login.adminLogins.admin3.userRole;
					userName          = login.adminLogins.admin3.username;
					password          = login.adminLogins.admin3.password;
					name              = login.adminLogins.admin3.name;
					performJob        = login.adminLogins.admin3.performJob;
					tagButton         = login.adminLogins.admin3.tagButton;
					return el.text()
					.then( function ( text ) {

						if ( text === clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						
						} else {
							return commons.sendKeys( el, clientAccount );
						}
					} )

				} else if ( commons.isAndroid() ) {
					clientAccount     = login.adminLogins.admin4.clientAccount;
					truckOption       = login.adminLogins.admin4.truckOption;
					clockInOption     = login.adminLogins.admin4.clockInOption;
					userRole          = login.adminLogins.admin4.userRole;
					userName          = login.adminLogins.admin4.username;
					password          = login.adminLogins.admin4.password;
					name              = login.adminLogins.admin4.name;
					performJob        = login.adminLogins.admin4.performJob;
					tagButton         = login.adminLogins.admin4.tagButton;
					return el.text()
					.then( function ( text ) {

						if ( text === clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						
						} else {
							return commons.sendKeys( el, clientAccount );
						}
					} )
				}
			} );
		} );

		it( 'should store current user information'.green, function () {
			config.loginTest = true;
			Store.set( 'lastUser', {
				'clientAccount'     : clientAccount,
				'truckOption'       : truckOption,
				'clockInOption'     : clockInOption,
				'userRole'          : userRole,
				'userName'          : userName,
				'password'          : password,
				'name'              : name,
				'permissionGranted' : permissionGranted,
				'performJob'        : performJob,
				'tagButton'         : tagButton
			} );
		} );

		it( 'should enter username'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.userName )
			.then( function ( el ) {

				return el.text()
				.then( function ( text ) {

					if ( text === userName ) {
						console.log( 'username is already set.'.red );
						return;
					
					} else {
						return commons.sendKeys( el, userName );
					}
				} )
			} )
		} );

		it( 'should enter password'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.password )
			.then( function ( el ) {
				
				return commons.sendKeys( el, password );
			} )
		} );

		it( 'Should check clientAccount and username'.green, function () {

			config.loginTest = true;
			return driver
			.elementById( elements.loginScreen.clientAccount )
			.text().should.eventually.become( clientAccount )
			.elementById( elements.loginScreen.userName )
			.text().should.eventually.become( userName )
		} );

		it( 'should click acceptTerms and loginButton'.green, function () {

			config.loginTest = true;
			return driver
			.elementByIdIfExists( elements.loginScreen.needToAgreeToTerms )
			.then( function ( needToAgreeToTerms ) {
				
				if ( needToAgreeToTerms ) {
					return needToAgreeToTerms
					.isDisplayed().should.eventually.be.true
					.elementById( elements.loginScreen.needToAgreeToTerms )
					.click()
					.elementById( elements.loginScreen.loginButton )
					.click()

				} else { 
					return driver
					.elementById( elements.loginScreen.agreedToTerms )
					.isDisplayed()
					.should.eventually.be.true
					.elementById( elements.loginScreen.loginButton )
					.click()
					.sleep( 3000 );
				}
			} );
		} );

		it( 'should check for permissions'.green, function () {
		 	
		 	config.loginTest = true;
		 	if ( commons.isIOS() && userRole != 'client' && userRole != 'AdminClient' ) {
		 		console.log( 'CRM user on a iOS device'.green );
			 	return driver
			 	.sleep( 4000 )
		   		.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.ok ) )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( alerts.loginLogoutAlerts.iosNotification )
		   				.elementByXPath( commons.textToXPath( elements.alertButtons.ok ) )
		   				.click();
		   			}
		   		} )
		   		.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.allow ) )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( alerts.loginLogoutAlerts.iosGps )
						.elementByXPath( commons.textToXPath( elements.alertButtons.allow ) )
						.click();
					}
				} )

			} else if ( commons.isIOS()
				&&     userRole != 'driver'
				&&     userRole != 'admin' ) {
				console.log( 'Client user on a iOS device'.green );
				return driver
		   		.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.allow ) )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( alerts.loginLogoutAlerts.iosGps )
						.elementByXPath( commons.textToXPath( elements.alertButtons.allow ) )
						.click();
					}
				} )
				.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.ok ) )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( alerts.loginLogoutAlerts.iosNotification )
		   				.elementByXPath( commons.textToXPath( elements.alertButtons.ok ) )
		   				.click();
		   			}
		   		} )

			} else if ( commons.isAndroid()
				||      commons.isAndroid6() ) {
				console.log( 'Client or CRM user on a Android 6.0.x device'.green );
				return driver
				.sleep( 2000 )
				.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.allow ) )
				.then( function ( androidAllow ) {

					if ( androidAllow ) {
						return driver
						.elementById( 'com.android.packageinstaller:id/permission_message' )
						.text().should.eventually.become( alerts.loginLogoutAlerts.androidGps )
						.elementByXPath( commons.textToXPath( elements.alertButtons.allow ) )
						.click();
					}
				} );
			}
		} );
		
		it( 'should wait for sync to Complete'.green, function () {

			config.loginTest = true;
			console.log( 'Clockin Status: '.red + config.isClockedin );
			console.log( 'Before should wait for sync to Complete'.green );
			if ( clockInOption === false && truckOption === true ) {
				console.log( 'User does not have clock in options, but has truck options, will wait for Select Vehicle Options'.red );
				return driver
				.waitForElementByXPath( commons.textToXPath( elements.companyVehicle.vehicle1 ), 120000 )
				.isDisplayed().should.eventually.be.true

			} else if ( clockInOption === true
				&& truckOption === false
				&& config.isClockedin != true
				|| clockInOption === true
				&& truckOption === true
				&& config.isClockedin != true ) {
				console.log( 'User has clockin options, will wait for Clockin Options'.red );
				return driver
				.waitForElementByXPath( commons.textToXPath( elements.alertButtons.clockIn ), 120000 )
				.isDisplayed().should.eventually.be.true;

			} else if ( clockInOption === true
				&& truckOption === false
				&& config.isClockedin === true ) {
				console.log( 'User is clockedin Already, will wait for syncAllowed'.red );
				return driver
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true

			} else if ( clockInOption === true
				&& truckOption === true
				&& config.isClockedin === true ) {
				console.log( 'User is clockedin already, will wait for truckOption'.red );
				return driver
				.waitForElementByXPathj( commons.textToXPath( elements.companyVehicle.vehicle1 ), 120000 )
				.isDisplayed().should.eventually.be.true;

			} else if ( clockInOption === false
				&& truckOption === false ) {
				console.log( 'User has no truck or clock in options, will wait for syncAllowed'.red );
				return driver
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'loginDriverTest1 test has Completed....'.green );
			done();
		} );
	} );
};