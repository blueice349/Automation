'use strict';

module.exports = function () {

	require( 'colors' );
	var assert  = require( 'chai' ).assert;
	var cmd     = require( 'node-cmd' );
	var commons = require( '../../helpers/Commons' );
	var config  = require( '../../helpers/Config' );
	var driver  = config.driver;

	describe( 'Omadi Mobile Git Pull Request'.green, function () {
	    
	    describe('Update source code'.green, function () {
	        
	        commons.beforeEachDes();
			commons.beforeEachIt();
			commons.afterEachDes();

	        it( 'check for updates using gitPullCheck.js'.green, function ( done ) {

	            var output = "UPDATE THIS STRING WITH data";

	            cmd.get( 'cd /Users/mikemeyer/Projects/omadi_mobile ; git pull', function ( data ) {
					
					if ( data === 'Already up-to-date.\n' ) {
						assert.equal( data, 'Already up-to-date.\n', 'Source Code is "Already up-to-date."' );
	                	config.appUpdated  = true;
	                	config.currentTest = 'passed';
	                	done();
	                
	                } else {
	                	config.appUpdated  = false;
	                	config.currentTest = 'failed';
	                	assert.equal( data, 'Already up-to-date.\n', 'Source Code is " NOT up-to-date."' );
	                	done();
	                }
            	} );
            } );
        } );
    } );
};