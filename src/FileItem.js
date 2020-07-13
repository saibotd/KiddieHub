import * as React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import RNFS from "react-native-fs";
import Metadata from "./Metadata";
import VideoThumbnail from "./VideoThumbnail";

const getThumbnail = async (path, setter) => {
    const suffixes = [".jpg", ".jpeg", ".png"];
    let items = [];
    try {
        items = await RNFS.readDir(path);
    } catch (e) {
        items = [];
    }
    for (const item of items) {
        for (const suffix of suffixes) {
            if (item.name.toLowerCase().endsWith(suffix)) {
                return setter(`file://${item.path}`);
            }
        }
    }
};

const getVideoThumbnail = async (path, setter) => {
    try {
        const thumbnail = await VideoThumbnail.make(path);
        console.log({ thumbnail });
        return setter(`file://${thumbnail}`);
    } catch (e) {
        console.log(e);
    }
};

const getMetadata = async (path, setter) => {
    try {
        const metadata = await Metadata.get(path);
        return setter(metadata);
    } catch (e) {
        console.log(e);
    }
};

export default ({ path, name, isDir, defaultThumbnail, onPress }) => {
    if (!path) return null;
    const [metadata, setMetadata] = React.useState(null);
    const [thumbnail, setThumbnail] = React.useState(defaultThumbnail);
    React.useEffect(() => {
        if (path.endsWith(".mp4")) getVideoThumbnail(path, setThumbnail);
        if (path.endsWith(".mp3")) getMetadata(path, setMetadata);
        if (isDir) getThumbnail(path, setThumbnail);
    }, [name, path]);
    const title =
        metadata && metadata.title ? metadata.title : name.split(".")[0];
    //console.log({ thumbnail });

    return (
        <TouchableNativeFeedback
            useForeground
            style={{ flex: 1 }}
            background={TouchableNativeFeedback.Ripple("#FFF")}
            underlayColor={"#FFF"}
            onPress={() => onPress({ path, thumbnail, isDir, metadata, title })}
        >
            <View style={styles.container}>
                <Image
                    resizeMode="cover"
                    source={{ uri: thumbnail }}
                    style={styles.thumbnail}
                />
                <Text numberOfLines={1} style={styles.title}>
                    {title}
                </Text>
            </View>
        </TouchableNativeFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "stretch",
    },
    thumbnail: {
        flex: 1,
        width: null,
        height: null,
        borderRadius: 5,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
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
