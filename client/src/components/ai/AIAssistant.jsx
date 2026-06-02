import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import { FiMessageSquare, FiX, FiSend, FiZap } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import './AIAssistant.css';

const QUICK_PROMPTS = [
  'Explain Newton\'s Laws',
  'What is integration?',
  'JEE tips and strategy',
  'NEET important topics',
  'How to study effectively?',
];

export default function AIAssistant() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI learning assistant. Ask me anything — concepts, doubts, exam tips, or study strategies!',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/doubt', { question });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isAuthenticated
          ? '❌ Sorry, I couldn\'t process that. Please try again.'
          : '🔒 Please [login](/login) to use the AI assistant.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!open) {
    return (
      <button className="ai-fab" onClick={() => setOpen(true)} aria-label="Open AI Assistant">
        <div className="ai-fab__inner">
          <FiZap size={22} />
          <span className="ai-fab__label">AI Tutor</span>
        </div>
        <div className="ai-fab__pulse" />
      </button>
    );
  }

  return (
    <div className="ai-assistant">
      {/* Header */}
      <div className="ai-assistant__header">
        <div className="ai-assistant__header-left">
          <div className="ai-assistant__avatar">
            <MdSchool size={18} />
          </div>
          <div>
            <p className="ai-assistant__name">EduVerse AI</p>
            <p className="ai-assistant__status">
              <span className="ai-assistant__status-dot" />
              Always online
            </p>
          </div>
        </div>
        <button className="ai-assistant__close" onClick={() => setOpen(false)}>
          <FiX size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="ai-assistant__messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-msg ai-msg--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="ai-msg__avatar">
                <MdSchool size={14} />
              </div>
            )}
            <div className="ai-msg__bubble">
              {msg.role === 'assistant' ? (
                <div className="markdown-content ai-markdown">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg ai-msg--assistant">
            <div className="ai-msg__avatar"><MdSchool size={14} /></div>
            <div className="ai-msg__bubble ai-msg__typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="ai-assistant__quick">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              className="ai-quick-btn"
              onClick={() => sendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="ai-assistant__input-area">
        <textarea
          className="ai-assistant__input"
          placeholder="Ask a doubt, concept, or exam question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          className="ai-assistant__send"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <FiSend size={16} />
        </button>
      </div>
      <p className="ai-assistant__footer">Powered by Gemini AI · EduVerse AI</p>
    </div>
  );
}
