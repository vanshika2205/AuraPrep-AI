'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Sliders, 
  Calendar, 
  TrendingUp, 
  Award, 
  Zap, 
  Flame, 
  History, 
  Terminal, 
  Users, 
  HeartHandshake,
  Compass,
  CheckCircle2,
  FileCheck,
  Search,
  BookOpen,
  Plus
} from 'lucide-react';

interface IInterviewHistory {
  _id: string;
  role: string;
  level: string;
  mode: 'technical' | 'behavioral' | 'hr';
  questionCount: number;
  status: 'pending' | 'completed';
  scorecard: {
    overall: number;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { resumeSkills, resumeWeaknesses, username, xp, streak, level } = useAppStore();
  
  // Form Configuration State
  const [role, setRole] = useState('Frontend Engineer');
  const [customRole, setCustomRole] = useState('');
  const [levelSelect, setLevelSelect] = useState('Mid');
  const [mode, setMode] = useState<'technical' | 'behavioral' | 'hr'>('technical');
  const [personality, setPersonality] = useState<'strict' | 'coach' | 'hr'>('strict');
  const [jobDescription, setJobDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  
  // History Logs & Filter States
  const [history, setHistory] = useState<IInterviewHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [creating, setCreating] = useState(false);

  // Search & Filter Widgets
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/interviews');
      const json = await res.json();
      if (json.success) {
        setHistory(json.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeRole = role === 'Custom' ? customRole : role;
    if (!activeRole) {
      alert('Please specify a Job Role');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: activeRole,
          level: levelSelect,
          mode,
          personality,
          jobDescription,
          questionCount
        })
      });
      const json = await res.json();
      if (json.success && json.data?._id) {
        router.push(`/interview/${json.data._id}`);
      } else {
        alert('Error: ' + (json.error || 'Failed to initialize session.'));
        setCreating(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to API server.');
      setCreating(false);
    }
  };

  // Filter and Sort history list
  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMode = modeFilter === 'all' || item.mode === modeFilter;
      const matchesScore = scoreFilter === 'all' || (
        scoreFilter === 'high' ? (item.status === 'completed' && item.scorecard?.overall >= 80) :
        scoreFilter === 'mid' ? (item.status === 'completed' && item.scorecard?.overall >= 60 && item.scorecard?.overall < 80) :
        scoreFilter === 'low' ? (item.status === 'completed' && item.scorecard?.overall < 60) : false
      );
      return matchesSearch && matchesMode && matchesScore;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Aggregates
  const completedMocks = history.filter(h => h.status === 'completed');
  const totalCompleted = completedMocks.length;
  const avgScore = totalCompleted > 0
    ? Math.round(completedMocks.reduce((acc, h) => acc + h.scorecard.overall, 0) / totalCompleted)
    : 0;

  // Chart data
  const chartData = [...completedMocks]
    .reverse()
    .map((mock) => ({
      date: new Date(mock.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: mock.scorecard.overall,
    }));

  // Recommended Topics mapping
  const defaultRecommendedTopics = [
    { title: 'System Design Scaling', desc: 'CDNs, Database sharding, load balancers, rate limiting, CAP theorem.', complexity: 'Hard' },
    { title: 'STAR Situational Mocks', desc: 'Conflict resolution, technical leadership, agile deadlines.', complexity: 'Medium' },
    { title: 'Javascript Closures & Async', desc: 'Event loops, microtasks, async-await engine details.', complexity: 'Medium' },
    { title: 'Web App Security Basics', desc: 'CORS, XSS vectors, CSRF tokens, secure JWT storage.', complexity: 'Hard' }
  ];

  const getRecommendedTopics = () => {
    if (resumeSkills.length === 0) return defaultRecommendedTopics;
    
    // Dynamically build based on gaps or skills
    const topics = [];
    if (resumeWeaknesses && resumeWeaknesses.length > 0) {
      resumeWeaknesses.forEach((weakness) => {
        topics.push({
          title: weakness.split(' ')[0] + ' Optimization',
          desc: `Drill on core concepts relating to: ${weakness.toLowerCase()}`,
          complexity: 'Hard'
        });
      });
    }

    // Add skill refinement topics
    resumeSkills.slice(0, 2).forEach((skill) => {
      topics.push({
        title: `${skill} Architecture`,
        desc: `Test deep core implementation details and edge-cases of ${skill}.`,
        complexity: 'Medium'
      });
    });

    if (topics.length < 4) {
      topics.push(...defaultRecommendedTopics.slice(0, 4 - topics.length));
    }
    return topics.slice(0, 4);
  };

  const topicsList = getRecommendedTopics();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
            Welcome back, {username}!
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Build muscle memory, test verbal responses, and track interview metrics in real time.
          </p>
        </div>
        
        {/* Streak HUD Widget */}
        <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl px-5 py-2.5 shadow-xl">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Current Streak</div>
            <div className="text-sm font-bold text-slate-200">{streak} Days Practice</div>
          </div>
        </div>
      </header>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Completed Mocks */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Sessions Completed</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">
            {totalCompleted} <span className="text-xs font-medium text-slate-500">/ {history.length} initiated</span>
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Average Rating</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">
            {totalCompleted > 0 ? `${avgScore}%` : 'N/A'}
          </div>
        </div>

        {/* Card 3: Experience Rank */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Prepping Level</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="font-outfit font-extrabold text-3xl text-slate-100 mt-4">
            {level === 1 ? 'Apprentice' : level === 2 ? 'Specialist' : 'Expert'} <span className="text-xs font-medium text-slate-500">Lvl {level}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Historical Graph & logs Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-outfit font-bold text-lg text-slate-100 mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Launch AI Mock Simulator
            </h2>

            {creating ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute w-full h-full border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute w-full h-full border-4 border-transparent border-b-cyan-500 rounded-full animate-spin [animation-direction:reverse] [animation-duration:0.8s]"></div>
                </div>
                <p className="text-slate-400 text-sm font-semibold mt-4">Analyzing skills & compiling questions...</p>
              </div>
            ) : (
              <form onSubmit={handleStartInterview} className="space-y-5">
                {/* Interview Mode Options */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Interview Mode</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMode('technical')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-medium text-xs gap-1.5 transition-all cursor-pointer ${
                        mode === 'technical'
                          ? 'border-indigo-500/35 bg-indigo-500/10 text-indigo-400'
                          : 'border-white/5 bg-slate-950/30 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Terminal className="w-4.5 h-4.5" />
                      <span>Technical</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('behavioral')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-medium text-xs gap-1.5 transition-all cursor-pointer ${
                        mode === 'behavioral'
                          ? 'border-purple-500/35 bg-purple-500/10 text-purple-400'
                          : 'border-white/5 bg-slate-950/30 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Users className="w-4.5 h-4.5" />
                      <span>Behavioral</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('hr')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-medium text-xs gap-1.5 transition-all cursor-pointer ${
                        mode === 'hr'
                          ? 'border-cyan-500/35 bg-cyan-500/10 text-cyan-400'
                          : 'border-white/5 bg-slate-950/30 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <HeartHandshake className="w-4.5 h-4.5" />
                      <span>HR Mode</span>
                    </button>
                  </div>
                </div>

                {/* AI Personality */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">AI Personality</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value as any)}
                  >
                    <option value="strict">Strict Tech Lead (Demanding, edge-cases)</option>
                    <option value="coach">Empathetic Coach (Encouraging, feedback-driven)</option>
                    <option value="hr">HR Recruiter (Behavioral, cultural fit)</option>
                  </select>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Job Role</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Fullstack Engineer">Fullstack Engineer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Custom">Custom Role (Define below)</option>
                  </select>
                </div>

                {role === 'Custom' && (
                  <div className="space-y-2 animate-slide-in">
                    <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Custom Role Designation</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" 
                      placeholder="e.g. Systems Engineer, Security Architect..." 
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Level */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Experience Level</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    value={levelSelect} 
                    onChange={(e) => setLevelSelect(e.target.value)}
                  >
                    <option value="Junior">Junior (0-2 years)</option>
                    <option value="Mid">Mid-Level (2-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                    <option value="Lead">Lead / Principal (8+ years)</option>
                  </select>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Job Description / Target Keywords (Optional)</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none" 
                    rows={3}
                    placeholder="e.g. Performance tuning, high write scale, STAR layout situatons..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                {/* Resume skills badge warning */}
                {resumeSkills.length > 0 && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-xs leading-relaxed">
                    <FileCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300">Resume Tailoring Active:</span> AI questions will target your skills (<span className="italic">{resumeSkills.slice(0, 3).join(', ')}</span>).
                    </div>
                  </div>
                )}

                {/* Questions count */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Session Questions Count</label>
                  <select 
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                  >
                    <option value={3}>Quick Practice (3 questions)</option>
                    <option value={5}>Standard Assessment (5 questions)</option>
                    <option value={10}>Deep Technical Drill (10 questions)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold font-outfit text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:translate-y-[1px]"
                >
                  Launch Mock Session
                </button>
              </form>
            )}
          </div>

          {/* Recommended Topics List */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-outfit font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Recommended Topics
            </h2>
            <div className="space-y-3">
              {topicsList.map((topic, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col gap-2 hover:border-indigo-500/15 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">{topic.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      topic.complexity === 'Hard' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {topic.complexity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{topic.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Historical Performance Graph & History Logs */}
        <div className="lg:col-span-7 space-y-8">
          {/* Performance Area Graph */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-outfit font-bold text-lg text-slate-100 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Rating Performance History
            </h2>

            {totalCompleted === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 font-medium text-xs gap-3">
                <Calendar className="w-8 h-8 text-slate-600" />
                <span>Historical ratings will display once you finish a mock interview.</span>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 100]}
                      dx={-5}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-outfit)' }}
                      itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      name="Overall Score"
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Past Sessions List with Search and Filters */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Activity Log
              </h2>
              <div className="relative shrink-0 w-full sm:w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-950/20 border border-white/5 rounded-xl p-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Mode:</span>
                <select 
                  value={modeFilter} 
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="all">All Mode Types</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="hr">HR</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Rating:</span>
                <select 
                  value={scoreFilter} 
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="all">All Scores</option>
                  <option value="high">High (&gt;80%)</option>
                  <option value="mid">Average (60-80%)</option>
                  <option value="low">Unsatisfactory (&lt;60%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span>Sort Date:</span>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {loadingHistory ? (
              <div className="py-10 flex justify-center">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm font-medium space-y-2">
                <Compass className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No matching mock assessment records found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {filteredHistory.map((mock) => (
                  <div 
                    key={mock._id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-indigo-500/20 transition-colors gap-3 animate-in fade-in duration-200"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                        <span>{mock.role}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          mock.mode === 'technical' 
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                            : mock.mode === 'behavioral'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                        }`}>
                          {mock.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 font-medium">
                        <span>{mock.level}</span>
                        <span>•</span>
                        <span>{mock.questionCount} Questions</span>
                        <span>•</span>
                        <span>{new Date(mock.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {mock.status === 'completed' ? (
                        <>
                          <div className="flex flex-col items-end sm:items-right">
                            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Rating</span>
                            <span className={`text-base font-extrabold font-outfit ${
                              mock.scorecard.overall >= 75 ? 'text-emerald-500' : mock.scorecard.overall >= 50 ? 'text-amber-500' : 'text-rose-500'
                            }`}>
                              {mock.scorecard.overall}%
                            </span>
                          </div>
                          <button
                            onClick={() => router.push(`/interview/${mock._id}/scorecard`)}
                            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                          >
                            Scorecard
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/10 uppercase tracking-wide">
                            Pending
                          </span>
                          <button
                            onClick={() => router.push(`/interview/${mock._id}`)}
                            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            Resume
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
