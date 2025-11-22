
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Group, GroupMember } from '@/types';

export default function CreateGroupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

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

  const handleSelectPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setGroupPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error selecting photo:', error);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    if (!user) return;

    try {
      const members: GroupMember[] = [
        {
          userId: user.id,
          joinedAt: Date.now(),
          preferredLanguage: user.preferredLanguage,
          isMuted: false,
          role: 'admin',
        },
        ...selectedMembers.map(userId => {
          const member = allUsers.find(u => u.id === userId);
          return {
            userId,
            joinedAt: Date.now(),
            preferredLanguage: member?.preferredLanguage || 'en',
            isMuted: false,
            role: 'member' as const,
          };
        }),
      ];

      const newGroup: Group = {
        id: `group_${Date.now()}`,
        name: groupName.trim(),
        description: groupDescription.trim(),
        photo: groupPhoto || undefined,
        members,
        admins: [user.id],
        createdBy: user.id,
        createdAt: Date.now(),
        isPrivate,
      };

      const groupsJson = await AsyncStorage.getItem('groups');
      const groups = groupsJson ? JSON.parse(groupsJson) : [];
      groups.push(newGroup);
      await AsyncStorage.setItem('groups', JSON.stringify(groups));

      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.log('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: isDark ? colors.primaryDark : colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Create Group',
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.photoContainer} onPress={handleSelectPhoto}>
            {groupPhoto ? (
              <Image source={{ uri: groupPhoto }} style={styles.groupPhoto} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: isDark ? colors.cardDark : colors.backgroundAlt }]}>
                <IconSymbol
                  ios_icon_name="camera.fill"
                  android_material_icon_name="camera_alt"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={[styles.photoText, { color: colors.textSecondary }]}>
                  Add Group Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>
              Group Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.cardDark : colors.card,
                  color: isDark ? colors.textDark : colors.text,
                  borderColor: isDark ? colors.borderDark : colors.border,
                },
              ]}
              placeholder="Enter group name"
              placeholderTextColor={colors.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? colors.cardDark : colors.card,
                  color: isDark ? colors.textDark : colors.text,
                  borderColor: isDark ? colors.borderDark : colors.border,
                },
              ]}
              placeholder="Enter group description"
              placeholderTextColor={colors.textSecondary}
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View>
                <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>
                  Private Group
                </Text>
                <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
                  Only invited members can join
                </Text>
              </View>
              <View
                style={[
                  styles.switch,
                  { backgroundColor: isPrivate ? colors.primary : colors.textSecondary },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    { transform: [{ translateX: isPrivate ? 20 : 0 }] },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>
              Add Members ({selectedMembers.length})
            </Text>
            {allUsers.map((member, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.memberItem,
                  {
                    backgroundColor: isDark ? colors.cardDark : colors.card,
                    borderColor: selectedMembers.includes(member.id)
                      ? colors.primary
                      : isDark ? colors.borderDark : colors.border,
                  },
                ]}
                onPress={() => toggleMember(member.id)}
              >
                <View style={styles.memberInfo}>
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.memberAvatar}
                  >
                    <Text style={styles.memberAvatarText}>
                      {member.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={styles.memberDetails}>
                    <Text style={[styles.memberName, { color: isDark ? colors.textDark : colors.text }]}>
                      {member.displayName}
                    </Text>
                    <Text style={[styles.memberLanguage, { color: colors.textSecondary }]}>
                      {member.preferredLanguage.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {selectedMembers.includes(member.id) && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>Create Group</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  groupPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    fontFamily: 'Inter_400Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyDescription: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  memberLanguage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(37, 99, 235, 0.3)',
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
