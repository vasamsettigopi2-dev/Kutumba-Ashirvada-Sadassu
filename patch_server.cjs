const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove async function startServer() {
code = code.replace('async function startServer() {\n  const app = express();', 'const app = express();');

// Find the Vite middleware part
const vitePartIndex = code.indexOf('// Vite middleware for development');
if (vitePartIndex !== -1) {
    const endVite = code.indexOf('}\n\n// Background Task Processors', vitePartIndex);
    
    const beforeVite = code.substring(0, vitePartIndex);
    const afterVite = code.substring(endVite + 1);
    
    const newViteLogic = `
// Vite middleware for development
async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
  });
}

if (process.env.NODE_ENV !== "production") {
  startDevServer();
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  }
}

export default app;
`;

    code = beforeVite + newViteLogic + afterVite;
}

// Remove the startServer(); at the end
code = code.replace('startServer();', '');

fs.writeFileSync('server.ts', code);
