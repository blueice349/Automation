'use strict';

module.exports.logins = function ( login ) {

	switch ( login ) {
		case 'admin1'      :
			return require( './common/LogIn/AdminRole/loginAdminTest1.js' )();
		case 'admin2'      :
			return require( './common/LogIn/AdminRole/loginAdminTest2.js' )();
		case 'client1'     :
			return require( './common/LogIn/ClientRole/loginClientTest1.js' )();
		case 'client2'     :
			return require( './common/LogIn/ClientRole/loginClientTest2.js' )();
		case 'driver1'      :
			return require( './common/LogIn/DriverRole/loginDriverTest1.js' )();
		case 'driver2'      :
			return require( './common/LogIn/DriverRole/loginDriverTest2.js' )();
		case 'badLogin'     :
			return require( './common/LogIn/badLogin.js' )();	
		case 'loginOptions' :
			return require( './common/LogIn/LoginOptions/loginOptions.js' )();
		case 'selectVehicle' :
			return require( './common/LogIn/LoginOptions/loginSelectVehicle.js' )();
		case 'clockin'       :
			return require( './common/LogIn/LoginOptions/loginClockin.js' )();
	}
	console.log( 'No test case was selcected!' );
};

module.exports.jobsScreen = function ( jobsScreen ) {

	switch ( jobsScreen ) {
		case 'acceptJob'         :
			return require( './common/JobsScreen/acceptJob.js' )();
		case 'drivingToJob'      :
			return require( './common/JobsScreen/drivingToJob.js' )();
		case 'jobComplete'       :
			return require( './common/JobsScreen/jobComplete.js' )();
		case 'arrivedAtJob'      :
			return require( './common/JobsScreen/arrivedAtJob.js' )();
		case 'towingJob'         :
			return require( './common/JobsScreen/towingJob.js' )();
		case 'arrivedDestination':
			return require( './common/JobsScreen/arrivedDestination.js' )();
		case 'badLogin'          :
			return require( './common/LogIn/badLogin.js' )();	
	}
	console.log( 'No test case was selcected!' );
};

module.exports.newNodes = function ( newNodes ) {

	switch ( newNodes ) {
		case 'newNode'                :
			return require( './common/NewNodes/newNodeMainMenu.js' )();
		case 'nodeToDrafts1'          :
			return require( './common/NewNodes/newNodeToDrafts1.js' )();
		case 'nodeToDrafts2'          :
			return require( './common/NewNodes/newNodeToDrafts2.js' )();
		case 'conditionallyRequired'  :
			return require( './common/NewNodes/conditionallyRequired.js' )();
		case 'required'               :
			return require( './common/NewNodes/required.js' )();
	}
	console.log( 'No test case was selcected!' );
};

module.exports.actionsScreen = function ( actionsScreen ) {

	switch ( actionsScreen ) {
		case 'draftDelete'   :
			return require( './common/ActionsScreen/Drafts/draftDelete.js' )();
		case 'draftSave'     :
			return require( './common/ActionsScreen/Drafts/draftSave.js' )();
		case 'resetAllData'  :
			return require( './common/ActionsScreen/resetAllData.js' )();
		case 'companyVehicle':
			return require( './common/ActionsScreen/companyVehicle.js' )();
		case 'clockInOut'    :
			return require( './common/ActionsScreen/clockInOut.js' )();
		case 'logout'        :
			return require( './common/ActionsScreen/logout.js' )();
		case 'aboutButton'   :
			return require( './common/ActionsScreen/aboutButton.js' )();
	}
	console.log( 'No test case was selcected!' );
};

module.exports.restrictions = function ( restrictions ) {

	switch ( restrictions ) {
		case 'licensePlate'   :
			return require( './common/Restrictions/restrictionLicensePlate.js' )();
		case 'clientDoNotTow' :
			return require( './common/Restrictions/clientDoNotTow.js' )();
	}
	console.log( 'No test case was selcected!' );
};

module.exports.expiredTags = function ( expiredTags ) {

	switch ( expiredTags ) {
		case 'newTag' :
			return require( './common/ExpiredTags/newTag.js' )();
		}
		console.log( 'No test case was selcected!' );
};

module.exports.mainMenuScreen = function ( mainMenuScreen ) {

	switch ( mainMenuScreen ) {
		case 'logout'        :
			return require( './common/MainMenuScreen/logout.js' )();
		case 'mainMenuItems' :
			return require( './common/MainMenuScreen/mainMenuItems.js' )();
	}
	console.log( 'No test case was selcected!' );
};

