
package com.omadi.newcamera;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollRuntime;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiBaseActivity;
import org.appcelerator.titanium.TiBlob;
import org.appcelerator.titanium.TiContext;
import org.appcelerator.titanium.io.TiFileFactory;
import org.appcelerator.titanium.proxy.TiViewProxy;
import org.appcelerator.titanium.util.TiActivityResultHandler;
import org.appcelerator.titanium.util.TiActivitySupport;
import org.appcelerator.titanium.util.TiConvert;
import org.appcelerator.titanium.util.TiFileHelper;
import org.appcelerator.titanium.util.TiIntentWrapper;
import org.appcelerator.kroll.common.Log;
import org.appcelerator.kroll.common.TiConfig;
import org.appcelerator.titanium.TiC;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.hardware.Camera;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.provider.MediaStore;
import android.provider.MediaStore.Images;
import android.util.Base64;
import ti.modules.titanium.media.android.AndroidModule.MediaScannerClient;
import android.os.Build;
import android.os.Environment;


@Kroll.module(name="Newcamera", id="com.omadi.newcamera")
public class NewcameraModule extends KrollModule
{
	
	private static final String PHOTO_DCIM_CAMERA = "/sdcard/dcim/Camera";
	
	@Kroll.constant public static final int NO_CAMERA = 2;
	@Kroll.constant public static final int UNKNOWN_ERROR = 0;
	@Kroll.constant public static final String MEDIA_TYPE_PHOTO = "public.image";
	@Kroll.constant public static final String MEDIA_TYPE_VIDEO = "public.video";
	
	// Standard Debugging variables
	private static final String LCAT = "NewcameraModule";
	private static final boolean DBG = TiConfig.LOGD;
	protected static final int MSG_INVOKE_CALLBACK = KrollModule.MSG_LAST_ID + 100;
	
	static KrollFunction finishedCallback = null;
	static KrollFunction addedPhotoCallback = null;
	static KrollFunction sendErrorCallback = null;
	static KrollFunction errorCallback = null;
	
	static String errorMessage = "";
	
	static int maxPhotos = -1;
	// You can define constants with @Kroll.constant, for example:
	// @Kroll.constant public static final String EXTERNAL_NAME = value;
	
	public NewcameraModule()
	{
		super();
	}

	@Kroll.onAppCreate
	public static void onAppCreate(TiApplication app)
	{
		Log.d(LCAT, "inside new camera onAppCreate");
		// put module init code that needs to run when the application is created
	}

	private static NewcameraModule _instance;

	public static NewcameraModule getInstance(){
		return _instance;
  	}

  	public NewcameraModule(TiContext tiContext)
  	{
	  	super(tiContext);
   		_instance = this;
    }
	
	@Kroll.method
	public void takePicture()
	{
		// make sure the preview / camera are open before trying to take photo
		if (OmadiCameraActivity.cameraActivity != null) {
			OmadiCameraActivity.cameraActivity.takePicture();
		} else {
			sendErrorReport("camera preview is not open, unable to take photo");
		}
	}
	
	@Kroll.method
	public String base64Encode(String filePath){
		int bytesRead = 0;
		String base64 = "";
		int bufferSize;
		FileInputStream fin = null;
		StackTraceElement[] stackTrace;
		
		try{
			filePath = filePath.replaceFirst("^file://", "");
			
			File file = new File(filePath);
			
			bufferSize = (int)file.length();
			
			fin = new FileInputStream(file);
			
			byte[] buffer = new byte[bufferSize]; 
			
			BufferedInputStream buf = new BufferedInputStream(fin);
		
			bytesRead = buf.read(buffer, 0, bufferSize);
			
			if(bytesRead != bufferSize){
				
			}
			
			buf.close();
			fin.close();
			
			base64 = Base64.encodeToString(buffer, Base64.DEFAULT);
		}
		catch(java.io.FileNotFoundException fileEx){
			base64 = "File Not Found: " + fileEx.getMessage() + " " + filePath + " ";
			stackTrace = fileEx.getStackTrace();
			for(StackTraceElement element : stackTrace){
				base64 += "\n\nclass:" + element.getClassName() + ", file:" + element.getFileName() + ", method" + element.getMethodName() + ", line:" + element.getLineNumber() + ", isnative" + element.isNativeMethod();
			}
		}
		catch(java.io.IOException ioEx){
			base64 = "IO Exception: " + ioEx.getMessage();
			stackTrace = ioEx.getStackTrace();
			for(StackTraceElement element : stackTrace){
				base64 += "\n\nclass:" + element.getClassName() + ", file:" + element.getFileName() + ", method" + element.getMethodName() + ", line:" + element.getLineNumber() + ", isnative" + element.isNativeMethod();
			}
		}
		catch(Exception e){
			base64 = "Other Exception: " + e.getMessage();
			stackTrace = e.getStackTrace();
			for(StackTraceElement element : stackTrace){
				base64 += "\n\nclass:" + element.getClassName() + ", file:" + element.getFileName() + ", method" + element.getMethodName() + ", line:" + element.getLineNumber() + ", isnative" + element.isNativeMethod();
			}
		}
		
		return base64;
	}
	
	@Kroll.method
	public String resizeImage(String filePath, int degrees){
		String retval = "Unknown";
		Bitmap bitmap = null;
		BitmapFactory.Options bitmapOptions = null;
		
		// if returning "Unknown", something weird happened
		// if returning "Error ...", an error occurred
		// if returning "Resized", everything went smoothly 
		// if returning "No Resize Necessary", the camera took a photo small enough already
		
		try{
			
			bitmapOptions = new BitmapFactory.Options();
			// decrease the amount of memory by 4 when loading
			
			bitmapOptions.inJustDecodeBounds = true;
			
			BitmapFactory.decodeFile(filePath, bitmapOptions);
		}
		catch(Exception e){
			retval = "Memory Error 1: " + e.getMessage();
			return retval;
		}
		
		try{
			bitmapOptions.inJustDecodeBounds = false;
			
			if(bitmapOptions.outHeight >= 2000 || bitmapOptions.outWidth >= 2000){
				bitmapOptions.inSampleSize = 2;
			}
			
			bitmap = BitmapFactory.decodeFile(filePath, bitmapOptions);
		}
		catch(Exception e){
			retval = "Memory Error 2: " + e.getMessage();
			return retval;
		}
		
		if(bitmap == null){
			Log.d("CAMERA", "CAMERA Initial bitmap is null");
			retval = "Bitmap Error 3: bitmap is null";
		}
		else{
			int height = 0;
			int width = 0;
			int newWidth = 0;
			int newHeight = 0;
			float scale = 0;
			int max = 0;
			
			try{
				height = bitmap.getHeight();
				width = bitmap.getWidth();
			}
			catch(Exception e){
				retval = "Bitmap Error 4: " + e.getMessage();
				return retval;
			}
			
			newWidth = width;
			newHeight = height;
			
			scale = 1.0f;
			max = 1000;
			
			if (height > max || width > max) {
				
				try{
			        if (width > height) {
			        	scale = (float)max / (float)width;
			        } 
			        else {
			            scale = (float)max / (float)height;
			        }
				}
				catch(Exception e){
					retval = "Bitmap Error 5: " + e.getMessage();
					return retval;
				}
				
				if(scale <= 0){
					Log.d("CAMERA", "CAMERA Scale=0 H=" + height + " W=" + width);
					retval = "Bitmap Error 6: scale less than or equal to 0";
				}
				else{
					try{
						newWidth = Math.round((float)width * scale);
						newHeight = Math.round((float)height * scale);
					}
					catch(Exception e){
						retval = "Bitmap Error 7: could not get new width/height";
						return retval;
					}
		        	
		        	Bitmap resized = null;
		        	
		        	try{
		        		resized = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true);
		        	}
					catch(Exception e){
						retval = "Memory Error 8: " + e.getMessage();
						bitmap.recycle();
						bitmap = null;
						return retval;
					}
					
					bitmap.recycle();
					bitmap = null;
					
					try {
						String resizedFilePath = filePath.replaceAll(".jpg$", "_resized.jpg");
						
					    FileOutputStream out = new FileOutputStream(resizedFilePath);
					    resized.compress(Bitmap.CompressFormat.JPEG, 90, out);
					    out = null;
					    retval = "Resized";
					}
					catch (Exception e) {
					    e.printStackTrace();
					    Log.d("CAMERA", "CAMERA writing resize file: " + e.getMessage());
					    retval = "Write Error 9: " + e.getMessage();
					}
					
					resized.recycle();
					resized = null;
		        }
		    }
			else{
				Log.d("CAMERA", "CAMERA The photo does not need to be resized");
				retval = "No Resize Necessary";
			}
		}
		
		return retval;
	}
	
	public static void sendError(String message, String adminMessage){
		
		sendErrorReport(message + ": " + adminMessage);
			
		if(NewcameraModule.errorCallback == null){
			return;
		}
		
		NewcameraModule instance = NewcameraModule.getInstance();
		if(instance != null){
			
			HashMap<String, Object> hm = new HashMap<String, Object>();
			hm.put("error", message);
			hm.put("message", adminMessage);
			
			NewcameraModule.errorCallback.callAsync(instance.getKrollObject(), hm);
		}
	}
	
	public static void sendErrorReport(String message) {
		Log.e("CAMERA", message);
		
		if(NewcameraModule.sendErrorCallback == null){
			return;
		}
		
		NewcameraModule instance = NewcameraModule.getInstance();
		if(instance != null){
			HashMap<String, Object> hm = new HashMap<String, Object>();
			hm.put("message", message);
			
			NewcameraModule.sendErrorCallback.callAsync(instance.getKrollObject(), hm);
		}
	}
	
	public static void sendErrorReport(String message, Exception e) {
		Log.e("CAMERA", message, e);
		
		if(NewcameraModule.sendErrorCallback == null){
			return;
		}
		
		NewcameraModule instance = NewcameraModule.getInstance();
		if(instance != null){
			HashMap<String, Object> hm = new HashMap<String, Object>();
			hm.put("message", message + ": " + e.getMessage());
			
			NewcameraModule.sendErrorCallback.callAsync(instance.getKrollObject(), hm);
		}
	}
	
	@Kroll.method
	public void showCamera(HashMap options)
	{
		
		KrollFunction cancelCallback = null;
		KrollFunction successCallback = null;

		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		if (options.containsKey("cancel")) {
			cancelCallback = (KrollFunction) options.get("cancel");
		}
		if (options.containsKey("error")) {
			errorCallback = (KrollFunction) options.get("error");
		}
		if (options.containsKey("finished")) {
			finishedCallback = (KrollFunction) options.get("finished");
		}
		if (options.containsKey("addedPhoto")) {
			addedPhotoCallback = (KrollFunction) options.get("addedPhoto");
		}
		if (options.containsKey("sendError")) {
			sendErrorCallback = (KrollFunction) options.get("sendError");
		}
		if (options.containsKey("maxPhotos")) {
			maxPhotos = (Integer) options.get("maxPhotos");
		}
		
		if (options.containsKey("overlay")) {
			OmadiCameraActivity.overlayProxy = (TiViewProxy) options.get("overlay");
		}
		if (options.containsKey("storageDirectory")) {
			OmadiCameraActivity.storageDirectory = (String) options.get("storageDirectory");
		}

		Activity activity = TiApplication.getInstance().getCurrentActivity();
		TiActivitySupport activitySupport = (TiActivitySupport) activity;
		TiFileHelper tfh = TiFileHelper.getInstance();

		File imageDir = null;
		File imageFile = null;
		
		TiIntentWrapper cameraIntent = new TiIntentWrapper(new Intent());

		if(OmadiCameraActivity.overlayProxy == null) {
			cameraIntent.getIntent().setAction(MediaStore.ACTION_IMAGE_CAPTURE);
			cameraIntent.getIntent().addCategory(Intent.CATEGORY_DEFAULT);
		} 
		else{
			cameraIntent.getIntent().setClass(TiApplication.getInstance().getBaseContext(), OmadiCameraActivity.class);
		}

		//cameraIntent.setWindowId(TiIntentWrapper.createActivityName("CAMERA"));

		PackageManager pm = (PackageManager) activity.getPackageManager();
		List<ResolveInfo> activities = pm.queryIntentActivities(cameraIntent.getIntent(), PackageManager.MATCH_DEFAULT_ONLY);

		// See if it's the HTC camera app
		boolean isHTCCameraApp = false;

		for (ResolveInfo rs : activities) {
			try {
				if (rs.activityInfo.applicationInfo.sourceDir.contains("HTC")
						|| Build.MANUFACTURER.equals("HTC")) {
					isHTCCameraApp = true;
					break;
				}
			} catch (NullPointerException e) {
				// Ignore
			}
		}
		
		
		try {
			if (activity.getIntent() != null) {
				String name = TiApplication.getInstance().getAppInfo()
						.getName();
				// For HTC cameras, specifying the directory from
				// getExternalStorageDirectory is /mnt/sdcard and
				// using that path prevents the gallery from recognizing it.
				// To avoid this we use /sdcard instead
				// (this is a legacy path we've been using)
				if (isHTCCameraApp) {
					imageDir = new File(PHOTO_DCIM_CAMERA, name);
				} 
				else {
					File rootsd = Environment.getExternalStorageDirectory();
					imageDir = new File(rootsd.getAbsolutePath()
							+ "/dcim/Camera/", name);
				}
				
				if (!imageDir.exists()) {
					imageDir.mkdirs();
					if (!imageDir.exists()) {
						Log.w("CAMERA", "Attempt to create '" + imageDir.getAbsolutePath() + "' failed silently.");
						NewcameraModule.sendErrorReport("Attempt to create '" + imageDir.getAbsolutePath() + "' failed silently.");
					}
				}
			} 
			else {
				imageDir = tfh.getDataDirectory(false);
			}
	
			imageFile = tfh.getTempFile(imageDir, ".jpg", true);
		}
		catch (IOException e) {
			sendErrorReport("Unable to create temp file", e);
			if (errorCallback != null) {
				errorCallback.callAsync(getKrollObject(), createErrorResponse(UNKNOWN_ERROR, e.getMessage()));
			}

			return;
		}

		OmadiCameraResultHandler resultHandler = new OmadiCameraResultHandler();
		resultHandler.imageFile = imageFile;
		resultHandler.successCallback = successCallback;
		resultHandler.cancelCallback = cancelCallback;
		resultHandler.errorCallback = errorCallback;
		resultHandler.addedPhotoCallback = addedPhotoCallback;
		resultHandler.sendErrorCallback = sendErrorCallback;
		resultHandler.activitySupport = activitySupport;
		resultHandler.cameraIntent = cameraIntent.getIntent();
		
		if (imageFile != null) {
			String imageUrl = "file://" + imageFile.getAbsolutePath();
			cameraIntent.getIntent().putExtra(MediaStore.EXTRA_OUTPUT, Uri.parse(imageUrl));
			resultHandler.imageUrl = imageUrl;
		}
		
		activity.runOnUiThread(resultHandler);
	}
	
	protected class OmadiCameraResultHandler implements TiActivityResultHandler, Runnable
	{
		protected File imageFile;
		protected String imageUrl;
		protected boolean saveToPhotoGallery;
		protected int code;
		protected KrollFunction successCallback, cancelCallback, errorCallback, addedPhotoCallback, sendErrorCallback;
		protected TiActivitySupport activitySupport;
		protected Intent cameraIntent;

		@Override
		public void run()
		{
			code = activitySupport.getUniqueResultCode();
			activitySupport.launchActivityForResult(cameraIntent, code, this);
		}

		@Override
		public void onResult(Activity activity, int requestCode, int resultCode, Intent data)
		{
			if (resultCode == Activity.RESULT_OK || resultCode == Activity.RESULT_CANCELED) {
				Log.d("CAMERA", "Finished camera activity successfully.");
				if (successCallback != null) {
					successCallback.callAsync(getKrollObject(), new Object[] {});
				}
			} else {
				Log.d("CAMERA", "Finished camera activity with error.");
				if (errorCallback != null) {
					HashMap<String, Object> hm = new HashMap<String, Object>();
					hm.put("code", resultCode);
					hm.put("message", NewcameraModule.errorMessage);
					errorCallback.callAsync(getKrollObject(), hm);
				}
			}
		}

		@Override
		public void onError(Activity activity, int requestCode, Exception e) {
			
			String msg = "Camera problem: " + e.getMessage();
			sendErrorReport(msg);
			
			if (errorCallback != null) {
				errorCallback.callAsync(getKrollObject(), createErrorResponse(UNKNOWN_ERROR, msg));
			}
		}
	}
	
	private void invokeCallback(TiBaseActivity callbackActivity, KrollFunction callback, KrollObject krollObject, KrollDict callbackArgs)
	{
		if (KrollRuntime.getInstance().isRuntimeThread()) {
			doInvokeCallback(callbackActivity, callback, krollObject, callbackArgs);

		} else {
			CallbackWrapper callbackWrapper = new CallbackWrapper(callbackActivity, callback, krollObject, callbackArgs);
			Message message = getRuntimeHandler().obtainMessage(MSG_INVOKE_CALLBACK, callbackWrapper);
			message.sendToTarget();
		}
	}
	
	private void doInvokeCallback(TiBaseActivity callbackActivity, KrollFunction callback, KrollObject krollObject, KrollDict callbackArgs)
	{
		if (callbackActivity.isResumed) {
			callback.callAsync(krollObject, callbackArgs);

		} else {
			CallbackWrapper callbackWrapper = new CallbackWrapper(callbackActivity, callback, krollObject, callbackArgs);
			Message message = getRuntimeHandler().obtainMessage(MSG_INVOKE_CALLBACK, callbackWrapper);
			message.sendToTarget();
		}
	}
	
	KrollDict createDictForImage(String path, String mimeType) {
		KrollDict d = new KrollDict();

		int width = -1;
		int height = -1;

		try {
			String fpath = path;
			if (!fpath.startsWith("file://") && !fpath.startsWith("content://")) {
				fpath = "file://" + path;
			}
			BitmapFactory.Options opts = new BitmapFactory.Options();
			opts.inJustDecodeBounds = true;

			// We only need the ContentResolver so it doesn't matter if the root or current activity is used for
			// accessing it
			BitmapFactory.decodeStream(
				TiApplication.getAppRootOrCurrentActivity().getContentResolver().openInputStream(Uri.parse(fpath)), null,
				opts);

			width = opts.outWidth;
			height = opts.outHeight;
		} catch (FileNotFoundException e) {
			NewcameraModule.sendErrorReport("bitmap not found: " + path, e);
			Log.w(LCAT, "bitmap not found: " + path);
		}

		d.put("x", 0);
		d.put("y", 0);
		d.put("width", width);
		d.put("height", height);

		KrollDict cropRect = new KrollDict();
		cropRect.put("x", 0);
		cropRect.put("y", 0);
		cropRect.put("width", width);
		cropRect.put("height", height);
		d.put("cropRect", cropRect);

		String[] parts = { path };
		d.put("mediaType", MEDIA_TYPE_PHOTO);
		d.put("media", TiBlob.blobFromFile(TiFileFactory.createTitaniumFile(parts, false), mimeType));

		return d;
	}

	KrollDict createDictForImage(int width, int height, byte[] data) {
		KrollDict d = new KrollDict();

		d.put("x", 0);
		d.put("y", 0);
		d.put("width", width);
		d.put("height", height);

		KrollDict cropRect = new KrollDict();
		cropRect.put("x", 0);
		cropRect.put("y", 0);
		cropRect.put("width", width);
		cropRect.put("height", height);
		d.put("cropRect", cropRect);
		d.put("mediaType", MEDIA_TYPE_PHOTO);
		d.put("media", TiBlob.blobFromData(data, "image/png"));

		return d;
	}
	
	/**
	 * Object that is used to wrap required fields for async processing when invoking 
	 * success, error , etc callbacks for camera
	 */
	private class CallbackWrapper
	{
		public TiBaseActivity callbackActivity;
		public KrollFunction callback;
		public KrollObject krollObject;
		public KrollDict callbackArgs;

		CallbackWrapper(TiBaseActivity callbackActivity, KrollFunction callback, KrollObject krollObject, KrollDict callbackArgs)
		{
			this.callbackActivity = callbackActivity;
			this.callback = callback;
			this.krollObject = krollObject;
			this.callbackArgs = callbackArgs;
		}
	}

}

