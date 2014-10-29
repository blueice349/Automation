// This file is part of credit_card_track_parser.  Copyright 2010 Joshua Partlow.  This program is free software, licensed under the terms of the GNU General Public License.  Please see the LICENSE file in this distribution for more information, or see http://www.gnu.org/copyleft/gpl.html.
/*jslint node:true */
'use strict';

/* TrackErrors()
 * 
 * Constructor for TrackeErrors objects.  A TrackErrors object provides simple
 * mechanics for adding error messages related to different fields, counting the
 * total fields with errors, and retrieving a hash of the messages.
 *
 *   var errors = new TrackErrors()
 *   errors.add('foo', 'is broken')
 *   errors.add('bar', 'is also broken')
 *   errors.add('bar', 'and looks funny')
 *   errors.count() // -> 2
 *   errors.messages() // -> { 'foo' : ['is broken'], 'bar' : ['is also broken', 'and looks funny'] }
 */
function TrackErrors() {"use strict";
  this.errors = {};
} 

TrackErrors.prototype = {
  add : function(field, message) {"use strict";
    if (typeof this.errors[field] === 'undefined') {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  },
 
  count : function() {"use strict";
    var count = 0, field;
    for (field in this.errors) {
        if(this.errors.hasOwnProperty(field)){
            count += 1;
        }   
    }
    return count;
  },

  messages : function() {"use strict";
    return this.errors;
  }
};

exports.TrackErrors = TrackErrors;

/* CreditCardTrackData()
 *
 * Constructor for CreditCardTrackData objects.  Takes one argument which should be a string of
 * track data as returned by a card reader (see http://en.wikipedia.org/wiki/Magnetic_stripe_card 
 * for information about the format of track data).
 * 
 * A CreditCardTrackData object can be used to parse a string of card data into strings for:
 * 
 * * format_code
 * * number
 * * expiration
 * * last_name
 * * first_name
 * * service_code
 *
 * It can also check the validity of the track data and parse out month and year from the
 * expiration date.
 *  
 */
function CreditCardTrackData(track_data) {"use strict";
  this.fields = ['format_code', 'number', 'expiration', 'last_name', 'first_name', 'service_code'];
  this.track_data = track_data;
  this.parse();
  this.CENTURY = "20";
}

CreditCardTrackData.prototype = {
  parse : function() {"use strict";
    var track1_raw, track2_raw, track1_match_data, track2_match_data;
    
    this.tracks_match_data = this.track_data.match(/^.*B(\d+)\^(.+)\/(.+)\^(.{4})(.{3})(.*)$/);
    if (this.tracks_match_data == null) {
      throw("Not a Valid Card");
    }
    
    this.track1 = {
      match_data : this.tracks_match_data,
      number : this.tracks_match_data[1],
      last_name : this.tracks_match_data[2],
      first_name : this.tracks_match_data[3],
      expiration : this.tracks_match_data[4],
      service_code : this.tracks_match_data[5],
      discretionary : this.tracks_match_data[6]
    };
    
    // Only allow numbers in the number field
    this.number = this.track1.number.replace(/[^0-9]/g, '');
    this.expiration = this.track1.expiration;
    this.last_name = this.track1.last_name;
    this.first_name = this.track1.first_name;
    this.service_code = this.track1.service_code;
  },

  year : function() {"use strict";
    if (this.expiration) {
      return this.CENTURY + this.expiration.slice(0,2);
    }
  },

  month : function() {"use strict";
    if (this.expiration) {
      return this.expiration.slice(2,4);
    }
  },
  
  is_expired : function(){"use strict";
      var nowYear, ccYear, nowMonth, ccMonth, now = new Date(), isExpired = false;
      
      nowMonth = now.getMonth() + 1;
      nowYear = now.getYear();
      
      ccYear = parseInt(this.year, 10);
      ccMonth = parseInt(this.month, 10);
      
      if(ccYear < nowYear){
          isExpired = true;
      }
      else if(ccYear == nowYear){
          if(ccMonth < nowMonth){
              isExpired = true;
          }
      }
      
      return isExpired;
  },
  
  is_card_valid : function() {"use strict";
    var isValid = true;
    
    if(typeof this.number === 'undefined'){
        Ti.API.error("CC Number is undefined");
        isValid = false;
    }
    else if(typeof this.number.length < 15){
        Ti.API.error("CC number is less than 15 chars");
        isValid = false;
    }
    else if(!this.passes_luhn()){
        Ti.API.error("Did not pass Luhn Test");
        isValid = false;
    }
    else if(this.is_expired()){
        Ti.API.error("Card is expired");
        isValid = false;
    }
    
    return isValid;
  },
  
  passes_luhn : function(){"use strict";
    var value = this.number, n, cDigit, nCheck = 0, nDigit = 0, bEven = false;
 
    for (n = value.length - 1; n >= 0; n--) {
        cDigit = value.charAt(n);
        nDigit = parseInt(cDigit, 10);
 
        if (bEven) {
            if ((nDigit *= 2) > 9) {
                nDigit -= 9;
            }
        }
 
        nCheck += nDigit;
        bEven = !bEven;
    }
 
    return (nCheck % 10) == 0;
  }
};

exports.TrackData = CreditCardTrackData;