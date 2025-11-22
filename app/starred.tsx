
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Stack, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Message, StarredMessage, User, Group } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function StarredMessagesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [starredMessages, setStarredMessages] = useState<(StarredMessage & { message: Message })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'chat'>('date');

  const loadStarredMessages = useCallback(async () => {
    if (!user) return;

    try {
      const starredJson = await AsyncStorage.getItem(`starred_${user.id}`);
      if (starredJson) {
        const starred: StarredMessage[] = JSON.parse(starredJson);
        
        const messagesWithContent = await Promise.all(
          starred.map(async (star) => {
            const messagesJson = await AsyncStorage.getItem(`messages_${star.chatId}`);
            if (messagesJson) {
              const messages: Message[] = JSON.parse(messagesJson);
              const message = messages.find(m => m.id === star.messageId);
              if (message) {
                return { ...star, message };
              }
            }
            return null;
          })
        );

        setStarredMessages(messagesWithContent.filter(Boolean) as (StarredMessage & { message: Message })[]);
      }
    } catch (error) {
      console.log('Error loading starred messages:', error);
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      const groupsJson = await AsyncStorage.getItem('groups');
      
      if (usersJson) setUsers(JSON.parse(usersJson));
      if (groupsJson) setGroups(JSON.parse(groupsJson));
    } catch (error) {
      console.log('Error loading contacts:', error);
    }
  };

  useEffect(() => {
    loadStarredMessages();
    loadContacts();
  }, [loadStarredMessages]);

  const getChatName = (chatId: string) => {
    const user = users.find(u => u.id === chatId);
    if (user) return user.displayName;
    
    const group = groups.find(g => g.id === chatId);
    if (group) return group.name;
    
    return 'Unknown';
  };

  const handleUnstar = async (messageId: string) => {
    if (!user) return;

    try {
      const starredJson = await AsyncStorage.getItem(`starred_${user.id}`);
      if (starredJson) {
        const starred: StarredMessage[] = JSON.parse(starredJson);
        const updated = starred.filter(s => s.messageId !== messageId);
        await AsyncStorage.setItem(`starred_${user.id}`, JSON.stringify(updated));
        setStarredMessages(prev => prev.filter(s => s.messageId !== messageId));
      }
    } catch (error) {
      console.log('Error unstarring message:', error);
    }
  };

  const navigateToMessage = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const sortedMessages = [...starredMessages].sort((a, b) => {
    if (sortBy === 'date') {
      return b.createdAt - a.createdAt;
    } else {
      return a.chatId.localeCompare(b.chatId);
    }
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: isDark ? colors.primaryDark : colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Starred Messages',
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
        }}
      />
      <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
        <View style={styles.sortBar}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === 'date' && { backgroundColor: isDark ? colors.primaryDark : colors.primary },
            ]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
              By Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === 'chat' && { backgroundColor: isDark ? colors.primaryDark : colors.primary },
            ]}
            onPress={() => setSortBy('chat')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'chat' && styles.sortButtonTextActive]}>
              By Chat
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {sortedMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No starred messages
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Long press on any message to star it
              </Text>
            </View>
          ) : (
            sortedMessages.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.messageCard,
                  { backgroundColor: isDark ? colors.cardDark : colors.card },
                ]}
                onPress={() => navigateToMessage(item.chatId)}
              >
                <View style={styles.messageHeader}>
                  <View style={styles.chatInfo}>
                    <Text style={[styles.chatName, { color: isDark ? colors.textDark : colors.text }]}>
                      {getChatName(item.chatId)}
                    </Text>
                    <Text style={[styles.messageDate, { color: colors.textSecondary }]}>
                      {formatTime(item.message.timestamp)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnstar(item.messageId)}
                    style={styles.unstarButton}
                  >
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={20}
                      color={colors.warning}
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.messageText, { color: isDark ? colors.textDark : colors.text }]}
                  numberOfLines={3}
                >
                  {item.message.originalText || '📎 Media message'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
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
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  messageCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  messageDate: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  unstarButton: {
    padding: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
});
