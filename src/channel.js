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

  const { user, channelId } = probs;
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
        content: textContent
      }).then(() => {
        setInputMessage('');
      });
    }
  }

  const message = (async (channel_id, msg) => {
    console.log(channel_id);
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
      {messages.map( ({user, id, content}) => (
        <div class="item" key={id}>
          <i class="large github middle aligned icon"></i>
          <div class="content">
            <span class="header"><span>user</span> {user}</span>
            <div class="description">{content.text}</div>
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
    this.source = new EventSource(`${API_URL}v1/channel/${this.channelId}`, {
      withCredentials: true
    });
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
    //this.setState(this.state);
    this.source.addEventListener('message', this.onMessage);
  }

  componentWillUnmount() {
    this.source.removeEventListener('message', this.onMessage);
  }

  shuffle(array) {
    let counter = array.length;
    return array[Math.floor(Math.random() * counter)];
  }

  avatars = ['stevie', 'ellior', 'joe'];
  avatarUrl = `https://react.semantic-ui.com/images/avatar/small/${this.shuffle(this.avatars)}.jpg`;

  render() {    
    return (
        <Container>
          <h2 class="ui header">
            <ModalModalExample></ModalModalExample>
            <div class="content">
              Secure Channel
              <div class="sub header">
                <Label image>
                  <img alt="avatar" src={this.avatarUrl} />
                  {this.state.user}
                </Label>
                </div>
            </div>
          </h2>
          <ChatHistory channelId={this.channelId} messages={this.state.messages} />
          <TextMessageInput user={this.state.user} channelId={this.channelId} />
        </Container>
    );

  }

}

export default withRouter(Channel);