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

	describe( 'Start Done with Vehicle Process using "actionsSelectVehicle.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.elementByName( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should click on the "select vehicle button" from actions screen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true 
				&& lastUser.userRole != 'client' 
				&& config.isInVehicle === false 
			) {
				console.log( 'Not logged into a vehicle. Will log into a vehicle'.red );
				return driver
				.elementByName( elements.actionsScreen.companyVehicle )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.companyVehicle )
				.click()

			} else {
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
			}
		} );		

		it( 'should Select a vehicle from actions screen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true 
				&& lastUser.userRole != 'client' 
				&& config.isInVehicle === false 
			) {
				console.log( 'Not logged into a vehicle. Will log into a vehicle'.red );
				return driver
				.elementByName( elements.companyVehicle.vehicle2 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.companyVehicle.vehicle2 )
				.click()
				.sleep( 100 )

			} else {
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
			}
		} );

		it( 'Should Review Inspection.'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true 
				&& lastUser.userRole != 'client' 
				&& config.isInVehicle === false 
			) {
				console.log( 'Will perform insoection'.red );
				return driver
				.elementByNameIfExists( elements.companyVehicle.review )
				.then( function ( review ) {

					if ( review ) {
						console.log( 'Review Inspection'.red );
						return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.reviewInspection )
						.elementByName( elements.companyVehicle.review )
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.companyVehicle.review )
						.click()
						.sleep( 1000 );

					} else {
						console.log( 'No inspection to review'.red );
						return commons.alertText( alerts.loginLogoutAlerts.noInspectionReviewHeader )
						.elementByName( elements.companyVehicle.ok )
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.companyVehicle.ok )
						.click()
						.sleep ( 1000 );
					}
				} )
				.then( function () {

					config.isInVehicle = true;
				} );

			} else {
				console.log( 'Current User is not in a vehicle'.red );
			}
		} );

		it( 'should go back to homeScreen from actions screen.'.green, function () {
		
			if ( commons.isIOS() ) {
				return driver
				.elementByName( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.back )
				.click()

			} else if ( commons.isAndroid() ) {
				return driver
				.back()
			}
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'Clocked in or out has Completed....'.green );
			done();
		} );
	} );
};