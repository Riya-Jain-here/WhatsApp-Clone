import React, { useEffect, useState, useRef } from 'react';
import './ChatWindowStyle.css';
import API from '../services/api';
import socket from '../services/socket';

export default function ChatWindow({ wa_id }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [contactName, setContactName] = useState('');
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await API.get(`/messages/${wa_id}`);
      const msgs = res.data.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
      setMessages(msgs);

      const contactMsg = msgs.find((m) => m.name !== 'You');
      setContactName(contactMsg ? contactMsg.name : wa_id);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    loadMessages();

    const handler = (msg) => {
      if (msg.wa_id === wa_id) loadMessages();
    };
    socket.on('new_message', handler);
    socket.on('status_update', handler);

    return () => {
      socket.off('new_message', handler);
      socket.off('status_update', handler);
    };
  }, [wa_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (text.trim() === '') return;
    try {
      await API.post('/send', { wa_id, text });
      setText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  let lastDate = '';

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="avatar">{contactName.charAt(0).toUpperCase()}</div>
        <div className="info">
          <span>{contactName}</span>
          <small>{wa_id}</small>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((m) => {
          const msgDate = new Date(m.timestamp);
          const dateLabel = formatDate(msgDate);
          const showDate = dateLabel !== lastDate;
          lastDate = dateLabel;

          const isOutgoing = m.name === 'You';

          return (
            <React.Fragment key={m._id}>
              {showDate && <div className="date-label">{dateLabel}</div>}
              <div className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                <div className={`message-bubble ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`}>
                  {m.text}
                  <div className="message-meta">
                    {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isOutgoing && ` (${m.status})`}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Send message"
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}