@echo off
set "JAVA_HOME=C:\Users\facum\android-build-tools\jdk-21.0.2+13"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=C:\Users\facum\android-build-tools\android-sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"

echo [1/5] Installing Android SDK Platform 36...
echo y| call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-36"

echo [2/5] Building web application with Vite...
cd /d "C:\Users\facum\OneDrive\Escritorio\APPs IA\EnglishLearning"
call npm.cmd run build

echo [3/5] Syncing Capacitor Android...
call npx.cmd cap sync android

echo [4/5] Building APK with Gradle...
cd /d "C:\Users\facum\OneDrive\Escritorio\APPs IA\EnglishLearning\android"
call gradlew.bat assembleDebug

echo [5/5] Checking generated APK...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "app\build\outputs\apk\debug\app-debug.apk" "C:\Users\facum\OneDrive\Escritorio\APPs IA\EnglishLearning.apk"
    echo ========================================================
    echo SUCCESS! APK created at:
    echo C:\Users\facum\OneDrive\Escritorio\APPs IA\EnglishLearning.apk
    echo ========================================================
) else (
    echo Build failed. Check gradle log above.
)
