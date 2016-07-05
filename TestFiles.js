'use strict';

/* Source Code Check */
	module.exports.sourceCodeCheck = function ( sourceCodeCheck ) {

		switch ( sourceCodeCheck ) {
			case 'gitPullCheck'   :
				return require( './common/sourceCode/gitPullCheck.js' )();
			case 'buildUpdates'   :
				return require( './common/sourceCode/buildUpdatedSourceCode.js' )();
		}
		console.log( 'No sourceCodeCheck was selcected!' );
	};

/* Different Screens Test */
	module.exports.actionsScreen = function ( actionsScreen ) {

		switch ( actionsScreen ) {
			case 'draftDelete'   :
				return require( './common/ActionsScreen/Drafts/draftDelete.js' )();
			case 'daftView'      :
				return require( './common/ActionsScreen/Drafts/draftView.js' )();
			case 'draftSave'     :
				return require( './common/ActionsScreen/Drafts/draftSave.js' )();
			case 'resetAllData'  :
				return require( './common/ActionsScreen/resetAllData.js' )();
			case 'selectVehicle':
				return require( './common/ActionsScreen/CompanyVehicle/actionsSelectVehicle.js' )();
			case 'removeVehicle':
				return require( './common/ActionsScreen/CompanyVehicle/actionsRemoveVehicle.js' )();
			case 'clockin'      :
				return require( './common/ActionsScreen/TimeCard/actionsClockin.js' )();
			case 'clockout'      :
				return require( './common/ActionsScreen/TimeCard/actionsClockout.js' )();	
			case 'logout'        :
				return require( './common/ActionsScreen/actionsLogout.js' )();
			case 'actionsAbout'   :
				return require( './common/ActionsScreen/AboutScreen/actionsAbout.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.homeScreen = function ( homeScreen ) {

		switch ( homeScreen ) {
			case 'logout'        :
				return require( './common/HomeScreen/homeScreenLogout.js' )();
			case 'homeScreenItems' :
				return require( './common/HomeScreen/homeScreenItems.js' )();
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

	module.exports.recentScreen = function ( recentScreen ) {

		switch ( recentScreen ) {
			case 'recentScreenCheckOptions'         :
				return require( './common/RecentScreen/recentScreenCheckScreen.js' )();
			case 'recentViewedTabViewNode'      :
				return require( './common/RecentScreen/recentViewedTabViewNode.js' )();
			case 'recentSavedTabViewNode'      :
				return require( './common/RecentScreen/recentSavedTabViewNode.js' )();	
		}
		console.log( 'No test case was selcected!' );
	};

/* Login test */
	module.exports.logins = function ( login ) {

		switch ( login ) {
			case 'admin1'             :
				return require( './common/LogIn/AdminRole/loginAdminTest1.js' )();
			case 'admin2'             :
				return require( './common/LogIn/AdminRole/loginAdminTest2.js' )();
			case 'client1'            :
				return require( './common/LogIn/ClientRole/loginClientTest1.js' )();
			case 'client2'            :
				return require( './common/LogIn/ClientRole/loginClientTest2.js' )();
			case 'driver1'            :
				return require( './common/LogIn/DriverRole/loginDriverTest1.js' )();
			case 'driver2'            :
				return require( './common/LogIn/DriverRole/loginDriverTest2.js' )();
			case 'wrongClientAccount' :
				return require( './common/LogIn/wrongLogin/wrongClientAccount.js' )();
			case 'wrongUserName'      :
				return require( './common/LogIn/wrongLogin/wrongUserName.js' )();	
			case 'wrongPassword'      :
				return require( './common/LogIn/wrongLogin/wrongPassword.js' )();
			case 'blankClientAccount' :
				return require( './common/LogIn/wrongLogin/blankClientAccount.js' )();
			case 'blankUserName'      :
				return require( './common/LogIn/wrongLogin/blankUserName.js' )();
			case 'blankPassword'      :
				return require( './common/LogIn/wrongLogin/blankPassword.js' )();
			case 'termsNotAccepted'   :
				return require( './common/LogIn/wrongLogin/termsNotAccepted.js' )();
			case 'loginOptions'       :
				return require( './common/LogIn/LoginOptions/loginOptions.js' )();
			case 'selectVehicle'      :
				return require( './common/LogIn/LoginOptions/loginSelectVehicle.js' )();
			case 'clockin'            :
				return require( './common/LogIn/LoginOptions/loginClockin.js' )();
			case 'homeScreenCheck'    :
				return require( './common/LogIn/LoginOptions/homeScreenCheck.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

/*Node's Test */	

	module.exports.clientNodes = function ( clientNodes ) {

		switch ( clientNodes ) {		
			case 'clientDoNotTow'         :
				return require( './common/NewNodes/Restrictions/clientDoNotTow.js' )();	
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.conditionRequiredNodes = function ( conditionRequiredNodes ) {

		switch ( conditionRequiredNodes ) {
			case 'conditionRequiredTextFieldFilled'  :
				return require( './common/NewNodes/ConditionallyRequiredFields/textFieldFilled.js' )();
			case 'conditionRequiredTextFieldEmpty'  :
				return require( './common/NewNodes/ConditionallyRequiredFields/textFieldEmpty.js' )();
			case 'conditionRequiredCheckboxChecked'  :
				return require( './common/NewNodes/ConditionallyRequiredFields/checkboxIsChecked.js' )();;
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.conditionNotMetNodes = function ( conditionNotMetNodes ) {

		switch ( conditionNotMetNodes ) {
			case 'textAreaFieldConditionNotMet'  :
				return require( './common/NewNodes/ConditionNotMet/textAreaFieldConditionNotMet.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.draftNodes = function ( draftNodes ) {

		switch ( draftNodes ) {
			case 'newDraft1'              :
				return require( './common/NewNodes/Drafts/newDraft1.js' )();
			case 'newDraft2'              :
				return require( './common/NewNodes/Drafts/newDraft2.js' )();
			case 'newDraft3'              :
				return require( './common/NewNodes/Drafts/newDraft3.js' )();
			case 'newDraft4'              :
				return require( './common/NewNodes/Drafts/newDraft4.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.otherNodes = function ( otherNodes ) {

		switch ( otherNodes ) {
			case 'newTag'                 :
				return require( './common/NewNodes/ExpiredTags/newTag.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.restrictionNodes = function ( restrictionNodes ) {

		switch ( restrictionNodes ) {		
			case 'RestrictLicensePlate'   :
				return require( './common/NewNodes/Restrictions/restrictionLicensePlate.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.requiredNodes = function ( newNodes ) {

		switch ( newNodes ) {		
			case 'required'               :
				return require( './common/NewNodes/RequiredFields/textFieldRequired.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

