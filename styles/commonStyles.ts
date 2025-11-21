
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#007AFF',      // iOS Blue
  secondary: '#5856D6',    // iOS Purple
  accent: '#34C759',       // iOS Green
  background: '#FFFFFF',   // White background (light mode)
  backgroundDark: '#000000', // Black background (dark mode)
  backgroundAlt: '#F2F2F7', // Light gray (light mode)
  backgroundAltDark: '#1C1C1E', // Dark gray (dark mode)
  text: '#000000',         // Black text (light mode)
  textDark: '#FFFFFF',     // White text (dark mode)
  textSecondary: '#8E8E93', // Gray text
  border: '#C6C6C8',       // Light border
  borderDark: '#38383A',   // Dark border
  card: '#FFFFFF',         // White card (light mode)
  cardDark: '#1C1C1E',     // Dark card (dark mode)
  messageSent: '#007AFF',  // Blue for sent messages
  messageReceived: '#E9E9EB', // Light gray for received messages
  messageReceivedDark: '#2C2C2E', // Dark gray for received messages (dark mode)
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
});
