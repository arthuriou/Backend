# 📋 API Endpoints - Comptes-rendus de Consultations (CR)

Base: `http://localhost:3000/api/consultations`
Auth: `Authorization: Bearer <token>`

## ⚠️ MODULE CONSULTATIONS

Ce module permet la création et gestion des comptes-rendus de consultations médicales avec système de templates pour accélérer la rédaction médicale.

**⚡ Actions rapides :**
- 🏥 Créer CR depuis rendez-vous
- 📝 Rédiger CR avec templates spécialisés
- 🔒 Finaliser CR (non modifiable après)
- 📄 Consulter historique des consultations

---

## Sécurité et Accès (RBAC + Règles métier)
- Authentification: `Bearer <token>` obligatoire sauf endpoints publics
- Rôles: `PATIENT`, `MEDECIN`, `ADMINCABINET`, `SUPERADMIN`
- Accès par endpoint:
  - Création/Modification: `MEDECIN` propriétaire uniquement
  - Lecture: `MEDECIN` propriétaire, `PATIENT` propriétaire (CR finalisés seulement), `ADMINCABINET`/`SUPERADMIN`
  - Finalisation: `MEDECIN` propriétaire uniquement (statut BROUILLON requis)

---

## Index (URLs complètes)
- POST  http://localhost:3000/api/consultations/                          # Créer CR depuis RDV
- POST  http://localhost:3000/api/consultations/from-template            # Créer CR depuis template
- GET   http://localhost:3000/api/consultations/:id                      # Consulter CR spécifique
- GET   http://localhost:3000/api/consultations/medecin/:medecinId       # CR du médecin
- GET   http://localhost:3000/api/consultations/patient/:patientId       # CR du patient
- GET   http://localhost:3000/api/consultations/rendezvous/:rendezvousId # CR d'un RDV
- PATCH http://localhost:3000/api/consultations/:id                      # Modifier CR (BROUILLON)
- PUT   http://localhost:3000/api/consultations/:id/finalize             # Finaliser CR
- DELETE http://localhost:3000/api/consultations/:id                     # Archiver CR
- POST  http://localhost:3000/api/consultations/templates                # Créer template
- GET   http://localhost:3000/api/consultations/templates/specialite/:specialite # Templates par spécialité
- GET   http://localhost:3000/api/consultations/templates                # Tous les templates
- DELETE http://localhost:3000/api/consultations/templates/:id           # Supprimer template

---

## 1. Créer un compte-rendu depuis un rendez-vous
**POST** `/`

### Headers
```
Authorization: Bearer <token> (MEDECIN uniquement)
Content-Type: application/json
```

### Body (JSON)
```json
{
  "rendezvous_id": "uuid-du-rendezvous",
  "diagnostique": "Patient présente une toux sèche persistante",
  "antecedents": "Allergies aux pollens saisonniers",
  "traitement_propose": "Traitement symptomatique",
  "prescriptions": "Voir ordonnance associée",
  "observations": "Température: 37.2°C. Fréquence cardiaque normale.",
  "recommandations": "Eviter les irritants respiratoires",
  "examens_complementaires": "Radio de thorax si persistance",
  "date_consultation": "2025-01-15",
  "template_utilise": "uuid-template" // Optionnel
}
```

### Réponse (201) - Succès
```json
{
  "message": "Consultation créée avec succès",
  "data": {
    "idconsultation": "uuid",
    "rendezvous_id": "uuid-rdv",
    "medecin_id": "uuid-medecin",
    "patient_id": "uuid-patient",
    "diagnostique": "Patient présente une toux sèche persistante",
    "statut": "BROUILLON",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Réponse (403) - Accès refusé
```json
{
  "message": "Vous n'êtes pas le médecin de ce rendez-vous"
}
```

### Réponse (400) - Rendez-vous déjà traité
```json
{
  "message": "Une consultation existe déjà pour ce rendez-vous"
}
```

---

## 2. Créer un CR depuis un template
**POST** `/from-template`

### Headers
```
Authorization: Bearer <token> (MEDECIN)
Content-Type: application/json
```

### Body (JSON)
```json
{
  "rendezvous_id": "uuid-rendezvous",
  "template_id": "uuid-template-cardiologie"
}
```

### Réponse (201)
```json
{
  "message": "Consultation créée depuis le template",
  "data": {
    "idconsultation": "uuid",
    "rendezvous_id": "uuid-rdv",
    "diagnostique": "Rythme cardiaque regulier. Pas de douleur thoracique.",
    "traitement_propose": "Regime alimentaire adapte et exercice physique regulier.",
    "template_utilise": "uuid-template-cardiologie"
  }
}
```

---

## 3. Récupérer un compte-rendu spécifique
**GET** `/:id`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Consultation récupérée avec succès",
  "data": {
    "idconsultation": "uuid",
    "rendezvous_id": "uuid-rdv",
    "medecin_id": "uuid-medecin",
    "patient_id": "uuid-patient",
    "diagnostique": "Patient présente une toux sèche persistante",
    "antecedents": "Allergies aux pollens saisonniers",
    "traitement_propose": "Traitement symptomatique",
    "prescriptions": "Voir ordonnance associée",
    "observations": "Température: 37.2°C. Fréquence cardiaque normale.",
    "recommandations": "Eviter les irritants respiratoires",
    "examens_complementaires": "Radio de thorax si persistance",
    "statut": "BROUILLON",
    "template_utilise": "uuid-template",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:45:00Z",
    "finalise_le": null
  }
}
```

---

## 4. Récupérer les CR d'un médecin
**GET** `/medecin/:medecinId`

### Query Parameters
- `limit` (optionnel): Nombre maximum de résultats (défaut: 50)
- `offset` (optionnel): Décalage pour pagination (défaut: 0)

### Réponse (200)
```json
{
  "message": "Consultations récupérées avec succès",
  "data": [
    {
      "idconsultation": "uuid",
      "diagnostique": "Patient présente une toux sèche persistante",
      "statut": "BROUILLON",
      "created_at": "2025-01-15T10:30:00Z",
      "patient_nom": "Dupont",
      "patient_prenom": "Marie"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## 5. Récupérer les CR d'un patient
**GET** `/patient/:patientId`

### Headers
```
Authorization: Bearer <token> (PATIENT propriétaire, MEDECIN, ADMINCABINET, SUPERADMIN)
```

### Note importante
Les patients ne voient que les consultations **finalisées** (statut ≠ BROUILLON).

---

## 6. Récupérer la consultation d'un rendez-vous
**GET** `/rendezvous/:rendezvousId`

### Réponse (200)
```json
{
  "message": "Consultation récupérée avec succès",
  "data": {
    "idconsultation": "uuid",
    // ... données complètes de la consultation
  }
}
```

### Réponse (404)
```json
{
  "message": "Aucune consultation trouvée pour ce rendez-vous"
}
```

---

## 7. Modifier une consultation
**PATCH** `/:id`

### Headers
```
Authorization: Bearer <token> (MEDECIN propriétaire uniquement)
```

### Conditions de modification
- Consultation doit être en statut `BROUILLON`
- Le token doit appartenir au médecin propriétaire

### Body (JSON) - Champs modifiables
```json
{
  "diagnostique": "Nouveau diagnostic update",
  "antecedents": "Nouveaux antécédents",
  "traitement_propose": "Nouveau traitement",
  "prescriptions": "Nouvelles prescriptions",
  "observations": "Nouvelles observations",
  "recommandations": "Nouvelles recommandations",
  "examens_complementaires": "Nouveaux examens",
  "statut": "BROUILLON" // Peut change vers BROUILLON ou ARCHIVE
}
```

### Réponse (200)
```json
{
  "message": "Consultation mise à jour avec succès",
  "data": {
    "idconsultation": "uuid",
    "diagnostique": "Nouveau diagnostic update",
    "updated_at": "2025-01-15T11:00:00Z"
  }
}
```

### Réponse (403)
```json
{
  "message": "Consultation finalisée, modification impossible"
}
```

---

## 8. Finaliser une consultation
**PUT** `/:id/finalize`

### Headers
```
Authorization: Bearer <token> (MEDECIN propriétaire uniquement)
```

### Conditions de finalisation
- Consultation en statut `BROUILLON`
- Diagnostic doit être rempli (validation métier)
- Médecin propriétaire uniquement

### Réponse (200)
```json
{
  "message": "Consultation finalisée avec succès",
  "data": {
    "idconsultation": "uuid",
    "statut": "FINALISE",
    "finalise_le": "2025-01-15T11:15:00Z"
  }
}
```

### Réponse (400)
```json
{
  "message": "Le diagnostique est requis pour finaliser la consultation"
}
```

---

## 9. Archiver une consultation
**DELETE** `/:id`

### Headers
```
Authorization: Bearer <token> (MEDECIN propriétaire uniquement)
```

### Note
Archivage = soft delete (statut passe à `ARCHIVE`)
Les données restent en base mais marquées comme archivées.

### Réponse (200)
```json
{
  "message": "Consultation archivée avec succès"
}
```

---

## 10. Créer un template de consultation
**POST** `/templates`

### Headers
```
Authorization: Bearer <token> (ADMINCABINET ou SUPERADMIN uniquement)
```

### Body (JSON)
```json
{
  "nom": "Consultation generale adulte",
  "specialite": "GENERAL",
  "description": "Template pour consultation routine chez l adulte",
  "diagnostique_template": "Patient en bon etat general. Pas de signe d urgence.",
  "antecedents_template": "Antecedents medicaux a preciser.",
  "traitement_template": "Traitement symptomatique selon les symptomes presentes.",
  "prescriptions_template": "Prescriptions selon les besoins identifies.",
  "observations_template": "Patient ecoute et informe.",
  "recommandations_template": "Rendez-vous de suivi dans 3 mois si necessaire.",
  "examens_template": "Aucun examen complementaire necessaire pour l instant."
}
```

### Réponse (201)
```json
{
  "message": "Template créé avec succès",
  "data": {
    "idtemplate": "uuid",
    "nom": "Consultation generale adulte",
    "specialite": "GENERAL"
  }
}
```

---

## 11. Récupérer les templates par spécialité
**GET** `/templates/specialite/:specialite`

### Headers
```
Authorization: Bearer <token>
```

### Exemple
```
GET /api/consultations/templates/specialite/CARDIOLOGIE
```

### Réponse (200)
```json
{
  "message": "Templates récupérés avec succès",
  "data": [
    {
      "idtemplate": "uuid",
      "nom": "Consultation cardiologie",
      "specialite": "CARDIOLOGIE",
      "description": "Template pour consultation cardiologique",
      "diagnostique_template": "Rythme cardiaque regulier. Pas de douleur thoracique.",
      "traitement_template": "Regime alimentaire adapte et exercice physique regulier.",
      // ... autres champs template
    }
  ]
}
```

---

## 12. Récupérer tous les templates
**GET** `/templates`

### Headers
```
Authorization: Bearer <token>
```

### Réponse (200)
```json
{
  "message": "Tous les templates récupérés avec succès",
  "data": [
    // Tous les templates triés par spécialité puis nom
  ]
}
```

---

## 13. Supprimer un template
**DELETE** `/templates/:id`

### Headers
```
Authorization: Bearer <token> (ADMINCABINET ou SUPERADMIN uniquement)
```

### Réponse (200)
```json
{
  "message": "Template supprimé avec succès"
}
```

---

## Statuts des consultations
- **BROUILLON**: Consultation en cours d'édition (modifiable)
- **FINALISE**: Consultation terminée (non modifiable, visible par patients)
- **ARCHIVE**: Consultation archivée (soft delete, cachée des vues normales)

## Workflow médical recommandé
1. **Créer CR** depuis RDV ou template
2. **Rédiger contenu** (diagnostique, traitement, examens...)
3. **Créer ordonnance** si nécessaire
4. **Finaliser CR** (devient immuable et visible aux patients)
5. **Archiver** si nécessaire (suppression logique)

## Codes d'erreur
- **400**: Données manquantes ou invalides
- **401**: Token d'authentification manquant
- **403**: Permissions insuffisantes ou consultation finalisée
- **404**: Consultation/template non trouvé(e)
- **409**: Consultation déjà créée pour ce RDV
- **500**: Erreur serveur interne

---

## Spécialités disponibles dans les templates
- **GENERAL**: Médecine générale
- **CARDIOLOGIE**: Cardiologie
- **PEDIATRIE**: Pédiatrie
- **DERMATOLOGIE**: Dermatologie
- **Autres**: Peuvent être ajoutées selon besoins

Templates par défaut créés automatiquement lors de la migration ! 🏥📋
