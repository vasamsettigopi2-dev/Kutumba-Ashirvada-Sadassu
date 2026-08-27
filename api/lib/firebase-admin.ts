// Vercel serverless: use REST transport instead of gRPC (prevents function crashes)
if (process.env.VERCEL) {
  process.env.GOOGLE_CLOUD_DISABLE_GRPC = 'true';
}

import fs from 'fs';
import path from 'path';

let adminApp: any = null;
let db: any = null;
let auth: any = null;
let initPromise: Promise<void> | null = null;

function parseServiceAccount(): any | null {
  const rawSaEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_KEY ||
    process.env.SERVICE_ACCOUNT;

  if (rawSaEnv?.trim()) {
    try {
      let saString = rawSaEnv.trim();
      if (saString.startsWith('"') && saString.endsWith('"') && !saString.startsWith('"{')) {
        saString = saString.slice(1, -1);
      }
      try {
        return JSON.parse(saString);
      } catch {
        saString = saString.replace(
          /(-----BEGIN [A-Z ]+-----)([\s\S]*?)(-----END [A-Z ]+-----)/,
          (_match, p1, p2, p3) => p1 + p2.replace(/\n/g, '\\n') + p3
        );
        return JSON.parse(saString);
      }
    } catch (e: any) {
      console.warn('Could not parse FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e: any) {
      console.warn('Could not parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e.message);
    }
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
      return {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: privateKey,
      };
    } catch (e: any) {
      console.warn('Could not parse split Firebase credentials:', e.message);
    }
  }

  for (const fileName of [
    'serviceAccountKey.json',
    'firebase-service-account.json',
    'service-account.json',
    'firebase-applet-config.json',
  ]) {
    try {
      const filePath = path.resolve(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (fileContent.project_id && (fileContent.private_key || fileContent.client_email)) {
          return fileContent;
        }
      }
    } catch {
      // skip unreadable file
    }
  }

  return null;
}

async function initFirebase(): Promise<void> {
  if (db) return;

  try {
    const serviceAccount = parseServiceAccount();
    if (!serviceAccount?.private_key || !serviceAccount?.client_email || !serviceAccount?.project_id) {
      console.log('No Firebase credentials found. Using in-memory fallback.');
      return;
    }

    const { initializeApp, getApps, getApp, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getAuth } = await import('firebase-admin/auth');

    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    adminApp = getApp();
    db = getFirestore(adminApp);
    auth = getAuth(adminApp);
    console.log('Firebase Admin connected.');
  } catch (globalError: any) {
    console.error('Firebase initialization error:', globalError.message || globalError);
  }
}

export async function getDb() {
  if (!initPromise) initPromise = initFirebase();
  await initPromise;
  return db;
}

export async function getAuthInstance() {
  if (!initPromise) initPromise = initFirebase();
  await initPromise;
  return auth;
}

export { adminApp, db, auth };
