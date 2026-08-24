const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

async function check() {
  // Check custom
  let countCustom = 0;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const customApp = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) }, 'custom');
    const customDb = getFirestore(customApp);
    const snap = await customDb.collection('registrations').get();
    countCustom = snap.size;
  }
  
  // Check default (ADC)
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  const defaultApp = initializeApp({}, 'default');
  const defaultDb = getFirestore(defaultApp, config.firestoreDatabaseId);
  const snap2 = await defaultDb.collection('registrations').get();
  const countDefault = snap2.size;
  
  console.log('Custom project registrations:', countCustom);
  console.log('Default AI Studio registrations:', countDefault);
}
check().catch(console.error);
