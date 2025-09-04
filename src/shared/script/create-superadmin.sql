-- Script pour créer le SuperAdmin initial
-- À exécuter une seule fois lors de la première installation

-- 1. Créer l'utilisateur SuperAdmin
INSERT INTO utilisateur (idUtilisateur, email, motDePasse, nom, prenom, telephone, actif, mustChangePassword, role)
VALUES (
  gen_random_uuid(),
  'superadmin@santeafrik.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
  'SuperAdmin',
  'Initial',
  '+228 90 00 00 00',
  true,
  true,
  'SUPERADMIN'
);

-- 2. Récupérer l'ID de l'utilisateur créé
WITH new_user AS (
  SELECT idUtilisateur FROM utilisateur 
  WHERE email = 'superadmin@santeafrik.com'
)
-- 3. Créer l'entrée SuperAdmin
INSERT INTO superAdmin (idSuperAdmin, utilisateur_id, niveauacces, datecreation)
SELECT 
  gen_random_uuid(),
  new_user.idUtilisateur,
  'FULL_ACCESS',
  NOW()
FROM new_user;

-- 4. Afficher les informations du SuperAdmin créé
SELECT 
  u.idUtilisateur,
  u.email,
  u.nom,
  u.prenom,
  u.actif,
  sa.niveauacces,
  sa.datecreation
FROM utilisateur u
JOIN superAdmin sa ON u.idUtilisateur = sa.utilisateur_id
WHERE u.email = 'superadmin@santeafrik.com';
