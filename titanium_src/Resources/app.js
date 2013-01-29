
(function(){"use strict";

   // To disable going to sleep in iOS
   Ti.App.idleTimerDisabled = true;
   
   var loginWindow = Ti.UI.createWindow({
      url: '/main_windows/login.js',
      navBarHidden: true,
      exitOnClose: true
   });
   loginWindow.open();
   
}());
