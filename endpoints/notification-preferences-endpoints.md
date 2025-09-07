# 🔔 API Endpoints - Préférences de Notification

## Base URL
```
http://localhost:3000/api/notifications/preferences
```

## 1. Récupérer les préférences de l'utilisateur connecté
**GET** `/`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Préférences récupérées avec succès",
  "data": {
    "idpreference": "uuid",
    "utilisateur_id": "uuid",
    "soundenabled": true,
    "soundfile": "/sounds/notification.mp3",
    "volume": 0.7,
    "vibration": true,
    "pushenabled": false,
    "emailenabled": true,
    "smsenabled": false
  }
}
```

## 2. Créer les préférences de l'utilisateur connecté
**POST** `/`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "soundenabled": true,
  "soundfile": "/sounds/notification.mp3",
  "volume": 0.7,
  "vibration": true,
  "pushenabled": false,
  "emailenabled": true,
  "smsenabled": false
}
```

### Réponse (201)
```json
{
  "message": "Préférences créées avec succès",
  "data": {
    "idpreference": "uuid",
    "utilisateur_id": "uuid",
    "soundenabled": true,
    "soundfile": "/sounds/notification.mp3",
    "volume": 0.7,
    "vibration": true,
    "pushenabled": false,
    "emailenabled": true,
    "smsenabled": false
  }
}
```

## 3. Mettre à jour les préférences
**PUT** `/`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON) - Tous les champs sont optionnels
```json
{
  "soundenabled": true,
  "soundfile": "/sounds/ding.mp3",
  "volume": 0.8,
  "vibration": false,
  "pushenabled": true,
  "emailenabled": false,
  "smsenabled": true
}
```

### Réponse (200)
```json
{
  "message": "Préférences mises à jour avec succès",
  "data": {
    "idpreference": "uuid",
    "utilisateur_id": "uuid",
    "soundenabled": true,
    "soundfile": "/sounds/ding.mp3",
    "volume": 0.8,
    "vibration": false,
    "pushenabled": true,
    "emailenabled": false,
    "smsenabled": true,
    "datemodification": "2024-01-15T11:30:00Z"
  }
}
```

## 4. Réinitialiser aux préférences par défaut
**POST** `/reset`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Préférences réinitialisées aux valeurs par défaut",
  "data": {
    "idpreference": "uuid",
    "utilisateur_id": "uuid",
    "soundenabled": true,
    "soundfile": "/sounds/notification.mp3",
    "volume": 0.7,
    "vibration": true,
    "pushenabled": false,
    "emailenabled": true,
    "smsenabled": false,
    "datemodification": "2024-01-15T11:30:00Z"
  }
}
```

## 5. Supprimer les préférences
**DELETE** `/`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Préférences supprimées avec succès"
}
```

## Valeurs par défaut
- **soundenabled**: `true`
- **soundfile**: `/sounds/notification.mp3`
- **volume**: `0.7` (70%)
- **vibration**: `true`
- **pushenabled**: `false`
- **emailenabled**: `true`
- **smsenabled**: `false`

## Validation
- **volume**: Doit être entre 0 et 1
- **soundfile**: Doit commencer par `/sounds/`
- **Tous les champs booléens**: `true` ou `false`

## Codes d'erreur
- **400** : Données invalides (volume hors limites, etc.)
- **401** : Token d'accès requis
- **404** : Préférences non trouvées (pour DELETE)
- **500** : Erreur serveur

## Exemple d'utilisation Frontend

```javascript
// Récupérer les préférences
const getPreferences = async () => {
  const response = await fetch('/api/notifications/preferences', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Mettre à jour les préférences
const updatePreferences = async (preferences) => {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preferences)
  });
  return response.json();
};

// Réinitialiser aux valeurs par défaut
const resetPreferences = async () => {
  const response = await fetch('/api/notifications/preferences/reset', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## 6. Gestion des devices (push)

### Enregistrer un device
**POST** `/api/notifications/devices`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (JSON)
```json
{
  "platform": "FCM",
  "token": "test-device-token-123",
  "appVersion": "1.0.0",
  "deviceInfo": "Android 14, Pixel 7"
}
```

#### Réponse (201)
```json
{
  "message": "Device enregistré",
  "data": {
    "iddevice": "uuid",
    "utilisateur_id": "uuid",
    "platform": "FCM",
    "token": "test-device-token-123",
    "appversion": "1.0.0",
    "deviceinfo": "Android 14, Pixel 7",
    "datecreation": "2024-01-15T11:30:00Z",
    "datemodification": "2024-01-15T11:30:00Z"
  }
}
```

### Lister mes devices
**GET** `/api/notifications/devices`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "message": "Devices utilisateur",
  "data": [
    {
      "iddevice": "uuid",
      "utilisateur_id": "uuid",
      "platform": "FCM",
      "token": "test-device-token-123",
      "appversion": "1.0.0",
      "deviceinfo": "Android 14, Pixel 7",
      "datecreation": "2024-01-15T11:30:00Z",
      "datemodification": "2024-01-15T11:30:00Z"
    }
  ]
}
```

### Supprimer un device
**DELETE** `/api/notifications/devices/:token`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "success": true
}
```

## Plateformes supportées
- **FCM** : Firebase Cloud Messaging (Android)
- **APNS** : Apple Push Notification Service (iOS)
- **EXPO** : Expo Push Notifications
- **WEB** : Web Push Notifications
