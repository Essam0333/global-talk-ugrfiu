
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { getLanguageName } from '@/utils/languages';

const MOOD_EMOJIS = ['😊', '😎', '🤔', '😴', '🎉', '💪', '🌟', '❤️'];

export default function ContactsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        setAllUsers(users.filter((u: User) => u.id !== user?.id));
      }
    } catch (error) {
      console.log('Error loading users:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = allUsers.filter(
    u =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const getRandomMoodEmoji = () => {
    return MOOD_EMOJIS[Math.floor(Math.random() * MOOD_EMOJIS.length)];
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Contacts</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[
          styles.searchContainer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color="rgba(255, 255, 255, 0.8)"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No contacts found
            </Text>
          </View>
        ) : (
          filteredUsers.map((contact, index) => {
            const moodEmoji = getRandomMoodEmoji();
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: isDark ? colors.cardDark : colors.card,
                  },
                ]}
                onPress={() => handleStartChat(contact.id)}
              >
                <View style={styles.contactContent}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient
                      colors={[colors.primary, colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {contact.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <View style={styles.moodEmoji}>
                      <Text style={styles.moodEmojiText}>{moodEmoji}</Text>
                    </View>
                    <View style={[styles.onlineIndicator, { backgroundColor: colors.online }]} />
                  </View>
                  
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: isDark ? colors.textDark : colors.text }]}>
                      {contact.displayName}
                    </Text>
                    <Text style={[styles.contactUsername, { color: colors.textSecondary }]}>
                      @{contact.username}
                    </Text>
                    <View style={styles.languageTag}>
                      <IconSymbol
                        ios_icon_name="globe"
                        android_material_icon_name="language"
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={[styles.languageText, { color: colors.primary }]}>
                        {getLanguageName(contact.preferredLanguage)}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => handleStartChat(contact.id)}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatButtonGradient}
                  >
                    <IconSymbol
                      ios_icon_name="bubble.left.fill"
                      android_material_icon_name="chat"
                      size={20}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </TouchableOpacity>
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
  },
  contactList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  moodEmoji: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  moodEmojiText: {
    fontSize: 14,
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  contactUsername: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'Inter_400Regular',
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  languageText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  chatButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
