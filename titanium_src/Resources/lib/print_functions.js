/*jslint eqeq:true,plusplus:true*/

Ti.include('/lib/CC_functions.js');

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
    var bundle, node, retval, allowAtPart;
    
    retval = false;
    
    node = Omadi.data.nodeLoad(nid);
    
    bundle = Omadi.data.getBundle(node.type);
    
    Ti.API.debug(JSON.stringify(bundle));
    
    if(bundle && 
        typeof bundle.data !== 'undefined' &&
        typeof bundle.data.mobile_printer !== 'undefined' &&
        typeof bundle.data.mobile_printer.receipt !== 'undefined' &&
        typeof bundle.data.mobile_printer.receipt.items !== 'undefined' &&
        Omadi.utils.isArray(bundle.data.mobile_printer.receipt.items) &&
        bundle.data.mobile_printer.receipt.items.length > 0){
            
            
            // Make sure enough data is saved to be able to print the receipt
            if(typeof bundle.data.mobile_printer.allow_at_part !== 'undefined'){
                allowAtPart = parseInt(bundle.data.mobile_printer.allow_at_part, 10);
                if(node.form_part >= allowAtPart){
                    retval = true;
                }
            }
            else{
                // The form can be printed during any part
                retval = true;
            }     
    }
    
    return retval;
};

Omadi.print.onLogoutPrint = function(){"use strict";
    // Clear the saved port Name 
    Ti.App.Properties.setString("omadi:printerPortName", "");
};

(function(){"use strict";
    
    Ti.App.removeEventListener('loggingOut', Omadi.print.onLogoutPrint);
    Ti.App.addEventListener('loggingOut', Omadi.print.onLogoutPrint);
}());

Omadi.print.doCharge = function(e){"use strict";
    /*global CreditCartTrackData*/
    alert("Successful card read.");
    Ti.API.debug(e.cardData);
    
    var trackData;
    
    try{
        trackData = new CreditCardTrackData(e.cardData);
        
        Ti.API.debug(JSON.stringify(trackData));
        
        if(trackData.is_card_valid()){
            alert("Now send to CMS");
        }
        else{
            alert("Card is not valid");
        }
    }
    catch(ex){
        Ti.API.error("Problem with card: " + ex);
        alert("A problem occurred with the card: " + ex);
    }
};

Omadi.print.cancelCharge = function(e){"use strict";
    
    Omadi.display.loading("Cancelling...");
    Omadi.print.StarMicronics.mcrCancel({
        success: function(e){
            Omadi.display.doneLoading();
            Ti.API.debug("Charge successfully cancelled.");
        },
        error: function(e){
            Omadi.display.doneLoading();
            Ti.API.debug("Error cancelling: " + e.error);
        }
    });  
};

Omadi.print.startMCRMode = function(portName){"use strict";
    
    Omadi.display.loading("Connecting...");
    
    Omadi.print.StarMicronics.mcrMode({
        success: function(e){
            
            Omadi.display.doneLoading();
            
            var dialog = Ti.UI.createAlertDialog({
                title: 'Swipe Card',
                message: 'Press done after card was read successfully.',
                buttonNames: ['Done', 'Cancel'],
                cancel: 1
            });
            
            dialog.addEventListener('click', function(e){
                 if(e.index === 0){
                     Omadi.print.StarMicronics.readPort({
                        success: Omadi.print.doCharge,
                        error: function(e){
                            alert("Error reading card data: " + e.error);
                        }
                     });
                 }
                 else{
                     Omadi.print.cancelCharge();
                 }
            });
            dialog.show();
        },
        error: function(e){
            Omadi.display.doneLoading();
            
            alert("Error enabling Card Reader: " + e.error);
        },
        portName: portName
    });  
};

Omadi.print.chargeCard = function(nid){"use strict";
    var portName, commands;
    
    Omadi.print.printNid = nid;
    
    if(Ti.App.isAndroid){
    
        Omadi.print.init();
        
        portName = Ti.App.Properties.getString("omadi:printerPortName", "");
        
        if(portName == ""){
        
            Omadi.print.StarMicronics.getBluetoothDeviceList({
               success: function(e){
                   var i, dialog, portNames;
                  
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
                       var portName, commands;
                       if(e.index >= 0 && e.index != e.source.cancel){
                            portName = e.source.origPortNames[e.index];
                            
                            Ti.App.Properties.setString("omadi:printerPortName", portName);
                            
                            Omadi.print.startMCRMode(portName);
                        }
                   });
                   
                   dialog.show();
               },
               error: function(e){
                   Ti.API.error("Error selecting a printer: " + e.error);
                   alert("Error selecting a printer: " + e.error);
               }
            });  
        }
        else{                  
            Omadi.print.startMCRMode(portName);
        }
    }
};

Omadi.print.printImages = [];

Omadi.print.printReceipt = function(nid){"use strict";
    var portName, commands;
    
    Omadi.print.printNid = nid;
    
    
    Omadi.print.init();
    
    portName = Ti.App.Properties.getString("omadi:printerPortName", "");
    
    if(portName == ""){
        Ti.API.debug("About to get bluetooth device list!");
        
        Omadi.print.StarMicronics.getBluetoothDeviceList({
           success: function(e){
               Ti.API.debug("Success getting printer list");
               
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
                   var portName, commands;
                   if(e.index >= 0 && e.index != e.source.cancel){
                        portName = e.source.origPortNames[e.index];
                        
                        Ti.App.Properties.setString("omadi:printerPortName", portName);
                        
                        Ti.API.debug("about to get commands");
                        commands = Omadi.print.getPrintCommands();
                        
                        Ti.API.debug("just got commands");
                        if(commands.length > 0){
                            
                            Omadi.print.StarMicronics.print({
                                success: function(e){
                                    //alert("Printing Successful.");
                                },
                                error: function(e){
                                    alert("Error Printing: " + e.error);
                                },
                                portName: portName,
                                commands: commands,
                                images: Omadi.print.printImages
                            });
                        }
                        else{
                            alert("An error occurred generating the receipt.");
                        }
                    } 
               });
               
               dialog.show();
           },
           error: function(e){
               Ti.API.error("Error selecting a printer: " + e.error);
               alert("Error selecting a printer: " + e.error);
           }
        });  
    }
    else{
        Ti.API.debug("about to get commands 2");
        commands = Omadi.print.getPrintCommands();
                   Ti.API.debug("just got commands 2");     
        if(commands.length > 0){
            
            Omadi.print.StarMicronics.print({
                success: function(e){
                    //alert("Printing Successful.");
                },
                error: function(e){
                    alert("Error Printing: " + e.error + ".");
                },
                portName: portName,
                commands: commands,
                images: Omadi.print.printImages
            });
        }
        else{
            alert("An error occurred generating the receipt.");
        }
    }
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
    var node, bundle, i, item, buffer, items, instances, fieldNames, 
        fieldName, isImage, imageData, nativePath, imageFile, imagePath, isSignature;
    
    node = Omadi.data.nodeLoad(Omadi.print.printNid);
    bundle = Omadi.data.getBundle(node.type);
    
    
    Omadi.print.printImages = [];
    
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
    
    instances = Omadi.data.getFields(node.type);
    
    for(i = 0; i < items.length; i ++){
        item = items[i];
        isImage = false;
        isSignature = false;
        
        if(typeof item.value !== 'undefined'){
            
            if(item.type == 'value'){
                fieldNames = item.value.split('|');
                fieldName = fieldNames[1];
                
                if(fieldNames[0] == 'null'){    
                    
                    if(typeof instances[fieldName] !== 'undefined'){
                        
                       if(instances[fieldName].type == 'image'){
                           isImage = true;
                           
                           if(instances[fieldName].widget.type == 'omadi_image_signature'){
                               isSignature = true;
                           }
                       }      
                    }
                }
                // TODO: add the fieldName[0] != null
            }
            
            if(isImage){
                Ti.API.debug("We have an image.");
                
                imagePath = Omadi.data.getFinishedUploadPath(node.nid, fieldName, 0);
                if(imagePath){
                    Ti.API.debug("Image path: " + imagePath);
                    
                    imageFile = Ti.Filesystem.getFile(imagePath);
                    
                    if(imageFile.exists()){
                        Ti.API.debug("Path: " + imageFile.resolve());
                        
                        imageData = {
                            path: imagePath.replace("file://", ""),
                            bufferIndex: buffer.length,
                            width: 575
                        };
                        
                        Omadi.print.printImages.push(imageData);
                    }
                    else{
                        Ti.API.error("file does not exist.");
                        
                        if(isSignature){
                            buffer.append(Omadi.print.stringToByteArray(Omadi.print.getSignaturePrintText(instances[fieldName])));
                        }
                    }
                }
                else{
                    
                    if(isSignature){
                        buffer.append(Omadi.print.stringToByteArray(Omadi.print.getSignaturePrintText(instances[fieldName])));
                    }
                     Ti.API.error("file not on device.");
                }
            }
            else{
                Ti.API.debug("We have something: " + item.value);
                buffer.append(Omadi.print.getPrintCommand(node, item));   
            }
        }
    }
    
    // Add 4 new lines so the page can be ripped off properly
    buffer.append(Omadi.print.stringToByteArray("\n\n\n\n"));
    
    return buffer;
};

Omadi.print.getSignaturePrintText = function(instance){"use strict";
    var output = "";
    
    if(typeof instance.settings.signature_text !== 'undefined' && 
            instance.settings.signature_text.length != null && 
            instance.settings.signature_text.length != ""){
        
        output += instance.settings.signature_text;         
    }
    
    output += "\n\n\n\n";
    output += "X_______________________________________________";
    output += "\n";
    
    return output;
};


Omadi.print.getPrintCommand = function(node, item){"use strict";
    var buffer, addLineBreak, stringValue, styleBuffer;
    
    addLineBreak = true;
    styleBuffer = Ti.createBuffer({
        type: Ti.Codec.TYPE_BYTE 
    });
    
    buffer = Ti.createBuffer({
        type: Ti.Codec.TYPE_BYTE
    });
    
    if(typeof item.settings !== 'undefined'){
        if(typeof item.settings.alignment !== 'undefined'){
            // Always put this in the regular buffer - not styleBuffer - as it is used for the entire line
            buffer.append(Omadi.print.commands.textAlignment(item.settings.alignment));
        }
        
        if(typeof item.settings.size !== 'undefined'){
            styleBuffer.append(Omadi.print.commands.size(parseInt(item.settings.size, 10)));
        }
        else{
            styleBuffer.append(Omadi.print.commands.size(0));   
        }
        
        if(typeof item.settings.style !== 'undefined'){
            if(typeof item.settings.style.bold !== 'undefined' && item.settings.style.bold == 'bold'){
                styleBuffer.append(Omadi.print.commands.bold(true));
            }
            else{
                styleBuffer.append(Omadi.print.commands.bold(false));   
            }
            
            if(typeof item.settings.style.invert_color !== 'undefined' && item.settings.style.invert_color == 'invert_color'){
                styleBuffer.append(Omadi.print.commands.invertColor(true));
            }
            else{
                styleBuffer.append(Omadi.print.commands.invertColor(false));   
            }
            
            if(typeof item.settings.style.upside_down !== 'undefined' && item.settings.style.upside_down == 'upside_down'){
                styleBuffer.append(Omadi.print.commands.upsideDown(true));
            }
            else{
                styleBuffer.append(Omadi.print.commands.upsideDown(false));   
            }
            
            if(typeof item.settings.style.thick_underline !== 'undefined' && item.settings.style.thick_underline == 'thick_underline'){
                styleBuffer.append(Omadi.print.commands.underline(2));
            }
            else if(typeof item.settings.style.underline !== 'undefined' && item.settings.style.underline == 'underline'){
                styleBuffer.append(Omadi.print.commands.underline(1));
            }
            else{
                styleBuffer.append(Omadi.print.commands.underline(0));   
            }
            
            if(typeof item.settings.style.no_line_break !== 'undefined' && item.settings.style.no_line_break == 'no_line_break'){
                addLineBreak = false;
            }
        }
    }
    
    if(item.type == 'line' || item.type == 'area'){
        if(typeof item.value !== 'undefined'){
            
            stringValue = item.value;
            if(addLineBreak){
                stringValue += "\n";
            }
            // Do not add the space like is done with the value item
            buffer.append(styleBuffer);
            buffer.append(Omadi.print.stringToByteArray(stringValue));
        }
    }
    else if(item.type == 'value'){
        if(typeof item.value !== 'undefined'){
            
           
            stringValue = Omadi.print.getValue(item.value, node);
            
            if(addLineBreak){
                stringValue += "\n";
            }
            else{
                stringValue += " ";
            }
            
            buffer.append(styleBuffer);
            buffer.append(Omadi.print.stringToByteArray(stringValue));
        }
    }
    else if(item.type == 'item'){
        if(typeof item.value !== 'undefined'){
            var labels, values, maxLabelLength, maxValueLength, innerItem, index, labelValue,
                lineLength, extraSpaces, i, label, value, numLabelSpaces, labelSpaces, j,
                numValueSpaces, valueSpaces, valueValue, itemValue, resetBuffer, innerItems;
            
            resetBuffer = Ti.createBuffer({
                type: Ti.Codec.TYPE_BYTE 
            });
            
            Ti.API.debug("before reset buffer");
            
            resetBuffer.append(Omadi.print.commands.size(0));   
            resetBuffer.append(Omadi.print.commands.bold(false));
            resetBuffer.append(Omadi.print.commands.invertColor(false)); 
            resetBuffer.append(Omadi.print.commands.upsideDown(false)); 
            resetBuffer.append(Omadi.print.commands.underline(0));    
            
            Ti.API.debug("After reset buffer");
            
            labels = [];
            values = [];
            maxLabelLength = maxValueLength = 0;
            
            if(Omadi.utils.isArray(item.value)){
                innerItems = item.value.sort(Omadi.utils.sortByWeight);
                
                for(index in innerItems){
                    if(innerItems.hasOwnProperty(index)){
                        innerItem = innerItems[index];
                        
                        valueValue = Omadi.print.getValue(innerItem.value, node).toString();
                        labelValue = innerItem.label.toString();
                            
                        if(valueValue.length > maxValueLength){
                            maxValueLength = valueValue.length;
                        }
                        
                        if(labelValue.length > maxLabelLength){
                            maxLabelLength = labelValue.length;
                        }
                        
                        labels.push(labelValue);
                        values.push(valueValue);
                    }
                }
                
                lineLength = 48;
                extraSpaces = 3;
                
                if(typeof item.settings.alignment !== 'undefined'){
                    if(item.settings.alignment == 'justify'){
                        if(item.settings.size == 0){
                            extraSpaces = lineLength - maxLabelLength - maxValueLength;
                        }
                        else if(item.settings.size == 1){
                            extraSpaces = lineLength - maxLabelLength - (maxValueLength * 2);
                        }
                    }
                }
                
                stringValue = "";
                
                for(i = 0; i < labels.length; i ++){
    
                    label = labels[i].toString();
                    value = values[i].toString();
                    
                    numLabelSpaces = maxLabelLength - label.length + extraSpaces;
                    
                    labelSpaces = "";
                    for(j = 0; j < numLabelSpaces; j ++){
                        labelSpaces += " ";
                    }
                    
                    numValueSpaces = maxValueLength - value.length;
                    
                    valueSpaces = "";
                    for(j = 0; j < numValueSpaces; j ++){
                        valueSpaces += " ";
                    }
                    
                    buffer.append(resetBuffer);
                    
                    buffer.append(Omadi.print.stringToByteArray(label + labelSpaces));
                    
                    if(valueSpaces.length > 0){
                        buffer.append(Omadi.print.stringToByteArray(valueSpaces));
                    }
                    
                    if(styleBuffer.length > 0){
                        buffer.append(styleBuffer);
                    }
                    
                    buffer.append(Omadi.print.stringToByteArray(value + "\n"));
                    
                    Ti.API.debug(label + labelSpaces + valueSpaces + value);
                }
            }
        }
    }
    
    return buffer;
};

Omadi.print.getValue = function(fieldOption, node){"use strict";
    var fieldNames, fieldName, stringValue, referenceField, i,
        referenceNode, instances, instance, parts, partFieldName;
    
    fieldNames = fieldOption.split('|');
    fieldName = fieldNames[1];
    stringValue = "";
    
    if(fieldNames[0] == 'null'){    
        instances = Omadi.data.getFields(node.type);
        
        if(typeof instances[fieldName] !== 'undefined'){
            instance = instances[fieldName];
            stringValue = Omadi.print.getTextValue(node, instance);          
        }
    }
    else{
        referenceField = fieldNames[0];
        if(typeof node[referenceField] !== 'undefined' && 
            typeof node[referenceField].dbValues !== 'undefined' &&
            typeof node[referenceField].dbValues[0] != 'undefined'){
                
                referenceNode = Omadi.data.nodeLoad(node[referenceField].dbValues[0]);   
                
                if(referenceNode){
                    instances = Omadi.data.getFields(referenceNode.type);
                    if(typeof instances[fieldName] !== 'undefined'){
                        instance = instances[fieldName];
                        
                        if(typeof referenceNode[fieldName] !== 'undefined'){
                            stringValue = Omadi.print.getTextValue(referenceNode, instance);        
                        } 
                    }
                }
        }
    }
    
    return stringValue;
};

Omadi.print.getTextValue = function(node, instance){"use strict";
    var dbValue, textValue, value, fieldName, i;
    
    value = "";
    fieldName = instance.field_name;
    
    switch(instance.type){
        case 'calculation_field':
        case 'number_integer':
        case 'number_decimal':
        
            value = 0;
            
            if(typeof node[instance.field_name] !== 'undefined'){
                if(typeof node[instance.field_name].dbValues !== 'undefined'){
                    if(typeof node[instance.field_name].dbValues[0] !== 'undefined'){
                        value = node[instance.field_name].dbValues[0];
                    }
                }
            }
            
            value = Omadi.utils.applyNumberFormat(instance, value);
            break;
        
        case 'extra_price':
        
            if(typeof node[fieldName] && 
                typeof node[fieldName].dbValues !== 'undefined' &&
                Omadi.utils.isArray(node[fieldName].dbValues)) {
                    value = "";
                    
                    for(i = 0; i < node[fieldName].dbValues.length; i ++){
                        value += node[fieldName].textValues[i] + ": ";
                        value += Omadi.utils.formatCurrency(node[fieldName].dbValues[i]) + "\n";
                    }
            }
            
            break;
        
        default:
        
        if(typeof node[fieldName] && 
            typeof node[fieldName].textValues !== 'undefined' &&
            typeof node[fieldName].textValues[0] != 'undefined'){
                
                value = node[fieldName].textValues[0];
        }
    }
    
    return value;
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

