
(function(){"use strict";
   var loginWindow, startMillis;
   
   // To disable going to sleep in iOS
   Ti.App.idleTimerDisabled = true;
   
   loginWindow = Ti.UI.createWindow({
      url: '/main_windows/login.js',
      fullScreen: false,
      exitOnClose: true,
      orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT]
   });
   loginWindow.open();
   
}());
