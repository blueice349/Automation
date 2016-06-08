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

	describe( 'Start recentScreen Process'.green, function () {

		commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();

		it( 'Should check permissions for current user'.green, function() {
			
			var lastUser = Store.get( 'lastUser' );
			if ( lastUser.userRole != 'client' && lastUser.userRole != 'AdminClient' ) {
				console.log( 'User has access to recent tab.'.red );
				config.canView     = true;
				config.currentTest = 'passed';

			} else if ( lastUser.userRole === 'client' || lastUser.userRole === 'AdminClient' ) {
				console.log( 'User does "NOT" access to recent tab.'.red );
				config.canView     = false;
				config.currentTest = 'passed';
			}
		} );

		it( 'Should go to Recent Tab from homeScreen'.green, function() {
			
			var lastUser = Store.get( 'lastUser' );
			if ( config.canView === true ) {
				console.log( 'User has access to recent tab.'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.recent )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.homeScreen.recent )
				.click()
				.sleep( 800 )
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" access to recent tab.'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementByNameIfExists( elements.homeScreen.recent )
				.then( function ( recentTab ) {

					if ( recentTab ) {
						assert.fail( lastUser.userName + ' has a userRole '.red + lastUser.userRole + ' and should not see the recentTab.'.red );
					
					} else if ( !recentTab ) {
						config.currentTest = 'passed';
						config.canView     = false;
					}
				} );
			}
		} );

		it( 'Should check Recent recentSearch after open on recentTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByName( elements.recentScreen.search )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fai( 'User should not have access to resentSearch located in the recent tab'.red );
					
					} else if ( !resentSearch ) {
						config.currentTest = 'passed';
					}
				} );
			} 	
		} );

		it( 'Should check Recent viewedTab exist if user has access to recentTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByName( elements.recentScreen.viewedTab )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.recentScreen.viewedTab )
				.click()
				.elementByName( elements.recentScreen.search )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.viewedTab )
				.then( function ( viewedTab ) {

					if ( viewedTab ) {
						assert.fai( 'User should not have access to viewedTab located in the recent tab'.red );
					} else if ( !viewedTab ) {
						config.currentTest = 'passed';
					}
				} );
			} 	
		} );

		it( 'Should check Recent savedTab exist if user has access to recentTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByName( elements.recentScreen.savedTab )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.recentScreen.savedTab )
				.click()
				.elementByName( elements.recentScreen.search )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.savedTab )
				.then( function ( savedTab ) {

					if ( savedTab ) {
						assert.fai( 'User should not have access to savedTab located in the recent tab'.red );
					} else if ( !savedTab ) {
						config.currentTest = 'passed';
					}
				} );
			} 	
		} );

		it( 'should goo back to the homeScreen from recentTab.'.green, function () {

			if ( commons.isIOS() && config.canView === true ) {
				console.log( 'user is on a iOS device and should be on recentTab.'.red );
				return driver
				.waitForElementByName( elements.recentScreen.back, 120000 )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.recentScreen.back )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );

			} else if ( commons.isAndroid() && config.canView === true ) {
				console.log( 'user is on a Android device and should be on recentTab.'.red );
				return driver
				.back()
				.then( function () {

					config.currentTest = 'passed';
				} );
			} else if ( config.canView === false ) {
				console.log( 'user is a client and should already be on homeScreen.'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'go to recentScreen test has Completed....'.green );
			config.currentTest = 'passed';
			config.canView     = false;
			done();
		} );
	} );
};