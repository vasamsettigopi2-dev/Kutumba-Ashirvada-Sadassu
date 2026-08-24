const fs = require('fs');
let content = fs.readFileSync('src/components/admin/RegistrationsView.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/admin/RegistrationsView.tsx', content, 'utf8');
