const jwt = require('jsonwebtoken');
const token = jwt.sign({ email: 'admin' }, 'fallback-secret-for-demo', { expiresIn: '1h' });

async function test() {
  const url = 'http://localhost:3000/api/admin/agenda/PayDmNQol8TzPcXhQQLn';
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: 'PayDmNQol8TzPcXhQQLn',
      title: 'testing edited 2'
    })
  });
  console.log('PUT Status:', res.status);
  console.log('PUT Body:', await res.text());
}
test();
