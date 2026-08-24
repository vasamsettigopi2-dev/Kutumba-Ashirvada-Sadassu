const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Replace getFirestore with initializeFirestore
content = content.replace("import { getFirestore } from 'firebase/firestore';", "import { initializeFirestore } from 'firebase/firestore';");

// Replace const db = getFirestore(app, databaseId);
content = content.replace(
  "const db = getFirestore(app, databaseId);", 
  "const db = initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId);"
);

fs.writeFileSync('src/lib/firebase.ts', content, 'utf8');
