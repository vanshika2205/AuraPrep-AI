'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  BookOpen,
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';

export default function ResumePage() {
  const router = useRouter();
  const { 
    resumeSkills, 
    resumeWeaknesses, 
    learningRoadmap,
    resumeText,
    setResumeData,
    fetchUser,
    showToast
  } = useAppStore();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        showToast('Please select a valid PDF file.', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        // Update Zustand store
        setResumeData({
          skills: json.data.skills,
          weaknesses: json.data.weaknesses,
          text: json.data.text || '',
          roadmap: json.data.roadmap
        });
        
        // Refresh profile stats in shell (badges, XP)
        await fetchUser();
        setFile(null); // clear file input
        showToast('Resume parsed successfully! +100 XP gained.', 'success');
      } else {
        showToast(json.error || 'Upload failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to resume uploader.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeData({ skills: [], weaknesses: [], text: '', roadmap: [] });
    showToast('Resume data cleared.', 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
            Resume Intelligence
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Scan your PDF credentials to isolate skill gaps, configure custom questions, and track custom training plans.
          </p>
        </div>
        {resumeSkills.length > 0 && (
          <button
            onClick={handleRemoveResume}
            className="px-4 py-2 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset parsed data</span>
          </button>
        )}
      </header>

      {/* Main Grid: Upload box vs Extracted Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload Workspace */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-outfit font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              {resumeSkills.length > 0 ? 'Replace Credentials' : 'Upload Credentials'}
            </h2>

            {uploading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-4">
                <div className="relative w-10 h-10">
                  <div className="absolute w-full h-full border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 text-sm font-semibold mt-4">Extracting text & analyzing resume...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Drag zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    dragOver
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : file
                      ? 'border-emerald-500/50 bg-emerald-500/2'
                      : 'border-white/10 bg-slate-950/20 hover:border-white/20'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                  />
                  
                  {file ? (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center animate-bounce">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-sm truncate max-w-[250px] mx-auto">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • PDF file selected
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 text-slate-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">
                          Drag and drop your PDF resume here
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          or click to browse local storage
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Upload action */}
                {file && (
                  <button
                    onClick={handleUpload}
                    className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold font-outfit text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:translate-y-[1px]"
                  >
                    Analyze Credentials & Gain XP
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Prompt warning card */}
          <div className="glass-panel rounded-2xl p-5 border-l-4 border-indigo-500/50 bg-indigo-500/2">
            <h3 className="font-outfit font-bold text-sm text-slate-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              Tailoring Logic
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Once analyzed, our questions generator dynamically queries your extracted skills, injecting customized scenario challenges and directly highlighting weak targets in your practice drills.
            </p>
          </div>

          {/* Resume PDF text preview mock card */}
          {resumeSkills.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Eye className="w-4.5 h-4.5 text-indigo-400" />
                  Resume Preview Sheet
                </h3>
                <button
                  onClick={() => setShowTextPreview(!showTextPreview)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  {showTextPreview ? 'Hide Details' : 'Show Text'}
                </button>
              </div>

              {showTextPreview ? (
                <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl font-mono text-[10px] text-slate-400 max-h-[220px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {resumeText || "Empty text or parsing failure context."}
                </div>
              ) : (
                <div className="p-6 bg-slate-900/40 border border-white/5 rounded-xl flex flex-col gap-3.5 relative overflow-hidden items-center justify-center text-center">
                  <FileCheck className="w-10 h-10 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Extracted PDF Text Block</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Successfully cached {resumeText.length} characters of parsed resume.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Analysis Details */}
        <div className="lg:col-span-7 space-y-6">
          {resumeSkills.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 font-medium space-y-3">
              <FileText className="w-10 h-10 text-slate-700 mx-auto" />
              <div>
                <h3 className="text-slate-300 font-outfit font-bold text-base">No Analysis Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[320px] mx-auto">
                  Upload your PDF resume in the left panel to scan qualifications and unlock study roadmap coordinates.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Extracted Skills Card */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-outfit font-bold text-base text-slate-200 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Extracted Technical Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumeSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-white/5 text-slate-300 hover:border-indigo-500/30 transition-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weak Gaps Card */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-outfit font-bold text-base text-slate-200 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Isolated Focus Gaps
                </h3>
                <div className="space-y-3">
                  {resumeWeaknesses.map((weak, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-white/5"
                    >
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed">{weak}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Card */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-outfit font-bold text-base text-slate-200 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Tailored Practice Modules
                </h3>
                <div className="space-y-3">
                  {learningRoadmap.map((topic, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-white/5 gap-4"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{topic.topic}</div>
                        <p className="text-slate-500 text-xs mt-0.5 max-w-[400px] truncate">{topic.description}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        topic.difficulty === 'Easy' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : topic.difficulty === 'Medium'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                      }`}>
                        {topic.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 border border-white/10 hover:border-indigo-500/30 rounded-xl text-xs font-semibold text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all cursor-pointer"
                >
                  Proceed to launch Tailored Interview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
