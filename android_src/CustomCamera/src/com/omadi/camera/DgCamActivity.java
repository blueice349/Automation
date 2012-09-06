package com.omadi.camera;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.appcelerator.kroll.KrollDict;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;
import android.hardware.Camera;
import android.hardware.Camera.PictureCallback;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.ExifInterface;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Base64;
import android.view.Display;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.RotateAnimation;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

public class DgCamActivity extends Activity implements SensorEventListener {
	private Context mContext;
	private Camera mCamera;
	private CameraPreview mPreview;
	private SensorManager sensorManager = null;
	private int orientation;
	private int deviceHeight;
	private int deviceWidth;
	RelativeLayout enerlayout;
	FrameLayout frameCameraViewContainer;
	private ImageView rotatingImage;
	private ImageView done;
	private int degrees = 0;
	Bitmap bitmap = null;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		mContext = this;
		
		LinearLayout rootlayout = new LinearLayout(mContext);
		rootlayout.setLayoutParams(new LinearLayout.LayoutParams(
				LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
		rootlayout.setOrientation(LinearLayout.HORIZONTAL);

		frameCameraViewContainer = new FrameLayout(mContext);
		frameCameraViewContainer.setLayoutParams(new FrameLayout.LayoutParams(
				412, LayoutParams.FILL_PARENT));
		rootlayout.addView(frameCameraViewContainer);

		enerlayout = new RelativeLayout(mContext);
		enerlayout.setLayoutParams(new RelativeLayout.LayoutParams(
				70, LayoutParams.FILL_PARENT));
		Drawable drawable = null;
		try {
			InputStream is = getAssets().open("gray_bg.png");
			drawable = Drawable.createFromStream(is, null);
		} catch (IOException e) {
			e.printStackTrace();
		}
		enerlayout.setBackgroundDrawable(drawable);

		rootlayout.addView(enerlayout);
		
		
		//DONE BUTTON
		done = new ImageView(mContext);
		RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(70, 100);
		params.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
		done.setLayoutParams(params);
		try {
			InputStream is = getAssets().open("done.png");
			bitmap = BitmapFactory.decodeStream(is);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		done.setImageBitmap(bitmap);
		done.setAnimation(getRotateAnimation(270));
		enerlayout.addView(done);
		
		done.setOnClickListener(new View.OnClickListener(){
			public void onClick(View v) {
				finish();
			}
		});
		
		done.setOnTouchListener(new View.OnTouchListener(){
			
			public boolean onTouch(View arg0, MotionEvent arg1) {
				switch (arg1.getAction() & MotionEvent.ACTION_MASK) {
				case MotionEvent.ACTION_DOWN:
					try {
						InputStream is = getAssets().open("done_hover.png");
						bitmap = BitmapFactory.decodeStream(is);
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					done.setImageBitmap(bitmap);
					break;
				case MotionEvent.ACTION_UP:
					try {
						InputStream is = getAssets().open("done.png");
						bitmap = BitmapFactory.decodeStream(is);
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					done.setImageBitmap(bitmap);
					break;
				}
				
				
				return false;
			}
		
		});
		
		//ROTATE/CAPTURE BUTTON 
		rotatingImage = new ImageView(mContext);
		RelativeLayout.LayoutParams params2 = new RelativeLayout.LayoutParams(
				LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
		params2.addRule(RelativeLayout.CENTER_IN_PARENT);
		rotatingImage.setLayoutParams(params2);
		
		try {
			InputStream is = getAssets().open("ic_menu_camera.png");
			 bitmap = BitmapFactory.decodeStream(is);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		rotatingImage.setImageBitmap(bitmap);
		enerlayout.addView(rotatingImage);
		
		setContentView(rootlayout);

		// Getting the sensor service.
		sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);

		// Selecting the resolution of the Android device so we can create a
		// proportional preview
		Display display = ((WindowManager) getSystemService(Context.WINDOW_SERVICE))
				.getDefaultDisplay();
		deviceHeight = display.getHeight();
		deviceWidth = display.getWidth();

		// Add a listener to the Capture button
		rotatingImage.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				mCamera.takePicture(null, null, mPicture);
			}
		});

	}
	
	private void createCamera() {
		// Create an instance of Camera
		mCamera = getCameraInstance();

		// Setting the right parameters in the camera
	//	Camera.Parameters params = mCamera.getParameters();
	//	params.setPictureFormat(PixelFormat.JPEG);
		//params.setJpegQuality(95);
	//	mCamera.setParameters(params);

		// Create our Preview view and set it as the content of our activity.
		mPreview = new CameraPreview(this, mCamera);

		// Resizing the LinearLayout so we can make a proportional preview. This
		// approach is not 100% perfect because on devices with a really small
		// screen the the image will still be distorted - there is place for
		// improvment.
		LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(deviceWidth-70, deviceHeight);
		frameCameraViewContainer.setLayoutParams(layoutParams);

		// Adding the camera preview after the FrameLayout and before the button
		// as a separated element.
		frameCameraViewContainer.addView(mPreview,0);
	}

	@Override
	protected void onResume() {
		super.onResume();
		// Creating the camera
		createCamera();

		// Register this class as a listener for the accelerometer sensor
		sensorManager.registerListener(this,
				sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER),
				SensorManager.SENSOR_DELAY_NORMAL);
	}

	@Override
	protected void onPause() {
		super.onPause();
		// release the camera immediately on pause event
		releaseCamera();

		// removing the inserted view - so when we come back to the app we
		// won't have the views on top of each other.
		frameCameraViewContainer.removeViewAt(0);
	}

	private void releaseCamera() {
		if (mCamera != null) {
			mCamera.release(); // release the camera for other applications
			mCamera = null;
		}
	}
	
	/**
	 * A safe way to get an instance of the Camera object.
	 */
	public static Camera getCameraInstance() {
		Camera c = null;
		try {
			// attempt to get a Camera instance
			c = Camera.open();
		} catch (Exception e) {
			// Camera is not available (in use or does not exist)
		}

		// returns null if camera is unavailable
		return c;
	}

	private PictureCallback mPicture = new PictureCallback() {

		public void onPictureTaken(byte[] data, Camera camera) {

			// Replacing the button after a photho was taken.
			rotatingImage.setEnabled(false);
			System.gc();
			Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
			
			
			float scaleHeight = bitmap.getHeight();
			float scaleWidth = bitmap.getWidth();
			float newHeight = 0f;
			float newWidth = 0f;
	        
			float multiple = 0.0f;
			if(bitmap.getHeight() / bitmap.getWidth() > 700 / 500) {
				multiple = bitmap.getHeight() / 700;
			} else {
				multiple = bitmap.getWidth() / 500;
			}

			if(multiple >= 1) {
				newHeight = bitmap.getHeight() / multiple;
				newWidth = bitmap.getWidth() / multiple;
			} else {

			}
			scaleWidth = newWidth / bitmap.getWidth();
	        scaleHeight = newHeight / bitmap.getHeight();
	       
			Matrix mtx = new Matrix();
			if((scaleWidth>0 && scaleWidth<1) && (scaleHeight>0 && scaleHeight<1)){
				mtx.postScale(scaleWidth, scaleHeight);
			}
			
			// Rotating Bitmap
			if(degrees==180 || degrees ==0){
				mtx.postRotate(degrees);
			}else if(degrees == 270){
				mtx.postRotate(90);
			}else{
				mtx.postRotate(270);
			}
			
			bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), mtx, true);
			ByteArrayOutputStream stream = new ByteArrayOutputStream();
			bitmap.compress(Bitmap.CompressFormat.JPEG, 95, stream);
			String ss =  Base64.encodeToString(stream.toByteArray(), 0);

			bitmap = null;
			stream = null;
			System.gc();
			finish();
			//BackgrounTask bgTask = new BackgrounTask();
			//bgTask.execute(ss);
			Message msg = new Message();
			msg.obj = ss;
			h4.sendMessage(msg);
			
//			KrollDict eventData = new KrollDict();
//			eventData.put("source", CustomcameraModule.eve);
//			eventData.put("media", ss);
//			CustomcameraModule.getInstance().fireEvent("successCameraCapture", eventData);
			
		}
	};
	
	public Handler h4 = new Handler() {
		@Override
		public void dispatchMessage(Message msg) {
			KrollDict eventData = new KrollDict();
			eventData.put("source", CustomcameraModule.eve);
			eventData.put("media", msg.obj);
			CustomcameraModule.getInstance().fireEvent("successCameraCapture", eventData);
		}
	};
	
	private class BackgrounTask extends AsyncTask<String, Void, Void> {
		@Override
		protected Void doInBackground(String... urls) {
			Message msg = new Message();
			msg.obj = urls[0];
			h4.sendMessage(msg);
			return null;
		}

	}

	/**
	 * Putting in place a listener so we can get the sensor data only when
	 * something changes.
	 */
	public void onSensorChanged(SensorEvent event) {
		synchronized (this) {
			if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
				RotateAnimation animation = null;
				if (event.values[0] < 4 && event.values[0] > -4) {
					if (event.values[1] > 0
							&& orientation != ExifInterface.ORIENTATION_ROTATE_90) {
						// UP
						orientation = ExifInterface.ORIENTATION_ROTATE_90;
						animation = getRotateAnimation(270);
						degrees = 270;
					} else if (event.values[1] < 0
							&& orientation != ExifInterface.ORIENTATION_ROTATE_270) {
						// UP SIDE DOWN
						orientation = ExifInterface.ORIENTATION_ROTATE_270;
						animation = getRotateAnimation(90);
						degrees = 90;
					}
				} else if (event.values[1] < 4 && event.values[1] > -4) {
					if (event.values[0] > 0
							&& orientation != ExifInterface.ORIENTATION_NORMAL) {
						// LEFT
						orientation = ExifInterface.ORIENTATION_NORMAL;
						animation = getRotateAnimation(0);
						degrees = 0;
					} else if (event.values[0] < 0
							&& orientation != ExifInterface.ORIENTATION_ROTATE_180) {
						// RIGHT
						orientation = ExifInterface.ORIENTATION_ROTATE_180;
						animation = getRotateAnimation(180);
						degrees = 180;
					}
				}
				if (animation != null) {
					rotatingImage.startAnimation(animation);
				}
			}

		}
	}

	/**
	 * Calculating the degrees needed to rotate the image imposed on the button
	 * so it is always facing the user in the right direction
	 * 
	 * @param toDegrees
	 * @return
	 */
	private RotateAnimation getRotateAnimation(float toDegrees) {
		float compensation = 0;

		if (Math.abs(degrees - toDegrees) > 180) {
			compensation = 360;
		}

		// When the device is being held on the left side (default position for
		// a camera) we need to add, not subtract from the toDegrees.
		if (toDegrees == 0) {
			compensation = -compensation;
		}

		// Creating the animation and the RELATIVE_TO_SELF means that he image
		// will rotate on it center instead of a corner.
		RotateAnimation animation = new RotateAnimation(degrees, toDegrees
				- compensation, Animation.RELATIVE_TO_SELF, 0.5f,
				Animation.RELATIVE_TO_SELF, 0.5f);

		// Adding the time needed to rotate the image
		animation.setDuration(250);

		// Set the animation to stop after reaching the desired position. With
		// out this it would return to the original state.
		animation.setFillAfter(true);

		return animation;
	}

	/**
	 * STUFF THAT WE DON'T NEED BUT MUST BE HEAR FOR THE COMPILER TO BE HAPPY.
	 */
	public void onAccuracyChanged(Sensor sensor, int accuracy) {
	}
}