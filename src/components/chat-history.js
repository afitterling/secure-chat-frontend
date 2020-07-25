import React from 'react';
import { Comment, Icon, Container  } from 'semantic-ui-react';

export function ChatHistory({ self, messages }) {
    const style = {
      paddingBottom: '0.8rem',
      marginTop: '1.0rem'
    }
    return (
      <Container style={style}>
        <Comment.Group>
          {messages.map(({ error, user, cryptoIsAvailable, encoded, content, avatarUrl, persistency, time, key }, i) => (
            <Comment key={i}>
              <Comment.Avatar as='a' src={avatarUrl} />
              <Comment.Content>
                <Comment.Author>
                  { 
                    cryptoIsAvailable === 1? <Icon name='shield'/> : null 
                  }
                  { user === self ? <div className="ui purple horizontal label">You</div> : null}
                  {user}
                  <Comment.Metadata>{
                  new Date(time * 1000).toLocaleString()
                }</Comment.Metadata>
                </Comment.Author>
                {
                  !content.key ?               
                  <Comment.Text>
                    {persistency ? '' : <i className="icon microphone slash"></i>}
                    {encoded ? <i className="green icon lock"></i> : <i className="grey icon lock open"></i>}
                    {content.text}
                  </Comment.Text> : <Comment.Text>                    
                    <span className="ui label blue"><i className="key icon"></i> Key Published</span>
                  </Comment.Text>
  
                }
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      </Container>
    );
  }
  