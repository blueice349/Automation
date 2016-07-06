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
				return require( './common/actionsScreen/drafts/draftDelete.js' )();
			case 'daftView'      :
				return require( './common/actionsScreen/drafts/draftView.js' )();
			case 'draftSave'     :
				return require( './common/actionsScreen/drafts/draftSave.js' )();
			case 'resetAllData'  :
				return require( './common/actionsScreen/otherActions/resetAllData.js' )();
			case 'selectVehicle':
				return require( './common/actionsScreen/companyVehicle/actionsSelectVehicle.js' )();
			case 'removeVehicle':
				return require( './common/actionsScreen/companyVehicle/actionsRemoveVehicle.js' )();
			case 'clockin'      :
				return require( './common/actionsScreen/timeCard/actionsClockin.js' )();
			case 'clockout'      :
				return require( './common/actionsScreen/timeCard/actionsClockout.js' )();	
			case 'logout'        :
				return require( './common/actionsScreen/otherActions/actionsLogout.js' )();
			case 'actionsAbout'   :
				return require( './common/actionsScreen/AboutScreen/actionsAbout.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.homeScreen = function ( homeScreen ) {

		switch ( homeScreen ) {
			case 'logout'        :
				return require( './common/homeScreen/homeScreenLogout.js' )();
			case 'homeScreenItems' :
				return require( './common/homeScreen/homeScreenItems.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.jobsScreen = function ( jobsScreen ) {

		switch ( jobsScreen ) {
			case 'jobScreenCheck'         :
				return require( './common/jobsScreen/jobScreenCheck.js' )();
			case 'acceptJob'         :
				return require( './common/jobsScreen/acceptJob.js' )();
			case 'drivingToJob'      :
				return require( './common/jobsScreen/drivingToJob.js' )();
			case 'jobComplete'       :
				return require( './common/jobsScreen/jobComplete.js' )();
			case 'arrivedAtJob'      :
				return require( './common/jobsScreen/arrivedAtJob.js' )();
			case 'towingJob'         :
				return require( './common/jobsScreen/towingJob.js' )();
			case 'arrivedDestination':
				return require( './common/jobsScreen/arrivedDestination.js' )();
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
			case 'loginElementCheck'  :
				return require( './common/Login/otherLogin/loginScreenElements.js' )();
			case 'loginAppVersionCheck'  :
				return require( './common/Login/otherLogin/loginAppVersionCheck.js' )();	
			case 'admin1'             :
				return require( './common/login/adminRole/loginAdminTest1.js' )();
			case 'admin2'             :
				return require( './common/login/adminRole/loginAdminTest2.js' )();
			case 'client1'            :
				return require( './common/login/clientRole/loginClientTest1.js' )();
			case 'client2'            :
				return require( './common/login/clientRole/loginClientTest2.js' )();
			case 'driver1'            :
				return require( './common/login/driverRole/loginDriverTest1.js' )();
			case 'driver2'            :
				return require( './common/login/driverRole/loginDriverTest2.js' )();
			case 'wrongClientAccount' :
				return require( './common/login/wrongLogin/wrongClientAccount.js' )();
			case 'wrongUserName'      :
				return require( './common/login/wrongLogin/wrongUserName.js' )();	
			case 'wrongPassword'      :
				return require( './common/login/wrongLogin/wrongPassword.js' )();
			case 'blankClientAccount' :
				return require( './common/login/wrongLogin/blankClientAccount.js' )();
			case 'blankUserName'      :
				return require( './common/login/wrongLogin/blankUserName.js' )();
			case 'blankPassword'      :
				return require( './common/login/wrongLogin/blankPassword.js' )();
			case 'termsNotAccepted'   :
				return require( './common/login/wrongLogin/termsNotAccepted.js' )();
			case 'loginOptions'       :
				return require( './common/login/LoginOptions/loginOptions.js' )();
			case 'selectVehicle'      :
				return require( './common/login/LoginOptions/loginSelectVehicle.js' )();
			case 'clockin'            :
				return require( './common/login/LoginOptions/loginClockin.js' )();
			case 'homeScreenCheck'    :
				return require( './common/login/LoginOptions/homeScreenCheck.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

/*Node's Test */	

	module.exports.clientNodes = function ( clientNodes ) {

		switch ( clientNodes ) {		
			case 'clientDoNotTow'         :
				return require( './common/nodes/Restrictions/clientDoNotTow.js' )();	
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.conditionRequiredNodes = function ( conditionRequiredNodes ) {

		switch ( conditionRequiredNodes ) {
			case 'conditionRequiredTextFieldFilled'  :
				return require( './common/nodes/ConditionallyRequiredFields/textFieldFilled.js' )();
			case 'conditionRequiredTextFieldEmpty'  :
				return require( './common/nodes/ConditionallyRequiredFields/textFieldEmpty.js' )();
			case 'conditionRequiredCheckboxChecked'  :
				return require( './common/nodes/ConditionallyRequiredFields/checkboxIsChecked.js' )();;
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.conditionNotMetNodes = function ( conditionNotMetNodes ) {

		switch ( conditionNotMetNodes ) {
			case 'textAreaFieldConditionNotMet'  :
				return require( './common/nodes/ConditionNotMet/textAreaFieldConditionNotMet.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.draftNodes = function ( draftNodes ) {

		switch ( draftNodes ) {
			case 'newDraft1'              :
				return require( './common/nodes/drafts/newDraft1.js' )();
			case 'newDraft2'              :
				return require( './common/nodes/drafts/newDraft2.js' )();
			case 'newDraft3'              :
				return require( './common/nodes/drafts/newDraft3.js' )();
			case 'newDraft4'              :
				return require( './common/nodes/drafts/newDraft4.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.otherNodes = function ( otherNodes ) {

		switch ( otherNodes ) {
			case 'newTag'                 :
				return require( './common/nodes/ExpiredTags/newTag.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.restrictionNodes = function ( restrictionNodes ) {

		switch ( restrictionNodes ) {		
			case 'RestrictLicensePlate'   :
				return require( './common/nodes/Restrictions/restrictionLicensePlate.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

	module.exports.requiredNodes = function ( newNodes ) {

		switch ( newNodes ) {		
			case 'required'               :
				return require( './common/nodes/RequiredFields/textFieldRequired.js' )();
		}
		console.log( 'No test case was selcected!' );
	};

