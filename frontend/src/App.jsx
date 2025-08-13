import React, { useEffect, useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';
import API from './services/api';
import { io } from 'socket.io-client';

// Connect to backend socket
const socket = io('https://whatsapp-clone-backend-x0z5.onrender.com', { transports: ['websocket'] });

export default function App() {
  const [conversations, setConversations] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);

  const loadConversations = async () => {
    try {
      const res = await API.get('/conversations'); // returns array of messages
      const messages = res.data;

      // Group messages by wa_id
      const grouped = {};
      messages.forEach((m) => {
        if (!grouped[m.wa_id]) grouped[m.wa_id] = { messages: [], latestMessage: null };
        grouped[m.wa_id].messages.push({ ...m, timestamp: new Date(m.timestamp) });

        if (
          !grouped[m.wa_id].latestMessage ||
          new Date(m.timestamp) > new Date(grouped[m.wa_id].latestMessage.timestamp)
        ) {
          grouped[m.wa_id].latestMessage = { ...m, timestamp: new Date(m.timestamp) };
        }
      });

      setConversations(grouped);
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

  const handleSelectChat = (wa_id) => {
    setSelectedChat(wa_id);
    localStorage.setItem('selectedChat', wa_id);
  };

  useEffect(() => {
    const lastChat = localStorage.getItem('selectedChat');
    if (lastChat) setSelectedChat(lastChat);
  }, []);

  return (
    <div className="app">
      <div className="container">
        <ChatList
          conversations={conversations}
          onSelect={handleSelectChat}
          selectedWaId={selectedChat}
        />
        {selectedChat && <ChatWindow wa_id={selectedChat} />}
      </div>
    </div>
  );
}