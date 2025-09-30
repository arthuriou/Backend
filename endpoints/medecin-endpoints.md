# Endpoints Médecin (API Backend)

Ce document regroupe tous les endpoints utilisables par un utilisateur avec le rôle `MEDECIN`. Chaque entrée inclut: méthode, URL, auth/role requis, description, body/query, réponse type et contexte d’utilisation.

Notes générales:
- Auth: JWT requis via `Authorization: Bearer <token>` sauf si indiqué public.
- Formats: JSON, horodatages en ISO8601.
- Rôles: certains endpoints sont partagés avec `ADMINCABINET`.


## 1) Auth / Profil

### GET /api/auth/profile
- Auth: Oui (MEDECIN)
- Description: Récupérer le profil utilisateur (incl. informations médecin si liées)
- Query/Body: —
- Réponse (200):
```json
{
  "message": "Profil récupéré avec succès",
  "data": {
    "user": { "idutilisateur": "...", "email": "...", "nom": "...", "prenom": "...", "photoprofil": "..." },
    "role": "MEDECIN",
    "medecin": { "idmedecin": "...", "experience": 5, "biographie": "...", "specialites": [ ... ] }
  }
}
```
- Contexte: écran Compte/Profil médecin, header utilisateur.

### PATCH /api/auth/profile/medecin
- Auth: Oui (MEDECIN)
- Description: Mise à jour partielle du profil médecin
- Body:
```json
{
  "experience": 7,
  "biographie": "Cardiologue, 10 ans d'expérience",
  "specialiteIds": ["<uuid>", "<uuid>"]
}
```
- Réponse (200):
```json
{ "message": "Profil médecin mis à jour", "data": { "idmedecin": "...", "experience": 7, "biographie": "..." } }
```
- Contexte: paramètres du compte, onboarding médecin.


## 2) Agenda (Gestion type Doctolib Pro)
Base route: `/api/agenda`

### GET /api/agenda/mine
- Auth: Oui (MEDECIN)
- Description: Lister mes agendas (par cabinet si multi-sites)
- Réponse (200):
```json
{ "data": [ { "id": "...", "cabinet_id": "...", "titre": "Agenda Cabinet A", "visible_en_ligne": true } ] }
```
- Contexte: page Agenda -> sélection d’agenda.

### GET /api/agenda/:id
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Détails d’un agenda
- Réponse (200):
```json
{ "data": { "id": "...", "cabinet_id": "...", "regles": [ ... ], "blocks": [ ... ], "extras": [ ... ], "visible_en_ligne": true } }
```

### PATCH /api/agenda/:id
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Modifier propriétés d’un agenda
- Body (exemple):
```json
{ "visible_en_ligne": true, "titre": "Agenda Principal" }
```
- Réponse (200): `{ "message": "Agenda mis à jour", "data": { ... } }`

### POST /api/agenda/:id/rules
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Créer une règle de récurrence (disponibilités)
- Body:
```json
{
  "jour_semaine": [1,2,3,4,5],
  "heure_debut": "08:00",
  "heure_fin": "17:00",
  "duree_creneau_min": 20,
  "type": "PRESENTIEL" // ou "TELECONSULT"
}
```
- Réponse (201): `{ "data": { "id": "...", "jour_semaine": [1,2,3,4,5], ... } }`

### GET /api/agenda/:id/rules
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Lister les règles
- Réponse (200): `{ "data": [ { "id": "...", ... } ] }`

### DELETE /api/agenda/:id/rules/:ruleId
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Supprimer une règle
- Réponse (200): `{ "message": "Règle supprimée" }`

### POST /api/agenda/:id/blocks
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Créer une indisponibilité (blocage)
- Body:
```json
{ "debut": "2025-10-02T09:00:00Z", "fin": "2025-10-02T12:00:00Z", "motif": "Congé" }
```
- Réponse (201): `{ "data": { "id": "...", "debut": "...", "fin": "..." } }`

### GET /api/agenda/:id/blocks?start=...&end=...
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Lister les blocs dans une période
- Réponse (200): `{ "data": [ { "id": "...", "debut": "...", "fin": "..." } ] }`

### DELETE /api/agenda/:id/blocks/:blockId
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Supprimer un bloc
- Réponse (200): `{ "message": "Bloc supprimé" }`

### POST /api/agenda/:id/extra
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Ajouter une dispo ponctuelle
- Body:
```json
{ "debut": "2025-10-03T14:00:00Z", "fin": "2025-10-03T17:00:00Z", "type": "PRESENTIEL" }
```
- Réponse (201): `{ "data": { "id": "...", "debut": "...", "fin": "..." } }`

### GET /api/agenda/:id/extra?start=...&end=...
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Lister les extras
- Réponse (200): `{ "data": [ { "id": "..." } ] }`

### DELETE /api/agenda/:id/extra/:extraId
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Supprimer un extra
- Réponse (200): `{ "message": "Extra supprimé" }`

### GET /api/agenda/:id/slots?start=...&end=...&type=PRESENTIEL|TELECONSULT
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Slots calculés (interne)
- Réponse (200): `{ "data": [ { "debut": "...", "fin": "..." } ] }`

### GET /api/agenda/:id/slots/public?start=...&end=...&type=...
- Auth: Non (PUBLIC)
- Description: Slots publics visibles pour les patients
- Réponse (200): idem ci-dessus


## 3) Rendez-vous (workflow médecin)
Base route: `/api/rendezvous`

### GET /api/rendezvous/medecin/:medecinId
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Lister les RDV d’un médecin
- Réponse (200): `{ "data": [ { "id": "...", "statut": "CONFIRME", "type": "PRESENTIEL|TELECONSULT" } ] }`

### GET /api/rendezvous/en-attente-consultation
- Auth: Oui (MEDECIN)
- Description: RDV en statut "EN_ATTENTE_CONSULTATION"
- Réponse (200): `{ "data": [ { "id": "...", "heure": "..." } ] }`

### GET /api/rendezvous/en-cours
- Auth: Oui (MEDECIN)
- Description: RDV en cours ("EN_COURS")
- Réponse (200): `{ "data": [ { "id": "..." } ] }`

### GET /api/rendezvous/aujourd-hui
- Auth: Oui (MEDECIN)
- Description: RDV du jour
- Réponse (200): `{ "data": [ ... ] }`

### GET /api/rendezvous/cette-semaine
- Auth: Oui (MEDECIN)
- Description: RDV de la semaine
- Réponse (200): `{ "data": [ ... ] }`

### PUT /api/rendezvous/:id/confirmer
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Confirmer un RDV
- Body:
```json
{ "commentaire": "Ok pour 15h" }
```
- Réponse (200): `{ "message": "Rendez-vous confirmé", "data": { "id": "...", "statut": "CONFIRME" } }`

### PUT /api/rendezvous/:id/annuler
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Annuler un RDV
- Body:
```json
{ "motif": "Indisponibilité" }
```
- Réponse (200): `{ "message": "Rendez-vous annulé", "data": { "id": "...", "statut": "ANNULE" } }`

### PUT /api/rendezvous/:id/terminer
- Auth: Oui (MEDECIN, ADMINCABINET)
- Description: Terminer un RDV
- Body: `{}`
- Réponse (200): `{ "message": "Rendez-vous terminé", "data": { "id": "...", "statut": "TERMINE" } }`

### GET /api/rendezvous/:id/teleconsultation
- Auth: Oui (MEDECIN, PATIENT)
- Description: Détails téléconsultation (lien/jitsi/token si applicable)
- Réponse (200): `{ "data": { "room": "...", "joinUrl": "...", "expireAt": "..." } }`

### PUT /api/rendezvous/:id/commencer-consultation
- Auth: Oui (MEDECIN, PATIENT)
- Description: Marque la consultation démarrée (présentiel ou télé)
- Body: `{}`
- Réponse (200): `{ "message": "Consultation démarrée", "data": { "statut": "EN_COURS" } }`

### PUT /api/rendezvous/:id/cloturer-consultation
- Auth: Oui (MEDECIN)
- Description: Clôture la consultation (généralement après ordonnance/notes)
- Body: `{}`
- Réponse (200): `{ "message": "Consultation clôturée", "data": { "statut": "TERMINE" } }`


## 4) Messagerie (règles patient-médecin)
Base route: `/api/messagerie`

### POST /api/messagerie/conversations/private
- Auth: Oui
- Description: Créer ou récupérer une conversation privée (respect règles RDV)
- Body:
```json
{ "participantId": "<id_utilisateur_autre>" }
```
- Réponse (200): `{ "data": { "idconversation": "...", "participants": [ ... ], "dernierMessage": { ... } } }`
- Contexte: bouton "Contacter le patient" depuis un RDV ou fiche patient.

### GET /api/messagerie/conversations
- Auth: Oui
- Description: Lister mes conversations
- Réponse (200): `{ "data": [ { "idconversation": "...", "lastMessage": { "contenu": "..." } } ] }`

### GET /api/messagerie/conversations/:id
- Auth: Oui
- Description: Détails d’une conversation
- Réponse (200): `{ "data": { "idconversation": "...", "messagesCount": 52, ... } }`

### GET /api/messagerie/conversations/:id/messages?limit=50&offset=0
- Auth: Oui
- Description: Lister messages d’une conversation (contenu renvoyé en clair, chiffré en base)
- Réponse (200): `{ "data": [ { "idmessage": "...", "contenu": "Bonjour" } ] }`

### POST /api/messagerie/messages
- Auth: Oui
- Description: Envoyer un message (texte/fichier)
- Body (texte):
```json
{ "conversation_id": "<uuid>", "contenu": "Bonjour" }
```
- Body (fichier multipart): `file` (binaire) + `conversation_id`
- Réponse (201): `{ "data": { "idmessage": "...", "contenu": "Bonjour" } }`

### PUT /api/messagerie/messages/:id
- Auth: Oui
- Description: Modifier un message
- Body:
```json
{ "contenu": "Message édité" }
```
- Réponse (200): `{ "data": { "idmessage": "...", "contenu": "Message édité" } }`

### DELETE /api/messagerie/messages/:id
- Auth: Oui
- Description: Supprimer un message
- Réponse (200): `{ "message": "Message supprimé" }`

### POST /api/messagerie/messages/:id/read
- Auth: Oui
- Description: Marquer un message comme lu
- Réponse (200): `{ "message": "Message marqué comme lu" }`


## 5) Ordonnances
Base route: `/api/ordonnances`

### POST /api/ordonnances
- Auth: Oui (MEDECIN)
- Description: Créer une ordonnance pour un RDV/consultation
- Body:
```json
{ "rendezvous_id": "<uuid>", "contenu": "PDF ou data structurée", "notes": "posologie..." }
```
- Réponse (201): `{ "data": { "idordonnance": "..." } }`

### GET /api/ordonnances/medecin/:medecinId
- Auth: Oui (MEDECIN)
- Description: Lister mes ordonnances
- Réponse (200): `{ "data": [ { "idordonnance": "...", "rendezvous_id": "..." } ] }`

### GET /api/ordonnances/:id
- Auth: Oui
- Description: Détail d’une ordonnance
- Réponse (200): `{ "data": { "idordonnance": "...", "contenu": "..." } }`


## 6) Dossier médical (accès via patient propriétaire)
Base route: `/api/dossier-medical`

Remarque: Par défaut, les documents appartiennent au patient. Un médecin ne peut y accéder que via des endpoints patient-side ou des partages explicites. Ci-dessous endpoints utiles pour debug/flux patient.

### GET /api/dossier-medical/:dossierId/documents
- Auth: Oui
- Description: Lister documents du dossier (côté patient)
- Réponse (200): `{ "data": [ { "iddocument": "...", "url": "..." } ] }`

### GET /api/dossier-medical/documents/:id/view
- Auth: Oui
- Description: Proxy d’affichage sécurisé (Cloudinary signé)
- Réponse (200): binaire/stream

### POST /api/dossier-medical/documents (multipart)
- Auth: Oui
- Description: Ajouter un document (côté patient). Corps: `file`
- Réponse (201): `{ "data": { "iddocument": "...", "nom": "..." } }`


## 7) Notifications
Base route: `/api/notifications/history`

### GET /api/notifications/history
- Auth: Oui
- Description: Lister mes notifications
- Query: `page`, `limit`, `type_notification`, `lu`, `date_debut`, `date_fin`
- Réponse (200):
```json
{
  "message": "Notifications récupérées avec succès",
  "data": {
    "notifications": [ { "id": "...", "type_notification": "RAPPEL_RDV", "lu": false } ],
    "total": 22,
    "page": 1,
    "limit": 20,
    "stats": { "non_lues": 5, "total": 22 }
  }
}
```

### POST /api/notifications/history/mark-all-read
- Auth: Oui
- Description: Tout marquer comme lu
- Réponse (200): `{ "message": "Toutes les notifications ont été marquées comme lues" }`


## 8) Recherche de patients (via spécialités)
Base route: `/api/specialites`

### GET /api/specialites/medecins/search?q=&specialite_id=&cabinet_id=&limit=&offset=
- Auth: Oui
- Description: Recherche globale optimisée de médecins (utile pour collaborations/cabinets)
- Réponse (200): `{ "data": [ { "idmedecin": "...", "specialites": [ ... ] } ] }`


## Erreurs courantes
- 400: champ manquant/format invalide
- 401: token invalide/absent
- 403: rôle insuffisant ou accès dossier non autorisé
- 404: ressource introuvable
- 500: erreur serveur


## En-têtes requis (typique)
```
Authorization: Bearer <jwt>
Content-Type: application/json
```
Pour upload: `multipart/form-data`.

## Annexes — Exemples de réponses détaillés (schémas JSON)

### A) Schéma Rendez-vous (RendezVous)
```json
{
  "id": "b2a1c3e4-5678-49ab-9012-3456789abcde",
  "patient": {
    "idpatient": "a1b2c3d4-1111-2222-3333-444455556666",
    "nom": "Kouadio",
    "prenom": "Marc",
    "email": "patient@example.com",
    "telephone": "+2250700000000"
  },
  "medecin": {
    "idmedecin": "d4c3b2a1-9999-8888-7777-666655554444",
    "nom": "Martin",
    "prenom": "Dr Pierrot",
    "email": "doc@example.com"
  },
  "cabinet": {
    "idcabinet": "11112222-3333-4444-5555-666677778888",
    "nom": "Cabinet SantéA",
    "adresse": "Plateau, Abidjan"
  },
  "type": "PRESENTIEL", // ou "TELECONSULT"
  "statut": "CONFIRME", // EN_ATTENTE, EN_ATTENTE_CONSULTATION, EN_COURS, TERMINE, ANNULE
  "date_heure_debut": "2025-10-02T14:00:00Z",
  "date_heure_fin": "2025-10-02T14:20:00Z",
  "adresse_cabinet": "Plateau, Abidjan", // présentiel uniquement
  "teleconsultation": {
    "room": "santeafrik-3f9e...",
    "joinUrl": "https://meet.jit.si/santeafrik-3f9e...",
    "expireAt": "2025-10-02T15:00:00Z"
  },
  "notes_medecin": "Prévoir bilan sanguin",
  "created_at": "2025-09-28T12:00:00Z",
  "updated_at": "2025-09-28T12:30:00Z"
}
```

### B) Schéma Agenda et composants
- Agenda
```json
{
  "id": "2a7f...",
  "cabinet_id": "1111...",
  "titre": "Agenda Principal",
  "visible_en_ligne": true,
  "regles": [
    { "id": "r1", "jour_semaine": [1,2,3,4,5], "heure_debut": "08:00", "heure_fin": "17:00", "duree_creneau_min": 20, "type": "PRESENTIEL" }
  ],
  "blocks": [
    { "id": "b1", "debut": "2025-10-02T09:00:00Z", "fin": "2025-10-02T12:00:00Z", "motif": "Congé" }
  ],
  "extras": [
    { "id": "e1", "debut": "2025-10-03T14:00:00Z", "fin": "2025-10-03T17:00:00Z", "type": "PRESENTIEL" }
  ]
}
```
- Slot calculé
```json
{ "debut": "2025-10-02T13:40:00Z", "fin": "2025-10-02T14:00:00Z", "type": "PRESENTIEL", "disponible": true }
```

### C) Schéma Conversation et Message (contenu chiffré en base, renvoyé en clair)
- Conversation
```json
{
  "idconversation": "c0f1...",
  "type_conversation": "PRIVEE",
  "participants": [
    { "idutilisateur": "u1", "role": "MEDECIN", "nom": "Dr Pierrot" },
    { "idutilisateur": "u2", "role": "PATIENT", "nom": "Marc" }
  ],
  "dernierMessage": {
    "idmessage": "m99",
    "contenu": "Bonjour", // renvoyé en clair, stocké chiffré
    "date_envoi": "2025-09-29T09:00:00Z",
    "lu": false,
    "expediteur_id": "u2"
  },
  "messagesCount": 52,
  "created_at": "2025-09-25T10:00:00Z"
}
```
- Message
```json
{
  "idmessage": "m100",
  "conversation_id": "c0f1...",
  "type_message": "TEXTE", // ou FICHIER
  "contenu": "Merci docteur", // renvoyé en clair, chiffré en DB
  "fichier_url": null,
  "fichier_nom": null,
  "fichier_taille": null,
  "reponse_a": null,
  "expediteur_id": "u1",
  "date_envoi": "2025-09-29T09:05:00Z",
  "lu": true
}
```

### D) Schéma Ordonnance
```json
{
  "idordonnance": "o-12345",
  "rendezvous_id": "b2a1c3e4-...",
  "medecin_id": "d4c3b2a1-...",
  "patient_id": "a1b2c3d4-...",
  "contenu": "<base64-pdf-ou-json>",
  "notes": "Paracetamol 1g si douleur",
  "date_emission": "2025-09-29T10:00:00Z"
}
```

### E) Schéma Notification
```json
{
  "id": "n1",
  "utilisateur_id": "u1",
  "type_notification": "RAPPEL_RDV",
  "titre": "Rappel de rendez-vous",
  "message": "RDV aujourd'hui à 14:00",
  "date_envoi": "2025-09-29T08:00:00Z",
  "lu": false,
  "actif": true
}
```
