import * as React from "react";
import { StyleSheet, View } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import RNLockTask from "react-native-lock-task";
import SettingsList from "react-native-settings-list";

export default ({ path, thumbnail, navigator }) => {
    return (
        <View style={styles.container}>
            <SettingsList>
                <SettingsList.Header
                    headerText="Settings"
                    headerStyle={{ color: "black" }}
                />
                <SettingsList.Item
                    title="Unlock App"
                    onPress={async () => {
                        await RNLockTask.stopLockTask();
                    }}
                />
                <SettingsList.Item
                    title="System settings"
                    onPress={async () => {
                        await RNLockTask.stopLockTask();
                        AndroidOpenSettings.generalSettings();
                    }}
                />
                <SettingsList.Item
                    title="Release ownership"
                    onPress={async () => {
                        await RNLockTask.clearDeviceOwnerApp();
                    }}
                />
            </SettingsList>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ccff99",
    },
});
