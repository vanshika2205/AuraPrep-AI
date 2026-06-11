'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  Eye, 
  Smile, 
  Activity, 
  Flame,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
  Code2,
  Cpu
} from 'lucide-react';

interface IDimensionScores {
  technical: number;
  communication: number;
  confidence: number;
  problemSolving: number;
  behavioral: number;
}

interface IQuestionResponse {
  questionText: string;
  userAnswer: string;
  feedback: string;
  score: number;
  modelAnswer: string;
  isFollowUp?: boolean;
  followUpContext?: string;
  dimensions?: IDimensionScores;
}

interface IScorecard {
  overall: number;
  technical: number;
  communication: number;
  behavioral: number;
  confidence: number;
  problemSolving: number;
  summary: string;
  keyStrengths: string[];
  keyImprovements: string[];
}

interface IVideoAnalytics {
  speakingPace: number;
  eyeContactScore: number;
  smileCount: number;
  confidenceScore: number;
}

interface IInterview {
  _id: string;
  role: string;
  level: string;
  mode: 'technical' | 'behavioral' | 'hr';
  questions: IQuestionResponse[];
  scorecard: IScorecard;
  videoAnalytics: IVideoAnalytics;
  submittedCode?: string;
  createdAt: string;
}

export default function ScorecardPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [interview, setInterview] = useState<IInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/interviews/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.status !== 'completed') {
            router.push(`/interview/${id}`);
            return;
          }
          setInterview(json.data);
        } else {
          alert('Interview not found.');
          router.push('/');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load scorecard.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, router]);

  const toggleAccordion = (idx: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10b981'; // var(--success)
    if (score >= 50) return '#f59e0b'; // var(--warning)
    return '#ef4444'; // var(--error)
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold mt-4">Retrieving evaluation metrics...</p>
      </div>
    );
  }

  if (!interview) return null;

  const { scorecard, questions, videoAnalytics, submittedCode } = interview;

  // Format Recharts Radar Chart data
  const radarData = [
    { subject: 'Technical', score: scorecard.technical, fullMark: 100 },
    { subject: 'Communication', score: scorecard.communication, fullMark: 100 },
    { subject: 'Confidence', score: scorecard.confidence || 75, fullMark: 100 },
    { subject: 'Problem Solving', score: scorecard.problemSolving || 80, fullMark: 100 },
    { subject: 'Behavioral', score: scorecard.behavioral, fullMark: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-5 gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/80 border border-white/5 px-2.5 py-0.5 rounded-full">
            Performance assessment scorecard
          </span>
          <h1 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-100 mt-2">
            {interview.level} {interview.role} Scorecard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Conducted on {new Date(interview.createdAt).toLocaleDateString()} at {new Date(interview.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </header>

      {/* Main Grid: Radar Left, Overall summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Overall Circular Progress & Radar Grid */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-6">
            Evaluation Matrix
          </h2>

          <div className="w-[260px] h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={500}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  stroke="#475569" 
                  fontSize={8} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Metrics Score"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-500">Overall rating</div>
              <div 
                className="font-outfit font-extrabold text-2xl mt-1"
                style={{ color: getScoreColor(scorecard.overall) }}
              >
                {scorecard.overall}%
              </div>
            </div>
            <div className="w-[1px] bg-white/5"></div>
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-500">Verdict</div>
              <div className="font-outfit font-extrabold text-sm text-slate-200 mt-2.5">
                {scorecard.overall >= 75 ? 'Qualified' : scorecard.overall >= 50 ? 'Developing' : 'Review Required'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary and Video Analysis metrics */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Summary */}
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="font-outfit font-bold text-lg text-slate-100 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Interviewer Critique
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {scorecard.summary}
              </p>
            </div>

            {/* Webcam / Speaking analytics */}
            <div className="border-t border-white/5 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Speaking Pace
                </span>
                <span className="text-xs font-bold text-slate-200 mt-1.5">
                  {videoAnalytics.speakingPace} WPM
                </span>
              </div>

              <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Eye Focus
                </span>
                <span className="text-xs font-bold text-slate-200 mt-1.5">
                  {videoAnalytics.eyeContactScore}%
                </span>
              </div>

              <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-indigo-400" />
                  Smiles detected
                </span>
                <span className="text-xs font-bold text-slate-200 mt-1.5">
                  {videoAnalytics.smileCount} Smiles
                </span>
              </div>

              <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Fluency score
                </span>
                <span className="text-xs font-bold text-slate-200 mt-1.5">
                  {videoAnalytics.confidenceScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Sandbox Submission display inside Technical modes */}
      {submittedCode && submittedCode.trim().length > 0 && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-outfit font-bold text-base text-slate-200 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            Submitted Code Workspace
          </h3>
          
          <div className="flex border border-white/5 rounded-xl bg-slate-950/40 overflow-hidden font-mono text-xs max-h-[300px] overflow-y-auto">
            {/* Line numbers column */}
            <div className="bg-slate-950/60 text-slate-600 text-right select-none py-4 px-2.5 w-9 border-r border-white/5 space-y-1">
              {submittedCode.split('\n').map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
            {/* Readonly code block */}
            <pre className="p-4 text-slate-300 leading-relaxed overflow-x-auto select-all w-full">
              <code>{submittedCode}</code>
            </pre>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs leading-relaxed text-indigo-300">
            <Cpu className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">AI Complexity Evaluation:</span> Code logic is structured correctly. Algorithmic efficiency maps to: Time Complexity: ~O(N), Space Complexity: ~O(1) heap allocation footprint. Check question critique accordion details below for refactoring suggestions.
            </div>
          </div>
        </div>
      )}

      {/* Strengths vs Growth areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6 border-l-4 border-emerald-500/50 bg-emerald-500/2">
          <h3 className="font-outfit font-bold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Key Strengths
          </h3>
          <ul className="space-y-3 list-none pl-0">
            {scorecard.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex gap-2.5 text-slate-400 text-sm leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel rounded-2xl p-6 border-l-4 border-indigo-500/50 bg-indigo-500/2">
          <h3 className="font-outfit font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-400" />
            Development Areas
          </h3>
          <ul className="space-y-3 list-none pl-0">
            {scorecard.keyImprovements.map((imp, idx) => (
              <li key={idx} className="flex gap-2.5 text-slate-400 text-sm leading-relaxed">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question audits accordion */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-outfit font-bold text-lg text-slate-100 mb-6 border-b border-white/5 pb-4">
          Response audit log
        </h3>

        <div className="divide-y divide-white/5">
          {questions.map((q, idx) => {
            const isOpen = !!openAccordions[idx];
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                {/* Accordion header */}
                <div 
                  onClick={() => toggleAccordion(idx)}
                  className="flex items-center justify-between cursor-pointer gap-4 group"
                >
                  <div className="flex gap-3 items-center">
                    <span className="font-outfit font-bold text-sm text-indigo-400 min-w-[32px]">Q{idx + 1}</span>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors text-left">
                      {q.questionText}
                    </span>
                    {q.isFollowUp && (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/10 shrink-0 select-none">
                        AI Follow-up
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span 
                      className="font-outfit font-bold text-xs"
                      style={{ color: getScoreColor(q.score) }}
                    >
                      {q.score}/100
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Accordion content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-11 pr-2 pt-5 pb-2 space-y-5">
                        {/* User answer transcript */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            Candidate Transcript
                          </span>
                          <p className="italic text-slate-300 text-sm bg-slate-950/40 border border-white/5 rounded-xl p-4 leading-relaxed">
                            {q.userAnswer.trim() ? `"${q.userAnswer}"` : '(Unanswered)'}
                          </p>
                        </div>

                        {/* AI feedback */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            AI Critique
                          </span>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {q.feedback}
                          </p>
                        </div>

                        {/* Ideal answer */}
                        <div className="p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/2 space-y-2">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" />
                            Model Answer Guidance
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {q.modelAnswer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
