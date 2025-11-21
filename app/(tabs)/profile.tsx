
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
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { getLanguageName } from '@/utils/languages';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();

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
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>
          Profile
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLargeText}>
              {user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.displayName, { color: isDark ? colors.textDark : colors.text }]}>
            {user.displayName}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>
            @{user.username}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            Settings
          </Text>

          <View style={[
            styles.settingItem,
            {
              backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
              borderColor: isDark ? colors.borderDark : colors.border,
            },
          ]}>
            <View style={styles.settingIcon}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="language"
                size={24}
                color={colors.primary}
              />
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
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                borderColor: isDark ? colors.borderDark : colors.border,
              },
            ]}
            onPress={() => router.push('/(tabs)/contacts')}
          >
            <View style={styles.settingIcon}>
              <IconSymbol
                ios_icon_name="person.2.fill"
                android_material_icon_name="people"
                size={24}
                color={colors.primary}
              />
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textDark : colors.text }]}>
            About
          </Text>

          <View style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
              borderColor: isDark ? colors.borderDark : colors.border,
            },
          ]}>
            <Text style={[styles.infoTitle, { color: isDark ? colors.textDark : colors.text }]}>
              GlobalTalk
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Chat across languages seamlessly with automatic translation.
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <IconSymbol
            ios_icon_name="rectangle.portrait.and.arrow.right"
            android_material_icon_name="logout"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '600',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
