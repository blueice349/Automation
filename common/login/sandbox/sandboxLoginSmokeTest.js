'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var timestamp = require( 'console-timestamp' );
	var alerts    = require( '../../../helpers/alerts' );
	var config    = require( '../../../helpers/Config' );
	var commons   = require( '../../../helpers/Commons' );
	var elements  = require( '../../../helpers/elements' );
	var login     = require( '../../../helpers/loginTable' );
	var driver    = config.driver;

	var clientAccount;
	var userName;
	var password;
	var loginTest = false;
 	var accounts  = login.sanboxAccounts.accounts;
 	var users     = login.sanboxAccounts.users;
	
	var _testRun = function ( user, account ) {

		describe( 'Start login Process using "sanboxLogin.js"'.green + timestamp( 'MM-DD hh:mm:ss'.green ), function () {

			commons.beforeEachDes();
			commons.beforeEachIt();
			commons.afterEachDes();
			commons.afterEachIt();

			it( 'should set user information and enter clientAccount '.green, function () {
			
				config.loginTest = true;
				return driver
				.elementById( elements.loginScreen.clientAccount )
				.then( function ( el ) { 
					
					clientAccount = account;
					userName      = user;
					password      = 'test'
					return el.text()
					.then( function ( text ) {

						if ( text === clientAccount ) {
							console.log( 'clientAccount is already set.'.red );
							return;
						} else {
							return commons.sendKeys( el, clientAccount );
						}
					} )
				} )
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
				.then( function ( agreeToTerms ) {
					
					if ( agreeToTerms ) {
						return agreeToTerms
						.isDisplayed().should.eventually.be.true
						.elementById( elements.loginScreen.needToAgreeToTerms )
						.click()
						.elementById( elements.loginScreen.loginButton )
						.click()
						.sleep( 3000 );

					} else { 
						return driver
						.elementById( elements.loginScreen.agreedToTerms )
						.isDisplayed().should.eventually.be.true
						.elementById( elements.loginScreen.loginButton )
						.click()
						.sleep( 3000 );
					}
				} );
			} );

			it( 'should check for permissions'.green, function () {
			 	
			 	config.loginTest = true;
			 	if ( commons.isIOS() ) {
			 		console.log( 'CRM user on a iOS device'.green );
				 	return driver
				 	.sleep( 4000 )
			   		.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.ok ) )
			   		.then( function ( iosNotification ) {

			   			if ( iosNotification ) {
					   		return commons.alertText( alerts.loginLogoutAlerts.iosNotification )
			   				.elementByXPath( commons.textToXPath( elements.alertButtons.ok ) )
			   				.click();
			   			}
			   		} )
			   		.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.allow ) )
			   		.then( function ( iosGps ) {

						if ( iosGps ) {
			   				return commons.alertText( alerts.loginLogoutAlerts.iosGps )
							.elementByXPath( commons.textToXPath( elements.alertButtons.allow ) )
							.click();
						}
					} )
					.elementByIdIfExists( elements.topicScreen.skip )
					.then( function ( iosTopicScreen ) {

						if ( iosTopicScreen ) {
							return driver
							.elementById( elements.topicScreen.skip )
							.click();
						}
					} );	

				} else {
					console.log( 'Client or CRM user on a Android 6.0.x device'.green );
					return driver
					.sleep( 4000 )
					.elementByIdIfExists( elements.topicScreen.skip )
					.then( function ( androidTopicScreen ) {

						if ( androidTopicScreen ) {
							return driver
							.elementById( elements.topicScreen.skip )
							.click();
						}
					} )
					.elementByXPathIfExists( commons.textToXPath( elements.alertButtons.allow ) )
					.then( function ( androidGps ) {

						if ( androidGps ) {
							return driver
							.sleep( 4000 )
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
				console.log( 'Before should wait for sync to Complete'.green );
				console.log( 'User has no truck or clock in options, will wait for syncAllowed'.red );
				if ( commons.isAndroid() ) {
					return driver
					.waitForElementByXPath( '//UIAApplication[1]/UIAWindow[1]/UIAElement[2] | //*[ @text=\'View Later\' ]', 600000 )
					.elementByXPathIfExists( '//*[ @text=\'View Later\' ]' )
					.then( function ( androidViewLater ) {

						if ( androidViewLater ) {
							return driver
							.elementByXPath( '//*[ @text=\'View Later\' ]' )
							.click();
						} 
					} )
					.then( function () {

						console.log( 'Sync is compled'.green );
					} );

				} else {
					return driver
					.waitForElementById( elements.homeScreen.syncAllowed, 600000 )
					.elementByIdIfExists( elements.alertButtons.viewLater )
					.then( function ( iosViewLater ) {

						if ( iosViewLater ) {
							return driver
							.elementById( elements.alertButtons.viewLater )
							.click();
						} 
					} )
					.then( function () {

						console.log( 'Sync is compled'.green );
					} );
				}
			} );

			it( 'should logout from menu'.green, function () {

				config.loginTest = true;
				return driver
				.elementById( elements.newHomeScreen.menu )
				.click()
				.waitForElementById( elements.actionsScreen.logout, 10000 )
				.click()
				.waitForElementByXPath( commons.textToXPath( elements.alertButtons.logout ), 10000 )
				.click()
				.waitForElementById( elements.loginScreen.clientAccount, 10000 );
			} );

			it( 'should set currentTest to "passed".'.green, function ( done ) {
				
				config.loginTest = true;	
				console.log( 'sanboxLoginSmokeTest test has Completed....'.green );
				done();
			} );
		} );
	}

	for ( var i in users ) {
	  for ( var j in accounts ) {

	  	_testRun( users[ i ], accounts[ j ] );
	  }
	}

	for ( var i in accounts ) {
	  for ( var j in users ) {

	  	_testRun( users[ j ], accounts[ i ] );
	  }
	}
};