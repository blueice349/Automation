'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../../helpers/setup' );
	var alerts    = require( '../../../helpers/alerts' );
	var caps      = require( '../../../helpers/caps' );
	var config    = require( '../../../helpers/Config' );
	var commons   = require( '../../../helpers/Commons' );
	var elements  = require( '../../../helpers/elements' );
	var login     = require( '../../../helpers/loginTable' );
	var Store     = require( '../../../helpers/Store' );
	var driver    = config.driver;
	var canCreate = false;

	describe( 'Start Create New Tag Node and save'.green, function () {

		it( 'Should check userRole '.green, function () {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.waitForElementByName( elements.homeScreen.syncAllowed, 20000 )
			.then( function () {

				if ( lastUser.userRole === 'admin' || lastUser.userRole === 'driver'  ) {
					console.log( 'User is Allowed to add a New Redord'.red );
					canCreate = true;
					config.currentTest = 'passed';

				} else {
					console.log( 'Current User Does Not Have The Option to Add a New Tag'.red );
					config.currentTest = 'passed';
				}
			} );
		} );

		it( 'Should create new tagRecord from homeScreen'.green, function () {
			
			if( canCreate === true ) {
				return driver
				.elementByName( elements.tagRecord.tag + elements.homeScreen.plusButton )
				.click()
				.sleep( 1000 )
				.elementByName( elements.tagRecord.propertyRef.property )
				.then( function ( property ) {

					if ( textFieldReg ) {
						return commons.sendKeys( property, elements.tagRecord.propertyRef.omadi )
						.sleep ( 1000 );
					}
				} )
				.elementByName( elements.tagRecord.otherFields.licensePlate )
				.then( function ( licensePlate ) {

					if ( licensePlate ) {
						return commons.sendKeys( licensePlate, 'Test123' )
						.sleep( 1000 );
					}
				} )
				.sleep( 1000 )
				.elementByName( elements.formScreen.actions )
				.click().sleep ( 100 )
				.elementByNameIfExists( elements.formScreen.save )
				.then( function ( save ) {

					if ( save ) {
						return save
						.click()
						.sleep( 1000 );

					} else {
						return driver
						.elementByName( elements.formScreen.cancel )
						.click()
						.sleep( 1000 );
					}
				} )
				.sleep( 80 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else {
				console.log( 'User does not have access to create a tagRecord'.red );
				config.currentTest = 'passed';
			}
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Create New tagRecord test has Passed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};