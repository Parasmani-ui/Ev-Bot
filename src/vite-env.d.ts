/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_EV_POLICY_CONTEXT: string;
  readonly VITE_RATE_LIMIT_MAX_REQUESTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
