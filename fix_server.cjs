const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const setupCode = `
// Vite middleware for development and static serving for production
if (!process.env.VERCEL) {
  (async () => {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(distPath, 'index.html'));
        }
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });
  })();
}

export default app;
`;

code = code.replace(/export default app;/, setupCode);
fs.writeFileSync('server.ts', code);
