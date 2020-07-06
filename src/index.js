import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
import {
  API_URL
} from './settings';
import { 
  useState,
//  useEffect
} from 'react';
import { Input } from 'semantic-ui-react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <App className="App" />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

export default function App() {
  return (
    <Router>
      <div>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/channel/:channelId">
            <Channel />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function Channel(probs) {
  let { channelId } = useParams();
  return (
    <div>
    <h2>Channel ID: {channelId}</h2>
      <TextMessageInput channelId={channelId}></TextMessageInput>
    </div>
  );

}

function TextMessageInput(probs){

  const {channelId} = probs;
  
  const [inputMessage, setInputMessage] = useState('');

  onchange=(event)=>{
    setInputMessage(event.target.value);
  }

  const handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      const textContent = {text: event.target.value};
      console.log('channel:', channelId, 'content:', textContent);
      message(channelId, {
        user: 'userplaceholder',
        content: textContent
      }).then(() => {
        setInputMessage('');
      });
    }
  }  

  const message = (async (channel_id, msg) => {
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

function About() {
  return <h2>About</h2>;
}

serviceWorker.unregister();
