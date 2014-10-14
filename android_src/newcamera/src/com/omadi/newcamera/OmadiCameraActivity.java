package com.omadi.newcamera;

import java.awt.image.BufferedImage;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;

import org.appcelerator.titanium.TiBaseActivity;
import org.appcelerator.titanium.proxy.TiViewProxy;
import org.appcelerator.kroll.KrollObject;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
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
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import ti.modules.titanium.media.android.AndroidModule.MediaScannerClient;
import android.os.Environment;
import android.provider.MediaStore.Images;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class OmadiCameraActivity extends TiBaseActivity implements SurfaceHolder.Callback, SensorEventListener {
	private static final String LCAT = "OmadiCameraActivity";
	private static Camera camera = null;

	private TiViewProxy localOverlayProxy = null;
	private Uri storageUri;
	private SurfaceView preview;
	private FrameLayout previewLayout;
	private int orientation;
	private int degrees;
	private int currentPhotos;

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
	private boolean isLandscapeDevice;
	
	public static ToolsOverlay toolsOverlay = null;
	
	private int photosTaken = 0;
	
	private SensorManager sensorManager = null;
	Bitmap bitmap = null;
	
	public static KrollObject callbackContext;
	
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
		
		Configuration config = getResources().getConfiguration();
		int rotation = getWindowManager().getDefaultDisplay().getRotation();
		isLandscapeDevice = ((rotation == Surface.ROTATION_0 || rotation == Surface.ROTATION_180) && config.orientation == Configuration.ORIENTATION_LANDSCAPE) ||
				((rotation == Surface.ROTATION_90 || rotation == Surface.ROTATION_270) && config.orientation == Configuration.ORIENTATION_PORTRAIT);
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
	
	private void stopPreview(){
		if(camera == null || !isPreviewRunning){
			return;
		}
		
		try{
			camera.stopPreview();
		}
		catch(Exception e){
			// Don't worry about this
		}
		
		isPreviewRunning = false;
	}
	
	private void startPreview(SurfaceHolder previewHolder){
		if(camera == null){
			return;
		}
		
		if(isPreviewRunning){
			stopPreview();
		}
		
		try{
			camera.setPreviewDisplay(previewHolder);
			isPreviewRunning = true;
			camera.startPreview();
		}
		catch(Exception e){
			
			HashMap<String, Object> hm = new HashMap<String, Object>();
			hm.put("message", e.getMessage());
			hm.put("code", 14);
			
			NewcameraModule.errorCallback.callAsync(NewcameraModule.getInstance().getKrollObject(), hm);
		}
	}
	
	public void surfaceChanged(SurfaceHolder previewHolder, int format, int width, int height) {
		
		Log.d("CAMERA", "CAMERA SURFACE CHANGED");
		
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
	    }
		
		startPreview(previewHolder);
	   
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
		
		try{
			camera.setPreviewDisplay(previewHolder);
		}
	    catch(Exception e){
	    	NewcameraModule.sendErrorReport("CAMERA Could not start preview: " + e.getMessage());
	    	
	    	HashMap<String, Object> hm = new HashMap<String, Object>();
			hm.put("message", e.getMessage());
			hm.put("code", 15);
			
			NewcameraModule.errorCallback.callAsync(NewcameraModule.getInstance().getKrollObject(), hm);
	    }
	}

	// make sure to call release() otherwise you will have to force kill the app before 
	// the built in camera will open
	public void surfaceDestroyed(SurfaceHolder previewHolder) {
		
		stopPreview();
		
		if(camera != null){
			try{
				camera.release();
			}
			catch(Exception e){
				NewcameraModule.sendErrorReport("CAMERA exception releasing: " + e.getMessage());
			}
			camera = null;
		}
	}
	
	private void openCamera(){
		String exceptionMessage = "No exception";
		
		Log.d("CAMERA", "CAMERA in open camera");
		
		if (isPreviewRunning) {
			stopPreview();
		}
		
		Log.d("CAMERA", "CAMERA preview stopped");

		if (camera != null) {
			try{
				camera.release();
			}
			catch(Exception e){
				NewcameraModule.sendErrorReport("CAMERA exception releasing: " + e.getMessage());
			}
			camera = null;
		}
		
		Log.d("CAMERA", "CAMERA released");

		try{
			camera = Camera.open();
		}
		catch(Exception e){
			exceptionMessage = e.getMessage();
			NewcameraModule.sendErrorReport("Failed to open camera", e);
		}
		
		Log.d("CAMERA", "CAMERA after open: " + exceptionMessage);
		
		if (camera == null) {
			
			Log.d("CAMERA", "CAMERA released");
			
			HashMap<String, Object> hm = new HashMap<String, Object>();
			hm.put("message", "Could not open camera.");
			hm.put("code", 15);
			
			NewcameraModule.errorCallback.callAsync(NewcameraModule.getInstance().getKrollObject(), hm);
		}
	}
	
	// Onresume is the only place to open the camera
	@Override
	protected void onResume() {
		super.onResume();
		
		Log.d("CAMERA", "CAMERA ON RESUME");
		
		openCamera();
		
		if(camera != null){
			Log.d("CAMERA", "CAMERA Opened");
			
			cameraActivity = this;
			
			try{
				
				previewLayout.removeAllViews();
				previewLayout.addView(preview);
				previewLayout.addView(toolsOverlay);
				
				// Register this class as a listener for the accelerometer sensor
				sensorManager.registerListener(this, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);
			}
			catch(Exception e){
				NewcameraModule.sendError("Could not open the camera preview.", e.getMessage());
			}
			
			Log.d("CAMERA", "CAMERA Sensor Registered");
		}
	}

	@Override
	protected void onPause() {
		super.onPause();
		
		Log.d("CAMERA", "CAMERA ON PAUSE");
		
		try{
			stopPreview();
			previewLayout.removeView(toolsOverlay);
			previewLayout.removeView(preview);
			sensorManager.unregisterListener(this);
		}
		catch(Exception e){
			// do nothing
		}
		
		try {
			if(camera != null){
				camera.release();
				camera = null;
			}
		}
		catch (Throwable t) {
			Log.d("CAMERA", "CAMERA is not open, unable to release: " + t.getMessage());
			NewcameraModule.sendErrorReport("CAMERA is not open, unable to release: " + t.getMessage());
			t.printStackTrace();
		}

		cameraActivity.setResult(Activity.RESULT_OK);
		cameraActivity.finish();
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
				autoFinishActivityWithError("Could not take photo: " + e.getMessage());
			}
		}
		else{
			autoFinishActivityWithError("Camera could not be found.");
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
					
					File imageFile = new File(filePath);
					
					// write photo to storage
					outputStream = new FileOutputStream(filePath);
					outputStream.write(data);
					outputStream.close();
					
					try{
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
					}
					catch(Exception e){
						// do nothing, don't worry abou tthis
					}
					
					File rootsd = Environment.getExternalStorageDirectory();
					
					Calendar cal = Calendar.getInstance();
					SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd_kk-mm-ss");
					String dateString = dateFormat.format(cal.getTime());
					
					String localPath = rootsd.getAbsolutePath() + "/dcim/Camera/o_" + dateString + "_" + photosTaken + imageFile.getName();
					
					boolean errorOccured = moveImage(imageFile.getAbsolutePath(), localPath);
					String localUrl = "file://" + localPath;
					
					//String thumbPath = filePath.replaceAll(".jpg$", "_thumb.jpg");
					
					HashMap<String, Object> hm = new HashMap<String, Object>();
					hm.put("filePath", localUrl);
					hm.put("thumbPath", "");
					hm.put("degrees", toolsOverlay.getDegreesAtCapture());
					hm.put("photoIndex", photosTaken);
					
					photosTaken ++;
					
					NewcameraModule.addedPhotoCallback.callAsync(NewcameraModule.getInstance().getKrollObject(), hm);
					
					Log.d("CAMERA", "CAMERA Image saved Correctly");
					
					if(photosTaken < NewcameraModule.maxPhotos || NewcameraModule.maxPhotos == -1){
						toolsOverlay.photoSaved();
						//toolsOverlay.resetCaptureButton();
						camera.startPreview();
					}
					else{
						cameraActivity.setResult(Activity.RESULT_OK);
						cameraActivity.finish();
					}
				} 
				catch (FileNotFoundException e) {
					e.printStackTrace();
					autoFinishActivityWithError(e.getMessage());
				} 
				catch (IOException e) {
					e.printStackTrace();
					autoFinishActivityWithError(e.getMessage());
				}
			
			}
			catch (Exception ex) {
				ex.printStackTrace();
				autoFinishActivityWithError(ex.getMessage());
			}
		}
	};
	
	private void autoFinishActivityWithError(String message){
		NewcameraModule.errorMessage = message;
		
		cameraActivity.setResult(13);
		cameraActivity.finish();
	}
	
	private boolean moveImage(String source, String dest)
	{

		BufferedInputStream bis = null;
		BufferedOutputStream bos = null;
		File src = null;
		File dst = null;
		boolean errorOccured = false;
		
		try {
			src = new File(source);
			dst = new File(dest);
			bis = new BufferedInputStream(new FileInputStream(src), 8096);
			bos = new BufferedOutputStream(new FileOutputStream(dst), 8096);

			byte[] buf = new byte[8096];
			int len = 0;
			while ((len = bis.read(buf)) != -1) {
				bos.write(buf, 0, len);
			}

		} catch (IOException e) {
			NewcameraModule.sendErrorReport("Unable to move file: " + e.getMessage(), e);
			errorOccured = true;
		}
		
		try {
			if (bis != null) {
				bis.close();
			}
		} catch (IOException e) {
			NewcameraModule.sendErrorReport("Unable to close BufferedInputStream: " + e.getMessage(), e);
		}
		try {
			if (bos != null) {
				bos.close();
			}
		} catch (IOException e) {
			NewcameraModule.sendErrorReport("Unable to close BufferedOutputStream: " + e.getMessage(), e);
		}
		if (src != null) {
			src.delete();
		}
		if (errorOccured && dst != null) {
			dst.delete();
		}
		
		return !errorOccured;
	}
	
	static Handler messageHandler = new Handler() {
		@Override
		public void dispatchMessage(Message msg) {
			
			if(NewcameraModule.addedPhotoCallback != null){
				NewcameraModule instance = NewcameraModule.getInstance();
				
				if(instance != null){
					HashMap<String, Object> hm = new HashMap<String, Object>();
					Bundle messageVars = msg.getData();
					hm.put("filePath", messageVars.getString("filePath"));
					hm.put("thumbPath", messageVars.getString("thumbPath"));
					hm.put("degrees", messageVars.getInt("degrees"));
					
					NewcameraModule.addedPhotoCallback.callAsync(callbackContext, hm);
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
						if (isLandscapeDevice) {
							degrees = (degrees + 90) % 360;
						}
						toolsOverlay.degreesChanged(degrees);
					}
				}
			}
		}
		catch(Exception e){
			NewcameraModule.sendErrorReport("CAMERA Exception onsensor change: " + e.getMessage(), e);
			Log.d("CAMERA", "CAMERA Exception onsensor change: " + e.getMessage());
		}
	}
	
	/**
	 * Implement required method
	 */
	public void onAccuracyChanged(Sensor sensor, int accuracy) {
		
	}
}