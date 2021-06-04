package com.saibotd.kiddiehub;

import android.content.Context;
import android.content.IntentFilter;
import android.net.wifi.p2p.WifiP2pConfig;
import android.net.wifi.p2p.WifiP2pDevice;
import android.net.wifi.p2p.WifiP2pManager;
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceInfo;
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceRequest;
import android.net.wifi.p2p.nsd.WifiP2pServiceInfo;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

import static android.os.Looper.getMainLooper;

public class WifiChatModule extends ReactContextBaseJavaModule {
    private static final String NO_CURRENT_ACTIVITY = "NO_CURRENT_ACTIVITY";
    private static final String DISCOVER_FAILED = "DISCOVER_FAILED";
    private static final String CONNECT_FAILED = "CONNECT_FAILED";
    private static final String SERVICE_FAILED = "SERVICE_FAILED";
    private static final String TAG = "WifiChatModule";
    private static final String SERVICE_INSTANCE = "KiddieHubChat";
    private static final String EVENT_PEER_RECEIVED = "peerReceived";
    private final IntentFilter intentFilter;
    private WifiP2pManager manager;
    private WifiP2pManager.Channel channel;
    private WiFiDirectBroadcastReceiver receiver;
    private WifiP2pDnsSdServiceInfo service;

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
    public void startService(Promise promise) {
        if(getCurrentActivity()==null) {
            promise.reject(NO_CURRENT_ACTIVITY, "Activity gone");
            return;
        }
        Map<String, String> record = new HashMap<>();
        record.put("Name", "Hi");
        record.put("Port", "12345");

        service = WifiP2pDnsSdServiceInfo.newInstance(
                SERVICE_INSTANCE, "_presence._tcp", record);
        manager.addLocalService(channel, service, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                promise.resolve(true);
            }

            @Override
            public void onFailure(int reason) {
                promise.reject(SERVICE_FAILED, String.valueOf(reason));
            }
        });

    }

    @ReactMethod
    public void release(Promise promise) {
        if(getCurrentActivity()!=null) getCurrentActivity().unregisterReceiver(receiver);
        try{
            manager.stopPeerDiscovery(channel, null);
        } catch (Exception e){}
        try{
            manager.clearLocalServices(channel, null);
        } catch (Exception e){}
        manager = null;
        channel = null;
        receiver = null;
        promise.resolve(true);
    }

    @ReactMethod
    public void discover(Promise promise) {
        /*
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
         */
        manager.setDnsSdResponseListeners(channel,
                new WifiP2pManager.DnsSdServiceResponseListener() {

                    @Override
                    public void onDnsSdServiceAvailable(String instanceName,
                                                        String registrationType, WifiP2pDevice device) {

                        //if (instanceName.equalsIgnoreCase(SERVICE_INSTANCE)) {

                            Log.d(TAG, "onWifriensServiceAvailable " + instanceName);
                            Log.d(TAG, "onWifriendsServiceAvailable " + device.deviceAddress);
                            WritableMap item = Arguments.createMap();
                            item.putString("address", device.deviceAddress);
                            item.putString("name", device.deviceName);
                            item.putString("primaryType", device.primaryDeviceType);
                            item.putString("secondaryType", device.secondaryDeviceType);
                            sendEvent(EVENT_PEER_RECEIVED, item);
                            // update the List of Peers
                            //TODO



                       // }

                    }
                }, new WifiP2pManager.DnsSdTxtRecordListener() {

                    /**
                     * A new TXT record is available. Pick up the advertised
                     * buddy name.
                     */
                    @Override
                    public void onDnsSdTxtRecordAvailable(
                            String fullDomainName, Map<String, String> record,
                            WifiP2pDevice device) {
                        Log.d(TAG,
                                device.deviceName + " is "
                                        + record.get("Name"));

                        //TODO Logic to include "TXTRECORD_PROP_LASTUPDATED" to validate
                    }
                });

        // After attaching listeners, create a service request and initiate
        // discovery.
        WifiP2pDnsSdServiceRequest serviceRequest = WifiP2pDnsSdServiceRequest.newInstance();
        manager.addServiceRequest(channel, serviceRequest,
                new WifiP2pManager.ActionListener() {

                    @Override
                    public void onSuccess() {

                    }

                    @Override
                    public void onFailure(int arg0) {

                    }
                });
        manager.discoverServices(channel, new WifiP2pManager.ActionListener() {

            @Override
            public void onSuccess() {
                promise.resolve(true);
            }

            @Override
            public void onFailure(int reason) {
                String failReason = "Failed";
                if (reason == WifiP2pManager.P2P_UNSUPPORTED) {
                    failReason = "P2P_UNSUPPORTED";
                    Log.d(TAG, "P2P isn't supported on this device.");
                } else if (reason == WifiP2pManager.BUSY) {
                    failReason = "P2P_BUSY";
                    Log.d(TAG, "WiFi P2p is Busy");
                } else if (reason == WifiP2pManager.ERROR) {
                    failReason = "P2P_ERROR";
                    Log.d(TAG, "Internal Error in WiFi P2p");
                }
                promise.reject("d", "342");

                //TODO Change the WIFI reset pattern


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
