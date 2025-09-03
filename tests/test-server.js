/**
 * Test simple du serveur
 */

const http = require('http');

function testServer() {
  console.log('🧪 Test du serveur...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Serveur répond - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Réponse:', data);
      console.log('✅ Test réussi !');
    });
  });

  req.on('error', (err) => {
    console.log('❌ Erreur:', err.message);
    console.log('💡 Assure-toi que le serveur est démarré avec: npm start');
  });

  req.end();
}

testServer();
