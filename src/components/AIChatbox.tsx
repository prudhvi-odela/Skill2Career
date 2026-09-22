import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Bot, User, RefreshCw, Copy, Check, MessageSquare, Maximize2, RotateCcw } from 'lucide-react';
import { apiFetch } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function AIChatbox() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialAssistantMessage: Message = {
    id: 'init',
    role: 'assistant',
    content: `Hello! 👋 I am your **Skill2Career AI Mentor** powered by Google Gemini.\n\nAsk me anything: solve & debug code, practice DSA or System Design, write STAR-method resume points, or get personalized placement guidance!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const listener = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setIsOpen(true);
      if (detail) handleSend(detail);
    };
    window.addEventListener('placement-ops:ask-ai', listener);
    return () => window.removeEventListener('placement-ops:ask-ai', listener);
  }, []);

  const handleResetChat = () => {
    setMessages([
      {
        ...initialAssistantMessage,
        id: 'init_' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await apiFetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.message || 'Here is what I recommend for your preparation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered a temporary connection issue. Please check your network and try sending your message again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const quickPrompts = [
    'Explain QuickSort in Python',
    'How to prepare for System Design?',
    'STAR method resume bullet for React/FastAPI'
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#006EFF] hover:bg-[#0052cc] text-white font-semibold text-sm rounded-full shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer border border-blue-400/30"
          id="btn-ai-mentor-launcher"
        >
          <Sparkles size={18} className="text-yellow-300 animate-pulse" />
          <span>Ask Skill2Career AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
          id="ai-mentor-drawer"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                  Skill2Career AI Mentor
                  <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-normal">
                    Gemini Live
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Personalized technical career guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="New / Clear chat conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/ai-copilot');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Open full page ChatGPT/Gemini Copilot"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`flex items-center justify-between gap-4 mt-2 text-[10px] pt-1 border-t ${
                      msg.role === 'user'
                        ? 'border-blue-500/50 text-blue-100'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:underline opacity-80 hover:opacity-100"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 text-slate-500 flex items-center gap-2 shadow-sm">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  <span className="text-xs">Analyzing and drafting advice…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          {messages.length < 5 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white transition-all"
            >
              <input
                type="text"
                placeholder="Ask your AI Career Mentor..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5"
                id="input-ai-chat"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                id="btn-send-ai-chat"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
