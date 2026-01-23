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
      // Allow either VITE_* or legacy names in .env.local
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(
        env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || ''
      ),
      'import.meta.env.VITE_EV_POLICY_CONTEXT': JSON.stringify(
        env.VITE_EV_POLICY_CONTEXT || env.EV_POLICY_CONTEXT || ''
      ),
      'import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS': JSON.stringify(
        env.VITE_RATE_LIMIT_MAX_REQUESTS || env.RATE_LIMIT_MAX_REQUESTS || '100'
      )
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
