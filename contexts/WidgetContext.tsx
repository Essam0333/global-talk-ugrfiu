
import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [ExtensionStorage, setExtensionStorage] = useState<any>(null);

  useEffect(() => {
    // Only attempt to load ExtensionStorage on iOS
    if (Platform.OS === 'ios') {
      import('@bacons/apple-targets')
        .then((module) => {
          setExtensionStorage(module.ExtensionStorage);
          console.log('ExtensionStorage loaded successfully');
        })
        .catch((error) => {
          console.log('ExtensionStorage not available:', error);
        });
    }
  }, []);

  const refreshWidget = useCallback(() => {
    if (Platform.OS === 'ios' && ExtensionStorage) {
      try {
        ExtensionStorage.reloadWidget();
        console.log('Widget refreshed');
      } catch (error) {
        console.log('Error refreshing widget:', error);
      }
    }
  }, [ExtensionStorage]);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
