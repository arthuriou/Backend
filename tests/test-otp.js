/**
 * Test des routes OTP
 */

const http = require('http');

function testOTPRoutes() {
  console.log('🧪 Test des routes OTP...');
  
  // Test envoi OTP
  const otpData = {
    email: 'patient@test.com'
  };
  
  testRoute('POST', '/api/auth/send-otp', 'Envoi OTP', otpData);
  
  // Test vérification OTP
  const verifyData = {
    email: 'patient@test.com',
    otp: '123456'
  };
  
  setTimeout(() => {
    testRoute('POST', '/api/auth/verify-otp', 'Vérification OTP', verifyData);
  }, 1000);
  
  // Test renvoi OTP
  setTimeout(() => {
    testRoute('POST', '/api/auth/resend-otp', 'Renvoi OTP', otpData);
  }, 2000);
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

testOTPRoutes();
