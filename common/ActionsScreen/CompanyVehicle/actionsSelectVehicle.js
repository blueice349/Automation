'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var assert   = require( 'assert' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );

	var driver      = config.driver;

	describe( 'Start Done with Vehicle Process'.green, function () {
		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.elementByName( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should click on the "select vehicle button" from actions screen.'.green, function () {

			if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).userRole != 'client' && config.isInVehicle === false ) {
					console.log( 'Not logged into a vehicle. Will log into a vehicle'.red );
					return driver
					.elementByName( elements.actionsScreen.companyVehicle )
					.isDisplayed().should.eventually.be.ok
					.elementByName( elements.actionsScreen.companyVehicle )
					.click()
					.then( function () {

						console.log( 'user is in a companyVehicle'.green );
						config.currentTest = 'passed';
					} );

			} else {
				
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
				config.currentTest = 'passed';
			}
		} );		

		it( 'should Select a vehicle from actions screen.'.green, function () {

			if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).userRole != 'client' && config.isInVehicle === false ) {
					console.log( 'Not logged into a vehicle. Will log into a vehicle'.red );
					return driver
					.elementByName( elements.companyVehicle.vehicle1 )
					.isDisplayed().should.eventually.be.true
					.elementByName( elements.companyVehicle.vehicle1 )
					.click()
					.sleep( 100 )
					.then( function () {

						console.log( 'user is in a companyVehicle'.green );
						config.currentTest = 'passed';
					} );

			} else {
				
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
				config.currentTest = 'passed';
			}
		} );

		it( 'Should Review Inspection.'.green, function () {

			if ( Store.get( 'lastUser' ).truckOption === true && Store.get( 'lastUser' ).userRole != 'client' && config.isInVehicle === false ) {
					console.log( 'Will perform insoection'.red );
					return driver
					.elementByNameIfExists( elements.companyVehicle.review )
					.then( function ( review ) {

						if ( review ) {
							console.log( 'Review Inspection'.red );
							return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.reviewInspection )
							.elementByName( elements.companyVehicle.review )
							.click()
							.sleep( 1000 );

						} else {
							console.log( 'No inspection to review'.red );
							return commons.alertText( alerts.loginLogoutAlerts.noInspectionReviewHeader )
							.elementByName( elements.companyVehicle.ok )
							.click()
							.sleep ( 1000 );
						}
					} )
					.then( function () {

						config.isInVehicle = true;
						config.currentTest = 'passed';
					} );

			} else {
				
				console.log( 'Current User is not in a vehicle'.red );
				config.currentTest = 'passed';
			}
		} );

		it( 'should go back to homeScreen from actions screen.'.green, function () {
		
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