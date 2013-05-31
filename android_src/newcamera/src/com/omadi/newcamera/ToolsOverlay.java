package com.omadi.newcamera;

import java.io.IOException;
import java.io.InputStream;
import java.util.Timer;
import java.util.TimerTask;

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

public class ToolsOverlay extends RelativeLayout {
	
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
	
	RelativeLayout zoomBase;
	VerticalSeekBar zoomControls;
	
	public int getDegreesAtCapture(){
		return captureDegrees;
	}
	
	public ToolsOverlay(Context c){
		super(c);
		
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
			}
			captureImage.setImageBitmap(bitmap);
			
			captureImage.setOnClickListener(new View.OnClickListener() {
				public void onClick(View v) {
					if(!captureButtonPressed){
						captureDegrees = degrees;
						captureButtonPressed = true;
						OmadiCameraActivity.cameraActivity.takePicture();
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
	        	e.printStackTrace();
	        }
	        
	        flashView.setOnClickListener(new View.OnClickListener() {
	           public void onClick(View v) {
		             InputStream is;
		             Camera.Parameters localCameraParams = OmadiCameraActivity.getCameraParameters();
		             try {
			               if(localCameraParams.getFlashMode().equals(Camera.Parameters.FLASH_MODE_ON)){
			                 is = context.getAssets().open("flashOff.png");
			                 localCameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
			               }
			               else{
			                 is = context.getAssets().open("flashOn.png");
			                 localCameraParams.setFlashMode(Camera.Parameters.FLASH_MODE_ON);
			               }
			               
			               System.setProperty("OMADI_FLASH",localCameraParams.getFlashMode());
			               
			               bitmap = BitmapFactory.decodeStream(is);
			               flashView.setImageBitmap(bitmap);
			               
			               OmadiCameraActivity.setCameraParameters(localCameraParams);
			               
		             } 
		             catch (IOException e) {
		               // TODO Auto-generated catch block
		               e.printStackTrace();
		             }
		             
		             redrawButtons();
	           }
	        });
	        
	        container.addView(flashView);
			
			addZoomBar();
			
			this.addView(container);
		}
		catch(Exception e){
			Log.d("CAMERA", "CAMERA tools INIT: " + e.getMessage());
		}
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
	
	public void cameraInitialized(Camera c){
	    
		if(!cameraInitialized){
			
			this.camera = c;
			
			Camera.Parameters cameraParams = null;
			
			try{
				//Camera.Parameters cameraParams = OmadiCameraActivity.getCameraParameters();
				cameraParams = camera.getParameters();
			}
			catch(Exception e){
				Log.d("CAMERA", "CAMERA cannot get camera params: " + e.toString());
			}
			
			if(cameraParams != null){
				try{
					// FLASH BUTTON
			        if(context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH)){
			  
				         try {
				        	 InputStream is;
				        	 
					           String omadiFlashProp = System.getProperty("OMADI_FLASH");
					           if (omadiFlashProp == null) {
					        	   omadiFlashProp = Camera.Parameters.FLASH_MODE_OFF;
					           }
					           
					           if (omadiFlashProp == Camera.Parameters.FLASH_MODE_OFF) {
					        	   is = context.getAssets().open("flashOff.png");
					           } 
					           else {
					        	   is = context.getAssets().open("flashOn.png");
					           }
					           
					           cameraParams.setFlashMode(omadiFlashProp);
					           bitmap = BitmapFactory.decodeStream(is);
					           flashView.setImageBitmap(bitmap);
					           
					           camera.setParameters(cameraParams);//.setCameraParameters(cameraParams);
				         } 
				         catch (IOException e) {
				        	 
				         }
			   		}
			        else{
			        	//flashView.setVisibility(View.GONE);
			        }
				}
				catch(Exception e){
					Log.d("CAMERA", "CAMERA flash button init: " + e.toString());
				}
		        
		        
				try{
			      //ZOOM CONTROL SLIDER
					
					int maxZoomLevel = cameraParams.getMaxZoom();
					
					if (maxZoomLevel == 0) {
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
								//OmadiCameraActivity.setCameraParameters(localCameraParams);
							}
							catch(Exception e){
								e.printStackTrace();
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
				}
			}
		}
		
		cameraInitialized = true;
		redrawButtons();
	}
	
	public void degreesChanged(int degrees){
		
		this.degrees = degrees;
		
		Log.d("CAMERA", "Degrees now " + degrees);
		
		redrawButtons();
		
		Log.d("CAMERA", "redrew buttons");
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