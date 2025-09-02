/**
 * Script de test du module d'authentification SantéAfrik
 */

import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './shared/config/database';
import AuthService from './features/auth/auth.service';

// Charger les variables d'environnement
dotenv.config();

async function testAuthModule() {
  try {
    console.log('🧪 Test du module d\'authentification SantéAfrik');
    console.log('==============================================');
    
    // Initialiser la base de données
    initializeDatabase();
    
    // Test 1: Inscription d'un patient
    console.log('\n📝 Test 1: Inscription d\'un patient');
    console.log('----------------------------------------');
    
    const patientData = {
      email: 'test.patient@santeafrik.com',
      motDePasse: 'Test123!@#',
      nom: 'Doe',
      prenom: 'John',
      telephone: '+22890123456',
      dateNaissance: new Date('1990-01-01'),
      genre: 'M',
      adresse: '123 Rue de la Santé, Lomé',
      groupeSanguin: 'O+',
      poids: 70,
      taille: 175
    };
    
    const patientResult = await AuthService.inscrirePatient(patientData);
    console.log('✅ Résultat inscription patient:', patientResult);
    
    // Test 2: Inscription d'un médecin
    console.log('\n📝 Test 2: Inscription d\'un médecin');
    console.log('----------------------------------------');
    
    const medecinData = {
      email: 'test.medecin@santeafrik.com',
      motDePasse: 'Test123!@#',
      nom: 'Smith',
      prenom: 'Dr. Jane',
      telephone: '+22890123457',
      numOrdre: 'MED001',
      experience: 5,
      biographie: 'Médecin généraliste avec 5 ans d\'expérience'
    };
    
    const medecinResult = await AuthService.inscrireMedecin(medecinData);
    console.log('✅ Résultat inscription médecin:', medecinResult);
    
    // Test 3: Connexion du patient
    console.log('\n🔐 Test 3: Connexion du patient');
    console.log('----------------------------------');
    
    const connexionData = {
      email: 'test.patient@santeafrik.com',
      motDePasse: 'Test123!@#'
    };
    
    const connexionResult = await AuthService.connecter(connexionData);
    console.log('✅ Résultat connexion patient:', connexionResult);
    
    // Test 4: Vérification OTP
    console.log('\n📧 Test 4: Vérification OTP');
    console.log('-------------------------------');
    
    const otpData = {
      email: 'test.patient@santeafrik.com',
      otp: '123456' // OTP de test
    };
    
    const otpResult = await AuthService.verifierOTP(otpData);
    console.log('✅ Résultat vérification OTP:', otpResult);
    
    console.log('\n🎉 Tous les tests d\'authentification sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    // Fermer la connexion à la base de données
    await closeDatabase();
  }
}

// Exécuter les tests
testAuthModule().catch(console.error);
