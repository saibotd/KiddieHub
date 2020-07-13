package com.saibotd.kiddiehub;

import android.media.MediaMetadataRetriever;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class MetadataModule extends ReactContextBaseJavaModule {
    public MetadataModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "Metadata";
    }

    @ReactMethod
    public void get(String file, Promise promise) {
        Runnable runnable = () -> {
            MediaMetadataRetriever mediaMetadataRetriever = new MediaMetadataRetriever();
            try{
                mediaMetadataRetriever.setDataSource(file);
                WritableMap result = Arguments.createMap();
                result.putString("title", mediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE));
                result.putString("album", mediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM));
                result.putString("artist", mediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST));
                result.putString("track_number", mediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CD_TRACK_NUMBER));
                promise.resolve(result);
            } catch(Exception e) {
                promise.reject(e);
            } finally {
                mediaMetadataRetriever.release();
            }
        };
        new Thread(runnable).start();
    }
}
