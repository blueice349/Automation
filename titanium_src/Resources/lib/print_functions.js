/*jslint eqeq:true,plusplus:true*/

Omadi.print = {};

Omadi.print.StarMicronics = null;
Omadi.print.printNid = null;

Omadi.print.commands = {};

Omadi.print.init = function(){"use strict";
    if(Omadi.print.StarMicronics === null){
        Omadi.print.StarMicronics = require('com.omadi.starmicronics');
    }
};

Omadi.print.canPrintReceipt = function(nid){"use strict";
    var bundle, node;
    
    node = Omadi.data.nodeLoad(nid);
    
    bundle = Omadi.data.getBundle(node.type);
    
    if(bundle && 
        typeof bundle.data !== 'undefined' &&
        typeof bundle.data.mobile_printer !== 'undefined' &&
        typeof bundle.data.mobile_printer.receipt !== 'undefined' &&
        typeof bundle.data.mobile_printer.receipt.items !== 'undefined' &&
        Omadi.utils.isArray(bundle.data.mobile_printer.receipt.items) &&
        bundle.data.mobile_printer.receipt.items.length > 0){
            
            return true;       
    }
    
    return false;
};

Omadi.print.selectPrinter = function(){"use strict";
    
    Omadi.print.StarMicronics.getBluetoothDeviceList({
       success: function(e){
           var i, dialog, portNames;
           Ti.API.debug(JSON.stringify(e.portNames));
           
           portNames = [];
           for(i = 0; i < e.portNames.length; i ++){
               portNames.push(e.portNames[i].replace("BT:", ""));
           }
           portNames.push("- Cancel -");
           
           dialog = Ti.UI.createOptionDialog({
              options: portNames,
              title: 'Select Printer',
              cancel: portNames.length - 1,
              origPortNames: e.portNames
           });
           
           dialog.addEventListener('click', function(e){
              if(e.index >= 0 && e.index != e.source.cancel){
                  Omadi.print.openConnection(e.source.origPortNames[e.index]);
              } 
           });
           
           dialog.show();
       },
       error: function(e){
           Ti.API.error("Error selecting a printer: " + e.error);
           alert(e.error);
       }
    });  
};

Omadi.print.openConnection = function(portName){"use strict";

    Ti.API.info("Connecting to Printer: " + portName);
    
    Omadi.print.StarMicronics.openPort({
       portName: portName,
       success: function(e){
           alert("success opening port");
           
           
           Omadi.print.sendPrintCommands();
           //Omadi.print.closeConnection();
       },
       error: function(e){
           alert("Could not connect to printer: " + e.error);
       }
    });
};

Omadi.print.closeConnection = function(){"use strict";

    Ti.API.info("Closing connection to Printer");
    
    Omadi.print.StarMicronics.releasePort({
       success: function(e){
           alert("success closing port");
       },
       error: function(e){
           alert("Could not disconnect from printer: " + e.error);
       }
    });  
};



Omadi.print.getPrintCommands = function(){"use strict";
    var node, bundle, i, item, buffer, items;
    
    node = Omadi.data.nodeLoad(Omadi.print.printNid);
    bundle = Omadi.data.getBundle(node.type);
    
    buffer = Ti.createBuffer({
        type: Ti.Codec.TYPE_BYTE,
        length: 4
    });
    
    // Setup page ???
    buffer[0] = 0x1d;
    buffer[1] = 0x57;
    buffer[2] = 0x40;
    buffer[3] = 0x32;
    
    Ti.API.debug(bundle.data.mobile_printer.receipt.items);
    
    items = bundle.data.mobile_printer.receipt.items.sort(Omadi.utils.sortByWeight);
    
    for(i = 0; i < items.length; i ++){
        item = items[i];
        
        buffer.append(Omadi.print.getPrintCommand(node, item));
    }
    
    // Add 5 new lines so the page can be ripped off properly
    buffer.append(Omadi.print.stringToByteArray("\n\n\n"));
    
    return buffer;
};


Omadi.print.getPrintCommand = function(node, item){"use strict";
    var buffer;
    
    buffer = Ti.createBuffer({
        type: Ti.Codec.TYPE_BYTE
    });
    
    if(typeof item.settings !== 'undefined'){
        if(typeof item.settings.alignment !== 'undefined'){
            buffer.append(Omadi.print.commands.textAlignment(item.settings.alignment));
        }
        
        if(typeof item.settings.size !== 'undefined'){
            buffer.append(Omadi.print.commands.size(parseInt(item.settings.size, 10)));
        }
        else{
            buffer.append(Omadi.print.commands.size(0));   
        }
        
        if(typeof item.settings.style !== 'undefined'){
            if(typeof item.settings.style.bold !== 'undefined' && item.settings.style.bold == 'bold'){
                buffer.append(Omadi.print.commands.bold(true));
            }
            else{
                buffer.append(Omadi.print.commands.bold(false));   
            }
            
            if(typeof item.settings.style.invert_color !== 'undefined' && item.settings.style.invert_color == 'invert_color'){
                buffer.append(Omadi.print.commands.invertColor(true));
            }
            else{
                buffer.append(Omadi.print.commands.invertColor(false));   
            }
            
            if(typeof item.settings.style.upside_down !== 'undefined' && item.settings.style.upside_down == 'upside_down'){
                buffer.append(Omadi.print.commands.upsideDown(true));
            }
            else{
                buffer.append(Omadi.print.commands.upsideDown(false));   
            }
            
            if(typeof item.settings.style.thick_underline !== 'undefined' && item.settings.style.thick_underline == 'thick_underline'){
                buffer.append(Omadi.print.commands.underline(2));
            }
            else if(typeof item.settings.style.underline !== 'undefined' && item.settings.style.underline == 'underline'){
                buffer.append(Omadi.print.commands.underline(1));
            }
            else{
                buffer.append(Omadi.print.commands.underline(0));   
            }
        }
    }
    
    if(item.type == 'line' || item.type == 'area'){
        if(typeof item.value !== 'undefined'){
            buffer.append(Omadi.print.stringToByteArray(item.value + "\n"));
        }
    }
    
    return buffer;
};

Omadi.print.commands.textAlignment = function(align){"use strict";
    var buffer = Ti.createBuffer({
       type: Ti.Codec.TYPE_BYTE,
       length: 3 
    });
    
    buffer[0] = 0x1b;
    buffer[1] = 0x61;
    
    if(align == 'center'){
        
        buffer[2] = 0x1;
    }
    else if(align == 'right'){
        buffer[2] = 0x2;
    }
    else{// Default to left
        buffer[2] = 0x0;
    }
    
    return buffer;
};

Omadi.print.commands.bold = function(bold){"use strict";
    var buffer = Ti.createBuffer({
       type: Ti.Codec.TYPE_BYTE,
       length: 3 
    });
    
    buffer[0] = 0x1b;
    buffer[1] = 0x45;
    
    if(bold == 1){
        buffer[2] = 0x1;
    }
    else{// Default to off
        buffer[2] = 0x0;
    }
    
    return buffer;
};

Omadi.print.commands.underline = function(underline){"use strict";
    var buffer = Ti.createBuffer({
       type: Ti.Codec.TYPE_BYTE,
       length: 3 
    });
    
    buffer[0] = 0x1b;
    buffer[1] = 0x2d;
    buffer[2] = underline;
    
    return buffer;
};

Omadi.print.commands.size = function(size){"use strict";
    var hex, buffer = Ti.createBuffer({
       type: Ti.Codec.TYPE_BYTE,
       length: 3 
    });
    
    buffer[0] = 0x1d;
    buffer[1] = 0x21;
    switch(size){
        case 1:
            hex = 0x11; break;
        case 2:
            hex = 0x22; break;
        case 3:
            hex = 0x33; break;
        case 4:
            hex = 0x44; break;
        case 5:
            hex = 0x55; break;
        case 6:
            hex = 0x66; break;
        case 7:
            hex = 0x77; break;
        default:
            hex = 0;
    }
    buffer[2] = hex;
    
    return buffer;
};


Omadi.print.commands.invertColor = function(invert){"use strict";
    var buffer = Ti.createBuffer({
       type: Ti.Codec.TYPE_BYTE,
       length: 3 
    });
    
    buffer[0] = 0x1d;
    buffer[1] = 0x42;
    
    if(invert == 1){
        buffer[2] = 0x1;
    }
    else{// Default to off
        buffer[2] = 0x0;
    }
    
    return buffer;
};

Omadi.print.commands.upsideDown = function(upsideDown){"use strict";
    var buffer = Ti.createBuffer({
       type: Ti.Codec.TYPE_BYTE,
       length: 3 
    });
    
    buffer[0] = 0x1b;
    buffer[1] = 0x7b;
    
    if(upsideDown == 1){
        buffer[2] = 0x1;
    }
    else{// Default to off
        buffer[2] = 0x0;
    }
    
    return buffer;
};

Omadi.print.stringToByteArray = function(str){"use strict";
    var buffer, i;
    
    buffer = Ti.createBuffer({
        type: Ti.Codec.TYPE_BYTE,
        length: str.length 
    });
    
    for(i = 0; i < str.length; i ++){
        buffer[i] = str.charCodeAt(i);
    }
    
    return buffer;
};

Omadi.print.printReceipt = function(nid){"use strict";
    var commands;
    
    Omadi.print.printNid = nid;
    
    commands = Omadi.print.getPrintCommands();
    
    
    
    Ti.API.debug("Command");
    Ti.API.debug(commands);
    
    if(Ti.App.isAndroid){
        Omadi.print.init();
        
        Omadi.print.StarMicronics.print({
            success: function(e){
                
            },
            error: function(e){
                alert("Error Printing: " + e.error);
            },
            portName: "BT:Star Micronics",
            commands: commands
        });
    }
    
    //Omadi.print.init();
    
    //Omadi.print.selectPrinter();
};
