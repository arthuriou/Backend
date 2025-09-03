# 📋 Endpoints SantéAfrik - Résumé

## ✅ Endpoints Implémentés

### 🔐 Authentification
- **POST** `/api/auth/register-patient` - Inscription patient (avec OTP automatique)
- **POST** `/api/auth/register-doctor` - Inscription médecin (auto-inscription)
- **POST** `/api/auth/login` - Connexion (avec JWT)
- **POST** `/api/auth/send-otp` - Envoi OTP
- **POST** `/api/auth/verify-otp` - Vérification OTP
- **POST** `/api/auth/resend-otp` - Renvoi OTP
- **PUT** `/api/auth/profile/:userId` - Mise à jour profil
- **PUT** `/api/auth/profile` - Mise à jour profil (avec userId dans body)

### 🔄 Logique d'Authentification

1. **Patient** :
   - S'inscrit → OTP envoyé automatiquement
   - Vérifie son compte avec OTP
   - Se connecte avec email/mot de passe
   - Reçoit un token JWT
   - Peut mettre à jour son profil

2. **Médecin** :
   - S'inscrit (statut PENDING)
   - En attente de validation par SuperAdmin
   - Peut se connecter après validation

## 🚧 À Implémenter

### 👨‍⚕️ Gestion Médecins
- **POST** `/api/auth/admin/create-doctor` - Création médecin par AdminCabinet
- **POST** `/api/auth/super-admin/validate-doctor` - Validation médecin par SuperAdmin

### 🏥 Gestion Cabinets
- **POST** `/api/cabinets` - Création cabinet par SuperAdmin
- **POST** `/api/cabinets/:id/admin` - Création AdminCabinet

## 📁 Structure des Fichiers

```
src/features/auth/
├── auth.model.ts      # Interfaces TypeScript
├── auth.repository.ts # Requêtes base de données
├── auth.service.ts    # Logique métier
├── auth.controller.ts # Gestion des requêtes HTTP
└── auth.route.ts      # Définition des routes

src/shared/utils/
├── mail.ts           # Envoi d'emails (OTP)
└── jwt.utils.ts      # Gestion JWT

endpoints/
├── auth-endpoints.md # Documentation détaillée
└── README.md         # Ce fichier
```

## 🔧 Configuration Requise

### Variables d'environnement (.env)
```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=santeAfrikDb
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Email (pour OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=SantéAfrik <no-reply@santeafrik.com>
```

### Base de données
- Exécuter `src/shared/script/create_otp_table.sql` pour créer la table OTP
- Les autres tables sont déjà créées selon le schéma fourni

## 🎯 Prochaines Étapes

1. ✅ **Authentification Patient** - Terminé
2. 🔄 **Authentification Médecin** - En cours (validation SuperAdmin)
3. ⏳ **Gestion Cabinets** - À faire
4. ⏳ **Gestion Rendez-vous** - À faire
5. ⏳ **Messagerie** - À faire
