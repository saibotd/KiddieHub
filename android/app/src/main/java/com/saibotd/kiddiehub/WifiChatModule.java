package com.saibotd.kiddiehub;

import android.content.Context;
import android.content.IntentFilter;
import android.net.wifi.p2p.WifiP2pConfig;
import android.net.wifi.p2p.WifiP2pManager;
import android.net.wifi.p2p.nsd.WifiP2pServiceInfo;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static android.os.Looper.getMainLooper;

public class WifiChatModule extends ReactContextBaseJavaModule {
    private static final String NO_CURRENT_ACTIVITY = "NO_CURRENT_ACTIVITY";
    private static final String DISCOVER_FAILED = "DISCOVER_FAILED";
    private static final String CONNECT_FAILED = "CONNECT_FAILED";
    private final IntentFilter intentFilter;
    private WifiP2pManager manager;
    private WifiP2pManager.Channel channel;
    private WiFiDirectBroadcastReceiver receiver;

    public WifiChatModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        intentFilter = new IntentFilter();
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION);
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION);
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION);
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION);
    }

    @NonNull
    @Override
    public String getName() {
        return "WifiChat";
    }

    public void sendEvent(String eventName, @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    public void sendEvent(String eventName, @Nullable WritableArray params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void init(Promise promise) {
        if(getCurrentActivity()==null) {
            promise.reject(NO_CURRENT_ACTIVITY, "Activity gone");
            return;
        }
        manager = (WifiP2pManager) getCurrentActivity().getSystemService(Context.WIFI_P2P_SERVICE);
        channel = manager.initialize(getCurrentActivity(), getMainLooper(), null);
        receiver = new WiFiDirectBroadcastReceiver(manager, channel, this);
        getCurrentActivity().registerReceiver(receiver, intentFilter);
        promise.resolve(true);
    }

    @ReactMethod
    public void release(Promise promise) {
        if(getCurrentActivity()!=null) getCurrentActivity().unregisterReceiver(receiver);
        manager = null;
        channel = null;
        receiver = null;
        promise.resolve(true);
    }

    @ReactMethod
    public void discover(Promise promise) {
        manager.discoverPeers(channel, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                promise.resolve(true);
            }

            @Override
            public void onFailure(int reason) {
                promise.reject(DISCOVER_FAILED, String.valueOf(reason));
            }
        });
    }

    @ReactMethod
    public void connect(String deviceAddress, Promise promise) {
        WifiP2pConfig config = new WifiP2pConfig();
        config.deviceAddress = deviceAddress;
        manager.connect(channel, config, new WifiP2pManager.ActionListener() {

            @Override
            public void onSuccess() {
                promise.resolve(true);
            }

            @Override
            public void onFailure(int reason) {
                promise.reject(CONNECT_FAILED, String.valueOf(reason));
            }
        });
    }
}
