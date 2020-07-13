import * as React from "react";
import { View } from "react-native";
import Navigator from "react-native-easy-router";
import AudioPlayerView from "./src/AudioPlayerView";
import ChatView from "./src/ChatView";
import { initConfig } from "./src/Config";
import ExplorerView from "./src/ExplorerView";
import { initFs } from "./src/Fs";
import HomeView from "./src/HomeView";
import SettingsView from "./src/SettingsView";
import { StateProvider } from "./src/store.js";

/*
const loadMedia = async () => {
    const audio = await MediaStore.getAudio();
    const video = await MediaStore.getVideo();
    console.log(audio, video);
};
*/

export default () => {
    const [ready, setReady] = React.useState(false);
    React.useEffect(() => {
        initConfig().then(({ rootPath, useServer }) => {
            initFs(rootPath).then(() => setReady(true));
        });
        //loadMedia();
        return () => {};
    }, []);
    if (!ready) return null;
    return (
        <View style={{ flex: 1 }}>
            <StateProvider>
                <Navigator
                    initialStack="HomeView"
                    screens={{
                        HomeView,
                        ExplorerView,
                        AudioPlayerView,
                        SettingsView,
                        ChatView,
                    }}
                />
            </StateProvider>
        </View>
    );
};
