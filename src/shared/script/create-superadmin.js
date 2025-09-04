const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'santeAfrikDb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSLMODE === 'require' || process.env.DB_SSLMODE === 'verify-full',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
});

async function createSuperAdmin() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Vérifier si un SuperAdmin existe déjà
    const existingSuperAdmin = await client.query(
      'SELECT u.idUtilisateur FROM utilisateur u JOIN superAdmin s ON u.idUtilisateur = s.utilisateur_id'
    );
    
    if (existingSuperAdmin.rows.length > 0) {
      console.log('❌ Un SuperAdmin existe déjà dans la base de données');
      return;
    }
    
    // Créer l'utilisateur SuperAdmin
    const hashedPassword = await bcrypt.hash('password', 10);
    const userResult = await client.query(`
      INSERT INTO utilisateur (idUtilisateur, email, motDePasse, nom, prenom, telephone, actif, mustChangePassword)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
      RETURNING idUtilisateur
    `, [
      'superadmin@santeafrik.com',
      hashedPassword,
      'SuperAdmin',
      'Initial',
      '+228 90 00 00 00',
      true,
      true
    ]);
    
    const userId = userResult.rows[0].idutilisateur;
    
    // Créer l'entrée SuperAdmin
    await client.query(`
      INSERT INTO superAdmin (idSuperAdmin, utilisateur_id, niveauAcces)
      VALUES (gen_random_uuid(), $1, $2)
    `, [userId, 'FULL_ACCESS']);
    
    await client.query('COMMIT');
    
    console.log('✅ SuperAdmin créé avec succès !');
    console.log('📧 Email: superadmin@santeafrik.com');
    console.log('🔑 Mot de passe: password');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création du SuperAdmin:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter le script
createSuperAdmin()
  .then(() => {
    console.log('🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
