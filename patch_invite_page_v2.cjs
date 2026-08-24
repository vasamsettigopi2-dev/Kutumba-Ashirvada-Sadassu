const fs = require('fs');

let content = fs.readFileSync('src/components/InvitePage.tsx', 'utf8');

// Fix the issue in line 270:
content = content.replace(/agenda\.filter\(s => s\.date === \);/, 'agenda.filter(s => s.date === `2026-10-${item.date}`);');

fs.writeFileSync('src/components/InvitePage.tsx', content, 'utf8');
