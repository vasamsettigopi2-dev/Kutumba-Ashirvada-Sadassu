const fs = require('fs');

let code = `
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let adminApp;
let db;
let auth;

try {
  let config = {};
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not read firebase-applet-config.json');
  }

  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        let saString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        
        // Vercel sometimes wraps the whole JSON in a string
        if (saString.startsWith('"') && saString.endsWith('"') && !saString.startsWith('"{')) {
          saString = saString.slice(1, -1);
        }
        
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(saString);
        } catch (parseError) {
          // If there's an error, it might be due to unescaped newlines in the private key.
          // Let's carefully fix ONLY the private key part
          saString = saString.replace(/(-----BEGIN [A-Z ]+-----)([\\s\\S]*?)(-----END [A-Z ]+-----)/, (match, p1, p2, p3) => {
            return p1 + p2.replace(/\\n/g, '\\\\n') + p3;
          });
          serviceAccount = JSON.parse(saString);
        }

        initializeApp({ credential: cert(serviceAccount) });
        console.log('Firebase Admin initialized with custom Service Account.');
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
      }
    } else {
      console.log('No FIREBASE_SERVICE_ACCOUNT found, using fallback initialization');
      initializeApp({ projectId: config.projectId });
    }
  }

  if (getApps().length > 0) {
    adminApp = getApp();
    const targetDbId = process.env.FIREBASE_SERVICE_ACCOUNT ? '(default)' : config.firestoreDatabaseId;
    db = targetDbId ? getFirestore(adminApp, targetDbId) : getFirestore(adminApp);
    auth = getAuth(adminApp);
  }
} catch (globalError) {
  console.error("Global Firebase Initialization Error:", globalError);
}

export { adminApp, db, auth };
`;

fs.writeFileSync('src/lib/firebase-admin.ts', code);
