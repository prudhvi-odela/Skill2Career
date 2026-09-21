import React, { useState, useEffect, useRef } from 'react';
import { aiApi, studentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  GraduationCap,
  Target,
  MessageSquare,
  Compass,
  Lightbulb
} from 'lucide-react';

interface WebResource {
  title: string;
  source: string;
  url: string;
  description: string;
  resource_type?: string;
}

interface StructuredAIResponse {
  message: string;
  key_points: string[];
  recommended_actions: string[];
  referenced_skills: string[];
  referenced_careers: string[];
  referenced_predictions: string[];
  learning_resources?: WebResource[];
  code_examples?: string[];
  follow_up_questions?: string[];
  warnings: string[];
  context_type: string;
  conversation_id?: string;
  generated_at?: string;
  model_used?: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  structured?: StructuredAIResponse;
  timestamp: string;
}

export const CareerAIPage: React.FC = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const actionPresets = [
    { label: 'Teach me this topic', action: 'teach_topic', icon: BookOpen },
    { label: 'Give me 5 questions', action: '5_questions', icon: HelpCircle },
    { label: 'Explain this code', action: 'explain_code', icon: Code2 },
    { label: 'Verified Resources', action: 'get_resources', icon: ExternalLink },
    { label: 'Project Idea', action: 'project_idea', icon: Lightbulb },
    { label: 'Explain My Readiness', action: 'readiness_explanation', icon: Award }
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const res = await aiApi.getConversations();
      const list = res.data || [];
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        selectConversation(list[0].id);
      } else if (list.length === 0) {
        startNewConversation();
      }
    } catch (err) {
      console.error(err);
      startNewConversation();
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    try {
      setLoading(true);
      const res = await aiApi.getConversationMessages(convId);
      const rawMsgs = res.data || [];
      const formatted: MessageItem[] = rawMsgs.map((m: any) => ({
        id: m.id,
        sender: m.role === 'assistant' ? 'assistant' : 'user',
        text: m.content,
        structured: m.structured_data,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      if (formatted.length === 0) {
        setMessages([getWelcomeMessage()]);
      } else {
        setMessages(formatted);
      }
    } catch (err) {
      console.error(err);
      setMessages([getWelcomeMessage()]);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async () => {
    try {
      const res = await aiApi.createConversation('New Learning Session');
      const newConv = res.data;
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([getWelcomeMessage()]);
    } catch (err) {
      setActiveConversationId(null);
      setMessages([getWelcomeMessage()]);
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiApi.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getWelcomeMessage = (): MessageItem => ({
    id: 'welcome',
    sender: 'assistant',
    structured: {
      message: `Hello! I am your Skill2Career AI Learning Assistant. I have context on your academic branch (${profile?.major_or_branch || 'CSE'}), your subject baselines, verified evidence, and target career (${profile?.target_career_title || 'Software Engineering'}). How can I help your learning journey today?`,
      key_points: [
        'Grounded Context: Strictly analyzes your verified profile, curriculum, and registered ML model.',
        'Zero Hallucination: External resources link to official documentation (no fake URLs).',
        'Multi-action: Ask me to teach a topic, generate practice questions, explain code, or brainstorm projects.'
      ],
      recommended_actions: [
        'Ask: "Explain recursion with code"',
        'Ask: "Show verified resources for SQL indexing"',
        'Ask: "Give me 5 practice questions on binary search trees"'
      ],
      referenced_skills: [],
      referenced_careers: profile?.target_career_id ? [profile.target_career_id] : [],
      referenced_predictions: [],
      warnings: [
        'ML predictions represent statistical benchmark readiness, not guaranteed employment.'
      ],
      context_type: 'learning_tutor'
    },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const handleSend = async (queryText?: string, actionType?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: MessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      let res;
      if (actionType === 'readiness_explanation') {
        res = await aiApi.explainReadiness();
      } else {
        res = await aiApi.chat(
          text,
          activeConversationId || undefined,
          profile?.target_career_id || undefined,
          actionType
        );
      }

      const assistantMsg: MessageItem = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        structured: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      // Update conversation title if needed
      if (res.data?.conversation_id && (!activeConversationId || activeConversationId !== res.data.conversation_id)) {
        setActiveConversationId(res.data.conversation_id);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          sender: 'assistant',
          structured: {
            message: 'I encountered an issue connecting to the inference engine. Please retry your question.',
            key_points: ['Temporary network or inference timeout.'],
            recommended_actions: ['Retry asking your question.'],
            referenced_skills: [],
            referenced_careers: [],
            referenced_predictions: [],
            warnings: [],
            context_type: 'error'
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (codeText: string, indexId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(indexId);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar: Conversation Threads */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 12px'
        }}
      >
        <div>
          <button
            onClick={startNewConversation}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            <Plus size={16} /> New Conversation
          </button>

          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', padding: '0 8px 8px' }}>
            PAST SESSIONS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            {conversations.map(c => {
              const isSelected = activeConversationId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    color: isSelected ? '#93c5fd' : '#cbd5e1',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <MessageSquare size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title || 'Learning Session'}
                    </span>
                  </div>
                  <button
                    onClick={e => deleteConversation(c.id, e)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Grounding Footer */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.72rem',
            color: '#94a3b8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 700, marginBottom: '2px' }}>
            <GraduationCap size={13} /> {profile?.major_or_branch || 'B.Tech CSE'}
          </div>
          <div>Year: {profile?.academic_year || 'Year 3'} • Verified Grounding</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#090d16' }}>
        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map((m, idx) => (
              <div
                key={m.id || idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {/* Message Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {m.sender === 'assistant' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Sparkles size={14} /> Skill2Career AI Tutor
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>You</div>
                  )}
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{m.timestamp}</span>
                </div>

                {/* Message Body */}
                <div
                  style={{
                    maxWidth: '85%',
                    background: m.sender === 'user' ? '#2563eb' : 'rgba(15, 23, 42, 0.85)',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  {m.text && <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>}

                  {m.structured && (
                    <div>
                      <div style={{ whiteSpace: 'pre-line' }}>{m.structured.message}</div>

                      {/* Code Examples */}
                      {m.structured.code_examples && m.structured.code_examples.length > 0 && (
                        <div style={{ margin: '14px 0' }}>
                          {m.structured.code_examples.map((codeBlock, cIdx) => (
                            <div
                              key={cIdx}
                              style={{
                                background: '#090d16',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                overflow: 'hidden',
                                margin: '8px 0'
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  padding: '6px 12px',
                                  fontSize: '0.72rem',
                                  color: '#94a3b8'
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Code2 size={12} /> Code Snippet
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyCode(codeBlock, `${idx}_${cIdx}`)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: copiedCodeIndex === `${idx}_${cIdx}` ? '#34d399' : '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.72rem'
                                  }}
                                >
                                  {copiedCodeIndex === `${idx}_${cIdx}` ? <Check size={12} /> : <Copy size={12} />}
                                  {copiedCodeIndex === `${idx}_${cIdx}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre
                                style={{
                                  padding: '12px 14px',
                                  margin: 0,
                                  fontFamily: 'monospace',
                                  fontSize: '0.82rem',
                                  color: '#93c5fd',
                                  overflowX: 'auto'
                                }}
                              >
                                <code>{codeBlock}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Verified Learning Resources Cards */}
                      {m.structured.learning_resources && m.structured.learning_resources.length > 0 && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ExternalLink size={13} /> VERIFIED LEARNING RESOURCES
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                            {m.structured.learning_resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'block',
                                  padding: '10px 12px',
                                  background: 'rgba(255,255,255,0.03)',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  textDecoration: 'none',
                                  color: '#f8fafc'
                                }}
                              >
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {res.title} <ExternalLink size={10} />
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{res.source}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', lineClamp: 2 }}>{res.description}</div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {m.structured.follow_up_questions && m.structured.follow_up_questions.length > 0 && (
                        <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {m.structured.follow_up_questions.map((fq, fIdx) => (
                            <button
                              key={fIdx}
                              type="button"
                              onClick={() => handleSend(fq)}
                              style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                color: '#93c5fd',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              [Q] {fq}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
                <Sparkles size={14} className="animate-spin" color="#60a5fa" /> Synthesizing grounded educational guidance...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar & Action Chips */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 24px'
          }}
        >
          <div style={{ maxWidth: '840px', margin: '0 auto' }}>
            {/* Action Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
              {actionPresets.map(preset => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.action}
                    type="button"
                    onClick={() => handleSend(preset.label, preset.action)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Icon size={12} color="#60a5fa" />
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Input Box */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Ask Skill2Career AI (e.g. 'Explain recursion', 'Give 5 practice questions', 'Explain this code')..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend();
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                disabled={loading || !inputQuery.trim()}
                onClick={() => handleSend()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: loading || !inputQuery.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={15} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
