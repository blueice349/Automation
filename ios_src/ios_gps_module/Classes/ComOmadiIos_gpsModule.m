/**
 * This module is Copyright(c) 2012 by Omadi, Inc.
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */
#import "ComOmadiIos_gpsModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

@implementation ComOmadiIos_gpsModule
@synthesize locationManager;

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"03c6e208-8b6e-495d-bad6-d67414c1b197";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"com.omadi.ios_gps";
}

-(CLLocationManager *)locationManager {
    
    if(locationManager == nil) {
        locationManager = [[CLLocationManager alloc] init];
    }
    return locationManager;
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
    RELEASE_TO_NIL(self.locationManager);
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


#pragma mark Constans

MAKE_SYSTEM_PROP_DBL(LOCATION_ACCURACY_BEST,kCLLocationAccuracyBest);
MAKE_SYSTEM_PROP_DBL(LOCATION_ACCURACY_BEST_FOR_NAVIGATION, kCLLocationAccuracyBestForNavigation);
MAKE_SYSTEM_PROP_DBL(LOCATION_ACCURACY_THREE_KILOMETERS, kCLLocationAccuracyThreeKilometers);

#pragma Public APIs

- (void)startMovementUpdates:(id)args
{
    ENSURE_UI_THREAD(startMovementUpdates, args);
    ENSURE_SINGLE_ARG(args, NSDictionary);
    
    BOOL startLocationUpdates = [TiUtils boolValue:[args objectForKey : @"location"]];
    
    if(startLocationUpdates) {
        
        /*
        NSNumber *locationAccuracy = [args objectForKey : @"locationAccuracy"];
        
        if(locationAccuracy != NULL) {
            self.locationManager.desiredAccuracy = [locationAccuracy doubleValue];
        } else {
            self.locationManager.desiredAccuracy = kCLLocationAccuracyThreeKilometers;
        }
         */

        self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
        
        // Update again when a user moves distance in metersan 
        [self.locationManager setDistanceFilter:kCLDistanceFilterNone];
        
        // Configure permission dialog
        [self.locationManager setPurpose:@"Omadi tracking module"];

        
        [self.locationManager startUpdatingLocation];
    }
    
    NSLog(@"[INFO] started movement updates.");
}

- (void)stopMovementUpdates:(id)args
{
    [self.locationManager stopUpdatingLocation];
    
    NSLog(@"[INFO] stopped movement updates.");
}

- (NSDictionary *) currentMovement
{
    
    //NSLog(@"[INFO] speed = %@ ", [NSNumber numberWithDouble:self.locationManager.location.speed]);
    //NSLog(@"[INFO] altitude = %@", [NSNumber numberWithDouble:self.locationManager.location.altitude]);
    
    NSDictionary *location = [NSDictionary dictionaryWithObjectsAndKeys:    
                              [NSNumber numberWithDouble:self.locationManager.location.coordinate.longitude], @"longitude",
                              [NSNumber numberWithDouble:self.locationManager.location.coordinate.latitude], @"latitude",
                              [NSNumber numberWithDouble:self.locationManager.location.horizontalAccuracy], @"accuracy",
                              [NSNumber numberWithDouble:self.locationManager.location.speed], @"speed",
                              [NSNumber numberWithDouble:self.locationManager.location.altitude], @"altitude",
                              nil];
    
    NSDictionary *movementData = [NSDictionary dictionaryWithObjectsAndKeys:
                                  location, @"location",
                                  nil];
    return movementData;
    
}

- (BOOL) isFlashAvailableInCamera: (id)sender {
    
    if([UIImagePickerController isFlashAvailableForCameraDevice:UIImagePickerControllerCameraDeviceRear]){
        return YES;
    }else{
        return NO;
    }
       
}


@end
