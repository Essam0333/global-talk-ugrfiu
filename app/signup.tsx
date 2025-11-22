
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  const checkUsernameUnique = async (usernameToCheck: string): Promise<boolean> => {
    try {
      const usersJson = await AsyncStorage.getItem('users');
      if (!usersJson) return true;

      const users: User[] = JSON.parse(usersJson);
      // Check if username exists and is not the current user's username
      const existingUser = users.find(
        u => u.username.toLowerCase() === usernameToCheck.toLowerCase() && u.id !== user?.id
      );
      
      return !existingUser;
    } catch (error) {
      console.log('Error checking username:', error);
      return true;
    }
  };

  const validateUsername = (text: string): boolean => {
    // Username must be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(text);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert(
        'Invalid Username',
        'Username must be 3-20 characters long and can only contain letters, numbers, and underscores'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Check if username is unique
      const isUnique = await checkUsernameUnique(username);
      
      if (!isUnique) {
        Alert.alert(
          'Username Taken',
          'This username is already taken. Please choose a different one.'
        );
        setIsLoading(false);
        return;
      }

      // Update user
      await updateUser({
        username: username.toLowerCase(),
        displayName: displayName.trim(),
      });

      // Update in users list
      const usersJson = await AsyncStorage.getItem('users');
      let users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      const userIndex = users.findIndex(u => u.id === user?.id);
      if (userIndex >= 0) {
        users[userIndex] = {
          ...users[userIndex],
          username: username.toLowerCase(),
          displayName: displayName.trim(),
        };
      } else {
        // Add new user to the list
        users.push({
          id: user?.id || `user_${Date.now()}`,
          username: username.toLowerCase(),
          displayName: displayName.trim(),
          preferredLanguage: user?.preferredLanguage || 'en',
          contacts: user?.contacts || [],
        });
      }

      await AsyncStorage.setItem('users', JSON.stringify(users));

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/welcome'),
        },
      ]);
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={isDark ? [colors.primaryDark, colors.secondaryDark] : [colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/1fc748b5-afe0-451c-a430-121058317495.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.headerTitle}>Setup Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Choose a unique username and display name
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.inputLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Display Name
              </Text>
            </View>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
                borderColor: isDark ? colors.borderDark : colors.border,
              },
            ]}>
              <TextInput
                style={[styles.input, { color: isDark ? colors.textDark : colors.text }]}
                placeholder="Enter your display name"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                maxLength={30}
              />
            </View>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              This is how others will see your name
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <IconSymbol
                ios_icon_name="at"
                android_material_icon_name="alternate_email"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.inputLabel, { color: isDark ? colors.textDark : colors.text }]}>
                Username
              </Text>
            </View>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? colors.cardDark : colors.card,
                borderColor: isDark ? colors.borderDark : colors.border,
              },
            ]}>
              <Text style={[styles.atSymbol, { color: colors.textSecondary }]}>@</Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.textDark : colors.text }]}
                placeholder="username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase())}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              3-20 characters, letters, numbers, and underscores only
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? [colors.textSecondary, colors.textSecondary] : [colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Text>
              {!isLoading && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color="#FFFFFF"
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0px 8px 32px rgba(37, 99, 235, 0.3)',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  logo: {
    width: 70,
    height: 70,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 28,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  inputHint: {
    fontSize: 13,
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(37, 99, 235, 0.3)',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
