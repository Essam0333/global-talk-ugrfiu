
import { StyleSheet } from 'react-native';

export const colors = {
  // Primary colors from design spec
  primary: '#2563EB',      // Blue
  primaryDark: '#1E40AF',  // Darker blue
  secondary: '#0D9488',    // Teal
  secondaryDark: '#0F766E', // Darker teal
  accent: '#8B5CF6',       // Purple for creativity
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#0F172A',
  backgroundAlt: '#F8FAFC',
  backgroundAltDark: '#1E293B',
  
  // Text colors
  text: '#0F172A',
  textDark: '#F8FAFC',
  textSecondary: '#64748B',
  textSecondaryDark: '#94A3B8',
  
  // Borders
  border: '#E2E8F0',
  borderDark: '#334155',
  
  // Cards
  card: '#FFFFFF',
  cardDark: '#1E293B',
  
  // Message bubbles
  messageSent: '#2563EB',
  messageReceived: '#F1F5F9',
  messageReceivedDark: '#334155',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  online: '#10B981',
  
  // Gradients
  gradientStart: '#2563EB',
  gradientEnd: '#0D9488',
  
  // Emoji reactions
  emojiHeart: '#EF4444',
  emojiLaugh: '#F59E0B',
  emojiLike: '#2563EB',
  emojiWow: '#8B5CF6',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.2)',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(13, 148, 136, 0.2)',
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
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: 'Inter_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
  gradientHeader: {
    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  },
  emoji: {
    fontSize: 20,
  },
  emojiLarge: {
    fontSize: 24,
  },
});
