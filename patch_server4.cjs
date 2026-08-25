const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "res.status(500).json({ error: 'Failed to generate token' });",
  "res.status(500).json({ error: 'Failed to generate token: ' + (e.message || e) });"
);

fs.writeFileSync('server.ts', code);
