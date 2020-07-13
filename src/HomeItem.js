import * as React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    View,
} from "react-native";
import IntentLauncher from "react-native-android-intent-launcher";
import DeviceInfo from "react-native-device-info";
import { getPath } from "./Fs";
import { LockClosedIcon } from "./Icon";

export default ({
    item,
    connected,
    navigator,
    restricted,
    askForPermission,
    lock,
}) => {
    const iconSize = DeviceInfo.isTablet() ? 100 : 72;
    const iconStyle = [
        { width: iconSize, height: iconSize },
        item.internet && !connected ? { opacity: 0.5 } : null,
        item.restricted && restricted ? { opacity: 0.5 } : null,
    ];
    if (!connected && item.internet) return null;
    const lockIcon =
        restricted && item.restricted ? (
            <LockClosedIcon
                width={28}
                height={28}
                style={{ position: "absolute", top: 10, right: 10 }}
            />
        ) : null;
    const doIfPermitted = (item, func) => {
        if (!item.restricted || !restricted) return func();
        askForPermission(
            () => {
                func();
                lock();
            },
            () => {
                console.log("no");
            }
        );
    };

    switch (item.type) {
        case "app":
            return (
                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple("#FFF")}
                    underlayColor={"#FFF"}
                    onPress={() => {
                        doIfPermitted(item, () =>
                            IntentLauncher.startAppByPackageName(item.value)
                        );
                    }}
                >
                    <View
                        style={[
                            styles.item,
                            { width: iconSize + 40, height: iconSize + 60 },
                        ]}
                    >
                        <Image
                            source={{
                                uri: `data:image/jpeg;base64,${item.icon}`,
                            }}
                            style={iconStyle}
                        />
                        <Text numberOfLines={1} style={styles.label}>
                            {item.appName}
                        </Text>
                        {lockIcon}
                    </View>
                </TouchableNativeFeedback>
            );
        case "navigate":
            return (
                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple("#FFF")}
                    underlayColor={"#FFF"}
                    onPress={() => {
                        doIfPermitted(item, () => {
                            const attr = {
                                ...item.value.attr,
                                path: getPath(item.value.attr.path),
                            };
                            navigator.push(item.value.view, attr);
                        });
                    }}
                >
                    <View
                        style={[
                            styles.item,
                            { width: iconSize + 40, height: iconSize + 60 },
                        ]}
                    >
                        <item.icon
                            style={iconStyle}
                            width={iconSize}
                            height={iconSize}
                        />
                        <Text numberOfLines={1} style={styles.label}>
                            {item.label}
                        </Text>
                        {lockIcon}
                    </View>
                </TouchableNativeFeedback>
            );
    }
    return null;
};

const styles = StyleSheet.create({
    item: {
        padding: 20,
        alignItems: "center",
    },
    label: {
        paddingTop: 2,
        textAlign: "center",
        color: "#fff",
        fontSize: DeviceInfo.isTablet() ? 22 : 16,
    },
});
