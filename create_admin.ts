import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

let app;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  app = initializeApp({ credential: cert(serviceAccount) });
} else {
  app = initializeApp();
}

const auth = getAuth(app);

async function createAdmin() {
  try {
    const user = await auth.createUser({
      email: 'admin@demo.com',
      password: 'adminpassword123',
    });
    console.log('Successfully created admin user:', user.uid);
  } catch (error) {
    console.error('Error creating user:', error);
  }
  process.exit(0);
}
createAdmin();
