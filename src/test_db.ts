import pool from "./utils/database"; // adapte le chemin

async function testConnexion() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("📅 Heure actuelle dans PostgreSQL :", result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur lors de la requête :", err);
  } finally {
    await pool.end(); // pour fermer proprement le pool après le test
  }
}

testConnexion();