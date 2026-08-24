const jwt = require('jsonwebtoken');
const token = jwt.sign({ email: 'admin' }, 'fallback-secret-for-demo', { expiresIn: '1h' });

async function test() {
  const url = 'http://localhost:3000/api/admin/agenda';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      day: 'Day 1',
      date: '2026-10-16',
      title: 'Testing new session 1'
    })
  });
  console.log('POST Status:', res.status);
  console.log('POST Body:', await res.text());
}
test();
