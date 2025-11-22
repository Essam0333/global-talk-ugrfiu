
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { DeploymentStatus } from '@/components/DeploymentStatus';
import { VersionInfo } from '@/components/VersionInfo';
import { updateManager } from '@/utils/updateManager';
import { analytics } from '@/utils/analytics';

export default function DeploymentInfoScreen() {
  const router = useRouter();

  const handleCheckUpdates = async () => {
    try {
      const updateInfo = await updateManager.checkForUpdates();
      if (updateInfo.isAvailable) {
        await updateManager.promptForUpdate(updateInfo);
      } else {
        Alert.alert('No Updates', 'You are running the latest version.');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      Alert.alert('Error', 'Failed to check for updates.');
    }
  };

  const handleViewLogs = () => {
    const events = analytics.getEvents();
    const crashes = analytics.getCrashes();
    
    Alert.alert(
      'Analytics Summary',
      `Events: ${events.length}\nCrashes: ${crashes.length}`,
      [
        {
          text: 'Clear Logs',
          style: 'destructive',
          onPress: () => {
            analytics.clear();
            Alert.alert('Success', 'Logs cleared');
          },
        },
        { text: 'OK' },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Deployment Info</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.infoTitle}>Deployment Information</Text>
          <Text style={styles.infoText}>
            View detailed information about your app build, environment, and deployment status.
          </Text>
        </View>

        <DeploymentStatus />
        <VersionInfo />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleCheckUpdates}
          >
            <View style={styles.actionIcon}>
              <IconSymbol
                ios_icon_name="arrow.down.circle.fill"
                android_material_icon_name="system_update"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Check for Updates</Text>
              <Text style={styles.actionDescription}>
                Check if a new version is available
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
            style={styles.actionCard}
            onPress={handleViewLogs}
          >
            <View style={styles.actionIcon}>
              <IconSymbol
                ios_icon_name="doc.text.fill"
                android_material_icon_name="description"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Analytics</Text>
              <Text style={styles.actionDescription}>
                View collected events and crash reports
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
            style={styles.actionCard}
            onPress={() => router.push('/testing-guide')}
          >
            <View style={styles.actionIcon}>
              <IconSymbol
                ios_icon_name="book.fill"
                android_material_icon_name="menu_book"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Testing Guide</Text>
              <Text style={styles.actionDescription}>
                View testing instructions and checklist
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
          <Text style={styles.sectionTitle}>Deployment Resources</Text>
          
          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>📚 Documentation</Text>
            <Text style={styles.resourceText}>
              - DEPLOYMENT.md - Complete deployment guide{'\n'}
              - DEPLOYMENT_CHECKLIST.md - Step-by-step checklist{'\n'}
              - QUICK_START_DEPLOYMENT.md - 30-minute quick start{'\n'}
              - TESTING_QUICK_START.md - Guide for testers
            </Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>🚀 Build Commands</Text>
            <Text style={styles.resourceText}>
              - npm run build:preview:android{'\n'}
              - npm run build:preview:ios{'\n'}
              - npm run build:all:preview{'\n'}
              - npm run deploy:internal
            </Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>🔄 Update Commands</Text>
            <Text style={styles.resourceText}>
              - npm run update:preview -- "message"{'\n'}
              - npm run update:prod -- "message"
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For complete deployment instructions, see DEPLOYMENT.md in the project root.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resourceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
