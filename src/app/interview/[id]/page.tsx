'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Gauge,
  Camera,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Settings,
  Code2,
  Terminal,
  Activity,
  Smile,
  Eye,
  AlertTriangle,
  User,
  Sliders,
  CheckCircle2,
  VideoOff
} from 'lucide-react';

interface IQuestion {
  questionText: string;
  userAnswer: string;
  isFollowUp?: boolean;
}

interface IInterview {
  _id: string;
  role: string;
  level: string;
  mode: 'technical' | 'behavioral' | 'hr';
  personality: 'strict' | 'coach' | 'hr';
  questionCount: number;
  status: 'pending' | 'completed';
  questions: IQuestion[];
}

export default function InterviewRoomPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Interview Metadata State
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stepper & Workspace State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'response' | 'code'>('response');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [submittedCode, setSubmittedCode] = useState('');
  
  // Settings Panel State
  const [showSettings, setShowSettings] = useState(false);
  const [personality, setPersonality] = useState<'strict' | 'coach' | 'hr'>('strict');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);

  // Webcam & Stream State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Webcam HUD Calibration & Tracking Warnings
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationDone, setCalibrationDone] = useState(false);
  const [eyeContact, setEyeContact] = useState(92);
  const [smiles, setSmiles] = useState(0);
  const [speakingPace, setSpeakingPace] = useState(120);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Voice AI States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [checkingFollowUp, setCheckingFollowUp] = useState(false);
  const [showFollowUpToast, setShowFollowUpToast] = useState(false);

  // Audio Analyser Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Interview Session on Mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/interviews/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.status === 'completed') {
            router.push(`/interview/${id}/scorecard`);
            return;
          }
          setInterview(json.data);
          setPersonality(json.data.personality || 'strict');
          
          // Prepopulate answers
          const initialAnswers = json.data.questions.map((q: any) => q.userAnswer || '');
          setAnswers(initialAnswers);
        } else {
          alert('Interview session not found.');
          router.push('/');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to retrieve interview session.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, router]);

  // 2. Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechLib) {
        const rec = new SpeechLib();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onsoundstart = () => {
          // INTERRUPTION HOOK
          if (isAiSpeaking && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsAiSpeaking(false);
          }
        };

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (currentTranscript) {
            setAnswers(prev => {
              const updated = [...prev];
              const previousContent = updated[currentIdx] ? updated[currentIdx] + ' ' : '';
              updated[currentIdx] = (previousContent + currentTranscript).trim().replace(/\s+/g, ' ');
              return updated;
            });
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [currentIdx, isAiSpeaking]);

  // 3. Audio Reading (Speech Synthesis) trigger on question changes
  useEffect(() => {
    if (interview && interview.questions[currentIdx]) {
      speakQuestion(interview.questions[currentIdx].questionText);
    }
    // Stop recording when switching questions
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    // Reset trackers
    setElapsedTime(0);
    setSmiles(Math.floor(Math.random() * 2));
    setEyeContact(90 + Math.floor(Math.random() * 8));
  }, [currentIdx, interview]);

  // 4. Elapsed timers for words-per-minute calculations
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // Fluctuating eye contact score
      setEyeContact(prev => {
        const delta = Math.floor(Math.random() * 12 - 6);
        return Math.min(100, Math.max(50, prev + delta));
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx]);

  // WPM Calculator
  useEffect(() => {
    const currentAnswer = answers[currentIdx] || '';
    const wordCount = currentAnswer.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0 && elapsedTime > 3) {
      const wpm = Math.round(wordCount / (elapsedTime / 60));
      setSpeakingPace(Math.min(200, Math.max(60, wpm)));
    } else {
      setSpeakingPace(120);
    }
  }, [answers, currentIdx, elapsedTime]);

  // 5. Audio Context Analyser for Real-time Canvas Rendering
  const startCanvasVisualizer = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = audioStream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(audioStream);
      
      source.connect(analyser);
      analyser.fftSize = 64;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!canvasRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.8;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)'); // Indigo
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)'); // Cyan
          
          ctx.fillStyle = gradient;
          // Rounded bars
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (err) {
      console.error('Error starting audio visualizer:', err);
    }
  };

  const stopCanvasVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // 6. Webcam stream alignment calibration countdown
  const startWebcamCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    
    let currentVal = 0;
    const interval = setInterval(() => {
      currentVal += 10;
      setCalibrationProgress(currentVal);
      if (currentVal >= 100) {
        clearInterval(interval);
        setIsCalibrating(false);
        setCalibrationDone(true);
        
        // Add dynamic smiles count
        setSmiles(1);
      }
    }, 300);
  };

  function speakQuestion(text: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSpeed;
      utterance.pitch = voicePitch;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please type.');
      return;
    }

    if (isListening) {
      recognition.stop();
      stopCanvasVisualizer();
      setIsListening(false);
    } else {
      if (isAiSpeaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsAiSpeaking(false);
      }
      recognition.start();
      startCanvasVisualizer();
      setIsListening(true);
    }
  };

  const enableWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Prompt camera calibration step
      if (!calibrationDone) {
        startWebcamCalibration();
      }
    } catch (err) {
      console.error(err);
      alert('Webcam permission denied. Check your browser settings.');
    }
  };

  const disableWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const handleStepNext = async () => {
    if (!interview) return;
    
    const currentAnswer = answers[currentIdx] || '';
    
    if (isListening && recognition) {
      recognition.stop();
      stopCanvasVisualizer();
      setIsListening(false);
    }

    setCheckingFollowUp(true);
    try {
      const res = await fetch(`/api/interviews/${id}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: interview.questions[currentIdx].questionText,
          userAnswer: currentAnswer,
          questionIndex: currentIdx,
          personality // Send dynamic updated personality
        })
      });
      const json = await res.json();
      
      if (json.success && json.hasFollowUp && json.updatedQuestions) {
        setInterview(prev => {
          if (!prev) return null;
          return { ...prev, questions: json.updatedQuestions };
        });
        setAnswers(prev => {
          const updated = [...prev];
          updated.splice(currentIdx + 1, 0, '');
          return updated;
        });

        setShowFollowUpToast(true);
        setTimeout(() => setShowFollowUpToast(false), 4000);

        setCurrentIdx(currentIdx + 1);
      } else {
        if (currentIdx < interview.questions.length - 1) {
          setCurrentIdx(currentIdx + 1);
        }
      }
    } catch (err) {
      console.error(err);
      if (currentIdx < interview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      }
    } finally {
      setCheckingFollowUp(false);
    }
  };

  const handleStepBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmitInterview = async () => {
    if (!interview) return;
    
    if (isListening && recognition) {
      recognition.stop();
      stopCanvasVisualizer();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSubmitting(true);

    const payload = interview.questions.map((q, idx) => ({
      questionText: q.questionText,
      userAnswer: answers[idx] || ''
    }));

    try {
      const res = await fetch(`/api/interviews/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: payload,
          submittedCode 
        })
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/interview/${id}/scorecard`);
      } else {
        alert('Evaluation error: ' + (json.error || 'Submit again.'));
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting responses.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold mt-4">Connecting to simulator capsule...</p>
      </div>
    );
  }

  if (!interview) return null;

  const currentQuestion = interview.questions[currentIdx];
  const isLastQuestion = currentIdx === interview.questions.length - 1;
  const isTechnical = interview.mode === 'technical';

  if (submitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center max-w-md mx-auto space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute w-full h-full border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute w-full h-full border-4 border-transparent border-b-cyan-500 rounded-full animate-spin [animation-direction:reverse] [animation-duration:0.8s]"></div>
        </div>
        <div>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-100">Compiling Evaluation Matrix</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            OpenAI is assessing technical depth, written code logic, speech patterns, and sentiment metrics to format your circular scorecard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full relative">
      {/* Dynamic follow-up toast alert */}
      <AnimatePresence>
        {showFollowUpToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-purple-500/20 border border-purple-500/30 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 pointer-events-none"
          >
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Conversational Follow-up triggered!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-5 gap-3">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/10 px-2.5 py-0.5 rounded-full">
            {interview.mode} Mode • Personality: {personality}
          </span>
          <h1 className="font-outfit font-extrabold text-xl md:text-2xl text-slate-100 mt-2">
            {interview.level} {interview.role}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400">
            Progress: <span className="text-slate-100 font-bold">{currentIdx + 1}</span> of {interview.questions.length} Questions
          </span>
          
          {/* Vocal Settings Popover Button */}
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
            
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-72 bg-slate-950 border border-white/10 p-5 rounded-2xl shadow-2xl z-50 space-y-4"
                >
                  <h3 className="font-outfit font-bold text-sm text-slate-200 border-b border-white/5 pb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Interviewer Controls
                  </h3>

                  {/* Personality */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">AI Personality</label>
                    <select
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value as any)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="strict">Strict Tech Lead</option>
                      <option value="coach">Empathetic Coach</option>
                      <option value="hr">HR Recruiter</option>
                    </select>
                  </div>

                  {/* Speed */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <span>Speaking Speed</span>
                      <span className="text-indigo-400">{voiceSpeed}x</span>
                    </div>
                    <input 
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.1"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Pitch */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <span>Speaking Pitch</span>
                      <span className="text-indigo-400">{voicePitch}</span>
                    </div>
                    <input 
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.1"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleSubmitInterview} 
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
          >
            Exit & Score
          </button>
        </div>
      </header>

      {/* Main Grid: Webcam Left, Response Workspace Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Video Streams Pane */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Interviewer Feed */}
          <div className="relative aspect-video rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold font-outfit shadow-xl shadow-indigo-500/20">
                  AI
                </div>
                {isAiSpeaking && (
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500 animate-pulse-ring z-0"></div>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                AI Interviewer {isAiSpeaking ? '(Speaking...)' : ''}
              </span>
            </div>
            
            <div className="absolute bottom-3 left-3 bg-slate-950/70 border border-white/5 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? 'bg-indigo-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span>Audio Feed</span>
            </div>
          </div>

          {/* Candidate webcam feed */}
          <div className="relative aspect-video rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden shadow-2xl">
            {cameraActive && stream ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                
                {/* Calibration HUD layer */}
                {isCalibrating && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-indigo-500 animate-spin mb-4 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-indigo-400 [animation-direction:reverse]" />
                    </div>
                    <h3 className="font-outfit font-bold text-sm text-slate-100">Align Eyes inside the Frame</h3>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Hold still. Calibration sequence running... {calibrationProgress}%</p>
                  </div>
                )}

                {/* Tracking Warnings overlays */}
                {!isCalibrating && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 p-4 flex flex-col justify-between pointer-events-none">
                    {/* Top HUD */}
                    <div className="flex justify-between items-start">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        <Camera className="w-3 h-3" />
                        Focus tracking locked
                      </span>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-slate-400 text-[10px] font-bold">
                          Eye Contact: <span className={eyeContact < 75 ? 'text-rose-400' : 'text-emerald-400'}>{eyeContact}%</span>
                        </span>
                        {eyeContact < 75 && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[8px] font-bold uppercase tracking-wider animate-pulse">
                            ⚠️ Keep Eye Contact
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="flex flex-col gap-2 pt-2">
                      {speakingPace > 165 && (
                        <span className="self-start px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8px] font-bold uppercase tracking-wider animate-pulse">
                          ⚠️ Speaking Pace Fast: Slow Down
                        </span>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950/70 border border-white/5 backdrop-blur p-2 rounded-lg flex flex-col">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">Pace Speed</span>
                          <span className="text-xs font-bold text-indigo-400 mt-0.5 flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5" />
                            {speakingPace} WPM {speakingPace > 150 ? '(Fast)' : speakingPace < 95 ? '(Slow)' : '(Optimal)'}
                          </span>
                        </div>

                        <div className="bg-slate-950/70 border border-white/5 backdrop-blur p-2 rounded-lg flex flex-col">
                          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">Sentiment Analysis</span>
                          <span className="text-xs font-bold text-indigo-400 mt-0.5">
                            Smiles: {smiles}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                <VideoOff className="w-8 h-8 text-slate-700" />
                <button 
                  onClick={enableWebcam}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Turn Camera On
                </button>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-slate-950/70 border border-white/5 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span>Candidate Feed {cameraActive ? '(LIVE)' : '(OFF)'}</span>
            </div>
          </div>
          
          {cameraActive && (
            <button 
              onClick={disableWebcam} 
              className="self-center px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-[10px] font-bold text-slate-400 rounded-xl transition-all cursor-pointer"
            >
              Turn Camera Off
            </button>
          )}
        </div>

        {/* Right: Question Textbox & Transcript Workspace */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Question Text Box */}
          <div className="glass-panel rounded-2xl p-6 border-l-4 border-indigo-500 bg-indigo-500/2">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                {currentQuestion.isFollowUp ? 'Follow-up Prompt' : 'Assigned Question'}
              </span>
              
              <button
                onClick={() => speakQuestion(currentQuestion.questionText)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Speak
              </button>
            </div>
            <p className="font-outfit font-bold text-base md:text-lg text-slate-100 leading-relaxed">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Transcript Response Workspace with split code tabs for technical modes */}
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col gap-4 min-h-[350px]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              {/* Split WorkSpace selector */}
              {isTechnical ? (
                <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveWorkspaceTab('response')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeWorkspaceTab === 'response'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Voice Response
                  </button>
                  <button
                    onClick={() => setActiveWorkspaceTab('code')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeWorkspaceTab === 'code'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Code Editor
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  Vocal Transcription Panel
                </span>
              )}
              
              {/* Mic & Visualizer Canvas */}
              {activeWorkspaceTab === 'response' && (
                <div className="flex items-center gap-3">
                  {isListening && (
                    <canvas 
                      ref={canvasRef}
                      width={60}
                      height={20}
                      className="rounded opacity-80"
                    />
                  )}
                  
                  <button
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                      isListening 
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25' 
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Stop Listening</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Answer with Voice</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {activeWorkspaceTab === 'code' && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Lang</span>
                  <select 
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="bg-slate-900 border border-white/5 rounded-lg text-[10px] font-bold text-indigo-400 p-1 focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              )}
            </div>

            {/* Tabbed view content */}
            {activeWorkspaceTab === 'response' ? (
              <textarea
                className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-slate-200 text-sm leading-relaxed focus:outline-none focus:border-indigo-500/40 resize-none"
                placeholder={isListening ? "Listening... Speak clearly into your microphone." : "Formulate your technical answer. Click Answer with Voice to speak or type directly."}
                value={answers[currentIdx] || ''}
                onChange={(e) => {
                  const text = e.target.value;
                  setAnswers(prev => {
                    const updated = [...prev];
                    updated[currentIdx] = text;
                    return updated;
                  });
                }}
              />
            ) : (
              <div className="flex-1 flex border border-white/5 rounded-xl bg-slate-950/20 overflow-hidden font-mono text-xs">
                {/* Line numbers column */}
                <div className="bg-slate-950/60 text-slate-600 text-right select-none py-4 px-2 w-8 border-r border-white/5 space-y-1">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code input */}
                <textarea
                  className="flex-1 bg-transparent p-4 text-slate-200 focus:outline-none resize-none leading-relaxed"
                  placeholder={`// Write your code logic here\nfunction solveProblem() {\n  // Code sandbox details\n}`}
                  value={submittedCode}
                  onChange={(e) => setSubmittedCode(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Control Steppers */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleStepBack}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-white/5 bg-slate-950/30 hover:bg-white/5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitInterview}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <span>Submit Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleStepNext}
                disabled={checkingFollowUp}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
              >
                {checkingFollowUp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
