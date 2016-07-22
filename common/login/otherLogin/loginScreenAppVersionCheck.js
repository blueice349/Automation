'use strict';

module.exports = function () {
	
	require( 'colors' );
	require( '../../../helpers/setup' );
	var apps     = require( '../../../helpers/apps' );
	var alerts   = require( '../../../helpers/alerts' );
	var caps     = require( '../../../helpers/caps' );
	var config   = require( '../../../helpers/Config' );
	var commons  = require( '../../../helpers/Commons' );
	var elements = require( '../../../helpers/elements' );
	var login    = require( '../../../helpers/loginTable' );
	var Store    = require( '../../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start appVersion Process using "loginAppVersionCheck.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'should check appVersion on loginScreen.'.green, function () {
			
			config.loginTest = true;
			return driver
			.elementById( apps.appVersion )
			.then( function ( appVersion ) {

				if ( commons.isAndroid() || commons.isAndroid6() ) {
					return appVersion.text().should.eventually.become( apps.appVersionTextAndroid )
				
				} else if ( commons.isIOS() ) {
					return appVersion.text().should.eventually.become( apps.appVersionTextIOS )
				}
			} );
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			config.loginTest = true;	
			console.log( 'appVersion check test has Completed....'.green );
			done();
		} );
	} );
};