
(function(){"use strict";
   // To disable going to sleep in iOS
   Ti.App.idleTimerDisabled = true;
   
   var loginWindow = Ti.UI.createWindow({
      url: '/main_windows/login.js',
      navBarHidden: true,
      fullScreen: false,
      exitOnClose: true,
      orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT, Ti.UI.UPSIDE_PORTRAIT],
      title: 'Omadi Login'
   });
   
   loginWindow.open();
   
}());
