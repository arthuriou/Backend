# 📅 API Endpoints - Rendez-vous

## ⚠️ CORRECTION : Module Agenda Séparé

**Les fonctionnalités d'agenda ont été déplacées vers `/api/agenda`**

Les anciennes routes créneaux/agendas sous `/api/rendezvous` ont été supprimées.
Le nouveau système utilise uniquement :

- **Gestion agenda complets** : `/api/agenda/*`
- **Créneaux calculés** : `GET /api/agenda/:id/slots` et `GET /api/agenda/:id/slots/public`
- **Réservation depuis slots** : `POST /api/rendezvous/` avec `agenda_id`, `slot_start_at`, `slot_end_at`

Les routes natives RDV restent inchangées pour créer, confirmer, annuler, terminer, récupérer les RDV.

---

## Manipulation des Rendez-vous via l'agenda (médecin)

Ces endpoints permettent au médecin (ou à l'admin cabinet) de déplacer/redimensionner un RDV depuis la vue agenda, en respectant les règles de disponibilités, les blocs d'indisponibilités, et les temps tampons configurés sur l'agenda.

Tous nécessitent l'authentification JWT.

---

### Déplacer un rendez-vous (drag & drop)

- Méthode: `PUT`
- URL unifiée: `/api/agenda/rdv/:rendezvousId/move`
- Rôles: `MEDECIN`, `ADMINCABINET`

Body:
```json
{
  "new_start_at": "2025-09-25T10:00:00Z",
  "new_end_at": "2025-09-25T10:30:00Z"
}
```

Règles métiers:
- Vérifier que le médecin connecté est bien le propriétaire du RDV (ou admin du cabinet du RDV).
- Empêcher les collisions avec d'autres RDV si `allow_double_booking=false`.
- Respecter les `buffer_before_min` et `buffer_after_min` de l'agenda associé.
- Interdire si la plage est couverte par un bloc d'indisponibilité.
- Interdire si hors créneaux autorisés (selon type présentiel/téléconsultation et règles/extra visibles).

Réponse 200:
```json
{
  "message": "RDV déplacé",
  "rendezvous": {
    "idrendezvous": "uuid",
    "dateheure": "2025-09-25T10:00:00Z",
    "duree": 30,
    "statut": "CONFIRME"
  }
}
```

---

### Redimensionner un rendez-vous (étendre/réduire)

- Méthode: `PUT`
- URL unifiée: `/api/agenda/rdv/:rendezvousId/resize`
- Rôles: `MEDECIN`, `ADMINCABINET`

Body:
```json
{
  "new_end_at": "2025-09-25T10:45:00Z"
}
```

Règles métiers:
- Même contraintes que pour le déplacement (collisions, buffers, blocks, types autorisés).
- Mettre à jour la durée du RDV en conséquence.

Réponse 200:
```json
{
  "message": "RDV redimensionné",
  "rendezvous": {
    "idrendezvous": "uuid",
    "dateheure": "2025-09-25T10:00:00Z",
    "duree": 45,
    "statut": "CONFIRME"
  }
}
```

---

### Marquer un créneau présentiel en attente consultation (workflow cabinet)

Rappel: déjà existant dans les routes RDV, utile depuis l'agenda (vue liste/salle d'attente).

- Méthode: `PUT`
- URL: `/api/rendezvous/:id/patient-arrive`
- Rôles: `MEDECIN`, `ADMINCABINET`

Réponse 200:
```json
{ "message": "Patient marqué arrivé", "statut": "EN_ATTENTE_CONSULTATION" }
```

## Base URL
```
http://localhost:3000/api/rendezvous
```

## Sécurité et Accès (RBAC + Règles métier)
- Authentification: `Bearer <token>` obligatoire sauf endpoints explicitement publics.
- Rôles: `PATIENT`, `MEDECIN`, `ADMINCABINET`, `SUPERADMIN`.
- Accès par endpoint:
  - GET `/:id`: autorisé si vous êtes le patient du RDV, le médecin du RDV, `ADMINCABINET` ou `SUPERADMIN`.
  - GET `/patient/:patientId`:
    - `PATIENT`: uniquement ses propres RDV.
    - `MEDECIN`: uniquement si ce patient est lié à ce médecin (au moins un RDV confirmé/en_cours/terminé ou une consultation entre eux).
    - `ADMINCABINET`/`SUPERADMIN`: autorisés.
  - GET `/medecin/:medecinId`:
    - `MEDECIN`: uniquement ses propres RDV (même `medecinId`).
    - `ADMINCABINET`/`SUPERADMIN`: autorisés.
  - PUT `/:id`: modification autorisée au patient ou au médecin du RDV tant que non terminé/annulé.
  - PUT `/:id/confirmer`: seul le médecin propriétaire du RDV (ou `SUPERADMIN` si élargi plus tard).
  - PUT `/:id/annuler`: patient propriétaire ou médecin propriétaire.
  - PUT `/:id/terminer`: seul le médecin propriétaire.
- Définition “patient lié à un médecin”:
  - existe un enregistrement `rendezvous` entre eux avec `statut` ∈ (`CONFIRME`,`EN_COURS`,`TERMINE`) OU
  - existe une `consultation` entre eux.

## Index (URLs complètes)
- POST  http://localhost:3000/api/rendezvous/
- GET   http://localhost:3000/api/rendezvous/:id
- GET   http://localhost:3000/api/rendezvous/patient/:patientId
- GET   http://localhost:3000/api/rendezvous/medecin/:medecinId
- PUT   http://localhost:3000/api/rendezvous/:id
- PUT   http://localhost:3000/api/rendezvous/:id/confirmer
- PUT   http://localhost:3000/api/rendezvous/:id/annuler
- PUT   http://localhost:3000/api/rendezvous/:id/terminer
- POST  http://localhost:3000/api/rendezvous/rappels/traiter
- POST  http://localhost:3000/api/rendezvous/rappels

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

## 6. Confirmer un rendez-vous (Médecin uniquement)
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

## 7. Annuler un rendez-vous (Patient ou Médecin propriétaire)
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

## 8. Terminer un rendez-vous (Médecin uniquement)
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



## 9. Traiter les rappels à envoyer (Système/Admin)
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

## 10. Créer un rappel personnalisé (Médecin/AdminCabinet)
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
