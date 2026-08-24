const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add import for onAuthStateChanged
content = content.replace("import { signOut } from 'firebase/auth';", "import { signOut, onAuthStateChanged } from 'firebase/auth';");

const newUseEffect = `
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && token && email) {
        setUser({ email, getIdToken: async () => token });
      } else if (!token) {
        setUser(null);
      }
      setLoading(false);
    });

    if (!token) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);
`;

content = content.replace(/  useEffect\(\(\) => \{\n    const token = localStorage\.getItem\('adminToken'\);\n    const email = localStorage\.getItem\('adminEmail'\);\n    if \(token && email\) \{\n      const u = \{ email, getIdToken: async \(\) => token \};\n      setUser\(u\);\n    \}\n    setLoading\(false\);\n  \}, \[\]\);/, newUseEffect);

// Remove fetchRegistrations calls
content = content.replace(/fetchRegistrations\(\);/g, '');
content = content.replace(/fetchRegistrations\(u\);/g, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
