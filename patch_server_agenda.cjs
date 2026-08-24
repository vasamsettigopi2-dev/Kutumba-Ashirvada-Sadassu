const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const agendaRoutes = `
  // Agenda Admin Routes
  app.post('/api/admin/agenda', verifyAdmin, async (req, res) => {
    try {
      const docRef = await db.collection('agenda').add(req.body);
      res.json({ success: true, id: docRef.id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to add agenda session' });
    }
  });

  app.put('/api/admin/agenda/:id', verifyAdmin, async (req, res) => {
    try {
      await db.collection('agenda').doc(req.params.id).update(req.body);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update agenda session' });
    }
  });

  app.delete('/api/admin/agenda/:id', verifyAdmin, async (req, res) => {
    try {
      await db.collection('agenda').doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete agenda session' });
    }
  });
`;

content = content.replace("app.post('/api/admin/resend', verifyAdmin, async (req, res) => {", agendaRoutes + "\n  app.post('/api/admin/resend', verifyAdmin, async (req, res) => {");

fs.writeFileSync('server.ts', content, 'utf8');
