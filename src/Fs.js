import { PermissionsAndroid } from "react-native";
import RNFS from "react-native-fs";
import { name } from "../app.json";

export const appFolder = name;
const altRootPaths = [
    `/storage/sdcard1/${appFolder}`,
    `/storage/sdcard0/${appFolder}`,
    `${RNFS.ExternalStorageDirectoryPath}/${appFolder}`,
];
let rootPath = RNFS.ExternalDirectoryPath;

export const getPath = (folderName) => {
    return `${rootPath}/.media/${folderName}`;
};

export const initFs = async (_rootPath = null) => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            if (!_rootPath) {
                for (path of altRootPaths)
                    if ((await RNFS.exists(path)) == true) {
                        rootPath = path;
                        break;
                    }
            }
            console.log("Using root", rootPath);
            await createAppFolders(rootPath);
        }
    } catch (err) {
        console.log(err);
    }
};

export const createAppFolders = async (rootPath) => {
    const folders = ["Video", "Audio"];
    try {
        for (const folder of folders)
            await RNFS.mkdir(`${rootPath}/.media/${folder}`);
    } catch (err) {
        console.log(err);
    }
};
