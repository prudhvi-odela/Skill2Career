import React, { useState, useEffect } from 'react';
import { studentApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle,
  Search,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const SkillsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [studentSkills, setStudentSkills] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New skill form
  const [newSkillId, setNewSkillId] = useState('');
  const [newLevel, setNewLevel] = useState(3.0);
  const [newExp, setNewExp] = useState(1.0);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const [skillsRes, catRes] = await Promise.all([
        studentApi.getSkills(),
        careersApi.getSkillsCatalog(),
      ]);
      setStudentSkills(skillsRes.data);
      setCatalog(catRes.data);
      if (catRes.data.length > 0) {
        setNewSkillId(catRes.data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load skills:', err);
      setError(err.response?.data?.detail || 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await studentApi.addSkill({
        skill_id: newSkillId,
        proficiency_level: Number(newLevel),
        years_experience: Number(newExp),
      });
      await loadSkills();
      await refreshProfile();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to add skill:', err);
      alert(err.response?.data?.detail || 'Failed to add skill');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await studentApi.deleteSkill(skillId);
      await loadSkills();
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleUpdateLevel = async (skillId: string, level: number) => {
    try {
      await studentApi.addSkill({
        skill_id: skillId,
        proficiency_level: level,
      });
      setStudentSkills((prev) =>
        prev.map((s) => (s.skill_id === skillId ? { ...s, proficiency_level: level } : s))
      );
      await refreshProfile();
    } catch (err: any) {
      console.error('Failed to update skill:', err);
    }
  };

  const categories = ['All', ...Array.from(new Set(catalog.map((s) => s.category)))];

  const filteredStudentSkills = studentSkills.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.skill_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Skills & Competency Inventory</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Manage your rated skills. Ratings directly feed into the real-time ML Job-Readiness evaluation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/app/assessments" className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#34d399" />
            <span>Verify with Quizzes</span>
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ padding: '10px 20px' }}>
            <Plus size={18} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '38px' }}
            placeholder="Search your skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#ffffff' : '#d1d5db',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonLoader rows={6} type="cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSkills} />
      ) : filteredStudentSkills.length === 0 ? (
        <EmptyState
          title="No Skills in Inventory"
          message={searchQuery ? `No skills matching "${searchQuery}".` : 'Add your first skill to begin calculating your ML job readiness score.'}
          actionText="Add New Skill"
          actionLink="#"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        /* Skills Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredStudentSkills.map((s) => (
            <div
              key={s.skill_id}
              className="glass-card glass-card-interactive"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span className="badge badge-indigo" style={{ marginBottom: '6px' }}>{s.category}</span>
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{s.skill_name}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.is_verified ? (
                      <span className="badge badge-emerald" title="Verified via Skill Assessment Quiz">
                        <CheckCircle size={12} />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <Link to="/app/assessments" className="badge badge-amber" title="Take a quiz to verify this skill">
                        <span>Unverified</span>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteSkill(s.skill_id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove Skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Proficiency Slider */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#9ca3af' }}>Proficiency Level</span>
                    <strong style={{ color: '#818cf8' }}>Level {s.proficiency_level.toFixed(1)} / 5.0</strong>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={s.proficiency_level}
                    onChange={(e) => handleUpdateLevel(s.skill_id, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#6366f1' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                    <span>Novice (1.0)</span>
                    <span>Intermediate (3.0)</span>
                    <span>Expert (5.0)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>{s.years_experience} yrs experience</span>
                {s.assessment_score ? (
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Quiz: {s.assessment_score}%</span>
                ) : (
                  <Link to="/app/assessments" style={{ color: '#818cf8', fontWeight: 600 }}>Verify Quiz →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.35rem' }}>Add New Skill</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Select Skill from Catalog</label>
                <select
                  className="input-field"
                  value={newSkillId}
                  onChange={(e) => setNewSkillId(e.target.value)}
                  required
                >
                  {catalog.map((catSkill) => (
                    <option key={catSkill.id} value={catSkill.id}>
                      {catSkill.name} ({catSkill.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Initial Proficiency Level</label>
                  <strong style={{ color: '#818cf8' }}>Level {newLevel.toFixed(1)} / 5.0</strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={newLevel}
                  onChange={(e) => setNewLevel(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              <div>
                <label className="input-label">Years of Experience</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  className="input-field"
                  value={newExp}
                  onChange={(e) => setNewExp(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  {modalLoading ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
