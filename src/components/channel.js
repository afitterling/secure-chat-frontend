//https://ourcodeworld.com/articles/read/164/how-to-convert-an-uint8array-to-string-in-javascript
import React from 'react';
import { withRouter } from "react-router";
import {
  API_URL
} from '../settings-api';
import {
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Comment, Header, Icon, Container, Form  } from 'semantic-ui-react'
import {
  postMessage,
  fetchMessages
} from '../services/messages';
// import { MEDIUM_ARTICLE } from '../settings';
import Crypto from '../services/crypto';

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
    if (msg.content.encoded) {
      //console.log('message for me', window.atob(msg.content.encoded[this.state.user]));
      const btoa = unescape(window.atob(msg.content.encoded[this.state.user]));
      Crypto.decryptMessage(Crypto.keys[0], new TextEncoder("utf-8").encode(btoa));
      //const base64dec = window.atob(msg.content.encoded);
      //const decoded = window.atob(escape(msg.content.encoded));
    }
    if (msg.content.key){
      console.log(msg.user, JSON.parse(window.atob(msg.content.key)));
      const rawKey = JSON.parse(window.atob(msg.content.key));
      Crypto.importKey(rawKey).then((key)=>{
        console.log('imported', key);
        Crypto.addPubKey(msg.user, key);
      })
      
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

    this.eventSource();
    this.cancel = setInterval(() => {
      console.log('resubscribe');
      this.closeEventSource();
      this.eventSource();
    }, 12000);
    const data = await fetchMessages(this.channelId);
    this.setState({ messages: data.messages });
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
            Secure Chat
            <Header.Subheader>
              With Privacy in Mind
            </Header.Subheader>
          </Header.Content>
        </Header>
        <ClipboardShare></ClipboardShare>
        {/* <StatusBar settings={this.state.settings}></StatusBar> */}
        <ChatHistory self={this.state.user} channelId={this.channelId} atarUrl={this.userAvatarUrl} messages={this.state.messages} />
        <div className={ crypto.keys.length > 0 ? 'green ui message' : 'ui message red' }>
          <em>Status: </em>
          { Crypto.keys.length > 0 ? <b>keys for encryption auto generated and available.</b> : <b>encryption api unavailable, need to ask either system or safe users for keys!</b>}
        </div>
        <TextMessageInput user={this.state.user}
          onSettingsTransmit={this.onSettingsTransmit}
          avatarUrl={this.userAvatarUrl}
          channelId={this.channelId} />
      </Container>
    );
  }
}

function ClipboardShare(){

  const [copied, setCopied] = useState(false);

  const share = () => {
    setCopied(true);
    const channelUrl = window.location.href;
    navigator.clipboard.writeText(channelUrl);
    setTimeout(()=>{
      setCopied(false);
    }, 800);
  }

  return (
    <Header as='h4' onClick={share}>
    <Icon name='copy' color={copied ? 'blue': 'black'}/>
      <Header.Content>
        {copied ? 'copied' : 'Copy Url to Clipboard'}
      </Header.Content>
    </Header>
  );
}

// function StatusBar({ settings: { subscribers, encryption } }) {
//   encryption = false
//   return (
//     <Container className="ui label">
//       <div className="ui message">
//         <div className="header"></div>
//         {/* <span><i className="user secret icon"></i><em>{subscribers}</em></span>&nbsp; */}
//         <span><i>Message's time to live in-memory (TTL)</i>: <em>12h</em></span>&nbsp;
//       </div>
//       <div className="ui message">
//         <div className="header">Explanation</div>
//         <span><i className="user secret icon"></i> how many listeners (spies and old connections included)</span><br />
//         <span><i className="database icon"></i> <em>on</em>: cluster in-memory (RAM) persistency (TTL); <em>off</em>: messages aren't stored anywhere only on screen</span><br />
//         <span><i className="lock icon"></i> <em>locked</em>: end to end encryption (PKI) on client and service's node's side.</span><br />
//         <span><i className="unlock icon"></i> <em>unlocked</em>: SSL/TLS transportation encryption only; messages can be read by everyone.</span><br />
//      <span><a href={MEDIUM_ARTICLE}>See how it all works</a>.</span>
//       </div>
//     </Container>
//   );
// }

function TextMessageInput({ user, channelId, avatarUrl, onSettingsTransmit }) {

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
      data[keyRec] = window.btoa(escape(new TextDecoder("utf-8").decode(encrypted)));
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

  function placeholderMessage(){
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
      <button type="button" className="ui button" onClick={onPublishKey}>publish pub key</button>
      <Form onSubmit={onSubmit}>
        <Form.Field required>
          <div className="ui action input">
            <button type="button" className="ui icon button" onClick={onPersistency}>
              <i className="database icon" style={{ 'color': persistency ? 'black' : 'grey' }}></i>
            </button>
            <button type="button" className="ui icon button" onClick={onDecodeEncode}>
              <i className={encoded ? "lock icon": "unlock icon"} style={{ 'color': encoded ? 'black' : 'grey' }}></i>
            </button>
            <input value={inputMessage} onChange={onchange}
                   placeholder={placeholderMessage()}  />
            <button className="ui button" type="submit">
              send
            </button>
          </div>        
        </Form.Field>
      </Form>
    </Container>
  );
}

function ChatHistory({ self, messages }) {
  const style = {
    paddingBottom: '0.8rem',
    marginTop: '1.0rem'
  }
  return (
    <Container style={style}>
      <Comment.Group>
        {messages.map(({ user, cryptoIsAvailable, encoded, content, avatarUrl, persistency, time, key }, i) => (
          <Comment key={i}>
            <Comment.Avatar as='a' src={avatarUrl} />
            <Comment.Content>
              <Comment.Author>{ cryptoIsAvailable === 1? <Icon name='shield'/> : null }{user}<Comment.Metadata>{
                new Date(time * 1000).toLocaleString()
              }</Comment.Metadata></Comment.Author>
              {
                !content.key ?               
                <Comment.Text>
                  {persistency ? '' : <i className="icon microphone slash"></i>}
                  {encoded ? <i className="green icon lock"></i> : <i className="grey icon lock open"></i>}
                  {content.text}
                </Comment.Text> : <Comment.Text>
                  <i className="key icon"></i>
                  Key Published
                </Comment.Text>

              }
            </Comment.Content>
          </Comment>
        ))}
      </Comment.Group>
    </Container>
  );
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

export default withRouter(Channel);