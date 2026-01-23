
export enum AppView {
  LANDING = 'landing',
  HOME = 'home',
  CHATBOT = 'chatbot',
  ADMIN = 'admin'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserQueryRecord {
  id: string;
  sessionId: string;
  query: string;
  response: string;
  timestamp: number;
}

export interface AdminSession {
  isLoggedIn: boolean;
  username: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: any;
  lastActivityAt: any;
  messageCount: number;
}
