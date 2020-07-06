import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import * as serviceWorker from './serviceWorker';
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
  const handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      //console.log('enter press here! ', event.target.value)
      console.log('enter press here! ', event.target.value);
      message('alex', event.target.value)
    }
  }  
  const message = (async (channel_id, text) => {
    const rawResponse = await fetch(`https://postbox-api1.sp33c.tech/api/v1/channel/${channel_id}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({message: text})
    });
    const content = await rawResponse.json();
    console.log(content);      
  });

  let { channelId } = useParams();
  return (
    <div>
      <h2>Requested channel ID: {channelId}</h2>
      <Input focus placeholder='Message...' onKeyPress={handleKeyPress} />
    </div>
  );
}

function About() {
  return <h2>About</h2>;
}

serviceWorker.unregister();
