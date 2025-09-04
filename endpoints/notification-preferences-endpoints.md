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
    "idPreference": "uuid",
    "utilisateur_id": "uuid",
    "soundEnabled": true,
    "soundFile": "/sounds/notification.mp3",
    "volume": 0.7,
    "vibration": true,
    "pushEnabled": false,
    "emailEnabled": true,
    "smsEnabled": false,
    "dateCreation": "2024-01-15T10:00:00Z",
    "dateModification": "2024-01-15T10:00:00Z"
  }
}
```

## 2. Mettre à jour les préférences
**PUT** `/`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON) - Tous les champs sont optionnels
```json
{
  "soundEnabled": true,
  "soundFile": "/sounds/ding.mp3",
  "volume": 0.8,
  "vibration": false,
  "pushEnabled": true,
  "emailEnabled": false,
  "smsEnabled": true
}
```

### Réponse (200)
```json
{
  "message": "Préférences mises à jour avec succès",
  "data": {
    "idPreference": "uuid",
    "utilisateur_id": "uuid",
    "soundEnabled": true,
    "soundFile": "/sounds/ding.mp3",
    "volume": 0.8,
    "vibration": false,
    "pushEnabled": true,
    "emailEnabled": false,
    "smsEnabled": true,
    "dateCreation": "2024-01-15T10:00:00Z",
    "dateModification": "2024-01-15T11:30:00Z"
  }
}
```

## 3. Réinitialiser aux préférences par défaut
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
    "idPreference": "uuid",
    "utilisateur_id": "uuid",
    "soundEnabled": true,
    "soundFile": "/sounds/notification.mp3",
    "volume": 0.7,
    "vibration": true,
    "pushEnabled": false,
    "emailEnabled": true,
    "smsEnabled": false,
    "dateCreation": "2024-01-15T10:00:00Z",
    "dateModification": "2024-01-15T11:30:00Z"
  }
}
```

## 4. Supprimer les préférences
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
- **soundEnabled**: `true`
- **soundFile**: `/sounds/notification.mp3`
- **volume**: `0.7` (70%)
- **vibration**: `true`
- **pushEnabled**: `false`
- **emailEnabled**: `true`
- **smsEnabled**: `false`

## Validation
- **volume**: Doit être entre 0 et 1
- **soundFile**: Doit commencer par `/sounds/`
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

## 5. Gestion des devices (push)

- Enregistrer un device
  - **POST** `/api/notifications/devices`
  - Body JSON:
  ```json
  {
    "platform": "EXPO",
    "token": "ExponentPushToken[xxx]",
    "appVersion": "1.0.0",
    "deviceInfo": "Android 14, Pixel 7"
  }
  ```

- Lister mes devices
  - **GET** `/api/notifications/devices`

- Supprimer un device
  - **DELETE** `/api/notifications/devices/:token`
