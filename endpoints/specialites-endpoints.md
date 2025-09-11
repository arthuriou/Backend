# 🏥 API Endpoints - Spécialités & Maux
## Base URL
```
http://localhost:3000/api/specialites
```

## Index (URLs complètes)
- POST  http://localhost:3000/api/specialites/specialites
- GET   http://localhost:3000/api/specialites/specialites
- GET   http://localhost:3000/api/specialites/specialites/:id
- GET   http://localhost:3000/api/specialites/specialites/:id/details
- PUT   http://localhost:3000/api/specialites/specialites/:id
- DELETE http://localhost:3000/api/specialites/specialites/:id
- GET   http://localhost:3000/api/specialites/specialites/search
- POST  http://localhost:3000/api/specialites/maux
- GET   http://localhost:3000/api/specialites/maux
- GET   http://localhost:3000/api/specialites/maux/:id
- GET   http://localhost:3000/api/specialites/maux/:id/details
- PUT   http://localhost:3000/api/specialites/maux/:id
- DELETE http://localhost:3000/api/specialites/maux/:id
- GET   http://localhost:3000/api/specialites/maux/search
- POST  http://localhost:3000/api/specialites/associations/medecin-specialite
- DELETE http://localhost:3000/api/specialites/associations/medecin-specialite/:medecinId/:specialiteId
- POST  http://localhost:3000/api/specialites/associations/cabinet-specialite
- DELETE http://localhost:3000/api/specialites/associations/cabinet-specialite/:cabinetId/:specialiteId
- POST  http://localhost:3000/api/specialites/associations/specialite-maux
- DELETE http://localhost:3000/api/specialites/associations/specialite-maux/:specialiteId/:mauxId
- GET   http://localhost:3000/api/specialites/specialites/:id/medecins
- GET   http://localhost:3000/api/specialites/specialites/:id/cabinets
- GET   http://localhost:3000/api/specialites/statistics

## 1. Créer une spécialité
**POST** `/specialites`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "nom": "Cardiologie",
  "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
}
```

### Réponse (201)
```json
{
  "message": "Spécialité créée avec succès",
  "data": {
    "idspecialite": "uuid",
    "nom": "Cardiologie",
    "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
  }
}
```

## 2. Récupérer toutes les spécialités
**GET** `/specialites?limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `limit` (optionnel) : Nombre de spécialités à récupérer (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Spécialités récupérées avec succès",
  "data": [
    {
      "idspecialite": "uuid",
      "nom": "Cardiologie",
      "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
    }
  ]
}
```

## 3. Récupérer une spécialité par ID
**GET** `/specialites/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Spécialité récupérée avec succès",
  "data": {
    "idspecialite": "uuid",
    "nom": "Cardiologie",
    "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
  }
}
```

## 4. Récupérer une spécialité avec détails
**GET** `/specialites/:id/details`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Spécialité récupérée avec succès",
  "data": {
    "idspecialite": "uuid",
    "nom": "Cardiologie",
    "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins",
    "nombre_medecins": 5,
    "nombre_cabinets": 3,
    "nombre_maux": 12,
    "medecins": [
      {
        "idMedecin": "uuid",
        "nom": "Martin",
        "prenom": "Dr. Jean",
        "email": "jean.martin@email.com"
      }
    ],
    "cabinets": [
      {
        "idcabinet": "uuid",
        "nom": "Cabinet Cardiologie",
        "adresse": "123 Rue de la Santé"
      }
    ],
    "maux": [
      {
        "idmaux": "uuid",
        "nom": "Douleur thoracique",
        "categorie": "Symptôme"
      }
    ]
  }
}
```

## 5. Modifier une spécialité
**PUT** `/specialites/:id`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "nom": "Cardiologie Avancée",
  "description": "Spécialité médicale avancée qui traite les maladies du cœur et des vaisseaux sanguins"
}
```

### Réponse (200)
```json
{
  "message": "Spécialité modifiée avec succès",
  "data": {
    "idspecialite": "uuid",
    "nom": "Cardiologie Avancée",
    "description": "Spécialité médicale avancée qui traite les maladies du cœur et des vaisseaux sanguins"
  }
}
```

## 6. Supprimer une spécialité
**DELETE** `/specialites/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Spécialité supprimée avec succès"
}
```

## 7. Rechercher des spécialités
**GET** `/specialites/search?nom=cardio&description=cœur&medecin_id=uuid&cabinet_id=uuid&maux_id=uuid&limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `nom` (optionnel) : Recherche par nom (recherche partielle)
- `description` (optionnel) : Recherche par description (recherche partielle)
- `medecin_id` (optionnel) : Filtrer par médecin
- `cabinet_id` (optionnel) : Filtrer par cabinet
- `maux_id` (optionnel) : Filtrer par mal
- `limit` (optionnel) : Nombre de résultats (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Recherche de spécialités effectuée avec succès",
  "data": [
    {
      "idspecialite": "uuid",
      "nom": "Cardiologie",
      "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins",
      "nombre_medecins": 5,
      "nombre_cabinets": 3,
      "nombre_maux": 12
    }
  ]
}
```

## 8. Créer un mal
**POST** `/maux`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "nom": "Douleur thoracique",
  "description": "Sensation de douleur ou d'inconfort dans la poitrine",
  "categorie": "Symptôme"
}
```

### Réponse (201)
```json
{
  "message": "Mal créé avec succès",
  "data": {
    "idmaux": "uuid",
    "nom": "Douleur thoracique",
    "description": "Sensation de douleur ou d'inconfort dans la poitrine",
    "categorie": "Symptôme"
  }
}
```

## 9. Récupérer tous les maux
**GET** `/maux?limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `limit` (optionnel) : Nombre de maux à récupérer (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Maux récupérés avec succès",
  "data": [
    {
      "idmaux": "uuid",
      "nom": "Douleur thoracique",
      "description": "Sensation de douleur ou d'inconfort dans la poitrine",
      "categorie": "Symptôme"
    }
  ]
}
```

## 10. Récupérer un mal par ID
**GET** `/maux/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Mal récupéré avec succès",
  "data": {
    "idmaux": "uuid",
    "nom": "Douleur thoracique",
    "description": "Sensation de douleur ou d'inconfort dans la poitrine",
    "categorie": "Symptôme"
  }
}
```

## 11. Récupérer un mal avec détails
**GET** `/maux/:id/details`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Mal récupéré avec succès",
  "data": {
    "idmaux": "uuid",
    "nom": "Douleur thoracique",
    "description": "Sensation de douleur ou d'inconfort dans la poitrine",
    "categorie": "Symptôme",
    "nombre_specialites": 3,
    "specialites": [
      {
        "idspecialite": "uuid",
        "nom": "Cardiologie",
        "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
      }
    ]
  }
}
```

## 12. Modifier un mal
**PUT** `/maux/:id`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "nom": "Douleur thoracique aiguë",
  "description": "Sensation de douleur ou d'inconfort intense dans la poitrine",
  "categorie": "Symptôme urgent"
}
```

### Réponse (200)
```json
{
  "message": "Mal modifié avec succès",
  "data": {
    "idmaux": "uuid",
    "nom": "Douleur thoracique aiguë",
    "description": "Sensation de douleur ou d'inconfort intense dans la poitrine",
    "categorie": "Symptôme urgent"
  }
}
```

## 13. Supprimer un mal
**DELETE** `/maux/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Mal supprimé avec succès"
}
```

## 14. Rechercher des maux
**GET** `/maux/search?nom=douleur&categorie=symptôme&specialite_id=uuid&limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `nom` (optionnel) : Recherche par nom (recherche partielle)
- `categorie` (optionnel) : Recherche par catégorie (recherche partielle)
- `specialite_id` (optionnel) : Filtrer par spécialité
- `limit` (optionnel) : Nombre de résultats (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Recherche de maux effectuée avec succès",
  "data": [
    {
      "idmaux": "uuid",
      "nom": "Douleur thoracique",
      "description": "Sensation de douleur ou d'inconfort dans la poitrine",
      "categorie": "Symptôme",
      "nombre_specialites": 3
    }
  ]
}
```

## 15. Associer un médecin à une spécialité
**POST** `/associations/medecin-specialite`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "medecin_id": "uuid",
  "specialite_id": "uuid"
}
```

### Réponse (201)
```json
{
  "message": "Médecin associé à la spécialité avec succès",
  "data": {
    "medecin_id": "uuid",
    "specialite_id": "uuid"
  }
}
```

## 16. Désassocier un médecin d'une spécialité
**DELETE** `/associations/medecin-specialite/:medecinId/:specialiteId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Médecin désassocié de la spécialité avec succès"
}
```

## 17. Associer un cabinet à une spécialité
**POST** `/associations/cabinet-specialite`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "cabinet_id": "uuid",
  "specialite_id": "uuid"
}
```

### Réponse (201)
```json
{
  "message": "Cabinet associé à la spécialité avec succès",
  "data": {
    "cabinet_id": "uuid",
    "specialite_id": "uuid"
  }
}
```

## 18. Désassocier un cabinet d'une spécialité
**DELETE** `/associations/cabinet-specialite/:cabinetId/:specialiteId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Cabinet désassocié de la spécialité avec succès"
}
```

## 19. Associer une spécialité à un mal
**POST** `/associations/specialite-maux`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "specialite_id": "uuid",
  "maux_id": "uuid"
}
```

### Réponse (201)
```json
{
  "message": "Spécialité associée au mal avec succès",
  "data": {
    "specialite_id": "uuid",
    "maux_id": "uuid"
  }
}
```

## 20. Désassocier une spécialité d'un mal
**DELETE** `/associations/specialite-maux/:specialiteId/:mauxId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Spécialité désassociée du mal avec succès"
}
```

## 21. Rechercher des médecins par spécialité
**GET** `/specialites/:id/medecins?cabinet_id=uuid&limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `cabinet_id` (optionnel) : Filtrer par cabinet
- `limit` (optionnel) : Nombre de résultats (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Médecins trouvés avec succès",
  "data": [
    {
      "idMedecin": "uuid",
      "nom": "Martin",
      "prenom": "Dr. Jean",
      "email": "jean.martin@email.com",
      "specialites": [
        {
          "idspecialite": "uuid",
          "nom": "Cardiologie",
          "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
        }
      ]
    }
  ]
}
```

## 22. Rechercher des cabinets par spécialité
**GET** `/specialites/:id/cabinets?limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `limit` (optionnel) : Nombre de résultats (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Cabinets trouvés avec succès",
  "data": [
    {
      "idcabinet": "uuid",
      "nom": "Cabinet Cardiologie",
      "adresse": "123 Rue de la Santé",
      "specialites": [
        {
          "idspecialite": "uuid",
          "nom": "Cardiologie",
          "description": "Spécialité médicale qui traite les maladies du cœur et des vaisseaux sanguins"
        }
      ]
    }
  ]
}
```
## 23. Obtenir les statistiques générales
**GET** `/statistics`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Statistiques récupérées avec succès",
  "data": {
    "totalSpecialites": 25,
    "totalMaux": 150,
    "totalAssociationsMedecinSpecialite": 45,
    "totalAssociationsCabinetSpecialite": 18,
    "totalAssociationsSpecialiteMaux": 89
  }
}
```

## Permissions
- **Créer/Modifier/Supprimer** : SuperAdmin uniquement
- **Associations Médecin-Spécialité** : AdminCabinet et SuperAdmin
- **Associations Cabinet-Spécialité** : AdminCabinet et SuperAdmin
- **Associations Spécialité-Maux** : SuperAdmin uniquement
- **Consultation** : Tous les utilisateurs authentifiés

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **401** : Token d'accès requis
- **403** : Permissions insuffisantes
- **404** : Spécialité/Mal non trouvé
- **409** : Conflit (nom déjà existant)
- **500** : Erreur serveur

## Exemples d'utilisation

### Recherche de médecins cardiologues
```javascript
const searchCardiologists = async () => {
  const response = await fetch('/api/specialites/specialite-id/medecins', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### Association d'un médecin à une spécialité
```javascript
const associateMedecinSpecialite = async (medecinId, specialiteId) => {
  const response = await fetch('/api/specialites/associations/medecin-specialite', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      medecin_id: medecinId,
      specialite_id: specialiteId
    })
  });
  return response.json();
};
```

