import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi, careersApi } from '../api/client';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [degree, setDegree] = useState('');
  const [majorOrBranch, setMajorOrBranch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState<number | string>('');
  const [gpa, setGpa] = useState<number | string>('');
  const [targetCareerId, setTargetCareerId] = useState('');
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<number | string>('');

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
      setDegree(profile.degree || '');
      setMajorOrBranch(profile.major_or_branch || '');
      setAcademicYear(profile.academic_year || '');
      setInterests(profile.interests || []);
      setInstitution(profile.institution || '');
      setGraduationYear(profile.graduation_year ?? '');
      setGpa(profile.gpa ?? '');
      setTargetCareerId(profile.target_career_id || '');
      setWeeklyStudyHours(profile.weekly_study_hours ?? '');
    }
  }, [profile]);

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await studentApi.updateProfile({
        headline: headline || null,
        bio: bio || null,
        degree: degree || null,
        major_or_branch: majorOrBranch || null,
        academic_year: academicYear || null,
        interests: interests,
        institution: institution || null,
        graduation_year: graduationYear !== '' ? Number(graduationYear) : null,
        gpa: gpa !== '' ? Number(gpa) : null,
        target_career_id: targetCareerId || null,
        weekly_study_hours: weeklyStudyHours !== '' ? Number(weeklyStudyHours) : 0,
      });
      await refreshProfile();
      setSuccessMsg('Profile updated and saved successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-primary">ED-05 ENGINE</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Student Profile & Target Configuration</span>
        </div>
        <h1 style={{ fontSize: '1.45rem', color: '#0f172a', marginBottom: '4px' }}>
          Student Academic Profile Settings
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Configure your academic details, primary target career goal, and weekly study velocity.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '3px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          [SAVED] {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: '3px',
            fontSize: '0.85rem',
          }}
        >
          [ERROR] {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Target Career Goal */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className="badge badge-primary">PRIMARY CAREER TARGET</span>
          </div>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginBottom: '10px' }}>
            All skill gap evaluations, compatibility matching, and trajectory predictions will benchmark against this chosen role.
          </p>
          <select
            className="select-field"
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

        {/* Headline & Degree & Major */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label className="input-label">Professional Headline</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Aspiring Machine Learning Engineer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Degree</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. B.Tech, B.S., M.S., BCA"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Major / Branch / Specialization</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Computer Science and Engineering"
              value={majorOrBranch}
              onChange={(e) => setMajorOrBranch(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Academic Year / Status</label>
            <select
              className="select-field"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="">-- Select Academic Year --</option>
              <option value="Year 1">1st Year (Freshman)</option>
              <option value="Year 2">2nd Year (Sophomore)</option>
              <option value="Year 3">3rd Year (Junior)</option>
              <option value="Year 4">4th Year (Senior)</option>
              <option value="Graduate / Master">Graduate / Master's</option>
              <option value="Alumni / Working Professional">Alumni / Working Professional</option>
            </select>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="input-label">Technical Interests & Focus Areas</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Machine Learning, Deep Learning, Cloud Architecture..."
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAddInterest}
            >
              Add
            </button>
          </div>
          {interests.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="badge badge-primary"
                  style={{ padding: '3px 8px', fontSize: '0.8rem' }}
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#991b1b',
                      cursor: 'pointer',
                      marginLeft: '6px',
                      fontWeight: 700,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              No focus interests specified. Add focus interests to enrich career recommendations.
            </p>
          )}
        </div>

        {/* Institution & GPA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label className="input-label" style={{ marginBottom: 0 }}>
              Weekly Study Commitment (Hours per week)
            </label>
            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{weeklyStudyHours} hrs/week</span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            step="1"
            style={{ width: '100%', accentColor: '#1e3a8a', cursor: 'pointer' }}
            value={weeklyStudyHours}
            onChange={(e) => setWeeklyStudyHours(Number(e.target.value))}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Used by the Trajectory engine to project your career readiness timeline across 24 weeks.
          </span>
        </div>

        {/* Bio */}
        <div>
          <label className="input-label">About / Background</label>
          <textarea
            rows={3}
            className="input-field"
            placeholder="Share your background, current learning focus, and technical aspirations..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '9px 24px' }}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
