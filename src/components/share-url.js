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
      <Icon name={copied ? 'check' : 'copy'} color={copied ? 'green': 'black'}/>
        <Header.Content>
          {copied ? 'Copied to clipboard' : 'Copy this channel\'s URL to clipboard to share with others'}
        </Header.Content>
      </Header>
    );
  }
  