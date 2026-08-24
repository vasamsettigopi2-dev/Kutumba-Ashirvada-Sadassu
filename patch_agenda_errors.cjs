const fs = require('fs');

// Patch backend to return error message
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  "res.status(500).json({ error: 'Failed to add agenda session' });",
  "res.status(500).json({ error: 'Failed to add agenda session: ' + e.message });"
);
serverCode = serverCode.replace(
  "res.status(500).json({ error: 'Failed to update agenda session' });",
  "res.status(500).json({ error: 'Failed to update agenda session: ' + e.message });"
);
fs.writeFileSync('server.ts', serverCode, 'utf8');

// Patch frontend to read error message
let agendaCode = fs.readFileSync('src/components/admin/AgendaView.tsx', 'utf8');
agendaCode = agendaCode.replace(
  "if (!res.ok) throw new Error('Failed to save');",
  "if (!res.ok) {\n        const errData = await res.json().catch(() => ({}));\n        throw new Error(errData.error || `HTTP ${res.status} Failed to save`);\n      }"
);
fs.writeFileSync('src/components/admin/AgendaView.tsx', agendaCode, 'utf8');
