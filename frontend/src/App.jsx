import React, { useEffect, useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';
import API from './services/api';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function App() {
  const [conversations, setConversations] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);

  const loadConversations = async () => {
    try {
      const res = await API.get('/conversations');
      console.log('Loaded conversations:', res.data);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  useEffect(() => {
    loadConversations();

    const onNewMessage = () => loadConversations();
    const onStatusUpdate = () => loadConversations();
    const onConversationsUpdated = () => loadConversations();

    socket.on('new_message', onNewMessage);
    socket.on('status_update', onStatusUpdate);
    socket.on('conversations_updated', onConversationsUpdated); 

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('status_update', onStatusUpdate);
       socket.off('conversations_updated', onConversationsUpdated);
    };
  }, []);

  return (
    <div className="app">
      <div className="container">
        <ChatList
          conversations={conversations}
          onSelect={setSelectedChat}
          selectedWaId={selectedChat}
        />
        {selectedChat && <ChatWindow wa_id={selectedChat} />}
      </div>
    </div>
  );
}