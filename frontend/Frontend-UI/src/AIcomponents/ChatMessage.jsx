import React from 'react'
import ChatbotIcon from './ChatbotIcon'

const ChatMessage = ({ chat }) => {
  if (chat.hideInChat) return null;

  return (
    <div className={message}>
      {chat.sender === 'bot' && <ChatbotIcon />}
      <p className="message-text">{chat.text}</p>
    </div>
  )
}

export default ChatMessage
