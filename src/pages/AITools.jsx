import { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, AlertCircle, Camera, RefreshCw, Send, Image, 
  MessageSquare, User, Sparkles, AlertTriangle, ArrowRight, Trash2, ShieldAlert,
  Plus, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import './AITools.css';

const BACKEND_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (import.meta.env.VITE_BACKEND_URL || '')
  : '';

const AITools = () => {
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeMode, setActiveMode] = useState('disease'); // disease, identify, soil
  const [historyList, setHistoryList] = useState([
    { id: 1, title: 'Tomato Wilt Diagnosis', date: 'Yesterday' },
    { id: 2, title: 'Mint Identification', date: '3 days ago' },
    { id: 3, title: 'Terrace Soil Composition', date: 'May 20' }
  ]);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const { user } = useAuth();

  const handleUploadClick = (mode) => {
    setActiveMode(mode);
    fileInputRef.current?.click();
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUploading]);

  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat-history/${user.id}`);
        if (!res.ok) throw new Error('History loading failed');
        const data = await res.json();
        
        const mapped = [];
        (data || []).forEach((chat, idx) => {
          mapped.push({
            id: `hist-u-${idx}`,
            sender: 'user',
            text: chat.user_message
          });
          mapped.push({
            id: `hist-a-${idx}`,
            sender: 'ai',
            text: chat.bot_response
          });
        });
        setMessages(mapped);
      } catch (err) {
        console.warn('Could not load chat logs:', err);
      }
    };
    loadHistory();
  }, [user]);

  const analyzeImage = async (fileBase64, mode) => {
    const response = await fetch(`${BACKEND_URL}/api/analyze-plant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: fileBase64, mode })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error ${response.status}`);
    }
    const data = await response.json();
    return data;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const preview = URL.createObjectURL(file);
      
      // Add user message with image preview
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        text: `Uploaded photo for ${activeMode === 'disease' ? 'disease diagnosis' : activeMode === 'identify' ? 'plant identification' : 'soil analysis'}.`,
        image: preview
      };
      setMessages(prev => [...prev, userMsg]);

      // Convert to base64 and analyze
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        let result = null;
        let analysisError = null;

        try {
          result = await analyzeImage(base64Data, activeMode);
        } catch (err) {
          analysisError = err.message;
        }

        // Handle API-level errors (e.g. not_a_plant)
        if (result?.error) {
          analysisError = result.message || 'Could not analyze this image.';
          result = null;
        }

        if (analysisError) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'ai',
            text: `⚠️ ${analysisError}`,
            isError: true
          }]);
          setIsUploading(false);
          return;
        }

        // Add new item to history
        const newHistTitle = activeMode === 'disease'
          ? `${result.disease} Diagnosis`
          : activeMode === 'identify'
          ? `${result.plantName} ID`
          : `Soil Composition`;
        setHistoryList(prev => [{ id: Date.now(), title: newHistTitle, date: 'Just now' }, ...prev]);

        // Add AI response
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          mode: activeMode,
          data: result
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsUploading(false);

        // Supabase logs
        try {
          await supabase.from('ai_scans').insert([{
            user_id: user?.id || null,
            mode: activeMode,
            result_data: result
          }]);
        } catch(err) {
          console.warn(err);
        }
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userText = textInput;
    setTextInput('');

    // Add user text message
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: userText
    }]);

    setIsUploading(true);

    let aiReplyText = "";
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages
            .filter(m => m.text && !m.image)
            .map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
          userId: user?.id || null
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const resData = await response.json();
      aiReplyText = resData.response;
    } catch (err) {
      console.error(err);
      aiReplyText = `⚠️ API Error: ${err.message}. Please verify backend node API is active.`;
    }

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'ai',
      text: aiReplyText
    }]);
    setIsUploading(false);
  };

  const triggerSuggestion = (mode, label) => {
    setActiveMode(mode);
    setTextInput(label);
  };

  const clearHistory = () => {
    setHistoryList([]);
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistoryList(prev => prev.filter(item => item.id !== id));
  };

  const startNewChat = () => {
    setMessages([]);
    setTextInput('');
  };

  return (
    <div className="ai-tools-gemini page-transition">
      {/* Sidebar - Gemini History panel */}
      <aside className="gemini-sidebar glass-card">
        <button className="new-chat-btn" onClick={startNewChat}>
          <Plus size={16} /> New conversation
        </button>
        
        <div className="history-header">
          <span>Recent Scans</span>
          {historyList.length > 0 && (
            <button className="clear-all-btn" onClick={clearHistory} title="Clear history">
              <Trash2 size={13} />
            </button>
          )}
        </div>
        
        <div className="history-list hide-scrollbar">
          {historyList.length > 0 ? (
            historyList.map(item => (
              <div key={item.id} className="history-item" onClick={() => triggerSuggestion('disease', `Show me details for ${item.title}`)}>
                <MessageSquare size={14} className="item-icon" />
                <span className="item-title">{item.title}</span>
                <button className="delete-item-btn" onClick={(e) => deleteHistoryItem(item.id, e)}>
                  <X size={12} />
                </button>
              </div>
            ))
          ) : (
            <p className="no-history-text">No recent analysis scans</p>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="model-status">
            <Sparkles size={14} className="spark-glow" />
            <div>
              <span>Gemini AI</span>
              <small>Vision + Language Model</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main viewport */}
      <main className="gemini-main">
        {messages.length === 0 ? (
          /* Welcome View */
          <div className="gemini-welcome-container page-transition">
            <div className="welcome-header">
              <span className="ai-logo-glowing">🌱</span>
              <h2 className="welcome-title">Hello, Gardener.</h2>
              <h3 className="welcome-subtitle">How can I help you grow today?</h3>
            </div>

            <div className="suggestions-grid">
              <div className="glass-card suggestion-chip" onClick={() => triggerSuggestion('disease', 'Scan tomato leaves for blight')}>
                <div className="suggestion-emoji-icon">🔍</div>
                <div>
                  <h5>Diagnose blight</h5>
                  <p>Identify sick spots & get treatment</p>
                </div>
              </div>
              <div className="glass-card suggestion-chip" onClick={() => triggerSuggestion('identify', 'Identify this vertical tower crop')}>
                <div className="suggestion-emoji-icon">🌿</div>
                <div>
                  <h5>Identify crop</h5>
                  <p>Check species and growing metrics</p>
                </div>
              </div>
              <div className="glass-card suggestion-chip" onClick={() => triggerSuggestion('soil', 'Analyze pH levels of red soil')}>
                <div className="suggestion-emoji-icon">🪨</div>
                <div>
                  <h5>Analyze soil</h5>
                  <p>Check NPK & pH recommendations</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Stream */
          <div className="gemini-chat-stream hide-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="bubble-avatar">
                  {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} className="text-green" />}
                </div>
                
                <div className="bubble-content">
                  {msg.text && <p className={`bubble-text${msg.isError ? ' error-bubble' : ''}`}>{msg.text}</p>}
                  {msg.image && <img src={msg.image} alt="Upload preview" className="bubble-image-preview" />}

                  {/* AI Response Card - Disease Mode */}
                  {msg.sender === 'ai' && msg.mode === 'disease' && msg.data && (
                    <div className="glass-card result-embedded-card page-transition">
                      <div className="result-card-header">
                        <div>
                          <h4>{msg.data.disease}</h4>
                          <span className="severity-badge-v2 moderate">{msg.data.severity} Severity</span>
                        </div>
                        <span className="confidence-pill">{msg.data.confidence}% confidence</span>
                      </div>
                      
                      <div className="result-card-block">
                        <h5><AlertCircle size={14} className="text-red" /> Recommended Treatment</h5>
                        <p>{msg.data.treatment}</p>
                      </div>

                      <div className="result-card-block">
                        <h5>🛡️ Prevention Strategy</h5>
                        <p>{msg.data.prevention}</p>
                      </div>

                      <div className="result-card-actions">
                        <Link to="/market" className="btn-primary mini-btn">Get treatment supplies</Link>
                        <Link to="/experts" className="action-btn text-link">Consult Expert <ArrowRight size={14} /></Link>
                      </div>
                    </div>
                  )}

                  {/* AI Response Card - Plant ID Mode */}
                  {msg.sender === 'ai' && msg.mode === 'identify' && msg.data && (
                    <div className="glass-card result-embedded-card page-transition">
                      <div className="result-card-header">
                        <div>
                          <h4>{msg.data.plantName}</h4>
                          <span className="scientific-meta">{msg.data.family}</span>
                        </div>
                        <span className="confidence-pill green">{msg.data.careLevel}</span>
                      </div>

                      <div className="result-card-block">
                        <h5>📝 Botanical Bio</h5>
                        <p>{msg.data.description}</p>
                      </div>

                      <div className="result-card-block">
                        <h5>🌱 Care & Watering Tips</h5>
                        <ul className="mini-bullet-list">
                          {msg.data.tips?.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="result-card-actions">
                        <Link to="/encyclopedia" className="btn-primary mini-btn">View full guide</Link>
                        <Link to="/market" className="action-btn text-link">Search Seeds <ArrowRight size={14} /></Link>
                      </div>
                    </div>
                  )}

                  {/* AI Response Card - Soil Analyzer */}
                  {msg.sender === 'ai' && msg.mode === 'soil' && msg.data && (
                    <div className="glass-card result-embedded-card page-transition">
                      <div className="result-card-header">
                        <div>
                          <h4>{msg.data.soilType}</h4>
                          <span className="scientific-meta">pH: {msg.data.pH} · Texture: {msg.data.texture}</span>
                        </div>
                      </div>

                      <div className="nutrient-grid-mini">
                        <div className="nutrient-capsule">
                          <span>Nitrogen</span>
                          <strong className="medium">{msg.data.nutrients?.nitrogen}</strong>
                        </div>
                        <div className="nutrient-capsule">
                          <span>Phosphorus</span>
                          <strong className="low">{msg.data.nutrients?.phosphorus}</strong>
                        </div>
                        <div className="nutrient-capsule">
                          <span>Potassium</span>
                          <strong className="medium">{msg.data.nutrients?.potassium}</strong>
                        </div>
                      </div>

                      <div className="result-card-block">
                        <h5>📋 Recommendation</h5>
                        <p>{msg.data.recommendation}</p>
                      </div>

                      <div className="result-card-block">
                        <h5>🧪 Suggested Amendments</h5>
                        <ul className="mini-bullet-list">
                          {msg.data.amendments?.map((amend, idx) => (
                            <li key={idx}>{amend}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="result-card-actions">
                        <Link to="/market" className="btn-primary mini-btn">Shop amendments</Link>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {isUploading && (
              <div className="chat-bubble-wrapper ai typing-loader">
                <div className="bubble-avatar">
                  <Sparkles size={16} className="text-green animate-pulse" />
                </div>
                <div className="bubble-content">
                  <div className="gemini-typing-animation">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <span className="typing-label">Analyzing grow parameters...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Input Bar Section */}
        <div className="gemini-input-section-container">
          <form className="gemini-input-bar glass-card" onSubmit={handleSendText}>
            <input 
              type="text" 
              className="chat-prompt-input"
              placeholder="Ask Gemini local AI about hydroponics, vertical spacing, water wicking..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
            />
            
            <div className="input-bar-actions">
              <button 
                type="button" 
                className="upload-icon-btn" 
                onClick={() => handleUploadClick('disease')} 
                title="Diagnose Leaf Disease"
              >
                <Camera size={18} />
              </button>
              <button 
                type="button" 
                className="upload-icon-btn" 
                onClick={() => handleUploadClick('identify')} 
                title="Identify Plant"
              >
                <Image size={18} />
              </button>
              <button 
                type="button" 
                className="upload-icon-btn" 
                onClick={() => handleUploadClick('soil')} 
                title="Analyze Soil"
              >
                <AlertTriangle size={18} />
              </button>
              
              <button 
                type="submit" 
                className="send-prompt-btn" 
                disabled={!textInput.trim() || isUploading}
                title="Send query"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="ai-legal-disclaimer">Local models can sometimes make mistakes. Verify critical watering details before implementing.</p>
        </div>
      </main>
    </div>
  );
};

export default AITools;
