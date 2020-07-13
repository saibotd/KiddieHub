package com.saibotd.kiddiehub;

import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class MediaStoreModule extends ReactContextBaseJavaModule {
    public MediaStoreModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);

    }

    @NonNull
    @Override
    public String getName() {
        return "MediaStore";
    }

    @ReactMethod
    public void getVideo(Promise promise) {
        Runnable runnable = () -> {
            WritableArray items = Arguments.createArray();
            Cursor c = getReactApplicationContext().getContentResolver().query(
                    MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                    new String[]{
                            MediaStore.Video.Media.DISPLAY_NAME,
                            MediaStore.Video.Media.DATA,
                            MediaStore.Video.Media._ID
                    },
                    null,
                    null,
                    null
            );


            if (c != null) {
                while (c.moveToNext()) {
                    String path = c.getString(c.getColumnIndex(MediaStore.Audio.Media.DATA));
                    if(!path.contains("/KiddieHub/")) continue;
                    WritableMap val = Arguments.createMap();
                    val.putString("name", c.getString(c.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)));
                    val.putString("path", path);
                    Uri uri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,c.getInt(c.getColumnIndex(MediaStore.Images.ImageColumns._ID)));
                    val.putString("uri", uri.toString());
                    items.pushMap(val);
                }
                c.close();
            }
            promise.resolve(items);
        };
        new Thread(runnable).start();
    }

    @ReactMethod
    public void getAudio(Promise promise) {
        Runnable runnable = () -> {
            WritableArray items = Arguments.createArray();
            Cursor c = getReactApplicationContext().getContentResolver().query(
                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                    new String[]{
                            MediaStore.Audio.Media.DISPLAY_NAME,
                            MediaStore.Audio.Media.DATA,
                            MediaStore.Audio.Media.ALBUM,
                            MediaStore.Audio.Media.ARTIST,
                            MediaStore.Audio.Media._ID
                    },
                    null,
                    null,
                    null
            );


            if (c != null) {
                while (c.moveToNext()) {
                    String path = c.getString(c.getColumnIndex(MediaStore.Audio.Media.DATA));
                    if(!path.contains("/KiddieHub/")) continue;
                    WritableMap val = Arguments.createMap();
                    val.putString("name", c.getString(c.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)));
                    val.putString("path", path);
                    val.putString("artist", c.getString(c.getColumnIndex(MediaStore.Audio.Media.ARTIST)));
                    val.putString("album", c.getString(c.getColumnIndex(MediaStore.Audio.Media.ALBUM)));
                    Uri uri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,c.getInt(c.getColumnIndex(MediaStore.Images.ImageColumns._ID)));
                    val.putString("uri", uri.toString());
                    items.pushMap(val);
                }
                c.close();
            }
            promise.resolve(items);
        };
        new Thread(runnable).start();

    }
}
