/**
 * Simple logger utility for production debugging.
 * In a real app, this could send logs to an external service like Axiom or Sentry.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, data || '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, data || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`  - Name: ${error.name}`);
        console.error(`  - Message: ${error.message}`);
        console.error(`  - Stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
      } else {
        console.error('  - Data:', error);
      }
    }
  },

  debug: (message: string, data?: any) => {
    if (!IS_PROD) {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, data || '');
    }
  }
};
