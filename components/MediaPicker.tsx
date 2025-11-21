
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useColorScheme,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { MediaAttachment } from '@/types';

interface MediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelected: (media: MediaAttachment) => void;
}

export default function MediaPicker({ visible, onClose, onMediaSelected }: MediaPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onMediaSelected({
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize,
          mimeType: asset.mimeType,
        });
        onClose();
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onMediaSelected({
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || 'photo.jpg',
          size: asset.fileSize,
          mimeType: asset.mimeType,
        });
        onClose();
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleVideoPicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 100 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a video smaller than 100MB');
          return;
        }
        onMediaSelected({
          type: 'video',
          uri: asset.uri,
          name: asset.fileName || 'video.mp4',
          size: asset.fileSize,
          mimeType: asset.mimeType,
          duration: asset.duration,
        });
        onClose();
      }
    } catch (error) {
      console.log('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'text/plain', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onMediaSelected({
          type: 'document',
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        });
        onClose();
      }
    } catch (error) {
      console.log('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleLocationShare = () => {
    Alert.alert(
      'Location Sharing',
      'Note: react-native-maps is not supported in Natively. Location sharing will use a simulated location for demo purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share Demo Location',
          onPress: () => {
            onMediaSelected({
              type: 'location',
              uri: 'demo-location',
              name: 'Current Location',
            });
            onClose();
          },
        },
      ]
    );
  };

  const mediaOptions = [
    {
      icon: 'photo',
      androidIcon: 'image',
      label: 'Photo',
      color: colors.primary,
      onPress: handleImagePicker,
    },
    {
      icon: 'camera.fill',
      androidIcon: 'camera_alt',
      label: 'Camera',
      color: colors.secondary,
      onPress: handleCamera,
    },
    {
      icon: 'video.fill',
      androidIcon: 'videocam',
      label: 'Video',
      color: '#EF4444',
      onPress: handleVideoPicker,
    },
    {
      icon: 'doc.fill',
      androidIcon: 'description',
      label: 'Document',
      color: '#F59E0B',
      onPress: handleDocumentPicker,
    },
    {
      icon: 'location.fill',
      androidIcon: 'location_on',
      label: 'Location',
      color: '#10B981',
      onPress: handleLocationShare,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? colors.cardDark : colors.card },
          ]}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: isDark ? colors.textDark : colors.text }]}>
            Share Media
          </Text>

          <View style={styles.optionsGrid}>
            {mediaOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={option.onPress}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <IconSymbol
                    ios_icon_name={option.icon}
                    android_material_icon_name={option.androidIcon}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={[styles.optionLabel, { color: isDark ? colors.textDark : colors.text }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
