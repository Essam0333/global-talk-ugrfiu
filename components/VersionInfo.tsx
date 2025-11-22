
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { colors } from '@/styles/commonStyles';
import { config } from '@/constants/Config';

export const VersionInfo: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState({
    appVersion: '',
    buildVersion: '',
    updateId: '',
    channel: '',
    environment: '',
  });

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    setVersionInfo({
      appVersion: Application.nativeApplicationVersion || 'Unknown',
      buildVersion: Application.nativeBuildVersion || 'Unknown',
      updateId: Updates.updateId || 'None',
      channel: Updates.channel || 'None',
      environment: config.environment,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Version Information</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>App Version:</Text>
        <Text style={styles.value}>{versionInfo.appVersion}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Build:</Text>
        <Text style={styles.value}>{versionInfo.buildVersion}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Environment:</Text>
        <Text style={[styles.value, styles.environmentBadge]}>
          {versionInfo.environment.toUpperCase()}
        </Text>
      </View>
      
      {versionInfo.channel !== 'None' && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Channel:</Text>
          <Text style={styles.value}>{versionInfo.channel}</Text>
        </View>
      )}
      
      {!__DEV__ && versionInfo.updateId !== 'None' && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Update ID:</Text>
          <Text style={[styles.value, styles.updateId]} numberOfLines={1}>
            {versionInfo.updateId.substring(0, 8)}...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  environmentBadge: {
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  updateId: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
});
