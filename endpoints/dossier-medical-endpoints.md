# Dossier Médical - Endpoints

Base: `/api/dossier-medical`

Tous les endpoints nécessitent le header d'authentification JWT:
- `Authorization: Bearer <token>`

---

## 1) Obtenir/Créer le dossier d'un patient
GET `/dossier/:patientId`

- Description: Retourne le dossier du patient. Le crée s'il n'existe pas.
- Params: `patientId` (UUID du patient)
- Response 200:
```json
{
  "dossier": {
    "iddossier": "...",
    "patient_id": "...",
    "datecreation": "2025-01-01T10:00:00.000Z",
    "datemaj": null
  },
  "created": false
}
```

---

## 2) Lister les documents d'un dossier
GET `/:dossierId/documents`

- Params: `dossierId`
- Response 200:
```json
[
  {
    "iddocument": "...",
    "dossier_id": "...",
    "nom": "Compte rendu",
    "type": "PDF",
    "url": "https://...",
    "mimetype": "application/pdf",
    "taillekb": 320,
    "dateupload": "2025-01-01T10:00:00.000Z",
    "ispublic": false
  }
]
```

---

## 3) Ajouter un document
POST `/documents`

- Body:
```json
{
  "dossier_id": "uuid",
  "nom": "Compte rendu",
  "type": "PDF",
  "url": "https://...",
  "mimetype": "application/pdf",
  "taillekb": 320,
  "ispublic": false
}
```
- Response 201: document créé

---

## 4) Mettre à jour un document
PATCH `/documents/:id`

- Body (partiel):
```json
{
  "nom": "Nouveau nom",
  "url": "https://..."
}
```
- Response 200: document mis à jour

---

## 5) Supprimer un document
DELETE `/documents/:id`

- Response 200:
```json
{ "success": true }
```

---

## Notes
- Les uploads de fichiers binaires seront gérés via un service d'upload (à venir). Ici on stocke seulement les métadonnées et l'URL.
- Les droits d'accès sont contrôlés par le middleware JWT et la logique métier.
