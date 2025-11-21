
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
  Alert,
  Clipboard,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Group, MediaAttachment, Message, StarredMessage } from '@/types';
import EmojiPicker from '@/components/EmojiPicker';
import TypingIndicator from '@/components/TypingIndicator';
import EmojiReaction from '@/components/EmojiReaction';
import MediaPicker from '@/components/MediaPicker';
import MediaMessage from '@/components/MediaMessage';
import ForwardMessageModal from '@/components/ForwardMessageModal';
import ChatSearchBar from '@/components/ChatSearchBar';
import { translateText } from '@/utils/translation';

const QUICK_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🎉'];

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
  const [selectedMessageForActions, setSelectedMessageForActions] = useState<Message | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, Record<string, number>>>({});
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [starredMessageIds, setStarredMessageIds] = useState<Set<string>>(new Set());
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
      loadStarredMessages();
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

  const loadStarredMessages = async () => {
    if (!user) return;

    try {
      const starredJson = await AsyncStorage.getItem(`starred_${user.id}`);
      if (starredJson) {
        const starred: StarredMessage[] = JSON.parse(starredJson);
        const ids = new Set(starred.map(s => s.messageId));
        setStarredMessageIds(ids);
      }
    } catch (error) {
      console.log('Error loading starred messages:', error);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleLongPress = (message: Message) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMessageForActions(message);
  };

  const handleCopyMessage = () => {
    if (selectedMessageForActions) {
      Clipboard.setString(selectedMessageForActions.originalText);
      Alert.alert('Copied', 'Message copied to clipboard');
      setSelectedMessageForActions(null);
    }
  };

  const handleTranslateMessage = async () => {
    if (selectedMessageForActions && user) {
      try {
        const translated = await translateText(
          selectedMessageForActions.originalText,
          selectedMessageForActions.originalLanguage,
          user.preferredLanguage
        );
        Alert.alert('Translation', translated);
      } catch (error) {
        Alert.alert('Error', 'Failed to translate message');
      }
      setSelectedMessageForActions(null);
    }
  };

  const handleForwardMessage = () => {
    if (selectedMessageForActions) {
      setMessageToForward(selectedMessageForActions);
      setShowForwardModal(true);
      setSelectedMessageForActions(null);
    }
  };

  const handleStarMessage = async () => {
    if (!selectedMessageForActions || !user) return;

    try {
      const starredJson = await AsyncStorage.getItem(`starred_${user.id}`);
      const starred: StarredMessage[] = starredJson ? JSON.parse(starredJson) : [];
      
      const isStarred = starred.some(s => s.messageId === selectedMessageForActions.id);
      
      if (isStarred) {
        const updated = starred.filter(s => s.messageId !== selectedMessageForActions.id);
        await AsyncStorage.setItem(`starred_${user.id}`, JSON.stringify(updated));
        setStarredMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedMessageForActions.id);
          return newSet;
        });
        Alert.alert('Unstarred', 'Message removed from starred');
      } else {
        const newStarred: StarredMessage = {
          messageId: selectedMessageForActions.id,
          userId: user.id,
          chatId: id as string,
          createdAt: Date.now(),
        };
        starred.push(newStarred);
        await AsyncStorage.setItem(`starred_${user.id}`, JSON.stringify(starred));
        setStarredMessageIds(prev => new Set(prev).add(selectedMessageForActions.id));
        Alert.alert('Starred', 'Message added to starred');
      }
    } catch (error) {
      console.log('Error starring message:', error);
    }
    setSelectedMessageForActions(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessageForActions) return;

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const chatMessages = messages[id as string] || [];
              const updated = chatMessages.filter(m => m.id !== selectedMessageForActions.id);
              await AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updated));
              loadMessages(id as string);
            } catch (error) {
              console.log('Error deleting message:', error);
            }
            setSelectedMessageForActions(null);
          },
        },
      ]
    );
  };

  const handleForwardToTargets = async (targetIds: string[], message: Message) => {
    for (const targetId of targetIds) {
      const forwardedMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        forwardedFrom: message.senderId,
      };

      if (targetId.startsWith('group_')) {
        await sendMessage(undefined, message.originalText, targetId);
      } else {
        await sendMessage(targetId, message.originalText);
      }
    }
    Alert.alert('Success', `Message forwarded to ${targetIds.length} chat(s)`);
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
  const filteredMessages = searchQuery
    ? chatMessages.filter(m => 
        m.originalText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.translatedText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chatMessages;

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
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow_back"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => setShowSearchBar(!showSearchBar)}
                style={styles.headerButton}
              >
                <IconSymbol
                  ios_icon_name="magnifyingglass"
                  android_material_icon_name="search"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
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
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showSearchBar && (
          <ChatSearchBar
            onSearch={setSearchQuery}
            onClose={() => {
              setShowSearchBar(false);
              setSearchQuery('');
            }}
          />
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {filteredMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? 'No messages found' : 'No messages yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {searchQuery ? 'Try a different search term' : 'Start the conversation! 🌟'}
              </Text>
            </View>
          ) : (
            filteredMessages.map((message, index) => {
              const isMe = message.senderId === user?.id;
              const showTranslatedText = showTranslation && message.translatedText && message.translatedText !== message.originalText;
              const reactions = messageReactions[message.id] || {};
              const isStarred = starredMessageIds.has(message.id);

              return (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    isMe ? styles.messageWrapperMe : styles.messageWrapperOther,
                  ]}
                >
                  <TouchableOpacity
                    onLongPress={() => handleLongPress(message)}
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
                      {message.forwardedFrom && (
                        <View style={styles.forwardedBadge}>
                          <IconSymbol
                            ios_icon_name="arrow.forward"
                            android_material_icon_name="forward"
                            size={12}
                            color={isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary}
                          />
                          <Text style={[styles.forwardedText, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                            Forwarded
                          </Text>
                        </View>
                      )}
                      {isStarred && (
                        <View style={styles.starBadge}>
                          <IconSymbol
                            ios_icon_name="star.fill"
                            android_material_icon_name="star"
                            size={12}
                            color={colors.warning}
                          />
                        </View>
                      )}
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

        <Modal
          visible={selectedMessageForActions !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMessageForActions(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedMessageForActions(null)}
          >
            <View style={[
              styles.actionsMenu,
              { backgroundColor: isDark ? colors.cardDark : colors.card },
            ]}>
              <TouchableOpacity style={styles.actionItem} onPress={handleCopyMessage}>
                <IconSymbol
                  ios_icon_name="doc.on.doc"
                  android_material_icon_name="content_copy"
                  size={20}
                  color={isDark ? colors.textDark : colors.text}
                />
                <Text style={[styles.actionText, { color: isDark ? colors.textDark : colors.text }]}>
                  Copy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={handleTranslateMessage}>
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="translate"
                  size={20}
                  color={isDark ? colors.textDark : colors.text}
                />
                <Text style={[styles.actionText, { color: isDark ? colors.textDark : colors.text }]}>
                  Translate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={handleForwardMessage}>
                <IconSymbol
                  ios_icon_name="arrow.forward"
                  android_material_icon_name="forward"
                  size={20}
                  color={isDark ? colors.textDark : colors.text}
                />
                <Text style={[styles.actionText, { color: isDark ? colors.textDark : colors.text }]}>
                  Forward
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={handleStarMessage}>
                <IconSymbol
                  ios_icon_name={starredMessageIds.has(selectedMessageForActions?.id || '') ? 'star.fill' : 'star'}
                  android_material_icon_name={starredMessageIds.has(selectedMessageForActions?.id || '') ? 'star' : 'star_border'}
                  size={20}
                  color={colors.warning}
                />
                <Text style={[styles.actionText, { color: isDark ? colors.textDark : colors.text }]}>
                  {starredMessageIds.has(selectedMessageForActions?.id || '') ? 'Unstar' : 'Star'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => setSelectedMessageForReaction(selectedMessageForActions?.id || null)}
              >
                <Text style={styles.actionEmoji}>😊</Text>
                <Text style={[styles.actionText, { color: isDark ? colors.textDark : colors.text }]}>
                  React
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={handleDeleteMessage}>
                <IconSymbol
                  ios_icon_name="trash"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.error}
                />
                <Text style={[styles.actionText, { color: colors.error }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <MediaPicker
          visible={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onMediaSelected={handleMediaSelected}
        />

        <ForwardMessageModal
          visible={showForwardModal}
          message={messageToForward}
          onClose={() => setShowForwardModal(false)}
          onForward={handleForwardToTargets}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
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
    position: 'relative',
  },
  forwardedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  forwardedText: {
    fontSize: 11,
    fontStyle: 'italic',
    fontFamily: 'Inter_400Regular',
  },
  starBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionsMenu: {
    borderRadius: 16,
    padding: 8,
    minWidth: 200,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  actionEmoji: {
    fontSize: 20,
  },
});
