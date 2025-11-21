
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
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Group, MediaAttachment } from '@/types';
import EmojiPicker from '@/components/EmojiPicker';
import TypingIndicator from '@/components/TypingIndicator';
import EmojiReaction from '@/components/EmojiReaction';
import MediaPicker from '@/components/MediaPicker';
import MediaMessage from '@/components/MediaMessage';

const QUICK_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🎉'];

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { messages, sendMessage, sendMediaMessage, loadMessages, markAsRead, isTyping } = useChat();
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, Record<string, number>>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const isGroup = (id as string)?.startsWith('group_');

  useEffect(() => {
    if (id) {
      loadMessages(id as string);
      markAsRead(id as string);
      if (isGroup) {
        loadGroup();
      } else {
        loadOtherUser();
      }
      loadReactions();
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

  const loadGroup = async () => {
    try {
      const groupsJson = await AsyncStorage.getItem('groups');
      if (groupsJson) {
        const groups = JSON.parse(groupsJson);
        const foundGroup = groups.find((g: Group) => g.id === id);
        setGroup(foundGroup);
      }
    } catch (error) {
      console.log('Error loading group:', error);
    }
  };

  const loadReactions = async () => {
    try {
      const reactionsJson = await AsyncStorage.getItem(`reactions_${id}`);
      if (reactionsJson) {
        setMessageReactions(JSON.parse(reactionsJson));
      }
    } catch (error) {
      console.log('Error loading reactions:', error);
    }
  };

  const saveReactions = async (reactions: Record<string, Record<string, number>>) => {
    try {
      await AsyncStorage.setItem(`reactions_${id}`, JSON.stringify(reactions));
    } catch (error) {
      console.log('Error saving reactions:', error);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const newReactions = { ...messageReactions };
    if (!newReactions[messageId]) {
      newReactions[messageId] = {};
    }
    if (!newReactions[messageId][emoji]) {
      newReactions[messageId][emoji] = 0;
    }
    newReactions[messageId][emoji]++;
    setMessageReactions(newReactions);
    saveReactions(newReactions);
    setSelectedMessageForReaction(null);
  };

  const handleSend = async () => {
    if (!messageText.trim() || !id) return;

    if (isGroup) {
      await sendMessage(undefined, messageText.trim(), id as string);
    } else {
      await sendMessage(id as string, messageText.trim());
    }
    setMessageText('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMediaSelected = async (media: MediaAttachment) => {
    if (!id) return;

    if (isGroup) {
      await sendMediaMessage(undefined, media, id as string);
    } else {
      await sendMediaMessage(id as string, media);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const chatMessages = messages[id as string] || [];

  const getHeaderTitle = () => {
    if (isGroup && group) {
      return (
        <View style={styles.headerTitle}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {group.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{group.name}</Text>
            <Text style={styles.headerStatus}>{group.members.length} members</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.headerTitle}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {otherUser?.displayName.charAt(0).toUpperCase()}
          </Text>
          <View style={[styles.onlineIndicator, { backgroundColor: colors.online }]} />
        </View>
        <View>
          <Text style={styles.headerName}>{otherUser?.displayName || 'Chat'}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: isDark ? colors.primaryDark : colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitle: () => getHeaderTitle(),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setShowTranslation(!showTranslation)}
              style={styles.headerButton}
            >
              <IconSymbol
                ios_icon_name={showTranslation ? 'eye.fill' : 'eye.slash.fill'}
                android_material_icon_name={showTranslation ? 'visibility' : 'visibility_off'}
                size={22}
                color="#FFFFFF"
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
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No messages yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start the conversation! 🌟
              </Text>
            </View>
          ) : (
            chatMessages.map((message, index) => {
              const isMe = message.senderId === user?.id;
              const showTranslatedText = showTranslation && message.translatedText && message.translatedText !== message.originalText;
              const reactions = messageReactions[message.id] || {};

              return (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    isMe ? styles.messageWrapperMe : styles.messageWrapperOther,
                  ]}
                >
                  <TouchableOpacity
                    onLongPress={() => setSelectedMessageForReaction(message.id)}
                    activeOpacity={0.8}
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
                      {message.mediaType ? (
                        <MediaMessage message={message} isMe={isMe} />
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.messageText,
                              { color: isMe ? '#FFFFFF' : (isDark ? colors.textDark : colors.text) },
                            ]}
                          >
                            {isMe ? message.originalText : (showTranslatedText ? message.translatedText : message.originalText)}
                          </Text>
                          {showTranslatedText && !isMe && (
                            <View style={[styles.translationContainer, { borderTopColor: isDark ? colors.borderDark : 'rgba(0,0,0,0.1)' }]}>
                              <Text style={[styles.translationLabel, { color: colors.textSecondary }]}>
                                Original ({message.originalLanguage?.toUpperCase()}):
                              </Text>
                              <Text style={[styles.translationText, { color: isDark ? colors.textDark : colors.text }]}>
                                {message.originalText}
                              </Text>
                            </View>
                          )}
                        </>
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
                  </TouchableOpacity>

                  {Object.keys(reactions).length > 0 && (
                    <View style={[styles.reactionsContainer, isMe && styles.reactionsContainerMe]}>
                      {Object.entries(reactions).map(([emoji, count], idx) => (
                        <EmojiReaction
                          key={idx}
                          emoji={emoji}
                          count={count}
                          onPress={() => handleReaction(message.id, emoji)}
                        />
                      ))}
                    </View>
                  )}

                  {selectedMessageForReaction === message.id && (
                    <View style={[styles.quickReactions, isMe && styles.quickReactionsMe]}>
                      {QUICK_EMOJIS.map((emoji, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.quickReactionButton}
                          onPress={() => handleReaction(message.id, emoji)}
                        >
                          <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          {isTyping[id as string] && <TypingIndicator />}
        </ScrollView>

        <View style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
            borderTopColor: isDark ? colors.borderDark : colors.border,
          },
        ]}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowMediaPicker(true)}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Text style={styles.emojiButtonText}>😊</Text>
          </TouchableOpacity>
          
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
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <LinearGradient
              colors={messageText.trim() ? [colors.primary, colors.secondary] : [colors.textSecondary, colors.textSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              <IconSymbol
                ios_icon_name="arrow.up"
                android_material_icon_name="send"
                size={20}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showEmojiPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEmojiPicker(false)}
          >
            <View style={styles.emojiPickerContainer}>
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <MediaPicker
          visible={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onMediaSelected={handleMediaSelected}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  headerButton: {
    padding: 8,
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Inter_500Medium',
  },
  translationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  translationLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  translationText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Inter_400Regular',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reactionsContainerMe: {
    justifyContent: 'flex-end',
  },
  quickReactions: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 8,
    marginTop: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  quickReactionsMe: {
    alignSelf: 'flex-end',
  },
  quickReactionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  quickReactionEmoji: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  attachButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  emojiButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emojiButtonText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    fontFamily: 'Inter_400Regular',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiPickerContainer: {
    backgroundColor: 'transparent',
  },
});
