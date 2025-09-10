# 💬 API Endpoints - Messagerie
## Base URL
```
http://localhost:3000/api/messagerie
```

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

## Règles de Communication

### ✅ **Autorisées :**
- **Patient ↔ Médecin** : Communication directe
- **Patient ↔ AdminCabinet** : Support et questions
- **Médecin ↔ AdminCabinet** : Communication interne du cabinet
- **SuperAdmin ↔ Tous** : Support technique et annonces

### ❌ **Interdites :**
- **Patient ↔ Patient** : Pas de communication entre patients
- **Médecin ↔ Médecin** : Sauf via AdminCabinet
- **AdminCabinet ↔ AdminCabinet** : Communication via SuperAdmin

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

### Réponse (200)
```json
{
  "message": "Conversation récupérée avec succès",
  "data": {
    "idconversation": "uuid",
    "type_conversation": "PRIVEE",
    "titre": null,
    "cabinet_id": null,
    "participants": [
      {
        "idParticipant": "uuid",
        "utilisateur_id": "uuid",
        "role_participant": "MEMBRE",
        "dateRejointe": "2024-01-15T10:00:00Z",
        "actif": true,
        "utilisateur": {
          "idutilisateur": "uuid",
          "nom": "Dupont",
          "prenom": "Jean",
          "email": "jean.dupont@email.com",
          "role": "PATIENT"
        }
      }
    ],
    "dernier_message": null,
    "nombre_messages_non_lus": 0
  }
}
```

## 2. Récupérer les conversations de l'utilisateur
**GET** `/conversations`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Conversations récupérées avec succès",
  "data": [
    {
      "idconversation": "uuid",
      "type_conversation": "PRIVEE",
      "titre": null,
      "participants": [...],
      "dernier_message": {
        "idmessage": "uuid",
        "contenu": "Bonjour, j'ai une question...",
        "dateEnvoi": "2024-01-15T11:30:00Z",
        "expediteur": {
          "nom": "Martin",
          "prenom": "Dr. Marie"
        }
      },
      "nombre_messages_non_lus": 2
    }
  ]
}
```

## 3. Récupérer une conversation par ID
**GET** `/conversations/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Conversation récupérée avec succès",
  "data": {
    "idconversation": "uuid",
    "type_conversation": "PRIVEE",
    "participants": [...],
    "dernier_message": {...}
  }
}
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
{
  "participantId": "uuid"
}
```

### Réponse (200)
```json
{
  "message": "Participant ajouté avec succès",
  "data": {
    "idParticipant": "uuid",
    "conversation_id": "uuid",
    "utilisateur_id": "uuid",
    "role_participant": "MEMBRE",
    "dateRejointe": "2024-01-15T12:00:00Z",
    "actif": true
  }
}
```

## 5. Retirer un participant d'une conversation
**DELETE** `/conversations/:id/participants/:participantId`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Participant retiré avec succès"
}
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
{
  "conversation_id": "uuid",
  "contenu": "Bonjour, j'ai une question concernant mon rendez-vous",
  "type_message": "TEXTE",
  "reponse_a": "uuid"
}
```

2) Multipart (fichier)
- Content-Type: `multipart/form-data`
- form-data:
  - `conversation_id`: uuid
  - `file`: image/pdf/doc...

### Réponse (201)
```json
{
  "message": "Message envoyé avec succès",
  "data": {
    "idmessage": "uuid",
    "conversation_id": "uuid",
    "expediteur_id": "uuid",
    "contenu": "Bonjour, j'ai une question concernant mon rendez-vous",
    "type_message": "TEXTE",
    "dateenvoi": "2024-01-15T12:00:00Z",
    "expediteur": {
      "idutilisateur": "uuid",
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@email.com",
      "role": "PATIENT"
    },
    "lu_par": []
  }
}
```

## 7. Récupérer les messages d'une conversation
**GET** `/conversations/:id/messages?limit=50&offset=0`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `limit` (optionnel) : Nombre de messages à récupérer (défaut: 50)
- `offset` (optionnel) : Décalage pour la pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Messages récupérés avec succès",
  "data": [
    {
      "idmessage": "uuid",
      "conversation_id": "uuid",
      "expediteur_id": "uuid",
      "contenu": "Bonjour, j'ai une question...",
      "type_message": "TEXTE",
      "dateEnvoi": "2024-01-15T10:00:00Z",
      "expediteur": {
        "idutilisateur": "uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "role": "PATIENT"
      },
      "reponse_a_message": {
        "idmessage": "uuid",
        "contenu": "Message précédent",
        "expediteur": {
          "nom": "Martin",
          "prenom": "Dr. Marie"
        }
      },
      "lu_par": [
        {
          "idMessageLu": "uuid",
          "utilisateur_id": "uuid",
          "dateLecture": "2024-01-15T10:05:00Z",
          "utilisateur": {
            "nom": "Martin",
            "prenom": "Dr. Marie"
          }
        }
      ]
    }
  ]
}
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
{
  "contenu": "Message modifié"
}
```

### Réponse (200)
```json
{
  "message": "Message modifié avec succès",
  "data": {
    "idmessage": "uuid",
    "contenu": "Message modifié",
    "datemodification": "2024-01-15T12:30:00Z"
  }
}
```

## 9. Supprimer un message
**DELETE** `/messages/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Message supprimé avec succès"
}
```

## 10. Marquer une conversation comme lue
**POST** `/conversations/:id/read`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Conversation marquée comme lue",
  "data": {
    "messagesRead": 5
  }
}
```

## 11. Marquer un message comme lu
**POST** `/messages/:id/read`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Message marqué comme lu",
  "data": {
    "idMessageLu": "uuid",
    "message_id": "uuid",
    "utilisateur_id": "uuid",
    "dateLecture": "2024-01-15T12:00:00Z"
  }
}
```

## Types de Messages
- **TEXTE** : Message texte simple
- **IMAGE** : Message avec image
- **FICHIER** : Message avec fichier joint
- **SYSTEME** : Message système (notifications automatiques)

## Types de Conversations
- **PRIVEE** : Conversation entre 2 utilisateurs
- **GROUPE_CABINET** : Groupe pour un cabinet médical
- **SUPPORT** : Conversation de support avec SuperAdmin

## Permissions
- **Modifier/Supprimer** : Seulement ses propres messages
- **Ajouter participants** : AdminCabinet et SuperAdmin
- **Retirer participants** : Admin de conversation ou se retirer soi-même
- **SuperAdmin** : Toutes les permissions

## Codes d'erreur
- **400** : Champs manquants ou invalides
- **401** : Token d'accès requis
- **403** : Permissions insuffisantes
- **404** : Conversation/Message non trouvé
- **500** : Erreur serveur

## Événements Socket.IO
- **message:new** : Nouveau message reçu
- **message:read** : Message marqué comme lu
- **conversation:updated** : Conversation mise à jour
