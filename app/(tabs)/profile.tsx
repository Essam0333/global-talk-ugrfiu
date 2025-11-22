
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Switch,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { getLanguageName } from '@/utils/languages';

const MOOD_EMOJIS = ['😊', '😎', '🤔', '😴', '🎉', '💪', '🌟', '❤️'];
const STATUS_OPTIONS = [
  { type: 'available', label: 'Available', icon: '✅' },
  { type: 'busy', label: 'Busy', icon: '🔴' },
  { type: 'dnd', label: 'Do Not Disturb', icon: '🚫' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, updateUser } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [selectedMood, setSelectedMood] = useState(user?.emojiStatus || '😊');
  const [selectedStatus, setSelectedStatus] = useState(user?.status?.type || 'available');

  const handleMoodChange = async (emoji: string) => {
    setSelectedMood(emoji);
    await updateUser({ emojiStatus: emoji });
  };

  const handleStatusChange = async (statusType: string) => {
    setSelectedStatus(statusType);
    const statusOption = STATUS_OPTIONS.find(s => s.type === statusType);
    await updateUser({
      status: {
        type: statusType as 'available' | 'busy' | 'dnd',
        customText: statusOption?.label,
      },
    });
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.primaryDark, colors.secondaryDark] : [colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)']}
              style={styles.avatarLarge}
            >
              <Text style={styles.avatarLargeText}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.moodSelector}>
              <Text style={styles.moodEmoji}>{selectedMood}</Text>
            </View>
          </View>
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          <View style={styles.statusBadge}>
            <Text style={styles.statusEmoji}>
              {STATUS_OPTIONS.find(s => s.type === selectedStatus)?.icon}
            </Text>
            <Text style={styles.statusText}>
              {STATUS_OPTIONS.find(s => s.type === selectedStatus)?.label}
            </Text>
          </View>
        </View>

        <View style={styles.moodPicker}>
          <Text style={styles.moodPickerLabel}>Select your mood:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodList}>
            {MOOD_EMOJIS.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === emoji && styles.moodButtonSelected,
                ]}
                onPress={() => handleMoodChange(emoji)}
              >
                <Text style={styles.moodButtonEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            Status
          </Text>
          {STATUS_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.statusCard,
                {
                  backgroundColor: isDark ? colors.cardDark : colors.card,
                  borderColor: selectedStatus === option.type ? colors.primary : 'transparent',
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleStatusChange(option.type)}
            >
              <Text style={styles.statusCardEmoji}>{option.icon}</Text>
              <Text style={[styles.statusCardLabel, { color: isDark ? colors.textDark : colors.text }]}>
                {option.label}
              </Text>
              {selectedStatus === option.type && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            Quick Access
          </Text>

          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
              },
            ]}
            onPress={() => router.push('/starred')}
          >
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.warning, '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Starred Messages
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                View your starred messages
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            Appearance
          </Text>

          <View style={[
            styles.settingCard,
            {
              backgroundColor: isDark ? colors.cardDark : colors.card,
            },
          ]}>
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name="textformat.size"
                  android_material_icon_name="format_size"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Font Size
              </Text>
              <View style={styles.fontSizeButtons}>
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      settings.fontSize === size && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleFontSizeChange(size)}
                  >
                    <Text
                      style={[
                        styles.fontSizeButtonText,
                        settings.fontSize === size && { color: '#FFFFFF' },
                      ]}
                    >
                      {size.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={[
            styles.settingCard,
            {
              backgroundColor: isDark ? colors.cardDark : colors.card,
            },
          ]}>
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name={isDark ? 'moon.fill' : 'sun.max.fill'}
                  android_material_icon_name={isDark ? 'dark_mode' : 'light_mode'}
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Theme
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'} (Auto)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            Settings
          </Text>

          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
              },
            ]}
          >
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="language"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Preferred Language
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {getLanguageName(user.preferredLanguage)}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
              },
            ]}
            onPress={() => router.push('/(tabs)/contacts')}
          >
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name="person.2.fill"
                  android_material_icon_name="people"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Contacts
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Manage your contacts
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <View style={[
            styles.settingCard,
            {
              backgroundColor: isDark ? colors.cardDark : colors.card,
            },
          ]}>
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name="bell.fill"
                  android_material_icon_name="notifications"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingCard,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
              },
            ]}
            onPress={() => router.push('/privacy')}
          >
            <View style={styles.settingIcon}>
              <LinearGradient
                colors={[colors.error, '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.settingIconGradient}
              >
                <IconSymbol
                  ios_icon_name="hand.raised.fill"
                  android_material_icon_name="block"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Privacy & Security
              </Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                Block users and manage privacy
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            About
          </Text>

          <View style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? colors.cardDark : colors.card,
            },
          ]}>
            <View style={styles.infoHeader}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('@/assets/images/2ad18e60-a001-4839-ab8d-c2cf85815ff0.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.infoTitle, { color: isDark ? colors.textDark : colors.text }]}>
                GlobalTalk
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Chat across languages seamlessly with automatic translation. Connect with people worldwide! 🌟
            </Text>
            <Text style={[styles.infoVersion, { color: colors.textSecondary }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  moodSelector: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  },
  moodEmoji: {
    fontSize: 20,
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  username: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  moodPicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  moodPickerLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  moodList: {
    flexDirection: 'row',
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  moodButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
  },
  moodButtonEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    gap: 12,
  },
  statusCardEmoji: {
    fontSize: 24,
  },
  statusCardLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  settingValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  fontSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    padding: 4,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  infoVersion: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
