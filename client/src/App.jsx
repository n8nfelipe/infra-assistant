import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, Play, ShieldAlert, Cpu } from 'lucide-react';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am InfraStack. How can I help you manage your server today? Try asking: "Install git and htop"' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.explanation, data }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Error: Failed to connect to backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (command, index) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index].executing = true;
      newMessages[index].terminalOutput = '';
      return newMessages;
    });

    const response = await fetch('http://localhost:3001/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[index].terminalOutput += chunk;
        return newMessages;
      });
    }

    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[index].executing = false;
      return newMessages;
    });
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu className="text-primary" size={24} />
          <h1>InfraStack</h1>
        </div>
        <div className="status-badge" style={{ fontSize: '0.8rem', opacity: 0.6 }}>
          Server Connected
        </div>
      </header>

      <div className="chat-box">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.content}
              
              {m.role === 'ai' && m.data?.command && (
                <div className="command-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TerminalIcon size={16} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Proposed Command</span>
                  </div>
                  <div className="command-text">{m.data.command}</div>
                  
                  {m.data.warning && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      <ShieldAlert size={14} />
                      {m.data.warning}
                    </div>
                  )}

                  <div className="action-buttons">
                    <button 
                      className="btn-execute" 
                      onClick={() => executeCommand(m.data.command, i)}
                      disabled={m.executing}
                    >
                      {m.executing ? 'Executing...' : 'Execute Now'}
                    </button>
                  </div>

                  {(m.terminalOutput || m.executing) && (
                    <div className="terminal">
                      {m.terminalOutput}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input 
            type="text" 
            placeholder={loading ? "Generating..." : "Ask to install or configure something..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button className="btn-execute" onClick={handleSend} disabled={loading}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
