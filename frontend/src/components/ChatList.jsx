import React from 'react';
import './ChatListStyle.css';

export default function ChatList({ conversations, onSelect, selectedWaId }) {
  const handleClick = (wa_id) => onSelect(wa_id);

  if (!conversations || Object.keys(conversations).length === 0) {
    return <div className="sidebar">No chats available</div>;
  }

  return (
    <div className="sidebar">
      <div className="chatlist-header">Chats</div>
      <div className="chat-list">
        {Object.entries(conversations).map(([wa_id, convo]) => {
          const { messages, latestMessage } = convo;
          if (!messages || messages.length === 0) return null;

          const contactMessage = messages.find(msg => msg.name !== 'You');
          const contactName = contactMessage ? contactMessage.name : wa_id;

          return (
            <div
              key={wa_id}
              className={`chat-item ${wa_id === selectedWaId ? 'active' : ''}`}
              onClick={() => handleClick(wa_id)}
            >
              <div className="avatar">{contactName.charAt(0).toUpperCase()}</div>
              <div className="chat-meta">
                <div className="name"><span>{contactName}</span></div>
                <div className="preview">{latestMessage?.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}