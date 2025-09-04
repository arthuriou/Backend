# Ordonnances - Endpoints

Base: `/api/ordonnances`

Auth: `Authorization: Bearer <token>`

---

## 1) Créer une ordonnance
POST `/`

Body:
```json
{
  "consultation_id": "<uuid_consultation>",
  "date": "2025-01-01",
  "dureetraitement": 7,
  "renouvellements": 0,
  "notes": "Boire beaucoup d'eau",
  "lignes": [
    { "medicament": "Paracetamol 500mg", "dosage": "500mg", "posologie": "1 cp x3/j", "dureejour": 5 },
    { "medicament": "Vitamine C", "dosage": "1g", "posologie": "1 sachet/j", "dureejour": 7 }
  ]
}
```

Response 201:
```json
{
  "ordonnance": { "idordonnance": "...", "consultation_id": "...", "date": "2025-01-01", "dureetraitement": 7, "renouvellements": 0, "notes": "..." },
  "lignes": [ { "idligneordonnance": "...", "medicament": "..." } ]
}
```

---

## 2) Lister les ordonnances d'une consultation
GET `/consultation/:consultationId`

Response 200:
```json
[
  { "idordonnance": "...", "consultation_id": "...", "date": "2025-01-01", "dureetraitement": 7, "renouvellements": 0, "notes": "..." }
]
```

---

## 3) Récupérer une ordonnance (avec lignes)
GET `/:id`

Response 200:
```json
{
  "ordonnance": { "idordonnance": "...", "consultation_id": "...", "date": "2025-01-01", "dureetraitement": 7, "renouvellements": 0, "notes": "..." },
  "lignes": [ { "idligneordonnance": "...", "medicament": "..." } ]
}
```

---

## 4) Mettre à jour une ordonnance
PATCH `/:id`

Body (exemples):
```json
{ "notes": "Adapter selon douleur" }
```

Response 200: ordonnance mise à jour

---

## 5) Supprimer une ordonnance
DELETE `/:id`

Response 200:
```json
{ "success": true }
```
