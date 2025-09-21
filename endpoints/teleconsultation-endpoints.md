# 🎥 API Endpoints - Téléconsultation

## Base URL
```
http://localhost:3000/api/rendezvous
```

## Vue d'ensemble

Cette API permet de gérer les téléconsultations et le workflow complet des consultations (présentiel + téléconsultation).

## Workflow complet

### Présentiel
```
RDV CONFIRME → Patient arrive → EN_ATTENTE_CONSULTATION → EN_COURS → TERMINE
```

### Téléconsultation
```
RDV CONFIRME → EN_COURS (via lien vidéo) → TERMINE
```

## Endpoints

### 1. Créer un rendez-vous (avec type)
**POST** `/`

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Body (JSON) - Présentiel
```json
{
  "patient_id": "uuid",
  "medecin_id": "uuid",
  "dateheure": "2025-01-20T14:00:00Z",
  "duree": 30,
  "motif": "Consultation de routine",
  "type_rdv": "PRESENTIEL",
  "adresse_cabinet": "123 Rue de la Paix, Lomé"
}
```

#### Body (JSON) - Téléconsultation
```json
{
  "patient_id": "uuid",
  "medecin_id": "uuid",
  "dateheure": "2025-01-20T14:00:00Z",
  "duree": 30,
  "motif": "Consultation de routine",
  "type_rdv": "TELECONSULTATION"
}
```

#### Réponse (201)
```json
{
  "message": "Rendez-vous créé avec succès",
  "data": {
    "idrendezvous": "uuid",
    "patient_id": "uuid",
    "medecin_id": "uuid",
    "dateheure": "2025-01-20T14:00:00Z",
    "duree": 30,
    "motif": "Consultation de routine",
    "statut": "EN_ATTENTE",
    "type_rdv": "TELECONSULTATION",
    "lien_video": "https://meet.jit.si/rdv-uuid-abc123?jwt=...",
    "salle_virtuelle": "rdv-uuid-abc123",
    "token_acces": "jwt-token-here"
  }
}
```

### 2. Récupérer les informations de téléconsultation
**GET** `/:id/teleconsultation`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "message": "Informations de téléconsultation récupérées",
  "data": {
    "salle_virtuelle": "rdv-uuid-abc123",
    "lien_video": "https://meet.jit.si/rdv-uuid-abc123?jwt=...",
    "token_acces": "jwt-token-here",
    "date_expiration": "2025-01-20T15:00:00Z"
  }
}
```

#### Réponse (404)
```json
{
  "message": "Informations de téléconsultation non trouvées"
}
```

### 3. Commencer une consultation
**PUT** `/:id/commencer-consultation`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "message": "Consultation démarrée avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "EN_COURS"
  }
}
```

### 4. Clôturer une consultation
**PUT** `/:id/cloturer-consultation`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "message": "Consultation clôturée avec succès",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "TERMINE"
  }
}
```

### 5. Marquer un patient comme arrivé (présentiel)
**PUT** `/:id/patient-arrive`

#### Headers
```
Authorization: Bearer <token>
```

#### Réponse (200)
```json
{
  "message": "Patient marqué comme arrivé",
  "data": {
    "rendezvous_id": "uuid",
    "statut": "EN_ATTENTE_CONSULTATION"
  }
}
```

## Statuts des rendez-vous

- `EN_ATTENTE` : Rendez-vous créé, en attente de confirmation
- `CONFIRME` : Rendez-vous confirmé par le médecin
- `EN_ATTENTE_CONSULTATION` : Patient arrivé au cabinet (présentiel)
- `EN_COURS` : Consultation en cours
- `TERMINE` : Consultation terminée
- `ANNULE` : Rendez-vous annulé

## Types de rendez-vous

- `PRESENTIEL` : Consultation en cabinet
- `TELECONSULTATION` : Consultation en ligne

## Notifications automatiques

### Téléconsultation
- **Création** : Notification avec lien vidéo
- **24h avant** : Rappel par email
- **10 min avant** : Rappel push avec lien vidéo
- **Début** : Notification "Consultation démarrée"
- **Fin** : Notification "Consultation terminée"

### Présentiel
- **Création** : Notification standard
- **24h avant** : Rappel par email
- **Arrivée** : Notification "Patient arrivé"
- **Début** : Notification "Consultation démarrée"
- **Fin** : Notification "Consultation terminée"

## Événements Socket.IO

### Nouveaux événements
- `consultation:started` : Consultation démarrée
- `consultation:ended` : Consultation terminée
- `patient:arrived` : Patient arrivé au cabinet

### Exemple d'utilisation
```javascript
socket.on('consultation:started', (data) => {
  console.log('Consultation démarrée:', data);
  // data.rendezvous_id, data.type
});

socket.on('consultation:ended', (data) => {
  console.log('Consultation terminée:', data);
  // Rediriger vers la page d'ordonnance
});
```

## Configuration Jitsi

### Variables d'environnement
```env
JITSI_DOMAIN=meet.jit.si
JITSI_APP_ID=your-app-id
JITSI_SECRET=your-secret-key
```

### Configuration par défaut
- **Domaine** : `meet.jit.si` (gratuit)
- **Durée salle** : 60 minutes
- **Audio** : Désactivé par défaut
- **Vidéo** : Activé par défaut
- **Page d'accueil** : Désactivée
- **Pré-join** : Désactivé

## Sécurité

### Tokens d'accès
- **JWT** : Si `JITSI_SECRET` configuré
- **Token simple** : Hash SHA256 sinon
- **Expiration** : 1 heure par défaut
- **Validation** : Vérification du `rendezvous_id`

### Permissions
- **Patient** : Peut commencer sa consultation
- **Médecin** : Peut commencer/clôturer toutes ses consultations
- **AdminCabinet** : Peut marquer les patients comme arrivés

## Exemples d'utilisation

### Frontend - Rejoindre une téléconsultation
```javascript
// Récupérer les infos de téléconsultation
const response = await fetch(`/api/rendezvous/${rdvId}/teleconsultation`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();

// Ouvrir le lien vidéo
window.open(data.lien_video, '_blank');
```

### Frontend - Démarrer une consultation
```javascript
// Démarrer la consultation
await fetch(`/api/rendezvous/${rdvId}/commencer-consultation`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Frontend - Clôturer une consultation
```javascript
// Clôturer la consultation
await fetch(`/api/rendezvous/${rdvId}/cloturer-consultation`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Gestion des erreurs

### Erreurs communes
- `400` : Rendez-vous non confirmé
- `401` : Non authentifié
- `403` : Pas les permissions
- `404` : Rendez-vous non trouvé
- `500` : Erreur serveur

### Messages d'erreur
```json
{
  "message": "Le rendez-vous doit être confirmé pour commencer la consultation"
}
```
