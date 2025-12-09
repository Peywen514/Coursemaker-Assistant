export interface CourseInfo {
  title: string;
  targetAudience: string;
  description: string;
  keyTakeaways: string;
}

export interface PainPoint {
  id: string;
  title: string;
  targetGroup: string; // e.g., "Student", "Job Seeker", "Parent returning to work"
  seoKeywords: string[]; // e.g., ["轉職", "履歷技巧"]
  description: string;
  marketingHook: string;
}

export interface SlideContent {
  headline: string;
  subtext: string;
  visualPrompt: string;
}

export interface SlideData {
  content: SlideContent;
  backgroundImage?: string; // Base64
  isGeneratingImage: boolean;
}

export interface LazyPack {
  painPointId: string;
  slides: SlideData[];
}

export enum AppState {
  INPUT_COURSE,
  SELECT_STRATEGY,
  GENERATE_CONTENT,
}

export interface VideoScriptScene {
  scene: string;
  visual: string;
  audio: string;
}

export interface GeneratedVideo {
  uri: string;
  prompt: string;
}

// Google GenAI Types needed for specific parts
export enum GenerationType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
