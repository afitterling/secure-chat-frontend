import React from 'react';
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
  const style={
  }
  const onClick = () => {
    window.location.href = `/channel/` + uuidv4();
  }
  return (
    <Container style={style}>
      <h2 className="ui center aligned icon header">
      <i className="circular users icon"></i>
        Secure Messaging
      </h2>
      <div className="ui one column stackable center aligned page grid">
   <div className="column twelve wide">
   <p> To save your identity and freedom of speech!</p>
        <div className="ui twitter button" onClick={onClick} style={ {marginBottom: '1.2rem'}}>
          <i className="sign in alternate icon"></i>
            Create Channel
        </div>
    <p><span><a href={MEDIUM_ARTICLE}><i className="arrow circle right icon"></i> Take a look first and see how it works</a></span></p>
    <p><span><a href="https://sp33c.tech">Who am I?</a></span></p>
   </div>
</div>
    </Container>
  );
}

serviceWorker.unregister();
