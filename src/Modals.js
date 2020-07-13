import * as React from "react";
import Modal from "react-native-modal";

let _setModal;
let _promise;

export const Modals = ({}) => {
    const [modal, setModal] = React.useState(null);
    _setModal = setModal;
    close = (reject = false) => {
        if (reject) _promise.reject();
        setModal(null);
    };
    const Content = modal;
    return (
        <Modal isVisible={!!modal} onBackdropPress={() => close(true)}>
            <Content />
        </Modal>
    );
};

export const createModal = (modal) => {
    return new Promise((resolve, reject) => {
        _promise = { resolve, reject };
        console.log(modal);
        _setModal(modal);
    });
};
