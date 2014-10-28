var AndroidBackground = require('lib/android/AndroidBackground');

Omadi.background = Omadi.background || {};

Omadi.background.android = {};


Omadi.background.android.startGPSService = function(){"use strict";
    AndroidBackground.startGPSService();
};


Omadi.background.android.stopGPSService = function(){"use strict";
    AndroidBackground.stopGPSService();
};


Omadi.background.android.startUpdateServiceAlarm = function(){"use strict";
   AndroidBackground.startUpdateServiceAlarm();
};

Omadi.background.android.startUpdateService = function(){"use strict";
    AndroidBackground.startUpdateService();
};

Omadi.background.android.stopUpdateService = function(){"use strict";
    AndroidBackground.stopUpdateService();
};
