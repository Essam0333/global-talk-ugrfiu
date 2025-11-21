
export interface User {
  id: string;
  username: string;
  displayName: string;
  preferredLanguage: string;
  contacts: string[];
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  originalText: string;
  originalLanguage: string;
  translatedText?: string;
  translatedLanguage?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  userId: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
