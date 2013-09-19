
(function(){"use strict";
   var loginWindow, startMillis;
   
   // To disable going to sleep in iOS
   Ti.App.idleTimerDisabled = true;
   
   loginWindow = Ti.UI.createWindow({
      url: '/main_windows/login.js',
      navBarHidden: true,
      exitOnClose: true
   });
   loginWindow.open();
   
}());
