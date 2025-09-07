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
      "idcabinet": "uuid",
      "nom": "Cabinet Médical Central",
      "adresse": "123 Avenue de la Santé, Lomé",
      "telephone": "0123456789",
      "email": "contact@cabinet-central.com",
      "logo": "logo-url",
      "horairesouverture": {
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
    "idcabinet": "uuid",
    "nom": "Cabinet Médical Central",
    "adresse": "123 Avenue de la Santé, Lomé",
    "telephone": "0123456789",
    "email": "contact@cabinet-central.com",
    "logo": "logo-url",
    "horairesouverture": {
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
  "horairesouverture": {
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
    "idcabinet": "uuid",
    "nom": "Cabinet Médical Central",
    "adresse": "123 Avenue de la Santé, Lomé",
    "telephone": "0123456789",
    "email": "contact@cabinet-central.com",
    "logo": "logo-url",
    "horairesouverture": {
      "lundi": "08:00-18:00",
      "mardi": "08:00-18:00"
    }
  }
}
```

## 4. Récupérer les AdminCabinet d'un cabinet (SuperAdmin)
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
      "roleadmin": "ADMIN_PRINCIPAL",
      "dateaffectation": "2025-01-03T00:00:00.000Z",
      "email": "admin@cabinet-central.com",
      "nom": "Admin",
      "prenom": "Cabinet",
      "telephone": "0987654321",
    }
  ]
}
```

## 5. Modifier un cabinet (SuperAdmin/AdminCabinet)
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
  "horairesouverture": {
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
    "idcabinet": "uuid",
    "nom": "Nouveau nom du cabinet",
    "adresse": "Nouvelle adresse",
    "telephone": "0987654321",
    "email": "nouveau@cabinet.com",
    "actif": true
  }
}
```

Notes:
- Gestion des médecins du cabinet: un médecin peut être archivé via `medecin_cabinet.actif = false`.
- Les spécialités du cabinet sont maintenues via `cabinet_specialite`.

## 6. Archiver un cabinet (SuperAdmin)
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

## 7. Gestion des spécialités du cabinet
**GET** `/:id/specialites` - Liste des spécialités
**POST** `/:id/specialites` - Ajouter une spécialité
**DELETE** `/:id/specialites/:specialiteId` - Retirer une spécialité

## 8. Gestion des médecins du cabinet
**GET** `/:id/medecins` - Liste des médecins
**PUT** `/:id/medecins/:medecinId/archive` - Archiver un médecin

## 9. Statistiques du cabinet
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
