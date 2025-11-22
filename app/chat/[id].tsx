
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import BulkMessageActions from '@/components/BulkMessageActions';
import { translateText } from '@/utils/translation';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

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
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<'spam' | 'abuse' | 'harassment' | null>(null);
  const [reportDetails, setReportDetails] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const isGroup = (id as string)?.startsWith('group_');

  const checkIfBlocked = useCallback(async () => {
    if (!user || !id) return;

    try {
      const blockedJson = await AsyncStorage.getItem(`blocked_${user.id}`);
      if (blockedJson) {
        const blocked = JSON.parse(blockedJson);
        const isUserBlocked = blocked.some((b: any) => b.id === id);
        setIsBlocked(isUserBlocked);
      }
    } catch (error) {
      console.log('Error checking blocked status:', error);
    }
  }, [user, id]);

  const loadOtherUser = useCallback(async () => {
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
  }, [id]);

  const loadGroup = useCallback(async () => {
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
  }, [id]);

  const loadReactions = useCallback(async () => {
    try {
      const reactionsJson = await AsyncStorage.getItem(`reactions_${id}`);
      if (reactionsJson) {
        setMessageReactions(JSON.parse(reactionsJson));
      }
    } catch (error) {
      console.log('Error loading reactions:', error);
    }
  }, [id]);

  const loadStarredMessages = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (id) {
      loadMessages(id as string);
      markAsRead(id as string);
      if (isGroup) {
        loadGroup();
      } else {
        loadOtherUser();
        checkIfBlocked();
      }
      loadReactions();
      loadStarredMessages();
    }
  }, [id, isGroup, loadMessages, markAsRead, loadGroup, loadOtherUser, checkIfBlocked, loadReactions, loadStarredMessages]);

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

  const handleMessagePress = (message: Message) => {
    if (bulkSelectMode) {
      const newSelected = new Set(selectedMessages);
      if (newSelected.has(message.id)) {
        newSelected.delete(message.id);
      } else {
        newSelected.add(message.id);
      }
      setSelectedMessages(newSelected);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBlockUser = async () => {
    if (!otherUser || !user) return;

    Alert.alert(
      'Block User',
      `Are you sure you want to block ${otherUser.displayName}? They will not be able to message you or see your status.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const blockedJson = await AsyncStorage.getItem(`blocked_${user.id}`);
              const blocked = blockedJson ? JSON.parse(blockedJson) : [];
              
              blocked.push({
                id: otherUser.id,
                username: otherUser.username,
                displayName: otherUser.displayName,
                blockedAt: Date.now(),
              });

              await AsyncStorage.setItem(`blocked_${user.id}`, JSON.stringify(blocked));
              setIsBlocked(true);
              setSelectedMessageForActions(null);
              
              Alert.alert('User Blocked', `${otherUser.displayName} has been blocked.`);
            } catch (error) {
              console.log('Error blocking user:', error);
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleReportUser = () => {
    setSelectedMessageForActions(null);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason || !user || !otherUser) return;

    try {
      const report = {
        id: `report_${Date.now()}`,
        reporterId: user.id,
        reportedUserId: otherUser.id,
        reason: reportReason,
        details: reportDetails,
        messageContext: selectedMessageForActions?.originalText || '',
        timestamp: Date.now(),
      };

      const reportsJson = await AsyncStorage.getItem('reports');
      const reports = reportsJson ? JSON.parse(reportsJson) : [];
      reports.push(report);
      await AsyncStorage.setItem('reports', JSON.stringify(reports));

      setShowReportModal(false);
      setReportReason(null);
      setReportDetails('');
      
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it and take appropriate action.'
      );
    } catch (error) {
      console.log('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report');
    }
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

  const handleReplyToMessage = () => {
    if (selectedMessageForActions) {
      setReplyToMessage(selectedMessageForActions);
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

  const handleBulkDelete = async () => {
    try {
      const chatMessages = messages[id as string] || [];
      const updated = chatMessages.filter(m => !selectedMessages.has(m.id));
      await AsyncStorage.setItem(`messages_${id}`, JSON.stringify(updated));
      loadMessages(id as string);
      setSelectedMessages(new Set());
      setBulkSelectMode(false);
    } catch (error) {
      console.log('Error deleting messages:', error);
    }
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

    if (isBlocked) {
      Alert.alert('Cannot Send', 'You have blocked this user. Unblock them to send messages.');
      return;
    }

    if (isGroup) {
      await sendMessage(undefined, messageText.trim(), id as string);
    } else {
      await sendMessage(id as string, messageText.trim());
    }
    setMessageText('');
    setReplyToMessage(null);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMediaSelected = async (media: MediaAttachment) => {
    if (!id) return;

    if (isBlocked) {
      Alert.alert('Cannot Send', 'You have blocked this user. Unblock them to send messages.');
      return;
    }

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

  const renderMessageSwipeActions = (message: Message, isMe: boolean) => {
    if (isMe) {
      return (
        <View style={styles.swipeActionsLeft}>
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: colors.error }]}
            onPress={() => {
              setSelectedMessageForActions(message);
              handleDeleteMessage();
            }}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.swipeActionsRight}>
          <TouchableOpacity
            style={[styles.swipeAction, { backgroundColor: colors.primary }]}
            onPress={() => {
              setReplyToMessage(message);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol
              ios_icon_name="arrowshape.turn.up.left"
              android_material_icon_name="reply"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      );
    }
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

    const statusText = isBlocked ? 'Blocked' :
                      otherUser?.status?.type === 'available' ? 'Online' : 
                      otherUser?.status?.type === 'busy' ? 'Busy' :
                      otherUser?.status?.type === 'dnd' ? 'Do Not Disturb' :
                      otherUser?.lastSeen ? `Last seen ${formatTime(otherUser.lastSeen)}` : 'Offline';

    return (
      <View style={styles.headerTitle}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {otherUser?.displayName.charAt(0).toUpperCase()}
          </Text>
          {!isBlocked && otherUser?.status?.type === 'available' && (
            <View style={[styles.onlineIndicator, { backgroundColor: colors.online }]} />
          )}
        </View>
        <View>
          <Text style={styles.headerName}>{otherUser?.displayName || 'Chat'}</Text>
          <Text style={styles.headerStatus}>{statusText}</Text>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                onPress={() => {
                  setBulkSelectMode(!bulkSelectMode);
                  setSelectedMessages(new Set());
                }}
                style={styles.headerButton}
              >
                <IconSymbol
                  ios_icon_name={bulkSelectMode ? 'checkmark.circle.fill' : 'checkmark.circle'}
                  android_material_icon_name={bulkSelectMode ? 'check_circle' : 'check_circle_outline'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
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

        {bulkSelectMode && selectedMessages.size > 0 && (
          <BulkMessageActions
            selectedMessages={selectedMessages}
            allMessages={chatMessages}
            onClearSelection={() => {
              setSelectedMessages(new Set());
              setBulkSelectMode(false);
            }}
            onDeleteSelected={handleBulkDelete}
            chatName={isGroup ? group?.name || 'Group' : otherUser?.displayName || 'Chat'}
          />
        )}

        {replyToMessage && (
          <View style={[
            styles.replyPreview,
            { backgroundColor: isDark ? colors.cardDark : colors.card },
          ]}>
            <View style={styles.replyContent}>
              <IconSymbol
                ios_icon_name="arrowshape.turn.up.left"
                android_material_icon_name="reply"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.replyText, { color: isDark ? colors.textDark : colors.text }]} numberOfLines={1}>
                {replyToMessage.originalText}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyToMessage(null)}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {isBlocked && (
          <View style={[styles.blockedBanner, { backgroundColor: colors.error }]}>
            <IconSymbol
              ios_icon_name="hand.raised.fill"
              android_material_icon_name="block"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.blockedText}>
              You have blocked this user. Go to Privacy settings to unblock.
            </Text>
          </View>
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
              const isSelected = selectedMessages.has(message.id);

              return (
                <Swipeable
                  key={index}
                  renderLeftActions={isMe ? () => renderMessageSwipeActions(message, isMe) : undefined}
                  renderRightActions={!isMe ? () => renderMessageSwipeActions(message, isMe) : undefined}
                  overshootLeft={false}
                  overshootRight={false}
                >
                  <View
                    style={[
                      styles.messageWrapper,
                      isMe ? styles.messageWrapperMe : styles.messageWrapperOther,
                    ]}
                  >
                    <TouchableOpacity
                      onLongPress={() => handleLongPress(message)}
                      onPress={() => handleMessagePress(message)}
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
                          isSelected && styles.messageBubbleSelected,
                        ]}
                      >
                        {bulkSelectMode && (
                          <View style={styles.selectCheckbox}>
                            <View
                              style={[
                                styles.checkbox,
                                isSelected && { backgroundColor: colors.primary },
                              ]}
                            >
                              {isSelected && (
                                <IconSymbol
                                  ios_icon_name="checkmark"
                                  android_material_icon_name="check"
                                  size={14}
                                  color="#FFFFFF"
                                />
                              )}
                            </View>
                          </View>
                        )}
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
                </Swipeable>
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
            disabled={isBlocked}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={28}
              color={isBlocked ? colors.textSecondary : colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isBlocked}
          >
            <Text style={[styles.emojiButtonText, isBlocked && { opacity: 0.5 }]}>😊</Text>
          </TouchableOpacity>
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
                color: isDark ? colors.textDark : colors.text,
              },
            ]}
            placeholder={isBlocked ? 'Unblock to send messages' : 'Type a message...'}
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
            editable={!isBlocked}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || isBlocked}
          >
            <LinearGradient
              colors={messageText.trim() && !isBlocked ? [colors.primary, colors.secondary] : [colors.textSecondary, colors.textSecondary]}
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
              <TouchableOpacity style={styles.actionItem} onPress={handleReplyToMessage}>
                <IconSymbol
                  ios_icon_name="arrowshape.turn.up.left"
                  android_material_icon_name="reply"
                  size={20}
                  color={isDark ? colors.textDark : colors.text}
                />
                <Text style={[styles.actionText, { color: isDark ? colors.textDark : colors.text }]}>
                  Reply
                </Text>
              </TouchableOpacity>
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
              {!isGroup && (
                <>
                  <TouchableOpacity style={styles.actionItem} onPress={handleReportUser}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="report"
                      size={20}
                      color={colors.warning}
                    />
                    <Text style={[styles.actionText, { color: colors.warning }]}>
                      Report User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionItem} onPress={handleBlockUser}>
                    <IconSymbol
                      ios_icon_name="hand.raised.fill"
                      android_material_icon_name="block"
                      size={20}
                      color={colors.error}
                    />
                    <Text style={[styles.actionText, { color: colors.error }]}>
                      Block User
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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

        <Modal
          visible={showReportModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.reportModal,
              { backgroundColor: isDark ? colors.cardDark : colors.card },
            ]}>
              <View style={styles.reportHeader}>
                <Text style={[styles.reportTitle, { color: isDark ? colors.textDark : colors.text }]}>
                  Report User
                </Text>
                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.reportSubtitle, { color: colors.textSecondary }]}>
                Why are you reporting {otherUser?.displayName}?
              </Text>

              <TouchableOpacity
                style={[
                  styles.reportOption,
                  {
                    backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                    borderColor: reportReason === 'spam' ? colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setReportReason('spam')}
              >
                <IconSymbol
                  ios_icon_name="envelope.badge.fill"
                  android_material_icon_name="mark_email_unread"
                  size={24}
                  color={reportReason === 'spam' ? colors.primary : colors.textSecondary}
                />
                <View style={styles.reportOptionText}>
                  <Text style={[styles.reportOptionTitle, { color: isDark ? colors.textDark : colors.text }]}>
                    Spam
                  </Text>
                  <Text style={[styles.reportOptionDesc, { color: colors.textSecondary }]}>
                    Unwanted or repetitive messages
                  </Text>
                </View>
                {reportReason === 'spam' && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reportOption,
                  {
                    backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                    borderColor: reportReason === 'abuse' ? colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setReportReason('abuse')}
              >
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={24}
                  color={reportReason === 'abuse' ? colors.primary : colors.textSecondary}
                />
                <View style={styles.reportOptionText}>
                  <Text style={[styles.reportOptionTitle, { color: isDark ? colors.textDark : colors.text }]}>
                    Abuse
                  </Text>
                  <Text style={[styles.reportOptionDesc, { color: colors.textSecondary }]}>
                    Offensive or harmful content
                  </Text>
                </View>
                {reportReason === 'abuse' && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reportOption,
                  {
                    backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                    borderColor: reportReason === 'harassment' ? colors.primary : 'transparent',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setReportReason('harassment')}
              >
                <IconSymbol
                  ios_icon_name="hand.raised.fill"
                  android_material_icon_name="block"
                  size={24}
                  color={reportReason === 'harassment' ? colors.primary : colors.textSecondary}
                />
                <View style={styles.reportOptionText}>
                  <Text style={[styles.reportOptionTitle, { color: isDark ? colors.textDark : colors.text }]}>
                    Harassment
                  </Text>
                  <Text style={[styles.reportOptionDesc, { color: colors.textSecondary }]}>
                    Bullying or threatening behavior
                  </Text>
                </View>
                {reportReason === 'harassment' && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>

              <Text style={[styles.reportLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Additional details (optional)
              </Text>
              <TextInput
                style={[
                  styles.reportInput,
                  {
                    backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                    color: isDark ? colors.textDark : colors.text,
                    borderColor: isDark ? colors.borderDark : colors.border,
                  },
                ]}
                placeholder="Provide more context..."
                placeholderTextColor={colors.textSecondary}
                value={reportDetails}
                onChangeText={setReportDetails}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {selectedMessageForActions && (
                <View style={[
                  styles.messageContext,
                  { backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt },
                ]}>
                  <Text style={[styles.messageContextLabel, { color: colors.textSecondary }]}>
                    Message context:
                  </Text>
                  <Text style={[styles.messageContextText, { color: isDark ? colors.textDark : colors.text }]}>
                    &quot;{selectedMessageForActions.originalText}&quot;
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitReportButton,
                  { opacity: reportReason ? 1 : 0.5 },
                ]}
                onPress={submitReport}
                disabled={!reportReason}
              >
                <LinearGradient
                  colors={reportReason ? [colors.error, '#DC2626'] : [colors.textSecondary, colors.textSecondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitReportButtonGradient}
                >
                  <IconSymbol
                    ios_icon_name="paperplane.fill"
                    android_material_icon_name="send"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.submitReportButtonText}>Submit Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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
    </GestureHandlerRootView>
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
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  blockedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  replyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
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
  messageBubbleSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectCheckbox: {
    position: 'absolute',
    top: -8,
    left: -8,
    zIndex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
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
  swipeActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginRight: 8,
  },
  swipeActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 8,
  },
  swipeAction: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
  reportModal: {
    borderRadius: 24,
    padding: 24,
    maxWidth: 500,
    width: '90%',
    maxHeight: '80%',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  reportSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Inter_400Regular',
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  reportOptionText: {
    flex: 1,
  },
  reportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  reportOptionDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  reportLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  reportInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 100,
    fontFamily: 'Inter_400Regular',
  },
  messageContext: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageContextLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  messageContextText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Inter_400Regular',
  },
  submitReportButton: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(239, 68, 68, 0.3)',
  },
  submitReportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitReportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
