# Ordonnances - Endpoints

Base: `http://localhost:3000/api/ordonnances`
Auth: `Authorization: Bearer <token>`

## Index (URLs complètes)
- POST  http://localhost:3000/api/ordonnances/
- GET   http://localhost:3000/api/ordonnances/:id
- PATCH http://localhost:3000/api/ordonnances/:id
- DELETE http://localhost:3000/api/ordonnances/:id
- PUT   http://localhost:3000/api/ordonnances/:id/valider
- GET   http://localhost:3000/api/ordonnances/consultation/:consultationId
- GET   http://localhost:3000/api/ordonnances/patient/:patientId
- GET   http://localhost:3000/api/ordonnances/medecin/:medecinId

---

## 1) Créer une ordonnance
**POST** `/`

### Body (JSON)
```json
{
  "consultation_id": "uuid-consultation",
  "date": "2025-01-01",
  "dureetraitement": 7,
  "renouvellements": 0,
  "notes": "Boire beaucoup d'eau",
  "lignes": [
    { 
      "medicament": "Paracetamol 500mg", 
      "dosage": "500mg", 
      "posologie": "1 cp x3/j", 
      "dureejour": 5 
    },
    { 
      "medicament": "Vitamine C", 
      "dosage": "1g", 
      "posologie": "1 sachet/j", 
      "dureejour": 7 
    }
  ]
}
```

### Réponse (201)
```json
{
  "ordonnance": {
    "idordonnance": "uuid",
    "consultation_id": "uuid-consultation",
    "date": "2025-01-01",
    "dureetraitement": 7,
    "renouvellements": 0,
    "notes": "Boire beaucoup d'eau"
  },
  "lignes": [
    {
      "idligneordonnance": "uuid",
      "medicament": "Paracetamol 500mg",
      "dosage": "500mg",
      "posologie": "1 cp x3/j",
      "dureejour": 5
    }
  ]
}
```

---

## 2) Récupérer une ordonnance par ID
**GET** `/:id`

### Réponse (200)
```json
{
  "ordonnance": {
    "idordonnance": "uuid",
    "consultation_id": "uuid-consultation",
    "date": "2025-01-01",
    "dureetraitement": 7,
    "renouvellements": 0,
    "notes": "Boire beaucoup d'eau"
  },
  "lignes": [
    {
      "idligneordonnance": "uuid",
      "medicament": "Paracetamol 500mg",
      "dosage": "500mg",
      "posologie": "1 cp x3/j",
      "dureejour": 5
    }
  ]
}
```

### Réponse (404)
```json
{
  "message": "Ordonnance non trouvée"
}
```

---

## 3) Mettre à jour une ordonnance
**PATCH** `/:id`

### Body (JSON)
```json
{
  "dureetraitement": 10,
  "renouvellements": 1,
  "notes": "Notes mises à jour",
  "lignes": [
    { 
      "medicament": "Paracetamol", 
      "dosage": "500mg", 
      "posologie": "1 cp x2/j", 
      "dureejour": 10 
    },
    { 
      "medicament": "Vitamine D", 
      "dosage": "1000 UI", 
      "posologie": "1 cp/j", 
      "dureejour": 30 
    }
  ]
}
```

### Réponse (200)
```json
{
  "idordonnance": "uuid",
  "consultation_id": "uuid-consultation",
  "date": "2025-01-01",
  "dureetraitement": 10,
  "renouvellements": 1,
  "notes": "Notes mises à jour"
}
```

---

## 4) Supprimer une ordonnance
**DELETE** `/:id`

### Réponse (200)
```json
{
  "success": true
}
```

---

## 5) Valider une ordonnance
**PUT** `/:id/valider`

### Réponse (200)
```json
{
  "message": "Ordonnance validée",
  "ordonnance": {
    "idordonnance": "uuid",
    "consultation_id": "uuid-consultation",
    "date": "2025-01-01",
    "dureetraitement": 7,
    "renouvellements": 0,
    "notes": "Boire beaucoup d'eau [VALIDÉE]"
  }
}
```

---

## 6) Récupérer les ordonnances d'une consultation
**GET** `/consultation/:consultationId`

### Réponse (200)
```json
{
  "ordonnances": [
    {
      "idordonnance": "uuid",
      "consultation_id": "uuid-consultation",
      "date": "2025-01-01",
      "dureetraitement": 7,
      "renouvellements": 0,
      "notes": "Boire beaucoup d'eau"
    }
  ]
}
```

---

## 7) Récupérer les ordonnances d'un patient
**GET** `/patient/:patientId`

### Réponse (200)
```json
{
  "ordonnances": [
    {
      "idordonnance": "uuid",
      "consultation_id": "uuid-consultation",
      "date": "2025-01-01",
      "dureetraitement": 7,
      "renouvellements": 0,
      "notes": "Boire beaucoup d'eau"
    }
  ]
}
```

---

## 8) Récupérer les ordonnances d'un médecin
**GET** `/medecin/:medecinId`

### Réponse (200)
```json
{
  "ordonnances": [
    {
      "idordonnance": "uuid",
      "consultation_id": "uuid-consultation",
      "date": "2025-01-01",
      "dureetraitement": 7,
      "renouvellements": 0,
      "notes": "Boire beaucoup d'eau"
    }
  ]
}
```

---

## Codes d'erreur

- **400** : Données manquantes ou invalides
- **401** : Token d'authentification manquant ou invalide
- **403** : Accès refusé (rôle insuffisant)
- **404** : Ordonnance non trouvée
- **500** : Erreur serveur interne

---

## Notes importantes

- Tous les endpoints nécessitent une authentification via token Bearer
- Les ordonnances sont liées à des consultations via `consultation_id`
- Les consultations sont liées à des rendez-vous via `rendezvous_id`
- La validation d'une ordonnance ajoute `[VALIDÉE]` aux notes
- Les lignes d'ordonnance sont automatiquement créées/supprimées lors des opérations CRUD
