import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { v4 as uuidv4 } from 'uuid';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Channel from './components/channel';
import { Container } from 'semantic-ui-react';
import { MEDIUM_ARTICLE } from './settings';
import {
  API_URL
} from './settings-api';

ReactDOM.render(
  <React.StrictMode>
    <App className="App" />
  </React.StrictMode>,
  document.getElementById('root')
);

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
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
  const [apiStatus, setApiStatus] = useState(null);

  fetch(`${API_URL}/v1/status`).then((r)=>{
    if (r.status === 200){
      setApiStatus(true);
      return;
    }
    setApiStatus(false);
  }).catch(()=>{
    setApiStatus(false);
  });

  const onClick = () => {
    window.location.href = `/channel/` + uuidv4();
  }

  const style={
  }
  return (
    <Container style={style}>
      <h2 className="ui center aligned icon header">
      <i className="circular users icon"></i>
        Secure Messaging
      </h2>
      <div className="ui one column stackable center aligned page grid">
   <div className="column twelve wide">
    <div className="ui message purple">
      To communicate securely with strong encryption all chat partners must stay online and publish their keys. Each Message's time to live (TTL) is currently fixed to 12h after its creation. If you lose key or reload, decryption will not be possible.
    </div>
    <p> To save your identity and freedom of speech!</p>
    <p>Status { apiStatus === true  ? <i className="icon heartbeat"></i> : (apiStatus === false ? <i className="medkit red icon"></i> : 'checking')}</p>
    <button disabled={!apiStatus} className="ui twitter button" onClick={onClick} style={ {marginBottom: '1.2rem'}}>
      <i className="sign in alternate icon"></i>
        Create Postbox
    </button>
    <div>
      <iframe title="grid" src="https://giphy.com/embed/1AhvWtN00flE0zjr3i" width="180" height="180" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
      <p><a href="https://giphy.com/gifs/trippy-abstract-pi-slices-1AhvWtN00flE0zjr3i"><span style={{color: 'white'}}>The Grid.</span></a></p>
      <iframe width="560" height="0" src="https://www.youtube.com/embed/S5S6s5dZXNM?autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    <p></p>
    <p><span><a href={MEDIUM_ARTICLE}><i className="arrow circle right icon"></i> See how it works</a></span></p>
    <p><span><a href="https://paypal.me/sp33c?locale.x=de_DE"><i className="circle payment icon"></i> Please, help me to support this service financially!</a></span></p>
    <p><span><a href="https://sp33c.tech">Who am I?</a></span></p>
   </div>
</div>
    </Container>
  );
}

serviceWorker.unregister();
