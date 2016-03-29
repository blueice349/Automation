'use strict';

require( 'colors' );
require( '../../helpers/setup' );
var alerts   = require( '../../helpers/alerts' );
var assert   = require( 'assert' );
var config   = require( '../../helpers/Config' );
var elements = require( '../../helpers/elements' );
var commons  = require( '../../helpers/Commons' );
var Store    = require( '../../helpers/Store' );


var driver = config.driver;
var noOptions = false
var clockInButton = false
var clockOutButton = false
var checkPassed = false

describe( 'Start clock in or out Process'.green, function () {

	it( 'should clockIn or out from actions screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		console.log( 'Clocking In or Out Automation...'.green );
		driver 
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.elementByName( elements.mainMenuScreen.actions )
		.click()
		.sleep( 1000 )
		.waitForElementByName( elements.actionsScreen.drafts, 20000 )
		.then( function () {

			if ( lastUser.clockInOption === true && lastUser.userRole != 'client' ) {	
					return driver
					.elementByNameIfExists( elements.actionsScreen.clockIn )
					.then( function ( clockInOption ) {

						if ( clockInOption ) {
							console.log( 'Clock In Button'.red );
							return driver
							.elementByName( elements.actionsScreen.clockIn )
							.click()
							.sleep( 2000 )
							.then( function () {
								
								if( commons.isAndroid() ) {
									return commons.alertText( driver, alerts.actionsScreenAlerts.timeCard.clockin );

								} else if ( commons.isIOS() ) {
									return commons.alertText( driver, alerts.actionsScreenAlerts.timeCard.clockin );
								}
							} )
							.elementByName( elements.alertButtons.clockIn )
							.click()
							.sleep( 2000 );
						
						} else {
							console.log( 'Clock Out Button'.red );
							return driver
							.elementByName( elements.actionsScreen.clockOut )
							.click()
							.sleep( 2000 )
							.then( function () {

								if( commons.isAndroid() ) {
									return commons.alertText( driver, alerts.actionsScreenAlerts.timeCard.clockout );

								} else if ( commons.isIOS() ) {
									return commons.alertText( driver, alerts.actionsScreenAlerts.timeCard.clockout );
								}
							} )
							.elementByName( elements.alertButtons.clockOut )
							.click()
							.sleep( 2000 );
						}
					} );
				
			} else {
				console.log( 'No Clockin or Clockout Option'.red );
				return driver;
			}
		} )
		.then( function () {

			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.back )
				.click();

			} else if ( commons.isAndroid() ) {
				return driver
				.back();
			}
		} )
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
		.isDisplayed().should.eventually.be.ok
		.then( function () {

                  //Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole == 'admin' || lastUser.userRole == 'driver' ) {
				return driver
				.elementByName( lastUser.name )
				.text().should.become( lastUser.name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.alerts )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.expiredTags )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.jobs )
				.isDisplayed().should.eventually.be.ok

			} else if ( lastUser.userRole == 'client' || lastUser.userRole == 'AdminClient' ) {
				return driver
				.elementByName( elements.mainMenuScreen.name )
				.text().should.become( name )
				.elementByName( elements.mainMenuScreen.actions )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.logout )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.isDisplayed().should.eventually.be.ok
			}
		} )
		.then( function ( sync ) {

			if ( checkPassed == true ) {
				return driver
				.elementByName( elements.mainMenuScreen.syncAllowed )
				.click()
				.sleep ( 2000 );
			}
			return driver;
		} )
		.then( function () {

			console.log( 'Clocked in or out has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
