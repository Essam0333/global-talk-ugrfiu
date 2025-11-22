
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsEvent {
  id: string;
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface CrashReport {
  id: string;
  error: string;
  stack?: string;
  timestamp: number;
}

class Analytics {
  async trackEvent(name: string, properties?: Record<string, any>): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        id: `event_${Date.now()}`,
        name,
        properties,
        timestamp: Date.now(),
      };

      const events = await this.getEvents();
      events.push(event);
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
      console.log('Event tracked:', name);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  async trackCrash(error: Error): Promise<void> {
    try {
      const crash: CrashReport = {
        id: `crash_${Date.now()}`,
        error: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      };

      const crashes = await this.getCrashes();
      crashes.push(crash);
      
      await AsyncStorage.setItem('analytics_crashes', JSON.stringify(crashes));
      console.error('Crash tracked:', error);
    } catch (err) {
      console.error('Error tracking crash:', err);
    }
  }

  async getEvents(): Promise<AnalyticsEvent[]> {
    try {
      const eventsJson = await AsyncStorage.getItem('analytics_events');
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  async getCrashes(): Promise<CrashReport[]> {
    try {
      const crashesJson = await AsyncStorage.getItem('analytics_crashes');
      return crashesJson ? JSON.parse(crashesJson) : [];
    } catch (error) {
      console.error('Error getting crashes:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem('analytics_events');
      await AsyncStorage.removeItem('analytics_crashes');
      console.log('Analytics cleared');
    } catch (error) {
      console.error('Error clearing analytics:', error);
    }
  }
}

export const analytics = new Analytics();
