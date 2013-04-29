package com.omadi.newcamera;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.security.Timestamp;
import java.util.HashMap;

import org.appcelerator.titanium.TiBaseActivity;
import org.appcelerator.titanium.proxy.TiViewProxy;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.drawable.Drawable;
import android.hardware.Camera;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.hardware.Camera.Parameters;
import android.hardware.Camera.PictureCallback;
import android.hardware.Camera.ShutterCallback;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.view.Display;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.WindowManager;
import android.view.ViewGroup.LayoutParams;
import android.view.animation.Animation;
import android.view.animation.RotateAnimation;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;

public class OmadiCameraActivity extends TiBaseActivity implements SurfaceHolder.Callback, SensorEventListener {
	private static final String LCAT = "OmadiCameraActivity";
	private static Camera camera;

	private TiViewProxy localOverlayProxy = null;
	private Uri storageUri;
	private SurfaceView preview;
	private FrameLayout previewLayout;
	private int orientation;
	private int degrees;

	public static TiViewProxy overlayProxy = null;
	public static OmadiCameraActivity cameraActivity = null;
	
	public static String storageDirectory = "";
	
	private int deviceHeight;
	private int deviceWidth;
	//RelativeLayout rootlayout;
	//RelativeLayout enerlayout;
	FrameLayout frameCameraViewContainer;
	private ImageView rotatingImage;
	private ImageView done;
	private ImageView flash;
	RelativeLayout zoomBase;
	
	public static ToolsOverlay toolsOverlay = null;
	//VerticalSeekBar zoomControls;
	private SensorManager sensorManager = null;
	Bitmap bitmap = null;
	
	
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// set picture location
		storageUri = (Uri)getIntent().getParcelableExtra(MediaStore.EXTRA_OUTPUT);

		// create camera preview
		preview = new SurfaceView(this);
		SurfaceHolder previewHolder = preview.getHolder();
		previewHolder.addCallback(this);
		previewHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);

		// set preview overlay
		localOverlayProxy = overlayProxy;
		overlayProxy = null; // clear the static object once we have a local reference

		// set overall layout - will populate in onResume
		previewLayout = new FrameLayout(this);
		
		setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
		
		
		toolsOverlay = new ToolsOverlay(this);
		
		// Getting the sensor service.
	    sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
		
		setContentView(previewLayout);
	}
	
	public static Camera.Parameters getCameraParameters(){
		return camera.getParameters();
	}
	
	public static void setCameraParameters(Camera.Parameters params){
		camera.setParameters(params);
	}

	public void surfaceChanged(SurfaceHolder previewHolder, int format, int width, int height) {
		camera.startPreview();  // make sure setPreviewDisplay is called before this
		
		toolsOverlay.cameraInitialized();
	}

	public void surfaceCreated(SurfaceHolder previewHolder) {
		camera = Camera.open();

		/*
		 * Disabling this since it can end up picking a bad preview
		 * size which can create stretching issues (TIMOB-8151).
		 * Original words of wisdom left by some unknown person:
		 * "using default preview size may be causing problem on some devices, setting dimensions manually"
		 * We may want to expose camera parameters to the developer for extra control.
		Parameters cameraParams = camera.getParameters();
		Camera.Size previewSize = cameraParams.getSupportedPreviewSizes().get((cameraParams.getSupportedPreviewSizes().size()) - 1);
		cameraParams.setPreviewSize(previewSize.width, previewSize.height );
		camera.setParameters(cameraParams);
		*/

		try {
			Log.i(LCAT, "setting preview display");
			camera.setPreviewDisplay(previewHolder);
		} catch(IOException e) {
			e.printStackTrace();
		}
		
		//toolsOverlay.show();
	}

	// make sure to call release() otherwise you will have to force kill the app before 
	// the built in camera will open
	public void surfaceDestroyed(SurfaceHolder previewHolder) {
		camera.release();
		camera = null;
	}

	@Override
	protected void onResume() {
		super.onResume();

		cameraActivity = this;
		previewLayout.addView(preview);
		
		//previewLayout.addView(localOverlayProxy.getOrCreateView().getNativeView(), new FrameLayout.LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
		
		previewLayout.addView(toolsOverlay);
		
		// Register this class as a listener for the accelerometer sensor
		sensorManager.registerListener(this, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);
	}

	@Override
	protected void onPause() {
		super.onPause();

		previewLayout.removeView(preview);
		
		//previewLayout.removeView(localOverlayProxy.getOrCreateView().getNativeView());

		previewLayout.removeView(toolsOverlay);
		
		sensorManager.unregisterListener(this);
		
		try {
			camera.release();
			camera = null;
		} catch (Throwable t) {
			Log.i(LCAT, "camera is not open, unable to release");
		}

		cameraActivity = null;
	}
	
	
//	/**
//	 * Calculating the degrees needed to rotate the image imposed on the button
//	 * so it is always facing the user in the right direction
//	 *
//	 * @param toDegrees
//	 * @return
//	 */
//	private RotateAnimation getRotateAnimation(float toDegrees) {
//		float compensation = 0;
//
//		if (Math.abs(degrees - toDegrees) > 180) {
//			compensation = 360;
//		}
//
//		// When the device is being held on the left side (default position for
//		// a camera) we need to add, not subtract from the toDegrees.
//		if (toDegrees == 0) {
//			compensation = -compensation;
//		}
//
//		// Creating the animation and the RELATIVE_TO_SELF means that he image
//		// will rotate on it center instead of a corner.
//		RotateAnimation animation = new RotateAnimation(degrees, toDegrees
//				- compensation, Animation.RELATIVE_TO_SELF, 0.5f,
//				Animation.RELATIVE_TO_SELF, 0.5f);
//
//		// Adding the time needed to rotate the image
//		animation.setDuration(250);
//
//		// Set the animation to stop after reaching the desired position. With
//		// out this it would return to the original state.
//		animation.setFillAfter(true);
//
//		return animation;
//	}

	public void takePicture() {
		Log.i(LCAT, "Taking picture");
		camera.takePicture(null, null, jpegCallback);
	}

	// support user defined callback for this in the future?
//	static ShutterCallback shutterCallback = new ShutterCallback() {
//		public void onShutter() {
//		}
//	};
//
//	// support user defined callback for this in the future?
//	static PictureCallback rawCallback = new PictureCallback() {
//		public void onPictureTaken(byte[] data, Camera camera) {
//		}
//	};
	
	public PictureCallback jpegCallback = new PictureCallback() {

		public void onPictureTaken(byte[] data, Camera camera) {
			try {
				
				toolsOverlay.pictureTaken();
				
				FileOutputStream outputStream = null;
				
				try {
					
					String filePath = cameraActivity.storageUri.getPath();
					
					//java.util.Date date = new java.util.Date();
					
					//String filePath = OmadiCameraActivity.storageDirectory + "/p_" + System.currentTimeMillis() + ".jpg";
					
					// Titanium passes in the string with file:// included, so remove it
					//filePath = filePath.replaceFirst("file://", "");
					
					//URI fileURI = URI.create(filePath);
					
					Log.i("CHRIS", "PATH: " + filePath);
					//Log.i("CHRIS", "PATH URI: " + fileURI.getPath());
					
					// get the degrees before the file is saved
					Message msg = Message.obtain();
					Bundle messageVars = new Bundle();
					messageVars.putInt("degrees", degrees);
					messageVars.putString("filePath", filePath);
					
					Log.i("CHRIS", "degrees: " + degrees);
					
					// write photo to storage
					outputStream = new FileOutputStream(filePath);
					outputStream.write(data);
					outputStream.close();
	
					cameraActivity.setResult(Activity.RESULT_OK);
					cameraActivity.finish();
					
					//messageVars.putByteArray("media", data);
					msg.setData(messageVars);
					messageHandler.sendMessage(msg);
					
				} 
				catch (FileNotFoundException e) {
					e.printStackTrace();
				} 
				catch (IOException e) {
					e.printStackTrace();
				}
			
			}
			catch (Exception ex) {

			}

		}
	};
	
	static Handler messageHandler = new Handler() {
		@Override
		public void dispatchMessage(Message msg) {
//			KrollDict eventData = new KrollDict();
//			eventData.put("source", CustomcameraModule.eve);
//			eventData.put("media", msg.obj);
//			CustomcameraModule.getInstance().fireEvent("successCameraCapture",
//					eventData);

			HashMap<String, Object> hm = new HashMap<String, Object>();
			
			Bundle messageVars = msg.getData();
			
			//hm.put("source", NewcameraModule.eve);
			hm.put("filePath", messageVars.getString("filePath"));
			hm.put("degrees", messageVars.getInt("degrees"));
			//hm.put("media", messageVars.getByteArray("media"));

			NewcameraModule.finishedCallback.callAsync(NewcameraModule.getInstance().getKrollObject(), hm);
		}
	};

//	static PictureCallback jpegCallback = new PictureCallback() {
//		public void onPictureTaken(byte[] data, Camera camera) {
//			FileOutputStream outputStream = null;
//			try {
//				// write photo to storage
//				outputStream = new FileOutputStream(cameraActivity.storageUri.getPath());
//				outputStream.write(data);
//				outputStream.close();
//
//				cameraActivity.setResult(Activity.RESULT_OK);
//				cameraActivity.finish();
//			} catch (FileNotFoundException e) {
//				e.printStackTrace();
//			} catch (IOException e) {
//				e.printStackTrace();
//			}
//		}
//	};
	
	
	/**
	 * Putting in place a listener so we can get the sensor data only when
	 * something changes.
	 */
	public void onSensorChanged(SensorEvent event) {
		//Log.i("CHRIS", "IN SENSOR");
		synchronized (this) {
			if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
				//RotateAnimation animation = null;
				
				int lastDegrees = degrees;
				
				if (event.values[0] < 4 && event.values[0] > -4) {
					
					if (event.values[1] > 0 && orientation != ExifInterface.ORIENTATION_ROTATE_90) {
						// UP
						//orientation = ExifInterface.ORIENTATION_ROTATE_90;
						//animation = getRotateAnimation(270);
						degrees = 270;
					} 
					else if (event.values[1] < 0 && orientation != ExifInterface.ORIENTATION_ROTATE_270) {
						// UP SIDE DOWN
						//orientation = ExifInterface.ORIENTATION_ROTATE_270;
						//animation = getRotateAnimation(90);
						degrees = 90;
					}
					
				} 
				else if (event.values[1] < 4 && event.values[1] > -4) {
					
					if (event.values[0] > 0 && orientation != ExifInterface.ORIENTATION_NORMAL) {
						// LEFT
						//orientation = ExifInterface.ORIENTATION_NORMAL;
						//animation = getRotateAnimation(0);
						degrees = 0;
					} 
					else if (event.values[0] < 0 && orientation != ExifInterface.ORIENTATION_ROTATE_180) {
						// RIGHT
						//orientation = ExifInterface.ORIENTATION_ROTATE_180;
						//animation = getRotateAnimation(180);
						degrees = 180;
					}
					
				}
				
				if(lastDegrees != degrees){
					toolsOverlay.degreesChanged(degrees);
				}
				
			}
		}
	}
	
	/**
	 * Implement required method
	 */
	public void onAccuracyChanged(Sensor sensor, int accuracy) {
		
	}
}