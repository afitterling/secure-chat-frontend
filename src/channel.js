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

function TextMessageInput(probs) {

  const { user, channelId, avatarUrl } = probs;
  const [inputMessage, setInputMessage] = useState('');

  onchange = (event) => {
    setInputMessage(event.target.value);
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const textContent = { text: event.target.value };
      console.log('channel:', channelId, 'content:', textContent);
      message(channelId, {
        id: uuidv4(),
        user: user,
        avatarUrl: avatarUrl,
        content: textContent
      }).then(() => {
        setInputMessage('');
      });
    }
  }

  const message = (async (channel_id, msg) => {
    const rawResponse = await fetch(`${API_URL}v1/channel/${channel_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: msg })
    });
    const content = await rawResponse.json();
    console.log(content);
  });

  const style = {
    width: '100%'
  }

  return (
    <Container>
      <Input focus style={style} value={inputMessage} onChange={onchange} placeholder='Message...' onKeyPress={(e) => { handleKeyPress(e) }} />
      {/* <button class="ui primary button">Hit Enter</button> */}
    </Container>
  );

}


function ChatHistory(probs) {
  const { messages } = probs;
  console.log('messages', messages);
  const style={
    paddingBottom: "0.8rem"
  }
  return (
    <Container>
      <div class="ui relaxed divided list" style={style}>
      {messages.map( ({user, id, content, avatarUrl}) => (
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



class Channel extends React.Component {

  constructor(props) {
    super(props);
    this.channelId = this.props.match.params.channelId;

    this.state = {
      messages: [],
      user: uuidv4()
    };
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
    this.cancel = setInterval(()=>{
      console.log('resubscribe');
      this.source.removeEventListener('message', this.onMessage);
      this.source = new EventSource(`${API_URL}v1/channel/${this.channelId}`, {
        withCredentials: true
      });  
      this.source.addEventListener('message', this.onMessage);
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.cancel);
    this.source.removeEventListener('message', this.onMessage);
  }

  shuffle(array) {
    const counter = array.length;
    const index = Math.floor(Math.random() * counter);
    return array[index];
  }

  avatarsUrl(pickFn){
    const avatars = ['stevie', 'elliot', 'joe', 'zoe', 'nan', 'helen', 'veronika'];
    return `https://react.semantic-ui.com/images/avatar/small/${pickFn(avatars)}.jpg`;
  }

  userAvatarUrl = this.avatarsUrl(this.shuffle);

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
          <ChatHistory channelId={this.channelId} atarUrl={this.userAvatarUrl} messages={this.state.messages} />
          <TextMessageInput user={this.state.user} avatarUrl={this.userAvatarUrl} channelId={this.channelId} />
        </Container>
    );

  }

}

export default withRouter(Channel);