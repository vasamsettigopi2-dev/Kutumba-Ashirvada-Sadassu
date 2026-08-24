const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function check() {
  const customApp = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) }, 'custom');
  const customDb = getFirestore(customApp);
  try {
    const snap = await customDb.collection('agenda').get();
    console.log('agenda size:', snap.size);
  } catch(e) {
    console.error('error:', e);
  }
}
check().catch(console.error);
