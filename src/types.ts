export type IndustryType =
  | 'IT / Engineering'
  | 'Data / AI'
  | 'Marketing'
  | 'Finance'
  | 'Consulting'
  | 'Design'
  | 'General';

export type StudentLevel =
  | 'Học sinh THPT'
  | 'Học viên trung cấp'
  | 'Sinh viên cao đẳng'
  | 'Sinh viên đại học';

export type JobLevel = 'Intern' | 'Fresher' | 'Junior' | 'Middle' | 'Senior';

export type AppTab =
  | 'dashboard'
  | 'self-discovery'
  | 'career-explore'
  | 'competency-profile'
  | 'cv-builder'
  | 'internship-jobs'
  | 'interview-practice'
  | 'career-roadmap';

export type CVTemplateCategory =
  | 'student'
  | 'internship'
  | 'professional'
  | 'tech'
  | 'creative'
  | 'ats';

export type CVTemplateId =
  // A. HỌC SINH – SINH VIÊN
  | 'student-starter'
  | 'student-academic'
  | 'student-activity'
  | 'student-modern'
  // B. THỰC TẬP
  | 'intern-basic'
  | 'intern-tech'
  | 'intern-business'
  | 'intern-creative'
  // C. CHUYÊN NGHIỆP
  | 'pro-elegant'
  | 'pro-modern'
  | 'pro-minimalist'
  | 'pro-executive'
  // D. CÔNG NGHỆ – KỸ THUẬT
  | 'tech-developer'
  | 'tech-technician'
  | 'tech-engineer'
  | 'tech-project'
  // E. SÁNG TẠO
  | 'creative-design'
  | 'creative-marketing'
  | 'creative-media'
  | 'creative-portfolio'
  // F. ATS
  | 'ats-classic'
  | 'ats-modern'
  | 'ats-technical'
  | 'ats-graduate'
  // Legacy Aliases
  | 'ats'
  | 'modern'
  | 'professional'
  | 'creative';

export interface CVTemplateMeta {
  id: CVTemplateId;
  name: string;
  category: CVTemplateCategory;
  categoryName: string;
  description: string;
  recommendedFor: string;
  targetUserLevels: StudentLevel[];
  layoutType: 'single-column' | 'two-column-left' | 'two-column-right' | 'grid' | 'timeline' | 'compact';
  defaultThemeColor: string;
  supportsPhoto: boolean;
  atsScore: number;
  badge?: string;
  features: string[];
}

export interface CVThemeConfig {
  primaryColor: string;
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono' | 'font-vietnam';
  fontSize: 'compact' | 'standard' | 'relaxed';
  showPhoto: boolean;
  photoShape: 'circle' | 'rounded' | 'square';
  visibleSections: {
    summary: boolean;
    skills: boolean;
    education: boolean;
    projects: boolean;
    experience: boolean;
    activities: boolean;
    certifications: boolean;
    achievements: boolean;
    languages: boolean;
  };
}

export interface CVPhoto {
  dataUrl: string;
  originalUrl?: string;
  shape: 'circle' | 'rounded' | 'square';
  visible: boolean;
  zoom?: number;
  cropX?: number;
  cropY?: number;
}

export interface CVData {
  contact: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  photo?: CVPhoto;
  summary: string;
  skills: {
    core: string[];
    technical: string[];
    tools: string[];
    soft: string[];
  };
  languages: string[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
  education: {
    school: string;
    degree: string;
    major: string;
    year: string;
    gpa?: string;
    coursework?: string[];
  }[];
  projects: {
    name: string;
    role: string;
    period: string;
    techStack: string[];
    objective: string;
    bulletPoints: string[];
  }[];
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    bulletPoints: string[];
  }[];
  activities: {
    name: string;
    role: string;
    period: string;
    impact: string;
  }[];
  achievements: string[];
}

export interface ATSMatchReport {
  atsScore: number;
  recruiterScore: number;
  hiringRisk: 'Thấp' | 'Trung bình' | 'Cao';
  hiringConfidence: 'Rất cao' | 'Cao' | 'Trung bình' | 'Thấp';
  strongMatches: string[];
  missingKeywords: string[];
  keywordDensityTips: string[];
  experienceGap: string;
  suggestedImprovements: string[];
  priorityFixes: string[];
  recruiterPsychologyInsight: string;
  optimizedSummaryProposal?: string;
}

export interface BulletRewriteResult {
  original: string;
  improved: string;
  recruiterSignal: string;
  formulaUsed: string;
  variations: string[];
  englishVersion: string;
}

export interface CoverLetterResult {
  openingHook: string;
  whyCompany: string;
  whyRole: string;
  matchingSkillsAndProjects: string;
  valueProposition: string;
  interviewCallToAction: string;
  fullLetterFormatted: string;
}

export interface InterviewEvaluation {
  contentScore: number;
  clarityScore: number;
  starQuality: number;
  recruiterScore: number;
  hiringConfidence: 'Strong Yes' | 'Lean Yes' | 'Undecided' | 'Lean No';
  whatWasGood: string[];
  whatFeltWeak: string[];
  missingDetails: string[];
  recruiterConcerns: string[];
  betterStarVersion: string;
}

export interface InterviewExchange {
  questionNumber: number;
  question: string;
  answer?: string;
  evaluation?: InterviewEvaluation;
  recruiterReaction?: string;
}

export interface PersonalBrandingResult {
  linkedinHeadlines: string[];
  linkedinAbout: string;
  elevatorPitch30s: string;
  executiveBio: string;
  uniqueSellingPoints: string[];
}

export interface CareerTrack {
  id: string;
  title: string;
  category: string;
  tag: string;
  salaryRange: string;
  suitableLevels: string[];
  description: string;
  keySkills: string[];
  suggestedMajors: string[];
  growthTrend: 'Rất cao' | 'Cao' | 'Ổn định';
}

export interface RoadmapMilestone {
  id: string;
  phase: string;
  timeframe: string;
  title: string;
  description: string;
  tasks: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}
