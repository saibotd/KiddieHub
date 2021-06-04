import natsort from "natsort";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import RNFS from "react-native-fs";
import { FlatGrid } from "react-native-super-grid";
import FileItem from "./FileItem";
import VideoPlayer from "./VideoPlayer";

const ls = async (path, suffixes) => {
  let items = [];
  try {
    console.warn({ path });
    items = await RNFS.readDir(path);
  } catch (e) {
    console.error(e);
  }
  for (const item of items) {
    item.isDir = item.isDirectory();
  }
  console.log(items);
  return items
    .sort((a, b) => natsort()(a.name, b.name))
    .filter((item) => {
      return suffixes.some((suffix) => {
        return item.name.toLowerCase().endsWith(suffix) || item.isDir;
      });
    });
};

export default ({ path, navigator, thumbnail, suffixes }) => {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    ls(path, suffixes).then((items) => setItems(items));
  }, [path]);
  const onItemPress = (item) => {
    if (item.isDir) navigator.push("ExplorerView", item);
    else {
      if (item.path.endsWith(".mp4")) VideoPlayer.play(item.path);
      if (item.path.endsWith(".mp3")) {
        navigator.push("AudioPlayerView", {
          items,
          ...item,
        });
      }
    }
  };
  return (
    <FlatGrid
      itemDimension={DeviceInfo.isTablet() ? 220 : 130}
      data={items}
      style={styles.gridView}
      spacing={10}
      renderItem={({ item }) => (
        <View style={[styles.itemContainer]}>
          <FileItem
            {...item}
            //parentPath={path}
            onPress={onItemPress}
            navigator={navigator}
            defaultThumbnail={thumbnail}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  gridView: {
    flex: 1,
  },
  itemContainer: {
    height: DeviceInfo.isTablet() ? 260 : 150,
  },
  itemName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
});
