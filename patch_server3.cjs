const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "        const firebaseToken = await auth.createCustomToken(username);",
  `        if (!auth) throw new Error("Firebase Admin Auth is not initialized. Check FIREBASE_SERVICE_ACCOUNT env var.");
        const firebaseToken = await auth.createCustomToken(username);`
);

fs.writeFileSync('server.ts', code);
