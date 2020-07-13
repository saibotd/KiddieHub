import * as React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import Ls from "./Ls";

const suffixes = [".mp3", ".mp4"];

export default ({ path, thumbnail, navigator }) => {
    return (
        <View style={styles.container}>
            <ImageBackground
                style={{
                    flex: 1,
                    backgroundColor: thumbnail ? "#FFF" : "transparent",
                }}
                source={{ uri: thumbnail }}
                imageStyle={{ opacity: 0.6 }}
                blurRadius={10}
            >
                <Ls
                    thumbnail={thumbnail}
                    path={path}
                    navigator={navigator}
                    suffixes={suffixes}
                />
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ccff99",
    },
});
