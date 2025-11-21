
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { getLanguageName } from '@/utils/languages';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages, markAsRead, isTyping } = useChat();
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) {
      loadMessages(id as string);
      markAsRead(id as string);
      loadOtherUser();
    }
  }, [id]);

  const loadOtherUser = async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const foundUser = users.find((u: User) => u.id === id);
        setOtherUser(foundUser);
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !id) return;

    await sendMessage(id as string, messageText.trim());
    setMessageText('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const chatMessages = messages[id as string] || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: otherUser?.displayName || 'Chat',
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowTranslation(!showTranslation)}>
              <IconSymbol
                ios_icon_name={showTranslation ? 'eye.fill' : 'eye.slash.fill'}
                android_material_icon_name={showTranslation ? 'visibility' : 'visibility_off'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="bubble.left.and.bubble.right"
                android_material_icon_name="chat"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No messages yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start the conversation!
              </Text>
            </View>
          ) : (
            chatMessages.map((message, index) => {
              const isMe = message.senderId === user?.id;
              const showTranslatedText = showTranslation && message.translatedText && message.translatedText !== message.originalText;

              return (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    isMe ? styles.messageWrapperMe : styles.messageWrapperOther,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMe
                        ? { backgroundColor: colors.messageSent }
                        : {
                            backgroundColor: isDark
                              ? colors.messageReceivedDark
                              : colors.messageReceived,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isMe ? '#FFFFFF' : (isDark ? colors.textDark : colors.text) },
                      ]}
                    >
                      {isMe ? message.originalText : (showTranslatedText ? message.translatedText : message.originalText)}
                    </Text>
                    {showTranslatedText && !isMe && (
                      <View style={styles.translationContainer}>
                        <Text style={[styles.translationLabel, { color: colors.textSecondary }]}>
                          Original ({message.originalLanguage?.toUpperCase()}):
                        </Text>
                        <Text style={[styles.translationText, { color: isDark ? colors.textDark : colors.text }]}>
                          {message.originalText}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.messageTime,
                        { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                      ]}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          {isTyping[id as string] && (
            <View style={styles.typingIndicator}>
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                {otherUser?.displayName} is typing...
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
            borderTopColor: isDark ? colors.borderDark : colors.border,
          },
        ]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
                color: isDark ? colors.textDark : colors.text,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: messageText.trim() ? colors.primary : colors.textSecondary },
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <IconSymbol
              ios_icon_name="arrow.up"
              android_material_icon_name="send"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  translationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  translationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  typingIndicator: {
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
