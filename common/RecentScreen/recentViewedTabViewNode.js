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

	describe( 'Start view node on recentScreeen from the recentViewedTab Process'.green, function () {

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

		it( 'Should go to viewedTab on the recentScreen.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByName( elements.recentScreen.viewedTab )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.recentScreen.viewedTab )
				.click()
				.then( function () {

					config.currentTest = 'passed';
				} );
			
			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.viewedTab )
				.then( function ( viewedTab ) {

					if ( viewedTab ) {
						assert.fail( 'User should not have access to viewedTab located in the recent tab'.red );
					} else if ( !viewedTab ) {
						config.currentTest = 'passed';
					}
				} );
			} 	
		} );

		it( 'Should click on first Node on viewedTab.'.green, function () {

			if ( config.canView === true ) {
				console.log( 'User has access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.recentNode + '0.' )
				.then( function ( viewedNode ) {
					
					if ( viewedNode ) {
						console.log( 'User should click on the first node in the view.'.red );
						return viewedNode
						.click()
						.elementByName( elements.recentScreen.viewOnline )
						.isDisplayed().should.eventually.be.true
						.elementByName( elements.recentScreen.view )
						.isDisplayed().should.eventually.be.true
						.then( function () {

							config.recentNode = true;
							config.currentTest = 'passed';
						} );
					} else {
						console.log( 'There is no Nodes to view in in viewedTab.'.red );
						config.recentNode  = false;
						config.currentTest = 'passed';
					}
				} );

			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fail( 'User should not have access to resentSearch located in the recent tab'.red );
					
					} else if ( !resentSearch ) {
						config.currentTest = 'passed';
					}
				} );
			} 	
		} );

		it( 'Should Make sure View and viewOnline is visibile on first Node clicked on viewedTab.'.green, function () {

			if ( config.canView === true && config.recentNode === true ) {
				console.log( 'User has access to recentTab and a node has been clicked.'.red );
				return driver
				.elementByName( elements.recentScreen.viewOnline )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.recentScreen.view )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			} else if ( config.canView === true && config.recentNode === false ) {
				console.log( 'There is no Nodes to view in viewedTab.'.red );
				config.currentTest = 'passed';

			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fail( 'User should not have access to resentSearch located in the recent tab'.red );
					
					} else if ( !resentSearch ) {
						config.currentTest = 'passed';
					}
				} );
			} 	
		} );

		it( 'Should click on "View" from the Node options on viewedTab.'.green, function () {

			if ( config.canView === true && config.recentNode === true ) {
				console.log( 'User should click on "View".'.red );
				return driver
				.elementByName( elements.recentScreen.view )
				.click()
				.sleep( 100 )
				.then( function () {

					config.currentTest = 'passed';
				} );
				
			} else if ( config.recentNode === false && config.canView === true ) {
				console.log( 'User there is no node to view on viewedTab.'.red );
				config.currentTest = 'passed';

			} else if ( config.canView === false ) {
				console.log( 'User does "NOT" have access to recentTab.'.red );
				return driver
				.elementByNameIfExists( elements.recentScreen.search )
				.then( function ( resentSearch ) {

					if ( resentSearch ) {
						assert.fail( 'User should not have access to resentSearch located in the recent tab'.red );
					
					} else if ( !resentSearch ) {
						config.currentTest = 'passed';
					}
				} );
			}
		} );

		it( 'Should go back to recentScreen.'.green, function () {
			
			if ( commons.isIOS() && config.recentNode === true && config.canView === true ) {
				console.log( 'iOS - User should go back to recentScreen from node view.'.red );
				return driver
				.elementByName( elements.formScreen.back )
				.isDisplayed().should.eventually.be.true
				.elementByName( elements.formScreen.back )
				.click()
				.sleep( 1000 )
				.then( function () {

					config.currentTest = 'passed'
					config.recentNode  = false;
				} );

			} else if ( commons.isAndroid() && config.recentNode === true && config.canView === true ) {
				console.log( 'Android - User should go back to recentScreen from node view.'.red );
				return driver
				.back()
				.sleep( 100 )
				.then( function () {

					config.currentTest = 'passed'
					config.recentNode  = false;
				} );
			
			} else if ( config.canView === true && config.recentNode === false ) {
				console.log( 'User should already be on the recent page.'.red );
				config.currentTest = 'passed';
			
			} else if ( config.canView === false ) {
				console.log( 'User does not have access to recentScreen and should be on the homeScreen.'.red );
				config.currentTest = 'passed';
			}
		} );

		it( 'should go back to the homeScreen from recentTab.'.green, function () {

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
				console.log( 'User does not have access to recentScreen and should already be on homeScreen.'.red );
				return driver
				.waitForElementByName( elements.homeScreen.syncAllowed, 120000 )
				.isDisplayed().should.eventually.be.true
				.then( function () {

					config.currentTest = 'passed';
				} );
			}
		} );
		
		it( 'should set currentTest to "passed".'.green, function ( done ) {
			
			console.log( 'View node from recentViewedTab test has Completed....'.green );
			config.currentTest = 'passed';
			config.canView     = false;
			done();
		} );
	} );
};