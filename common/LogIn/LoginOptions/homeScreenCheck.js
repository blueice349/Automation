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
		commons.afterEachIt();

		it( 'should check if user is on homeScreen or jobsScreen'.green, function () {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole === 'client'
			||   lastUser.userRole === 'AdminClient' ) {
				console.log( lastUser.userRole.red + ' does not have jobsScreen'.red );
				return driver
				.elementById(elements.dashboard.logout )
				.isDisplayed().should.eventually.be.true

			} else {
				return driver
				.elementByIdIfExists( elements.newHomeScreen.dashBoardSelected )
				.then( function ( dashboard ) {

					if ( dashboard ) {
						console.log( lastUser.userRole.red + ' is on the dashboard'.red );

					} else {
						console.log( lastUser.userRole.red + ' is NOT on the dashboard'.red );
						return driver
						.elementByIdIfExists( elements.newHomeScreen.jobsSelected )
						.then( function ( jobsScreen ) {

							if ( jobsScreen === true ) {
								console.log( lastUser.userRole.red + ' is on the jobsScreen'.red );
								return driver
								.elementById( elements.newHomeScreen.dashBoardNotSelected )
								.click()
								.elementById( elements.newHomeScreen.dashBoardSelected )
								.isDisplayed().should.eventually.be.true
							}
						} )
					}
				} );
			}
		} );

		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'App is on homeScreen test has Completed....'.green );
			done();
		} );
	} );
};