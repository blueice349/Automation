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
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.isDisplayed().should.eventually.be.true
			.elementByName( elements.homeScreen.actions )
			.click()
			.sleep( 800 )
			.elementByName( elements.actionsScreen.drafts )
			.isDisplayed().should.eventually.be.true
			.then( function () {

				config.currentTest = 'passed';
			} );
		} );

		it( 'should log out of a vehicle from actions screen.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true && lastUser.userRole != 'client' && config.isInVehicle === true ) {
				console.log( 'Logged into a vehicle. Will log out of current vehicle'.red );
				return driver
				.elementByName( elements.actionsScreen.companyVehicle )
				.isDisplayed().should.eventually.be.ok
				.elementByName( elements.actionsScreen.companyVehicle )
				.click()
				.sleep( 1000 )
				.then( function () {
					
					config.currentTest = 'passed';
				} )
			} else {
				
				console.log( 'Current User Does Not Have Vehicle Option Enabled'.red );
				config.currentTest = 'passed';
			}
		} );

		it( 'should Do Post-Inspection?.'.green, function () {

			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true && lastUser.userRole != 'client' && config.isInVehicle === true ) {
				console.log( 'user should perfom inspection'.red );
				return commons.alertText( alerts.actionsScreenAlerts.companyVehicle.postInspection )
				.elementByName( elements.alertButtons.no )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.alertButtons.no )
				.click()
				.then( function () {
					
					config.isInVehicle = false;
					config.currentTest = 'passed';
					
				} )
			} else {
				
				console.log( 'Current Does did not log into a vehicle'.red );
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