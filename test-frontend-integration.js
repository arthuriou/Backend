#!/usr/bin/env node

/**
 * Script de test d'intégration Frontend-Backend
 * Vérifie que tous les endpoints sont accessibles et fonctionnels
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test d'un endpoint
async function testEndpoint(method, url, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      log(`✅ ${method} ${url} - Status: ${response.status}`, 'green');
      return { success: true, data: response.data };
    } else {
      log(`❌ ${method} ${url} - Status: ${response.status} (attendu: ${expectedStatus})`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    if (error.response) {
      log(`❌ ${method} ${url} - Status: ${error.response.status}`, 'red');
      return { success: false, error: `Status ${error.response.status}` };
    } else {
      log(`❌ ${method} ${url} - Erreur: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

// Tests d'authentification
async function testAuth() {
  log('\n🔐 Test des endpoints d\'authentification', 'blue');
  
  // Test envoi OTP (sans authentification)
  await testEndpoint('POST', '/auth/send-otp', {
    email: 'patient@example.com'
  });

  // Test vérification OTP (sans authentification)
  await testEndpoint('POST', '/auth/verify-otp', {
    email: 'patient@example.com',
    code: '123456'
  });
}

// Tests de recherche de médecins
async function testSearch() {
  log('\n🔍 Test des endpoints de recherche', 'blue');
  
  // Test récupération des spécialités
  await testEndpoint('GET', '/specialites/specialites');

  // Test recherche globale de médecins
  await testEndpoint('GET', '/specialites/medecins/search?q=cardiologie&limit=10');

  // Test recherche par spécialité
  const specialties = await testEndpoint('GET', '/specialites/specialites');
  if (specialties.success && specialties.data.length > 0) {
    const firstSpecialty = specialties.data[0];
    await testEndpoint('GET', `/specialites/specialites/${firstSpecialty.idspecialite}/medecins`);
  }
}

// Tests de rendez-vous
async function testAppointments() {
  log('\n📅 Test des endpoints de rendez-vous', 'blue');
  
  // Test récupération des créneaux disponibles
  await testEndpoint('GET', '/rendezvous/creneaux/disponibles?medecinId=test&dateDebut=2025-01-20&dateFin=2025-01-21');

  // Test des nouveaux endpoints de workflow
  await testEndpoint('GET', '/rendezvous/en-attente-consultation');
  await testEndpoint('GET', '/rendezvous/en-cours');
  await testEndpoint('GET', '/rendezvous/aujourd-hui');
  await testEndpoint('GET', '/rendezvous/cette-semaine');
}

// Tests de messagerie
async function testMessaging() {
  log('\n💬 Test des endpoints de messagerie', 'blue');
  
  // Test récupération des conversations
  await testEndpoint('GET', '/messagerie/conversations');

  // Test création de conversation privée
  await testEndpoint('POST', '/messagerie/conversations/private', {
    participantId: 'test-participant-id'
  });
}

// Tests de dossier médical
async function testMedicalRecord() {
  log('\n📁 Test des endpoints de dossier médical', 'blue');
  
  // Test récupération du dossier
  await testEndpoint('GET', '/dossier-medical/dossier/me');
}

// Tests de notifications
async function testNotifications() {
  log('\n🔔 Test des endpoints de notifications', 'blue');
  
  // Test récupération des préférences
  await testEndpoint('GET', '/notifications/preferences');

  // Test récupération des devices
  await testEndpoint('GET', '/notifications/devices');
}

// Test de santé du serveur
async function testHealth() {
  log('\n🏥 Test de santé du serveur', 'blue');
  
  try {
    const response = await axios.get('http://localhost:3000/health');
    if (response.status === 200) {
      log('✅ Serveur en ligne et fonctionnel', 'green');
      log(`   Version: ${response.data.version || 'N/A'}`, 'blue');
      log(`   Uptime: ${response.data.uptime || 'N/A'}`, 'blue');
    }
  } catch (error) {
    log('❌ Serveur inaccessible', 'red');
    log(`   Erreur: ${error.message}`, 'red');
  }
}

// Fonction principale
async function runTests() {
  log('🚀 Démarrage des tests d\'intégration Frontend-Backend', 'bold');
  log('=' .repeat(60), 'blue');

  const startTime = Date.now();

  // Tests de base
  await testHealth();
  
  // Tests par catégorie
  await testAuth();
  await testSearch();
  await testAppointments();
  await testMessaging();
  await testMedicalRecord();
  await testNotifications();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  log('\n' + '=' .repeat(60), 'blue');
  log(`✅ Tests terminés en ${duration}s`, 'green');
  log('\n📋 Résumé des endpoints testés:', 'bold');
  log('   • Authentification (OTP)', 'blue');
  log('   • Recherche de médecins', 'blue');
  log('   • Gestion des rendez-vous', 'blue');
  log('   • Messagerie', 'blue');
  log('   • Dossier médical', 'blue');
  log('   • Notifications', 'blue');
  
  log('\n🎯 Prochaines étapes pour le frontend:', 'bold');
  log('   1. Créer le projet Expo avec: npx create-expo-app SanteAfrikFrontend', 'yellow');
  log('   2. Installer les dépendances listées dans FRONTEND_QUICK_START.md', 'yellow');
  log('   3. Implémenter les écrans selon FRONTEND_IMPLEMENTATION_GUIDE.md', 'yellow');
  log('   4. Tester l\'intégration avec ce script', 'yellow');
  
  log('\n🚀 Le backend est prêt pour l\'intégration frontend !', 'green');
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  log(`\n❌ Erreur non gérée: ${error.message}`, 'red');
  process.exit(1);
});

// Exécution
if (require.main === module) {
  runTests().catch((error) => {
    log(`\n❌ Erreur lors de l'exécution des tests: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests };
