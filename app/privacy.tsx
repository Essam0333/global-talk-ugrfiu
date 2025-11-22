
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { User } from '@/types';

interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  blockedAt: number;
}

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, updateUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const loadBlockedUsers = useCallback(async () => {
    if (!user) return;

    try {
      const blockedJson = await AsyncStorage.getItem(`blocked_${user.id}`);
      if (blockedJson) {
        setBlockedUsers(JSON.parse(blockedJson));
      }
    } catch (error) {
      console.log('Error loading blocked users:', error);
    }
  }, [user]);

  const loadAllUsers = useCallback(async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        setAllUsers(users.filter((u: User) => u.id !== user?.id));
      }
    } catch (error) {
      console.log('Error loading users:', error);
    }
  }, [user]);

  useEffect(() => {
    loadBlockedUsers();
    loadAllUsers();
  }, [loadBlockedUsers, loadAllUsers]);

  const handleBlockUser = async (targetUser: User) => {
    if (!user) return;

    try {
      const newBlockedUser: BlockedUser = {
        id: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        blockedAt: Date.now(),
      };

      const updatedBlocked = [...blockedUsers, newBlockedUser];
      await AsyncStorage.setItem(`blocked_${user.id}`, JSON.stringify(updatedBlocked));
      
      const updatedBlockedIds = [...(user.blockedUsers || []), targetUser.id];
      await updateUser({ blockedUsers: updatedBlockedIds });

      setBlockedUsers(updatedBlocked);
      setShowBlockModal(false);
      setSearchQuery('');
      
      Alert.alert(
        'User Blocked',
        `${targetUser.displayName} has been blocked. They cannot message you or see your status.`
      );
    } catch (error) {
      console.log('Error blocking user:', error);
      Alert.alert('Error', 'Failed to block user');
    }
  };

  const handleUnblockUser = async (blockedUser: BlockedUser) => {
    if (!user) return;

    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${blockedUser.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              const updatedBlocked = blockedUsers.filter(u => u.id !== blockedUser.id);
              await AsyncStorage.setItem(`blocked_${user.id}`, JSON.stringify(updatedBlocked));
              
              const updatedBlockedIds = (user.blockedUsers || []).filter(id => id !== blockedUser.id);
              await updateUser({ blockedUsers: updatedBlockedIds });

              setBlockedUsers(updatedBlocked);
              
              Alert.alert('User Unblocked', `${blockedUser.displayName} has been unblocked.`);
            } catch (error) {
              console.log('Error unblocking user:', error);
              Alert.alert('Error', 'Failed to unblock user');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = allUsers.filter(u => {
    const isBlocked = blockedUsers.some(b => b.id === u.id);
    const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.username.toLowerCase().includes(searchQuery.toLowerCase());
    return !isBlocked && matchesSearch;
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: isDark ? colors.primaryDark : colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Privacy & Security',
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
                Blocked Users
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowBlockModal(true)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.addButtonText}>Block User</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {blockedUsers.length === 0 ? (
              <View style={[
                styles.emptyCard,
                { backgroundColor: isDark ? colors.cardDark : colors.card },
              ]}>
                <IconSymbol
                  ios_icon_name="hand.raised.fill"
                  android_material_icon_name="block"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No blocked users
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Block users to prevent them from messaging you
                </Text>
              </View>
            ) : (
              blockedUsers.map((blockedUser, index) => (
                <View
                  key={index}
                  style={[
                    styles.blockedUserCard,
                    { backgroundColor: isDark ? colors.cardDark : colors.card },
                  ]}
                >
                  <View style={styles.blockedUserAvatar}>
                    <Text style={styles.blockedUserAvatarText}>
                      {blockedUser.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.blockedUserInfo}>
                    <Text style={[styles.blockedUserName, { color: isDark ? colors.textDark : colors.text }]}>
                      {blockedUser.displayName}
                    </Text>
                    <Text style={[styles.blockedUserUsername, { color: colors.textSecondary }]}>
                      @{blockedUser.username}
                    </Text>
                    <Text style={[styles.blockedUserDate, { color: colors.textSecondary }]}>
                      Blocked {new Date(blockedUser.blockedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.unblockButton, { backgroundColor: colors.error }]}
                    onPress={() => handleUnblockUser(blockedUser)}
                  >
                    <IconSymbol
                      ios_icon_name="hand.raised.slash"
                      android_material_icon_name="block"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.unblockButtonText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
              About Blocking
            </Text>
            <View style={[
              styles.infoCard,
              { backgroundColor: isDark ? colors.cardDark : colors.card },
            ]}>
              <View style={styles.infoItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.textDark : colors.text }]}>
                  Blocked users cannot send you messages
                </Text>
              </View>
              <View style={styles.infoItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.textDark : colors.text }]}>
                  They cannot see your online status
                </Text>
              </View>
              <View style={styles.infoItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.textDark : colors.text }]}>
                  Messages from blocked users are auto-rejected
                </Text>
              </View>
              <View style={styles.infoItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={[styles.infoText, { color: isDark ? colors.textDark : colors.text }]}>
                  You can unblock users at any time
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showBlockModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBlockModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              { backgroundColor: isDark ? colors.cardDark : colors.card },
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: isDark ? colors.textDark : colors.text }]}>
                  Block User
                </Text>
                <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={[
                styles.searchContainer,
                {
                  backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                  borderColor: isDark ? colors.borderDark : colors.border,
                },
              ]}>
                <IconSymbol
                  ios_icon_name="magnifyingglass"
                  android_material_icon_name="search"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? colors.textDark : colors.text }]}
                  placeholder="Search users..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
                {filteredUsers.length === 0 ? (
                  <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                    {searchQuery ? 'No users found' : 'No users available'}
                  </Text>
                ) : (
                  filteredUsers.map((targetUser, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.userItem,
                        { backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt },
                      ]}
                      onPress={() => handleBlockUser(targetUser)}
                    >
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {targetUser.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: isDark ? colors.textDark : colors.text }]}>
                          {targetUser.displayName}
                        </Text>
                        <Text style={[styles.userUsername, { color: colors.textSecondary }]}>
                          @{targetUser.username}
                        </Text>
                      </View>
                      <IconSymbol
                        ios_icon_name="hand.raised.fill"
                        android_material_icon_name="block"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.2)',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  blockedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
  },
  blockedUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  blockedUserAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  blockedUserInfo: {
    flex: 1,
  },
  blockedUserName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  blockedUserUsername: {
    fontSize: 14,
    marginBottom: 2,
    fontFamily: 'Inter_400Regular',
  },
  blockedUserDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  unblockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  userList: {
    maxHeight: 400,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 40,
    fontFamily: 'Inter_400Regular',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  userUsername: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
