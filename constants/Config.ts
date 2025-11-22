
// Environment configuration for different deployment stages
export const ENV = {
  development: {
    apiUrl: 'http://localhost:3000',
    supabaseUrl: 'https://nkepjtrwlkplkoglvnwb.supabase.co',
    environment: 'development',
    enableDebugLogs: true,
    enableAnalytics: false,
  },
  preview: {
    apiUrl: 'https://api-preview.globaltalk.app',
    supabaseUrl: 'https://nkepjtrwlkplkoglvnwb.supabase.co',
    environment: 'preview',
    enableDebugLogs: true,
    enableAnalytics: true,
  },
  production: {
    apiUrl: 'https://api.globaltalk.app',
    supabaseUrl: 'https://nkepjtrwlkplkoglvnwb.supabase.co',
    environment: 'production',
    enableDebugLogs: false,
    enableAnalytics: true,
  },
};

// Get current environment from app.json extra config or default to development
const getEnvironment = (): keyof typeof ENV => {
  const appEnv = process.env.APP_ENV as keyof typeof ENV;
  return appEnv && ENV[appEnv] ? appEnv : 'development';
};

export const currentEnv = getEnvironment();
export const config = ENV[currentEnv];

// Feature flags for different environments
export const FEATURES = {
  enableCrashReporting: currentEnv !== 'development',
  enablePerformanceMonitoring: currentEnv === 'production',
  enableBetaFeatures: currentEnv === 'preview',
  forceUpdateEnabled: true,
  feedbackEnabled: true,
};

console.log(`🚀 App running in ${currentEnv} environment`);
