import { AudioIcon, ChatIcon, VideoIcon } from "./Icon";

export const defaultConfig = {
  rootPath: null,
  useServer: true,
  pin: "0000",
  menuItems: [
    {
      type: "navigate",
      label: "Video",
      icon: VideoIcon,
      restricted: true,
      value: {
        view: "ExplorerView",
        attr: { path: "Video" },
      },
    },
    {
      type: "navigate",
      label: "Audio",
      icon: AudioIcon,
      value: {
        view: "ExplorerView",
        attr: { path: "Audio" },
      },
    },

    /*  {
            type: "navigate",
            label: "Chat",
            icon: ChatIcon,
            value: {
                view: "ChatView",
                attr: {},
            },
        }, */

    {
      type: "app",
      value: "com.mediatek.camera",
    },
    {
      type: "app",
      value: "com.motorola.camera",
    },
    {
      type: "app",
      value: "com.motorola.cameraone",
    },
    {
      type: "app",
      value: "com.google.android.apps.photos",
    },
    {
      type: "app",
      value: "com.motorola.MotGallery2",
    },
    {
      type: "app",
      value: "de.WDR.DerElefant",
      restricted: true,
      internet: true,
    },
    {
      type: "app",
      value: "de.kika.kikaninchen",
      restricted: true,
      internet: true,
    },
    {
      type: "app",
      value: "de.wdr.maus",
      restricted: true,
      internet: true,
    },
    {
      type: "app",
      value: "de.kika.kikaplayer",
      restricted: true,
      internet: true,
    },
    {
      type: "app",
      value: "com.google.android.apps.youtube.kids",
      restricted: true,
      internet: true,
    },
  ],
};

let Config = { ...defaultConfig };

export async function initConfig() {
  //Config = {...(await load())}
  return Config;
}

export default Config;
