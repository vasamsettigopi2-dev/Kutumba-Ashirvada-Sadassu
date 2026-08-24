const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Remove Firebase Auth imports
content = content.replace(/import \{ onAuthStateChanged, User \} from 'firebase\/auth';\nimport \{ auth \} from '\.\.\/lib\/firebase';\n/, "");

// Define CustomUser interface
const interfaceCode = `
interface CustomUser {
  email: string;
  getIdToken: () => Promise<string>;
}
`;

content = content.replace("export default function AdminDashboard() {", interfaceCode + "\nexport default function AdminDashboard() {");

// Change state type
content = content.replace(/const \[user, setUser\] = useState<User \| null>\(null\);/, "const [user, setUser] = useState<CustomUser | null>(null);");

// Replace useEffect
const useEffectReplacement = `
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const email = localStorage.getItem('adminEmail');
    if (token && email) {
      const u = { email, getIdToken: async () => token };
      setUser(u);
      fetchRegistrations(u);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    setUser(null);
  };
`;

content = content.replace(/  useEffect\(\(\) => \{[\s\S]*?  \}, \[\]\);/, useEffectReplacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
