
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { User, Group, Message } from '@/types';

interface ForwardMessageModalProps {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
  onForward: (targetIds: string[], message: Message) => void;
}

export default function ForwardMessageModal({
  visible,
  message,
  onClose,
  onForward,
}: ForwardMessageModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      loadContacts();
      setSelectedTargets([]);
    }
  }, [visible]);

  const loadContacts = async () => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      const groupsJson = await AsyncStorage.getItem('groups');
      
      if (usersJson) {
        setUsers(JSON.parse(usersJson));
      }
      if (groupsJson) {
        setGroups(JSON.parse(groupsJson));
      }
    } catch (error) {
      console.log('Error loading contacts:', error);
    }
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleForward = () => {
    if (message && selectedTargets.length > 0) {
      onForward(selectedTargets, message);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? colors.backgroundDark : colors.background },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={isDark ? colors.textDark : colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>
              Forward Message
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {users.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  CONTACTS
                </Text>
                {users.map((user, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.item,
                      { backgroundColor: isDark ? colors.cardDark : colors.card },
                    ]}
                    onPress={() => toggleTarget(user.id)}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {user.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <Text style={[styles.itemName, { color: isDark ? colors.textDark : colors.text }]}>
                      {user.displayName}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedTargets.includes(user.id)
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selectedTargets.includes(user.id)
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                    >
                      {selectedTargets.includes(user.id) && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {groups.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  GROUPS
                </Text>
                {groups.map((group, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.item,
                      { backgroundColor: isDark ? colors.cardDark : colors.card },
                    ]}
                    onPress={() => toggleTarget(group.id)}
                  >
                    <LinearGradient
                      colors={[colors.secondary, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {group.name.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <Text style={[styles.itemName, { color: isDark ? colors.textDark : colors.text }]}>
                      {group.name}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedTargets.includes(group.id)
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selectedTargets.includes(group.id)
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                    >
                      {selectedTargets.includes(group.id) && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.forwardButton,
                { opacity: selectedTargets.length === 0 ? 0.5 : 1 },
              ]}
              onPress={handleForward}
              disabled={selectedTargets.length === 0}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.forwardButtonGradient}
              >
                <IconSymbol
                  ios_icon_name="arrow.forward"
                  android_material_icon_name="send"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.forwardButtonText}>
                  Forward to {selectedTargets.length}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  forwardButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  forwardButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  forwardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
  },
});
