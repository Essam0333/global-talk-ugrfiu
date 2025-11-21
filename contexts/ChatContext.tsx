
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, User } from '@/types';
import { useAuth } from './AuthContext';
import { translateText, detectLanguage } from '@/utils/translation';

interface ChatContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  markAsRead: (userId: string) => Promise<void>;
  isTyping: Record<string, boolean>;
  setTyping: (userId: string, typing: boolean) => void;
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

  const loadMessages = async (userId: string) => {
    if (!user) return;

    try {
      const messagesJson = await AsyncStorage.getItem(`messages_${user.id}_${userId}`);
      if (messagesJson) {
        const loadedMessages = JSON.parse(messagesJson);
        setMessages(prev => ({
          ...prev,
          [userId]: loadedMessages,
        }));
      } else {
        setMessages(prev => ({
          ...prev,
          [userId]: [],
        }));
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  };

  const sendMessage = async (receiverId: string, text: string) => {
    if (!user) return;

    try {
      // Detect language of the message
      const detectedLanguage = await detectLanguage(text);

      // Get receiver's preferred language
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const receiver = users.find((u: User) => u.id === receiverId);

      let translatedText = text;
      if (receiver && receiver.preferredLanguage !== detectedLanguage) {
        translatedText = await translateText(text, detectedLanguage, receiver.preferredLanguage);
      }

      const message: Message = {
        id: `msg_${Date.now()}`,
        senderId: user.id,
        receiverId,
        originalText: text,
        originalLanguage: detectedLanguage,
        translatedText,
        translatedLanguage: receiver?.preferredLanguage || detectedLanguage,
        timestamp: Date.now(),
        status: 'sent',
      };

      // Update messages
      const userMessages = messages[receiverId] || [];
      const updatedMessages = [...userMessages, message];
      
      setMessages(prev => ({
        ...prev,
        [receiverId]: updatedMessages,
      }));

      // Save messages
      await AsyncStorage.setItem(
        `messages_${user.id}_${receiverId}`,
        JSON.stringify(updatedMessages)
      );

      // Also save for receiver
      await AsyncStorage.setItem(
        `messages_${receiverId}_${user.id}`,
        JSON.stringify(updatedMessages)
      );

      // Update conversation
      const existingConv = conversations.find(c => c.userId === receiverId);
      let updatedConversations;

      if (existingConv) {
        updatedConversations = conversations.map(c =>
          c.userId === receiverId
            ? { ...c, lastMessage: message }
            : c
        );
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          userId: receiverId,
          lastMessage: message,
          unreadCount: 0,
        };
        updatedConversations = [newConv, ...conversations];
      }

      setConversations(updatedConversations);
      await AsyncStorage.setItem(
        `conversations_${user.id}`,
        JSON.stringify(updatedConversations)
      );

      // Update receiver's conversation
      const receiverConvsJson = await AsyncStorage.getItem(`conversations_${receiverId}`);
      const receiverConvs = receiverConvsJson ? JSON.parse(receiverConvsJson) : [];
      const receiverConv = receiverConvs.find((c: Conversation) => c.userId === user.id);

      if (receiverConv) {
        const updatedReceiverConvs = receiverConvs.map((c: Conversation) =>
          c.userId === user.id
            ? { ...c, lastMessage: message, unreadCount: c.unreadCount + 1 }
            : c
        );
        await AsyncStorage.setItem(
          `conversations_${receiverId}`,
          JSON.stringify(updatedReceiverConvs)
        );
      } else {
        const newReceiverConv: Conversation = {
          id: `conv_${Date.now()}`,
          userId: user.id,
          lastMessage: message,
          unreadCount: 1,
        };
        await AsyncStorage.setItem(
          `conversations_${receiverId}`,
          JSON.stringify([newReceiverConv, ...receiverConvs])
        );
      }
    } catch (error) {
      console.log('Error sending message:', error);
    }
  };

  const markAsRead = async (userId: string) => {
    if (!user) return;

    try {
      const updatedConversations = conversations.map(c =>
        c.userId === userId ? { ...c, unreadCount: 0 } : c
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

  const setTyping = (userId: string, typing: boolean) => {
    setIsTypingState(prev => ({
      ...prev,
      [userId]: typing,
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
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
