export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest: string;
  created_at: string;
}

export interface LearningStyle {
  id: string;
  user_id: string;
  style: 'story' | 'visual' | 'step-by-step' | 'humor' | 'real-world';
  created_at: string;
}

export interface ExplanationData {
  simple: string;
  analogy: string;
  stepByStep: string[];
  visualModel: string;
  deeperDive: string;
  realWorld: string[];
  practiceQuestions: string[];
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Explanation {
  id: string;
  user_id: string;
  topic: string;
  explanation_data: ExplanationData;
  created_at: string;
}

export interface FollowUp {
  id: string;
  user_id: string;
  explanation_id?: string;
  question: string;
  answer: {
    content: string;
  };
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  image_url: string;
  extracted_text?: string;
  processed: boolean;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_explanations: number;
  current_streak: number;
  longest_streak: number;
  total_stars: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export const BADGE_TYPES = {
  FIRST_EXPLANATION: 'First Explanation',
  WEEK_STREAK: '7-Day Streak',
  MONTH_STREAK: '30-Day Streak',
  TEN_EXPLANATIONS: '10 Topics Mastered',
  FIFTY_EXPLANATIONS: '50 Topics Mastered',
  PERFECT_QUIZ: 'Quiz Master',
  CURIOUS_LEARNER: 'Curious Learner',
  SCAN_MASTER: 'Scan Master',
} as const;

export const LEARNING_STYLE_OPTIONS = [
  { value: 'story', label: 'Story-based', description: 'Learn through narratives and stories' },
  { value: 'visual', label: 'Visual', description: 'Learn with diagrams and visual models' },
  { value: 'step-by-step', label: 'Step-by-step', description: 'Break it down into clear steps' },
  { value: 'humor', label: 'Humor', description: 'Learn with fun and playful examples' },
  { value: 'real-world', label: 'Real-world', description: 'Connect to practical applications' },
] as const;

export const POPULAR_INTERESTS = [
  'Football',
  'Basketball',
  'Gaming',
  'Anime',
  'Cooking',
  'Music',
  'Art',
  'Movies',
  'Science',
  'Technology',
  'Fashion',
  'Travel',
  'Photography',
  'Reading',
  'Fitness',
] as const;
