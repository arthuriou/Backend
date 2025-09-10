// Test end-to-end de l'upload API (registre -> login -> upload photo)
// Usage: node scripts/test-upload-api.js [BASE_URL] [IMAGE_PATH]

require('dotenv').config();
const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function main() {
  const BASE_URL = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
  const IMG = process.argv[3] || path.join(process.cwd(), 'uploads', 'profile', '1757515692043-179239479.jpeg');

  const client = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

  const rnd = Math.floor(Math.random() * 1e9);
  const email = `test_upload_${rnd}@example.com`;
  const password = 'Passw0rd!';

  console.log('> Register patient:', email);
  const reg = await client.post('/api/auth/register-patient', {
    email,
    motdepasse: password,
    nom: 'Test',
  });
  console.log('register status:', reg.status);
  if (reg.status >= 400) {
    console.error('Register failed:', reg.data);
    process.exit(1);
  }

  console.log('> Login to get token');
  const login = await client.post('/api/auth/login', { email, motdepasse: password });
  console.log('login status:', login.status);
  if (login.status !== 200 || !login.data?.data?.token) {
    console.error('Login failed:', login.data);
    process.exit(2);
  }
  const token = login.data.data.token;

  console.log('> Upload profile photo to Cloudinary via API');
  if (!fs.existsSync(IMG)) {
    console.error('Image not found at', IMG);
    process.exit(3);
  }
  const form = new FormData();
  form.append('file', fs.createReadStream(IMG));

  const upload = await client.post('/api/auth/profile/photo', form, {
    headers: { Authorization: `Bearer ${token}`, ...form.getHeaders() },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  console.log('upload status:', upload.status);
  console.log('upload data:', upload.data);

  if (upload.status !== 201) {
    process.exit(4);
  }
  process.exit(0);
}

main();


