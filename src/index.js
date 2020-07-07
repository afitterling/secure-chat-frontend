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
import Channel from './channel';
import { Container } from 'semantic-ui-react'

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
  const style={
  }
  const onClick = () => {
    window.location.href = `/channel/` + uuidv4();
  }
  return (
    <Container style={style}>
      <h2>Secure Chat</h2>
      <div class="ui twitter button" onClick={onClick}>
        <i class="sign in alternate icon"></i>
          Create Secure Channel
      </div>
    </Container>
  );
}

function About() {
  return <h2>About</h2>;
}

serviceWorker.unregister();
