import NetInfo from "@react-native-community/netinfo";
import * as React from "react";
import { StyleSheet, TouchableNativeFeedback, View } from "react-native";
import RNAndroidInstalledApps from "react-native-android-installed-apps";
import DeviceInfo from "react-native-device-info";
import { ScrollView } from "react-native-gesture-handler";
import RNLockTask from "react-native-lock-task";
import AuthKeypadModal from "./AuthKeypadModal";
import Config from "./Config";
import HomeItem from "./HomeItem";
import { SettingsIcon } from "./Icon";
import TopBar from "./TopBar";

export default ({ navigator }) => {
    const [menuItems, setMenuItems] = React.useState(Config.menuItems);
    const [connected, setConnected] = React.useState(false);
    const [restricted, setRestricted] = React.useState(true);
    const [authRequest, setAuthRequest] = React.useState(null);
    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setConnected(state.isConnected);
        });
        NetInfo.fetch().then((state) => {
            setConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);
    React.useEffect(() => {
        const appsWhitelist = [
            "com.saibotd.kiddiehub",
            ...menuItems
                .filter(({ type }) => type == "app")
                .map(({ value }) => value),
        ];
        try {
            RNLockTask.startLockTaskWith(appsWhitelist);
        } catch (e) {}
        RNAndroidInstalledApps.getApps()
            .then((apps) => {
                const installedPackages = apps.map((app) => app.packageName);
                console.log(installedPackages);
                const filteredMenuItems = menuItems
                    .filter(
                        ({ type, value }) =>
                            type != "app" ||
                            installedPackages.indexOf(value) >= 0
                    )
                    .map((item) => {
                        if (item.type != "app") return item;
                        for (app of apps)
                            if (app.packageName == item.value)
                                return { ...app, ...item };
                    });
                setMenuItems(filteredMenuItems);
            })
            .catch((error) => {
                alert(error);
            });
    }, []);
    const askForPermission = (onSuccess, onFail) => {
        setAuthRequest({ onSuccess, onFail });
    };
    const lock = () => {
        setRestricted(true);
    };
    const items = menuItems.map((menuItem, i) => (
        <HomeItem
            connected={connected}
            restricted={restricted}
            navigator={navigator}
            lock={lock}
            askForPermission={askForPermission}
            item={menuItem}
            key={i}
        />
    ));
    return (
        <View style={styles.container}>
            <AuthKeypadModal
                isVisible={!!authRequest}
                onClose={() => {
                    console.log("onClose");
                    if (authRequest && authRequest.onFail) authRequest.onFail();
                    setAuthRequest(null);
                }}
                onSuccess={() => {
                    console.log("onSuccess");
                    if (authRequest && authRequest.onSuccess)
                        authRequest.onSuccess();
                    else setRestricted(false);
                    setAuthRequest(null);
                }}
            />
            <TopBar
                connected={connected}
                restricted={restricted}
                lock={lock}
                askForPermission={askForPermission}
            />
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                }}
            >
                <View
                    style={{
                        //justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <View style={styles.gridView}>{items}</View>
                    <View style={{ marginTop: 10 }}>
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple("#FFF")}
                            underlayColor={"#FFF"}
                            onPress={() => {
                                askForPermission(async () => {
                                    navigator.push("SettingsView");
                                });
                            }}
                        >
                            <View style={{ padding: 10 }}>
                                <SettingsIcon width={32} height={32} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#9326ff",
    },
    gridView: {
        width: DeviceInfo.isTablet() ? 600 : "auto",
        justifyContent: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 20,
    },
    label: {
        padding: 2,
        textAlign: "center",
        color: "#fff",
    },
});
