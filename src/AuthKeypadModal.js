import * as React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Modal from "react-native-modal";
import VirtualKeyboard from "react-native-virtual-keyboard";
import Config from "./Config";

export default ({ isVisible, onClose, onSuccess }) => {
    const [pin, setPin] = React.useState("");
    let key = 0;
    React.useEffect(() => {
        setPin("");
        key++;
    }, []);
    React.useEffect(() => {
        if (pin == Config.pin) {
            setPin("");
            key++;
            onSuccess(true);
        } else if (pin.length >= 4) {
            setPin("");
            key++;
        }
    }, [pin]);

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={() => {
                setPin("");
                onClose();
            }}
            useNativeDriver
        >
            <View style={styles.container}>
                <TextInput
                    style={styles.pin}
                    value={pin}
                    editable={false}
                    secureTextEntry={true}
                />
                <VirtualKeyboard
                    key={key}
                    cellStyle={{
                        flex: 1,
                        justifyContent: "center",
                        padding: 5,
                    }}
                    rowStyle={{
                        flexDirection: "row",
                        margin: 0,
                    }}
                    color="black"
                    pressMode="char"
                    onPress={(val) => {
                        if (val == "back") setPin("");
                        else setPin(pin + val);
                    }}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        alignSelf: "center",
        padding: 22,
        width: 400,
    },
    inner: {
        backgroundColor: "white",
        padding: 22,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        borderColor: "rgba(0, 0, 0, 0.1)",
        width: 200,
    },
    pin: {
        textAlign: "center",
        fontSize: 24,
    },
});
