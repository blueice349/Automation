'use strict';

require( 'colors' );
require( '../../helpers/setup' );
var alerts   = require( '../../helpers/alerts' );
var assert   = require( 'assert' );
//var expect   = require( 'expect' );
var caps     = require( '../../helpers/caps' );
var config   = require( '../../helpers/Config' );
var commons  = require( '../../helpers/Commons' );
var elements = require( '../../helpers/elements' );
var login    = require( '../../helpers/loginTable' );
var Store    = require( '../../helpers/Store' );

var driver = config.driver;

var truckOption;
var clockInOption;
var userRole;
var userName;
var name;
var permissionGranted;
var newJob;

describe( 'Start login Process'.green, function() {

	it( 'should login'.green, function( done ) {
		config.loginTest = true;
		return driver
		.elementByName( elements.loginScreen.client_account )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.user_name )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.password )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.login_button )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.accept_terms )
		.isDisplayed().should.eventually.be.true
		.elementByName( elements.loginScreen.client_account )
		.then( function ( el ) { 

			if ( commons.isIOS() ){
				truckOption       = login.driverLogins.driver3.truckOption;
				clockInOption     = login.driverLogins.driver3.clockInOption;
				userRole          = login.driverLogins.driver3.userRole;
				userName          = login.driverLogins.driver3.username;
				name              = login.driverLogins.driver3.name;
				newJob            = login.driverLogins.driver3.newJob;
				return commons.sendKeys(el, login.driverLogins.driver3.client_account );	
			} else if ( commons.isAndroid() ) {
				truckOption       = login.driverLogins.driver4.truckOption;
				clockInOption     = login.driverLogins.driver4.clockInOption;
				userRole          = login.driverLogins.driver4.userRole;
				userName          = login.driverLogins.driver4.username;
				name              = login.driverLogins.driver4.name;
				newJob            = login.driverLogins.driver4.newJob;
				return commons.sendKeys(el, login.driverLogins.driver4.client_account );
			}

		} )
		.elementByName( elements.loginScreen.user_name )
		.then( function ( el ) {

			if ( commons.isIOS() ){
				return commons.sendKeys( el, login.driverLogins.driver3.username );
			} else if ( commons.isAndroid() ) {
				return commons.sendKeys( el, login.driverLogins.driver4.username );
			}
		})
		.elementByName( elements.loginScreen.password )
		.then( function ( el ) {
			
			if ( commons.isIOS() ) {
				return commons.sendKeys( el, login.driverLogins.driver3.password );
			} else if ( commons.isAndroid() ) {
				return commons.sendKeys( el, login.driverLogins.driver4.password );
			}
		})
		.then( function () {

			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.driverLogins.driver3.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.driverLogins.driver3.username )
			} else if ( commons.isAndroid() ) {
				return driver
				.elementByName( elements.loginScreen.client_account )
				.text().should.eventually.become( login.driverLogins.driver4.client_account )
				.elementByName( elements.loginScreen.user_name )
				.text().should.eventually.become( login.driverLogins.driver4.username )
			}
		} )
		.elementByName( elements.loginScreen.accept_terms )
			.click()
		.elementByName( elements.loginScreen.login_button )
			.click()
			.sleep( 3000 )
		.then( function() {

			 if ( commons.isIOS() ) {
			 	return driver
		   		.elementByNameIfExists( elements.alertButtons.ok )
		   		.then( function ( ok ) {

		   			if ( ok ) {
				   		return commons.alertText( driver, alerts.loginAlerts.iosNotification )
		   				.elementByName( elements.alertButtons.ok )
		   				.click();
		   			}
		   			return driver;
		   		} )
		   		.elementByNameIfExists( elements.alertButtons.allow )
		   		.then( function ( allow ) {

					if ( allow ) {
		   				return commons.alertText( driver, alerts.loginAlerts.iosGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
					return driver;
				} )
			 } else if ( commons.isAndroid6() ) {
				return driver
				.elementByNameIfExists( elements.alertButtons.allow )
				.then( function ( allow ) {

					if ( allow ) {
						return commons.alertText( driver, alerts.loginAlerts.androidGps )
						.elementByName( elements.alertButtons.allow )
						.click();
					}
					return driver;
				} )
			 }
		} )

		.then( function ( vehicle ) {

			if ( truckOption === true && userRole != 'client' && userRole != 'AdminClient' ) {
				console.log( 'Select Vehicle'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 180000 )
				.click()
				.sleep( 1000 );
			} else {
				return driver
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				//.isDisplayed().should.eventually.be.true
				.sleep( 1000 );
			}
		} )
		.then( function() {

			if ( commons.isIOS() ) {
				console.log( 'IOS Device or Simulator'.red );
				return driver
				.sleep( 600 )
				.then( function () {

					if ( userRole === 'client' || userRole === 'AdminClient' ) {
						console.log( userRole.red + ' Is a Cleint login on A iOS Device'.red ); 
						return driver;


					} else if ( clockInOption === true && truckOption === false && userRole != 'client' && userRole != 'AdminClient' ) {
						console.log( userRole.red + ' Has Clock in Only on A iOS Device'.red );
						return commons.alertText( driver, alerts.loginAlerts.clockin )
						.waitForElementByName( elements.alertButtons.clockIn, 180000 )
					    .click()
					    .sleep( 1000 )
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.elementByName( elements.jobsScreen.otherOptions.back )
								.click();
							}
						} );

					} else if ( clockInOption === true && truckOption === true && userRole != 'client' && userRole != 'AdminClient' ) {
						console.log( userRole.red + ' Has Clock in & Truck Option on A iOS Device'.red );
						return commons.alertText( driver, alerts.loginAlerts.clockin )
						.waitForElementByName( elements.alertButtons.clockIn, 180000 )
					    .click()
					    .sleep( 1000 )
					    .then( function () {
					    	return commons.alertText( driver, alerts.loginAlerts.noInspectionReviewHeader );
					    } )
			    		.waitForElementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.elementByName( elements.jobsScreen.otherOptions.back )
								.click();
							}
						} );

					} else if ( truckOption === true  && clockInOption === false && userRole != 'client' && userRole != 'AdminClient' ) {
						console.log( userRole.red + ' Has Truck Optoin Only on A iOS Device'.red );
						driver.sleep( 600 )
						return commons.alertText( driver, alerts.loginAlerts.noInspectionReviewHeader )
						.waitForElementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
								.click();
							}
						} );
						
					} else if ( truckOption === false  && clockInOption === false && userRole != 'client' && userRole != 'AdminClient' ) {
						console.log( userRole.red + ' Has No Clock in & No Truck Option on a iOS Device.'.red ); 
						return driver
						.elementByName( elements.mainMenuScreen.actions )
						.isDisplayed()
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.waitForElementByName( elements.jobsScreen.otherOptions.back, 10000 )
								.click();
							}
						} );
					}					
				} );

			} else if ( commons.isAndroid() ) {
				console.log( 'Android Device or Emulator'.red );
				return driver
				.sleep( 600 )
				.then( function ( Inspection ) {

					if ( userRole === 'client' || userRole === 'AdminClient' ) {
						console.log( userRole.red + ' Is a Cleint login on A Android Device.'.red ); 
						return driver;						

					} else if ( clockInOption === true && truckOption === false && userRole != 'client' && userRole != 'AdminClient' ) { 
						console.log( userRole + ' Has Clock in option only Andoid'.red );
						return commons.alertText( driver, alerts.loginAlerts.clockin )
						.waitForElementByName( elements.alertButtons.clockIn )
						.click().sleep( 1000 )
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
						} );

					} else if ( clockInOption === false && truckOption === true && userRole != 'client' && userRole != 'AdminClient' ) { 
						console.log( userRole + ' Has Truck option only on A Andoid Device'.red );
						return commons.alertText( driver, alerts.loginAlerts.noInspectionReviewHeader )
						.waitForElementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
						} );						

					} else if ( clockInOption === true && truckOption === true && userRole != 'client' && userRole != 'AdminClient' ) {
						console.log( userRole.red + ' Has Truck Option and Clock in Option on A Android Device'.red );
						return commons.alertText( driver, alerts.loginAlerts.noInspectionReviewHeader )
						.elementByName( elements.alertButtons.ok, 180000 )
						.click()
						.sleep( 1000 )
						.then ( function () {

							return commons.alertText( driver, alerts.loginAlerts.clockin );
						} )
						.waitForElementByName( elements.alertButtons.clockIn, 180000 )
						.click()
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
						} );

					} else if ( truckOption === false  && clockInOption === false && userRole != 'client' && userRole != 'AdminClient' ) {
						console.log( userRole.red + ' Has No Clock in option and No Truck Option on A Andoid Device'.red );
						return driver
						.elementByNameIfExists( elements.mainMenuScreen.actions )
						.then( function ( mainMenuScreen ) {

							if ( !mainMenuScreen ) {
								return driver
								.back();
							}
							return driver;
						} );
					}
				} );
			}
		} )
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.isDisplayed().should.eventually.be.true
		.then( function () {

                  //Checks for buttons to be displayed on main menu after log on.
			if ( userRole == 'admin' || userRole == 'driver' ) {
				return driver
				.elementByName( name )
				.text().should.eventually.become( name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.alerts )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.expiredTags )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.jobs )
				.isDisplayed().should.eventually.be.true

			} else if ( userRole == 'client' || userRole == 'AdminClient' ) {
				return driver
				.elementByName( elements.mainMenuScreen.name )
				.text().should.eventually.become( name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.isDisplayed().should.eventually.be.true
			}
		} )

		.then( function() {

			Store.set( 'lastUser', {
				'truckOption'       : truckOption,
				'clockInOption'     : clockInOption,
				'userRole'          : userRole,
				'userName'          : userName,
				'name'              : name,
				'permissionGranted' : permissionGranted 
				'newJob'            : newJob
			} );
			console.log( 'Login Completed...'.green );
			config.currentTest = 'passed';
			done();
		} )
	} );
} );