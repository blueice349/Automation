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

	describe( 'Start Done with Vehicle Process using "actionsRemoveVehicle.js"'.green, function () {
		
		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should go to Actions Screen'.green, function() {
			
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementById( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.elementById( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
		} );

		it( 'should log out of a vehicle from actions screen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true 
				&& lastUser.userRole != 'client' 
				&& config.isInVehicle === true 
			) {
				console.log( 'Logged into a vehicle. Will log out of current vehicle'.red );
				return driver
				.elementById( elements.actionsScreen.companyVehicle )
				.isDisplayed().should.eventually.be.ok
				.elementById( elements.actionsScreen.companyVehicle )
				.click()
				.sleep( 1000 )
			
			} else {
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
			}
		} );

		it( 'should Do Post-Inspection?.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true 
				&& lastUser.userRole != 'client' 
				&& config.isInVehicle === true 
			) {
				console.log( 'user should perfom inspection'.red );
				return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.postInspection )
				.elementByXPath( commons.textToXPath( elements.alertButtons.no ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.alertButtons.no ) )
				.click()
				.then( function () {
					
					config.isInVehicle = false;
					
				} )
			
			} else {
				console.log( 'Current Does did not log into a vehicle'.red );
			}
		} );

		it( 'should go back to homeScreen from actions screen.'.green, function () {
		
			if ( commons.isIOS() ) {
				return driver
				.elementById( elements.actionsScreen.back )
				.isDisplayed().should.eventually.be.ok
				.elementById( elements.actionsScreen.back )
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