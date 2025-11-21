
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from "react-native";
import { router, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, user } = useAuth();
  const { conversations } = useChat();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
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

  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  const getUserById = (userId: string) => {
    return allUsers.find(u => u.id === userId);
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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>
          Chats
        </Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => router.push('/(tabs)/contacts')}
        >
          <IconSymbol
            ios_icon_name="square.and.pencil"
            android_material_icon_name="edit"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="bubble.left.and.bubble.right"
              android_material_icon_name="chat"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No conversations yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Start a new chat from your contacts
            </Text>
            <TouchableOpacity
              style={[styles.startChatButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/contacts')}
            >
              <Text style={styles.startChatButtonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        ) : (
          conversations.map((conversation, index) => {
            const otherUser = getUserById(conversation.userId);
            if (!otherUser) return null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chatItem,
                  {
                    backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                    borderBottomColor: isDark ? colors.borderDark : colors.border,
                  },
                ]}
                onPress={() => router.push(`/chat/${conversation.userId}`)}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {otherUser.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, { color: isDark ? colors.textDark : colors.text }]}>
                      {otherUser.displayName}
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
                      {conversation.lastMessage?.originalText || 'No messages yet'}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  newChatButton: {
    padding: 8,
  },
  chatList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
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
  },
  chatTime: {
    fontSize: 14,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatMessage: {
    fontSize: 15,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
