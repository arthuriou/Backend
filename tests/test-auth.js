/**
 * Test des routes d'authentification
 */

const http = require('http');

function testAuthRoutes() {
  console.log('🧪 Test des routes d\'authentification...');
  
  // Test route de base
  testRoute('GET', '/api/auth', 'Route auth accessible');
  
  // Test inscription patient
  const patientData = {
    email: 'patient@test.com',
    motdepasse: 'password123',
    nom: 'Patient Test',
    prenom: 'Jean',
    telephone: '0123456789'
  };
  
  testRoute('POST', '/api/auth/register-patient', 'Inscription patient', patientData);
}

function testRoute(method, path, description, data = null) {
  const postData = data ? JSON.stringify(data) : null;
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData ? Buffer.byteLength(postData) : 0
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ ${description} - Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Réponse: ${responseData.substring(0, 200)}...`);
    });
  });

  req.on('error', (err) => {
    console.log(`❌ ${description} - Erreur:`, err.message);
  });

  if (postData) {
    req.write(postData);
  }
  
  req.end();
}

testAuthRoutes();
