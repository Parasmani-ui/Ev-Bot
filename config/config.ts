/**
 * App configuration loaded from Vite environment variables.
 * Note: Vite exposes only variables prefixed with VITE_ to the client.
 */
export const Config = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || ''
};

