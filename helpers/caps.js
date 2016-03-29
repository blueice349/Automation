'use strict';

//To use Mocha with UI server:
//mocha Mocha.js -os androidDevice1
//mocha Mocha.js -sim iosSim

//To use Mocha with out UI server:
//node run.js -os androidDevice1
//node run.js -sim iosSim

//ios Simulator #1
exports.iosSim1 = {
  'appium-version'  : '1.4',
  'platformName'    : 'iOS',
  'platformVersion' : '9.2',
  'deviceName'      : 'iPhone 6 Plus'
};

//Omadi - iPhone 6Plus
exports.iosDevice1 = {
  'appium-version'  : '1.4',
  'platformName'    : 'iOS',
  'platformVersion' : '9.2',
  'deviceName'      : 'Automation iPhone 6Plus',
  'UDID'            : 'ad5ba59f4f71d4b444489a45701bd95dff70a016'
};

//Lukes iPohne
exports.iosDevice2 = {
  'appium-version'  : '1.4',
  'platformName'    : 'iOS',
  'platformVersion' : '8.4',
  'deviceName'      : 'Luke’s iPhone',
  'UDID'            : '623ba2d8720d180a44e2067636361779eec1f6ac'
};

exports.androidSim1 = {
  'appium-version'  : '1.4',
  'platformName'    : 'Android',
  'platformVersion' : '6.0',
  'deviceName'      : 'Google Nexus 9 - 6.0.0 - API 23 - 1536x2048'
};

//Omadi LG Phone
exports.androidDevice1 = {
	'appium-version'  : '1.4',
	'platformName'    : 'Android',
	'platformVersion' : '5.1',
	'deviceName'      : 'LGH810e6f02f08'
};

//Mikes Note
exports.androidDevice2 = {
	'appium-version'  : '1.4',
	'platformName'    : 'Android',
	'platformVersion' : '5.0',
	'deviceName'      : '13a44a71'
};

//Omadi Samsung Galaxy S6
exports.androidDevice3 = {
  'appium-version'  : '1.4',
  'platformName'    : 'Android',
  'platformVersion' : '5.1.1',
  'deviceName'      : 'SM-G920T'
};
