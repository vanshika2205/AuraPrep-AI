import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import OpenAI from 'openai';

import { getAuthenticatedUser } from '@/lib/auth';


const apiKey = process.env.OPENAI_API_KEY || '';
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Fallback keyword analyzer for sandbox mode
function analyzeTextKeywords(text: string) {
  const commonSkills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB',
    'SQL', 'PostgreSQL', 'Python', 'Django', 'Docker', 'Kubernetes',
    'AWS', 'Next.js', 'Vue', 'Angular', 'Java', 'Spring', 'C++', 'Go',
    'System Design', 'Git', 'Redux', 'GraphQL', 'TailwindCSS'
  ];

  const foundSkills: string[] = [];
  const textUpper = text.toUpperCase();

  commonSkills.forEach(skill => {
    if (textUpper.includes(skill.toUpperCase())) {
      foundSkills.push(skill);
    }
  });

  // Default skills if none matched
  if (foundSkills.length === 0) {
    foundSkills.push('JavaScript', 'React', 'HTML/CSS', 'Git');
  }

  // Determine weak areas based on what is missing
  const weaknesses: string[] = [];
  if (!foundSkills.includes('System Design')) {
    weaknesses.push('High-Level System Architecture and scalability concepts');
  }
  if (!foundSkills.includes('Docker') && !foundSkills.includes('Kubernetes')) {
    weaknesses.push('Containerization and deployment pipelines (Docker/CI-CD)');
  }
  if (!foundSkills.includes('TypeScript')) {
    weaknesses.push('Static type systems and robust runtime compile checking');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Advanced caching layers and database profiling methods');
  }

  // Custom roadmap matching the weaknesses
  const roadmap = weaknesses.map((weakness, idx) => {
    let topicName = 'Technical Scaling';
    let resources = [{ title: 'Developer Guide', url: 'https://developer.mozilla.org' }];
    let desc = `Expand proficiency in ${weakness.toLowerCase()}.`;

    if (weakness.includes('System')) {
      topicName = 'System Design Scaling';
      desc = 'Understand sharding, CDNs, load balancers, rate limiting, and CAP Theorem implementations.';
      resources = [
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }
      ];
    } else if (weakness.includes('Container')) {
      topicName = 'DevOps & Containers';
      desc = 'Learn Docker configs, container networking, environment variables, and basic CI/CD GitHub workflows.';
      resources = [
        { title: 'Docker Official Getting Started', url: 'https://docs.docker.com/get-started/' }
      ];
    } else if (weakness.includes('Static')) {
      topicName = 'TypeScript Masterclass';
      desc = 'Learn utility types, generics, interfaces vs types, and compiler optimizations.';
      resources = [
        { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' }
      ];
    }

    return {
      topic: topicName,
      difficulty: idx === 0 ? 'Medium' : 'Hard',
      description: desc,
      status: 'todo' as const,
      resources
    };
  });

  return {
    skills: foundSkills.slice(0, 8),
    weaknesses,
    roadmap
  };
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require('pdf-parse');
    await dbConnect();
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No resume file uploaded.' }, { status: 400 });
    }

    const dataBuffer = Buffer.from(await file.arrayBuffer());
    let pdfText = '';
    
    try {
      const parsedPdf = await pdf(dataBuffer);
      pdfText = parsedPdf.text || '';
    } catch (pdfErr: any) {
      console.error('Error parsing PDF binary:', pdfErr);
      // Fallback text if parsing fails (for sandbox uploads of non-pdf files)
      pdfText = `Failed parsing file ${file.name}. Standard developer stack details: React, JavaScript, Node.js.`;
    }

    let result = {
      skills: ['React', 'JavaScript', 'Node.js', 'Git'],
      weaknesses: ['Advanced System Design', 'DevOps container setups'],
      roadmap: [
        {
          topic: 'System Design Basics',
          difficulty: 'Medium',
          description: 'Learn CDN caching, Database sharding, load balancers, and CAP Theorem.',
          status: 'todo' as const,
          resources: [{ title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }]
        }
      ]
    };

    if (openai && pdfText.trim().length > 10) {
      const prompt = `You are a specialized Resume Intelligence Agent. Analyze the following candidate resume text:
"${pdfText}"

Identify:
1. Core technical skills (max 8 items)
2. 2-3 weak areas or skill gaps for web developers
3. A personalized 3-step study roadmap.

Respond ONLY with a valid JSON object matching this format:
{
  "skills": ["React", "CSS"],
  "weaknesses": ["System Design"],
  "roadmap": [
    {
      "topic": "Topic Name",
      "difficulty": "Easy/Medium/Hard",
      "description": "Short description of what to focus on...",
      "resources": [
        { "title": "Resource Website", "url": "https://example.com" }
      ]
    }
  ]
}`;

      try {
        const chatCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });
        const parsedData = JSON.parse(chatCompletion.choices[0].message.content || '{}');
        if (parsedData.skills && parsedData.weaknesses && parsedData.roadmap) {
          result = {
            skills: parsedData.skills,
            weaknesses: parsedData.weaknesses,
            roadmap: parsedData.roadmap.map((r: any) => ({ ...r, status: 'todo' }))
          };
        }
      } catch (openAiErr) {
        console.error('OpenAI analysis failed, falling back to local analysis:', openAiErr);
        result = analyzeTextKeywords(pdfText);
      }
    } else {
      // Sandboxed local analysis
      result = analyzeTextKeywords(pdfText);
    }

    // Update candidate record in DB

    user.resumeText = pdfText.substring(0, 10000); // Truncate to save db space
    user.resumeSkills = result.skills;
    user.resumeWeaknesses = result.weaknesses;
    user.learningRoadmap = result.roadmap;
    user.xp += 100; // Reward uploading resume!
    
    // Unlock a badge for uploading resume
    const badgeNames = user.badges.map((b: any) => b.name);
    if (!badgeNames.includes('Profile Completed')) {
      user.badges.push({ name: 'Profile Completed', icon: '📝', dateUnlocked: new Date() });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        skills: user.resumeSkills,
        weaknesses: user.resumeWeaknesses,
        roadmap: user.learningRoadmap,
        xp: user.xp,
        badges: user.badges
      }
    });
  } catch (error: any) {
    console.error('Resume upload endpoint crash:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
