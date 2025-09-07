# 📅 API Endpoints - Rendez-vous

## Base URL
```
http://localhost:3000/api/rendezvous
```

## 1. Créer un rendez-vous (Patient)
**POST** `/`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "patient_id": "uuid",
  "medecin_id": "uuid",
  "dateheure": "2024-01-15T10:00:00Z",
  "duree": 30,
  "motif": "Consultation de routine",
  "creneau_id": "uuid" // Optionnel
}
```

### Réponse (201)
```json
{
  "message": "Rendez-vous créé avec succès",
  "data": {
    "idrendezvous": "uuid",
    "patient_id": "uuid",
    "medecin_id": "uuid",
    "creneau_id": "uuid",
    "dateheure": "2024-01-15T10:00:00Z",
    "duree": 30,
    "motif": "Consultation de routine",
    "statut": "EN_ATTENTE"
  }
}
```

## 2. Récupérer un rendez-vous par ID
**GET** `/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rendez-vous récupéré avec succès",
  "data": {
    "idrendezvous": "uuid",
    "patient_id": "uuid",
    "medecin_id": "uuid",
    "dateheure": "2024-01-15T10:00:00Z",
    "duree": 30,
    "motif": "Consultation de routine",
    "statut": "CONFIRME",
    "patient": {
      "idPatient": "uuid",
      "nom": "Dupont",
      "prenom": "Jean",
      "telephone": "0123456789",
      "email": "jean.dupont@email.com"
    },
    "medecin": {
      "idMedecin": "uuid",
      "nom": "Martin",
      "prenom": "Dr. Marie",
      "specialites": ["Médecine générale"]
    },
    "creneau": {
      "idcreneau": "uuid",
      "agenda_id": "uuid",
      "debut": "2024-01-15T10:00:00Z",
      "fin": "2024-01-15T10:30:00Z",
      "disponible": true
    }
  }
}
```

## 3. Récupérer les rendez-vous d'un patient
**GET** `/patient/:patientId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rendez-vous du patient récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "patient_id": "uuid",
      "medecin_id": "uuid",
      "dateheure": "2024-01-15T10:00:00Z",
      "duree": 30,
      "motif": "Consultation de routine",
      "statut": "CONFIRME",
      "patient": { /* ... */ },
      "medecin": { /* ... */ }
    }
  ]
}
```

## 4. Récupérer les rendez-vous d'un médecin
**GET** `/medecin/:medecinId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rendez-vous du médecin récupérés avec succès",
  "data": [
    {
      "idrendezvous": "uuid",
      "patient_id": "uuid",
      "medecin_id": "uuid",
      "dateheure": "2024-01-15T10:00:00Z",
      "duree": 30,
      "motif": "Consultation de routine",
      "statut": "CONFIRME",
      "patient": { /* ... */ },
      "medecin": { /* ... */ }
    }
  ]
}
```

## 5. Modifier un rendez-vous
**PUT** `/:id`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "dateheure": "2024-01-15T14:00:00Z",
  "duree": 45,
  "motif": "Consultation urgente",
  "statut": "CONFIRME"
}
```

### Réponse (200)
```json
{
  "message": "Rendez-vous modifié avec succès",
  "data": {
    "idrendezvous": "uuid",
    "patient_id": "uuid",
    "medecin_id": "uuid",
    "dateheure": "2024-01-15T14:00:00Z",
    "duree": 45,
    "motif": "Consultation urgente",
    "statut": "CONFIRME"
  }
}
```

## 6. Confirmer un rendez-vous (Médecin/AdminCabinet)
**PUT** `/:id/confirmer`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rendez-vous confirmé avec succès",
  "data": {
    "idrendezvous": "uuid",
    "statut": "CONFIRME"
  }
}
```

## 7. Annuler un rendez-vous
**PUT** `/:id/annuler`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rendez-vous annulé avec succès"
}
```

## 8. Terminer un rendez-vous (Médecin/AdminCabinet)
**PUT** `/:id/terminer`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rendez-vous terminé avec succès",
  "data": {
    "idrendezvous": "uuid",
    "statut": "TERMINE"
  }
}
```

## 9. Créer un créneau (Médecin/AdminCabinet)
**POST** `/creneaux`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "agenda_id": "uuid",
  "debut": "2024-01-15T09:00:00Z",
  "fin": "2024-01-15T09:30:00Z",
  "disponible": true
}
```

### Réponse (201)
```json
{
  "message": "Créneau créé avec succès",
  "data": {
    "idcreneau": "uuid",
    "agenda_id": "uuid",
    "debut": "2024-01-15T09:00:00Z",
    "fin": "2024-01-15T09:30:00Z",
    "disponible": true
  }
}
```

## 10. Récupérer les créneaux disponibles d'un médecin (Public)
**GET** `/medecin/:medecinId/creneaux-disponibles?dateDebut=2024-01-15&dateFin=2024-01-20`

### Réponse (200)
```json
{
  "message": "Créneaux disponibles récupérés avec succès",
  "data": [
    {
      "idcreneau": "uuid",
      "agenda_id": "uuid",
      "debut": "2024-01-15T09:00:00Z",
      "fin": "2024-01-15T09:30:00Z",
      "disponible": true,
      "agenda": {
        "idagenda": "uuid",
        "libelle": "Consultations matin",
        "medecin": {
          "idMedecin": "uuid",
          "nom": "Martin",
          "prenom": "Dr. Marie"
        }
      }
    }
  ]
}
```

## 11. Créer un agenda (Médecin/AdminCabinet)
**POST** `/agendas`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "medecin_id": "uuid",
  "libelle": "Consultations matin"
}
```

### Réponse (201)
```json
{
  "message": "Agenda créé avec succès",
  "data": {
    "idagenda": "uuid",
    "medecin_id": "uuid",
    "libelle": "Consultations matin"
  }
}
```

## 12. Récupérer les agendas d'un médecin (Public)
**GET** `/medecin/:medecinId/agendas`

### Réponse (200)
```json
{
  "message": "Agendas du médecin récupérés avec succès",
  "data": [
    {
      "idagenda": "uuid",
      "medecin_id": "uuid",
      "libelle": "Consultations matin",
      "medecin": {
        "idMedecin": "uuid",
        "nom": "Martin",
        "prenom": "Dr. Marie",
        "specialites": ["Médecine générale"]
      },
      "creneaux": [
        {
          "idcreneau": "uuid",
          "agenda_id": "uuid",
          "debut": "2024-01-15T09:00:00Z",
          "fin": "2024-01-15T09:30:00Z",
          "disponible": true
        }
      ]
    }
  ]
}
```

## 13. Traiter les rappels à envoyer (Système/Admin)
**POST** `/rappels/traiter`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Rappels traités avec succès",
  "data": [
    {
      "idRappel": "uuid",
      "rendezvous_id": "uuid",
      "dateEnvoi": "2024-01-14T10:00:00Z",
      "canal": "EMAIL",
      "envoye": true
    }
  ]
}
```

## 14. Créer un rappel personnalisé (Médecin/AdminCabinet)
**POST** `/rappels`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "rendezvousId": "uuid",
  "dateEnvoi": "2024-01-14T10:00:00Z",
  "canal": "EMAIL"
}
```

### Réponse (201)
```json
{
  "message": "Rappel créé avec succès",
  "data": {
    "idRappel": "uuid",
    "rendezvous_id": "uuid",
    "dateEnvoi": "2024-01-14T10:00:00Z",
    "canal": "EMAIL",
    "envoye": false
  }
}
```

## Statuts des rendez-vous
- Valeurs autorisées (ENUM): `EN_ATTENTE`, `CONFIRME`, `ANNULE`, `TERMINE`, `EN_COURS`
- **EN_ATTENTE** : Rendez-vous créé, en attente de confirmation
- **CONFIRME** : Rendez-vous confirmé par le médecin
- **ANNULE** : Rendez-vous annulé
- **TERMINE** : Rendez-vous terminé
- **EN_COURS** : Rendez-vous en cours

## Contrainte créneau (validation)
- `fin` doit être strictement > `debut`. Si `fin <= debut`, la création/modification du créneau échoue.
- Réponse recommandée: `422 Unprocessable Entity` avec message: `"fin doit être supérieure à debut"`.

## Canaux de rappel
- **EMAIL** : Rappel par email
- **SMS** : Rappel par SMS
- **PUSH** : Notification push

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **422** : Contrainte métier non respectée (ex: `fin <= debut`)
- **401** : Token d'accès requis
- **403** : Permissions insuffisantes
- **404** : Rendez-vous non trouvé
- **500** : Erreur serveur
