'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  Sparkles, 
  Terminal, 
  Users, 
  HeartHandshake, 
  Zap, 
  Check, 
  ChevronDown, 
  Play, 
  ShieldCheck, 
  BarChart3, 
  Code2, 
  Speech,
  Video,
  FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Pricing calculations
  const plans = [
    {
      name: 'Free Starter',
      desc: 'Test your skills with basic AI coaching sessions.',
      price: 0,
      features: [
        '5 mock interviews per month',
        'Standard AI Personality (Strict)',
        'Technical & Behavioral modes',
        'Basic scorecard metrics feedback',
        'Webcam eye tracking HUD overlay'
      ],
      cta: 'Start Free Practice',
      link: '/register',
      popular: false
    },
    {
      name: 'Pro Member',
      desc: 'Accelerate prep with deep reviews and resume intelligent queries.',
      price: isAnnual ? 19 : 29,
      features: [
        '25 mock interviews per month',
        'All AI Personalities (Strict, Coach, HR)',
        'Voice AI dynamic follow-up questions',
        'Resume upload parsing & gap roadmap',
        'Interactive code sandbox evaluator',
        'Priority AI response generation'
      ],
      cta: 'Upgrade to Pro',
      link: '/register',
      popular: true
    },
    {
      name: 'Enterprise Tier',
      desc: 'Customized pipelines for bootcamps and team scale assessments.',
      price: isAnnual ? 79 : 99,
      features: [
        'Unlimited mock interviews',
        'All mock modes + custom roles',
        'Full review dashboard & history export',
        'Custom team job description targeting',
        'API keys & bulk resume analysis uploads',
        '24/7 Priority support channel'
      ],
      cta: 'Contact Enterprise',
      link: '/register',
      popular: false
    }
  ];

  // FAQ contents
  const faqs = [
    {
      q: 'How does the Voice AI interviewer work?',
      a: 'The AI uses real-time Web Speech Synthesis to vocalize questions dynamically based on your background. It listens to your verbal replies via Speech Recognition and analyzes tone, pacing, and correctness.'
    },
    {
      q: 'Can it evaluate coding tasks in technical mode?',
      a: 'Yes! Inside technical interviews, you can toggle the Dual-Pane view to open a workspace where you can write code. The AI audits your code alongside your verbal explanation for structural correctness and efficiency.'
    },
    {
      q: 'How is the resume parsing done securely?',
      a: 'Resumes are parsed inside safe serverless runtime buffers. The text extraction identifies skills and weaknesses, automatically building your customizable study roadmap.'
    },
    {
      q: 'Can I cancel or upgrade my plan anytime?',
      a: 'Yes, absolutely. You can manage your billing tier directly inside the Settings tab and adjust subscriptions with instant account credit scaling.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Glow Rings */}
      <div className="absolute top-[-20%] left-[10%] w-[80vw] h-[80vw] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Navigation header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-outfit font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              AuraPrep AI
            </span>
            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Interview Simulator</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isAuthenticated ? 'Dashboard' : 'Log In'}
          </button>
          {!isAuthenticated && (
            <button 
              onClick={() => router.push('/register')}
              className="px-4.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 active:translate-y-[1px] transition-all cursor-pointer"
            >
              Sign Up Free
            </button>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-20 pb-16 text-center z-10 relative space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Production-grade AI Interview Coach
        </div>
        
        <h1 className="font-outfit font-extrabold text-4xl sm:text-6xl md:text-7xl bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight leading-[1.15]">
          Simulate High-Stakes Mocks.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Get Hired Instantly.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
          Upload your resume to generate hyper-tailored coding & system design mocks. Practice with real-time dynamic Voice AI, eye-tracking calibrations, and detailed complexity scorecards.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold font-outfit text-sm shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Practice Free</span>
            <Zap className="w-4 h-4 fill-white" />
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('pricing');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-white/5 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>View Pricing Plans</span>
          </button>
        </div>

        {/* Mock representation of the visual app workspace */}
        <div className="pt-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl pointer-events-none"></div>
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-white/5 shadow-[inset_0_1px_12px_rgba(255,255,255,0.05)]">
              {/* Fake top window bar */}
              <div className="bg-slate-900/80 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/75"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/75"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/75"></div>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  🔴 AI SIMULATOR ACTIVE
                </div>
                <div className="w-10"></div>
              </div>
              
              {/* Fake main content layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 h-[340px] text-left">
                {/* Visual Camera Feed */}
                <div className="md:col-span-4 border-r border-white/5 p-4 bg-slate-900/20 flex flex-col justify-between relative">
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[8px] font-bold text-emerald-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    CALIBRATED
                  </div>
                  
                  {/* Eyeball target */}
                  <div className="w-full aspect-video rounded-lg border border-white/5 bg-slate-950 flex items-center justify-center relative overflow-hidden mt-4">
                    <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center animate-pulse">
                      <div className="w-6 h-6 rounded-full border border-indigo-500/60 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 left-2 text-[8px] font-semibold text-slate-500 uppercase">Webcam Stream</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-white/5 pt-3">
                      <span>Eye Contact score</span>
                      <span className="text-emerald-400 font-bold">92%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>Speaking Speed</span>
                      <span className="text-slate-300 font-bold">120 WPM</span>
                    </div>
                  </div>
                </div>

                {/* AI Dialogue Feed */}
                <div className="md:col-span-8 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">AI</div>
                      <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-200 leading-relaxed font-medium">
                        &quot;Your schema supports indexing, but can you explain when database partitioning or sharding is preferred over simple index lookups?&quot;
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed font-medium">
                        &quot;Sharding partitions write load across multiple databases horizontally, whereas indexing only speeds up reads on a single server node...&quot;
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400">YOU</div>
                    </div>
                  </div>

                  {/* Audio Wave Visualizer mock */}
                  <div className="flex items-center gap-1 px-4 py-3 bg-slate-900/40 border border-white/5 rounded-xl">
                    <Speech className="w-4.5 h-4.5 text-indigo-400 animate-bounce" />
                    <div className="flex items-center gap-0.5 flex-1 px-3">
                      <div className="h-4 w-1 bg-indigo-500/80 rounded animate-pulse"></div>
                      <div className="h-8 w-1 bg-indigo-500/80 rounded animate-pulse [animation-delay:0.2s]"></div>
                      <div className="h-6 w-1 bg-indigo-500/80 rounded animate-pulse [animation-delay:0.4s]"></div>
                      <div className="h-2 w-1 bg-indigo-500/80 rounded animate-pulse"></div>
                      <div className="h-9 w-1 bg-indigo-500/80 rounded animate-pulse [animation-delay:0.1s]"></div>
                      <div className="h-5 w-1 bg-indigo-500/80 rounded animate-pulse [animation-delay:0.3s]"></div>
                      <div className="h-2 w-1 bg-indigo-500/80 rounded animate-pulse"></div>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-bold animate-pulse">LISTENING...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 z-10 relative space-y-16 border-t border-white/5 mt-10">
        <div className="text-center space-y-3">
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white">
            Engineered for elite developer performance.
          </h2>
          <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto">
            We built our features directly to mimic actual interview boards like Stripe, Vercel, Meta, and Linear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Speech className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-slate-100">Real-Time Voice AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Vocalize responses with native voice synthesizer integration. AI responds immediately using custom pitch, speed, and follow-up adjustments.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-purple-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-slate-100">Dynamic Code Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Toggle to code sandbox split-panes in technical modes. Write Javascript, Python, or TypeScript syntax, evaluated by AI for space and time complexities.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-cyan-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-slate-100">Resume intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Upload PDF resumes to extract skills automatically. AuraPrep creates personalized learning check roadmaps to patch your technical weaknesses.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-indigo-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-slate-100">Simulated Eye Tracking HUD</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Maintain professional posture with alignment targets. Pulsing warnings help keep steady camera contact and control fast speaking rates.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-purple-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-slate-100">Detailed Scorecard Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Audit results with multi-dimensional Recharts radar graphs covering technical competency, STAR storytelling, speaking speed, and confidence.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-cyan-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-slate-100">Gamified Streaks & Badges</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Earn XP points, unlock performance ranks, and claim digital milestone badges for consistent daily practice streaks.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="w-full max-w-7xl mx-auto px-6 py-24 z-10 relative space-y-16 border-t border-white/5">
        <div className="text-center space-y-6">
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-white">
            Choose your preparation velocity.
          </h2>
          
          {/* Monthly/Annual Toggle selector */}
          <div className="inline-flex items-center bg-slate-900 border border-white/5 rounded-2xl p-1 shadow-inner">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${!isAnnual ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Monthly billing
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isAnnual ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>Annual billing</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold lowercase">
                save 30%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[500px] hover:border-white/10 transition-all ${
                plan.popular ? 'border-indigo-500/40 ring-1 ring-indigo-500/30 shadow-2xl shadow-indigo-500/5' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[9px] font-bold tracking-wider text-indigo-400 uppercase">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-outfit font-bold text-xl text-slate-100">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1.5 py-4 border-y border-white/5">
                  <span className="font-outfit font-extrabold text-4xl text-white">${plan.price}</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">/ month</span>
                </div>

                <ul className="space-y-3.5 pl-0 list-none">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => router.push(plan.link)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mt-8 cursor-pointer ${
                  plan.popular 
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-white/5'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full max-w-4xl mx-auto px-6 py-24 z-10 relative space-y-16 border-t border-white/5">
        <div className="text-center space-y-3">
          <h2 className="font-outfit font-extrabold text-3xl text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Everything you need to know about the AuraPrep AI Simulator system.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index}
                className="rounded-2xl border border-white/5 bg-slate-900/30 overflow-hidden backdrop-blur"
              >
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between font-semibold text-sm text-slate-200 hover:text-white text-left focus:outline-none transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed font-medium animate-slide-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 z-10 relative border-t border-white/5 text-center flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AuraPrep AI © 2026. Made with ❤️ for developers.</span>
        </div>
        <div className="flex items-center justify-center gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Developer Portal</a>
          <a href="#" className="hover:text-slate-300 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
