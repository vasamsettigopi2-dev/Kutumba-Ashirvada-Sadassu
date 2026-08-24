import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Read config for databaseId
let config: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json', e);
}

// Initialize Admin SDK
if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with custom Service Account.');
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
      initializeApp(); // Fallback to ADC
    }
  } else {
    initializeApp(); // ADC
  }
}

const adminApp = getApp();
const targetDbId = process.env.FIREBASE_SERVICE_ACCOUNT ? '(default)' : config.firestoreDatabaseId;
const db = targetDbId ? getFirestore(adminApp, targetDbId) : getFirestore(adminApp);
const auth = getAuth(adminApp);
export { adminApp, db, auth };
