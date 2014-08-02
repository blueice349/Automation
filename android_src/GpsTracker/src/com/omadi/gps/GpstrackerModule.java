/**
 * This file was auto-generated by the Titanium Module SDK helper for Android
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2010 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package com.omadi.gps;

import java.util.HashMap;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollFunction;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.Log;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiContext;


@Kroll.module(name="Gpstracker", id="com.omadi.gps")
public class GpstrackerModule extends KrollModule
{

	private static GpstrackerModule _instance;
	static GPSTracker gps = null;
	static double latitude; // latitude
	static double longitude; // longitude
	KrollFunction updateLocation;
	
	//With context parameter constructor
	public GpstrackerModule(TiContext tiContext) {
		super(tiContext);
		_instance = this;
	}
	
	//Without parameter constructor
	public GpstrackerModule(){
		super();
		_instance = this;
	}
	
	//get Instance of module
	public static GpstrackerModule getInstance() {
		return _instance;
	}

	@Kroll.onAppCreate
	public static void onAppCreate(TiApplication app){
        //gps = new GPSTracker(_instance.getActivity());
    }
	
	@Kroll.method
	public void startGPSTracking(){
		
        if(gps == null || !gps.isServiceRunning){
            gps = new GPSTracker(this.getActivity());
        }
		//gps = new GPSTracker(this.getActivity());
        // check if GPS enabled
        if(gps.canGetLocation()){
            double latitude = gps.getLatitude();
            double longitude = gps.getLongitude();
            Log.d("pooja", "GPS working perfact" + latitude + "," + longitude);
         }
	}
	
	@Kroll.method
	public void stopGPSTracking(){
		gps.stopUsingGPS();
	}
	
	@Kroll.method
	public void currentMovement(KrollDict options){
		updateLocation =(KrollFunction) options.get("updateLatLng");
		HashMap<String, Object> locationDetails = new HashMap<String, Object>();
		try{
		 if(gps.canGetLocation()){
			locationDetails.put("longitude", gps.getLongitude());
			locationDetails.put("latitude", gps.getLatitude());
			locationDetails.put("accuracy",gps.getAccuracy());
		 }else{
			locationDetails.put("longitude", 0);
			locationDetails.put("latitude", 0);
			locationDetails.put("accuracy", 0); 
		 }
		}catch(Exception e){
			locationDetails.put("longitude", 0);
			locationDetails.put("latitude", 0);
			locationDetails.put("accuracy", 0); 
		}
		updateLocation.callAsync(getKrollObject(), locationDetails);
	}

}

