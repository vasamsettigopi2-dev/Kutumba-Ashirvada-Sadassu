import path from 'path';
import express from 'express';
import app from './api/_lib/app';

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  (async () => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
          configFile: path.join(process.cwd(), 'vite.config.ts'),
          server: { middlewareMode: true },
          appType: 'spa',
        });
        console.log('⏳ Pre-bundling frontend dependencies (first start may take 30-60s)...');
        await Promise.all([
          vite.warmupRequest('/src/main.tsx'),
          vite.warmupRequest('/src/App.tsx'),
          vite.warmupRequest('/src/components/InvitePage.tsx'),
        ]);
        console.log('✅ Vite dev server ready');
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

      app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`\n==============================================`);
        console.log(`🚀 App is running successfully!`);
        console.log(`➜ Public Site:     http://localhost:${PORT}`);
        console.log(`➜ Admin Dashboard: http://localhost:${PORT}/admin`);
        console.log(`➜ QR Check-in:     http://localhost:${PORT}/admin/checkin`);
        console.log(`==============================================\n`);
      });
    } catch (err) {
      console.error('Server initialization error:', err);
    }
  })();
}

export default app;
