# SantéAfrik - Dashboard Medical Platform

## Vue d'ensemble

Le dashboard de SantéAfrik est une application web multi-rôles permettant aux professionnels de santé de gérer les rendez-vous médicaux, les agendas, les ordonnances et la supervision administrative. Il est conçu pour trois types d'utilisateurs :

- **Médecins** : Gestion de l'agenda, consultations, ordonnances, dossiers médicaux
- **Admins Cabinet** : Supervision des médecins, gestion du cabinet, statistiques
- **Super Admins** : Validation médecins, gestion globale cabinets, administration système

## Architecture

- **Frontend** : Next.js avec React (SSR pour performance)
- **Backend** : API Node.js/Express avec authentification JWT
- **Communication** : Socket.IO pour temps réel
- **Déploiement** : Vercel prévu

## Prérequis

- Node.js >= 16.0.0
- npm ou yarn
- Compte Github pour déploiement

## Installation

```bash
# Cloner le repository
git clone https://github.com/arthuriou/Backend.git

# Installer les dépendances backend
cd Backend
npm install

# Démarrer le serveur développement
npm run start
```

## Configuration

### Variables d'environnement

Créer un fichier `.env`

```env
PORT=3000
JWT_SECRET=votre_clé_secrète_jwt
DATABASE_URL=votre_url_postgres
CLOUDINARY_CLOUD_NAME=votre_cloudinary
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Base de données

Le backend utilise PostgreSQL. Assurez-vous que les tables sont créées avec les migrations :

```sql
-- Les migrations sont dans src/shared/script/migrations/
-- Exécuter les scripts de migration pour initialiser la DB
```

## Endpoints par Rôle

### 🩺 Rôle MÉDECIN

#### Authentification
```http
GET  /api/auth/profile
PUT  /api/auth/profile/medecin
```

#### Agenda Médical
```http
GET   /api/agenda/mine                         # Récupérer son agenda
PATCH /api/agenda/:id                          # Modifier agenda
POST  /api/agenda/:id/rules                    # Ajouter règles horaires
GET   /api/agenda/:id/rules                    # Voir règles agenda
POST  /api/agenda/:id/rules/:ruleId            # Modifier règle
DELETE /api/agenda/:id/rules/:ruleId           # Supprimer règle
POST  /api/agenda/:id/blocks                   # Bloquer créneaux
GET   /api/agenda/:id/blocks                   # Voir blocages
POST  /api/agenda/:id/extra                    # Ajouter dispo exceptionnelle
GET   /api/agenda/:id/extra                    # Voir extras
GET   /api/agenda/:id/slots                    # Calculer slots disponibles
```

#### Gestion RDV
```http
GET   /api/rendezvous/medecin/:medecinId       # Voir RDV médecin
PUT   /api/rendezvous/:id/confirmer            # Confirmer RDV
PUT   /api/rendezvous/:id/annuler              # Annuler RDV
PUT   /api/rendezvous/:id/terminer             # Terminer RDV
GET   /api/rendezvous/en-attente-consultation  # RDV en attente
GET   /api/rendezvous/en-cours                 # RDV en cours
PUT   /api/rendezvous/:id/patient-arrive       # Patient arrivé
PUT   /api/rendezvous/:id/commencer-consultation # Démarrer consultation
PUT   /api/rendezvous/:id/cloturer-consultation # Clôturer consultation
```

#### Ordonnances Médicales
```http
POST  /api/ordonnances/                        # Créer ordonnance
GET   /api/ordonnances/consultation/:consultationId # Ordonnances consultation
GET   /api/ordonnances/:id                     # Détails ordonnance
PATCH /api/ordonnances/:id                     # Modifier ordonnance
PUT   /api/ordonnances/:id/valider             # Valider ordonnance
GET   /api/ordonnances/medecin/:medecinId      # Historique ordonnances
```

#### Dossier Médical
```http
GET   /api/dossier-medical/dossier/me           # Dossier personnel
GET   /api/dossier-medical/:dossierId/documents # Documents dossier
POST  /api/dossier-medical/documents            # Ajouter document
GET   /api/dossier-medical/documents/:id/view   # Voir document
DELETE /api/dossier-medical/documents/:id       # Supprimer document
PATCH /api/dossier-medical/documents/:id        # Modifier document
```

### 🏥 Rôle ADMINCABINET

#### Gestion Cabinet
```http
GET   /api/cabinets/:id                         # Infos cabinet
PUT   /api/cabinets/:id                         # Modifier cabinet
GET   /api/cabinets/:id/medecins                # Médecins du cabinet
PUT   /api/cabinets/:id/medecins/:medecinId/archive # Archiver médecin
POST  /api/cabinets/:id/medecins/:medecinId/reset-password # Reset MDP médecin
GET   /api/cabinets/:id/stats                   # Statistiques cabinet
```

#### Gestion Spécialités
```http
GET   /api/cabinets/:id/specialites             # Spécialités cabinet
POST  /api/cabinets/:id/specialites             # Ajouter spécialité
DELETE /api/cabinets/:id/specialites/:specialiteId # Retirer spécialité
```

### 🔧 Rôle SUPERADMIN

#### Gestion Utilisateurs
```http
GET   /api/auth/super-admin/pending-medecins    # Médecins en attente validation
POST  /api/auth/super-admin/validate-medecin    # Valider/rejeter médecin
GET   /api/auth/admins                          # Liste admins
GET   /api/auth/users/role/:role                # Utilisateurs par rôle
GET   /api/auth/patients                        # Liste patients
GET   /api/auth/medecins                        # Liste médecins
```

#### Gestion Cabinets
```http
GET   /api/auth/super-admin/cabinets            # Tous les cabinets
POST  /api/auth/super-admin/cabinets            # Créer cabinet
GET   /api/auth/super-admin/cabinets/:id        # Détails cabinet
PUT   /api/auth/super-admin/cabinets/:id        # Modifier cabinet
DELETE /api/auth/super-admin/cabinets/:id       # Supprimer cabinet
POST  /api/auth/super-admin/assign-cabinet      # Assigner admin à cabinet
DELETE /api/auth/super-admin/assign-cabinet/:adminId # Désassigner admin
GET   /api/auth/super-admin/admin-cabinets/:adminId # Cabinets d'un admin
GET   /api/auth/super-admin/cabinets/:cabinetId/admins # Admins d'un cabinet
```

#### Création Admins
```http
POST  /api/auth/super-admin/create-admin        # Créer admin cabinet
```

## Interfaces Utilisateur

### 🩺 Dashboard Médecin

**Navigation principale :**
```
📊 Dashboard
📅 Mon Agenda
👥 Mes Patients
💊 Ordonnances
💬 Messagerie
⚙️ Paramètres
```

**Interface Agenda :**
- Vue calendrier avec drag&drop pour déplacer RDV
- Configuration horaires régulières (9h-17h)
- Blocage de périodes (vacances)
- Ajout disponibilités exceptionnelles

**Interface RDV :**
- Liste RDV du jour/semaine
- Actions : confirmer, annuler, commencer consultation
- Statuts : CONFIRME, ANNULE, TERMINE

### 🏥 Dashboard Admin Cabinet

**Navigation :**
```
📊 Dashboard
👨‍⚕️ Médecins du Cabinet
📈 Statistiques
🏢 Gestion Cabinet
```

**Interface Gestion :**
- Liste médecins avec actions (archiver, reset MDP)
- Modification informations cabinet
- Suivi statistiques cabinet

### 🔧 Dashboard Super Admin

**Navigation :**
```
🏨 Cabinets
👨‍⚕️ Médecins (Validation)
👥 Administrateurs
📊 Stat Globales
```

**Interface :**
- Validation médecins en attente
- Gestion cabinets (création, assignation admins)
- Statistiques globales système

## Technologies Frontend

- **Framework** : Next.js avec React/TypeScript
- **Styling** : Tailwind CSS pour responsive design
- **State** : Zustand ou Redux Toolkit
- **Charts** : Recharts pour statistiques
- **Calendrier** : FullCalendar pour agendas
- **Auth** : Context + Axios interceptors
- **Temps réel** : Socket.IO client

