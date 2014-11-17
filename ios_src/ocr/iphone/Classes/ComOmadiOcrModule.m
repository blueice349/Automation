/**
 * ocr
 *
 * Created by Your Name
 * Copyright (c) 2014 Your Company. All rights reserved.
 */

#import "ComOmadiOcrModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"
#import "Tesseract.h"

@implementation ComOmadiOcrModule

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"ababeaaf-164c-4d97-88aa-fdd275c09a93";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"com.omadi.ocr";
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

#pragma mark - Private

#define Mask8(x) ( (x) & 0xFF )
#define R(x) ( Mask8(x) )
#define G(x) ( Mask8(x >> 8 ) )
#define B(x) ( Mask8(x >> 16) )
#define A(x) ( Mask8(x >> 24) )
#define RGBAMake(r, g, b, a) ( Mask8(r) | Mask8(g) << 8 | Mask8(b) << 16 | Mask8(a) << 24 )
- (UIImage *)processUsingPixels:(UIImage*)inputImage {
    
    // 1. Get the raw pixels of the image
    UInt32 * inputPixels;
    
    CGImageRef inputCGImage = [inputImage CGImage];
    NSUInteger inputWidth = CGImageGetWidth(inputCGImage);
    NSUInteger inputHeight = CGImageGetHeight(inputCGImage);
    
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    
    NSUInteger bytesPerPixel = 4;
    NSUInteger bitsPerComponent = 8;
    
    NSUInteger inputBytesPerRow = bytesPerPixel * inputWidth;
    
    inputPixels = (UInt32 *)calloc(inputHeight * inputWidth, sizeof(UInt32));
    
    CGContextRef context = CGBitmapContextCreate(inputPixels, inputWidth, inputHeight,
                                                 bitsPerComponent, inputBytesPerRow, colorSpace,
                                                 kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    
    CGContextDrawImage(context, CGRectMake(0, 0, inputWidth, inputHeight), inputCGImage);
    
    // Get average intensity
    UInt32 totalIntensity = 0;
    for (NSUInteger j = 0; j < inputHeight; j++) {
        for (NSUInteger i = 0; i < inputWidth; i++) {
            UInt32 * inputPixel = inputPixels + j * inputWidth + i;
            UInt32 inputColor = *inputPixel;
            
            totalIntensity += (R(inputColor) + G(inputColor) + B(inputColor)) / 3.0;
        }
    }
    UInt32 averageIntensity = totalIntensity / (inputHeight * inputWidth);
    
    for (NSUInteger j = 0; j < inputHeight; j++) {
        for (NSUInteger i = 0; i < inputWidth; i++) {
            UInt32 * inputPixel = inputPixels + j * inputWidth + i;
            UInt32 inputColor = *inputPixel;
            
            UInt32 intensity = (R(inputColor) + G(inputColor) + B(inputColor)) / 3.0;
            
            if (intensity < averageIntensity) {
                *inputPixel = RGBAMake(0, 0, 0, A(inputColor));
            } else {
                *inputPixel = RGBAMake(255, 255, 255, A(inputColor));
            }
            
        }
    }
    
    // Create a new UIImage
    CGImageRef newCGImage = CGBitmapContextCreateImage(context);
    UIImage * processedImage = [UIImage imageWithCGImage:newCGImage];
    
    return processedImage;
}

#pragma Public APIs

-(id)recognizedText:(id)args
{
    UIImage *ocrImage = [[args objectAtIndex:0] image];
    
    Tesseract* tesseract = [[Tesseract alloc] initWithDataPath:@"tessdata" language:@"eng"];
    [tesseract setVariableValue:@"0" forKey:@"language_model_penalty_non_freq_dict_word"];
    [tesseract setVariableValue:@"0" forKey:@"language_model_penalty_non_dict_word"];
    [tesseract setImage:ocrImage];
    [tesseract recognize];
    
    NSString *recognizedText = [tesseract recognizedText];
    [tesseract clear];
    
    return recognizedText;
}

@end
