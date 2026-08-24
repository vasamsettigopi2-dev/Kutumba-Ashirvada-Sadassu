const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(/<AdminLayout user=\{user\} currentTab=\{currentTab\} setCurrentTab=\{setCurrentTab\}>/, 
"<AdminLayout user={user} currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={handleLogout}>");

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
