import {
    API_URL
  } from '../settings';
  
const headers = {
    'Content-Type': 'application/json'
  };

export const postMessage = async (channel_id, msg) => {
    const rawResponse = await fetch(`${API_URL}v1/channel/${channel_id}/messages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ message: msg })
    });
    const content = await rawResponse.json();
    return content;
  };


export const fetchMessages = async (channel_id) => {
    const rawResponse = await fetch(`${API_URL}v1/channel/${channel_id}/messages`, {
      method: 'GET',
      headers: headers
    });
    const content = await rawResponse.json();
    return content;
  };

  