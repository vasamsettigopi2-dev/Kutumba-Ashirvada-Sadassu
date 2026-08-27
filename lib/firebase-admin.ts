// Vercel serverless: use REST transport instead of gRPC (prevents function crashes)
if (process.env.VERCEL) {
  process.env.GOOGLE_CLOUD_DISABLE_GRPC = 'true';
}

import 'dotenv/config';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let adminApp: any = null;
let db: any = null;
let auth: any = null;

try {
  let serviceAccount: any = null;

  // 1. Check Full JSON string in environment variables (Vercel & Local)
  const rawSaEnv = 
    process.env.FIREBASE_SERVICE_ACCOUNT || 
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
    process.env.FIREBASE_KEY || 
    process.env.SERVICE_ACCOUNT;

  if (rawSaEnv && rawSaEnv.trim() !== '') {
    try {
      let saString = rawSaEnv.trim();
      
      // Clean possible wrapper quotes from Vercel env input
      if (saString.startsWith('"') && saString.endsWith('"') && !saString.startsWith('"{')) {
        saString = saString.slice(1, -1);
      }
      
      try {
        serviceAccount = JSON.parse(saString);
      } catch (parseError) {
        // Fix unescaped newlines in private key
        saString = saString.replace(/(-----BEGIN [A-Z ]+-----)([\s\S]*?)(-----END [A-Z ]+-----)/, (match, p1, p2, p3) => {
          return p1 + p2.replace(/\n/g, '\\n') + p3;
        });
        serviceAccount = JSON.parse(saString);
      }
    } catch (e: any) {
      console.warn('⚠️ Could not parse JSON from FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
  }

  // 2. Check Base64 encoded Service Account
  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } catch (e: any) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e.message);
    }
  }

  // 3. Check Individual Firebase Env Variables
  if (!serviceAccount && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      };
    } catch (e: any) {
      console.warn('⚠️ Could not parse individual Firebase credentials:', e.message);
    }
  }

  // 4. Check local serviceAccount files in workspace (Local development)
  if (!serviceAccount) {
    const fileCandidates = [
      'serviceAccountKey.json',
      'firebase-service-account.json',
      'service-account.json',
      'firebase-applet-config.json'
    ];

    for (const fileName of fileCandidates) {
      try {
        const filePath = path.resolve(process.cwd(), fileName);
        if (fs.existsSync(filePath)) {
          const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (fileContent.project_id && (fileContent.private_key || fileContent.client_email)) {
            serviceAccount = fileContent;
            break;
          }
        }
      } catch (e) {
        // Skip unreadable file
      }
    }
  }

  // Initialize Firebase Admin SDK
  if (serviceAccount?.private_key && serviceAccount?.client_email && serviceAccount?.project_id) {
    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    adminApp = getApp();
    db = getFirestore(adminApp);
    auth = getAuth(adminApp);
    console.log('✅ Firebase Admin & Cloud Firestore connected successfully.');
  } else {
    console.log('ℹ️ No Firebase Service Account found in environment or local files. Running in local in-memory fallback mode.');
  }
} catch (globalError: any) {
  console.error("Global Firebase Initialization Error:", globalError.message || globalError);
}

export { adminApp, db, auth };
