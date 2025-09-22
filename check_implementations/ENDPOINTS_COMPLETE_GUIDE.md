# 📚 GUIDE COMPLET DES ENDPOINTS - SANTÉAFRIK

## 🎯 Vue d'ensemble

Ce guide contient **TOUS** les endpoints avec leurs **body exacts**, **headers**, et **exemples de réponses** pour faciliter l'intégration frontend.

---

## 🔐 AUTHENTIFICATION

### Base URL
```
http://localhost:3000/api/auth
```

### 1. Connexion
**POST** `/login`

#### Headers
```
Content-Type: application/json
```

#### Body
```json
{
  "email": "patient@example.com",
  "password": "motdepasse123"
}
```

#### Réponse Succès (200)
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "idUtilisateur": "uuid",
    "email": "patient@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "PATIENT",
    "actif": true
  }
}
```

#### Réponse Erreur (401)
```json
{
  "message": "Identifiants incorrects"
}
```

### 2. Envoi OTP
**POST** `/send-otp`

#### Headers
```
Content-Type: application/json
```

#### Body
```json
{
  "email": "patient@example.com"
}
```

#### Réponse Succès (200)
```json
{
  "message": "OTP envoyé avec succès",
  "email": "patient@example.com"
}
```

### 3. Vérification OTP
**POST** `/verify-otp`

#### Headers
```
Content-Type: application/json
```

#### Body
```json
{
  "email": "patient@example.com",
  "code": "123456"
}
```

#### Réponse Succès (200)
```json
{
  "message": "OTP vérifié avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "patient@example.com"
}
```

### 4. Inscription Patient
**POST** `/register-patient`

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token_otp>
```

#### Body
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "motDePasse": "motdepasse123",
  "telephone": "+22812345678",
  "dateNaissance": "1990-05-15",
  "genre": "M",
  "adresse": "123 Rue de la Paix, Lomé",
  "groupeSanguin": "O+",
  "poids": 70.5,
  "taille": 175
}
```

#### Réponse Succès (201)
```json
{
  "message": "Patient créé avec succès",
  "data": {
    "idPatient": "uuid",
    "utilisateur_id": "uuid",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "+22812345678",
    "dateNaissance": "1990-05-15",
    "genre": "M",
    "adresse": "123 Rue de la Paix, Lomé",
    "groupeSanguin": "O+",
    "poids": 70.5,
    "taille": 175,
    "statut": "APPROVED"
  }
}
```

---

## 👤 PROFIL UTILISATEUR

### Base URL
```
http://localhost:3000/api/auth
```

### 1. Récupérer le profil
**GET** `/profile`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Profil récupéré avec succès",
  "data": {
    "idPatient": "uuid",
    "utilisateur_id": "uuid",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "+22812345678",
    "photoProfil": "https://res.cloudinary.com/...",
    "dateNaissance": "1990-05-15",
    "genre": "M",
    "adresse": "123 Rue de la Paix, Lomé",
    "groupeSanguin": "O+",
    "poids": 70.5,
    "taille": 175,
    "statut": "APPROVED",
    "dateCreation": "2025-01-20T10:00:00Z"
  }
}
```

### 2. Mettre à jour le profil (PATCH)
**PATCH** `/profile`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (tous les champs sont optionnels)
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "telephone": "+22812345678",
  "dateNaissance": "1990-05-15",
  "genre": "M",
  "adresse": "123 Rue de la Paix, Lomé",
  "groupeSanguin": "O+",
  "poids": 70.5,
  "taille": 175
}
```

#### Réponse Succès (200)
```json
{
  "message": "Profil mis à jour avec succès",
  "data": {
    "idPatient": "uuid",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "+22812345678",
    "dateNaissance": "1990-05-15",
    "genre": "M",
    "adresse": "123 Rue de la Paix, Lomé",
    "groupeSanguin": "O+",
    "poids": 70.5,
    "taille": 175
  }
}
```

### 3. Mettre à jour le profil médecin (PATCH)
**PATCH** `/profile/medecin`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (tous les champs sont optionnels)
```json
{
  "nom": "Martin",
  "prenom": "Dr. Pierre",
  "email": "pierre.martin@example.com",
  "telephone": "+22812345678",
  "experience": 5,
  "biographie": "Médecin expérimenté en cardiologie...",
  "specialites": ["uuid_specialite1", "uuid_specialite2"]
}
```

#### Réponse Succès (200)
```json
{
  "message": "Profil médecin mis à jour avec succès",
  "data": {
    "idmedecin": "uuid",
    "nom": "Martin",
    "prenom": "Dr. Pierre",
    "email": "pierre.martin@example.com",
    "telephone": "+22812345678",
    "experience": 5,
    "biographie": "Médecin expérimenté en cardiologie...",
    "specialites": [
      {
        "idspecialite": "uuid",
        "nom": "Cardiologie",
        "description": "Spécialité médicale du cœur"
      }
    ]
  }
}
```

### 4. Mettre à jour le profil patient (PATCH)
**PATCH** `/profile/patient`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (tous les champs sont optionnels)
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "telephone": "+22812345678",
  "dateNaissance": "1990-05-15",
  "genre": "M",
  "adresse": "123 Rue de la Paix, Lomé",
  "groupeSanguin": "O+",
  "poids": 70.5,
  "taille": 175
}
```

#### Réponse Succès (200)
```json
{
  "message": "Profil patient mis à jour avec succès",
  "data": {
    "idPatient": "uuid",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "+22812345678",
    "dateNaissance": "1990-05-15",
    "genre": "M",
    "adresse": "123 Rue de la Paix, Lomé",
    "groupeSanguin": "O+",
    "poids": 70.5,
    "taille": 175
  }
}
```

### 5. Mettre à jour le profil SuperAdmin (PATCH)
**PATCH** `/super-admin/profile`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (tous les champs sont optionnels)
```json
{
  "nom": "Admin",
  "prenom": "Super",
  "email": "admin@example.com",
  "telephone": "+22812345678"
}
```

#### Réponse Succès (200)
```json
{
  "message": "Profil SuperAdmin mis à jour avec succès",
  "data": {
    "idSuperAdmin": "uuid",
    "nom": "Admin",
    "prenom": "Super",
    "email": "admin@example.com",
    "telephone": "+22812345678"
  }
}
```

### 6. Changer le mot de passe
**POST** `/change-password`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body
```json
{
  "ancienMotDePasse": "ancienmotdepasse",
  "nouveauMotDePasse": "nouveaumotdepasse123"
}
```

#### Réponse Succès (200)
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

### 7. Upload photo de profil
**POST** `/profile/photo`

#### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Body (FormData)
```
file: <fichier_image>
ou
photo: <fichier_image>
ou
image: <fichier_image>
```

#### Réponse Succès (200)
```json
{
  "message": "Photo de profil mise à jour avec succès",
  "data": {
    "photoProfil": "https://res.cloudinary.com/.../photo_profil.jpg"
  }
}
```

### 8. Récupérer un utilisateur par ID
**GET** `/user/:id`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Utilisateur récupéré avec succès",
  "data": {
    "idUtilisateur": "uuid",
    "email": "user@example.com",
    "nom": "Dupont",
    "prenom": "Jean",
    "role": "PATIENT",
    "actif": true
  }
}
```

### 9. Récupérer tous les patients
**GET** `/patients`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
limit=50&offset=0&q=nom_recherche
```

#### Réponse Succès (200)
```json
{
  "message": "Patients récupérés avec succès",
  "data": [
    {
      "idPatient": "uuid",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "telephone": "+22812345678",
      "statut": "APPROVED"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

### 10. Récupérer tous les médecins
**GET** `/medecins`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
limit=50&offset=0&q=nom_recherche&statut=APPROVED
```

#### Réponse Succès (200)
```json
{
  "message": "Médecins récupérés avec succès",
  "data": [
    {
      "idmedecin": "uuid",
      "nom": "Martin",
      "prenom": "Dr. Pierre",
      "email": "pierre.martin@example.com",
      "statut": "APPROVED",
      "specialites": [...]
    }
  ]
}
```

### 11. Recherche publique des médecins
**GET** `/medecins/search`

#### Headers
```
Authorization: Bearer <token> (optionnel)
```

#### Query Parameters
```
q=cardiologie&specialite_id=uuid&cabinet_id=uuid&limit=20&offset=0
```

#### Réponse Succès (200)
```json
{
  "message": "Médecins trouvés avec succès",
  "data": [
    {
      "idmedecin": "uuid",
      "nom": "Martin",
      "prenom": "Dr. Pierre",
      "email": "pierre.martin@example.com",
      "specialites": [...]
    }
  ]
}
```

### 12. Récupérer tous les administrateurs
**GET** `/admins`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Administrateurs récupérés avec succès",
  "data": [
    {
      "idSuperAdmin": "uuid",
      "nom": "Admin",
      "prenom": "Super",
      "email": "admin@example.com",
      "role": "SUPERADMIN"
    }
  ]
}
```

### 13. Récupérer les utilisateurs par rôle
**GET** `/users/role/:role`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Utilisateurs récupérés avec succès",
  "data": [
    {
      "idUtilisateur": "uuid",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@example.com",
      "role": "PATIENT"
    }
  ]
}
```

---

## 🔍 RECHERCHE DE MÉDECINS

### Base URL
```
http://localhost:3000/api/specialites
```

### 1. Recherche globale optimisée
**GET** `/medecins/search`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
q=cardiologie&specialite_id=uuid&cabinet_id=uuid&limit=20&offset=0
```

#### Exemple d'URL complète
```
GET /api/specialites/medecins/search?q=cardiologie&specialite_id=uuid&limit=20&offset=0
```

#### Réponse Succès (200)
```json
{
  "message": "Médecins trouvés avec succès",
  "data": [
    {
      "idmedecin": "uuid",
      "nom": "Martin",
      "prenom": "Dr. Pierre",
      "email": "pierre.martin@example.com",
      "photoprofil": "https://res.cloudinary.com/...",
      "experience": 5,
      "biographie": "Médecin expérimenté en cardiologie...",
      "specialites": [
        {
          "idspecialite": "uuid",
          "nom": "Cardiologie",
          "description": "Spécialité médicale du cœur"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

### 2. Recherche par spécialité
**GET** `/specialites/:id/medecins`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
cabinet_id=uuid&limit=50&offset=0&q=Martin
```

#### Réponse Succès (200)
```json
{
  "message": "Médecins trouvés avec succès",
  "data": [
    {
      "idmedecin": "uuid",
      "nom": "Martin",
      "prenom": "Dr. Pierre",
      "email": "pierre.martin@example.com",
      "specialites": [...]
    }
  ]
}
```

### 3. Récupérer les spécialités
**GET** `/specialites`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
limit=50&offset=0&q=cardiologie
```

#### Réponse Succès (200)
```json
{
  "message": "Spécialités récupérées avec succès",
  "data": [
    {
      "idspecialite": "uuid",
      "nom": "Cardiologie",
      "description": "Spécialité médicale qui traite les maladies du cœur"
    }
  ]
}
```

---

## 📅 RENDEZ-VOUS

### Base URL
```
http://localhost:3000/api/rendezvous
```

### 1. Créer un rendez-vous
**POST** `/`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body
```json
{
  "patient_id": "uuid",
  "medecin_id": "uuid",
  "creneau_id": "uuid",
  "dateheure": "2025-01-25T14:00:00Z",
  "duree": 30,
  "motif": "Consultation de routine",
  "type_rdv": "PRESENTIEL",
  "adresse_cabinet": "123 Rue de la Paix, Lomé"
}
```

#### Réponse Succès (201)
```json
{
  "message": "Rendez-vous créé avec succès",
  "data": {
    "idrendezvous": "uuid",
    "patient_id": "uuid",
    "medecin_id": "uuid",
    "creneau_id": "uuid",
    "dateheure": "2025-01-25T14:00:00Z",
    "duree": 30,
    "motif": "Consultation de routine",
    "statut": "EN_ATTENTE",
    "type_rdv": "PRESENTIEL",
    "adresse_cabinet": "123 Rue de la Paix, Lomé"
  }
}
```

### 2. Récupérer les RDV du patient
**GET** `/patient/:patientId`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Rendez-vous récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "dateheure": "2025-01-25T14:00:00Z",
      "duree": 30,
      "motif": "Consultation de routine",
      "statut": "CONFIRME",
      "type_rdv": "PRESENTIEL",
      "patient": {
        "idpatient": "uuid",
        "nom": "Dupont",
        "prenom": "Jean"
      },
      "medecin": {
        "idmedecin": "uuid",
        "nom": "Martin",
        "prenom": "Dr. Pierre"
      }
    }
  ]
}
```

### 3. Récupérer les créneaux disponibles
**GET** `/medecin/:medecinId/creneaux-disponibles`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
dateDebut=2025-01-20&dateFin=2025-01-21
```

#### Réponse Succès (200)
```json
{
  "message": "Créneaux disponibles récupérés avec succès",
  "data": [
    {
      "idcreneau": "uuid",
      "debut": "2025-01-20T09:00:00Z",
      "fin": "2025-01-20T09:30:00Z",
      "disponible": true,
      "agenda": {
        "idagenda": "uuid",
        "libelle": "Consultations matin"
      }
    }
  ]
}
```

### 4. Workflow présentiel - Médecin

#### RDV en attente de consultation
**GET** `/en-attente-consultation`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "RDV en attente de consultation récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "dateheure": "2025-01-20T14:00:00Z",
      "statut": "EN_ATTENTE_CONSULTATION",
      "patient": {
        "idpatient": "uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "telephone": "+22812345678"
      }
    }
  ]
}
```

#### Marquer patient arrivé
**PUT** `/:id/patient-arrive`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Patient marqué comme arrivé avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "EN_ATTENTE_CONSULTATION"
  }
}
```

#### Commencer consultation
**PUT** `/:id/commencer-consultation`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Consultation commencée avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "EN_COURS"
  }
}
```

#### Clôturer consultation
**PUT** `/:id/cloturer-consultation`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Consultation clôturée avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "TERMINE"
  }
}
```

---

## 💬 MESSAGERIE

### Base URL
```
http://localhost:3000/api/messagerie
```

### 1. Créer conversation privée
**POST** `/conversations/private`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body
```json
{
  "participantId": "uuid_medecin"
}
```

#### Réponse Succès (200)
```json
{
  "message": "Conversation récupérée avec succès",
  "data": {
    "idconversation": "uuid",
    "type": "PRIVEE",
    "participants": [
      {
        "idparticipant": "uuid",
        "utilisateur_id": "uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "role": "PATIENT"
      },
      {
        "idparticipant": "uuid",
        "utilisateur_id": "uuid",
        "nom": "Martin",
        "prenom": "Dr. Pierre",
        "role": "MEDECIN"
      }
    ]
  }
}
```

### 2. Récupérer les conversations
**GET** `/conversations`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Conversations récupérées avec succès",
  "data": [
    {
      "idconversation": "uuid",
      "type": "PRIVEE",
      "dernierMessage": {
        "contenu": "Bonjour, comment allez-vous ?",
        "dateEnvoi": "2025-01-20T10:30:00Z"
      },
      "participants": [...]
    }
  ]
}
```

### 3. Envoyer un message
**POST** `/messages`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body
```json
{
  "conversationId": "uuid",
  "contenu": "Bonjour, j'ai une question sur mon traitement",
  "type": "TEXTE"
}
```

#### Réponse Succès (201)
```json
{
  "message": "Message envoyé avec succès",
  "data": {
    "idmessage": "uuid",
    "conversationId": "uuid",
    "contenu": "Bonjour, j'ai une question sur mon traitement",
    "type": "TEXTE",
    "dateEnvoi": "2025-01-20T10:30:00Z",
    "expediteur": {
      "idutilisateur": "uuid",
      "nom": "Dupont",
      "prenom": "Jean"
    }
  }
}
```

### 4. Récupérer les messages
**GET** `/conversations/:id/messages`

#### Headers
```
Authorization: Bearer <token>
```

#### Query Parameters
```
limit=50&offset=0
```

#### Réponse Succès (200)
```json
{
  "message": "Messages récupérés avec succès",
  "data": [
    {
      "idmessage": "uuid",
      "contenu": "Bonjour, j'ai une question sur mon traitement",
      "type": "TEXTE",
      "dateEnvoi": "2025-01-20T10:30:00Z",
      "expediteur": {
        "idutilisateur": "uuid",
        "nom": "Dupont",
        "prenom": "Jean"
      }
    }
  ]
}
```

---

## 📁 DOSSIER MÉDICAL

### Base URL
```
http://localhost:3000/api/dossier-medical
```

### 1. Récupérer le dossier
**GET** `/dossier/me`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Dossier récupéré avec succès",
  "data": {
    "iddossier": "uuid",
    "patient_id": "uuid",
    "datecreation": "2025-01-20T10:00:00Z",
    "datemaj": "2025-01-20T15:30:00Z",
    "created": false
  }
}
```

### 2. Récupérer les documents
**GET** `/:dossierId/documents`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Documents récupérés avec succès",
  "data": [
    {
      "iddocument": "uuid",
      "dossier_id": "uuid",
      "nom": "Compte rendu consultation",
      "type": "PDF",
      "url": "https://res.cloudinary.com/.../document.pdf",
      "mimetype": "application/pdf",
      "taillekb": 320,
      "dateupload": "2025-01-20T10:00:00Z",
      "ispublic": false
    }
  ]
}
```

### 3. Upload document
**POST** `/documents`

#### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Body (FormData)
```
dossier_id: uuid
nom: Compte rendu consultation
type: PDF
ispublic: false
file: <fichier>
```

#### Réponse Succès (201)
```json
{
  "message": "Document uploadé avec succès",
  "data": {
    "iddocument": "uuid",
    "nom": "Compte rendu consultation",
    "type": "PDF",
    "url": "https://res.cloudinary.com/.../document.pdf",
    "taillekb": 320
  }
}
```

---

## 🔔 NOTIFICATIONS

### Base URL
```
http://localhost:3000/api/notifications
```

### 1. Récupérer les préférences
**GET** `/preferences`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse Succès (200)
```json
{
  "message": "Préférences récupérées avec succès",
  "data": {
    "utilisateur_id": "uuid",
    "sons": true,
    "volume": 80,
    "vibration": true,
    "push": true,
    "email": true,
    "sms": false
  }
}
```

### 2. Mettre à jour les préférences
**PUT** `/preferences`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body
```json
{
  "sons": true,
  "volume": 80,
  "vibration": true,
  "push": true,
  "email": true,
  "sms": false
}
```

#### Réponse Succès (200)
```json
{
  "message": "Préférences mises à jour avec succès",
  "data": {
    "utilisateur_id": "uuid",
    "sons": true,
    "volume": 80,
    "vibration": true,
    "push": true,
    "email": true,
    "sms": false
  }
}
```

### 3. Enregistrer device
**POST** `/devices`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "ios",
  "version": "1.0.0"
}
```

#### Réponse Succès (201)
```json
{
  "message": "Device enregistré avec succès",
  "data": {
    "iddevice": "uuid",
    "utilisateur_id": "uuid",
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "platform": "ios",
    "version": "1.0.0",
    "actif": true
  }
}
```

---

## 🚨 GESTION D'ERREURS

### Codes d'erreur courants

#### 400 - Bad Request
```json
{
  "message": "Données invalides",
  "errors": [
    {
      "field": "email",
      "message": "Format d'email invalide"
    }
  ]
}
```

#### 401 - Unauthorized
```json
{
  "message": "Token d'authentification manquant ou invalide"
}
```

#### 403 - Forbidden
```json
{
  "message": "Accès refusé - Rôle insuffisant"
}
```

#### 404 - Not Found
```json
{
  "message": "Ressource non trouvée"
}
```

#### 500 - Internal Server Error
```json
{
  "message": "Erreur serveur interne"
}
```

---

## 📱 EXEMPLES D'INTÉGRATION FRONTEND

### Service API TypeScript
```typescript
class ApiService {
  private baseURL = 'http://localhost:3000/api';
  private token: string | null = null;

  async setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Authentification
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  // Profil
  async getProfile() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async updateProfile(data: any) {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateMedecinProfile(data: any) {
    const response = await fetch(`${this.baseURL}/auth/profile/medecin`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updatePatientProfile(data: any) {
    const response = await fetch(`${this.baseURL}/auth/profile/patient`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Recherche médecins
  async searchDoctors(params: any) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/specialites/medecins/search?${queryString}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Rendez-vous
  async createAppointment(data: any) {
    const response = await fetch(`${this.baseURL}/rendezvous`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Messagerie
  async createConversation(participantId: string) {
    const response = await fetch(`${this.baseURL}/messagerie/conversations/private`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ participantId })
    });
    return response.json();
  }

  async sendMessage(conversationId: string, contenu: string) {
    const response = await fetch(`${this.baseURL}/messagerie/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ conversationId, contenu, type: 'TEXTE' })
    });
    return response.json();
  }
}

export const apiService = new ApiService();
```

---

## 🎯 CHECKLIST D'INTÉGRATION

### ✅ Authentification
- [ ] Connexion avec email/password
- [ ] Inscription avec OTP
- [ ] Gestion des tokens
- [ ] Refresh token

### ✅ Profil
- [ ] Récupération du profil
- [ ] Mise à jour du profil
- [ ] Upload photo
- [ ] Changement mot de passe

### ✅ Recherche
- [ ] Recherche globale médecins
- [ ] Filtres par spécialité
- [ ] Détails médecin

### ✅ Rendez-vous
- [ ] Création RDV
- [ ] Récupération créneaux
- [ ] Workflow présentiel
- [ ] Gestion statuts

### ✅ Messagerie
- [ ] Création conversation
- [ ] Envoi messages
- [ ] Récupération messages
- [ ] Socket.IO

### ✅ Dossier médical
- [ ] Récupération dossier
- [ ] Upload documents
- [ ] Gestion documents

### ✅ Notifications
- [ ] Préférences
- [ ] Enregistrement device
- [ ] Push notifications

**Ce guide contient TOUS les endpoints avec leurs body exacts !** 🚀
