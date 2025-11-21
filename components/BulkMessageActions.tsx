
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { Message } from '@/types';

interface BulkMessageActionsProps {
  selectedMessages: Set<string>;
  allMessages: Message[];
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  chatName: string;
}

export default function BulkMessageActions({
  selectedMessages,
  allMessages,
  onClearSelection,
  onDeleteSelected,
  chatName,
}: BulkMessageActionsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleExportChat = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const messagesToExport = allMessages.filter(m => selectedMessages.has(m.id));
      
      let exportText = `GlobalTalk Chat Export\n`;
      exportText += `Chat: ${chatName}\n`;
      exportText += `Exported: ${new Date().toLocaleString()}\n`;
      exportText += `Messages: ${messagesToExport.length}\n`;
      exportText += `\n${'='.repeat(50)}\n\n`;

      messagesToExport.forEach(message => {
        const date = new Date(message.timestamp);
        const timeStr = date.toLocaleString();
        
        exportText += `[${timeStr}]\n`;
        exportText += `${message.originalText}\n`;
        
        if (message.translatedText && message.translatedText !== message.originalText) {
          exportText += `Translation: ${message.translatedText}\n`;
        }
        
        if (message.mediaType) {
          exportText += `Media: ${message.mediaType}\n`;
        }
        
        exportText += `\n`;
      });

      const fileName = `chat_export_${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, exportText);
      
      Alert.alert(
        'Export Successful',
        `Chat history exported to:\n${fileName}`,
        [
          { text: 'OK', onPress: onClearSelection }
        ]
      );
    } catch (error) {
      console.log('Error exporting chat:', error);
      Alert.alert('Export Failed', 'Could not export chat history');
    }
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Messages',
      `Delete ${selectedMessages.size} selected message(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDeleteSelected();
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.cardDark : colors.card },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.count, { color: isDark ? colors.textDark : colors.text }]}>
          {selectedMessages.size} selected
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportChat}
        >
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <IconSymbol
              ios_icon_name="square.and.arrow.up"
              android_material_icon_name="file_download"
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteSelected}
        >
          <LinearGradient
            colors={[colors.error, '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClearSelection}
        >
          <IconSymbol
            ios_icon_name="xmark"
            android_material_icon_name="close"
            size={20}
            color={isDark ? colors.textDark : colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  info: {
    flex: 1,
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
