'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'நமஸ்தே! I am Neethivaan AI Legal Assistant. I can help you understand your legal rights under Indian law. Ask me anything about filing complaints, legal procedures, or your rights as a citizen.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'How do I file a police complaint?',
    'What are my rights if arrested?',
    'How to file RTI application?',
    'Consumer court procedure',
    'Domestic violence legal help',
    'Employer not paying salary',
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let aiText = '';
      try {
        const res: any = await api.post('chat', {

          message: messageText,
        });
        const data = res.data;

        aiText = data?.reply || data?.response || data?.message || 'I received your message but could not generate a response.';

      } catch (e: any) {
        aiText = e?.message || 'I am temporarily unavailable. Please try again in a moment.';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Connection error. Please check your internet and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#050B18',
      color: 'white',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: '#0a1628',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          background: '#C9A84C',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>⚖️</div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '16px' }}>
            Neethivaan Legal AI
          </div>
          <div style={{ fontSize: '12px', color: '#C9A84C' }}>
            ● Online — Indian Law Assistant
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#C9A84C' : '#1a2744',
              color: msg.role === 'user' ? '#000' : '#fff',
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              {msg.content}
              <div style={{
                fontSize: '10px',
                opacity: 0.6,
                marginTop: '4px',
                textAlign: 'right',
              }}>
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              background: '#1a2744',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#C9A84C',
                  animation: `bounce 1s infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div style={{
          padding: '0 24px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          {quickPrompts.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              style={{
                padding: '8px 14px',
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '20px',
                color: '#C9A84C',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: '#0a1628',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type your legal question here..."
          rows={1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'white',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: '48px',
            height: '48px',
            background: loading || !input.trim()
              ? 'rgba(201,168,76,0.3)'
              : '#C9A84C',
            border: 'none',
            borderRadius: '12px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
