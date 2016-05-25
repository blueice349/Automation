 exports.loginScreen = {
	'client_account' : 'clientAccount.',
	'user_name'      : 'userName.',
	'password'       : 'password.',
	'accept_terms'   : 'acceptTermsCheckBox.',
	'login_button'   : 'logInButton.'
}	

//Run commands...
//mocha run.js -os androidDriver -time 500000

// exports.standardFields = {
// 	'extraPriceAutocomplete'   : 'Field Name_Field_#.'
// 	'extraPriceSelect'         : 'Field Name_Field_#.' & 'Undefinded for IOS'
// 	'extraPriceDetails'        : 'Field Name_Details_#.'
// 	'extraPricePrice'          : 'Field Name_Price_#.'
// 	'extraPriceQty'            : 'Field Name_Qty_#.'
// 	'extraPriceTotal'          : 'Field Name_Total_#.'
//     'buttons'                  : 'Field Name_Button.'
//     'checkbox'                 : 'Field Name_chkbox.'
//     'textFields'               : 'Field Name_Field_#.'
//     'autoComplete'             : 'Field Name_Field_#.'
//     'selectList'               : 'Field Name_Field_#.'
//     'multiSelect'              : 'Field Name_Field.'
//     'userSelect'               : 'Field Name_Field.' & 'Undefinded for IOS'
// }

exports.alertButtons = {
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
	'vehicle1'  : 'Truck 1',
	'review'    : 'Review',
	'no'        : 'No',
	'noVehicle' : '- No Vehicle -',
	'ok'        : 'OK'
}	

exports.homeScreen = {
	'actions'          : 'actions_Button.',
	'clockOut'         : 'mainMenuClockOut_Button',
	'clockIn'          : 'mainMenuClockIn_Button',
	'logout'           : 'logOut_Button.',
	'sync'             : 'refreshSync.',
	'name'             : 'userLoggedIn.',
	'plusButton'       : '_PlusButton.',
	'alerts'           : 'alerts_Button.',
	'jobs'             : 'jobs_Button.',
	'recent'           : 'recent_Button.',
	'syncStatus'       : 'syncProgress.',
	'syncAllowed'      : 'syncAllowed.',
	'syncInProgress'   : 'syncInProgress.',
	'expiredTags'      : 'tagsReady_Button.'
}

exports.formScreen = {
	'actions'         : 'formActions_Button.',
	'back'            : 'formBack_Button.',
	'cancel'          : 'Cancel',
	'comments'        : 'comments_Tab.',
	'dispatch'        : 'dispatch_Tab.',
	'newComment'      : 'newComment_Button.',
	'save'            : 'Save',	
	'saveAsDraft'      : 'Save as draft',
	'showAll'         : 'showAll_Button.',	
	'work'            : 'work_Tab.'
}	

exports.itemListScreen = {
	'back'       : 'itemListBack_Button.',
	'item'       : 'itemList_', //+ tableIndex + '.'	
	'titleLabel' : 'titleLabel.',
	'map'        : 'map_Button.',
	'nearMe'     : 'nearMe_Button.',
	'newRecord'  : 'new_Button.',
	'search'     : 'search.',
	'showAll'    : 'showAll_Button'
}

exports.multiSelectScreen = {
	'cancel' : 'cancel_Button.',
	'done'   : 'done_Button.',
	'header' : 'MultiSelect.',
	'item'   : 'item_' //+ index++ + '.'
}

exports.itemMapScreen = {
	'back'  : 'back_Button.'
}	

exports.nearMeScreen = {
	'back'    : 'back_Button.',
	'map'     : 'map_Button.',
	'refresh' : 'refresh_Button.'
}

exports.alertsScreen = {
	'back'   : 'alertsBack_Button.'

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

    'newJobsTab'               : {
    	'newJobsHeader'        : 'newJobsHeader.', //This is used for intianl sync.
    	'newJobsLabel'         : 'newJobs.',
		'newJobs'              : 'newJobs_', //+ index++ + '.'
		'newJobsDiscontinued'  : 'newJobsDiscontinued_' //+ index++ + '.'
    },

    'openJobsTab'  : {
    	'currentJobsHeader'      : 'currentJobsHeader.',
    	'dispatchJobsLabel'      : 'jobs_Button.',
    	'openJobs'               : 'openJobs_', //+ index++ + '.'
	    'openJobsDiscontinued'   : 'openJobsDiscontinued_' //+ index++ + '.'
    },

    'otherOpenJobsTab'                : {

    	'otherOpenJobsHeader'         : 'otherOpenJobsHeader.',
	    'otherOpenJobs'               : 'inProgressJobs_', //+ index++ + '.'
	    'otherOpenJobsDiscontinued'   : 'inProgressJobsDiscontinued_' //+ index++ + '.'
    },

    'appointmentJobsTab' : {
    	'appointmentsHeader'          : 'appointmentsHeader.',
        'appointmentJobs'             : 'appointmentJobs_', //+ index++ + '.'
	    'appointmentJobsDiscontinued' : 'appointmentJobsDiscontinued_' //+ index++ + '.'
    },

    'otherOptions'  : {
		'back'      : 'jobsBack_Button.'
    }
}

exports.recentScreen = {
	'back'        : 'recentBack_Button.',
	'saved_Tab'   : 'recentSavedTab.',
	// 'saved_Item'  : 
	'viewed_Tab'  : 'recentViewed_Tab.',
	// 'viewed_Item' : 
	'search'      : 'search.'
}

exports.expiredTagsScreen = {

}

exports.workFormScreen = {
	// 'newRecord'		: 
	// 'showAll'		:
	'search'			: 'search.'

}

exports.actionsScreen = {
	'clockOut'       : 'clockout_Button.',
	'clockIn'        : 'clockin_Button.',
	'companyVehicle' : 'companyVehicles_Button.',
	'back'           : 'actionsBack_Button.',
	'drafts'         : 'drafts_Button.',  // x: 416, y: 848
	'photos'         : 'photos_Button.',
	'sync'           : 'refreshSync_Button.',
	'logout'         : 'ActionsLogOut_Button.',
	'about'          : 'about_Button.', // x: 416, y: 1914
	'settings'       : 'settings_Button.',
	'resetData'      : 'resetAllData_Button.',
	'sendDebug'      : 'sendDebugData_Button.'
}

exports.aboutScreen = {
	'back'   : 'aboutBack_Button.',
	'terms'  : 'termsOfService.'
}

exports.settingsScreen = {
	'allowVideo'    : 'allowVideoUploads_Button.',
	'basicCamera'   : 'basicAndroidCamera_Button.',
	'imageSize'     : 'resizeImages_Button.',
	'backgroundGps' : 'backgroundGps_Button.'
}

exports.draftsScreen = {
	'back'   : 'draftsBack_Button.',   //'//UIAApplication[1]/UIAWindow[1]/UIAToolbar[1]/UIAButton[1]',
	'draft'  : 'draft_', //Make sure you use getItem() from the commons.
	'edit'   : 'Edit',
	'view'   : 'View',
	'delete' : 'Delete'
}

exports.inspectionRecord = {
   'driver'         : 'Driver_Field.',
   'truck'          : 'Truck_Field.',
   'odometer'       : 'Odometer Reading_Field.',
   'defectItems'    : 'Defective Items_Field.',
   'remarks'        : 'Remarks_Field.',
   'resoulution'    : 'Resolution_Field.',
   'safeToOperate'  : 'The vehicle is in safe operation condition.'
}

exports.bootRecord = {
	'account'             : 'Account_Field.',
	'bootTime'            : 'Boot Time_Field.',
	'violations_select'   : 'Violations_Field.',
		// Violation Options
	'violations_option1'  : 'Manager Request.',
	'violations_option2'  : 'Timed Parking.',
	'violations_option3'  : 'No Overnight Parking.',
		//Violation Options Buttons
	'violations_done'     : 'Done.',
	'violations_cancel'   : 'Cancel.',
	'driver'              : 'Driver.',
		// Driver Options
	'driver1'             : '- None -.',
	'driver2'             : 'Admin 1.',
	'driver3'             : 'Christ Test 1.',
	'driver4'             : 'Keith Simulator.',
	'driver5'             : 'Luke Simulator.',
	'driver6'             : 'Mike Android Other.',
		// Driver Options Buttons.
	'driver_cancel'       : 'Cancel.'
}

exports.genTowRecord = {

}

exports.mobile_MikeRecord = {
   'mobileMike'        : 'Mobile_Mike',
   'propertyRef'       : {
	   'property'      : 'Property_Field_',
    		'omadi'    : 'Omadi Inc'
    	},
	'otherFields'       : {
   		'mobileMike'    : 'Mobile_Mike',
   		'textFieldCond' : 'Text Field Cond_Field_0.',
   		'textFieldReq'  : 'Text Field Req_Field_0.',
   		'licensePlate'  : 'License Plate #_Field_',
   		'licenseState'  : 'License Plate State_Field_.'
	}
}

exports.doNotTow = {
	'doNotTow'          : 'Do Not Tow',
	'otherFields'       : {
		'licensePlate'  : 'License Plate #_Field_0.',
		'licenseState'  : 'License Plate State_Field_0.'
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
	'tag'               : 'Tag',
   'propertyRef'        : {
   		'property'      : 'Account_Field_0.',
			'omadi'     : 'Omadi Inc'
	},
	'otherFields'       : {
		'licensePlate'  : 'License Plate #_Field_0.',
		'licenseState'  : 'License Plate State_Field_0.'
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