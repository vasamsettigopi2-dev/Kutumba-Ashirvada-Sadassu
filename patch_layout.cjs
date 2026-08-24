const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');

content = content.replace(/import \{ User, signOut \} from 'firebase\/auth';\nimport \{ auth \} from '\.\.\/\.\.\/lib\/firebase';\n/, "");

content = content.replace("export default function AdminLayout({ user, children, currentTab, setCurrentTab }: { user: any, children: React.ReactNode, currentTab: string, setCurrentTab: (t: string) => void }) {", 
"export default function AdminLayout({ user, children, currentTab, setCurrentTab, onLogout }: { user: any, children: React.ReactNode, currentTab: string, setCurrentTab: (t: string) => void, onLogout: () => void }) {");

content = content.replace(/  const handleLogout = \(\) => \{\n    signOut\(auth\);\n  \};\n/, "  const handleLogout = () => {\n    onLogout();\n  };\n");

fs.writeFileSync('src/components/admin/AdminLayout.tsx', content, 'utf8');
