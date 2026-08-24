async function test() {
  // 1. Login to get token
  const loginRes = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin2', password: 'admin2' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Login Token:', token ? 'Success' : 'Failed');

  // 2. Add session
  const postRes = await fetch('http://localhost:3000/api/admin/agenda', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ day: 'Day 1', title: 'Flow Test' })
  });
  console.log('POST status:', postRes.status);
  const postData = await postRes.json();
  console.log('POST response:', postData);

  // 3. Edit session
  const id = postData.id;
  const putRes = await fetch(`http://localhost:3000/api/admin/agenda/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ id, title: 'Flow Test Edited' })
  });
  console.log('PUT status:', putRes.status);
  console.log('PUT response:', await putRes.json());
}
test().catch(console.error);
