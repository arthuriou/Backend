# Endpoints des Cabinets - SantéAfrik

## Base URL
```
http://localhost:3000/api/cabinets
```

## 1. Lister tous les cabinets
**GET** `/`

### Réponse (200)
```json
{
  "message": "Cabinets récupérés avec succès",
  "data": [
    {
      "idCabinet": "uuid",
      "nom": "Cabinet Médical Central",
      "adresse": "123 Avenue de la Santé, Lomé",
      "telephone": "0123456789",
      "email": "contact@cabinet-central.com",
      "logo": "logo-url",
      "horairesOuverture": {
        "lundi": "08:00-18:00",
        "mardi": "08:00-18:00",
        "mercredi": "08:00-18:00",
        "jeudi": "08:00-18:00",
        "vendredi": "08:00-18:00",
        "samedi": "08:00-12:00"
      }
    }
  ]
}
```

## 2. Récupérer un cabinet par ID
**GET** `/:id`

### Réponse (200)
```json
{
  "message": "Cabinet récupéré avec succès",
  "data": {
    "idCabinet": "uuid",
    "nom": "Cabinet Médical Central",
    "adresse": "123 Avenue de la Santé, Lomé",
    "telephone": "0123456789",
    "email": "contact@cabinet-central.com",
    "logo": "logo-url",
    "horairesOuverture": {
      "lundi": "08:00-18:00",
      "mardi": "08:00-18:00"
    }
  }
}
```

## 3. Créer un cabinet (SuperAdmin)
**POST** `/`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "nom": "Cabinet Médical Central",
  "adresse": "123 Avenue de la Santé, Lomé",
  "telephone": "0123456789",
  "email": "contact@cabinet-central.com",
  "logo": "logo-url",
  "horairesOuverture": {
    "lundi": "08:00-18:00",
    "mardi": "08:00-18:00",
    "mercredi": "08:00-18:00",
    "jeudi": "08:00-18:00",
    "vendredi": "08:00-18:00",
    "samedi": "08:00-12:00"
  }
}
```

### Réponse (201)
```json
{
  "message": "Cabinet créé avec succès",
  "data": {
    "idCabinet": "uuid",
    "nom": "Cabinet Médical Central",
    "adresse": "123 Avenue de la Santé, Lomé",
    "telephone": "0123456789",
    "email": "contact@cabinet-central.com",
    "logo": "logo-url",
    "horairesOuverture": {
      "lundi": "08:00-18:00",
      "mardi": "08:00-18:00"
    }
  }
}
```

## 4. Créer un AdminCabinet (SuperAdmin)
**POST** `/:id/admin`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "email": "admin@cabinet-central.com",
  "motdepasse": "password123",
  "nom": "Admin",
  "prenom": "Cabinet",
  "telephone": "0987654321",
  "cabinetId": "uuid",
  "roleAdmin": "ADMIN_PRINCIPAL"
}
```

### Réponse (201)
```json
{
  "message": "AdminCabinet créé avec succès",
  "data": {
    "user": {
      "idUtilisateur": "uuid",
      "email": "admin@cabinet-central.com",
      "nom": "Admin",
      "prenom": "Cabinet",
      "telephone": "0987654321",
      "dateCreation": "2025-01-03T00:00:00.000Z",
      "actif": true
    },
    "adminCabinet": {
      "idAdminCabinet": "uuid",
      "utilisateur_id": "uuid",
      "cabinet_id": "uuid",
      "roleAdmin": "ADMIN_PRINCIPAL",
      "dateAffectation": "2025-01-03T00:00:00.000Z"
    }
  }
}
```

## 5. Récupérer les AdminCabinet d'un cabinet (SuperAdmin)
**GET** `/:id/admins`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "AdminCabinet récupérés avec succès",
  "data": [
    {
      "idAdminCabinet": "uuid",
      "utilisateur_id": "uuid",
      "cabinet_id": "uuid",
      "roleAdmin": "ADMIN_PRINCIPAL",
      "dateAffectation": "2025-01-03T00:00:00.000Z",
      "email": "admin@cabinet-central.com",
      "nom": "Admin",
      "prenom": "Cabinet",
      "telephone": "0987654321",
      "dateCreation": "2025-01-03T00:00:00.000Z"
    }
  ]
}
```

## 6. Modifier un cabinet (SuperAdmin/AdminCabinet)
**PUT** `/:id`

### Headers
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "nom": "Nouveau nom du cabinet",
  "adresse": "Nouvelle adresse",
  "telephone": "0987654321",
  "email": "nouveau@cabinet.com",
  "horairesOuverture": {
    "lundi": "09:00-17:00",
    "mardi": "09:00-17:00"
  }
}
```

### Réponse (200)
```json
{
  "message": "Cabinet modifié avec succès",
  "data": {
    "idCabinet": "uuid",
    "nom": "Nouveau nom du cabinet",
    "adresse": "Nouvelle adresse",
    "telephone": "0987654321",
    "email": "nouveau@cabinet.com",
    "actif": true
  }
}
```

## 7. Archiver un cabinet (SuperAdmin)
**PUT** `/:id/archive`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Cabinet archivé avec succès"
}
```

## 8. Gestion des spécialités du cabinet
**GET** `/:id/specialites` - Liste des spécialités
**POST** `/:id/specialites` - Ajouter une spécialité
**DELETE** `/:id/specialites/:specialiteId` - Retirer une spécialité

## 9. Gestion des médecins du cabinet
**GET** `/:id/medecins` - Liste des médecins
**PUT** `/:id/medecins/:medecinId/archive` - Archiver un médecin

## 10. Statistiques du cabinet
**GET** `/:id/stats`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Statistiques du cabinet récupérées avec succès",
  "data": {
    "total_medecins": 5,
    "total_admins": 2,
    "total_specialites": 8
  }
}
```

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **401** : Token d'accès requis
- **403** : Permissions insuffisantes (SuperAdmin requis)
- **404** : Cabinet non trouvé
- **500** : Erreur serveur
