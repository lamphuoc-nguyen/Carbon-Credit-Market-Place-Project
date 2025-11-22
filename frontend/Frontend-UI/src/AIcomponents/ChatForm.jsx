import React from 'react'

export const ChatForm = ({ setChatHistory, chatHistory, generateBotResponse }) => {

  const inputRef = React.useRef(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = '';

    // Add user message
    setChatHistory([...chatHistory, { sender: 'user', text: userMessage }]);

    // Add "Thinking..." message after a short delay
    setTimeout(() => {
      setChatHistory(prevHistory => [...prevHistory, { sender: 'bot', text: "Đang suy nghĩ..." }]);
      // Call the bot response generator
      generateBotResponse(userMessage);
    }, 600);

    console.log("User Message:", userMessage);
  }

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="message-input"
        required
        placeholder="Nhập tin nhắn..."
      />
      <button type="submit" className="send-btn material-symbols-rounded">
        arrow_upward
      </button>
    </form>
  )
}
