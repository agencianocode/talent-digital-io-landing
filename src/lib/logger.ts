// Production-ready logging system
const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...args);
    
    // In production, you could send to error tracking service
    if (!isDevelopment && error) {
      // Example: Sentry.captureException(error);
    }
  }
};