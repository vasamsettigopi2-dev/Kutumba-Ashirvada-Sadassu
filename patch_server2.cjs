const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove static vite import
code = code.replace("import { createServer as createViteServer } from 'vite';", "");

// Change startDevServer to dynamically import vite
code = code.replace(
  "const vite = await createViteServer({",
  "const { createServer: createViteServer } = await import('vite');\n  const vite = await createViteServer({"
);

fs.writeFileSync('server.ts', code);
