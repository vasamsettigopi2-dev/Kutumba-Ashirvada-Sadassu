import { initializeApp, getApps, getApp } from 'firebase-admin/app';
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

// Initialize Admin SDK using ADC
if (!getApps().length) {
  initializeApp();
}

const adminApp = getApp();
const db = getFirestore(adminApp, config.firestoreDatabaseId || '(default)');
const auth = getAuth(adminApp);

export { adminApp, db, auth };
