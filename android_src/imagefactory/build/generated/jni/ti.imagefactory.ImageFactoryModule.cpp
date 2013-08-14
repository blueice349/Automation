/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

/** This code is generated, do not edit by hand. **/

#include "ti.imagefactory.ImageFactoryModule.h"

#include "AndroidUtil.h"
#include "EventEmitter.h"
#include "JNIUtil.h"
#include "JSException.h"
#include "Proxy.h"
#include "ProxyFactory.h"
#include "TypeConverter.h"
#include "V8Util.h"




#include "org.appcelerator.kroll.KrollModule.h"

#define TAG "ImageFactoryModule"

using namespace v8;

		namespace ti {
		namespace imagefactory {


Persistent<FunctionTemplate> ImageFactoryModule::proxyTemplate = Persistent<FunctionTemplate>();
jclass ImageFactoryModule::javaClass = NULL;

ImageFactoryModule::ImageFactoryModule(jobject javaObject) : titanium::Proxy(javaObject)
{
}

void ImageFactoryModule::bindProxy(Handle<Object> exports)
{
	if (proxyTemplate.IsEmpty()) {
		getProxyTemplate();
	}

	// use symbol over string for efficiency
	Handle<String> nameSymbol = String::NewSymbol("ImageFactory");

	Local<Function> proxyConstructor = proxyTemplate->GetFunction();
	Local<Object> moduleInstance = proxyConstructor->NewInstance();
	exports->Set(nameSymbol, moduleInstance);
}

void ImageFactoryModule::dispose()
{
	LOGD(TAG, "dispose()");
	if (!proxyTemplate.IsEmpty()) {
		proxyTemplate.Dispose();
		proxyTemplate = Persistent<FunctionTemplate>();
	}

	titanium::KrollModule::dispose();
}

Handle<FunctionTemplate> ImageFactoryModule::getProxyTemplate()
{
	if (!proxyTemplate.IsEmpty()) {
		return proxyTemplate;
	}

	LOGD(TAG, "GetProxyTemplate");

	javaClass = titanium::JNIUtil::findClass("ti/imagefactory/ImageFactoryModule");
	HandleScope scope;

	// use symbol over string for efficiency
	Handle<String> nameSymbol = String::NewSymbol("ImageFactory");

	Handle<FunctionTemplate> t = titanium::Proxy::inheritProxyTemplate(
		titanium::KrollModule::getProxyTemplate()
, javaClass, nameSymbol);

	proxyTemplate = Persistent<FunctionTemplate>::New(t);
	proxyTemplate->Set(titanium::Proxy::inheritSymbol,
		FunctionTemplate::New(titanium::Proxy::inherit<ImageFactoryModule>)->GetFunction());

	titanium::ProxyFactory::registerProxyPair(javaClass, *proxyTemplate);

	// Method bindings --------------------------------------------------------
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "compress", ImageFactoryModule::compress);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageAsCropped", ImageFactoryModule::imageAsCropped);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageWithTransparentBorder", ImageFactoryModule::imageWithTransparentBorder);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "compressToFile", ImageFactoryModule::compressToFile);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageWithAlpha", ImageFactoryModule::imageWithAlpha);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageTransform", ImageFactoryModule::imageTransform);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageWithRoundedCorner", ImageFactoryModule::imageWithRoundedCorner);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageAsResized", ImageFactoryModule::imageAsResized);
	DEFINE_PROTOTYPE_METHOD(proxyTemplate, "imageAsThumbnail", ImageFactoryModule::imageAsThumbnail);

	Local<ObjectTemplate> prototypeTemplate = proxyTemplate->PrototypeTemplate();
	Local<ObjectTemplate> instanceTemplate = proxyTemplate->InstanceTemplate();

	// Delegate indexed property get and set to the Java proxy.
	instanceTemplate->SetIndexedPropertyHandler(titanium::Proxy::getIndexedProperty,
		titanium::Proxy::setIndexedProperty);

	// Constants --------------------------------------------------------------
	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		LOGE(TAG, "Failed to get environment in ImageFactoryModule");
		//return;
	}


		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_CROP", 1);

		DEFINE_INT_CONSTANT(prototypeTemplate, "QUALITY_LOW", 2);

		DEFINE_INT_CONSTANT(prototypeTemplate, "QUALITY_NONE", 1);

		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_ALPHA", 6);

		DEFINE_INT_CONSTANT(prototypeTemplate, "QUALITY_MEDIUM", 4);

		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_RESIZE", 2);

		DEFINE_INT_CONSTANT(prototypeTemplate, "QUALITY_DEFAULT", 0);

		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_ROUNDEDCORNER", 4);

		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_TRANSPARENTBORDER", 5);

		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_NONE", 0);

		DEFINE_INT_CONSTANT(prototypeTemplate, "JPEG", 0);

		DEFINE_INT_CONSTANT(prototypeTemplate, "QUALITY_HIGH", 3);

		DEFINE_INT_CONSTANT(prototypeTemplate, "PNG", 1);

		DEFINE_INT_CONSTANT(prototypeTemplate, "TRANSFORM_THUMBNAIL", 3);


	// Dynamic properties -----------------------------------------------------

	// Accessors --------------------------------------------------------------

	return proxyTemplate;
}

// Methods --------------------------------------------------------------------
Handle<Value> ImageFactoryModule::compress(const Arguments& args)
{
	LOGD(TAG, "compress()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "compress", "(Lorg/appcelerator/titanium/TiBlob;F)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'compress' with signature '(Lorg/appcelerator/titanium/TiBlob;F)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "compress: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	
	
		if (titanium::V8Util::isNaN(args[1]) || args[1]->ToString()->Length() == 0) {
			const char *error = "Invalid value, expected type Number.";
			LOGE(TAG, error);
			return titanium::JSException::Error(error);
		}
	if (!args[1]->IsNull()) {
		Local<Number> arg_1 = args[1]->ToNumber();
		jArguments[1].f =
			titanium::TypeConverter::jsNumberToJavaFloat(arg_1);
	} else {
		jArguments[1].f = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::imageAsCropped(const Arguments& args)
{
	LOGD(TAG, "imageAsCropped()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageAsCropped", "(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageAsCropped' with signature '(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "imageAsCropped: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	bool isNew_1;
	
	if (!args[1]->IsNull()) {
		Local<Value> arg_1 = args[1];
		jArguments[1].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_1, &isNew_1);
	} else {
		jArguments[1].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


			if (isNew_1) {
				env->DeleteLocalRef(jArguments[1].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::imageWithTransparentBorder(const Arguments& args)
{
	LOGD(TAG, "imageWithTransparentBorder()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageWithTransparentBorder", "(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageWithTransparentBorder' with signature '(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "imageWithTransparentBorder: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	bool isNew_1;
	
	if (!args[1]->IsNull()) {
		Local<Value> arg_1 = args[1];
		jArguments[1].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_1, &isNew_1);
	} else {
		jArguments[1].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


			if (isNew_1) {
				env->DeleteLocalRef(jArguments[1].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::compressToFile(const Arguments& args)
{
	LOGD(TAG, "compressToFile()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "compressToFile", "(Lorg/appcelerator/titanium/TiBlob;FLjava/lang/String;)Z");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'compressToFile' with signature '(Lorg/appcelerator/titanium/TiBlob;FLjava/lang/String;)Z'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 3) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "compressToFile: Invalid number of arguments. Expected 3 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[3];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	
	
		if (titanium::V8Util::isNaN(args[1]) || args[1]->ToString()->Length() == 0) {
			const char *error = "Invalid value, expected type Number.";
			LOGE(TAG, error);
			return titanium::JSException::Error(error);
		}
	if (!args[1]->IsNull()) {
		Local<Number> arg_1 = args[1]->ToNumber();
		jArguments[1].f =
			titanium::TypeConverter::jsNumberToJavaFloat(arg_1);
	} else {
		jArguments[1].f = NULL;
	}

	
	
	if (!args[2]->IsNull()) {
		Local<Value> arg_2 = args[2];
		jArguments[2].l =
			titanium::TypeConverter::jsValueToJavaString(arg_2);
	} else {
		jArguments[2].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jboolean jResult = (jboolean)env->CallBooleanMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


				env->DeleteLocalRef(jArguments[2].l);


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}


	Handle<Boolean> v8Result = titanium::TypeConverter::javaBooleanToJsBoolean(jResult);



	return v8Result;

}
Handle<Value> ImageFactoryModule::imageWithAlpha(const Arguments& args)
{
	LOGD(TAG, "imageWithAlpha()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageWithAlpha", "(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageWithAlpha' with signature '(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "imageWithAlpha: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	bool isNew_1;
	
	if (!args[1]->IsNull()) {
		Local<Value> arg_1 = args[1];
		jArguments[1].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_1, &isNew_1);
	} else {
		jArguments[1].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


			if (isNew_1) {
				env->DeleteLocalRef(jArguments[1].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::imageTransform(const Arguments& args)
{
	LOGD(TAG, "imageTransform()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageTransform", "([Ljava/lang/Object;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageTransform' with signature '([Ljava/lang/Object;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());


	jvalue jArguments[1];




	uint32_t length = args.Length() - 0;
	if (length < 0) {
		length = 0;
	}

	jobjectArray varArgs = env->NewObjectArray(length, titanium::JNIUtil::objectClass, NULL);
	for (uint32_t i = 0; i < length; ++i) {
		bool isNew;
		jobject arg = titanium::TypeConverter::jsValueToJavaObject(args[i+0], &isNew);
		env->SetObjectArrayElement(varArgs, i, arg);
		if (isNew) {
			env->DeleteLocalRef(arg);
		}
	}

	jArguments[0].l = varArgs;

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}


			env->DeleteLocalRef(jArguments[0].l);

	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::imageWithRoundedCorner(const Arguments& args)
{
	LOGD(TAG, "imageWithRoundedCorner()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageWithRoundedCorner", "(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageWithRoundedCorner' with signature '(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "imageWithRoundedCorner: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	bool isNew_1;
	
	if (!args[1]->IsNull()) {
		Local<Value> arg_1 = args[1];
		jArguments[1].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_1, &isNew_1);
	} else {
		jArguments[1].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


			if (isNew_1) {
				env->DeleteLocalRef(jArguments[1].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::imageAsResized(const Arguments& args)
{
	LOGD(TAG, "imageAsResized()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageAsResized", "(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageAsResized' with signature '(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "imageAsResized: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	bool isNew_1;
	
	if (!args[1]->IsNull()) {
		Local<Value> arg_1 = args[1];
		jArguments[1].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_1, &isNew_1);
	} else {
		jArguments[1].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


			if (isNew_1) {
				env->DeleteLocalRef(jArguments[1].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}
Handle<Value> ImageFactoryModule::imageAsThumbnail(const Arguments& args)
{
	LOGD(TAG, "imageAsThumbnail()");
	HandleScope scope;

	JNIEnv *env = titanium::JNIScope::getEnv();
	if (!env) {
		return titanium::JSException::GetJNIEnvironmentError();
	}
	static jmethodID methodID = NULL;
	if (!methodID) {
		methodID = env->GetMethodID(ImageFactoryModule::javaClass, "imageAsThumbnail", "(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;");
		if (!methodID) {
			const char *error = "Couldn't find proxy method 'imageAsThumbnail' with signature '(Lorg/appcelerator/titanium/TiBlob;Ljava/util/HashMap;)Lorg/appcelerator/titanium/TiBlob;'";
			LOGE(TAG, error);
				return titanium::JSException::Error(error);
		}
	}

	titanium::Proxy* proxy = titanium::Proxy::unwrap(args.Holder());

	if (args.Length() < 2) {
		char errorStringBuffer[100];
		sprintf(errorStringBuffer, "imageAsThumbnail: Invalid number of arguments. Expected 2 but got %d", args.Length());
		return ThrowException(Exception::Error(String::New(errorStringBuffer)));
	}

	jvalue jArguments[2];




	bool isNew_0;
	
	if (!args[0]->IsNull()) {
		Local<Value> arg_0 = args[0];
		jArguments[0].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_0, &isNew_0);
	} else {
		jArguments[0].l = NULL;
	}

	bool isNew_1;
	
	if (!args[1]->IsNull()) {
		Local<Value> arg_1 = args[1];
		jArguments[1].l =
			titanium::TypeConverter::jsValueToJavaObject(arg_1, &isNew_1);
	} else {
		jArguments[1].l = NULL;
	}

	jobject javaProxy = proxy->getJavaObject();
	jobject jResult = (jobject)env->CallObjectMethodA(javaProxy, methodID, jArguments);



	if (!JavaObject::useGlobalRefs) {
		env->DeleteLocalRef(javaProxy);
	}



			if (isNew_0) {
				env->DeleteLocalRef(jArguments[0].l);
			}


			if (isNew_1) {
				env->DeleteLocalRef(jArguments[1].l);
			}


	if (env->ExceptionCheck()) {
		Handle<Value> jsException = titanium::JSException::fromJavaException();
		env->ExceptionClear();
		return jsException;
	}

	if (jResult == NULL) {
		return Null();
	}

	Handle<Value> v8Result = titanium::TypeConverter::javaObjectToJsValue(jResult);

	env->DeleteLocalRef(jResult);


	return v8Result;

}

// Dynamic property accessors -------------------------------------------------


		} // imagefactory
		} // ti
