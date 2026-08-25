const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "cron.schedule('0 9 * * *', () => {",
  "if (!process.env.VERCEL) {\n  cron.schedule('0 9 * * *', () => {"
);

code = code.replace(
  "  processDailyReminders();\n});",
  "    processDailyReminders();\n  });\n}"
);

fs.writeFileSync('server.ts', code);
