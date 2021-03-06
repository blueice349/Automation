//All app locations for ios, android and simulator.

var homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

var home = homeDir();

exports.appVersion = '3.4.12.';

exports.androidApp = home + '/Projects/omadi_mobile/titanium_src/build/android/bin/Omadi.apk';

exports.iosSimApp = home + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphonesimulator/Omadi.app';

exports.iosDeviceApp = home + '/Projects/omadi_mobile/titanium_src/build/iphone/build/Products/Debug-iphoneos/Omadi.ipa';