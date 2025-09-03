# Endpoints d'Authentification - SantéAfrik

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
    "idutilisateur": "uuid",
    "email": "patient@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "0123456789",
    "datecreation": "2025-01-03T00:00:00.000Z",
    "derniereconnexion": "2025-01-03T12:00:00.000Z",
    "actif": true
  }
}
```

## 4. Envoi OTP (À implémenter)
**POST** `/send-otp`

## 5. Vérification OTP (À implémenter)
**POST** `/verify-otp`

## 6. Création Médecin par Admin Cabinet (À implémenter)
**POST** `/admin/create-doctor`

## 7. Validation Médecin par SuperAdmin (À implémenter)
**POST** `/super-admin/validate-doctor`

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **401** : Email/mot de passe incorrect
- **403** : Compte désactivé
- **409** : Email déjà utilisé
- **500** : Erreur serveur
