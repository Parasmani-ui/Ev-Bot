import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.EV_POLICY_CONTEXT': JSON.stringify(env.EV_POLICY_CONTEXT),
        'process.env.RATE_LIMIT_MAX_REQUESTS': JSON.stringify(env.RATE_LIMIT_MAX_REQUESTS || '100')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
