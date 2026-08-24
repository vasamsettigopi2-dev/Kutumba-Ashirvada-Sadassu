const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminLogin.tsx', 'utf8');

// Add import
content = content.replace("import { Mail, Lock, LogIn } from 'lucide-react';", "import { Mail, Lock, LogIn } from 'lucide-react';\nimport { signInWithCustomToken } from 'firebase/auth';\nimport { auth } from '../../lib/firebase';");

// Update handleSubmit
const loginReplacement = `
      if (res.ok && data.token) {
        if (data.firebaseToken) {
          await signInWithCustomToken(auth, data.firebaseToken);
        }
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.email);
        onAuth({ email: data.email, getIdToken: async () => data.token });
`;
content = content.replace(/      if \(res\.ok && data\.token\) \{[\s\S]*?onAuth\(\{ email: data\.email, getIdToken: async \(\) => data\.token \}\);/, loginReplacement);

fs.writeFileSync('src/components/admin/AdminLogin.tsx', content, 'utf8');
