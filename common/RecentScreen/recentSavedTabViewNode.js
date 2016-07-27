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

	describe( 'Start view node on recentScreeen from the recentSavedTab Process using "recentSavedTabViewNode.js"'.green, function () {

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

		it( 'Should go to recentScreen from homeScreen'.green, function() {
			
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

		it( 'Should go to savedTab on the recentScreen.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByXPath( commons.textToXPath( elements.recentScreen.savedTabText ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.recentScreen.savedTabText ) )
				.click()
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByXPathIfExists( commons.textToXPath( elements.recentScreen.savedTabText ) )
				.then( function ( savedTab ) {

					if ( savedTab ) {
						assert.fail( 'User should not have access to savedTab located in the recent tab'.red );
					}
				} );
			} 	
		} );

		it( 'Should click on first Node on savedTab and make sure "View and View Online" shows.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.recentNode + '0.' )
				.then( function ( viewedNode ) {
					
					if ( viewedNode ) {
						console.log( 'User should click on the first node in the view.'.red );
						config.recentNode = true;
						return viewedNode
						.click()
						.elementByXPath( commons.textToXPath( elements.recentScreen.viewOnline ) )
						.isDisplayed().should.eventually.be.true
						.elementByXPath( commons.textToXPath( elements.recentScreen.view ) )
						.isDisplayed().should.eventually.be.true
					
					} else {
						console.log( 'There is no Nodes to view in in savedTab.'.red );
						config.recentNode = false;
						return;
					}
				} );
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fail( 'User should not have access to resentSearch located in the recent tab'.red );
					}
				} );
			} 	
		} );

		it( 'Should Make sure View and viewOnline is visibile on first Node clicked on savedTab.'.green, function () {

			if ( config.canView === true 
				&& config.recentNode === true 
			) {
				console.log( 'User has access to recentTab and a node has been clicked.'.red );
				return driver
				.elementByXPath( commons.textToXPath( elements.recentScreen.viewOnline ) )
				.isDisplayed().should.eventually.be.true
				.elementByXPath( commons.textToXPath( elements.recentScreen.view ) )
				.isDisplayed().should.eventually.be.true
			
			} else if ( config.canView === true 
				       && config.recentNode === false 
			) {
				console.log( 'There is no Nodes to view in savedTab.'.red );

			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fail( 'User should not have access to resentSearch located in the recent tab'.red );
					}
				} );
			} 	
		} );

		it( 'Should click on "View" from the Node options on savedTab.'.green, function () {

			if ( config.canView === true 
				&& config.recentNode === true 
			) {
				console.log( 'User should click on "View".'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.recentNode + '0.' )
				.then( function ( el ) {

					if ( el ) {
						return el
						.click()
						.sleep( 100 );
					} 
				} );
			
			} else if ( config.recentNode === false 
				       && config.canView === true 
	       	) {
				console.log( 'User there is no node to view on viewedTab.'.red );
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByIdIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fail( 'User should not have access to resentSearch located in the recent tab'.red );
					}
				} );

			} 	
		} );

		it( 'Should go back to recentScreen.'.green, function () {
			
			if ( commons.isIOS() 
				&& config.recentNode === true 
				&& config.canView === true 
			) {
				console.log( 'iOS - User should go back to recentScreen from node view.'.red );
				return driver
				.elementById( elements.formScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementById( elements.formScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.recentNode = false;
				} );

			} else if ( commons.isAndroid() 
				       && config.recentNode === true 
				       && config.canView === true 
	       	) {
				console.log( 'Android - User should go back to recentScreen from node view.'.red );
				return driver
				.back()
				.sleep( 100 )
				.then( function () {

					config.recentNode = false;
				} );
			
			} else if ( config.canView === true 
				       && config.recentNode === false
	       	) {
				console.log( 'User should already be on the recent page.'.red );
				config.currentTest = 'passed';
			
			} else if ( config.canView === false ) {
				console.log( 'User does not have access to recentScreen and should be on the homeScreen.'.red );
			}
		} );

		it( 'should go back to the homeScreen from recentTab.'.green, function () {

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
				console.log( 'User does not have access to recentScreen and should already be on homeScreen.'.red );
				return driver
				.waitForElementById( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'View node from recentSavedTab test has Completed....'.green );
			config.canView = false;
			done();
		} );
	} );
};