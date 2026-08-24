const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminLogin.tsx', 'utf8');

// Remove import for signInWithCustomToken and auth
content = content.replace("import { signInWithCustomToken } from 'firebase/auth';\n", "");
content = content.replace("import { auth } from '../../lib/firebase';\n", "");

// Remove the sign in call
content = content.replace(/        if \(data\.firebaseToken\) \{\n          await signInWithCustomToken\(auth, data\.firebaseToken\);\n        \}\n/g, "");

fs.writeFileSync('src/components/admin/AdminLogin.tsx', content, 'utf8');
