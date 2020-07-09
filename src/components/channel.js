import React from 'react';
import { withRouter } from "react-router";
import {
  API_URL
} from '../settings';
import {
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Container } from 'semantic-ui-react'
import ModalModalExample from '../modal';
import { Label } from 'semantic-ui-react'
import { 
  postMessage,
  fetchMessages
 } from '../services/messages';
 import { MEDIUM_ARTICLE } from '../settings';

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
    //
    console.log('subscribers', subscribers);
    this.setState({ ...this.state, settings: { ...this.state.settings, subscribers: subscribers } });
  }

  onMessage = (e) => {
    const js = JSON.parse(e.data.replace(/'/g, "\""));
    this.setState({ messages: [...this.state.messages, js] });
  }

  async componentDidMount() {
    this.source = new EventSource(`${API_URL}v1/channel/${this.channelId}/listen?user=${this.state.user}`, {
      withCredentials: true
    });
    this.source.addEventListener('message', this.onMessage);
    this.cancel = setInterval(() => {
      console.log('resubscribe');
      this.source.removeEventListener('message', this.onMessage);
      this.source.addEventListener('message', this.onMessage);
    }, 8000);
    const respond = await fetchMessages(this.channelId);
    this.setState({messages: respond.messages});
  }

  componentWillUnmount() {
    clearInterval(this.cancel);
    this.source.removeEventListener('message', this.onMessage);
  }

  render() {
    return (
      <Container>
        <h2 class="ui header">
          <ModalModalExample></ModalModalExample>
          <div class="content">
            Secure Channel
              <div class="sub header">
              <Label image>
                <img alt="avatar" src={this.userAvatarUrl} />
                {this.state.user}
              </Label>
            </div>
          </div>
        </h2>
        <StatusBar settings={this.state.settings}></StatusBar>
        <ChatHistory channelId={this.channelId} atarUrl={this.userAvatarUrl} messages={this.state.messages} />
        <div class="ui message">
          <div style={{color: 'grey'}} class="header">Encryption Overview</div>
        </div>
        <TextMessageInput user={this.state.user}
          onSettingsTransmit={this.onSettingsTransmit} avatarUrl={this.userAvatarUrl} channelId={this.channelId} />
      </Container>
    );
  }
}

function StatusBar({ settings: { subscribers, encryption } }) {
  encryption = false
  return (
    <Container class="ui label">
      <div class="ui message">
        <div class="header"></div>
        <span><i class="user secret icon"></i><em>{subscribers}</em></span>&nbsp;
        {/* <span><i style={{color: encryption ? 'green' : 'red'}} className={encryption ? 'lock icon' : 'unlock icon'}></i></span> */}
{/*         <span><i class={'database icon'}></i> <em>on/off</em></span> &nbsp;
        <span><b>TTL</b> <em>24h</em></span>
 */}      </div>
      <div class="ui message">
        <div class="header"><em>legend</em></div>
        <span><i class="user secret icon"></i> how many listeners (spies and old connections included)</span><br />
        <span><i class="database icon"></i> <em>on</em>: server / node side in-memory persistency <em>off</em>: no persistency - messages are transitional</span><br />
        <span><i class="lock icon"></i> <em>locked</em>: end to end encryption (PKI) on client and service's node's side.</span><br />
        <span><i class="unlock icon"></i> <em>unlocked</em>: SSL/TLS transportation encryption only; messages can be read by everyone.</span><br />
        {/* <span><b>TTL</b>: (in case of in-memory persistency) time to live (TTL) for each message on the db node's cluster until erased</span><br/> */}
        {/* <span><b>Warning</b>: you're dealing with a servless mesh network across many nodes aka skynet. Services and even whole nodes are randomly and constantly re-deploy any given minutes to achieve a maximum secure environment (at zero down time). If you would encounter problems on client side try reload to re-establish a new connection.</span><br/> */}
        <span><a href={MEDIUM_ARTICLE}>See how it all works including the encryption following this link</a>.</span>
      </div>
    </Container>
  );
}

function TextMessageInput({ user, channelId, avatarUrl, onSettingsTransmit }) {

  const [inputMessage, setInputMessage] = useState('');
  const [persistency, setPersistence] = useState(true);
 
  const style = {
    width: '100%',
    marginBottom: '0.6rem'
  }

  onchange = (event) => {
    setInputMessage(event.target.value);
  }

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      if (event.target.value === '') return;
      const textContent = { text: event.target.value };
      console.log('channel:', channelId, 'content:', textContent);
      const r = await postMessage(channelId, {
        id: uuidv4(),
        user: user,
        avatarUrl: avatarUrl,
        content: textContent,
        persistency: persistency ? 1 : 0
      }).then((r) => {
        setInputMessage('');
        return r;
      });
      console.log('response = ', r);
      onSettingsTransmit({ subscribers: r.nsubs });
    }
  }

  function onPersistency(){
    setPersistence(!persistency);
  }

  return (
    <div class="ui action input" style={style}>
      <input value={inputMessage} onChange={onchange} placeholder='Message ...' onKeyPress={(e) => { handleKeyPress(e) }} />
      <button class="ui icon button" onClick={onPersistency}>
        <i class="database icon" style={{'color': persistency ? 'black': 'grey'}}></i>
      </button>
      <button class="ui icon button">
        <i class="unlock icon"></i>
      </button>
    </div>
  );

}

function ChatHistory({ messages }) {
  const style = {
    paddingBottom: '0.8rem',
    marginTop: '1.0rem'
  }
  return (
    <Container style={style}>
      <div class="ui relaxed divided list">
        {messages.map(({ user, id, content, avatarUrl, persistency }) => (
          <div class="item" key={id}>
            <img alt="avatar" class="ui avatar image" src={avatarUrl} />
            <div class="content">
              <span class="header" href="/user">
                <i class="unlock icon"></i>{user}
                </span>
              <div class="description">
                { 
                  (<span>
                    {persistency === 1 ? '' : <i class="icon microphone slash red"></i>}
                    {content.text}
                    </span>)
                }
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const avatars = ['stevie', 'elliot', 'joe', 'zoe', 'nan', 'helen', 'veronika'];
  return `https://react.semantic-ui.com/images/avatar/small/${pickFn(avatars)}.jpg`;
}

export default withRouter(Channel);