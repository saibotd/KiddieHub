import ViewPager from "@react-native-community/viewpager";
import * as React from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { FlatGrid } from "react-native-super-grid";
import { BackspaceIcon } from "./Icon";

const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ!?.,+-*/=()"];
const numbers = [..."1234567890"];
let cache;

const emojis = [];
const emojiRange = [
    [128513, 128591],
    [128000, 128279],
];

for (const range of emojiRange) {
    for (var x = range[0]; x < range[1]; x++) {
        emojis.push(String.fromCodePoint(x));
    }
}

export default React.memo(
    ({ show, onChange, defaultValue }) => {
        const [height, setHeight] = React.useState(
            DeviceInfo.isTablet() ? 320 : 210
        );
        const [value, setValue] = React.useState(defaultValue || "");
        const [showEmojies, setShowEmojies] = React.useState(false);

        React.useEffect(() => {
            console.log("onChange", value);
            onChange(value);
        }, [value]);

        const type = (letter) => {
            console.log(value, letter);
            setValue(value + letter);
        };

        const renderKey = (
            letter,
            style = null,
            onPress = (letter) => {
                type(letter);
            }
        ) => (
            <TouchableNativeFeedback
                useForeground
                background={TouchableNativeFeedback.Ripple("#FFF")}
                onPress={() => onPress(letter)}
            >
                <View style={[styles.key, style, { width: "auto", flex: 1 }]}>
                    <Text style={styles.label} numberOfLines={1}>
                        {letter}
                    </Text>
                </View>
            </TouchableNativeFeedback>
        );

        if (/*!cache*/ 1) {
            cache = (
                <ViewPager
                    style={{
                        height,
                    }}
                    initialPage={0}
                    onPageSelected={(e) => {
                        setShowEmojies(e.nativeEvent.position == 1);
                    }}
                >
                    <View
                        key={0}
                        style={{ padding: 5 }}
                        ref={(ref) => {
                            console.log(ref);
                        }}
                        onLayout={(event) => {
                            //setHeight(event.nativeEvent.layout.height + 10);
                        }}
                    >
                        <FlatGrid
                            itemDimension={
                                Dimensions.get("window").width / 10 - 10
                            }
                            scrollEnabled={false}
                            data={numbers}
                            spacing={0}
                            renderItem={({ item }) =>
                                renderKey(item, styles.keySlim)
                            }
                            style={{ flexGrow: 0 }}
                        />
                        <FlatGrid
                            itemDimension={
                                Dimensions.get("window").width / 10 - 10
                            }
                            scrollEnabled={false}
                            data={letters}
                            spacing={0}
                            renderItem={({ item }) => renderKey(item)}
                            style={{ flexGrow: 0 }}
                        />
                        <View
                            style={{
                                flexDirection: "row",
                            }}
                        >
                            <TouchableNativeFeedback
                                onPress={() => {
                                    setValue(value + " ");
                                }}
                            >
                                <View style={[styles.key, { flex: 1 }]}>
                                    <Text
                                        style={[styles.label, { fontSize: 40 }]}
                                        numberOfLines={1}
                                    >
                                        —
                                    </Text>
                                </View>
                            </TouchableNativeFeedback>
                            <TouchableNativeFeedback
                                onPress={() => {
                                    setValue(
                                        value.substring(0, value.length - 1)
                                    );
                                }}
                            >
                                <View
                                    style={[
                                        styles.key,
                                        { paddingLeft: 15, paddingRight: 15 },
                                    ]}
                                >
                                    <BackspaceIcon width="28" height="28" />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                    <View key={1} style={{ padding: 5 }}>
                        <View style={styles.keys}>
                            <FlatGrid
                                itemDimension={
                                    Dimensions.get("window").width / 10 - 10
                                }
                                data={showEmojies ? emojis : []}
                                spacing={0}
                                renderItem={({ item }) => renderKey(item)}
                            />
                        </View>
                    </View>
                </ViewPager>
            );
        }

        return cache;
    },
    (prevProps, nextProps) => {
        return prevProps.show == nextProps.show;
    }
);

const styles = StyleSheet.create({
    wrapper: {},
    keys: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
    },
    keysRow: {
        flexDirection: "row",
        flexGrow: 1,
        flex: 1,
    },
    key: {
        height: DeviceInfo.isTablet() ? 48 : 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF33",
        borderColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        margin: 2,
    },
    keySlim: {
        height: DeviceInfo.isTablet() ? 38 : 28,
    },
    label: {
        fontSize: 24,
        color: "#FFF",
    },
    title: {
        backgroundColor: "#FFFFFF77",
        padding: 2,
        borderRadius: 5,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        textAlign: "center",
        fontSize: DeviceInfo.isTablet() ? 22 : 16,
    },
});
