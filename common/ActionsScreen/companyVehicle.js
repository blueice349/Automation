'use strict';

module.exports = function () {

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
		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.mainMenuScreen.syncAllowed, 180000 )
			.elementByName( elements.mainMenuScreen.actions )
			.click()
			.sleep( 1000 )
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should log out of a vehicle from actions screen.'.green, function () {

			return driver
			.waitForElementByName( elements.actionsScreen.drafts, 20000 )
			.then( function ( vehicleOption ) {

				if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).userRole != 'client' ) {
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
								return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.postInspection )
								.elementByName( elements.alertButtons.no )
								.click();

							} else if ( commons.isIOS() ) {
								return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.postInspection )
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
										return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.reviewInspection )
										.elementByName( elements.companyVehicle.review )
										.click().sleep( 1000 );
									
									} else if ( commons.isIOS() ) {
										return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.reviewInspection )
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
												return commons.alertText( alerts.loginAlerts.noInspection )
												.elementByName( elements.companyVehicle.ok )
												.click().sleep ( 1000 );
											
											} else if ( commons.isIOS() ){
												return commons.alertText( alerts.loginAlerts.noInspection )
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
					} )	

				} else {
					
					console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
				}
			} )
			.then( function () {

				console.log( 'companyVehicle is at the passed screen'.green );
				config.currentTest = 'passed';
			} );
		} );

		it( 'should go back to mainMenuScreen from actions screen.'.green, function () {
		
			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.back )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'Clocked in or out has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};