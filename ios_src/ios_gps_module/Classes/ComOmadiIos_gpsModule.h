/**
 * Your Copyright Here
 *
 * Appcelerator Titanium is Copyright (c) 2009-2010 by Appcelerator, Inc.
 * and licensed under the Apache Public License (version 2)
 */

#import "TiModule.h"
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

@interface ComOmadiIos_gpsModule  : TiModule <CLLocationManagerDelegate>
@property (nonatomic, retain) CLLocationManager *locationManager;
@end
