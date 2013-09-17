
(function(){"use strict";
   var loginWindow, startMillis;
   
   // To disable going to sleep in iOS
   Ti.App.idleTimerDisabled = true;
   
   startMillis = (new Date()).getTime();
   
   Ti.App.Properties.setDouble('omadi:appStartMillis', startMillis);
   
   loginWindow = Ti.UI.createWindow({
      url: '/main_windows/login.js',
      navBarHidden: true,
      exitOnClose: true,
      appStartMillis: startMillis
   });
   loginWindow.open();
   
}());
