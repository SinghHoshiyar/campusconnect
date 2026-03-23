import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react';
import './ChatAssistant.css';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  chips?: string[];
  isTyping?: boolean;
};

export default function ChatAssistant() {
  const { user, currentRole } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch existing chat history or set initial welcome message
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/chat', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        
        if (Array.isArray(data) && data.length > 0) {
          // Map DB _id to id
          setMessages(data.map((m: any) => ({ ...m, id: m._id })));
        } else {
          // Seed with welcome
          const names = { student: 'Aryan', professor: 'Prof. Mehta', admin: 'Dr. Singh' };
          const msgs = {
            student: `Hi ${names.student}! I'm your campus AI assistant. Ask me about your schedule, attendance, assignments, campus locations, or anything else!`,
            professor: `Hello ${names.professor}! I can help you manage attendance, check student performance, look up campus info, or assist with announcements.`,
            admin: `Welcome ${names.admin}! I can assist with campus analytics, draft announcements, provide energy insights, or answer any admin queries.`
          };
          const chipsOptions = {
            student: ["Today's schedule", "My attendance", "Library location", "Due assignments", "Energy status"],
            professor: ["Mark today's attendance", "At-risk students", "Class performance", "Pending evaluations", "Draft announcement"],
            admin: ["Today's campus summary", "Energy status", "New registrations", "Active alerts", "Draft announcement"]
          };
          
          const welcomeMsg = {
            role: 'ai',
            text: msgs[currentRole as keyof typeof msgs] || msgs.student,
            chips: chipsOptions[currentRole as keyof typeof chipsOptions] || chipsOptions.student
          };
          
          await saveMessageToDB(welcomeMsg.role, welcomeMsg.text, welcomeMsg.chips);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    if (user?.token) fetchChatHistory();
  }, [currentRole, user]);

  const saveMessageToDB = async (role: string, text: string, chips?: string[]) => {
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ role, text, chips })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post message');
      setMessages(prev => [...prev.filter(m => m.id !== 'temp'), { ...data, id: data._id }]);
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const askAssistantAPI = async (text: string, chips?: string[]) => {
    setIsTyping(true);
    
    // hide chips on the last message
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].chips) {
        newMsgs[newMsgs.length - 1].chips = undefined;
      }
      return newMsgs;
    });

    try {
      const res = await fetch('http://localhost:5000/api/chat/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ message: text, chips })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to get response');
      
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'temp'), 
        { ...data.userMessage, id: data.userMessage._id },
        { ...data.aiMessage, id: data.aiMessage._id }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev.filter(m => m.id !== 'temp'), { id: `err-${Date.now()}`, role: 'ai', text: 'Sorry, I am having trouble connecting to my brain right now. Try again later!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    
    // Optimistic UI update
    setMessages(prev => [...prev, { id: 'temp', role: 'user', text }]);
    setInput('');
    
    await askAssistantAPI(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = async (chipText: string) => {
    setMessages(prev => [...prev, { id: 'temp', role: 'user', text: chipText }]);
    await askAssistantAPI(chipText);
  };

  const handleClear = async () => {
    const chipsOptions = {
      student: ["Today's schedule", "My attendance", "Library location", "Due assignments", "Energy status"],
      professor: ["Mark today's attendance", "At-risk students", "Class performance", "Pending evaluations", "Draft announcement"],
      admin: ["Today's campus summary", "Energy status", "New registrations", "Active alerts", "Draft announcement"]
    };
    
    try {
      await fetch('http://localhost:5000/api/chat', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMessages([]);
      await saveMessageToDB(
        'ai', 
        'Chat cleared! How can I help you?', 
        chipsOptions[currentRole as keyof typeof chipsOptions] || chipsOptions.student
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <div className="chat-ai-avatar">
          <Sparkles size={20} color="#fff" />
        </div>
        <div className="chat-header-info">
          <h3>CampusAI Assistant</h3>
          <p>● Online · Powered by Llama 3</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="tb-btn" onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
      
      <div className="chat-msgs">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.role}`}>
            <div 
              className="msg-av" 
              style={msg.role === 'user' ? { 
                background: `var(--${currentRole})`, 
                color: currentRole === 'student' ? '#000' : '#fff',
                fontFamily: "'Syne', sans-serif"
              } : undefined}
            >
              {msg.role === 'ai' ? <Bot size={18} /> : (user?.name?.split(' ').map(n=>n[0]).join('') || 'U')}
            </div>
            <div>
              <div className="msg-bbl">{msg.text}</div>
              {msg.chips && (
                <div className="msg-chips">
                  {msg.chips.map(c => (
                    <span key={c} className="chip" onClick={() => handleChipClick(c)}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="msg ai">
            <div className="msg-av"><Bot size={18} /></div>
            <div className="typing-ind">
              <div className="t-dot"></div><div className="t-dot"></div><div className="t-dot"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea 
          className="chat-inp" 
          placeholder="Ask anything about campus..." 
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>
        <button className="send-btn" onClick={handleSend}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
