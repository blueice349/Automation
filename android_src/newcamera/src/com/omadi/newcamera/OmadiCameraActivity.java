package com.omadi.newcamera;

import java.awt.image.BufferedImage;
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
import android.graphics.BitmapFactory;
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
	
	FrameLayout frameCameraViewContainer;
	private ImageView rotatingImage;
	private ImageView done;
	private ImageView flash;
	RelativeLayout zoomBase;
	private boolean isPreviewRunning = false;
	
	public static ToolsOverlay toolsOverlay = null;
	
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
		    	
			    Size optimalSize = getOptimalPreviewSize(p, height);
			    if(optimalSize != null){
			    	
			    	p.setPreviewSize(optimalSize.width, optimalSize.height);
			    }
			    
			    Size optimalPictureSize = getOptimalPictureSize(p);
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
	
	private Size getOptimalPictureSize(Camera.Parameters p){
		
		List<Size> pictureSizes = p.getSupportedPictureSizes();
		Size optimalSize = null;
		
	    if(pictureSizes.size() > 0){
		    int target = 1280;
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
	
	private Size getOptimalPreviewSize(Camera.Parameters p, int h) {
		List<Size> sizes = p.getSupportedPreviewSizes();
		Size photoSize = this.getOptimalPictureSize(p);
	    final double ASPECT_TOLERANCE = 0.05;
	    double targetRatio = (double)photoSize.width / (double)photoSize.height;
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
		
//		try{
//			camera.setPreviewDisplay(previewHolder);
//			camera.startPreview();
//		}
//	    catch(Exception e){
//	    	Log.e("CAMERA", "CAMERA Could not start preview: " + e.getMessage());
//	    }
	}

	// make sure to call release() otherwise you will have to force kill the app before 
	// the built in camera will open
	public void surfaceDestroyed(SurfaceHolder previewHolder) {
		try{
			camera.release();
		}
		catch(Exception e){
			Log.e("CAMERA", "CAMERA exception releasing: " + e.getMessage());
		}
		camera = null;
	}

	@Override
	protected void onResume() {
		super.onResume();
		
		Log.d("CAMERA", "CAMERA ON RESUME");
		
		try{
			camera = Camera.open();
		}
	    catch(Exception e){
	    	Log.e("CAMERA", "CAMERA Could not open camera: " + e.getMessage());
	    }
		
		cameraActivity = this;
		previewLayout.addView(preview);
		
		previewLayout.addView(toolsOverlay);
		
		// Register this class as a listener for the accelerometer sensor
		sensorManager.registerListener(this, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);
		
		Log.d("CAMERA", "CAMERA Sensor Registered");
	}

	@Override
	protected void onPause() {
		super.onPause();
		
		Log.d("CAMERA", "CAMERA ON PAUSE");
		
		previewLayout.removeView(toolsOverlay);
		previewLayout.removeView(preview);
		sensorManager.unregisterListener(this);
		
		try {
			if(camera != null){
				camera.release();
				camera = null;
			}
		}
		catch (Throwable t) {
			Log.d("CAMERA", "CAMERA is not open, unable to release: " + t.getMessage());
			t.printStackTrace();
		}

		cameraActivity = null;
		
		Log.d("CAMERA", "CAMERA Sensor unregistered");
	}

	public void takePicture() {
		Log.d("CAMERA", "CAMERA Taking picture");
		if(camera != null){
			try{
				camera.takePicture(null, null, jpegCallback);
			}
			catch(Exception e){
				Log.d("CAMERA", "CAMERA could not take picture: " + e.getMessage());
			}
		}
	}
	
	public PictureCallback jpegCallback = new PictureCallback() {

		public void onPictureTaken(byte[] data, Camera camera) {
			try {
				Log.d("CAMERA", "CAMERA JPEG generated");
				
				FileOutputStream outputStream = null;
				FileOutputStream thumbOutputStream = null;
				
				try {
					
					String filePath = cameraActivity.storageUri.getPath();
					
					cameraActivity.setResult(Activity.RESULT_OK);
					cameraActivity.finish();
					
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
					
					// Save orientation to photo
					ExifInterface exif = new ExifInterface(filePath);
					exif.setAttribute(ExifInterface.TAG_ORIENTATION, orientation + "");
					exif.saveAttributes();
	
					String thumbPath = filePath.replaceAll(".jpg$", "_thumb.jpg");
			        
					Message msg = Message.obtain();
					Bundle messageVars = new Bundle();
					messageVars.putInt("degrees", toolsOverlay.getDegreesAtCapture());
					messageVars.putString("filePath", filePath);
					messageVars.putString("thumbPath", thumbPath);
					
					//messageVars.putByteArray("media", data);
					msg.setData(messageVars);
					messageHandler.sendMessage(msg);
					
					Log.d("CAMERA", "CAMERA Image saved Correctly");
					
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
			
			if(NewcameraModule.finishedCallback != null){
				NewcameraModule instance = NewcameraModule.getInstance();
				if(instance != null){
					
					HashMap<String, Object> hm = new HashMap<String, Object>();
					Bundle messageVars = msg.getData();
					hm.put("filePath", messageVars.getString("filePath"));
					hm.put("thumbPath", messageVars.getString("thumbPath"));
					hm.put("degrees", messageVars.getInt("degrees"));
					
					NewcameraModule.finishedCallback.callAsync(instance.getKrollObject(), hm);
				}
			}
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
		
		try{
			synchronized (this) {
				if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
					
					int lastDegrees = degrees;
					
					if (event.values[0] < 4 && event.values[0] > -4) {
						
						if (event.values[1] > 0 && orientation != ExifInterface.ORIENTATION_ROTATE_90) {
							// UP
							degrees = 270;
						} 
						else if (event.values[1] < 0 && orientation != ExifInterface.ORIENTATION_ROTATE_270) {
							// UP SIDE DOWN
							degrees = 90;
						}
						
					} 
					else if (event.values[1] < 4 && event.values[1] > -4) {
						
						if (event.values[0] > 0 && orientation != ExifInterface.ORIENTATION_NORMAL) {
							// LEFT
							degrees = 0;
						} 
						else if (event.values[0] < 0 && orientation != ExifInterface.ORIENTATION_ROTATE_180) {
							// RIGHT
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
			Log.d("CAMERA", "CAMERA Exception onsensor change: " + e.getMessage());
		}
	}
	
	/**
	 * Implement required method
	 */
	public void onAccuracyChanged(Sensor sensor, int accuracy) {
		
	}
}