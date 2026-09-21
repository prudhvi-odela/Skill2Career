import React, { useState, useEffect } from 'react';
import { studentApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { SkeletonLoader, EmptyState, ErrorState } from '../components/StateFeedback';

export const SkillsPage: React.FC = () => {
  const { refreshProfile } = useAuth();
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
    if (!confirm('Are you sure you want to remove this skill?')) return;
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">ED-05 ENGINE</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Student Competency Inventory</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
            My Skills & Evolving Learning Progress
          </h1>
          <p style={{ color: '#475569', fontSize: '0.85rem' }}>
            Manage your logged competencies. Updating skill proficiencies dynamically updates career matching, gap analysis, and job-readiness predictions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/app/skill-gap" className="btn-secondary">
            View Skill Gap Engine →
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            + Add New Skill
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="panel-card" style={{ padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search your logged skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#1e3a8a' : '#e2e8f0',
                color: selectedCategory === cat ? '#f8f9fa' : '#334155',
                border: selectedCategory === cat ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '3px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
          title="No Skills Found"
          message={searchQuery ? `No skills matching "${searchQuery}".` : 'Add your first skill to begin calculating your ML career readiness score.'}
          actionText="Add New Skill"
          actionLink="#"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        /* Skills Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredStudentSkills.map((s) => (
            <div
              key={s.skill_id}
              className="panel-card"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-neutral">{s.category}</span>
                  <span style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 700 }}>
                    Level {s.proficiency_level}.0 / 5.0
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px' }}>
                  {s.skill_name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Experience: {s.years_experience} {s.years_experience === 1 ? 'Year' : 'Years'}
                </div>
              </div>

              {/* Quick Level Slider */}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>
                  <span>Update Proficiency:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{s.proficiency_level}.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={s.proficiency_level}
                  onChange={(e) => handleUpdateLevel(s.skill_id, Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1e3a8a', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleDeleteSkill(s.skill_id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#991b1b',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Remove Skill
                </button>
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
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="panel-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              background: '#f8f9fa',
              border: '1px solid #cbd5e1',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Add Skill to Inventory</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Select Skill</label>
                <select
                  className="select-field"
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Proficiency Level</label>
                  <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.85rem' }}>Level {newLevel}.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1e3a8a' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>1.0 (Beginner)</span>
                  <span>3.0 (Intermediate)</span>
                  <span>5.0 (Expert)</span>
                </div>
              </div>

              <div>
                <label className="input-label">Years of Practical Experience</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  className="input-field"
                  value={newExp}
                  onChange={(e) => setNewExp(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary"
                >
                  {modalLoading ? 'Saving...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
