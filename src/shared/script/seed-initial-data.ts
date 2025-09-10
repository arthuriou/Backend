import dotenv from 'dotenv';
import db from '../../shared/database/client';

dotenv.config();

async function findSpecialiteIdByLike(pattern: string) {
  const r = await db.query(
    `SELECT idspecialite
     FROM specialite
     WHERE lower(nom) LIKE lower($1)
     LIMIT 1`,
    [pattern]
  );
  return r.rows[0]?.idspecialite as string | undefined;
}

async function getOrUpsertMaux(nom: string, description: string, categorie: string) {
  const existing = await db.query(
    `SELECT idmaux FROM maux WHERE nom = $1 LIMIT 1`,
    [nom]
  );
  if (existing.rows[0]?.idmaux) {
    const id = existing.rows[0].idmaux as string;
    await db.query(
      `UPDATE maux SET description = $2, categorie = $3 WHERE idmaux = $1`,
      [id, description, categorie]
    );
    return id;
  }
  const inserted = await db.query(
    `INSERT INTO maux (nom, description, categorie)
     VALUES ($1, $2, $3)
     RETURNING idmaux`,
    [nom, description, categorie]
  );
  return inserted.rows[0].idmaux as string;
}

async function ensureLinkSpecialiteMaux(idspecialite: string, idmaux: string) {
  const exists = await db.query(
    `SELECT 1 FROM specialite_maux WHERE specialite_id = $1 AND maux_id = $2 LIMIT 1`,
    [idspecialite, idmaux]
  );
  if (exists.rows.length === 0) {
    await db.query(
      `INSERT INTO specialite_maux (specialite_id, maux_id) VALUES ($1, $2)`,
      [idspecialite, idmaux]
    );
  }
}

async function main() {
  console.log('Seeding des maux et liens specialite_maux...');

  // Maux récurrents
  const maux = [
    ['Fièvre', 'Élévation de la température corporelle', 'Symptôme'],
    ['Toux', 'Expulsion d’air brusque et sonore', 'Symptôme'],
    ['Maux de tête', 'Céphalées', 'Symptôme'],
    ['Douleur thoracique', 'Douleur au niveau de la poitrine', 'Symptôme'],
    ['Hypertension artérielle', 'Pression sanguine élevée', 'Maladie'],
    ['Diabète', 'Trouble du métabolisme du glucose', 'Maladie'],
    ['Allergie cutanée', 'Réaction cutanée à un allergène', 'Affection'],
    ['Gastro-entérite', 'Inflammation du tube digestif', 'Maladie']
  ] as const;

  const mauxIds: Record<string, string> = {};
  for (const [nom, description, categorie] of maux) {
    const id = await getOrUpsertMaux(nom, description, categorie);
    mauxIds[nom] = id;
  }

  // On lie aux spécialités existantes en utilisant des motifs LIKE robustes aux accents corrompus
  const patterns: Record<string, string> = {
    'Cardiologie': 'cardio%',
    'Dermatologie': 'derm%',
    'Pédiatrie': 'p%diatrie%',
    'Gynécologie': 'gyn%colog%',
    'Médecine générale': 'm%decine g%n%rale%',
    'Psychiatrie': 'psychiatrie%',
    'Radiologie': 'radiologie%',
    'Chirurgie générale': 'chirurgie g%n%rale%'
  };

  const assocSpecs: Array<[string, string[]]> = [
    ['Cardiologie', ['Douleur thoracique', 'Hypertension artérielle']],
    ['Dermatologie', ['Allergie cutanée']],
    ['Pédiatrie', ['Fièvre', 'Toux']],
    ['Médecine générale', ['Fièvre', 'Toux', 'Maux de tête', 'Gastro-entérite']],
  ];

  for (const [specNom, mauxList] of assocSpecs) {
    const pattern = patterns[specNom] ?? `${specNom.toLowerCase()}%`;
    const specId = await findSpecialiteIdByLike(pattern);
    if (!specId) {
      console.warn(`Spécialité non trouvée pour motif: ${specNom} (${pattern}) - association ignorée.`);
      continue;
    }
    for (const mNom of mauxList) {
      const mId = mauxIds[mNom];
      if (!mId) {
        console.warn(`Maux non trouvé: ${mNom} - association ignorée.`);
        continue;
      }
      await ensureLinkSpecialiteMaux(specId, mId);
    }
  }

  console.log('✅ Seeding maux + liens terminé.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeding échoué:', err);
  process.exit(1);
});
