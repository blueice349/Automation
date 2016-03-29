//All app locations for ios, android and simulator.

var homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

var home = homeDir();

exports.androidApp = home + '/Projects/omadi_mobile/titanium_src/build/android/bin/Omadi.apk';

exports.iosSimApp = home + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphonesimulator/Omadi.app';

exports.iosDeviceApp = home + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphoneos/Omadi.ipa';
                          
//Test to Run in run.js
exports.runTests = [ './common/login', './common/acceptJob.js', './common/drivingToJob', './common/doneWithVehicle', './common/clockInOut', './common/logout' ];


