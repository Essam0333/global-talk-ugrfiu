
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function TestingGuide() {
  const router = useRouter();

  const testingSteps = [
    {
      title: 'Installation',
      icon: 'download',
      steps: [
        'Download the APK file from the provided link',
        'Enable "Install from Unknown Sources" in Android settings',
        'Open the APK file and follow installation prompts',
        'For iOS, install via TestFlight invitation',
      ],
    },
    {
      title: 'Account Setup',
      icon: 'person.circle',
      steps: [
        'Open the GlobalTalk app',
        'Create a new account or use test credentials',
        'Select your preferred language',
        'Complete profile setup',
      ],
    },
    {
      title: 'Core Features',
      icon: 'checkmark.circle',
      steps: [
        'Test sending messages in different languages',
        'Verify translation accuracy',
        'Try voice messages and media sharing',
        'Test group chat functionality',
        'Check notification delivery',
      ],
    },
    {
      title: 'Bug Reporting',
      icon: 'exclamationmark.triangle',
      steps: [
        'Note the exact steps to reproduce the issue',
        'Take screenshots or screen recordings',
        'Use the in-app feedback form',
        'Include device and app version information',
      ],
    },
  ];

  const bugReportTemplate = `
Bug Report Template:
-------------------
1. Device: [Your device model]
2. OS Version: [Android/iOS version]
3. App Version: [Check in Settings]
4. Issue: [Brief description]
5. Steps to Reproduce:
   - Step 1
   - Step 2
   - Step 3
6. Expected Result: [What should happen]
7. Actual Result: [What actually happened]
8. Screenshots: [Attach if available]
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Testing Guide</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome, Tester! 🎉</Text>
          <Text style={styles.welcomeText}>
            Thank you for helping us test GlobalTalk. Your feedback is invaluable in making this app better for everyone.
          </Text>
        </View>

        {testingSteps.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                ios_icon_name={section.icon}
                android_material_icon_name={section.icon.replace('.', '_')}
                size={24}
                color={colors.primary}
              />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.steps.map((step, stepIndex) => (
              <View key={stepIndex} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Bug Report Template</Text>
          </View>
          <View style={styles.templateCard}>
            <Text style={styles.templateText}>{bugReportTemplate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What to Test</Text>
          <View style={styles.featureList}>
            <FeatureItem text="Message sending and receiving" />
            <FeatureItem text="Translation accuracy" />
            <FeatureItem text="Media sharing (photos, videos)" />
            <FeatureItem text="Voice messages" />
            <FeatureItem text="Group chats" />
            <FeatureItem text="Contact management" />
            <FeatureItem text="Notifications" />
            <FeatureItem text="Profile settings" />
            <FeatureItem text="Language switching" />
            <FeatureItem text="App performance and stability" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.contactText}>
            For urgent issues or questions, please contact:
          </Text>
          <Text style={styles.contactEmail}>support@globaltalk.app</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for being part of our testing community! 🙏
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.featureItem}>
    <IconSymbol
      ios_icon_name="checkmark.circle.fill"
      android_material_icon_name="check_circle"
      size={20}
      color={colors.primary}
    />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    paddingTop: 4,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
  },
  contactText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
});
