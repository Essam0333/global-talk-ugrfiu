
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from "react-native";
import { router, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Group } from "@/types";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, user } = useAuth();
  const { conversations } = useChat();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadGroups();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        setAllUsers(users.filter((u: User) => u.id !== user?.id));
      }
    } catch (error) {
      console.log('Error loading users:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsJson = await AsyncStorage.getItem('groups');
      if (groupsJson) {
        setAllGroups(JSON.parse(groupsJson));
      }
    } catch (error) {
      console.log('Error loading groups:', error);
    }
  };

  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  const getUserById = (userId: string) => {
    return allUsers.find(u => u.id === userId);
  };

  const getGroupById = (groupId: string) => {
    return allGroups.find(g => g.id === groupId);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMessagePreview = (message: any) => {
    if (message.mediaType) {
      const mediaIcons: Record<string, string> = {
        image: '📷 Photo',
        video: '🎥 Video',
        document: '📄 Document',
        voice: '🎤 Voice message',
        location: '📍 Location',
        contact: '👤 Contact',
      };
      return mediaIcons[message.mediaType] || 'Media';
    }
    return message.originalText || 'No messages yet';
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.primaryDark, colors.secondaryDark] : [colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.title}>{user?.displayName}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/group/create')}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                style={styles.headerButtonGradient}
              >
                <IconSymbol
                  ios_icon_name="person.3.fill"
                  android_material_icon_name="group_add"
                  size={22}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/(tabs)/contacts')}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
                style={styles.headerButtonGradient}
              >
                <IconSymbol
                  ios_icon_name="square.and.pencil"
                  android_material_icon_name="edit"
                  size={22}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
          Messages
        </Text>

        <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start a new chat or create a group 🌟
              </Text>
              <View style={styles.emptyButtons}>
                <TouchableOpacity
                  style={styles.startChatButton}
                  onPress={() => router.push('/(tabs)/contacts')}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startChatButtonGradient}
                  >
                    <Text style={styles.startChatButtonText}>Start Chat</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createGroupButton}
                  onPress={() => router.push('/group/create')}
                >
                  <LinearGradient
                    colors={[colors.secondary, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startChatButtonGradient}
                  >
                    <Text style={styles.startChatButtonText}>Create Group</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            conversations.map((conversation, index) => {
              const isGroup = conversation.isGroup;
              const chatData = isGroup 
                ? getGroupById(conversation.groupId!)
                : getUserById(conversation.userId!);
              
              if (!chatData) return null;

              const chatId = isGroup ? conversation.groupId : conversation.userId;
              const displayName = isGroup ? (chatData as Group).name : (chatData as User).displayName;
              const memberCount = isGroup ? (chatData as Group).members.length : undefined;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chatItem,
                    {
                      backgroundColor: isDark ? colors.cardDark : colors.card,
                    },
                  ]}
                  onPress={() => router.push(`/chat/${chatId}`)}
                >
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={isGroup ? [colors.secondary, colors.primary] : [colors.primary, colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    {!isGroup && <View style={[styles.onlineIndicator, { backgroundColor: colors.online }]} />}
                    {isGroup && (
                      <View style={styles.groupBadge}>
                        <IconSymbol
                          ios_icon_name="person.3.fill"
                          android_material_icon_name="group"
                          size={12}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={[styles.chatName, { color: isDark ? colors.textDark : colors.text }]}>
                        {displayName}
                      </Text>
                      {conversation.lastMessage && (
                        <Text style={[styles.chatTime, { color: colors.textSecondary }]}>
                          {formatTime(conversation.lastMessage.timestamp)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.chatPreview}>
                      <Text
                        style={[styles.chatMessage, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage ? getMessagePreview(conversation.lastMessage) : (isGroup ? `${memberCount} members` : 'No messages yet')}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.unreadBadge}
                        >
                          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                        </LinearGradient>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
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
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startChatButton: {
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(37, 99, 235, 0.3)',
  },
  createGroupButton: {
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(13, 148, 136, 0.3)',
  },
  startChatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.card,
  },
  groupBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  chatTime: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatMessage: {
    fontSize: 15,
    flex: 1,
    fontFamily: 'Inter_400Regular',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
