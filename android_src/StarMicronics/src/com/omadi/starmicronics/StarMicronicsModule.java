/**
 * This file was auto-generated by the Titanium Module SDK helper for Android
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2010 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.omadi.starmicronics;

import java.util.HashMap;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.KrollObject;
import org.appcelerator.kroll.KrollRuntime;
import org.appcelerator.kroll.annotations.Kroll;

import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiBaseActivity;
import org.appcelerator.titanium.TiContext;
import org.appcelerator.titanium.util.TiActivityResultHandler;
import org.appcelerator.titanium.util.TiActivitySupport;
import org.appcelerator.kroll.common.Log;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.os.Message;
import android.provider.MediaStore.Images;
import java.util.List;
import java.util.ArrayList;
import java.io.File;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;

import com.starmicronics.stario.StarIOPort;
import com.starmicronics.stario.PortInfo;
import com.starmicronics.stario.StarIOPortException; 
import com.starmicronics.stario.StarPrinterStatus;

@Kroll.module(name="Starmicronics", id="com.omadi.starmicronics")
public class StarMicronicsModule extends KrollModule{
	
	// Standard Debugging variables
	private static final String LCAT = "StarMicronicsModule";
	protected static final int MSG_INVOKE_CALLBACK = KrollModule.MSG_LAST_ID + 100;
	
	private StarIOPort port = null;
	
	@Kroll.constant public static final int UNKNOWN_ERROR = 0;
	
	static KrollFunction finishedCallback = null;
	// You can define constants with @Kroll.constant, for example:
	// @Kroll.constant public static final String EXTERNAL_NAME = value;
	
	public StarMicronicsModule()
	{
		super();
	}

	@Kroll.onAppCreate
	public static void onAppCreate(TiApplication app)
	{
		Log.d(LCAT, "inside star micronics onAppCreate");
		// put module init code that needs to run when the application is created
	}

	private static StarMicronicsModule _instance;

	public static StarMicronicsModule getInstance(){
		return _instance;
  	}

  	public StarMicronicsModule(TiContext tiContext)
  	{
	  	super(tiContext);
   		_instance = this;
    }
  	
  	@Kroll.method
  	public void getBluetoothDeviceList(HashMap options){
  		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;

		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		if (options.containsKey("error")) {
			errorCallback = (KrollFunction) options.get("error");
		}
		
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		
		KrollDict d = new KrollDict();
		List<String> portNames = new ArrayList<String>();
		
		try {
			List<PortInfo> portList = StarIOPort.searchPrinter("BT:"); 
			
			for (PortInfo port : portList) {
				portNames.add(port.getPortName());
				Log.i("PRINT", "PRINT Port Name: " + port.getPortName());
			}
			
			if(portList.size() > 0){
				d.put("portNames", portNames.toArray(new String[0]));
				invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
			}
			else{
				d.put("error", "No bluetooth devices available.");
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
			}
		}
		catch (StarIOPortException e) {
			d.put("error", e.getMessage());
			invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
		}
  	}
  	
  	@Kroll.method
  	public void openPort(HashMap options){
  		
  		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;

		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		if (options.containsKey("error")) {
			errorCallback = (KrollFunction) options.get("error");
		}
		
		String portName = (String)options.get("portName");
		
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		
		KrollDict d = new KrollDict();
		
		try {
			this.port = StarIOPort.getPort(portName, "mini", 10000);
			invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
		}
		catch (StarIOPortException e) {
			d.put("error", e.getMessage());
			invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
		}
  	}
  	
  	@Kroll.method
  	public void releasePort(HashMap options){
  		
  		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;

		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		if (options.containsKey("error")) {
			errorCallback = (KrollFunction) options.get("error");
		}
		
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		
		KrollDict d = new KrollDict();
		
		try {
			StarIOPort.releasePort(this.port);
			invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
		}
		catch (StarIOPortException e) {
			d.put("error", e.getMessage());
			invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
		}
  	}
	
	@Kroll.method
	public void print(HashMap options)
	{
		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;
		String portName = null;
		//byte[] commands;

		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		if (options.containsKey("error")) {
			errorCallback = (KrollFunction) options.get("error");
		}
		
		portName = (String)options.get("portName");
		
		ti.modules.titanium.BufferProxy buffer = (ti.modules.titanium.BufferProxy)options.get("commands");
		
		Object[] printImages = (Object[])options.get("images");
		
		KrollDict d = new KrollDict();
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		
		Log.d("PRINT", "PRINT: printImagesLength: " + printImages.length);
		
		ArrayList<Integer> bufferInterruptionIndexes = new ArrayList<Integer>();
		ArrayList<byte[]> interruptionCommands = new ArrayList<byte[]>();
		
		int i;
		for(i = 0; i < printImages.length; i ++){
			HashMap imageData = (HashMap)printImages[i];
			
			String path = null;
			Integer bufferIndex = -1;
			Integer imageWidth = 575;
			
			if(imageData.containsKey("path")){
				path = (String) imageData.get("path");
				Log.d("PRINT", "PRINT: path: " + path);
				
				if(imageData.containsKey("width")){
					imageWidth = (Integer) imageData.get("width");
				}	
				
				bufferIndex = (Integer) imageData.get("bufferIndex");
				Log.d("PRINT", "PRINT: bufferIndex: " + bufferIndex);
				
				path = path.replaceFirst("file://", "");
				
				//String url = getPathToApplicationAsset(path);
				
				Bitmap bitmap = BitmapFactory.decodeFile(path);
				
				if(bitmap != null){
					
					Log.d("PRINT", "PRINT: height: " + bitmap.getHeight());
					
					StarBitmap starBitmap = new StarBitmap(bitmap, false, imageWidth.intValue());
					byte[] imageCommand;
					Log.d("PRINT", "PRINT: starbitmap");
					
					try{
						imageCommand = starBitmap.getImageEscPosDataForPrinting(true, true);
						Log.d("PRINT", "PRINT: imagecommand: " + imageCommand);
						
						bufferInterruptionIndexes.add(bufferIndex);
						interruptionCommands.add(imageCommand);
						
						Log.d("PRINT", "PRINT: imagedata: " + imageCommand.length);
					}
					catch (StarIOPortException e){
						// TODO: get rid of the callback - just don't print the image 
						//d.put("error", e.getMessage());
						//invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
					}
				}
				else{
					// TODO: get rid of the callback - just don't print the image
					//d.put("error", "Could not locate the file.");
					//invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
				}
			}
		}
		
		byte[] commands;
		
		StarIOPort port = null;
		
		try{
			commands = buffer.getBuffer();
			
			/*
				using StarIOPort3.1.jar (support USB Port)
				Android OS Version: upper 2.2
			*/
			port = StarIOPort.getPort(portName, "mini", 20000);
			/* 
				using StarIOPort.jar
				Android OS Version: under 2.1
				port = StarIOPort.getPort(portName, portSettings, 10000);
			*/
			try
			{
				Thread.sleep(500);
			}
			catch (InterruptedException e) { }

			/*
		    Portable Printer Firmware Version 2.4 later, SM-S220i(Firmware Version 2.0 later) 

            Using Begin / End Checked Block method for preventing "data detective".
            
            When sending large amounts of raster data,
            use Begin / End Checked Block method and adjust the value in the timeout in the "StarIOPort.getPort"
            in order to prevent "timeout" of the "endCheckedBlock method" while a printing.
            
            *If receipt print is success but timeout error occurs(Show message which is "There was no response of the printer within the timeout period."),
             need to change value of timeout more longer in "StarIOPort.getPort" method. (e.g.) 10000 -> 30000
            *When use "Begin / End Checked Block Sample Code", do comment out "query commands Sample code".
		    */

		    /* Start of Begin / End Checked Block Sample code */
			StarPrinterStatus status = port.beginCheckedBlock();

			if (true == status.offline){
				d.put("error", "Printer is offline.");
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
			}
			
			int currentByteOffset = 0;
			int numBytesToWrite = 0;
			
			if(interruptionCommands.size() > 0){
				for(i = 0; i < interruptionCommands.size(); i ++){
					byte[] interruptionCommand = interruptionCommands.get(i);
					Integer bufferInterruptionIndex = bufferInterruptionIndexes.get(i);
					
					numBytesToWrite = bufferInterruptionIndex - currentByteOffset;
					if(numBytesToWrite > 0){
						port.writePort(commands, currentByteOffset, numBytesToWrite);
					}
					
					currentByteOffset = bufferInterruptionIndex;
					
					port.writePort(interruptionCommand, 0, interruptionCommand.length);
				}
				
				if(currentByteOffset + 1 < commands.length){
					port.writePort(commands, currentByteOffset, commands.length - currentByteOffset);
				}
			}
			else{
				port.writePort(commands, 0, commands.length);
			}
			
			Log.d("PRINT", "PRINT: after image write");

			status = port.endCheckedBlock();

			if (true == status.coverOpen){
				d.put("error", "Printer cover is open.");
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
			}
			else if (true == status.receiptPaperEmpty){
				d.put("error", "Receipt paper is empty.");
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
			}
			else if (true == status.offline){
				d.put("error", "Printer is offline.");
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
			}
			else{
				invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
			}
			/* End of Begin / End Checked Block Sample code*/
			/*
			    Portable Printer Firmware Version 2.3 earlier

                Using query commands for preventing "data detective".
                
				When sending large amounts of raster data,
				send query commands after writePort data for confirming the end of printing 
				and adjust the value in the timeout in the "checkPrinterSendToComplete" method
				in order to prevent "timeout" of the "sending query commands" while a printing.
                
				*If receipt print is success but timeout error occurs(Show message which is "There was no response of the printer within the timeout period."),
				 need to change value of timeout more longer in "checkPrinterSendToComplete" method. (e.g.) 10000 -> 30000
				*When use "query commands Sample code", do comment out "Begin / End Checked Block Sample Code".
			 */

			/* Start of query commands Sample code */
//            byte[] commandToSendToPrinter = convertFromListByteArrayTobyteArray(byteList);
//			port.writePort(commandToSendToPrinter, 0, commandToSendToPrinter.length);
//			
//			checkPrinterSendToComplete(port);
			/* End of query commands Sample code */
		}
		catch (StarIOPortException e){
			d.put("error", e.getMessage());
			invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
		}
		finally
		{
			if (port != null)
			{
				try
				{
					StarIOPort.releasePort(port);
				}
				catch (StarIOPortException e) { }
			}
		}
	}
	
	/**
	 * This function shows how to read the MSR data(credit card) of a portable printer.
	 * The function first puts the printer into MSR read mode, then asks the user to swipe a credit card
	 * The function waits for a response from the user.
	 * The user can cancel MSR mode or have the printer read the card.
	 * @param context - Activity for displaying messages to the user
	 * @param portName - Port name to use for communication. This should be (TCP:<IPAddress> or BT:<Device pair name>)
	 * @param portSettings - Should be mini, the port settings mini is used for portable printers
	 */
	
	private static StarIOPort portForMoreThanOneFunction = null;
	
	@Kroll.method
	public void mcrCancel(HashMap options){
		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;
		KrollDict d = new KrollDict();
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		
		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		
		try{
			//If the user cancels MSR mode, the character 0x04 is sent to the printer
			//This function also closes the port
			portForMoreThanOneFunction.writePort(new byte[] {0x04}, 0, 1);
			try
			{
				Thread.sleep(3000);
			}
			catch(InterruptedException e) {}
			
			invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
		}
		catch(StarIOPortException e){
			d.put("error", e.getMessage());
			invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
		}
		finally{
			if(portForMoreThanOneFunction != null){
				try {
					StarIOPort.releasePort(portForMoreThanOneFunction);
				} catch (StarIOPortException e1) {}
			}
		}
	}
	
	@Kroll.method
	public void mcrMode(HashMap options){
		KrollDict d = new KrollDict();
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;
		String portName = null;
		
		try{
			
			if (options.containsKey("success")) {
				successCallback = (KrollFunction) options.get("success");
			}
			if (options.containsKey("error")) {
				errorCallback = (KrollFunction) options.get("error");
			}
			
			portName = (String)options.get("portName");
			
			portForMoreThanOneFunction = StarIOPort.getPort(portName, "mini", 10000);

			try{
				// Wait to allow the connection to happen successfully
				Thread.sleep(500);
			}
			catch(InterruptedException e) {}
			
			Log.d("MCR", "MCR Waiting...");
			
			// Put the printer in Card reading mode
			portForMoreThanOneFunction.writePort(new byte[] {0x1b, 0x4d, 0x45}, 0, 3);
			
			if(successCallback != null){
				invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
    		}
		}
    	catch (StarIOPortException e){
    		
    		if(errorCallback != null){
	    		d.put("error", e.getMessage());
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
    		}
    		
			if(portForMoreThanOneFunction != null){
				try {
					StarIOPort.releasePort(portForMoreThanOneFunction);
				} 
				catch (StarIOPortException e1) {}
			}
    	}
	}
	
	@Kroll.method
	public void readPort(HashMap options){
		String errorString = null;
		byte[] mcrData = new byte[100];
		KrollDict d = new KrollDict();
		Activity activity = TiApplication.getInstance().getCurrentActivity();
		KrollFunction errorCallback = null;
		KrollFunction successCallback = null;
		String retval = "";
		
		int bytesRead = 0;
			
		if (options.containsKey("success")) {
			successCallback = (KrollFunction) options.get("success");
		}
		if (options.containsKey("error")) {
			errorCallback = (KrollFunction) options.get("error");
		}

		try{
			bytesRead = portForMoreThanOneFunction.readPort(mcrData, 0, mcrData.length);
			
			int i;
			
			Log.d("MCR", "MCR read " + bytesRead);
			//ti.modules.titanium.BufferProxy buffer = new ti.modules.titanium.BufferProxy();
			//buffer.setLength(mcrData.length);
			byte[] cardData = new byte[bytesRead];
			
			for(i = 0; i < bytesRead; i ++){
				Log.d("MCR", "MCR " + mcrData[i]);
				cardData[i] = mcrData[i];
			}
			
			retval = new String(cardData);
			
		}
		catch(StarIOPortException e){
			errorString = e.getMessage();
		}
		finally{
			if(portForMoreThanOneFunction != null){
				try {
					StarIOPort.releasePort(portForMoreThanOneFunction);
				} 
				catch (StarIOPortException e1) {}
			}
		}
		
		if(errorString != null){
			if(errorCallback != null){
	    		d.put("error", errorString);
				invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), d);
			}
		}
		else if(successCallback != null){
    		d.put("cardData", retval);
			invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
		}
	}
	
	private static void CopyArray(byte[] srcArray, Byte[] cpyArray) {
    	for (int index = 0; index < cpyArray.length; index++) {
    		cpyArray[index] = srcArray[index];
    	}
    }
	
	private static byte[] convertFromListByteArrayTobyteArray(List<Byte> ByteArray)
	{
		byte[] byteArray = new byte[ByteArray.size()];
		for(int index = 0; index < byteArray.length; index++)
		{
			if (null == ByteArray.get(index)) {
				byteArray[index] = 0;
			}
			else
			{
			    byteArray[index] = ByteArray.get(index);
			}
		}
		
		return byteArray;
	}
	
	protected class StarMicronicsResultHandler implements TiActivityResultHandler, Runnable{
		
		protected int code;
		protected KrollFunction successCallback, cancelCallback, errorCallback;
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
			if (resultCode == Activity.RESULT_CANCELED) {
				
				if (cancelCallback != null) {
					cancelCallback.callAsync(getKrollObject(), new Object[] {});
				}

			} 
			else {
				if (data == null) {
					ContentValues values = new ContentValues(7);
				
					values.put(Images.Media.MIME_TYPE, "image/jpeg");
			

					try {
						if (successCallback != null) {
							KrollDict d = new KrollDict();
							invokeCallback((TiBaseActivity) activity, successCallback, getKrollObject(), d);
						}

					} catch (OutOfMemoryError e) {
						String msg = "Not enough memory to do this: " + e.getMessage();
						Log.e(LCAT, msg);
						if (errorCallback != null) {
							invokeCallback((TiBaseActivity) activity, errorCallback, getKrollObject(), createErrorResponse(UNKNOWN_ERROR, msg));
						}
					}

				} 
				else {
					
				}
			}
		}

		@Override
		public void onError(Activity activity, int requestCode, Exception e) {
			
			String msg = "star micronics problem: " + e.getMessage();
			Log.e(LCAT, msg, e);
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

