const fs = require('fs');
let content = fs.readFileSync('src/components/admin/SettingsView.tsx', 'utf8');

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/admin/SettingsView.tsx', content, 'utf8');
