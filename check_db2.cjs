const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

async function check() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  
  // Check custom
  let countCustom = 0;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const customApp = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) }, 'custom');
      const customDb = getFirestore(customApp);
      const snap = await customDb.collection('registrations').get();
      countCustom = snap.size;
    }
  } catch(e) { console.error('Custom failed', e.message); }
  
  // Check default (ADC with explicit projectId)
  let countDefault = 0;
  try {
    const defaultApp = initializeApp({ projectId: config.projectId }, 'default');
    const defaultDb = getFirestore(defaultApp, config.firestoreDatabaseId);
    const snap2 = await defaultDb.collection('registrations').get();
    countDefault = snap2.size;
  } catch(e) { console.error('Default failed', e.message); }
  
  console.log('Custom project registrations:', countCustom);
  console.log('Default AI Studio registrations:', countDefault);
}
check().catch(console.error);
