# Dossier Médical - Endpoints

Base: `http://localhost:3000/api/dossier-medical`

Tous les endpoints nécessitent le header d'authentification JWT:
- `Authorization: Bearer <token>`

## Index (URLs complètes)
- GET   http://localhost:3000/api/dossier-medical/dossier/me
- GET   http://localhost:3000/api/dossier-medical/:dossierId/documents
- POST  http://localhost:3000/api/dossier-medical/documents
- PATCH http://localhost:3000/api/dossier-medical/documents/:id
- DELETE http://localhost:3000/api/dossier-medical/documents/:id

---

## 1) Obtenir/Créer le dossier du patient connecté
GET `/dossier/me`

- Description: Retourne le dossier du patient connecté (déduit via le token). Le crée s'il n'existe pas.
- Auth: `Authorization: Bearer <token>`
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

- Response 404:
```json
{ "message": "Patient introuvable" }
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

## 3) Ajouter un document (Cloudinary)
POST `/documents`

- Auth: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data`
- Body:
```json
{
  "dossier_id": "uuid",
  "nom": "Compte rendu",
  "type": "PDF",
  "ispublic": false,
  "file": "<fichier>"
}
```
- Response 201: document créé
- Response 502: `{ "message": "Cloudinary non configuré" }`
- Response 404: `{ "message": "Dossier introuvable" }`

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

## 5) Supprimer un document (par le patient propriétaire uniquement)
DELETE `/documents/:id`

- Response 200:
```json
{ "success": true }
```

- Response 403:
```json
{ "message": "Accès interdit" }
```

- Response 404:
```json
{ "message": "Document non trouvé" }
```

---

## Notes
- Les uploads de fichiers binaires seront gérés via un service d'upload (à venir). Ici on stocke seulement les métadonnées et l'URL.
- Les droits d'accès sont contrôlés par le middleware JWT et la logique métier.
  - Seul le patient propriétaire du dossier peut supprimer ses documents; aucun administrateur n'a ce droit.
