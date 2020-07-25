import React from 'react';
import { Header, Icon  } from 'semantic-ui-react'

import {
    useState,
  } from 'react';
  
export function ClipboardShare(){

    const [copied, setCopied] = useState(false);
  
    const share = () => {
      setCopied(true);
      const channelUrl = window.location.href;
      navigator.clipboard.writeText(channelUrl);
      setTimeout(()=>{
        setCopied(false);
      }, 800);
    }
  
    return (
      <Header as='h4' onClick={share}>
      <Icon name='copy' color={copied ? 'blue': 'black'}/>
        <Header.Content>
          {copied ? 'copied' : 'Copy the above browser URL for sharing'}
        </Header.Content>
      </Header>
    );
  }
  