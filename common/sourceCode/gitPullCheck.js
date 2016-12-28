'use strict';

module.exports = function () {

	require( 'colors' );
	var assert  = require( 'chai' ).assert;
	var cmd     = require( 'node-cmd' );
	var commons = require( '../../helpers/Commons' );
	var config  = require( '../../helpers/Config' );
	var driver  = config.driver;

	describe( 'Omadi Mobile Git Pull'.green, function () {
	        
        commons.beforeEachDes();
		commons.beforeEachIt();
		commons.afterEachDes();
		commons.afterEachIt();

        it( 'check for updates using gitPullCheck.js'.green, function () {

        	config.loginTest = true;

        	var homeDir = function () {

				return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
			};

			var home            = homeDir();
			var projectLocation = 'Projects/omadi_mobile ; git pull'
            var output1         = 'Already up-to-date.\n';
            var output2         = 'You are not currently on a branch.\n' + 
            					  'Please specify which branch you want to merge with\n' + 
            					  'See git-pull(1) for details.\n\n' + 
            					  '    git pull <remote> <branch>\n';
            var updated         = 'Source Code is "Already up-to-date."';
            var noUpdated       = 'Source Code is "Already up-to-date."';

            cmd.get( 'cd' + home + projectLocation, function ( data ) {
				
				if ( data ===  output1 ) {
					assert.equal( data, output1, updated  );
					console.log( 'Branch is updated' );
                	config.appUpdated  = true;
                	config.currentTest = 'passed';

                } else if ( data === output2 ) {
                	assert.equal( data, output2, updated  );
                	console.log( 'On a tag not branch' );
                	config.appUpdated  = true;
                	config.currentTest = 'passed';
                
                } else {
                	config.appUpdated  = false;
                	assert.equal( data, output, noUpdated );
                }
        	} );
        } );
    } );
};