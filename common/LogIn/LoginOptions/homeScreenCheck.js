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

	describe( 'Strat make sure app is on homeScreen after login completes using  "homeScreenCheck.js"'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'should check if user is on homeScreen or jobsScreen'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
				console.log( lastUser.userRole.red + ' does not have jobsScreen'.red );
				return driver
				.elementByName( elements.homeScreen.actions )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else {
				return driver
				.elementByNameIfExists( elements.homeScreen.actions )
				.isDisplayed()
				.then( function ( homeScreen ) {

					if ( homeScreen === true ) {
						console.log( lastUser.userRole.red + ' is on the homeScreen'.red );
						config.currentTest    = 'passed';
					} else if ( homeScreen != true ) {
						console.log( lastUser.userRole.red + ' is NOT on the homeScreen'.red );
						return driver
						.elementByName( elements.jobsScreen.newJobsTab.newJobsHeader )
						.isDisplayed()
						.then( function ( jobsScreen ) {

							if ( jobsScreen === true ) {
								console.log( lastUser.userRole.red + ' is on the jobsScreen'.red );
								if ( commons.isAndroid() ) {
									return driver
									.back()
									.sleep( 100 )
									.waitForElementByName( elements.homeScreen.actions, 30000 )
									.isDisplayed().should.eventually.be.true
									.then( function () {

										config.currentTest = 'passed';
									} );

								} else if ( commons.isIOS() ) {
									return driver
									.elementByName( elements.jobsScreen.otherOptions.back )
									.click()
									.sleep( 100 )
									.waitForElementByName( elements.homeScreen.actions, 30000 )
									.isDisplayed().should.eventually.be.true
									.then( function () {

										config.currentTest = 'passed';
									} );
								}
							}
						} )
					}
				} );
			}
		} );

		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'App is on homeScreen test has Completed....'.green );
			config.currentTest = 'passed';
			done();
		} );
	} );
};