import * as React from "react";
import {
    DeviceEventEmitter,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    View,
} from "react-native";
import BatteryManager from "./BatteryManager";
import {
    BatteryCharging,
    BatteryEmpty,
    BatteryFull,
    BatteryHalf,
    InternetIcon,
    LockClosedIcon,
    LockOpenIcon,
} from "./Icon";

export default ({ connected, restricted, askForPermission, lock }) => {
    const [batteryLevel, setBatteryLevel] = React.useState(0);
    const [charging, setCharging] = React.useState(false);
    let batteryListener;

    const batteryUpdate = ({ level, isPlugged }) => {
        setBatteryLevel(level);
        setCharging(isPlugged);
    };
    React.useEffect(() => {
        BatteryManager.updateBatteryLevel(batteryUpdate);
        batteryListener = DeviceEventEmitter.addListener(
            "BatteryStatus",
            batteryUpdate
        );
        return () => {
            batteryListener.remove();
        };
    }, []);
    const conIcon = connected ? <InternetIcon width={28} height={28} /> : null;
    const lockedIcon = restricted ? (
        <LockClosedIcon width={28} height={28} />
    ) : (
        <LockOpenIcon width={28} height={28} />
    );
    const batteryIcon = charging ? (
        <BatteryCharging width={28} height={28} />
    ) : batteryLevel < 10 ? (
        <BatteryEmpty width={28} height={28} />
    ) : batteryLevel < 60 ? (
        <BatteryHalf width={28} height={28} />
    ) : (
        <BatteryFull width={28} height={28} />
    );
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row" }}>
                <View style={styles.battery}>
                    {batteryIcon}
                    <Text
                        style={{ color: "white", padding: 5 }}
                    >{`${batteryLevel}%`}</Text>
                </View>
                {conIcon}
                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple("#FFF")}
                    underlayColor={"#FFF"}
                    onPress={() => {
                        if (restricted) askForPermission();
                        else lock();
                    }}
                >
                    {lockedIcon}
                </TouchableNativeFeedback>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 32,
        padding: 5,
        alignItems: "flex-end",
    },
    battery: {
        flexDirection: "row",
        alignItems: "center",
    },
});
