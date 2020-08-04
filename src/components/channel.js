//https://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
import React from 'react';
import { withRouter } from "react-router";
import {
  API_URL
} from '../settings-api';
import { v4 as uuidv4 } from 'uuid';
import { Header, Icon, Container  } from 'semantic-ui-react'
import {
  fetchMessages
} from '../services/messages';
import Crypto from '../services/crypto';
import { TextMessageInput } from './text-message';
import { ClipboardShare } from './share-url';
import { ChatHistory } from './chat-history';

class Channel extends React.Component {

  constructor(props) {
    super(props);

    this.channelId = this.props.match.params.channelId;

    this.state = {
      messages: [],
      user: this.getOrCreateUUID(),
      settings: {
        subscribers: 'n/a'
      }
    };
    this.userAvatarUrl = this.getOrCreateAvatar();
  }

  getOrCreateAvatar() {
    const avatarUrl = localStorage.getItem('avatarUrl') || avatarsUrl(shuffle);
    localStorage.setItem('avatarUrl', avatarUrl);
    return avatarUrl;
  }

  getOrCreateUUID() {
    const uuid = localStorage.getItem('user') || uuidv4();
    localStorage.setItem('user', uuid);
    return uuid;
  }

  onSettingsTransmit = ({ subscribers }) => {
    console.log('subscribers', subscribers);
    this.setState({ ...this.state, settings: { ...this.state.settings, subscribers: subscribers } });
  }

  onMessage = async (e) => {
    console.log(e);
    const msg = JSON.parse(e.data.replace(/'/g, "\""));
    // TODO refactor put in external lib
    if (msg.content.encoded && msg.content.encoded[this.state.user]) {
      const b64data = msg.content.encoded[this.state.user];
      const decrypted = await Crypto.decryptMessage(Crypto.keys[0], base64ToArrayBuffer(b64data));
      const utf8 = new TextDecoder("utf-8").decode(decrypted);
      console.log('decrypted', utf8);
      msg.content.text = utf8;
    } else if (msg.content.encoded) {
      msg.error = { decode: true};
      msg.content.text = 'unable to decrypt - publish key!';
    }

    if (msg.content.key){
      const k = await extractPubKeyFromMessage(msg);
      importPubKey(k);
    }

    this.setState({ messages: [...this.state.messages, msg] });
  }

  eventSource() {
    this.source = new EventSource(`${API_URL}v1/channel/${this.channelId}/listen?user=${this.state.user}`, {
      withCredentials: true
    });
    this.source.addEventListener('message', this.onMessage);
  }

  closeEventSource() {
    this.source.removeEventListener('message', this.onMessage);
    this.source.close();
  }

  async componentDidMount() {
//    const keys = await crypto.generateKey();
//    console.log('pkey', keys.publicKey);
//    console.log(await crypto.exportKey(keys.publicKey));

    const crypto = await Crypto.initCryptoAPI();
    this.setState({crypto: crypto});

    this.eventSource();
    this.cancel = setInterval(() => {
      console.log('resubscribe');
      this.closeEventSource();
      this.eventSource();
    }, 12000);

    const data = await fetchMessages(this.channelId);
    this.setState({ messages: data.messages });

    const msgKeys = data.messages.filter( msg => msg.content.key && msg.user !== this.state.user);
    msgKeys.forEach(
      async mk => {
        const k = await extractPubKeyFromMessage(mk);
        importPubKey(k);
        console.log(k);
      }
    );
    
  }

  componentWillUnmount() {
    clearInterval(this.cancel);
    this.source.removeEventListener('message', this.onMessage);
  }

  render() {
    return (
      <Container>
        <Header as='h2'>
          <Icon name='users' circular={true} />
          <Header.Content>
            Postbox Ninja
            <Header.Subheader>
              With Privacy in Mind
            </Header.Subheader>
          </Header.Content>
        </Header>
        <ClipboardShare></ClipboardShare>
        {/* <StatusBar settings={this.state.settings}></StatusBar> */}
        <ChatHistory crypto={this.state.crypto} self={this.state.user} channelId={this.channelId} atarUrl={this.userAvatarUrl} messages={this.state.messages} />
        <div className={ this.state.crypto ? 'green ui message' : 'ui message red' }>
          <em>Status: </em>
          { this.state.crypto ? <b>Identity and encryption keys generated. Identity persisted to this particular browser. Encryption keys held in-memory in this browser tab only!</b> : <b>encryption unavailable, need to ask either system or safe users for keys! Try reload.</b>}
        </div>
        <TextMessageInput user={this.state.user}
          onSettingsTransmit={this.onSettingsTransmit}
          avatarUrl={this.userAvatarUrl}
          crypto={this.state.crypto}
          channelId={this.channelId} />
      </Container>
    );
  }
}

// helpers

const shuffle = (array) => {
  const counter = array.length;
  const index = Math.floor(Math.random() * counter);
  return array[index];
}

const avatarsUrl = (pickFn) => {
  const avatars = ['stevie', 'elliot', 'joe', 'zoe', 'nan', 'helen', 'veronika', 'christian', 'daniel'];
  return `https://react.semantic-ui.com/images/avatar/small/${pickFn(avatars)}.jpg`;
}

function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

const importPubKey = (k) => {
  Crypto.addPubKey(k.user, k.key);
}

const extractPubKeyFromMessage = async (msg) => {
  const rawKey = JSON.parse(window.atob(msg.content.key));
  const key = await Crypto.importKey(rawKey);
  return {user: msg.user, key: key};
}

export default withRouter(Channel);