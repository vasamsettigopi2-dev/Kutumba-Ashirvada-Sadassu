const fs = require('fs');
let content = fs.readFileSync('src/components/CheckIn.tsx', 'utf8');

// Replace Firebase auth checking with token checking
content = content.replace("import { auth } from '../lib/firebase';\n", "");
content = content.replace("import { onAuthStateChanged, User } from 'firebase/auth';\n", "");
content = content.replace("const [user, setUser] = useState<User | null>(null);", "const [user, setUser] = useState<any>(null);");

const oldAuthRegex = /  useEffect\(\(\) => \{\n    const unsub = onAuthStateChanged\(auth, \(u\) => \{\n      if \(!u\) navigate\('\/admin'\);\n      else setUser\(u\);\n    \}\);\n    return unsub;\n  \}, \[navigate\]\);/;

const newAuthEffect = `  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    } else {
      setUser({ token });
    }
  }, [navigate]);`;

content = content.replace(oldAuthRegex, newAuthEffect);

fs.writeFileSync('src/components/CheckIn.tsx', content, 'utf8');
