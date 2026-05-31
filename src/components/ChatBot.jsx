import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import './ChatBot.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'bot', text: 'Namaskara! 🌿 I am your Karnataka plant care expert powered by local AI. How can I help you today?' }
  ]);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const callOllamaChat = async (userText) => {
    // Build conversation context from recent history
    const recentHistory = chatHistory.slice(-6).map(msg => ({
      role: msg.sender === 'bot' ? 'assistant' : 'user',
      content: msg.text
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: recentHistory
        })
      });

      if (!response.ok) throw new Error('Backend not available');

      const data = await response.json();
      return data.response || "I couldn't process that. Please try again.";
    } catch (error) {
      console.warn('Ollama backend not available, using fallback:', error.message);
      return getFallbackResponse(userText);
    }
  };

  // Smart fallback when Ollama isn't running
  const getFallbackResponse = (userText) => {
    const lower = userText.toLowerCase();

    if (lower.includes('water') || lower.includes('watering')) {
      return "💧 In Bangalore's climate, most plants need watering every 2-3 days in summer and weekly in monsoon. Succulents and indoor plants need less — every 7-10 days. Always check the topsoil; if it's dry 1 inch deep, it's time to water!";
    }
    if (lower.includes('sunlight') || lower.includes('sun') || lower.includes('shade')) {
      return "☀️ Most vegetables (tomato, brinjal, okra) need 6-8 hours of direct sunlight. Herbs like tulsi and curry leaf do well with 4-6 hours. For north-facing balconies, try Snake Plant, Money Plant, or Pothos — they thrive in indirect light!";
    }
    if (lower.includes('pest') || lower.includes('bug') || lower.includes('insect')) {
      return "🐛 Common pests in Karnataka gardens include aphids, mealybugs, and whiteflies. Try neem oil spray (5ml neem oil + 1L water + few drops of dish soap) as a natural remedy. Spray in early morning or evening for best results.";
    }
    if (lower.includes('soil') || lower.includes('compost') || lower.includes('fertilizer')) {
      return "🪨 For most Karnataka plants, use a mix of: 40% garden soil + 30% cocopeat + 20% compost + 10% perlite. Add vermicompost monthly for nutrients. Red soil from local nurseries works great as a base!";
    }
    if (lower.includes('monsoon') || lower.includes('rain')) {
      return "🌧️ During Karnataka's monsoon (June-Sept): Reduce watering, improve drainage by elevating pots, protect from heavy downpours, and watch for fungal diseases. Apply neem cake around plants to prevent root rot.";
    }
    if (lower.includes('tomato') || lower.includes('tomaato')) {
      return "🍅 Tomatoes thrive in Bangalore! Use deep pots (12+ inches), well-draining loamy soil, and ensure 6-8 hours of sunlight. Water every 2 days, stake the plants when they grow tall, and pinch off suckers for bigger fruits. Harvest in 60-75 days!";
    }
    if (lower.includes('tulsi') || lower.includes('basil')) {
      return "🌿 Tulsi (ತುಳಸಿ) is sacred and easy to grow! It loves morning sunlight (4-6 hours), well-draining soil, and moderate watering. Pinch the flower buds regularly to keep the plant bushy. It also repels mosquitoes naturally!";
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Namaskara! 🙏 I'm here to help with your gardening questions. Ask me about watering, sunlight, pests, soil, or any specific plant — I know Karnataka's climate well!";
    }

    return "🌱 That's a great question! I'm currently running in offline mode. For the best experience, make sure Ollama is running locally with the Llama 3 model. In the meantime, try asking about watering, sunlight, pests, soil, or specific plants like tomato, tulsi, etc.!";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const userMsg = message;
    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setMessage('');
    setIsTyping(true);
    
    const botResponse = await callOllamaChat(userMsg);
    
    setIsTyping(false);
    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'bot', text: botResponse }]);

    // Log to Supabase
    try {
      await supabase.from('chat_history').insert([{
        user_id: user?.id || null,
        user_message: userMsg,
        bot_response: botResponse
      }]);
    } catch(err) {
      console.warn("Could not log chat to Supabase:", err);
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
          <span className="chatbot-emoji">🌿</span>
        </button>
      )}

      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-bot-info">
            <div className="bot-avatar">🌿</div>
            <div>
              <h4>UrbanRoots Bot</h4>
              <span className="online-status">● Local AI</span>
            </div>
          </div>
          <button className="chat-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chat-body hide-scrollbar">
          {chatHistory.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message bot">
              <div className="bubble typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-footer" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button type="submit" disabled={!message.trim() || isTyping}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
