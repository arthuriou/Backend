# 🔔 API Endpoints - Historique des Notifications

## Base URL
```
http://localhost:3000/api/notifications/history
```

## 1. Récupérer les notifications de l'utilisateur connecté
**GET** `/`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 20)
- `type_notification` (optionnel) : Filtrer par type (RENDEZ_VOUS, MESSAGE, RAPPEL, SYSTEME, URGENCE, CABINET)
- `lu` (optionnel) : Filtrer par statut de lecture (true/false)
- `date_debut` (optionnel) : Date de début (ISO 8601)
- `date_fin` (optionnel) : Date de fin (ISO 8601)

### Exemple de requête
```
GET /api/notifications/history?page=1&limit=10&type_notification=RENDEZ_VOUS&lu=false
```

### Réponse (200)
```json
{
  "message": "Notifications récupérées avec succès",
  "data": {
    "notifications": [
      {
        "idNotification": "uuid",
        "utilisateur_id": "uuid",
        "titre": "Nouveau rendez-vous",
        "contenu": "Vous avez un nouveau rendez-vous demain à 14h",
        "type_notification": "RENDEZ_VOUS",
        "canal": "PUSH",
        "data": {
          "rendezvous_id": "uuid"
        },
        "lu": false,
        "date_envoi": "2024-01-15T10:30:00Z",
        "date_lecture": null,
        "date_expiration": null,
        "actif": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    },
    "stats": {
      "total": 25,
      "non_lues": 5,
      "par_type": {
        "RENDEZ_VOUS": 10,
        "MESSAGE": 8,
        "RAPPEL": 5,
        "SYSTEME": 2
      },
      "derniere_lecture": "2024-01-15T09:15:00Z"
    }
  }
}
```

## 2. Récupérer une notification spécifique
**GET** `/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Notification récupérée avec succès",
  "data": {
    "idNotification": "uuid",
    "utilisateur_id": "uuid",
    "titre": "Nouveau rendez-vous",
    "contenu": "Vous avez un nouveau rendez-vous demain à 14h",
    "type_notification": "RENDEZ_VOUS",
    "canal": "PUSH",
    "data": {
      "rendezvous_id": "uuid"
    },
    "lu": false,
    "date_envoi": "2024-01-15T10:30:00Z",
    "date_lecture": null,
    "date_expiration": null,
    "actif": true
  }
}
```

## 3. Marquer des notifications comme lues
**POST** `/mark-read`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Réponse (200)
```json
{
  "message": "3 notification(s) marquée(s) comme lue(s)",
  "data": {
    "notifications_marked": 3,
    "notifications": [
      {
        "idNotification": "uuid1",
        "lu": true,
        "date_lecture": "2024-01-15T11:30:00Z"
      }
    ]
  }
}
```

## 4. Marquer toutes les notifications comme lues
**POST** `/mark-all-read`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `type_notification` (optionnel) : Marquer seulement un type spécifique

### Exemple
```
POST /api/notifications/history/mark-all-read?type_notification=RENDEZ_VOUS
```

### Réponse (200)
```json
{
  "message": "5 notification(s) marquée(s) comme lue(s)",
  "data": {
    "count": 5
  }
}
```

## 5. Récupérer les statistiques des notifications
**GET** `/stats`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Statistiques récupérées avec succès",
  "data": {
    "total": 25,
    "non_lues": 5,
    "par_type": {
      "RENDEZ_VOUS": 10,
      "MESSAGE": 8,
      "RAPPEL": 5,
      "SYSTEME": 2
    },
    "derniere_lecture": "2024-01-15T09:15:00Z"
  }
}
```

## 6. Supprimer une notification
**DELETE** `/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Notification supprimée avec succès"
}
```

## 7. Supprimer les notifications anciennes
**DELETE** `/cleanup/old`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "days_old": 30
}
```

### Réponse (200)
```json
{
  "message": "15 notification(s) ancienne(s) supprimée(s)",
  "data": {
    "count": 15
  }
}
```

## 8. Créer une notification de rendez-vous
**POST** `/rendez-vous`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "titre": "Nouveau rendez-vous",
  "contenu": "Vous avez un nouveau rendez-vous demain à 14h",
  "rendezvous_id": "uuid",
  "canal": "PUSH"
}
```

### Réponse (201)
```json
{
  "message": "Notification de rendez-vous créée avec succès",
  "data": {
    "idNotification": "uuid",
    "utilisateur_id": "uuid",
    "titre": "Nouveau rendez-vous",
    "contenu": "Vous avez un nouveau rendez-vous demain à 14h",
    "type_notification": "RENDEZ_VOUS",
    "canal": "PUSH",
    "data": {
      "rendezvous_id": "uuid"
    },
    "lu": false,
    "date_envoi": "2024-01-15T10:30:00Z",
    "actif": true
  }
}
```

## 9. Créer une notification de message
**POST** `/message`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "titre": "Nouveau message",
  "contenu": "Vous avez reçu un nouveau message",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "canal": "PUSH"
}
```

### Réponse (201)
```json
{
  "message": "Notification de message créée avec succès",
  "data": {
    "idNotification": "uuid",
    "utilisateur_id": "uuid",
    "titre": "Nouveau message",
    "contenu": "Vous avez reçu un nouveau message",
    "type_notification": "MESSAGE",
    "canal": "PUSH",
    "data": {
      "conversation_id": "uuid",
      "message_id": "uuid"
    },
    "lu": false,
    "date_envoi": "2024-01-15T10:30:00Z",
    "actif": true
  }
}
```

## Types de notifications supportés
- **RENDEZ_VOUS** : Notifications liées aux rendez-vous
- **MESSAGE** : Notifications de messagerie
- **RAPPEL** : Rappels automatiques
- **SYSTEME** : Notifications système
- **URGENCE** : Notifications urgentes
- **CABINET** : Notifications du cabinet

## Canaux supportés
- **PUSH** : Notifications push (mobile/web)
- **EMAIL** : Notifications par email
- **SMS** : Notifications par SMS
- **IN_APP** : Notifications dans l'application

## Codes d'erreur
- **400** : Données invalides
- **401** : Token d'accès requis
- **404** : Notification non trouvée
- **500** : Erreur serveur

## Exemple d'utilisation Frontend

```javascript
// Récupérer les notifications non lues
const getUnreadNotifications = async () => {
  const response = await fetch('/api/notifications/history?lu=false', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Marquer une notification comme lue
const markAsRead = async (notificationIds) => {
  const response = await fetch('/api/notifications/history/mark-read', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notification_ids: notificationIds })
  });
  return response.json();
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async () => {
  const response = await fetch('/api/notifications/history/mark-all-read', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Récupérer les statistiques
const getStats = async () => {
  const response = await fetch('/api/notifications/history/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```
