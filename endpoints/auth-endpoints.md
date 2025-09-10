# Endpoints d'Authentification - SantéAfrik

## Base URL
```
http://localhost:3000/api/auth
```

## Table des matières
1. [Inscription](#1-inscription-patient)
2. [Connexion](#2-connexion)
3. [Gestion OTP](#3-gestion-otp)
4. [Gestion des mots de passe](#4-gestion-des-mots-de-passe)
5. [Gestion des profils](#5-gestion-des-profils)
6. [Upload photo de profil](#6-upload-photo-de-profil)
7. [Récupération d'informations](#7-récupération-dinformations)
8. [Gestion SuperAdmin](#8-gestion-superadmin)
9. [Gestion AdminCabinet](#9-gestion-admincabinet)

## 1. Inscription Patient
**POST** `/register-patient`

### Body (JSON)
```json
{
  "email": "patient@example.com",
  "motdepasse": "password123",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "0123456789",
  "datenaissance": "1990-01-15",
  "genre": "M",
  "adresse": "123 Rue de la Paix, Lomé",
  "groupesanguin": "O+",
  "poids": 70,
  "taille": 175
}
```

### Réponse (201)
```json
{
  "message": "Patient créé avec succès",
  "data": {
    "idutilisateur": "uuid",
    "email": "patient@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "0123456789",
    "datecreation": "2025-01-03T00:00:00.000Z",
    "actif": true
  }
}
```

## 2. Inscription Médecin (Auto-inscription)
**POST** `/register-doctor`

### Body (JSON)
```json
{
  "email": "medecin@example.com",
  "motdepasse": "password123",
  "nom": "Martin",
  "prenom": "Dr. Pierre",
  "telephone": "0987654321",
  "numordre": "ORD123456",
  "experience": 5,
  "biographie": "Médecin généraliste avec 5 ans d'expérience"
}
```

### Réponse (201)
```json
{
  "message": "Médecin créé avec succès. En attente de validation.",
  "data": {
    "idutilisateur": "uuid",
    "email": "medecin@example.com",
    "nom": "Martin",
    "prenom": "Dr. Pierre",
    "telephone": "0987654321",
    "datecreation": "2025-01-03T00:00:00.000Z",
    "actif": true
  }
}
```

## 3. Connexion
**POST** `/login`

### Body (JSON)
```json
{
  "email": "patient@example.com",
  "motdepasse": "password123"
}
```

### Réponse (200)
```json
{
  "message": "Connexion réussie",
  "data": {
    "user": {
      "idutilisateur": "uuid",
      "email": "patient@example.com",
      "nom": "Dupont",
      "prenom": "Jean",
      "telephone": "0123456789",
      "datecreation": "2025-01-03T00:00:00.000Z",
      "derniereconnexion": "2025-01-03T12:00:00.000Z",
      "actif": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 3bis. Rafraîchir le token
**POST** `http://localhost:3000/api/auth/refresh`

### Body (JSON)
```json
{
  "token": "<refresh-token>"
}
```

### Réponse (200)
```json
{
  "message": "Token rafraîchi",
  "data": {
    "token": "<new-access-token>",
    "refreshToken": "<new-refresh-token>"
  }
}
```

## 4. Gestion des mots de passe

### 4.1 Changer le mot de passe (auth requis)
**POST** `http://localhost:3000/api/auth/change-password`

#### Headers
```
Authorization: Bearer <token>
```

#### Body (JSON)
```json
{
  "ancienMotDePasse": "oldPass123",
  "nouveauMotDePasse": "newPass456"
}
```

#### Réponse (200)
```json
{
  "message": "Mot de passe changé avec succès"
}
```

### 4.2 Mot de passe oublié (public)
**POST** `http://localhost:3000/api/auth/forgot-password`

#### Body (JSON)
```json
{
  "email": "user@example.com"
}
```

#### Réponse (200)
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

### 4.3 Réinitialiser le mot de passe (public)
**POST** `http://localhost:3000/api/auth/reset-password`

#### Body (JSON)
```json
{
  "token": "<reset-token>",
  "nouveauMotDePasse": "newPass456"
}
```

#### Réponse (200)
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

## 5. Vérification OTP
**POST** `/verify-otp`

### Body (JSON)
```json
{
  "email": "patient@example.com",
  "otp": "123456"
}
```

### Réponse (200)
```json
{
  "message": "Compte vérifié avec succès"
}
```

## 6. Renvoi OTP
**POST** `/resend-otp`

### Body (JSON)
```json
{
  "email": "patient@example.com"
}
```

### Réponse (200)
```json
{
  "message": "OTP renvoyé avec succès"
}
```

## 6. Upload photo de profil
**POST** `http://localhost:3000/api/auth/profile/photo`

### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Form-Data
- `file`: image/jpeg | image/png

### Réponse (200)
```json
{
  "message": "Photo de profil uploadée",
  "data": {
    "photoprofil": "/uploads/profile/<filename>.jpg"
  }
}
```

## 7. Mise à jour du profil
**PUT** `/profile/:userId` ou **PUT** `/profile`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "nom": "Nouveau nom",
  "prenom": "Nouveau prénom",
  "telephone": "0987654321"
}
```

### Réponse (200)
```json
{
  "message": "Profil mis à jour avec succès",
  "data": {
    "idutilisateur": "uuid",
    "email": "patient@example.com",
    "nom": "Nouveau nom",
    "prenom": "Nouveau prénom",
    "telephone": "0987654321",
    "datecreation": "2025-01-03T00:00:00.000Z",
    "actif": true
  }
}
```

## 7.1 Mise à jour du profil Médecin (partielle)
**PATCH** `http://localhost:3000/api/auth/profile/medecin`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON) - champs optionnels
```json
{
  "numordre": "ORD123456",
  "experience": 8,
  "biographie": "Mise à jour bio",
  "cabinet_id": "uuid"
}
```

### Réponse (200)
```json
{
  "message": "Profil médecin mis à jour",
  "data": {
    "idutilisateur": "uuid",
    "idmedecin": "uuid",
    "numordre": "ORD123456",
    "experience": 8,
    "biographie": "Mise à jour bio"
  }
}
```

## 7.2 Mise à jour du profil Patient (partielle)
**PATCH** `http://localhost:3000/api/auth/profile/patient`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON) - champs optionnels
```json
{
  "datenaissance": "1990-01-15",
  "genre": "M",
  "adresse": "123 Rue",
  "groupesanguin": "O+",
  "poids": 72,
  "taille": 176
}
```

### Réponse (200)
```json
{
  "message": "Profil patient mis à jour",
  "data": {
    "idutilisateur": "uuid",
    "idpatient": "uuid",
    "datenaissance": "1990-01-15",
    "genre": "M"
  }
}
```

## 8. Récupérer médecins en attente (SuperAdmin)
**GET** `/super-admin/pending-medecins`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Médecins en attente récupérés",
  "data": [
    {
      "idmedecin": "uuid",
      "utilisateur_id": "uuid",
      "numordre": "ORD123456",
      "experience": 5,
      "biographie": "Médecin généraliste",
      "statut": "PENDING",
      "email": "medecin@example.com",
      "nom": "Martin",
      "prenom": "Dr. Pierre",
      "telephone": "0987654321",
      "datecreation": "2025-01-03T00:00:00.000Z"
    }
  ]
}
```

## 9. Validation Médecin par SuperAdmin
**POST** `/super-admin/validate-medecin`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "utilisateurId": "uuid",
  "action": "APPROVED"
}
```

Notes:
- `statut` Médecin (ENUM): `PENDING` | `APPROVED`
- `statut` Patient (ENUM): `PENDING` | `APPROVED` (après vérification OTP → `APPROVED`)

### Réponse (200)
```json
{
  "message": "Médecin approuvé avec succès"
}
```

## 10. Création Médecin par Admin Cabinet
**POST** `/admin/create-medecin`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "email": "medecin@cabinet.com",
  "motdepasse": "password123",
  "nom": "Dupont",
  "prenom": "Dr. Marie",
  "telephone": "0123456789",
  "numordre": "ORD789012",
  "cabinetId": "uuid",
  "experience": 3,
  "biographie": "Médecin spécialisé"
}
```

### Réponse (201)
```json
{
  "message": "Médecin créé avec succès et approuvé automatiquement",
  "data": {
    "idutilisateur": "uuid",
    "email": "medecin@cabinet.com",
    "nom": "Dupont",
    "prenom": "Dr. Marie",
    "telephone": "0123456789",
    "datecreation": "2025-01-03T00:00:00.000Z",
    "actif": true
  }
}
```

## 7. Récupération d'informations

### 7.1 Récupérer le profil de l'utilisateur connecté
**GET** `/profile`

- Auth: `Authorization: Bearer <token>`
- Rôles: Tous

#### Réponse (200)
```json
{
  "message": "Profil récupéré avec succès",
  "data": {
    "idutilisateur": "uuid",
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "0123456789",
    "photoprofil": "/uploads/profile/photo.jpg",
    "actif": true,
    "role": "PATIENT",
    "patient": {
      "idpatient": "uuid",
      "datenaissance": "1990-01-15",
      "genre": "M",
      "adresse": "123 Rue de la Paix",
      "groupesanguin": "O+",
      "poids": 70,
      "taille": 175,
      "statut": "ACTIF"
    }
  }
}
```

### 7.2 Récupérer un utilisateur par ID
**GET** `/user/:id`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`, `ADMINCABINET`, `MEDECIN`
- Paramètres:
  - `id`: ID de l'utilisateur

#### Réponse (200)
```json
{
  "message": "Utilisateur récupéré avec succès",
  "data": {
    "idutilisateur": "uuid",
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "PATIENT",
    "patient": { /* données patient */ }
  }
}
```

### 7.3 Récupérer tous les patients
**GET** `/patients`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`, `ADMINCABINET`, `MEDECIN`
- Query parameters:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'éléments par page (défaut: 10)
  - `search`: Recherche par nom, prénom ou email

#### Exemple
```
GET /api/auth/patients?page=1&limit=20&search=Dupont
```

#### Réponse (200)
```json
{
  "message": "Patients récupérés avec succès",
  "data": [
    {
      "idutilisateur": "uuid",
      "email": "patient1@example.com",
      "nom": "Dupont",
      "prenom": "Jean",
      "role": "PATIENT",
      "statut_utilisateur": "ACTIF",
      "idpatient": "uuid",
      "datenaissance": "1990-01-15",
      "genre": "M",
      "adresse": "123 Rue de la Paix",
      "groupesanguin": "O+",
      "poids": 70,
      "taille": 175,
      "statut": "ACTIF"
    }
  ]
}
```

### 7.4 Récupérer tous les médecins
**GET** `/medecins`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`, `ADMINCABINET`
- Query parameters:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'éléments par page (défaut: 10)
  - `search`: Recherche par nom, prénom ou email
  - `specialite`: Filtrer par spécialité
  - `cabinetId`: Filtrer par cabinet

#### Exemple
```
GET /api/auth/medecins?page=1&limit=20&specialite=Cardiologie&cabinetId=uuid
```

#### Réponse (200)
```json
{
  "message": "Médecins récupérés avec succès",
  "data": [
    {
      "idutilisateur": "uuid",
      "email": "medecin@example.com",
      "nom": "Martin",
      "prenom": "Dr. Pierre",
      "role": "MEDECIN",
      "statut_utilisateur": "ACTIF",
      "idmedecin": "uuid",
      "numordre": "12345",
      "experience": 10,
      "biographie": "Spécialiste en cardiologie",
      "statut": "APPROVED",
      "cabinet_nom": "Cabinet Médical Central",
      "cabinet_adresse": "456 Avenue de la Santé"
    }
  ]
}
```

### 7.5 Récupérer tous les administrateurs
**GET** `/admins`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`
- Query parameters:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'éléments par page (défaut: 10)
  - `search`: Recherche par nom, prénom ou email
  - `cabinetId`: Filtrer par cabinet

#### Réponse (200)
```json
{
  "message": "Administrateurs récupérés avec succès",
  "data": [
    {
      "idutilisateur": "uuid",
      "email": "admin@example.com",
      "nom": "Admin",
      "prenom": "Cabinet",
      "role": "ADMINCABINET",
      "statut_utilisateur": "ACTIF",
      "idadmincabinet": "uuid",
      "roleadmin": "GESTIONNAIRE",
      "cabinet_nom": "Cabinet Médical Central",
      "cabinet_adresse": "456 Avenue de la Santé"
    }
  ]
}
```

### 7.6 Récupérer les utilisateurs par rôle
**GET** `/users/role/:role`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`, `ADMINCABINET`
- Paramètres:
  - `role`: Rôle à rechercher (`PATIENT`, `MEDECIN`, `ADMINCABINET`, `SUPERADMIN`)
- Query parameters:
  - `page`: Numéro de page (défaut: 1)
  - `limit`: Nombre d'éléments par page (défaut: 10)
  - `search`: Recherche par nom, prénom ou email

#### Exemple
```
GET /api/auth/users/role/PATIENT?page=1&limit=20&search=Dupont
```

#### Réponse (200)
```json
{
  "message": "Utilisateurs PATIENT récupérés avec succès",
  "data": [
    {
      "idutilisateur": "uuid",
      "email": "patient@example.com",
      "nom": "Dupont",
      "prenom": "Jean",
      "role": "PATIENT",
      "statut_utilisateur": "ACTIF"
    }
  ]
}
```

## 8. Gestion AdminCabinet

### 8.1 Créer un AdminCabinet (SuperAdmin)
**POST** `/super-admin/create-admin`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`

#### Body (JSON)
```json
{
  "email": "admin@cabinet-central.tg",
  "motdepasse": "password123",
  "nom": "Dupont",
  "prenom": "Marie",
  "telephone": "0123456789",
  "cabinetId": "uuid-du-cabinet",
  "roleadmin": "ADMIN_PRINCIPAL"
}
```

#### Réponse (201)
```json
{
  "message": "AdminCabinet créé avec succès",
  "data": {
    "user": {
      "idutilisateur": "uuid",
      "email": "admin@cabinet-central.tg",
      "nom": "Dupont",
      "prenom": "Marie",
      "telephone": "0123456789",
      "statut": "ACTIF"
    },
    "adminCabinet": {
      "idAdminCabinet": "uuid",
      "utilisateur_id": "uuid",
      "cabinet_id": "uuid-du-cabinet",
      "roleadmin": "ADMIN_PRINCIPAL",
      "dateaffectation": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Erreur (400)
```json
{
  "error": "Email déjà utilisé"
}
```

### 8.3 Créer un médecin
**POST** `/admin/create-medecin`

- Auth: `Authorization: Bearer <token>`
- Rôles: `ADMINCABINET`

#### Body (JSON)
```json
{
  "email": "medecin@example.com",
  "motdepasse": "password123",
  "nom": "Martin",
  "prenom": "Dr. Pierre",
  "telephone": "0123456789",
  "numordre": "12345",
  "cabinetId": "uuid",
  "experience": 10,
  "biographie": "Spécialiste en cardiologie"
}
```

#### Réponse (201)
```json
{
  "message": "Médecin créé avec succès et approuvé automatiquement",
  "data": {
    "idutilisateur": "uuid",
    "email": "medecin@example.com",
    "nom": "Martin",
    "prenom": "Dr. Pierre",
    "role": "MEDECIN"
  }
}
```

## 9. Gestion des Attributions Cabinet (SuperAdmin)

### 9.1 Attribuer un cabinet à un AdminCabinet
**POST** `/super-admin/assign-cabinet`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`

#### Body (JSON)
```json
{
  "adminId": "uuid-de-l-admincabinet",
  "cabinetId": "uuid-du-cabinet"
}
```

#### Réponse (200)
```json
{
  "message": "Cabinet attribué avec succès à l'AdminCabinet",
  "data": {
    "idAdminCabinet": "uuid",
    "utilisateur_id": "uuid-de-l-admincabinet",
    "cabinet_id": "uuid-du-cabinet",
    "niveauAcces": "FULL",
    "dateAttribution": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Erreur (400)
```json
{
  "error": "Ce cabinet est déjà attribué à cet AdminCabinet"
}
```

### 9.2 Retirer un cabinet d'un AdminCabinet
**DELETE** `/super-admin/assign-cabinet/:adminId`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`
- Paramètres:
  - `adminId`: ID de l'AdminCabinet

#### Body (JSON)
```json
{
  "cabinetId": "uuid-du-cabinet"
}
```

#### Réponse (200)
```json
{
  "message": "Cabinet retiré avec succès de l'AdminCabinet"
}
```

#### Erreur (400)
```json
{
  "error": "Cette attribution n'existe pas"
}
```

### 9.3 Récupérer les cabinets d'un AdminCabinet
**GET** `/super-admin/admin-cabinets/:adminId`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`
- Paramètres:
  - `adminId`: ID de l'AdminCabinet

#### Réponse (200)
```json
{
  "message": "Cabinets de l'AdminCabinet récupérés avec succès",
  "data": [
    {
      "idcabinet": "uuid",
      "nom": "Cabinet Médical Central",
      "adresse": "123 Avenue de la Santé, Lomé",
      "telephone": "+228 22 12 34 56",
      "email": "contact@cabinet-central.tg",
      "siteWeb": "https://cabinet-central.tg",
      "description": "Cabinet médical moderne",
      "specialites": "[\"Cardiologie\", \"Dermatologie\"]",
      "dateAttribution": "2024-01-20T14:30:00.000Z"
    }
  ]
}
```

### 9.4 Récupérer les AdminCabinet d'un cabinet
**GET** `/super-admin/cabinets/:cabinetId/admins`

- Auth: `Authorization: Bearer <token>`
- Rôles: `SUPERADMIN`
- Paramètres:
  - `cabinetId`: ID du cabinet

#### Réponse (200)
```json
{
  "message": "AdminCabinet du cabinet récupérés avec succès",
  "data": [
    {
      "idutilisateur": "uuid",
      "email": "admin@cabinet-central.tg",
      "nom": "Dupont",
      "prenom": "Marie",
      "telephone": "0123456789",
      "statut": "ACTIF",
      "idAdminCabinet": "uuid",
      "dateAttribution": "2024-01-20T14:30:00.000Z"
    }
  ]
}
```

## 8.x Profil SuperAdmin

### 8.x.1 Récupérer le profil SuperAdmin
**GET** `http://localhost:3000/api/auth/super-admin/profile`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "message": "Profil SuperAdmin",
  "data": {
    "idutilisateur": "uuid",
    "email": "superadmin@example.com",
    "role": "SUPERADMIN"
  }
}
```

### 8.x.2 Mettre à jour le profil SuperAdmin
**PATCH** `http://localhost:3000/api/auth/super-admin/profile`

#### Headers
```
Authorization: Bearer <token>
```

#### Body (JSON)
```json
{
  "nom": "Nouveau nom",
  "prenom": "Nouveau prénom",
  "telephone": "0900000000"
}
```

#### Réponse (200)
```json
{
  "message": "Profil SuperAdmin mis à jour",
  "data": {
    "idutilisateur": "uuid",
    "nom": "Nouveau nom",
    "prenom": "Nouveau prénom"
  }
}
```

### 8.x.3 Changer le mot de passe SuperAdmin
**POST** `http://localhost:3000/api/auth/super-admin/change-password`

#### Headers
```
Authorization: Bearer <token>
```

#### Body (JSON)
```json
{
  "ancienMotDePasse": "old",
  "nouveauMotDePasse": "new"
}
```

#### Réponse (200)
```json
{
  "message": "Mot de passe SuperAdmin mis à jour"
}
```

## 8.y Gestion des cabinets via SuperAdmin (alias auth)
Ces endpoints existent aussi côté `Cabinets` mais sont exposés sous: `http://localhost:3000/api/auth/super-admin/cabinets`.

- **POST** `http://localhost:3000/api/auth/super-admin/cabinets` (Créer un cabinet)
- **GET** `http://localhost:3000/api/auth/super-admin/cabinets` (Lister)
- **GET** `http://localhost:3000/api/auth/super-admin/cabinets/:id` (Détail)
- **PUT** `http://localhost:3000/api/auth/super-admin/cabinets/:id` (Mettre à jour)
- **DELETE** `http://localhost:3000/api/auth/super-admin/cabinets/:id` (Supprimer)

Les formats de body/réponses sont identiques à ceux décrits dans `cabinet-endpoints.md` (voir sections correspondantes), seuls les préfixes d'URL changent.

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **401** : Email/mot de passe incorrect ou token invalide
- **403** : Compte désactivé ou accès refusé
- **404** : Utilisateur ou cabinet non trouvé
- **409** : Email déjà utilisé
- **500** : Erreur serveur
