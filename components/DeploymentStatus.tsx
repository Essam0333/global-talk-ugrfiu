
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import * as Device from 'expo-device';
import { colors } from '@/styles/commonStyles';
import { config } from '@/constants/Config';
import { IconSymbol } from '@/components/IconSymbol';

interface DeploymentInfo {
  appVersion: string;
  buildVersion: string;
  environment: string;
  channel: string;
  updateId: string;
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel: string;
  };
  buildInfo: {
    isUpdateAvailable: boolean;
    isUpdatePending: boolean;
    lastUpdateCheck: string;
  };
}

export const DeploymentStatus: React.FC = () => {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadDeploymentInfo();
  }, []);

  const loadDeploymentInfo = async () => {
    const info: DeploymentInfo = {
      appVersion: Application.nativeApplicationVersion || 'Unknown',
      buildVersion: Application.nativeBuildVersion || 'Unknown',
      environment: config.environment,
      channel: Updates.channel || 'None',
      updateId: Updates.updateId || 'None',
      deviceInfo: {
        platform: Device.osName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
        deviceModel: Device.modelName || 'Unknown',
      },
      buildInfo: {
        isUpdateAvailable: Updates.isUpdateAvailable || false,
        isUpdatePending: Updates.isUpdatePending || false,
        lastUpdateCheck: new Date().toISOString(),
      },
    };

    setDeploymentInfo(info);
  };

  const getEnvironmentColor = () => {
    switch (config.environment) {
      case 'production':
        return '#10B981';
      case 'preview':
        return '#F59E0B';
      case 'development':
        return '#3B82F6';
      default:
        return colors.textSecondary;
    }
  };

  if (!deploymentInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.environmentBadge,
              { backgroundColor: getEnvironmentColor() },
            ]}
          >
            <Text style={styles.environmentText}>
              {deploymentInfo.environment.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.versionText}>
            v{deploymentInfo.appVersion} ({deploymentInfo.buildVersion})
          </Text>
        </View>
        <IconSymbol
          ios_icon_name={expanded ? 'chevron.up' : 'chevron.down'}
          android_material_icon_name={expanded ? 'expand_less' : 'expand_more'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Build Information</Text>
            <InfoRow label="App Version" value={deploymentInfo.appVersion} />
            <InfoRow label="Build Number" value={deploymentInfo.buildVersion} />
            <InfoRow label="Environment" value={deploymentInfo.environment} />
            <InfoRow label="Channel" value={deploymentInfo.channel} />
            {deploymentInfo.updateId !== 'None' && (
              <InfoRow
                label="Update ID"
                value={deploymentInfo.updateId.substring(0, 12) + '...'}
                monospace
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            <InfoRow label="Platform" value={deploymentInfo.deviceInfo.platform} />
            <InfoRow label="OS Version" value={deploymentInfo.deviceInfo.osVersion} />
            <InfoRow label="Device Model" value={deploymentInfo.deviceInfo.deviceModel} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <InfoRow
              label="Update Available"
              value={deploymentInfo.buildInfo.isUpdateAvailable ? 'Yes' : 'No'}
            />
            <InfoRow
              label="Update Pending"
              value={deploymentInfo.buildInfo.isUpdatePending ? 'Yes' : 'No'}
            />
          </View>

          {__DEV__ && (
            <View style={styles.devBanner}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={16}
                color="#F59E0B"
              />
              <Text style={styles.devText}>
                Running in development mode. OTA updates are disabled.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  monospace?: boolean;
}> = ({ label, value, monospace }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={[
        styles.infoValue,
        monospace && styles.monospace,
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  environmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  environmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  devText: {
    flex: 1,
    fontSize: 12,
    color: '#F59E0B',
    lineHeight: 16,
  },
});
