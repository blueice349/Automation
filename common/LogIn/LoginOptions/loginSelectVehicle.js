'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts   = require( '../../../helpers/alerts' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start select Vehicle at login process using "loginSelectVehicle.js"'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();
		
		it( 'should select a truck after intinal sync has completed'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
				console.log( 'Select Vehicle'.red );
				return driver
				.waitForElementByName( elements.companyVehicle.vehicle1, 120000 )
				.click()
				.sleep( 1000 )
				.then( function () {

				config.isInVehicle = true;
				} );

			} else {
				console.log( 'User does not have vehcile selcect options enabled'.red );
			}
		} );

		it( 'should perform vehicle inspection after selcect of vehicle.'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.truckOption === true && lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
				driver.sleep( 600 )
				return commons.alertText( alerts.loginLogoutAlerts.noInspectionReviewHeader )
				.waitForElementByName( elements.alertButtons.ok, 120000 )
				.click()
				.sleep( 1000 )
				
			} else {
				console.log( 'User does not have vehcile selcect options enabled'.red );
			}
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'loginSelectVehicle and clockInOptions test has Completed....'.green );
			done();
		} );
	} );
};