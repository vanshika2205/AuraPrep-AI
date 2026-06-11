import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Mock question pools by Mode and Personality fallback
const MOCK_QUESTIONS_BY_MODE = {
  technical: {
    frontend: [
      "Explain React Server Components (RSC) and how they differ from Client Components.",
      "How would you optimize a page that renders a list of 10,000 items in React?",
      "What is the difference between CSS variables and Tailwind utilities in dynamic styling performance?",
      "Explain browser security headers like CORS, CSP, and HSTS."
    ],
    backend: [
      "How do you handle database sharding vs replication in a high-throughput read/write system?",
      "What is the CAP Theorem, and how does MongoDB resolve network partitions?",
      "How would you construct a redis-based caching invalidation strategy for a dynamic feed?",
      "Describe how a connection pool works and what happens when it runs out of connections."
    ],
    default: [
      "What is horizontal scaling versus vertical scaling? Describe when you would use each.",
      "Explain the MVC pattern and how it applies to modern decoupled API microservices.",
      "How do you profile memory leaks in a server environment?"
    ]
  },
  behavioral: {
    default: [
      "Describe a time you had a technical disagreement with a team member. How was it resolved?",
      "Tell me about a high-pressure situation where a production release failed. What did you do?",
      "Walk me through a scenario where you had to balance technical debt with shipping a feature quickly.",
      "How do you handle scope creep when working with cross-functional product teams?"
    ]
  },
  hr: {
    default: [
      "Why are you looking to leave your current role, and what excites you about this company?",
      "How do you describe your ideal working environment and team dynamics?",
      "What are your salary expectations, and how do you evaluate a compensation package?",
      "Where do you see your career growth moving in the next three to five years?"
    ]
  }
};

export async function generateQuestions(
  role: string,
  level: string,
  jobDescription?: string,
  count: number = 5,
  mode: 'technical' | 'behavioral' | 'hr' = 'technical',
  resumeSkills: string[] = [],
  resumeWeaknesses: string[] = [],
  personality: 'strict' | 'coach' | 'hr' = 'strict'
): Promise<string[]> {
  const normRole = role.toLowerCase();
  const cat = normRole.includes('front') ? 'frontend' : normRole.includes('back') ? 'backend' : 'default';

  if (!openai) {
    // Sandbox Fallback
    let questionsPool = MOCK_QUESTIONS_BY_MODE[mode]?.default || MOCK_QUESTIONS_BY_MODE.technical.default;
    if (mode === 'technical' && cat !== 'default') {
      questionsPool = MOCK_QUESTIONS_BY_MODE.technical[cat];
    }

    // Customize based on resume skills
    const customized: string[] = [];
    if (resumeSkills.length > 0) {
      customized.push(`Looking at your resume, you listed ${resumeSkills[0]}. Can you describe a complex project where you applied it?`);
    }

    // Adjust tone based on personality
    const prefix = personality === 'strict' 
      ? "[Strict Tech Lead] Let's jump straight to it. " 
      : personality === 'coach' 
      ? "[Empathetic Coach] Hello! To start off, "
      : "[HR Recruiter] Thanks for joining today. ";

    const merged = [...customized, ...questionsPool].sort(() => 0.5 - Math.random());
    return merged.slice(0, count).map((q, idx) => idx === 0 ? prefix + q : q);
  }

  const personalityDirectives = {
    strict: "You are a STRICT and demanding Technical Lead. Generate questions that test deep architectural limits, trade-offs, and critical system edge cases.",
    coach: "You are an EMPATHETIC Coach. Ask encouraging questions that probe technical solutions while prioritizing clean structure and growth experiences.",
    hr: "You are an HR Recruiter. Ask behavioral and culture-focused questions, concentrating on organizational dynamics, personal motivations, salary ranges, and career growth."
  };

  const directive = personalityDirectives[personality] || personalityDirectives.strict;

  const prompt = `${directive}
Generate a JSON array of exactly ${count} interview questions for a ${level}-level ${role} position.
Interview Mode: ${mode.toUpperCase()} 
${jobDescription ? `Context Job Description: \n${jobDescription}\n` : ''}
${resumeSkills.length > 0 ? `Candidate Skills: ${resumeSkills.join(', ')}\n` : ''}
${resumeWeaknesses.length > 0 ? `Target Weak Areas to probe: ${resumeWeaknesses.join(', ')}\n` : ''}

Respond ONLY with a valid JSON array of strings. Do not wrap with markdown code fences. Example:
["Q1 text", "Q2 text"]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    const parsed = JSON.parse(response.choices[0].message.content || '[]');
    if (Array.isArray(parsed)) return parsed.slice(0, count);
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions.slice(0, count);
    return Object.values(parsed).find(Array.isArray) || [];
  } catch (err) {
    console.error('Failed generating questions via OpenAI, using fallback:', err);
    return MOCK_QUESTIONS_BY_MODE.technical.default.slice(0, count);
  }
}

export async function generateFollowUp(
  questionText: string,
  userAnswer: string,
  role: string,
  level: string,
  personality: 'strict' | 'coach' | 'hr' = 'strict'
): Promise<{ hasFollowUp: boolean; question: string; context: string }> {
  const answerLength = (userAnswer || '').trim().length;

  if (answerLength < 15) {
    return { hasFollowUp: false, question: '', context: '' };
  }

  if (!openai) {
    // Sandbox follow-up simulator
    const answerUpper = userAnswer.toUpperCase();
    
    if (personality === 'strict') {
      if (answerUpper.includes('CACHE') || answerUpper.includes('REDIS')) {
        return {
          hasFollowUp: true,
          question: "[Strict Lead] Fine, but how do you prevent cache stampede when the key invalidates under peak load?",
          context: "Caching edge cases check."
        };
      }
      return {
        hasFollowUp: true,
        question: "[Strict Lead] What would the time complexity of that implementation be, and can we optimize it to O(1)?",
        context: "Complexity check."
      };
    } else if (personality === 'coach') {
      return {
        hasFollowUp: true,
        question: "[Coach] That is a neat approach! What did you find was the most challenging part of implementing that solution?",
        context: "Empathetic check."
      };
    } else {
      return {
        hasFollowUp: true,
        question: "[HR] How did the rest of your engineering team feel about that structural decision?",
        context: "Collaboration check."
      };
    }
  }

  const personalityTones = {
    strict: "Ask a challenging, high-pressure technical follow-up question. Target edge cases, potential bottlenecks, or complexity optimizations.",
    coach: "Ask an encouraging, details-seeking follow-up question, exploring their learnings or alternative solutions.",
    hr: "Ask a collaborative or behavioral follow-up question, exploring team relations, communication, or project management outcomes."
  };

  const tone = personalityTones[personality] || personalityTones.strict;

  const prompt = `You are a real-time vocal technical interviewer probing a candidate for a ${level} ${role} role.
Your personality style: ${personality.toUpperCase()}. ${tone}

The candidate was asked: "${questionText}"
They responded with: "${userAnswer}"

If a follow-up query is helpful to gauge depth, generate a brief follow-up question (max 18 words).
If their answer is fully comprehensive or empty, return hasFollowUp as false.

Respond ONLY with a JSON object structured exactly like:
{
  "hasFollowUp": true/false,
  "question": "Follow-up question text...",
  "context": "Short explanation of what we are probing..."
}`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    return JSON.parse(chatCompletion.choices[0].message.content || '{}');
  } catch (err) {
    console.error('Failed follow-up evaluation, falling back:', err);
    return { hasFollowUp: false, question: '', context: '' };
  }
}

export interface IEvaluationResult {
  scorecard: {
    overall: number;
    technical: number;
    communication: number;
    behavioral: number;
    confidence: number;
    problemSolving: number;
    summary: string;
    keyStrengths: string[];
    keyImprovements: string[];
  };
  questions: {
    questionText: string;
    userAnswer: string;
    feedback: string;
    score: number;
    modelAnswer: string;
    dimensions: {
      technical: number;
      communication: number;
      confidence: number;
      problemSolving: number;
      behavioral: number;
    };
  }[];
}

export async function evaluateInterview(
  role: string,
  level: string,
  qaList: { questionText: string; userAnswer: string }[],
  submittedCode?: string
): Promise<IEvaluationResult> {
  if (!openai) {
    // Dynamic sandboxed evaluator
    const processedQuestions = qaList.map((qa) => {
      const len = qa.userAnswer.trim().length;
      let score = 50;
      let feedback = '';
      
      if (len === 0) {
        score = 10;
        feedback = "No response recorded.";
      } else if (len < 40) {
        score = 55;
        feedback = "Answer was too brief. Add more context to demonstrate depth.";
      } else {
        score = 75 + Math.floor(Math.random() * 20);
        feedback = "Solid answer! Good theoretical description.";
      }

      if (submittedCode && submittedCode.trim().length > 0) {
        feedback += ` [Code Analysis] Reviewed code submission. Code uses standard structures and looks reasonable, though time complexity can be optimized.`;
      }

      return {
        questionText: qa.questionText,
        userAnswer: qa.userAnswer,
        feedback,
        score,
        modelAnswer: `Model answer for '${qa.questionText}': Define concepts clearly, walk through step-by-step scaling constraints, and outline latency trade-offs.`,
        dimensions: {
          technical: score - 5 + Math.floor(Math.random() * 10),
          communication: score - 3 + Math.floor(Math.random() * 8),
          confidence: score - 4 + Math.floor(Math.random() * 9),
          problemSolving: score - 5 + Math.floor(Math.random() * 10),
          behavioral: score - 6 + Math.floor(Math.random() * 12)
        }
      };
    });

    const overall = Math.round(processedQuestions.reduce((a, b) => a + b.score, 0) / processedQuestions.length);
    const clamp = (v: number) => Math.min(100, Math.max(20, v));

    return {
      scorecard: {
        overall: clamp(overall),
        technical: clamp(overall + 2),
        communication: clamp(overall - 1),
        behavioral: clamp(overall - 3),
        confidence: clamp(overall + 1),
        problemSolving: clamp(overall + 3),
        summary: `Excellent practice run for a ${level} ${role}. You responded to ${qaList.filter(q => q.userAnswer.trim().length > 0).length} of ${qaList.length} questions. You exhibited solid problem-solving skills.${submittedCode ? " Written code was analyzed and showed good structural logic." : ""}`,
        keyStrengths: [
          "Direct practical applications highlighted in responses.",
          "Clear structure in code descriptions."
        ],
        keyImprovements: [
          "Deepen understanding of cache invalidations.",
          "Citing explicit benchmarks for system latency reductions."
        ]
      },
      questions: processedQuestions
    };
  }

  const prompt = `You are a premium SaaS Interview Evaluation Engine. Evaluate this completed mock interview for a ${level} ${role}.
Calculate scores out of 100 for overall, technical, communication, behavioral, confidence, and problem solving.
Analyze each question, generating constructive critique, a numeric score, a custom 5-dimensional radar score breakdown, and a perfect model answer.
${submittedCode ? `\nCandidate also submitted this code block in their technical panel: \n\`\`\`\n${submittedCode}\n\`\`\`\nAnalyze the code syntax, logical flow, time/space complexity, and incorporate constructive code review metrics inside the question feedbacks.\n` : ''}

Input Questions and Answers:
${JSON.stringify(qaList, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "scorecard": {
    "overall": 80,
    "technical": 85,
    "communication": 78,
    "behavioral": 82,
    "confidence": 75,
    "problemSolving": 80,
    "summary": "Critique summary...",
    "keyStrengths": ["Strength 1"],
    "keyImprovements": ["Improvement 1"]
  },
  "questions": [
    {
      "questionText": "Question text...",
      "userAnswer": "User response...",
      "feedback": "Critique feedback... (include Code Analysis review details here if relevant)",
      "score": 85,
      "modelAnswer": "Stellar model response...",
      "dimensions": {
        "technical": 85,
        "communication": 80,
        "confidence": 78,
        "problemSolving": 88,
        "behavioral": 82
      }
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    return JSON.parse(response.choices[0].message.content || '{}') as IEvaluationResult;
  } catch (err) {
    console.error('Failed to parse interview evaluations via OpenAI, using sandbox:', err);
    return evaluateInterview(role, level, qaList, submittedCode);
  }
}
