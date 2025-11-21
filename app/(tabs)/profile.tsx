
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { getLanguageName } from '@/utils/languages';

const MOOD_EMOJIS = ['😊', '😎', '🤔', '😴', '🎉', '💪', '🌟', '❤️'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  const [selectedMood, setSelectedMood] = React.useState('😊');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
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
                onPress={() => setSelectedMood(emoji)}
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
                Manage notifications
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
              <Text style={styles.infoEmoji}>🌍</Text>
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

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={[colors.error, '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutButtonGradient}
          >
            <IconSymbol
              ios_icon_name="rectangle.portrait.and.arrow.right"
              android_material_icon_name="logout"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    fontFamily: 'Inter_400Regular',
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
  infoEmoji: {
    fontSize: 28,
    marginRight: 12,
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
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(239, 68, 68, 0.3)',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
  },
});
