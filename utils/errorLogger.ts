
/**
 * Error logging utility
 * Provides consistent error logging across the app
 */

export function logError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${context}] Error:`, errorMessage);
  if (errorStack) {
    console.error(`[${context}] Stack:`, errorStack);
  }
}

export function logWarning(context: string, message: string): void {
  console.warn(`[${context}] Warning:`, message);
}

export function logInfo(context: string, message: string): void {
  console.log(`[${context}] Info:`, message);
}

export function logDebug(context: string, message: string, data?: unknown): void {
  if (__DEV__) {
    console.log(`[${context}] Debug:`, message);
    if (data) {
      console.log(`[${context}] Data:`, data);
    }
  }
}
