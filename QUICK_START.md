# 🚀 Guide de Démarrage Rapide - SantéAfrik Backend

## ⚡ Démarrage en 5 Minutes

### 1. Installation des Dépendances
```bash
npm install
```

### 2. Configuration Minimale
```bash
# Copier le fichier de configuration
cp .env.example .env

# Modifier le mot de passe DB dans .env si nécessaire
# Par défaut configuré pour PostgreSQL local
```

### 3. Base de Données (2 options)

#### Option A : PostgreSQL Local
```bash
# Créer la base de données
createdb santeafrik_db

# Ou avec psql
psql -U postgres -c "CREATE DATABASE santeafrik_db;"
```

#### Option B : Test Sans Base de Données
```bash
# Les endpoints fonctionnent partiellement sans DB
# Parfait pour tester la structure des routes
```

### 4. Démarrage du Serveur
```bash
npm start
```

**✅ Serveur prêt sur : `http://localhost:3000`**

---

## 🧪 Test Rapide

### Test Automatique
```bash
./quick-test.sh
```

### Test Manuel
```bash
# Test de base
curl http://localhost:3000/

# Test route auth
curl http://localhost:3000/api/auth/test

# Test inscription (sans DB, retournera une erreur mais testera la validation)
curl -X POST http://localhost:3000/api/auth/inscription/patient \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","email":"test@test.com","motDePasse":"Test123!"}'
```

---

## 📡 Endpoints Disponibles

### 🌐 Routes Publiques
- `GET /` - Informations API
- `GET /health` - Health check
- `GET /api/auth/test` - Test connectivité
- `POST /api/auth/inscription/patient` - Inscription patient
- `POST /api/auth/inscription/medecin` - Inscription médecin
- `POST /api/auth/connexion` - Connexion
- `POST /api/auth/verifier-otp` - Vérification OTP
- `POST /api/auth/renvoyer-otp` - Renvoi OTP

### 🔒 Routes Protégées
- `POST /api/auth/changer-mot-de-passe` - Changer mot de passe
- `POST /api/auth/rafraichir-token` - Refresh token
- `POST /api/auth/deconnexion` - Déconnexion

### 👨‍💼 Routes Admin
- `POST /api/auth/admin/creer-medecin` - Créer médecin (Admin Cabinet)
- `GET /api/auth/admin/medecins-cabinet` - Lister médecins

### ⚡ Routes Super Admin
- `POST /api/auth/super-admin/valider-medecin` - Valider médecin
- `GET /api/auth/super-admin/medecins-en-attente` - Médecins en attente
- `POST /api/auth/super-admin/creer-cabinet` - Créer cabinet
- `POST /api/auth/super-admin/creer-admin-cabinet` - Créer admin cabinet

### 🛠️ Routes Dev (Development uniquement)
- `POST /api/auth/dev/creer-super-admin` - Créer super admin
- `POST /api/auth/dev/creer-admin-cabinet` - Créer admin cabinet

---

## 🔧 Configuration Avancée

### Variables d'Environnement Importantes
```bash
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=santeafrik_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars

# Email (optionnel)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 🎯 Fonctionnalités Actuelles

### ✅ Implémenté
- **Authentification complète** avec JWT
- **Inscription** patients et médecins
- **Validation des données** robuste
- **Système de rôles** (RBAC)
- **OTP par email** (si configuré)
- **Gestion des erreurs** professionnelle
- **Documentation complète**

### 🔄 En Cours
- Tests avec base de données réelle
- Optimisations performances

### 📋 Prochaines Étapes
- Module Consultations
- Module Rendez-vous
- Module Dossiers Médicaux
- Interface WebSocket pour temps réel

---

## 🆘 Dépannage

### Erreur "Cannot find module 'bcrypt'"
```bash
npm install bcrypt jsonwebtoken nodemailer validator
```

### Erreur de connexion DB
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Tester la connexion
psql -U postgres -d santeafrik_db -c "SELECT NOW();"
```

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

---

## 📚 Documentation Complète

- `POSTMAN_COLLECTION.md` - Collection Postman avec tous les exemples
- `TEST_ENDPOINTS.md` - Guide de test détaillé
- `src/shared/types/index.ts` - Types TypeScript complets
- `src/shared/constants/index.ts` - Constantes et permissions

---

## 🎉 Félicitations !

Vous avez maintenant une **API d'authentification complète et professionnelle** prête pour le développement !

**Prochaine étape recommandée :** Tester avec Postman en utilisant la collection fournie.