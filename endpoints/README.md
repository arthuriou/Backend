# 📋 Endpoints SantéAfrik - Résumé

## Base et versioning
- Legacy: `/api/...`
- Versionné: `/api/v1/...`
- Alias (mêmes handlers): `/api/v1/mobile/...` et `/api/v1/dashboard/...`

## ✅ Endpoints (voir fichiers dédiés)
- Auth: `auth-endpoints.md` (login, OTP, profils, reset/refresh, upload photo)
- Cabinets: `cabinet-endpoints.md`
- Rendez-vous: `rendezvous-endpoints.md`
- Messagerie: `messagerie-endpoints.md` (texte + fichiers)
- Spécialités/Maux: `specialites-endpoints.md`
- Dossier Médical: `dossier-medical-endpoints.md`
- Notifications/Push: `notification-preferences-endpoints.md` (preferences + devices)

## Uploads
- Public: `GET /uploads/...`
- Photo profil: `POST /api/auth/profile/photo` (form-data `file`)
- Documents dossier: `POST /api/dossier-medical/documents` (form-data `file`)
- Messages fichier: `POST /api/messagerie/messages` (form-data `file` + `conversation_id`)

Types par défaut: images (jpeg/png/webp/gif), pdf, txt, doc/docx. Taille max 10MB.

## Notifications
- Préférences: `/api/notifications/preferences` (GET/PUT/POST reset/DELETE)
- Devices push: `POST/GET/DELETE /api/notifications/devices`
- Push: Expo intégré côté backend. Socket.IO pour temps réel in‑app.

## Erreurs (conseillé)
- `{ error, message, details? }` avec codes 400/401/403/404/409/422/500.

## 📁 Structure des Fichiers
```
src/features/
├── auth/
├── cabinets/
├── rendezvous/
├── messagerie/
├── notifications/
├── specialites/
└── dossier-medical/

src/shared/
├── utils/
└── services/

endpoints/
├── auth-endpoints.md
├── cabinet-endpoints.md
├── rendezvous-endpoints.md
├── messagerie-endpoints.md
├── specialites-endpoints.md
├── dossier-medical-endpoints.md
├── notification-preferences-endpoints.md
└── README.md
```
