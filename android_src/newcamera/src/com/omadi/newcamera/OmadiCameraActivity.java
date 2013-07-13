package com.omadi.newcamera;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import org.appcelerator.titanium.TiBaseActivity;
import org.appcelerator.titanium.proxy.TiViewProxy;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.graphics.ImageFormat;
import android.hardware.Camera;
import android.hardware.Camera.Size;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.hardware.Camera.PictureCallback;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.provider.MediaStore;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;

public class OmadiCameraActivity extends TiBaseActivity implements SurfaceHolder.Callback, SensorEventListener {
	private static final String LCAT = "OmadiCameraActivity";
	private static Camera camera = null;

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
	private boolean isPreviewRunning = false;
	
	public static ToolsOverlay toolsOverlay = null;
	//VerticalSeekBar zoomControls;
	private SensorManager sensorManager = null;
	Bitmap bitmap = null;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// set picture location
		storageUri = (Uri)getIntent().getParcelableExtra(MediaStore.EXTRA_OUTPUT);
		
		toolsOverlay = new ToolsOverlay(this);
		
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
		
		// Getting the sensor service.
	    sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
		
		setContentView(previewLayout);
	}
	
	public static Camera.Parameters getCameraParameters(){
		if(camera != null){
			return camera.getParameters();
		}
		return null;
	}
	
	public static void setCameraParameters(Camera.Parameters params){
		camera.setParameters(params);
	}

	public void surfaceChanged(SurfaceHolder previewHolder, int format, int width, int height) {
		
		Log.d("CAMERA", "CAMERA SURFACE CHANGED");
		
		if (isPreviewRunning) {
			if(camera != null){
				camera.stopPreview();
			}
	    }
		
	    try{
		    Camera.Parameters p = camera.getParameters();
		    if(p!=null){
		    	
			    List<Size> sizes = p.getSupportedPreviewSizes();
			    Size optimalSize = getOptimalPreviewSize(sizes, width, height);
			    if(optimalSize != null){
			    	
			    	p.setPreviewSize(optimalSize.width, optimalSize.height);
			    }
			    
			    List<Size> pictureSizes = p.getSupportedPictureSizes();
			    Size optimalPictureSize = getOptimalPictureSize(pictureSizes);
			    if(optimalPictureSize != null){
			    	
			    	Log.d("CAMERA", "CAMERA OPTIMAL PICTURE SIZE: " + optimalPictureSize.width + "x" + optimalPictureSize.height);
			    	p.setPictureSize(optimalPictureSize.width, optimalPictureSize.height);
			    }
			    
			    // Set to 90% quality
			    p.setJpegQuality(90);
			    p.setPictureFormat(ImageFormat.JPEG);
			    
			    camera.setParameters(p);
			    
		
			    camera.setPreviewDisplay(previewHolder);
			    camera.startPreview();
		    }
	    } 
	    catch (IOException e) {
	        // TODO Auto-generated catch block
	        e.printStackTrace();
	    }

	    isPreviewRunning = true;
		
		toolsOverlay.cameraInitialized(camera);
	}
	
	private Size getOptimalPictureSize(List<Size> pictureSizes){
		Size optimalSize = null;
		
	    if(pictureSizes.size() > 0){
		    int target = 1000;
		    int minDiff = Integer.MAX_VALUE;
		    
		    for (Size pictureSize : pictureSizes) {
		    	Log.d("CAMERA", "CAMERA SIZE: " + pictureSize.width + "x" + pictureSize.height);
		    	if(pictureSize.width > pictureSize.height){
		    		// Make sure it's in landscape mode
		    		if(pictureSize.width <= target){
		    			// Make sure it's smaller than the target size
		    			
		    			if(target - pictureSize.width < minDiff){
		    				optimalSize = pictureSize;
		    				minDiff = target - pictureSize.width;
		    			}
		    		}
		    	}
		    }
		    
		    if(optimalSize == null){
		    	// Get smallest size
		    	for (Size pictureSize : pictureSizes) {
		    		if(pictureSize.width > pictureSize.height){
		    			// Make sure it's in landscape mode
				    	if(optimalSize == null){
				    		optimalSize = pictureSize;
				    	}
				    	else if(pictureSize.width < optimalSize.width){
				    		optimalSize = pictureSize;
				    	}
				    }
		    	}
		    }
	    }
	    
	    return optimalSize;
	}
	
	private Size getOptimalPreviewSize(List<Size> sizes, int w, int h) {
	    
	    final double ASPECT_TOLERANCE = 0.05;
	    double targetRatio = (double) w / h;
	    if (sizes == null) return null;

	    Size optimalSize = null;
	    double minDiff = Double.MAX_VALUE;

	    int targetHeight = h;

	    // Try to find an size match aspect ratio and size
	    for (Size size : sizes) {
		    double ratio = (double) size.width / size.height;
		    if (Math.abs(ratio - targetRatio) > ASPECT_TOLERANCE){
		    	continue;
		    }
		    if(size.width > size.height){
		    	// Make sure it's in landscape mode
			    if (Math.abs(size.height - targetHeight) < minDiff) {
				    optimalSize = size;
				    minDiff = Math.abs(size.height - targetHeight);
				}
		    }
	    }
		
	    // Cannot find the one match the aspect ratio, ignore the requirement
	    if (optimalSize == null) {
		    minDiff = Double.MAX_VALUE;
		    for (Size size : sizes) {
		    	if(size.width > size.height){
		    		// Make sure it's in landscape mode
				    if (Math.abs(size.height - targetHeight) < minDiff) {
					    optimalSize = size;
					    minDiff = Math.abs(size.height - targetHeight);
				    }
		    	}
		    }
	    }
	    return optimalSize;
	}

	public void surfaceCreated(SurfaceHolder previewHolder) {
		Log.d("CAMERA", "CAMERA SURFACE CREATED");
		
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
//
//		try {
//			Log.i(LCAT, "setting preview display");
//			camera.setPreviewDisplay(previewHolder);
//		} catch(IOException e) {
//			e.printStackTrace();
//		}
		
		//toolsOverlay.cam
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
		
		Log.d("CAMERA", "CAMERA ON RESUME");
		
		cameraActivity = this;
		previewLayout.addView(preview);
		
		//previewLayout.addView(localOverlayProxy.getOrCreateView().getNativeView(), new FrameLayout.LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
		
		//if(camera != null){
			//toolsOverlay.cameraInitialized();
		//}
		
		previewLayout.addView(toolsOverlay);
		
		// Register this class as a listener for the accelerometer sensor
		sensorManager.registerListener(this, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);
		
		Log.d("CAMERA", "Sensor Registered");
	}

	@Override
	protected void onPause() {
		super.onPause();
		
		Log.d("CAMERA", "CAMERA ON PAUSE");
		
		previewLayout.removeView(toolsOverlay);
		
		previewLayout.removeView(preview);
		
		//previewLayout.removeView(localOverlayProxy.getOrCreateView().getNativeView());

		sensorManager.unregisterListener(this);
		
		try {
			if(camera != null){
				camera.release();
				camera = null;
			}
		}
		catch (Throwable t) {
			Log.d("CAMERA", "camera is not open, unable to release: " + t.getMessage());
			t.printStackTrace();
		}

		cameraActivity = null;
		
		Log.d("CAMERA", "Sensor unregistered");
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
		Log.d("CAMERA", "Taking picture");
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
				Log.d("CAMERA", "JPEG generated");
				//toolsOverlay.pictureTaken();
				
				FileOutputStream outputStream = null;
				
				try {
					
					String filePath = cameraActivity.storageUri.getPath();
					
					//java.util.Date date = new java.util.Date();
					
					//String filePath = OmadiCameraActivity.storageDirectory + "/p_" + System.currentTimeMillis() + ".jpg";
					
					// Titanium passes in the string with file:// included, so remove it
					//filePath = filePath.replaceFirst("file://", "");
					
					//URI fileURI = URI.create(filePath);
					
					//Log.i("CHRIS", "PATH: " + filePath);
					//Log.i("CHRIS", "PATH URI: " + fileURI.getPath());
					
					// get the degrees before the file is saved
					Message msg = Message.obtain();
					Bundle messageVars = new Bundle();
					messageVars.putInt("degrees", toolsOverlay.getDegreesAtCapture());
					messageVars.putString("filePath", filePath);
					
					//Log.i("CHRIS", "degrees: " + degrees);
					
					// write photo to storage
					outputStream = new FileOutputStream(filePath);
					outputStream.write(data);
					outputStream.close();
					
					int orientation = ExifInterface.ORIENTATION_NORMAL;
					switch(toolsOverlay.getDegreesAtCapture()){
					case 90:
						orientation = ExifInterface.ORIENTATION_ROTATE_270;
						break;
					case 270:
						orientation = ExifInterface.ORIENTATION_ROTATE_90;
						break;
					case 180:
						orientation = ExifInterface.ORIENTATION_ROTATE_180;
						break;
					}
					
					ExifInterface exif = new ExifInterface(filePath);
					exif.setAttribute(ExifInterface.TAG_ORIENTATION, orientation + "");
					exif.saveAttributes();
	
					cameraActivity.setResult(Activity.RESULT_OK);
					cameraActivity.finish();
					
					//messageVars.putByteArray("media", data);
					msg.setData(messageVars);
					messageHandler.sendMessage(msg);
					
					Log.d("CAMERA", "Image saved Correctly");
					
				} 
				catch (FileNotFoundException e) {
					e.printStackTrace();
				} 
				catch (IOException e) {
					e.printStackTrace();
				}
			
			}
			catch (Exception ex) {
				ex.printStackTrace();
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
		try{
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
		catch(Exception e){
			Log.d("CAMERA", "Exception onsensor change: " + e.getMessage());
		}
	}
	
	/**
	 * Implement required method
	 */
	public void onAccuracyChanged(Sensor sensor, int accuracy) {
		
	}
}