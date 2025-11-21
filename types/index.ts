
export interface User {
  id: string;
  username: string;
  displayName: string;
  preferredLanguage: string;
  contacts: string[];
  avatar?: string;
  emojiStatus?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  originalText: string;
  originalLanguage: string;
  translatedText?: string;
  translatedLanguage?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  mediaType?: 'image' | 'video' | 'document' | 'voice' | 'location' | 'contact';
  mediaUrl?: string;
  mediaThumbnail?: string;
  mediaSize?: number;
  mediaName?: string;
  mediaDuration?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phone: string;
  };
}

export interface Conversation {
  id: string;
  userId?: string;
  groupId?: string;
  lastMessage?: Message;
  unreadCount: number;
  isGroup?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  members: GroupMember[];
  admins: string[];
  createdBy: string;
  createdAt: number;
  inviteLink?: string;
  inviteLinkExpiry?: number;
  isPrivate: boolean;
}

export interface GroupMember {
  userId: string;
  joinedAt: number;
  preferredLanguage: string;
  isMuted: boolean;
  role: 'admin' | 'member';
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

export interface MediaAttachment {
  type: 'image' | 'video' | 'document' | 'voice' | 'location' | 'contact';
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
  duration?: number;
}
