
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: isDark ? colors.cardDark : colors.card }]}
        onPress={() => router.back()}
      >
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow_back"
          size={24}
          color={isDark ? colors.textDark : colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: isDark ? colors.cardDark : colors.card }]}
        onPress={() => router.push('/signup')}
      >
        <IconSymbol
          ios_icon_name="pencil"
          android_material_icon_name="edit"
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <LinearGradient
          colors={isDark ? [colors.primaryDark, colors.secondaryDark] : [colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoContainer}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/1fc748b5-afe0-451c-a430-121058317495.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <Text style={[styles.appName, { color: isDark ? colors.textDark : colors.text }]}>
          GlobalTalk
        </Text>

        <View style={styles.divider} />

        <View style={styles.userInfoContainer}>
          <View style={[styles.userCard, { backgroundColor: isDark ? colors.cardDark : colors.card }]}>
            <LinearGradient
              colors={isDark ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>

            <View style={styles.userDetails}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Name
              </Text>
              <Text style={[styles.displayName, { color: isDark ? colors.textDark : colors.text }]}>
                {user.displayName}
              </Text>
            </View>
          </View>

          <View style={[styles.userCard, { backgroundColor: isDark ? colors.cardDark : colors.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt }]}>
              <IconSymbol
                ios_icon_name="at"
                android_material_icon_name="alternate_email"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.userDetails}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Username
              </Text>
              <Text style={[styles.username, { color: isDark ? colors.textDark : colors.text }]}>
                @{user.username}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/(tabs)/(home)/')}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              Continue to Chat
            </Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow_forward"
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  editButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0px 8px 32px rgba(37, 99, 235, 0.3)',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
    fontFamily: 'Inter_700Bold',
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: 40,
  },
  userInfoContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  username: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
    boxShadow: '0px 4px 16px rgba(37, 99, 235, 0.3)',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
