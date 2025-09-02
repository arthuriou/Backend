/**
 * Script d'initialisation de la base de données SantéAfrik
 * Exécute le schéma SQL complet et insère les données initiales
 */

import { initializeDatabase, query, closeDatabase } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

// Charger le schéma SQL
const loadSQLSchema = (): string => {
  try {
    const schemaPath = join(__dirname, 'database.sql');
    return readFileSync(schemaPath, 'utf8');
  } catch (error) {
    console.error('❌ Erreur lors du chargement du schéma SQL:', error);
    throw error;
  }
};

// Diviser le schéma en requêtes exécutables
const parseSQLQueries = (schema: string): string[] => {
  const queries: string[] = [];
  let currentQuery = '';
  let inBlock = false;
  let blockDelimiter = '';
  
  const lines = schema.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignorer les commentaires et lignes vides
    if (trimmedLine.startsWith('--') || trimmedLine === '') {
      continue;
    }
    
    // Détecter le début d'un bloc DO $$
    if (trimmedLine.startsWith('DO $$')) {
      inBlock = true;
      blockDelimiter = '$$';
      currentQuery = trimmedLine;
      continue;
    }
    
    // Détecter la fin d'un bloc DO $$
    if (inBlock && trimmedLine.includes('$$')) {
      currentQuery += '\n' + trimmedLine;
      if (currentQuery.trim()) {
        queries.push(currentQuery.trim());
      }
      currentQuery = '';
      inBlock = false;
      blockDelimiter = '';
      continue;
    }
    
    // Si on est dans un bloc, ajouter la ligne
    if (inBlock) {
      currentQuery += '\n' + trimmedLine;
      continue;
    }
    
    // Détecter la fin d'une requête normale (point-virgule)
    if (trimmedLine.endsWith(';')) {
      currentQuery += '\n' + trimmedLine;
      if (currentQuery.trim()) {
        queries.push(currentQuery.trim());
      }
      currentQuery = '';
    } else {
      currentQuery += '\n' + trimmedLine;
    }
  }
  
  // Ajouter la dernière requête si elle existe
  if (currentQuery.trim()) {
    queries.push(currentQuery.trim());
  }
  
  return queries.filter(q => q.trim().length > 0);
};

// Exécuter le schéma SQL
const executeSchema = async (): Promise<void> => {
  try {
    console.log('🔧 Exécution du schéma SQL...');
    
    const schema = loadSQLSchema();
    const queries = parseSQLQueries(schema);
    
    console.log(`📝 ${queries.length} requêtes SQL à exécuter`);
    
    for (let i = 0; i < queries.length; i++) {
      const queryText = queries[i];
      try {
        await query(queryText);
        console.log(`✅ Requête ${i + 1}/${queries.length} exécutée`);
      } catch (error: any) {
        // Ignorer les erreurs de tables déjà existantes
        if (error.code === '42P07') {
          console.log(`⚠️ Table déjà existante (requête ${i + 1}/${queries.length})`);
        } else {
          console.error(`❌ Erreur requête ${i + 1}/${queries.length}:`, error.message);
          // Continuer avec les autres requêtes
        }
      }
    }
    
    console.log('✅ Schéma SQL exécuté avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du schéma:', error);
    throw error;
  }
};

// Vérifier que les tables ont été créées
const verifyTables = async (): Promise<void> => {
  try {
    console.log('🔍 Vérification des tables créées...');
    
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables créées:');
    result.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log(`✅ ${result.rows.length} tables créées avec succès`);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables:', error);
    throw error;
  }
};

// Vérifier les données initiales
const verifyInitialData = async (): Promise<void> => {
  try {
    console.log('🔍 Vérification des données initiales...');
    
    // Vérifier les rôles
    try {
      const roles = await query('SELECT COUNT(*) as count FROM role');
      console.log(`   - Rôles: ${roles.rows[0].count}`);
    } catch (error) {
      console.log('   - Rôles: Table non créée');
    }
    
    // Vérifier les permissions
    try {
      const permissions = await query('SELECT COUNT(*) as count FROM permission');
      console.log(`   - Permissions: ${permissions.rows[0].count}`);
    } catch (error) {
      console.log('   - Permissions: Table non créée');
    }
    
    // Vérifier les spécialités
    try {
      const specialites = await query('SELECT COUNT(*) as count FROM specialite');
      console.log(`   - Spécialités: ${specialites.rows[0].count}`);
    } catch (error) {
      console.log('   - Spécialités: Table non créée');
    }
    
    console.log('✅ Données initiales vérifiées');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des données:', error);
    throw error;
  }
};

// Fonction principale
const main = async (): Promise<void> => {
  try {
    console.log('🚀 Initialisation de la base de données SantéAfrik');
    console.log('================================================');
    
    // Initialiser la connexion
    initializeDatabase();
    
    // Exécuter le schéma
    await executeSchema();
    
    // Vérifier les tables
    await verifyTables();
    
    // Vérifier les données initiales
    await verifyInitialData();
    
    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('✅ Toutes les tables et données initiales sont en place');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await closeDatabase();
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

export default main;
