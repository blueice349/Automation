'use strict';

module.exports = function () {

	require( 'colors' );
	require( '../../helpers/setup' );
	var alerts   = require( '../../helpers/alerts' );
	var assert   = require( 'assert' );
	var config   = require( '../../helpers/Config' );
	var elements = require( '../../helpers/elements' );
	var commons  = require( '../../helpers/Commons' );
	var Store    = require( '../../helpers/Store' );

	var driver = config.driver;

	describe( 'Start recentScreen Process using "recentScreenCheckScreen.js"'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

		it( 'Should check permissions for current user'.green, function() {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' 
				&& lastUser.userRole != 'AdminClient' 
			) {
				console.log( 'User has access to recent tab.'.red );
				config.canView = true;

			} else if ( lastUser.userRole === 'client' 
				      || lastUser.userRole === 'AdminClient' 
	      	) {
				console.log( 'User does "NOT" access to recent tab.'.red );
				config.canView = false;
			}
		} );

		it( 'Should go to Recent Tab from homeScreen'.green, function() {
			
			var lastUser = Store.get( 'lastUser' );
			if ( config.canView === true ) {
				console.log( 'User has access to recent tab.'.red );
				return driver
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.recent )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.homeScreen.recent )
				.click()
				.sleep( 800 )

			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" access to recent tab.'.red );
				return driver
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementByIdIfExists( elements.homeScreen.recent )
				.then( function ( recentTab ) {

					if ( recentTab ) {
						assert.fail( lastUser.userName + ' has a userRole '.red + lastUser.userRole + ' and should not see the recentTab.'.red );
					
					} else if ( !recentTab ) {
						config.canView = false;
					}
				} );
			}
		} );

		it( 'Should check Recent recentSearch after open on recentTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementById( elements.recentScreen.search )
				.isDisplayed().should.eventually.be.true
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fai( 'User should not have access to resentSearch located in the recent tab'.red );
					}
				} );
			} 	
		} );

		it( 'Should check Recent viewedTab exist if user has access to recentTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementById( elements.recentScreen.viewedTab )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.recentScreen.viewedTab )
				.text().should.eventually.contain( elements.recentScreen.viewedTabText )
				.elementById( elements.recentScreen.viewedTab )
				.click()
				.elementById( elements.recentScreen.search )
				.isDisplayed().should.eventually.be.true
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.viewedTab )
				.then( function ( viewedTab ) {

					if ( viewedTab ) {
						assert.fai( 'User should not have access to viewedTab located in the recent tab'.red );
					}
				} );
			} 	
		} );

		it( 'Should check Recent savedTab exist if user has access to recentTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementById( elements.recentScreen.savedTab )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.recentScreen.savedTab )
				.text().should.eventually.contain( elements.recentScreen.savedTabText )
				.elementById( elements.recentScreen.savedTab )
				.click()
				.elementById( elements.recentScreen.search )
				.isDisplayed().should.eventually.be.true
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.savedTab )
				.then( function ( savedTab ) {

					if ( savedTab ) {
						assert.fai( 'User should not have access to savedTab located in the recent tab'.red );
					}
				} );
			} 	
		} );

		it( 'should goo back to the homeScreen from recentTab.'.green, function () {

			if ( commons.isIOS() 
				&& config.canView === true 
			) {
				console.log( 'user is on a iOS device and should be on recentTab.'.red );
				return driver
				.waitForElementById( elements.recentScreen.back, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.recentScreen.back )
				.click()

			} else if ( commons.isAndroid() 
				       && config.canView === true 
	       	) {
				console.log( 'user is on a Android device and should be on recentTab.'.red );
				return driver
				.back()
			
			} else if ( config.canView === false ) {
				console.log( 'user is a client and should already be on homeScreen.'.red );
				return driver
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'go to recentScreen test has Completed....'.green );
			config.canView = false;
			done();
		} );
	} );
};