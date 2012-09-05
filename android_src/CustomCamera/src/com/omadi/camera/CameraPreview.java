package com.omadi.camera;

import java.io.IOException;


import android.content.Context;
import android.hardware.Camera;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.SeekBar;

public class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {
	private SurfaceHolder mHolder;
	private Camera mCamera;
	Camera.Parameters params;
	VerticalSeekBar zoomControls;
	int maxZoomLevel = 0;

	public CameraPreview(Context context, Camera camera, VerticalSeekBar zoomControls) {
		super(context);
		mCamera = camera;
		this.zoomControls = zoomControls;

		// Install a SurfaceHolder.Callback so we get notified when the
		// underlying surface is created and destroyed.
		mHolder = getHolder();
		mHolder.addCallback(this);
		// deprecated setting, but required on Android versions prior to 3.0
		mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);

		mHolder.setFixedSize(100, 100);
	}

	public void surfaceCreated(SurfaceHolder holder) {
		// The Surface has been created, now tell the camera where to draw the
		// preview.
		try {
			mCamera.setPreviewDisplay(holder);
			mCamera.startPreview();
		} catch (IOException e) {
			Log.d("DG_DEBUG", "Error setting camera preview: " + e.getMessage());
		}

	}

	public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
		// If your preview can change or rotate, take care of those events here.
		// Make sure to stop the preview before resizing or reformatting it.

		if (mHolder.getSurface() == null) {
			// preview surface does not exist
			return;
		}

		// stop preview before making changes
		try {
			mCamera.stopPreview();
		} catch (Exception e) {
			// ignore: tried to stop a non-existent preview
		}

		// make any resize, rotate or reformatting changes here

		// start preview with new settings
		try {
			mCamera.setPreviewDisplay(mHolder);
			mCamera.startPreview();

		} catch (Exception e) {
			Log.d("DG_DEBUG", "Error starting camera preview: " + e.getMessage());
		}
		
		//ZOOM CONTROL SLIDER
		params = mCamera.getParameters();
		maxZoomLevel = params.getMaxZoom();

		if (maxZoomLevel == 0) {
			zoomControls.setEnabled(false);
		} else {
			zoomControls.setMax(maxZoomLevel);
		}

		zoomControls
				.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
					public void onProgressChanged(SeekBar seekBar,
							int progress, boolean fromUser) {
						params.setZoom(progress);
						mCamera.setParameters(params);
					}

					public void onStartTrackingTouch(SeekBar seekBar) {
					}

					public void onStopTrackingTouch(SeekBar seekBar) {
					}
				});
		
	}

	public void surfaceDestroyed(SurfaceHolder holder) {
		// empty. Take care of releasing the Camera preview in your activity.
	}

}
