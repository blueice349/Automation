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

describe( 'Start login Process using "loginClientTest2.js"'.green, function( done ) {

	commons.beforeEachDes();
	commons.beforeEachIt();
	commons.afterEachDes();

	it( 'should check fields on loginScreen'.green, function() {
		
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
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should set user information and enter client_account '.green, function () {

		return driver
		.elementByName( elements.loginScreen.client_account )
		.then( function ( el ) { 

			if ( commons.isIOS() ){
				truckOption       = login.clientLogins.client3.truckOption;
				clockInOption     = login.clientLogins.client3.clockInOption;
				userRole          = login.clientLogins.client3.userRole;
				userName          = login.clientLogins.client3.username;
				name              = login.clientLogins.client3.name;
				newJob            = login.clientLogins.client3.newJob;
				return commons.sendKeys( el, login.clientLogins.client3.client_account );

			} else if ( commons.isAndroid() ) {
				truckOption       = login.clientLogins.client4.truckOption;
				clockInOption     = login.clientLogins.client4.clockInOption;
				userRole          = login.clientLogins.client4.userRole;
				userName          = login.clientLogins.client4.username;
				name              = login.clientLogins.client4.name;
				newJob            = login.clientLogins.client4.newJob;
				return commons.sendKeys(el, login.clientLogins.client4.client_account );
			}
		} )
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should enter username and password'.green, function () {

		return driver
		.elementByName( elements.loginScreen.user_name )
		.then( function ( el ) {

			if ( commons.isIOS() ) {
				return commons.sendKeys( el, login.clientLogins.client3.username );

			} else if ( commons.isAndroid() ) {
				return commons.sendKeys( el, login.clientLogins.client4.username );
			}
		} )
		.elementByName( elements.loginScreen.password )
		.then( function ( el ) {
			
			if ( commons.isIOS() ) {
				return commons.sendKeys( el, login.clientLogins.client3.password );

			} else if ( commons.isAndroid() ) {
				return commons.sendKeys( el, login.clientLogins.client4.password );
			}
		} )
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'Should check client_account and username'.green, function () {

		if ( commons.isIOS() ) {
			return driver
			.elementByName( elements.loginScreen.client_account )
			.text().should.eventually.become( login.clientLogins.client3.client_account )
			.elementByName( elements.loginScreen.user_name )
			.text().should.eventually.become( login.clientLogins.client3.username )
			.then( function () {

				config.currentTest = 'passed';
			} );

		} else if ( commons.isAndroid() ) {
			return driver
			.elementByName( elements.loginScreen.client_account )
			.text().should.eventually.become( login.clientLogins.client4.client_account )
			.elementByName( elements.loginScreen.user_name )
			.text().should.eventually.become( login.clientLogins.client4.username )
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );

	it( 'should click accept_termsand login_button'.green, function () {

		return driver
		.elementByName( elements.loginScreen.accept_terms )
		.click()
		.elementByName( elements.loginScreen.login_button )
		.click()
		.sleep( 3000 )
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );

	it( 'should check for permissions'.green, function () {

		 if ( commons.isIOS() ) {
		 	return driver
		 	.sleep( 4000 )
	   		.elementByNameIfExists( elements.alertButtons.ok )
	   		.then( function ( ok ) {

	   			if ( ok ) {
			   		return commons.alertText( driver, alerts.loginAlerts.iosNotification )
	   				.elementByName( elements.alertButtons.ok )
	   				.click();
	   			}
	   		} )
	   		.elementByNameIfExists( elements.alertButtons.allow )
	   		.then( function ( allow ) {

				if ( allow ) {
	   				return commons.alertText( driver, alerts.loginAlerts.iosGps )
					.elementByName( elements.alertButtons.allow )
					.click();
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		 } else if ( commons.isAndroid6() ) {
			return driver
			.sleep( 4000 )
			.elementByNameIfExists( elements.alertButtons.allow )
			.then( function ( allow ) {

				if ( allow ) {
					return commons.alertText( driver, alerts.loginAlerts.androidGps )
					.elementByName( elements.alertButtons.allow )
					.click();
				}
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		 }
	} );
	
	it( 'should wait for syncAllowed'.green, function () {
		
		if ( truckOption === true && userRole != 'client' && userRole != 'AdminClient' ) {
			console.log( 'Select Vehicle'.red );
			return driver
			.waitForElementByName( elements.companyVehicle.vehicle1, 180000 )
			.click()
			.sleep( 1000 )
			.then( function () {

			config.currentTest = 'passed';
			} );

		} else {
			return driver
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			//.isDisplayed().should.eventually.be.true
			.sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );
	
	it( 'should check if current user vehicleOptions and/or clockInOptions'.green, function () {

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
			} )
			.then( function () {

				config.currentTest = 'passed';
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
			} )
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );
	
	it( 'should wait for syncAllowed'.green, function () {

		return driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.isDisplayed().should.eventually.be.true
		.then( function () {

			config.currentTest = 'passed';
		} );
	} );
	
	it( 'Should make sure all buttons are visble after syncAllowed'.green, function () {

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
			.then( function () {

				config.currentTest = 'passed';
			} );

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
			.then( function () {

				config.currentTest = 'passed';
			} );
		}
	} );

	it( 'should store current user information'.green, function () {

		Store.set( 'lastUser', {
			'truckOption'       : truckOption,
			'clockInOption'     : clockInOption,
			'userRole'          : userRole,
			'userName'          : userName,
			'name'              : name,
			'permissionGranted' : permissionGranted,
			'newJob'            : newJob
		} );
		console.log( 'loginTestt Completed...'.green );
		config.currentTest = 'passed';
		console.log( 'lastUser ' + JSON.stringify( Store.get( 'lastUser' ) ) );
	} );
} );