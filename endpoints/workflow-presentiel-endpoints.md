# 📅 API Endpoints - Workflow Présentiel
## Base URL
```
http://localhost:3000/api/rendezvous
```

## Sécurité et Accès
- Authentification: `Bearer <token>` requise pour tous les endpoints.
- Rôles autorisés: `MEDECIN` uniquement pour la plupart des endpoints.

## Index (URLs complètes)
- GET   http://localhost:3000/api/rendezvous/en-attente-consultation
- GET   http://localhost:3000/api/rendezvous/en-cours
- GET   http://localhost:3000/api/rendezvous/aujourd-hui
- GET   http://localhost:3000/api/rendezvous/cette-semaine
- PUT   http://localhost:3000/api/rendezvous/:id/patient-arrive
- PUT   http://localhost:3000/api/rendezvous/:id/commencer-consultation
- PUT   http://localhost:3000/api/rendezvous/:id/cloturer-consultation

## 1. Récupérer les RDV en attente de consultation
**GET** `/en-attente-consultation`

### Headers
```
Authorization: Bearer <token>
```

### Description
Récupère tous les RDV présentiels où le patient est arrivé au cabinet et attend d'être consulté.

### Réponse (200)
```json
{
  "message": "RDV en attente de consultation récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "patient_id": "uuid",
      "medecin_id": "uuid",
      "dateheure": "2025-01-20T14:00:00Z",
      "duree": 30,
      "motif": "Consultation de routine",
      "statut": "EN_ATTENTE_CONSULTATION",
      "type_rdv": "PRESENTIEL",
      "adresse_cabinet": "123 Rue de la Paix, Lomé",
      "patient": {
        "idpatient": "uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean@example.com",
        "telephone": "0123456789"
      },
      "medecin": {
        "idmedecin": "uuid",
        "nom": "Martin",
        "prenom": "Dr. Pierre",
        "email": "pierre@example.com"
      }
    }
  ]
}
```

## 2. Récupérer les RDV en cours
**GET** `/en-cours`

### Headers
```
Authorization: Bearer <token>
```

### Description
Récupère tous les RDV où la consultation est actuellement en cours.

### Réponse (200)
```json
{
  "message": "RDV en cours récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "statut": "EN_COURS",
      "patient": { /* ... */ },
      "medecin": { /* ... */ }
    }
  ]
}
```

## 3. Récupérer les RDV d'aujourd'hui
**GET** `/aujourd-hui`

### Headers
```
Authorization: Bearer <token>
```

### Description
Récupère tous les RDV du médecin pour la journée en cours.

### Réponse (200)
```json
{
  "message": "RDV d'aujourd'hui récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "dateheure": "2025-01-20T09:00:00Z",
      "statut": "CONFIRME",
      "patient": { /* ... */ }
    }
  ]
}
```

## 4. Récupérer les RDV de la semaine
**GET** `/cette-semaine`

### Headers
```
Authorization: Bearer <token>
```

### Description
Récupère tous les RDV du médecin pour la semaine en cours.

### Réponse (200)
```json
{
  "message": "RDV de la semaine récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "dateheure": "2025-01-20T09:00:00Z",
      "statut": "CONFIRME",
      "patient": { /* ... */ }
    }
  ]
}
```

## 5. Marquer un patient comme arrivé
**PUT** `/:id/patient-arrive`

### Headers
```
Authorization: Bearer <token>
```

### Description
Marque qu'un patient est arrivé au cabinet (RDV présentiel uniquement).
Change le statut de `CONFIRME` à `EN_ATTENTE_CONSULTATION`.

### Réponse (200)
```json
{
  "message": "Patient marqué comme arrivé avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "EN_ATTENTE_CONSULTATION"
  }
}
```

### Réponse (400)
```json
{
  "message": "Cette fonctionnalité n'est disponible que pour les RDV présentiels"
}
```

## 6. Commencer une consultation
**PUT** `/:id/commencer-consultation`

### Headers
```
Authorization: Bearer <token>
```

### Description
Commence une consultation (présentiel ou téléconsultation).
Change le statut de `CONFIRME` ou `EN_ATTENTE_CONSULTATION` à `EN_COURS`.

### Réponse (200)
```json
{
  "message": "Consultation commencée avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "EN_COURS"
  }
}
```

## 7. Clôturer une consultation
**PUT** `/:id/cloturer-consultation`

### Headers
```
Authorization: Bearer <token>
```

### Description
Clôture une consultation en cours.
Change le statut de `EN_COURS` à `TERMINE`.

### Réponse (200)
```json
{
  "message": "Consultation clôturée avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "TERMINE"
  }
}
```

## Workflow Complet Présentiel

### 1. Patient prend RDV
```bash
POST /api/rendezvous
{
  "type_rdv": "PRESENTIEL",
  "adresse_cabinet": "123 Rue de la Paix, Lomé",
  "patient_id": "uuid",
  "medecin_id": "uuid",
  "dateheure": "2025-01-20T14:00:00Z",
  "duree": 30,
  "motif": "Consultation"
}
# Statut: EN_ATTENTE
```

### 2. Médecin confirme
```bash
PUT /api/rendezvous/:id/confirmer
# Statut: CONFIRME
```

### 3. Patient arrive au cabinet
```bash
PUT /api/rendezvous/:id/patient-arrive
# Statut: EN_ATTENTE_CONSULTATION
```

### 4. Médecin commence consultation
```bash
PUT /api/rendezvous/:id/commencer-consultation
# Statut: EN_COURS
```

### 5. Médecin clôture consultation
```bash
PUT /api/rendezvous/:id/cloturer-consultation
# Statut: TERMINE
```

## Notifications Socket.IO

- `patient:arrived` - Patient arrivé au cabinet
- `consultation:started` - Consultation commencée
- `consultation:ended` - Consultation terminée

## Permissions
- **Médecin** : Peut voir tous ses RDV, marquer arrivée, commencer/clôturer consultations
- **AdminCabinet** : Peut marquer l'arrivée des patients
- **Patient** : Peut voir ses propres RDV
