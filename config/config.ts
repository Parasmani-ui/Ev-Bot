/**
 * App configuration loaded from Vite environment variables.
 * Note: Vite exposes only variables prefixed with VITE_ to the client.
 */
export const Config = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || ''
};

