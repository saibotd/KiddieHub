import { uniq } from "lodash";
import { Vibration } from "react-native";
import BackgroundService from "react-native-background-actions";
import DeviceInfo from "react-native-device-info";
import httpBridge from "react-native-http-bridge";
import ZeroConf from "react-native-zeroconf";
import global from "./global";

export const serviceName = `KiddieHub.${DeviceInfo.getUniqueId()}`;
export const port = 8065;
export const zeroConf = new ZeroConf();
zeroConf.on("start", () => {
    console.log("ZeroConf", "[Start]");
});
zeroConf.on("stop", () => {
    console.log("ZeroConf", "[Stop]");
});
zeroConf.on("resolved", ({ name, addresses }) => {
    console.log({ name, addresses });
    if (!name.startsWith("KiddieHub")) return;
    global.chatPeers = uniq([...global.chatPeers, ...addresses]);
    console.log({ peers: global.chatPeers });
});
zeroConf.on("error", (err) => {
    console.log("ZeroConf", "[Error]", err);
});

const options = {
    taskName: "KiddieHubServer",
    taskTitle: "KiddieHub Server",
    taskDesc: "Background process for chat and other functions",
    taskIcon: {
        name: "ic_launcher_round",
        type: "mipmap",
    },
    color: "#9326ff",
    parameters: {
        delay: 500,
    },
};

const serve = async ({ delay }) => {
    const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    httpBridge.start(port, serviceName, (request) => {
        switch (request.url.split("/")[1]) {
            case "chat_receive":
                const data = JSON.parse(request.postData);
                global.chatLog.push(data);
                global.chatPeers = uniq([
                    ...global.chatPeers,
                    ...[data.sender_ip],
                ]);
                httpBridge.respond(
                    request.requestId,
                    200,
                    "application/json",
                    JSON.stringify({
                        received: data,
                    })
                );
                break;
            case "ping":
                httpBridge.respond(
                    request.requestId,
                    400,
                    "application/json",
                    JSON.stringify("pong")
                );
                break;
            case "vibrate":
                Vibration.vibrate();
                httpBridge.respond(
                    request.requestId,
                    400,
                    "application/json",
                    JSON.stringify("pong")
                );
                break;
            default:
                httpBridge.respond(
                    request.requestId,
                    400,
                    "application/json",
                    JSON.stringify({ message: "Bad Request" })
                );
        }
    });

    zeroConf.publishService("http", "tcp", "local", serviceName, port);

    console.log(
        "SERVER STARTED",
        serviceName,
        `${await DeviceInfo.getIpAddress()}:${port}`
    );
    while (BackgroundService.isRunning()) await sleep(delay);
    stopServer();
};

export function initServer() {
    BackgroundService.start(serve, options);
}

export function stopServer() {
    try {
        httpBridge.stop();
    } catch (e) {}
    try {
        zeroConf.stop();
        zeroConf.removeAllListeners();
        zeroConf.unpublishService(serviceName);
    } catch (e) {}
    try {
        BackgroundService.stop();
    } catch (e) {}
    console.log("SERVER STOPPED");
}

export function scan() {
    try {
        zeroConf.stop();
        zeroConf.scan("http", "tcp", "local.");
    } catch (e) {}
}
