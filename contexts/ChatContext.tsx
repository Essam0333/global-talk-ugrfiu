
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, User, Group, MediaAttachment } from '@/types';
import { useAuth } from './AuthContext';
import { translateText, detectLanguage } from '@/utils/translation';

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (receiverId?: string, text?: string, groupId?: string) => Promise<void>;
  sendMediaMessage: (receiverId?: string, media?: MediaAttachment, groupId?: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => Promise<void>;
  isTyping: Record<string, boolean>;
  setTyping: (chatId: string, typing: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTypingState] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      console.log('Initializing ChatContext for user:', user.username);
      loadConversations();
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  const loadConversations = async () => {
    if (!user) {
      console.log('No user, skipping conversation load');
      return;
    }

    try {
      console.log('Loading conversations for user:', user.id);
      const conversationsJson = await AsyncStorage.getItem(`conversations_${user.id}`);
      if (conversationsJson) {
        const loadedConversations = JSON.parse(conversationsJson);
        console.log('Loaded conversations:', loadedConversations.length);
        setConversations(loadedConversations);
      } else {
        console.log('No conversations found');
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
    if (!user) return;

    try {
      const updatedConversations = conversations.map(c =>
        c.id === conversationId ? { ...c, ...updates } : c
      );

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );
      console.log('Conversation updated:', conversationId);
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!user) return;

    try {
      console.log('Loading messages for chat:', chatId);
      const messagesJson = await AsyncStorage.getItem(`messages_${chatId}`);
      if (messagesJson) {
        const loadedMessages = JSON.parse(messagesJson);
        console.log('Loaded messages:', loadedMessages.length);
        setMessages(prev => ({
          ...prev,
          [chatId]: loadedMessages,
        }));
      } else {
        console.log('No messages found for chat:', chatId);
        setMessages(prev => ({
          ...prev,
          [chatId]: [],
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(prev => ({
        ...prev,
        [chatId]: [],
      }));
    }
  };

  const sendMessage = async (receiverId?: string, text?: string, groupId?: string) => {
    if (!user || !text) {
      console.log('Cannot send message: missing user or text');
      return;
    }

    try {
      const chatId = groupId || receiverId;
      if (!chatId) {
        console.log('Cannot send message: no chat ID');
        return;
      }

      console.log('Sending message to:', chatId);

      const detectedLanguage = await detectLanguage(text);
      let translatedTexts: Record<string, string> = {};

      if (groupId) {
        const groupsJson = await AsyncStorage.getItem('groups');
        const groups = groupsJson ? JSON.parse(groupsJson) : [];
        const group = groups.find((g: Group) => g.id === groupId);

        if (group) {
          for (const member of group.members) {
            if (member.preferredLanguage !== detectedLanguage) {
              translatedTexts[member.userId] = await translateText(
                text,
                detectedLanguage,
                member.preferredLanguage
              );
            }
          }
        }
      } else if (receiverId) {
        const usersJson = await AsyncStorage.getItem('users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        const receiver = users.find((u: User) => u.id === receiverId);

        if (receiver && receiver.preferredLanguage !== detectedLanguage) {
          translatedTexts[receiverId] = await translateText(
            text,
            detectedLanguage,
            receiver.preferredLanguage
          );
        }
      }

      const message: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: user.id,
        receiverId: groupId ? undefined : receiverId,
        groupId,
        originalText: text,
        originalLanguage: detectedLanguage,
        translatedText: translatedTexts[receiverId || ''] || text,
        translatedLanguage: user.preferredLanguage,
        timestamp: Date.now(),
        status: 'sent',
      };

      const chatMessages = messages[chatId] || [];
      const updatedMessages = [...chatMessages, message];
      
      setMessages(prev => ({
        ...prev,
        [chatId]: updatedMessages,
      }));

      await AsyncStorage.setItem(
        `messages_${chatId}`,
        JSON.stringify(updatedMessages)
      );

      const existingConv = conversations.find(c => 
        (c.userId === receiverId) || (c.groupId === groupId)
      );
      let updatedConversations;

      if (existingConv) {
        updatedConversations = conversations.map(c =>
          (c.userId === receiverId || c.groupId === groupId)
            ? { ...c, lastMessage: message }
            : c
        );
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          userId: receiverId,
          groupId,
          lastMessage: message,
          unreadCount: 0,
          isGroup: !!groupId,
          isPinned: false,
          isArchived: false,
          category: groupId ? 'groups' : 'personal',
        };
        updatedConversations = [newConv, ...conversations];
      }

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendMediaMessage = async (receiverId?: string, media?: MediaAttachment, groupId?: string) => {
    if (!user || !media) {
      console.log('Cannot send media: missing user or media');
      return;
    }

    try {
      const chatId = groupId || receiverId;
      if (!chatId) {
        console.log('Cannot send media: no chat ID');
        return;
      }

      console.log('Sending media message to:', chatId);

      const message: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: user.id,
        receiverId: groupId ? undefined : receiverId,
        groupId,
        originalText: '',
        originalLanguage: user.preferredLanguage,
        timestamp: Date.now(),
        status: 'sent',
        mediaType: media.type,
        mediaUrl: media.uri,
        mediaThumbnail: media.thumbnail,
        mediaSize: media.size,
        mediaName: media.name,
        mediaDuration: media.duration,
      };

      const chatMessages = messages[chatId] || [];
      const updatedMessages = [...chatMessages, message];
      
      setMessages(prev => ({
        ...prev,
        [chatId]: updatedMessages,
      }));

      await AsyncStorage.setItem(
        `messages_${chatId}`,
        JSON.stringify(updatedMessages)
      );

      const existingConv = conversations.find(c => 
        (c.userId === receiverId) || (c.groupId === groupId)
      );
      let updatedConversations;

      if (existingConv) {
        updatedConversations = conversations.map(c =>
          (c.userId === receiverId || c.groupId === groupId)
            ? { ...c, lastMessage: message }
            : c
        );
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          userId: receiverId,
          groupId,
          lastMessage: message,
          unreadCount: 0,
          isGroup: !!groupId,
          isPinned: false,
          isArchived: false,
          category: groupId ? 'groups' : 'personal',
        };
        updatedConversations = [newConv, ...conversations];
      }

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );

      console.log('Media message sent successfully');
    } catch (error) {
      console.error('Error sending media message:', error);
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;

    try {
      const updatedConversations = conversations.map(c =>
        (c.userId === chatId || c.groupId === chatId) ? { ...c, unreadCount: 0 } : c
      );

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const setTyping = (chatId: string, typing: boolean) => {
    setIsTypingState(prev => ({
      ...prev,
      [chatId]: typing,
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
        sendMediaMessage,
        loadMessages,
        loadConversations,
        markAsRead,
        updateConversation,
        isTyping,
        setTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
