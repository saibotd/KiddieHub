package com.saibotd.kiddiehub;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class VideoPlayerModule extends ReactContextBaseJavaModule {
    private static final String NO_CURRENT_ACTIVITY = "NO_CURRENT_ACTIVITY";

    public VideoPlayerModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "VideoPlayer";
    }

    @ReactMethod
    public void play(String file, Promise promise) {
        Log.d("VP", file);
        if(getCurrentActivity() == null) {
            promise.reject(NO_CURRENT_ACTIVITY, NO_CURRENT_ACTIVITY);
            return;
        }
        Intent intent = new Intent(getCurrentActivity(), VideoPlayerActivity.class);
        intent.putExtra("file", file);
        getCurrentActivity().startActivity(intent);
    }
}
