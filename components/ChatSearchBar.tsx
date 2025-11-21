
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface ChatSearchBarProps {
  onSearch: (query: string) => void;
  onClose: () => void;
}

export default function ChatSearchBar({ onSearch, onClose }: ChatSearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [slideAnim] = useState(new Animated.Value(-100));

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.cardDark : colors.card,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <IconSymbol
        ios_icon_name="magnifyingglass"
        android_material_icon_name="search"
        size={20}
        color={colors.textSecondary}
      />
      <TextInput
        style={[
          styles.input,
          { color: isDark ? colors.textDark : colors.text },
        ]}
        placeholder="Search messages..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={handleSearch}
        autoFocus
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <IconSymbol
          ios_icon_name="xmark"
          android_material_icon_name="close"
          size={20}
          color={isDark ? colors.textDark : colors.text}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
});
