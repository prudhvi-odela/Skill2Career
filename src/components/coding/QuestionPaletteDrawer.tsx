import React, { useState, useMemo } from 'react';
import {
  Search, CheckCircle2, Circle, Clock, Tag, Filter,
  Sparkles, X, ChevronRight, Shuffle, Award, Flame
} from 'lucide-react';
import {
  CODING_QUESTIONS,
  CODING_CATEGORIES,
  DOMAINS,
  type CodingQuestion
} from '../../data/codingPracticeQuestions';

interface QuestionPaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestionId: string;
  onSelectQuestion: (question: CodingQuestion) => void;
  solvedQuestionIds: Set<string>;
  questionSolveTimes: Record<string, number>; // questionId -> seconds
}

export const QuestionPaletteDrawer: React.FC<QuestionPaletteDrawerProps> = ({
  isOpen,
  onClose,
  selectedQuestionId,
  onSelectQuestion,
  solvedQuestionIds,
  questionSolveTimes,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return CODING_QUESTIONS.filter((q) => {
      const matchesSearch =
        search.trim() === '' ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        q.companies.some((c) => c.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      const matchesDomain = selectedDomain === 'All Domains' || q.domain === selectedDomain;
      
      const isSolved = solvedQuestionIds.has(q.id);
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Solved' && isSolved) ||
        (statusFilter === 'Unsolved' && !isSolved);

      return matchesSearch && matchesCat && matchesDiff && matchesDomain && matchesStatus;
    });
  }, [search, selectedCategory, selectedDifficulty, selectedDomain, statusFilter, solvedQuestionIds]);

  const solvedCount = useMemo(() => {
    return CODING_QUESTIONS.filter((q) => solvedQuestionIds.has(q.id)).length;
  }, [solvedQuestionIds]);

  const pickRandom = () => {
    const list = filteredQuestions.length > 0 ? filteredQuestions : CODING_QUESTIONS;
    const randomIndex = Math.floor(Math.random() * list.length);
    onSelectQuestion(list[randomIndex]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-start',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '540px',
          maxWidth: '92vw',
          height: '100%',
          background: '#ffffff',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInLeft 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#38bdf8' }} />
              <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Practice Question Palette
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {CODING_QUESTIONS.length} Questions
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Select from curated placement, systems & algorithm challenges
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress & Quick Actions */}
        <div
          style={{
            padding: '12px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              <Award size={16} style={{ color: '#006EFF' }} />
              <span>
                Solved: <strong style={{ color: '#059669' }}>{solvedCount}</strong> / {CODING_QUESTIONS.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ea580c', fontWeight: 600 }}>
              <Flame size={14} /> Practice Streak: Active
            </div>
          </div>

          <button
            type="button"
            onClick={pickRandom}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Shuffle size={13} /> Pick Random
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by title, tag, or company (e.g. Two Sum, Google, Stack)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Difficulty Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: selectedDifficulty === diff ? '1px solid #006EFF' : '1px solid #e2e8f0',
                  background: selectedDifficulty === diff ? '#006EFF' : '#f8fafc',
                  color: selectedDifficulty === diff ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                {diff}
              </button>
            ))}

            <div style={{ width: '1px', background: '#e2e8f0', margin: '0 2px' }} />

            {/* Status filters */}
            {(['All', 'Solved', 'Unsolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: statusFilter === st ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  background: statusFilter === st ? '#0f172a' : '#f8fafc',
                  color: statusFilter === st ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              {CODING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Topic: {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              {DOMAINS.map((dom) => (
                <option key={dom} value={dom}>
                  Domain: {dom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>No problems match your filters</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedDifficulty('All');
                  setSelectedDomain('All Domains');
                  setStatusFilter('All');
                }}
                style={{
                  background: '#006EFF',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredQuestions.map((q, idx) => {
                const isSelected = q.id === selectedQuestionId;
                const isSolved = solvedQuestionIds.has(q.id);
                const bestSeconds = questionSolveTimes[q.id];

                let diffColor = '#10b981';
                let diffBg = '#ecfdf5';
                if (q.difficulty === 'Medium') {
                  diffColor = '#f59e0b';
                  diffBg = '#fffbeb';
                } else if (q.difficulty === 'Hard') {
                  diffColor = '#ef4444';
                  diffBg = '#fef2f2';
                }

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      onSelectQuestion(q);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #006EFF' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f7ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                      <div style={{ paddingTop: '2px' }}>
                        {isSolved ? (
                          <CheckCircle2 size={17} style={{ color: '#10b981' }} />
                        ) : (
                          <Circle size={17} style={{ color: '#cbd5e1' }} />
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {idx + 1}. {q.title}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: diffColor,
                              background: diffBg,
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                          <span>{q.category}</span>
                          <span>•</span>
                          <span>{q.acceptanceRate}% Acceptance</span>

                          {bestSeconds && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={11} /> {Math.floor(bestSeconds / 60)}m {bestSeconds % 60}s
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ⏱️ {q.targetTimeMinutes}m
                      </span>
                      <ChevronRight size={15} style={{ color: '#94a3b8' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <span>Showing {filteredQuestions.length} of {CODING_QUESTIONS.length} challenges</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Palette
          </button>
        </div>
      </div>
    </div>
  );
};
