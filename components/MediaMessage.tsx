
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  Modal,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { Message } from '@/types';

interface MediaMessageProps {
  message: Message;
  isMe: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MediaMessage({ message, isMe }: MediaMessageProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const renderMediaContent = () => {
    switch (message.mediaType) {
      case 'image':
        return (
          <TouchableOpacity onPress={() => setFullscreenVisible(true)}>
            <Image
              source={{ uri: message.mediaUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {message.originalText && (
              <View style={styles.caption}>
                <Text style={[styles.captionText, { color: isMe ? '#FFFFFF' : (isDark ? colors.textDark : colors.text) }]}>
                  {message.originalText}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );

      case 'video':
        return (
          <View>
            <Video
              source={{ uri: message.mediaUrl || '' }}
              style={styles.video}
              useNativeControls
              resizeMode="cover"
              isLooping={false}
            />
            {message.originalText && (
              <View style={styles.caption}>
                <Text style={[styles.captionText, { color: isMe ? '#FFFFFF' : (isDark ? colors.textDark : colors.text) }]}>
                  {message.originalText}
                </Text>
              </View>
            )}
          </View>
        );

      case 'document':
        return (
          <View style={styles.documentContainer}>
            <View style={[styles.documentIcon, { backgroundColor: colors.warning }]}>
              <IconSymbol
                ios_icon_name="doc.fill"
                android_material_icon_name="description"
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.documentInfo}>
              <Text
                style={[styles.documentName, { color: isMe ? '#FFFFFF' : (isDark ? colors.textDark : colors.text) }]}
                numberOfLines={1}
              >
                {message.mediaName || 'Document'}
              </Text>
              <Text style={[styles.documentSize, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                {formatFileSize(message.mediaSize || 0)}
              </Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <IconSymbol
                ios_icon_name="arrow.down.circle.fill"
                android_material_icon_name="download"
                size={24}
                color={isMe ? '#FFFFFF' : colors.primary}
              />
            </TouchableOpacity>
          </View>
        );

      case 'location':
        return (
          <View style={styles.locationContainer}>
            <View style={styles.locationMap}>
              <IconSymbol
                ios_icon_name="map.fill"
                android_material_icon_name="map"
                size={48}
                color={colors.primary}
              />
              <Text style={[styles.locationText, { color: isDark ? colors.textDark : colors.text }]}>
                Location Preview
              </Text>
              <Text style={[styles.locationNote, { color: colors.textSecondary }]}>
                (Maps not supported in Natively)
              </Text>
            </View>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={[styles.locationButtonText, { color: colors.primary }]}>
                View Location
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'voice':
        return (
          <View style={styles.voiceContainer}>
            <TouchableOpacity style={[styles.playButton, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : colors.primary }]}>
              <IconSymbol
                ios_icon_name="play.fill"
                android_material_icon_name="play_arrow"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <View style={styles.waveform}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height: Math.random() * 30 + 10,
                      backgroundColor: isMe ? 'rgba(255,255,255,0.6)' : colors.primary,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.voiceDuration, { color: isMe ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
              {formatDuration(message.mediaDuration || 0)}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <View style={styles.container}>
        {renderMediaContent()}
      </View>

      {message.mediaType === 'image' && (
        <Modal
          visible={fullscreenVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFullscreenVisible(false)}
        >
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFullscreenVisible(false)}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={32}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <Image
              source={{ uri: message.mediaUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  image: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 12,
  },
  video: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 12,
  },
  caption: {
    marginTop: 8,
  },
  captionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 200,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Inter_500Medium',
  },
  documentSize: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  downloadButton: {
    marginLeft: 8,
  },
  locationContainer: {
    width: SCREEN_WIDTH * 0.6,
  },
  locationMap: {
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    fontFamily: 'Inter_500Medium',
  },
  locationNote: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  locationButton: {
    padding: 12,
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 200,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginRight: 12,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  voiceDuration: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
});
