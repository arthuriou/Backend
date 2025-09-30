# Liste complète des Endpoints (URLs complètes)

Base locale: `http://localhost:3000`

Notes:
- Tous les endpoints existent sous plusieurs alias (API v1, mobile, dashboard). Ci-dessous, la colonne URL principale liste le préfixe standard. Les alias valides sont indiqués à côté.
- Auth requis sauf mention "Public". Utiliser l'en-tête: `Authorization: Bearer <token>`.

## Authentification (`/api/auth`)
Alias: `/api/v1/auth`, `/api/v1/mobile/auth`, `/api/v1/dashboard/auth`

- POST  http://localhost:3000/api/auth/register-patient
- POST  http://localhost:3000/api/auth/register-doctor
  (Body: email, motdepasse, nom, numordre, [prenom], [telephone], [experience], [biographie], [specialiteIds:string[]])
- POST  http://localhost:3000/api/auth/login
- POST  http://localhost:3000/api/auth/refresh
- POST  http://localhost:3000/api/auth/send-otp
- POST  http://localhost:3000/api/auth/verify-otp
- POST  http://localhost:3000/api/auth/resend-otp
- PATCH http://localhost:3000/api/auth/profile/:userId
- PATCH http://localhost:3000/api/auth/profile
- PATCH http://localhost:3000/api/auth/profile/medecin
- PATCH http://localhost:3000/api/auth/profile/patient
- POST  http://localhost:3000/api/auth/profile/photo
- POST  http://localhost:3000/api/auth/change-password
- POST  http://localhost:3000/api/auth/forgot-password
- POST  http://localhost:3000/api/auth/reset-password
- GET   http://localhost:3000/api/auth/super-admin/pending-medecins
- POST  http://localhost:3000/api/auth/super-admin/validate-medecin
- GET   http://localhost:3000/api/auth/profile
- GET   http://localhost:3000/api/auth/user/:id
- GET   http://localhost:3000/api/auth/patients (SUPERADMIN, ADMINCABINET, MEDECIN)
- GET   http://localhost:3000/api/auth/medecins (SUPERADMIN, ADMINCABINET)
- GET   http://localhost:3000/api/auth/medecins/search (Public/PATIENT)
- GET   http://localhost:3000/api/auth/admins
- GET   http://localhost:3000/api/auth/users/role/:role
- GET   http://localhost:3000/api/auth/super-admin/profile
- PATCH http://localhost:3000/api/auth/super-admin/profile
- POST  http://localhost:3000/api/auth/super-admin/change-password
- POST  http://localhost:3000/api/auth/super-admin/create-admin
- POST  http://localhost:3000/api/auth/super-admin/cabinets
- GET   http://localhost:3000/api/auth/super-admin/cabinets
- GET   http://localhost:3000/api/auth/super-admin/cabinets/:id
- PUT   http://localhost:3000/api/auth/super-admin/cabinets/:id
- DELETE http://localhost:3000/api/auth/super-admin/cabinets/:id
- POST  http://localhost:3000/api/auth/super-admin/assign-cabinet
- DELETE http://localhost:3000/api/auth/super-admin/assign-cabinet/:adminId
- GET   http://localhost:3000/api/auth/super-admin/admin-cabinets/:adminId
- GET   http://localhost:3000/api/auth/super-admin/cabinets/:cabinetId/admins

## Cabinets (`/api/cabinets`)
Alias: `/api/v1/cabinets`, `/api/v1/mobile/cabinets`, `/api/v1/dashboard/cabinets`

- GET   http://localhost:3000/api/cabinets/
- GET   http://localhost:3000/api/cabinets/:id
- POST  http://localhost:3000/api/cabinets/                      (SUPERADMIN)
- POST  http://localhost:3000/api/cabinets/:id/admin            (SUPERADMIN)
- GET   http://localhost:3000/api/cabinets/:id/admins           (SUPERADMIN)
- PUT   http://localhost:3000/api/cabinets/:id                  (SUPERADMIN, ADMINCABINET)
- PUT   http://localhost:3000/api/cabinets/:id/archive          (SUPERADMIN)
- GET   http://localhost:3000/api/cabinets/:id/specialites
- POST  http://localhost:3000/api/cabinets/:id/specialites      (SUPERADMIN, ADMINCABINET)
- DELETE http://localhost:3000/api/cabinets/:id/specialites/:specialiteId (SUPERADMIN, ADMINCABINET)
- GET   http://localhost:3000/api/cabinets/:id/medecins
- PUT   http://localhost:3000/api/cabinets/:id/medecins/:medecinId/archive (SUPERADMIN, ADMINCABINET)
- POST  http://localhost:3000/api/cabinets/:id/medecins/:medecinId/reset-password (ADMINCABINET)
- GET   http://localhost:3000/api/cabinets/:id/stats            (SUPERADMIN, ADMINCABINET)

## Agenda (`/api/agenda`)
Alias: `/api/v1/agenda`, `/api/v1/mobile/agenda`, `/api/v1/dashboard/agenda`

**📋 Note: Les agendas sont créés automatiquement lors de l'approbation des médecins. Création manuelle supprimée.**

- GET   http://localhost:3000/api/agenda/mine                      (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/agenda/:id                      (MEDECIN, ADMINCABINET)
- PATCH http://localhost:3000/api/agenda/:id                      (MEDECIN, ADMINCABINET)
- DELETE http://localhost:3000/api/agenda/:id                     (MEDECIN, ADMINCABINET)
- POST  http://localhost:3000/api/agenda/:id/rules                (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/agenda/:id/rules                (MEDECIN, ADMINCABINET)
- PATCH http://localhost:3000/api/agenda/:id/rules/:ruleId        (MEDECIN, ADMINCABINET)
- DELETE http://localhost:3000/api/agenda/:id/rules/:ruleId       (MEDECIN, ADMINCABINET)
- POST  http://localhost:3000/api/agenda/:id/blocks                (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/agenda/:id/blocks                (MEDECIN, ADMINCABINET)
- DELETE http://localhost:3000/api/agenda/:id/blocks/:blockId      (MEDECIN, ADMINCABINET)
- POST  http://localhost:3000/api/agenda/:id/extra                 (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/agenda/:id/extra                 (MEDECIN, ADMINCABINET)
- DELETE http://localhost:3000/api/agenda/:id/extra/:extraId       (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/agenda/:id/slots                 (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/agenda/:id/slots/public          (Public - agenda.visible_en_ligne requis)

## Rendez-vous (`/api/rendezvous`)
Alias: `/api/v1/rendezvous`, `/api/v1/mobile/rendezvous`, `/api/v1/dashboard/rendezvous`

- POST  http://localhost:3000/api/rendezvous/                   (PATIENT)
- GET   http://localhost:3000/api/rendezvous/:id                (PATIENT, MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/rendezvous/patient/:patientId (PATIENT, MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/rendezvous/medecin/:medecinId (MEDECIN, ADMINCABINET)
- PUT   http://localhost:3000/api/rendezvous/:id                (PATIENT, MEDECIN, ADMINCABINET)
- PUT   http://localhost:3000/api/rendezvous/:id/confirmer      (MEDECIN, ADMINCABINET)
- PUT   http://localhost:3000/api/rendezvous/:id/annuler        (PATIENT, MEDECIN, ADMINCABINET)
- PUT   http://localhost:3000/api/rendezvous/:id/terminer       (MEDECIN, ADMINCABINET)
- POST  http://localhost:3000/api/rendezvous/rappels/traiter    (SUPERADMIN, ADMINCABINET)
- POST  http://localhost:3000/api/rendezvous/rappels            (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/rendezvous/en-attente-consultation (MÉDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/rendezvous/en-cours           (MÉDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/rendezvous/aujourd-hui        (MÉDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/rendezvous/cette-semaine      (MÉDECIN, ADMINCABINET)
- PUT   http://localhost:3000/api/rendezvous/:id/patient-arrive (MEDECIN, ADMINCABINET)
- PUT   http://localhost:3000/api/rendezvous/:id/commencer-consultation (MEDECIN)
- PUT   http://localhost:3000/api/rendezvous/:id/cloturer-consultation (MEDECIN)

## Messagerie (`/api/messagerie`)
Alias: `/api/v1/messagerie`, `/api/v1/mobile/messagerie`, `/api/v1/dashboard/messagerie`

- POST  http://localhost:3000/api/messagerie/conversations/private
- GET   http://localhost:3000/api/messagerie/conversations
- GET   http://localhost:3000/api/messagerie/conversations/:id
- POST  http://localhost:3000/api/messagerie/conversations/:id/participants (ADMINCABINET, SUPERADMIN)
- DELETE http://localhost:3000/api/messagerie/conversations/:id/participants/:participantId
- POST  http://localhost:3000/api/messagerie/conversations/:id/read
- POST  http://localhost:3000/api/messagerie/messages
- GET   http://localhost:3000/api/messagerie/conversations/:id/messages
- PUT   http://localhost:3000/api/messagerie/messages/:id
- DELETE http://localhost:3000/api/messagerie/messages/:id
- POST  http://localhost:3000/api/messagerie/messages/:id/read

Notes:
- Événements Socket.IO: `new_message`, `conversation_read`
- Types de messages supportés: `TEXTE`, `IMAGE`, `FICHIER`, `SYSTEME`, `VOICE`

## Spécialités & Maux (`/api/specialites`)
Alias: `/api/v1/specialites`, `/api/v1/mobile/specialites`, `/api/v1/dashboard/specialites`

- POST  http://localhost:3000/api/specialites/specialites
- GET   http://localhost:3000/api/specialites/specialites
- GET   http://localhost:3000/api/specialites/specialites/:id
- GET   http://localhost:3000/api/specialites/specialites/:id/details
- PUT   http://localhost:3000/api/specialites/specialites/:id
- DELETE http://localhost:3000/api/specialites/specialites/:id
- GET   http://localhost:3000/api/specialites/specialites/search
- POST  http://localhost:3000/api/specialites/maux
- GET   http://localhost:3000/api/specialites/maux
- GET   http://localhost:3000/api/specialites/maux/:id
- GET   http://localhost:3000/api/specialites/maux/:id/details
- PUT   http://localhost:3000/api/specialites/maux/:id
- DELETE http://localhost:3000/api/specialites/maux/:id
- GET   http://localhost:3000/api/specialites/maux/search
- POST  http://localhost:3000/api/specialites/associations/medecin-specialite
- DELETE http://localhost:3000/api/specialites/associations/medecin-specialite/:medecinId/:specialiteId
- POST  http://localhost:3000/api/specialites/associations/cabinet-specialite
- DELETE http://localhost:3000/api/specialites/associations/cabinet-specialite/:cabinetId/:specialiteId
- POST  http://localhost:3000/api/specialites/associations/specialite-maux
- DELETE http://localhost:3000/api/specialites/associations/specialite-maux/:specialiteId/:mauxId
- GET   http://localhost:3000/api/specialites/specialites/:id/medecins (PATIENT OK, médecins APPROVED)
- GET   http://localhost:3000/api/specialites/specialites/:id/cabinets
- GET   http://localhost:3000/api/specialites/maux/:id/medecins (PATIENT OK, médecins APPROVED)
- GET   http://localhost:3000/api/specialites/medecins/search (RECHERCHE GLOBALE OPTIMISÉE)
- GET   http://localhost:3000/api/specialites/statistics

## Notifications - Préférences & Devices
Préférences base: `/api/notifications/preferences` (alias `/api/v1/notifications/preferences`, `/api/v1/mobile/notifications/preferences`, `/api/v1/dashboard/notifications/preferences`)
Devices base: `/api/notifications` (alias `/api/v1/notifications`, `/api/v1/mobile/notifications`, `/api/v1/dashboard/notifications`)

- GET   http://localhost:3000/api/notifications/preferences/
- POST  http://localhost:3000/api/notifications/preferences/
- PUT   http://localhost:3000/api/notifications/preferences/
- POST  http://localhost:3000/api/notifications/preferences/reset
- DELETE http://localhost:3000/api/notifications/preferences/
- POST  http://localhost:3000/api/notifications/devices
- GET   http://localhost:3000/api/notifications/devices
- DELETE http://localhost:3000/api/notifications/devices/:token

## Dossier Médical (`/api/dossier-medical`)
Alias: `/api/v1/dossier-medical`, `/api/v1/mobile/dossier-medical`, `/api/v1/dashboard/dossier-medical`

- GET   http://localhost:3000/api/dossier-medical/dossier/me
- GET   http://localhost:3000/api/dossier-medical/:dossierId/documents
- POST  http://localhost:3000/api/dossier-medical/documents
- GET   http://localhost:3000/api/dossier-medical/documents/:id/view (PATIENT propriétaire seulement)
- DELETE http://localhost:3000/api/dossier-medical/documents/:id
- PATCH http://localhost:3000/api/dossier-medical/documents/:id

## Ordonnances (`/api/ordonnances`)
Alias: `/api/v1/ordonnances`, `/api/v1/mobile/ordonnances`, `/api/v1/dashboard/ordonnances`

- POST  http://localhost:3000/api/ordonnances/
- GET   http://localhost:3000/api/ordonnances/consultation/:consultationId
- GET   http://localhost:3000/api/ordonnances/:id
- PATCH http://localhost:3000/api/ordonnances/:id
- DELETE http://localhost:3000/api/ordonnances/:id
- GET   http://localhost:3000/api/ordonnances/patient/:patientId
- GET   http://localhost:3000/api/ordonnances/medecin/:medecinId
- PUT   http://localhost:3000/api/ordonnances/:id/valider

## Consultations (`/api/consultations`)
Alias: `/api/v1/consultations`, `/api/v1/mobile/consultations`, `/api/v1/dashboard/consultations`

- POST  http://localhost:3000/api/consultations/                          (MEDECIN)
- POST  http://localhost:3000/api/consultations/from-template            (MEDECIN)
- GET   http://localhost:3000/api/consultations/:id                      (MEDECIN, PATIENT*)
- GET   http://localhost:3000/api/consultations/medecin/:medecinId       (MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/consultations/patient/:patientId       (PATIENT, MEDECIN, ADMINCABINET)
- GET   http://localhost:3000/api/consultations/rendezvous/:rendezvousId (MEDECIN, PATIENT, ADMINCABINET)
- PATCH http://localhost:3000/api/consultations/:id                      (MEDECIN propriétaire uniquement)
- PUT   http://localhost:3000/api/consultations/:id/finalize             (MEDECIN propriétaire uniquement)
- DELETE http://localhost:3000/api/consultations/:id                     (MEDECIN propriétaire uniquement)
- POST  http://localhost:3000/api/consultations/templates                (ADMINCABINET, SUPERADMIN)
- GET   http://localhost:3000/api/consultations/templates/specialite/:specialite
- GET   http://localhost:3000/api/consultations/templates                (TOUS sauf PATIENT)
- DELETE http://localhost:3000/api/consultations/templates/:id           (ADMINCABINET, SUPERADMIN)

*PATIENT : seulement consultations finalisées

---

Pour toute divergence entre cette liste et les fichiers spécifiques, considérez cette liste comme source de vérité et ouvrez une demande de mise à jour du fichier concerné.
