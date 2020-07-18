import React from 'react';
import {
    useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Container, Form } from 'semantic-ui-react'
import {
    postMessage,
} from '../services/messages';
import Crypto from '../services/crypto';

export function TextMessageInput({ user, channelId, avatarUrl, onSettingsTransmit }) {

    const [inputMessage, setInputMessage] = useState('');
    const [persistency, setPersistence] = useState(true);
    const [encoded, setEncoded] = useState(false);

    const paddingBottom = {
        marginBottom: '2.0rem'
    }

    const onchange = (event) => {
        setInputMessage(event.target.value);
    }

    const encoderFn = async (string) => {
        console.log(Crypto.pubKeys);
        // import 
        const msg = {
            text: 'encrypted message',
            encoded: {}
        };
        let data = {};
        for (const keyRec in Crypto.pubKeys) {
            console.log(keyRec);
            const encrypted = await Crypto.encryptMessage(Crypto.pubKeys[keyRec], string);
            data[keyRec] = arrayBufferToBase64(encrypted);
            //      data[keyRec] = window.btoa(escape(encrypted));
        }
        msg.encoded = data;
        return msg;
    }

    const postMessageFn = async (content) => {
        console.log('send content', content);
        return await postMessage(channelId, {
            id: uuidv4(),
            user: user,
            avatarUrl: avatarUrl,
            encoded: encoded ? 1 : 0,
            content: content,
            persistency: persistency ? 1 : 0,
            cryptoIsAvailable: crypto.isAvailable ? 1 : 0
        })
    }

    const onSubmit = async () => {
        const textContent = encoded ? await encoderFn(inputMessage) : { text: inputMessage };
        console.log(await postMessageFn(textContent));
        setInputMessage('');
    }

    function onPersistency() {
        setPersistence(!persistency);
    }

    const textReducer = (enc, trans) => {
        return (enc ? 'encrypted' : '') + (enc && trans ? ' ' : '') + (trans ? 'transient' : '') + ' message';
    }

    function placeholderMessage() {
        return textReducer(encoded, !persistency);
    }

    const onDecodeEncode = () => {
        setEncoded(!encoded);
    }

    const onPublishKey = () => {
        console.log(JSON.stringify(Crypto.exportedKeys[0]));
        postMessageFn(
            {
                text: 'key published',
                key: window.btoa(JSON.stringify(Crypto.exportedKeys[0]))
            }
        );
    }

    return (
        <Container style={paddingBottom}>
            <div class="ui" style={{marginBottom: "1.0rem"}}>
                <button type="button" disabled={Crypto.isUnAvailable()} className="ui button secondary" onClick={onPublishKey}>
                    <i class="icon share"></i>
                    publish public key
                </button>
                <button type="button" disabled={Crypto.isUnAvailable()} className="ui button secondary" onClick={Crypto.initCryptoAPI}>
                    <i class="icon key"></i>
                    create new key pair
                </button>
            </div>
            <Form onSubmit={onSubmit}>
                <Form.Field required>
                    <div className="ui action input">
                        <button type="button" className="ui icon button" onClick={onPersistency}>
                            <i className="database icon" style={{ 'color': persistency ? 'black' : 'grey' }}></i>
                        </button>
                        <button type="button" disabled={Crypto.isUnAvailable()} className="ui icon button" onClick={onDecodeEncode}>
                            <i className={encoded ? "lock icon" : "unlock icon"} style={{ 'color': encoded ? 'black' : 'grey' }}></i>
                        </button>
                        <input value={inputMessage} onChange={onchange}
                            placeholder={placeholderMessage()} />
                        <button className="ui button" type="submit">
                            send
            </button>
                    </div>
                </Form.Field>
            </Form>
        </Container>
    );
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}