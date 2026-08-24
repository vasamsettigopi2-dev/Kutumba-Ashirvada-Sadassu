const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace("import express from 'express';", "import express from 'express';\nimport jwt from 'jsonwebtoken';\n");

const verifyAdminReplacement = `
  // Secure JWT Secret
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-demo';

  // Custom Admin Login Route
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded 2 Admins for simplicity as requested
    if ((username === 'admin1' && password === 'admin1') || 
        (username === 'admin2' && password === 'admin2') ||
        (username === 'admin@demo.com' && password === 'admin123')) {
      const token = jwt.sign({ email: username, uid: username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, email: username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Custom Admin middleware using JWT
  const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
`;

content = content.replace(/  \/\/ Admin middleware to verify Firebase Auth token[\s\S]*?  \};/, verifyAdminReplacement);

fs.writeFileSync('server.ts', content, 'utf8');
