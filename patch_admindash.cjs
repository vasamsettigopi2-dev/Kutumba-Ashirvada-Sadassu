const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace imports
content = content.replace("import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';", "");
content = content.replace("import { db, auth } from '../lib/firebase';", "");
content = content.replace("import { signOut, onAuthStateChanged } from 'firebase/auth';", "");

// The useEffects
const oldEffectsRegex = /  useEffect\(\(\) => \{[\s\S]*?return \(\) => unsubscribe\(\);\n  \}, \[user\]\);/m;

const newEffects = `  const fetchRegistrations = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations);
      }
    } catch (e) {
      console.error("Error fetching registrations", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    if (token && email) {
      setUser({ email, getIdToken: async () => token });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);`;

content = content.replace(oldEffectsRegex, newEffects);

// Fix onRefresh
content = content.replace("onRefresh={() => {}}", "onRefresh={fetchRegistrations}");

// Fix handleLogout
content = content.replace("    await signOut(auth);\n", "");

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
