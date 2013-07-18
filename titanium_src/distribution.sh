#init
 
MOBILE_SDK=/Users/joseandro/Library/Application\ Support/Titanium/mobilesdk/osx/2.1.3.GA/
ANDROID_SDK=/Users/joseandro/Documents/android-sdk-macosx/
 
mkdir temp
mkdir dist
rm -r temp/*
rm -r dist/*
 
#copy apk
cp build/android/bin/app.apk .
unzip -o -d temp/ app.apk 
 
#remove some things - you may want to remove other cruft
rm -rf temp/lib/armeabi
rm -rf temp/lib/x86
 
#zip it 
cd temp
zip -r ../dist/app-unsigned.apk *
cd ..
 
#sign
jarsigner -sigalg MD5withRSA -digestalg SHA1 -storepass tirocks -keystore "$MOBILE_SDK/android/dev_keystore" -signedjar dist/app.apk dist/app-unsigned.apk tidev
$ANDROID_SDK/tools/zipalign -v 4 dist/app.apk dist/app.apkz
mv dist/app.apkz dist/app.apk
 
#install
$ANDROID_SDK/platform-tools/adb -d install -r dist/app.apk
 
#size
ls -lah dist/app.apk
