const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 'cde448a1-a7ad-4271-a791-d86b75cf5511', role: 'student' },
  'supersecret_levelblue_key',
  { expiresIn: '365d' }
);

async function run() {
  const res = await fetch('http://localhost:3001/api/bounties/student/cde448a1-a7ad-4271-a791-d86b75cf5511', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  console.log(text);
}

run();
