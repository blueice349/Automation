package com.omadi.newcamera;

import java.io.IOException;
import java.io.InputStream;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Drawable;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.view.Display;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.RotateAnimation;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.RelativeLayout.LayoutParams;

public class ToolsOverlay extends RelativeLayout {
	
	ImageView captureImage = null;
	Bitmap bitmap = null;
	
	RelativeLayout container = null;
	
	public ToolsOverlay(Context context){
		super(context);
		
//		Display display = ((WindowManager) context.getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
//    
//		int deviceHeight = display.getHeight();
//		int deviceWidth = display.getWidth();
		
		container = new RelativeLayout(context);
		
		RelativeLayout.LayoutParams containerParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
	      
	    containerParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
	    container.setLayoutParams(containerParams);
	      
	    
	    this.addView(container);
	    
//	    Drawable drawable = null;
//	    try {
//	    	InputStream is = context.getAssets().open("gray_bg.png");
//	    	drawable = Drawable.createFromStream(is, null);
//	    } 
//	    catch (IOException e) {
//	    	e.printStackTrace();
//	    }
//	    this.setBackgroundDrawable(drawable);
		
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
				OmadiCameraActivity.cameraActivity.takePicture();
			}
		});
		
		container.addView(captureImage);
	}
	
	public void degreesChanged(int degrees){
		RelativeLayout.LayoutParams containerParams = null;
		RelativeLayout.LayoutParams captureParams = null;
		RotateAnimation animation = null;
		
		if(degrees == 270){ // regular portrait
			containerParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
		    containerParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
		    
		    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			captureParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
			captureParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
			captureImage.setLayoutParams(captureParams);
			
			animation = getRotateAnimation(270);
		}
		else if(degrees == 90){
			containerParams = new RelativeLayout.LayoutParams(65, LayoutParams.FILL_PARENT);
		    containerParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
		    
		    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			captureParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
			captureParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
			captureImage.setLayoutParams(captureParams);
			
			animation = getRotateAnimation(90);
		}
		else if(degrees == 180){
			containerParams = new RelativeLayout.LayoutParams(LayoutParams.FILL_PARENT, 65);
		    containerParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
		    
		    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			captureParams.addRule(RelativeLayout.CENTER_VERTICAL);
			captureParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
			captureImage.setLayoutParams(captureParams);
			
			animation = getRotateAnimation(180);
		}
		else{// Degrees = 0
			containerParams = new RelativeLayout.LayoutParams(LayoutParams.FILL_PARENT, 65);
		    containerParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
		    
		    captureParams = new RelativeLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			captureParams.addRule(RelativeLayout.CENTER_VERTICAL);
			captureParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
			captureImage.setLayoutParams(captureParams);
			
			animation = getRotateAnimation(0);
		}
		
		if (animation != null) {
			captureImage.startAnimation(animation);
		}
		
		container.setLayoutParams(containerParams);
	}
	
	public void pictureTaken(){
		captureImage.setEnabled(false);
		captureImage.setVisibility(INVISIBLE);
	}
	
	private RotateAnimation getRotateAnimation(int toDegrees) {
		//float compensation = 0;

//		if (Math.abs(degrees - toDegrees) > 180) {
//			compensation = 360;
//		}
//
//		// When the device is being held on the left side (default position for
//		// a camera) we need to add, not subtract from the toDegrees.
//		if (toDegrees == 0) {
//			compensation = -compensation;
//		}

		// Creating the animation and the RELATIVE_TO_SELF means that he image
		// will rotate on it center instead of a corner.
		RotateAnimation animation = new RotateAnimation(0, toDegrees, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);

		// Adding the time needed to rotate the image
		animation.setDuration(0);

		// Set the animation to stop after reaching the desired position. With
		// out this it would return to the original state.
		animation.setFillAfter(true);

		return animation;
	}
}