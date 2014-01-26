/**
 * Your Copyright Here
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */
#import "ComOmadiStarmicronicsModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"
#import "StarIO/SMPort.h"
#import "StarIO/starmicronics/StarIOPort.h"
#import "StarIO/SMBluetoothManager.h"
#import "TiBuffer.h"
#import "StarBitmap.h"

@implementation ComOmadiStarmicronicsModule

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"66dfd7dc-2fdc-4fcd-b995-dec2316c4cd6";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"com.omadi.starmicronics";
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
	
	NSLog(@"[INFO] %@ loaded",self);
}

-(void)shutdown:(id)sender
{
	// this method is called when the module is being unloaded
	// typically this is during shutdown. make sure you don't do too
	// much processing here or the app will be quit forceably
	
	// you *must* call the superclass
	[super shutdown:sender];
}

#pragma mark Cleanup 

-(void)dealloc
{
	// release any resources that have been retained by the module
	[super dealloc];
}

#pragma mark Internal Memory Management

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
	// optionally release any resources that can be dynamically
	// reloaded once memory is available - such as caches
	[super didReceiveMemoryWarning:notification];
}

#pragma mark Listener Notifications

-(void)_listenerAdded:(NSString *)type count:(int)count
{
	if (count == 1 && [type isEqualToString:@"my_event"])
	{
		// the first (of potentially many) listener is being added 
		// for event named 'my_event'
	}
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
	if (count == 0 && [type isEqualToString:@"my_event"])
	{
		// the last listener called for event named 'my_event' has
		// been removed, we can optionally clean up any resources
		// since no body is listening at this point for that event
	}
}

#pragma Public APIs

-(void) getBluetoothDeviceList:(NSDictionary *)args
{
    @try {
        ENSURE_UI_THREAD(getBluetoothDeviceList, args);
        ENSURE_SINGLE_ARG(args, NSDictionary);
        
        successCallback = [args objectForKey:@"success"];
        errorCallback = [args objectForKey:@"error"];
        
        //ENSURE_TYPE_OR_NIL(successCallback,KrollCallback);
        //ENSURE_TYPE_OR_NIL(errorCallback,KrollCallback);
        
        [successCallback retain];
        [errorCallback retain];
        
        NSArray *portArray = [[SMPort searchPrinter:@"BT:"] retain];
        NSMutableArray *portNames = [[NSMutableArray alloc] init];
        
        NSLog(@"DEBUG: in get bluetooth");
        
        for (int i = 0; i < portArray.count; i++) {
            PortInfo *port = [portArray objectAtIndex:i];
            NSLog(@"Port Name: %@", port.portName);
            [portNames addObject: port.portName];
        }
        
        if(portArray.count > 0){
            if (successCallback){
                NSDictionary *event = [NSDictionary dictionaryWithObject:portNames forKey:@"portNames"];
                [self _fireEventToListener:@"success" withObject:event listener:successCallback thisObject:nil];
            }
        }
        else{
            if(errorCallback){
                NSDictionary *event = [NSDictionary dictionaryWithObject:@"No bluetooth devices available" forKey:@"error"];
                [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
            }
        }
        
        [portArray release];
    }
    @catch (NSException *exception) {
        if(errorCallback){
            NSDictionary *event = [NSDictionary dictionaryWithObject:exception.reason forKey:@"error"];
            [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
        }
    }
    
}

-(void) print:(NSDictionary*)args
{
    if(args != nil){
        
        TiBuffer *buffer;
        NSString *portName;
        NSArray *printImages;
        
        @try {
            
            ENSURE_UI_THREAD(print, args);
            ENSURE_SINGLE_ARG(args, NSDictionary);
            
            NSLog(@"DEBUG: in iOS print function");
            
            successCallback = [args objectForKey:@"success"];
            errorCallback = [args objectForKey:@"error"];
            
            portName = [args objectForKey:@"portName"];
            buffer = [args objectForKey:@"commands"];
            printImages = [args objectForKey:@"images"];
            
            //ENSURE_TYPE_OR_NIL(successCallback,KrollCallback);
            //ENSURE_TYPE_OR_NIL(errorCallback,KrollCallback);
            
            [successCallback retain];
            [errorCallback retain];
            
            NSLog(@"DEBUG: using port %@", portName);
            
            
            //NSMutableArray *bufferInterruptionIndexes = [[NSMutableArray alloc] init];
            
            NSInteger bufferInterruptionIndexes[100];
            
            NSMutableArray *interruptionCommands = [[NSMutableArray alloc] init];
            
            NSLog(@"About to add images");
            for (int i = 0; i < printImages.count; i++) {
                NSLog(@"adding an image");
                
                NSDictionary * imageData = (NSDictionary *)[printImages objectAtIndex:i];
                
                NSString *path = [imageData objectForKey:@"path"];
                
                if(path != nil){
                    NSLog(@"Image path: %@", path);
                    
                    int imageWidth = [TiUtils intValue:@"width" properties:imageData def:575];
                    NSLog(@"Image width: %d", imageWidth);
                    
                    int bufferIndex = [TiUtils intValue:@"bufferIndex" properties:imageData def:0];
                    NSLog(@"Buffer Index: %d", bufferIndex);

                    UIImage *img = [UIImage imageWithContentsOfFile:path];
                    
                    if(img != nil){
                        
                        CGSize imageSize = [img size];
                        int height = (int)imageSize.height;
                        
                        NSLog(@"Image loaded height: %d", height);
                        
                        StarBitmap * bitmap = [[StarBitmap alloc] initWithUIImage:img :imageWidth :false];
                        
                        NSLog(@"Star Bitmap loaded");
                        
                        NSData * imageCommand;
                        
                        @try {
                            imageCommand = [bitmap getImageMiniDataForPrinting:YES pageModeEnable:YES];
                            
                            NSLog(@"Image Command length: %d", imageCommand.length);
                            
                            [interruptionCommands addObject:imageCommand];
                            bufferInterruptionIndexes[interruptionCommands.count - 1] = bufferIndex;
                            
                            NSLog(@"interruptionCommands length: %d", interruptionCommands.count);
                        }
                        @catch (NSException *exception) {
                            NSLog(@"Failed to get image Command");
                        }
                    }
                    else{
                        NSLog(@"Image failed to load");
                    }
                }
                
                NSLog(@"done adding an image");
            }
            NSLog(@"Done adding all images");
            
            SMPort * starPort;
            @try {
                NSMutableData *commands = buffer.data;
                
                starPort = [SMPort getPort:portName :@"mini" :20000];
                
                if(starPort == nil){
                    NSLog(@"DEBUG: star port is nil");
                    if(errorCallback){
                        NSDictionary *event = [NSDictionary dictionaryWithObject:@"Could not open port to printer. Please restart the printer." forKey:@"error"];
                        [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
                    }
                }
                else{
                    // Wait 1 second before getting the status
                    usleep(1000 * 1000);
                    
                    StarPrinterStatus_2 status;
                    
                    [starPort beginCheckedBlock:&status :2];
                    
                    NSString *message = @"";
                    if (status.offline == SM_TRUE){
                        
                        message = @"The printer is offline";
                        if (status.coverOpen == SM_TRUE){
                            message = [message stringByAppendingString:@"\nCover is Open"];
                        }
                        else if (status.receiptPaperEmpty == SM_TRUE){
                            message = [message stringByAppendingString:@"\nOut of Paper"];
                        }
                        
                        NSLog(@"Printer offline 2 %@", message);
                        if(errorCallback){
                            NSDictionary *event = [NSDictionary dictionaryWithObject:message forKey:@"error"];
                            [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
                        }
                    }
                    else{
                        
                        NSLog(@"command length: %d", commands.length);
                        
                        int amountWritten = 0;
                        
                        unsigned char *commandsToSendToPrinter = (unsigned char*)malloc(commands.length);
                        @try {
                            [commands getBytes:commandsToSendToPrinter];
                            
                            
                            if(interruptionCommands.count > 0){
                                // We need to print out some images
                                int currentByteOffset = 0;
                                
                                for(int i = 0; i < 100; i ++){
                                    NSLog(@"index: %d", bufferInterruptionIndexes[i]);
                                }
                                
                                for(int i = 0; i < interruptionCommands.count; i ++){
                                    NSData *interruptionCommand = [interruptionCommands objectAtIndex:i];
                                    int bufferInterruptionIndex = bufferInterruptionIndexes[i];
                                    
                                    NSLog(@"interruption index: %d", bufferInterruptionIndex);
                                    
                                    int numBytesToWrite = 0;
                                    
                                    if(bufferInterruptionIndex < commands.length){
                                        numBytesToWrite = bufferInterruptionIndex - currentByteOffset;
                                    }
                                    
                                    NSLog(@"Num Bytes to write: %d", numBytesToWrite);
                                    NSLog(@"Byte Offset: %d", currentByteOffset);
                                    
                                    if(numBytesToWrite > 0){
                                        amountWritten += [starPort writePort:commandsToSendToPrinter :currentByteOffset :numBytesToWrite];
                                    }
                                    
                                    currentByteOffset = bufferInterruptionIndex;
                                    
                                    unsigned char *imageCommandForPrinter = (unsigned char*)malloc(interruptionCommand.length);
                                    
                                    @try {
                                        [interruptionCommand getBytes:imageCommandForPrinter];
                                        amountWritten += [starPort writePort:imageCommandForPrinter :0 :interruptionCommand.length];
                                    }
                                    @catch (NSException *exception) {
                                        NSLog(@"Exception occurred: %@", exception.reason);
                                    }
                                }
                                
                                if(currentByteOffset + 1 < commands.length){
                                    amountWritten += [starPort writePort:commandsToSendToPrinter :currentByteOffset :(commands.length - currentByteOffset)];
                                }
                            }
                            else{
                                amountWritten += [starPort writePort:commandsToSendToPrinter :0 :commands.length];
                            }
                            
                            NSLog(@"successful printer write: %d", amountWritten);
                        }
                        @catch (NSException *exception) {
                            NSLog(@"Exception 3: %@", exception.reason);
                        }
                    }
                    
                    [starPort endCheckedBlock:&status :2];
                    
                    if (status.offline == SM_TRUE){
                        
                        message = @"An error occurred while printing.";
                        if (status.coverOpen == SM_TRUE){
                            message = [message stringByAppendingString:@"\nCover is Open"];
                        }
                        else if (status.receiptPaperEmpty == SM_TRUE){
                            message = [message stringByAppendingString:@"\nOut of Paper"];
                        }
                        
                        NSLog(@"Printer offline 2 %@", message);
                        if(errorCallback){
                            NSDictionary *event = [NSDictionary dictionaryWithObject:message forKey:@"error"];
                            [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
                        }
                    }
                    else{
                        NSLog(@"Printing successful");
                        if(successCallback){
                            NSDictionary *event = [NSDictionary dictionaryWithObject:@"Success" forKey:@"success"];
                            [self _fireEventToListener:@"success" withObject:event listener:successCallback thisObject:nil];
                        }
                    }
                }
            }
            @catch (NSException *exception) {
                NSLog(@"Exception in inner %@", exception.reason);
                if(errorCallback){
                    NSDictionary *event = [NSDictionary dictionaryWithObject:exception.reason forKey:@"error"];
                    [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
                }
            }
            @finally {
                @try {
                    [SMPort releasePort:starPort];
                }
                @catch (NSException *exception) {

                }
            }
        }
        @catch (NSException *exception) {
            NSLog(@"IN print exception 1");
            if(errorCallback){
                NSDictionary *event = [NSDictionary dictionaryWithObject:exception.reason forKey:@"error"];
                [self _fireEventToListener:@"error" withObject:event listener:errorCallback thisObject:nil];
            }
        }
    }
    
    NSLog(@"DEBUG: got to the end of print");
}



//-(id)exampleProp
//{
//	// example property getter
//	return @"hello world";
//}
//
//-(void)setExampleProp:(id)value
//{
//	// example property setter
//}

@end
