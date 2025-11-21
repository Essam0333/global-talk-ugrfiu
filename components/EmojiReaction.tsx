
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface EmojiReactionProps {
  emoji: string;
  count: number;
  isActive?: boolean;
  onPress: () => void;
}

export default function EmojiReaction({ emoji, count, isActive, onPress }: EmojiReactionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isActive
            ? (isDark ? colors.primaryDark : colors.primary)
            : (isDark ? colors.backgroundAltDark : colors.backgroundAlt),
          borderColor: isActive ? colors.primary : (isDark ? colors.borderDark : colors.border),
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      {count > 0 && (
        <Text
          style={[
            styles.count,
            { color: isActive ? '#FFFFFF' : (isDark ? colors.textDark : colors.text) },
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginTop: 4,
  },
  emoji: {
    fontSize: 16,
    marginRight: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
