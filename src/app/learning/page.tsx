'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  PlayCircle, 
  Circle,
  HelpCircle,
  Code,
  Globe,
  Database,
  Layers,
  HeartHandshake,
  GitBranch,
  Search,
  BookMarked
} from 'lucide-react';

const QUESTION_BANK = {
  react: {
    title: 'React Core',
    icon: <Code className="w-5 h-5 text-indigo-400" />,
    questions: [
      {
        q: 'What is the React Virtual DOM and how does reconciliation work?',
        a: 'The Virtual DOM is an in-memory representation of the real DOM elements. When state changes, React builds a new virtual DOM subtree, compares it with the previous one (diffing), and calculates the minimum set of operations required to update the browser DOM (reconciliation).'
      },
      {
        q: 'How do React Server Components (RSC) differ from Client Components?',
        a: 'RSC run exclusively on the server, allowing them to query databases directly, compile with zero client-side package footprints, and stream HTML. Client Components represent standard interactive parts loaded with the javascript bundle on the client side.'
      }
    ]
  },
  javascript: {
    title: 'Modern JavaScript',
    icon: <Globe className="w-5 h-5 text-cyan-400" />,
    questions: [
      {
        q: 'Explain the event loop and microtask queue priority.',
        a: 'JavaScript is single-threaded. Synchronous code executes first on the call stack. Asynchronous callbacks are routed to queues. Microtasks (Promises, process.nextTick) have higher priority than macrotasks (setTimeout, event listeners) and execute completely before rendering or processing the next macrotask.'
      },
      {
        q: 'What is prototypal inheritance and prototype chains?',
        a: 'Objects in JavaScript have an internal reference link to another object called its prototype. When accessing a property that does not exist directly on an object, Javascript traverses up the prototype chain until it either finds the property or reaches null.'
      }
    ]
  },
  node: {
    title: 'Node.js & Servers',
    icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
    questions: [
      {
        q: 'What is the Node.js event emitter pattern?',
        a: 'It is a pub-sub pattern where objects (instances of EventEmitter) trigger named events which cause registered listener functions to execute asynchronously.'
      },
      {
        q: 'How do streams optimize buffer overheads in Node?',
        a: 'Streams allow processing chunks of file data piece-by-piece sequentially, rather than loading a massive 2 GB file entirely into system memory buffers, reducing the memory footprint to kilobytes.'
      }
    ]
  },
  mongodb: {
    title: 'MongoDB & Databases',
    icon: <Database className="w-5 h-5 text-amber-500" />,
    questions: [
      {
        q: 'What is database indexing and when does it slow down operations?',
        a: 'Indices build structured lookup B-trees allowing search queries to skip complete document scanning. However, indexes slow down write operations (INSERT, UPDATE, DELETE) because the index tree itself must be compiled and updated.'
      },
      {
        q: 'Explain the MongoDB Aggregation Pipeline.',
        a: 'It is a multi-stage framework for data processing where document sets pass through serial filter stages (e.g. $match, $group, $sort, $project) to output grouped metrics in a single database query execution.'
      }
    ]
  },
  systemDesign: {
    title: 'System Design',
    icon: <Layers className="w-5 h-5 text-indigo-400" />,
    questions: [
      {
        q: 'How do CDNs and Edge servers optimize content delivery?',
        a: 'CDNs (Content Delivery Networks) store static assets in geographically distributed proxy servers close to users, cutting down network trip delay times and decreasing load on origin application servers.'
      },
      {
        q: 'Explain Rate Limiting and the Token Bucket algorithm.',
        a: 'Rate limiting controls API traffic frequency. The token bucket algorithm fills a bucket with tokens at a constant rate. Each API call consumes a token; if empty, the request is rejected (429 Too Many Requests).'
      }
    ]
  },
  hr: {
    title: 'HR & Behavior',
    icon: <HeartHandshake className="w-5 h-5 text-rose-400" />,
    questions: [
      {
        q: 'Walk me through a conflict scenario using the STAR framework.',
        a: 'Answer structure: (S)ituation: Name the project scope and team mismatch; (T)ask: Identify what needed to get done; (A)ction: Explain how you set up a collaborative technical trade-off review; (R)esult: Cite measurable project delivery parameters.'
      },
      {
        q: 'How do you answer "What is your greatest weakness?"',
        a: 'Choose a real skill area you have developed (e.g., getting too deep into debugging initially, or container layouts). Explain your previous gap and show the active steps you took to correct it (e.g. studying Docker or adopting checklist timers).'
      }
    ]
  }
};

export default function LearningPage() {
  const { 
    learningRoadmap, 
    completeRoadmapTopic,
    fetchUser,
    addXp,
    xp
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'roadmap' | 'bank'>('roadmap');
  const [bankCategory, setBankCategory] = useState<keyof typeof QUESTION_BANK>('react');
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const toggleQuestion = (qKey: string) => {
    setOpenQuestions(prev => ({
      ...prev,
      [qKey]: !prev[qKey]
    }));
  };

  const handleToggleTopic = async (topicId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    
    // Call store action
    await completeRoadmapTopic(topicId, nextStatus);
    
    if (nextStatus === 'done') {
      // Award XP
      await addXp(50);
      alert('Module completed! +50 XP awarded.');
    } else {
      // Deduct XP
      await addXp(-50);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-5 gap-4">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-tight">
            Learning Hub
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Access study curriculum generated from your resume scan and study interview prep sheets.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Study Roadmap
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Question Bank
          </button>
        </div>
      </header>

      {/* Content panes */}
      {activeTab === 'roadmap' ? (
        <div className="space-y-6">
          {learningRoadmap.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center text-slate-500 font-medium space-y-3 max-w-2xl mx-auto">
              <BookMarked className="w-10 h-10 text-slate-700 mx-auto" />
              <div>
                <h3 className="text-slate-300 font-outfit font-bold text-base">Roadmap Not Configured</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[320px] mx-auto">
                  Scan your PDF credentials in the Resume Intelligence page to generate a personalized practice track.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningRoadmap.map((topic, idx) => {
                const isCompleted = topic.status === 'done';
                return (
                  <div 
                    key={topic._id || idx}
                    className={`glass-panel rounded-2xl p-6 flex flex-col justify-between transition-all border ${
                      isCompleted ? 'border-emerald-500/20 bg-emerald-500/2' : 'border-white/5'
                    }`}
                  >
                    <div>
                      {/* Badge Header */}
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                          topic.difficulty === 'Easy' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : topic.difficulty === 'Medium'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                        }`}>
                          {topic.difficulty}
                        </span>
                        
                        <button
                          onClick={() => handleToggleTopic(topic._id!, topic.status)}
                          className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-indigo-400" />
                          )}
                        </button>
                      </div>

                      <h3 className="font-outfit font-bold text-base text-slate-100">{topic.topic}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mt-2">{topic.description}</p>
                    </div>

                    {/* Resources */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                        Resources
                      </span>
                      <div className="space-y-2 mt-2">
                        {topic.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium group"
                          >
                            <span>{res.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Category pills */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-4">
            <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase px-4 py-2 border-b border-white/5 mb-2">
              Topic Directories
            </h2>
            <div className="flex flex-col gap-1">
              {Object.entries(QUESTION_BANK).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setBankCategory(key as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                    bankCategory === key
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cat.icon}
                    <span>{cat.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full">
                    {cat.questions.length} Qs
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Question items */}
          <div className="lg:col-span-8 space-y-4">
            {QUESTION_BANK[bankCategory].questions.map((item, idx) => {
              const qKey = `${bankCategory}-${idx}`;
              const isOpen = !!openQuestions[qKey];
              return (
                <div key={idx} className="glass-panel rounded-2xl p-5 space-y-3">
                  <div 
                    onClick={() => toggleQuestion(qKey)}
                    className="flex justify-between items-start gap-4 cursor-pointer group"
                  >
                    <div className="flex gap-2.5 items-start">
                      <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <h3 className="font-semibold text-sm text-slate-200 group-hover:text-slate-100 transition-colors leading-relaxed">
                        {item.q}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 shrink-0 mt-1 uppercase tracking-wide group-hover:text-indigo-300">
                      {isOpen ? 'Close' : 'Review Answer'}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="pl-7 pt-2 border-t border-white/5 animate-slide-in">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                        Model Answer Guide
                      </span>
                      <p className="text-slate-400 text-xs leading-relaxed mt-1.5">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
