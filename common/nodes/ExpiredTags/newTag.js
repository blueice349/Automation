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

	describe( 'Start Create New Tag Node and save using "newTag.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should check userRole '.green, function () {

			var lastUser = Store.get( 'lastUser' );
			return driver
			.waitForElementById( elements.homeScreen.syncAllowed, 20000 )
			.then( function () {

				if ( lastUser.userRole === 'admin' 
					|| lastUser.userRole === 'driver'  
				) {
					console.log( 'User is Allowed to add a New Redord'.red );
					canCreate = true;

				} else {
					console.log( 'Current User Does Not Have The Option to Add a New Tag'.red );
				}
			} );
		} );

		it( 'Should create new tagRecord from homeScreen'.green, function () {
			
			if ( canCreate === true ) {
				return driver
				.elementById( elements.tagRecord.tag + elements.homeScreen.plusButton )
				.click()
				.sleep( 1000 )
				.elementById( elements.tagRecord.propertyRef.property )
				.then( function ( property ) {

					if ( textFieldReg ) {
						return commons.sendKeys( property, elements.tagRecord.propertyRef.omadi )
						.sleep ( 1000 );
					}
				} )
				.elementById( elements.tagRecord.otherFields.licensePlate )
				.then( function ( licensePlate ) {

					if ( licensePlate ) {
						return commons.sendKeys( licensePlate, 'Test123' )
						.sleep( 1000 );
					}
				} )
				.sleep( 1000 )
				.elementById( elements.formScreen.actions )
				.click().sleep ( 100 )
				.elementByXPathIfExists( commons.textToXPath( elements.formScreen.save ) )
				.then( function ( save ) {

					if ( save ) {
						return save
						.click()
						.sleep( 1000 );

					} else {
						return driver
						.elementByXPath( commons.textToXPath( elements.formScreen.cancel ) )
						.click()
						.sleep( 1000 );
					}
				} )
				.sleep( 80 )

			} else {
				console.log( 'User does not have access to create a tagRecord'.red );
			}
		} );

		it( 'should set currentTest to "passed"'.green, function ( done ) {
		
			console.log( 'Create New tagRecord test has Passed....'.green );
			done();
		} );
	} );
};