const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will just use regex to replace all of the cron section cleanly
code = code.replace(/if \(!process\.env\.VERCEL\) \{\s*if \(!process\.env\.VERCEL\) \{\s*cron\.schedule[\s\S]*?\}\s*\}/, 
"if (!process.env.VERCEL) {\n  cron.schedule('0 9 * * *', () => {\n    console.log('Running daily reminder cron...');\n    processDailyReminders().catch(console.error);\n  });\n}");
fs.writeFileSync('server.ts', code);
