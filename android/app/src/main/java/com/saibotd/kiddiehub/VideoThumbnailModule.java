package com.saibotd.kiddiehub;

import android.graphics.Bitmap;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileOutputStream;

import wseemann.media.FFmpegMediaMetadataRetriever;

public class VideoThumbnailModule extends ReactContextBaseJavaModule {
    public VideoThumbnailModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);

    }

    @NonNull
    @Override
    public String getName() {
        return "VideoThumbnail";
    }

    @ReactMethod
    public void make(String videoFilePath, Promise promise) {
        Runnable runnable = () -> {
            File file = new File(getCurrentActivity().getCacheDir(), Base64.encodeToString(videoFilePath.getBytes(), Base64.DEFAULT).concat(".jpg"));
            if (file.exists()){
                promise.resolve(file.getAbsolutePath());
                return;
            }
            Bitmap bitmap = null;
            FFmpegMediaMetadataRetriever mediaMetadataRetriever = new FFmpegMediaMetadataRetriever();
            mediaMetadataRetriever.setDataSource(videoFilePath);
            long duration = 0;
            String dur = mediaMetadataRetriever.extractMetadata(FFmpegMediaMetadataRetriever.METADATA_KEY_DURATION);
            if(dur != null){
                duration = Integer.parseInt(dur) / 2;
            }
            Log.d("duration", duration+"");
            try {
                bitmap = mediaMetadataRetriever.getFrameAtTime(duration*1000, FFmpegMediaMetadataRetriever.OPTION_CLOSEST_SYNC);
            } catch (Exception e){
                promise.reject(e);
            }
            mediaMetadataRetriever.release();
            if(bitmap != null){
                Log.d("FILE", file.getAbsolutePath());
                Log.d("FILE", bitmap.getByteCount()+"");
                try {
                    FileOutputStream out = new FileOutputStream(file);
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out);
                    out.flush();
                    out.close();
                    promise.resolve(file.getAbsolutePath());
                } catch (Exception e) {
                    promise.reject(e);
                }
            }
        };
        new Thread(runnable).start();
    }
}
