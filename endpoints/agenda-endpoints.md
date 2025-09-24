## Agenda - Endpoints (Médecin)

Base URL: `/api/agenda`

Rôles requis: sauf mention contraire, `MEDECIN` (le médecin agit sur ses propres agendas). `ADMINCABINET` peut gérer les agendas du cabinet.

**📋 Note importante**: Les agendas sont créés automatiquement lors de l'approbation d'un médecin. La création manuelle par endpoint a été supprimée selon les spécifications métier.

---

### 1) Agendas

#### GET `/api/agenda/mine`
Liste des agendas du médecin connecté.

Réponse 200:
```json
[
  { "idagenda": "uuid", "nom": "Agenda Docteur", "visible_en_ligne": true, "timezone": "Africa/Abidjan" }
]
```

#### GET `/api/agenda/:id`
Récupérer un agenda par id.

#### PATCH `/api/agenda/:id`
Mettre à jour un agenda.

Body (exemple):
```json
{ "visible_en_ligne": false, "confirmation_mode": "AUTO" }
```

#### DELETE `/api/agenda/:id`
Suppression logique recommandée.

---

### 2) Règles récurrentes (AvailabilityRule)

#### POST `/api/agenda/:id/rules`
Créer une règle.

Body:
```json
{
  "weekday": 1,
  "start_time": "09:00",
  "end_time": "12:30",
  "duration_min": 30,
  "allowed_types": "TOUS",
  "start_date": null,
  "end_date": null
}
```

#### GET `/api/agenda/:id/rules`
Lister les règles.

#### PATCH `/api/agenda/:id/rules/:ruleId`
Mettre à jour une règle.

#### DELETE `/api/agenda/:id/rules/:ruleId`
Supprimer une règle.

---

### 3) Indisponibilités (Blocks)

#### POST `/api/agenda/:id/blocks`
Créer une indisponibilité (bloquer une plage).

Body:
```json
{ "start_at": "2025-09-23T14:00:00Z", "end_at": "2025-09-23T16:00:00Z", "reason": "Réunion" }
```

Effets: supprime visibilité/booking de l’intervalle; si des RDV sont impactés, notifier et proposer un report.

#### GET `/api/agenda/:id/blocks?start=ISO&end=ISO`
Lister les bloquages dans l’intervalle.

#### DELETE `/api/agenda/:id/blocks/:blockId`
Supprimer un bloquage (si pas de RDV impacté, sinon demander confirmation côté UI).

---

### 4) Disponibilités ponctuelles (ExtraAvailability)

#### POST `/api/agenda/:id/extra`
Ajouter une disponibilité ponctuelle.

Body:
```json
{
  "start_at": "2025-09-24T17:00:00Z",
  "end_at": "2025-09-24T19:00:00Z",
  "type": "PRESENTIEL",
  "visible_en_ligne": true
}
```

#### GET `/api/agenda/:id/extra?start=ISO&end=ISO`
Lister les disponibilités ponctuelles.

#### DELETE `/api/agenda/:id/extra/:extraId`
Supprimer une disponibilité ponctuelle.

---

### 5) Créneaux calculés (Slots)

#### GET `/api/agenda/:id/slots?start=ISO&end=ISO&type=PRESENTIEL|TELECONSULTATION`
Renvoie les créneaux disponibles calculés à partir des règles récurrentes + extras − blocks − RDV existants, en respectant les buffers.

Voici l'algorithme de calcul :
1. Génère les slots depuis les règles de plages horaires par jour
2. Inclut les disponibilités exceptionnelles (extras)
3. Filtre avec les blocks/indisponibilités
4. Filtre avec les RDV existants (évite doublons et conflits)
5. Respecte les buffers configurés

Réponse 200 (exemple):
```json
[
  { "start_at": "2025-09-25T09:00:00Z", "end_at": "2025-09-25T09:30:00Z", "type": "PRESENTIEL", "visible_en_ligne": true },
  { "start_at": "2025-09-25T09:30:00Z", "end_at": "2025-09-25T10:00:00Z", "type": "PRESENTIEL", "visible_en_ligne": true }
]
```

#### GET `/api/agenda/:id/slots/public?start=ISO&end=ISO&type=PRESENTIEL|TELECONSULTATION`
**🔓 Endpoint public (pas d'authentification requise)**

Version publique des slots pour que les patients peuvent voir les créneaux disponibles.
- Sécurisé : vérifie que `agenda.visible_en_ligne = true`
- Fonctionnement identique aux slots authentifiés
- Utilisé par l'application patient pour découvrir les créneaux et réserver

---

### Notes d’implémentation
- Buffers: appliquer `buffer_before_min` et `buffer_after_min` autour des RDV existants lors du calcul de disponibilité.
- Performance: index sur `agenda_id`, `weekday`, et sur les plages temporelles (`start_at`, `end_at`).
- Sécurité: un médecin ne peut agir que sur ses agendas; `ADMINCABINET` peut gérer ceux du cabinet.
- Téléconsultation: pour chaque RDV de type `TELECONSULTATION`, le flux existant de génération de salle/lien Jitsi s’applique.
