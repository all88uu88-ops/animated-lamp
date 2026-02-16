
export type Role = 'ADMIN' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type Theme = 'light' | 'dark';
export type Mood = 'CALM' | 'FOCUS' | 'ENERGY';
export type IdeaType = 'تقرير' | 'مقابلة' | 'تصوير' | 'فيديو' | 'مقال';
export type IdeaStatus = 'قيد المراجعة' | 'مقبولة' | 'مرفوضة' | 'قيد التنفيذ';
export type Specialization = 'مصور' | 'كاتب' | 'مونتاج' | 'تصميم' | 'عام';

export type HelpCategory = 'تصميم' | 'مونتاج' | 'تصوير' | 'كتابة' | 'تقني' | 'أفكار';
export type Urgency = 'NORMAL' | 'URGENT';

export type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Badge {
  id: string; // References the Badge Definition ID
  timestamp: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'telegram' | 'youtube' | 'website' | 'email' | 'other';
  url: string;
  label: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  bio: string;
  avatar: string;
  role: Role;
  status: UserStatus;
  specialization: Specialization;
  isOnline: boolean;
  lastActive: number;
  badges: Badge[];
  // New properties for Creative Hub
  reputationPoints?: number;
  isAvailableForHelp?: boolean;
  skills?: HelpCategory[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
  replies?: Comment[]; // دعم الردود المتداخلة
}

export interface Story {
  id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: number;
  viewers: number; // Live viewer count
  likes: number;
  comments: Comment[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: number;
  likes: string[]; // معرفات المستخدمين الذين ضغطوا إعجاب (قلب)
  reactions?: { [userId: string]: string }; // ميزة الإيموجي: تخزين نوع الإيموجي لكل مستخدم
  comments: Comment[];
  status: 'PENDING' | 'APPROVED';
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: HelpCategory;
  urgency: Urgency;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  timestamp: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  helperId?: string;
  chatMessages: {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
  }[];
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  type: IdeaType;
  authorId: string;
  authorName: string;
  timestamp: number;
  votes: string[]; // User IDs who voted
  status: IdeaStatus;
  adminNote?: string;
}

export interface ClubLocation {
  id: string;
  name: string;
  description: string;
  status: 'VISITED' | 'PLANNED';
  image: string;
}

export interface Notification {
  id: string;
  recipientId: string; // 'ALL' or specific User ID
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'LIKE' | 'COMMENT' | 'ADMIN' | 'MESSAGE' | 'BADGE' | 'ANNOUNCEMENT' | 'REWARD' | 'ACTIVITY';
  content: string;
  relatedId?: string; // Post ID or other reference
  timestamp: number;
  read: boolean;
  sound?: string; // Key for the sound file
}

export interface CanvasStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

export interface CanvasNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  authorName: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  tags: string[];
  likes: string[];
  timestamp: number;
}

// --- LIVE ROOM TYPES ---

export type LiveSessionStatus = 'SCHEDULED' | 'LIVE' | 'ENDED';

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  status: LiveSessionStatus;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  startedAt?: number;
  endedAt?: number;
  scheduledFor?: number;
  participants: string[]; // User IDs currently in the room
  isLocked: boolean;
}

export interface LiveParticipant {
  id: string; // This is the user ID
  sessionId: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: number;
  connectionQuality: 'GOOD' | 'FAIR' | 'POOR';
}

export interface LiveMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface AppState {
  users: User[];
  posts: Post[];
  ideas: Idea[];
  stories: Story[];
  locations: ClubLocation[];
  notifications: Notification[];
  portfolioItems: PortfolioItem[];
  socialLinks: SocialLink[];
  helpRequests: HelpRequest[];
  liveSessions: LiveSession[]; // New: Stores all sessions
  currentUser: User | null;
  theme: Theme;
  settings: {
    cinematicEntrance: boolean;
  };
}
