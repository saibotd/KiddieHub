import axios from "axios";
import { orderBy, random, without } from "lodash";
import * as React from "react";
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableNativeFeedback,
    View,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { v4 as uuidv4 } from "uuid";
import global from "./global";
import { SendIcon } from "./Icon";
import { initServer, port, scan, stopServer } from "./Server";

const avatars = [
    "🤡",
    "🤖",
    "🧙‍♂️",
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🎃",
    "😺",
];

const getChatLog = () => {
    return orderBy(global.chatLog.slice(0), "time", "desc");
};

export default ({ navigator }) => {
    const serviceName = `KiddieHub.${DeviceInfo.getUniqueId()}`;
    const [peers, setPeers] = React.useState([]);
    const [message, setMessage] = React.useState("");
    const [chatLog, setChatLog] = React.useState(getChatLog());
    const [avatar, setAvatar] = React.useState(
        global.avatar || avatars[random(0, avatars.length - 1)]
    );
    const client = axios.create({
        timeout: 250,
    });
    let interval;
    React.useEffect(() => {
        interval = setInterval(() => {
            setChatLog(getChatLog());
        }, 250);
        scan();
        return () => clearInterval(interval);
    }, []);
    React.useEffect(() => {
        initServer();
        return () => stopServer();
    }, []);
    React.useEffect(() => {
        global.avatar = avatar;
    }, [avatar]);
    const screenWidth = Math.round(Dimensions.get("window").width);
    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#9326ff" }}>
            <View style={{ flex: 1 }}>
                <FlatList
                    data={chatLog}
                    keyExtractor={({ uuid }) => uuid}
                    style={{ flex: 1 }}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.bubbleWrap,
                                item.sender_name == serviceName
                                    ? styles.bubbleWrap_me
                                    : styles.bubbleWrap_other,
                            ]}
                        >
                            <View>
                                <Text
                                    style={[
                                        styles.bubble,
                                        item.sender_name == serviceName
                                            ? styles.bubble_me
                                            : styles.bubble_other,
                                        { maxWidth: screenWidth * 0.6 },
                                    ]}
                                >
                                    {item.message}
                                </Text>
                                <Text
                                    style={[
                                        styles.avatar,
                                        item.sender_name == serviceName
                                            ? styles.avatar_me
                                            : styles.avatar_other,
                                    ]}
                                >
                                    {item.avatar}
                                </Text>
                            </View>
                        </View>
                    )}
                    inverted
                />
            </View>
            <View style={{ flexDirection: "row", padding: 5 }}>
                <TextInput
                    style={{
                        flex: 1,
                        borderColor: "#FFF",
                        borderWidth: 1,
                        backgroundColor: "#FFF",
                        borderRadius: 10,
                        padding: 8,
                    }}
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple("#FFF")}
                    underlayColor={"#FFF"}
                    disabled={!message}
                    onPress={async () => {
                        const uuid = uuidv4();
                        const time = Date.now();
                        const sender_ip = await DeviceInfo.getIpAddress();
                        const data = {
                            sender_name: serviceName,
                            sender_ip,
                            time,
                            avatar,
                            uuid,
                            message,
                        };
                        for (const ip of global.chatPeers) {
                            console.log(`http://${ip}:${port}`);
                            axios
                                .post(`http://${ip}:${port}/chat_receive`, data)
                                .then(({ data }) => {
                                    console.log(data);
                                })
                                .catch((e) => {
                                    console.log(e);
                                    global.chatPeers = without(
                                        global.chatPeers,
                                        ip
                                    );
                                });
                        }
                        setMessage("");
                        //scan();
                    }}
                >
                    <View
                        style={{
                            alignContent: "center",
                            alignSelf: "center",
                            padding: 10,
                            paddingTop: 2,
                            paddingBottom: 2,
                        }}
                    >
                        <SendIcon width={32} height={32} />
                    </View>
                </TouchableNativeFeedback>
            </View>
        </KeyboardAvoidingView>
    );
};

//<Keyboard onChange={(value) => setMessage(value)} />

const styles = StyleSheet.create({
    bubbleWrap: {
        margin: 10,
        marginBottom: 0,
        flex: 1,
    },
    bubbleWrap_me: {
        alignItems: "flex-end",
    },
    bubbleWrap_other: {},
    bubble: {
        padding: 10,
        borderRadius: 10,
        elevation: 3,
    },
    bubble_me: {
        backgroundColor: "#bdff76",
        borderBottomRightRadius: 0,
        marginRight: 10,
    },
    bubble_other: {
        backgroundColor: "#98f3ff",
        borderBottomLeftRadius: 0,
        marginLeft: 10,
    },
    avatar: {
        fontSize: 30,
    },
    avatar_me: {
        alignSelf: "flex-end",
    },
    avatar_other: {},
});
