// Application configuration
export const APP_CONFIG = {
  name: 'ava-gen Frontend',
  version: '1.0.0',
  description: 'Modern web application built with FSD architecture',
  theme: {
    primaryColor: '#2563eb', // Blue theme as per user preference
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  features: {
    theme: true,
    responsive: true,
    validation: true,
  },
} as const;

// Environment configuration
export const ENV_CONFIG = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_BASE_URL || '/api',
} as const;
