
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
  markAsRead: (chatId: string) => Promise<void>;
  isTyping: Record<string, boolean>;
  setTyping: (chatId: string, typing: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTypingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const conversationsJson = await AsyncStorage.getItem(`conversations_${user.id}`);
      if (conversationsJson) {
        setConversations(JSON.parse(conversationsJson));
      }
    } catch (error) {
      console.log('Error loading conversations:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!user) return;

    try {
      const messagesJson = await AsyncStorage.getItem(`messages_${chatId}`);
      if (messagesJson) {
        const loadedMessages = JSON.parse(messagesJson);
        setMessages(prev => ({
          ...prev,
          [chatId]: loadedMessages,
        }));
      } else {
        setMessages(prev => ({
          ...prev,
          [chatId]: [],
        }));
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  };

  const sendMessage = async (receiverId?: string, text?: string, groupId?: string) => {
    if (!user || !text) return;

    try {
      const detectedLanguage = await detectLanguage(text);
      const chatId = groupId || receiverId;
      if (!chatId) return;

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
        id: `msg_${Date.now()}`,
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
        };
        updatedConversations = [newConv, ...conversations];
      }

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  const sendMediaMessage = async (receiverId?: string, media?: MediaAttachment, groupId?: string) => {
    if (!user || !media) return;

    try {
      const chatId = groupId || receiverId;
      if (!chatId) return;

      const message: Message = {
        id: `msg_${Date.now()}`,
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
        };
        updatedConversations = [newConv, ...conversations];
      }

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );
    } catch (error) {
      console.log('Error sending media message:', error);
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
      console.log('Error marking as read:', error);
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
        markAsRead,
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
