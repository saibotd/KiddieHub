import * as React from "react";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    View,
} from "react-native";
import TrackPlayer from "react-native-track-player";
import PauseIcon from "../assets/pause-circle.svg";
import PlayIcon from "../assets/play-circle.svg";
import PrevIcon from "../assets/play-skip-back-circle.svg";
import NextIcon from "../assets/play-skip-forward-circle.svg";
import Metadata from "./Metadata";

const getMetadata = async (path) => {
    let metadata;
    try {
        metadata = await Metadata.get(path);
    } catch (e) {
        console.log(e);
    }
    return metadata;
};

export default ({ thumbnail, items, path, metadata, title }) => {
    const metadataCache = { path: metadata };
    const [curMetadata, setCurMetadata] = React.useState(metadata);
    const [playState, setPlaystate] = React.useState(null);
    React.useEffect(() => {
        TrackPlayer.setupPlayer().then(async () => {
            TrackPlayer.addEventListener("playback-state", ({ state }) =>
                setPlaystate(state)
            );
            for (item of items) {
                const _metadata = await getMetadata(item.path);
                metadataCache[item.path] = _metadata;
                await TrackPlayer.add({
                    id: item.path,
                    url: item.path,
                    artwork: thumbnail,
                    ..._metadata,
                });
            }
            await TrackPlayer.skip(path);
            await TrackPlayer.play();
            TrackPlayer.addEventListener(
                "playback-track-changed",
                ({ nextTrack }) => {
                    if (metadataCache[nextTrack])
                        setCurMetadata(metadataCache[nextTrack]);
                }
            );
        });

        return () => {
            TrackPlayer.stop().then(() => TrackPlayer.destroy());
        };
    }, []);
    return (
        <View style={styles.container}>
            <ImageBackground
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#FFF",
                }}
                source={{ uri: thumbnail }}
                imageStyle={{ opacity: 0.6 }}
                blurRadius={10}
            >
                <Text
                    style={{
                        fontWeight: "bold",
                        padding: 10,
                        textAlign: "center",
                    }}
                    numberOfLines={1}
                >
                    {curMetadata.title || title}
                </Text>
                <View style={styles.center}>
                    <Image
                        style={{ width: 200, height: 200 }}
                        source={{ uri: thumbnail }}
                    />
                    <Text
                        style={{
                            padding: 10,
                            paddingBottom: 0,
                            textAlign: "center",
                        }}
                        numberOfLines={1}
                    >
                        {curMetadata.artist}
                    </Text>
                    <Text
                        style={{
                            padding: 10,
                            paddingTop: 0,
                            textAlign: "center",
                        }}
                        numberOfLines={1}
                    >
                        {curMetadata.album}
                    </Text>
                </View>
                <View
                    style={{
                        alignItems: "center",
                        flexDirection: "row",
                    }}
                >
                    <TouchableNativeFeedback
                        background={TouchableNativeFeedback.Ripple("#FFF")}
                        underlayColor={"#FFF"}
                        onPress={() => TrackPlayer.skipToPrevious()}
                    >
                        <PrevIcon width={58} height={58} />
                    </TouchableNativeFeedback>
                    {playState != TrackPlayer.STATE_PLAYING && (
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple("#FFF")}
                            underlayColor={"#FFF"}
                            onPress={() => TrackPlayer.play()}
                        >
                            <PlayIcon width={72} height={72} />
                        </TouchableNativeFeedback>
                    )}
                    {playState == TrackPlayer.STATE_PLAYING && (
                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple("#FFF")}
                            underlayColor={"#FFF"}
                            onPress={() => TrackPlayer.pause()}
                        >
                            <PauseIcon width={72} height={72} />
                        </TouchableNativeFeedback>
                    )}

                    <TouchableNativeFeedback
                        background={TouchableNativeFeedback.Ripple("#FFF")}
                        underlayColor={"#FFF"}
                        onPress={() => TrackPlayer.skipToNext()}
                    >
                        <NextIcon width={58} height={58} />
                    </TouchableNativeFeedback>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    center: {
        width: "50%",
        justifyContent: "center",
        alignItems: "center",
    },
});
