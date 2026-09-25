import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase, Search, MapPin, Building2, Filter, Bookmark, BookmarkCheck,
  ExternalLink, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ArrowUpDown,
  RefreshCw, TrendingUp, Award, Calendar, DollarSign, X, ChevronRight,
  ShieldCheck, Check, Clock, Laptop, Info, SlidersHorizontal
} from 'lucide-react';
import {
  fetchJobRecommendations,
  fetchJobFilters,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
  updateApplicationStatus,
} from '../lib/jobs-api';
import type {
  MatchAnalysisResult,
  SavedJobRecord,
  JobFilterOptions,
} from '../lib/jobs-api';
import { useAuth } from '../context/AuthContext';

export const JobsPage: React.FC = () => {
  const { user, profile } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<'all' | 'internships' | 'fulltime' | 'saved' | 'applications'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<JobFilterOptions | null>(null);

  // Recommendations and Search results
  const [jobs, setJobs] = useState<MatchAnalysisResult[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedJobRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [configMessage, setConfigMessage] = useState<string>('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('relevance');
  const [minSalaryLpa, setMinSalaryLpa] = useState<number | ''>('');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // Active Job Details Modal
  const [selectedJobAnalysis, setSelectedJobAnalysis] = useState<MatchAnalysisResult | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Fetch filter metadata on mount
  useEffect(() => {
    fetchJobFilters()
      .then(opts => setFilterOptions(opts))
      .catch(() => {
        // Fallback default filters
        setFilterOptions({
          countries: [{ code: 'in', label: 'India' }],
          top_cities: ['All Locations', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Remote'],
          work_modes: ['All', 'Remote', 'Hybrid', 'On-Site'],
          employment_types: ['All', 'Internship', 'Full-Time', 'Part-Time', 'Contract'],
          experience_levels: ['All', 'Entry-Level / Fresher', 'Junior', 'Mid-Level', 'Senior'],
          sort_options: [
            { value: 'relevance', label: 'Recommended Match (Best Fit)' },
            { value: 'match_pct', label: 'Highest Skill Match %' },
            { value: 'date', label: 'Most Recent Postings' },
            { value: 'salary', label: 'Highest Package' },
          ],
          application_statuses: ['Interested', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
        });
      });
  }, []);

  // Load Saved Jobs
  const loadSavedJobs = async () => {
    try {
      const res = await fetchSavedJobs();
      setSavedRecords(res.saved_jobs || []);
    } catch (e) {
      console.warn('Could not fetch saved jobs:', e);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  // Fetch Recommendations / Listings
  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      let empType = 'All';
      if (activeTab === 'internships') empType = 'Internship';
      if (activeTab === 'fulltime') empType = 'Full-Time';

      const salaryInr = typeof minSalaryLpa === 'number' && minSalaryLpa > 0 ? minSalaryLpa * 100000 : undefined;

      const res = await fetchJobRecommendations({
        page: 1,
        limit: 30,
        query: searchQuery || undefined,
        location: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
        work_mode: selectedWorkMode,
        employment_type: empType,
        experience_level: selectedExperience,
        sort_by: selectedSort,
        salary_min: salaryInr,
      });

      setIsConfigured(res.configured);
      if (!res.configured) {
        setConfigMessage(res.message || 'Adzuna API credentials not configured.');
      }

      setJobs(res.results || []);
      setTotalCount(res.total || (res.results ? res.results.length : 0));
    } catch (err: any) {
      setError(err.message || 'Failed to connect to job recommendations service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'saved' && activeTab !== 'applications') {
      loadJobs();
    }
  }, [activeTab, selectedLocation, selectedWorkMode, selectedExperience, selectedSort, minSalaryLpa]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  // Toggle Save
  const handleToggleSave = async (analysis: MatchAnalysisResult) => {
    const isCurrentlySaved = savedRecords.some(r => r.job_id === analysis.job.id);
    try {
      if (isCurrentlySaved) {
        await unsaveJob(analysis.job.id);
        setSavedRecords(prev => prev.filter(r => r.job_id !== analysis.job.id));
        setJobs(prev => prev.map(j => (j.job.id === analysis.job.id ? { ...j, is_saved: false } : j)));
        if (selectedJobAnalysis?.job.id === analysis.job.id) {
          setSelectedJobAnalysis(prev => (prev ? { ...prev, is_saved: false } : null));
        }
      } else {
        const res = await saveJob(analysis.job.id, analysis.job);
        setSavedRecords(prev => [res.saved_record, ...prev]);
        setJobs(prev => prev.map(j => (j.job.id === analysis.job.id ? { ...j, is_saved: true, saved_application_status: 'Interested' } : j)));
        if (selectedJobAnalysis?.job.id === analysis.job.id) {
          setSelectedJobAnalysis(prev => (prev ? { ...prev, is_saved: true, saved_application_status: 'Interested' } : null));
        }
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update saved status.');
    }
  };

  // Update Application Status
  const handleStatusChange = async (
    jobId: string,
    status: 'Interested' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn'
  ) => {
    setUpdatingStatusId(jobId);
    setStatusFeedback(null);
    try {
      const res = await updateApplicationStatus(jobId, status);
      setSavedRecords(prev => {
        const idx = prev.findIndex(r => r.job_id === jobId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = res.updated_record;
          return next;
        }
        return [res.updated_record, ...prev];
      });

      setJobs(prev =>
        prev.map(j => (j.job.id === jobId ? { ...j, is_saved: true, saved_application_status: status } : j))
      );

      if (selectedJobAnalysis?.job.id === jobId) {
        setSelectedJobAnalysis(prev => (prev ? { ...prev, is_saved: true, saved_application_status: status } : null));
      }

      setStatusFeedback(`Application status marked as "${status}"`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to update application status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Helper counters
  const activeFiltersCount = [
    selectedLocation !== 'All Locations',
    selectedWorkMode !== 'All',
    selectedExperience !== 'All',
    minSalaryLpa !== '',
    selectedSort !== 'relevance',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedLocation('All Locations');
    setSelectedWorkMode('All');
    setSelectedExperience('All');
    setSelectedSort('relevance');
    setMinSalaryLpa('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                <Briefcase size={14} />
                <span>Opportunity Intelligence & Real-Time Recommendations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Jobs & Internships
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Verified Indian vacancies matched against your verified skills, target role (
                <span className="font-semibold text-blue-600">{profile?.target_career_title || 'Software Engineer'}</span>
                ), and career readiness index.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xs">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Readiness Benchmark</div>
                  <div className="text-sm font-bold text-slate-900">
                    {profile?.gpa ? `${Math.round(75 + (profile.gpa - 7) * 4)}% Placement Fit` : '78% Placement Fit'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  loadJobs();
                  loadSavedJobs();
                }}
                disabled={loading}
                className="btn btn-secondary text-xs flex items-center gap-1.5 py-2.5 px-3.5 border-slate-300"
                title="Refresh listings from Adzuna"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-100">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase size={14} />
              <span>All Recommendations</span>
              {activeTab === 'all' && totalCount > 0 && (
                <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('internships')}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'internships'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award size={14} />
              <span>Internships & Trainee</span>
            </button>

            <button
              onClick={() => setActiveTab('fulltime')}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'fulltime'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 size={14} />
              <span>Full-Time Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark size={14} />
              <span>Saved Opportunities</span>
              {savedRecords.length > 0 && (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {savedRecords.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck size={14} />
              <span>My Applications</span>
              {savedRecords.filter(r => r.application_status !== 'Interested').length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {savedRecords.filter(r => r.application_status !== 'Interested').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-6">
        {/* Adzuna Configuration Notice Banner (if unconfigured) */}
        {!isConfigured && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-lg mt-0.5">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900">
                  Adzuna API Credentials Required for Live Job Vacancies
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {configMessage ||
                    'To stream verified real-time Indian job postings from Adzuna, please configure ADZUNA_APP_ID and ADZUNA_APP_KEY in your server environment variables.'}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href="https://developer.adzuna.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-950 underline hover:text-amber-800"
                  >
                    <span>Get Adzuna Developer Keys</span>
                    <ExternalLink size={12} />
                  </a>
                  <span className="text-amber-400">•</span>
                  <span className="text-xs text-amber-700">
                    Add keys to <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> and reload.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Filter Controls (When not in Applications tab) */}
        {activeTab !== 'applications' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs">
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3">
              {/* Keyword / Role Input */}
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search by role (e.g. ${profile?.target_career_title || 'Software Engineer'}), skill (Python, React), or company...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Location Select */}
              <div className="relative w-full lg:w-56">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none cursor-pointer"
                >
                  {filterOptions?.top_cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  )) || (
                    <>
                      <option value="All Locations">All Locations</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Remote">Remote</option>
                    </>
                  )}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs py-2.5 px-5 flex-1 lg:flex-none justify-center"
                >
                  <Search size={14} />
                  <span>Find Opportunities</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`btn text-xs py-2.5 px-3.5 border ${
                    showFiltersPanel || activeFiltersCount > 0
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Collapsible Filter Panel */}
            {showFiltersPanel && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
                {/* Work Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work Mode</label>
                  <select
                    value={selectedWorkMode}
                    onChange={e => setSelectedWorkMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Modes (Remote + On-Site)</option>
                    <option value="Remote">Remote Only</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Experience Level</label>
                  <select
                    value={selectedExperience}
                    onChange={e => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Experience Tiers</option>
                    <option value="Entry-Level / Fresher">Entry-Level / Fresher (0-1 yr)</option>
                    <option value="Junior">Junior (1-3 yrs)</option>
                    <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                    <option value="Senior">Senior (5+ yrs)</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sort Results By</label>
                  <select
                    value={selectedSort}
                    onChange={e => setSelectedSort(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Recommended Match (Composite)</option>
                    <option value="match_pct">Highest Skill Match %</option>
                    <option value="date">Most Recent Posting</option>
                    <option value="salary">Highest Package / Stipend</option>
                  </select>
                </div>

                {/* Minimum CTC / Stipend */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Min Package (₹ LPA)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="1"
                      value={minSalaryLpa}
                      onChange={e => setMinSalaryLpa(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 6"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="btn btn-quiet text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-2"
                        title="Clear all filters"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-500 text-[11px] font-semibold">Active Filters:</span>
                {selectedLocation !== 'All Locations' && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    Location: {selectedLocation}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedLocation('All Locations')} />
                  </span>
                )}
                {selectedWorkMode !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    Mode: {selectedWorkMode}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedWorkMode('All')} />
                  </span>
                )}
                {selectedExperience !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    Exp: {selectedExperience}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedExperience('All')} />
                  </span>
                )}
                {minSalaryLpa !== '' && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                    Min: ₹{minSalaryLpa} LPA
                    <X size={12} className="cursor-pointer" onClick={() => setMinSalaryLpa('')} />
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Feedback Toast */}
        {statusFeedback && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-5 mb-6 text-rose-800 text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 mt-0.5" />
              <div>
                <strong className="font-semibold">Unable to fetch job opportunities</strong>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
                <button onClick={loadJobs} className="btn btn-primary text-xs mt-3 bg-rose-600 hover:bg-rose-700">
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE SKELETONS */}
        {loading && (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                    <div>
                      <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
                      <div className="h-3 w-32 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="h-3 w-full bg-slate-100 rounded mt-4" />
                <div className="flex gap-2 mt-4">
                  <div className="h-5 w-16 bg-slate-100 rounded" />
                  <div className="h-5 w-20 bg-slate-100 rounded" />
                  <div className="h-5 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            TAB 1, 2, 3: ALL / INTERNSHIPS / FULL-TIME OPPORTUNITIES
            ========================================================================= */}
        {!loading && !error && activeTab !== 'saved' && activeTab !== 'applications' && (
          <>
            {jobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Job Listings Matched Your Criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  Try adjusting your search keywords, broadening your location filter, or relaxing minimum package constraints.
                </p>
                <button onClick={resetFilters} className="btn btn-secondary text-xs">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    Showing <strong className="text-slate-800">{jobs.length}</strong> verified opportunities (
                    {jobs.filter(j => j.job.employment_type === 'Internship').length} internships,{' '}
                    {jobs.filter(j => j.job.employment_type === 'Full-Time').length} full-time)
                  </span>
                  <span className="text-[11px] text-slate-400">Attribution: Adzuna API Official Index</span>
                </div>

                {jobs.map(analysis => {
                  const job = analysis.job;
                  const isSaved = savedRecords.some(r => r.job_id === job.id);
                  const savedStatus = savedRecords.find(r => r.job_id === job.id)?.application_status;

                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all relative group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Company & Title */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                            {job.company_initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {job.title}
                              </h3>
                              {job.employment_type === 'Internship' && (
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  Internship / Trainee
                                </span>
                              )}
                              {job.work_mode === 'Remote' && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Laptop size={10} /> Remote
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 font-semibold text-slate-800">
                                <Building2 size={13} className="text-slate-400" />
                                {job.company_name}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={13} className="text-slate-400" />
                                {job.location_display}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 font-medium text-emerald-700">
                                <DollarSign size={13} className="text-emerald-600" />
                                {job.salary_formatted}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Top Compatibility & Action Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Skill Match Badge */}
                          <div
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                              analysis.skill_match_percentage >= 80
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : analysis.skill_match_percentage >= 60
                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <Sparkles size={13} />
                            <span>{analysis.skill_match_percentage}% Skill Match</span>
                          </div>

                          {/* Save Button */}
                          <button
                            onClick={() => handleToggleSave(analysis)}
                            className={`p-2 rounded-lg border transition-all ${
                              isSaved
                                ? 'bg-amber-50 border-amber-300 text-amber-600'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                          >
                            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Brief Snippet */}
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Matched vs Missing Skills Chips */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-500 mr-1">Skills:</span>
                          {/* Matched skills */}
                          {analysis.matched_skills.slice(0, 3).map(m => (
                            <span
                              key={m.skill_name}
                              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium"
                            >
                              <Check size={10} className="text-emerald-600" />
                              {m.skill_name}
                            </span>
                          ))}

                          {/* Missing skills */}
                          {analysis.missing_skills.slice(0, 2).map(ms => (
                            <span
                              key={ms.skill_name}
                              className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[11px]"
                              title="Gap to acquire"
                            >
                              +{ms.skill_name}
                            </span>
                          ))}

                          {/* Eligibility Badge */}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1 ${
                              analysis.eligibility_status === 'Eligible'
                                ? 'bg-emerald-100 text-emerald-800'
                                : analysis.eligibility_status === 'Ineligible'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {analysis.eligibility_status}
                          </span>
                        </div>

                        {/* Card CTA Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobAnalysis(analysis)}
                            className="btn btn-secondary text-xs py-1.5 px-3"
                          >
                            View Details
                          </button>

                          <a
                            href={job.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            <span>Apply on Source</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            TAB 4: SAVED OPPORTUNITIES
            ========================================================================= */}
        {!loading && activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Saved Opportunities</h2>
                <p className="text-xs text-slate-500">
                  Bookmarked job postings saved to your persistent student record.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {savedRecords.length} Saved
              </span>
            </div>

            {savedRecords.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Bookmark size={32} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Saved Jobs Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Browse recommendations and click the bookmark icon on any job card to save it for later review or application tracking.
                </p>
                <button onClick={() => setActiveTab('all')} className="btn btn-primary text-xs">
                  Browse Opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRecords.map(rec => {
                  const job = rec.job;
                  return (
                    <div
                      key={rec.job_id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {job.company_initials || 'CO'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                            <span className="font-semibold text-slate-800">{job.company_name}</span>
                            <span>•</span>
                            <span>{job.location_display}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">{job.salary_formatted}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Saved on {new Date(rec.saved_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Application Status Selector & Actions */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                          <select
                            value={rec.application_status}
                            disabled={updatingStatusId === rec.job_id}
                            onChange={e => handleStatusChange(rec.job_id, e.target.value as any)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Interested">Interested</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer Received</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Withdrawn">Withdrawn</option>
                          </select>
                        </div>

                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ExternalLink size={12} />
                        </a>

                        <button
                          onClick={() => unsaveJob(rec.job_id).then(loadSavedJobs)}
                          className="btn btn-quiet text-xs text-rose-600 hover:bg-rose-50 p-2"
                          title="Remove from saved"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: MY APPLICATION TRACKER (PIPELINE)
            ========================================================================= */}
        {!loading && activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Application Lifecycle Tracker</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track the real-time hiring stage of jobs and internships you have applied to.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md border border-blue-200">
                    {savedRecords.filter(r => r.application_status === 'Applied').length} Applied
                  </span>
                  <span className="bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-md border border-purple-200">
                    {savedRecords.filter(r => r.application_status === 'Interview').length} In Interview
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                    {savedRecords.filter(r => r.application_status === 'Offer').length} Offers
                  </span>
                </div>
              </div>
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(['Interested', 'Applied', 'Interview', 'Offer'] as const).map(stage => {
                const stageRecords = savedRecords.filter(r => r.application_status === stage);

                return (
                  <div key={stage} className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{stage}</span>
                      <span className="text-xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {stageRecords.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageRecords.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">No applications</div>
                      ) : (
                        stageRecords.map(rec => (
                          <div
                            key={rec.job_id}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs hover:border-blue-300 transition-all"
                          >
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rec.job.title}</h4>
                            <div className="text-[11px] text-slate-600 font-medium mt-0.5">{rec.job.company_name}</div>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                              <span>{rec.job.location_display}</span>
                              <span className="text-emerald-600 font-medium">{rec.job.salary_formatted}</span>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <select
                                value={rec.application_status}
                                onChange={e => handleStatusChange(rec.job_id, e.target.value as any)}
                                className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700"
                              >
                                <option value="Interested">Interested</option>
                                <option value="Applied">Applied</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Withdrawn">Withdrawn</option>
                              </select>

                              <a
                                href={rec.job.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Link</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          JOB DETAILS MODAL / DRAWER
          ========================================================================= */}
      {selectedJobAnalysis && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {selectedJobAnalysis.job.company_initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedJobAnalysis.job.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                    <span className="font-semibold text-slate-800">{selectedJobAnalysis.job.company_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {selectedJobAnalysis.job.location_display}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">{selectedJobAnalysis.job.salary_formatted}</span>
                    <span>•</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {selectedJobAnalysis.job.employment_type}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedJobAnalysis(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
              {/* Score Matrix Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-center">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Skill Compatibility</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    {selectedJobAnalysis.skill_match_percentage}%
                  </div>
                  <div className="text-[11px] text-blue-600 mt-0.5">
                    {selectedJobAnalysis.matched_skills.length} matched / {selectedJobAnalysis.job.required_skills.length} required
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Placement Readiness</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {selectedJobAnalysis.readiness_score}%
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Validated diagnostic score</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-center">
                  <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">Eligibility Check</div>
                  <div className="text-sm font-bold text-purple-900 mt-2">
                    {selectedJobAnalysis.eligibility_status}
                  </div>
                  <div className="text-[10px] text-purple-600 mt-0.5">
                    {selectedJobAnalysis.job.education_requirements}
                  </div>
                </div>
              </div>

              {/* Match Explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" />
                  <span>Why This Opportunity Matches You</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  {selectedJobAnalysis.match_reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Skill Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Skill Requirements & Your Competency
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedJobAnalysis.matched_skills.map(m => (
                    <div key={m.skill_name} className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                      <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        {m.skill_name}
                      </span>
                      <span className="text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                        Level {m.student_level.toFixed(1)}
                      </span>
                    </div>
                  ))}

                  {selectedJobAnalysis.missing_skills.map(ms => (
                    <div key={ms.skill_name} className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
                      <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-amber-600" />
                        {ms.skill_name}
                      </span>
                      <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
                        Target: {ms.recommended_target_level.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Job Description & Scope
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                  {selectedJobAnalysis.job.description}
                </div>
              </div>

              {/* Application Tracking Controls */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-blue-950">Update Application Status</div>
                  <div className="text-[11px] text-blue-700">Track this opportunity in your dashboard pipeline</div>
                </div>

                <select
                  value={
                    savedRecords.find(r => r.job_id === selectedJobAnalysis.job.id)?.application_status || 'Interested'
                  }
                  onChange={e => handleStatusChange(selectedJobAnalysis.job.id, e.target.value as any)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-blue-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Interested">Interested (Saved)</option>
                  <option value="Applied">Applied on Portal</option>
                  <option value="Interview">Interview Scheduled</option>
                  <option value="Offer">Offer Extended</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              {/* Attribution and Verification */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-3">
                <span>Source: Official Adzuna Partner API ({selectedJobAnalysis.job.country})</span>
                <span>Fetched: {new Date(selectedJobAnalysis.job.fetched_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleToggleSave(selectedJobAnalysis)}
                className={`btn text-xs py-2 px-4 border ${
                  savedRecords.some(r => r.job_id === selectedJobAnalysis.job.id)
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {savedRecords.some(r => r.job_id === selectedJobAnalysis.job.id) ? (
                  <span className="flex items-center gap-1.5"><BookmarkCheck size={14} /> Saved</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Bookmark size={14} /> Save for Later</span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJobAnalysis(null)}
                  className="btn btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>

                <a
                  href={selectedJobAnalysis.job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-xs py-2 px-5 flex items-center gap-2"
                >
                  <span>Apply on Employer / Adzuna</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
