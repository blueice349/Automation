/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

/** This is generated, do not edit by hand. **/

#include <jni.h>

#include "Proxy.h"

		namespace ti {
		namespace imagefactory {


class ImageFactoryModule : public titanium::Proxy
{
public:
	explicit ImageFactoryModule(jobject javaObject);

	static void bindProxy(v8::Handle<v8::Object> exports);
	static v8::Handle<v8::FunctionTemplate> getProxyTemplate();
	static void dispose();

	static v8::Persistent<v8::FunctionTemplate> proxyTemplate;
	static jclass javaClass;

private:
	// Methods -----------------------------------------------------------
	static v8::Handle<v8::Value> compress(const v8::Arguments&);
	static v8::Handle<v8::Value> imageAsCropped(const v8::Arguments&);
	static v8::Handle<v8::Value> imageWithTransparentBorder(const v8::Arguments&);
	static v8::Handle<v8::Value> compressToFile(const v8::Arguments&);
	static v8::Handle<v8::Value> imageWithAlpha(const v8::Arguments&);
	static v8::Handle<v8::Value> imageTransform(const v8::Arguments&);
	static v8::Handle<v8::Value> imageWithRoundedCorner(const v8::Arguments&);
	static v8::Handle<v8::Value> imageAsResized(const v8::Arguments&);
	static v8::Handle<v8::Value> imageAsThumbnail(const v8::Arguments&);

	// Dynamic property accessors ----------------------------------------

};

		} // imagefactory
		} // ti
