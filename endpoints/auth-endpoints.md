# Endpoints d'Authentification - SantéAfrik

## Upload photo de profil
POST `/api/auth/profile/photo`

- Auth: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data`
- Body (form-data):
  - `file`: image (jpg/png/webp/gif), max 10MB

Réponse 201:
```json
{
  "message": "Photo de profil mise à jour",
  "data": {
    "url": "/uploads/profile/<fichier>",
    "user": { "idutilisateur": "...", "photoprofil": "/uploads/profile/<fichier>", "nom": "..." }
  }
}
```

## Base URL
```
http://localhost:3000/api/auth
```

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

## 4. Envoi OTP
**POST** `/send-otp`

### Body (JSON)
```json
{
  "email": "patient@example.com"
}
```

### Réponse (200)
```json
{
  "message": "OTP envoyé avec succès"
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
  "medecinId": "uuid",
  "action": "APPROVED"
}
```

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

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **401** : Email/mot de passe incorrect
- **403** : Compte désactivé
- **409** : Email déjà utilisé
- **500** : Erreur serveur
