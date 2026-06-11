import mongoose, { Schema, Document } from 'mongoose';

export interface IDimensionScores {
  technical: number;
  communication: number;
  confidence: number;
  problemSolving: number;
  behavioral: number;
}

export interface IQuestionResponse {
  questionText: string;
  userAnswer: string;
  feedback: string;
  score: number;
  modelAnswer: string;
  isFollowUp: boolean;
  followUpContext?: string;
  dimensions: IDimensionScores;
}

export interface IScorecard {
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

export interface IVideoAnalytics {
  speakingPace: number; // in words per minute
  eyeContactScore: number; // 0-100
  smileCount: number;
  confidenceScore: number; // 0-100
}

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  level: string; // Junior, Mid, Senior, Lead
  mode: 'technical' | 'behavioral' | 'hr';
  personality: 'strict' | 'coach' | 'hr';
  submittedCode?: string;
  jobDescription?: string;
  questionCount: number;
  status: 'pending' | 'completed';
  questions: IQuestionResponse[];
  scorecard: IScorecard;
  videoAnalytics: IVideoAnalytics;
  createdAt: Date;
}
// ... interface ends, schemas define next
const DimensionScoresSchema = new Schema<IDimensionScores>({
  technical: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  problemSolving: { type: Number, default: 0 },
  behavioral: { type: Number, default: 0 }
});

const QuestionResponseSchema = new Schema<IQuestionResponse>({
  questionText: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  feedback: { type: String, default: '' },
  score: { type: Number, default: 0 },
  modelAnswer: { type: String, default: '' },
  isFollowUp: { type: Boolean, default: false },
  followUpContext: { type: String, default: '' },
  dimensions: { type: DimensionScoresSchema, default: () => ({}) }
});

const VideoAnalyticsSchema = new Schema<IVideoAnalytics>({
  speakingPace: { type: Number, default: 120 },
  eyeContactScore: { type: Number, default: 0 },
  smileCount: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0 }
});

const InterviewSchema = new Schema<IInterview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  level: { type: String, required: true },
  mode: { type: String, enum: ['technical', 'behavioral', 'hr'], default: 'technical' },
  personality: { type: String, enum: ['strict', 'coach', 'hr'], default: 'strict' },
  submittedCode: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  questionCount: { type: Number, default: 5 },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  questions: [QuestionResponseSchema],
  scorecard: {
    overall: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    keyStrengths: { type: [String], default: [] },
    keyImprovements: { type: [String], default: [] }
  },
  videoAnalytics: { type: VideoAnalyticsSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now }
});

const Interview = mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview;
