const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add imports
content = content.replace("import AgendaView from './admin/AgendaView';", "import AgendaView from './admin/AgendaView';\nimport { collection, onSnapshot, query, orderBy } from 'firebase/firestore';\nimport { db, auth } from '../lib/firebase';\nimport { signOut } from 'firebase/auth';");

// Replace useEffect and fetchRegistrations
const hookReplacement = `
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    if (token && email) {
      const u = { email, getIdToken: async () => token };
      setUser(u);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    setFetching(true);
    const q = query(collection(db, 'registrations'), orderBy('created_at', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(docs);
      setFetching(false);
    }, (error) => {
      console.error("Error fetching registrations:", error);
      setFetching(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    await signOut(auth);
    setUser(null);
  };
`;

content = content.replace(/  useEffect\(\(\) => \{[\s\S]*?  const handleLogout = \(\) => \{[\s\S]*?setUser\(null\);\n  \};\n/, hookReplacement);

// Remove fetchRegistrations completely
content = content.replace(/  const fetchRegistrations = async \(currentUser = user\) => \{[\s\S]*?  \};\n/, "");

// Replace onRefresh={fetchRegistrations} with empty function or keep fetching loader sync
content = content.replace("onRefresh={() => fetchRegistrations()}", "onRefresh={() => {}}");
content = content.replace("onRefresh={fetchRegistrations}", "onRefresh={() => {}}");

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
