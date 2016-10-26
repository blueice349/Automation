 
var apps = require( './apps.js' );

exports.androidCustomId = {
	'button1' : 'android:id/button1',
	'button2' : 'android:id/button2',
	'button3' : 'android:id/button3'
}

 exports.loginScreen = {
 	'appVersion'         : apps.appVersion,    
	'clientAccount'      : 'clientAccount.',
	'userName'           : 'userName.',
	'password'           : 'password.',
	'agreedToTerms'      : 'agreedToTermsCheckBox.',
	'needToAgreeToTerms' : 'notAgreedToTermsCheckBox.',
	'loginButton'        : 'logInButton.',
	'logo'               : 'loginLogo.'
}

exports.config = {
	'currentTestOptions' : {

		'currentTest' : 'currentTest',
			'failed'      : 'failed',
			'passed'      : 'passed',
			'notStarted'  : 'notStarted'
	},

	'otherOptions' : {
		
		'appUpdated'   : 'appUpdated',
		'canCreate'    : 'canCreate',
		'canView'      : 'canView',
		'gitPullData'  : 'gitPullData',
		'isClockedin'  : 'isClockedin',
		'isJobsScreen' : 'isJobsScreen',
		'isNodeEdit'   : 'isNodeEdit',
		'isInVehicle'  : 'sInVehicle',
		'loginTest'    : 'loginTest',
		'recentNode'   : 'recentNode',
		'sim'          : 'sim',
		'skip'         : 'skip'
	}
};


//Run commands...
//mocha run.js -os androidDriver -time 500000

// exports.standardFields = {
// 	'extraPriceAutocomplete'   : 'Field NameField#.'
// 	'extraPriceSelect'         : 'Field NameField#.' & 'Undefinded for IOS'
// 	'extraPriceDetails'        : 'Field NameDetails#.'
// 	'extraPricePrice'          : 'Field NamePrice#.'
// 	'extraPriceQty'            : 'Field NameQty#.'
// 	'extraPriceTotal'          : 'Field NameTotal#.'
//     'buttons'                  : 'Field NameButton.'
//     'checkbox'                 : 'Field NameCheckbox.'
//     'textFields'               : 'Field NameField#.'
//     'autoComplete'             : 'Field NameField#.'
//     'selectList'               : 'Field NameField#.'
//     'multiSelect'              : 'Field NameField.'
//     'userSelect'               : 'Field NameField.' & 'Undefinded for IOS'
// }

exports.alertButtons = {
	'androidAllow'    : 'com.android.packageinstaller:id/',
	'allow'           : 'Allow',
	'back'            : 'Back',
	'beginRoute'      : 'Begin route',
	'cancel'          : 'Cancel',
	'clockIn'         : 'Clock in',
	'clockOut'        : 'Clock out',
	'clockOutLogout'  : 'ClockOut & Logout',
	'closeApp'        : 'Close App',
	'closeAnyways'    : 'Close Anyway',
	'deleteRecord'    : 'Delete',
	'deleteIt'        : 'Delete It',
	'done'            : 'Done',
	'dontAllow'       : 'Dont Allow',
	'doInspection'    : 'Do Inspection',
	'exit'            : 'Exit',
	'gallery'         : 'Gallery',
	'goBack'          : 'Go Back',
	'goDrafts'        : 'Go to Drafts',
	'info'            : 'Info',
	'ingore'          : 'Ignore',
	'keep'            : 'Keep',
	'ok'              : 'OK',
	'omadi'           : 'Omadi',
	'logout'          : 'Logout',
	'yes'             : 'Yes',
	'no'              : 'No',
	'readLater'       : 'Read Later',
	'readNow'         : 'Read Now',
	'restart'         : 'Restart',
	'retry'           : 'Retry',
	'return'          : 'return',
	'review'          : 'Review',
	'saveAnyways'     : 'Save Anyway',
	'skip'            : 'Skip',
    'takeMeThere'     : 'Take Me There',
    'viewInApp'       : 'View In App',
    'viewInBrowser'   : 'View In Browser',      
    'viewLater'       : 'View Later',
    'viewPhotos'      : 'View Photos'
}

exports.companyVehicle = {
	'androidVehicle'   : 'android:id/text1',
	'vehicle1'         : 'Truck 1',
	'vehicle2'         : 'Truck 2',
	'vehicle3'         : 'truck 3',
	'review'           : 'Review',
	'no'               : 'No',
	'noVehicle'        : '- No Vehicle -',
	'ok'               : 'OK'
}	

exports.oldHomeScreen = {
	'actions'          : 'homeActionsButton.',
	'button'           : 'Button.',
	'clockOut'         : 'homeClockOutButton',
	'clockIn'          : 'homeClockInButton',
	'homeScreen'       : 'homeScreenButton.',
	'sync'             : 'refreshSync.',
	'name'             : 'userLoggedIn.',
	'plusButton'       : 'PlusButton.',
	'alerts'           : 'alertsButton.',
	'jobs'             : 'jobsButton.',
	'recent'           : 'recentButton.',
	'syncStatus'       : 'syncProgress.',
	'syncAllowed'      : 'syncAllowed.',
	'syncInProgress'   : 'syncInProgress.',
	'expiredTags'      : 'tagsReadyButton.'
}

exports.dashboard = {
	'userRealName'           : 'dashboardUserRealNameLabel.',
	'userImage'              : 'dasboardUserImage.',
	'userRoles'              : 'dashboardUserRoles.',
	'editShortcuts'          : 'dashboardEditShortcuts.',
	'clockIn'                : 'dashboardClockIn.',
	'clockOut'               : 'dashboardClockOut.',
	'clockInOutText'         : 'dashboardClockText.',
	'clockInOutImage'        : 'dashboardClockInOutImage.',
	'vehicleImage'           : 'dashboardVehicleImage.',
	'vehicleName'            : 'dashboardVehicleName.',
	'selectCompanyVehicle'   : 'dashboardSelectVehicle.',
	'doneWithCompanyVehicle' : 'dashboardDoneWithVehicle.',
}

exports.newHomeScreen = {
	'syncStatus'             : 'syncProgress.',
	'syncAllowed'            : 'syncAllowed.',
	'syncInProgress'         : 'syncInProgress.',
	'hambu'                  : 'homeHamburgerButton.'
	'actions'                : 'homeActionsButton.',
	'name'                   : 'userLoggedIn.',
	'button'                 : 'Button.',
	'plusButton'             : 'PlusButton.',
	'clockOut'               : 'homeClockOutButton',
	'clockIn'                : 'homeClockInButton',
	'dashBoardSelected'      : 'dashboardButtonSelected.',
	'dashBoardNotSelected'   : 'dashboardButtonNotSelected.',
	'alertsSelected'         : 'alertsButtonSelected.',
	'alertsNotSelected'      : 'alertsButtonNotSelected.',
	'jobsSelected'           : 'jobsButtonSelected.',
	'jobsNotSelected'        : 'jobsButtonNotSelected.',
	'recentSelected'         : 'recentButtonSelected.',
	'recentNotSelected'      : 'recentButtonNotSelected.',
	'expiredTagsSelected'    : 'tagsReadyButtonSelected.',
	'expiredTagsNotSelected' : 'tagsReadyButtonNotSelected.'
}

exports.formScreen = {
	'actions'         : 'formActionsButton.',
	'back'            : 'formBackButton.',
	'cancel'          : 'Cancel',
	'comments'        : 'commentsTab.',
	'dispatch'        : 'dispatchTab.',
	'newComment'      : 'newCommentButton.',
	'save'            : 'Save',
	'saveAsDraft'     : 'Save as draft',
	'showAll'         : 'formShowAllButton.',	
	'work'            : 'workTab.'
}	

exports.itemListScreen = {
	'back'       : 'itemListBackButton.',
	'item'       : 'itemList', //+ tableIndex + '.'	
	'titleLabel' : 'titleLabel.',
	'map'        : 'itemListMapButton.',
	'nearMe'     : 'itemListNearMeButton.',
	'newRecord'  : 'newRecordButton.',
	'search'     : 'itemListSearch.',
	'showAll'    : 'itemListShowAllButton.'
}

exports.multiSelectScreen = {
	'cancel' : 'cancelButton.',
	'done'   : 'doneButton.',
	'header' : 'MultiSelect.',
	'item'   : 'item' //+ index++ + '.'
}

exports.itemMapScreen = {
	'back'  : 'itemMapBackButton.'
}	

exports.nearMeScreen = {
	'back'    : 'nearMeBackButton.',
	'map'     : 'nearMeMapButton.',
	'refresh' : 'nearMeRefreshButton.'
}

exports.alertsScreen = {
	'back'   : 'alertsBackButton.'

}

exports.jobsScreen = {
	'updateStatusOptions' : {
		'updateStatus'     : 'Update Status',
		'acceptJob'        : 'Accept Job',
		'driving'          : 'Driving to Job',
		'drivingPlus'      : 'Driving to Job +',
		'arrivedJob'       : 'Arrived at Job',
	    'arrivedJobPlus'   : 'Arrived at Job +',
	    'towing'           : 'Towing Vehicle',
	    'towingPlus'       : 'Towing Vehicle +',
	    'arrivedDest'      : 'Arrived at Destination',
        'arrivedDestPlus'  : 'Arrived at Destination +',
        'jobComplete'      : 'Job Complete',
        'jobCompletePlus'  : 'Job complete +',
        'cancel'           : 'Cancel'
    },

	'myPendingJobsTab' : {
		'pendingJobsHeader'   : 'myPendingJobsHeader.', 
    	'pendingJobsLabel'    : 'myPendingJobs.',
		'pendingJobs'         : 'myPendingJobs', //+ index++ + '.'
		'pendingDiscontinued' : 'myPendingdJobsDiscontinued.' //+ index++ + '.'
	},

	'myAssignedJobsTab' : {  
    	'assignedJobsHeader'       : 'myAssignedJobsHeader.', //This is used for intianl sync.
    	'assignedJobsLabel'        : 'myAssignedJobs.',
		'assignedJobs'             : 'myAssignedJobs', //+ index++ + '.'
		'assignedJobsDiscontinued' : 'myAssignedJobsDiscontinued.', //+ index++ + '.'
		'assignedJobsDiscontinue'  : 'myAssignedJobsDiscontinueButton.', //+ index++ + '.'
		'assignedJobsAccept'       : 'myAssignedJobsAcceptButton.', //+ index++ + '.'
		'assignedJobsUndo'         : 'myAssignedJobsUndoButton.' //+ index++ + '.'
	},

	'myOpenJobsTab'  : {
    	'openJobsHeader'       : 'myOpenJobsHeader.',
    	'openJobsLabel'        : 'myOpenJobsLabel.',
    	'openJobs'             : 'myOpenJobs', //+ index++ + '.'
	    'openJobsDiscontinued' : 'myOpenJobsDiscontinued.', //+ index++ + '.'
	    'openJobsDiscontinue'  : 'myOpenJobsDiscontiuneButton.', //+ index++ + '.'
		'openJobsUpdateStatue' : 'myOpenJobsUpdateStatusButton.', //+ index++ + '.'
	},

	'myFutureJobsTab' : {
    	'futureHeader'           : 'myFutureHeader.',
        'futureJobs'             : 'myFutureJobs', //+ index++ + '.'
	    'futureJobsDiscontinued' : 'myFutureJobsDiscontinued.', //+ index++ + '.'
	    'futureJobsDiscontinue'  : 'myFutureJobsDiscontinueButton.', //+ index++ + '.'
		'futureJobsAccept'       : 'myFutureJobsAcceptButton.' //+ index++ + '.'
	},

	'allDispatchJobsTab' : { 
		'newDispatch'             : 'jobsNewDispatchButton.',
		'dispatchJobsHeader'      : 'allDispatcjJobsHeader.', 
    	'dispatchJobsLabel'       : 'allDispatchJobs.',
		'dispatchJobs'            : 'allDispatchJobs', //+ index++ + '.'
		'dispatchDiscontinued'    : 'allDispatchJobsDiscontinued.', //+ index++ + '.'
		'dispatchJobsDiscontinue' : 'allDispatchJobsDiscontinueButton.', //+ index++ + '.'
		'dispatchJobsDispatch'    : 'allDispatchJobsDispatchButton.' //+ index++ + '.'
    },

    'allPendingJobsTab' : {
    	'pendingJobsHeader'   : 'allPendingJobsHeader.', 
    	'pendingJobsLabel'    : 'allPendingJobs.',
		'pendingJobs'         : 'allPendingJobs', //+ index++ + '.'
		'pendingDiscontinued' : 'allPendingdJobsDiscontinued.' //+ index++ + '.'
    },

	'allAssignedJobsTab' : {  
    	'assignedJobsHeader'       : 'allAssignedJobsHeader.',
    	'assignedJobsLabel'        : 'allAssignedJobs.',
		'assignedJobs'             : 'allAssignedJobs', //+ index++ + '.'
		'assignedJobsDiscontinued' : 'allAssignedJobsDiscontinued.', //+ index++ + '.'
		'assignedJobsDiscontinue'  : 'allAssignedJobsDiscontinueButton.', //+ index++ + '.'
		'assignedJobsAccept'       : 'allAssignedJobsAcceptButton.', //+ index++ + '.'
		'assignedJobsUndo'         : 'allAssignedJobsUndoButton.' //+ index++ + '.'
	},

	'allOpenJobsTab'  : {
    	'openJobsHeader'        : 'allOpenJobsHeader.',
    	'openJobsLabel'         : 'allOpenJobsLabel.',
    	'openJobs'              : 'allOpenJobs', //+ index++ + '.'
	    'openJobsDiscontinued'  : 'allOpenJobsDiscontinued.', //+ index++ + '.'
	    'openJobsDiscontinue'   : 'allOpenJobsDiscontinueButton.', //+ index++ + '.'
		'openJobsUpdateStatue'  : 'allOpenJobsAcceptButton.', //+ index++ + '.'
	},

	'allFutureJobsTab' : {
    	'futureHeader'           : 'allFutureHeader.',
        'futureJobs'             : 'allFutureJobs', //+ index++ + '.'
	    'futureJobsDiscontinued' : 'allFutureJobsDiscontinued.', //+ index++ + '.'
	    'futureJobsDiscontinue'  : 'allFutureJobsDiscontinueButton.', //+ index++ + '.'
		'futureJobsAccept'       : 'allFutureJobsAcceptButton.' //+ index++ + '.'
	},
    
    'otherOptions'  : {
		'myJobsTab'  : 'myJobsTabButton.',
		'allJobsTab' : 'allJobsTabButton.'
    }
}

exports.recentScreen = {
	'back'          : 'recentBackButton.',
	'savedTab'      : 'recentSavedTab.',
	'savedTabText'  : 'Recently Saved',
	'viewedTab'     : 'recentViewedTab.',
	'viewedTabText' : 'Recently Viewed',
	'recentNode'    : 'recentNode', // recentNode + # + .
	'search'        : 'recentSearch.',
	'view'          : 'View',
	'viewOnline'    : 'View Online'
}

exports.expiredTagsScreen = {

}

exports.workFormScreen = {
	// 'newRecord'		: 
	// 'showAll'		: formShowAllButton
	'search'			: 'search.'
}

exports.actionsScreen = {
	'clockOut'       : 'menuClockOutButton.',
	'clockIn'        : 'menuClockInButton.',
	'companyVehicle' : 'menuCompanyVehicleButton.',
	'drafts'         : 'menuDraftsButton.',  // x: 416, y: 848
	'photos'         : 'menuLocalPhotosButton.',
	'sync'           : 'menuRefreshSyncButton.',
	'logout'         : 'menuLogoutButton.',
	'about'          : 'menuAboutButton.', // x: 416, y: 1914
	'settings'       : 'menuSettingsButton.',
	'help'           : 'menuHelpButton.',
	'resetData'      : 'menuResetAllDataButton.',
	'route'          : 'menuRouteButton.',
	'sendDebug'      : 'menuSendDebugDataButton.'
}

exports.helpScreen = {
}

exports.topicScreen = {
	'back'       : 'topicBackButton.',
	'topicLabel' : 'topicLabel.',
	'topicDot'   : 'topicDot' //+ index + '.'
	'topicImage' : 'topicImage' //+ index + '.'
}

exports.aboutScreen = {

	'appVersion' : apps.appVersion,
	'back'       : 'aboutBackButton.',
	'logo'       : 'aboutScreenLogo.',
	'signedInto' : 'SignedIntoLabel.',
	'syncTime'   : 'lastSyncText.',   
	'terms'      : 'termsOfServiceButton.'
}

exports.settingsScreen = {
	'allowVideo'    : 'allowVideoUploadsButton.',
	'basicCamera'   : 'basicAndroidCameraButton.',
	'imageSize'     : 'resizeImagesButton.',
	'backgroundGps' : 'backgroundGpsButton.'
}

exports.draftsScreen = {
	'back'       : 'draftsBackButton.',
	'cancel'     : 'Cancel',
	'delete'     : 'Delete',
	'draft'      : 'draft', //Make sure you use getItem() from the commons.
	'edit'       : 'Edit',
	'noDrafts'   : 'No drafts have been saved',
	'search'     : 'draftSearch.',
	'view'       : 'View',
	
}

exports.inspectionRecord = {
   'driver'         : 'DriverField.',
   'truck'          : 'TruckField.',
   'odometer'       : 'Odometer ReadingField.',
   'defectItems'    : 'Defective ItemsField.',
   'remarks'        : 'RemarksField.',
   'resoulution'    : 'ResolutionField.',
   'safeToOperate'  : 'The vehicle is in safe operation condition.'
}

exports.bootRecord = {
	'account'             : 'AccountField.',
	'bootTime'            : 'Boot TimeField.',
	'violationsSelect'    : 'ViolationsField.',
		// Violation Options
	'violationsOption1'   : 'Manager Request.',
	'violationsOption2'   : 'Timed Parking.',
	'violationsOption3'   : 'No Overnight Parking.',
		//Violation Options Buttons
	'violationsDone'      : 'Done.',
	'violationsCancel'    : 'Cancel.',
	'driver'              : 'Driver.',
		// Driver Options
	'driver1'             : '- None -.',
	'driver2'             : 'Admin 1.',
	'driver3'             : 'Christ Test 1.',
	'driver4'             : 'Keith Simulator.',
	'driver5'             : 'Luke Simulator.',
	'driver6'             : 'Mike Android Other.',
		// Driver Options Buttons.
	'driverCancel'        : 'Cancel.'
}

exports.genTowRecord = {

}

exports.mobile_MikeRecord = {
   'mobileMike'        : 'Mobile_Mike', // + elements.homeScreen.button OR  + elements.homeScreen.plusButton
   'propertyRef'       : {
	   'property'      : 'PropertyField.',
    		'omadi'    : 'Omadi Inc'
    	},
	'otherFields'       : {
		'checkbox'         : 'CheckboxCheckbox.',
		'integerFieldCond' : 'Integer Field CondField0.',
   		'mobileMike'       : 'Mobile_Maike',
   		'textAreaCondReg'  : 'Text Area Cond ReqField0.',
   		'textFieldCond'    : 'Text Field CondField0.',
   		'textFieldReq'     : 'Text Field ReqField0.',
   		'licensePlate'     : 'License Plate #Field',
   		'licenseState'     : 'License Plate StateField.'

	}
}

exports.doNotTow = {
	'doNotTow'          : 'Do Not Tow', // + elements.homeScreen.button OR  + elements.homeScreen.plusButton
	'otherFields'       : {
		'licensePlate'  : 'License Plate #Field0.',
		'licenseState'  : 'License Plate StateField0.'
	} 
}

exports.ppiRecord = {

}

exports.patrolRecord = {

}

exports.dropFeeRecord = {

}

exports.relocationRecord = {

}

exports.serviceRecord = {

}

exports.tagRecord = {
	'tag'               : 'Tag', // + elements.homeScreen.button OR  + elements.homeScreen.plusButton
   'propertyRef'        : {
   		'property'      : 'AccountField0.',
			'omadi'     : 'Omadi Inc'
	},
	'otherFields'       : {
		'licensePlate'  : 'License Plate #Field0.',
		'licenseState'  : 'License Plate StateField0.'
	}
}

exports.contactRecord = {

}

exports.eventAssRecord == {

} 	

exports.propertyRecord = {

}

exports.taskRecord = {

}

exports.timeCardRecord = {

}

exports.permitRecord = {

}

exports.permitReqRecord = {

}

exports.checkpointRecord = {

}

exports.dispatchRecord = {

}