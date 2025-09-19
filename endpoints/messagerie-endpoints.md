# 💬 API Endpoints - Messagerie
## Base URL
```
http://localhost:3000/api/messagerie
```

## Sécurité et Accès
- Authentification: `Bearer <token>` requise pour tous les endpoints.
- Règles de Communication (serveur):
  - **Patient ↔ Médecin**: AUTORISÉ uniquement si le patient est lié au médecin (au moins un RDV confirmé/en_cours/terminé OU une consultation existante entre eux).
  - **Patient ↔ AdminCabinet**: Autorisé.
  - **Médecin ↔ AdminCabinet**: Autorisé (même cabinet à raffiner si besoin).
  - **SuperAdmin**: Peut communiquer avec tous.
  - Interdits par défaut: **Patient↔Patient**, **Médecin↔Médecin** (hors groupe cabine), **AdminCabinet↔AdminCabinet** (hors canaux dédiés).

## Index (URLs complètes)
- POST  http://localhost:3000/api/messagerie/conversations/private
- GET   http://localhost:3000/api/messagerie/conversations
- GET   http://localhost:3000/api/messagerie/conversations/:id
- POST  http://localhost:3000/api/messagerie/conversations/:id/participants
- DELETE http://localhost:3000/api/messagerie/conversations/:id/participants/:participantId
- POST  http://localhost:3000/api/messagerie/conversations/:id/read
- POST  http://localhost:3000/api/messagerie/messages
- GET   http://localhost:3000/api/messagerie/conversations/:id/messages
- PUT   http://localhost:3000/api/messagerie/messages/:id
- DELETE http://localhost:3000/api/messagerie/messages/:id
- POST  http://localhost:3000/api/messagerie/messages/:id/read

## 1. Créer ou récupérer une conversation privée
**POST** `/conversations/private`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "participantId": "uuid"
}
```

### Notes d’accès
- Patient↔Médecin: refusé (403) si non liés.

### Réponse (200)
```json
{
  "message": "Conversation récupérée avec succès",
  "data": { /* conversation */ }
}
```

## 2. Récupérer les conversations de l'utilisateur
**GET** `/conversations`

### Headers
```
Authorization: Bearer <token)
```

### Réponse (200)
```json
{ "message": "Conversations récupérées avec succès", "data": [ /* ... */ ] }
```

## 3. Récupérer une conversation par ID
**GET** `/conversations/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{ "message": "Conversation récupérée avec succès", "data": { /* ... */ } }
```

## 4. Ajouter un participant à une conversation
**POST** `/conversations/:id/participants`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{ "participantId": "uuid" }
```

### Réponse (200)
```json
{ "message": "Participant ajouté avec succès", "data": { /* ... */ } }
```

## 5. Retirer un participant d'une conversation
**DELETE** `/conversations/:id/participants/:participantId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{ "message": "Participant retiré avec succès" }
```

## 6. Envoyer un message
**POST** `/messages`

### Headers
```
Authorization: Bearer <token>
```

### Deux modes
1) JSON (texte)
```json
{ "conversation_id": "uuid", "contenu": "Bonjour" }
```
2) Multipart (fichier)
- Content-Type: `multipart/form-data`
- form-data: `conversation_id`, `file`

### Réponse (201)
```json
{ "message": "Message envoyé avec succès", "data": { /* message */ } }
```

## 7. Récupérer les messages d'une conversation
**GET** `/conversations/:id/messages?limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{ "message": "Messages récupérés avec succès", "data": [ /* ... */ ] }
```

## 8. Modifier un message
**PUT** `/messages/:id`

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body (JSON)
```json
{ "contenu": "Message modifié" }
```

### Réponse (200)
```json
{ "message": "Message modifié avec succès", "data": { /* ... */ } }
```

## 9. Supprimer un message
**DELETE** `/messages/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{ "message": "Message supprimé avec succès" }
```

## 10. Marquer une conversation comme lue
**POST** `/conversations/:id/read`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{ "message": "Conversation marquée comme lue", "data": { "messagesRead": 5 } }
```

## 11. Marquer un message comme lu
**POST** `/messages/:id/read`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{ "message": "Message marqué comme lu", "data": { /* ... */ } }
```

## Événements Socket.IO
- Émis par le serveur
  - **new_message**: nouveau message dans `conversation:{conversationId}`
  - **conversation_read**: conversation marquée comme lue (émis à l'autre participant)
- Rooms utilisées automatiquement: `user:{userId}`, `role:{role}`; à l’ouverture d’une conversation, le client peut joindre `conversation:{conversationId}`.

### Exemple intégration client
```javascript
import { io } from 'socket.io-client';
const socket = io('http://<API_HOST>:3000', {
  transports: ['websocket'],
  auth: { token: jwtToken },
});

socket.on('message:new', payload => {
  // rafraîchir la conversation si correspondante
});

// Lors de l’ouverture d’une conversation
socket.emit('join-room', `conversation:${conversationId}`);
// et à la fermeture
socket.emit('leave-room', `conversation:${conversationId}`);
```

## Types de Messages
- **TEXTE**, **IMAGE**, **FICHIER**, **SYSTEME**, **VOICE**

## Types de Conversations
- **PRIVEE**, **GROUPE_CABINET**, **SUPPORT**

## Permissions
- Modifier/Supprimer: ses propres messages
- Ajouter participants: AdminCabinet, SuperAdmin
- Retirer participants: Admin de conversation ou soi-même
- SuperAdmin: toutes permissions

## Codes d'erreur
- 400, 401, 403, 404, 500
