
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'general';
  title: string;
  description: string;
  email?: string;
  timestamp: number;
  deviceInfo: {
    platform: string;
    version: string;
  };
}

class FeedbackManager {
  async submitFeedback(
    type: 'bug' | 'feature' | 'general',
    title: string,
    description: string,
    email?: string
  ): Promise<boolean> {
    try {
      const feedback: Feedback = {
        id: `feedback_${Date.now()}`,
        type,
        title,
        description,
        email,
        timestamp: Date.now(),
        deviceInfo: {
          platform: 'mobile',
          version: '1.0.0',
        },
      };

      const existingFeedback = await this.getAllFeedback();
      const updatedFeedback = [...existingFeedback, feedback];
      
      await AsyncStorage.setItem('feedback', JSON.stringify(updatedFeedback));
      
      console.log('Feedback submitted:', feedback);
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  }

  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const feedbackJson = await AsyncStorage.getItem('feedback');
      return feedbackJson ? JSON.parse(feedbackJson) : [];
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  }

  async clearFeedback(): Promise<void> {
    try {
      await AsyncStorage.removeItem('feedback');
    } catch (error) {
      console.error('Error clearing feedback:', error);
    }
  }
}

export const feedbackManager = new FeedbackManager();
