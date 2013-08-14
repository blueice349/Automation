/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

package ti.imagefactory;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.IdFunctionObject;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;

import org.appcelerator.kroll.KrollDict;
import org.appcelerator.kroll.KrollInvocation;
import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.KrollProxy;
import org.appcelerator.kroll.KrollProxySupport;
import org.appcelerator.kroll.KrollRuntime;

import org.appcelerator.kroll.common.TiConfig;

import org.appcelerator.kroll.runtime.rhino.KrollBindings;
import org.appcelerator.kroll.runtime.rhino.KrollGeneratedBindings;
import org.appcelerator.kroll.runtime.rhino.Proxy;
import org.appcelerator.kroll.runtime.rhino.ProxyFactory;
import org.appcelerator.kroll.runtime.rhino.RhinoRuntime;
import org.appcelerator.kroll.runtime.rhino.TypeConverter;
import org.appcelerator.kroll.common.Log;

import java.util.HashMap;

import ti.imagefactory.ImageFactoryModule;

import org.appcelerator.kroll.KrollModulePrototype;


public class ImageFactoryModulePrototype extends KrollModulePrototype
{
	// GENERATE_SUID

	private static final boolean DBG = TiConfig.LOGD;
	private static final String TAG = "ImageFactoryModulePrototype";
	private static final String CLASS_TAG = "ImageFactoryModule";
	private static ImageFactoryModulePrototype imageFactoryModulePrototype;


	public static ImageFactoryModulePrototype getProxyPrototype()
	{
		return imageFactoryModulePrototype;
	}

	public static void dispose()
	{
		if (DBG) {
			Log.d(TAG, "dispose()");
		}
		imageFactoryModulePrototype = null;
	}

	public ImageFactoryModulePrototype()
	{
		if (imageFactoryModulePrototype == null && getClass().equals(ImageFactoryModulePrototype.class)) {
			imageFactoryModulePrototype = this;
			KrollGeneratedBindings.registerUsedPrototypeClass(getClass());
		}

		isModule = true;

			putConst("TRANSFORM_CROP", this, 1);


			putConst("QUALITY_LOW", this, 2);


			putConst("QUALITY_NONE", this, 1);


			putConst("TRANSFORM_ALPHA", this, 6);


			putConst("QUALITY_MEDIUM", this, 4);


			putConst("TRANSFORM_RESIZE", this, 2);


			putConst("QUALITY_DEFAULT", this, 0);


			putConst("TRANSFORM_ROUNDEDCORNER", this, 4);


			putConst("TRANSFORM_TRANSPARENTBORDER", this, 5);


			putConst("TRANSFORM_NONE", this, 0);


			putConst("JPEG", this, 0);


			putConst("QUALITY_HIGH", this, 3);


			putConst("PNG", this, 1);


			putConst("TRANSFORM_THUMBNAIL", this, 3);

	}

	public Scriptable getPrototype()
	{
		if (this == imageFactoryModulePrototype) {
			return KrollModulePrototype.getProxyPrototype();
		}
		return imageFactoryModulePrototype;
	}

	protected Class<? extends Proxy> getParent()
	{
		return KrollModulePrototype.class;
	}

	protected KrollProxySupport createProxy(String creationUrl, Object[] args)
	{
		return KrollProxy.createProxy(ImageFactoryModule.class, getRhinoObject(), args, creationUrl);
	}

	// Methods
	public Object compress(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "compress()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("compress: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		float arg1;
		arg1 = (float) TypeConverter.jsObjectToJavaFloat(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.compress(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageAsCropped(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageAsCropped()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("imageAsCropped: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		java.util.HashMap arg1;
		arg1 = (java.util.HashMap) TypeConverter.jsObjectToJavaObject(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageAsCropped(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageWithTransparentBorder(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageWithTransparentBorder()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("imageWithTransparentBorder: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		java.util.HashMap arg1;
		arg1 = (java.util.HashMap) TypeConverter.jsObjectToJavaObject(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageWithTransparentBorder(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object compressToFile(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "compressToFile()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 3) {
			throw new IllegalArgumentException("compressToFile: Invalid number of arguments. Expected 3 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		float arg1;
		arg1 = (float) TypeConverter.jsObjectToJavaFloat(args[1], thisObj) ;
		java.lang.String arg2;
		arg2 = (java.lang.String) TypeConverter.jsObjectToJavaString(args[2], thisObj) ;

		boolean javaResult = proxy.compressToFile(arg0, arg1, arg2);

		Boolean rhinoResult = (Boolean) javaResult;
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageWithAlpha(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageWithAlpha()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("imageWithAlpha: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		java.util.HashMap arg1;
		arg1 = (java.util.HashMap) TypeConverter.jsObjectToJavaObject(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageWithAlpha(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageTransform(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageTransform()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
	int length = args.length - 0;
	if (length < 0) {
		length = 0;
	}

	Object[] arg0 = new Object[length];
	for (int i = 0; i < length; i++) {
		arg0[i] = TypeConverter.jsObjectToJavaObject(args[i+0], this);
	}

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageTransform(arg0);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageWithRoundedCorner(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageWithRoundedCorner()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("imageWithRoundedCorner: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		java.util.HashMap arg1;
		arg1 = (java.util.HashMap) TypeConverter.jsObjectToJavaObject(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageWithRoundedCorner(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageAsResized(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageAsResized()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("imageAsResized: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		java.util.HashMap arg1;
		arg1 = (java.util.HashMap) TypeConverter.jsObjectToJavaObject(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageAsResized(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}

	public Object imageAsThumbnail(Context context, Scriptable thisObj, Object[] args)
	{
		if (DBG) {
			Log.d(TAG, "imageAsThumbnail()");
		}

		try {
		ImageFactoryModule proxy = (ImageFactoryModule) ((Proxy) thisObj).getProxy();
		if (args.length < 2) {
			throw new IllegalArgumentException("imageAsThumbnail: Invalid number of arguments. Expected 2 but got " + args.length);
		}
		org.appcelerator.titanium.TiBlob arg0;
		arg0 = (org.appcelerator.titanium.TiBlob) TypeConverter.jsObjectToJavaObject(args[0], thisObj) ;
		java.util.HashMap arg1;
		arg1 = (java.util.HashMap) TypeConverter.jsObjectToJavaObject(args[1], thisObj) ;

		org.appcelerator.titanium.TiBlob javaResult = proxy.imageAsThumbnail(arg0, arg1);

		Object rhinoResult = (Object) TypeConverter.javaObjectToJsObject(javaResult, this);
	
			return rhinoResult;

		} catch (Throwable throwable) {
			Context.throwAsScriptRuntimeEx(throwable);
			return Undefined.instance;
		}
	}


	// Dynamic properties

// #string_id_map#

	// Prototype IDs
	private static final int
		Id_constructor = 1
,		// Property IDs
		// Method IDs
		Id_compress = 2,
		Id_imageAsCropped = 3,
		Id_imageWithTransparentBorder = 4,
		Id_compressToFile = 5,
		Id_imageWithAlpha = 6,
		Id_imageTransform = 7,
		Id_imageWithRoundedCorner = 8,
		Id_imageAsResized = 9,
		Id_imageAsThumbnail = 10
;
		

	public static final int MAX_PROTOTYPE_ID = 10;

	protected int getMaxPrototypeId()
	{
		return MAX_PROTOTYPE_ID;
	}

	@Override
	protected int findPrototypeId(String s)
	{
		int id = 0;
// #generated# Last update: 2013-05-29 17:52:36 MDT
        L0: { id = 0; String X = null;
            L: switch (s.length()) {
            case 8: X="compress";id=Id_compress; break L;
            case 11: X="constructor";id=Id_constructor; break L;
            case 14: switch (s.charAt(7)) {
                case 'C': X="imageAsCropped";id=Id_imageAsCropped; break L;
                case 'R': X="imageAsResized";id=Id_imageAsResized; break L;
                case 'a': X="imageTransform";id=Id_imageTransform; break L;
                case 's': X="compressToFile";id=Id_compressToFile; break L;
                case 't': X="imageWithAlpha";id=Id_imageWithAlpha; break L;
                } break L;
            case 16: X="imageAsThumbnail";id=Id_imageAsThumbnail; break L;
            case 22: X="imageWithRoundedCorner";id=Id_imageWithRoundedCorner; break L;
            case 26: X="imageWithTransparentBorder";id=Id_imageWithTransparentBorder; break L;
            }
            if (X!=null && X!=s && !X.equals(s)) id = 0;
            break L0;
        }
// #/generated#
		return id;
	}

// #/string_id_map#

	@Override
	protected void initPrototypeId(int id)
	{
		String name;
		int arity;
		switch (id) {
			case Id_constructor:
				arity = 0;
				name = "constructor";
				break;
			case Id_compress:
				arity = 2;
				name = "compress";
				break;
			case Id_imageAsCropped:
				arity = 2;
				name = "imageAsCropped";
				break;
			case Id_imageWithTransparentBorder:
				arity = 2;
				name = "imageWithTransparentBorder";
				break;
			case Id_compressToFile:
				arity = 3;
				name = "compressToFile";
				break;
			case Id_imageWithAlpha:
				arity = 2;
				name = "imageWithAlpha";
				break;
			case Id_imageTransform:
				arity = 1;
				name = "imageTransform";
				break;
			case Id_imageWithRoundedCorner:
				arity = 2;
				name = "imageWithRoundedCorner";
				break;
			case Id_imageAsResized:
				arity = 2;
				name = "imageAsResized";
				break;
			case Id_imageAsThumbnail:
				arity = 2;
				name = "imageAsThumbnail";
				break;
			default:
				super.initPrototypeId(id);
				return;
		}
		initPrototypeMethod(CLASS_TAG, id, name, arity);
	}

	@Override
	public Object execIdCall(IdFunctionObject f,
		Context cx, Scriptable scope, Scriptable thisObj, Object[] args)
	{
		if (!f.hasTag(CLASS_TAG)) {
			return super.execIdCall(f, cx, scope, thisObj, args);
		}

		while (thisObj != null && !(thisObj instanceof ImageFactoryModulePrototype)) {
			thisObj = thisObj.getPrototype();
		}

		ImageFactoryModulePrototype proxy = (ImageFactoryModulePrototype) thisObj;
		int id = f.methodId();
		switch (id) {
			case Id_constructor:
				return jsConstructor(scope, args);
			case Id_compress:
				return compress(cx, thisObj, args);
				
			case Id_imageAsCropped:
				return imageAsCropped(cx, thisObj, args);
				
			case Id_imageWithTransparentBorder:
				return imageWithTransparentBorder(cx, thisObj, args);
				
			case Id_compressToFile:
				return compressToFile(cx, thisObj, args);
				
			case Id_imageWithAlpha:
				return imageWithAlpha(cx, thisObj, args);
				
			case Id_imageTransform:
				return imageTransform(cx, thisObj, args);
				
			case Id_imageWithRoundedCorner:
				return imageWithRoundedCorner(cx, thisObj, args);
				
			case Id_imageAsResized:
				return imageAsResized(cx, thisObj, args);
				
			case Id_imageAsThumbnail:
				return imageAsThumbnail(cx, thisObj, args);
				
			default:
				throw new IllegalArgumentException(String.valueOf(id));
		}
	}



	public static final int MAX_INSTANCE_ID = -1;


	@Override
	public String getClassName()
	{
		return CLASS_TAG;
	}
}
