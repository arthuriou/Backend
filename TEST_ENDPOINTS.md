# 🧪 Guide de Test des Endpoints SantéAfrik

## 🚀 Démarrage du Serveur

### 1. Prérequis
```bash
# Installer les dépendances
npm install

# Configurer la base de données PostgreSQL
# Créer une base de données nommée 'santeafrik_db'
createdb santeafrik_db

# Ou avec psql
psql -U postgres -c "CREATE DATABASE santeafrik_db;"
```

### 2. Configuration
Copiez `.env.example` vers `.env` et adaptez les variables :
```bash
cp .env.example .env
```

Modifiez notamment :
- `DB_PASSWORD` : votre mot de passe PostgreSQL
- `JWT_SECRET` : une clé secrète de 32+ caractères

### 3. Démarrage
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 🔍 Tests des Endpoints

### 📡 Endpoints de Base

#### 1. Test de Connectivité
```bash
curl http://localhost:3000/
```
**Réponse attendue :**
```json
{
  "message": "🚀 API SantéAfrik - Backend",
  "version": "1.0.0",
  "status": "running",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "environment": "development"
}
```

#### 2. Health Check
```bash
curl http://localhost:3000/health
```

#### 3. Test Route Auth
```bash
curl http://localhost:3000/api/auth/test
```
**Réponse attendue :**
```json
{
  "message": "Route de test OK"
}
```

---

## 🔐 Tests d'Authentification

### 1. Inscription Patient
```bash
curl -X POST http://localhost:3000/api/auth/inscription/patient \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@test.com",
    "motDePasse": "MotDePasse123!",
    "telephone": "+2250701234567",
    "dateNaissance": "1990-05-15",
    "sexe": "M",
    "adresse": "123 Rue de la Paix, Abidjan",
    "groupeSanguin": "A+",
    "allergies": ["Pénicilline"],
    "antecedents": "Aucun"
  }'
```

### 2. Inscription Médecin
```bash
curl -X POST http://localhost:3000/api/auth/inscription/medecin \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Dr. Pierre",
    "email": "dr.martin@test.com",
    "motDePasse": "MotDePasse123!",
    "telephone": "+2250701234568",
    "numOrdre": "12345",
    "specialites": ["Cardiologie"],
    "experience": 10,
    "biographie": "Cardiologue expérimenté",
    "diplomes": [{
      "intitule": "Doctorat en Médecine",
      "etablissement": "Université de Cocody",
      "pays": "Côte d'Ivoire",
      "annee": 2010
    }]
  }'
```

### 3. Connexion
```bash
curl -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@test.com",
    "motDePasse": "MotDePasse123!"
  }'
```

### 4. Vérification OTP
```bash
curl -X POST http://localhost:3000/api/auth/verifier-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@test.com",
    "otp": "123456"
  }'
```

---

## 🛠️ Tests Développement

### 1. Créer Super Admin (DEV uniquement)
```bash
curl -X POST http://localhost:3000/api/auth/dev/creer-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Admin",
    "prenom": "Super",
    "email": "admin@santeafrik.com",
    "motDePasse": "SuperAdmin123!",
    "telephone": "+2250701234569"
  }'
```

### 2. Créer Admin Cabinet (DEV)
```bash
curl -X POST http://localhost:3000/api/auth/dev/creer-admin-cabinet \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Cabinet",
    "prenom": "Admin",
    "email": "cabinet@santeafrik.com",
    "motDePasse": "AdminCabinet123!",
    "telephone": "+2250701234570",
    "cabinetId": "uuid-du-cabinet"
  }'
```

---

## 📊 Codes de Réponse

| Code | Signification | Description |
|------|---------------|-------------|
| 200 | Success | Opération réussie |
| 201 | Created | Ressource créée |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Accès refusé |
| 404 | Not Found | Route non trouvée |
| 409 | Conflict | Ressource existe déjà |
| 500 | Server Error | Erreur serveur |

---

## 🔧 Dépannage

### Erreur de Connexion DB
```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Tester la connexion
psql -U postgres -d santeafrik_db -c "SELECT NOW();"
```

### Port Déjà Utilisé
```bash
# Trouver le processus sur le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreurs JWT
Vérifiez que `JWT_SECRET` dans `.env` fait au moins 32 caractères.

---

## 📝 Logs Utiles

Le serveur affiche des logs détaillés :
- ✅ Connexions réussies
- ❌ Erreurs avec stack trace
- 📊 Statistiques des requêtes
- 🔍 Validation des données

---

## 🎯 Prochaines Étapes

Une fois les tests d'authentification validés :
1. Tester avec Postman (collection fournie)
2. Implémenter les modules suivants :
   - Consultations
   - Rendez-vous
   - Dossiers médicaux
3. Tests d'intégration complets