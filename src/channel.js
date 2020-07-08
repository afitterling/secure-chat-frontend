import React from 'react';
import './index.css';
import { withRouter } from "react-router";
import {
  API_URL
} from './settings';
import {
  useState,
} from 'react';
import { Input } from 'semantic-ui-react'
import { v4 as uuidv4 } from 'uuid';
import { Container } from 'semantic-ui-react'
import ModalModalExample from './modal';
import { Label } from 'semantic-ui-react'

class Channel extends React.Component {

  constructor(props) {
    super(props);

    this.channelId = this.props.match.params.channelId;

    this.state = {
      messages: [],
      user: uuidv4(),
      settings: {
        subscribers: 0
      }
    };

    this.userAvatarUrl = avatarsUrl(shuffle);
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

  componentDidMount() {
    this.source = new EventSource(`${API_URL}v1/channel/${this.channelId}`, {
      withCredentials: true
    });
    this.source.addEventListener('message', this.onMessage);
    this.cancel = setInterval(() => {
      console.log('resubscribe');
      this.source.removeEventListener('message', this.onMessage);
      this.source.addEventListener('message', this.onMessage);
    }, 8000);
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
        <TextMessageInput user={this.state.user}
          onSettingsTransmit={this.onSettingsTransmit} avatarUrl={this.userAvatarUrl} channelId={this.channelId} />
      </Container>
    );
  }
}

function StatusBar({ settings: { subscribers, encryption } }) {
  encryption = false
  const style = {}
  return (
    <Container class="ui label" style={style}>
      <div class="ui message">
        <div class="header"></div>
        <span><i class="user secret icon"></i><em>{subscribers}</em></span>&nbsp;
        <span><i class={encryption ? 'lock icon' : 'unlock icon'}></i></span>
        <span><i class={'database icon'}></i> <em>off</em></span> &nbsp;
        <span><b>TTL</b> <em>24h</em></span>
        <br />
        <span><i class="user secret icon"></i> how many listeners in sum detected (including old connections and spies)</span><br />
        <span><i class="database icon"></i> <em>on</em>: in memory (RAM) persistency. <em>off</em>: no persistency at all (old messages are lost)</span><br />
        <span><i class="lock icon"></i> <em>locked</em>: strongest E2E-PKI encryption (client side & service's node's side). <em>unlocked</em>: SSL/TLS (messaging queue clear text, warning if in memory persistency is enable message live as slong as TTL defined)</span><br />
        <span><b>TTL</b>: time to live (TTL) for each message on the db node's cluster until erased in memory</span><br/>
        {/* <span><b>Warning</b>: you're dealing with a servless mesh network across many nodes aka skynet. Services and even whole nodes are randomly and constantly re-deploy any given minutes to achieve a maximum secure environment (at zero down time). If you would encounter problems on client side try reload to re-establish a new connection.</span><br/> */}
        <span><a href="/about">See how it all works including the encryption following this link</a>.</span>
      </div>
    </Container>
  );
}

function TextMessageInput({ user, channelId, avatarUrl, onSettingsTransmit }) {

  const [inputMessage, setInputMessage] = useState('');

  const style = {
    width: '100%'
  }

  onchange = (event) => {
    setInputMessage(event.target.value);
  }

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      const textContent = { text: event.target.value };
      console.log('channel:', channelId, 'content:', textContent);
      const r = await message(channelId, {
        id: uuidv4(),
        user: user,
        avatarUrl: avatarUrl,
        content: textContent
      }).then((r) => {
        setInputMessage('');
        return r;
      });
      console.log('response = ', r);
      onSettingsTransmit({ subscribers: r.nsubs });
    }
  }

  return (
    <Container>
      <Input focus style={style} value={inputMessage} onChange={onchange} placeholder='Message...' onKeyPress={(e) => { handleKeyPress(e) }} />
    </Container>
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
        {messages.map(({ user, id, content, avatarUrl }) => (
          <div class="item" key={id}>
            <img alt="avatar" class="ui avatar image" src={avatarUrl} />
            <div class="content">
              <a class="header" href="/user">{user}</a>
              <div class="description">
                {content.text}
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

const message = async (channel_id, msg) => {
  const rawResponse = await fetch(`${API_URL}v1/channel/${channel_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: msg })
  });
  const content = await rawResponse.json();
  return content;
};

export default withRouter(Channel);