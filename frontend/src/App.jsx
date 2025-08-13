import React, { useEffect, useState } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';
import API from './services/api';
import socket from './services/socket';

export default function App() {
  const [conversations, setConversations] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const res = await API.get('/conversations');
      const messagesArray = Array.isArray(res.data) ? res.data : [];

      // Convert array to object keyed by wa_id
      const grouped = {};
      messagesArray.forEach((convo) => {
        grouped[convo.wa_id] = convo;
        grouped[convo.wa_id].messages = convo.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
        if (convo.latestMessage) convo.latestMessage.timestamp = new Date(convo.latestMessage.timestamp);
      });

      setConversations(grouped);
    } catch (err) {
      console.error('Failed to load conversations', err);
      setConversations({});
    } finally {
      setLoading(false);
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

  if (loading) return <div className="app">Loading chats...</div>;

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