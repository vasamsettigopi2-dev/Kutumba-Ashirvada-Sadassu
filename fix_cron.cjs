const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("if (!process.env.VERCEL) {\\n  if (!process.env.VERCEL) {\\n  cron.schedule", "if (!process.env.VERCEL) {\\n  cron.schedule");

fs.writeFileSync('server.ts', code);
