import React from 'react';
import { withRouter } from "react-router";
import {
  API_URL
} from '../settings';
import {
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Comment, Header, Message, Icon, Container  } from 'semantic-ui-react'
//import ModalSettings from '../modal';
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
        <StatusBar settings={this.state.settings}></StatusBar>
        <ChatHistory self={this.state.user} channelId={this.channelId} atarUrl={this.userAvatarUrl} messages={this.state.messages} />
        <TextMessageInput user={this.state.user}
          onSettingsTransmit={this.onSettingsTransmit}
          avatarUrl={this.userAvatarUrl}
          channelId={this.channelId} />
      </Container>
    );
  }
}

function StatusBar({ settings: { subscribers, encryption } }) {
  encryption = false
  return (
    <Container className="ui label">
      {/*       <div className="ui message">
        <div className="header"></div>
        <span><i className="user secret icon"></i><em>{subscribers}</em></span>&nbsp;
      </div>
 */}      <div className="ui message">
        {/*         <div className="header">Explanation</div>
        <span><i className="user secret icon"></i> how many listeners (spies and old connections included)</span><br />
        <span><i className="database icon"></i> <em>on</em>: server / node side in-memory persistency <em>off</em>: no persistency - messages are transitional</span><br />
        <span><i className="lock icon"></i> <em>locked</em>: end to end encryption (PKI) on client and service's node's side.</span><br />
        <span><i className="unlock icon"></i> <em>unlocked</em>: SSL/TLS transportation encryption only; messages can be read by everyone.</span><br />
 */}        <span><a href={MEDIUM_ARTICLE}>See how it all works</a>.</span>
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

  function onPersistency() {
    setPersistence(!persistency);
  }

  return (
    <div className="ui action input" style={style}>
      <button className="ui icon button" onClick={onPersistency}>
        <i className="database icon" style={{ 'color': persistency ? 'black' : 'grey' }}></i>
      </button>
      <input value={inputMessage} onChange={onchange} placeholder='Message ...' onKeyPress={(e) => { handleKeyPress(e) }} />
      {/*      <ModalSettings></ModalSettings> */}
    </div>
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
        {messages.map(({ user, encrypted, content, avatarUrl, persistency, time }, i) => (
          <Message key={i}>
            <Comment>
              <Comment.Avatar as='a' src={avatarUrl} />
              <Comment.Content>
                <Comment.Author>{user}<Comment.Metadata>{
                  new Date(time * 1000).toLocaleString()
                }</Comment.Metadata></Comment.Author>
                <Comment.Text>
                  {persistency ? '' : <i className="icon microphone slash"></i>}
                  {encrypted ? '<i className="green icon lock"></i>' : <i className="grey icon unlock"></i>}
                  {content.text}
                </Comment.Text>
              </Comment.Content>
            </Comment>
          </Message>
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