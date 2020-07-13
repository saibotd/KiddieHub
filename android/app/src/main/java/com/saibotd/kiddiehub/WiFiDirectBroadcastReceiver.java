package com.saibotd.kiddiehub;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.p2p.WifiP2pDevice;
import android.net.wifi.p2p.WifiP2pDeviceList;
import android.net.wifi.p2p.WifiP2pManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class WiFiDirectBroadcastReceiver extends BroadcastReceiver {

    private static final String EVENT_PEERS_RECEIVED = "peersReceived";
    private final WifiChatModule module;
    private WifiP2pManager manager;
    private WifiP2pManager.Channel channel;
    WifiP2pManager.PeerListListener peerListListener;

    public WiFiDirectBroadcastReceiver(WifiP2pManager manager, WifiP2pManager.Channel channel, WifiChatModule module) {
        super();
        this.manager = manager;
        this.channel = channel;
        this.module = module;
        peerListListener = peers -> {
            WritableArray arr = Arguments.createArray();
            for(WifiP2pDevice device : peers.getDeviceList()){
                WritableMap item = Arguments.createMap();
                item.putString("address", device.deviceAddress);
                item.putString("name", device.deviceName);
                item.putString("primaryType", device.primaryDeviceType);
                item.putString("secondaryType", device.secondaryDeviceType);
                arr.pushMap(item);
            }
            module.sendEvent(EVENT_PEERS_RECEIVED, arr);
        };
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        if (WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION.equals(action)) {
            // Check to see if Wi-Fi is enabled and notify appropriate activity
        } else if (WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION.equals(action)) {
            if (manager != null) {
                manager.requestPeers(channel, peerListListener);
            }
        } else if (WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION.equals(action)) {
            // Respond to new connection or disconnections
        } else if (WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION.equals(action)) {
            // Respond to this device's wifi state changing
        }
    }
}