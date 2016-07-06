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

	describe( 'Start clocking after login process using "loginClockin.js"'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should check if current user has clockInOptions enabled'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' || lastUser.clockInOption === false ) {
				console.log( lastUser.userRole.red + ' does not have clockInOptions'.red );

			} else if ( lastUser.clockInOption === true && config.isClockedin != true ) {
				console.log( lastUser.userRole.red + ' Has clockInOptions'.red );
				return commons.alertText( alerts.loginLogoutAlerts.clockin )
				.waitForElementByName( elements.alertButtons.clockIn, 120000 )
			    .click()
			    .sleep( 1000 )
				.then( function () {

					config.isClockedin = true;
				} );
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'LoginClockin test has Completed....'.green );
			done();
		} );
	} );
};