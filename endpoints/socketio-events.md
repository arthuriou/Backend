# 🔌 Socket.IO Events - Temps Réel

## Connexion
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Événements Écoutés (Client)

### 1. Rendez-vous
```javascript
// Nouveau rendez-vous créé
socket.on('rendezvous:created', (data) => {
  console.log('Rendez-vous créé:', data);
  // data: { type: 'success', message: '...', data: rendezVous }
});

// Rendez-vous confirmé
socket.on('rendezvous:confirmed', (data) => {
  console.log('Rendez-vous confirmé:', data);
});

// Rendez-vous annulé
socket.on('rendezvous:cancelled', (data) => {
  console.log('Rendez-vous annulé:', data);
});

// Nouveau rendez-vous (pour les médecins)
socket.on('rendezvous:new', (data) => {
  console.log('Nouveau rendez-vous en attente:', data);
});
```

### 2. Créneaux
```javascript
// Conflit de créneau
socket.on('creneau:conflict', (data) => {
  console.log('Créneau non disponible:', data);
  // data: { type: 'error', message: 'Ce créneau n\'est plus disponible', data: creneau }
});

// Nouveau créneau disponible
socket.on('creneau:available', (data) => {
  console.log('Nouveau créneau disponible:', data);
});
```

### 3. Messagerie
```javascript
// Nouveau message
socket.on('message:new', (data) => {
  console.log('Nouveau message:', data);
});

// Message lu
socket.on('message:read', (data) => {
  console.log('Message lu:', data);
});
```

### 4. Notifications
```javascript
// Notification générale
socket.on('notification:general', (data) => {
  console.log('Notification:', data);
});

// Rappel de rendez-vous
socket.on('rappel:reminder', (data) => {
  console.log('Rappel:', data);
});
```

## Événements Émis (Client)

### 1. Rejoindre/Quitter des rooms
```javascript
// Rejoindre une room
socket.emit('join-room', 'conversation:123');

// Quitter une room
socket.emit('leave-room', 'conversation:123');
```

## Rooms Automatiques

### Par Utilisateur
- `user:{userId}` - Room personnelle de l'utilisateur
- `patient:{userId}` - Room du patient
- `medecin:{userId}` - Room du médecin
- `admincabinet:{userId}` - Room de l'admin de cabinet

### Par Rôle
- `role:PATIENT` - Tous les patients
- `role:MEDECIN` - Tous les médecins
- `role:ADMINCABINET` - Tous les admins de cabinet
- `role:SUPERADMIN` - Tous les super admins

### Par Conversation
- `conversation:{conversationId}` - Room de conversation

## Exemple d'Utilisation Frontend

```javascript
// Connexion avec authentification
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('jwt-token')
  }
});

// Gestion des événements
socket.on('connect', () => {
  console.log('Connecté au serveur temps réel');
});

socket.on('disconnect', () => {
  console.log('Déconnecté du serveur');
});

// Écouter les notifications de rendez-vous
socket.on('rendezvous:created', (data) => {
  if (data.type === 'success') {
    showNotification('Rendez-vous créé avec succès', 'success');
  }
});

socket.on('rendezvous:confirmed', (data) => {
  showNotification('Votre rendez-vous a été confirmé', 'success');
});

socket.on('creneau:conflict', (data) => {
  showNotification('Ce créneau n\'est plus disponible', 'error');
  // Recharger les créneaux disponibles
  refreshAvailableSlots();
});

// Rejoindre une conversation
socket.emit('join-room', `conversation:${conversationId}`);

socket.on('message:new', (data) => {
  addMessageToChat(data.data);
});
```

## Gestion des Erreurs

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Token d\'authentification requis') {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  } else if (error.message === 'Token invalide') {
    // Rafraîchir le token
    refreshToken();
  }
});
```

## Types de Notifications

### Types
- `success` - Succès (vert)
- `info` - Information (bleu)
- `warning` - Avertissement (orange)
- `error` - Erreur (rouge)

### Structure
```javascript
{
  type: 'success|info|warning|error',
  message: 'Message à afficher',
  data: { /* Données supplémentaires */ }
}
```

## Sécurité

- ✅ Authentification JWT requise
- ✅ Vérification des permissions par rôle
- ✅ Rooms sécurisées par utilisateur
- ✅ Validation des tokens côté serveur

## Performance

- ✅ Connexions persistantes
- ✅ Rooms optimisées
- ✅ Événements ciblés
- ✅ Gestion automatique des déconnexions
