
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface UpdateInfo {
  isAvailable: boolean;
  manifest?: any;
}

class UpdateManager {
  async checkForUpdates(): Promise<UpdateInfo> {
    try {
      if (__DEV__) {
        console.log('Update checks are disabled in development mode');
        return { isAvailable: false };
      }

      const update = await Updates.checkForUpdateAsync();
      return {
        isAvailable: update.isAvailable,
        manifest: update.manifest,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { isAvailable: false };
    }
  }

  async downloadAndInstallUpdate(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log('Updates are disabled in development mode');
        return false;
      }

      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    }
  }

  async reloadApp(): Promise<void> {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  }

  async promptForUpdate(updateInfo: UpdateInfo): Promise<void> {
    Alert.alert(
      'Update Available',
      'A new version is available. Would you like to update now?',
      [
        {
          text: 'Later',
          style: 'cancel',
          onPress: () => this.dismissUpdate(updateInfo.manifest?.version),
        },
        {
          text: 'Update',
          onPress: async () => {
            const success = await this.downloadAndInstallUpdate();
            if (success) {
              await this.reloadApp();
            }
          },
        },
      ]
    );
  }

  async dismissUpdate(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`dismissed_update_${version}`, Date.now().toString());
    } catch (error) {
      console.error('Error dismissing update:', error);
    }
  }
}

export const updateManager = new UpdateManager();
