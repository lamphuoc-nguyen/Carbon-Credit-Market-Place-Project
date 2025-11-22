import React from 'react'
import ChatbotIcon from './ChatbotIcon'
import { ChatForm } from './ChatForm'
import { useChatbot } from '../hooks/useChatbot'
import '../styles/chatbot.css'

const ChatbotWidget = () => {
    const {
        chatHistory,
        setChatHistory,
        showChatBot,
        toggleChatBot,
        generateBotResponse
    } = useChatbot();

    return (
        <div className='chatbot-container'>
            <button onClick={toggleChatBot} id="chatbot-toggle" className="chatbot-toggle-btn">
                <ChatbotIcon />
            </button>

            {showChatBot && (
                <div className="chatbot-popup">
                    <div className="chatbot-header">
                        <div className="header-info">
                            <ChatbotIcon />
                            <h2 className='logo-text'>Carbon Credit Bot</h2>
                        </div>

                        <button onClick={toggleChatBot} className="close-btn material-symbols-rounded">
                            keyboard_arrow_down
                        </button>
                    </div>

                    <div className="chat-body">
                        {chatHistory.map((msg, index) => (
                            !msg.hideInChat && (
                                <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                                    {msg.sender === 'bot' && <ChatbotIcon />}
                                    <p className="message-text">{msg.text}</p>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="chat-footer">
                        <ChatForm
                            setChatHistory={setChatHistory}
                            chatHistory={chatHistory}
                            generateBotResponse={generateBotResponse}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatbotWidget
