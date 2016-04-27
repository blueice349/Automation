'use strict';

require( 'colors' );
require( '../../helpers/setup' );
var alerts   = require( '../../helpers/alerts' );
var assert   = require( 'assert' );
var caps     = require( '../../helpers/caps' );
var config   = require( '../../helpers/Config' );
var commons  = require( '../../helpers/Commons' );
var elements = require( '../../helpers/elements' );
var login    = require( '../../helpers/loginTable' );
var Store    = require( '../../helpers/Store' );

var driver = config.driver;
var checkPassed = false


describe( 'Start Done with Vehicle Process'.green, function () {

	it( 'should log out of a vehicle from actions screen.'.green, function ( done ) {
		var lastUser = Store.get( 'lastUser' );
		console.log( 'Done with Vehicle Automation...'.green );
		return driver
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 20000 )
		.elementByName( elements.mainMenuScreen.actions )
		.click().sleep( 1000 )
		.waitForElementByName( elements.actionsScreen.drafts, 20000 )
		.then( function ( vehicleOption ) {

			if ( lastUser.truckOption === true && lastUser.userRole != 'client' ) {
				return driver
				.elementByName( elements.actionsScreen.companyVehicle )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.companyVehicle )
				.click().sleep( 1000 )
				.elementByNameIfExists( elements.alertButtons.no )
				.then( function ( no ) {
					
					if ( no ) {
						console.log( 'Done with Vehicle with inspection option'.red );
						if ( commons.isAndroid() ) {
							return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.postInspection )
							.elementByName( elements.alertButtons.no )
							.click();

						} else if ( commons.isIOS() ) {
							return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.postInspection )
							.elementByName( elements.alertButtons.no )
							.click();
						}

					} else {
						console.log( 'Not logged into a vehicle. Will log into a vehicle'.red );
						return driver
						.elementByName( elements.companyVehicle.vehicle1 )
						.click().sleep( 100 )
						.elementByNameIfExists( elements.companyVehicle.review )
						.then( function ( review ) {

							if ( review ) {
								console.log( 'Review Inspection'.red );
								if ( commons.isAndroid() ) {
									return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.reviewInspection )
									.elementByName( elements.companyVehicle.review )
									.click().sleep( 1000 );
								
								} else if ( commons.isIOS() ) {
									return commons.alertText( driver, alerts.actionsScreenAlerts.companyVehicle.reviewInspection )
									.elementByName( elements.companyVehicle.review )
									.click().sleep( 1000 );
								}


							} else {
								console.log( 'No inspection to review'.red );
								return driver
								.elementByNameIfExists( elements.companyVehicle.ok )
								.then( function ( noReview ) {

									if ( noReview ) {
										console.log( 'Click ok'.red );
										if ( commons.isAndroid() ) {
											return commons.alertText( driver, alerts.loginAlerts.noInspection )
											.elementByName( elements.companyVehicle.ok )
											.click().sleep ( 1000 );
										
										} else if ( commons.isIOS() ){
											return commons.alertText( driver, alerts.loginAlerts.noInspection )
											.elementByName( elements.companyVehicle.ok )
											.click().sleep ( 1000 );
										}
				
									} else { 
										console.log( 'No inspection options at this time' );
										return driver;
									}
								} );
							}
						} )

					}
					return driver;
				} )	
				.then( function() {

					if ( commons.isIOS() ) {
						return driver
						.waitForElementByName( elements.actionsScreen.back, 10000 )
						.click();

					} else if ( commons.isAndroid() ) {
						return driver
						.back();
					}
				} );

			} else {
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
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
			}
			return driver;
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
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				.isDisplayed().should.eventually.be.true
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
				.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
				.isDisplayed().should.eventually.be.true
			}
		} )
		.waitForElementByName( elements.mainMenuScreen.syncAllowed, 10000 )
		.click()
		.sleep ( 2000 )
		.then( function () {

			console.log( 'Logged out of Vehicle has Completed....'.green );
			config.currentTest = 'passed';
			done();
	 	} );
	} );
} );
