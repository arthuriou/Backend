# 🚀 Collection Postman - Module d'Authentification SantéAfrik

## 📋 Configuration de l'environnement

### Variables d'environnement Postman
```json
{
  "base_url": "http://localhost:3000",
  "jwt_token": "",
  "refresh_token": "",
  "user_id": "",
  "email": ""
}
```

---

## 🔐 ROUTES PUBLIQUES (Pas d'authentification requise)

### 1. Inscription Patient
- **URL**: `{{base_url}}/api/auth/inscription/patient`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "motDePasse": "MotDePasse123!",
  "telephone": "+2250701234567",
  "dateNaissance": "1990-05-15",
  "sexe": "M",
  "adresse": "123 Rue de la Paix, Abidjan",
  "groupeSanguin": "A+",
  "allergies": ["Pénicilline", "Poussière"],
  "antecedents": "Aucun antécédent notable"
}
```

### 2. Inscription Médecin (Auto-inscription)
- **URL**: `{{base_url}}/api/auth/inscription/medecin`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "nom": "Dr. Koné",
  "prenom": "Fatou",
  "email": "dr.fatou.kone@email.com",
  "motDePasse": "MotDePasse123!",
  "telephone": "+2250701234568",
  "dateNaissance": "1985-08-20",
  "sexe": "F",
  "adresse": "456 Avenue des Médecins, Abidjan",
  "numeroOrdre": "MED123456",
  "specialite": "Cardiologie",
  "anneesExperience": 8,
  "formation": "Faculté de Médecine d'Abidjan",
  "certifications": ["Cardiologie Interventionnelle", "Échocardiographie"]
}
```

### 3. Connexion
- **URL**: `{{base_url}}/api/auth/connexion`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "email": "jean.dupont@email.com",
  "motDePasse": "MotDePasse123!"
}
```

### 4. Vérification OTP
- **URL**: `{{base_url}}/api/auth/verifier-otp`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "email": "jean.dupont@email.com",
  "otp": "123456"
}
```

### 5. Renvoi OTP
- **URL**: `{{base_url}}/api/auth/renvoyer-otp`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "email": "jean.dupont@email.com"
}
```

---

## 🔒 ROUTES PROTÉGÉES (Authentification requise)

### 6. Changer le mot de passe
- **URL**: `{{base_url}}/api/auth/changer-mot-de-passe`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
```json
{
  "ancienMotDePasse": "MotDePasse123!",
  "nouveauMotDePasse": "NouveauMotDePasse456!"
}
```

### 7. Rafraîchir le token
- **URL**: `{{base_url}}/api/auth/rafraichir-token`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

### 8. Déconnexion
- **URL**: `{{base_url}}/api/auth/deconnexion`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

---

## 👨‍⚕️ ROUTES ADMIN CABINET (Rôle ADMIN_CABINET requis)

### 9. Créer un médecin (Admin Cabinet)
- **URL**: `{{base_url}}/api/auth/admin/creer-medecin`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
```json
{
  "nom": "Dr. Traoré",
  "prenom": "Moussa",
  "email": "dr.moussa.traore@email.com",
  "motDePasse": "MotDePasse123!",
  "telephone": "+2250701234569",
  "dateNaissance": "1988-12-10",
  "sexe": "M",
  "adresse": "789 Boulevard des Spécialistes, Abidjan",
  "numeroOrdre": "MED789012",
  "specialite": "Dermatologie",
  "anneesExperience": 5,
  "formation": "Faculté de Médecine de Dakar",
  "certifications": ["Dermatologie Esthétique", "Chirurgie Dermatologique"],
  "cabinetId": "{{cabinet_id}}"
}
```

### 10. Lister les médecins du cabinet
- **URL**: `{{base_url}}/api/auth/admin/medecins-cabinet`
- **Méthode**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Query Parameters**:
  ```
  page: 1
  limit: 10
  specialite: Cardiologie
  actif: true
  ```

---

## 🏥 ROUTES SUPER ADMIN (Rôle SUPER_ADMIN requis)

### 11. Valider un médecin (Super Admin)
- **URL**: `{{base_url}}/api/auth/super-admin/valider-medecin`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
```json
{
  "medecinId": "{{medecin_id}}",
  "statut": "VALIDE",
  "commentaire": "Médecin validé après vérification des documents"
}
```

### 12. Lister les médecins en attente
- **URL**: `{{base_url}}/api/auth/super-admin/medecins-en-attente`
- **Méthode**: `GET`
- **Headers**: 
  ```
  Authorization: Bearer {{jwt_token}}
  ```
- **Query Parameters**:
  ```
  page: 1
  limit: 20
  specialite: Cardiologie
  ```

### 13. Créer un cabinet
- **URL**: `{{base_url}}/api/auth/super-admin/creer-cabinet`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
```json
{
  "nom": "Centre Médical SantéAfrik",
  "adresse": "123 Avenue des Médecins, Abidjan",
  "telephone": "+225272123456",
  "email": "contact@santeafrik.com",
  "description": "Centre médical moderne offrant des soins de qualité",
  "horairesOuverture": "08:00-18:00",
  "services": ["Consultation", "Laboratoire", "Imagerie"],
  "specialites": ["Cardiologie", "Dermatologie", "Gynécologie"]
}
```

### 14. Créer un Admin Cabinet
- **URL**: `{{base_url}}/api/auth/super-admin/creer-admin-cabinet`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {{jwt_token}}
  ```
- **Body**:
```json
{
  "nom": "Admin",
  "prenom": "Cabinet",
  "email": "admin.cabinet@santeafrik.com",
  "motDePasse": "AdminCabinet123!",
  "telephone": "+2250701234570",
  "cabinetId": "{{cabinet_id}}",
  "permissions": ["GERER_MEDECINS", "GERER_PATIENTS", "GERER_RDV"]
}
```

---

## 🧪 ROUTES DE DÉVELOPPEMENT (NODE_ENV=development uniquement)

### 15. Créer Super Admin (Dev uniquement)
- **URL**: `{{base_url}}/api/auth/dev/creer-super-admin`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "nom": "Super",
  "prenom": "Admin",
  "email": "super.admin@santeafrik.com",
  "motDePasse": "SuperAdmin123!"
}
```

### 16. Créer Admin Cabinet (Dev uniquement)
- **URL**: `{{base_url}}/api/auth/dev/creer-admin-cabinet`
- **Méthode**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
```json
{
  "nom": "Dev",
  "prenom": "Admin",
  "email": "dev.admin@santeafrik.com",
  "motDePasse": "DevAdmin123!",
  "cabinetId": "{{cabinet_id}}"
}
```

---

## 📝 NOTES IMPORTANTES

### 🔑 Gestion des Tokens
1. **Connexion** : Récupérez `accessToken` et `refreshToken` de la réponse
2. **Utilisation** : Incluez `accessToken` dans le header `Authorization: Bearer {{jwt_token}}`
3. **Expiration** : Utilisez `rafraichir-token` quand le token expire
4. **Déconnexion** : Invalidez le `refreshToken` pour une déconnexion sécurisée

### 🚨 Codes de Statut HTTP
- `200` : Succès
- `201` : Créé avec succès
- `400` : Données invalides
- `401` : Non authentifié
- `403` : Non autorisé
- `404` : Ressource non trouvée
- `409` : Conflit (ex: email déjà utilisé)
- `500` : Erreur serveur

### 📧 Validation Email
- Tous les comptes nécessitent une validation par OTP
- L'OTP expire après 10 minutes
- Maximum 3 tentatives de vérification

### 🔐 Sécurité
- Mots de passe : Minimum 8 caractères, majuscules, minuscules, chiffres, caractères spéciaux
- Tokens JWT : Expirent après 24h (access) et 7 jours (refresh)
- Rate limiting : 100 requêtes par fenêtre de 15 minutes

---

## 🎯 Workflow de Test Recommandé

1. **Créer un Super Admin** (route dev)
2. **Créer un Cabinet** (Super Admin)
3. **Créer un Admin Cabinet** (Super Admin)
4. **Se connecter en tant qu'Admin Cabinet**
5. **Créer un Médecin** (Admin Cabinet)
6. **Se connecter en tant que Médecin**
7. **Tester l'inscription Patient**
8. **Tester la connexion Patient**
9. **Tester la validation Médecin** (Super Admin)

---

## 📱 Variables Postman à Configurer

Après chaque opération, mettez à jour ces variables :
- `{{jwt_token}}` : Access token JWT
- `{{refresh_token}}` : Refresh token JWT
- `{{user_id}}` : ID de l'utilisateur connecté
- `{{email}}` : Email de l'utilisateur connecté
- `{{cabinet_id}}` : ID du cabinet créé
- `{{medecin_id}}` : ID du médecin créé

---

*Documentation générée pour le module d'authentification SantéAfrik* 🚀
