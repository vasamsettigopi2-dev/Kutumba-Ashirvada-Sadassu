const fs = require('fs');
let content = fs.readFileSync('src/components/CheckIn.tsx', 'utf8');

content = content.replace("const token = await user?.getIdToken();", "const token = localStorage.getItem('adminToken');");

fs.writeFileSync('src/components/CheckIn.tsx', content, 'utf8');
