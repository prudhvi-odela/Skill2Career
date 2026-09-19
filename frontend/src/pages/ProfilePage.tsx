import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi, careersApi } from '../api/client';
import { User, Save, Target, BookOpen, Clock, Check, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState(2027);
  const [gpa, setGpa] = useState(8.0);
  const [targetCareerId, setTargetCareerId] = useState('');
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(12.0);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    careersApi.getCareers().then((res) => setCareers(res.data));
  }, []);

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setDegree(profile.degree || 'B.Tech Computer Science');
      setInstitution(profile.institution || '');
      setGraduationYear(profile.graduation_year || 2027);
      setGpa(profile.gpa || 8.0);
      setTargetCareerId(profile.target_career_id || '');
      setWeeklyStudyHours(profile.weekly_study_hours || 12.0);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await studentApi.updateProfile({
        headline,
        bio,
        degree,
        institution,
        graduation_year: Number(graduationYear),
        gpa: Number(gpa),
        target_career_id: targetCareerId || null,
        weekly_study_hours: Number(weeklyStudyHours),
      });
      await refreshProfile();
      setSuccessMsg('Profile updated and saved to database successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Student Profile Settings</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Configure your academic details, target career goal, and available study hours.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Target Career Goal */}
        <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Target size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem' }}>Primary Target Career Role</h3>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '12px' }}>
            All ML skill gap evaluations, readiness metrics, and generated roadmaps will automatically benchmark against this role.
          </p>
          <select
            className="input-field"
            value={targetCareerId}
            onChange={(e) => setTargetCareerId(e.target.value)}
          >
            <option value="">-- Select Target Career --</option>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.domain} • ${c.avg_salary_usd.toLocaleString()}/yr)
              </option>
            ))}
          </select>
        </div>

        {/* Headline & Bio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <label className="input-label">Professional Headline</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Aspiring Full-Stack Software Engineer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Academic Degree</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. B.Tech Computer Science"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            />
          </div>
        </div>

        {/* Institution & GPA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <label className="input-label">Institution / College</label>
            <input
              type="text"
              className="input-field"
              placeholder="University Institute of Technology"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Graduation Year</label>
            <input
              type="number"
              className="input-field"
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="input-label">GPA (Out of 10.0)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="input-field"
              value={gpa}
              onChange={(e) => setGpa(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Weekly Study Commitment */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="input-label" style={{ marginBottom: 0 }}>
              Weekly Study Commitment (Hours per week)
            </label>
            <span style={{ fontWeight: 700, color: '#818cf8' }}>{weeklyStudyHours} hrs/week</span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            step="1"
            style={{ width: '100%', accentColor: '#6366f1' }}
            value={weeklyStudyHours}
            onChange={(e) => setWeeklyStudyHours(Number(e.target.value))}
          />
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Used by the Trajectory Forecaster to simulate your readiness growth velocity over 24 weeks.
          </span>
        </div>

        {/* Bio */}
        <div>
          <label className="input-label">About / Bio</label>
          <textarea
            rows={3}
            className="input-field"
            placeholder="Share your interests, learning focus, and technical aspirations..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px 28px' }}>
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
