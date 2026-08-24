const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const getRoute = `
  app.get('/api/admin/agenda', async (req, res) => {
    try {
      const snapshot = await db.collection('agenda').get();
      const agenda = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ agenda });
    } catch (error) {
      console.error('Fetch agenda error:', error);
      res.status(500).json({ error: 'Failed to fetch agenda' });
    }
  });
`;

content = content.replace("// Agenda Admin Routes", "// Agenda Admin Routes\n" + getRoute);

fs.writeFileSync('server.ts', content, 'utf8');
