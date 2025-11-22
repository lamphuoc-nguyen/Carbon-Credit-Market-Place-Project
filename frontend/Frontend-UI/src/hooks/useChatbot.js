import { useState, useEffect } from 'react';
import { companyInfo } from '../AIcomponents/companyInfo.js';

export const useChatbot = () => {
    const [chatHistory, setChatHistory] = useState([{
        hideInChat: true,
        sender: 'bot',
        text: companyInfo.Introduction
    }]);
    const [showChatBot, setShowChatBot] = useState(false);

    const generateBotResponse = async (userMessage) => {
        const chatBodyRef = document.querySelector('.chat-body');
        if (chatBodyRef) {
            chatBodyRef.scrollTop = chatBodyRef.scrollHeight;
        }

        // Kiểm tra nếu người dùng hỏi về giá
        const priceKeywords = ['giá', 'giá bán', 'giá mua', 'bao nhiêu', 'chi phí', 'tín chỉ carbon'];
        const isAskingPrice = priceKeywords.some(keyword =>
            userMessage.toLowerCase().includes(keyword.toLowerCase())
        ) && (
                userMessage.toLowerCase().includes('tín chỉ') ||
                userMessage.toLowerCase().includes('carbon')
            );

        if (isAskingPrice) {
            // Random giá từ 20 đến 25 đô
            const randomPrice = (Math.random() * (25 - 20) + 20).toFixed(2);
            const priceResponse = `Hiện tại, giá gợi ý cho 1 tín chỉ carbon là khoảng **$${randomPrice} USD**. 

Lưu ý: Đây là mức giá tham khảo và có thể thay đổi tùy theo:
- Loại dự án carbon (VCS, Gold Standard, ACR...)
- Thời điểm giao dịch
- Khối lượng giao dịch
- Chất lượng và độ tin cậy của dự án

Bạn có muốn biết thêm thông tin về các loại tín chỉ carbon không?`;

            setChatHistory(prevHistory => {
                const newHistory = prevHistory.slice(0, -1); // Remove "Thinking..." message
                return [...newHistory, { sender: 'bot', text: priceResponse }];
            });
            return;
        }

        const apiUrl = import.meta.env.VITE_CHATBOT_API_URL;
        const apiKey = import.meta.env.VITE_CHATBOT_API_KEY;
        console.log("API URL:", apiUrl);
        console.log("User Message:", userMessage);

        // Format request theo Gemini 2.0 API
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{
                        "text": `Bạn là chatbot hỗ trợ của CarbonCreditExchange. Hãy trả lời câu hỏi sau một cách chuyên nghiệp và hữu ích: ${userMessage}`
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 500,
                    "topP": 0.8,
                    "topK": 40
                }
            })
        };

        try {
            const response = await fetch(apiUrl, requestOptions);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("API Response:", data);

            // Gemini API trả về format khác
            let botResponse = "Xin lỗi, tôi không thể trả lời câu hỏi này.";

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                botResponse = data.candidates[0].content.parts[0].text;
            }

            console.log("Bot Response:", botResponse);

            setChatHistory(prevHistory => {
                const newHistory = prevHistory.slice(0, -1); // Remove "Thinking..." message
                return [...newHistory, { sender: 'bot', text: botResponse }];
            });
        } catch (error) {
            console.error('Error fetching bot response:', error);
            setChatHistory(prevHistory => {
                const newHistory = prevHistory.slice(0, -1); // Remove "Thinking..." message
                return [...newHistory, { sender: 'bot', text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau." }];
            });
        }
    };

    const toggleChatBot = () => {
        setShowChatBot(!showChatBot);
    };

    useEffect(() => {
        const chatBody = document.querySelector('.chat-body');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, [chatHistory]);

    return {
        chatHistory,
        setChatHistory,
        showChatBot,
        toggleChatBot,
        generateBotResponse
    };
};
