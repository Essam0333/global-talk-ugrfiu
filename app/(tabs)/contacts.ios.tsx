
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol.ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { getLanguageName } from '@/utils/languages';

export default function ContactsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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

  const filteredUsers = allUsers.filter(
    u =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Contacts",
          headerLargeTitle: true,
        }}
      />
      <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textDark : colors.text }]}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol
                ios_icon_name="person.2"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No contacts found
              </Text>
            </View>
          ) : (
            filteredUsers.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactItem,
                  {
                    backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                    borderBottomColor: isDark ? colors.borderDark : colors.border,
                  },
                ]}
                onPress={() => handleStartChat(contact.id)}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {contact.displayName.charAt(0).toUpperCase()}
                  </Text>
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
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.languageText, { color: colors.textSecondary }]}>
                      {getLanguageName(contact.preferredLanguage)}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="bubble.left.fill"
                  size={24}
                  color={colors.primary}
                />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  contactList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
