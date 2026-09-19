import React, { useState, useEffect } from 'react';
import { studentApi, careersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle,
  Search,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [studentSkills, setStudentSkills] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New skill form
  const [newSkillId, setNewSkillId] = useState('');
  const [newLevel, setNewLevel] = useState(3.0);
  const [newExp, setNewExp] = useState(1.0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
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
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.addSkill({
        skill_id: newSkillId,
        proficiency_level: Number(newLevel),
        years_experience: Number(newExp),
      });
      await loadSkills();
      await refreshProfile();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await studentApi.deleteSkill(skillId);
      await loadSkills();
      await refreshProfile();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleUpdateLevel = async (skillId: string, level: number) => {
    try {
      await studentApi.addSkill({
        skill_id: skillId,
        proficiency_level: level,
      });
      await loadSkills();
      await refreshProfile();
    } catch (err) {
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
            Manage your rated skills. Ratings directly feed into the ML Job-Readiness engine.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ padding: '10px 20px' }}>
          <Plus size={18} />
          <span>Add New Skill</span>
        </button>
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
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredStudentSkills.map((s) => (
          <div key={s.id} className="glass-card glass-card-interactive" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{s.skill_name}</h3>
                <span className="badge badge-indigo">{s.category}</span>
              </div>

              <button
                onClick={() => handleDeleteSkill(s.skill_id)}
                title="Remove Skill"
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Proficiency Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Proficiency:</span>
                <strong style={{ color: '#818cf8' }}>Level {s.proficiency_level} / 5.0</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={s.proficiency_level}
                onChange={(e) => handleUpdateLevel(s.skill_id, Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            {/* Verification Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              {s.is_verified ? (
                <span className="badge badge-emerald">
                  <CheckCircle size={12} />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af' }}>
                  Self-Reported
                </span>
              )}

              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {s.years_experience} yrs exp
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredStudentSkills.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <Sliders size={36} color="#6366f1" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#ffffff' }}>No Skills Found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            {searchQuery ? 'Try adjusting your search criteria.' : 'Add your first skill to begin tracking readiness.'}
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Add Skill</span>
          </button>
        </div>
      )}

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '18px' }}>Add Skill to Inventory</h2>

            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="input-label">Select Skill</label>
                <select
                  className="input-field"
                  value={newSkillId}
                  onChange={(e) => setNewSkillId(e.target.value)}
                >
                  {catalog.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>Self-Rated Proficiency</label>
                  <strong style={{ color: '#818cf8' }}>Level {newLevel} / 5.0</strong>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value))}
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
                  onChange={(e) => setNewExp(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
