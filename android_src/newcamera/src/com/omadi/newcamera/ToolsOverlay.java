package com.omadi.newcamera;

import java.io.IOException;
import java.io.InputStream;
import java.util.Timer;
import java.util.TimerTask;
import java.util.List;
import java.util.Iterator;

import org.appcelerator.titanium.TiApplication;

import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.drawable.Drawable;
import android.hardware.Camera;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.os.AsyncTask;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.RotateAnimation;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.SeekBar;
import android.widget.RelativeLayout.LayoutParams;
import android.app.AlertDialog;
import android.app.AlertDialog.Builder;
import android.content.DialogInterface;
import android.os.Handler;

public class ToolsOverlay extends RelativeLayout implements Camera.AutoFocusCallback{
	
	private ImageView captureImage = null;
	private ImageView flashView = null;
	private Bitmap bitmap = null;
	
	private RelativeLayout container = null;
	private Context context = null;
	private int degrees = 0;
	private int captureDegrees = 0;
	private boolean cameraInitialized = false;
	private boolean captureButtonPressed = false;
	
	private Camera camera = null;
	
	private boolean hasAutoFocus = false;
	private ToolsOverlay toolsOverlay = null;
	
	RelativeLayout zoomBase;
	VerticalSeekBar zoomControls;
	
	public int getDegreesAtCapture(){
		return captureDegrees;
	}
	
	public void resetCaptureButton(){
		this.captureButtonPressed = false;
	}
	
	public void photoSaved(){
		final AlertDialog.Builder dialog = new AlertDialog.Builder(context).setMessage("Photo Saved");
		  
		final AlertDialog alert = dialog.create();
		alert.show();

		// Hide after some seconds
		final Handler handler  = new Handler();
		final Runnable runnable = new Runnable() {
		    @Override
		    public void run() {
		        if (alert.isShowing()) {
		            alert.dismiss();
		        }
		    }
		};

		alert.setOnDismissListener(new DialogInterface.OnDismissListener() {
		    @Override
		    public void onDismiss(DialogInterface dialog) {
		        handler.removeCallbacks(runnable);
		    }
		});

		handler.postDelayed(runnable, 1000);
	}
	
	public ToolsOverlay(Context c){
		super(c);
		
		toolsOverlay = this;
		
		try{
			this.context = c;
			
			container = new RelativeLayout(context);
			
			RelativeLayout.LayoutParams containerParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
		      
		    containerParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
		    container.setLayoutParams(containerParams);
			
			captureImage = new ImageView(context);
			
			RelativeLayout.LayoutParams captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			captureParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
			captureParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
			captureImage.setLayoutParams(captureParams);
	
			try {
				InputStream is = context.getAssets().open("ic_menu_camera.png");
				bitmap = BitmapFactory.decodeStream(is);
			} 
			catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				NewcameraModule.sendErrorReport("Exception getting camera icon: " + e.getMessage());
			}
			captureImage.setImageBitmap(bitmap);
			
			captureImage.setOnClickListener(new View.OnClickListener() {
				public void onClick(View v) {
					if(!captureButtonPressed){
						captureDegrees = degrees;
						captureButtonPressed = true;
						
						Log.d("CAMERA", "On click listener");
						try{
							if(hasAutoFocus){
								if(camera != null){
									try{
										camera.autoFocus(toolsOverlay);
									}
									catch(Exception e){
										NewcameraModule.sendErrorReport("Error trying to autoFocus camera: " + e.getMessage());
										OmadiCameraActivity.cameraActivity.takePicture();
									}
								}
							}
							else{
								OmadiCameraActivity.cameraActivity.takePicture();
							}
						}
						catch(Exception e){
							// nothing here
							NewcameraModule.sendErrorReport("Exception in capture image onclick: " + e.getMessage());
						}
						
						captureButtonPressed = false;
					}
				}
			});
			
			container.addView(captureImage);
			
			flashView = new ImageView(context);
	        
	        RelativeLayout.LayoutParams flashParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			flashParams.addRule(RelativeLayout.CENTER_VERTICAL);
			flashParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
			 
	        flashView.setLayoutParams(flashParams);
	
	        try {
	       	 	InputStream is = context.getAssets().open("flashOff.png");
		        bitmap = BitmapFactory.decodeStream(is);
		        flashView.setImageBitmap(bitmap);     
	        } 
	        catch (IOException e) {
	        	e.printStackTrace();NewcameraModule.sendErrorReport("Error getting flash off icon: " + e.getMessage());
	        }
	        
	        flashView.setOnClickListener(new View.OnClickListener() {
				public void onClick(View v) {
					
					InputStream is = null;
					Camera.Parameters localCameraParams = OmadiCameraActivity.getCameraParameters();

					if (localCameraParams != null) {
						try {

							// boolean hasNightMode =
							// hasNightMode(localCameraParams);
							// boolean hasTorchMode =
							// hasTorchMode(localCameraParams);

							// Log.d("CAMERA", "CAMERA scene modes: " +
							// supportedSceneModes.size() + " " + modes);
							
							
							List<String> flashModes = localCameraParams.getSupportedFocusModes();
							boolean hasFlashAuto = false;
							boolean hasFlashOff = false;
							boolean hasFlashOn = false;
							
							if(flashModes.contains(Camera.Parameters.FLASH_MODE_AUTO)){
								hasFlashAuto = true;
							}
							
							if(flashModes.contains(Camera.Parameters.FLASH_MODE_OFF)){
								hasFlashOff = true;
							}
							
							if(flashModes.contains(Camera.Parameters.FLASH_MODE_ON)){
								hasFlashOn = true;
							}
							
							String currentFlashMode = localCameraParams.getFlashMode();
							
							if (hasFlashAuto) {
								// When has auto - Off or auto - default to auto
								if(currentFlashMode != null && currentFlashMode.equals(Camera.Parameters.FLASH_MODE_AUTO)){
									// Change to flash off
									is = context.getAssets().open("flashOff.png");
									localCameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
								}
								else{
									// Change to flash auto (on flash icon)
									is = context.getAssets().open("flashOn.png");
									localCameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_AUTO);
								}
							}
							else if(hasFlashOn){
								// When no auto - OFF OR ON - default to on
								if(currentFlashMode != null && currentFlashMode.equals(Camera.Parameters.FLASH_MODE_ON)){
									// Change to flash off
									is = context.getAssets().open("flashOff.png");
									localCameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
									
								}
								else{
									// Change to flash on
									is = context.getAssets().open("flashOn.png");
									localCameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_ON);
								}
							}
								
							try{
								System.setProperty("OMADI_FLASH", localCameraParams.getFlashMode());
							}
							catch(Exception e){
								NewcameraModule.sendErrorReport("Failed to set property OMADI_FLASH: " + e.getMessage());
							}
							
							if(is != null){
								bitmap = BitmapFactory.decodeStream(is);
								flashView.setImageBitmap(bitmap);
							}
							
							OmadiCameraActivity.setCameraParameters(localCameraParams);
							
						} 
						catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
							NewcameraModule.sendErrorReport("Exception setOnClickListner in ToolsOverlay: " + e.getMessage());
						}

						redrawButtons();
					}
				}
			});
	        
	        container.addView(flashView);
			
//	        Camera.Parameters cameraParams = OmadiCameraActivity.getCameraParameters();
//	        if(cameraParams != null && cameraParams.isZoomSupported()){
	        	addZoomBar();
	        // }
			
			this.addView(container);
		}
		catch(Exception e){
			NewcameraModule.sendErrorReport("CAMERA tools INIT: " + e.getMessage());
			Log.d("CAMERA", "CAMERA tools INIT: " + e.getMessage());
		}
	}
	
	public void onAutoFocus(boolean success, Camera camera){
		Log.d("CAMERA", "CAMERA FOCUS WAS SUCCESSFUL");
		OmadiCameraActivity.cameraActivity.takePicture();
	}
	
	private void addZoomBar(){
		
		Display display = ((WindowManager) context.getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
		
		int deviceHeight = display.getHeight();
		int deviceWidth = display.getWidth();
    
		// ZOOMBASE
	    zoomBase = new RelativeLayout(context);
	    RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
	    layoutParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
	    layoutParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
	    zoomBase.setLayoutParams(layoutParams);

	    // ZOOM CONTROLS
	    zoomControls = new VerticalSeekBar(context);
	    RelativeLayout.LayoutParams zoomParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, deviceHeight - 150);
	    zoomParams.addRule(RelativeLayout.CENTER_IN_PARENT);
	    zoomControls.setLayoutParams(zoomParams);
	    zoomControls.setPadding(5, 5, 5, 5);
	    zoomBase.addView(zoomControls);
	    
	    this.addView(zoomBase);	    
	}
	
	private boolean hasNightMode(Camera.Parameters cameraParams){
		boolean hasNightMode = false;
        
		List supportedSceneModes = cameraParams.getSupportedSceneModes();
        
        Iterator iterator = supportedSceneModes.iterator();
        while(iterator.hasNext()){
     	   String mode = iterator.next().toString();
     	   if(mode.equals(Camera.Parameters.SCENE_MODE_NIGHT_PORTRAIT)){
     		   hasNightMode = true;
     	   }
        }
        
        return hasNightMode;
	}
	
	private boolean hasTorchMode(Camera.Parameters cameraParams){
		boolean hasTorchMode = false;
        
		List supportedSceneModes = cameraParams.getSupportedSceneModes();
        
        Iterator iterator = supportedSceneModes.iterator();
        while(iterator.hasNext()){
     	   String mode = iterator.next().toString();
     	   if(mode.equals(Camera.Parameters.FLASH_MODE_TORCH)){
     		  hasTorchMode = true;
     	   }
        }
        
        return hasTorchMode;
	}
	
	public void cameraInitialized(Camera c){

		if(!cameraInitialized){

			this.camera = c;

			Camera.Parameters cameraParams = null;

			try{
				//Camera.Parameters cameraParams = OmadiCameraActivity.getCameraParameters();
				cameraParams = camera.getParameters();
			}
			catch(Exception e){
				NewcameraModule.sendErrorReport("CAMERA cannot get camera params: " + e.toString());
				Log.d("CAMERA", "CAMERA cannot get camera params: " + e.toString());
			}

			if(cameraParams != null){
				try{
					List<String> focusModes = cameraParams.getSupportedFocusModes();
					if(focusModes.size() > 0){
						if(focusModes.contains(Camera.Parameters.FOCUS_MODE_AUTO)){
							this.hasAutoFocus = true;
							cameraParams.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
						}
					}
					
					List<String> flashModes = cameraParams.getSupportedFocusModes();
					
					// FLASH BUTTON
					if(flashModes.size() > 0 && context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH)){

						try {
							InputStream is;

							boolean hasFlashAuto = false;
							boolean hasFlashOff = false;
							boolean hasFlashOn = false;

							if(flashModes.contains(Camera.Parameters.FLASH_MODE_AUTO)){
								hasFlashAuto = true;
							}

							if(flashModes.contains(Camera.Parameters.FLASH_MODE_OFF)){
								hasFlashOff = true;
							}

							if(flashModes.contains(Camera.Parameters.FLASH_MODE_ON)){
								hasFlashOn = true;
							}

							String omadiFlashProp = System.getProperty("OMADI_FLASH");
							if (omadiFlashProp == null) {
								if(hasFlashAuto){
									omadiFlashProp = Camera.Parameters.FLASH_MODE_AUTO;
								}
								else if(hasFlashOn){
									omadiFlashProp = Camera.Parameters.FLASH_MODE_ON;
								}
								else{
									omadiFlashProp = Camera.Parameters.FLASH_MODE_OFF;
								}
							}
							
							if(omadiFlashProp == Camera.Parameters.FLASH_MODE_OFF){
								is = context.getAssets().open("flashOff.png");
							}
							else{
								is = context.getAssets().open("flashOn.png");
							}

							cameraParams.setFlashMode(omadiFlashProp);
							bitmap = BitmapFactory.decodeStream(is);
							flashView.setImageBitmap(bitmap);

							camera.setParameters(cameraParams);
						} 
						catch (IOException e) {
							NewcameraModule.sendErrorReport("Exception setting up flash button: " + e.getMessage());
							e.printStackTrace();
						}
					}
					else{
						//flashView.setVisibility(View.GONE);
					}
				}
				catch(Exception e){
					Log.d("CAMERA", "CAMERA flash button init: " + e.toString());
					NewcameraModule.sendErrorReport("CAMERA flash button init: " + e.toString());
					e.printStackTrace();
				}

				if(cameraParams != null && cameraParams.isZoomSupported()){
					try{
						//ZOOM CONTROL SLIDER
	
						int maxZoomLevel = cameraParams.getMaxZoom();
						List<Integer> zoomRatios = cameraParams.getZoomRatios();
						
						if (zoomRatios.size() < 2 || maxZoomLevel == 0) {
							zoomControls.setEnabled(false);
						} 
						else {
							zoomControls.setMax(maxZoomLevel);
						}
	
						zoomControls.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
	
							public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
								try{
									Camera.Parameters localCameraParams = camera.getParameters();
									localCameraParams.setZoom(progress);
									camera.setParameters(localCameraParams);
								}
								catch(Exception e){
									e.printStackTrace();
									NewcameraModule.sendErrorReport("Exception on progress change: " + e.getMessage());
								}
							}
	
							public void onStartTrackingTouch(SeekBar seekBar) {
	
							}
	
							public void onStopTrackingTouch(SeekBar seekBar) {
	
							}
						});
					}
					catch(Exception e){
						Log.d("CAMERA", "CAMERA zoom control init: " + e.toString());
						NewcameraModule.sendErrorReport("CAMERA zoom control init: " + e.toString());
						e.printStackTrace();
					}
				}
				else{
					zoomControls.setEnabled(false);
				}
			}
		}

		cameraInitialized = true;
		redrawButtons();
	}
	
	public void degreesChanged(int degrees){
		
		this.degrees = degrees;
		
		Log.d("CAMERA", "CAMERA Degrees now " + degrees);
		
		redrawButtons();
		
		Log.d("CAMERA", "CAMERA redrew buttons");
	}
	
	private void redrawButtons(){
		
		try{
			RelativeLayout.LayoutParams containerParams = null;
			RelativeLayout.LayoutParams captureParams = null;
			RelativeLayout.LayoutParams flashParams = null;
			//RotateAnimation animation = null;
			
			if(degrees == 270){ // regular portrait
				containerParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
			    containerParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
			    
			    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
				captureParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
				captureParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
				captureImage.setLayoutParams(captureParams);
				
				if(flashView != null){
					flashParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
					flashParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
					flashParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
					flashView.setLayoutParams(flashParams);
				}
				
				//animation = getRotateAnimation(270);
			}
			else if(degrees == 90){
				containerParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
			    containerParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
			    
			    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
				captureParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
				captureParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
				captureImage.setLayoutParams(captureParams);
				
				if(flashView != null){
					flashParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
					flashParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
					flashParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
					flashView.setLayoutParams(flashParams);
				}
				
				//animation = getRotateAnimation(90);
			}
			else if(degrees == 180){
				containerParams = new RelativeLayout.LayoutParams(LayoutParams.FILL_PARENT, 65);
			    containerParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
			    
			    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
				captureParams.addRule(RelativeLayout.CENTER_VERTICAL);
				captureParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
				captureImage.setLayoutParams(captureParams);
				
				if(flashView != null){
					flashParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
					flashParams.addRule(RelativeLayout.CENTER_VERTICAL);
					flashParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
					flashView.setLayoutParams(flashParams);
				}
				
				//animation = getRotateAnimation(180);
			}
			else{// Degrees = 0
				containerParams = new RelativeLayout.LayoutParams(LayoutParams.FILL_PARENT, 65);
			    containerParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
			    
			    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
				captureParams.addRule(RelativeLayout.CENTER_VERTICAL);
				captureParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
				captureImage.setLayoutParams(captureParams);
				
				if(flashView != null){
					flashParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
					flashParams.addRule(RelativeLayout.CENTER_VERTICAL);
					flashParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
					flashView.setLayoutParams(flashParams);
				}
				
				//animation = getRotateAnimation(0);
			}
			
			//if (animation != null) {
			//	captureImage.startAnimation(animation);
				
			//	if(flashView != null){
					//flashView.startAnimation(animation);
			//	}
			//}
			
			container.setLayoutParams(containerParams);
					
			Matrix matrix = new Matrix();
			captureImage.setScaleType(ImageView.ScaleType.MATRIX);
			matrix.postRotate((float)degrees, captureImage.getDrawable().getBounds().width()/2, captureImage.getDrawable().getBounds().height()/2);
			captureImage.setImageMatrix(matrix);
			
			if(flashView != null){
				
				Matrix matrix2 = new Matrix();
				flashView.setScaleType(ImageView.ScaleType.MATRIX);
				matrix2.postRotate((float)degrees, flashView.getDrawable().getBounds().width()/2, flashView.getDrawable().getBounds().height()/2);
				flashView.setImageMatrix(matrix2);
			}
		}
		catch(Exception e){
			Log.d("CAMERA", "CAMERA redrawButtons: " + e.getMessage());
			NewcameraModule.sendErrorReport("CAMERA redrawButtons: " + e.getMessage());
		}
	}
	
	public void pictureTaken(){
		//captureImage.setEnabled(false);
		//captureImage.setVisibility(INVISIBLE);
	}
	
//	private RotateAnimation getRotateAnimation(int toDegrees) {
//		//float compensation = 0;
//
////		if (Math.abs(degrees - toDegrees) > 180) {
////			compensation = 360;
////		}
////
////		// When the device is being held on the left side (default position for
////		// a camera) we need to add, not subtract from the toDegrees.
////		if (toDegrees == 0) {
////			compensation = -compensation;
////		}
//
//		// Creating the animation and the RELATIVE_TO_SELF means that he image
//		// will rotate on it center instead of a corner.
//		RotateAnimation animation = new RotateAnimation(0, toDegrees, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
//
//		// Adding the time needed to rotate the image
//		animation.setDuration(3000);
//
//		// Set the animation to stop after reaching the desired position. With
//		// out this it would return to the original state.
//		animation.setFillAfter(true);
//
//		return animation;
//	}
}