import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDuNlsnUzK4Kbg8aU405qUM79FapFBb92U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quadratic-mix-xt8c4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quadratic-mix-xt8c4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quadratic-mix-xt8c4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "46030876772",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:46030876772:web:27c3e01f86a9ff4b0d6f71"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-c8aac346-e332-4d12-ac58-017b24500d7f";
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId);

export { app, auth, db };
