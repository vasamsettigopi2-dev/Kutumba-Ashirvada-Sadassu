const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase-admin.ts', 'utf8');

content = content.replace(
  "const targetDbId = process.env.FIREBASE_SERVICE_ACCOUNT ? '(default)' : config.firestoreDatabaseId;",
  "const targetDbId = config.firestoreDatabaseId || '(default)';"
);

fs.writeFileSync('src/lib/firebase-admin.ts', content, 'utf8');
