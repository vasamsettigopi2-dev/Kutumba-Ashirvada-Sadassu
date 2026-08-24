const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const seedCode = `
app.get('/api/admin/seed-agenda', async (req, res) => {
  const sessions = [
    { day: 'Day 1', date: '2026-10-16', startTime: '18:00', endTime: '21:00', title: 'Opening Ceremony & Welcome Worship', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
    { day: 'Day 2', date: '2026-10-17', startTime: '09:00', endTime: '12:00', title: 'Morning Worship & Message', speaker: 'Rev. Samuel', ytLiveLink: '', notesLink: '' },
    { day: 'Day 2', date: '2026-10-17', startTime: '14:00', endTime: '16:00', title: 'Youth Workshop: Walking in Faith', speaker: 'Brother David', ytLiveLink: '', notesLink: '' },
    { day: 'Day 3', date: '2026-10-18', startTime: '10:00', endTime: '13:00', title: 'Sunday Special Service', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
    { day: 'Day 4', date: '2026-10-19', startTime: '10:00', endTime: '12:00', title: 'Leadership Seminar', speaker: 'Rev. Samuel', ytLiveLink: '', notesLink: '' },
    { day: 'Day 5', date: '2026-10-20', startTime: '18:00', endTime: '21:00', title: 'Closing Ceremony & Thanksgiving', speaker: 'Pastor John', ytLiveLink: '', notesLink: '' },
  ];
  
  try {
    for (const session of sessions) {
      await db.collection('agenda').add(session);
    }
    res.json({ success: true, message: 'Agenda seeded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`;

content = content.replace("app.post('/api/admin/resend',", seedCode + "\n  app.post('/api/admin/resend',");

fs.writeFileSync('server.ts', content, 'utf8');
