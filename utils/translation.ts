
// Mock translation service - simulates translation API
// In production, this would call Google Translate API or similar service

const mockTranslations: Record<string, Record<string, string>> = {
  'Hello': {
    es: 'Hola',
    fr: 'Bonjour',
    de: 'Hallo',
    it: 'Ciao',
    pt: 'Olá',
    ru: 'Привет',
    ja: 'こんにちは',
    ko: '안녕하세요',
    zh: '你好',
    ar: 'مرحبا',
  },
  'How are you?': {
    es: '¿Cómo estás?',
    fr: 'Comment allez-vous?',
    de: 'Wie geht es dir?',
    it: 'Come stai?',
    pt: 'Como você está?',
    ru: 'Как дела?',
    ja: 'お元気ですか？',
    ko: '어떻게 지내세요?',
    zh: '你好吗？',
    ar: 'كيف حالك؟',
  },
  'Good morning': {
    es: 'Buenos días',
    fr: 'Bonjour',
    de: 'Guten Morgen',
    it: 'Buongiorno',
    pt: 'Bom dia',
    ru: 'Доброе утро',
    ja: 'おはようございます',
    ko: '좋은 아침',
    zh: '早上好',
    ar: 'صباح الخير',
  },
  'Thank you': {
    es: 'Gracias',
    fr: 'Merci',
    de: 'Danke',
    it: 'Grazie',
    pt: 'Obrigado',
    ru: 'Спасибо',
    ja: 'ありがとう',
    ko: '감사합니다',
    zh: '谢谢',
    ar: 'شكرا',
  },
};

export async function translateText(
  text: string,
  fromLanguage: string,
  toLanguage: string
): Promise<string> {
  try {
    // If same language, return original immediately
    if (fromLanguage === toLanguage) {
      return text;
    }

    // Check mock translations
    if (mockTranslations[text] && mockTranslations[text][toLanguage]) {
      return mockTranslations[text][toLanguage];
    }

    // For demo purposes, add language prefix to show translation
    return `[${toLanguage.toUpperCase()}] ${text}`;
  } catch (error) {
    console.log('Translation error:', error);
    return text; // Return original text on error
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    // Simple language detection based on character sets
    const arabicPattern = /[\u0600-\u06FF]/;
    const chinesePattern = /[\u4E00-\u9FFF]/;
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;
    const koreanPattern = /[\uAC00-\uD7AF]/;
    const cyrillicPattern = /[\u0400-\u04FF]/;
    const greekPattern = /[\u0370-\u03FF]/;

    if (arabicPattern.test(text)) return 'ar';
    if (chinesePattern.test(text)) return 'zh';
    if (japanesePattern.test(text)) return 'ja';
    if (koreanPattern.test(text)) return 'ko';
    if (cyrillicPattern.test(text)) return 'ru';
    if (greekPattern.test(text)) return 'el';

    // Default to English
    return 'en';
  } catch (error) {
    console.log('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}
