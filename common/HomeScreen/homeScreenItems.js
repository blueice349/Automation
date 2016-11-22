'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../helpers/setup' );
	var alerts   = require( '../../helpers/alerts' );
	var caps     = require( '../../helpers/caps' );
	var config   = require( '../../helpers/Config' );
	var commons  = require( '../../helpers/Commons' );
	var elements = require( '../../helpers/elements' );
	var login    = require( '../../helpers/loginTable' );
	var Store    = require( '../../helpers/Store' );
	var driver   = config.driver;

	describe( 'Start Check homeScreenItems process using "homeScreenItems.js"'.green, function() {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();
		
		it( 'Should make sure all buttons are visble on homeScreen after intinal sync'.green, function () {
			var lastUser = Store.get( 'lastUser' );
	     	//Checks for buttons to be displayed on main menu after log on.
			if ( lastUser.userRole === 'admin'
			||   lastUser.userRole === 'driver' ) {
				return driver
				.elementById(elements.newHomeScreen.dashBoardSelected )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.newHomeScreen.dashBoardNotSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.alertsSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.alertsNotSelected )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.newHomeScreen.recentSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.recentNotSelected )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.newHomeScreen.hamburger )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.newHomeScreen.menu )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.userRealName )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.userImage )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.editShortcuts )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.logout )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.userRoles )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					if ( lastUser.performJob === true ) {
						return driver
						.elementById( elements.newHomeScreen.jobsSelected )
						.isDisplayed().should.eventually.be.false
						.elementById(elements.newHomeScreen.jobsNotSelected )
						.isDisplayed().should.eventually.be.true
					}

					if ( lastUser.tagButton === true ) {
						return driver
						.elementById( elements.newHomeScreen.expiredTagsSelected )
						.isDisplayed().should.eventually.be.false
						.elementById( elements.newHomeScreen.expiredTagsNotSelected )
						.isDisplayed().should.eventually.be.true
					}
				} );

			} else if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
				return driver
				.elementById(elements.newHomeScreen.dashBoardSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.dashBoardNotSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.alertsSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.alertsNotSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.jobsSelected )
				.isDisplayed().should.eventually.be.false
				.elementById(elements.newHomeScreen.jobsNotSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.recentSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.recentNotSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.expiredTagsSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.expiredTagsNotSelected )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.newHomeScreen.hamburger )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.newHomeScreen.menu )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.userRealName )
				.isDisplayed().should.eventually.be.false
				.elementById( elements.dashboard.userImage )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.editShortcuts )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.logout )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.dashboard.userRoles )
				.isDisplayed().should.eventually.be.true
			} else {
				assert.fail( 'userRole needs to be updates.' );
			}
		} );

		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'homeScreenItems test has Completed....'.green );
			done();
		} );
	} );
};