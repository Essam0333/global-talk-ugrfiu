
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';
import { IconSymbol } from '@/components/IconSymbol';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

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
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="globe"
          android_material_icon_name="language"
          size={64}
          color={colors.primary}
        />
        <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>
          Welcome to GlobalTalk
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Chat across languages seamlessly
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: isDark ? colors.textDark : colors.text }]}>
          Select Your Preferred Language
        </Text>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: isDark ? colors.backgroundAltDark : colors.backgroundAlt,
              color: isDark ? colors.textDark : colors.text,
              borderColor: isDark ? colors.borderDark : colors.border,
            },
          ]}
          placeholder="Search languages..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
          {filteredLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
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
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchInput: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
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
  },
  languageItemSelected: {
    borderWidth: 2,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  languageNative: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
