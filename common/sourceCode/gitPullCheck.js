'use strict';

module.exports = function () {

	require( 'colors' );
	var assert = require( 'chai' ).assert;
	var cmd    = require( 'node-cmd' );
	var config = require( '../../helpers/Config' );
	var driver = config.driver;

	describe( 'Omadi Mobile Git Pull Request'.green, function () {
	    
	    describe('Update source code'.green, function () {
	        
	        it( 'check for updates'.green, function ( done ) {

	            var output = "UPDATE THIS STRING WITH data";

	            cmd.get( 'cd /Users/mikemeyer/Projects/omadi_mobile ; git pull', function ( data ) {
					
					if ( data === 'Already up-to-date.\n' ) {
						console.log( 'Already up-to-date.'.red );
	                	assert.equal( data, 'Already up-to-date.\n' );
	                	config.appUpdated = true;
	                	done();
	                } else {
	                	console.log( 'App not updated, Should build app with updates and re-run test.'.red );
	                	config.appUpdated = false;
	                	done();
	                }
            	} );
            } );
        } );
    } );
};