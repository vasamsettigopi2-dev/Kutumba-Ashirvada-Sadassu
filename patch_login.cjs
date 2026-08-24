const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const loginCode = `
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if ((username === 'admin1' && password === 'admin1') || 
        (username === 'admin2' && password === 'admin2') ||
        (username === 'admin@demo.com' && password === 'admin123')) {
      
      try {
        const firebaseToken = await auth.createCustomToken(username);
        const token = jwt.sign({ email: username, uid: username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, firebaseToken, email: username });
      } catch (e) {
        console.error("Firebase custom token error:", e);
        res.status(500).json({ error: 'Failed to generate token' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
`;

content = content.replace(/  app\.post\('\/api\/admin\/login', \(req, res\) => \{[\s\S]*?  \}\);\n/, loginCode + '\n');

fs.writeFileSync('server.ts', content, 'utf8');
