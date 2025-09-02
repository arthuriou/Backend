/**
 * Script de test de connexion à la base de données
 */

import dotenv from 'dotenv';
import { initializeDatabase, testConnection, getDatabaseInfo, closeDatabase } from './shared/config/database';

// Charger les variables d'environnement (optionnel)
try {
  dotenv.config();
  console.log('✅ Fichier .env chargé');
} catch (error) {
  console.log('⚠️ Fichier .env non trouvé, utilisation des valeurs par défaut');
}

async function testDatabaseConnection() {
  console.log('🧪 Test de connexion à la base de données SantéAfrik');
  console.log('==================================================\n');

  try {
    // Afficher la configuration
    console.log('📋 Configuration de la base de données:');
    const dbInfo = getDatabaseInfo();
    console.log(`   Host: ${dbInfo.host}`);
    console.log(`   Port: ${dbInfo.port}`);
    console.log(`   Database: ${dbInfo.database}`);
    console.log(`   User: ${dbInfo.user}`);
    console.log(`   SSL: ${dbInfo.ssl ? 'Activé' : 'Désactivé'}`);
    console.log(`   Max Connections: ${dbInfo.maxConnections}\n`);

    // Vérifier si la base de données existe
    console.log('🔍 Vérification de l\'existence de la base de données...');
    console.log('   Si la base n\'existe pas, créez-la avec:');
    console.log('   psql -U postgres -c "CREATE DATABASE santeafrik_db;"');
    console.log('   ou via pgAdmin\n');

    // Initialiser la base de données
    console.log('🔄 Initialisation du pool de connexions...');
    initializeDatabase();
    console.log('✅ Pool de connexions initialisé\n');

    // Tester la connexion
    console.log('🔍 Test de connexion...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('🎉 Connexion à la base de données réussie !');
      console.log('✅ La base de données est accessible et fonctionnelle');
    } else {
      console.log('❌ Échec de la connexion à la base de données');
      console.log('\n💡 Solutions possibles:');
      console.log('   1. Créer la base de données santeafrik_db');
      console.log('   2. Vérifier le mot de passe PostgreSQL');
      console.log('   3. Vérifier que PostgreSQL est démarré');
    }

  } catch (error) {
    console.error('💥 Erreur lors du test de connexion:');
    console.error(error);
  } finally {
    // Fermer la connexion
    console.log('\n🔄 Fermeture de la connexion...');
    await closeDatabase();
    console.log('✅ Test terminé');
  }
}

// Exécuter le test
testDatabaseConnection().catch(console.error);
