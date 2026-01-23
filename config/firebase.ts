import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBnUFo0orDDzyH_Abj7RwAznD3v4YwftLY",
  authDomain: "ev-chatbot-f18d3.firebaseapp.com",
  projectId: "ev-chatbot-f18d3",
  storageBucket: "ev-chatbot-f18d3.firebasestorage.app",
  messagingSenderId: "1035071919615",
  appId: "1:1035071919615:web:37e1365829fcd98a2b03ca",
  measurementId: "G-5X0GT8R5N7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
