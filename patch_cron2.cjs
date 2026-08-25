const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "cron.schedule('0 9 * * *', () => {\\n    console.log('Running daily reminder cron...');\\n    processDailyReminders().catch(console.error);\\n  });",
  "if (!process.env.VERCEL) {\\n    cron.schedule('0 9 * * *', () => {\\n      console.log('Running daily reminder cron...');\\n      processDailyReminders().catch(console.error);\\n    });\\n  }"
);
// Actually, let's just use regex
code = code.replace(
  /cron\.schedule\('0 9 \* \* \*', \(\) => \{\s+console\.log\('Running daily reminder cron\.\.\.'\);\s+processDailyReminders\(\)\.catch\(console\.error\);\s+\}\);/,
  "if (!process.env.VERCEL) {\n  cron.schedule('0 9 * * *', () => {\n    console.log('Running daily reminder cron...');\n    processDailyReminders().catch(console.error);\n  });\n}"
);

fs.writeFileSync('server.ts', code);
