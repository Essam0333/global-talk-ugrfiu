
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/commonStyles';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';
import { IconSymbol } from '@/components/IconSymbol';

const FLOATING_EMOJIS = ['😊', '🌍', '💬', '🌟', '❤️', '👋', '🎉', '✨'];

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  
  const floatingAnimations = useRef(
    FLOATING_EMOJIS.map(() => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    floatingAnimations.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: -20 - Math.random() * 20,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: (Math.random() - 0.5) * 30,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: 0,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateX, {
              toValue: 0,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    lang =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    router.push({
      pathname: '/login',
      params: { language: selectedLanguage },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundDark : colors.background }]}>
      <LinearGradient
        colors={isDark ? [colors.primaryDark, colors.secondaryDark] : [colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.floatingEmojis}>
          {FLOATING_EMOJIS.map((emoji, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.floatingEmoji,
                {
                  left: `${(index * 12) + 5}%`,
                  top: `${20 + (index % 3) * 20}%`,
                  transform: [
                    { translateY: floatingAnimations[index].translateY },
                    { translateX: floatingAnimations[index].translateX },
                  ],
                  opacity: floatingAnimations[index].opacity,
                },
              ]}
            >
              {emoji}
            </Animated.Text>
          ))}
        </View>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="language"
              size={48}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.title}>GlobalTalk</Text>
          <Text style={styles.subtitle}>Chat across languages seamlessly 🌍</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>
          Select Your Preferred Language
        </Text>

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
            placeholder="Search languages..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
          {filteredLanguages.map((language, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.languageItem,
                {
                  backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
                  borderColor: selectedLanguage === language.code ? colors.primary : (isDark ? colors.borderDark : colors.border),
                },
                selectedLanguage === language.code && styles.languageItemSelected,
              ]}
              onPress={() => setSelectedLanguage(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: isDark ? colors.textDark : colors.text }]}>
                  {language.name}
                </Text>
                <Text style={[styles.languageNative, { color: colors.textSecondary }]}>
                  {language.nativeName}
                </Text>
              </View>
              {selectedLanguage === language.code && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
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
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton]}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingEmojis: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 32,
    opacity: 0.6,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Inter_600SemiBold',
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
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
  },
  languageItemSelected: {
    borderWidth: 2,
    boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.15)',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  languageNative: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(37, 99, 235, 0.3)',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Inter_600SemiBold',
  },
});
