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

function TextMessageInput(probs){

    const {user, channelId} = probs;
    const [inputMessage, setInputMessage] = useState('');
  
    onchange=(event)=>{
      setInputMessage(event.target.value);
    }
  
    const handleKeyPress = (event) => {
      if(event.key === 'Enter'){
        const textContent = {text: event.target.value};
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
      const rawResponse = await fetch(`${API_URL}v1/channel/${channel_id}`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: msg})
      });
      const content = await rawResponse.json();
      console.log(content);      
    });
  
    return (
      <div>
        <Input focus value={inputMessage} onChange={onchange} placeholder='Message...' onKeyPress={(e)=>{handleKeyPress(e)}} />
      </div>
    );
  
  }
  

function ChatHistory(probs){
    const { messages } = probs;
    console.log('messages', messages);
    return (
    <ul>{messages.map( m => (<li key={m.id}>{m.user}: {m.content.text}</li>))}</ul>
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
      this.setState({ messages: [...this.state.messages, js]});
    }
  
    componentDidMount() {
      //this.setState(this.state);
      this.source.addEventListener('message', this.onMessage);    
    }
  
    componentWillUnmount() {
      this.source.removeEventListener('message', this.onMessage);
    }
      
    // https://atomizedobjects.com/blog/react/add-event-listener-react-hooks/
    render() {  
      return (
        <div>
        <h2>Channel ID: {this.channelId}</h2>
          <ChatHistory channelId={this.channelId} messages={this.state.messages}/>
          <TextMessageInput user={this.state.user}channelId={this.channelId}/>
        </div>
      );
    
    }
  
  }
  
  export default withRouter(Channel);